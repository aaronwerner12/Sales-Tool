import { useState, useCallback } from "react";

// Visit McKinney Brand Colors (from Style Guide)
// Primary: Faded Denim #4c8898, McK Mint #a6d9ca, Sunflower #eca950, Crepe Myrtle #e26160
// Neutrals: Cotton #f2f2eb, Dust #e6d3b9, Char #333333, New Denim #274458
// Fonts: Josefin Sans (headlines), Libre Franklin (body)

const LOGO_B64 = "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";

const MCKINNEY_HOTELS = {
  flagship: {
    name: "Sheraton McKinney Hotel",
    rooms: 187, meetingRooms: 11, totalMeetingSpace: 11451, largestSpace: 7665,
    maxCapacity: { theater: 824, banquet: 610, reception: 780 },
    brand: "Marriott International", class: "Upper Upscale",
    address: "1900 Gateway Blvd, McKinney TX 75070",
    notes: "Primary event venue. Throckmorton Ballroom (7,665 sq ft), 10 breakout rooms, certified wedding planners, full catering. INDOOR ONLY."
  },
  supporting: [
    { name: "Grand Hotel McKinney", rooms: 45, meetingSpace: 4100, class: "Upper Upscale", notes: "Historic downtown boutique — ideal for weddings, rehearsal dinners, intimate receptions" },
    { name: "Holiday Inn Hotel & Suites McKinney Fairview", rooms: 99, meetingSpace: 2614, class: "Upper Midscale", notes: "3 meeting rooms, good for small corporate groups" },
    { name: "SpringHill Suites McKinney/Allen", rooms: 125, meetingSpace: 1320, class: "Upscale", notes: "Extended stay suites — ideal for construction crews and project housing" },
    { name: "TownePlace Suites McKinney", rooms: 88, class: "Upper Midscale", notes: "Extended stay — kitchens in rooms, weekly rates, excellent for construction/project housing" },
    { name: "Home2 Suites McKinney", rooms: 107, class: "Upper Midscale", notes: "Extended stay suites — construction/project housing, pet friendly" },
    { name: "WoodSpring Suites McKinney", rooms: 120, class: "Economy", notes: "Extended stay economy — long-term construction crew housing, weekly rates" },
    { name: "Red Roof Inn & Conference Center McKinney", rooms: 100, meetingSpace: 4517, class: "Economy", notes: "3 meeting rooms, value option for small meetings and sports teams" },
    { name: "La Quinta McKinney", rooms: 79, meetingSpace: 1000, class: "Upper Midscale" },
    { name: "Fairfield Inn & Suites McKinney", rooms: 105, meetingSpace: 961, class: "Upper Midscale" },
    { name: "Denizen Hotel McKinney", rooms: 102, class: "Upscale", notes: "New 2024 boutique — great for corporate groups, unique experience" },
    { name: "Hampton Inn & Suites McKinney", rooms: 79, class: "Upper Midscale", notes: "Popular for sports team room blocks" },
    { name: "Best Western Plus McKinney Inn & Suites", rooms: 68, class: "Upper Midscale" },
    { name: "Comfort Suites McKinney-Allen", rooms: 63, class: "Upper Midscale", notes: "All suites — good for families and extended stays" },
  ],
  comingSoon: [
    { name: "AC Hotel McKinney", rooms: 137, meetingSpace: 2201, status: "Under Construction 2026", class: "Upscale" },
    { name: "Cannon Beach Resort Hotel", rooms: 200, status: "Under Construction 2027", class: "Upper Upscale" },
    { name: "Residence Inn McKinney", rooms: 128, status: "Final Planning 2027", class: "Upscale", notes: "Extended stay — will add significant project housing capacity" },
    { name: "JW Marriott McKinney Craig Ranch", rooms: 289, meetingSpace: 51575, status: "Proposed 2029", class: "Luxury", notes: "FUTURE ANCHOR — 51,575 sq ft meeting space" },
  ]
};

const MARKET_STATS = {
  totalCurrentRooms: 1868,
  occupancyMarch2026: 70.5,
  adrMarch2026: 101.33,
  revParMarch2026: 71.48,
  ytdOccupancy2026: 64.4,
};

