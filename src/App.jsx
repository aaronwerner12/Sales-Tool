import { useState, useEffect, useRef } from "react";

const LOGO_B64 = "iVBORw0KGgoAAAANSUhEUgAAAPAAAACBCAIAAABxSaChAAABCGlDQ1BJQ0MgUHJvZmlsZQAAeJxjYGA8wQAELAYMDLl5JUVB7k4KEZFRCuwPGBiBEAwSk4sLGHADoKpv1yBqL+viUYcLcKakFicD6Q9ArFIEtBxopAiQLZIOYWuA2EkQtg2IXV5SUAJkB4DYRSFBzkB2CpCtkY7ETkJiJxcUgdT3ANk2uTmlyQh3M/Ck5oUGA2kOIJZhKGYIYnBncAL5H6IkfxEDg8VXBgbmCQixpJkMDNtbGRgkbiHEVBYwMPC3MDBsO48QQ4RJQWJRIliIBYiZ0tIYGD4tZ2DgjWRgEL7AwMAVDQsIHG5TALvNnSEfCNMZchhSgSKeDHkMyQx6QJYRgwGDIYMZAKbWPz9HbOBQAAAzt0lEQVR4nO29Z5Ad55Xn+T/nZuZzZVHw3oNwBEDQS/QUKbIptijKdEvdmo7o2Z2dnYnumI3o7f28MbEbuz07MbMbszOzM9OtllpUyzQpOpEiKdCADo6EIwxBmELBFspXvffS3HvOfch8ZYACCKA0gDp/8QJReC/zpjt577nHXSAnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJyfnmub/B2EGpGG3CN+4AAAAAElFTkSuQmCC";

const C = {
  denim:"#274458", denim2:"#4c8898", denim1:"#417682",
  mint:"#a6d9ca", mint1:"#7fccb0",
  sun:"#eca950", sun1:"#db8931",
  myrtle:"#e26160", myrtle1:"#ba4545",
  lilac:"#887091", lilac1:"#6e5c77",
  dust:"#e6d3b9", cotton:"#f2f2eb", char:"#333333",
};

const SV_MAP = {
  sports:       { type:"Sports",      mkt:"Sports",      cat:"Sports Group",       src:"Outbound | Sales Call" },
  corporate:    { type:"Meeting",     mkt:"Corporate",   cat:"Corporate",          src:"Outbound | Sales Call" },
  construction: { type:"Group Rooms", mkt:"Group Rooms", cat:"Bulk Organizations", src:"Outbound | Sales Call" },
  weddings:     { type:"Social",      mkt:"Social",      cat:"Social",             src:"Outbound | Sales Call" },
  reunions:     { type:"Social",      mkt:"Social",      cat:"Social",             src:"Outbound | Sales Call" },
  boutique:     { type:"Meeting",     mkt:"Association", cat:"Association",        src:"Outbound | Sales Call" },
};
const SV_HOTELS = {
  sports:       ["Hampton Inn & Suites McKinney","Home2 Suites McKinney","La Quinta McKinney","Fairfield Inn & Suites McKinney","Holiday Inn Hotel & Suites McKinney Fairview"],
  corporate:    ["Sheraton McKinney Hotel","Denizen Hotel McKinney","Grand Hotel McKinney","Holiday Inn Hotel & Suites McKinney Fairview"],
  construction: ["TownePlace Suites McKinney","SpringHill Suites McKinney/Allen","Home2 Suites McKinney","WoodSpring Suites McKinney"],
  weddings:     ["Sheraton McKinney Hotel","Grand Hotel McKinney","Denizen Hotel McKinney"],
  reunions:     ["Sheraton McKinney Hotel","Hampton Inn & Suites McKinney","Holiday Inn Hotel & Suites McKinney Fairview","Home2 Suites McKinney"],
  boutique:     ["Sheraton McKinney Hotel","Grand Hotel McKinney","Holiday Inn Hotel & Suites McKinney Fairview"],
};

const SEGMENTS = [
  { id:"sports",       label:"Sports",       icon:"🏆", color:C.sun1,    bg:"#fff8ee", border:C.sun },
  { id:"corporate",    label:"Corporate",    icon:"💼", color:C.denim2,  bg:"#f0f8f9", border:C.denim2 },
  { id:"construction", label:"Construction", icon:"🏗️", color:C.myrtle1, bg:"#fff5f5", border:C.myrtle },
  { id:"weddings",     label:"Weddings",     icon:"💍", color:C.lilac1,  bg:"#f8f5fa", border:C.lilac },
  { id:"reunions",     label:"Reunions",     icon:"👨‍👩‍👧‍👦", color:C.denim1,  bg:"#f0faf7", border:C.mint1 },
  { id:"boutique",     label:"Conferences",  icon:"🎯", color:C.denim,   bg:"#f0f4f7", border:C.denim1 },
];
const SEG_MAP = Object.fromEntries(SEGMENTS.map(s=>[s.id,s]));

const SYS_PROMPT = `You are a group hotel sales lead generator for Visit McKinney CVB in McKinney, Texas (30 miles north of Dallas, Collin County).

McKINNEY HOTEL INVENTORY:
- Sheraton McKinney Hotel (187 rooms, Marriott Upper Upscale) — 11,451 sq ft INDOOR meeting space, Throckmorton Ballroom 824 theater/610 banquet/780 reception, 10 breakout rooms, wedding planners. INDOOR ONLY. No outdoor events.
- Grand Hotel McKinney (45 rooms, historic downtown Upper Upscale) — 4,100 sq ft meeting space, boutique weddings/events
- TownePlace Suites McKinney (88 rooms, kitchen suites, extended stay, construction housing)
- SpringHill Suites McKinney/Allen (125 rooms, extended stay)
- Home2 Suites McKinney (107 rooms, extended stay, pet friendly)
- WoodSpring Suites McKinney (120 rooms, economy extended stay)
- Hampton Inn & Suites McKinney (79 rooms, sports teams)
- Holiday Inn Hotel & Suites McKinney Fairview (99 rooms, 2,614 sq ft meeting)
- La Quinta McKinney (79 rooms, 1,000 sq ft meeting)
- Fairfield Inn & Suites McKinney (105 rooms, 961 sq ft meeting)
- Best Western Plus McKinney (68 rooms)
- Comfort Suites McKinney-Allen (63 rooms, all suites)
- Denizen Hotel McKinney (102 rooms, new 2024 boutique)
Total: ~1,868 rooms, 22 properties

Generate REALISTIC, SPECIFIC group hotel leads that would actually fit McKinney. Use real organization types, realistic event details, and plausible contact info. Make these feel like real prospecting leads a CVB sales manager would pursue.

For the segment requested, generate 6 diverse, high-quality leads. Include a mix of fitScores (some 85+, some 70s, some 60s). Make rfpDue dates realistic — some in the next 30-60 days, some further out, some null.

IMPORTANT: Respond with ONLY a valid JSON array. No markdown. No explanation. No code fences. Start your response with [ and end with ].

JSON schema for each lead:
{
  "id": "unique string",
  "organization": "Real-sounding org name",
  "segment": "the segment id",
  "eventType": "specific event type",
  "estimatedRooms": "e.g. 45-60 peak rooms",
  "estimatedAttendees": "e.g. 200-250",
  "dates": "e.g. September 2026 or Q3 2026",
  "rfpDue": "YYYY-MM-DD or null",
  "location": "where org is based",
  "fitScore": 78,
  "fitReason": "2-3 sentences on why McKinney and its hotels are a strong fit",
  "concerns": "1 sentence on any watch-outs",
  "contactInfo": "Name, Title",
  "contactEmail": "realistic email",
  "contactPhone": "phone number",
  "contactWebsite": "website URL",
  "sourceUrl": "https://example.com",
  "summary": "1-2 sentence description of the group need",
  "sv": {
    "meetingName": "event name for Simpleview",
    "accountName": "org name",
    "contactName": "first last",
    "roomAttendees": "number",
    "showAttendees": "number",
    "eeiType": "National or Regional or Local",
    "repeatBusiness": false
  }
}`;

