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
  sports: `Identify 5 real youth or amateur sports ORGANIZATIONS or tournament SERIES that travel to host cities and need hotel room blocks — things like USSSA Texas baseball tournaments, Perfect Game showcases, AAU basketball circuits, USA Volleyball qualifiers, NTSSL soccer tournaments. These are groups actively looking for a host destination in North Texas / DFW. Do NOT list hotels, venues, or businesses already in McKinney.`,
  corporate: `Identify 5 real EXTERNAL companies or industry associations that hold annual conferences, sales kickoffs, or leadership summits and need a host hotel in the DFW area — e.g. a company headquartered elsewhere bringing 200 employees to DFW, or a Texas statewide trade association rotating its annual meeting across Texas cities. Do NOT list companies already headquartered in McKinney or venues/hotels.`,
  construction: `Identify 5 real large construction or infrastructure projects that are COMING TO Collin County / North Texas and will need extended-stay hotel housing for out-of-town workers — e.g. a semiconductor fab, data center campus, highway project, or corporate headquarters under construction. The workers need somewhere to stay for months. Do NOT list McKinney businesses or existing hotels.`,
  weddings: `Identify 5 real wedding VENUES or wedding PLANNERS/COORDINATORS based in McKinney, Allen, Frisco, or nearby North Texas that regularly host weddings and need hotel room blocks for out-of-town guests. The lead is the venue or planning company — a real business you can contact — not a specific couple or family. Examples: Gather McKinney, The Venue at Willow Creek, The Springs venues, local full-service wedding planners. These businesses send hotel referrals repeatedly and are worth a standing relationship.`,
  reunions: `Identify 5 real organizations — Texas high school graduating classes, military units, family associations, or university alumni chapters — that hold annual or multi-year reunions and travel to a host city, needing hotel room blocks. These groups are looking for a destination, not already based in McKinney. Reference real Texas schools, bases, or universities.`,
  boutique: `Identify 5 real Texas statewide professional associations or nonprofits that rotate their annual conference across Texas cities and are a fit for McKinney — e.g. Texas Medical Association, Texas Bar Association, Texas Association of School Administrators, Texas Society of CPAs, Texas Restaurant Association, Texas Realtors. These organizations are actively seeking a host hotel/city. Do NOT list organizations already based in McKinney.`,
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
- Every lead must be an EXTERNAL organization seeking a host hotel/destination — groups that need to come TO McKinney, not businesses or hotels already there
- Never include hotels, venues, or any business already located in McKinney as a lead
- Only include organizations and events you know are real
- estimatedRooms and estimatedAttendees: realistic estimates based on event type/size
- dates: real scheduled dates if known, or realistic season (e.g. "Spring 2026")
- rfpDue: only if you know a real deadline; otherwise null
- location: where the organization is based or where it typically operates, NOT McKinney
- fitScore: 0-100 rating of how well McKinney's hotel inventory fits their needs
- fitReason: 2-3 sentences on why McKinney is a good fit for this group
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
