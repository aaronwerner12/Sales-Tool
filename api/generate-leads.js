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
  sports: `Find 5 real youth or amateur sports tournaments happening in Texas or the DFW metro area in 2025-2026 that would require hotel room blocks. Focus on baseball, softball, volleyball, basketball, soccer, and lacrosse tournaments. Include real sanctioning bodies and tournament series (USSSA, Perfect Game, AAU, USA Volleyball, NTSSL, etc.) and real venues in Collin County or nearby.`,
  corporate: `Find 5 real corporate conferences, annual meetings, or sales kickoffs planned for Texas / DFW in 2025-2026 that would need hotel room blocks. Include real companies with major Texas or DFW presences or real industry associations holding annual conferences in DFW.`,
  construction: `Find 5 real large construction or development projects underway or breaking ground in Collin County / North Texas in 2025-2026 that would need extended-stay hotel housing for workers. Include real projects like data centers, manufacturing plants, corporate campuses, or major infrastructure.`,
  weddings: `Find 5 real wedding venues in McKinney, Allen, Frisco, or nearby North Texas that host weddings requiring hotel room blocks for out-of-town guests in 2025-2026. Include real venue names that exist in the area.`,
  reunions: `Find 5 real high school class reunions, family reunions, or military/alumni reunions planned in Texas or DFW in 2025-2026 that would need hotel room blocks. Reference real Texas high schools, military units, or universities with DFW alumni chapters.`,
  boutique: `Find 5 real Texas statewide associations or professional organizations holding their annual conference in DFW in 2025-2026. Include real organizations like Texas Medical Association, Texas Bar Association, Texas Association of School Administrators, Texas Society of CPAs, Texas Restaurant Association, Texas Realtors, etc.`,
};

async function tavilySearch(apiKey, query) {
  try {
    const r = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: apiKey,
        query,
        max_results: 3,
        search_depth: 'basic',
      }),
    });
    const data = await r.json();
    return data.results || [];
  } catch {
    return [];
  }
}

function extractContact(results) {
  const text = results.map(r => `${r.title} ${r.content || ''}`).join(' ');
  const emailMatch = text.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = text.match(/(\(?\d{3}\)?[\s.\-]\d{3}[\s.\-]\d{4})/);
  // Extract a person name near "contact" or "director" or "coordinator"
  const nameMatch = text.match(/(?:contact|director|coordinator|manager|chair)[:\s]+([A-Z][a-z]+ [A-Z][a-z]+)/i);
  const titleMatch = text.match(/([A-Z][a-z]+(?: [A-Z][a-z]+)*),?\s+(Director|Coordinator|Manager|Chair|President|Executive Director|Tournament Director|Conference Director|Event Director)[^a-z]/);
  return {
    name:  nameMatch  ? nameMatch[1]  : titleMatch ? titleMatch[1] : null,
    title: titleMatch ? titleMatch[2] : null,
    email: emailMatch ? emailMatch[0] : null,
    phone: phoneMatch ? phoneMatch[0] : null,
    website: results[0]?.url || null,
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const tavilyKey    = process.env.TAVILY_API_KEY;

  if (!anthropicKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY not set' });

  const { segmentId } = req.body;
  if (!segmentId) return res.status(400).json({ error: 'segmentId required' });

  const segPrompt = SEGMENT_PROMPTS[segmentId] || SEGMENT_PROMPTS.boutique;

  // Step 1: Claude generates lead intelligence
  const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': anthropicKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: `You are a group hotel sales analyst for Visit McKinney CVB in McKinney, Texas.

${HOTEL_CONTEXT}

Your task: ${segPrompt}

RULES:
- Only include organizations and events you know are real
- estimatedRooms and estimatedAttendees: realistic estimates based on event type/size
- dates: real scheduled dates if known, or realistic season (e.g. "Spring 2026")
- rfpDue: only if you know a real deadline; otherwise null
- location: city, TX
- fitScore: 0-100 rating of McKinney hotel fit
- fitReason: 2-3 sentences specific to this lead
- concerns: 1 honest sentence or null
- Do NOT include any URLs or contact info — those will be looked up separately
- Return exactly 5 leads

Return ONLY a valid JSON array (no markdown):
[
  {
    "organization": "real org or event name",
    "segment": "${segmentId}",
    "eventType": "specific type",
    "estimatedRooms": "estimate as string",
    "estimatedAttendees": "estimate as string",
    "dates": "dates or season",
    "rfpDue": null,
    "location": "city, TX",
    "fitScore": 0-100,
    "fitReason": "2-3 sentences",
    "concerns": "1 sentence or null",
    "summary": "1-2 sentences on the opportunity",
    "sv": {
      "meetingName": "event name",
      "accountName": "org name",
      "roomAttendees": "number or null",
      "showAttendees": "number or null",
      "eeiType": "National or Regional or Local",
      "repeatBusiness": false
    }
  }
]`,
      }],
    }),
  });

  const claudeData = await claudeRes.json();
  if (!claudeRes.ok) return res.status(claudeRes.status).json(claudeData);

  const text = (claudeData.content || []).filter(b => b.type === 'text').map(b => b.text).join('');
  const cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
  const start = cleaned.indexOf('[');
  const end   = cleaned.lastIndexOf(']');
  if (start === -1 || end === -1) return res.json({ content: [{ type: 'text', text: '[]' }] });

  let leads;
  try { leads = JSON.parse(cleaned.slice(start, end + 1)); }
  catch { return res.json({ content: [{ type: 'text', text: '[]' }] }); }

  // Step 2: Tavily contact lookup for each lead (parallel, only if key present)
  if (tavilyKey) {
    const contactResults = await Promise.all(
      leads.map(lead => {
        const q = `${lead.organization} ${lead.eventType || ''} ${lead.location || 'Texas'} contact director email`;
        return tavilySearch(tavilyKey, q);
      })
    );

    leads = leads.map((lead, i) => {
      const results = contactResults[i];
      const contact = extractContact(results);
      const rfpUrl  = results[0]?.url || null;
      return { ...lead, contact, sourceUrl: rfpUrl, rfpUrl };
    });
  } else {
    leads = leads.map(lead => ({
      ...lead,
      contact: { name: null, title: null, email: null, phone: null, website: null },
      sourceUrl: null,
      rfpUrl: null,
    }));
  }

  return res.json({ content: [{ type: 'text', text: JSON.stringify(leads) }] });
}
