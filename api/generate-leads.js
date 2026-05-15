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

const SEGMENT_PROMPTS = {
  sports: `Find 5-7 real youth or amateur sports tournaments happening in Texas or the DFW metro area in 2025-2026 that would require hotel room blocks. Focus on baseball, softball, volleyball, basketball, soccer, and lacrosse tournaments. Include real sanctioning bodies and tournament series (USSSA, Perfect Game, AAU, USA Volleyball, NTSSL, etc.) and real venues in Collin County or nearby (Toyota Stadium Frisco, Curtis Culwell Center, Dr Pepper Ballpark area, Ford Center Frisco, etc.).`,
  corporate: `Find 5-7 real corporate conferences, annual meetings, or sales kickoffs planned for Texas / DFW in 2025-2026 that would need hotel room blocks. Include real companies with major Texas or DFW presences (Toyota, Goldman Sachs, Liberty Mutual, Fannie Mae, Raytheon, etc.) or real industry associations holding annual conferences in DFW.`,
  construction: `Find 5-7 real large construction or development projects underway or breaking ground in Collin County / North Texas in 2025-2026 that would need extended-stay hotel housing for workers. Include real projects like data centers, manufacturing plants, corporate campuses, or major infrastructure work. Reference real companies or projects you know about in McKinney, Allen, Frisco, or Prosper.`,
  weddings: `Find 5-7 real wedding venues in McKinney, Allen, Frisco, or nearby North Texas that host weddings requiring hotel room blocks for out-of-town guests in 2025-2026. Include real venue names you know exist in the area (Gather, The Springs, The Knot vendors, etc.) and describe real room block opportunities tied to them.`,
  reunions: `Find 5-7 real high school class reunions, family reunions, or military/alumni reunions planned in Texas or the DFW metro in 2025-2026 that would need hotel room blocks. Reference real Texas high schools with large alumni bases, real military units with Texas ties, or real universities with DFW alumni chapters.`,
  boutique: `Find 5-7 real Texas statewide associations, nonprofits, or professional organizations holding their annual conference in DFW in 2025-2026. Include real organizations you know about: Texas Medical Association, Texas Bar Association, Texas Association of School Administrators, Texas Society of CPAs, Texas Restaurant Association, Texas Realtors, etc.`,
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!anthropicKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY not set' });

  const { segmentId } = req.body;
  if (!segmentId) return res.status(400).json({ error: 'segmentId required' });

  const segPrompt = SEGMENT_PROMPTS[segmentId] || SEGMENT_PROMPTS.boutique;

  const prompt = `You are a group hotel sales analyst for Visit McKinney CVB in McKinney, Texas.

${HOTEL_CONTEXT}

Your task: ${segPrompt}

RULES — read carefully:
- Only include organizations, events, venues, or projects that you know are real and actually exist
- Use real organization names, real venue names, real company names
- sourceUrl: ONLY include a URL if you are 100% certain it is the correct official website — you have visited it in training and know exactly what domain it uses. If there is any doubt at all, use null. Wrong URLs are worse than no URL.
- estimatedRooms and estimatedAttendees: use realistic estimates based on the type/size of event; these are estimates, not invented facts
- dates: use real scheduled dates if you know them, or a realistic season/timeframe (e.g. "Spring 2026")
- rfpDue: only if you know a real deadline; otherwise null
- contact: LEAVE ALL FIELDS NULL — do not invent names, emails, or phone numbers
- fitScore: 0-100 rating of how well McKinney's hotel inventory fits this opportunity
- fitReason: 2-3 sentences specific to this lead explaining McKinney hotel fit
- concerns: honest 1-sentence concern (distance, capacity, competition from Frisco/Plano) or null
- Return exactly 5-7 leads

Return ONLY a valid JSON array (no markdown, no explanation):
[
  {
    "organization": "real org or event name",
    "segment": "${segmentId}",
    "eventType": "specific event type",
    "estimatedRooms": "realistic estimate as string",
    "estimatedAttendees": "realistic estimate as string",
    "dates": "known dates or realistic season",
    "rfpDue": "YYYY-MM-DD or null",
    "location": "city, TX",
    "fitScore": 0-100,
    "fitReason": "2-3 sentences specific to this lead",
    "concerns": "1 sentence or null",
    "summary": "1-2 sentences on the opportunity",
    "sourceUrl": "real official website URL or null",
    "contact": {
      "name": null,
      "title": null,
      "email": null,
      "phone": null,
      "website": "ONLY if you are 100% certain of the correct domain — otherwise null"
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