function viability(s) {
  if (s>=85) return {label:"Excellent", color:C.denim1, bg:"#f0f8f9", bar:C.denim1,  bars:5};
  if (s>=75) return {label:"Strong",    color:C.denim1, bg:"#f0f8f9", bar:C.mint1,   bars:4};
  if (s>=65) return {label:"Good",      color:C.sun1,   bg:"#fff8ee", bar:C.sun,     bars:3};
  if (s>=55) return {label:"Possible",  color:C.myrtle1,bg:"#fff5f5", bar:C.myrtle,  bars:2};
  return             {label:"Long Shot", color:"#888",   bg:"#f5f5f5", bar:"#ccc",    bars:1};
}

function ViabilityBar({score}) {
  const v = viability(score);
  return (
    <div style={{display:"flex",alignItems:"center",gap:5}}>
      <div style={{display:"flex",gap:2}}>
        {[1,2,3,4,5].map(i=>(
          <div key={i} style={{width:7,height:14,borderRadius:2,background:i<=v.bars?v.bar:C.dust,transition:"background 0.2s"}}/>
        ))}
      </div>
      <span style={{fontFamily:"'Josefin Sans',sans-serif",fontSize:8,color:v.color,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.5px"}}>{v.label}</span>
    </div>
  );
}

function DeadlineBadge({rfpDue}) {
  if (!rfpDue) return null;
  const today = new Date();
  const due = new Date(rfpDue);
  const diff = Math.ceil((due - today) / (1000*60*60*24));
  let color = C.denim2, bg = "#f0f8f9", prefix = "RFP due:";
  if (diff < 0)        { color="#aaa"; bg="#f5f5f5"; }
  else if (diff <= 7)  { color=C.myrtle1; bg="#fff5f5"; prefix="⚡ RFP due:"; }
  else if (diff <= 30) { color=C.sun1; bg="#fff8ee"; }
  const label = diff < 0 ? `${rfpDue} (passed)` : diff <= 30 ? `${rfpDue} (${diff}d left)` : rfpDue;
  return (
    <span style={{fontFamily:"'Josefin Sans',sans-serif",fontSize:9,color,background:bg,border:`1px solid ${color}`,borderRadius:10,padding:"2px 8px",fontWeight:700,letterSpacing:"0.5px",whiteSpace:"nowrap"}}>
      📅 {prefix} {label}
    </span>
  );
}

function copyText(t) {
  try { navigator.clipboard?.writeText(t); } catch(_) {
    const e=document.createElement("textarea"); e.value=t;
    document.body.appendChild(e); e.select();
    document.execCommand("copy"); document.body.removeChild(e);
  }
}
function CopyBtn({value}) {
  const [c,setC] = useState(false);
  return (
    <button onClick={()=>{copyText(value);setC(true);setTimeout(()=>setC(false),1500);}}
      style={{background:c?C.denim2:C.cotton,color:c?"white":C.denim2,border:`1px solid ${c?C.denim2:C.mint}`,borderRadius:3,padding:"1px 7px",fontSize:8,cursor:"pointer",fontFamily:"'Josefin Sans',sans-serif",fontWeight:700,letterSpacing:"1px",textTransform:"uppercase",transition:"all 0.15s",flexShrink:0}}>
      {c?"✓ Copied":"Copy"}
    </button>
  );
}

function SvPanel({lead}) {
  const [tab,setTab] = useState("account");
  const sv = lead.sv||{};
  const m = SV_MAP[lead.segment]||SV_MAP.boutique;
  const hotels = SV_HOTELS[lead.segment]||[];
  const acc = {"Account":sv.accountName||lead.organization,"Category":m.cat,"Market Segment":m.mkt,"Source Code":m.src,"Status":"Prospect","Website":lead.contactWebsite||"","Email":lead.contactEmail||"","Organization Profile":lead.summary||""};
  const lf = {"Meeting Name":sv.meetingName||lead.organization,"Type":m.type,"Market Segment":m.mkt,"Source Code":m.src,"EEI Type":sv.eeiType||"National","Status":"Prospect","Room Attendees":sv.roomAttendees||lead.estimatedRooms||"","Show Attendees":sv.showAttendees||lead.estimatedAttendees||"","Repeat Business":sv.repeatBusiness?"Yes":"No","Hotel Response Due":lead.rfpDue||"","Meeting Requirements":lead.fitReason||"","Comments":lead.concerns||""};
  const copyAll = obj => copyText(Object.entries(obj).filter(([,v])=>v).map(([k,v])=>`${k}: ${v}`).join("\n"));
  const Row = ({label,value,hi}) => value ? (
    <div style={{display:"grid",gridTemplateColumns:"110px 1fr auto",gap:5,alignItems:"start",padding:"5px 0",borderBottom:`1px solid ${C.cotton}`}}>
      <span style={{fontFamily:"'Josefin Sans',sans-serif",fontSize:8,letterSpacing:"1px",color:C.denim2,textTransform:"uppercase",fontWeight:700,paddingTop:1}}>{label}</span>
      <span style={{fontSize:10,color:hi?C.denim:C.char,fontWeight:hi?"600":"400",background:hi?"#f0f8f9":"transparent",padding:hi?"2px 5px":"0",borderRadius:3,lineHeight:1.4}}>{value}</span>
      <CopyBtn value={value}/>
    </div>
  ) : null;
  return (
    <div style={{background:"white",border:`2px solid ${C.denim}`,borderRadius:8,marginTop:12,overflow:"hidden"}}>
      <div style={{background:C.denim,padding:"8px 13px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <span style={{fontFamily:"'Josefin Sans',sans-serif",fontSize:9,color:"white",fontWeight:700,letterSpacing:"2px",textTransform:"uppercase"}}>📋 Simpleview CRM</span>
        <div style={{display:"flex",gap:3}}>
          {["account","lead","hotels"].map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{padding:"2px 8px",fontSize:8,letterSpacing:"1px",textTransform:"uppercase",borderRadius:8,fontWeight:700,fontFamily:"'Josefin Sans',sans-serif",cursor:"pointer",border:"none",background:tab===t?"#4c8898":"rgba(255,255,255,0.15)",color:tab===t?"white":"rgba(255,255,255,0.7)"}}>
              {t}
            </button>
          ))}
        </div>
      </div>
      <div style={{padding:"11px 13px"}}>
        {tab==="account" && <>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <span style={{fontFamily:"'Josefin Sans',sans-serif",fontSize:8,color:C.denim,fontWeight:700,letterSpacing:"1.5px",textTransform:"uppercase"}}>New Account</span>
            <button onClick={()=>copyAll(acc)} style={{background:C.denim2,color:"white",border:"none",borderRadius:3,padding:"2px 9px",fontSize:8,cursor:"pointer",fontFamily:"'Josefin Sans',sans-serif",fontWeight:700,textTransform:"uppercase",letterSpacing:"1px"}}>Copy All</button>
          </div>
          {Object.entries(acc).map(([k,v])=><Row key={k} label={k} value={v} hi={["Account","Email","Website"].includes(k)}/>)}
          <div style={{marginTop:7,padding:"6px 9px",background:"#fff8ee",border:`1px solid ${C.sun}`,borderRadius:4,fontSize:9,color:C.sun1,lineHeight:1.5}}>
            <strong>In Simpleview:</strong> Accounts → New Account. Assign Sales Manager → Aaron Werner.
          </div>
        </>}
        {tab==="lead" && <>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <span style={{fontFamily:"'Josefin Sans',sans-serif",fontSize:8,color:C.denim,fontWeight:700,letterSpacing:"1.5px",textTransform:"uppercase"}}>New Lead</span>
            <button onClick={()=>copyAll(lf)} style={{background:C.denim2,color:"white",border:"none",borderRadius:3,padding:"2px 9px",fontSize:8,cursor:"pointer",fontFamily:"'Josefin Sans',sans-serif",fontWeight:700,textTransform:"uppercase",letterSpacing:"1px"}}>Copy All</button>
          </div>
          {Object.entries(lf).map(([k,v])=><Row key={k} label={k} value={v} hi={["Meeting Name","Type","Status","Hotel Response Due"].includes(k)}/>)}
          <div style={{marginTop:7,padding:"6px 9px",background:"#fff8ee",border:`1px solid ${C.sun}`,borderRadius:4,fontSize:9,color:C.sun1,lineHeight:1.5}}>
            <strong>In Simpleview:</strong> Leads → New Lead → link to Account. Add Meeting Dates. Send RFP via Facility Search.
          </div>
        </>}
        {tab==="hotels" && <>
          <div style={{marginBottom:8,fontFamily:"'Josefin Sans',sans-serif",fontSize:8,color:C.denim,fontWeight:700,letterSpacing:"1.5px",textTransform:"uppercase"}}>Suggested Facilities</div>
          <div style={{fontSize:10,color:"#555",marginBottom:8,lineHeight:1.5}}>Add in Simpleview Facility Search, then send the RFP:</div>
          {hotels.map((h,i)=>(
            <div key={h} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"5px 8px",background:C.cotton,border:`1px solid ${C.dust}`,borderRadius:4,marginBottom:3}}>
              <span style={{fontSize:10,color:C.denim,fontWeight:i===0?"700":"400"}}>{i===0?"★ ":""}{h}</span>
              <CopyBtn value={h}/>
            </div>
          ))}
        </>}
      </div>
    </div>
  );
}