const SEGMENTS = [
  { id: "sports", label: "Sports & Tournaments", icon: "🏆", color: "#db8931", bg: "#fff8ee", border: "#eca950",
    description: "Youth & adult sports teams needing hotel room blocks near DFW sports facilities",
    quickSearches: ["youth baseball tournament Texas 2026 hotel room block","youth soccer tournament DFW North Texas hotel","volleyball tournament Collin County hotel needed","youth basketball tournament McKinney Allen Frisco","gymnastics cheerleading competition DFW hotel block","swim meet wrestling tournament North Texas 2026"] },
  { id: "corporate", label: "Corporate Groups", icon: "💼", color: "#417682", bg: "#f0f8f9", border: "#4c8898",
    description: "Small meetings, retreats, training events, executive offsites for DFW companies",
    quickSearches: ["corporate retreat venue DFW small group 2026","executive leadership offsite North Texas hotel","company training event McKinney Plano Frisco area","corporate team building DFW hotel meeting space","annual company meeting small group Texas hotel venue"] },
  { id: "construction", label: "Construction Housing", icon: "🏗️", color: "#ba4545", bg: "#fff5f5", border: "#e26160",
    description: "Project crews needing extended stay housing near McKinney/Collin County job sites",
    quickSearches: ["construction project Collin County McKinney TX 2026","data center construction workers housing North Texas","infrastructure highway project workforce housing DFW","commercial development construction crews hotel McKinney","semiconductor chip plant construction workers Texas housing"] },
  { id: "weddings", label: "Weddings", icon: "💍", color: "#6e5c77", bg: "#f8f5fa", border: "#887091",
    description: "Wedding room blocks, rehearsal dinners, bridal events near McKinney venues",
    quickSearches: ["wedding venue McKinney Texas room block 2026 2027","wedding hotel room block DFW North Texas","bridal party hotel McKinney Allen Frisco Texas","destination wedding Texas suburban venue hotel","wedding planner McKinney hotel block seeking"] },
  { id: "reunions", label: "Family Reunions", icon: "👨‍👩‍👧‍👦", color: "#417682", bg: "#f0faf7", border: "#7fccb0",
    description: "Family reunions and group gatherings needing hotel blocks in Texas",
    quickSearches: ["family reunion hotel room block Texas 2026","family reunion venue DFW North Texas hotel group rate","large family gathering hotel McKinney Collin County","family reunion planning Texas destination 2026 2027","family reunion hotel block 50 100 rooms Texas"] },
  { id: "boutique", label: "Boutique Conferences", icon: "🎯", color: "#274458", bg: "#f0f4f7", border: "#417682",
    description: "Small focused conferences, association meetings, niche summits under 300 people",
    quickSearches: ["small association conference Texas hotel venue 2026","boutique conference venue DFW 50-200 attendees","regional conference North Texas hotel meeting space","professional association annual meeting Texas venue RFP","niche industry summit Dallas area hotel 2026 2027"] },
];

const SYSTEM_PROMPT = `You are an RFP and group lead generation agent for Visit McKinney CVB (Convention & Visitors Bureau) in McKinney, Texas — a fast-growing, safe, upscale suburban city 30 miles north of Dallas in Collin County. McKinney's brand: authentic, free-spirited, welcoming gem of North Texas — historic charm, vibrant arts/music scene, great food, friendly community.

HOTEL INVENTORY:
PRIMARY EVENT VENUE: Sheraton McKinney (187 rooms, Upper Upscale, Marriott) — 11,451 sq ft total INDOOR meeting space, Throckmorton Ballroom seats 824 theater/610 banquet/780 reception, 10 breakout rooms, certified wedding planners, full catering. INDOOR ONLY.
BOUTIQUE: Grand Hotel McKinney (45 rooms, historic downtown, Upper Upscale) — 4,100 sq ft, great for weddings, rehearsal dinners. Denizen Hotel McKinney (102 rooms, new 2024, Upscale).
EXTENDED STAY / CONSTRUCTION HOUSING: SpringHill Suites (125 rooms), TownePlace Suites (88 rooms, kitchen suites), Home2 Suites (107 rooms, pet friendly), WoodSpring Suites (120 rooms, economy long-term). Residence Inn (128 rooms, 2027).
SPORTS/GROUP HOTELS: Hampton Inn (79), Holiday Inn (99), La Quinta (79), Fairfield Inn (105), Home2 Suites (107), Best Western Plus (68), Comfort Suites (63).
COMING SOON: AC Hotel 2026 (137 rooms), Cannon Beach Resort 2027 (200), JW Marriott Craig Ranch 2029 (289 rooms, 51,575 sq ft meeting space — FUTURE ANCHOR).
TOTAL: ~1,868 rooms, 22 properties.

SEGMENTS:
🏆 SPORTS: Youth/adult sports teams needing room blocks. Soccer, baseball/softball, volleyball, basketball, gymnastics, cheer, swimming. 10-200 rooms, 1-4 nights.
💼 CORPORATE: Small meetings, retreats, training, exec offsites. 10-300 attendees. Meeting space + room block.
🏗️ CONSTRUCTION HOUSING: Project crews near Collin County job sites (data centers, highways, commercial). Extended stay hotels ideal. Multi-week/month stays.
💍 WEDDINGS: Room blocks for out-of-town guests. Sheraton (full wedding services) + Grand Hotel (boutique). 20-150 rooms, 2-3 nights.
👨‍👩‍👧‍👦 FAMILY REUNIONS: Texas family gatherings. 20-150 rooms, 2-4 nights. Possibly event space for group dinner.
🎯 BOUTIQUE CONFERENCES: Small niche conferences, association meetings. 30-300 attendees. Meeting space + room block.

Return ONLY raw JSON array (no markdown, no backticks):
[{"id":"unique","organization":"name","segment":"sports|corporate|construction|weddings|reunions|boutique","eventType":"specific type","estimatedRooms":"rooms or room nights","estimatedAttendees":"count or range","dates":"dates or timeframe","location":"where based or event location","fitScore":80,"fitReason":"2-3 sentences why McKinney fits","concerns":"issues or unknowns","contactInfo":"contact if available","sourceUrl":"URL found","summary":"1-2 sentence description"}]

fitScore 0-100. Return leads with fitScore >= 55 only. Return 4-8 leads. Return [] if none found.`;

