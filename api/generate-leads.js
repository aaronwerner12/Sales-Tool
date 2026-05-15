const SEGMENT_QUERIES = {
  sports: [
    "Texas youth baseball tournament 2026 DFW teams registration",
    "Texas youth volleyball basketball soccer tournament 2026 North Texas",
    "USSSA Perfect Game Texas baseball tournament 2026",
  ],
  corporate: [
    "Texas statewide association annual conference 2026 Dallas Fort Worth",
    "North Texas corporate conference summit 2026 annual meeting",
    "Texas industry conference annual meeting 2026 DFW",
  ],
  construction: [
    "Collin County McKinney Texas commercial construction project 2026",
    "North Texas data center warehouse manufacturing facility 2026 groundbreaking",
    "McKinney Allen Frisco Texas corporate campus expansion 2026",
  ],
  weddings: [
    "McKinney Texas wedding venue 2026 reception booking",
    "North Texas DFW wedding 2026 venue",
    "site:theknot.com McKinney Texas wedding 2026",
  ],
  reunions: [
    "Texas family reunion 2026 gathering registration hotel",
    "Texas high school class reunion 2026 DFW annual",
    "Texas military alumni reunion 2026 gathering",
  ],
  boutique: [
    "Texas nonprofit association annual conference 2026 DFW",
    "Texas medical dental legal professional conference 2026 annual",
    "Texas chamber commerce trade association conference 2026",
  ],
};

// Keywords that boost fitScore
const SCORE_KEYWORDS = {
  high: ["mckinney","collin county","allen","frisco","plano","north texas","dfw","dallas fort worth"],
  med:  ["texas","2026","tournament","conference","annual","hotel","room block","registration"],
  low:  ["2025","event","meeting","group"],
};

const SEG_EVENT_TYPES = {
  sports:       "Sports Tournament",
  corporate:    "Corporate Conference",
  construction: "Construction Project",
  weddings:     "Wedding",
  reunions:     "Reunion",
  boutique:     "Association Conference",
};

const FIT_REASONS = {
  sports:       "McKinney has 5 sports-friendly hotels totaling 430+ rooms including Hampton Inn and Home2 Suites, ideal for team blocks. Location 30 miles north of Dallas puts teams near major Texas sports hubs.",
  corporate:    "The Sheraton McKinney offers 11,451 sq ft of indoor meeting space with a ballroom seating 824 — sufficient for most corporate conferences. Multiple upscale options for attendee room blocks.",
  construction: "TownePlace, SpringHill, Home2, and WoodSpring Suites offer 420+ extended-stay rooms with kitchen suites and weekly rates, perfectly suited for long-term construction crews.",
  weddings:     "Grand Hotel McKinney (historic downtown boutique) and Sheraton McKinney anchor the wedding market, with 200+ rooms across nearby overflow hotels for out-of-town guests.",
  reunions:     "Sheraton McKinney ballroom seats 824 for large gatherings; Hampton Inn and Holiday Inn offer affordable room blocks. Suburban McKinney location is accessible from across Texas.",
  boutique:     "Sheraton McKinney's 11,451 sq ft of meeting space with 10 breakout rooms suits statewide association conferences. Grand Hotel and Denizen offer boutique overflow options.",
};

function scoreFromContent(title, content, segmentId) {
  const text = `${title} ${content}`.toLowerCase();
  let score = 50;
  for (const kw of SCORE_KEYWORDS.high) { if (text.includes(kw)) score += 12; }
  for (const kw of SCORE_KEYWORDS.med)  { if (text.includes(kw)) score += 5; }
  for (const kw of SCORE_KEYWORDS.low)  { if (text.includes(kw)) score += 2; }
  // Segment-specific boosts
  if (segmentId === "sports"       && /tournament|team|bracket|registration/.test(text)) score += 10;
  if (segmentId === "corporate"    && /conference|summit|meeting|annual/.test(text))     score += 10;
  if (segmentId === "construction" && /construction|project|development|groundbreaking/.test(text)) score += 10;
  if (segmentId === "weddings"     && /wedding|venue|reception|bridal/.test(text))       score += 10;
  if (segmentId === "reunions"     && /reunion|alumni|gathering|class of/.test(text))    score += 10;
  if (segmentId === "boutique"     && /association|nonprofit|conference|annual/.test(text)) score += 10;
  return Math.min(98, Math.max(35, score));
}