const SEG_PROMPTS = {
  sports: `Generate 6 realistic sports group hotel leads for Visit McKinney CVB (McKinney, TX — 30 miles north of Dallas).

Focus on: youth and adult sports tournaments needing hotel room blocks. Examples:
- Youth baseball/softball tournament, 40-80 teams, needing 60-120 rooms for 3-4 nights
- Club volleyball tournament at a DFW sports facility, 200-400 players
- Youth soccer tournament, families needing 50-100 rooms
- Adult recreational basketball/softball league tournament
- Gymnastics or cheer/dance competition, 300-500 attendees
- AAU basketball event, 100-200 rooms needed
- Youth swim meet at local aquatic center
McKinney hotels suited for sports: Hampton Inn (79 rooms), Holiday Inn (99), La Quinta (79), Fairfield Inn (105), Home2 Suites (107), Best Western Plus (68), Comfort Suites (63). Total ~1,868 rooms city-wide.`,

  corporate: `Generate 6 realistic corporate group hotel leads for Visit McKinney CVB (McKinney, TX — 30 miles north of Dallas).

Focus on: DFW-area and Texas companies needing meeting space + room block. Examples:
- Technology company annual sales kickoff, 100-200 employees, 2-3 nights
- Healthcare company regional training, 50-80 attendees
- Financial services firm leadership retreat, 20-40 executives
- Insurance company annual meeting, 80-120 attendees
- Manufacturing company dealer/partner conference, 60-100 rooms
- Law firm CLE training event, 40-60 attorneys
- Toyota (HQ in Plano) or Raytheon (McKinney) department offsite
McKinney primary corporate venue: Sheraton McKinney (187 rooms, 11,451 sq ft meeting space, 10 breakout rooms).`,

  construction: `Generate 6 realistic construction/project housing leads for Visit McKinney CVB (McKinney, TX — Collin County, fast-growing suburb north of Dallas).

Focus on: project crews needing extended stay hotel housing near active job sites. Examples:
- Data center construction project (multiple tech companies building in Collin County)
- TxDOT highway expansion crews (US-380, SH-121, SH-5 in Collin County)
- Commercial/retail development construction — new shopping centers, offices
- Utility or telecom infrastructure project crews
- Semiconductor or manufacturing facility construction
- Hospital or school construction project
- Corporate campus build-out (Toyota, Raytheon, etc. expansions)
Extended stay hotels: TownePlace Suites (88 rooms, kitchen suites), SpringHill Suites (125), Home2 Suites (107), WoodSpring Suites (120 economy).`,

  weddings: `Generate 6 realistic wedding room block leads for Visit McKinney CVB (McKinney, TX — 30 miles north of Dallas).

Focus on: couples or wedding planners needing hotel room blocks for out-of-town guests. Examples:
- Spring/fall 2026 or 2027 wedding at McKinney venue, 50-120 guests needing rooms
- Wedding at a McKinney historic venue, vineyard, or barn needing hotel block
- Destination wedding for couple from Houston, Austin, or out of state choosing DFW
- Wedding planner managing a large McKinney wedding needing 3+ hotels
- Rehearsal dinner + wedding weekend block at Sheraton or Grand Hotel McKinney
- Bridal party buyout of boutique hotel block
Wedding venues: Sheraton McKinney (ballroom, certified planners), Grand Hotel McKinney (historic downtown boutique), Denizen Hotel.`,

  reunions: `Generate 6 realistic family reunion and group gathering leads for Visit McKinney CVB (McKinney, TX — 30 miles north of Dallas).

Focus on: family reunions and group gatherings needing hotel room blocks. Examples:
- Texas family reunion, 50-150 family members, 3-night weekend stay
- African-American family reunion (large Texas tradition), 80-200 attendees
- Military reunion or veterans group, 40-80 attendees
- High school or college alumni reunion, 60-120 rooms
- Church group or retreat weekend, 40-100 rooms
- Quinceañera or large family celebration with out-of-town guests
- Multi-generational family vacation group, 20-50 rooms
Hotels suited: Sheraton (banquet space for group dinner), Hampton Inn, Holiday Inn, Home2 Suites, Fairfield Inn.`,

  boutique: `Generate 6 realistic boutique conference and association meeting leads for Visit McKinney CVB (McKinney, TX — 30 miles north of Dallas).

Focus on: small professional associations, niche conferences, and regional meetings. Examples:
- Texas municipal government or city managers association meeting, 80-150 attendees
- Healthcare or medical professional association regional conference, 100-200 attendees
- Real estate or homebuilder association annual meeting, 80-150 rooms
- Education association or superintendent conference, 60-120 attendees
- Texas restaurant or hospitality industry association meeting
- Nonprofit leadership summit or board retreat, 40-80 rooms
- Technology or cybersecurity industry conference, 100-200 attendees
- Law enforcement or public safety conference
Primary venue: Sheraton McKinney Hotel (11,451 sq ft meeting space, 824-seat ballroom, 10 breakout rooms). Also Grand Hotel McKinney for smaller boutique groups.`,
};