const SEGMENT_MAP = Object.fromEntries(SEGMENTS.map(s => [s.id, s]));
const getFitColor = (s) => s >= 80 ? "#417682" : s >= 65 ? "#db8931" : "#ba4545";
const getFitBg = (s) => s >= 80 ? "#f0f8f9" : s >= 65 ? "#fff8ee" : "#fff5f5";
const getFitLabel = (s) => s >= 80 ? "Strong Fit" : s >= 65 ? "Good Fit" : "Possible";

export default function McKinneyRFPAgent() {
  const [query, setQuery] = useState("");
  const [activeSegment, setActiveSegment] = useState("sports");
  const [leads, setLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("search");

  const seg = SEGMENT_MAP[activeSegment];

  const runSearch = useCallback(async (searchQuery, segmentId) => {
    if (!searchQuery.trim() || isLoading) return;
    setIsLoading(true);
    setError(null);
    const segInfo = SEGMENT_MAP[segmentId || activeSegment];
    const prompt = `Find hotel group leads for Visit McKinney CVB in the "${segInfo.label}" segment.\n\nSearch query: "${searchQuery}"\n\nFocus: ${segInfo.description}\n\nFind real, current leads — groups seeking hotels, posting needs, announcing events, or projects underway in or near McKinney TX / Collin County / DFW North.`;
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 4000, system: SYSTEM_PROMPT,
          tools: [{ type: "web_search_20250305", name: "web_search" }],
          messages: [{ role: "user", content: prompt }] }),
      });
      const data = await res.json();
      const allText = data.content.filter(b => b.type === "text").map(b => b.text).join("\n");
      let newLeads = [];
      try { const match = allText.match(/\[[\s\S]*\]/); if (match) newLeads = JSON.parse(match[0]); } catch (_) {}
      const ts = Date.now();
      newLeads = newLeads.map((l, i) => ({ ...l, id: l.id || `${ts}-${i}`, segment: l.segment || segmentId || activeSegment, foundAt: new Date().toLocaleTimeString() }));
      setLeads(prev => { const ex = new Set(prev.map(l => l.id)); return [...newLeads.filter(l => !ex.has(l.id)), ...prev]; });
      setSearchHistory(prev => [{ query: searchQuery, segment: segInfo.label, segIcon: segInfo.icon, count: newLeads.length, time: new Date().toLocaleTimeString() }, ...prev.slice(0, 8)]);
      if (newLeads.length === 0) setError("No qualifying leads found. Try different keywords.");
    } catch (e) { setError("Search failed. Please try again."); }
    finally { setIsLoading(false); }
  }, [isLoading, activeSegment]);

  const handleSubmit = (e) => { e.preventDefault(); runSearch(query); setQuery(""); };
  const removeLead = (id) => { setLeads(prev => prev.filter(l => l.id !== id)); if (selectedLead?.id === id) setSelectedLead(null); };
  const strongLeads = leads.filter(l => l.fitScore >= 80).length;

  return (
    <div style={{ minHeight:"100vh", background:"#f2f2eb", fontFamily:"'Libre Franklin','Georgia',serif", color:"#333333" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@400;600;700&family=Libre+Franklin:wght@300;400;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:#f2f2eb}::-webkit-scrollbar-thumb{background:#a6d9ca;border-radius:2px}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        .lead-card{animation:fadeUp 0.2s ease;transition:box-shadow 0.15s,border-color 0.15s;cursor:pointer}
        .lead-card:hover{box-shadow:0 2px 12px rgba(76,136,152,0.18) !important;border-color:#4c8898 !important}
        .lead-card.active{border-color:#4c8898 !important;box-shadow:0 2px 16px rgba(76,136,152,0.25) !important}
        .seg-btn{transition:all 0.15s;cursor:pointer;border:none;text-align:left}
        .quick-btn{transition:all 0.15s;cursor:pointer;text-align:left;font-family:inherit;background:white}
        .quick-btn:hover{background:#f0f8f9 !important;border-color:#4c8898 !important}
        .tab-btn{cursor:pointer;border:none;transition:all 0.15s;font-family:'Josefin Sans',sans-serif}
        .rm-btn{opacity:0;transition:opacity 0.15s}
        .lead-card:hover .rm-btn{opacity:1}
        input:focus{outline:none}
        a{color:#4c8898;text-decoration:none}a:hover{text-decoration:underline}
        .search-btn:hover{background:#417682 !important}
      `}</style>

      {/* TOP BAR */}
      <div style={{ background:"#274458", padding:"12px 24px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
          <img src={`data:image/png;base64,${LOGO_B64}`} alt="Visit McKinney" style={{ height:36, filter:"brightness(0) invert(1)" }} />
          <div style={{ width:1, height:28, background:"rgba(255,255,255,0.2)" }} />
          <span style={{ fontFamily:"'Josefin Sans',sans-serif", fontSize:14, letterSpacing:"2px", color:"#a6d9ca", textTransform:"uppercase", fontWeight:600 }}>Group Lead Finder</span>
        </div>
        <div style={{ display:"flex", gap:4 }}>
          {["search","inventory","market"].map(t => (
            <button key={t} className="tab-btn" onClick={() => setActiveTab(t)}
              style={{ padding:"5px 14px", fontSize:10, letterSpacing:"2px", textTransform:"uppercase", borderRadius:20, fontWeight:600,
                background:activeTab===t?"#4c8898":"transparent", color:activeTab===t?"white":"#a6d9ca", border:`1px solid ${activeTab===t?"#4c8898":"rgba(166,217,202,0.3)"}` }}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "search" && (
        <div style={{ display:"grid", gridTemplateColumns:"260px 1fr", height:"calc(100vh - 61px)" }}>

          {/* SIDEBAR */}
          <div style={{ borderRight:"2px solid #e6d3b9", display:"flex", flexDirection:"column", overflow:"hidden", background:"white" }}>
            
            {/* Segments */}
            <div style={{ padding:"16px 14px", borderBottom:"1px solid #e6d3b9" }}>
              <div style={{ fontFamily:"'Josefin Sans',sans-serif", fontSize:9, letterSpacing:"3px", color:"#4c8898", textTransform:"uppercase", fontWeight:700, marginBottom:10 }}>Select Segment</div>
              <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
                {SEGMENTS.map(s => (
                  <button key={s.id} className="seg-btn" onClick={() => setActiveSegment(s.id)}
                    style={{ display:"flex", alignItems:"center", gap:8, padding:"7px 10px", borderRadius:6,
                      background:activeSegment===s.id ? s.bg : "transparent",
                      border:`1px solid ${activeSegment===s.id ? s.border : "#e6d3b9"}`,
                      fontFamily:"'Libre Franklin',sans-serif" }}>
                    <span style={{ fontSize:14 }}>{s.icon}</span>
                    <span style={{ fontSize:11, color:activeSegment===s.id ? s.color : "#666", fontWeight:activeSegment===s.id?"600":"400" }}>{s.label}</span>
                    {leads.filter(l=>l.segment===s.id).length > 0 && (
                      <span style={{ marginLeft:"auto", fontSize:8, color:"white", background:s.color, padding:"1px 6px", borderRadius:10, fontWeight:700 }}>
                        {leads.filter(l=>l.segment===s.id).length}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Search */}
            <div style={{ padding:"14px", borderBottom:"1px solid #e6d3b9" }}>
              <form onSubmit={handleSubmit}>
                <div style={{ position:"relative" }}>
                  <input value={query} onChange={e=>setQuery(e.target.value)}
                    placeholder={`Search ${seg.label}…`}
                    style={{ width:"100%", background:"#f2f2eb", border:`1px solid ${seg.border}`, borderRadius:6, padding:"8px 38px 8px 10px", fontSize:11, color:"#333", fontFamily:"'Libre Franklin',sans-serif" }} />
                  <button type="submit" disabled={isLoading||!query.trim()} className="search-btn"
                    style={{ position:"absolute", right:5, top:"50%", transform:"translateY(-50%)", background:query.trim()&&!isLoading?"#4c8898":"#e6d3b9", border:"none", borderRadius:4, width:26, height:26, cursor:query.trim()&&!isLoading?"pointer":"default", display:"flex", alignItems:"center", justifyContent:"center", transition:"background 0.15s" }}>
                    {isLoading
                      ? <div style={{ width:11, height:11, border:"2px solid white", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
                      : <svg width="11" height="11" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    }
                  </button>
                </div>
              </form>
            </div>

            {/* Quick Searches */}
            <div style={{ padding:"12px 14px", flex:1, overflow:"auto", borderBottom:"1px solid #e6d3b9" }}>
              <div style={{ fontFamily:"'Josefin Sans',sans-serif", fontSize:9, letterSpacing:"2px", color:"#4c8898", textTransform:"uppercase", fontWeight:700, marginBottom:8 }}>Quick Searches</div>
              <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
                {seg.quickSearches.map(q => (
                  <button key={q} className="quick-btn" onClick={()=>runSearch(q)} disabled={isLoading}
                    style={{ border:"1px solid #e6d3b9", borderRadius:4, padding:"6px 8px", fontSize:9, color:"#555", lineHeight:1.4 }}>
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* History */}
            {searchHistory.length > 0 && (
              <div style={{ padding:"10px 14px", maxHeight:130, overflow:"auto" }}>
                <div style={{ fontFamily:"'Josefin Sans',sans-serif", fontSize:9, letterSpacing:"2px", color:"#4c8898", textTransform:"uppercase", fontWeight:700, marginBottom:6 }}>Recent</div>
                {searchHistory.map((h,i) => (
                  <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"3px 0", borderBottom:"1px solid #f2f2eb" }}>
                    <span style={{ fontSize:9, color:"#888", maxWidth:160, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{h.segIcon} {h.query}</span>
                    <span style={{ fontSize:9, color:h.count>0?"#417682":"#ba4545", fontWeight:600, flexShrink:0 }}>{h.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* MAIN */}
          <div style={{ display:"flex", flexDirection:"column", overflow:"hidden" }}>
            {/* Leads bar */}
            <div style={{ padding:"10px 20px", borderBottom:"1px solid #e6d3b9", display:"flex", alignItems:"center", justifyContent:"space-between", background:"white" }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ fontFamily:"'Josefin Sans',sans-serif", fontSize:15, color:"#274458", fontWeight:700 }}>
                  {leads.length > 0 ? `${leads.length} Lead${leads.length!==1?"s":""}` : "Leads"}
                </span>
                {strongLeads > 0 && <span style={{ fontSize:9, color:"white", background:"#417682", padding:"2px 9px", borderRadius:10, letterSpacing:"1px", fontWeight:700, fontFamily:"'Josefin Sans',sans-serif" }}>{strongLeads} STRONG</span>}
                <div style={{ display:"flex", gap:4 }}>
                  {SEGMENTS.map(s => { const count = leads.filter(l=>l.segment===s.id).length; if (!count) return null;
                    return <span key={s.id} style={{ fontSize:8, color:s.color, background:s.bg, padding:"1px 7px", borderRadius:8, border:`1px solid ${s.border}`, fontWeight:600 }}>{s.icon} {count}</span>; }
                  )}
                </div>
              </div>
              {leads.length > 0 && <button onClick={()=>{setLeads([]);setSelectedLead(null);}} style={{ background:"none", border:"none", fontSize:9, color:"#888", cursor:"pointer", letterSpacing:"1px", fontFamily:"'Josefin Sans',sans-serif", textTransform:"uppercase" }}>Clear All</button>}
            </div>

            <div style={{ flex:1, overflow:"auto", display:"grid", gridTemplateColumns:selectedLead?"1fr 360px":"1fr" }}>
              {/* List */}
              <div style={{ overflow:"auto", padding:"16px 20px" }}>
                {error && !isLoading && <div style={{ background:"#fff5f5", border:"1px solid #e26160", borderRadius:6, padding:"10px 14px", marginBottom:12, fontSize:11, color:"#ba4545" }}>{error}</div>}
                {isLoading && (
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"80px 20px", gap:16 }}>
                    <div style={{ width:32, height:32, border:`3px solid ${seg.border}`, borderTopColor:seg.color, borderRadius:"50%", animation:"spin 1s linear infinite" }} />
                    <div style={{ textAlign:"center" }}>
                      <div style={{ fontFamily:"'Josefin Sans',sans-serif", fontSize:12, color:"#274458", letterSpacing:"1px", textTransform:"uppercase" }}>Searching for {seg.label.toLowerCase()}…</div>
                      <div style={{ fontSize:10, color:"#888", marginTop:4 }}>This may take 15–30 seconds</div>
                    </div>
                  </div>
                )}
                {!isLoading && leads.length === 0 && (
                  <div style={{ padding:"80px 20px", textAlign:"center" }}>
                    <div style={{ fontSize:40, marginBottom:12 }}>{seg.icon}</div>
                    <div style={{ fontFamily:"'Josefin Sans',sans-serif", fontSize:13, color:"#274458", marginBottom:4, letterSpacing:"1px", textTransform:"uppercase" }}>No leads yet</div>
                    <div style={{ fontSize:10, color:"#888" }}>Select a segment and run a search</div>
                  </div>
                )}
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {leads.map(lead => {
                    const sd = SEGMENT_MAP[lead.segment] || seg;
                    return (
                      <div key={lead.id} className={`lead-card ${selectedLead?.id===lead.id?"active":""}`}
                        onClick={()=>setSelectedLead(selectedLead?.id===lead.id?null:lead)}
                        style={{ background:"white", border:`1px solid #e6d3b9`, borderRadius:8, padding:"12px 14px", position:"relative" }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6 }}>
                          <div style={{ flex:1, marginRight:10 }}>
                            <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:2 }}>
                              <span style={{ fontSize:13 }}>{sd.icon}</span>
                              <span style={{ fontFamily:"'Josefin Sans',sans-serif", fontSize:12, fontWeight:700, color:"#274458", lineHeight:1.3 }}>{lead.organization}</span>
                            </div>
                            <div style={{ fontSize:10, color:"#888" }}>{lead.eventType}</div>
                          </div>
                          <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:3 }}>
                            <div style={{ background:getFitBg(lead.fitScore), border:`1px solid ${getFitColor(lead.fitScore)}`, borderRadius:12, padding:"2px 8px", fontSize:8, color:getFitColor(lead.fitScore), letterSpacing:"0.5px", whiteSpace:"nowrap", fontWeight:600, fontFamily:"'Josefin Sans',sans-serif", textTransform:"uppercase" }}>
                              {getFitLabel(lead.fitScore)} {lead.fitScore}
                            </div>
                            <button className="rm-btn" onClick={e=>{e.stopPropagation();removeLead(lead.id);}}
                              style={{ background:"none", border:"none", fontSize:10, color:"#ba4545", cursor:"pointer" }}>✕</button>
                          </div>
                        </div>
                        <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:lead.summary?6:0 }}>
                          {lead.estimatedRooms && <span style={{ fontSize:9, color:"#666" }}>🛏 {lead.estimatedRooms}</span>}
                          {lead.estimatedAttendees && <span style={{ fontSize:9, color:"#666" }}>👥 {lead.estimatedAttendees}</span>}
                          {lead.dates && <span style={{ fontSize:9, color:"#666" }}>📅 {lead.dates}</span>}
                          {lead.location && <span style={{ fontSize:9, color:"#666" }}>📍 {lead.location}</span>}
                        </div>
                        {lead.summary && <div style={{ fontSize:9, color:"#666", lineHeight:1.5, borderTop:"1px solid #f2f2eb", paddingTop:6, marginTop:4 }}>{lead.summary}</div>}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Detail */}
              {selectedLead && (() => {
                const sd = SEGMENT_MAP[selectedLead.segment] || seg;
                return (
                  <div style={{ borderLeft:"2px solid #e6d3b9", overflow:"auto", padding:"20px", background:"white" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
                      <span style={{ fontSize:22 }}>{sd.icon}</span>
                      <div>
                        <div style={{ fontFamily:"'Josefin Sans',sans-serif", fontSize:9, letterSpacing:"2px", color:sd.color, textTransform:"uppercase", fontWeight:700, marginBottom:2 }}>{sd.label}</div>
                        <div style={{ fontFamily:"'Josefin Sans',sans-serif", fontSize:15, color:"#274458", fontWeight:700, lineHeight:1.3 }}>{selectedLead.organization}</div>
                      </div>
                    </div>

                    <div style={{ display:"inline-flex", alignItems:"center", gap:7, background:getFitBg(selectedLead.fitScore), border:`1px solid ${getFitColor(selectedLead.fitScore)}`, borderRadius:20, padding:"4px 12px", marginBottom:14 }}>
                      <div style={{ width:6, height:6, borderRadius:"50%", background:getFitColor(selectedLead.fitScore) }} />
                      <span style={{ fontFamily:"'Josefin Sans',sans-serif", fontSize:9, color:getFitColor(selectedLead.fitScore), fontWeight:700, textTransform:"uppercase", letterSpacing:"0.5px" }}>{getFitLabel(selectedLead.fitScore)} — {selectedLead.fitScore}/100</span>
                    </div>

                    <div style={{ fontSize:11, color:"#666", marginBottom:14 }}>{selectedLead.eventType}</div>

                    {[["Est. Rooms",selectedLead.estimatedRooms],["Attendees",selectedLead.estimatedAttendees],["Dates / Duration",selectedLead.dates],["Location",selectedLead.location],["Contact",selectedLead.contactInfo]].filter(([,v])=>v).map(([label,value]) => (
                      <div key={label} style={{ marginBottom:10 }}>
                        <div style={{ fontFamily:"'Josefin Sans',sans-serif", fontSize:8, letterSpacing:"2px", color:"#4c8898", textTransform:"uppercase", fontWeight:700, marginBottom:2 }}>{label}</div>
                        <div style={{ fontSize:11, color:"#333" }}>{value}</div>
                      </div>
                    ))}

                    <div style={{ background:"#f0f8f9", border:"1px solid #a6d9ca", borderRadius:6, padding:"12px", marginBottom:10, marginTop:12 }}>
                      <div style={{ fontFamily:"'Josefin Sans',sans-serif", fontSize:8, letterSpacing:"2px", color:"#417682", textTransform:"uppercase", fontWeight:700, marginBottom:6 }}>Why McKinney Fits</div>
                      <div style={{ fontSize:11, color:"#444", lineHeight:1.7 }}>{selectedLead.fitReason}</div>
                    </div>

                    {selectedLead.concerns && (
                      <div style={{ background:"#fff8ee", border:"1px solid #eca950", borderRadius:6, padding:"12px", marginBottom:10 }}>
                        <div style={{ fontFamily:"'Josefin Sans',sans-serif", fontSize:8, letterSpacing:"2px", color:"#db8931", textTransform:"uppercase", fontWeight:700, marginBottom:6 }}>Watch Out</div>
                        <div style={{ fontSize:11, color:"#444", lineHeight:1.7 }}>{selectedLead.concerns}</div>
                      </div>
                    )}

                    {selectedLead.summary && (
                      <div style={{ marginBottom:12 }}>
                        <div style={{ fontFamily:"'Josefin Sans',sans-serif", fontSize:8, letterSpacing:"2px", color:"#4c8898", textTransform:"uppercase", fontWeight:700, marginBottom:4 }}>Summary</div>
                        <div style={{ fontSize:10, color:"#666", lineHeight:1.6 }}>{selectedLead.summary}</div>
                      </div>
                    )}

                    {selectedLead.sourceUrl && (
                      <a href={selectedLead.sourceUrl} target="_blank" rel="noopener noreferrer"
                        style={{ display:"inline-flex", alignItems:"center", gap:5, fontSize:10, letterSpacing:"1px", color:"#4c8898", fontWeight:600, fontFamily:"'Josefin Sans',sans-serif", textTransform:"uppercase", marginTop:8 }}>
                        View Source →
                      </a>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {activeTab === "inventory" && (
        <div style={{ padding:"24px", maxWidth:900, overflow:"auto", height:"calc(100vh - 61px)" }}>
          <div style={{ fontFamily:"'Josefin Sans',sans-serif", fontSize:22, color:"#274458", fontWeight:700, marginBottom:4, letterSpacing:"-0.5px" }}>Hotel Inventory</div>
          <div style={{ fontSize:11, color:"#666", marginBottom:24 }}>{MARKET_STATS.totalCurrentRooms.toLocaleString()} rooms · 22 properties · McKinney, Texas</div>

          <div style={{ marginBottom:24 }}>
            <div style={{ fontFamily:"'Josefin Sans',sans-serif", fontSize:10, letterSpacing:"3px", color:"#4c8898", textTransform:"uppercase", fontWeight:700, marginBottom:10 }}>Primary Event Venue</div>
            <div style={{ background:"white", border:"2px solid #a6d9ca", borderRadius:8, padding:"18px" }}>
              <div style={{ fontFamily:"'Josefin Sans',sans-serif", fontSize:16, color:"#274458", fontWeight:700, marginBottom:2 }}>{MCKINNEY_HOTELS.flagship.name}</div>
              <div style={{ fontSize:10, color:"#4c8898", marginBottom:12, fontWeight:600 }}>{MCKINNEY_HOTELS.flagship.class} · {MCKINNEY_HOTELS.flagship.brand}</div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, marginBottom:10 }}>
                {[["Rooms",MCKINNEY_HOTELS.flagship.rooms],["Total Mtg Sq Ft",MCKINNEY_HOTELS.flagship.totalMeetingSpace.toLocaleString()],["Ballroom",`${MCKINNEY_HOTELS.flagship.largestSpace.toLocaleString()} sq ft`],["Breakout Rms",MCKINNEY_HOTELS.flagship.meetingRooms]].map(([l,v])=>(
                  <div key={l} style={{ background:"#f0f8f9", borderRadius:6, padding:"10px" }}>
                    <div style={{ fontFamily:"'Josefin Sans',sans-serif", fontSize:8, color:"#4c8898", fontWeight:700, textTransform:"uppercase", letterSpacing:"1px", marginBottom:3 }}>{l}</div>
                    <div style={{ fontFamily:"'Josefin Sans',sans-serif", fontSize:18, color:"#274458", fontWeight:700 }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ display:"flex", gap:8 }}>
                {Object.entries(MCKINNEY_HOTELS.flagship.maxCapacity).map(([k,v])=>(
                  <div key={k} style={{ fontSize:10, color:"#444", background:"#f2f2eb", borderRadius:4, padding:"4px 10px" }}>
                    <span style={{ textTransform:"capitalize" }}>{k}:</span> <span style={{ fontWeight:600, color:"#274458" }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ marginBottom:20 }}>
            <div style={{ fontFamily:"'Josefin Sans',sans-serif", fontSize:10, letterSpacing:"3px", color:"#ba4545", textTransform:"uppercase", fontWeight:700, marginBottom:10 }}>🏗️ Extended Stay / Construction Housing</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
              {MCKINNEY_HOTELS.supporting.filter(h=>h.notes&&(h.notes.toLowerCase().includes("extended")||h.notes.toLowerCase().includes("kitchen")||h.notes.toLowerCase().includes("weekly"))).map(h=>(
                <div key={h.name} style={{ background:"white", border:"1px solid #e6d3b9", borderRadius:6, padding:"10px 12px", borderLeft:"3px solid #e26160" }}>
                  <div style={{ fontFamily:"'Josefin Sans',sans-serif", fontSize:11, color:"#333", fontWeight:600, marginBottom:2 }}>{h.name}</div>
                  <div style={{ fontSize:9, color:"#888", marginBottom:4 }}>{h.rooms} rooms · {h.class}</div>
                  {h.notes && <div style={{ fontSize:9, color:"#666", lineHeight:1.4 }}>{h.notes}</div>}
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom:20 }}>
            <div style={{ fontFamily:"'Josefin Sans',sans-serif", fontSize:10, letterSpacing:"3px", color:"#274458", textTransform:"uppercase", fontWeight:700, marginBottom:10 }}>All Supporting Properties</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:5 }}>
              {MCKINNEY_HOTELS.supporting.map(h=>(
                <div key={h.name} style={{ background:"white", border:"1px solid #e6d3b9", borderRadius:5, padding:"9px 12px" }}>
                  <div style={{ fontFamily:"'Josefin Sans',sans-serif", fontSize:10, color:"#333", fontWeight:600, marginBottom:2 }}>{h.name}</div>
                  <div style={{ display:"flex", gap:8, marginBottom:h.notes?3:0 }}>
                    <span style={{ fontSize:9, color:"#888" }}>{h.rooms} rooms</span>
                    {h.meetingSpace&&<span style={{ fontSize:9, color:"#888" }}>{h.meetingSpace.toLocaleString()} sq ft mtg</span>}
                    <span style={{ fontSize:9, color:"#aaa" }}>{h.class}</span>
                  </div>
                  {h.notes&&<div style={{ fontSize:8, color:"#999", lineHeight:1.4 }}>{h.notes}</div>}
                </div>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontFamily:"'Josefin Sans',sans-serif", fontSize:10, letterSpacing:"3px", color:"#db8931", textTransform:"uppercase", fontWeight:700, marginBottom:10 }}>Pipeline</div>
            {MCKINNEY_HOTELS.comingSoon.map(h=>(
              <div key={h.name} style={{ background:"white", border:"1px solid #e6d3b9", borderRadius:6, padding:"10px 14px", marginBottom:5, display:"flex", justifyContent:"space-between", alignItems:"center", borderLeft:"3px solid #eca950" }}>
                <div>
                  <div style={{ fontFamily:"'Josefin Sans',sans-serif", fontSize:11, color:"#333", fontWeight:600, marginBottom:h.notes?2:0 }}>{h.name}</div>
                  {h.notes&&<div style={{ fontSize:9, color:"#888" }}>{h.notes}</div>}
                </div>
                <div style={{ textAlign:"right", flexShrink:0, marginLeft:12 }}>
                  <div style={{ fontFamily:"'Josefin Sans',sans-serif", fontSize:9, color:"#db8931", fontWeight:700 }}>{h.status}</div>
                  <div style={{ fontSize:9, color:"#aaa" }}>{h.rooms} rooms{h.meetingSpace?` · ${h.meetingSpace.toLocaleString()} sq ft`:""}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "market" && (
        <div style={{ padding:"24px", maxWidth:660, overflow:"auto", height:"calc(100vh - 61px)" }}>
          <div style={{ fontFamily:"'Josefin Sans',sans-serif", fontSize:22, color:"#274458", fontWeight:700, marginBottom:4, letterSpacing:"-0.5px" }}>Market Data</div>
          <div style={{ fontSize:11, color:"#666", marginBottom:24 }}>McKinney CVB · STR Data through March 2026</div>

          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:20 }}>
            {[{ label:"Occupancy", value:`${MARKET_STATS.occupancyMarch2026}%`, sub:"March 2026", color:"#417682", bg:"#f0f8f9", border:"#a6d9ca" },
              { label:"Avg Daily Rate", value:`$${MARKET_STATS.adrMarch2026}`, sub:"March 2026", color:"#274458", bg:"#f0f4f7", border:"#4c8898" },
              { label:"RevPAR", value:`$${MARKET_STATS.revParMarch2026}`, sub:"March 2026", color:"#db8931", bg:"#fff8ee", border:"#eca950" },
            ].map(s=>(
              <div key={s.label} style={{ background:s.bg, border:`1px solid ${s.border}`, borderRadius:8, padding:"16px" }}>
                <div style={{ fontFamily:"'Josefin Sans',sans-serif", fontSize:8, letterSpacing:"2px", color:s.color, textTransform:"uppercase", fontWeight:700, marginBottom:6 }}>{s.label}</div>
                <div style={{ fontFamily:"'Josefin Sans',sans-serif", fontSize:26, color:s.color, fontWeight:700, marginBottom:3 }}>{s.value}</div>
                <div style={{ fontSize:9, color:"#888" }}>{s.sub}</div>
              </div>
            ))}
          </div>

          <div style={{ background:"white", border:"1px solid #e6d3b9", borderRadius:8, padding:"16px", marginBottom:14 }}>
            <div style={{ fontFamily:"'Josefin Sans',sans-serif", fontSize:10, letterSpacing:"2px", color:"#274458", textTransform:"uppercase", fontWeight:700, marginBottom:12 }}>YTD 2026 vs 2025</div>
            {[{label:"Occupancy",v26:"64.4%",v25:"66.3%",delta:"-2.8%",up:false},{label:"ADR",v26:"$98.82",v25:"$95.43",delta:"+3.6%",up:true},{label:"RevPAR",v26:"$63.67",v25:"$63.27",delta:"+0.6%",up:true},{label:"Revenue (12mo)",v26:"$48.4M",v25:"$44.1M",delta:"+9.9%",up:true},{label:"Supply Growth (12mo)",v26:"+7.5%",v25:"—",delta:"New rooms",up:true}].map(r=>(
              <div key={r.label} style={{ display:"grid", gridTemplateColumns:"1fr 70px 70px 70px", gap:6, alignItems:"center", padding:"7px 0", borderBottom:"1px solid #f2f2eb" }}>
                <span style={{ fontSize:11, color:"#444" }}>{r.label}</span>
                <span style={{ fontFamily:"'Josefin Sans',sans-serif", fontSize:11, color:"#274458", textAlign:"right", fontWeight:600 }}>{r.v26}</span>
                <span style={{ fontSize:11, color:"#aaa", textAlign:"right" }}>{r.v25}</span>
                <span style={{ fontFamily:"'Josefin Sans',sans-serif", fontSize:10, color:r.up?"#417682":"#ba4545", textAlign:"right", fontWeight:700 }}>{r.delta}</span>
              </div>
            ))}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 70px 70px 70px", gap:6, marginTop:6 }}>
              <span/><span style={{ fontFamily:"'Josefin Sans',sans-serif", fontSize:8, color:"#4c8898", textAlign:"right", fontWeight:700 }}>2026</span><span style={{ fontFamily:"'Josefin Sans',sans-serif", fontSize:8, color:"#aaa", textAlign:"right" }}>2025</span><span style={{ fontFamily:"'Josefin Sans',sans-serif", fontSize:8, color:"#888", textAlign:"right" }}>Δ</span>
            </div>
          </div>

          <div style={{ background:"#f0f8f9", border:"1px solid #a6d9ca", borderRadius:8, padding:"16px" }}>
            <div style={{ fontFamily:"'Josefin Sans',sans-serif", fontSize:10, letterSpacing:"2px", color:"#417682", textTransform:"uppercase", fontWeight:700, marginBottom:8 }}>Group Sales Opportunity</div>
            <div style={{ fontSize:11, color:"#444", lineHeight:1.8 }}>
              Supply grew 7.5% over the running 12 months as new hotels opened. With occupancy softening YTD (-2.8%), hotels are motivated on group pricing for sports teams, reunions, and project housing. ADR growing +3.6% shows rate integrity — McKinney offers real value vs. Plano/Frisco without discounting. Revenue up 9.9% running 12 months signals healthy underlying demand worth building on.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