function extractNumbers(text) {
  const roomMatch = text.match(/(\d[\d,]*)\s*(room|rooms|hotel room)/i);
  const attendeeMatch = text.match(/(\d[\d,]*)\s*(attendee|attendees|participant|people|player|team|guest)/i);
  const teamMatch = text.match(/(\d[\d,]*)\s*team/i);
  return {
    rooms: roomMatch ? roomMatch[1].replace(/,/g, '') : null,
    attendees: attendeeMatch
      ? attendeeMatch[1].replace(/,/g, '')
      : teamMatch ? String(parseInt(teamMatch[1].replace(/,/g, '')) * 15) : null,
  };
}

function extractDates(text) {
  const m = text.match(/\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)[,\s]+\d{1,2}(?:[–\-]\d{1,2})?,?\s*202[5-9]/i);
  return m ? m[0].trim() : null;
}

function extractOrganization(title, url) {
  // Try to get org name from title — strip generic suffixes
  let name = title
    .replace(/\s*[-|:–]\s*.*/,'')   // strip after dash/colon
    .replace(/\s*(registration|hotel|book|reserve|2026|2025)\s*/gi, '')
    .trim();
  if (name.length < 4) {
    // Fall back to domain name
    try {
      const host = new URL(url).hostname.replace(/^www\./,'').split('.')[0];
      name = host.charAt(0).toUpperCase() + host.slice(1);
    } catch { name = title.slice(0, 60); }
  }
  return name.slice(0, 80);
}

function extractContact(content) {
  const emailMatch  = content.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/);
  const phoneMatch  = content.match(/(\(?\d{3}\)?[\s.\-]\d{3}[\s.\-]\d{4})/);
  const websiteMatch = content.match(/https?:\/\/[^\s"'<>]+\.[a-z]{2,}(?:\/[^\s"'<>]*)?/i);
  return {
    name:    null,
    title:   null,
    email:   emailMatch  ? emailMatch[0]  : null,
    phone:   phoneMatch  ? phoneMatch[0]  : null,
    website: websiteMatch ? websiteMatch[0] : null,
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const tavilyKey = process.env.TAVILY_API_KEY;
  if (!tavilyKey) return res.status(500).json({ error: 'TAVILY_API_KEY not set' });

  const { segmentId } = req.body;
  if (!segmentId) return res.status(400).json({ error: 'segmentId required' });

  const queries = SEGMENT_QUERIES[segmentId] || SEGMENT_QUERIES.boutique;

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

  const ts = Date.now();
  const leads = allResults
    .filter(r => r.title && r.url)
    .slice(0, 10)
    .map((r, i) => {
      const content = r.content || '';
      const nums    = extractNumbers(`${r.title} ${content}`);
      const contact = extractContact(content);
      const score   = scoreFromContent(r.title, content, segmentId);

      // Extract location
      const locMatch = content.match(/\b([A-Z][a-z]+(?: [A-Z][a-z]+)*),\s*(TX|Texas|Oklahoma|Louisiana|Arkansas|New Mexico)\b/);
      const location = locMatch ? locMatch[0] : 'Texas';

      return {
        id: `${segmentId}-${ts}-${i}`,
        organization: extractOrganization(r.title, r.url),
        segment: segmentId,
        eventType: SEG_EVENT_TYPES[segmentId] || 'Event',
        estimatedRooms: nums.rooms,
        estimatedAttendees: nums.attendees,
        dates: extractDates(`${r.title} ${content}`),
        rfpDue: null,
        location,
        fitScore: score,
        fitReason: FIT_REASONS[segmentId],
        concerns: null,
        summary: content.slice(0, 200).trim() || r.title,
        sourceUrl: r.url,
        rfpUrl: r.url,
        contact,
        sv: {
          meetingName: r.title.slice(0, 80),
          accountName: extractOrganization(r.title, r.url),
          roomAttendees: nums.rooms,
          showAttendees: nums.attendees,
          eeiType: 'Regional',
          repeatBusiness: false,
        },
        foundAt: new Date().toLocaleTimeString(),
      };
    });

  return res.json({ content: [{ type: 'text', text: JSON.stringify(leads) }] });
}