async function generateLeadsForSegment(segId) {
  const segSpecific = SEG_PROMPTS[segId] || SEG_PROMPTS.boutique;

  const prompt = `${segSpecific}

Generate exactly 6 leads. Today is May 2026. For each lead use realistic Texas organization names, real-sounding contacts, plausible email formats, and genuine-feeling details. Include:
- Mix of fitScores: 2 leads at 82-90, 2 at 70-80, 2 at 58-68
- RFP deadlines: 2 urgent (within 30 days of today May 2026), 2 in 60-90 days, 2 null
- Varied locations: some DFW, some Houston/Austin, some national orgs

Return ONLY a valid JSON array. Start with [ and end with ]. No markdown, no explanation, no code fences.

Each object must have these exact keys:
id, organization, segment, eventType, estimatedRooms, estimatedAttendees, dates, rfpDue, location, fitScore, fitReason, concerns, contactInfo, contactEmail, contactPhone, contactWebsite, sourceUrl, summary, sv

The sv object must have: meetingName, accountName, contactName, roomAttendees, showAttendees, eeiType, repeatBusiness`;

  const res = await fetch("/api/generate-leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-5",
      max_tokens: 5000,
      system: SYS_PROMPT,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`HTTP ${res.status}: ${errText.slice(0, 200)}`);
  }
  const data = await res.json();
  if (data.type === "error") throw new Error(data.error?.message || "API error");

  const text = (data.content || [])
    .filter(b => b.type === "text")
    .map(b => b.text)
    .join("");

  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");
  if (start === -1 || end === -1) throw new Error(`No JSON array found. Response: ${text.slice(0, 300)}`);

  const jsonStr = text.slice(start, end + 1);
  let parsed;
  try {
    parsed = JSON.parse(jsonStr);
  } catch(e) {
    throw new Error(`JSON parse failed: ${e.message}. Raw: ${jsonStr.slice(0, 200)}`);
  }

  const ts = Date.now();
  return parsed.map((l, i) => ({
    ...l,
    id: `${segId}-${ts}-${i}`,
    segment: l.segment || segId,
    foundAt: new Date().toLocaleTimeString(),
  }));
}

