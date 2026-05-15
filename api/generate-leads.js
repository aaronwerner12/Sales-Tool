const SEGMENT_QUERIES = {
  sports: [
    "Texas youth sports tournament 2026 hotel room block registration",
    "DFW youth baseball volleyball soccer basketball tournament 2026 hotel",
  ],
  corporate: [
    "Dallas Fort Worth corporate conference annual meeting hotel RFP 2026",
    "Texas company sales kickoff leadership retreat hotel 2026",
  ],
  construction: [
    "Collin County McKinney Texas construction development project 2026",
    "North Texas data center manufacturing facility construction 2026",
  ],
  weddings: [
    "McKinney Texas wedding 2026 hotel room block",
    "DFW North Texas wedding 2026 hotel room block out of town guests",
  ],
  reunions: [
    "Texas family reunion 2026 hotel room block registration",
    "Texas class reunion alumni gathering 2026 hotel block",
  ],
  boutique: [
    "Texas association annual conference meeting hotel 2026",
    "Texas professional organization conference RFP hotel 2026",
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
          max_results: 5,
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

Below are REAL web search results. Extract group hotel lead opportunities from them.

STRICT RULES:
- Only include organizations and events explicitly mentioned in the search results
- Only include data (dates, attendee counts, room counts, contact info) that is explicitly stated in the results — use null if not found
- Use the actual URL from the search result as sourceUrl
- Do not invent, guess, or add information not in the results
- If results contain few leads, return fewer items — accuracy over quantity
- fitReason and concerns are YOUR analysis of McKinney fit based on the hotel inventory above
- For contact fields: only populate if a real name/email/phone/website appears in the search results for that specific organization; otherwise use null

SEARCH RESULTS:
${resultsText}

Return ONLY a valid JSON array (no markdown, no explanation):
[
  {
    "organization": "exact org name from results",
    "segment": "${segmentId}",
    "eventType": "specific event type from results or null",
    "estimatedRooms": "room count from results or null",
    "estimatedAttendees": "attendee count from results or null",
    "dates": "dates from results or null",
    "rfpDue": "YYYY-MM-DD from results or null",
    "location": "location from results or null",
    "fitScore": 0-100,
    "fitReason": "2-3 sentences on McKinney hotel fit",
    "concerns": "1 sentence on watch-outs or null",
    "summary": "1-2 sentences summarizing the real opportunity",
    "sourceUrl": "actual URL from search results",
    "contact": {
      "name": "full name from results or null",
      "title": "job title from results or null",
      "email": "email address from results or null",
      "phone": "phone number from results or null",
      "website": "organization website from results or null"
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
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  const data = await claudeRes.json();
  return res.status(claudeRes.status).json(data);
}
