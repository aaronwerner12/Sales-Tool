const SEGMENT_QUERIES = {
  sports: [
    "site:sportsengine.com OR site:perfectgame.org OR site:usssa.com Texas tournament 2026 hotel",
    "DFW North Texas youth baseball softball volleyball basketball tournament 2026 teams hotel block",
    "Texas AAU tournament 2026 McKinney Frisco Allen hotel",
  ],
  corporate: [
    "Dallas Fort Worth corporate conference annual meeting 2026 hotel room block RFP",
    "Texas association annual conference 2026 DFW hotel site:cvent.com OR site:meetingsnet.com",
    "North Texas business summit leadership conference 2026 hotel",
  ],
  construction: [
    "Collin County Texas commercial construction project 2026 workforce housing hotel",
    "McKinney Allen Frisco Texas data center warehouse development project 2026",
    "North Texas corporate relocation expansion 2026 extended stay hotel",
  ],
  weddings: [
    "site:theknot.com OR site:weddingwire.com McKinney Texas wedding 2026 hotel room block",
    "DFW North Texas wedding venue 2026 out of town guests hotel block rooms",
    "McKinney Texas wedding 2026 hotel accommodation room block",
  ],
  reunions: [
    "Texas family reunion 2026 hotel room block registration site:reunionfriendly.com OR site:eventbrite.com",
    "Texas high school college class reunion 2026 hotel block DFW",
    "Texas military reunion association 2026 hotel",
  ],
  boutique: [
    "Texas nonprofit association annual conference 2026 hotel RFP site:cvent.com",
    "Texas statewide association annual meeting 2026 DFW hotel",
    "North Texas medical legal education professional conference 2026 hotel",
  ],
};

const HOTEL_CONTEXT = `McKinney, TX (30 miles north of Dallas) hotel inventory:
- Sheraton McKinney Hotel: 187 rooms, 11,451 sq ft INDOOR meeting space, ballroom seats 824 theater / 610 banquet, 10 breakout rooms
- Grand Hotel McKinney: 45 rooms, historic downtown, 4,100 sq ft meeting space, boutique weddings
- Hampton Inn & Suites McKinney: 79 rooms (sports teams)
- Holiday Inn Hotel & Suites McKinney Fairview: 99 rooms, 2,614 sq ft meeting
- TownePlace Suites McKinney: 88 rooms, kitchen suites, extended stay
- SpringHill Suites McKinney/Allen: 125 rooms, extended stay
- Home2 Suites McKinney: 107 rooms, extended stay, pet friendly
- WoodSpring Suites McKinney: 120 rooms, economy extended stay
- La Quinta McKinney: 79 rooms, Fairfield Inn: 105 rooms, Best Western Plus: 68 rooms
- Comfort Suites McKinney-Allen: 63 rooms, Denizen Hotel McKinney: 102 rooms (new 2024 boutique)
Total: ~1,868 rooms across 22 properties`;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const tavilyKey = process.env.TAVILY_API_KEY;

  if (!anthropicKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY not set' });
  if (!tavilyKey) return res.status(500).json({ error: 'TAVILY_API_KEY not set' });

  const { segmentId } = req.body;
  if (!segmentId) return res.status(400).json({ error: 'segmentId required' });

  const queries = SEGMENT_QUERIES[segmentId] || SEGMENT_QUERIES.boutique;

  // Search Tavily for real results
  const searchResults = await Promise.all(
    queries.map(q =>
      fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: tavilyKey,
          query: q,
          max_results: 7,
          search_depth: 'advanced',
        }),
      }).then(r => r.json()).catch(() => ({ results: [] }))
    )
  );

  // Flatten and deduplicate
  const seen = new Set();
  const allResults = [];
  for (const sr of searchResults) {
    for (const item of (sr.results || [])) {
      if (!seen.has(item.url)) {
        seen.add(item.url);
        allResults.push(item);
      }
    }
  }

  if (allResults.length === 0) {
    return res.json({ content: [{ type: 'text', text: '[]' }] });
  }

  const resultsText = allResults
    .map((r, i) => `[${i + 1}] ${r.title}\nURL: ${r.url}\nContent: ${r.content || ''}`)
    .join('\n\n---\n\n');

  const prompt = `You are a group hotel sales analyst for Visit McKinney CVB in McKinney, Texas.

${HOTEL_CONTEXT}

Below are REAL web search results. Your job is to extract group hotel lead opportunities — events, tournaments, conferences, weddings, reunions, or construction projects that would need hotel rooms in the DFW / North Texas area.

RULES:
- Extract any real organization or event mentioned in the results that could plausibly need hotel rooms
- Use the exact organization/event name from the results
- For numeric fields (rooms, attendees), use what is stated; if a range is given use the midpoint; if not stated use null
- Use the actual URL from the search result as sourceUrl
- Do NOT invent contact info, dates, or room counts not in the results — use null for missing fields
- fitScore and fitReason are your analysis of how well McKinney's hotel inventory fits the opportunity
- For contact fields: only include name/email/phone/website if explicitly in the results for that org
- Aim for 3-6 leads per segment; if results are thin, fewer is fine — never fabricate

SEARCH RESULTS:
${resultsText}

Return ONLY a valid JSON array (no markdown, no explanation):
[
  {
    "organization": "exact org or event name from results",
    "segment": "${segmentId}",
    "eventType": "tournament / conference / wedding / reunion / construction crew / etc or null",
    "estimatedRooms": "number as string or null",
    "estimatedAttendees": "number as string or null",
    "dates": "dates or season from results or null",
    "rfpDue": "YYYY-MM-DD from results or null",
    "location": "city/state from results or null",
    "fitScore": 0-100,
    "fitReason": "2-3 sentences on why McKinney hotel inventory fits",
    "concerns": "1 sentence on potential concerns or null",
    "summary": "1-2 sentences summarizing the opportunity",
    "sourceUrl": "actual URL from search results",
    "contact": {
      "name": "full name from results or null",
      "title": "job title from results or null",
      "email": "email address from results or null",
      "phone": "phone number from results or null",
      "website": "org website from results or null"
    },
    "sv": {
      "meetingName": "event name",
      "accountName": "org name",
      "roomAttendees": "number or null",
      "showAttendees": "number or null",
      "eeiType": "National or Regional or Local",
      "repeatBusiness": false
    }
  }
]`;

  const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': anthropicKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  const data = await claudeRes.json();
  return res.status(claudeRes.status).json(data);
}
