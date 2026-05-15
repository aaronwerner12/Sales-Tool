const SEGMENT_QUERIES = {
  sports: [
    "Texas youth baseball tournament 2026 DFW registration teams",
    "Texas youth volleyball basketball soccer tournament 2026 Collin County Allen Frisco McKinney",
    "USSSA Perfect Game Texas tournament 2026 North Texas",
  ],
  corporate: [
    "Texas statewide association annual conference 2026 Dallas Fort Worth",
    "North Texas corporate summit meeting conference 2026 Plano Allen McKinney",
    "Texas industry conference annual meeting 2026 DFW hotel",
  ],
  construction: [
    "Collin County McKinney Texas commercial construction project 2026 permit approved",
    "North Texas data center warehouse manufacturing facility 2026 construction groundbreaking",
    "McKinney Allen Frisco Texas corporate campus expansion 2026",
  ],
  weddings: [
    "McKinney Texas wedding venue 2026 reception",
    "North Texas DFW wedding 2026 venue booking",
    "site:theknot.com McKinney Texas wedding 2026",
  ],
  reunions: [
    "Texas family reunion 2026 gathering registration",
    "Texas high school class reunion 2026 DFW",
    "Texas military alumni reunion 2026 annual gathering",
  ],
  boutique: [
    "Texas nonprofit association annual conference 2026 DFW meeting",
    "Texas medical dental legal education professional conference 2026",
    "Texas chamber of commerce trade association conference 2026 annual",
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
          max_results: 6,
          search_depth: 'basic',
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

The search results below contain real events, tournaments, conferences, construction projects, weddings, or reunions happening in Texas or the DFW area. Your job is to identify each distinct event or organization and evaluate it as a potential group hotel lead for McKinney's hotel inventory.

RULES:
- Treat every named event or organization in the results as a potential lead worth evaluating
- Use the exact name of the event or organization from the results
- estimatedRooms: if room count is stated use it; otherwise estimate based on attendee count (roughly 1 room per 2 attendees) and note it is estimated; use null only if no attendee info at all
- estimatedAttendees: use what is stated; if a range is given use midpoint; null if unknown
- dates: use what is in the results; null if not found
- rfpDue: use YYYY-MM-DD only if an explicit deadline appears in the results; otherwise null
- location: city/state from the results
- sourceUrl: the actual URL from the result where this event was found
- contact: only populate fields that explicitly appear in the results for this org — no guessing
- fitScore: rate 0-100 how well McKinney's hotel inventory fits based on size, type, and proximity
- fitReason: 2-3 sentences on why McKinney fits
- concerns: 1 sentence on watch-outs (distance, capacity, competition) or null
- Return 3-6 leads; if results are thin, fewer is fine
- NEVER invent organizations, dates, contacts, or URLs not present in the results

SEARCH RESULTS:
${resultsText}

Return ONLY a valid JSON array (no markdown, no explanation):
[
  {
    "organization": "exact org or event name from results",
    "segment": "${segmentId}",
    "eventType": "tournament / annual conference / wedding / family reunion / construction project / etc",
    "estimatedRooms": "number as string or null",
    "estimatedAttendees": "number as string or null",
    "dates": "dates or season from results or null",
    "rfpDue": "YYYY-MM-DD or null",
    "location": "city, state or null",
    "fitScore": 0-100,
    "fitReason": "2-3 sentences",
    "concerns": "1 sentence or null",
    "summary": "1-2 sentences on the opportunity",
    "sourceUrl": "actual URL from results",
    "contact": {
      "name": "full name or null",
      "title": "job title or null",
      "email": "email or null",
      "phone": "phone or null",
      "website": "website or null"
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