export default function App() {
  const [leads, setLeads] = useState([]);
  const [segStatus, setSegStatus] = useState(() =>
    Object.fromEntries(SEGMENTS.map(s => [s.id, { loading: false, done: false, error: null }]))
  );
  const [selected, setSelected] = useState(null);
  const [showSv, setShowSv] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [filterSeg, setFilterSeg] = useState("all");
  const [sortBy, setSortBy] = useState("score");
  const [lastRefresh, setLastRefresh] = useState(null);
  const [dismissed, setDismissed] = useState(new Set());
  const [saved, setSaved] = useState(new Set());
  const hasStarted = useRef(false);

  async function loadSegment(seg) {
    setSegStatus(p => ({ ...p, [seg.id]: { loading: true, done: false, error: null } }));
    try {
      const newLeads = await generateLeadsForSegment(seg.id);
      setLeads(prev => {
        const ex = new Set(prev.map(l => l.id));
        return [...prev, ...newLeads.filter(l => !ex.has(l.id))];
      });
      setSegStatus(p => ({ ...p, [seg.id]: { loading: false, done: true, error: null } }));
    } catch(e) {
      console.error(seg.id, e);
      setSegStatus(p => ({ ...p, [seg.id]: { loading: false, done: true, error: e.message } }));
    }
  }

  function startAll() {
    setLeads([]);
    setDismissed(new Set());
    setSelected(null);
    setShowSv(false);
    setLastRefresh(new Date());
    setSegStatus(Object.fromEntries(SEGMENTS.map(s => [s.id, { loading: false, done: false, error: null }])));
    SEGMENTS.forEach((seg, i) => {
      setTimeout(() => loadSegment(seg), i * 13000);
    });
  }

  useEffect(() => {
    if (!hasStarted.current) {
      hasStarted.current = true;
      startAll();
    }
  }, []);

  const isAnyLoading = Object.values(segStatus).some(s => s.loading);
  const doneCount = Object.values(segStatus).filter(s => s.done).length;

  const visibleLeads = leads
    .filter(l => !dismissed.has(l.id))
    .filter(l => filterSeg === "all" || l.segment === filterSeg)
    .sort((a, b) => {
      if (sortBy === "score") return b.fitScore - a.fitScore;
      if (sortBy === "deadline") {
        const da = a.rfpDue ? new Date(a.rfpDue) : new Date("2099-01-01");
        const db = b.rfpDue ? new Date(b.rfpDue) : new Date("2099-01-01");
        return da - db;
      }
      return a.segment.localeCompare(b.segment);
    });

  const urgentLeads = visibleLeads.filter(l => {
    if (!l.rfpDue) return false;
    const diff = Math.ceil((new Date(l.rfpDue) - new Date()) / (1000*60*60*24));
    return diff >= 0 && diff <= 30;
  });
  const strongLeads = visibleLeads.filter(l => l.fitScore >= 80);
  const savedList = visibleLeads.filter(l => saved.has(l.id));

  function LeadCard({ lead, compact }) {
    const seg = SEG_MAP[lead.segment] || SEGMENTS[0];
    const isSaved = saved.has(lead.id);
    const isSelected = selected?.id === lead.id;
    const diff = lead.rfpDue ? Math.ceil((new Date(lead.rfpDue) - new Date()) / (1000*60*60*24)) : null;
    const urgent = diff !== null && diff >= 0 && diff <= 14;

    return (
      <div onClick={() => { setSelected(isSelected ? null : lead); setShowSv(false); }}
        style={{background:"white",border:`1px solid ${isSelected?C.denim2:urgent?C.myrtle:C.dust}`,borderRadius:8,padding:compact?"9px 11px":"12px 14px",cursor:"pointer",transition:"box-shadow 0.15s,border-color 0.15s",boxShadow:isSelected?"0 2px 16px rgba(76,136,152,0.2)":"none",position:"relative",marginBottom:8}}>
        {urgent && (
          <div style={{position:"absolute",top:0,right:0,background:C.myrtle1,color:"white",borderRadius:"0 7px 0 6px",padding:"2px 7px",fontSize:7,fontFamily:"'Josefin Sans',sans-serif",fontWeight:700,letterSpacing:"1px"}}>
            URGENT
          </div>
        )}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:5}}>
          <div style={{flex:1,marginRight:8}}>
            <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:1}}>
              <span style={{fontSize:12}}>{seg.icon}</span>
              <span style={{fontFamily:"'Josefin Sans',sans-serif",fontSize:11,fontWeight:700,color:C.denim,lineHeight:1.3}}>{lead.organization}</span>
              {isSaved && <span style={{fontSize:9}}>⭐</span>}
            </div>
            <span style={{fontSize:9,color:"#888"}}>{lead.eventType}</span>
          </div>
          <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:3}}>
            <ViabilityBar score={lead.fitScore}/>
            <div style={{display:"flex",gap:3}}>
              <button onClick={e=>{e.stopPropagation();setSaved(p=>{const n=new Set(p);isSaved?n.delete(lead.id):n.add(lead.id);return n;})}}
                style={{background:"none",border:"none",fontSize:11,cursor:"pointer",opacity:isSaved?1:0.3,transition:"opacity 0.15s"}}>⭐</button>
              <button onClick={e=>{e.stopPropagation();setDismissed(p=>{const n=new Set(p);n.add(lead.id);return n;});if(isSelected)setSelected(null);}}
                style={{background:"none",border:"none",fontSize:10,color:C.myrtle1,cursor:"pointer",opacity:0.35}}>✕</button>
            </div>
          </div>
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:4}}>
          {lead.estimatedRooms && <span style={{fontSize:9,color:"#777"}}>🛏 {lead.estimatedRooms}</span>}
          {lead.estimatedAttendees && <span style={{fontSize:9,color:"#777"}}>👥 {lead.estimatedAttendees}</span>}
          {lead.dates && <span style={{fontSize:9,color:"#777"}}>📆 {lead.dates}</span>}
          {lead.location && <span style={{fontSize:9,color:"#777"}}>📍 {lead.location}</span>}
        </div>
        {lead.rfpDue && <div style={{marginBottom:4}}><DeadlineBadge rfpDue={lead.rfpDue}/></div>}
        {!compact && lead.summary && (
          <div style={{fontSize:9,color:"#666",lineHeight:1.5,borderTop:`1px solid ${C.cotton}`,paddingTop:4,marginTop:4}}>
            {lead.summary}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{minHeight:"100vh",background:C.cotton,fontFamily:"'Libre Franklin','Georgia',serif",color:C.char}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@400;600;700&family=Libre+Franklin:wght@300;400;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:${C.cotton}}::-webkit-scrollbar-thumb{background:${C.mint};border-radius:2px}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
        .lcard{animation:fadeIn 0.25s ease}
        button:focus,input:focus{outline:none}
        a{color:${C.denim2}}
      `}</style>

      {/* HEADER */}
      <div style={{background:C.denim,padding:"10px 20px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          <img src={`data:image/png;base64,${LOGO_B64}`} alt="Visit McKinney" style={{height:34,filter:"brightness(0) invert(1)"}}/>
          <div style={{width:1,height:26,background:"rgba(255,255,255,0.2)"}}/>
          <div>
            <div style={{fontFamily:"'Josefin Sans',sans-serif",fontSize:13,letterSpacing:"2px",color:C.mint,textTransform:"uppercase",fontWeight:700}}>Group Lead Intelligence</div>
            <div style={{fontSize:8,color:"rgba(255,255,255,0.4)",marginTop:1}}>
              {isAnyLoading
                ? `Generating leads… ${doneCount}/${SEGMENTS.length} segments complete`
                : lastRefresh
                  ? `Last refreshed ${lastRefresh.toLocaleTimeString()} · ${leads.length} leads`
                  : "Loading…"}
            </div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          {isAnyLoading && (
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <div style={{width:90,height:3,background:"rgba(255,255,255,0.15)",borderRadius:2,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${Math.round(doneCount/SEGMENTS.length*100)}%`,background:C.mint,borderRadius:2,transition:"width 0.6s"}}/>
              </div>
              <span style={{fontSize:8,color:C.mint,fontFamily:"'Josefin Sans',sans-serif"}}>{Math.round(doneCount/SEGMENTS.length*100)}%</span>
            </div>
          )}
          <button onClick={startAll} disabled={isAnyLoading}
            style={{background:isAnyLoading?"rgba(255,255,255,0.1)":C.denim2,color:"white",border:"none",borderRadius:16,padding:"5px 13px",fontSize:9,fontFamily:"'Josefin Sans',sans-serif",fontWeight:700,letterSpacing:"1.5px",textTransform:"uppercase",cursor:isAnyLoading?"not-allowed":"pointer",display:"flex",alignItems:"center",gap:5}}>
            {isAnyLoading
              ? <><div style={{width:9,height:9,border:"2px solid rgba(255,255,255,0.4)",borderTopColor:"white",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/> Generating…</>
              : "↺ Refresh All"}
          </button>
          {["dashboard","inventory","market"].map(t=>(
            <button key={t} onClick={()=>setActiveTab(t)}
              style={{padding:"4px 11px",fontSize:9,letterSpacing:"1.5px",textTransform:"uppercase",borderRadius:14,fontWeight:700,fontFamily:"'Josefin Sans',sans-serif",cursor:"pointer",border:"none",background:activeTab===t?C.denim2:"transparent",color:activeTab===t?"white":"rgba(166,217,202,0.7)"}}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "dashboard" && (
        <div style={{display:"grid",gridTemplateColumns:selected?"1fr 400px":"1fr",height:"calc(100vh - 57px)"}}>
          <div style={{overflow:"auto",display:"flex",flexDirection:"column"}}>

            {/* Filter + sort bar */}
            <div style={{background:"white",borderBottom:`2px solid ${C.dust}`,padding:"10px 18px",display:"flex",alignItems:"center",gap:7,flexWrap:"wrap"}}>
              {SEGMENTS.map(seg => {
                const st = segStatus[seg.id];
                const count = leads.filter(l=>l.segment===seg.id&&!dismissed.has(l.id)).length;
                return (
                  <button key={seg.id} onClick={()=>setFilterSeg(filterSeg===seg.id?"all":seg.id)}
                    style={{display:"flex",alignItems:"center",gap:5,padding:"4px 9px",border:`1px solid ${filterSeg===seg.id?seg.border:C.dust}`,borderRadius:16,background:filterSeg===seg.id?seg.bg:"transparent",cursor:"pointer",transition:"all 0.15s"}}>
                    <span style={{fontSize:11}}>{seg.icon}</span>
                    <span style={{fontFamily:"'Josefin Sans',sans-serif",fontSize:8,color:filterSeg===seg.id?seg.color:"#777",fontWeight:filterSeg===seg.id?"700":"400",textTransform:"uppercase",letterSpacing:"0.5px"}}>{seg.label}</span>
                    {st.loading
                      ? <div style={{width:8,height:8,border:`1.5px solid ${seg.border}`,borderTopColor:seg.color,borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>
                      : st.error
                        ? <span title={st.error} style={{fontFamily:"'Josefin Sans',sans-serif",fontSize:8,color:"white",background:C.myrtle1,padding:"0 5px",borderRadius:8,fontWeight:700,minWidth:16,textAlign:"center"}}>!</span>
                        : <span style={{fontFamily:"'Josefin Sans',sans-serif",fontSize:8,color:"white",background:count>0?seg.color:"#ccc",padding:"0 5px",borderRadius:8,fontWeight:700,minWidth:16,textAlign:"center"}}>{count}</span>
                    }
                  </button>
                );
              })}
              <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:5}}>
                <span style={{fontFamily:"'Josefin Sans',sans-serif",fontSize:8,color:C.denim2,letterSpacing:"1px",textTransform:"uppercase",fontWeight:700}}>Sort:</span>
                {[["score","Viability"],["deadline","Deadline"],["segment","Segment"]].map(([v,l])=>(
                  <button key={v} onClick={()=>setSortBy(v)}
                    style={{padding:"2px 8px",fontSize:8,borderRadius:8,border:`1px solid ${sortBy===v?C.denim2:C.dust}`,background:sortBy===v?"#f0f8f9":"transparent",color:sortBy===v?C.denim2:"#888",cursor:"pointer",fontFamily:"'Josefin Sans',sans-serif",fontWeight:sortBy===v?"700":"400",textTransform:"uppercase",letterSpacing:"0.5px"}}>
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* Error banner */}
            {Object.entries(segStatus).some(([,s])=>s.error) && (
              <div style={{background:"#fff5f5",borderBottom:`2px solid ${C.myrtle}`,padding:"8px 18px"}}>
                <div style={{fontFamily:"'Josefin Sans',sans-serif",fontSize:8,color:C.myrtle1,letterSpacing:"2px",fontWeight:700,textTransform:"uppercase",marginBottom:5}}>⚠ API Error — Check Vercel Environment Variables</div>
                {Object.entries(segStatus).filter(([,s])=>s.error).map(([id,s])=>(
                  <div key={id} style={{fontSize:9,color:C.myrtle1,marginBottom:2}}>
                    <strong>{id}:</strong> {s.error}
                  </div>
                ))}
                <div style={{fontSize:9,color:"#888",marginTop:5}}>Make sure <strong>ANTHROPIC_API_KEY</strong> is set in Vercel → Project Settings → Environment Variables, then redeploy.</div>
              </div>
            )}

            {/* Urgent strip */}
            {urgentLeads.length > 0 && (
              <div style={{background:"#fff5f5",borderBottom:`2px solid ${C.myrtle}`,padding:"8px 18px"}}>
                <div style={{fontFamily:"'Josefin Sans',sans-serif",fontSize:8,color:C.myrtle1,letterSpacing:"2px",fontWeight:700,textTransform:"uppercase",marginBottom:7}}>⚡ Urgent — RFP Deadline Within 30 Days</div>
                <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
                  {urgentLeads.map(l => {
                    const days = Math.ceil((new Date(l.rfpDue) - new Date()) / (1000*60*60*24));
                    return (
                      <button key={l.id} onClick={()=>{setSelected(l);setShowSv(false);}}
                        style={{display:"flex",alignItems:"center",gap:6,padding:"4px 9px",background:"white",border:`1px solid ${days<=7?C.myrtle:C.sun}`,borderRadius:6,cursor:"pointer"}}>
                        <span style={{fontSize:10}}>{SEG_MAP[l.segment]?.icon||"📋"}</span>
                        <div style={{textAlign:"left"}}>
                          <div style={{fontFamily:"'Josefin Sans',sans-serif",fontSize:9,color:C.denim,fontWeight:700}}>{l.organization}</div>
                          <div style={{fontSize:8,color:days<=7?C.myrtle1:C.sun1,fontWeight:700}}>{days}d left · {l.rfpDue}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Stats */}
            <div style={{padding:"12px 18px",display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
              {[
                {l:"Total Leads",v:visibleLeads.length,c:C.denim2,bg:"#f0f8f9",b:C.mint},
                {l:"Strong Fits",v:strongLeads.length,c:C.denim1,bg:"#f0f8f9",b:C.mint1,sub:"Score ≥ 80"},
                {l:"Urgent RFPs",v:urgentLeads.length,c:urgentLeads.length>0?C.myrtle1:C.denim1,bg:urgentLeads.length>0?"#fff5f5":"#f0f8f9",b:urgentLeads.length>0?C.myrtle:C.mint1,sub:"Due ≤ 30 days"},
                {l:"Saved",v:savedList.length,c:C.sun1,bg:"#fff8ee",b:C.sun,sub:"Starred"},
              ].map(s=>(
                <div key={s.l} style={{background:s.bg,border:`1px solid ${s.b}`,borderRadius:7,padding:"10px 12px"}}>
                  <div style={{fontFamily:"'Josefin Sans',sans-serif",fontSize:7,letterSpacing:"2px",color:s.c,textTransform:"uppercase",fontWeight:700,marginBottom:3}}>{s.l}</div>
                  <div style={{fontFamily:"'Josefin Sans',sans-serif",fontSize:24,color:s.c,fontWeight:700,lineHeight:1}}>{s.v}</div>
                  {s.sub && <div style={{fontSize:8,color:"#aaa",marginTop:2}}>{s.sub}</div>}
                </div>
              ))}
            </div>

            {/* Loading placeholder */}
            {visibleLeads.length === 0 && isAnyLoading && (
              <div style={{textAlign:"center",padding:"40px 20px"}}>
                <div style={{width:40,height:40,border:`3px solid ${C.mint}`,borderTopColor:C.denim2,borderRadius:"50%",animation:"spin 1s linear infinite",margin:"0 auto 14px"}}/>
                <div style={{fontFamily:"'Josefin Sans',sans-serif",fontSize:11,color:C.denim,fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",marginBottom:4}}>Generating leads…</div>
                <div style={{fontSize:10,color:"#888"}}>{doneCount} of {SEGMENTS.length} segments complete</div>
                <div style={{fontSize:9,color:"#aaa",marginTop:4}}>Leads will appear as each segment finishes</div>
              </div>
            )}

            {/* Lead grid */}
            <div style={{padding:"0 18px 18px",flex:1}}>
              <div style={{columns:selected?1:2,columnGap:10}}>
                {visibleLeads.map(lead => (
                  <div key={lead.id} className="lcard" style={{breakInside:"avoid"}}>
                    <LeadCard lead={lead} compact={!!selected}/>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* DETAIL PANEL */}
          {selected && (() => {
            const seg = SEG_MAP[selected.segment] || SEGMENTS[0];
            return (
              <div style={{borderLeft:`2px solid ${C.dust}`,overflow:"auto",padding:"16px",background:"white"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                  <div style={{display:"flex",alignItems:"center",gap:9}}>
                    <span style={{fontSize:20}}>{seg.icon}</span>
                    <div>
                      <div style={{fontFamily:"'Josefin Sans',sans-serif",fontSize:8,letterSpacing:"2px",color:seg.color,textTransform:"uppercase",fontWeight:700,marginBottom:2}}>{seg.label}</div>
                      <div style={{fontFamily:"'Josefin Sans',sans-serif",fontSize:13,color:C.denim,fontWeight:700,lineHeight:1.3}}>{selected.organization}</div>
                    </div>
                  </div>
                  <button onClick={()=>setSelected(null)} style={{background:"none",border:"none",fontSize:15,color:"#ccc",cursor:"pointer"}}>✕</button>
                </div>
                <div style={{display:"flex",gap:7,alignItems:"center",marginBottom:10,flexWrap:"wrap"}}>
                  <ViabilityBar score={selected.fitScore}/>
                  {selected.rfpDue && <DeadlineBadge rfpDue={selected.rfpDue}/>}
                </div>
                <div style={{fontSize:10,color:"#666",marginBottom:10}}>{selected.eventType}</div>
                {[["Est. Rooms",selected.estimatedRooms],["Attendees",selected.estimatedAttendees],["Event Dates",selected.dates],["Location",selected.location],["Contact",selected.contactInfo],["Email",selected.contactEmail],["Phone",selected.contactPhone],["Website",selected.contactWebsite]].filter(([,v])=>v).map(([l,v])=>(
                  <div key={l} style={{display:"grid",gridTemplateColumns:"72px 1fr auto",gap:5,alignItems:"center",marginBottom:4}}>
                    <span style={{fontFamily:"'Josefin Sans',sans-serif",fontSize:8,letterSpacing:"1px",color:C.denim2,textTransform:"uppercase",fontWeight:700}}>{l}</span>
                    <span style={{fontSize:10,color:C.char,wordBreak:"break-word"}}>{v}</span>
                    <CopyBtn value={v}/>
                  </div>
                ))}
                <div style={{background:"#f0f8f9",border:`1px solid ${C.mint}`,borderRadius:6,padding:"9px 11px",marginTop:10,marginBottom:7}}>
                  <div style={{fontFamily:"'Josefin Sans',sans-serif",fontSize:7,letterSpacing:"2px",color:C.denim1,textTransform:"uppercase",fontWeight:700,marginBottom:4}}>Why McKinney Fits</div>
                  <div style={{fontSize:10,color:"#444",lineHeight:1.7}}>{selected.fitReason}</div>
                </div>
                {selected.concerns && (
                  <div style={{background:"#fff8ee",border:`1px solid ${C.sun}`,borderRadius:6,padding:"9px 11px",marginBottom:7}}>
                    <div style={{fontFamily:"'Josefin Sans',sans-serif",fontSize:7,letterSpacing:"2px",color:C.sun1,textTransform:"uppercase",fontWeight:700,marginBottom:4}}>Watch Out</div>
                    <div style={{fontSize:10,color:"#444",lineHeight:1.7}}>{selected.concerns}</div>
                  </div>
                )}
                {selected.sourceUrl && (
                  <a href={selected.sourceUrl} target="_blank" rel="noopener noreferrer"
                    style={{fontSize:9,color:C.denim2,fontWeight:700,fontFamily:"'Josefin Sans',sans-serif",textTransform:"uppercase",letterSpacing:"1px",display:"inline-block",marginBottom:10}}>
                    View Source →
                  </a>
                )}
                <div style={{borderTop:`2px solid ${C.dust}`,paddingTop:10,marginTop:4}}>
                  <button onClick={()=>setShowSv(!showSv)}
                    style={{width:"100%",background:showSv?C.denim:C.cotton,color:showSv?"white":C.denim,border:`2px solid ${showSv?C.denim:C.mint}`,borderRadius:6,padding:"7px 12px",fontFamily:"'Josefin Sans',sans-serif",fontSize:9,fontWeight:700,letterSpacing:"2px",textTransform:"uppercase",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:7}}>
                    <span>📋</span>{showSv ? "Hide Simpleview ▲" : "Prepare for Simpleview CRM ▼"}
                  </button>
                  {showSv && <SvPanel lead={selected}/>}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {activeTab === "inventory" && (
        <div style={{padding:"20px",maxWidth:860,overflow:"auto",height:"calc(100vh - 57px)"}}>
          <div style={{fontFamily:"'Josefin Sans',sans-serif",fontSize:20,color:C.denim,fontWeight:700,marginBottom:3}}>Hotel Inventory</div>
          <div style={{fontSize:11,color:"#666",marginBottom:18}}>1,868 rooms · 22 properties · McKinney, Texas</div>
          <div style={{background:"white",border:`2px solid ${C.mint}`,borderRadius:8,padding:"15px",marginBottom:16}}>
            <div style={{fontFamily:"'Josefin Sans',sans-serif",fontSize:13,color:C.denim,fontWeight:700,marginBottom:1}}>Sheraton McKinney Hotel ★ Primary Event Venue</div>
            <div style={{fontSize:9,color:C.denim2,fontWeight:600,marginBottom:9}}>Upper Upscale · Marriott · 1900 Gateway Blvd — INDOOR ONLY</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:7,marginBottom:9}}>
              {[["Rooms","187"],["Total Mtg Sq Ft","11,451"],["Ballroom","7,665 sq ft"],["Breakout Rooms","10"]].map(([l,v])=>(
                <div key={l} style={{background:"#f0f8f9",borderRadius:5,padding:"8px"}}>
                  <div style={{fontFamily:"'Josefin Sans',sans-serif",fontSize:7,color:C.denim2,fontWeight:700,textTransform:"uppercase",letterSpacing:"1px",marginBottom:2}}>{l}</div>
                  <div style={{fontFamily:"'Josefin Sans',sans-serif",fontSize:16,color:C.denim,fontWeight:700}}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{display:"flex",gap:6}}>
              {[["Theater","824"],["Banquet","610"],["Reception","780"]].map(([k,v])=>(
                <div key={k} style={{fontSize:9,color:"#444",background:C.cotton,borderRadius:3,padding:"3px 8px"}}>{k}: <strong>{v}</strong></div>
              ))}
            </div>
          </div>
          {[
            {title:"🏗️ Extended Stay / Construction Housing",color:C.myrtle1,hotels:[{n:"TownePlace Suites McKinney",r:88,note:"Kitchen suites, weekly rates"},{n:"SpringHill Suites McKinney/Allen",r:125,note:"Extended stay suites"},{n:"Home2 Suites McKinney",r:107,note:"Pet friendly extended stay"},{n:"WoodSpring Suites McKinney",r:120,note:"Economy long-term"}]},
            {title:"🏆 Sports & Group Hotels",color:C.sun1,hotels:[{n:"Hampton Inn & Suites McKinney",r:79,note:"Popular sports blocks"},{n:"Holiday Inn McKinney Fairview",r:99,note:"2,614 sq ft mtg"},{n:"La Quinta McKinney",r:79,note:"1,000 sq ft mtg"},{n:"Fairfield Inn & Suites McKinney",r:105,note:"961 sq ft mtg"},{n:"Best Western Plus McKinney",r:68},{n:"Comfort Suites McKinney-Allen",r:63,note:"All suites"}]},
            {title:"💍 Boutique / Unique Properties",color:C.lilac1,hotels:[{n:"Grand Hotel McKinney",r:45,note:"Historic downtown, 4,100 sq ft — weddings/boutique events"},{n:"Denizen Hotel McKinney",r:102,note:"New 2024 boutique"}]},
          ].map(sec=>(
            <div key={sec.title} style={{marginBottom:14}}>
              <div style={{fontFamily:"'Josefin Sans',sans-serif",fontSize:8,letterSpacing:"2px",color:sec.color,textTransform:"uppercase",fontWeight:700,marginBottom:7}}>{sec.title}</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5}}>
                {sec.hotels.map(h=>(
                  <div key={h.n} style={{background:"white",border:`1px solid ${C.dust}`,borderRadius:5,padding:"8px 10px",borderLeft:`3px solid ${sec.color}`}}>
                    <div style={{fontFamily:"'Josefin Sans',sans-serif",fontSize:9,color:C.denim,fontWeight:600,marginBottom:1}}>{h.n}</div>
                    <div style={{fontSize:8,color:"#888"}}>{h.r} rooms{h.note?` · ${h.note}`:""}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div>
            <div style={{fontFamily:"'Josefin Sans',sans-serif",fontSize:8,letterSpacing:"2px",color:C.sun1,textTransform:"uppercase",fontWeight:700,marginBottom:7}}>📅 Pipeline</div>
            {[{n:"AC Hotel McKinney",r:137,s:"Under Construction 2026",note:"Upscale, 2,201 sq ft mtg"},{n:"Cannon Beach Resort Hotel",r:200,s:"Under Construction 2027"},{n:"Residence Inn McKinney",r:128,s:"Final Planning 2027",note:"Extended stay"},{n:"JW Marriott Craig Ranch",r:289,s:"Proposed 2029",note:"FUTURE ANCHOR — 51,575 sq ft meeting space"}].map(h=>(
              <div key={h.n} style={{background:"white",border:`1px solid ${C.dust}`,borderRadius:5,padding:"8px 12px",marginBottom:4,display:"flex",justifyContent:"space-between",alignItems:"center",borderLeft:`3px solid ${C.sun}`}}>
                <div>
                  <div style={{fontFamily:"'Josefin Sans',sans-serif",fontSize:9,color:C.denim,fontWeight:600}}>{h.n}</div>
                  <div style={{fontSize:8,color:"#999"}}>{h.r} rooms{h.note?` · ${h.note}`:""}</div>
                </div>
                <span style={{fontFamily:"'Josefin Sans',sans-serif",fontSize:8,color:C.sun1,fontWeight:700,flexShrink:0,marginLeft:8}}>{h.s}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "market" && (
        <div style={{padding:"20px",maxWidth:620,overflow:"auto",height:"calc(100vh - 57px)"}}>
          <div style={{fontFamily:"'Josefin Sans',sans-serif",fontSize:20,color:C.denim,fontWeight:700,marginBottom:3}}>Market Data</div>
          <div style={{fontSize:11,color:"#666",marginBottom:18}}>McKinney CVB · STR Data through March 2026</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:9,marginBottom:14}}>
            {[{l:"Occupancy",v:"70.5%",c:C.denim1,bg:"#f0f8f9",b:C.mint},{l:"Avg Daily Rate",v:"$101.33",c:C.denim,bg:"#f0f4f7",b:C.denim2},{l:"RevPAR",v:"$71.48",c:C.sun1,bg:"#fff8ee",b:C.sun}].map(s=>(
              <div key={s.l} style={{background:s.bg,border:`1px solid ${s.b}`,borderRadius:7,padding:"12px"}}>
                <div style={{fontFamily:"'Josefin Sans',sans-serif",fontSize:7,letterSpacing:"2px",color:s.c,textTransform:"uppercase",fontWeight:700,marginBottom:4}}>{s.l}</div>
                <div style={{fontFamily:"'Josefin Sans',sans-serif",fontSize:22,color:s.c,fontWeight:700,marginBottom:2}}>{s.v}</div>
                <div style={{fontSize:8,color:"#888"}}>March 2026</div>
              </div>
            ))}
          </div>
          <div style={{background:"white",border:`1px solid ${C.dust}`,borderRadius:7,padding:"13px",marginBottom:10}}>
            <div style={{fontFamily:"'Josefin Sans',sans-serif",fontSize:8,letterSpacing:"2px",color:C.denim,textTransform:"uppercase",fontWeight:700,marginBottom:9}}>YTD 2026 vs 2025</div>
            {[{l:"Occupancy",a:"64.4%",b:"66.3%",d:"-2.8%",up:false},{l:"ADR",a:"$98.82",b:"$95.43",d:"+3.6%",up:true},{l:"RevPAR",a:"$63.67",b:"$63.27",d:"+0.6%",up:true},{l:"Revenue (12mo)",a:"$48.4M",b:"$44.1M",d:"+9.9%",up:true},{l:"Supply Growth (12mo)",a:"+7.5%",b:"—",d:"New rooms",up:true}].map(r=>(
              <div key={r.l} style={{display:"grid",gridTemplateColumns:"1fr 60px 60px 65px",gap:5,alignItems:"center",padding:"5px 0",borderBottom:`1px solid ${C.cotton}`}}>
                <span style={{fontSize:10,color:"#444"}}>{r.l}</span>
                <span style={{fontFamily:"'Josefin Sans',sans-serif",fontSize:10,color:C.denim,textAlign:"right",fontWeight:600}}>{r.a}</span>
                <span style={{fontSize:10,color:"#aaa",textAlign:"right"}}>{r.b}</span>
                <span style={{fontFamily:"'Josefin Sans',sans-serif",fontSize:9,color:r.up?C.denim1:C.myrtle1,textAlign:"right",fontWeight:700}}>{r.d}</span>
              </div>
            ))}
          </div>
          <div style={{background:"#f0f8f9",border:`1px solid ${C.mint}`,borderRadius:7,padding:"12px"}}>
            <div style={{fontFamily:"'Josefin Sans',sans-serif",fontSize:8,letterSpacing:"2px",color:C.denim1,textTransform:"uppercase",fontWeight:700,marginBottom:6}}>Group Sales Opportunity</div>
            <div style={{fontSize:10,color:"#444",lineHeight:1.8}}>Supply grew 7.5% over the running 12 months. With occupancy softening YTD (-2.8%), hotels are motivated on group pricing. ADR growing +3.6% shows rate integrity — McKinney offers value vs. Plano/Frisco. Revenue up 9.9% running 12 months signals healthy underlying demand.</div>
          </div>
        </div>
      )}
    </div>
  );
}
