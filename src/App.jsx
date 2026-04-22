import React, { useState, useEffect } from "react";
import { HOUSES, STARS, JOURNEY_ORDER, ISLANDS, VOYAGE_ROADS, SEA_ROADS, TRIANGLE, BAG_ITEMS, SUN_SCENARIOS, SWELL_SCENARIOS, WIND_MAP_W, WIND_MAP_H, latLonToXY, WIND_BELTS, WIND_SCENARIO, BIRD_TYPE_META, BIRDS, BIRD_SIGHTINGS, VOYAGE_NODES, VOYAGE_WAYPOINTS, BRIDGE_CONTENT, MODULE_CONTENT, CLOUD_SIGNS, STORY_PAGES } from './data.jsx';
import { analyticsEvents } from './firebase.js';


/* ══════════════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════════════ */

const pt = (deg, r, cx = 300, cy = 300) => {
  const rad = (deg - 90) * Math.PI / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
};

const wedge = (deg, r, cx = 300, cy = 300, half = 5.625) => {
  const s = pt(deg - half, r, cx, cy), e = pt(deg + half, r, cx, cy);
  return `M${cx},${cy} L${s.x.toFixed(1)},${s.y.toFixed(1)} A${r},${r} 0 0,1 ${e.x.toFixed(1)},${e.y.toFixed(1)} Z`;
};

const dirName = a =>
  ["north","northeast","east","southeast","south","southwest","west","northwest"][Math.round(a / 45) % 8];

const FEEDBACK_URL = "https://docs.google.com/forms/d/e/1FAIpQLSekiUZKnikxFXrkO6I8txr-KKscaG3xDEST_Xj5C7tgkOrrUQ/viewform?usp=header";

/* ══════════════════════════════════════════════════════════════
   ERROR BOUNDARY
   Catches any render crash and shows a readable screen instead
   of a blank page. Must be a class component — hooks can't do this.
══════════════════════════════════════════════════════════════ */


class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    if (import.meta?.env?.DEV) {
      console.error("[Ocean Adventure crash]", error, info?.componentStack);
    }
    this.setState({ info });
    try { analyticsEvents.appCrashed(error?.message); } catch { /* ignore */ }
  }

  handleReset() {
    // Clear saved state and reload — gives the user a way out
    try {
      localStorage.removeItem("pvs_haumana");
      localStorage.removeItem("pvs_bag");
      localStorage.removeItem("pvs_bag_intro");
    } catch { /* ignore */ }
    window.location.reload();
  }

  render() {
    if (!this.state.error) return this.props.children;

    const msg = this.state.error?.message || "Unknown error";
    const stack = this.state.info?.componentStack || "";
    const firstLine = stack.split("\n").filter(Boolean)[0] || "";

    return (
      <div style={{
        width:"100%", height:"100%", background:"#04080E",
        display:"flex", alignItems:"center", justifyContent:"center",
        fontFamily:"Georgia,serif", padding:"40px", boxSizing:"border-box",
      }}>
        <div style={{ maxWidth:"540px", width:"100%", display:"flex", flexDirection:"column", gap:"24px" }}>
          <div style={{ fontFamily:"Cinzel,serif", fontSize:"11px", color:"#C8941A", letterSpacing:"0.2em" }}>
            OCEAN ADVENTURE · SYSTEM
          </div>
          <div style={{ fontFamily:"Cinzel,serif", fontSize:"28px", fontWeight:"700", color:"#E8D8A8", lineHeight:"1.2" }}>
            Something went wrong.
          </div>
          <div style={{ fontFamily:"Georgia,serif", fontSize:"14px", color:"#7AACBE", lineHeight:"1.75", fontStyle:"italic" }}>
            "Even the best navigator runs into unexpected weather. Your progress is saved — let us get you back on course."
          </div>
          <div style={{ background:"rgba(255,60,30,0.06)", border:"1px solid rgba(255,60,30,0.2)", borderRadius:"6px", padding:"14px 16px" }}>
            <div style={{ fontFamily:"Cinzel,serif", fontSize:"10px", color:"#FF6644", letterSpacing:"0.12em", marginBottom:"6px" }}>
              ERROR DETAIL
            </div>
            <div style={{ fontFamily:"monospace", fontSize:"12px", color:"#FF9977", lineHeight:"1.5", wordBreak:"break-word" }}>
              {msg}
            </div>
            {firstLine && (
              <div style={{ fontFamily:"monospace", fontSize:"11px", color:"#884433", marginTop:"6px", lineHeight:"1.4" }}>
                {firstLine.trim()}
              </div>
            )}
          </div>
          <div style={{ display:"flex", gap:"12px" }}>
            <button
              onClick={() => this.handleReset()}
              style={{
                flex:1, padding:"14px", borderRadius:"6px", cursor:"pointer",
                fontFamily:"Cinzel,serif", fontSize:"11px", fontWeight:"700",
                letterSpacing:"0.12em", border:"1px solid #C8941A",
                background:"rgba(200,148,26,0.14)", color:"#C8941A",
              }}>
              RESTART VOYAGE →
            </button>
            <button
              onClick={() => this.setState({ error: null, info: null })}
              style={{
                flex:1, padding:"14px", borderRadius:"6px", cursor:"pointer",
                fontFamily:"Cinzel,serif", fontSize:"11px", fontWeight:"700",
                letterSpacing:"0.12em", border:"1px solid #1A3050",
                background:"none", color:"#3A6070",
              }}>
              TRY AGAIN
            </button>
          </div>
          <div style={{ fontFamily:"Cinzel,serif", fontSize:"9px", color:"#1A2A40", letterSpacing:"0.1em", textAlign:"center" }}>
            If this keeps happening, please share the error detail above with the development team.
          </div>
        </div>
      </div>
    );
  }
}



/* ══════════════════════════════════════════════════════════════
   SĀMOA CROSSING — brief sea voyage between activity and arrival
══════════════════════════════════════════════════════════════ */

function SamoaCrossing({ name, onArrive }) {
  const [lineIdx, setLineIdx] = useState(0);
  const [arrived, setArrived] = useState(false);

  const lines = [
    "Keep Mānaiakalani on your starboard bow. Hold the heading.",
    "Good. Three nights now — the stars have not failed us once.",
    `You have done this, ${name}. I was here, but you were the one navigating.`,
    "Look ahead. Do you see the change in the clouds? Land.",
  ];

  const isLast = lineIdx === lines.length - 1;

  const handleClick = () => {
    if (arrived) return;
    if (!isLast) {
      setLineIdx(i => i + 1);
    } else {
      setArrived(true);
      setTimeout(onArrive, 900);
    }
  };

  // Animated stars
  const stars = Array.from({length:80},(_,i)=>({
    x: ((i*137+17)%99)/99*100,
    y: ((i*83+11)%97)/97*80,
    r: i%9===0?1.6:i%4===0?1.0:0.5,
    op: 0.2 + (i%7)*0.1,
  }));

  // Canoe position drifts slightly per line
  const canoeX = 50 + lineIdx * 3;
  const canoeY = 68 + Math.sin(lineIdx * 0.8) * 1.5;

  return (
    <div
      onClick={handleClick}
      style={{ width:"100%", height:"100%", background:"#030810", display:"flex", flexDirection:"column", overflow:"hidden", cursor:"pointer", userSelect:"none" }}
    >
      {/* Header */}
      <div style={{ height:"44px", borderBottom:"1px solid #0A1828", background:"rgba(3,8,16,0.97)", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 28px", flexShrink:0 }}>
        <span style={{ fontFamily:"Cinzel,serif", fontSize:"12px", fontWeight:"700", color:"#C8941A", letterSpacing:"0.12em" }}>OCEAN ADVENTURE</span>
        <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
          <span style={{ fontFamily:"Cinzel,serif", fontSize:"10px", color:"#1A3050", letterSpacing:"0.18em" }}>TONGA → SĀMOA · NIGHT {lineIdx + 1}</span>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); analyticsEvents.feedbackOpened(); window.open(FEEDBACK_URL, "_blank", "noopener,noreferrer"); }}
            style={{ background:"none", border:"1px solid #0A2A3A", borderRadius:"5px", padding:"5px 10px", cursor:"pointer", fontFamily:"Cinzel,serif", fontSize:"9px", color:"#1A6070", letterSpacing:"0.08em" }}
          >
            ✦ FEEDBACK
          </button>
        </div>
      </div>

      {/* Ocean scene */}
      <div style={{ flex:1, position:"relative", overflow:"hidden" }}>
        <svg width="100%" height="100%" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" style={{ position:"absolute", inset:0 }}>
          <defs>
            <radialGradient id="crossSky" cx="50%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#060E24"/>
              <stop offset="100%" stopColor="#020810"/>
            </radialGradient>
            <linearGradient id="crossOcean" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#040C1C"/>
              <stop offset="100%" stopColor="#020810"/>
            </linearGradient>
          </defs>

          {/* Sky */}
          <rect width="800" height="340" fill="url(#crossSky)"/>
          {/* Ocean */}
          <rect y="340" width="800" height="160" fill="url(#crossOcean)"/>
          {/* Horizon */}
          <line x1="0" y1="340" x2="800" y2="340" stroke="#0A2040" strokeWidth="1"/>

          {/* Stars */}
          {stars.map((s,i)=>(
            <circle key={i} cx={`${s.x}%`} cy={`${s.y}%`} r={s.r} fill="#B8D0E8" opacity={s.op}/>
          ))}

          {/* Mānaiakalani — guide star, glowing */}
          <circle cx="195" cy="82" r="16" fill="#C0E8FF" opacity="0.08"/>
          <circle cx="195" cy="82" r="8" fill="#C0E8FF" opacity="0.9"/>
          <text x="215" y="78" fill="#C0E8FF" fontSize="11" fontFamily="Cinzel,serif" opacity="0.8">Mānaiakalani</text>
          {/* Dotted line from star toward horizon */}
          <line x1="195" y1="90" x2="195" y2="338" stroke="#C0E8FF" strokeWidth="0.8" strokeDasharray="3,10" opacity="0.18"/>

          {/* Ocean swells */}
          {[0,1,2,3,4].map(i=>(
            <path key={i}
              d={`M${-50+i*220},${360+i*18} Q${70+i*220},${354+i*18} ${170+i*220},${360+i*18} Q${260+i*220},${366+i*18} ${350+i*220},${360+i*18}`}
              fill="none" stroke="#0A2840" strokeWidth="1.2" opacity="0.6"/>
          ))}

          {/* Moon reflection on water */}
          <ellipse cx="400" cy="360" rx="80" ry="8" fill="#0A1830" opacity="0.5"/>
          <ellipse cx="400" cy="360" rx="20" ry="3" fill="#1A3050" opacity="0.4"/>

          {/* Waka — centre frame, subtle movement */}
          <g transform={`translate(${canoeX * 8 - 200}, ${canoeY * 5 - 290})`}>
            {/* Hull */}
            <path d="M320,345 Q400,332 480,345 L474,354 Q400,345 326,354Z"
              fill="#0A1818" stroke="#1A3828" strokeWidth="1.5"/>
            {/* Mast */}
            <line x1="400" y1="345" x2="400" y2="302" stroke="#1A3020" strokeWidth="2"/>
            {/* Sail */}
            <path d="M400,305 Q422,316 418,340 L400,340Z"
              fill="#1A2E20" stroke="#2A4030" strokeWidth="1" opacity="0.7"/>
            {/* Outrigger */}
            <line x1="330" y1="350" x2="295" y2="360" stroke="#1A3020" strokeWidth="1.5"/>
            <path d="M280,359 Q295,355 310,359 L308,364 Q295,360 282,364Z"
              fill="#0A1818" stroke="#1A3020" strokeWidth="1"/>
          </g>

          {/* "Land" cloud hint on last line */}
          {isLast && (
            <g>
              <ellipse cx="600" cy="295" rx="55" ry="20" fill="#0E1E10" opacity="0.7"/>
              <ellipse cx="580" cy="305" rx="40" ry="16" fill="#0C1C0E" opacity="0.65"/>
              <ellipse cx="620" cy="300" rx="45" ry="18" fill="#0C1C0E" opacity="0.65"/>
              <text x="600" y="328" textAnchor="middle" fill="#C8941A" fontSize="10" fontFamily="Cinzel,serif" opacity="0.7">stationary cloud</text>
            </g>
          )}

          {/* Arrived fade */}
          {arrived && (
            <rect width="800" height="500" fill="#F0E8C0" opacity="0.15" style={{ transition:"opacity 0.9s" }}/>
          )}
        </svg>

        {/* Palu speech — HTML overlay for wrapping */}
        <div style={{ position:"absolute", bottom:0, left:0, right:0, background:"rgba(2,6,14,0.9)", borderTop:"1px solid #0A1828", padding:"20px 160px 16px 32px" }}>
          <div style={{ fontFamily:"Georgia,serif", fontSize:"17px", color:"#A8C8A0", lineHeight:"1.8", fontStyle:"italic", marginBottom:"10px" }}>
            "{lines[lineIdx]}"
          </div>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <span style={{ fontFamily:"Cinzel,serif", fontSize:"9px", color:"#C8941A", letterSpacing:"0.08em" }}>— PALU HEMI</span>
            <div style={{ display:"flex", alignItems:"center", gap:"10px", paddingRight:"20px" }}>
              <div style={{ display:"flex", gap:"6px" }}>
                {lines.map((_,i) => (
                  <div key={i} style={{ width:i===lineIdx?14:7, height:7, borderRadius:4, background:i<=lineIdx?"#C8941A":"#0A1828", transition:"all 0.25s" }}/>
                ))}
              </div>
              <span style={{ fontFamily:"Cinzel,serif", fontSize:"12px", fontWeight:"700", color:"#FFD060", opacity:0.9, letterSpacing:"0.06em" }}>
                {isLast ? "click to arrive →" : "click to continue →"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



function SamoaArrivalScreen({ onReturn, onUnlock }) {
  // Phase flow: palu → (click each line) → palm → greeter → dialogue → exchange → story → farewell
  const [phase,       setPhase]      = useState("palu");
  const [lineIdx,     setLineIdx]    = useState(0);   // which Palu line is visible
  const [palmHov,     setPalmHov]    = useState(false);
  const [greeterHov,  setGreeterHov] = useState(false);
  const [palmClicked, setPalmClicked]= useState(false);
  const [shared,      setShared]     = useState(false);
  const [declined,    setDeclined]   = useState(false);
  const [storyVis,    setStoryVis]   = useState(false);
  const [showFarewell,setShowFarewell]=useState(false);

  const SPEAKER = {
    palu:      "palu",
    palm:      "palu",
    greeter:   null,
    dialogue:  "tautai",
    shared:    "tautai",
    declined:  null,
    farewell:  "palu",
  };

  const accent = "#C8941A";
  const b = BRIDGE_CONTENT[1];
  const samoanStarMap = BAG_ITEMS.find(i => i.id === "samoan_star_map");

  // Click to advance through Palu lines — no auto-advance
  const handlePaluClick = () => {
    if (phase !== "palu") return;
    if (lineIdx < b.paluLines.length - 1) {
      setLineIdx(i => i + 1);
    } else {
      // All lines shown — move to palm phase
      setPhase("palm");
    }
  };

  const handlePalmClick = () => {
    if (phase !== "palm") return;
    setPalmClicked(true);
    setTimeout(() => setPhase("greeter"), 1200);
  };

  const handleGreeterClick = () => {
    if (phase !== "greeter") return;
    setPhase("dialogue");
  };

  const handleShare = () => {
    setShared(true);
    setPhase("exchange");
    onUnlock("samoan_star_map"); onUnlock("wayfarers_notebook");
    setTimeout(() => setStoryVis(true), 800);
  };

  const handleDecline = () => {
    setDeclined(true);
    setPhase("declined");
  };

  const handleOkAfterStory = () => {
    setShowFarewell(true);
    setPhase("farewell");
  };

  const handleDeclinedOk = () => {
    setShowFarewell(true);
    setPhase("farewell");
  };

  const W = 760, H = 400;
  const palmX = 160, palmY = 340;
  const greeterX = 560, greeterY = 310;

  const canClickPalm    = phase === "palm";
  const canClickGreeter = phase === "greeter";

  return (
    <div style={{ width:"100%", height:"100%", background:"#08100A", display:"flex", flexDirection:"column", overflow:"hidden" }}>

      {/* Header */}
      <div style={{ height:"44px", borderBottom:`1px solid ${accent}33`, background:"rgba(8,16,10,0.97)", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 28px", flexShrink:0 }}>
        <span style={{ fontFamily:"Cinzel,serif", fontSize:"12px", fontWeight:"700", color:"#C8941A", letterSpacing:"0.12em" }}>OCEAN ADVENTURE</span>
        <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
          <div style={{ fontFamily:"Cinzel,serif", fontSize:"10px", color:`${accent}88`, letterSpacing:"0.18em" }}>ARRIVED · SĀMOA</div>
          <button
            onClick={() => { analyticsEvents.feedbackOpened(); window.open(FEEDBACK_URL, "_blank", "noopener,noreferrer"); }}
            style={{ background:"none", border:"1px solid #0A2A3A", borderRadius:"5px", padding:"5px 10px", cursor:"pointer", fontFamily:"Cinzel,serif", fontSize:"9px", color:"#1A6070", letterSpacing:"0.08em" }}
          >
            ✦ FEEDBACK
          </button>
        </div>
      </div>

      {/* Scene */}
      <div style={{ flex:1, position:"relative", overflow:"hidden" }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          style={{ width:"100%", height:"100%", display:"block" }}
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <linearGradient id="samoaSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0D1E18"/>
              <stop offset="55%" stopColor="#1A3428"/>
              <stop offset="100%" stopColor="#2A4830"/>
            </linearGradient>
            <linearGradient id="samoaMtn" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1A3020"/>
              <stop offset="100%" stopColor="#0E2016"/>
            </linearGradient>
            <linearGradient id="samoaSand" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5A4A22"/>
              <stop offset="100%" stopColor="#3E3010"/>
            </linearGradient>
            <filter id="samoaGlow">
              <feGaussianBlur stdDeviation="5" result="b"/>
              <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>

          {/* Sky — looking inland toward mountain */}
          <rect width={W} height={H} fill="url(#samoaSky)"/>

          {/* Stars */}
          {[[60,30,1.1],[150,18,0.8],[280,24,1.3],[420,14,0.9],[540,28,1.0],[680,20,1.2],[350,42,0.7],[490,50,0.8],[100,50,0.6]].map(([x,y,r],i)=>(
            <circle key={i} cx={x} cy={y} r={r} fill="#C8D8E8" opacity="0.55"/>
          ))}

          {/* Jungle tree line — mid-distance */}
          <path d="M0,170 Q40,130 80,150 Q120,110 170,140 Q220,100 280,130 Q340,95 400,125 Q460,90 520,118 Q580,95 640,115 Q700,100 760,120 L760,210 L0,210Z"
            fill="#122010" opacity="0.9"/>
          <path d="M0,195 Q60,165 120,180 Q190,155 260,172 Q330,148 400,168 Q470,142 550,160 Q620,138 690,155 Q730,145 760,150 L760,230 L0,230Z"
            fill="#0E1C0E" opacity="0.95"/>

          {/* Mountain ridgeline — large, fills upper half */}
          <path d="M-10,280 Q80,140 180,200 Q260,80 340,160 Q420,60 500,150 Q580,90 660,170 Q720,120 770,180 L770,400 L-10,400Z"
            fill="url(#samoaMtn)" opacity="0.85"/>

          {/* Sandy foreground — ground we're standing on */}
          <path d="M0,330 Q190,310 380,318 Q570,325 760,312 L760,400 L0,400Z"
            fill="url(#samoaSand)"/>
          {/* Sand texture */}
          {[0,1,2,3].map(i=>(
            <path key={i}
              d={`M${i*200},${345+i*8} Q${i*200+100},${341+i*8} ${i*200+200},${345+i*8}`}
              fill="none" stroke="#6A5828" strokeWidth="0.7" opacity="0.35"/>
          ))}

          {/* Torchlight glow — warm light source centre-right, sets the evening mood */}
          <circle cx="480" cy="280" r="80" fill="#C8681A" opacity="0.07"/>
          <circle cx="480" cy="290" r="40" fill="#C8941A" opacity="0.06"/>

          {/* ── PALM TREE ── */}
          <path d={`M${palmX},${palmY} Q${palmX-14},${palmY-70} ${palmX+10},${palmY-140}`}
            stroke="#3A2A10" strokeWidth="16" fill="none" strokeLinecap="round"/>
          {/* Fronds */}
          {[[-45,-25],[-22,-48],[4,-52],[30,-44],[46,-30],[34,-14],[-6,-10],[-28,-18]].map(([dx,dy],i)=>(
            <path key={i}
              d={`M${palmX+10},${palmY-140} Q${palmX+10+dx*0.55},${palmY-140+dy*0.5} ${palmX+10+dx},${palmY-140+dy}`}
              stroke="#2A5020" strokeWidth={i%2===0?6:3.5} fill="none" strokeLinecap="round"/>
          ))}
          {/* Coconuts */}
          {[[2,-126],[16,-132],[-5,-130]].map(([dx,dy],i)=>(
            <circle key={i} cx={palmX+10+dx} cy={palmY+dy} r="6" fill="#3A2A08"/>
          ))}
          {/* Click ring */}
          {canClickPalm && (
            <circle cx={palmX} cy={palmY-80} r={palmHov?58:44}
              fill="none" stroke="#C8941A" strokeWidth="1.8"
              opacity={palmHov?0.7:0.35} style={{ transition:"all 0.3s" }}/>
          )}
          {canClickPalm && (
            <rect x={palmX-55} y={palmY-160} width="120" height="180"
              fill="transparent" style={{ cursor:"pointer" }}
              onMouseEnter={()=>setPalmHov(true)}
              onMouseLeave={()=>setPalmHov(false)}
              onClick={handlePalmClick}/>
          )}
          {canClickPalm && palmHov && (
            <g>
              <rect x={palmX-52} y={palmY-186} width="104" height="22" rx="4" fill="#05100A" stroke="#C8941A55"/>
              <text x={palmX} y={palmY-171} textAnchor="middle" fill="#C8941A" fontSize="10" fontFamily="Cinzel,serif">look around</text>
            </g>
          )}

          {/* Palm-clicked bubble */}
          {palmClicked && (
            <g>
              <rect x={palmX-8} y={palmY-236} width="210" height="82" rx="8"
                fill="#05100A" stroke="#C8941A55" strokeWidth="1.5"/>
              <path d={`M${palmX+22},${palmY-154} L${palmX+32},${palmY-142} L${palmX+44},${palmY-154}`}
                fill="#05100A" stroke="#C8941A55" strokeWidth="1.5"/>
              <text x={palmX+97} y={palmY-214} textAnchor="middle" fill="#A8C8A0" fontSize="10.5" fontFamily="Georgia,serif" fontStyle="italic">Let's rest our eyes for a minute</text>
              <text x={palmX+97} y={palmY-198} textAnchor="middle" fill="#A8C8A0" fontSize="10.5" fontFamily="Georgia,serif" fontStyle="italic">under this tree. Maybe someone</text>
              <text x={palmX+97} y={palmY-182} textAnchor="middle" fill="#A8C8A0" fontSize="10.5" fontFamily="Georgia,serif" fontStyle="italic">will find us here.</text>
              <text x={palmX+97} y={palmY-166} textAnchor="middle" fill="#C8941A" fontSize="8" fontFamily="Cinzel,serif" letterSpacing="0.06em">— PALU HEMI</text>
            </g>
          )}

          {/* ── SAMOAN GREETER — only visible from greeter phase on ── */}
          {phase !== "palu" && phase !== "palm" && (
            <g>
              {/* Body */}
              <ellipse cx={greeterX} cy={greeterY+10} rx="24" ry="30" fill="#7A5838"/>
              {/* Wrap clothing */}
              <path d={`M${greeterX-24},${greeterY+4} Q${greeterX},${greeterY-10} ${greeterX+24},${greeterY+4}`}
                fill="#3A6848" opacity="0.9"/>
              {/* Head */}
              <circle cx={greeterX} cy={greeterY-28} r="20" fill="#8A6040"/>
              {/* Hair */}
              <path d={`M${greeterX-18},${greeterY-42} Q${greeterX},${greeterY-56} ${greeterX+18},${greeterY-42}`}
                fill="#1A1008" opacity="0.95"/>
              {/* Eyes */}
              <ellipse cx={greeterX-7} cy={greeterY-28} rx="2.8" ry="2.8" fill="#1A0E06"/>
              <ellipse cx={greeterX+7} cy={greeterY-28} rx="2.8" ry="2.8" fill="#1A0E06"/>
              {/* Smile */}
              <path d={`M${greeterX-8},${greeterY-18} Q${greeterX},${greeterY-12} ${greeterX+8},${greeterY-18}`}
                stroke="#5A3010" strokeWidth="2" fill="none" strokeLinecap="round"/>
              {/* Arms raised in greeting */}
              <path d={`M${greeterX-24},${greeterY} Q${greeterX-42},${greeterY-26} ${greeterX-36},${greeterY-40}`}
                stroke="#8A6040" strokeWidth="8" fill="none" strokeLinecap="round"/>
              <path d={`M${greeterX+24},${greeterY} Q${greeterX+42},${greeterY-26} ${greeterX+36},${greeterY-40}`}
                stroke="#8A6040" strokeWidth="8" fill="none" strokeLinecap="round"/>
              {/* Legs */}
              <rect x={greeterX-11} y={greeterY+32} width="10" height="24" rx="5" fill="#7A5838"/>
              <rect x={greeterX+2} y={greeterY+32} width="10" height="24" rx="5" fill="#7A5838"/>
              {/* Gold necklace */}
              <path d={`M${greeterX-16},${greeterY-10} Q${greeterX},${greeterY-4} ${greeterX+16},${greeterY-10}`}
                stroke="#C8941A" strokeWidth="2.5" fill="none" opacity="0.85"/>
              {/* Glow ring when clickable */}
              {canClickGreeter && (
                <circle cx={greeterX} cy={greeterY-12} r={greeterHov?52:40}
                  fill="none" stroke="#C8941A" strokeWidth="2"
                  opacity={greeterHov?0.75:0.35} style={{ transition:"all 0.3s" }}/>
              )}
            </g>
          )}

          {/* Greeter click target */}
          {canClickGreeter && (
            <rect x={greeterX-50} y={greeterY-60} width="100" height="130"
              fill="transparent" style={{ cursor:"pointer" }}
              onMouseEnter={()=>setGreeterHov(true)}
              onMouseLeave={()=>setGreeterHov(false)}
              onClick={handleGreeterClick}/>
          )}
          {canClickGreeter && greeterHov && (
            <g>
              <rect x={greeterX-60} y={greeterY-88} width="120" height="22" rx="4" fill="#05100A" stroke="#C8941A44"/>
              <text x={greeterX} y={greeterY-73} textAnchor="middle" fill="#C8941A" fontSize="10" fontFamily="Cinzel,serif">say hello</text>
            </g>
          )}

          {/* Palu lines moved to HTML overlay below for proper text wrapping */}

          {/* Exchange speech bubble over greeter */}
          {shared && !storyVis && (
            <g>
              <rect x={greeterX-140} y={greeterY-176} width="280" height="116" rx="8"
                fill="#05100A" stroke="#C8941A77" strokeWidth="1.5"/>
              <path d={`M${greeterX-10},${greeterY-62} L${greeterX},${greeterY-50} L${greeterX+10},${greeterY-62}`}
                fill="#05100A" stroke="#C8941A77" strokeWidth="1.5"/>
              <text x={greeterX} y={greeterY-128} textAnchor="middle" fill="#C8941A" fontSize="9" fontFamily="Cinzel,serif" letterSpacing="0.1em">TAUTAI FALEOLO</text>
              <text x={greeterX} y={greeterY-138} textAnchor="middle" fill="#A8C8A0" fontSize="11" fontFamily="Georgia,serif" fontStyle="italic">"These seeds will feed many families.</text>
              <text x={greeterX} y={greeterY-122} textAnchor="middle" fill="#A8C8A0" fontSize="11" fontFamily="Georgia,serif" fontStyle="italic">Take our star map." She leans closer.</text>
              <text x={greeterX} y={greeterY-106} textAnchor="middle" fill="#C8941A" fontSize="11" fontFamily="Georgia,serif" fontStyle="italic">"And write this down: Tahiti —</text>
              <text x={greeterX} y={greeterY-90} textAnchor="middle" fill="#C8941A" fontSize="11" fontFamily="Georgia,serif" fontStyle="italic">three hand-widths below the zenith."</text>
              <text x={greeterX} y={greeterY-68} textAnchor="middle" fill="#2AB870" fontSize="11" fontFamily="Cinzel,serif" fontWeight="700">✦ Star Map + Notebook received</text>
            </g>
          )}

          {/* Declined speech bubble */}
          {declined && (
            <g>
              <rect x={greeterX-120} y={greeterY-130} width="240" height="66" rx="8"
                fill="#05100A" stroke="#C8941A33" strokeWidth="1.2"/>
              <path d={`M${greeterX-10},${greeterY-64} L${greeterX},${greeterY-52} L${greeterX+10},${greeterY-64}`}
                fill="#05100A" stroke="#C8941A33" strokeWidth="1.2"/>
              <text x={greeterX} y={greeterY-108} textAnchor="middle" fill="#A8C8A0" fontSize="11" fontFamily="Georgia,serif" fontStyle="italic">"Come back when you are ready.</text>
              <text x={greeterX} y={greeterY-92} textAnchor="middle" fill="#A8C8A0" fontSize="11" fontFamily="Georgia,serif" fontStyle="italic">We will be here."</text>
              <text x={greeterX} y={greeterY-72} textAnchor="middle" fill="#C8941A" fontSize="9" fontFamily="Cinzel,serif" letterSpacing="0.06em">TAUTAI FALEOLO</text>
            </g>
          )}

        </svg>

        {/* ── PALU ARRIVAL LINES — HTML overlay for proper text wrapping ── */}
        {phase === "palu" && (
          <div
            onClick={handlePaluClick}
            style={{ position:"absolute", bottom:0, left:0, right:0, background:"rgba(3,10,6,0.88)", borderTop:`1px solid ${accent}22`, padding:"18px 28px 14px", cursor:"pointer", userSelect:"none" }}
          >
            <div style={{ fontFamily:"Georgia,serif", fontSize:"16px", color:"#A8C8A0", lineHeight:"1.75", fontStyle:"italic", marginBottom:"8px" }}>
              {`"${b.paluLines[lineIdx]}"`}
            </div>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <span style={{ fontFamily:"Cinzel,serif", fontSize:"9px", color:accent, letterSpacing:"0.08em" }}>— PALU HEMI</span>
              <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                <div style={{ display:"flex", gap:"6px" }}>
                  {b.paluLines.map((_,i) => (
                    <div key={i} style={{ width:i===lineIdx?14:7, height:7, borderRadius:4, background:i<=lineIdx?accent:"#2A4030", transition:"all 0.25s" }}/>
                  ))}
                </div>
                <span style={{ fontFamily:"Cinzel,serif", fontSize:"9px", color:accent, opacity:0.6, letterSpacing:"0.06em" }}>
                  {lineIdx < b.paluLines.length - 1 ? "click to continue →" : "click to look around →"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ── DIALOGUE PANEL — greeter clicked ── */}
        {phase === "dialogue" && (
          <div style={{ position:"absolute", bottom:0, left:0, right:0, background:"rgba(4,12,6,0.97)", borderTop:`1px solid ${accent}44`, padding:"22px 28px", display:"flex", flexDirection:"column", gap:"16px" }}>
            <div style={{ fontFamily:"Cinzel,serif", fontSize:"10px", color:accent, letterSpacing:"0.18em", opacity:0.7 }}>TAUTAI FALEOLO · SAMOAN WAYFINDER</div>
            <div style={{ fontFamily:"Georgia,serif", fontSize:"16px", color:"#A8C8A0", lineHeight:"1.7", fontStyle:"italic" }}>
              "Visitors from Tonga! We heard the stories of your crossing — three nights on the open ocean. You carry the star compass in your mind now. What have you brought us from the islands?"
            </div>
            <div style={{ fontFamily:"Georgia,serif", fontSize:"13px", color:"#8AA898", lineHeight:"1.65", fontStyle:"italic", borderLeft:`2px solid ${accent}33`, paddingLeft:"12px" }}>
              Palu leans toward you quietly: "If they offer anything — a star map, a word of advice — write it down. The spoken knowledge is worth more than the map itself."
            </div>
            <div style={{ display:"flex", gap:"14px" }}>
              <button onClick={handleShare} style={{ flex:1, padding:"14px 18px", borderRadius:"6px", cursor:"pointer", fontFamily:"Cinzel,serif", fontSize:"12px", fontWeight:"700", letterSpacing:"0.1em", border:`1px solid ${accent}`, background:`rgba(200,148,26,0.14)`, color:accent }}>
                Share the sweet potato cuttings →
              </button>
              <button onClick={handleDecline} style={{ flex:1, padding:"14px 18px", borderRadius:"6px", cursor:"pointer", fontFamily:"Cinzel,serif", fontSize:"12px", fontWeight:"600", letterSpacing:"0.08em", border:"1px solid #2A4830", background:"rgba(255,255,255,0.03)", color:"#5A8060" }}>
                Not yet
              </button>
            </div>
          </div>
        )}

        {/* ── STORY PANEL — after exchange ── */}
        {storyVis && (
          <div style={{ position:"absolute", bottom:0, left:0, right:0, background:"rgba(4,12,6,0.97)", borderTop:`1px solid ${accent}44`, padding:"22px 28px 20px", display:"flex", flexDirection:"column", gap:"16px" }}>
            <div style={{ display:"flex", gap:"28px", alignItems:"flex-start" }}>
              {/* Story */}
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:"Cinzel,serif", fontSize:"9px", color:accent, letterSpacing:"0.2em", marginBottom:"8px", opacity:0.7 }}>NAVIGATOR'S KNOWLEDGE</div>
                <div style={{ fontFamily:"Cinzel,serif", fontSize:"15px", fontWeight:"700", color:"#E8D8A8", marginBottom:"10px" }}>{b.storyTitle}</div>
                <div style={{ fontFamily:"Georgia,serif", fontSize:"13px", color:"#7AACBE", lineHeight:"1.8", fontStyle:"italic", borderLeft:`2px solid ${accent}44`, paddingLeft:"14px" }}>
                  {b.story}
                </div>
                <div style={{ fontFamily:"Cinzel,serif", fontSize:"8.5px", color:`${accent}55`, letterSpacing:"0.1em", marginTop:"8px" }}>— {b.storyCitation}</div>
              </div>
              {/* Bag item + OK */}
              <div style={{ width:"220px", flexShrink:0, display:"flex", flexDirection:"column", gap:"12px" }}>
                <div style={{ fontFamily:"Cinzel,serif", fontSize:"9px", color:accent, letterSpacing:"0.2em", opacity:0.7 }}>ADDED TO YOUR BAG</div>
                {samoanStarMap && (
                  <div style={{ display:"flex", alignItems:"center", gap:"12px", padding:"12px 14px", background:`${samoanStarMap.color}10`, border:`1px solid ${samoanStarMap.color}33`, borderRadius:"8px" }}>
                    <span style={{ fontSize:"24px" }}>{samoanStarMap.icon}</span>
                    <div>
                      <div style={{ fontFamily:"Cinzel,serif", fontSize:"13px", fontWeight:"700", color:"#D0C8A8" }}>{samoanStarMap.name}</div>
                      <div style={{ fontFamily:"Cinzel,serif", fontSize:"9px", color:`${samoanStarMap.color}99`, letterSpacing:"0.06em", marginTop:"2px" }}>{samoanStarMap.hawaiian}</div>
                    </div>
                  </div>
                )}
                {(() => { const nb = BAG_ITEMS.find(i => i.id === "wayfarers_notebook"); return nb ? (
                  <div style={{ display:"flex", alignItems:"center", gap:"12px", padding:"12px 14px", background:`${nb.color}10`, border:`1px solid ${nb.color}33`, borderRadius:"8px" }}>
                    <span style={{ fontSize:"24px" }}>{nb.icon}</span>
                    <div>
                      <div style={{ fontFamily:"Cinzel,serif", fontSize:"13px", fontWeight:"700", color:"#D0C8A8" }}>{nb.name}</div>
                      <div style={{ fontFamily:"Cinzel,serif", fontSize:"9px", color:`${nb.color}99`, letterSpacing:"0.06em", marginTop:"2px" }}>{nb.hawaiian}</div>
                      <div style={{ fontFamily:"Georgia,serif", fontSize:"11px", color:"#7A8070", marginTop:"4px", fontStyle:"italic" }}>Spoken knowledge from every island</div>
                    </div>
                  </div>
                ) : null; })()}
                <button onClick={handleOkAfterStory} style={{ padding:"12px", borderRadius:"6px", cursor:"pointer", fontFamily:"Cinzel,serif", fontSize:"11px", fontWeight:"700", letterSpacing:"0.12em", border:`1px solid ${accent}`, background:`rgba(200,148,26,0.14)`, color:accent }}>
                  OK →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── DECLINED OK BUTTON ── */}
        {phase === "declined" && (
          <div style={{ position:"absolute", bottom:0, left:0, right:0, background:"rgba(4,12,6,0.97)", borderTop:`1px solid ${accent}22`, padding:"20px 28px", display:"flex", justifyContent:"flex-end" }}>
            <button onClick={handleDeclinedOk} style={{ padding:"12px 24px", borderRadius:"6px", cursor:"pointer", fontFamily:"Cinzel,serif", fontSize:"11px", fontWeight:"700", letterSpacing:"0.12em", border:"1px solid #2A4830", background:"none", color:"#5A8060" }}>
              OK →
            </button>
          </div>
        )}

        {/* ── FAREWELL OVERLAY — after OK clicked ── */}
        {showFarewell && (
          <div style={{ position:"absolute", inset:0, background:"rgba(4,12,6,0.88)", backdropFilter:"blur(2px)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <div style={{ maxWidth:"480px", width:"90%", display:"flex", flexDirection:"column", gap:"20px", textAlign:"center" }}>
              <div style={{ fontFamily:"Cinzel,serif", fontSize:"11px", color:accent, letterSpacing:"0.2em", opacity:0.7 }}>PALU HEMI</div>
              <div style={{ fontFamily:"Georgia,serif", fontSize:"17px", color:"#A8C8A0", lineHeight:"1.8", fontStyle:"italic" }}>
                "{b.bridgeLine}"
              </div>
              <button onClick={onReturn} style={{ padding:"14px 32px", borderRadius:"6px", cursor:"pointer", fontFamily:"Cinzel,serif", fontSize:"12px", fontWeight:"700", letterSpacing:"0.14em", border:`1px solid ${accent}`, background:`rgba(200,148,26,0.14)`, color:accent, alignSelf:"center" }}>
                RETURN TO THE OCEAN →
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}



/* ══════════════════════════════════════════════════════════════
   TAHITI ARRIVAL SCREEN
══════════════════════════════════════════════════════════════ */

function TahitiArrivalScreen({ onReturn }) {
  const [phase,     setPhase]     = useState("canoe");
  const [lineIdx,   setLineIdx]   = useState(0);
  const [storyVis,  setStoryVis]  = useState(false);
  const [returnVis, setReturnVis] = useState(false);

  const SPEAKER = {
    canoe:     "palu",
    beach:     "palu",
    dialogue:  "hina_i_te_aparangi",
    farewell:  "palu",
  };

  const accent = "#D06030";
  const b = BRIDGE_CONTENT[2];

  const canoeLines = [
    "There. The green of the mountains. Do you see it? Tahiti.",
    "I came here once, years ago. The peaks look exactly as I remember them.",
    "Pull toward that cove — the water is calm there. We will bring her ashore.",
  ];
  const beachLines = [
    "The marae of Taputapuātea is on the island to the west — Raʻiatea. The sacred gathering place of navigators from across the ocean.",
    "Tū-te-rangi-ātea, who taught me, held court there. He has passed on. But his successor tends it now. She has agreed to meet with us.",
  ];

  const handleCanoeClick = () => {
    if (lineIdx < canoeLines.length - 1) {
      setLineIdx(i => i + 1);
    } else {
      setPhase("beach");
      setLineIdx(0);
    }
  };

  const handleBeachClick = () => {
    if (lineIdx < beachLines.length - 1) {
      setLineIdx(i => i + 1);
    } else {
      setPhase("dialogue");
    }
  };

  const handleContinueFromDialogue = () => {
    setPhase("story");
    setTimeout(() => setStoryVis(true), 200);
    setTimeout(() => setReturnVis(true), 700);
  };

  const isCanoe  = phase === "canoe";
  const lines    = isCanoe ? canoeLines : beachLines;
  const curLine  = lines[lineIdx];
  const isLast   = lineIdx === lines.length - 1;
  const isPaluPhase = phase === "canoe" || phase === "beach";

  const TAHITI_CANOE_IMG = "/images/tahiti-canoe.jpg";
  const TAHITI_BEACH_IMG = "/images/tahiti-beach.jpg";
  const currentImg = isCanoe ? TAHITI_CANOE_IMG : TAHITI_BEACH_IMG;

  return (
    <div style={{ width:"100%", height:"100%", background:"#0A0806", display:"flex", flexDirection:"column", overflow:"hidden" }}>
      {/* Header */}
      <div style={{ height:"44px", borderBottom:`1px solid ${accent}33`, background:"rgba(10,8,6,0.97)", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 28px", flexShrink:0 }}>
        <span style={{ fontFamily:"Cinzel,serif", fontSize:"12px", fontWeight:"700", color:"#C8941A", letterSpacing:"0.12em" }}>OCEAN ADVENTURE</span>
        <div style={{ fontFamily:"Cinzel,serif", fontSize:"10px", color:`${accent}88`, letterSpacing:"0.18em" }}>ARRIVED · TAHITI</div>
      </div>

      {/* Scene */}
      <div style={{ flex:1, position:"relative", overflow:"hidden" }}>
        {/* Background photo */}
        <img
          src={currentImg}
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
          }}
        />
        {/* Vignette — darkens bottom so text is readable */}
        <div style={{
          position: "absolute",
          bottom: 0, left: 0, right: 0,
          height: "55%",
          background: "linear-gradient(to top, rgba(8,4,2,0.95) 0%, rgba(8,4,2,0.4) 60%, transparent 100%)",
          pointerEvents: "none",
        }}/>
        {/* Top vignette — keeps header readable */}
        <div style={{
          position: "absolute",
          top: 0, left: 0, right: 0,
          height: "20%",
          background: "linear-gradient(to bottom, rgba(8,4,2,0.5) 0%, transparent 100%)",
          pointerEvents: "none",
        }}/>

        {/* Palu lines */}
        {isPaluPhase && (
          <div
            onClick={isCanoe ? handleCanoeClick : handleBeachClick}
            style={{ position:"absolute", bottom:0, left:0, right:0, padding:"20px 28px 16px", cursor:"pointer", userSelect:"none" }}
          >
            <div style={{ fontFamily:"Georgia,serif", fontSize:"17px", color:"#E0C8A0", lineHeight:"1.8", fontStyle:"italic", marginBottom:"10px", textShadow:"0 2px 12px rgba(0,0,0,0.9)" }}>
              "{curLine}"
            </div>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <span style={{ fontFamily:"Cinzel,serif", fontSize:"9px", color:accent, letterSpacing:"0.08em" }}>— PALU HEMI</span>
              <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                <div style={{ display:"flex", gap:"6px" }}>
                  {lines.map((_,i) => (
                    <div key={i} style={{ width:i===lineIdx?14:7, height:7, borderRadius:4, background:i<=lineIdx?accent:"#3A2010", transition:"all 0.25s" }}/>
                  ))}
                </div>
                <span style={{ fontFamily:"Cinzel,serif", fontSize:"9px", color:accent, opacity:0.6, letterSpacing:"0.06em" }}>
                  {isLast && isCanoe ? "go ashore →" : isLast ? "speak with her →" : "click to continue →"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Dialogue panel */}
        {phase === "dialogue" && (
          <div style={{ position:"absolute", bottom:0, left:0, right:0, background:"rgba(8,4,2,0.96)", borderTop:`1px solid ${accent}44`, padding:"22px 28px", display:"flex", flexDirection:"column", gap:"16px" }}>
            <div style={{ fontFamily:"Cinzel,serif", fontSize:"10px", color:accent, letterSpacing:"0.18em", opacity:0.7 }}>HINA-I-TE-APARANGI · TAHITIAN WAYFINDER</div>
            <div style={{ fontFamily:"Georgia,serif", fontSize:"15px", color:"#C8A888", lineHeight:"1.78", fontStyle:"italic" }}>
              "You sailed by the sun and found our latitude. Tū-te-rangi-ātea would have been pleased. He always said the sun and the stars speak the same language — we need only learn to listen to both."
            </div>
            <div style={{ fontFamily:"Georgia,serif", fontSize:"14px", color:"#908070", lineHeight:"1.7", fontStyle:"italic" }}>
              "Rest two nights. We will share what we know of the currents northeast — toward the Marquesas. The swells there will speak to you differently."
            </div>
            <button onClick={handleContinueFromDialogue} style={{ padding:"13px", borderRadius:"6px", cursor:"pointer", fontFamily:"Cinzel,serif", fontSize:"11px", fontWeight:"700", letterSpacing:"0.12em", border:`1px solid ${accent}`, background:`rgba(208,96,48,0.14)`, color:accent }}>
              RECEIVE HER KNOWLEDGE →
            </button>
          </div>
        )}

        {/* Story + farewell overlay */}
        {storyVis && (
          <div style={{ position:"absolute", inset:0, background:"rgba(8,4,2,0.93)", backdropFilter:"blur(2px)", display:"flex", flexDirection:"column", overflow:"hidden" }}>
            <div style={{ flex:1, overflowY:"auto", padding:"28px 32px 20px", display:"flex", flexDirection:"column", gap:"20px" }}>
              <div>
                <div style={{ fontFamily:"Cinzel,serif", fontSize:"9px", color:accent, letterSpacing:"0.2em", marginBottom:"10px", opacity:0.7 }}>NAVIGATOR'S KNOWLEDGE</div>
                <div style={{ fontFamily:"Cinzel,serif", fontSize:"17px", fontWeight:"700", color:"#E8D8A8", marginBottom:"14px" }}>{b.storyTitle}</div>
                <div style={{ fontFamily:"Georgia,serif", fontSize:"14px", color:"#A8B8C0", lineHeight:"1.85", fontStyle:"italic", borderLeft:`2px solid ${accent}44`, paddingLeft:"18px" }}>
                  {b.story}
                </div>
                <div style={{ fontFamily:"Cinzel,serif", fontSize:"8.5px", color:`${accent}55`, letterSpacing:"0.1em", marginTop:"10px" }}>— {b.storyCitation}</div>
              </div>
              <div style={{ borderTop:`1px solid ${accent}22`, paddingTop:"18px" }}>
                <div style={{ fontFamily:"Cinzel,serif", fontSize:"9px", color:accent, letterSpacing:"0.2em", marginBottom:"12px", opacity:0.7 }}>IN YOUR BAG</div>
                {b.bagItems.map(itemId => {
                  const item = BAG_ITEMS.find(bi => bi.id === itemId);
                  if (!item) return null;
                  return (
                    <div key={itemId} style={{ display:"flex", alignItems:"center", gap:"12px", padding:"11px 14px", background:`${item.color}10`, border:`1px solid ${item.color}33`, borderRadius:"8px", marginBottom:"8px" }}>
                      <span style={{ fontSize:"22px" }}>{item.icon}</span>
                      <div>
                        <div style={{ fontFamily:"Cinzel,serif", fontSize:"13px", fontWeight:"700", color:"#D0C8A8" }}>{item.name}</div>
                        <div style={{ fontFamily:"Cinzel,serif", fontSize:"9px", color:`${item.color}99`, letterSpacing:"0.06em", marginTop:"2px" }}>{item.hawaiian}</div>
                      </div>
                    </div>
                  );
                })}
                <div style={{ fontFamily:"Georgia,serif", fontSize:"13px", color:"#6A7870", lineHeight:"1.65", fontStyle:"italic" }}>{b.bagNote}</div>
              </div>
            </div>
            {returnVis && (
              <div style={{ padding:"20px 28px", borderTop:`1px solid ${accent}22`, display:"flex", flexDirection:"column", gap:"12px", background:"rgba(6,2,0,0.5)" }}>
                <div style={{ fontFamily:"Georgia,serif", fontSize:"14px", color:accent, lineHeight:"1.7", fontStyle:"italic" }}>
                  "{b.bridgeLine}"
                </div>
                <button onClick={onReturn} style={{ padding:"13px", borderRadius:"6px", fontFamily:"Cinzel,serif", fontSize:"11px", fontWeight:"700", letterSpacing:"0.14em", cursor:"pointer", border:`1px solid ${accent}`, background:`${accent}18`, color:accent }}>
                  RETURN TO THE OCEAN →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


/* ══════════════════════════════════════════════════════════════
   MARQUESAS ARRIVAL SCREEN
══════════════════════════════════════════════════════════════ */

function MarquesasArrivalScreen({ name, unlocked, onReturn }) {
  const [phase, setPhase] = useState("palu");
  const [lineIdx, setLineIdx] = useState(0);
  const [tikHov, setTikHov] = useState(false);
  const [greeterHov, setGreeterHov] = useState(false);
  const [tikClicked, setTikClicked] = useState(false);
  const [, setExchanged] = useState(false);
  const [storyVis, setStoryVis] = useState(false);
  const [showFarewell, setShowFarewell] = useState(false);

  const SPEAKER = {
    palu:     "palu",
    tiki:     "palu",
    greeter:  null,
    exchange: "hina",
    matala:   "palu",
    story:    null,
    farewell: "palu",
  };

  const accent = "#2A90A8";
  const b = BRIDGE_CONTENT[3];
  const W = 760, H = 400;
  const tikX = 180, tikY = 280;
  const greeterX = 580, greeterY = 270;

  const paluLinesMarq = [
    "Three days on that ocean. You read the swell — I barely had to say a word.",
    "The Marquesas. Some of the oldest voyaging in the Pacific happened here.",
    "Look at this valley. These people have been navigating these waters for two thousand years.",
  ];

  const handlePaluClick = () => {
    if (phase !== "palu") return;
    if (lineIdx < paluLinesMarq.length - 1) setLineIdx(i => i + 1);
    else setPhase("tiki");
  };

  const handleTikiClick = () => {
    if (phase !== "tiki") return;
    setTikClicked(true);
    setTimeout(() => setPhase("greeter"), 1400);
  };

  const handleGreeterClick = () => {
    if (phase !== "greeter") return;
    setPhase("exchange");
  };

  const handleRestHere = () => {
    setPhase("story");
    setTimeout(() => setStoryVis(true), 200);
  };

  const handleOkAfterStory = () => {
    setShowFarewell(true);
  };

  const canClickTiki = phase === "tiki";
  const canClickGreeter = phase === "greeter";
  const waveItem = BAG_ITEMS.find(i => i.id === "wave_reader");
  const taroItem = BAG_ITEMS.find(i => i.id === "taro_plant");

  return (
    <div role="region" aria-label={`Marquesas arrival, ${name}, bag ${(unlocked || []).length} items`} style={{ width:"100%", height:"100%", background:"#060A0C", display:"flex", flexDirection:"column", overflow:"hidden" }}>
      <div style={{ height:"44px", borderBottom:`1px solid ${accent}33`, background:"rgba(6,10,12,0.97)", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 28px", flexShrink:0 }}>
        <span style={{ fontFamily:"Cinzel,serif", fontSize:"12px", fontWeight:"700", color:"#C8941A", letterSpacing:"0.12em" }}>OCEAN ADVENTURE</span>
        <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
          <div style={{ fontFamily:"Cinzel,serif", fontSize:"10px", color:`${accent}88`, letterSpacing:"0.18em" }}>ARRIVED · MARQUESAS</div>
          <button type="button" onClick={() => { analyticsEvents.feedbackOpened(); window.open(FEEDBACK_URL, "_blank", "noopener,noreferrer"); }} style={{ background:"none", border:"1px solid #0A2A3A", borderRadius:"5px", padding:"5px 10px", cursor:"pointer", fontFamily:"Cinzel,serif", fontSize:"9px", color:"#1A6070", letterSpacing:"0.08em" }}>✦ FEEDBACK</button>
        </div>
      </div>

      <div style={{ flex:1, position:"relative", overflow:"hidden" }}>
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" style={{ width:"100%", height:"100%", display:"block" }}>
          <defs>
            <linearGradient id="marqSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#08101C"/>
              <stop offset="100%" stopColor="#0E1E18"/>
            </linearGradient>
            <linearGradient id="marqRidgeBack" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0C1814"/><stop offset="100%" stopColor="#0A1410"/>
            </linearGradient>
            <linearGradient id="marqRidgeMid" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#142820"/><stop offset="100%" stopColor="#102018"/>
            </linearGradient>
            <linearGradient id="marqValley" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4A3818"/><stop offset="100%" stopColor="#3A2C10"/>
            </linearGradient>
          </defs>
          <rect width={W} height={H} fill="url(#marqSky)"/>
          {[[70,28,1],[140,18,0.8],[220,36,1.1],[310,22,0.7],[400,14,1],[490,32,0.9],[580,20,1.2],[650,40,0.75],[520,48,0.6],[200,52,0.65]].map(([x,y,r],i)=>(
            <circle key={i} cx={x} cy={y} r={r} fill="#C8E0E8" opacity="0.45"/>
          ))}
          <path d="M-20,120 L40,40 L120,95 L200,35 L280,88 L360,25 L440,75 L520,30 L600,70 L680,38 L780,100 L780,220 L-20,220Z" fill="url(#marqRidgeBack)" opacity="0.98"/>
          <path d="M0,160 Q120,120 240,150 Q380,110 520,145 Q640,125 760,155 L760,245 L0,245Z" fill="url(#marqRidgeMid)"/>
          <path d="M0,140 L60,180 L120,150 L200,190 L280,160 L360,200 L440,175 L520,205 L600,185 L680,210 L760,195 L760,260 L0,260Z" fill="#122014" opacity="0.9"/>
          <path d="M-10,200 Q180,175 380,188 Q580,200 770,185 L770,400 L-10,400Z" fill="#1A3020"/>
          <path d="M0,305 Q380,285 760,298 L760,400 L0,400Z" fill="url(#marqValley)"/>
          <rect x="0" y="240" width="200" height="165" fill="#0E1C0E" opacity="0.85"/>
          <rect x="560" y="235" width="200" height="170" fill="#0E1C0E" opacity="0.85"/>
          <path d="M0,255 Q90,230 180,248 Q270,225 380,238 Q520,248 760,232 L760,400 L0,400Z" fill="#122014" opacity="0.55"/>
          <circle cx="520" cy="210" r="90" fill="#C8681A" opacity="0.08"/>

          <g opacity="0.9">
            <rect x={tikX-22} y={tikY-95} width="44" height="100" rx="6" fill="#1A1A14" stroke="#2A2A1C" strokeWidth="2"/>
            <rect x={tikX-18} y={tikY-78} width="14" height="5" rx="1" fill="#0A0A08" opacity="0.7"/>
            <rect x={tikX+4} y={tikY-78} width="14" height="5" rx="1" fill="#0A0A08" opacity="0.7"/>
            <path d={`M${tikX-16},${tikY-40} Q${tikX},${tikY-32} ${tikX+16},${tikY-40}`} stroke="#1A3018" strokeWidth="1.2" opacity="0.4" fill="none"/>
          </g>
          {canClickTiki && (
            <circle cx={tikX} cy={tikY-40} r={tikHov?52:40} fill="none" stroke="#C8941A" strokeWidth="2" opacity={tikHov?0.65:0.35} style={{ transition:"all 0.25s" }}/>
          )}
          {canClickTiki && (
            <rect x={tikX-50} y={tikY-110} width="100" height="130" fill="transparent" style={{ cursor:"pointer" }}
              onMouseEnter={()=>setTikHov(true)} onMouseLeave={()=>setTikHov(false)} onClick={handleTikiClick}/>
          )}
          {canClickTiki && tikHov && (
            <g>
              <rect x={tikX-48} y={tikY-132} width="96" height="20" rx="4" fill="#050A0C" stroke={`${accent}55`}/>
              <text x={tikX} y={tikY-118} textAnchor="middle" fill={accent} fontSize="10" fontFamily="Cinzel,serif">ancient stone</text>
            </g>
          )}

          {phase === "tiki" && tikClicked && (
            <g>
              <rect x={tikX - 8} y={tikY - 220} width={230} height={85} rx="8"
                fill="#05100A" stroke="#C8941A55" strokeWidth="1.5"/>
              <path d={`M${tikX+24},${tikY-135} L${tikX+36},${tikY-122} L${tikX+50},${tikY-135}`}
                fill="#05100A" stroke="#C8941A55" strokeWidth="1.5"/>
              <foreignObject x={tikX} y={tikY - 214} width={214} height={78}>
                <div xmlns="http://www.w3.org/1999/xhtml" style={{
                  fontFamily:"Georgia,serif", fontSize:"11px", color:"#A8C8A0",
                  fontStyle:"italic", lineHeight:"1.55", padding:"4px 10px",
                }}>
                  "This island has a long memory. Older than any of us. Treat it with respect."
                </div>
                <div xmlns="http://www.w3.org/1999/xhtml" style={{
                  fontFamily:"Cinzel,serif", fontSize:"8px", color:"#C8941A",
                  letterSpacing:"0.06em", padding:"0 10px",
                }}>— PALU HEMI</div>
              </foreignObject>
            </g>
          )}

          {(phase === "greeter" || phase === "exchange" || phase === "matala" || phase === "story") && (
            <g>
              <ellipse cx={greeterX} cy={greeterY+8} rx="20" ry="26" fill="#6A4830"/>
              <path d={`M${greeterX-20},${greeterY} Q${greeterX},${greeterY-12} ${greeterX+20},${greeterY}`} fill="#1A3030" opacity="0.95"/>
              <path d={`M${greeterX-18},${greeterY+2} Q${greeterX-32},${greeterY+18} ${greeterX-28},${greeterY+28}`} stroke="#1A0A08" strokeWidth="1.2" opacity="0.7" fill="none"/>
              <path d={`M${greeterX+18},${greeterY+2} Q${greeterX+32},${greeterY+18} ${greeterX+28},${greeterY+28}`} stroke="#1A0A08" strokeWidth="1.2" opacity="0.7" fill="none"/>
              <ellipse cx={greeterX} cy={greeterY-32} rx="17" ry="17" fill="#7A5840"/>
              <path d={`M${greeterX-22},${greeterY-48} Q${greeterX},${greeterY-58} ${greeterX+22},${greeterY-48} Q${greeterX+24},${greeterY-38} ${greeterX-22},${greeterY-40}Z`} fill="#1A1008"/>
              <ellipse cx={greeterX-6} cy={greeterY-32} rx="2.2" ry="2.2" fill="#1A0E06"/>
              <ellipse cx={greeterX+6} cy={greeterY-32} rx="2.2" ry="2.2" fill="#1A0E06"/>
              <path d={`M${greeterX-6},${greeterY-22} Q${greeterX},${greeterY-18} ${greeterX+6},${greeterY-22}`} stroke="#5A3010" strokeWidth="1.5" fill="none"/>
              <path d={`M${greeterX-18},${greeterY-6} L${greeterX-22},${greeterY+12}`} stroke="#7A5840" strokeWidth="6" strokeLinecap="round"/>
              <path d={`M${greeterX+18},${greeterY-6} L${greeterX+22},${greeterY+12}`} stroke="#7A5840" strokeWidth="6" strokeLinecap="round"/>
              <path d={`M${greeterX-14},${greeterY-2} Q${greeterX},${greeterY+6} ${greeterX+14},${greeterY-2}`} fill="#5A1A0A" opacity="0.95"/>
              <path d={`M${greeterX-14},${greeterY-2} Q${greeterX},${greeterY+4} ${greeterX+14},${greeterY-2}`} fill="#0A2828" opacity="0.5"/>
              <rect x={greeterX-9} y={greeterY+28} width="8" height="20" rx="4" fill="#6A4830"/>
              <rect x={greeterX+2} y={greeterY+28} width="8" height="20" rx="4" fill="#6A4830"/>
              <path d={`M${greeterX-14},${greeterY-14} Q${greeterX},${greeterY-8} ${greeterX+14},${greeterY-14}`} stroke="#C8941A" strokeWidth="2" fill="none" opacity="0.9"/>
              {canClickGreeter && (
                <circle cx={greeterX} cy={greeterY-16} r={greeterHov?48:38} fill="none" stroke="#C8941A" strokeWidth="2" opacity={greeterHov?0.7:0.35}/>
              )}
            </g>
          )}
          {canClickGreeter && (
            <rect x={greeterX-44} y={greeterY-58} width="88" height="120" fill="transparent" style={{ cursor:"pointer" }}
              onMouseEnter={()=>setGreeterHov(true)} onMouseLeave={()=>setGreeterHov(false)} onClick={handleGreeterClick}/>
          )}
          {canClickGreeter && greeterHov && (
            <g>
              <rect x={greeterX-52} y={greeterY-78} width="104" height="18" rx="4" fill="#050A0C" stroke={`${accent}44`}/>
              <text x={greeterX} y={greeterY-65} textAnchor="middle" fill={accent} fontSize="9" fontFamily="Cinzel,serif">Hina of Nuku Hiva</text>
            </g>
          )}

          {phase === "matala" && (
            <g>
              <ellipse cx="168" cy="208" rx="14" ry="10" fill="#2AB870"/>
              <path d="M154,212 Q160,198 175,200 Q188,205 192,215 L188,222 Q175,218 160,220Z" fill="#2AB870" stroke="#1A6040" strokeWidth="1"/>
              <path d="M178,202 Q188,198 196,208" fill="#C8941A" stroke="#A07020" strokeWidth="3"/>

              {/* Branch */}
              <path d="M540,210 Q578,196 618,206" fill="none"
                stroke="#2A3A18" strokeWidth="4" strokeLinecap="round"/>

              {/* Lory 1 */}
              <g transform="translate(570, 185)">
                <ellipse cx="0" cy="0" rx="10" ry="8" fill="#C83020"/>
                <ellipse cx="3" cy="3" rx="8" ry="5" fill="#1A6020" transform="rotate(-15)"/>
                <circle cx="-6" cy="-7" r="6" fill="#C83020"/>
                <path d="M-11,-8 L-15,-6 L-11,-4Z" fill="#E8A020"/>
                <circle cx="-8" cy="-8" r="1.5" fill="#200808"/>
              </g>

              {/* Lory 2 — slightly behind and lower */}
              <g transform="translate(596, 198)">
                <ellipse cx="0" cy="0" rx="9" ry="7" fill="#C03020"/>
                <ellipse cx="2" cy="2" rx="7" ry="4" fill="#1A5A18" transform="rotate(-15)"/>
                <circle cx="-5" cy="-6" r="5" fill="#C03020"/>
                <path d="M-9,-7 L-13,-5 L-9,-3Z" fill="#D89018"/>
                <circle cx="-7" cy="-7" r="1.2" fill="#200808"/>
              </g>

              {/* Matala bubble (above-right, tail down-left) */}
              <rect x="185" y="152" width="128" height="46" rx="8" fill="#050A0C" stroke="#2AB870" strokeWidth="1.2"/>
              <path d="M205,198 L190,214 L210,202Z" fill="#050A0C" stroke="#2AB870"/>
              <foreignObject x="193" y="156" width="116" height="40">
                <div xmlns="http://www.w3.org/1999/xhtml" style={{ display:"flex", flexDirection:"column", gap:"2px", padding:"2px 8px" }}>
                  <div style={{ fontFamily:"Cinzel,serif", fontSize:"14px", fontWeight:"700", color:"#2AB870", lineHeight:"1.1" }}>SKRAWWK!</div>
                  <div style={{ fontFamily:"Georgia,serif", fontSize:"11px", fontStyle:"italic", color:"#6AD898", lineHeight:"1.2" }}>Not yet?!</div>
                </div>
              </foreignObject>
            </g>
          )}
        </svg>

        {phase === "palu" && SPEAKER[phase] === "palu" && (
          <div onClick={handlePaluClick} style={{ position:"absolute", bottom:0, left:0, right:0, background:"rgba(4,10,12,0.9)", borderTop:`1px solid ${accent}33`, padding:"18px 28px 14px", cursor:"pointer", userSelect:"none", zIndex: 10 }}>
            <div style={{ fontFamily:"Georgia,serif", fontSize:"15px", color:"#C8D8DC", lineHeight:"1.75", fontStyle:"italic", marginBottom:"8px" }}>{`"${paluLinesMarq[lineIdx]}"`}</div>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <span style={{ fontFamily:"Cinzel,serif", fontSize:"9px", color:accent, letterSpacing:"0.08em" }}>— PALU HEMI</span>
              <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                <div style={{ display:"flex", gap:"6px" }}>
                  {paluLinesMarq.map((_,i) => (
                    <div key={i} style={{ width:i===lineIdx?14:7, height:7, borderRadius:4, background:i<=lineIdx?accent:"#102428", transition:"all 0.25s" }}/>
                  ))}
                </div>
                <span style={{ fontFamily:"Cinzel,serif", fontSize:"9px", color:accent, opacity:0.55, letterSpacing:"0.06em" }}>
                  {lineIdx < paluLinesMarq.length - 1 ? "click to continue →" : "click the ancient stone →"}
                </span>
              </div>
            </div>
          </div>
        )}

        {phase === "exchange" && (
          <div style={{
            position:"absolute", bottom:0, left:0, right:0,
            background:"rgba(4,12,6,0.97)",
            borderTop:"1px solid rgba(42,144,168,0.44)",
            padding:"22px 28px",
            display:"flex", flexDirection:"column", gap:"16px",
            zIndex: 20,
          }}>
            <div style={{ fontFamily:"Cinzel,serif", fontSize:"10px", color:"#2A90A8",
              letterSpacing:"0.18em", opacity:0.7 }}>
              HINA · NUKU HIVA
            </div>
            <div style={{ fontFamily:"Georgia,serif", fontSize:"15px", color:"#A8C8A0",
              lineHeight:"1.78", fontStyle:"italic" }}>
              "You came from Tahiti by reading the swell. Hina-i-te-aparangi told us to
              expect you. The SE swell on your starboard beam — you held it for three days.
              That is how it is done."
            </div>
            <button onClick={() => { setExchanged(true); setPhase("matala"); }}
              style={{ padding:"13px", borderRadius:"6px", cursor:"pointer",
                fontFamily:"Cinzel,serif", fontSize:"11px", fontWeight:"700",
                letterSpacing:"0.12em", border:"1px solid #2A90A8",
                background:"rgba(42,144,168,0.14)", color:"#2A90A8" }}>
              Share what we have learned on this voyage →
            </button>
          </div>
        )}

        {phase === "matala" && SPEAKER[phase] === "palu" && (
          <div style={{ position:"absolute", bottom:0, left:0, right:0, background:"rgba(4,10,12,0.94)", borderTop:`1px solid ${accent}33`, padding:"18px 28px 16px", display:"flex", flexDirection:"column", gap:"12px", zIndex: 10 }}>
            <div style={{ fontFamily:"Georgia,serif", fontSize:"15px", color:"#A8B8BC", lineHeight:"1.7", fontStyle:"italic" }}>&quot;Patience, little one. Not yet.&quot;</div>
            <div style={{ fontFamily:"Georgia,serif", fontSize:"14px", color:`${accent}cc`, lineHeight:"1.65", fontStyle:"italic" }}>— PALU HEMI</div>
            <button type="button" onClick={handleRestHere} style={{ alignSelf:"flex-start", padding:"12px 18px", borderRadius:"6px", cursor:"pointer", fontFamily:"Cinzel,serif", fontSize:"11px", fontWeight:"700", letterSpacing:"0.1em", border:`1px solid ${accent}`, background:`${accent}12`, color:accent }}>
              Let's rest here →
            </button>
          </div>
        )}

        {storyVis && phase === "story" && (
          <div style={{ position:"absolute", bottom:0, left:0, right:0, background:"rgba(4,12,14,0.97)", borderTop:`1px solid ${accent}44`, padding:"22px 28px 20px", display:"flex", flexDirection:"column", gap:"16px", zIndex: 30 }}>
            <div style={{ display:"flex", gap:"24px", alignItems:"flex-start", flexWrap:"wrap" }}>
              <div style={{ flex:"1 1 280px", minWidth:0 }}>
                <div style={{ fontFamily:"Cinzel,serif", fontSize:"9px", color:accent, letterSpacing:"0.2em", marginBottom:"8px", opacity:0.7 }}>{`NAVIGATOR'S KNOWLEDGE`}</div>
                <div style={{ fontFamily:"Cinzel,serif", fontSize:"15px", fontWeight:"700", color:"#E8D8A8", marginBottom:"10px" }}>{b.storyTitle}</div>
                <div style={{ fontFamily:"Georgia,serif", fontSize:"13px", color:"#7AACBE", lineHeight:"1.8", fontStyle:"italic", borderLeft:`2px solid ${accent}44`, paddingLeft:"14px" }}>{b.story}</div>
                <div style={{ fontFamily:"Cinzel,serif", fontSize:"8.5px", color:`${accent}55`, letterSpacing:"0.1em", marginTop:"8px" }}>— {b.storyCitation}</div>
              </div>
              <div style={{ width:"240px", flexShrink:0, display:"flex", flexDirection:"column", gap:"10px" }}>
                <div style={{ fontFamily:"Cinzel,serif", fontSize:"9px", color:accent, letterSpacing:"0.2em", opacity:0.7 }}>IN YOUR BAG</div>
                {waveItem && (
                  <div style={{ display:"flex", alignItems:"flex-start", gap:"10px", padding:"11px 12px", background:`${waveItem.color}10`, border:`1px solid ${waveItem.color}33`, borderRadius:"8px" }}>
                    <span style={{ fontSize:"22px" }}>{waveItem.icon}</span>
                    <div>
                      <div style={{ fontFamily:"Cinzel,serif", fontSize:"12px", fontWeight:"700", color:"#D0C8A8" }}>{waveItem.name}</div>
                      <div style={{ fontFamily:"Cinzel,serif", fontSize:"8px", color:`${waveItem.color}99`, marginTop:"2px" }}>{waveItem.hawaiian}</div>
                      <div style={{ fontFamily:"Georgia,serif", fontSize:"10px", color:"#6A8088", marginTop:"4px", fontStyle:"italic" }}>Earned at sea</div>
                    </div>
                  </div>
                )}
                {taroItem && (
                  <div style={{ display:"flex", alignItems:"flex-start", gap:"10px", padding:"11px 12px", background:`${taroItem.color}10`, border:`1px solid ${taroItem.color}33`, borderRadius:"8px" }}>
                    <span style={{ fontSize:"22px" }}>{taroItem.icon}</span>
                    <div>
                      <div style={{ fontFamily:"Cinzel,serif", fontSize:"12px", fontWeight:"700", color:"#D0C8A8" }}>{taroItem.name}</div>
                      <div style={{ fontFamily:"Cinzel,serif", fontSize:"8px", color:`${taroItem.color}99`, marginTop:"2px" }}>{taroItem.hawaiian}</div>
                      <div style={{ fontFamily:"Georgia,serif", fontSize:"10px", color:"#6A8088", marginTop:"4px", fontStyle:"italic" }}>Gift from Hina</div>
                    </div>
                  </div>
                )}
                <div style={{ fontFamily:"Georgia,serif", fontSize:"12px", color:"#5A7080", lineHeight:"1.6", fontStyle:"italic" }}>{b.bagNote}</div>
                <button type="button" onClick={handleOkAfterStory} style={{ padding:"11px", borderRadius:"6px", cursor:"pointer", fontFamily:"Cinzel,serif", fontSize:"11px", fontWeight:"700", letterSpacing:"0.12em", border:`1px solid ${accent}`, background:`${accent}14`, color:accent }}>OK →</button>
              </div>
            </div>
          </div>
        )}

        {showFarewell && (
          <div style={{ position:"absolute", inset:0, background:"rgba(4,10,12,0.88)", backdropFilter:"blur(2px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex: 40 }}>
            <div style={{ maxWidth:"480px", width:"90%", display:"flex", flexDirection:"column", gap:"20px", textAlign:"center" }}>
              <div style={{ fontFamily:"Cinzel,serif", fontSize:"11px", color:accent, letterSpacing:"0.2em", opacity:0.7 }}>PALU HEMI</div>
              <div style={{ fontFamily:"Georgia,serif", fontSize:"17px", color:"#A8C8C8", lineHeight:"1.8", fontStyle:"italic" }}>&quot;{b.bridgeLine}&quot;</div>
              <button type="button" onClick={onReturn} style={{ padding:"14px 32px", borderRadius:"6px", cursor:"pointer", fontFamily:"Cinzel,serif", fontSize:"12px", fontWeight:"700", letterSpacing:"0.14em", border:`1px solid ${accent}`, background:`${accent}14`, color:accent, alignSelf:"center" }}>RETURN TO THE OCEAN →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


/* ══════════════════════════════════════════════════════════════
   FIJI BIRD MATE SCREEN (Module 5 bridge)
══════════════════════════════════════════════════════════════ */

function FijiBirdMateScreen({ name, unlocked, onReturn }) {
  const [phase, setPhase] = useState("palu");
  const [lineIdx, setLineIdx] = useState(0);
  const [treeHov, setTreeHov] = useState(false);
  const [greeterHov, setGreeterHov] = useState(false);
  const [treeClicked, setTreeClicked] = useState(false);
  const [storyVis, setStoryVis] = useState(false);
  const [showFarewell, setShowFarewell] = useState(false);

  const accent = "#00C896";
  const b = BRIDGE_CONTENT[5];
  const W = 760, H = 400;
  const treeFocusX = 560, treeFocusY = 175;
  const greeterX = 200, greeterY = 300;

  const paluLinesFiji = [
    "Fiji. The reef birds led us straight in — just as I said they would.",
    "These people share deep roots with Tonga. Tonight there will be a feast.",
    "And I think Matala has already noticed something in those trees.",
  ];

  const handlePaluClick = () => {
    if (phase !== "palu") return;
    if (lineIdx < paluLinesFiji.length - 1) setLineIdx(i => i + 1);
    else setPhase("tree");
  };

  const handleTreeClick = () => {
    if (phase !== "tree") return;
    setTreeClicked(true);
    setTimeout(() => setPhase("greeter"), 1400);
  };

  const handleGreeterClick = () => {
    if (phase !== "greeter") return;
    setPhase("exchange");
  };

  const handleLearnBirds = () => {
    setPhase("matala");
  };

  const handleMatalaOk = () => {
    setPhase("story");
    setTimeout(() => setStoryVis(true), 200);
  };

  const handleOkAfterStory = () => {
    setShowFarewell(true);
  };

  const canClickTree = phase === "tree";
  const canClickGreeter = phase === "greeter";
  const birdItem = BAG_ITEMS.find(i => i.id === "bird_guide");

  return (
    <div role="region" aria-label={`Fiji arrival, ${name}, ${unlocked?.length ?? 0} bag items`} style={{ width:"100%", height:"100%", background:"#060E08", display:"flex", flexDirection:"column", overflow:"hidden" }}>
      <div style={{ height:"44px", borderBottom:`1px solid ${accent}33`, background:"rgba(6,14,8,0.97)", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 28px", flexShrink:0 }}>
        <span style={{ fontFamily:"Cinzel,serif", fontSize:"12px", fontWeight:"700", color:"#C8941A", letterSpacing:"0.12em" }}>OCEAN ADVENTURE</span>
        <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
          <div style={{ fontFamily:"Cinzel,serif", fontSize:"10px", color:`${accent}99`, letterSpacing:"0.18em" }}>ARRIVED · FIJI</div>
          <button type="button" onClick={() => { analyticsEvents.feedbackOpened(); window.open(FEEDBACK_URL, "_blank", "noopener,noreferrer"); }} style={{ background:"none", border:"1px solid #0A2A3A", borderRadius:"5px", padding:"5px 10px", cursor:"pointer", fontFamily:"Cinzel,serif", fontSize:"9px", color:"#1A6070", letterSpacing:"0.08em" }}>✦ FEEDBACK</button>
        </div>
      </div>

      <div style={{ flex:1, position:"relative", overflow:"hidden" }}>
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" style={{ width:"100%", height:"100%", display:"block" }}>
          <defs>
            <linearGradient id="fijiSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#080C06"/>
              <stop offset="70%" stopColor="#0C140A"/>
              <stop offset="100%" stopColor="#0C1808"/>
            </linearGradient>
            <linearGradient id="fijiWater" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0A2820"/><stop offset="100%" stopColor="#061810"/>
            </linearGradient>
          </defs>
          <rect width={W} height={H} fill="url(#fijiSky)"/>
          {[[88,32,1.1],[160,22,0.75],[240,38,0.9],[320,18,1],[400,28,0.85],[500,20,1.05],[620,36,0.7],[680,26,0.95]].map(([x,y,r],i)=>(
            <circle key={i} cx={x} cy={y} r={r} fill="#D8E8C8" opacity="0.35"/>
          ))}
          <circle cx="620" cy="42" r="6" fill="#FFE8A0" opacity="0.95"/>
          <text x="632" y="46" fill="#FFE8A0" fontSize="9" fontFamily="Cinzel,serif" opacity="0.85">Kōpō</text>

          <path d="M320,120 Q420,60 560,95 Q650,75 780,110 L780,260 L320,260Z" fill="#0A1408" opacity="0.92"/>
          <path d="M380,140 Q480,100 560,125 Q640,108 760,135 L760,280 L380,280Z" fill="#0C180A" opacity="0.88"/>
          <ellipse cx="560" cy="200" rx="120" ry="70" fill="#081008" opacity="0.5"/>
          <path d="M480,175 Q540,150 600,165 Q660,155 700,175" fill="none" stroke="#1A3018" strokeWidth="8" strokeLinecap="round"/>
          <circle cx="572" cy="158" r="8" fill="#C83020"/>
          <path d="M568,158 L578,152 L582,162Z" fill="#1A6020"/>
          <circle cx="598" cy="162" r="7" fill="#C83020"/>
          <path d="M594,162 L604,156 L608,166Z" fill="#1A6020"/>

          {phase === "matala" && (
            <g>
              <ellipse cx="585" cy="162" rx="16" ry="11" fill="#2AB870"/>
              <path d="M568,168 Q580,152 598,156 Q612,162 610,176 L602,180 Q588,176 572,178Z" fill="#2AB870" stroke="#1A6040" strokeWidth="1"/>
              <text x="592" y="168" textAnchor="middle" fill="#C8941A" fontSize="10" fontFamily="serif">✦</text>
            </g>
          )}

          <rect y="310" width={W} height="90" fill="url(#fijiWater)"/>
          <path d="M0,310 Q190,295 380,305 Q570,315 760,302 L760,400 L0,400Z" fill="#0A2018" opacity="0.4"/>
          <circle cx="120" cy="240" r="70" fill="#C8681A" opacity="0.07"/>

          {(phase === "greeter" || phase === "exchange" || phase === "matala" || phase === "story") && (
            <g>
              <ellipse cx={greeterX} cy={greeterY+6} rx="28" ry="32" fill="#6A5038"/>
              <path d={`M${greeterX-32},${greeterY-4} Q${greeterX},${greeterY-18} ${greeterX+32},${greeterY-4}`} fill="#4A3818" opacity="0.95"/>
              <path d={`M${greeterX-32},${greeterY-2} Q${greeterX},${greeterY+8} ${greeterX+32},${greeterY-2}`} fill="#3A2810" opacity="0.6"/>
              <circle cx={greeterX} cy={greeterY-34} r="22" fill="#7A6048"/>
              <path d={`M${greeterX-24},${greeterY-52} Q${greeterX},${greeterY-62} ${greeterX+24},${greeterY-52}`} fill="#2A1810"/>
              <ellipse cx={greeterX-8} cy={greeterY-36} rx="3" ry="3" fill="#1A0E06"/>
              <ellipse cx={greeterX+8} cy={greeterY-36} rx="3" ry="3" fill="#1A0E06"/>
              <path d={`M${greeterX-10},${greeterY-24} Q${greeterX},${greeterY-18} ${greeterX+10},${greeterY-24}`} stroke="#5A3010" strokeWidth="2" fill="none"/>
              <path d={`M${greeterX-8},${greeterY-20} Q${greeterX},${greeterY-14} ${greeterX+8},${greeterY-20}`} stroke="#C8941A" strokeWidth="2.5" fill="none" opacity="0.85"/>
              <path d={`M${greeterX-36},${greeterY+4} Q${greeterX-52},${greeterY-12} ${greeterX-44},${greeterY-28}`} stroke="#6A5038" strokeWidth="9" strokeLinecap="round"/>
              <path d={`M${greeterX+36},${greeterY+4} Q${greeterX+52},${greeterY-12} ${greeterX+44},${greeterY-28}`} stroke="#6A5038" strokeWidth="9" strokeLinecap="round"/>
              <path d={`M${greeterX-26},${greeterY-8} Q${greeterX-40},${greeterY-22} ${greeterX-34},${greeterY-32}`} stroke="#1A0A08" strokeWidth="1.5" opacity="0.65" fill="none"/>
              <path d={`M${greeterX+26},${greeterY-8} Q${greeterX+40},${greeterY-22} ${greeterX+34},${greeterY-32}`} stroke="#1A0A08" strokeWidth="1.5" opacity="0.65" fill="none"/>
              <rect x={greeterX-12} y={greeterY+34} width="10" height="22" rx="4" fill="#6A5038"/>
              <rect x={greeterX+2} y={greeterY+34} width="10" height="22" rx="4" fill="#6A5038"/>
              {canClickGreeter && (
                <circle cx={greeterX} cy={greeterY-18} r={greeterHov?54:42} fill="none" stroke="#C8941A" strokeWidth="2" opacity={greeterHov?0.7:0.35}/>
              )}
            </g>
          )}
          {canClickGreeter && (
            <rect x={greeterX-55} y={greeterY-62} width="110" height="130" fill="transparent" style={{ cursor:"pointer" }}
              onMouseEnter={()=>setGreeterHov(true)} onMouseLeave={()=>setGreeterHov(false)} onClick={handleGreeterClick}/>
          )}
          {canClickGreeter && greeterHov && (
            <g>
              <rect x={greeterX-70} y={greeterY-88} width="140" height="20" rx="4" fill="#050A08" stroke={`${accent}44`}/>
              <text x={greeterX} y={greeterY-74} textAnchor="middle" fill={accent} fontSize="9" fontFamily="Cinzel,serif">Ratu Seru</text>
            </g>
          )}

          {canClickTree && (
            <circle cx={treeFocusX} cy={treeFocusY} r={treeHov?68:52} fill="none" stroke="#C8941A" strokeWidth="2" opacity={treeHov?0.65:0.32} style={{ transition:"all 0.25s" }}/>
          )}
          {canClickTree && (
            <rect x="460" y="95" width="200" height="160" fill="transparent" style={{ cursor:"pointer" }}
              onMouseEnter={()=>setTreeHov(true)} onMouseLeave={()=>setTreeHov(false)} onClick={handleTreeClick}/>
          )}
          {canClickTree && treeHov && (
            <g>
              <rect x={treeFocusX-54} y={treeFocusY-108} width="108" height="18" rx="4" fill="#050A08" stroke={`${accent}44`}/>
              <text x={treeFocusX} y={treeFocusY-94} textAnchor="middle" fill={accent} fontSize="9" fontFamily="Cinzel,serif">colorful birds</text>
            </g>
          )}

          {treeClicked && (
            <g>
              <rect x={treeFocusX-120} y={treeFocusY-150} width="240" height="52" rx="8" fill="#050A08" stroke={`${accent}55`}/>
              <path d={`M${treeFocusX-14},${treeFocusY-98} L${treeFocusX-4},${treeFocusY-86} L${treeFocusX+8},${treeFocusY-98}`} fill="#050A08" stroke={`${accent}55`}/>
              <text x={treeFocusX} y={treeFocusY-128} textAnchor="middle" fill="#A8C8B8" fontSize="10.5" fontFamily="Georgia,serif" fontStyle="italic">Two collared lories. They nest on these reef islands.</text>
              <text x={treeFocusX} y={treeFocusY-112} textAnchor="middle" fill="#A8C8B8" fontSize="10.5" fontFamily="Georgia,serif" fontStyle="italic">Beautiful birds — and very loud, apparently.</text>
              <text x={treeFocusX} y={treeFocusY-96} textAnchor="middle" fill={accent} fontSize="8" fontFamily="Cinzel,serif">— PALU HEMI</text>
            </g>
          )}
        </svg>

        {phase === "palu" && (
          <div onClick={handlePaluClick} style={{ position:"absolute", bottom:0, left:0, right:0, background:"rgba(4,10,6,0.9)", borderTop:`1px solid ${accent}33`, padding:"18px 28px 14px", cursor:"pointer", userSelect:"none" }}>
            <div style={{ fontFamily:"Georgia,serif", fontSize:"15px", color:"#A8D0C0", lineHeight:"1.75", fontStyle:"italic", marginBottom:"8px" }}>{`"${paluLinesFiji[lineIdx]}"`}</div>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <span style={{ fontFamily:"Cinzel,serif", fontSize:"9px", color:accent, letterSpacing:"0.08em" }}>— PALU HEMI</span>
              <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                <div style={{ display:"flex", gap:"6px" }}>
                  {paluLinesFiji.map((_,i) => (
                    <div key={i} style={{ width:i===lineIdx?14:7, height:7, borderRadius:4, background:i<=lineIdx?accent:"#0A2018", transition:"all 0.25s" }}/>
                  ))}
                </div>
                <span style={{ fontFamily:"Cinzel,serif", fontSize:"9px", color:accent, opacity:0.55, letterSpacing:"0.06em" }}>
                  {lineIdx < paluLinesFiji.length - 1 ? "click to continue →" : "click the birds in the tree →"}
                </span>
              </div>
            </div>
          </div>
        )}

        {phase === "exchange" && (
          <div style={{ position:"absolute", bottom:0, left:0, right:0, background:"rgba(4,12,8,0.97)", borderTop:`1px solid ${accent}44`, padding:"22px 28px", display:"flex", flexDirection:"column", gap:"14px" }}>
            <div style={{ fontFamily:"Cinzel,serif", fontSize:"10px", color:accent, letterSpacing:"0.16em", opacity:0.75 }}>RATU SERU · FIJIAN NAVIGATOR</div>
            <div style={{ fontFamily:"Georgia,serif", fontSize:"15px", color:"#A8C8B0", lineHeight:"1.7", fontStyle:"italic" }}>
              "The birds brought you here, as they have brought navigators for a thousand years. We have been watching your approach since dawn — the way you tracked the tern flight pattern. Let me share what we know of the bird roads south toward Tonga."
            </div>
            <button type="button" onClick={handleLearnBirds} style={{ alignSelf:"flex-start", padding:"13px 20px", borderRadius:"6px", cursor:"pointer", fontFamily:"Cinzel,serif", fontSize:"11px", fontWeight:"700", letterSpacing:"0.08em", border:`1px solid ${accent}`, background:`${accent}14`, color:accent }}>
              Learn the bird roads →
            </button>
          </div>
        )}

        {phase === "matala" && (
          <div style={{ position:"absolute", bottom:0, left:0, right:0, background:"rgba(4,12,8,0.94)", borderTop:`1px solid ${accent}33`, padding:"18px 28px 16px", display:"flex", flexDirection:"column", gap:"12px" }}>
            <div style={{ fontFamily:"Georgia,serif", fontSize:"15px", color:"#A8C8B0", lineHeight:"1.7", fontStyle:"italic" }}>&quot;She has been waiting a long time for this.&quot;</div>
            <div style={{ fontFamily:"Georgia,serif", fontSize:"15px", color:"#8AB0A0", lineHeight:"1.7", fontStyle:"italic" }}>&quot;I think we can say the mission is complete.&quot;</div>
            <div style={{ fontFamily:"Cinzel,serif", fontSize:"9px", color:accent, letterSpacing:"0.08em" }}>— PALU HEMI</div>
            <button type="button" onClick={handleMatalaOk} style={{ alignSelf:"flex-start", padding:"12px 18px", borderRadius:"6px", cursor:"pointer", fontFamily:"Cinzel,serif", fontSize:"11px", fontWeight:"700", letterSpacing:"0.1em", border:`1px solid ${accent}`, background:`${accent}12`, color:accent }}>OK →</button>
          </div>
        )}

        {storyVis && phase === "story" && (
          <div style={{ position:"absolute", bottom:0, left:0, right:0, background:"rgba(4,12,8,0.97)", borderTop:`1px solid ${accent}44`, padding:"22px 28px 20px", display:"flex", flexDirection:"column", gap:"16px" }}>
            <div style={{ display:"flex", gap:"24px", alignItems:"flex-start", flexWrap:"wrap" }}>
              <div style={{ flex:"1 1 280px", minWidth:0 }}>
                <div style={{ fontFamily:"Cinzel,serif", fontSize:"9px", color:accent, letterSpacing:"0.2em", marginBottom:"8px", opacity:0.7 }}>{`NAVIGATOR'S KNOWLEDGE`}</div>
                <div style={{ fontFamily:"Cinzel,serif", fontSize:"15px", fontWeight:"700", color:"#E8D8A8", marginBottom:"10px" }}>{b.storyTitle}</div>
                <div style={{ fontFamily:"Georgia,serif", fontSize:"13px", color:"#7AACBE", lineHeight:"1.8", fontStyle:"italic", borderLeft:`2px solid ${accent}44`, paddingLeft:"14px" }}>{b.story}</div>
                <div style={{ fontFamily:"Cinzel,serif", fontSize:"8.5px", color:`${accent}55`, letterSpacing:"0.1em", marginTop:"8px" }}>— {b.storyCitation}</div>
              </div>
              <div style={{ width:"240px", flexShrink:0, display:"flex", flexDirection:"column", gap:"10px" }}>
                <div style={{ fontFamily:"Cinzel,serif", fontSize:"9px", color:accent, letterSpacing:"0.2em", opacity:0.7 }}>IN YOUR BAG</div>
                {birdItem && (
                  <div style={{ display:"flex", alignItems:"flex-start", gap:"10px", padding:"11px 12px", background:`${birdItem.color}10`, border:`1px solid ${birdItem.color}33`, borderRadius:"8px" }}>
                    <span style={{ fontSize:"22px" }}>{birdItem.icon}</span>
                    <div>
                      <div style={{ fontFamily:"Cinzel,serif", fontSize:"12px", fontWeight:"700", color:"#D0C8A8" }}>{birdItem.name}</div>
                      <div style={{ fontFamily:"Cinzel,serif", fontSize:"8px", color:`${birdItem.color}99`, marginTop:"2px" }}>{birdItem.hawaiian}</div>
                    </div>
                  </div>
                )}
                <div style={{ fontFamily:"Georgia,serif", fontSize:"12px", color:"#5A7080", lineHeight:"1.6", fontStyle:"italic" }}>{b.bagNote}</div>
                <button type="button" onClick={handleOkAfterStory} style={{ padding:"11px", borderRadius:"6px", cursor:"pointer", fontFamily:"Cinzel,serif", fontSize:"11px", fontWeight:"700", letterSpacing:"0.12em", border:`1px solid ${accent}`, background:`${accent}14`, color:accent }}>OK →</button>
              </div>
            </div>
          </div>
        )}

        {showFarewell && (
          <div style={{ position:"absolute", inset:0, background:"rgba(4,10,8,0.88)", backdropFilter:"blur(2px)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <div style={{ maxWidth:"480px", width:"90%", display:"flex", flexDirection:"column", gap:"20px", textAlign:"center" }}>
              <div style={{ fontFamily:"Cinzel,serif", fontSize:"11px", color:accent, letterSpacing:"0.2em", opacity:0.7 }}>PALU HEMI</div>
              <div style={{ fontFamily:"Georgia,serif", fontSize:"17px", color:"#A8C8B0", lineHeight:"1.8", fontStyle:"italic" }}>&quot;{b.bridgeLine}&quot;</div>
              <button type="button" onClick={onReturn} style={{ padding:"14px 32px", borderRadius:"6px", cursor:"pointer", fontFamily:"Cinzel,serif", fontSize:"12px", fontWeight:"700", letterSpacing:"0.14em", border:`1px solid ${accent}`, background:`${accent}14`, color:accent, alignSelf:"center" }}>RETURN TO THE OCEAN →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


function BridgeScreen({ moduleNum, name, onReturn }) {
  const b      = BRIDGE_CONTENT[moduleNum];
  const m      = MODULE_CONTENT[moduleNum];
  const accent = m.accent;

  // Click-through phases: palu → story → bag → return
  // lineIdx tracks which Palu line is showing; phase advances on click
  const [lineIdx,   setLineIdx]   = useState(0);
  const [phase,     setPhase]     = useState("palu"); // palu | story | bag | done

  const handleAdvance = () => {
    if (phase === "palu") {
      if (lineIdx < b.paluLines.length - 1) {
        setLineIdx(i => i + 1);
      } else {
        setPhase("story");
      }
    } else if (phase === "story") {
      setPhase("bag");
    } else if (phase === "bag") {
      setPhase("done");
    }
  };

  const particles = Array.from({length:40},(_,i)=>({ x:((i*137+41)%97)/97*100, y:((i*79+23)%89)/89*100, r:i%7===0?1.2:0.6, op:0.06+(i%5)*0.05 }));

  const currentLine = b.paluLines[lineIdx]?.replace("{{name}}", name) ?? "";
  const isLastLine  = lineIdx === b.paluLines.length - 1;

  return (
    <div style={{ width:"100%", height:"100%", background:"#08100A", display:"flex", flexDirection:"column", overflow:"hidden", position:"relative" }}>

      {/* Header */}
      <div style={{ height:"44px", borderBottom:`1px solid ${accent}33`, background:"rgba(8,16,10,0.97)", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 28px", flexShrink:0, zIndex:2 }}>
        <span style={{ fontFamily:"Cinzel,serif", fontSize:"12px", fontWeight:"700", color:"#C8941A", letterSpacing:"0.12em" }}>OCEAN ADVENTURE</span>
        <div style={{ fontFamily:"Cinzel,serif", fontSize:"10px", color:`${accent}88`, letterSpacing:"0.18em" }}>ARRIVED · {(b.destination || "").toUpperCase()}</div>
      </div>

      {/* Ambient particles */}
      <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none", zIndex:0 }}>
        {particles.map((s,i)=><circle key={i} cx={`${s.x}%`} cy={`${s.y}%`} r={s.r} fill={accent} opacity={s.op}/>)}
      </svg>

      {/* Main content */}
      <div style={{ flex:1, display:"flex", overflow:"hidden", minHeight:0, zIndex:1 }}>

        {/* Left — always visible */}
      <div style={{ width:"320px", flexShrink:0, borderRight:`1px solid ${accent}18`, display:"flex", flexDirection:"column" }}>
          <div style={{ padding:"28px 24px", display:"flex", flexDirection:"column", gap:"22px", flex:1 }}>

            {/* Arrival tag */}
            <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
              <div style={{ fontFamily:"Cinzel,serif", fontSize:"10px", color:accent, letterSpacing:"0.2em", opacity:0.7 }}>ARRIVED · {(b.destination || "").toUpperCase()}</div>
              <div style={{ flex:1, height:"1px", background:`linear-gradient(to right, ${accent}44, transparent)` }}/>
            </div>

            {/* Scene icon */}
            <div style={{ fontSize:"52px", lineHeight:1, filter:`drop-shadow(0 0 20px ${accent}44)` }}>{b.arrivalScene}</div>

            {/* Current Palu line */}
            {phase === "palu" && (
              <div style={{ fontFamily:"Georgia,serif", fontSize:"15px", color:"#A8C8C0", lineHeight:"1.8", fontStyle:"italic", borderLeft:`2px solid ${accent}55`, paddingLeft:"16px" }}>
                "{currentLine}"
              </div>
            )}

            {/* Progress dots during palu phase */}
            {phase === "palu" && b.paluLines.length > 1 && (
              <div style={{ display:"flex", gap:"7px" }}>
                {b.paluLines.map((_,i) => (
                  <div key={i} style={{ width:i===lineIdx?14:7, height:7, borderRadius:4, background:i<=lineIdx?accent:"#1A3020", transition:"all 0.25s" }}/>
                ))}
              </div>
            )}

            {/* Bridge line — shown in done phase */}
            {phase === "done" && (
              <div style={{ padding:"14px 16px", background:`${accent}0E`, border:`1px solid ${accent}33`, borderRadius:"6px", fontFamily:"Georgia,serif", fontSize:"14px", color:accent, lineHeight:"1.7", fontStyle:"italic" }}>
                "{b.bridgeLine}"
              </div>
            )}

            {/* Continue / Return button */}
            <div style={{ marginTop:"auto" }}>
              {phase !== "done" ? (
                <button onClick={handleAdvance} style={{ width:"100%", padding:"13px", borderRadius:"6px", fontFamily:"Cinzel,serif", fontSize:"11px", fontWeight:"700", letterSpacing:"0.14em", cursor:"pointer", border:`1px solid ${accent}`, background:`${accent}18`, color:accent }}>
                  {phase === "palu" && !isLastLine ? "CONTINUE →" :
                   phase === "palu" && isLastLine  ? "NAVIGATOR'S KNOWLEDGE →" :
                   phase === "story"               ? "SEE WHAT'S IN YOUR BAG →" :
                                                     "CONTINUE →"}
                </button>
              ) : (
                <button onClick={onReturn} style={{ width:"100%", padding:"13px", borderRadius:"6px", fontFamily:"Cinzel,serif", fontSize:"11px", fontWeight:"700", letterSpacing:"0.14em", cursor:"pointer", border:`1px solid ${accent}`, background:`${accent}18`, color:accent }}>
                  RETURN TO THE OCEAN →
                </button>
              )}
            </div>

          </div>
        </div>

        {/* Right — story then bag, revealed by phase */}
        <div style={{ flex:1, overflowY:"auto", display:"flex", flexDirection:"column" }}>

          {/* Cultural story */}
          {(phase === "story" || phase === "bag" || phase === "done") && (
            <div style={{ padding:"28px 32px 24px" }}>
              <div style={{ fontFamily:"Cinzel,serif", fontSize:"9px", color:accent, letterSpacing:"0.2em", marginBottom:"12px", opacity:0.7 }}>NAVIGATOR'S KNOWLEDGE</div>
              <div style={{ fontFamily:"Cinzel,serif", fontSize:"16px", fontWeight:"700", color:"#E8D8A8", marginBottom:"16px", lineHeight:"1.3" }}>{b.storyTitle}</div>
              <div style={{ fontFamily:"Georgia,serif", fontSize:"14px", color:"#7AACBE", lineHeight:"1.85", fontStyle:"italic", borderLeft:`2px solid ${accent}44`, paddingLeft:"18px", marginBottom:"12px" }}>
                {b.story}
              </div>
              <div style={{ fontFamily:"Cinzel,serif", fontSize:"9px", color:`${accent}55`, letterSpacing:"0.1em" }}>— {b.storyCitation}</div>
            </div>
          )}

          {/* Divider */}
          {(phase === "bag" || phase === "done") && (
            <div style={{ height:"1px", background:`${accent}18`, margin:"0 32px" }}/>
          )}

          {/* Bag items */}
          {(phase === "bag" || phase === "done") && (
            <div style={{ padding:"24px 32px 32px" }}>
              <div style={{ fontFamily:"Cinzel,serif", fontSize:"9px", color:accent, letterSpacing:"0.2em", marginBottom:"14px", opacity:0.7 }}>ADDED TO YOUR BAG</div>
              <div style={{ display:"flex", flexDirection:"column", gap:"10px", marginBottom:"16px" }}>
                {b.bagItems.map(itemId => {
                  const item = BAG_ITEMS.find(bi => bi.id === itemId);
                  if (!item) return null;
                  return (
                    <div key={itemId} style={{ display:"flex", alignItems:"center", gap:"14px", padding:"11px 14px", background:`${item.color}10`, border:`1px solid ${item.color}33`, borderRadius:"8px" }}>
                      <span style={{ fontSize:"22px", flexShrink:0 }}>{item.icon}</span>
                      <div>
                        <div style={{ fontFamily:"Cinzel,serif", fontSize:"13px", fontWeight:"700", color:"#D0C8A8" }}>{item.name}</div>
                        <div style={{ fontFamily:"Cinzel,serif", fontSize:"9px", color:`${item.color}99`, letterSpacing:"0.06em", marginTop:"2px" }}>{item.hawaiian}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ fontFamily:"Georgia,serif", fontSize:"13px", color:"#5A8090", lineHeight:"1.7", fontStyle:"italic" }}>
                {b.bagNote}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}



/* ══════════════════════════════════════════════════════════════
   NAVIGATOR'S BAG
══════════════════════════════════════════════════════════════ */

/* ══════════════════════════════════════════════════════════════
   BAG INTRO POPUP — shown once on first map visit
══════════════════════════════════════════════════════════════ */

function BagIntroPopup({ onDismiss, onOpenBag }) {
  return (
    <div style={{ position:"fixed", inset:0, zIndex:90, pointerEvents:"none" }}>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={onDismiss}
        style={{
          position:"absolute", inset:0,
          background:"rgba(2,5,12,0.55)",
          backdropFilter:"blur(1px)",
          pointerEvents:"auto",
          border:"none",
          padding:0,
          margin:0,
          cursor:"pointer",
        }}
      />
      <div style={{
        position:"absolute", top:"56px", right:"16px",
        width:"280px", background:"rgba(6,12,24,0.98)", border:"1px solid #C8941A55",
        borderRadius:"12px", padding:"20px", zIndex:91, pointerEvents:"auto",
        boxShadow:"0 0 40px rgba(200,148,26,0.2)",
      }}>
        <div style={{ position:"absolute", top:"-10px", right:"22px", width:0, height:0, borderLeft:"9px solid transparent", borderRight:"9px solid transparent", borderBottom:"10px solid #C8941A55" }}/>
        <div style={{ position:"absolute", top:"-8px", right:"23px", width:0, height:0, borderLeft:"8px solid transparent", borderRight:"8px solid transparent", borderBottom:"9px solid rgba(6,12,24,0.98)" }}/>
        <div style={{ fontFamily:"Cinzel,serif", fontSize:"13px", fontWeight:"700", color:"#C8941A", marginBottom:"10px" }}>✦ Navigator's Bag</div>
        <div style={{ fontFamily:"Georgia,serif", fontSize:"14px", color:"#7AACBE", lineHeight:"1.75", fontStyle:"italic", marginBottom:"12px" }}>
          "Everything you collect on this voyage lives here — tools, knowledge, and gifts. Check it whenever you need a reminder of what you carry."
        </div>
        <div style={{ fontFamily:"Georgia,serif", fontSize:"13px", color:"#8ABCB0", lineHeight:"1.65", fontStyle:"italic", marginBottom:"18px" }}>
          "To start, you are carrying the chief's sweet potato cuttings. Guard them well."
        </div>
        <div style={{ display:"flex", gap:"8px" }}>
          <button onClick={onOpenBag} style={{ flex:1, padding:"10px 14px", borderRadius:"6px", cursor:"pointer", fontFamily:"Cinzel,serif", fontSize:"10px", fontWeight:"700", letterSpacing:"0.12em", border:"1px solid #C8941A", background:"rgba(200,148,26,0.14)", color:"#C8941A" }}>OPEN BAG →</button>
          <button onClick={onDismiss} style={{ flex:1, padding:"10px 14px", borderRadius:"6px", cursor:"pointer", fontFamily:"Cinzel,serif", fontSize:"10px", fontWeight:"700", letterSpacing:"0.1em", border:"1px solid #1A3050", background:"none", color:"#3A6070" }}>UNDERSTOOD</button>
        </div>
      </div>
    </div>
  );
}

function MapNavPopup({ onDismiss }) {
  return (
    <div style={{ position:"fixed", inset:0, zIndex:90, pointerEvents:"none" }}>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={onDismiss}
        style={{
          position:"absolute", inset:0,
          background:"rgba(2,5,12,0.45)",
          backdropFilter:"blur(1px)",
          pointerEvents:"auto",
          border:"none",
          padding:0,
          margin:0,
          cursor:"pointer",
        }}
      />
      <div style={{
        position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)",
        width:"320px", background:"rgba(6,12,24,0.98)", border:"1px solid #C8941A55",
        borderRadius:"12px", padding:"24px", zIndex:91, pointerEvents:"auto",
        boxShadow:"0 0 60px rgba(200,148,26,0.15)",
      }}>
        <div style={{ fontFamily:"Cinzel,serif", fontSize:"11px", color:"#C8941A", letterSpacing:"0.18em", opacity:0.7, marginBottom:"12px" }}>PALU HEMI</div>
        <div style={{ fontFamily:"Georgia,serif", fontSize:"15px", color:"#A8C8C0", lineHeight:"1.75", fontStyle:"italic", marginBottom:"20px" }}>
          "Now — see that glowing island to the northeast? That is our first destination, Sāmoa. Click it on the map to begin your first navigation challenge."
        </div>
        <button onClick={onDismiss} style={{ width:"100%", padding:"12px", borderRadius:"6px", cursor:"pointer", fontFamily:"Cinzel,serif", fontSize:"11px", fontWeight:"700", letterSpacing:"0.12em", border:"1px solid #C8941A", background:"rgba(200,148,26,0.14)", color:"#C8941A" }}>
          I SEE IT →
        </button>
      </div>
    </div>
  );
}


function ItemCard({ itemId, onConfirm }) {
  const item = BAG_ITEMS.find(i => i.id === itemId);
  if (!item) return null;

  // Context line — explains why this item is appearing now
  const context = {
    sweet_potato_seeds: "The king of Tonga has entrusted you with these seeds. They are your mission.",
    star_compass:       "You found the star. You held the heading. The compass now lives in your mind.",
    samoan_star_map:    "Tautai Faleolo presses the star map into your hands.",
    wayfarers_notebook: "A notebook to carry what you learn. The ocean does not repeat itself.",
    sun_arc:            "The sun has spoken. You know Tahiti's latitude without a single instrument.",
    wave_reader:        "Three days on the open ocean. You read the swell — Palu barely had to say a word.",
    taro_plant:         "Hina of Nuku Hiva places the cutting carefully in your hands. Water it each day.",
    wind_reader:        "The doldrums tried to stop you. The wind could not hide from you.",
    bird_guide:         "Ratu Seru shares the bird roads freely. This knowledge has guided navigators for a thousand years.",
    cloud_reader:       "Sky, sea, cloud, debris. You have learned every sign the ocean gives.",
  }[itemId] || "A new item joins your bag.";

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 300,
      background: "rgba(2,4,10,0.88)",
      backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px",
    }}>
      <div style={{
        maxWidth: "420px", width: "100%",
        background: "rgba(6,12,22,0.98)",
        border: `1px solid ${item.color}55`,
        borderRadius: "14px",
        padding: "36px 32px",
        display: "flex", flexDirection: "column", alignItems: "center",
        gap: "20px", textAlign: "center",
        boxShadow: `0 0 80px ${item.color}18`,
      }}>

        {/* Glow ring + icon */}
        <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{
            width: "80px", height: "80px", borderRadius: "50%",
            background: `${item.color}12`,
            border: `1px solid ${item.color}33`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "36px",
          }}>
            {item.icon}
          </div>
        </div>

        {/* Tag */}
        <div style={{ fontFamily: "Cinzel,serif", fontSize: "9px", color: item.color, letterSpacing: "0.28em", opacity: 0.7 }}>
          ADDED TO YOUR BAG
        </div>

        {/* Item name */}
        <div style={{ fontFamily: "Cinzel,serif", fontSize: "26px", fontWeight: "900", color: "#E8D8A8", lineHeight: "1.1" }}>
          {item.name}
        </div>

        {/* Hawaiian name */}
        <div style={{ fontFamily: "Cinzel,serif", fontSize: "11px", color: `${item.color}99`, letterSpacing: "0.1em" }}>
          {item.hawaiian}
        </div>

        {/* Divider */}
        <div style={{ width: "40px", height: "1px", background: `linear-gradient(to right, transparent, ${item.color}66, transparent)` }}/>

        {/* Context — Palu's voice */}
        <div style={{ fontFamily: "Georgia,serif", fontSize: "15px", color: "#8ABCB0", fontStyle: "italic", lineHeight: "1.75" }}>
          "{context}"
        </div>

        {/* First content entry as a small note */}
        {item.content && item.content[0] && (
          <div style={{
            background: `${item.color}08`,
            border: `1px solid ${item.color}22`,
            borderRadius: "8px",
            padding: "12px 16px",
            display: "flex", flexDirection: "column", gap: "4px",
          }}>
            <div style={{ fontFamily: "Cinzel,serif", fontSize: "9px", color: item.color, letterSpacing: "0.12em", opacity: 0.8 }}>
              {item.content[0].label.toUpperCase()}
            </div>
            <div style={{ fontFamily: "Georgia,serif", fontSize: "13px", color: "#6A9898", fontStyle: "italic", lineHeight: "1.65" }}>
              {item.content[0].body}
            </div>
          </div>
        )}

        {/* Palu note (if paluNote field exists) */}
        {item.paluNote && (
          <div style={{ fontFamily: "Georgia,serif", fontSize: "12px", color: "#3A6050", fontStyle: "italic", lineHeight: "1.6" }}>
            Palu's note: "{item.paluNote}"
          </div>
        )}

        {/* Confirm button */}
        <button onClick={onConfirm} style={{
          width: "100%",
          padding: "14px",
          borderRadius: "8px",
          cursor: "pointer",
          fontFamily: "Cinzel,serif",
          fontSize: "12px",
          fontWeight: "700",
          letterSpacing: "0.14em",
          border: `1px solid ${item.color}`,
          background: `${item.color}18`,
          color: item.color,
          marginTop: "4px",
        }}>
          ADD TO MY BAG →
        </button>

      </div>
    </div>
  );
}


function NavigatorsBag({ open, onClose, unlocked }) {
  const [activeItem, setActiveItem] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  if (!open) return null;
  const item = activeItem ? BAG_ITEMS.find(b => b.id === activeItem) : null;
  const unlockedItems = BAG_ITEMS.filter(it => unlocked.includes(it.id));
  const remaining = BAG_ITEMS.length - unlockedItems.length;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", justifyContent: "flex-end" }}>
      <button
        type="button"
        aria-label="Close Navigator's Bag"
        onClick={onClose}
        style={{
          position:"absolute",
          inset:0,
          background:"rgba(2,5,12,0.72)",
          backdropFilter:"blur(3px)",
          border:"none",
          padding:0,
          margin:0,
          cursor:"pointer",
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navigator's Bag"
        style={{ position: "relative", width: "340px", height: "100%", background: "#06101E", borderLeft: "1px solid #1A2E48", display: "flex", flexDirection: "column", overflow: "hidden" }}
      >

        <div style={{ padding: "18px 20px 14px", borderBottom: "1px solid #0E1E30", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div>
            <div style={{ fontFamily: "Cinzel,serif", fontSize: "14px", fontWeight: "700", color: "#C8941A" }}>Navigator's Bag</div>
            <div style={{ fontFamily: "Cinzel,serif", fontSize: "9px", color: "#2A4860", letterSpacing: "0.12em", marginTop: "2px" }}>KIT KETE · YOUR KNOWLEDGE</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "1px solid #1A2E48", borderRadius: "4px", color: "#3A5870", fontSize: "14px", cursor: "pointer", padding: "4px 9px", fontFamily: "Cinzel,serif" }}>✕</button>
        </div>

        {!activeItem ? (
          <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "14px" }}>

            {/* Intro blurb */}
            <div style={{ padding: "12px 14px", background: "rgba(200,148,26,0.06)", border: "1px solid #C8941A22", borderRadius: "7px" }}>
              <div style={{ fontFamily: "Georgia,serif", fontSize: "12px", color: "#7AACBE", lineHeight: "1.65", fontStyle: "italic" }}>
                Everything you collect on the voyage lives here — tools, gifts, knowledge. Each item has a story. Tap any item to read it.
              </div>
            </div>

            {/* Collected items */}
            {unlockedItems.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ fontSize: "9px", color: "#2A4860", fontFamily: "Cinzel,serif", letterSpacing: "0.14em" }}>
                  {unlockedItems.length} ITEM{unlockedItems.length !== 1 ? "S" : ""} COLLECTED
                </div>
                {unlockedItems.map(it => (
                  <div
                    key={it.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`Toggle note for ${it.name}`}
                    onClick={() => setExpandedId(prev => prev === it.id ? null : it.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") setExpandedId(prev => prev === it.id ? null : it.id);
                    }}
                    style={{
                      padding: "13px 15px",
                      borderRadius: "7px",
                      border: `1px solid ${it.color}44`,
                      background: `${it.color}0C`,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "13px",
                      width: "100%",
                      textAlign: "left",
                      position: "relative",
                      outline: "none",
                      userSelect: "none",
                    }}
                  >
                    <div style={{ position:"absolute", top:"9px", right:"10px", fontFamily:"Cinzel,serif", fontSize:"10px", color:"#2A4860", opacity:0.75, pointerEvents:"none" }}>
                      {expandedId === it.id ? "↑" : "↓"}
                    </div>
                    <div style={{ fontSize: "22px", width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", background: `${it.color}18`, borderRadius: "6px", flexShrink: 0, filter: `drop-shadow(0 0 8px ${it.color}66)` }}>
                      {it.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "Cinzel,serif", fontSize: "12px", fontWeight: "700", color: "#D0C8A8" }}>{it.name}</div>
                      <div style={{ fontFamily: "Cinzel,serif", fontSize: "9px", color: it.color, letterSpacing: "0.06em", marginTop: "2px" }}>{it.hawaiian}</div>
                      {expandedId === it.id && it.paluNote && (
                        <div style={{
                          marginTop: "8px",
                          paddingTop: "8px",
                          borderTop: "1px solid rgba(255,255,255,0.06)",
                          fontFamily: "Georgia,serif",
                          fontSize: "12px",
                          color: "#5A8090",
                          fontStyle: "italic",
                          lineHeight: "1.65",
                        }}>
                          "{it.paluNote}"
                          <div style={{ fontFamily:"Cinzel,serif", fontSize:"8px", color:"#2A4050", letterSpacing:"0.08em", marginTop:"6px" }}>— PALU HEMI</div>
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      aria-label={`Open ${it.name}`}
                      onClick={(e) => { e.stopPropagation(); setActiveItem(it.id); }}
                      style={{
                        background: "none",
                        border: "1px solid rgba(255,255,255,0.06)",
                        borderRadius: "6px",
                        color: "#2A4860",
                        fontSize: "14px",
                        cursor: "pointer",
                        padding: "4px 10px",
                        marginLeft: "6px",
                        flexShrink: 0,
                      }}
                    >
                      ›
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Remaining count hint */}
            {remaining > 0 && (
              <div style={{ padding: "10px 14px", border: "1px solid #0E1E30", borderRadius: "7px", display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ fontSize: "18px", opacity: 0.3 }}>✦</div>
                <div style={{ fontFamily: "Cinzel,serif", fontSize: "10px", color: "#1E3448", letterSpacing: "0.08em" }}>
                  {remaining} more item{remaining !== 1 ? "s" : ""} to discover on the voyage
                </div>
              </div>
            )}

          </div>
        ) : (
          <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
            <button onClick={() => setActiveItem(null)} style={{ background: "none", border: "none", color: "#3A6080", fontSize: "11px", fontFamily: "Cinzel,serif", cursor: "pointer", marginBottom: "14px", letterSpacing: "0.08em", padding: 0 }}>← BACK TO BAG</button>
            <div style={{ marginBottom: "16px" }}>
              <div style={{ fontSize: "24px", marginBottom: "6px", filter: `drop-shadow(0 0 10px ${item.color}88)` }}>{item.icon}</div>
              <div style={{ fontFamily: "Cinzel,serif", fontSize: "16px", fontWeight: "700", color: item.color }}>{item.name}</div>
              <div style={{ fontFamily: "Cinzel,serif", fontSize: "10px", color: "#2A4860", letterSpacing: "0.1em", marginTop: "2px" }}>{item.hawaiian}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {item.content.map((c, i) => (
                <div key={i} style={{ padding: "12px 14px", background: "rgba(255,255,255,0.03)", border: `1px solid ${item.color}22`, borderRadius: "6px", borderLeft: `3px solid ${item.color}66` }}>
                  <div style={{ fontFamily: "Cinzel,serif", fontSize: "10.5px", fontWeight: "700", color: item.color, marginBottom: "5px", letterSpacing: "0.06em" }}>{c.label}</div>
                  <div style={{ fontFamily: "Georgia,serif", fontSize: "12px", color: "#7A9AAE", lineHeight: "1.6", fontStyle: "italic" }}>{c.body}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   VOYAGE MAP
══════════════════════════════════════════════════════════════ */

/* ══════════════════════════════════════════════════════════════
   CREDITS SCREEN — cinematic scrolling, accessible from map + end
══════════════════════════════════════════════════════════════ */

function CreditsSection({ title, color, children }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"18px" }}>
      <div style={{ display:"flex", alignItems:"center", gap:"16px" }}>
        <div style={{ flex:1, height:"1px", background:`linear-gradient(to right, transparent, ${color}55)` }}/>
        <div style={{ fontFamily:"Cinzel,serif", fontSize:"10px", color:color, letterSpacing:"0.28em", opacity:0.9 }}>{title}</div>
        <div style={{ flex:1, height:"1px", background:`linear-gradient(to left, transparent, ${color}55)` }}/>
      </div>
      {children}
    </div>
  );
}

function CreditsEntry({ title, sub, detail, url, color = "#C8C0A0", accent }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"5px", textAlign:"center" }}>
      {title && (
        <div style={{ fontFamily:"Cinzel,serif", fontSize:"14px", fontWeight:"700", color }}>
          {url
            ? <a href={url} target="_blank" rel="noopener noreferrer"
                style={{ color, textDecoration:"none", borderBottom:`1px solid ${accent}44` }}>{title} ↗</a>
            : title}
        </div>
      )}
      {sub && <div style={{ fontFamily:"Cinzel,serif", fontSize:"10px", color:`${color}88`, letterSpacing:"0.1em" }}>{sub}</div>}
      {detail && <div style={{ fontFamily:"Georgia,serif", fontSize:"13px", color:"#4A7080", lineHeight:"1.75", fontStyle:"italic", maxWidth:"520px", margin:"0 auto" }}>{detail}</div>}
    </div>
  );
}

function CreditsDivider({ accent }) {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"16px", padding:"8px 0" }}>
      <div style={{ width:"40px", height:"1px", background:`${accent}33` }}/>
      <span style={{ color:`${accent}44`, fontSize:"10px" }}>✦</span>
      <div style={{ width:"40px", height:"1px", background:`${accent}33` }}/>
    </div>
  );
}

function CreditsScreen({ onBack }) {
  const [scrolling, setScrolling] = useState(false);
  const containerRef = React.useRef(null);

  // Auto-scroll
  useEffect(() => {
    if (!scrolling) return;
    const id = setInterval(() => {
      if (containerRef.current) {
        containerRef.current.scrollTop += 0.8;
      }
    }, 16);
    return () => clearInterval(id);
  }, [scrolling]);

  const accent = "#C8941A";

  return (
    <div style={{ width:"100%", height:"100%", background:"#04080E", display:"flex", flexDirection:"column", overflow:"hidden" }}>

      {/* Header */}
      <div style={{ height:"44px", borderBottom:`1px solid ${accent}22`, background:"rgba(4,8,18,0.97)", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 28px", flexShrink:0, zIndex:2 }}>
        <span style={{ fontFamily:"Cinzel,serif", fontSize:"12px", fontWeight:"700", color:accent, letterSpacing:"0.12em" }}>OCEAN ADVENTURE</span>
        <div style={{ display:"flex", gap:"10px", alignItems:"center" }}>
          <button onClick={() => setScrolling(s => !s)} style={{ background:"none", border:`1px solid ${accent}33`, borderRadius:"5px", padding:"5px 14px", cursor:"pointer", fontFamily:"Cinzel,serif", fontSize:"9px", color:`${accent}99`, letterSpacing:"0.1em" }}>
            {scrolling ? "⏸ PAUSE" : "▶ SCROLL"}
          </button>
          <button onClick={onBack} style={{ background:"none", border:`1px solid ${accent}33`, borderRadius:"5px", padding:"5px 14px", cursor:"pointer", fontFamily:"Cinzel,serif", fontSize:"9px", color:`${accent}99`, letterSpacing:"0.1em" }}>← BACK</button>
        </div>
      </div>

      {/* Star field */}
      <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none", zIndex:0 }}>
        {Array.from({length:80},(_,i)=>({
          x:((i*137+41)%97)/97*100, y:((i*79+23)%89)/89*100,
          r:i%11===0?1.4:i%5===0?0.9:0.5, op:0.05+(i%7)*0.04
        })).map((s,i)=>(
          <circle key={i} cx={`${s.x}%`} cy={`${s.y}%`} r={s.r} fill={accent} opacity={s.op}/>
        ))}
      </svg>

      {/* Scrolling content */}
      <div ref={containerRef} style={{ flex:1, overflowY:"auto", zIndex:1, scrollBehavior:"smooth" }}>
        <div style={{ maxWidth:"620px", margin:"0 auto", padding:"60px 32px 120px", display:"flex", flexDirection:"column", gap:"48px", textAlign:"center" }}>

          {/* Title card */}
          <div style={{ display:"flex", flexDirection:"column", gap:"16px", paddingTop:"20px" }}>
            <div style={{ fontFamily:"Cinzel,serif", fontSize:"10px", color:accent, letterSpacing:"0.4em", opacity:0.6 }}>A POLYNESIAN VOYAGING EXPERIENCE</div>
            <div style={{ fontFamily:"Cinzel,serif", fontSize:"36px", fontWeight:"900", color:"#E8D8A8", lineHeight:"1.1" }}>OCEAN ADVENTURE</div>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"16px" }}>
              <div style={{ flex:1, height:"1px", background:`linear-gradient(to right, transparent, ${accent}66)` }}/>
              <span style={{ color:accent, fontSize:"16px" }}>✦</span>
              <div style={{ flex:1, height:"1px", background:`linear-gradient(to left, transparent, ${accent}66)` }}/>
            </div>
            <div style={{ fontFamily:"Georgia,serif", fontSize:"15px", color:"#4A7080", fontStyle:"italic", lineHeight:"1.8" }}>
              This experience is a work in progress. Navigation techniques, cultural details,
              and language are grounded in documented research — but wayfinding knowledge
              is deep, living, and belongs to the communities that hold it. We welcome
              corrections and feedback.
            </div>
          </div>

          <CreditsDivider accent={accent} />

          {/* Inspiration */}
          <CreditsSection title="INSPIRATION" color="#E8C060">
            <CreditsEntry
              title="The Wayfinder"
              sub="Adam Johnson · MCD · 2025"
              detail="An epic novel set in the Polynesian islands during the height of the Tuʻi Tonga Empire. Johnson's decade of immersion in Tongan oral tradition and his portrayal of celestial navigation, outrigger voyaging, and island life was the seed for this experience."
              accent={accent}
            />
          </CreditsSection>

          <CreditsDivider accent={accent} />

          {/* Cultural Foundation */}
          <CreditsSection title="CULTURAL FOUNDATION" color="#2A9A70">
            <CreditsEntry
              title="Mau Piailug (1932–2010)"
              sub="Satawal, Micronesia · Grandmaster Navigator"
              detail="Sailed Hōkūleʻa from Hawaiʻi to Tahiti in 1976 using non-instrument navigation alone, reviving a tradition that had nearly been lost. He taught Nainoa Thompson and, through him, a generation of Pacific navigators. Everything in this experience traces back to him."
              accent={accent}
            />
            <CreditsEntry
              title="Nainoa Thompson"
              sub="Polynesian Voyaging Society · Master Navigator"
              detail="Developed the modern Hawaiian star compass. First Hawaiian in centuries to navigate open ocean without instruments. His published accounts of zenith stars, latitude sailing, and hand measurement are the backbone of the navigation content here."
              url="https://hokulea.com/the-star-compass-by-nainoa-thompson/"
              accent={accent}
            />
            <CreditsEntry
              title="The Polynesian Voyaging Society"
              sub="Hōkūleʻa · hokulea.com"
              detail="The organisation that built Hōkūleʻa, revived the living practice of Pacific wayfinding, and published the navigation research this experience draws on most heavily. Their educational materials are freely available at hokulea.com."
              url="https://hokulea.com"
              accent={accent}
            />
          </CreditsSection>

          <CreditsDivider accent={accent} />

          {/* Academic Sources */}
          <CreditsSection title="RESEARCH & SCHOLARSHIP" color="#7AACBE">
            <CreditsEntry
              title="University of Hawaiʻi · Mānoa"
              sub="Polynesian Voyaging Society Education at Sea"
              detail="The UH-affiliated research into non-instrument wayfinding, estimating position, meridian pairs, and zenith star mechanics provided technical grounding for the Module 2 sun-latitude content."
              url="https://worldwidevoyage.hokulea.com/education-at-sea/polynesian-navigation/polynesian-non-instrument-wayfinding/estimating-position/"
              accent={accent}
            />
            <CreditsEntry
              title="Ben Finney"
              sub="Voyage of Rediscovery · 1994"
              detail="Source of the account of Mau Piailug reading two swell trains simultaneously while lying in the hull of Hōkūleʻa — the foundation of the Module 3 swell content."
              accent={accent}
            />
            <CreditsEntry
              title="David Lewis"
              sub="We the Navigators · 1972"
              detail="The first modern scholarly documentation of living Pacific non-instrument navigation, based on voyages with surviving navigators across Polynesia, Micronesia, and Melanesia."
              accent={accent}
            />
            <CreditsEntry
              title="Harold Gatty"
              sub="The Raft Book · 1943"
              detail="Bird navigation distances, debris drift patterns, and traditional Pacific sea-reading techniques, written as a survival guide for US military aviators."
              accent={accent}
            />
            <CreditsEntry
              title="Jack Thatcher · Te Aurere"
              sub="Kāpehu Whetū · Aotearoa star compass"
              detail="Adapted the Hawaiian star compass into te reo Māori for Aotearoa navigators. Source of Māori compass terminology used in this experience."
              url="https://www.sciencelearn.org.nz/resources/622-the-star-compass-kapehu-whetu"
              accent={accent}
            />
          </CreditsSection>

          <CreditsDivider accent={accent} />

          {/* Language note */}
          <CreditsSection title="A NOTE ON LANGUAGE" color={accent}>
            <div style={{ fontFamily:"Georgia,serif", fontSize:"13px", color:"#4A7080", lineHeight:"1.85", fontStyle:"italic" }}>
              The star compass house names and star names in this experience come directly from
              Nainoa Thompson's published Hawaiian star compass. Other terms draw on Hawaiian,
              Māori, and Samoan language sources of varying reliability. Some were generated
              rather than sourced, and we know they need review by native speakers.
              If you have expertise in Pacific languages and would like to help, please use
              the feedback button — we would be genuinely grateful.
            </div>
          </CreditsSection>

          <CreditsDivider accent={accent} />

          {/* Oral traditions */}
          <CreditsSection title="ORAL TRADITIONS CITED" color="#2A9A70">
            <CreditsEntry title="Māui cycle" detail="Māui lassoing the sun — Polynesian oral tradition, cited in the Module 2 Tama-nui-te-rā bridge screen." accent={accent}/>
            <CreditsEntry title="Kupe's sailing instructions" detail="Māori oral tradition. Kupe's account of navigating to Aotearoa — cited in the Module 6 bridge screen." accent={accent}/>
            <CreditsEntry title="Makanikeoe" detail="A Marquesan wind-spirit narrative, from oral tradition references, cited in the Module 4 wind introduction." accent={accent}/>
          </CreditsSection>

          <CreditsDivider accent={accent} />

          {/* Closing */}
          <div style={{ display:"flex", flexDirection:"column", gap:"14px", paddingTop:"8px" }}>
            <div style={{ fontFamily:"Georgia,serif", fontSize:"15px", color:"#A8C8A0", lineHeight:"1.8", fontStyle:"italic" }}>
              "You cannot look up at the stars and tell where you are.
              It all has to be done in your head."
            </div>
            <div style={{ fontFamily:"Cinzel,serif", fontSize:"10px", color:`${accent}77`, letterSpacing:"0.12em" }}>
              — Nainoa Thompson · Polynesian Voyaging Society
            </div>
          </div>

          <div style={{ fontFamily:"Cinzel,serif", fontSize:"9px", color:"#1A2A38", letterSpacing:"0.2em", paddingBottom:"40px" }}>
            He ao! He ao tea! — A cloud! A white cloud!
          </div>

        </div>
      </div>
    </div>
  );
}

function VoyageMap({ name, onNavigate, unlocked, onOpenBag, onReset, onCredits }) {
  const [hovIsland, setHovIsland] = useState(null);
  const [waveOffset, setWaveOffset] = useState(0);
  const W = 760, H = 500;

  const getIsl = id => ISLANDS.find(i => i.id === id);

  // Progression: which journey step are we on?
  const completionItems = ["star_compass","sun_arc","wave_reader","wind_reader","bird_guide","cloud_reader"];
  const completedCount = completionItems.filter(id => unlocked.includes(id)).length;
  // nextModuleNum = module number of next destination to complete (1-6, or 7 for final)
  const nextModuleNum = completedCount < 6 ? completedCount + 1 : 7;

  const isCompleted = (island) => {
    if (island.isHome) return completedCount === 6; // Tonga return completed after module 6
    if (island.module === null) return false;
    if (island.module === 0) return true; // home always "done"
    return island.module < nextModuleNum;
  };
  const isCurrent = (island) => island.module === nextModuleNum;
  const isLocked  = (island) => {
    if (island.isHome && island.module === 6) return nextModuleNum !== 6;
    if (island.module === null || island.module === 0) return false;
    return island.module > nextModuleNum;
  };
  const isClickable = (island) => isCurrent(island) || (isCompleted(island) && island.module > 0 && !(island.isHome && completedCount < 6));

  // Dynamic sea roads — show only roads we've already travelled
  const visibleRoads = VOYAGE_ROADS.filter(r => completedCount >= r.unlockAfterStep);

  useEffect(() => {
    let frame;
    const tick = () => { setWaveOffset(o => (o + 0.5) % W); frame = requestAnimationFrame(tick); };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  // Star compass rose positions — 8 houses
  const roseHouses = [
    { label:"Ākau",      angle:0,   abbr:"N"   },
    { label:"Koʻolau",   angle:45,  abbr:"NE"  },
    { label:"Hikina",    angle:90,  abbr:"E"   },
    { label:"Malanai",   angle:135, abbr:"SE"  },
    { label:"Hema",      angle:180, abbr:"S"   },
    { label:"Kona",      angle:225, abbr:"SW"  },
    { label:"Komohana",  angle:270, abbr:"W"   },
    { label:"Hoʻolua",   angle:315, abbr:"NW"  },
  ];
  const RCX = W - 68, RCY = 64, RR = 30;

  return (
    <div style={{ width: "100%", height: "100%", background: "#051C2C", display: "flex", flexDirection: "column", overflow: "hidden" }}>

      {/* Header */}
      <div style={{ height: "44px", borderBottom: "1px solid #0A2A3A", background: "rgba(4,14,22,0.97)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 22px", flexShrink: 0 }}>
        <span style={{ fontFamily: "Cinzel,serif", fontSize: "12px", fontWeight: "700", color: "#C8941A", letterSpacing: "0.12em" }}>OCEAN ADVENTURE</span>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontFamily: "Cinzel,serif", fontSize: "10.5px", color: "#1AA090", letterSpacing: "0.09em" }}>HAUMĀNA · {name.toUpperCase()}</span>
          <button onClick={onOpenBag} style={{ background: unlocked.length > 0 ? "rgba(200,148,26,0.14)" : "rgba(255,255,255,0.03)", border: `1px solid ${unlocked.length > 0 ? "#C8941A66" : "#0A2A3A"}`, borderRadius: "5px", padding: "5px 12px", cursor: "pointer", fontFamily: "Cinzel,serif", fontSize: "10px", color: unlocked.length > 0 ? "#C8941A" : "#1A6070", letterSpacing: "0.08em" }}>
            {unlocked.length > 0 ? `✦ BAG (${unlocked.length})` : "✦ BAG"}
          </button>
          <button
            onClick={() => { analyticsEvents.feedbackOpened(); window.open(FEEDBACK_URL, "_blank", "noopener,noreferrer"); }}
            style={{ background:"none", border:"1px solid #0A2A3A", borderRadius:"5px", padding:"5px 10px", cursor:"pointer", fontFamily:"Cinzel,serif", fontSize:"9px", color:"#1A6070", letterSpacing:"0.08em" }}
          >
            ✦ FEEDBACK
          </button>
          <button onClick={onReset} style={{ background: "none", border: "1px solid #0A2030", borderRadius: "5px", padding: "5px 10px", cursor: "pointer", fontFamily: "Cinzel,serif", fontSize: "9.5px", color: "#0E3040", letterSpacing: "0.08em" }}>↺ RESET</button>
        </div>
      </div>

      {/* Credits / source banner */}
      <div style={{ padding:"7px 22px", borderBottom:"1px solid #0A1E2A", background:"rgba(3,10,18,0.9)", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
        <div style={{ fontFamily:"Georgia,serif", fontSize:"11px", color:"#1A4A5A", fontStyle:"italic", lineHeight:"1.4" }}>
          Navigation research: Polynesian Voyaging Society · University of Hawaiʻi · Adam Johnson, <em>The Wayfinder</em> (2025)
          <span style={{ marginLeft:"10px", color:"#1A3A4A" }}>· Work in progress — feedback welcome</span>
        </div>
        <button onClick={onCredits} style={{ flexShrink:0, background:"none", border:"1px solid #0A3040", borderRadius:"4px", padding:"4px 12px", cursor:"pointer", fontFamily:"Cinzel,serif", fontSize:"8.5px", color:"#1A5060", letterSpacing:"0.1em", marginLeft:"16px" }}>
          CREDITS ↗
        </button>
      </div>

      {/* Map */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px", overflow: "hidden", background: "#051C2C" }}>
        <div style={{ position: "relative" }}>
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}
            style={{ display: "block", borderRadius: "8px", border: "1px solid #0A3A50", boxShadow: "0 0 80px rgba(0,100,140,0.35)" }}>
            <defs>
              <radialGradient id="oceanC" cx="40%" cy="35%" r="70%">
                <stop offset="0%"   stopColor="#0A4A65" />
                <stop offset="55%"  stopColor="#073550" />
                <stop offset="100%" stopColor="#030F1E" />
              </radialGradient>
              <filter id="goldGlow"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
              <filter id="homeGlow"><feGaussianBlur stdDeviation="8" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
              <filter id="islandShadow"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            </defs>

            <rect width={W} height={H} fill="url(#oceanC)" />

            {/* Animated wave lines */}
            {Array.from({ length: 24 }, (_, i) => {
              const y = 10 + i * 20;
              const amp = 2.5 + (i % 3);
              const xs = [0, 95, 190, 285, 380, 475, 570, 665, W];
              const d = xs.map((x, j) => {
                const dy = amp * Math.sin((x + waveOffset + i * 45) * Math.PI / 210);
                return j === 0 ? `M0,${(y + dy).toFixed(1)}` : `Q${(x - 47).toFixed(0)},${(y + dy + (j % 2 ? amp : -amp)).toFixed(1)} ${x},${(y + dy).toFixed(1)}`;
              }).join(" ");
              return <path key={i} d={d} fill="none" stroke="#1A8090" strokeWidth="0.65" opacity={0.13 + (i % 5) * 0.055} />;
            })}

            {/* Lat lines */}
            {[100, 200, 300, 400].map(y => (
              <line key={y} x1={0} y1={y} x2={W} y2={y} stroke="#1E9090" strokeWidth="0.5" strokeDasharray="4,14" opacity="0.2" />
            ))}

            {/* Polynesian Triangle (faint) */}
            <polygon points={TRIANGLE.map(id => { const i = getIsl(id); return i ? `${i.x},${i.y}` : ""; }).join(" ")}
              fill="rgba(20,160,180,0.04)" stroke="#209090" strokeWidth="1" strokeDasharray="7,11" opacity="0.4" />

            {/* Voyage sea roads — shown only once travelled */}
            {visibleRoads.map(road => {
              const f = getIsl(road.from), t = getIsl(road.to);
              if (!f || !t) return null;
              const mx = (f.x + t.x) / 2 + 8, my = (f.y + t.y) / 2 - 10;
              return (
                <g key={road.name}>
                  <line x1={f.x} y1={f.y} x2={t.x} y2={t.y}
                    stroke="#20C0A0" strokeWidth="1.2" strokeDasharray="6,8" opacity="0.5" />
                  <text x={mx} y={my} textAnchor="middle"
                    fill="#18A090" fontSize="8" fontFamily="Cinzel,serif" opacity="0.7"
                    style={{ letterSpacing: "0.08em" }}>
                    {road.name}
                  </text>
                </g>
              );
            })}

            {/* Islands */}
            {/* Islands — locked islands hidden, but home (Tonga) always visible */}
            {ISLANDS.filter(island => island.module !== null && (island.isHome || !isLocked(island))).map(island => {
              const hov      = hovIsland === island.id;
              const home     = island.isHome && island.module === 0 || island.isHome;
              const completed = isCompleted(island);
              const current  = isCurrent(island);
              const locked   = isLocked(island);
              const clickable = isClickable(island);

              // Visual style
              let dotFill   = "#1A8090";
              let dotStroke = "#0A6070";
              let dotR      = 5;
              let nameColor = "#1AA0A0";
              let nameWeight = "400";
              let opacity   = 1;

              if (island.isHome && island.module !== 6) {
                // Tonga home base — always distinct
                dotFill = "#C8941A"; dotStroke = "#E8B830"; dotR = 9; nameColor = "#F0D870"; nameWeight = "700";
              } else if (current) {
                dotFill = "#E8C060"; dotStroke = "#C8941A"; dotR = 7; nameColor = "#F0D870"; nameWeight = "700";
              } else if (completed) {
                dotFill = "#2AB870"; dotStroke = "#1A9050"; dotR = 6; nameColor = "#60D8A0"; nameWeight = "600";
              } else if (locked) {
                dotFill = "#0A3040"; dotStroke = "#0A2030"; dotR = 4; nameColor = "#1A4050"; opacity = 0.55;
              }
              if (hov && clickable) { dotR += 2; dotFill = "#F0D870"; }

              return (
                <g key={island.id}
                  style={{ cursor: clickable ? "pointer" : "default", opacity }}
                  onClick={() => clickable && island.module && onNavigate(island.module)}
                  onMouseEnter={() => setHovIsland(island.id)}
                  onMouseLeave={() => setHovIsland(null)}>

                  {/* Pulse ring — current destination */}
                  {current && (
                    <circle cx={island.x} cy={island.y} r={dotR + 14}
                      fill="none" stroke="#C8941A"
                      strokeWidth={hov ? 1.6 : 1.2}
                      opacity={hov ? 0.7 : 0.35} />
                  )}

                  {/* Home harbour icon — anchor shape for Tonga */}
                  {island.isHome && (
                    <g>
                      <circle cx={island.x} cy={island.y} r={16}
                        fill="rgba(200,148,26,0.12)" stroke="#C8941A55" strokeWidth="1" />
                      {/* Anchor icon */}
                      <line x1={island.x} y1={island.y - 9} x2={island.x} y2={island.y + 9} stroke="#C8941A" strokeWidth="2" strokeLinecap="round"/>
                      <line x1={island.x - 6} y1={island.y - 6} x2={island.x + 6} y2={island.y - 6} stroke="#C8941A" strokeWidth="2" strokeLinecap="round"/>
                      <path d={`M${island.x - 7},${island.y + 6} Q${island.x - 9},${island.y + 10} ${island.x},${island.y + 10} Q${island.x + 9},${island.y + 10} ${island.x + 7},${island.y + 6}`}
                        fill="none" stroke="#C8941A" strokeWidth="1.5" strokeLinecap="round"/>
                    </g>
                  )}

                  {/* Island dot */}
                  {!island.isHome && (
                    <circle cx={island.x} cy={island.y} r={dotR}
                      fill={dotFill} stroke={dotStroke}
                      strokeWidth={current ? 2 : 1.2}
                      filter={current ? "url(#goldGlow)" : "url(#islandShadow)"} />
                  )}

                  {/* Completed checkmark */}
                  {completed && !island.isHome && (
                    <text x={island.x + dotR + 3} y={island.y + 4} fill="#2AB870" fontSize="9" fontFamily="Cinzel,serif">✓</text>
                  )}

                  {/* Island name */}
                  <text x={island.x} y={island.y - (island.isHome ? 20 : dotR + 8)}
                    textAnchor="middle"
                    fill={nameColor}
                    fontSize={current || island.isHome ? "11" : completed ? "10" : "9"}
                    fontFamily="Cinzel,serif" fontWeight={nameWeight}
                    style={{ pointerEvents: "none" }}>
                    {island.name}{island.isHome ? " ⚓" : ""}
                  </text>

                  {/* HOME label under Tonga */}
                  {island.isHome && (
                    <text x={island.x} y={island.y + 26}
                      textAnchor="middle" fill="#9A7010" fontSize="8" fontFamily="Cinzel,serif"
                      letterSpacing="0.12em" style={{ pointerEvents:"none" }}>HOME</text>
                  )}

                  {/* Hover tooltip */}
                  {hov && island.label && (
                    <g>
                      <rect x={island.x - 110} y={island.y + (island.isHome ? 18 : dotR + 7)}
                        width="220" height="20" rx="3"
                        fill="#041220" stroke={current ? "#C8941A55" : completed ? "#2AB87055" : "#1A304055"} strokeWidth="1" />
                      <text x={island.x} y={island.y + (island.isHome ? 32 : dotR + 21)}
                        textAnchor="middle"
                        fill={current ? "#C8941A" : completed ? "#2AB870" : "#1A6070"}
                        fontSize="8" fontFamily="Cinzel,serif" letterSpacing="0.06em"
                        style={{ pointerEvents: "none" }}>
                        {island.isHome && completedCount < 6
                          ? "🔒 Locked until our mission is complete"
                          : locked ? "🔒 COMPLETE PREVIOUS STOP"
                          : island.label}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* Star compass rose — top right — historically accurate orientation tool */}
            <g transform={`translate(${RCX},${RCY})`}>
              <circle cx={0} cy={0} r={RR + 4} fill="rgba(4,12,22,0.85)" stroke="#1A4050" strokeWidth="1"/>
              <circle cx={0} cy={0} r={RR} fill="none" stroke="#1A3A50" strokeWidth="0.5"/>
              {roseHouses.map(h => {
                const rad = (h.angle - 90) * Math.PI / 180;
                const x1 = Math.cos(rad) * 8, y1 = Math.sin(rad) * 8;
                const x2 = Math.cos(rad) * RR, y2 = Math.sin(rad) * RR;
                const tx = Math.cos(rad) * (RR + 12), ty = Math.sin(rad) * (RR + 12);
                const isCard = h.angle % 90 === 0;
                return (
                  <g key={h.angle}>
                    <line x1={x1} y1={y1} x2={x2} y2={y2}
                      stroke={isCard ? "#4A8090" : "#2A5060"} strokeWidth={isCard ? 1 : 0.6}/>
                    <text x={tx} y={ty + 3} textAnchor="middle" dominantBaseline="middle"
                      fill={isCard ? "#6AAAB8" : "#2A6070"} fontSize={isCard ? "6.5" : "5.5"}
                      fontFamily="Cinzel,serif">
                      {h.label}
                    </text>
                  </g>
                );
              })}
              <circle cx={0} cy={0} r={5} fill="#0A2030" stroke="#3A7080" strokeWidth="1"/>
              <text x={0} y={-RR - 18} textAnchor="middle" fill="#1A5060" fontSize="5.5" fontFamily="Cinzel,serif" letterSpacing="0.1em">STAR COMPASS</text>
            </g>

            {/* Progress display */}
            <text x={14} y={H - 28} fill="#1A7080" fontSize="8.5"
              fontFamily="Cinzel,serif" style={{ letterSpacing: "0.12em" }}>
              KA MOANA NUI · THE GREAT OCEAN
            </text>
            <text x={14} y={H - 12} fill={completedCount === 6 ? "#2AB870" : "#C8941A"} fontSize="9"
              fontFamily="Cinzel,serif" style={{ letterSpacing: "0.10em" }}>
              {completedCount === 0 ? "VOYAGE BEGINS · SĀMOA AWAITS"
                : completedCount === 6 ? "VOYAGE COMPLETE · READY FOR FINAL JOURNEY"
                : `${completedCount} OF 6 LEGS COMPLETE`}
            </text>
          </svg>

          {/* Legend */}
          <div style={{ position: "absolute", bottom: "24px", right: "24px", background: "rgba(3,12,22,0.92)", border: "1px solid #0A3040", borderRadius: "6px", padding: "10px 14px", fontFamily: "Cinzel,serif", fontSize: "9px", display:"flex", flexDirection:"column", gap:"5px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:"7px", color:"#C8941A" }}><div style={{ width:"8px", height:"8px", borderRadius:"50%", background:"#E8C060", border:"1.5px solid #C8941A" }}/> NEXT DESTINATION</div>
            <div style={{ display:"flex", alignItems:"center", gap:"7px", color:"#60D8A0" }}><div style={{ width:"8px", height:"8px", borderRadius:"50%", background:"#2AB870", border:"1.5px solid #1A9050" }}/> COMPLETED · REVISIT</div>
            <div style={{ display:"flex", alignItems:"center", gap:"7px", color:"#1A4050" }}><div style={{ width:"8px", height:"8px", borderRadius:"50%", background:"#0A3040", border:"1.5px solid #0A2030" }}/> LOCKED</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   COMPASS DIAL
══════════════════════════════════════════════════════════════ */

function CompassDial({ step, selHouse, selStar, hovHouse, hovStar, onHouseClick, onHouseHover, onStarClick, onStarHover }) {
  const CX = 300, CY = 300, R = 258, RI = 55;
  const qFill = { ko: "rgba(200,120,20,0.10)", ma: "rgba(160,145,15,0.08)", kona: "rgba(15,95,155,0.11)", ho: "rgba(90,35,170,0.08)", card: "transparent" };
  const correctHouse = selHouse && Math.abs(selHouse.angle - 22.5) < 6;
  const selC = ok => ok ? "#FFD700" : "#FF5533";

  return (
    <svg viewBox="-55 -55 710 728" style={{ width: "100%", height: "100%", filter: "drop-shadow(0 0 40px rgba(15,90,150,0.4))" }}>
      <defs>
        <radialGradient id="bgGC" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0D1B30" /><stop offset="100%" stopColor="#060D1C" />
        </radialGradient>
        <radialGradient id="cGC" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#162030" /><stop offset="100%" stopColor="#090F1E" />
        </radialGradient>
        <filter id="glowC" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      <circle cx={CX} cy={CY} r={R + 10} fill="url(#bgGC)" />
      {HOUSES.filter(h => h.q !== "card").map(h => <path key={h.name} d={wedge(h.angle, R, CX, CY)} fill={qFill[h.q]} />)}
      {[45, 135, 225, 315].map(a => { const p1 = pt(a, RI, CX, CY), p2 = pt(a, R, CX, CY); return <line key={a} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#253850" strokeWidth="0.9" />; })}
      <circle cx={CX} cy={CY} r={R}     fill="none" stroke="#253850" strokeWidth="1.5" />
      <circle cx={CX} cy={CY} r={R - 9} fill="none" stroke="#1A2840" strokeWidth="0.5" strokeDasharray="2,5" />

      {HOUSES.map(h => {
        const inner = pt(h.angle, RI + 7, CX, CY), outer = pt(h.angle, R, CX, CY);
        const isCard = h.q === "card", isManu = h.angle % 45 === 0 && !isCard;
        const isHov = hovHouse?.angle === h.angle, isSel = selHouse?.angle === h.angle;
        let stroke = isCard ? "#2A4A72" : isManu ? "#1E3858" : "#162030";
        let sw = isCard ? 1.8 : isManu ? 1.2 : 0.7;
        if (isHov) { stroke = "#5A9AC0"; sw = 1.8; }
        if (isSel) { stroke = selC(correctHouse); sw = 2.8; }
        return <line key={h.name} x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} stroke={stroke} strokeWidth={sw} />;
      })}

      {selHouse && <>
        <path d={wedge(selHouse.angle, R - 1, CX, CY)} fill={correctHouse ? "rgba(255,215,0,0.10)" : "rgba(255,70,30,0.08)"} stroke={selC(correctHouse)} strokeWidth="1.4" />
        <line x1={CX} y1={CY} x2={pt(selHouse.angle, R - 12, CX, CY).x} y2={pt(selHouse.angle, R - 12, CX, CY).y} stroke={selC(correctHouse)} strokeWidth="2" strokeDasharray="6,4" opacity="0.8" />
      </>}

      {step === 1 && HOUSES.map(h => (
        <path key={`w-${h.name}`} d={wedge(h.angle, R, CX, CY)} fill="transparent" style={{ cursor: "pointer" }}
          onClick={() => onHouseClick(h)} onMouseEnter={() => onHouseHover(h)} onMouseLeave={() => onHouseHover(null)} />
      ))}

      <circle cx={CX} cy={CY} r={RI} fill="url(#cGC)" stroke="#1E3050" strokeWidth="1.2" />

      {[{ a: 0, n: "Ākau" }, { a: 90, n: "Hikina" }, { a: 180, n: "Hema" }, { a: 270, n: "Komohana" }].map(({ a, n }) => {
        const p = pt(a, 175, CX, CY);
        return <text key={n} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" fill="#5A92BC" fontSize="14" fontFamily="Cinzel,serif" fontWeight="600" style={{ letterSpacing: "0.04em", pointerEvents: "none" }}>{n}</text>;
      })}

      {[{ a: 45, n: "KOʻOLAU", c: "#B07825" }, { a: 135, n: "MALANAI", c: "#9A9A20" }, { a: 225, n: "KONA", c: "#2090C0" }, { a: 315, n: "HOʻOLUA", c: "#8040C8" }].map(({ a, n, c }) => {
        const p = pt(a, 289, CX, CY);
        return <text key={n} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" fill={c} fontSize="11" fontFamily="Cinzel,serif" fontWeight="700" style={{ letterSpacing: "0.18em", pointerEvents: "none" }}>{n}</text>;
      })}

      {/* Nāleo-Koʻolau label — only shown on success (step 3) */}
      {step >= 3 && (()=>{ const lp = pt(22.5, R + 28, CX, CY); return (
        <text x={lp.x.toFixed(1)} y={lp.y.toFixed(1)} textAnchor="middle"
          fill="#C8941A" fontSize="10" fontFamily="Cinzel,serif" fontWeight="700"
          style={{ pointerEvents:"none" }}>Nāleo-Koʻolau</text>
      );})()}

      {step >= 2 && STARS.map(star => {
        const p = pt(star.angle, 228, CX, CY);
        const isHov = hovStar?.id === star.id, isSel = selStar?.id === star.id;
        const correct = isSel && star.correct;
        return (
          <g key={star.id} style={{ cursor: step === 2 ? "pointer" : "default" }}
            onClick={() => step === 2 && onStarClick(star)}
            onMouseEnter={() => step === 2 && onStarHover(star)}
            onMouseLeave={() => onStarHover(null)}>
            {(isHov || isSel) && <circle cx={p.x} cy={p.y} r={star.r + 13} fill="none" stroke={isSel ? selC(correct) : star.color} strokeWidth="1.5" opacity="0.4" />}
            <circle cx={p.x} cy={p.y} r={isHov || isSel ? star.r + 2 : star.r} fill={star.color} filter="url(#glowC)" />
            {(isHov || isSel) && <>
              <text x={p.x} y={p.y - star.r - 12} textAnchor="middle" fill="#EEE5C8" fontSize="11" fontFamily="Cinzel,serif" fontWeight="600" style={{ pointerEvents: "none" }}>{star.name}</text>
            </>}
          </g>
        );
      })}

      <circle cx={CX} cy={CY} r={6} fill="#1E3050" />
      <circle cx={CX} cy={CY} r={3} fill="#5A92BC" />

      <text x={CX} y={CY + R + 28} textAnchor="middle" fill={hovHouse ? "#7AACCC" : "transparent"} fontSize="13" fontFamily="Cinzel,serif" style={{ pointerEvents: "none" }}>
        {hovHouse?.name || "·"}
      </text>
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════
   MODULE 1 — COMPASS LEARN (step-through progressive diagram)
══════════════════════════════════════════════════════════════ */

function CompassLearnDiagram({ step }) {
  const [arcT, setArcT] = useState(0);
  useEffect(() => {
    if (step !== 1) {
      setArcT(0);
      return;
    }
    let frameId;
    const tick = () => {
      setArcT(t => (t + 0.0015) % 1);
      frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [step]);

  // CX/CY=300, R=248. viewBox gives 60px padding on each side
  const CX=300, CY=300, R=248, RI=52;
  const p = (deg, r) => {
    const rad=(deg-90)*Math.PI/180;
    return { x: CX+r*Math.cos(rad), y: CY+r*Math.sin(rad) };
  };
  const qFill = ["rgba(200,120,20,0.11)","rgba(155,145,15,0.09)","rgba(15,95,155,0.12)","rgba(90,35,170,0.09)"];
  const qAngles = [0,90,180,270]; // starting angles of quadrants

  return (
    <svg viewBox="-60 -60 720 720" style={{ width:"100%", maxWidth:"640px", filter:"drop-shadow(0 0 24px rgba(200,148,26,0.15))" }}>
      <defs>
        <radialGradient id="clBg"><stop offset="0%" stopColor="#0D1B30"/><stop offset="100%" stopColor="#060D1C"/></radialGradient>
        <filter id="clGlow"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>

      {/* Background circle — always */}
      <circle cx={CX} cy={CY} r={R+8} fill="url(#clBg)"/>

      {/* Step 0+1: Rising point insight — arc animation showing star path vs fixed horizon point */}
      {step <= 1 && (()=>{
        const horizY = CY + 210;
        const arcSteps = 9;
        // Star arc positions (rise ESE, peak overhead, set WSW)
        const arcPts = Array.from({length:arcSteps},(_,i)=>{
          const t = i/(arcSteps-1); // 0=rise, 1=set
          const angle = (t * 180) * Math.PI/180; // 0=right horizon, 180=left horizon
          const rx = 220, ry = 160;
          return { x: CX + rx*Math.cos(Math.PI - angle), y: horizY - ry*Math.sin(angle) };
        });
        const risePt = arcPts[0];
        const peakPt = arcPts[Math.floor(arcSteps/2)];
        const setPt  = arcPts[arcSteps-1];
        const arcD   = arcPts.map((p,i) => `${i===0?"M":"L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
        return (
          <g>
            {/* Horizon line */}
            <line x1={CX-260} y1={horizY} x2={CX+260} y2={horizY} stroke="#1A4050" strokeWidth="2"/>
            <text x={CX+268} y={horizY+4} fill="#1A4050" fontSize="10" fontFamily="Cinzel,serif">HORIZON</text>

            {/* Ocean below */}
            <rect x={CX-260} y={horizY} width={520} height={60} fill="#030A14" opacity="0.5" rx="4"/>

            {/* Star arc — dashed, showing movement */}
            <path d={arcD} fill="none" stroke="#C0E8FF" strokeWidth="1.5" strokeDasharray="8,5" opacity="0.5"/>

            {/* Star at different positions along arc — fading */}
            {arcPts.slice(1,-1).map((p,i)=>(
              <circle key={i} cx={p.x.toFixed(1)} cy={p.y.toFixed(1)} r={4}
                fill="#C0E8FF" opacity={(0.15 + i*0.04).toFixed(2)}/>
            ))}

            {/* Star at rise — bright */}
            <circle cx={risePt.x.toFixed(1)} cy={risePt.y.toFixed(1)} r={9} fill="#C0E8FF" opacity="0.95"/>
            <text x={(risePt.x+14).toFixed(1)} y={(risePt.y-12).toFixed(1)} fill="#C0E8FF" fontSize="11" fontFamily="Cinzel,serif" fontWeight="600">rising</text>

            {/* Fixed rising point marker on horizon */}
            <circle cx={risePt.x.toFixed(1)} cy={horizY} r={8} fill="#C8941A" stroke="#E8C060" strokeWidth="2"/>
            <line x1={risePt.x.toFixed(1)} y1={(horizY-8).toFixed(1)} x2={risePt.x.toFixed(1)} y2={(risePt.y+9).toFixed(1)}
              stroke="#C8941A" strokeWidth="1.5" strokeDasharray="4,3" opacity="0.6"/>
            <text x={(risePt.x).toFixed(1)} y={(horizY+22).toFixed(1)} textAnchor="middle"
              fill="#C8941A" fontSize="12" fontFamily="Cinzel,serif" fontWeight="700">this point</text>
            <text x={(risePt.x).toFixed(1)} y={(horizY+36).toFixed(1)} textAnchor="middle"
              fill="#C8941A" fontSize="12" fontFamily="Cinzel,serif" fontWeight="700">never moves</text>

            {/* Peak label */}
            <text x={peakPt.x.toFixed(1)} y={(peakPt.y-16).toFixed(1)} textAnchor="middle"
              fill="#4A7090" fontSize="10" fontFamily="Cinzel,serif">overhead — useless for direction</text>
            <circle cx={peakPt.x.toFixed(1)} cy={peakPt.y.toFixed(1)} r={5} fill="#C0E8FF" opacity="0.4"/>

            {/* Step 1: star moving along same parametric arc as arcPts (t = i/(arcSteps-1)) */}
            {step === 1 && (() => {
              const angle = (arcT * 180) * Math.PI / 180;
              const rx = 220, ry = 160;
              const ax = CX + rx * Math.cos(Math.PI - angle);
              const ay = horizY - ry * Math.sin(angle);
              return (
                <g>
                  <circle cx={ax.toFixed(1)} cy={ay.toFixed(1)} r={14} fill="#C0E8FF" opacity="0.22"/>
                  <circle cx={ax.toFixed(1)} cy={ay.toFixed(1)} r={7} fill="#C0E8FF" filter="url(#clGlow)"/>
                </g>
              );
            })()}

            {/* Polaris comparison — top left */}
            <circle cx={CX-180} cy={CY-160} r={7} fill="#FFD060" opacity="0.9"/>
            <text x={CX-180} y={CY-175} textAnchor="middle" fill="#FFD060" fontSize="10" fontFamily="Cinzel,serif">Polaris</text>
            <text x={CX-180} y={CY-140} textAnchor="middle" fill="#4A6080" fontSize="9" fontFamily="Cinzel,serif">barely moves</text>
            <text x={CX-180} y={CY-128} textAnchor="middle" fill="#4A6080" fontSize="9" fontFamily="Cinzel,serif">below our horizon</text>
            <line x1={CX-180} y1={CY-120} x2={CX-180} y2={horizY-4}
              stroke="#4A6080" strokeWidth="1" strokeDasharray="4,6" opacity="0.3"/>
          </g>
        );
      })()}

      {/* Step 2+: 32 house division lines */}
      {step >= 2 && Array.from({length:32},(_,i) => {
        const rad=(i*11.25-90)*Math.PI/180;
        const isCard=i%8===0, isManu=i%4===0&&!isCard;
        const r1=isCard?RI-2:isManu?RI+20:RI+45;
        const r2=R;
        return <line key={i}
          x1={(CX+r1*Math.cos(rad)).toFixed(1)} y1={(CY+r1*Math.sin(rad)).toFixed(1)}
          x2={(CX+r2*Math.cos(rad)).toFixed(1)} y2={(CY+r2*Math.sin(rad)).toFixed(1)}
          stroke={isCard?"#3A5A80":isManu?"#253860":"#162840"}
          strokeWidth={isCard?1.8:isManu?1.1:0.5}/>;
      })}
      {step >= 2 && <circle cx={CX} cy={CY} r={R} fill="none" stroke="#253850" strokeWidth="1.5"/>}

      {/* Step 2+: quadrant colours (no names yet) */}
      {step >= 2 && qAngles.map((a,i) => {
        const r1=(a-90)*Math.PI/180, r2=(a+90-90)*Math.PI/180;
        return <path key={i} d={`M${CX},${CY} L${(CX+R*Math.cos(r1)).toFixed(1)},${(CY+R*Math.sin(r1)).toFixed(1)} A${R},${R} 0 0,1 ${(CX+R*Math.cos(r2)).toFixed(1)},${(CY+R*Math.sin(r2)).toFixed(1)} Z`} fill={qFill[i]}/>;
      })}

      {/* Step 2+: inner hub */}
      {step >= 2 && <circle cx={CX} cy={CY} r={RI} fill="#060D1C" stroke="#1A2840" strokeWidth="1"/>}

      {/* Step 3+: cardinal labels + quadrant names appear */}
      {step >= 3 && <>
        {[["Ākau",0],["Hikina",90],["Hema",180],["Komohana",270]].map(([n,a])=>{
          const pos=p(a, 162);
          return <text key={n} x={pos.x.toFixed(1)} y={pos.y.toFixed(1)} textAnchor="middle" dominantBaseline="middle"
            fill="#5A92BC" fontSize="14" fontFamily="Cinzel,serif" fontWeight="600">{n}</text>;
        })}
        {[["KOʻOLAU","#B07825",45],["MALANAI","#9A9A20",135],["KONA","#2090C0",225],["HOʻOLUA","#8040C8",315]].map(([n,c,a])=>{
          const pos=p(a, R+32);
          return <text key={n} x={pos.x.toFixed(1)} y={pos.y.toFixed(1)} textAnchor="middle" dominantBaseline="middle"
            fill={c} fontSize="11" fontFamily="Cinzel,serif" fontWeight="700" letterSpacing="0.15em">{n}</text>;
        })}
      </>}

      {/* Step 4+: Nāleo-Koʻolau highlighted */}
      {step >= 4 && <>
        <path d={`M${CX},${CY} L${p(22.5-5.625,R).x.toFixed(1)},${p(22.5-5.625,R).y.toFixed(1)} A${R},${R} 0 0,1 ${p(22.5+5.625,R).x.toFixed(1)},${p(22.5+5.625,R).y.toFixed(1)} Z`}
          fill="rgba(200,148,26,0.18)" stroke="#C8941A" strokeWidth="1.5"/>
        <line x1={CX} y1={CY} x2={p(22.5,R-4).x.toFixed(1)} y2={p(22.5,R-4).y.toFixed(1)}
          stroke="#C8941A" strokeWidth="2" strokeDasharray="6,4" opacity="0.8"/>
        {/* Label — only on steps 4 and 5 to avoid crowding with stars */}
        {step <= 5 && (()=>{
          const lp=p(22.5, R+42);
          return <>
            <text x={lp.x.toFixed(1)} y={lp.y.toFixed(1)} textAnchor="middle"
              fill="#C8941A" fontSize="12" fontFamily="Cinzel,serif" fontWeight="700" letterSpacing="0.06em">
              Nāleo-Koʻolau
            </text>
            <text x={(lp.x).toFixed(1)} y={(lp.y + 16).toFixed(1)} textAnchor="middle"
              fill="#C8941A88" fontSize="10" fontFamily="Cinzel,serif">
              ← Sāmoa
            </text>
          </>;
        })()}
      </>}

      {/* Step 5+: all 5 stars appear */}
      {step >= 5 && STARS.map(star => {
        const sp=p(star.angle, 195);
        const isFocus = star.id === "manaiakalani";
        return <circle key={star.id} cx={sp.x.toFixed(1)} cy={sp.y.toFixed(1)}
          r={star.r + (isFocus ? 2 : 0)} fill={star.color}
          opacity={step >= 6 ? (isFocus ? 1 : 0.25) : 0.9}/>;
      })}

      {/* Step 5: anchor stars labelled */}
      {step >= 5 && step < 6 && [
        {id:"hokule_a", label:"Hōkūleʻa",   note:"ʻĀina-Koʻolau"},
        {id:"tawera",   label:"Tāwera",      note:"Koʻolau"},
        {id:"takurua",  label:"Takurua",     note:"Lā-Malanai"},
        {id:"atutahi",  label:"Atutahi",     note:"Nālani-Malanai"},
      ].map(({id, label, note}) => {
        const star = STARS.find(s=>s.id===id);
        const sp = p(star.angle, 195);
        const lp = p(star.angle, 258);
        const anchor = lp.x > CX + 20 ? "start" : lp.x < CX - 20 ? "end" : "middle";
        return (
          <g key={id}>
            <circle cx={sp.x.toFixed(1)} cy={sp.y.toFixed(1)} r={star.r+3} fill={star.color} opacity="0.9"/>
            <text x={lp.x.toFixed(1)} y={(lp.y - 4).toFixed(1)} textAnchor={anchor}
              fill={star.color} fontSize="13" fontFamily="Cinzel,serif" fontWeight="700">{label}</text>
            <text x={lp.x.toFixed(1)} y={(lp.y + 12).toFixed(1)} textAnchor={anchor}
              fill={star.color} fontSize="10" fontFamily="Cinzel,serif" opacity="0.6">{note}</text>
          </g>
        );
      })}

      {/* Step 5+: Mānaiakalani also labelled */}
      {step >= 5 && (()=>{
        const star = STARS.find(s=>s.id==="manaiakalani");
        const sp = p(star.angle, 195);
        const lp = p(star.angle, 258);
        return (
          <g>
            <circle cx={sp.x.toFixed(1)} cy={sp.y.toFixed(1)} r={star.r+3} fill={star.color} opacity={step >= 6 ? 1 : 0.9}/>
            <text x={(lp.x + 4).toFixed(1)} y={(lp.y - 4).toFixed(1)} textAnchor="start"
              fill={star.color} fontSize="13" fontFamily="Cinzel,serif" fontWeight="700">Mānaiakalani</text>
            {step >= 6 && <text x={(lp.x + 4).toFixed(1)} y={(lp.y + 12).toFixed(1)} textAnchor="start"
              fill={star.color} fontSize="10" fontFamily="Cinzel,serif" opacity="0.65">Nāleo-Koʻolau · your guide</text>}
          </g>
        );
      })()}

      {/* Step 6: Mānaiakalani spotlight — glow rings */}
      {step >= 6 && (()=>{
        const star = STARS.find(s=>s.id==="manaiakalani");
        const sp = p(star.angle, 195);
        return (
          <g>
            <circle cx={sp.x.toFixed(1)} cy={sp.y.toFixed(1)} r={star.r+20}
              fill="none" stroke="#C0E8FF" strokeWidth="1.2" opacity="0.2" filter="url(#clGlow)"/>
            <circle cx={sp.x.toFixed(1)} cy={sp.y.toFixed(1)} r={star.r+11}
              fill="none" stroke="#C0E8FF" strokeWidth="1" opacity="0.4"/>
          </g>
        );
      })()}

      {/* Centre dot — always */}
      <circle cx={CX} cy={CY} r={5} fill="#5A92BC"/>
    </svg>
  );
}

const COMPASS_LEARN_STEPS = MODULE_CONTENT[1].learn.concepts;

/* ══════════════════════════════════════════════════════════════
   SHORE INTRO POPUP — shown once before Module 1 learning
══════════════════════════════════════════════════════════════ */

function ShoreIntroPopup({ onDismiss }) {
  return (
    <div style={{ position:"fixed", inset:0, zIndex:95, display:"flex", alignItems:"center", justifyContent:"center", padding:"24px" }}>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={onDismiss}
        style={{
          position:"absolute",
          inset:0,
          background:"rgba(2,6,4,0.75)",
          backdropFilter:"blur(3px)",
          border:"none",
          padding:0,
          margin:0,
          cursor:"pointer",
        }}
      />
      <div style={{
        position:"relative", zIndex:1, background:"rgba(4,10,6,0.98)",
        border:"1px solid rgba(200,148,26,0.35)", borderRadius:"14px",
        padding:"32px 36px", maxWidth:"480px", width:"100%",
        display:"flex", flexDirection:"column", gap:"20px",
        boxShadow:"0 0 80px rgba(200,148,26,0.12)",
      }}>
        {/* Location tag */}
        <div style={{ fontFamily:"Cinzel,serif", fontSize:"10px", color:"#C8941A", letterSpacing:"0.2em", opacity:0.7 }}>
          TONGATAPU, TONGA · BEACH AT DUSK
        </div>
        {/* Scene */}
        <div style={{ fontFamily:"Georgia,serif", fontSize:"15px", color:"#8ABCB0", lineHeight:"1.75", fontStyle:"italic" }}>
          You stand on the shore. The sun is setting behind you, turning the sand the colour of embers.
        </div>
        <div style={{ fontFamily:"Georgia,serif", fontSize:"15px", color:"#A8C8C0", lineHeight:"1.75", fontStyle:"italic" }}>
          Palu Hemi crouches in front of you and begins laying shells in a circle on the sand — one by one, methodical, deliberate. Matala watches from a nearby palm.
        </div>
        <div style={{ fontFamily:"Georgia,serif", fontSize:"15px", color:"#C8941A", lineHeight:"1.75", fontStyle:"italic" }}>
          "Before we leave, you need to understand the stars. Not where they are — where they rise."
        </div>
        <button onClick={onDismiss} style={{
          padding:"13px", borderRadius:"6px", cursor:"pointer",
          fontFamily:"Cinzel,serif", fontSize:"11px", fontWeight:"700",
          letterSpacing:"0.14em", border:"1px solid #C8941A",
          background:"rgba(200,148,26,0.14)", color:"#C8941A",
        }}>
          I'M LISTENING →
        </button>
      </div>
    </div>
  );
}


function CompassLearnScreen({ name, onReady, onBack, onOpenBag, unlocked }) {
  const [conceptIdx, setConceptIdx] = useState(0);
  const [noticeAnswer, setNoticeAnswer] = useState(null); // null | "moves" | "fixed"
  const total   = COMPASS_LEARN_STEPS.length;
  const concept = COMPASS_LEARN_STEPS[conceptIdx];
  const accent  = "#C8941A";
  const isLast  = conceptIdx === total - 1;
  const dep     = MODULE_CONTENT[1].departure;

  const shoreBg    = "#060E08";
  const shoreMid   = "rgba(6,14,8,0.96)";
  const shorePanel = "rgba(4,10,6,0.85)";

  useEffect(() => {
    if (conceptIdx !== 0) setNoticeAnswer(null);
  }, [conceptIdx]);

  return (
    <div style={{ width:"100%", height:"100%", background:shoreBg, display:"flex", flexDirection:"column", overflow:"hidden" }}>

      {/* Header */}
      <div style={{ height:"44px", borderBottom:`1px solid ${accent}33`, background:shoreMid, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 22px", flexShrink:0 }}>
        <span style={{ fontFamily:"Cinzel,serif", fontSize:"12px", fontWeight:"700", color:"#C8941A", letterSpacing:"0.12em" }}>OCEAN ADVENTURE</span>
        <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
          <span style={{ fontFamily:"Cinzel,serif", fontSize:"10.5px", color:accent, letterSpacing:"0.09em", opacity:0.8 }}>HAUMĀNA · {name.toUpperCase()}</span>
          <button
            onClick={() => { analyticsEvents.feedbackOpened(); window.open(FEEDBACK_URL, "_blank", "noopener,noreferrer"); }}
            style={{ background:"none", border:"1px solid #0A2A3A", borderRadius:"5px", padding:"5px 10px", cursor:"pointer", fontFamily:"Cinzel,serif", fontSize:"9px", color:"#1A6070", letterSpacing:"0.08em" }}
          >
            ✦ FEEDBACK
          </button>
        </div>
      </div>

      {/* Location bar */}
      <div style={{ padding:"7px 22px", borderBottom:`1px solid ${accent}22`, background:"rgba(4,10,6,0.7)", flexShrink:0, display:"flex", alignItems:"center", gap:"14px" }}>
        <span style={{ fontFamily:"Cinzel,serif", fontSize:"9.5px", color:accent, letterSpacing:"0.16em", opacity:0.9 }}>ON SHORE · {dep.location.toUpperCase()}</span>
          <span style={{ fontFamily:"Georgia,serif", fontSize:"11px", color:`${accent}88`, fontStyle:"italic" }}>{dep.note}</span>
      </div>

      {/* Body */}
      <div style={{ flex:1, display:"flex", overflow:"hidden", minHeight:0 }}>

        {/* Left — concept panel */}
        <div style={{ width:"320px", flexShrink:0, borderRight:`1px solid ${accent}18`, overflowY:"auto", background:shorePanel, display:"flex", flexDirection:"column" }}>
          <div style={{ padding:"22px 20px", display:"flex", flexDirection:"column", gap:"16px", flex:1 }}>

            {/* Nav */}
            <div style={{ display:"flex", gap:"8px" }}>
              <button onClick={onBack} style={{ flex:1, background:"none", border:`1px solid ${accent}33`, borderRadius:"4px", color:"#7AACBE", fontSize:"10px", fontFamily:"Cinzel,serif", letterSpacing:"0.1em", padding:"8px", cursor:"pointer" }}>← MAP</button>
              <button onClick={onOpenBag} style={{ flex:1, background:unlocked.length>0?"rgba(200,148,26,0.10)":"none", border:`1px solid ${unlocked.length>0?"#C8941A66":accent+"33"}`, borderRadius:"4px", color:unlocked.length>0?"#C8941A":"#7AACBE", fontSize:"10px", fontFamily:"Cinzel,serif", letterSpacing:"0.1em", padding:"8px", cursor:"pointer" }}>
                {unlocked.length>0 ? `✦ BAG (${unlocked.length})` : "✦ BAG"}
              </button>
            </div>

            {/* Step dots */}
            <div style={{ display:"flex", gap:"6px", alignItems:"center" }}>
              {Array.from({length:total},(_,i)=>(
                <button
                  key={i}
                  type="button"
                  aria-label={`Go to step ${i + 1}`}
                  aria-current={i === conceptIdx ? "step" : undefined}
                  onClick={() => setConceptIdx(i)}
                  style={{
                  width: i===conceptIdx ? "18px" : "7px", height:"7px", borderRadius:"4px",
                  background: i===conceptIdx ? accent : i<conceptIdx ? "#2A8860" : "#1A2820",
                  cursor:"pointer", transition:"all 0.25s",
                  border:"none",
                  padding:0,
                  margin:0,
                }}
                />
              ))}
              <span style={{ fontFamily:"Cinzel,serif", fontSize:"10px", color:"#7AACBE", marginLeft:"6px" }}>{conceptIdx+1}/{total}</span>
            </div>

            {/* Concept heading */}
            <div style={{ fontFamily:"Cinzel,serif", fontSize:"19px", fontWeight:"700", color:accent, lineHeight:"1.3" }}>
              {concept.heading}
            </div>

            {/* Concept body */}
            <div style={{ fontFamily:"Georgia,serif", fontSize:"16px", color:"#7AACBE", lineHeight:"1.82", fontStyle:"italic", borderLeft:`2px solid ${accent}44`, paddingLeft:"16px" }}>
              {concept.body}
            </div>

            {/* Notice moment — Module 1 learn step 1 */}
            {conceptIdx === 0 && (
              <>
                {noticeAnswer === null && (
                  <div style={{ background: "rgba(200,148,26,0.06)", border: "1px solid rgba(200,148,26,0.2)", borderRadius: "8px", padding: "14px 16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ fontFamily: "Cinzel,serif", fontSize: "10px", color: "#C8941A", letterSpacing: "0.14em" }}>PALU ASKS</div>
                    <div style={{ fontFamily: "Georgia,serif", fontSize: "14px", color: "#A8C8C0", fontStyle: "italic", lineHeight: "1.7" }}>
                      "Look at the diagram. The star moves across the sky all night. What about that movement never changes?"
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button onClick={() => setNoticeAnswer("moves")}
                        style={{ flex:1, padding:"10px", borderRadius:"6px", cursor:"pointer", fontFamily:"Cinzel,serif", fontSize:"10px", border:"1px solid #1A3840", background:"none", color:"#4A8090" }}>
                        Where it is in the sky
                      </button>
                      <button onClick={() => setNoticeAnswer("fixed")}
                        style={{ flex:1, padding:"10px", borderRadius:"6px", cursor:"pointer", fontFamily:"Cinzel,serif", fontSize:"10px", border:"1px solid #1A3840", background:"none", color:"#4A8090" }}>
                        Where it rises on the horizon
                      </button>
                    </div>
                  </div>
                )}

                {noticeAnswer === "fixed" && (
                  <div style={{ background: "rgba(42,184,112,0.06)", border: "1px solid rgba(42,184,112,0.22)", borderRadius: "8px", padding: "14px 16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div style={{ fontFamily:"Georgia,serif", fontSize:"14px", color:"#2AB870", lineHeight:"1.7", fontStyle:"italic" }}>
                      ✓ Exactly. That is the whole secret. The position in the sky is useless. The rising point is everything. Let us go deeper.
                    </div>
                  </div>
                )}

                {noticeAnswer === "moves" && (
                  <div style={{ background: "rgba(200,148,26,0.06)", border: "1px solid rgba(200,148,26,0.2)", borderRadius: "8px", padding: "14px 16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ fontFamily:"Georgia,serif", fontSize:"14px", color:"#A8C8C0", lineHeight:"1.7", fontStyle:"italic" }}>
                      Most people say that. Watch the diagram again — the star moves, yes. But watch where it first appears. That point on the horizon... does it move?
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button onClick={() => setNoticeAnswer("moves")}
                        style={{ flex:1, padding:"10px", borderRadius:"6px", cursor:"pointer", fontFamily:"Cinzel,serif", fontSize:"10px", border:"1px solid #1A3840", background:"none", color:"#4A8090" }}>
                        Where it is in the sky
                      </button>
                      <button onClick={() => setNoticeAnswer("fixed")}
                        style={{ flex:1, padding:"10px", borderRadius:"6px", cursor:"pointer", fontFamily:"Cinzel,serif", fontSize:"10px", border:"1px solid #1A3840", background:"none", color:"#4A8090" }}>
                        Where it rises on the horizon
                      </button>
                    </div>
                    <div style={{ fontFamily:"Cinzel,serif", fontSize:"9px", color:"#C8941A", letterSpacing:"0.12em", opacity:0.7 }}>
                      SKRAWWK. The horizon point. THE HORIZON POINT.
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Prev / Next / Set Sail */}
            <div style={{ display:"flex", gap:"8px", marginTop:"auto" }}>
              {conceptIdx > 0 && (
                <button onClick={() => setConceptIdx(i=>i-1)} style={{ flex:1, padding:"11px", borderRadius:"6px", cursor:"pointer", fontFamily:"Cinzel,serif", fontSize:"10px", fontWeight:"700", letterSpacing:"0.1em", border:`1px solid ${accent}33`, background:"none", color:`${accent}88` }}>← PREV</button>
              )}
              {!isLast ? (
                (conceptIdx !== 0 || noticeAnswer === "fixed") ? (
                  <button onClick={() => setConceptIdx(i=>i+1)} style={{ flex:1, padding:"11px", borderRadius:"6px", cursor:"pointer", fontFamily:"Cinzel,serif", fontSize:"10px", fontWeight:"700", letterSpacing:"0.12em", border:`1px solid ${accent}`, background:`${accent}18`, color:accent }}>NEXT →</button>
                ) : null
              ) : (
                <button onClick={onReady} style={{ flex:1, padding:"11px", borderRadius:"6px", cursor:"pointer", fontFamily:"Cinzel,serif", fontSize:"11px", fontWeight:"700", letterSpacing:"0.12em", border:`1px solid ${accent}`, background:`linear-gradient(135deg,${accent}22,${accent}0A)`, color:accent }}>SET SAIL →</button>
              )}
            </div>

          </div>
        </div>

        {/* Right — progressive compass — shore background */}
        <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"24px", background:"rgba(4,10,5,0.4)" }}>
          <CompassLearnDiagram step={conceptIdx} />
        </div>

      </div>
    </div>
  );
}



/* ══════════════════════════════════════════════════════════════
   MODULE NARRATIVE CONTENT
══════════════════════════════════════════════════════════════ */

/* ══════════════════════════════════════════════════════════════
   BRIDGE CONTENT — arrival narrative per module
══════════════════════════════════════════════════════════════ */

/* ══════════════════════════════════════════════════════════════
   FINAL VOYAGE — MODULE 7
══════════════════════════════════════════════════════════════ */


function VoyageMap7({ nodeIdx, wakaPos }) {
  const W = 560, H = 500;
  const path = VOYAGE_WAYPOINTS;

  // Build the route path string
  const routeD = path.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");

  // Latitude reference lines (rough)
  const latLines = [
    { y: 75,  label: "21°S (Tonga)" },
    { y: 170, label: "30°S" },
    { y: 290, label: "37°S" },
    { y: 430, label: "43°S (Aotearoa)" },
  ];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width:"100%", height:"100%", maxHeight:"calc(100vh - 130px)" }}>
      <defs>
        <radialGradient id="voy7ocean" cx="40%" cy="40%" r="70%">
          <stop offset="0%" stopColor="#0A4A65"/>
          <stop offset="60%" stopColor="#063550"/>
          <stop offset="100%" stopColor="#030F1E"/>
        </radialGradient>
        <filter id="wakaGlow">
          <feGaussianBlur stdDeviation="4" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="nodeGlow">
          <feGaussianBlur stdDeviation="3" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      <rect width={W} height={H} fill="url(#voy7ocean)"/>

      {/* Wave texture */}
      {Array.from({length:20},(_,i) => {
        const y = 20 + i * 24;
        return <line key={i} x1={0} y1={y} x2={W} y2={y} stroke="#1A8090" strokeWidth="0.5" opacity={0.08 + (i%4)*0.03}/>;
      })}

      {/* Lat reference lines */}
      {latLines.map(l => (
        <g key={l.y}>
          <line x1={0} y1={l.y} x2={W} y2={l.y} stroke="#1E9090" strokeWidth="0.6" strokeDasharray="4,12" opacity="0.25"/>
          <text x={W-8} y={l.y-4} textAnchor="end" fill="#1A7080" fontSize="8" fontFamily="Cinzel,serif" opacity="0.7">{l.label}</text>
        </g>
      ))}

      {/* Kermadec Islands (rough position ~30°S) */}
      <circle cx={350} cy={178} r={4} fill="#1A6060" stroke="#2A8080" strokeWidth="1" opacity="0.6"/>
      <text x={356} y={176} fill="#1A6060" fontSize="8" fontFamily="Cinzel,serif" opacity="0.6">Kermadec Is.</text>

      {/* Completed route — segments sailed */}
      {path.slice(0, nodeIdx + 1).map((p, i) => {
        if (i === 0) return null;
        const prev = path[i - 1];
        return (
          <line key={i} x1={prev.x} y1={prev.y} x2={p.x} y2={p.y}
            stroke="#20C0A0" strokeWidth="1.8" strokeDasharray="6,6" opacity="0.6"/>
        );
      })}

      {/* Upcoming route — faint dotted */}
      {path.slice(nodeIdx + 1).map((p, i) => {
        const prev = path[nodeIdx + i];
        return (
          <line key={i} x1={prev.x} y1={prev.y} x2={p.x} y2={p.y}
            stroke="#1A4050" strokeWidth="1" strokeDasharray="3,8" opacity="0.4"/>
        );
      })}

      {/* Node markers */}
      {VOYAGE_NODES.map((node, i) => {
        const wp = path[i + 1]; // waypoint AFTER this node completes
        const done = i < nodeIdx;
        const current = i === nodeIdx - 1 || (nodeIdx === 0 && i === 0);
        return (
          <g key={node.id}>
            <circle cx={path[i].x} cy={path[i].y} r={done ? 6 : current ? 8 : 5}
              fill={done ? "#2AB870" : current ? "#C8941A" : "#0A3040"}
              stroke={done ? "#1A9050" : current ? "#E8C060" : "#1A4050"}
              strokeWidth={current ? 2 : 1}
              filter={current ? "url(#nodeGlow)" : undefined}
              opacity={done ? 1 : current ? 1 : 0.5}/>
            {done && (
              <text x={path[i].x} y={path[i].y + 4} textAnchor="middle"
                fill="#FFFFFF" fontSize="10" fontFamily="Cinzel,serif">✓</text>
            )}
            {!done && (
              <text x={path[i].x + 10} y={path[i].y + 4}
                fill={current ? "#C8941A" : "#1A4050"} fontSize="8" fontFamily="Cinzel,serif">
                {node.day}
              </text>
            )}
          </g>
        );
      })}

      {/* Tonga label */}
      <circle cx={path[0].x} cy={path[0].y} r={7} fill="#C8941A" stroke="#E8B830" strokeWidth="1.5"/>
      <text x={path[0].x} y={path[0].y - 12} textAnchor="middle" fill="#F0D870" fontSize="10" fontFamily="Cinzel,serif" fontWeight="700">Tonga ⚓</text>

      {/* Aotearoa label */}
      <circle cx={path[7].x} cy={path[7].y} r={nodeIdx >= 7 ? 8 : 5}
        fill={nodeIdx >= 7 ? "#2AB870" : "#0A3040"}
        stroke={nodeIdx >= 7 ? "#1A9050" : "#1A4050"} strokeWidth="1.5" opacity={nodeIdx >= 7 ? 1 : 0.5}/>
      <text x={path[7].x + 14} y={path[7].y + 4} fill={nodeIdx >= 7 ? "#60D8A0" : "#1A5060"} fontSize="10" fontFamily="Cinzel,serif" fontWeight="700">Aotearoa</text>

      {/* Waka — animated position */}
      <g transform={`translate(${wakaPos.x}, ${wakaPos.y})`} filter="url(#wakaGlow)">
        <ellipse cx={0} cy={0} rx={10} ry={3} fill="#1A3028" stroke="#4A8060" strokeWidth="1.5"/>
        <circle cx={0} cy={0} r={2.5} fill="#C8941A"/>
        <line x1={-8} y1={-2} x2={8} y2={-2} stroke="#3A5040" strokeWidth="1"/>
      </g>

      {/* Chart label */}
      <text x={12} y={H-10} fill="#1A7080" fontSize="8" fontFamily="Cinzel,serif" letterSpacing="0.12em">
        TONGA → AOTEAROA · THE FINAL VOYAGE
      </text>
    </svg>
  );
}

function FinalVoyageModule({ name, onBack, onOpenBag, unlocked }) {
  const [nodeIdx,    setNodeIdx]   = useState(0);   // which node we're on (0-5)
  const [phase,      setPhase]     = useState("sailing"); // sailing | question | hint | landfall | replay | certificate | credits
  const [selAnswer,  setSelAnswer] = useState(null);
  const [wakaPos,    setWakaPos]   = useState(VOYAGE_WAYPOINTS[0]);
  const [animating,  setAnimating] = useState(false);
  const [litCount, setLitCount] = useState(0);
  const [showCertBtn, setShowCertBtn] = useState(false);

  useEffect(() => {
    if (phase !== "replay") return;
    setLitCount(0);
    setShowCertBtn(false);
    const islands = ["tonga","samoa","tahiti","marquesas","hawaii","fiji","tonga-return","aotearoa"];
    const timers = islands.map((_, i) =>
      setTimeout(() => setLitCount(i + 1), 600 + i * 900)
    );
    const certTimer = setTimeout(
      () => setShowCertBtn(true),
      600 + islands.length * 900 + 800
    );
    return () => { timers.forEach(clearTimeout); clearTimeout(certTimer); };
  }, [phase]);

  const node = VOYAGE_NODES[nodeIdx];
  const completedAll = nodeIdx >= VOYAGE_NODES.length;

  // Animate waka toward next waypoint
  const advanceWaka = (fromIdx, toIdx, onDone) => {
    const from = VOYAGE_WAYPOINTS[fromIdx];
    const to   = VOYAGE_WAYPOINTS[toIdx];
    const steps = 40;
    let step = 0;
    setAnimating(true);
    const timer = setInterval(() => {
      step++;
      const t = step / steps;
      const ease = t < 0.5 ? 2*t*t : -1+(4-2*t)*t; // ease in-out
      setWakaPos({ x: from.x + (to.x - from.x) * ease, y: from.y + (to.y - from.y) * ease });
      if (step >= steps) {
        clearInterval(timer);
        setWakaPos(to);
        setAnimating(false);
        onDone();
      }
    }, 40);
  };

  const handleAnswer = optId => {
    if (animating) return;
    const opt = node.options.find(o => o.id === optId);
    setSelAnswer(optId);
    if (opt.correct) {
      setTimeout(() => {
        const nextNodeIdx = nodeIdx + 1;
        advanceWaka(nodeIdx, nextNodeIdx, () => {
          if (nextNodeIdx >= VOYAGE_NODES.length) {
            // All done — advance to landfall
            advanceWaka(nextNodeIdx, nextNodeIdx + 1, () => setPhase("landfall"));
          } else {
            setNodeIdx(nextNodeIdx);
            setSelAnswer(null);
            setPhase("sailing");
          }
        });
        setPhase("advancing");
      }, 1200);
    } else {
      setPhase("hint");
    }
  };

  const handleRetry = () => { setSelAnswer(null); setPhase("sailing"); };

  // Landfall screen
  if (phase === "landfall") return (
    <div style={{ width:"100%", height:"100%", background:"#04080E", display:"flex", flexDirection:"column", overflow:"hidden" }}>
      <div style={{ height:"44px", borderBottom:"1px solid #2A503022", background:"rgba(4,8,18,0.97)", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 28px", flexShrink:0 }}>
        <span style={{ fontFamily:"Cinzel,serif", fontSize:"12px", fontWeight:"700", color:"#C8941A", letterSpacing:"0.12em" }}>OCEAN ADVENTURE</span>
      </div>
      <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"32px" }}>
        <div style={{ maxWidth:"620px", width:"100%", display:"flex", flexDirection:"column", gap:"28px" }}>
          <div style={{ fontFamily:"Cinzel,serif", fontSize:"11px", color:"#2AB870", letterSpacing:"0.2em" }}>LANDFALL · AOTEAROA</div>
          <div style={{ fontFamily:"Cinzel,serif", fontSize:"36px", fontWeight:"900", color:"#60D8A0", lineHeight:"1.1" }}>
            He ao! He ao tea!
          </div>
          <div style={{ fontFamily:"Georgia,serif", fontSize:"14px", color:"#6AA890", fontStyle:"italic", lineHeight:"1.4" }}>
            A cloud! A white cloud!
          </div>
          <div style={{ width:"60px", height:"1px", background:"linear-gradient(to right, #2AB870, transparent)" }}/>
          <div style={{ display:"flex", flexDirection:"column", gap:"14px" }}>
            {[
              `The mountains of Aotearoa appeared on the horizon just as the terns said they would. The chiefs stood at the bow and wept — they had not believed it possible.`,
              `You brought them safely. Six skills. Six days at sea. The stars, the sun, the swell, the wind, the birds, and the clouds — each one held true.`,
              `The people of Aotearoa came down to the shore. They had heard of the great forest fungus spreading through their native trees, and their leaders were glad to meet with ours. Perhaps, between our peoples, there will be a way forward.`,
              `And somewhere back in Tonga, Palu Hemi is still there — his notes folded in the waka — waiting to hear what you found.`,
            ].map((line, i) => (
              <div key={i} style={{ fontFamily:"Georgia,serif", fontSize:"14px", color:"#8ABCB0", lineHeight:"1.75", fontStyle:"italic",
                borderLeft:"2px solid #2AB87044", paddingLeft:"16px" }}>
                {line}
              </div>
            ))}
          </div>
          <button onClick={() => setPhase("replay")} style={{
            alignSelf:"flex-start", padding:"13px 32px", borderRadius:"6px", cursor:"pointer",
            fontFamily:"Cinzel,serif", fontSize:"11px", fontWeight:"700", letterSpacing:"0.14em",
            border:"1px solid #2AB870", background:"rgba(42,184,112,0.12)", color:"#2AB870",
          }}>
            RECEIVE YOUR CERTIFICATE →
          </button>
        </div>
      </div>
    </div>
  );

  if (phase === "replay") {
    // Island sequence in voyage order with coordinates (matching VoyageMap roughly)
    const replayIslands = [
      { id:"tonga",     label:"Tonga",     x:210, y:310, color:"#C8941A" },
      { id:"samoa",     label:"Sāmoa",     x:245, y:200, color:"#C8941A" },
      { id:"tahiti",    label:"Tahiti",    x:450, y:310, color:"#D06030" },
      { id:"marquesas", label:"Marquesas", x:530, y:175, color:"#2A90A8" },
      { id:"hawaii",    label:"Hawaiʻi",   x:380, y:55,  color:"#4A70C0" },
      { id:"fiji",      label:"Fiji",      x:130, y:248, color:"#00C896" },
      { id:"tonga2",    label:"Tonga",     x:210, y:310, color:"#7A9EC8" },
      { id:"aotearoa",  label:"Aotearoa",  x:300, y:470, color:"#2AB870" },
    ];
    // Roads in order
    const replayRoads = [
      {from:0,to:1},{from:1,to:2},{from:2,to:3},{from:3,to:4},{from:4,to:5},{from:5,to:6},{from:6,to:7}
    ];

    return (
      <div style={{ width:"100%", height:"100%", background:"#04080E", display:"flex", flexDirection:"column", overflow:"hidden" }}>
        <div style={{ height:"44px", borderBottom:"1px solid #C8941A22", background:"rgba(4,8,18,0.97)", display:"flex", alignItems:"center", padding:"0 28px", flexShrink:0 }}>
          <span style={{ fontFamily:"Cinzel,serif", fontSize:"12px", fontWeight:"700", color:"#C8941A", letterSpacing:"0.12em" }}>OCEAN ADVENTURE</span>
        </div>
        <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"24px", padding:"32px" }}>

          {/* Title */}
          <div style={{ fontFamily:"Cinzel,serif", fontSize:"11px", color:"#C8941A", letterSpacing:"0.3em", opacity:0.7 }}>THE VOYAGE</div>

          {/* Animated map */}
          <svg viewBox="0 0 680 530" style={{ width:"min(100%,560px)", flex:1, maxHeight:"360px" }}>
            {/* Ocean background */}
            <rect width="680" height="530" fill="#030810" rx="8"/>

            {/* Roads — light up when both endpoints are lit */}
            {replayRoads.map((r, i) => {
              const from = replayIslands[r.from];
              const to   = replayIslands[r.to];
              const isLit = litCount > r.to; // road lights up when destination island lights
              return (
                <line key={i}
                  x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                  stroke={isLit ? "#C8941A" : "#0A1828"}
                  strokeWidth={isLit ? 1.5 : 0.5}
                  strokeDasharray={isLit ? "none" : "4,8"}
                  opacity={isLit ? 0.7 : 0.3}
                  style={{ transition:"all 0.8s ease" }}
                />
              );
            })}

            {/* Island dots */}
            {replayIslands.map((isl, i) => {
              const isLit = litCount > i;
              const isPulse = litCount === i + 1; // currently lighting
              return (
                <g key={isl.id}>
                  {isPulse && <circle cx={isl.x} cy={isl.y} r="22" fill={isl.color} opacity="0.15"/>}
                  <circle cx={isl.x} cy={isl.y} r={isLit ? 8 : 4}
                    fill={isLit ? isl.color : "#0A1828"}
                    stroke={isLit ? isl.color : "#1A2840"}
                    strokeWidth="1.5"
                    style={{ transition:"all 0.5s ease" }}
                  />
                  {isLit && (
                    <text x={isl.x} y={isl.y - 14} textAnchor="middle"
                      fill={isl.color} fontSize="10" fontFamily="Cinzel,serif"
                      opacity={0.9}>
                      {isl.label}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Skill tags appearing as each island lights */}
          <div style={{ display:"flex", gap:"8px", flexWrap:"wrap", justifyContent:"center" }}>
            {[
              { skill:"✦ Star Compass",  mod:1 },
              { skill:"☀ Zenith Stars",  mod:2 },
              { skill:"〰 Ocean Swells", mod:3 },
              { skill:"≋ Wind",          mod:4 },
              { skill:"🐦 Birds",        mod:5 },
              { skill:"☁ Clouds",        mod:6 },
            ].map((s, i) => (
              <div key={s.skill} style={{
                padding:"4px 12px", borderRadius:"20px",
                fontFamily:"Cinzel,serif", fontSize:"9px", letterSpacing:"0.08em",
                border:`1px solid ${litCount > i + 1 ? "#C8941A55" : "#0A1828"}`,
                color: litCount > i + 1 ? "#C8941A" : "#1A2840",
                background: litCount > i + 1 ? "rgba(200,148,26,0.08)" : "none",
                transition:"all 0.6s ease",
              }}>{s.skill}</div>
            ))}
          </div>

          {/* Certificate button — appears after all islands lit */}
          {showCertBtn && (
            <button onClick={() => setPhase("certificate")}
              style={{ padding:"14px 36px", borderRadius:"6px", cursor:"pointer", fontFamily:"Cinzel,serif", fontSize:"12px", fontWeight:"700", letterSpacing:"0.14em", border:"1px solid #C8941A", background:"rgba(200,148,26,0.14)", color:"#C8941A" }}>
              RECEIVE YOUR CERTIFICATE →
            </button>
          )}

        </div>
      </div>
    );
  }

  // Certificate screen
  if (phase === "certificate") {
    const today = new Date().toLocaleDateString("en-NZ", { year:"numeric", month:"long", day:"numeric" });
    return (
      <div style={{ width:"100%", height:"100%", background:"#04080E", display:"flex", flexDirection:"column", overflow:"hidden" }}>
        <div style={{ height:"44px", borderBottom:"1px solid #C8941A22", background:"rgba(4,8,18,0.97)", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 28px", flexShrink:0 }}>
          <span style={{ fontFamily:"Cinzel,serif", fontSize:"12px", fontWeight:"700", color:"#C8941A", letterSpacing:"0.12em" }}>OCEAN ADVENTURE</span>
          <button onClick={onBack} style={{ background:"none", border:"1px solid #C8941A33", borderRadius:"5px", padding:"5px 14px", cursor:"pointer", fontFamily:"Cinzel,serif", fontSize:"9px", color:"#C8941A88", letterSpacing:"0.1em" }}>← RETURN TO OCEAN</button>
        </div>
        <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"24px", overflowY:"auto" }}>
          <div style={{ maxWidth:"560px", width:"100%", border:"1px solid #C8941A44", borderRadius:"12px", padding:"40px 44px", background:"rgba(8,14,24,0.95)", display:"flex", flexDirection:"column", alignItems:"center", gap:"20px", textAlign:"center" }}>

            {/* Top ornament */}
            <div style={{ display:"flex", alignItems:"center", gap:"12px", width:"100%" }}>
              <div style={{ flex:1, height:"1px", background:"linear-gradient(to right, transparent, #C8941A66)" }}/>
              <span style={{ color:"#C8941A", fontSize:"16px" }}>✦</span>
              <div style={{ flex:1, height:"1px", background:"linear-gradient(to left, transparent, #C8941A66)" }}/>
            </div>

            <div style={{ fontFamily:"Cinzel,serif", fontSize:"10px", color:"#C8941A", letterSpacing:"0.3em", opacity:0.8 }}>
              OCEAN ADVENTURE · A POLYNESIAN VOYAGING EXPERIENCE
            </div>

            <div style={{ fontFamily:"Cinzel,serif", fontSize:"13px", color:"#7AACBE", letterSpacing:"0.1em" }}>
              This certifies that
            </div>

            <div style={{ fontFamily:"Cinzel,serif", fontSize:"40px", fontWeight:"900", color:"#E8D8A8", lineHeight:"1.1" }}>
              {name}
            </div>

            <div style={{ fontFamily:"Georgia,serif", fontSize:"14px", color:"#6AA8A0", fontStyle:"italic" }}>
              has completed the voyage from Tonga to Aotearoa
            </div>

            <div style={{ fontFamily:"Cinzel,serif", fontSize:"18px", fontWeight:"700", color:"#C8941A", letterSpacing:"0.08em" }}>
              Wayfinder of Ka Moana Nui
            </div>

            <div style={{ fontFamily:"Georgia,serif", fontSize:"13px", color:"#4A8080", fontStyle:"italic", lineHeight:"1.7", maxWidth:"420px" }}>
              Demonstrating mastery of the star compass, sun arc, ocean swells, wind patterns, bird signs, and the clouds and sea signs of the Pacific Ocean — navigating 1,900 km of open ocean without instruments.
            </div>

            {/* Skills row */}
            <div style={{ display:"flex", gap:"8px", flexWrap:"wrap", justifyContent:"center", margin:"4px 0" }}>
              {["✦ Stars","☀ Sun","〰 Swells","≋ Wind","🐦 Birds","☁ Clouds"].map(s => (
                <div key={s} style={{ padding:"4px 11px", border:"1px solid #C8941A33", borderRadius:"20px",
                  fontFamily:"Cinzel,serif", fontSize:"9px", color:"#C8941A", letterSpacing:"0.08em" }}>{s}</div>
              ))}
            </div>

            <div style={{ width:"100%", height:"1px", background:"linear-gradient(to right, transparent, #C8941A44, transparent)" }}/>

            <div style={{ fontFamily:"Cinzel,serif", fontSize:"11px", color:"#2AB870", letterSpacing:"0.06em" }}>
              He ao! He ao tea! · A cloud! A white cloud!
            </div>

            <div style={{ fontFamily:"Georgia,serif", fontSize:"12px", color:"#3A6050", fontStyle:"italic" }}>
              {today}
            </div>

            {/* Bottom ornament */}
            <div style={{ display:"flex", alignItems:"center", gap:"12px", width:"100%" }}>
              <div style={{ flex:1, height:"1px", background:"linear-gradient(to right, transparent, #C8941A66)" }}/>
              <span style={{ color:"#C8941A", fontSize:"16px" }}>✦</span>
              <div style={{ flex:1, height:"1px", background:"linear-gradient(to left, transparent, #C8941A66)" }}/>
            </div>

            <div style={{ fontFamily:"Cinzel,serif", fontSize:"9px", color:"#1A3028", letterSpacing:"0.12em" }}>
              Palu Hemi · Tongatapu · Master Navigator
            </div>

            <button onClick={() => setPhase("credits")} style={{ background:"none", border:"1px solid #C8941A33", borderRadius:"5px", padding:"8px 20px", cursor:"pointer", fontFamily:"Cinzel,serif", fontSize:"10px", color:"#C8941A88", letterSpacing:"0.12em", marginTop:"4px" }}>
              VIEW SOURCES & CREDITS →
            </button>

          </div>
        </div>
      </div>
    );
  }

  // ── CREDITS SCREEN — uses shared component ──────────────────
  if (phase === "credits") {
    return <CreditsScreen onBack={() => setPhase("certificate")} />;
  }

    // Main voyage screen — map + question
  const accent = "#48CAE4";

  return (
    <div style={{ width:"100%", height:"100%", background:"#04080E", display:"flex", flexDirection:"column", overflow:"hidden" }}>

      {/* Header */}
      <div style={{ height:"44px", borderBottom:`1px solid ${accent}22`, background:"rgba(4,8,18,0.97)", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 22px", flexShrink:0 }}>
        <span style={{ fontFamily:"Cinzel,serif", fontSize:"12px", fontWeight:"700", color:"#C8941A", letterSpacing:"0.12em" }}>OCEAN ADVENTURE</span>
        <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
          <span style={{ fontFamily:"Cinzel,serif", fontSize:"10.5px", color:accent, letterSpacing:"0.09em", opacity:0.8 }}>HAUMĀNA · {name.toUpperCase()}</span>
          <button onClick={onOpenBag} style={{ background:"rgba(200,148,26,0.10)", border:"1px solid #C8941A55", borderRadius:"5px", padding:"5px 12px", cursor:"pointer", fontFamily:"Cinzel,serif", fontSize:"10px", color:"#C8941A", letterSpacing:"0.08em" }}>✦ BAG ({unlocked.length})</button>
        </div>
      </div>

      {/* Module bar */}
      <div style={{ padding:"7px 22px", borderBottom:`1px solid ${accent}18`, background:"rgba(4,8,18,0.6)", flexShrink:0 }}>
        <span style={{ fontFamily:"Cinzel,serif", fontSize:"9.5px", color:accent, letterSpacing:"0.16em", opacity:0.8 }}>FINAL VOYAGE · TONGA → AOTEAROA</span>
        <span style={{ fontFamily:"Cinzel,serif", fontSize:"9.5px", color:"#1A2A40", marginLeft:"14px", letterSpacing:"0.1em" }}>
          {completedAll ? "LANDFALL" : `${node.day.toUpperCase()} · ${node.skill.toUpperCase()}`}
        </span>
      </div>

      {/* Body */}
      <div style={{ flex:1, display:"flex", overflow:"hidden", minHeight:0 }}>

        {/* Left — node card */}
        <div style={{ width:"320px", flexShrink:0, borderRight:`1px solid ${accent}18`, overflowY:"auto", display:"flex", flexDirection:"column" }}>
          <div style={{ padding:"20px 18px", display:"flex", flexDirection:"column", gap:"14px", flex:1 }}>

            {/* Nav */}
            <div style={{ display:"flex", gap:"8px" }}>
              <button onClick={onBack} style={{ flex:1, background:"none", border:`1px solid ${accent}22`, borderRadius:"4px", color:"#2A3A50", fontSize:"9.5px", fontFamily:"Cinzel,serif", letterSpacing:"0.1em", padding:"8px", cursor:"pointer" }}>← MAP</button>
            </div>

            {/* Progress dots */}
            <div style={{ display:"flex", gap:"6px", alignItems:"center" }}>
              {VOYAGE_NODES.map((_,i) => (
                <div key={i} style={{ width:i < nodeIdx ? "14px" : "8px", height:"8px", borderRadius:"4px",
                  background: i < nodeIdx ? "#2AB870" : i === nodeIdx ? accent : "#1A2840",
                  transition:"all 0.3s" }}/>
              ))}
              <div style={{ fontFamily:"Cinzel,serif", fontSize:"9px", color:"#2A3A50", marginLeft:"4px" }}>
                {nodeIdx}/{VOYAGE_NODES.length}
              </div>
            </div>

            {/* Palu's note */}
            <div style={{ background:"rgba(4,10,20,0.7)", border:`1px solid ${accent}18`, borderRadius:"7px", padding:"14px" }}>
              <div style={{ fontFamily:"Cinzel,serif", fontSize:"9px", color:`${accent}88`, letterSpacing:"0.14em", marginBottom:"8px" }}>PALU'S NOTES</div>
              <div style={{ fontFamily:"Georgia,serif", fontSize:"14px", color:"#7AACBE", lineHeight:"1.75", fontStyle:"italic" }}>
                {phase === "hint"
                  ? node.hint
                  : phase === "advancing"
                  ? node.correct
                  : node.setup}
              </div>
            </div>

            {/* Question */}
            {phase !== "advancing" && (
              <div style={{ fontFamily:"Georgia,serif", fontSize:"13px", color:"#8ABCB0", lineHeight:"1.65", fontStyle:"italic",
                borderLeft:`2px solid ${accent}44`, paddingLeft:"12px" }}>
                {node.question}
              </div>
            )}

            {/* Answer options */}
            {(phase === "sailing" || phase === "hint") && (
              <div style={{ display:"flex", flexDirection:"column", gap:"7px" }}>
                {node.options.map(opt => {
                  const chosen = selAnswer === opt.id;
                  const right  = chosen && opt.correct;
                  const wrong  = chosen && !opt.correct;
                  return (
                    <button key={opt.id} onClick={() => handleAnswer(opt.id)} style={{
                      padding:"11px 12px", borderRadius:"6px", cursor:"pointer", textAlign:"left",
                      fontFamily:"Cinzel,serif", fontSize:"11px", fontWeight:"600", lineHeight:"1.4",
                      border:`1px solid ${right ? "#2AB870" : wrong ? "#FF5533" : selAnswer ? "#0A1828" : `${accent}33`}`,
                      background: right ? "rgba(42,184,112,0.12)" : wrong ? "rgba(255,85,51,0.08)" : "rgba(255,255,255,0.02)",
                      color: right ? "#2AB870" : wrong ? "#FF6644" : selAnswer ? "#1A2840" : accent,
                      transition:"all 0.2s",
                    }}>
                      {opt.text}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Hint retry */}
            {phase === "hint" && (
              <button onClick={handleRetry} style={{
                padding:"10px", borderRadius:"6px", cursor:"pointer",
                fontFamily:"Cinzel,serif", fontSize:"10px", fontWeight:"700", letterSpacing:"0.1em",
                border:`1px solid ${accent}55`, background:`${accent}0E`, color:accent,
              }}>
                TRY AGAIN →
              </button>
            )}

            {/* Advancing state — waka moving */}
            {phase === "advancing" && (
              <div style={{ display:"flex", alignItems:"center", gap:"10px", padding:"10px 14px",
                background:"rgba(42,184,112,0.08)", border:"1px solid #2AB87033", borderRadius:"6px" }}>
                <div style={{ width:"8px", height:"8px", borderRadius:"50%", background:"#2AB870",
                  animation:"none", opacity:0.9 }}/>
                <div style={{ fontFamily:"Cinzel,serif", fontSize:"10px", color:"#2AB870", letterSpacing:"0.1em" }}>
                  SAILING...
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Right — voyage map */}
        <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"16px", background:"rgba(4,8,14,0.3)" }}>
          <VoyageMap7 nodeIdx={nodeIdx} wakaPos={wakaPos} />
        </div>

      </div>
    </div>
  );
}



/* ══════════════════════════════════════════════════════════════
   SHARED MODULE INTRO SCREEN
══════════════════════════════════════════════════════════════ */

function ModuleIntroScreen({ moduleNum, name, onBegin, onBack }) {
  const content = MODULE_CONTENT[moduleNum];
  const mod = {
    1: { num:"01", title:"The Star Compass",   sub:"Tonga → Sāmoa · Nāleo-Koʻolau · Mānaiakalani" },
    2: { num:"02", title:"The Sun's Arc",       sub:"Sāmoa → Tahiti · Latitude by day · Tama-nui-te-rā" },
    3: { num:"03", title:"Ocean Swells",        sub:"Tahiti → Marquesas · Te Moana · NNE crossing" },
    4: { num:"04", title:"Wind Patterns",       sub:"Marquesas → Hawaiʻi · Cross the ITCZ · Hau me Matagi" },
    5: { num:"05", title:"The Bird Guide",      sub:"Hawaiʻi → Fiji · Ngā Manu · Read what flies" },
    6: { num:"06", title:"Clouds & Sea Signs",  sub:"Fiji → Tonga · Kapua me te Moana · Coming home" },
  }[moduleNum];

  const accent = content.accent;
  const stars = Array.from({length:60},(_,i)=>({ x:((i*137+41)%97)/97*100, y:((i*79+23)%89)/89*100, r:i%7===0?1.3:i%3===0?0.8:0.4, op:0.1+(i%5)*0.07 }));

  return (
    <div style={{ width:"100%", height:"100%", background:"#04080E", display:"flex", flexDirection:"column", overflow:"hidden", position:"relative" }}>

      {/* Header */}
      <div style={{ height:"44px", borderBottom:`1px solid ${accent}22`, background:"rgba(4,8,18,0.97)", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 28px", flexShrink:0, zIndex:2 }}>
        <span style={{ fontFamily:"Cinzel,serif", fontSize:"12px", fontWeight:"700", color:"#C8941A", letterSpacing:"0.12em" }}>OCEAN ADVENTURE</span>
        <button onClick={onBack} style={{ background:"none", border:`1px solid ${accent}33`, borderRadius:"5px", padding:"5px 14px", cursor:"pointer", fontFamily:"Cinzel,serif", fontSize:"9.5px", color:accent, letterSpacing:"0.1em", opacity:0.7 }}>← MAP</button>
      </div>

      {/* Star field */}
      <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none", zIndex:0 }}>
        {stars.map((s,i)=><circle key={i} cx={`${s.x}%`} cy={`${s.y}%`} r={s.r} fill={accent} opacity={s.op}/>)}
      </svg>

      {/* Content — centred */}
      <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", zIndex:1, padding:"32px 40px" }}>
        <div style={{ maxWidth:"660px", width:"100%", display:"flex", flexDirection:"column", gap:"32px" }}>

          {/* Module tag */}
          <div style={{ display:"flex", alignItems:"center", gap:"16px" }}>
            <div style={{ fontFamily:"Cinzel,serif", fontSize:"11px", color:accent, letterSpacing:"0.2em", opacity:0.7 }}>MODULE {mod.num}</div>
            <div style={{ flex:1, height:"1px", background:`linear-gradient(to right, ${accent}44, transparent)` }}/>
          </div>

          {/* Title */}
          <div>
            <div style={{ fontFamily:"Cinzel,serif", fontSize:"38px", fontWeight:"900", color:"#E8D8A8", lineHeight:"1.1", marginBottom:"8px" }}>{mod.title}</div>
            <div style={{ fontFamily:"Cinzel,serif", fontSize:"12px", color:accent, letterSpacing:"0.14em", opacity:0.7 }}>{mod.sub}</div>
          </div>

          {/* Divider */}
          <div style={{ width:"60px", height:"1px", background:`linear-gradient(to right, ${accent}, transparent)` }}/>

          {/* Quote */}
          <div style={{ borderLeft:`2px solid ${accent}55`, paddingLeft:"22px" }}>
            <div style={{ fontFamily:"Georgia,serif", fontSize:"17px", color:"#B0C8C0", lineHeight:"1.75", fontStyle:"italic" }}>
              "{content.intro.quote}"
            </div>
            <div style={{ fontFamily:"Cinzel,serif", fontSize:"10px", color:accent, letterSpacing:"0.1em", marginTop:"12px", opacity:0.65 }}>
              — {content.intro.attribution}
            </div>
          </div>

          {/* CTA */}
          <div style={{ display:"flex", gap:"12px", alignItems:"center", paddingTop:"8px" }}>
            <button onClick={onBegin} style={{ padding:"14px 36px", background:`linear-gradient(135deg, ${accent}22, ${accent}11)`, border:`1px solid ${accent}`, borderRadius:"6px", cursor:"pointer", fontFamily:"Cinzel,serif", fontSize:"12px", fontWeight:"700", color:accent, letterSpacing:"0.14em" }}>
              BEGIN LEARNING →
            </button>
            <div style={{ fontFamily:"Cinzel,serif", fontSize:"9px", color:"#2A3A50", letterSpacing:"0.1em" }}>E {name.toUpperCase()} · HAUMĀNA</div>
          </div>

        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   SHARED MODULE LEARN SCREEN
══════════════════════════════════════════════════════════════ */

function ModuleLearnScreen({ moduleNum, name, onReady, onBack, onOpenBag, unlocked, children }) {
  const content  = MODULE_CONTENT[moduleNum];
  const accent   = content.accent;
  const { title, concepts } = content.learn;
  const dep      = content.departure;

  // Shore colour palette — warm dark greens and earthy tones
  const shoreBg    = "#060E08";
  const shoreMid   = "rgba(6,14,8,0.96)";
  const shorePanel = "rgba(4,10,6,0.85)";
  const shoreAccentDim = `${accent}22`;

  return (
    <div style={{ width:"100%", height:"100%", background:shoreBg, display:"flex", flexDirection:"column", overflow:"hidden" }}>

      {/* Header */}
      <div style={{ height:"44px", borderBottom:`1px solid ${accent}33`, background:shoreMid, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 22px", flexShrink:0 }}>
        <span style={{ fontFamily:"Cinzel,serif", fontSize:"12px", fontWeight:"700", color:"#C8941A", letterSpacing:"0.12em" }}>OCEAN ADVENTURE</span>
        <span style={{ fontFamily:"Cinzel,serif", fontSize:"10.5px", color:accent, letterSpacing:"0.09em", opacity:0.8 }}>HAUMĀNA · {name.toUpperCase()}</span>
      </div>

      {/* Location bar — on shore */}
      <div style={{ padding:"7px 22px", borderBottom:`1px solid ${accent}22`, background:"rgba(4,10,6,0.7)", flexShrink:0, display:"flex", alignItems:"center", gap:"14px" }}>
        <span style={{ fontFamily:"Cinzel,serif", fontSize:"9.5px", color:accent, letterSpacing:"0.16em", opacity:0.9 }}>ON SHORE · {dep.location.toUpperCase()}</span>
          <span style={{ fontFamily:"Georgia,serif", fontSize:"11px", color:`${accent}88`, fontStyle:"italic" }}>{dep.note}</span>
      </div>

      {/* Body */}
      <div style={{ flex:1, display:"flex", overflow:"hidden", minHeight:0 }}>

        {/* Left — concept list */}
        <div style={{ width:"320px", flexShrink:0, borderRight:`1px solid ${accent}18`, overflowY:"auto", background:shorePanel }}>
          <div style={{ padding:"22px 20px", display:"flex", flexDirection:"column", gap:"16px" }}>

            {/* Nav */}
            <div style={{ display:"flex", gap:"8px" }}>
              <button onClick={onBack} style={{ flex:1, background:"none", border:`1px solid ${accent}22`, borderRadius:"4px", color:"#2A3A28", fontSize:"9.5px", fontFamily:"Cinzel,serif", letterSpacing:"0.1em", padding:"8px", cursor:"pointer" }}>← MAP</button>
              <button onClick={onOpenBag} style={{ flex:1, background:unlocked.length>0?"rgba(200,148,26,0.10)":"none", border:`1px solid ${unlocked.length>0?"#C8941A55":accent+"22"}`, borderRadius:"4px", color:unlocked.length>0?"#C8941A":"#2A3A28", fontSize:"9.5px", fontFamily:"Cinzel,serif", letterSpacing:"0.1em", padding:"8px", cursor:"pointer" }}>
                {unlocked.length>0 ? `✦ BAG (${unlocked.length})` : "✦ BAG"}
              </button>
            </div>

            {/* Section label */}
            <div style={{ fontFamily:"Cinzel,serif", fontSize:"10px", color:accent, letterSpacing:"0.18em", opacity:0.7 }}>PALU TEACHES</div>

            {/* Concept cards */}
            {concepts.map((c,i) => (
              <div key={i} style={{ borderLeft:`2px solid ${accent}55`, paddingLeft:"14px", display:"flex", flexDirection:"column", gap:"6px" }}>
                <div style={{ fontFamily:"Cinzel,serif", fontSize:"13px", fontWeight:"700", color:"#C8B880", letterSpacing:"0.04em" }}>{c.heading}</div>
                <div style={{ fontFamily:"Georgia,serif", fontSize:"14px", color:"#7AACBE", lineHeight:"1.75", fontStyle:"italic" }}>{c.body}</div>
              </div>
            ))}

            {/* Set sail button */}
            <div style={{ paddingTop:"8px", borderTop:`1px solid ${accent}22` }}>
              <button onClick={onReady} style={{ width:"100%", padding:"14px", borderRadius:"6px", fontFamily:"Cinzel,serif", fontSize:"11px", fontWeight:"700", letterSpacing:"0.14em", cursor:"pointer", border:`1px solid ${accent}`, background:`linear-gradient(135deg, ${accent}22, ${accent}0A)`, color:accent }}>
                SET SAIL →
              </button>
            </div>

          </div>
        </div>

        {/* Right — visual/illustration — shore light */}
        <div style={{ flex:1, overflowY:"auto", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"28px 32px", background:"rgba(4,10,5,0.4)" }}>
          {children}
        </div>

      </div>
    </div>
  );
}


function PaluPanel({ step, selHouse, selStar, hovHouse, hovStar, name, onBack, onOpenBag, unlocked }) {
  const correctHouse = selHouse && Math.abs(selHouse.angle - 22.5) < 6;
  const correctStar  = selStar?.correct;

  let title = "", body = "";
  if (step === 3) {
    title = "Mānaiakalani. Our guide to Sāmoa.";
    body  = `It rises in Nāleo-Koʻolau — just north-northeast. Keep it on your starboard bow through the night and you hold your heading. You carry this knowledge now, ${name}. Let us set sail.`;
  } else if (step === 2) {
    if (selStar && !correctStar) {
      title = `${selStar.name}.`;
      body  = selStar.desc + " We need a star rising in Nāleo-Koʻolau for our NNE heading.";
    } else if (hovStar) {
      title = hovStar.name;
      body  = hovStar.desc;
    } else {
      title = "Find the right star.";
      body  = "Sāmoa lies in the Nāleo-Koʻolau house — 22.5° north-northeast. Five stars are visible tonight. Which one rises in that house? Hover each to hear where it sits — then choose.";
    }
  } else {
    if (!selHouse) {
      title = `E ${name}.`;
      body  = "You stand on the pola of the waka at midnight. Sāmoa lies to the north-northeast — roughly 800 km across open ocean. Click the house on the compass that shows your heading.";
    } else if (!correctHouse) {
      title = `${selHouse.name}.`;
      body  = `That house faces ${dirName(selHouse.angle)}. Sāmoa lies NNE of Tonga — the Nāleo-Koʻolau house, at about 22.5°. Try again.`;
    } else {
      title = "Nāleo-Koʻolau. You have it.";
      body  = "North-northeast. Your heading is locked. Now find the star that rises in this house.";
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "18px", height: "100%", boxSizing: "border-box" }}>

      <div style={{ display: "flex", gap: "8px" }}>
        <button onClick={onBack} style={{ flex: 1, background: "none", border: "1px solid #0E1826", borderRadius: "4px", color: "#2A4050", fontSize: "9px", fontFamily: "Cinzel,serif", letterSpacing: "0.1em", padding: "7px", cursor: "pointer" }}>← MAP</button>
        <button onClick={onOpenBag} style={{ flex: 1, background: unlocked.length > 0 ? "rgba(200,148,26,0.10)" : "none", border: `1px solid ${unlocked.length > 0 ? "#C8941A55" : "#0E1826"}`, borderRadius: "4px", color: unlocked.length > 0 ? "#C8941A" : "#2A4050", fontSize: "9px", fontFamily: "Cinzel,serif", letterSpacing: "0.1em", padding: "7px", cursor: "pointer" }}>
          {unlocked.length > 0 ? `✦ BAG (${unlocked.length})` : "✦ BAG"}
        </button>
      </div>

      <div style={{ background: "rgba(12,20,40,0.85)", border: "1px solid #1E3050", borderRadius: "7px", padding: "12px 14px" }}>
        <div style={{ fontSize: "9px", letterSpacing: "0.18em", color: "#3A6070", fontFamily: "Cinzel,serif", marginBottom: "5px" }}>TONGA → SĀMOA</div>
        <div style={{ fontSize: "14px", color: "#C0DCF0", fontFamily: "Cinzel,serif", fontWeight: "700", marginBottom: "2px" }}>Night 1 · Departure</div>
        <div style={{ fontSize: "10.5px", color: "#507080", fontFamily: "Cinzel,serif" }}>Midnight · Tongatapu · 21°S</div>
      </div>

      <div style={{ display: "flex", gap: "4px" }}>
        {["1 · Bearing", "2 · Star", "✦ Set"].map((label, i) => {
          const done = i + 1 < step, curr = i + 1 === step;
          return <div key={i} style={{ flex: 1, textAlign: "center", padding: "5px 2px", fontSize: "8px", fontFamily: "Cinzel,serif", letterSpacing: "0.06em", background: curr ? "rgba(200,148,26,0.18)" : done ? "rgba(26,120,110,0.18)" : "rgba(255,255,255,0.03)", border: `1px solid ${curr ? "#C8941A" : done ? "#1A8870" : "#1E3050"}`, borderRadius: "4px", color: curr ? "#F0C040" : done ? "#2BB5A0" : "#3A5060" }}>{label}</div>;
        })}
      </div>

      <div style={{ flex: 1, background: "rgba(6,11,22,0.7)", border: "1px solid #161F34", borderRadius: "7px", padding: "16px", display: "flex", flexDirection: "column", gap: "10px", minHeight: 0, overflowY: "auto" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}><div style={{ fontSize: "11px", color: "#365060", fontFamily: "Cinzel,serif", letterSpacing: "0.14em" }}>THE PALU SPEAKS</div><span style={{ fontSize:"16px", opacity:0.75 }}>🦜</span></div>
        <div style={{ fontSize: "17px", color: "#D0A838", fontFamily: "Cinzel,serif", fontWeight: "700", lineHeight: "1.4" }}>{title}</div>
        <div style={{ fontSize: "14px", color: "#7AACBE", fontFamily: "Georgia,serif", fontStyle: "italic", lineHeight: "1.7" }}>{body}</div>
        {step === 2 && !selStar && !hovStar && (
          <div style={{ padding: "9px 12px", background: "rgba(18,55,80,0.4)", borderLeft: "2px solid #1A7A6E", borderRadius: "0 4px 4px 0", fontSize: "11px", color: "#5AABB8", fontFamily: "Georgia,serif" }}>Hover over the glowing stars — then click to choose.</div>
        )}
        {step === 3 && (
          <div style={{ marginTop: "auto", padding: "11px", background: "rgba(200,148,26,0.10)", border: "1px solid rgba(200,148,26,0.28)", borderRadius: "6px", textAlign: "center", fontFamily: "Cinzel,serif", fontSize: "10px", color: "#C8941A", letterSpacing: "0.09em" }}>✦ STAR COMPASS ADDED TO YOUR BAG ✦</div>
        )}
      </div>

      {hovHouse && step === 1 && (
        <div style={{ padding: "6px 11px", background: "rgba(8,16,32,0.9)", border: "1px solid #1E3050", borderRadius: "4px", fontSize: "10px", color: "#6A9BBC", fontFamily: "Cinzel,serif", textAlign: "center" }}>{hovHouse.name}</div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   SKY ARC VIEW
══════════════════════════════════════════════════════════════ */

function SkyArc({ scenario, timeVal, step, selAlt, selLat, confirming, onTimeChange, onAltSelect, onLatSelect }) {
  const SW = 560, SH = 300;
  const horizY = SH - 32;
  const zenithY = 26;
  const eastX = 48, westX = SW - 48;
  const centreX = (eastX + westX) / 2;

  // Compute altitude (degrees) at a given minute offset from 6am
  const altAt = mins => {
    const ha = ((mins / 60) - 6) * 15 * Math.PI / 180;
    const latR = scenario.lat * Math.PI / 180;
    const declR = scenario.decl * Math.PI / 180;
    return Math.asin(Math.max(-1, Math.min(1,
      Math.sin(latR) * Math.sin(declR) + Math.cos(latR) * Math.cos(declR) * Math.cos(ha)
    ))) * 180 / Math.PI;
  };

  const sunXY = mins => {
    const alt = altAt(mins);
    return {
      x: eastX + (mins / 720) * (westX - eastX),
      y: alt > 0 ? horizY - (alt / 90) * (horizY - zenithY) : horizY + 20,
      alt,
    };
  };

  // Arc path (above-horizon only)
  const arcPts = [];
  for (let i = 0; i <= 144; i++) {
    const p = sunXY(i * 5);
    if (p.alt > 0.3) arcPts.push(p);
  }
  const arcD = arcPts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

  const sun      = sunXY(step >= 2 ? 360 : timeVal);
  const noon     = sunXY(360);
  const isNearNoon = step === 1 && Math.abs(timeVal - 360) <= 10;

  // Protractor arc — hand-drawn polyline to avoid SVG arc direction confusion
  const pR = 44;
  const protArcD = Array.from({ length: 22 }, (_, i) => {
    const a = (i / 21) * scenario.noonAlt * Math.PI / 180;
    return `${i === 0 ? "M" : "L"}${(centreX + pR * Math.cos(a)).toFixed(1)},${(horizY - pR * Math.sin(a)).toFixed(1)}`;
  }).join(" ");

  const fmtTime = m => `${Math.floor(m / 60) + 6}:${String(Math.floor(m % 60)).padStart(2, "0")}`;

  const btnSty = (val, correct, isSel) => {
    const right = isSel && val === correct;
    const wrong = isSel && val !== correct;
    return {
      padding: "13px 6px", borderRadius: "6px", fontFamily: "Cinzel,serif",
      fontSize: "15px", fontWeight: "700", cursor: "pointer",
      border: `1px solid ${right ? "#FFD700" : wrong ? "#FF5533" : "#1A3A50"}`,
      background: right ? "rgba(255,215,0,0.12)" : wrong ? "rgba(255,85,51,0.10)" : "rgba(255,255,255,0.03)",
      color: right ? "#FFD700" : wrong ? "#FF6644" : "#4A7090",
    };
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <svg viewBox={`0 0 ${SW} ${SH}`} style={{ width: "100%", borderRadius: "8px", background: "#050B1A" }}>
        <defs>
          <linearGradient id="skyG2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#050B1A" />
            <stop offset="65%"  stopColor="#091E38" />
            <stop offset="100%" stopColor="#0E3A54" />
          </linearGradient>
          <filter id="sGlow">
            <feGaussianBlur stdDeviation="5" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <rect width={SW} height={SH} fill="url(#skyG2)" />

        {/* Altitude reference lines */}
        {[15, 30, 45, 60, 75].map(alt => {
          const y = horizY - (alt / 90) * (horizY - zenithY);
          return (
            <g key={alt}>
              <line x1={eastX - 4} y1={y} x2={westX + 4} y2={y}
                stroke="#122840" strokeWidth="0.8" strokeDasharray="3,8" />
              <text x={eastX - 8} y={y + 4} textAnchor="end"
                fill="#1A3A58" fontSize="9" fontFamily="Cinzel,serif">{alt}°</text>
            </g>
          );
        })}

        {/* Ocean / horizon */}
        <rect x={0} y={horizY} width={SW} height={SH - horizY} fill="#030810" />
        <line x1={0} y1={horizY} x2={SW} y2={horizY} stroke="#1E6070" strokeWidth="1.5" />

        {/* Cardinal labels */}
        {[["EAST", eastX], ["SOUTH", centreX], ["WEST", westX]].map(([lbl, x]) => (
          <text key={lbl} x={x} y={horizY - 5} textAnchor="middle"
            fill="#1A5060" fontSize="8.5" fontFamily="Cinzel,serif">{lbl}</text>
        ))}

        {/* Zenith marker */}
        <line x1={centreX - 10} y1={zenithY} x2={centreX + 10} y2={zenithY}
          stroke="#1A2A40" strokeWidth="0.8" />
        <text x={centreX} y={zenithY - 4} textAnchor="middle"
          fill="#1A2840" fontSize="8" fontFamily="Cinzel,serif">ZENITH 90°</text>

        {/* Sun arc path */}
        {arcD && <path d={arcD} fill="none" stroke="#C87010" strokeWidth="1.4" opacity="0.4" strokeDasharray="5,6" />}

        {/* Altitude measurement line + protractor — step 2+ */}
        {step >= 2 && (
          <g>
            {/* Horizon baseline for protractor */}
            <line x1={centreX} y1={horizY} x2={centreX + 60} y2={horizY}
              stroke="#FFD060" strokeWidth="1" opacity="0.3" />
            {/* Measurement line to sun */}
            <line x1={centreX} y1={horizY} x2={noon.x} y2={noon.y}
              stroke="#FFD060" strokeWidth="1.5" strokeDasharray="5,4" opacity="0.7" />
            {/* Protractor arc */}
            <path d={protArcD} fill="none" stroke="#FFD060" strokeWidth="1.2" opacity="0.5" />
            {/* Angle label */}
            <text x={noon.x + 12} y={noon.y - 6}
              fill="#FFD060" fontSize="14" fontFamily="Cinzel,serif" fontWeight="700" opacity="0.95">
              {step >= 3 ? `${scenario.noonAlt}°` : "?°"}
            </text>
          </g>
        )}

        {/* Sun */}
        <g filter="url(#sGlow)">
          <circle cx={sun.x} cy={sun.y} r={isNearNoon ? 11 : 8}
            fill="#FFD060" opacity={isNearNoon ? 0.18 : 0.10} />
          <circle cx={sun.x} cy={sun.y} r={isNearNoon ? 7 : 5} fill="#FFD060" />
        </g>

        {/* Noon lock label */}
        {isNearNoon && (
          <text x={centreX} y={zenithY + 18} textAnchor="middle"
            fill="#FFD060" fontSize="9.5" fontFamily="Cinzel,serif" opacity="0.9">✦ LOCAL NOON</text>
        )}

        {/* Time display */}
        {step === 1 && (
          <text x={SW - 10} y={17} textAnchor="end"
            fill="#2A6070" fontSize="11" fontFamily="Cinzel,serif">{fmtTime(timeVal)}</text>
        )}
      </svg>

      {/* Time slider */}
      {step === 1 && (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontFamily: "Cinzel,serif", fontSize: "9px", color: "#2A5060", width: "34px" }}>6:00</span>
          <input type="range" min={0} max={720} step={1} value={timeVal}
            onChange={e => onTimeChange(Number(e.target.value))}
            style={{ flex: 1, accentColor: "#C8941A", cursor: "pointer" }} />
          <span style={{ fontFamily: "Cinzel,serif", fontSize: "9px", color: "#2A5060", width: "34px", textAlign: "right" }}>18:00</span>
        </div>
      )}

      {/* Altitude options */}
      {step === 2 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", pointerEvents: confirming ? "none" : "auto", opacity: confirming ? 0.6 : 1, transition: "opacity 0.3s" }}>
          <div style={{ fontFamily: "Cinzel,serif", fontSize: "9px", color: "#3A6070", letterSpacing: "0.14em", textAlign: "center" }}>
            WHAT IS THE SUN'S NOON ALTITUDE?
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "8px" }}>
            {scenario.altOptions.map(alt => (
              <button key={alt} onClick={() => onAltSelect(alt)}
                style={btnSty(alt, scenario.noonAlt, selAlt === alt)}>
                {alt}°
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Latitude options */}
      {step === 3 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", pointerEvents: confirming ? "none" : "auto", opacity: confirming ? 0.6 : 1, transition: "opacity 0.3s" }}>
          <div style={{ fontFamily: "Cinzel,serif", fontSize: "9px", color: "#3A6070", letterSpacing: "0.14em", textAlign: "center" }}>
            WHAT IS YOUR LATITUDE?
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "8px" }}>
            {scenario.latOptions.map(lat => (
              <button key={lat} onClick={() => onLatSelect(lat)}
                style={btnSty(lat, scenario.lat, selLat === lat)}>
                {lat}°N
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   SUN ARC MODULE
══════════════════════════════════════════════════════════════ */

function SunArcModule({ name, onBack, onOpenBag, unlocked, onComplete, onBridge }) {
  const [phase,      setPhase]     = useState("intro");
  const [learnStep,  setLearnStep] = useState(0);
  const [actStep,    setActStep]   = useState(1);
  const [noonFound,  setNoonFound] = useState(false);
  const [handY,      setHandY]     = useState(null);
  const [isDragging, setIsDragging]= useState(false);
  const [matalaScolded, setMatalaScolded] = useState(false);
  const [matalaScoldVisible, setMatalaScoldVisible] = useState(false);
  const [niceWork,   setNiceWork]  = useState(null);
  const [showContinue, setShowContinue] = useState(false);
  const [confirmed,  setConfirmed] = useState(false);
  const [sunTime,    setSunTime]   = useState(0); // for noon-finding animation

  // Sun animation for step 1 — must be at top level before any early returns
  useEffect(() => {
    if (phase === "activity" && actStep === 1 && !noonFound) {
      const id = setInterval(() => setSunTime(t => (t + 0.4) % 100), 40);
      return () => clearInterval(id);
    }
  }, [phase, actStep, noonFound]);

  useEffect(() => {
    if (niceWork === "done") {
      setShowContinue(false);
      const t = setTimeout(() => setShowContinue(true), 1500);
      return () => clearTimeout(t);
    }
  }, [niceWork]);

  const accent = "#D06030";
  const TAHITI_HAND = 0.81; // target hand height (73° out of 90° = ~0.81)
  const TOLERANCE   = 0.05;

  // ── INTRO ──────────────────────────────────────────────────────
  if (phase === "intro") {
    const content = MODULE_CONTENT[2];
    const mod = { num:"02", title:"The Sun's Arc", sub:"Sāmoa → Tahiti · ʻAʻā · Tama-nui-te-rā" };
    const stars = Array.from({length:60},(_,i)=>({ x:((i*137+41)%97)/97*100, y:((i*79+23)%89)/89*100, r:i%7===0?1.3:i%3===0?0.8:0.4, op:0.1+(i%5)*0.07 }));
    return (
      <div style={{ width:"100%", height:"100%", background:"#04080E", display:"flex", flexDirection:"column", overflow:"hidden", position:"relative" }}>
        <div style={{ height:"44px", borderBottom:`1px solid ${accent}22`, background:"rgba(4,8,18,0.97)", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 28px", flexShrink:0, zIndex:2 }}>
          <span style={{ fontFamily:"Cinzel,serif", fontSize:"12px", fontWeight:"700", color:"#C8941A", letterSpacing:"0.12em" }}>OCEAN ADVENTURE</span>
          <button onClick={onBack} style={{ background:"none", border:`1px solid ${accent}33`, borderRadius:"5px", padding:"5px 14px", cursor:"pointer", fontFamily:"Cinzel,serif", fontSize:"9.5px", color:accent, letterSpacing:"0.1em", opacity:0.7 }}>← MAP</button>
        </div>
        <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none", zIndex:0 }}>
          {stars.map((s,i)=><circle key={i} cx={`${s.x}%`} cy={`${s.y}%`} r={s.r} fill={accent} opacity={s.op}/>)}
        </svg>
        <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", zIndex:1, padding:"32px 40px" }}>
          <div style={{ maxWidth:"700px", width:"100%", display:"flex", gap:"48px", alignItems:"center" }}>
            {/* Palu portrait */}
            <div style={{ flexShrink:0, display:"flex", flexDirection:"column", alignItems:"center", gap:"10px" }}>
              <div style={{ width:"140px", height:"160px", borderRadius:"10px", overflow:"hidden", border:`1px solid ${accent}33` }}>
                <PaluPortrait />
              </div>
              <div style={{ fontFamily:"Cinzel,serif", fontSize:"10px", fontWeight:"700", color:accent }}>Palu Hemi</div>
                    <div style={{ fontFamily:"Cinzel,serif", fontSize:"11px", color:"#7AACBE", letterSpacing:"0.08em" }}>Master Navigator</div>
            </div>
            {/* Quote + CTA */}
            <div style={{ flex:1, display:"flex", flexDirection:"column", gap:"28px" }}>
              <div style={{ display:"flex", alignItems:"center", gap:"16px" }}>
                <div style={{ fontFamily:"Cinzel,serif", fontSize:"11px", color:accent, letterSpacing:"0.2em", opacity:0.7 }}>MODULE {mod.num}</div>
                <div style={{ flex:1, height:"1px", background:`linear-gradient(to right, ${accent}44, transparent)` }}/>
              </div>
              <div>
                <div style={{ fontFamily:"Cinzel,serif", fontSize:"36px", fontWeight:"900", color:"#E8D8A8", lineHeight:"1.1", marginBottom:"8px" }}>{mod.title}</div>
                <div style={{ fontFamily:"Cinzel,serif", fontSize:"12px", color:accent, letterSpacing:"0.14em", opacity:0.7 }}>{mod.sub}</div>
              </div>
              <div style={{ width:"60px", height:"1px", background:`linear-gradient(to right, ${accent}, transparent)` }}/>
              <div style={{ borderLeft:`2px solid ${accent}55`, paddingLeft:"22px" }}>
                <div style={{ fontFamily:"Georgia,serif", fontSize:"17px", color:"#B0C8C0", lineHeight:"1.75", fontStyle:"italic" }}>
                  "{content.intro.quote}"
                </div>
                <div style={{ fontFamily:"Cinzel,serif", fontSize:"10px", color:accent, letterSpacing:"0.1em", marginTop:"12px", opacity:0.65 }}>
                  — {content.intro.attribution}
                </div>
              </div>
              <div style={{ display:"flex", gap:"12px", alignItems:"center" }}>
                <button onClick={() => setPhase("learn")} style={{ padding:"14px 36px", background:`linear-gradient(135deg, ${accent}22, ${accent}11)`, border:`1px solid ${accent}`, borderRadius:"6px", cursor:"pointer", fontFamily:"Cinzel,serif", fontSize:"12px", fontWeight:"700", color:accent, letterSpacing:"0.14em" }}>
                  BEGIN LEARNING →
                </button>
                <div style={{ fontFamily:"Cinzel,serif", fontSize:"9px", color:"#2A3A50", letterSpacing:"0.1em" }}>E {name.toUpperCase()} · HAUMĀNA</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── LEARN — 4 click-through screens ────────────────────────────
  if (phase === "learn") {
    const concepts = MODULE_CONTENT[2].learn.concepts;
    const concept  = concepts[learnStep];
    const isLast   = learnStep === concepts.length - 1;
    const dep      = MODULE_CONTENT[2].departure;

    // SVG diagrams per screen
    const renderDiagram = () => {
      if (learnStep === 0) {
        // Screen 1: cross-section of earth showing zenith lines → ʻAʻā overhead at Tahiti
        return (
          <svg viewBox="0 0 480 300" style={{ width:"100%", borderRadius:"8px", background:"#050B18" }}>
            {/* Sky */}
            <rect width="480" height="220" fill="#050B18"/>
            {/* Earth surface */}
            <rect x="0" y="220" width="480" height="80" fill="#0A1808"/>
            <line x1="0" y1="220" x2="480" y2="220" stroke="#1A4020" strokeWidth="1.5"/>
            {/* Labels on ground */}
            <text x="80" y="240" textAnchor="middle" fill="#2A5030" fontSize="9" fontFamily="Cinzel,serif">EQUATOR</text>
            <text x="240" y="240" textAnchor="middle" fill="#2A5030" fontSize="9" fontFamily="Cinzel,serif">SĀMOA · 14°S</text>
            <text x="390" y="240" textAnchor="middle" fill="#D06030" fontSize="9" fontFamily="Cinzel,serif" fontWeight="700">TAHITI · 17°S</text>
            {/* Zenith lines shooting up */}
            <line x1="80" y1="220" x2="80" y2="40" stroke="#1A5030" strokeWidth="1" strokeDasharray="4,6" opacity="0.5"/>
            <line x1="240" y1="220" x2="240" y2="40" stroke="#1A5030" strokeWidth="1" strokeDasharray="4,6" opacity="0.5"/>
            <line x1="390" y1="220" x2="390" y2="40" stroke="#D06030" strokeWidth="2" strokeDasharray="4,4" opacity="0.8"/>
            {/* ʻAʻā star — sits at end of Tahiti's zenith line */}
            <circle cx="390" cy="38" r="10" fill="#C0E8FF" opacity="0.95"/>
            <circle cx="390" cy="38" r="18" fill="none" stroke="#C0E8FF" strokeWidth="1" opacity="0.3"/>
            <text x="415" y="32" fill="#C0E8FF" fontSize="12" fontFamily="Cinzel,serif" fontWeight="700">ʻAʻā</text>
            <text x="415" y="46" fill="#C0E8FF" fontSize="9" fontFamily="Cinzel,serif" opacity="0.7">(Sirius)</text>
            {/* Arrow annotation */}
            <text x="390" y="80" textAnchor="middle" fill="#D06030" fontSize="10" fontFamily="Cinzel,serif" opacity="0.8">↕ directly</text>
            <text x="390" y="93" textAnchor="middle" fill="#D06030" fontSize="10" fontFamily="Cinzel,serif" opacity="0.8">overhead</text>
            {/* Another dim star above equator */}
            <circle cx="80" cy="55" r="6" fill="#8AB0D0" opacity="0.5"/>
            <text x="105" y="50" fill="#8AB0D0" fontSize="9" fontFamily="Cinzel,serif" opacity="0.5">Atutahi</text>
            <text x="105" y="62" fill="#8AB0D0" fontSize="10" fontFamily="Cinzel,serif" opacity="0.6">(equator)</text>
          </svg>
        );
      }
      if (learnStep === 1) {
        // Screen 2: night sky view — ʻAʻā passing overhead as you sail south
        return (
          <svg viewBox="0 0 480 280" style={{ width:"100%", borderRadius:"8px", background:"#030810" }}>
            <rect width="480" height="280" fill="#030810"/>
            {/* Stars scattered */}
            {[[40,40,3],[120,25,2],[200,55,2.5],[330,20,3.5],[420,45,2],[160,90,2],[380,80,2.5]].map(([x,y,r],i)=>(
              <circle key={i} cx={x} cy={y} r={r} fill="#7AACCC" opacity="0.5"/>
            ))}
            {/* Overhead zenith marker */}
            <line x1="240" y1="0" x2="240" y2="260" stroke="#C8941A" strokeWidth="1" strokeDasharray="3,7" opacity="0.25"/>
            <text x="240" y="14" textAnchor="middle" fill="#C8941A" fontSize="11" fontFamily="Cinzel,serif" opacity="0.6">DIRECTLY OVERHEAD</text>
            {/* ʻAʻā - glowing bright */}
            <circle cx="240" cy="60" r="14" fill="#C0E8FF" opacity="0.15"/>
            <circle cx="240" cy="60" r="9" fill="#C0E8FF" opacity="0.95"/>
            <text x="265" y="54" fill="#C0E8FF" fontSize="13" fontFamily="Cinzel,serif" fontWeight="700">ʻAʻā</text>
            <text x="265" y="69" fill="#C0E8FF" fontSize="10" fontFamily="Cinzel,serif" opacity="0.7">directly above</text>
            {/* Horizon */}
            <rect x="0" y="220" width="480" height="60" fill="#030C08"/>
            <line x1="0" y1="220" x2="480" y2="220" stroke="#1A5030" strokeWidth="1.5"/>
            <text x="240" y="245" textAnchor="middle" fill="#2A5030" fontSize="9" fontFamily="Cinzel,serif" letterSpacing="0.1em">HORIZON</text>
            {/* Waka silhouette */}
            <path d="M160,220 Q240,212 320,220 L315,226 Q240,222 165,226 Z" fill="#0A1808" stroke="#1A4020" strokeWidth="1"/>
            <line x1="240" y1="220" x2="240" y2="196" stroke="#1A3010" strokeWidth="1.5"/>
            {/* Label */}
            <text x="240" y="272" textAnchor="middle" fill="#D06030" fontSize="11" fontFamily="Cinzel,serif" fontWeight="700">ʻAʻā overhead = you are on Tahiti's path</text>
          </svg>
        );
      }
      if (learnStep === 2) {
        // Screen 3: cloudy night, sun during the day — split into two SVGs so narrow viewports can stack (no squashed label overlap).
        return (
          <div className="m2-learn-dual-sky">
            <svg viewBox="0 0 235 280" aria-hidden>
              <rect width="235" height="280" fill="#050A10"/>
              <rect x="0" y="220" width="235" height="60" fill="#030810"/>
              <line x1="0" y1="220" x2="235" y2="220" stroke="#1A3040" strokeWidth="1"/>
              <ellipse cx="120" cy="60" rx="75" ry="28" fill="#1A2030" opacity="0.9"/>
              <ellipse cx="90" cy="70" rx="55" ry="22" fill="#182030" opacity="0.85"/>
              <ellipse cx="150" cy="68" rx="60" ry="24" fill="#182030" opacity="0.85"/>
              <text x="118" y="67" textAnchor="middle" fill="#3A5060" fontSize="10" fontFamily="Cinzel,serif">cloud</text>
              <circle cx="118" cy="38" r="7" fill="#C0E8FF" opacity="0.15"/>
              <text x="118" y="36" textAnchor="middle" fill="#6A9AB8" fontSize="10" fontFamily="Cinzel,serif">ʻAʻā?</text>
              <text x="118" y="160" textAnchor="middle" fill="#3A5060" fontSize="10" fontFamily="Cinzel,serif">Stars hidden</text>
              <text x="118" y="175" textAnchor="middle" fill="#3A5060" fontSize="9" fontFamily="Cinzel,serif">two nights</text>
              <text x="118" y="200" textAnchor="middle" fill="#2A4050" fontSize="9" fontFamily="Cinzel,serif">NIGHT</text>
            </svg>
            <svg viewBox="0 0 242 280" aria-hidden>
              <rect width="242" height="280" fill="#08141E"/>
              <rect x="0" y="220" width="242" height="60" fill="#030C08"/>
              <line x1="0" y1="220" x2="242" y2="220" stroke="#1A4020" strokeWidth="1"/>
              <circle cx="121" cy="65" r="18" fill="#FFD060" opacity="0.15"/>
              <circle cx="121" cy="65" r="11" fill="#FFD060" opacity="0.95"/>
              <path d="M10,220 Q121,40 232,220" fill="none" stroke="#D06030" strokeWidth="1.2" strokeDasharray="6,5" opacity="0.5"/>
              <text x="121" y="46" textAnchor="middle" fill="#FFD060" fontSize="10" fontFamily="Cinzel,serif">Tama-nui-te-rā</text>
              <text x="121" y="150" textAnchor="middle" fill="#D06030" fontSize="10" fontFamily="Cinzel,serif">Sun still crosses</text>
              <text x="121" y="165" textAnchor="middle" fill="#D06030" fontSize="10" fontFamily="Cinzel,serif">the same dome</text>
              <text x="121" y="200" textAnchor="middle" fill="#D06030" fontSize="9" fontFamily="Cinzel,serif">DAY</text>
            </svg>
          </div>
        );
      }
      // Screen 4: Reading the noon sun — photo + overlay labels
      if (learnStep === 3) {
        return (
          <svg viewBox="0 0 560 840" style={{ height:"100%", width:"auto", maxWidth:"100%", borderRadius:"8px", display:"block" }}>
            <image href="/images/navigator-hand-measurement.jpg"
              x="0" y="0" width="560" height="840"
              preserveAspectRatio="xMidYMid meet"/>
            {/* Dark panel — right side labels */}
            <rect x="340" y="18" width="212" height="248" rx="6" fill="#040C16" opacity="0.68"/>
            <text x="348" y="50" fontFamily="Cinzel,serif" fontSize="16" fontWeight="700" fill="#C8941A" opacity="0.97">ʻAʻā (Sirius)</text>
            <text x="348" y="70" fontFamily="Cinzel,serif" fontSize="13" fill="#C8941A" opacity="0.80">Tahiti's zenith star</text>
            <text x="348" y="88" fontFamily="Georgia,serif" fontSize="13" fill="#C8941A" fontStyle="italic" opacity="0.68">passes directly overhead</text>
            <text x="348" y="104" fontFamily="Georgia,serif" fontSize="13" fill="#C8941A" fontStyle="italic" opacity="0.68">at Tahiti's latitude</text>
            <text x="348" y="148" fontFamily="Cinzel,serif" fontSize="26" fontWeight="700" fill="#D06030" opacity="0.97">17°</text>
            <text x="348" y="172" fontFamily="Cinzel,serif" fontSize="14" fill="#D06030" opacity="0.90">gap from overhead</text>
            <text x="348" y="190" fontFamily="Cinzel,serif" fontSize="13" fill="#D06030" opacity="0.70">≈ 3 hand-widths</text>
            <text x="348" y="218" fontFamily="Cinzel,serif" fontSize="16" fill="#FFD060" opacity="0.96">noon sun</text>
            <text x="348" y="238" fontFamily="Georgia,serif" fontSize="13" fill="#FFD060" fontStyle="italic" opacity="0.72">17° short of zenith</text>
            <rect x="0" y="800" width="560" height="40" fill="#020810" opacity="0.85"/>
            <text x="280" y="825" textAnchor="middle" fontFamily="Georgia,serif" fontSize="15" fill="#7AACBE" fontStyle="italic">
              Measure the gap from ʻAʻā's path down to the noon sun
            </text>
          </svg>
        );
      }
      return null;
    };

    return (
      <div style={{ width:"100%", height:"100%", background:"#060E08", display:"flex", flexDirection:"column", overflow:"hidden" }}>
        {/* Header */}
        <div style={{ height:"44px", borderBottom:`1px solid ${accent}33`, background:"rgba(6,14,8,0.96)", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 22px", flexShrink:0 }}>
          <span style={{ fontFamily:"Cinzel,serif", fontSize:"12px", fontWeight:"700", color:"#C8941A", letterSpacing:"0.12em" }}>OCEAN ADVENTURE</span>
          <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
            <span style={{ fontFamily:"Cinzel,serif", fontSize:"10.5px", color:accent, letterSpacing:"0.09em", opacity:0.8 }}>HAUMĀNA · {name.toUpperCase()}</span>
            <button
              onClick={() => { analyticsEvents.feedbackOpened(); window.open(FEEDBACK_URL, "_blank", "noopener,noreferrer"); }}
              style={{ background:"none", border:"1px solid #0A2A3A", borderRadius:"5px", padding:"5px 10px", cursor:"pointer", fontFamily:"Cinzel,serif", fontSize:"9px", color:"#1A6070", letterSpacing:"0.08em" }}
            >
              ✦ FEEDBACK
            </button>
          </div>
        </div>
        {/* Location bar */}
        <div style={{ padding:"7px 22px", borderBottom:`1px solid ${accent}22`, background:"rgba(4,10,6,0.7)", flexShrink:0, display:"flex", alignItems:"center", gap:"14px" }}>
          <span style={{ fontFamily:"Cinzel,serif", fontSize:"9.5px", color:accent, letterSpacing:"0.16em", opacity:0.9 }}>ON SHORE · {MODULE_CONTENT[2].departure.location.toUpperCase()}</span>
          <span style={{ fontFamily:"Georgia,serif", fontSize:"11px", color:`${accent}88`, fontStyle:"italic" }}>{MODULE_CONTENT[2].departure.note}</span>
        </div>
        {/* Body */}
        <div style={{ flex:1, display:"flex", overflow:"hidden", minHeight:0 }}>
          {/* Left panel */}
          <div style={{ width:"320px", flexShrink:0, borderRight:`1px solid ${accent}18`, overflowY:"auto", background:"rgba(4,10,6,0.85)", display:"flex", flexDirection:"column" }}>
            <div style={{ padding:"22px 20px", display:"flex", flexDirection:"column", gap:"16px", flex:1 }}>
              {/* Nav */}
              <div style={{ display:"flex", gap:"8px" }}>
                <button onClick={onBack} style={{ flex:1, background:"none", border:`1px solid ${accent}22`, borderRadius:"4px", color:"#2A3A28", fontSize:"9.5px", fontFamily:"Cinzel,serif", letterSpacing:"0.1em", padding:"8px", cursor:"pointer" }}>← MAP</button>
                <button onClick={onOpenBag} style={{ flex:1, background:unlocked.length>0?"rgba(200,148,26,0.10)":"none", border:`1px solid ${unlocked.length>0?"#C8941A55":accent+"22"}`, borderRadius:"4px", color:unlocked.length>0?"#C8941A":"#2A3A28", fontSize:"9.5px", fontFamily:"Cinzel,serif", letterSpacing:"0.1em", padding:"8px", cursor:"pointer" }}>
                  {unlocked.length>0 ? `✦ BAG (${unlocked.length})` : "✦ BAG"}
                </button>
              </div>
              {/* Step dots */}
              <div style={{ display:"flex", gap:"6px", alignItems:"center" }}>
                {concepts.map((_,i)=>(
                  <button
                    key={i}
                    type="button"
                    aria-label={`Go to step ${i + 1}`}
                    aria-current={i === learnStep ? "step" : undefined}
                    onClick={() => setLearnStep(i)}
                    style={{
                      width:i===learnStep?"18px":"7px",
                      height:"7px",
                      borderRadius:"4px",
                      background:i===learnStep?accent:i<learnStep?"#2A8860":"#1A2820",
                      cursor:"pointer",
                      transition:"all 0.25s",
                      border:"none",
                      padding:0,
                      margin:0,
                    }}
                  />
                ))}
                <span style={{ fontFamily:"Cinzel,serif", fontSize:"9px", color:"#2A3A28", marginLeft:"4px" }}>{learnStep+1}/{concepts.length}</span>
              </div>
              {/* Heading */}
              <div style={{ fontFamily:"Cinzel,serif", fontSize:"19px", fontWeight:"700", color:accent, lineHeight:"1.3" }}>
                {concept.heading}
              </div>
              {/* Body */}
              <div style={{ fontFamily:"Georgia,serif", fontSize:"16px", color:"#7AACBE", lineHeight:"1.82", fontStyle:"italic", borderLeft:`2px solid ${accent}44`, paddingLeft:"16px" }}>
                {concept.body}
              </div>
              {learnStep === 3 && MODULE_CONTENT[2].navigatorFact && (
                <div style={{
                  background: "rgba(200,148,26,0.06)",
                  border: "1px solid rgba(200,148,26,0.18)",
                  borderRadius: "7px",
                  padding: "14px 16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                }}>
                  <div style={{ fontFamily:"Cinzel,serif", fontSize:"9px", color:"#C8941A", letterSpacing:"0.16em", opacity:0.8 }}>
                    NAVIGATOR'S FACT
                  </div>
                  <div style={{ fontFamily:"Georgia,serif", fontSize:"13px", color:"#A8C8B0", fontStyle:"italic", lineHeight:"1.7" }}>
                    {MODULE_CONTENT[2].navigatorFact}
                  </div>
                </div>
              )}
              {/* Prev / Next / Set Sail */}
              <div style={{ display:"flex", gap:"8px", marginTop:"auto" }}>
                {learnStep > 0 && (
                  <button onClick={() => setLearnStep(i=>i-1)} style={{ flex:1, padding:"11px", borderRadius:"6px", cursor:"pointer", fontFamily:"Cinzel,serif", fontSize:"10px", fontWeight:"700", letterSpacing:"0.1em", border:`1px solid ${accent}33`, background:"none", color:`${accent}88` }}>← PREV</button>
                )}
                {!isLast ? (
                  <button onClick={() => setLearnStep(i=>i+1)} style={{ flex:1, padding:"11px", borderRadius:"6px", cursor:"pointer", fontFamily:"Cinzel,serif", fontSize:"10px", fontWeight:"700", letterSpacing:"0.12em", border:`1px solid ${accent}`, background:`${accent}18`, color:accent }}>NEXT →</button>
                ) : (
                  <button onClick={() => setPhase("activity")} style={{ flex:1, padding:"11px", borderRadius:"6px", cursor:"pointer", fontFamily:"Cinzel,serif", fontSize:"11px", fontWeight:"700", letterSpacing:"0.12em", border:`1px solid ${accent}`, background:`linear-gradient(135deg,${accent}22,${accent}0A)`, color:accent }}>SET SAIL →</button>
                )}
              </div>
            </div>
          </div>
          {/* Right — diagram */}
          <div style={learnStep === 3
            ? { height:"100%", width:"100%", display:"flex", alignItems:"center", justifyContent:"center", flex:1, padding:"16px", background:"rgba(4,10,5,0.4)", overflow:"hidden", minHeight:0 }
            : { flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"16px", background:"rgba(4,10,5,0.4)", overflow:"hidden", minHeight:0 }
          }>
            {renderDiagram()}
          </div>
        </div>
      </div>
    );
  }

  // ── ACTIVITY — hand-dragging mechanic ──────────────────────────
  if (phase === "bridge") return (
    <TahitiArrivalScreen name={name} unlocked={unlocked} onReturn={onBridge || onBack} />
  );

  // Sky constants
  const SKY_H  = 320;
  const HORIZ  = SKY_H - 40;  // horizon y
  const ZENITH = 24;            // zenith y
  const SUN_X  = 260;

  // handY 0=horizon, 1=zenith  →  sun Y position
  const handYPx  = handY !== null ? HORIZ - handY * (HORIZ - ZENITH) : null;
  const targetY  = HORIZ - TAHITI_HAND * (HORIZ - ZENITH);

  const isNoonFound = actStep === 1 && noonFound;

  const handleSkyPointerDown = (e) => {
    if (actStep !== 2 || confirmed || niceWork) return;
    setMatalaScoldVisible(false);
    setIsDragging(true);
    const rect = e.currentTarget.getBoundingClientRect();
    const rawY = (e.clientY - rect.top) / rect.height;
    const clamped = Math.max(0, Math.min(1, 1 - rawY));
    setHandY(clamped);
  };
  const handleSkyPointerMove = (e) => {
    if (!isDragging || actStep !== 2 || confirmed || niceWork) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const rawY = (e.clientY - rect.top) / rect.height;
    const clamped = Math.max(0, Math.min(1, 1 - rawY));
    setHandY(clamped);
  };
  const handleSkyPointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    // No auto-confirm on release — user must click the CONFIRM button
    const offTarget =
      handY !== null && Math.abs(handY - TAHITI_HAND) > 0.15;
    if (offTarget && !matalaScolded) {
      setMatalaScolded(true);
      setMatalaScoldVisible(true);
    }
  };

  let paluTitle = "", paluBody = "", showNoonContinue = false;
  if (actStep === 1 && !noonFound) {
    paluTitle = `E ${name}. Watch the sky.`;
    paluBody = "We are five days out from Sāmoa. The stars have been hidden for two nights. But Tama-nui-te-rā still crosses the sky. We need to find local noon — the moment he stands at his highest point. Click the sky when the sun reaches its peak.";
  } else if (actStep === 1 && noonFound) {
    paluTitle = "There. Local noon.";
    paluBody = "That is the highest point. We know roughly where we are east to west — dead reckoning: counting days, speed, and direction since Sāmoa. But we need to know how far north or south we are. That is latitude. That is what the sun height will give us.";
    showNoonContinue = true;
  } else if (actStep === 2) {
    if (confirmed) {
      paluTitle = "Three hand-widths. There it is.";
      paluBody = "The Samoan wayfinders were right. The sun has just told us the same thing ʻAʻā would have told us tonight. We are at 17° south — Tahiti's latitude. Turn east, and she will find us.";
    } else if (handY !== null && Math.abs(handY - TAHITI_HAND) > TOLERANCE) {
      paluTitle = handY > TAHITI_HAND ? "A little lower." : "A little higher.";
      paluBody = handY > TAHITI_HAND
        ? "That is north of Tahiti. Lower your hand — find three hand-widths below the zenith point."
        : "That is south of Tahiti. Raise your hand slightly — three hand-widths below overhead.";
    } else {
      paluTitle = "Raise your hand to the sun.";
      paluBody = "The Samoan wayfinders told us: Tahiti is three hand-widths below the zenith at noon. Drag your hand upward. When the sun sits three hand-widths below directly overhead — that is Tahiti's latitude.";
    }
  }

  return (
    <div style={{ width:"100%", height:"100%", background:"#04070E", display:"flex", flexDirection:"column", overflow:"hidden" }}>
      {/* Header */}
      <div style={{ height:"44px", borderBottom:"1px solid #0E1826", background:"rgba(4,8,18,0.95)", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 22px", flexShrink:0 }}>
        <span style={{ fontFamily:"Cinzel,serif", fontSize:"12px", fontWeight:"700", color:"#C8941A", letterSpacing:"0.12em" }}>OCEAN ADVENTURE</span>
        <div style={{ display:"flex", gap:"10px", alignItems:"center" }}>
          <span style={{ fontFamily:"Cinzel,serif", fontSize:"10.5px", color:"#3A6070", letterSpacing:"0.09em" }}>HAUMĀNA · {name.toUpperCase()}</span>
          <button onClick={onOpenBag} style={{ background:unlocked.length>0?"rgba(200,148,26,0.10)":"none", border:`1px solid ${unlocked.length>0?"#C8941A55":"#1A2840"}`, borderRadius:"5px", padding:"5px 12px", cursor:"pointer", fontFamily:"Cinzel,serif", fontSize:"10px", color:unlocked.length>0?"#C8941A":"#2A4050", letterSpacing:"0.08em" }}>✦ BAG ({unlocked.length})</button>
          <button
            onClick={() => { analyticsEvents.feedbackOpened(); window.open(FEEDBACK_URL, "_blank", "noopener,noreferrer"); }}
            style={{ background:"none", border:"1px solid #0A2A3A", borderRadius:"5px", padding:"5px 10px", cursor:"pointer", fontFamily:"Cinzel,serif", fontSize:"9px", color:"#1A6070", letterSpacing:"0.08em" }}
          >
            ✦ FEEDBACK
          </button>
        </div>
      </div>
      {/* Module bar */}
      <div style={{ padding:"7px 22px", borderBottom:"1px solid #0E1826", background:"rgba(4,8,18,0.6)", flexShrink:0 }}>
        <span style={{ fontFamily:"Cinzel,serif", fontSize:"9.5px", color:accent, letterSpacing:"0.16em" }}>MODULE 2 · TAMA-NUI-TE-RĀ</span>
        <span style={{ fontFamily:"Cinzel,serif", fontSize:"9.5px", color:"#2A4858", marginLeft:"14px", letterSpacing:"0.1em" }}>SĀMOA → TAHITI · DAY 5</span>
      </div>
      {/* Body */}
      <div style={{ flex:1, display:"flex", overflow:"hidden", minHeight:0 }}>
        {/* Left panel */}
        <div style={{ width:"320px", flexShrink:0, borderRight:"1px solid #0E1826", overflowY:"auto" }}>
          <div style={{ display:"flex", flexDirection:"column", gap:"12px", padding:"18px", boxSizing:"border-box" }}>
            <div style={{ display:"flex", gap:"8px" }}>
              <button onClick={onBack} style={{ flex:1, background:"none", border:"1px solid #0E1826", borderRadius:"4px", color:"#2A4050", fontSize:"9px", fontFamily:"Cinzel,serif", letterSpacing:"0.1em", padding:"7px", cursor:"pointer" }}>← MAP</button>
            </div>
            {/* Step indicators */}
            <div style={{ display:"flex", gap:"4px" }}>
              {["1 · Noon", "2 · Hand", "✦ Done"].map((label, i) => {
                const done = i + 1 < actStep || (i === 2 && confirmed);
                const curr = i + 1 === actStep && !(i === 2 && confirmed);
                return <div key={i} style={{ flex:1, textAlign:"center", padding:"6px 2px", fontSize:"10px", fontFamily:"Cinzel,serif", letterSpacing:"0.06em", background:curr?"rgba(208,96,48,0.18)":done?"rgba(26,120,110,0.18)":"rgba(255,255,255,0.03)", border:`1px solid ${curr?accent:done?"#1A8870":"#1E3050"}`, borderRadius:"5px", color:curr?"#E07040":done?"#2BB5A0":"#7AACBE" }}>{label}</div>;
              })}
            </div>
            {/* Scenario card */}
            <div style={{ background:"rgba(12,20,40,0.85)", border:"1px solid #1E3050", borderRadius:"7px", padding:"12px 14px" }}>
              <div style={{ fontSize:"9px", letterSpacing:"0.18em", color:"#3A6070", fontFamily:"Cinzel,serif", marginBottom:"5px" }}>SĀMOA → TAHITI</div>
              <div style={{ fontSize:"13px", color:"#C0DCF0", fontFamily:"Cinzel,serif", fontWeight:"700", marginBottom:"2px" }}>Day 5 · Near the Equinox</div>
              <div style={{ fontSize:"10px", color:"#507080", fontFamily:"Cinzel,serif" }}>Stars hidden two nights · ʻAʻā not visible · Sun is your guide</div>
            </div>
            {/* Palu speech */}
            <div style={{ background:"rgba(6,11,22,0.7)", border:"1px solid #161F34", borderRadius:"7px", padding:"16px", display:"flex", flexDirection:"column", gap:"10px", position:"relative", flex:1 }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div style={{ fontSize:"11px", color:"#365060", fontFamily:"Cinzel,serif", letterSpacing:"0.14em" }}>THE PALU SPEAKS</div>
                <span style={{ fontSize:"16px", opacity:0.75 }}>🦜</span>
              </div>
              {matalaScoldVisible && matalaScolded && (paluTitle === "A little lower." || paluTitle === "A little higher.") && (
                <>
                  <div style={{
                    background: "rgba(42,150,80,0.08)",
                    border: "1px solid rgba(42,150,80,0.3)",
                    borderRadius: "6px",
                    padding: "10px 14px",
                    display: "flex",
                    gap: "10px",
                    alignItems: "flex-start",
                  }}>
                    <span style={{ fontSize: "20px", flexShrink: 0 }}>🦜</span>
                    <div>
                      <div style={{ fontFamily: "Cinzel,serif", fontSize: "10px", color: "#2A9A70", letterSpacing: "0.1em", marginBottom: "4px" }}>MATALA</div>
                      <div style={{ fontFamily: "Georgia,serif", fontSize: "13px", color: "#6AD898", fontStyle: "italic", lineHeight: "1.6" }}>
                        {"SKRAWWK. Too high! Too low! The sun is RIGHT THERE. SKRAWWK."}
                      </div>
                    </div>
                  </div>
                  <div style={{ fontFamily: "Georgia,serif", fontSize: "11px", color: "#5A8090", fontStyle: "italic", paddingLeft: "14px", borderLeft: "1px solid #1A3040" }}>
                    — Palu: "Matala. Be kind." [pause] "...But she is not wrong."
                  </div>
                </>
              )}
              <div style={{ fontSize:"19px", color:"#D0A838", fontFamily:"Cinzel,serif", fontWeight:"700", lineHeight:"1.4" }}>{paluTitle}</div>
              <div style={{ fontSize:"15px", color:"#7AACBE", fontFamily:"Georgia,serif", fontStyle:"italic", lineHeight:"1.75" }}>{paluBody}</div>
              {actStep === 1 && !noonFound && (
                <div style={{ padding:"9px 12px", background:"rgba(18,55,80,0.4)", borderLeft:"2px solid #D06030", borderRadius:"0 4px 4px 0", fontSize:"11px", color:"#D08060", fontFamily:"Georgia,serif" }}>
                  Watch the sun arc from east to west. Click it when it reaches its peak.
                </div>
              )}
              {showNoonContinue && (
                <button onClick={() => setActStep(2)} style={{ padding:"12px", borderRadius:"6px", cursor:"pointer", fontFamily:"Cinzel,serif", fontSize:"11px", fontWeight:"700", letterSpacing:"0.12em", border:`1px solid ${accent}`, background:`rgba(208,96,48,0.14)`, color:accent }}>
                  READ THE HEIGHT →
                </button>
              )}
              {actStep === 2 && !confirmed && handY !== null && Math.abs(handY - TAHITI_HAND) <= TOLERANCE && (
                <button onClick={() => { setConfirmed(true); onComplete(); setNiceWork("done"); }}
                  style={{ padding:"14px", borderRadius:"6px", cursor:"pointer", fontFamily:"Cinzel,serif", fontSize:"12px", fontWeight:"700", letterSpacing:"0.12em", border:`1px solid ${accent}`, background:`rgba(208,96,48,0.18)`, color:accent }}>
                  CONFIRM — THIS IS TAHITI'S HEIGHT →
                </button>
              )}
              {/* Nice work overlay — requires explicit click to continue */}
              {niceWork === "done" && (
                <div style={{ position:"absolute", inset:0, background:"rgba(4,8,18,0.96)", borderRadius:"7px", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"18px", padding:"24px" }}>
                  <div style={{ fontSize:"32px" }}>☀</div>
                  <div style={{ fontFamily:"Cinzel,serif", fontSize:"22px", fontWeight:"800", color:"#D0A838", textAlign:"center", letterSpacing:"0.02em" }}>
                    Three hand-widths.
                  </div>
                  <div style={{ fontFamily:"Georgia,serif", fontSize:"15px", color:"#2BB5A0", fontStyle:"italic", textAlign:"center", lineHeight:"1.75" }}>
                    The sun just told you something ʻAʻā would have told you tonight. Two different observations. The same latitude. The same truth.
                  </div>
                  <div style={{ fontFamily:"Georgia,serif", fontSize:"13px", color:"rgba(122,172,190,0.7)", fontStyle:"italic", textAlign:"center", lineHeight:"1.75" }}>
                    This is what Polynesian navigation is — not one instrument, but many conversations with the same ocean. Tama-nui-te-rā has spoken for ʻAʻā. Turn east. Tahiti will find us.
                  </div>
                  {showContinue && (
                    <button onClick={() => setPhase("bridge")} style={{ padding:"13px 28px", borderRadius:"6px", cursor:"pointer", fontFamily:"Cinzel,serif", fontSize:"12px", fontWeight:"700", letterSpacing:"0.12em", border:`1px solid ${accent}`, background:`rgba(208,96,48,0.14)`, color:accent, marginTop:"6px" }}>
                      CONTINUE →
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right — sky canvas */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"20px", gap:"12px", overflow:"hidden", background:"#04070E", userSelect:"none" }}>

          {actStep === 1 ? (
            /* Step 1: animated sun crossing — click to catch noon */
            (() => {
              const t = sunTime / 100;
              const sunX = 60 + t * (480 - 120);
              const sunY = 220 - Math.sin(t * Math.PI) * 160;
              const atNoon = Math.abs(t - 0.5) < 0.08;
              return (
                <svg
                  viewBox="0 0 520 260"
                  style={{ width:"min(100%,520px)", borderRadius:"8px", background:"#050B14", cursor: atNoon ? "pointer" : "default" }}
                  onClick={() => {
                    if (atNoon && !noonFound) {
                      setNoonFound(true);
                      // Don't auto-advance — user must click CONTINUE in left panel
                    }
                  }}
                >
                  <rect width="520" height="220" fill="#050B14"/>
                  {[[40,30],[100,18],[200,40],[350,22],[440,35],[160,55],[380,50]].map(([x,y],i)=>(
                    <circle key={i} cx={x} cy={y} r={1} fill="#4A6888" opacity="0.3"/>
                  ))}
                  <rect y="220" width="520" height="40" fill="#030C08"/>
                  <line x1="0" y1="220" x2="520" y2="220" stroke="#1A5030" strokeWidth="1.5"/>
                  <path d="M60,220 Q260,48 460,220" fill="none" stroke="#D06030" strokeWidth="1" strokeDasharray="5,7" opacity="0.3"/>
                  <line x1="260" y1="0" x2="260" y2="220" stroke="#C8941A" strokeWidth="1" strokeDasharray="2,8" opacity="0.2"/>
                  <text x="260" y="12" textAnchor="middle" fill="#C8941A" fontSize="10" fontFamily="Cinzel,serif" opacity="0.55">OVERHEAD</text>
                  <text x="60"  y="238" textAnchor="middle" fill="#2A7050" fontSize="10" fontFamily="Cinzel,serif">EAST</text>
                  <text x="260" y="238" textAnchor="middle" fill="#2A7050" fontSize="10" fontFamily="Cinzel,serif">SOUTH</text>
                  <text x="460" y="238" textAnchor="middle" fill="#2A7050" fontSize="10" fontFamily="Cinzel,serif">WEST</text>
                  {atNoon && <circle cx={sunX} cy={sunY} r="26" fill="#FFD060" opacity="0.12"/>}
                  <circle cx={sunX} cy={sunY} r={atNoon ? 13 : 9} fill="#FFD060" opacity={atNoon ? 1 : 0.85}/>
                  {atNoon && (
                    <>
                      <text x={sunX} y={sunY - 22} textAnchor="middle" fill="#FFD060" fontSize="10" fontFamily="Cinzel,serif" fontWeight="700">LOCAL NOON</text>
                      <text x={sunX} y={sunY - 10} textAnchor="middle" fill="#FFD060" fontSize="9" fontFamily="Cinzel,serif" opacity="0.7">click to mark</text>
                    </>
                  )}
                  {noonFound && (
                    <text x="260" y="140" textAnchor="middle" fill="#2AB870" fontSize="14" fontFamily="Cinzel,serif" fontWeight="700">✓ Noon marked</text>
                  )}
                </svg>
              );
            })()
          ) : (
            /* Step 2: static noon sky — drag hand up to match Tahiti's angle */
            <div style={{ position:"relative", width:"min(100%,520px)" }}>
              <svg
                viewBox={`0 0 520 ${SKY_H}`}
                style={{ width:"100%", borderRadius:"8px", background:"#050B14", cursor: confirmed ? "default" : "ns-resize", touchAction:"none" }}
                onPointerDown={handleSkyPointerDown}
                onPointerMove={handleSkyPointerMove}
                onPointerUp={handleSkyPointerUp}
                onPointerLeave={handleSkyPointerUp}
              >
                {/* Sky */}
                <rect width="520" height={HORIZ} fill="#050B14"/>
                <rect y={HORIZ} width="520" height={SKY_H - HORIZ} fill="#030C08"/>
                <line x1="0" y1={HORIZ} x2="520" y2={HORIZ} stroke="#1A5030" strokeWidth="1.5"/>
                {/* Zenith line */}
                <line x1={SUN_X} y1="0" x2={SUN_X} y2={HORIZ} stroke="#C8941A" strokeWidth="1" strokeDasharray="2,8" opacity="0.2"/>
                <text x={SUN_X} y="14" textAnchor="middle" fill="#C8941A" fontSize="10" fontFamily="Cinzel,serif" opacity="0.5">OVERHEAD</text>
                {/* Angle reference lines every 15° */}
                {[15,30,45,60,75].map(deg => {
                  const y = HORIZ - (deg/90) * (HORIZ - ZENITH);
                  return (
                    <g key={deg}>
                      <line x1="36" y1={y} x2="484" y2={y} stroke="#122840" strokeWidth="0.8" strokeDasharray="3,8"/>
                      <text x="30" y={y+4} textAnchor="end" fill="#1A3A58" fontSize="9" fontFamily="Cinzel,serif">{deg}°</text>
                    </g>
                  );
                })}
                {/* Target zone (subtle) */}
                <rect x="0" y={targetY - 12} width="520" height="24" fill="#D06030" opacity="0.06" rx="2"/>
                {/* Cardinal labels */}
                <text x="70" y={HORIZ - 6} fill="#2A7050" fontSize="10" fontFamily="Cinzel,serif">EAST</text>
                <text x={SUN_X} y={HORIZ - 6} textAnchor="middle" fill="#2A7050" fontSize="10" fontFamily="Cinzel,serif">SOUTH</text>
                <text x="450" y={HORIZ - 6} fill="#2A7050" fontSize="10" fontFamily="Cinzel,serif">WEST</text>
                {/* Sun at noon (static) */}
                <circle cx={SUN_X} cy={targetY} r="16" fill="#FFD060" opacity="0.15"/>
                <circle cx={SUN_X} cy={targetY} r="10" fill="#FFD060" opacity="0.9"/>
                <text x={SUN_X + 18} y={targetY - 4} fill="#FFD060" fontSize="10" fontFamily="Cinzel,serif">noon sun</text>
                {/* Hand line — dragged by user */}
                {handY !== null && (() => {
                  const hy = HORIZ - handY * (HORIZ - ZENITH);
                  const close = Math.abs(handY - TAHITI_HAND) <= TOLERANCE;
                  const col = close ? "#2AB870" : "#D06030";
                  return (
                    <>
                      {/* Hand line across sky */}
                      <line x1="40" y1={hy} x2="480" y2={hy} stroke={col} strokeWidth="2.5" strokeDasharray="none" opacity="0.85"/>
                      {/* Hand icon at left edge */}
                      <rect x="12" y={hy - 18} width="16" height="36" rx="4" fill={col} opacity="0.9"/>
                      {[0,1,2,3].map(i => (
                        <rect key={i} x={12 + i*4} y={hy - 28} width="3.5" height="14" rx="2" fill={col} opacity="0.9"/>
                      ))}
                      {/* Thumb */}
                      <rect x="6" y={hy - 8} width="8" height="14" rx="3" fill={col} opacity="0.85"/>
                      {/* Angle readout */}
                      <text x="490" y={hy + 4} fill={col} fontSize="11" fontFamily="Cinzel,serif" fontWeight="700">
                        {Math.round(handY * 90)}°
                      </text>
                      {close && (
                        <text x="260" y={hy - 14} textAnchor="middle" fill="#2AB870" fontSize="11" fontFamily="Cinzel,serif" fontWeight="700">✓ Tahiti's height</text>
                      )}
                    </>
                  );
                })()}
                {/* Instruction */}
                {handY === null && (
                  <>
                    {/* Ghost hand at horizon — shows where to start dragging */}
                    <g opacity="0.35">
                      <rect x="36" y={HORIZ - 22} width="20" height="14" rx="4" fill="#D06030"/>
                      {[-6,-2,2,6].map((dx,i) => (
                        <rect key={i} x={36+8+dx} y={HORIZ - 35} width="3.5" height="16" rx="2" fill="#D06030"/>
                      ))}
                      <rect x="28" y={HORIZ - 17} width="9" height="10" rx="3" fill="#D06030"/>
                    </g>
                    {/* Upward arrow from ghost hand */}
                    <line x1="46" y1={HORIZ - 38} x2="46" y2={HORIZ - 70} stroke="#D06030" strokeWidth="1.5" strokeDasharray="3,4" opacity="0.4"/>
                    <path d={`M40,${HORIZ-70} L46,${HORIZ-78} L52,${HORIZ-70}`} fill="none" stroke="#D06030" strokeWidth="1.5" opacity="0.4"/>
                    <text x="260" y={HORIZ/2} textAnchor="middle" fill="#3A5060" fontSize="13" fontFamily="Georgia,serif" fontStyle="italic">drag upward to raise your hand</text>
                  </>
                )}
                {/* Waka hint at horizon */}
                <path d={`M180,${HORIZ} Q260,${HORIZ - 6} 340,${HORIZ} L336,${HORIZ + 6} Q260,${HORIZ + 2} 184,${HORIZ + 6} Z`} fill="#0A1808" stroke="#1A4020" strokeWidth="1" opacity="0.8"/>
              </svg>
              <div style={{ textAlign:"center", fontFamily:"Cinzel,serif", fontSize:"10px", color:"#2A4060", letterSpacing:"0.1em", marginTop:"6px" }}>
                DRAG UPWARD · MATCH TAMA-NUI-TE-RĀ'S HEIGHT AT TAHITI'S LATITUDE
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


/* ══════════════════════════════════════════════════════════════
   SWELL CANVAS
══════════════════════════════════════════════════════════════ */

function SwellCanvas({ scenario, canoeHeading, showIsland, animOffset }) {
  const W = 560, H = 300;
  const cx = W / 2, cy = H / 2;

  // Swell lines travel FROM swellFromDeg, so they move TOWARD (swellFromDeg + 180)
  const travelDeg = (scenario.swellFromDeg + 180) % 360;
  const travelRad = (travelDeg - 90) * Math.PI / 180;
  const dx = Math.cos(travelRad), dy = Math.sin(travelRad);

  // Generate swell crests — parallel lines perpendicular to travel direction
  const perpRad = travelRad + Math.PI / 2;
  const spacing = 38;
  const numLines = 14;
  const swellLines = Array.from({ length: numLines }, (_, i) => {
    const offset = ((i - numLines / 2) * spacing + animOffset % spacing);
    const ox = offset * dx, oy = offset * dy;
    const len = 420;
    return {
      x1: cx + ox - len * Math.cos(perpRad),
      y1: cy + oy - len * Math.sin(perpRad),
      x2: cx + ox + len * Math.cos(perpRad),
      y2: cy + oy + len * Math.sin(perpRad),
    };
  });

  // Wind-chop lines — shorter, different angle
  const windRad = ((scenario.windFromDeg + 180) - 90) * Math.PI / 180;
  const windPerp = windRad + Math.PI / 2;
  const windLines = Array.from({ length: 22 }, (_, i) => {
    const base = ((i - 11) * 22 + (animOffset * 1.7) % 22);
    const ox = base * Math.cos(windRad), oy = base * Math.sin(windRad);
    const len = 180;
    return {
      x1: cx + ox - len * Math.cos(windPerp),
      y1: cy + oy - len * Math.sin(windPerp),
      x2: cx + ox + len * Math.cos(windPerp),
      y2: cy + oy + len * Math.sin(windPerp),
      op: 0.12 + (i % 3) * 0.05,
    };
  });

  // Canoe shape — elongated hull, rotated to canoeHeading
  const canoeRad = (canoeHeading - 90) * Math.PI / 180;
  const hullLen = 52, hullW = 9;
  const canoePoints = [
    [hullLen, 0], [hullLen * 0.6, hullW], [-hullLen * 0.7, hullW * 0.7],
    [-hullLen, 0], [-hullLen * 0.7, -hullW * 0.7], [hullLen * 0.6, -hullW],
  ].map(([lx, ly]) => {
    const rx = lx * Math.cos(canoeRad) - ly * Math.sin(canoeRad);
    const ry = lx * Math.sin(canoeRad) + ly * Math.cos(canoeRad);
    return `${(cx + rx).toFixed(1)},${(cy + ry).toFixed(1)}`;
  }).join(" ");

  // Outrigger — offset perpendicular to heading
  const outRad = canoeRad + Math.PI / 2;
  const outDist = 18;
  const outLen = 36;
  const outCx = cx + outDist * Math.cos(outRad);
  const outCy = cy + outDist * Math.sin(outRad);

  // Heading arrow
  const arrowLen = 62;
  const arrowX = cx + arrowLen * Math.cos(canoeRad);
  const arrowY = cy + arrowLen * Math.sin(canoeRad);

  // Island — positioned near far edge of canvas so calm zone fills the space between
  const islX = cx + 210 * Math.cos(canoeRad);
  const islY = cy + 210 * Math.sin(canoeRad);

  // Island interference — calm patch behind, refraction arcs around sides
  const backRad = canoeRad + Math.PI;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", borderRadius: "8px", background: "#050B1A" }}>
      <defs>
        <radialGradient id="oceanSwell" cx="50%" cy="50%" r="60%">
          <stop offset="0%"   stopColor="#0A3A54" />
          <stop offset="100%" stopColor="#030A16" />
        </radialGradient>
        <radialGradient id="islandGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#2A4A30" />
          <stop offset="100%" stopColor="#0E1E14" />
        </radialGradient>
        <filter id="canoeShadow">
          <feGaussianBlur stdDeviation="3" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="islGlow">
          <feGaussianBlur stdDeviation="6" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <clipPath id="mapClip">
          <rect width={W} height={H} />
        </clipPath>
      </defs>

      {/* Ocean base */}
      <rect width={W} height={H} fill="url(#oceanSwell)" />

      {/* Wind chop — faint background texture */}
      <g clipPath="url(#mapClip)" opacity="0.55">
        {windLines.map((l, i) => (
          <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
            stroke="#1A5060" strokeWidth="0.5" opacity={l.op} />
        ))}
      </g>

      {/* ── SWELL CRESTS — drawn first so island can mask them ── */}
      <g clipPath="url(#mapClip)">
        {swellLines.map((l, i) => (
          <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
            stroke="#2A90A8" strokeWidth={1.6} opacity={0.35 + (i % 3) * 0.08} />
        ))}
      </g>

      {/* ── ISLAND INTERFERENCE — drawn AFTER swells so it masks them ── */}
      {showIsland && (() => {
        // calm shadow: centre it further behind island, much larger so it reaches toward canoe
        const shadowDist = 110;  // how far behind island the ellipse is centred
        const shadowCx = islX + shadowDist * Math.cos(backRad);
        const shadowCy = islY + shadowDist * Math.sin(backRad);
        const shadowRot = canoeHeading;

        // refracted swell arcs — multiple curves bending around each side of island
        // each arc is a quadratic bezier: starts from approach side, curves around, exits opposite
        const numArcs = 7;
        const arcArms = Array.from({ length: numArcs }, (_, i) => {
          const t = (i + 1) / (numArcs + 1);  // 0..1 spread across the shadow zone
          const spread = 55 + t * 60;          // arcs spread further out from island centre
          return [-1, 1].map(side => {
            // start point: on approach side of island, spread outward
            const startAngle = backRad + side * (0.6 + t * 1.1);
            const sx = islX + spread * Math.cos(startAngle);
            const sy = islY + spread * Math.sin(startAngle);
            // control point: pulls arc around the island flank
            const ctrlAngle = backRad + side * (Math.PI * 0.55);
            const ctrlR = 28 + spread * 0.55;
            const ctrlX = islX + ctrlR * Math.cos(ctrlAngle);
            const ctrlY = islY + ctrlR * Math.sin(ctrlAngle);
            // end point: exits on far (forward) side of island
            const endAngle = canoeRad + side * (0.5 + t * 0.9);
            const ex = islX + spread * Math.cos(endAngle);
            const ey = islY + spread * Math.sin(endAngle);
            return { sx, sy, ctrlX, ctrlY, ex, ey, op: 0.25 + t * 0.28 };
          });
        }).flat();

        return (
          <g>
            {/* Calm shadow — solid fill paints over swells, sized ~3x island diameter downwave */}
            <ellipse
              cx={shadowCx} cy={shadowCy}
              rx={120} ry={48}
              transform={`rotate(${shadowRot - 90}, ${shadowCx}, ${shadowCy})`}
              fill="#061220"
            />

            {/* Refracted swell arcs bending around island sides */}
            {arcArms.map((a, i) => (
              <path key={i}
                d={`M${a.sx.toFixed(1)},${a.sy.toFixed(1)} Q${a.ctrlX.toFixed(1)},${a.ctrlY.toFixed(1)} ${a.ex.toFixed(1)},${a.ey.toFixed(1)}`}
                fill="none" stroke="#2A90A8" strokeWidth="1.3"
                opacity={a.op} strokeDasharray="5,5"
                clipPath="url(#mapClip)" />
            ))}

            {/* Island glow halo */}
            <circle cx={islX} cy={islY} r={26} fill="#0A2818" filter="url(#islGlow)" opacity="0.7" />

            {/* Island body */}
            <circle cx={islX} cy={islY} r={20}
              fill="url(#islandGrad)" stroke="#3A6048" strokeWidth="1.8" />

            {/* Island label */}
            <text x={islX} y={islY + 4} textAnchor="middle" dominantBaseline="middle"
              fill="#4A8060" fontSize="8.5" fontFamily="Cinzel,serif" fontWeight="700">
              ISLAND
            </text>

            {/* Label sits midway between canoe and island — in the calm water the haumāna is sailing into */}
            <text
              x={(cx + islX) / 2} y={(cy + islY) / 2}
              textAnchor="middle" dominantBaseline="middle"
              fill="#1A5060" fontSize="8" fontFamily="Cinzel,serif" letterSpacing="0.1em">
              CALM ZONE — LAND NEAR
            </text>
          </g>
        );
      })()}

      {/* Outrigger */}
      <line
        x1={(outCx - outLen * 0.5 * Math.cos(canoeRad)).toFixed(1)}
        y1={(outCy - outLen * 0.5 * Math.sin(canoeRad)).toFixed(1)}
        x2={(outCx + outLen * 0.5 * Math.cos(canoeRad)).toFixed(1)}
        y2={(outCy + outLen * 0.5 * Math.sin(canoeRad)).toFixed(1)}
        stroke="#5A8060" strokeWidth="3.5" strokeLinecap="round" />
      {/* Aka (cross-boom) */}
      <line
        x1={cx} y1={cy}
        x2={outCx.toFixed(1)} y2={outCy.toFixed(1)}
        stroke="#3A5040" strokeWidth="1.2" />

      {/* Canoe hull */}
      <polygon points={canoePoints}
        fill="#1A3028" stroke="#4A8060" strokeWidth="1.8"
        filter="url(#canoeShadow)" />

      {/* Bow dot */}
      <circle
        cx={(cx + (hullLen + 4) * Math.cos(canoeRad)).toFixed(1)}
        cy={(cy + (hullLen + 4) * Math.sin(canoeRad)).toFixed(1)}
        r="3" fill="#C8941A" />

      {/* Heading arrow */}
      <line x1={cx} y1={cy} x2={arrowX.toFixed(1)} y2={arrowY.toFixed(1)}
        stroke="#C8941A" strokeWidth="1.2" strokeDasharray="5,4" opacity="0.7" />
      <polygon
        points={`${arrowX.toFixed(1)},${arrowY.toFixed(1)} ${(arrowX - 8*Math.cos(canoeRad-0.4)).toFixed(1)},${(arrowY - 8*Math.sin(canoeRad-0.4)).toFixed(1)} ${(arrowX - 8*Math.cos(canoeRad+0.4)).toFixed(1)},${(arrowY - 8*Math.sin(canoeRad+0.4)).toFixed(1)}`}
        fill="#C8941A" opacity="0.8" />

      {/* Swell direction label */}
      <text x={12} y={H - 12} fill="#1A6070" fontSize="9" fontFamily="Cinzel,serif"
        style={{ letterSpacing: "0.1em" }}>
        SWELL FROM {scenario.swellLabel.toUpperCase()} · {scenario.swellPeriod}s PERIOD
      </text>

      {/* Compass rose mini */}
      <g transform={`translate(${W - 30}, 28)`}>
        {[["N",0],["E",90],["S",180],["W",270]].map(([l,a]) => {
          const r = (a - 90) * Math.PI / 180;
          return (
            <text key={l} x={(18 * Math.cos(r)).toFixed(1)} y={(18 * Math.sin(r) + 4).toFixed(1)}
              textAnchor="middle" fill="#1A5060" fontSize="8" fontFamily="Cinzel,serif">{l}</text>
          );
        })}
        <circle r="2" fill="#1A4060" />
      </g>
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════
   SWELL MODULE
══════════════════════════════════════════════════════════════ */

/* ══════════════════════════════════════════════════════════════
   TAHITI SHORE POPUP — shown before Module 3 learn
══════════════════════════════════════════════════════════════ */

function TahitiShorePopup({ onDismiss }) {
  const [lineIdx, setLineIdx] = useState(0);
  const lines = [
    { speaker: "PALU HEMI", color: "#C8941A", text: "The harbour of Papeete at dawn. Look at the water — you can see two things moving across the surface. One is smooth and slow, rolling in from far away. The other is quick and choppy, made by the local wind." },
    { speaker: "PALU HEMI", color: "#C8941A", text: "The first one — the long slow swell — that is what we navigate by. It comes from distant storms thousands of kilometres south. It has been travelling for days. It does not lie." },
    { speaker: "MATALA", color: "#2A9A70", text: "SKRAWWK. The swell does not lie and neither does Matala. I have flown over open ocean and I know what a reliable swell feels like under the canoe. Also there are interesting birds in the Marquesas and I intend to investigate. SKRAWWK." },
    { speaker: "PALU HEMI", color: "#C8941A", text: "We will learn to read the swell on this crossing. The Marquesas lie NNE — about three days out. The swell will be our compass when the stars are hidden and the wind shifts." },
  ];
  const isLast = lineIdx === lines.length - 1;
  const line = lines[lineIdx];

  return (
    <div style={{ position:"fixed", inset:0, zIndex:95, display:"flex", alignItems:"center", justifyContent:"center", padding:"24px" }}>
      <div style={{ position:"absolute", inset:0, background:"rgba(2,6,4,0.78)", backdropFilter:"blur(3px)" }}/>
      <div style={{ position:"relative", zIndex:1, background:"rgba(4,10,6,0.98)", border:"1px solid rgba(42,154,112,0.3)", borderRadius:"14px", padding:"32px 36px", maxWidth:"500px", width:"100%", display:"flex", flexDirection:"column", gap:"20px", boxShadow:"0 0 80px rgba(42,154,112,0.08)" }}>
        <div style={{ fontFamily:"Cinzel,serif", fontSize:"10px", color:"#2A9A70", letterSpacing:"0.2em", opacity:0.7 }}>
          PAPEETE HARBOUR · TAHITI · BEFORE DAWN
        </div>
        <div style={{ fontFamily:"Georgia,serif", fontSize:"15px", color:"#8ABCB0", lineHeight:"1.75", fontStyle:"italic" }}>
          The harbour is still dark. A warm wind comes off the mountains. You can hear the canoe shifting against the dock, and beneath that — the slow rhythmic lift of something much older than the wind.
        </div>
        <div style={{ borderLeft:`2px solid ${line.color}55`, paddingLeft:"16px" }}>
          <div style={{ fontFamily:"Cinzel,serif", fontSize:"9px", color:line.color, letterSpacing:"0.14em", marginBottom:"8px", opacity:0.7 }}>{line.speaker}</div>
          <div style={{ fontFamily:"Georgia,serif", fontSize:"15px", color:line.color === "#2A9A70" ? "#5ACAA0" : "#B0C8C0", lineHeight:"1.78", fontStyle:"italic" }}>
            "{line.text}"
          </div>
        </div>
        {/* Progress dots */}
        <div style={{ display:"flex", gap:"6px" }}>
          {lines.map((_,i) => (
            <div key={i} style={{ width:i===lineIdx?14:7, height:7, borderRadius:4, background:i<=lineIdx?"#2A9A70":"#1A3028", transition:"all 0.25s" }}/>
          ))}
        </div>
        <button onClick={() => isLast ? onDismiss() : setLineIdx(i=>i+1)} style={{ padding:"13px", borderRadius:"6px", cursor:"pointer", fontFamily:"Cinzel,serif", fontSize:"11px", fontWeight:"700", letterSpacing:"0.14em", border:"1px solid #2A9A70", background:"rgba(42,154,112,0.12)", color:"#2A9A70" }}>
          {isLast ? "TO THE OCEAN →" : "CONTINUE →"}
        </button>
      </div>
    </div>
  );
}

function SwellModule({ name, onBack, onOpenBag, unlocked, onComplete, onBridge }) {
  const [phase,         setPhase]        = useState("intro");
  const [step,          setStep]         = useState(1);
  const [selDir,        setSelDir]       = useState(null);
  const [matalaScolded, setMatalaScolded] = useState(false);
  const [matalaScoldDir, setMatalaScoldDir] = useState(null);
  const [canoeHeading,  setCanoeHeading] = useState(90);
  const [headingLocked, setHeadingLocked]= useState(false);
  const [animOffset,    setAnimOffset]   = useState(0);
  const [confirming,    setConfirming]   = useState(false);
  const [niceWork,      setNiceWork]     = useState(null);
  const [shorePopupSeen, setShorePopupSeen] = useState(false);
  const [learnStep,     setLearnStep]    = useState(0);
  const [swellNotice,   setSwellNotice]  = useState(null);

  // Animate swells — must be before any early return (Rules of Hooks)
  useEffect(() => {
    let frame;
    const tick = () => {
      setAnimOffset(o => (o + 0.55) % 400);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (learnStep !== 0) setSwellNotice(null);
  }, [learnStep]);

  if (phase === "intro") return (
    <ModuleIntroScreen moduleNum={3} name={name}
      onBegin={() => { setLearnStep(0); setPhase("learn"); }}
      onBack={onBack} />
  );
  if (phase === "bridge") return (
    <MarquesasArrivalScreen name={name} unlocked={unlocked} onReturn={onBridge || onBack} />
  );
  if (phase === "learn") {
    const concepts = MODULE_CONTENT[3].learn.concepts;
    const concept  = concepts[learnStep];
    const isLast   = learnStep === concepts.length - 1;
    const accent   = "#2A90A8";

    // SVG diagram for each concept
    const renderSwellDiagram = () => {
      if (learnStep === 0) {
        // Compute animated paths using animOffset (already in scope)
        // animOffset increments ~33 units/second (0.55 per frame at 60fps)

        // SWELL: slow, long wavelength (240px), full cycle ~10 seconds
        const swellPts = Array.from({ length: 97 }, (_, i) => {
          const x = i * 5;
          const y = 105 - 25 * Math.sin(2 * Math.PI * x / 240 + animOffset * 0.018);
          return `${i === 0 ? "M" : "L"}${x.toFixed(0)},${y.toFixed(1)}`;
        }).join(" ");

        // COMBINED SURFACE: swell + chop (fast, short wavelength 28px, ~5x faster)
        const surfPts = Array.from({ length: 97 }, (_, i) => {
          const x = i * 5;
          const sy = 105 - 25 * Math.sin(2 * Math.PI * x / 240 + animOffset * 0.018);
          const cy = sy - 6 * Math.sin(2 * Math.PI * x / 28 + animOffset * 0.09);
          return `${i === 0 ? "M" : "L"}${x.toFixed(0)},${cy.toFixed(1)}`;
        }).join(" ");

        // WAKA: follows swell only (not chop), tilts with swell slope
        const wakaPhase = 2 * Math.PI * 240 / 240 + animOffset * 0.018;
        const wakaY = 105 - 25 * Math.sin(wakaPhase);
        const wakaSlope = -25 * Math.cos(wakaPhase) * (2 * Math.PI / 240);
        const wakaTilt = Math.atan(wakaSlope) * 180 / Math.PI;

        return (
          <svg viewBox="0 0 480 240" style={{ width:"100%", borderRadius:"8px", background:"#030A16" }}>
            {/* Sky */}
            <rect width="480" height="240" fill="#030A16"/>
            {/* Water body */}
            <rect x="0" y="105" width="480" height="135" fill="#040E1A"/>

            {/* SWELL LINE — smooth, blue, thick, dotted to show it's "underneath" */}
            <path d={swellPts} fill="none" stroke="#2A90A8" strokeWidth="2.5" opacity="0.5" strokeDasharray="10,6"/>

            {/* COMBINED SURFACE — swell + chop, solid, teal */}
            <path d={surfPts} fill="none" stroke="#4AB8C8" strokeWidth="1.8" opacity="0.9"/>

            {/* Water fill beneath surface */}
            <path d={surfPts + ` L480,240 L0,240 Z`} fill="#040E1A" opacity="0.8"/>

            {/* WAKA — tilts and bobs on the swell */}
            <g transform={`translate(240,${wakaY.toFixed(1)}) rotate(${wakaTilt.toFixed(1)})`}>
              {/* Hull */}
              <path d="M-52,4 Q0,-9 52,4 L46,13 Q0,7 -46,13Z" fill="#0A1818" stroke="#1A3828" strokeWidth="1.5"/>
              {/* Mast */}
              <line x1="0" y1="4" x2="0" y2="-30" stroke="#1A3020" strokeWidth="2"/>
              {/* Sail */}
              <path d="M0,-28 Q18,-16 16,-2 L0,-2Z" fill="#1A2E20" stroke="#2A4030" strokeWidth="1" opacity="0.7"/>
              {/* Outrigger */}
              <line x1="-46" y1="9" x2="-60" y2="15" stroke="#1A3020" strokeWidth="1.5"/>
              <path d="M-68,14 Q-60,11 -52,14 L-53,18 Q-61,15 -69,18Z" fill="#0A1818" stroke="#1A3020" strokeWidth="1"/>
            </g>

            {/* LABELS — sky area */}
            {/* Swell label */}
            <circle cx="18" cy="20" r="5" fill="#2A90A8" opacity="0.9"/>
            <text x="30" y="17" fill="#2A90A8" fontSize="11" fontFamily="Cinzel,serif" fontWeight="700">SWELL</text>
            <text x="30" y="30" fill="#2A90A8" fontSize="9" fontFamily="Cinzel,serif" opacity="0.65">slow · deep · 14 second period</text>

            {/* Chop label */}
            <circle cx="260" cy="20" r="4" fill="#4AB8C8" opacity="0.7"/>
            <text x="272" y="17" fill="#4AB8C8" fontSize="11" fontFamily="Cinzel,serif" fontWeight="700">CHOP</text>
            <text x="272" y="30" fill="#4AB8C8" fontSize="9" fontFamily="Cinzel,serif" opacity="0.65">fast · surface · 3–5 second period</text>

            {/* Bottom instruction */}
            <rect x="0" y="210" width="480" height="30" fill="#020810" opacity="0.7"/>
            <text x="240" y="229" textAnchor="middle" fill="#4A7890" fontSize="10" fontFamily="Georgia,serif" fontStyle="italic">
              The hull rises on the swell — not on the chop. Feel the slow roll.
            </text>
          </svg>
        );
      }
      if (learnStep === 1) {
        // Period is the key — timer visualization
        return (
          <svg viewBox="0 0 480 200" style={{ width:"100%", borderRadius:"8px", background:"#030A16" }}>
            <rect width="480" height="200" fill="#030A16"/>
            {/* Ocean surface */}
            <rect x="0" y="100" width="480" height="100" fill="#040E1A"/>
            <line x1="0" y1="100" x2="480" y2="100" stroke="#0A3040" strokeWidth="1"/>
            {/* Long swell */}
            <path d="M0,100 Q120,50 240,100 Q360,150 480,100" fill="none" stroke="#2A90A8" strokeWidth="2.5" opacity="0.85"/>
            <text x="240" y="45" textAnchor="middle" fill="#2A90A8" fontSize="13" fontFamily="Cinzel,serif" fontWeight="700">14 seconds between crests</text>
            {/* Crest markers */}
            <line x1="120" y1="54" x2="120" y2="90" stroke="#2A90A8" strokeWidth="1" strokeDasharray="3,4" opacity="0.5"/>
            <line x1="360" y1="146" x2="360" y2="90" stroke="#2A90A8" strokeWidth="1" strokeDasharray="3,4" opacity="0.5"/>
            <path d="M120,82 L240,82 L240,78 M240,82 L360,82" fill="none" stroke="#2A90A8" strokeWidth="1" opacity="0.4"/>
            <text x="240" y="76" textAnchor="middle" fill="#2A90A8" fontSize="10" fontFamily="Cinzel,serif" opacity="0.7">← one period →</text>
            {/* Wind chop */}
            {Array.from({length:16},(_,i)=>(
              <path key={i} d={`M${i*30},100 Q${i*30+15},${100-6} ${i*30+30},100`} fill="none" stroke="#3A5060" strokeWidth="0.8" opacity="0.4"/>
            ))}
            <text x="240" y="165" textAnchor="middle" fill="#3A5060" fontSize="10" fontFamily="Cinzel,serif">3–5 seconds — wind chop — noise</text>
          </svg>
        );
      }
      if (learnStep === 2) {
        // Island interference — block, refract, reflect
        return (
          <svg viewBox="0 0 480 220" style={{ width:"100%", borderRadius:"8px", background:"#030A16" }}>
            <rect width="480" height="220" fill="#030A16"/>
            <rect x="0" y="60" width="480" height="160" fill="#040E1A"/>
            <line x1="0" y1="60" x2="480" y2="60" stroke="#0A3040" strokeWidth="1"/>
            {/* Island */}
            <ellipse cx="240" cy="68" rx="34" ry="14" fill="#0E2018" stroke="#2A5040" strokeWidth="2"/>
            <text x="240" y="72" textAnchor="middle" fill="#3A7050" fontSize="9" fontFamily="Cinzel,serif" fontWeight="700">ISLAND</text>
            {/* Incoming swells from left */}
            {[0,1,2].map(i=>(
              <line key={i} x1={0} y1={90+i*28} x2={204} y2={90+i*28} stroke="#2A90A8" strokeWidth="1.8" opacity={0.7-i*0.1}/>
            ))}
            <text x="80" y="87" textAnchor="middle" fill="#2A90A8" fontSize="9" fontFamily="Cinzel,serif" opacity="0.7">incoming swell</text>
            {/* Block — calm shadow behind */}
            <ellipse cx="320" cy="130" rx="65" ry="28" fill="#030C14" stroke="#1A4050" strokeWidth="1" strokeDasharray="4,5"/>
            <text x="320" y="133" textAnchor="middle" fill="#1A5060" fontSize="9" fontFamily="Cinzel,serif">calm shadow</text>
            {/* Refraction arcs */}
            <path d="M274,68 Q300,90 295,130" fill="none" stroke="#2A90A8" strokeWidth="1.2" strokeDasharray="4,4" opacity="0.55"/>
            <path d="M206,68 Q180,90 185,130" fill="none" stroke="#2A90A8" strokeWidth="1.2" strokeDasharray="4,4" opacity="0.55"/>
            <text x="148" y="140" textAnchor="middle" fill="#1A6070" fontSize="9" fontFamily="Cinzel,serif">refraction</text>
            <text x="338" y="165" textAnchor="middle" fill="#1A6070" fontSize="9" fontFamily="Cinzel,serif">refraction</text>
            {/* Reflect arrows */}
            <path d="M206,68 L180,90" fill="none" stroke="#4A90A8" strokeWidth="1" strokeDasharray="3,3" opacity="0.4"/>
            <text x="240" y="205" textAnchor="middle" fill="#2A5060" fontSize="9" fontFamily="Cinzel,serif" opacity="0.8">detectable up to 30–40 km from land</text>
          </svg>
        );
      }
      // learnStep === 3: Mau's method
      return (
        <svg viewBox="0 0 480 200" style={{ width:"100%", borderRadius:"8px", background:"#030A16" }}>
          <rect width="480" height="200" fill="#030A16"/>
          {/* Canoe hull cross-section */}
          <path d="M120,120 Q240,100 360,120 L355,140 Q240,124 125,140 Z" fill="#0A1808" stroke="#1A4028" strokeWidth="2"/>
          {/* Mau lying in hull */}
          <ellipse cx="240" cy="122" rx="80" ry="10" fill="#1A3020" opacity="0.7"/>
          <circle cx="240" cy="118" r="10" fill="#7A5030" opacity="0.9"/>
          <rect x="175" y="119" width="130" height="8" rx="4" fill="#7A5030" opacity="0.85"/>
          <text x="240" y="115" textAnchor="middle" fill="#2A9A70" fontSize="10" fontFamily="Cinzel,serif" fontWeight="700">Mau Piailug — lying in the hull</text>
          {/* Two swell directions shown as arrows */}
          <path d="M60,80 L140,100" fill="none" stroke="#2A90A8" strokeWidth="2" markerEnd="none"/>
          <path d="M52,78 L60,80 L56,88" fill="#2A90A8"/>
          <text x="30" y="76" fill="#2A90A8" fontSize="10" fontFamily="Cinzel,serif">SE swell</text>
          <path d="M420,60 L360,100" fill="none" stroke="#5A70B8" strokeWidth="2"/>
          <path d="M426,57 L420,60 L418,70" fill="#5A70B8"/>
          <text x="422" y="57" fill="#5A70B8" fontSize="10" fontFamily="Cinzel,serif">SW swell</text>
          {/* Body feeling arrows */}
          <path d="M200,128 Q175,148 160,165" fill="none" stroke="#2A90A8" strokeWidth="1.2" strokeDasharray="3,3" opacity="0.5"/>
          <path d="M280,128 Q310,150 325,165" fill="none" stroke="#5A70B8" strokeWidth="1.2" strokeDasharray="3,3" opacity="0.5"/>
          <text x="240" y="185" textAnchor="middle" fill="#3A7080" fontSize="10" fontFamily="Cinzel,serif" fontStyle="italic">felt through the hull — two swell trains at once</text>
        </svg>
      );
    };

    return (
      <div style={{ width:"100%", height:"100%", background:"#060E08", display:"flex", flexDirection:"column", overflow:"hidden", position:"relative" }}>
        {/* Shore popup */}
        {!shorePopupSeen && <TahitiShorePopup onDismiss={() => setShorePopupSeen(true)}/>}
        {/* Header */}
        <div style={{ height:"44px", borderBottom:`1px solid ${accent}33`, background:"rgba(6,14,8,0.96)", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 22px", flexShrink:0 }}>
          <span style={{ fontFamily:"Cinzel,serif", fontSize:"12px", fontWeight:"700", color:"#C8941A", letterSpacing:"0.12em" }}>OCEAN ADVENTURE</span>
          <span style={{ fontFamily:"Cinzel,serif", fontSize:"10.5px", color:accent, letterSpacing:"0.09em", opacity:0.8 }}>HAUMĀNA · {name.toUpperCase()}</span>
        </div>
        {/* Location bar */}
        <div style={{ padding:"7px 22px", borderBottom:`1px solid ${accent}22`, background:"rgba(4,10,6,0.7)", flexShrink:0, display:"flex", alignItems:"center", gap:"14px" }}>
          <span style={{ fontFamily:"Cinzel,serif", fontSize:"9.5px", color:accent, letterSpacing:"0.16em", opacity:0.9 }}>ON SHORE · PAPEETE, TAHITI</span>
          <span style={{ fontFamily:"Georgia,serif", fontSize:"11px", color:`${accent}88`, fontStyle:"italic" }}>Before dawn. The harbour. Palu sketches in the wet sand.</span>
        </div>
        {/* Body */}
        <div style={{ flex:1, display:"flex", overflow:"hidden", minHeight:0 }}>
          {/* Left panel */}
          <div style={{ width:"320px", flexShrink:0, borderRight:`1px solid ${accent}18`, overflowY:"auto", background:"rgba(4,10,6,0.85)", display:"flex", flexDirection:"column" }}>
            <div style={{ padding:"22px 20px", display:"flex", flexDirection:"column", gap:"16px", flex:1 }}>
              {/* Nav */}
              <div style={{ display:"flex", gap:"8px" }}>
                <button onClick={onBack} style={{ flex:1, background:"none", border:`1px solid ${accent}22`, borderRadius:"4px", color:"#2A3A28", fontSize:"9.5px", fontFamily:"Cinzel,serif", letterSpacing:"0.1em", padding:"8px", cursor:"pointer" }}>← MAP</button>
                <button onClick={onOpenBag} style={{ flex:1, background:unlocked.length>0?"rgba(200,148,26,0.10)":"none", border:`1px solid ${unlocked.length>0?"#C8941A55":accent+"22"}`, borderRadius:"4px", color:unlocked.length>0?"#C8941A":"#2A3A28", fontSize:"9.5px", fontFamily:"Cinzel,serif", letterSpacing:"0.1em", padding:"8px", cursor:"pointer" }}>
                  {unlocked.length>0 ? `✦ BAG (${unlocked.length})` : "✦ BAG"}
                </button>
              </div>
              {/* Step dots */}
              <div style={{ display:"flex", gap:"6px", alignItems:"center" }}>
                {concepts.map((_,i) => (
                  <div key={i} onClick={() => i < learnStep && setLearnStep(i)} style={{ width:i===learnStep?"18px":"7px", height:"7px", borderRadius:"4px", background:i===learnStep?accent:i<learnStep?"#2A8860":"#1A2820", cursor:i<learnStep?"pointer":"default", transition:"all 0.25s" }}/>
                ))}
                <span style={{ fontFamily:"Cinzel,serif", fontSize:"9px", color:"#2A3A28", marginLeft:"4px" }}>{learnStep+1}/{concepts.length}</span>
              </div>
              {/* Heading */}
              <div style={{ fontFamily:"Cinzel,serif", fontSize:"19px", fontWeight:"700", color:accent, lineHeight:"1.3" }}>
                {concept.heading}
              </div>
              {/* Body */}
              <div style={{ fontFamily:"Georgia,serif", fontSize:"16px", color:"#7AACBE", lineHeight:"1.82", fontStyle:"italic", borderLeft:`2px solid ${accent}44`, paddingLeft:"16px" }}>
                {concept.body}
              </div>

              {/* Notice moment — Module 3 learn step 1 */}
              {learnStep === 0 && (
                <>
                  {swellNotice === null && (
                    <div style={{ background: "rgba(42,144,168,0.06)", border: "1px solid rgba(42,144,168,0.2)", borderRadius: "8px", padding: "14px 16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                      <div style={{ fontFamily: "Cinzel,serif", fontSize: "10px", color: "#2A90A8", letterSpacing: "0.14em" }}>PALU ASKS</div>
                      <div style={{ fontFamily: "Georgia,serif", fontSize: "14px", color: "#A8C8C0", fontStyle: "italic", lineHeight: "1.7" }}>
                        "Watch the animation. The waka is rocking. Which movement would you use to navigate — the slow roll, or the quick jitter?"
                      </div>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button onClick={() => setSwellNotice("swell")}
                          style={{ flex:1, padding:"10px", borderRadius:"6px", cursor:"pointer", fontFamily:"Cinzel,serif", fontSize:"10px", border:"1px solid #0A2A3A", background:"none", color:"#2A6070" }}>
                          The slow roll
                        </button>
                        <button onClick={() => setSwellNotice("chop")}
                          style={{ flex:1, padding:"10px", borderRadius:"6px", cursor:"pointer", fontFamily:"Cinzel,serif", fontSize:"10px", border:"1px solid #0A2A3A", background:"none", color:"#2A6070" }}>
                          The quick jitter
                        </button>
                      </div>
                    </div>
                  )}

                  {swellNotice === "swell" && (
                    <div style={{ background: "rgba(42,184,112,0.06)", border: "1px solid rgba(42,184,112,0.22)", borderRadius: "8px", padding: "14px 16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                      <div style={{ fontFamily:"Georgia,serif", fontSize:"14px", color:"#2AB870", lineHeight:"1.7", fontStyle:"italic" }}>
                        ✓ Yes. The slow roll does not change with local weather. It has been travelling for days. That is your compass.
                      </div>
                    </div>
                  )}

                  {swellNotice === "chop" && (
                    <div style={{ background: "rgba(42,144,168,0.06)", border: "1px solid rgba(42,144,168,0.2)", borderRadius: "8px", padding: "14px 16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                      <div style={{ fontFamily:"Georgia,serif", fontSize:"14px", color:"#A8C8C0", lineHeight:"1.7", fontStyle:"italic" }}>
                        That one will make you seasick and lost. The chop changes every hour. The swell beneath it has been travelling for a thousand kilometres. Feel deeper.
                      </div>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button onClick={() => setSwellNotice("swell")}
                          style={{ flex:1, padding:"10px", borderRadius:"6px", cursor:"pointer", fontFamily:"Cinzel,serif", fontSize:"10px", border:"1px solid #0A2A3A", background:"none", color:"#2A6070" }}>
                          The slow roll
                        </button>
                        <button onClick={() => setSwellNotice("chop")}
                          style={{ flex:1, padding:"10px", borderRadius:"6px", cursor:"pointer", fontFamily:"Cinzel,serif", fontSize:"10px", border:"1px solid #0A2A3A", background:"none", color:"#2A6070" }}>
                          The quick jitter
                        </button>
                      </div>
                      <div style={{ fontFamily:"Cinzel,serif", fontSize:"9px", color:"#2A90A8", letterSpacing:"0.12em", opacity:0.75 }}>
                        SKRAWWK. THE SLOW ONE. OBVIOUSLY. SKRAWWK.
                      </div>
                    </div>
                  )}
                </>
              )}

              {learnStep === concepts.length - 1 && MODULE_CONTENT[3].navigatorFact && (
                <div style={{
                  background: "rgba(200,148,26,0.06)",
                  border: "1px solid rgba(200,148,26,0.18)",
                  borderRadius: "7px",
                  padding: "14px 16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                }}>
                  <div style={{ fontFamily:"Cinzel,serif", fontSize:"9px", color:"#C8941A", letterSpacing:"0.16em", opacity:0.8 }}>
                    NAVIGATOR'S FACT
                  </div>
                  <div style={{ fontFamily:"Georgia,serif", fontSize:"13px", color:"#A8C8B0", fontStyle:"italic", lineHeight:"1.7" }}>
                    {MODULE_CONTENT[3].navigatorFact}
                  </div>
                </div>
              )}
              {/* Prev / Next / Activity */}
              <div style={{ display:"flex", gap:"8px", marginTop:"auto" }}>
                <button type="button" disabled={learnStep === 0} onClick={() => learnStep > 0 && setLearnStep(i => i - 1)} style={{ flex:1, padding:"11px", borderRadius:"6px", cursor:learnStep === 0 ? "default" : "pointer", fontFamily:"Cinzel,serif", fontSize:"10px", fontWeight:"700", letterSpacing:"0.1em", border:`1px solid ${accent}33`, background:"none", color:`${accent}88`, opacity:learnStep === 0 ? 0.35 : 1 }}>← PREV</button>
                {!isLast ? (
                  (learnStep !== 0 || swellNotice === "swell") ? (
                    <button type="button" onClick={() => setLearnStep(i=>i+1)} style={{ flex:1, padding:"11px", borderRadius:"6px", cursor:"pointer", fontFamily:"Cinzel,serif", fontSize:"10px", fontWeight:"700", letterSpacing:"0.12em", border:`1px solid ${accent}`, background:`${accent}18`, color:accent }}>NEXT →</button>
                  ) : null
                ) : (
                  <button type="button" onClick={() => setPhase("activity")} style={{ flex:1, padding:"11px", borderRadius:"6px", cursor:"pointer", fontFamily:"Cinzel,serif", fontSize:"11px", fontWeight:"700", letterSpacing:"0.12em", border:`1px solid ${accent}`, background:`linear-gradient(135deg,${accent}22,${accent}0A)`, color:accent }}>FEEL THE SWELL →</button>
                )}
              </div>
            </div>
          </div>
          {/* Right — diagram */}
          <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"24px", background:"rgba(4,10,5,0.4)" }}>
            {renderSwellDiagram()}
          </div>
        </div>
      </div>
    );
  }

  const sc = SWELL_SCENARIOS[0];

  const handleDirSelect = dir => {
    if (confirming) return;
    setSelDir(dir);
    if (dir !== sc.correctDir && !matalaScolded) {
      setMatalaScolded(true);
      setMatalaScoldDir(dir);
    }
    if (dir === sc.correctDir) {
      setConfirming(true);
      setTimeout(() => { setConfirming(false); setNiceWork("step2"); }, 600);
    }
  };

  const handleLockHeading = () => {
    if (confirming || niceWork) return;
    if (Math.abs(canoeHeading - sc.correctHeading) <= 12) {
      setHeadingLocked(true);
      setConfirming(true);
      setTimeout(() => { setConfirming(false); setNiceWork("step3"); }, 600);
    }
  };

  const handleInterference = type => {
    if (confirming || niceWork) return;
    if (type === sc.interferenceType) {
      setConfirming(true);
      onComplete();
      setTimeout(() => { setConfirming(false); setNiceWork("done"); }, 600);
    }
  };

  const handleNiceWorkContinue = () => {
    if (niceWork === "step2") { setStep(2); setNiceWork(null); }
    else if (niceWork === "step3") { setStep(3); setNiceWork(null); }
    else if (niceWork === "done") { setPhase("bridge"); }
  };

  // Palu speech per step
  const palus = {
    1: {
      title: `E ${name}. Close your eyes.`,
      body: "Feel the motion beneath you — not the chop on the surface, but the long slow roll underneath it. That roll is the swell. It travels thousands of kilometres without changing direction. We are leaving Tahiti, heading north-northeast to the Marquesas. Watch the water. Which direction is the swell travelling from?",
      hint: "Watch the long slow lines moving across the water. They are coming from one direction — find it.",
    },
    2: {
      title: "North-northeast. That is the trade swell.",
      body: "It rolls in from the southeast, steady as breathing. The Samoan wayfinders placed the Marquesas in the Nāleo-Koʻolau house — north-northeast, about 22.5° from north. That is our heading. Now use the swell: rotate the waka until it strikes your starboard beam. Hold that angle and you hold your heading even when the stars are hidden.",
      hint: "Rotate the canoe until the swell feels right on the hull. Think about where the Marquesas sit on the compass.",
    },
    3: {
      title: "Now we approach land.",
      body: "An island disturbs the swell long before it is visible. Behind the island, the water goes calm — blocked. Around its sides, the swells bend inward. Ahead, they bounce back and create confused cross-chop. What do you see off the bow?",
      hint: "Look at how the swell lines behave near the island ahead. Choose the correct interference pattern.",
    },
    4: {
      title: "You have read the ocean.",
      body: "Block, refract, reflect — three signs that land is near. Mau Piailug knew an island was close two days before he could see it, from the way the hull moved beneath him. Now you carry that knowledge too.",
    },
  };

  const palu = palus[step] || palus[4];
  const stepLabels = ["1 · Direction", "2 · Heading", "3 · Island", "✦ Done"];

  const sliderSty = { flex: 1, accentColor: "#2A90A8", cursor: "pointer" };
  const btnSty = (val, correct, sel) => ({
    padding: "11px 8px", borderRadius: "6px", fontFamily: "Cinzel,serif",
    fontSize: "12px", fontWeight: "600", cursor: "pointer", textAlign: "center",
    border: `1px solid ${sel===val && val===correct ? "#2AB8C8" : sel===val ? "#FF5533" : "#1A3A50"}`,
    background: sel===val && val===correct ? "rgba(42,184,200,0.12)" : sel===val ? "rgba(255,85,51,0.10)" : "rgba(255,255,255,0.03)",
    color: sel===val && val===correct ? "#2AB8C8" : sel===val ? "#FF6644" : "#4A8090",
  });

  const headingClose = Math.abs(canoeHeading - sc.correctHeading) <= 12;

  return (
    <div style={{ width:"100%", height:"100%", background:"#030A14", display:"flex", flexDirection:"column", overflow:"hidden" }}>

      {/* Header */}
      <div style={{ height:"44px", borderBottom:"1px solid #0A1E2C", background:"rgba(3,8,18,0.97)", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 22px", flexShrink:0 }}>
        <span style={{ fontFamily:"Cinzel,serif", fontSize:"12px", fontWeight:"700", color:"#C8941A", letterSpacing:"0.12em" }}>OCEAN ADVENTURE</span>
        <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
          <span style={{ fontFamily:"Cinzel,serif", fontSize:"10.5px", color:"#2A9090", letterSpacing:"0.09em" }}>HAUMĀNA · {name.toUpperCase()}</span>
          <button
            type="button"
            onClick={onOpenBag}
            style={{ background:unlocked.length>0?"rgba(200,148,26,0.10)":"none", border:`1px solid ${unlocked.length>0?"#C8941A55":"#0A1E2C"}`, borderRadius:"5px", padding:"5px 10px", cursor:"pointer", fontFamily:"Cinzel,serif", fontSize:"10px", color:unlocked.length>0?"#C8941A":"#7AACBE", letterSpacing:"0.08em" }}
          >
            {unlocked.length>0 ? `✦ BAG (${unlocked.length})` : "✦ BAG"}
          </button>
        </div>
      </div>

      {/* Module bar */}
      <div style={{ padding:"7px 22px", borderBottom:"1px solid #0A1E2C", background:"rgba(3,8,18,0.6)", flexShrink:0 }}>
        <span style={{ fontFamily:"Cinzel,serif", fontSize:"10.5px", color:"#2A90A8", letterSpacing:"0.16em" }}>MODULE 3 · TE MOANA</span>
        <span style={{ fontFamily:"Cinzel,serif", fontSize:"10.5px", color:"#7AACBE", marginLeft:"14px", letterSpacing:"0.1em" }}>OCEAN SWELLS · NAVIGATION BY FEEL</span>
      </div>

      {/* Body */}
      <div style={{ flex:1, display:"flex", overflow:"hidden", minHeight:0 }}>

        {/* Left panel */}
        <div style={{ width:"320px", flexShrink:0, borderRight:"1px solid #0A1E2C", overflowY:"auto" }}>
          <div style={{ display:"flex", flexDirection:"column", gap:"12px", padding:"18px", boxSizing:"border-box" }}>

            <button type="button" onClick={onBack} style={{ width:"100%", background:"none", border:"1px solid #0A1826", borderRadius:"4px", color:"#7AACBE", fontSize:"10px", fontFamily:"Cinzel,serif", letterSpacing:"0.1em", padding:"8px", cursor:"pointer" }}>← MAP</button>

            {/* Scenario card */}
            <div style={{ background:"rgba(8,18,32,0.85)", border:"1px solid #0E2A3A", borderRadius:"7px", padding:"12px 14px" }}>
              <div style={{ fontSize:"9px", letterSpacing:"0.18em", color:"#1A4858", fontFamily:"Cinzel,serif", marginBottom:"5px" }}>TAHITI → MARQUESAS</div>
              <div style={{ fontSize:"14px", color:"#90C8D8", fontFamily:"Cinzel,serif", fontWeight:"700", marginBottom:"2px" }}>Day 3 — Open Ocean</div>
              <div style={{ fontSize:"10.5px", color:"#2A5868", fontFamily:"Cinzel,serif" }}>NNE heading · SE trade swell · 14s period</div>
            </div>

            {/* Step indicators */}
            <div style={{ display:"flex", gap:"4px" }}>
              {stepLabels.map((label, i) => {
                const done = i+1 < step, curr = i+1 === step;
                return <div key={i} style={{ flex:1, textAlign:"center", padding:"6px 2px", fontSize:"10px", fontFamily:"Cinzel,serif", letterSpacing:"0.06em", background:curr?"rgba(42,144,168,0.18)":done?"rgba(26,120,110,0.18)":"rgba(255,255,255,0.03)", border:`1px solid ${curr?"#2A90A8":done?"#1A8870":"#0E2030"}`, borderRadius:"5px", color:curr?"#2AB8C8":done?"#2BB5A0":"#7AACBE" }}>{label}</div>;
              })}
            </div>

            {/* Palu speech */}
            <div style={{ background:"rgba(4,10,20,0.7)", border:"1px solid #0E1E2E", borderRadius:"7px", padding:"16px", display:"flex", flexDirection:"column", gap:"10px", position:"relative" }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}><div style={{ fontSize:"11px", color:"#1A4050", fontFamily:"Cinzel,serif", letterSpacing:"0.14em" }}>THE PALU SPEAKS</div><span style={{ fontSize:"16px", opacity:0.75 }}>🦜</span></div>
              {selDir && selDir !== sc.correctDir && matalaScolded && matalaScoldDir === selDir && (
                <>
                  <div style={{
                    background: "rgba(42,150,80,0.08)",
                    border: "1px solid rgba(42,150,80,0.3)",
                    borderRadius: "6px",
                    padding: "10px 14px",
                    display: "flex",
                    gap: "10px",
                    alignItems: "flex-start",
                  }}>
                    <span style={{ fontSize: "20px", flexShrink: 0 }}>🦜</span>
                    <div>
                      <div style={{ fontFamily: "Cinzel,serif", fontSize: "10px", color: "#2A9A70", letterSpacing: "0.1em", marginBottom: "4px" }}>MATALA</div>
                      <div style={{ fontFamily: "Georgia,serif", fontSize: "13px", color: "#6AD898", fontStyle: "italic", lineHeight: "1.6" }}>
                        {"SKRAWWK. I have been on this canoe for three days and I KNOW which way the swell is coming from. SKRAWWK."}
                      </div>
                    </div>
                  </div>
                  <div style={{ fontFamily: "Georgia,serif", fontSize: "11px", color: "#5A8090", fontStyle: "italic", paddingLeft: "14px", borderLeft: "1px solid #1A3040" }}>
                    — Palu: "She knows. Listen to her."
                  </div>
                </>
              )}
              <div style={{ fontSize:"20px", color:"#D0A838", fontFamily:"Cinzel,serif", fontWeight:"700", lineHeight:"1.4" }}>{palu.title}</div>
              <div style={{ fontSize:"15px", color:"#7AACBE", fontFamily:"Georgia,serif", fontStyle:"italic", lineHeight:"1.75" }}>{palu.body}</div>
              {palu.hint && !niceWork && (
                <div style={{ padding:"9px 12px", background:"rgba(18,55,70,0.4)", borderLeft:"2px solid #2A90A8", borderRadius:"0 4px 4px 0", fontSize:"11px", color:"#2A90A8", fontFamily:"Georgia,serif" }}>
                  {palu.hint}
                </div>
              )}
              {/* Nice work overlay */}
              {niceWork && (
                <div style={{ position:"absolute", inset:0, background:"rgba(4,10,20,0.93)", borderRadius:"7px", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"14px", padding:"20px" }}>
                  <div style={{ fontSize:"28px" }}>〰</div>
                  <div style={{ fontFamily:"Cinzel,serif", fontSize:"15px", fontWeight:"700", color:"#2A90A8", textAlign:"center" }}>
                    {niceWork === "done" ? "You have read the ocean." : "Correct."}
                  </div>
                  <div style={{ fontFamily:"Georgia,serif", fontSize:"13px", color:"#7AACBE", fontStyle:"italic", textAlign:"center", lineHeight:"1.6" }}>
                    {niceWork === "step2" ? "Good. Southeast. The trade swell — steady as breathing. Now set your heading." : niceWork === "step3" ? "Heading locked. Now read what the island does to the swell ahead." : "Block, refract, reflect. Mau knew an island was close two days before he could see it."}
                  </div>
                  <button onClick={handleNiceWorkContinue} style={{ padding:"11px 24px", borderRadius:"6px", cursor:"pointer", fontFamily:"Cinzel,serif", fontSize:"11px", fontWeight:"700", letterSpacing:"0.12em", border:"1px solid #2A90A8", background:"rgba(42,144,168,0.14)", color:"#2A90A8" }}>
                    {niceWork === "done" ? "CONTINUE →" : "NEXT →"}
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Right: ocean view */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"20px 24px", gap:"14px", overflow:"hidden" }}>
          <div style={{ width:"min(100%, 600px)" }}>
            <SwellCanvas
              scenario={sc}
              canoeHeading={step >= 2 ? canoeHeading : 90}
              showIsland={step >= 3}
              animOffset={animOffset}
            />
          </div>

          {/* Step 1 — direction buttons */}
          {step === 1 && (
            <div style={{ width:"min(100%,600px)", display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:"8px", pointerEvents:confirming?"none":"auto", opacity:confirming?0.6:1, transition:"opacity 0.3s" }}>
              {sc.dirOptions.map(dir => (
                <button key={dir} onClick={() => handleDirSelect(dir)} style={btnSty(dir, sc.correctDir, selDir)}>
                  {dir}
                </button>
              ))}
            </div>
          )}

          {/* Step 2 — heading slider */}
          {step === 2 && (
            <div style={{ width:"min(100%,600px)", display:"flex", flexDirection:"column", gap:"10px", pointerEvents:confirming?"none":"auto", opacity:confirming?0.6:1, transition:"opacity 0.3s" }}>
              <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
                <span style={{ fontFamily:"Cinzel,serif", fontSize:"9px", color:"#1A5060", width:"26px" }}>0°</span>
                <input type="range" min={0} max={359} step={1} value={canoeHeading}
                  onChange={e => !headingLocked && setCanoeHeading(Number(e.target.value))}
                  style={sliderSty} />
                <span style={{ fontFamily:"Cinzel,serif", fontSize:"9px", color:"#1A5060", width:"30px", textAlign:"right" }}>359°</span>
                <span style={{ fontFamily:"Cinzel,serif", fontSize:"13px", fontWeight:"700", color: headingClose ? "#2AB8C8" : "#4A8090", width:"46px", textAlign:"right" }}>
                  {canoeHeading}°
                </span>
              </div>
              <button
                onClick={handleLockHeading}
                style={{ padding:"11px", borderRadius:"6px", fontFamily:"Cinzel,serif", fontSize:"11px", fontWeight:"700", letterSpacing:"0.1em", cursor:"pointer", border:`1px solid ${headingClose?"#2A90A8":"#1A3A50"}`, background:headingClose?"rgba(42,144,168,0.15)":"rgba(255,255,255,0.03)", color:headingClose?"#2AB8C8":"#2A4858" }}>
                {confirming ? "✦ HEADING LOCKED" : headingClose ? "✦ LOCK HEADING" : "SET HEADING"}
              </button>
            </div>
          )}

          {/* Step 3 — interference identification */}
          {step === 3 && (
            <div style={{ width:"min(100%,600px)", display:"flex", flexDirection:"column", gap:"10px", pointerEvents:confirming?"none":"auto", opacity:confirming?0.6:1, transition:"opacity 0.3s" }}>
              <div style={{ fontFamily:"Cinzel,serif", fontSize:"9px", color:"#1A5060", letterSpacing:"0.14em", textAlign:"center" }}>
                WHAT TYPE OF ISLAND INTERFERENCE DO YOU SEE OFF THE BOW?
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"8px" }}>
                {[
                  { id:"block",   label:"Block",   desc:"Calm behind" },
                  { id:"refract", label:"Refract",  desc:"Bends around" },
                  { id:"reflect", label:"Reflect",  desc:"Cross-chop ahead" },
                ].map(opt => (
                  <button key={opt.id} onClick={() => handleInterference(opt.id)} style={{ padding:"12px 8px", borderRadius:"6px", fontFamily:"Cinzel,serif", fontSize:"11px", fontWeight:"600", cursor:"pointer", border:"1px solid #1A3A50", background:"rgba(255,255,255,0.03)", color:"#4A8090", display:"flex", flexDirection:"column", gap:"3px", alignItems:"center" }}>
                    <span style={{ fontSize:"13px", fontWeight:"700" }}>{opt.label}</span>
                    <span style={{ fontSize:"9px", color:"#1A4858", letterSpacing:"0.06em" }}>{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4 — done */}
          {step === 4 && (
            <div style={{ width:"min(100%,600px)" }}>
              <button onClick={onBack} style={{ width:"100%", padding:"12px", borderRadius:"6px", fontFamily:"Cinzel,serif", fontSize:"11px", fontWeight:"700", letterSpacing:"0.12em", cursor:"pointer", border:"1px solid #2A90A8", background:"rgba(42,144,168,0.12)", color:"#2AB8C8" }}>
                RETURN TO THE OCEAN →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   WIND MAP SVG
══════════════════════════════════════════════════════════════ */

function WindMapSVG({ mode, step, selBearing, selElNino, confirming, onBearingSelect, onElNinoSelect }) {
  const W = WIND_MAP_W, H = WIND_MAP_H;
  const belts = WIND_BELTS[mode];
  const sc = WIND_SCENARIO;

  const depart = latLonToXY(sc.depart.lat, sc.depart.lon);
  const arrive = latLonToXY(sc.arrive.lat, sc.arrive.lon);

  // Arrow grid for each wind belt
  const windArrows = belts.flatMap(belt => {
    if (!belt.dir) return [];
    const yTop = ((35 - belt.latTop) / 70) * H;
    const yBot = ((35 - belt.latBot) / 70) * H;
    const rows = Math.max(1, Math.floor((yBot - yTop) / 40));
    const cols = 9;
    return Array.from({ length: rows * cols }, (_, i) => {
      const row = Math.floor(i / cols), col = i % cols;
      const x = 40 + col * (W - 60) / (cols - 1);
      const y = yTop + 20 + row * ((yBot - yTop - 30) / Math.max(1, rows - 0.5));
      const rad = (belt.dir - 90) * Math.PI / 180;
      const len = mode === "elnino" && belt.name === "SE Trades" ? 10 : 14;
      const op  = mode === "elnino" && belt.name === "SE Trades" ? 0.35 : 0.55;
      return { x, y, ex: x + len * Math.cos(rad), ey: y + len * Math.sin(rad), color: belt.color === "#1A4A80" ? "#3A7AC0" : "#2A9090", op };
    });
  });

  // Departure bearing line — drawn when bearing selected in step 2
  const bearingLine = selBearing !== null ? (() => {
    const rad = (selBearing - 90) * Math.PI / 180;
    const len = 120;
    const isCorrect = selBearing === sc.correctBearing;
    return {
      x2: depart.x + len * Math.cos(rad),
      y2: depart.y + len * Math.sin(rad),
      color: isCorrect ? "#FFD700" : "#FF5533",
    };
  })() : null;

  const btnSty = (val, correct, sel) => ({
    padding: "10px 6px", borderRadius: "6px", fontFamily: "Cinzel,serif",
    fontSize: "12px", fontWeight: "700", cursor: "pointer", textAlign: "center",
    border: `1px solid ${sel===val ? (val===correct?"#4A70C0":"#FF5533") : "#1A3050"}`,
    background: sel===val ? (val===correct?"rgba(74,112,192,0.15)":"rgba(255,85,51,0.10)") : "rgba(255,255,255,0.03)",
    color: sel===val ? (val===correct?"#7AAAE0":"#FF6644") : "#4A7090",
  });

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width:"100%", borderRadius:"8px", background:"#060C16" }}>
        <defs>
          <linearGradient id="windBg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#060C18" />
            <stop offset="100%" stopColor="#040810" />
          </linearGradient>
          <filter id="arrowGlow">
            <feGaussianBlur stdDeviation="1.5" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="dotGlow">
            <feGaussianBlur stdDeviation="4" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <marker id="arrowHead" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
            <polygon points="0,0 5,2.5 0,5" fill="#2A8090" opacity="0.7"/>
          </marker>
          <marker id="arrowHeadBlue" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
            <polygon points="0,0 5,2.5 0,5" fill="#3A7AC0" opacity="0.7"/>
          </marker>
          <marker id="arrowGold" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <polygon points="0,0 6,3 0,6" fill="#FFD700"/>
          </marker>
          <marker id="arrowRed" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <polygon points="0,0 6,3 0,6" fill="#FF5533"/>
          </marker>
        </defs>

        <rect width={W} height={H} fill="url(#windBg)" />

        {/* Wind belt bands */}
        {belts.map((belt, i) => {
          const yTop = ((35 - belt.latTop) / 70) * H;
          const yBot = ((35 - belt.latBot) / 70) * H;
          const isITCZ = !belt.dir;
          return (
            <g key={i}>
              <rect x={0} y={yTop} width={W} height={yBot - yTop}
                fill={isITCZ ? "rgba(60,50,10,0.35)" : belt.name === "NE Trades" ? "rgba(20,50,100,0.18)" : "rgba(20,80,80,0.18)"} />
              <line x1={0} y1={yTop} x2={W} y2={yTop}
                stroke={isITCZ ? "#5A4A10" : "#1A3A58"} strokeWidth={isITCZ ? "1.2" : "0.6"} strokeDasharray={isITCZ ? "none" : "6,10"} />
              <text x={12} y={yTop + 14} fill={isITCZ ? "#8A7020" : "#2A5878"}
                fontSize="9" fontFamily="Cinzel,serif" letterSpacing="0.12em">
                {belt.label}
              </text>
            </g>
          );
        })}

        {/* Equator line */}
        {(() => { const y = (35/70)*H; return <line x1={0} y1={y} x2={W} y2={y} stroke="#1A3A30" strokeWidth="1" strokeDasharray="8,6" />; })()}
        <text x={W-8} y={(35/70)*H - 4} textAnchor="end" fill="#6A9AB8" fontSize="10" fontFamily="Cinzel,serif">EQUATOR</text>

        {/* Lat reference lines */}
        {[-20, -10, 0, 10, 20].map(lat => {
          const y = ((35 - lat) / 70) * H;
          return <line key={lat} x1={0} y1={y} x2={W} y2={y} stroke="#0E2030" strokeWidth="0.5" strokeDasharray="3,12" />;
        })}

        {/* Wind arrows */}
        {windArrows.map((a, i) => (
          <line key={i} x1={a.x} y1={a.y} x2={a.ex} y2={a.ey}
            stroke={a.color} strokeWidth="1.4" opacity={a.op}
            markerEnd={a.color === "#3A7AC0" ? "url(#arrowHeadBlue)" : "url(#arrowHead)"} />
        ))}

        {/* Islands */}
        {[sc.depart, sc.arrive].map((isl, i) => {
          const p = latLonToXY(isl.lat, isl.lon);
          const isDepart = i === 0;
          return (
            <g key={i} filter="url(#dotGlow)">
              <circle cx={p.x} cy={p.y} r={isDepart ? 7 : 7}
                fill={isDepart ? "#C8941A" : "#2A8090"}
                stroke={isDepart ? "#E0A830" : "#3AAAB0"} strokeWidth="1.5" />
              <text x={p.x} y={p.y - 12} textAnchor="middle"
                fill={isDepart ? "#E8C060" : "#3AC0B0"}
                fontSize="9.5" fontFamily="Cinzel,serif" fontWeight="700">
                {isl.name}
              </text>
            </g>
          );
        })}

        {/* Direct bearing line (grey — naive route) */}
        {step >= 2 && (
          <line x1={depart.x} y1={depart.y} x2={arrive.x} y2={arrive.y}
            stroke="#2A4060" strokeWidth="1" strokeDasharray="4,6" opacity="0.5" />
        )}

        {/* Chosen bearing line */}
        {bearingLine && (
          <line x1={depart.x} y1={depart.y} x2={bearingLine.x2} y2={bearingLine.y2}
            stroke={bearingLine.color} strokeWidth="2"
            markerEnd={selBearing === sc.correctBearing ? "url(#arrowGold)" : "url(#arrowRed)"} />
        )}

        {/* Correct bearing annotation after correct answer */}
        {selBearing === sc.correctBearing && (
          <text x={depart.x + 14} y={depart.y + 28}
            fill="#FFD700" fontSize="9" fontFamily="Cinzel,serif" opacity="0.9">
            aim upwind →
          </text>
        )}

        {/* Map label */}
        <text x={W - 10} y={H - 10} textAnchor="end"
          fill="#0E2030" fontSize="8.5" fontFamily="Cinzel,serif" letterSpacing="0.1em">
          KA MOANA NUI · WIND PATTERNS
        </text>

        {/* Mode badge */}
        {mode === "elnino" && (
          <g>
            <rect x={W-108} y={8} width={100} height={18} rx="3" fill="rgba(180,80,20,0.25)" stroke="#B05010" strokeWidth="0.8" />
            <text x={W-58} y={20} textAnchor="middle" fill="#E07030" fontSize="8.5" fontFamily="Cinzel,serif" letterSpacing="0.08em">EL NIÑO YEAR</text>
          </g>
        )}
      </svg>

      {/* Step 2 bearing buttons */}
      {step === 2 && (
        <div style={{ display:"flex", flexDirection:"column", gap:"8px", pointerEvents:confirming?"none":"auto", opacity:confirming?0.6:1, transition:"opacity 0.3s" }}>
          <div style={{ fontFamily:"Cinzel,serif", fontSize:"9px", color:"#2A5070", letterSpacing:"0.14em", textAlign:"center" }}>
            CHOOSE YOUR DEPARTURE BEARING FROM RAROTONGA
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:"8px" }}>
            {sc.bearingOptions.map(b => (
              <button key={b} onClick={() => onBearingSelect(b)} style={btnSty(b, sc.correctBearing, selBearing)}>
                {b}°
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3 El Niño buttons */}
      {step === 3 && (
        <div style={{ display:"flex", flexDirection:"column", gap:"8px", pointerEvents:confirming?"none":"auto", opacity:confirming?0.6:1, transition:"opacity 0.3s" }}>
          <div style={{ fontFamily:"Cinzel,serif", fontSize:"9px", color:"#B05010", letterSpacing:"0.14em", textAlign:"center" }}>
            IN AN EL NIÑO YEAR, WHAT CHANGES FOR THIS VOYAGE?
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px" }}>
            {sc.elNinoOptions.map(opt => (
              <button key={opt} onClick={() => onElNinoSelect(opt)}
                style={{ padding:"11px 8px", borderRadius:"6px", fontFamily:"Cinzel,serif", fontSize:"10.5px", fontWeight:"600", cursor:"pointer", textAlign:"center",
                  border:`1px solid ${selElNino===opt?(opt===sc.correctElNino?"#E07030":"#FF5533"):"#1A3050"}`,
                  background:selElNino===opt?(opt===sc.correctElNino?"rgba(180,80,20,0.18)":"rgba(255,85,51,0.10)"):"rgba(255,255,255,0.03)",
                  color:selElNino===opt?(opt===sc.correctElNino?"#E09050":"#FF6644"):"#4A7090" }}>
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   WIND MODULE
══════════════════════════════════════════════════════════════ */

function WindModule({ name, onBack, onOpenBag, unlocked, onComplete, onBridge }) {
  const [phase,       setPhase]      = useState("intro");
  const [step,        setStep]       = useState(1);
  const [mode,        setMode]       = useState("normal");
  const [selBearing,  setSelBearing] = useState(null);
  const [selElNino,   setSelElNino]  = useState(null);
  const [confirming,  setConfirming] = useState(false);
  const [niceWork,    setNiceWork]   = useState(null);
  const [learnStep,   setLearnStep]  = useState(0);

  // Auto-switch map to El Niño when step 3 starts — must be before any early return
  useEffect(() => { if (step === 3) setMode("elnino"); }, [step]);

  if (phase === "intro") return (
    <ModuleIntroScreen moduleNum={4} name={name}
      onBegin={() => { setLearnStep(0); setPhase("learn"); }}
      onBack={onBack} />
  );
  if (phase === "bridge") return (
    <BridgeScreen moduleNum={4} name={name} unlocked={unlocked} onReturn={onBridge || onBack} />
  );
  if (phase === "learn") {
    const concepts = MODULE_CONTENT[4].learn.concepts;
    const concept  = concepts[learnStep];
    const isLast   = learnStep === concepts.length - 1;
    const accent   = "#4A70C0";
    const dep      = MODULE_CONTENT[4].departure;

    return (
      <div style={{ width:"100%", height:"100%", background:"#060E08", display:"flex", flexDirection:"column", overflow:"hidden" }}>
        {/* Header */}
        <div style={{ height:"44px", borderBottom:`1px solid ${accent}33`, background:"rgba(6,14,8,0.96)", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 22px", flexShrink:0 }}>
          <span style={{ fontFamily:"Cinzel,serif", fontSize:"12px", fontWeight:"700", color:"#C8941A", letterSpacing:"0.12em" }}>OCEAN ADVENTURE</span>
          <span style={{ fontFamily:"Cinzel,serif", fontSize:"10.5px", color:accent, letterSpacing:"0.09em", opacity:0.8 }}>HAUMĀNA · {name.toUpperCase()}</span>
        </div>
        {/* Location bar */}
        <div style={{ padding:"7px 22px", borderBottom:`1px solid ${accent}22`, background:"rgba(4,10,6,0.7)", flexShrink:0, display:"flex", alignItems:"center", gap:"14px" }}>
          <span style={{ fontFamily:"Cinzel,serif", fontSize:"9.5px", color:accent, letterSpacing:"0.16em", opacity:0.9 }}>ON SHORE · {dep.location.toUpperCase()}</span>
          <span style={{ fontFamily:"Georgia,serif", fontSize:"9px", color:`${accent}66`, fontStyle:"italic" }}>{dep.note}</span>
        </div>
        {/* Body */}
        <div style={{ flex:1, display:"flex", overflow:"hidden", minHeight:0 }}>
          {/* Left panel */}
          <div style={{ width:"320px", flexShrink:0, borderRight:`1px solid ${accent}18`, overflowY:"auto", background:"rgba(4,10,6,0.85)", display:"flex", flexDirection:"column" }}>
            <div style={{ padding:"22px 20px", display:"flex", flexDirection:"column", gap:"16px", flex:1 }}>
              {/* Nav */}
              <div style={{ display:"flex", gap:"8px" }}>
                <button type="button" onClick={onBack} style={{ flex:1, background:"none", border:`1px solid ${accent}22`, borderRadius:"4px", color:"#2A3A28", fontSize:"9.5px", fontFamily:"Cinzel,serif", letterSpacing:"0.1em", padding:"8px", cursor:"pointer" }}>← MAP</button>
                <button type="button" onClick={onOpenBag} style={{ flex:1, background:unlocked.length>0?"rgba(200,148,26,0.10)":"none", border:`1px solid ${unlocked.length>0?"#C8941A55":accent+"22"}`, borderRadius:"4px", color:unlocked.length>0?"#C8941A":"#2A3A28", fontSize:"9.5px", fontFamily:"Cinzel,serif", letterSpacing:"0.1em", padding:"8px", cursor:"pointer" }}>
                  {unlocked.length>0 ? `✦ BAG (${unlocked.length})` : "✦ BAG"}
                </button>
              </div>
              {/* Step dots */}
              <div style={{ display:"flex", gap:"6px", alignItems:"center" }}>
                {concepts.map((_,i) => (
                  <div key={i} onClick={() => i < learnStep && setLearnStep(i)} style={{ width:i===learnStep?"18px":"7px", height:"7px", borderRadius:"4px", background:i===learnStep?accent:i<learnStep?"#2A8860":"#1A2820", cursor:i<learnStep?"pointer":"default", transition:"all 0.25s" }}/>
                ))}
                <span style={{ fontFamily:"Cinzel,serif", fontSize:"9px", color:"#2A3A28", marginLeft:"4px" }}>{learnStep+1}/{concepts.length}</span>
              </div>
              {/* Heading */}
              <div style={{ fontFamily:"Cinzel,serif", fontSize:"19px", fontWeight:"700", color:accent, lineHeight:"1.3" }}>
                {concept.heading}
              </div>
              {/* Body */}
              <div style={{ fontFamily:"Georgia,serif", fontSize:"16px", color:"#7AACBE", lineHeight:"1.82", fontStyle:"italic", borderLeft:`2px solid ${accent}44`, paddingLeft:"16px" }}>
                {concept.body}
              </div>
              {learnStep === concepts.length - 1 && MODULE_CONTENT[4].navigatorFact && (
                <div style={{
                  background: "rgba(200,148,26,0.06)",
                  border: "1px solid rgba(200,148,26,0.18)",
                  borderRadius: "7px",
                  padding: "14px 16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                }}>
                  <div style={{ fontFamily:"Cinzel,serif", fontSize:"9px", color:"#C8941A", letterSpacing:"0.16em", opacity:0.8 }}>
                    NAVIGATOR'S FACT
                  </div>
                  <div style={{ fontFamily:"Georgia,serif", fontSize:"13px", color:"#A8C8B0", fontStyle:"italic", lineHeight:"1.7" }}>
                    {MODULE_CONTENT[4].navigatorFact}
                  </div>
                </div>
              )}
              {/* Prev / Next / Activity */}
              <div style={{ display:"flex", gap:"8px", marginTop:"auto" }}>
                {learnStep > 0 && (
                  <button type="button" onClick={() => setLearnStep(i=>i-1)} style={{ flex:1, padding:"11px", borderRadius:"6px", cursor:"pointer", fontFamily:"Cinzel,serif", fontSize:"10px", fontWeight:"700", letterSpacing:"0.1em", border:`1px solid ${accent}33`, background:"none", color:`${accent}88` }}>← PREV</button>
                )}
                {!isLast ? (
                  <button type="button" onClick={() => setLearnStep(i=>i+1)} style={{ flex:1, padding:"11px", borderRadius:"6px", cursor:"pointer", fontFamily:"Cinzel,serif", fontSize:"10px", fontWeight:"700", letterSpacing:"0.12em", border:`1px solid ${accent}`, background:`${accent}18`, color:accent }}>NEXT →</button>
                ) : (
                  <button type="button" onClick={() => setPhase("activity")} style={{ flex:1, padding:"11px", borderRadius:"6px", cursor:"pointer", fontFamily:"Cinzel,serif", fontSize:"11px", fontWeight:"700", letterSpacing:"0.12em", border:`1px solid ${accent}`, background:`linear-gradient(135deg,${accent}22,${accent}0A)`, color:accent }}>FEEL THE WIND →</button>
                )}
              </div>
            </div>
          </div>
          {/* Right — concept illustration placeholder */}
          <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"24px", background:"rgba(4,10,5,0.4)" }}>
            <div style={{ width:"min(100%,560px)", display:"flex", flexDirection:"column", gap:"16px" }}>
              <WindMapSVG mode="normal" step={1} selBearing={null} selElNino={null} confirming={false} onBearingSelect={()=>{}} onElNinoSelect={()=>{}} />
              <div style={{ fontFamily:"Cinzel,serif", fontSize:"10px", color:"#2A4070", textAlign:"center", letterSpacing:"0.1em" }}>
                PACIFIC WIND BELTS · NE TRADES · ITCZ DOLDRUMS · SE TRADES
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const sc = WIND_SCENARIO;

  const handleBearingSelect = b => {
    if (confirming || niceWork) return;
    setSelBearing(b);
    if (b === sc.correctBearing) {
      setConfirming(true);
      setTimeout(() => { setConfirming(false); setNiceWork("step3"); }, 600);
    }
  };

  const handleElNinoSelect = opt => {
    if (confirming || niceWork) return;
    setSelElNino(opt);
    if (opt === sc.correctElNino) {
      setConfirming(true);
      onComplete();
      setTimeout(() => { setConfirming(false); setNiceWork("done"); }, 600);
    }
  };

  const handleNiceWorkContinue = () => {
    if (niceWork === "step3") { setStep(3); setNiceWork(null); }
    else if (niceWork === "done") { setPhase("bridge"); }
  };

  const palus = {
    1: {
      title: `E ${name}. Read the wind before you leave the harbour.`,
      body: "From the Marquesas, we sail northwest to Hawaiʻi — crossing the ITCZ doldrums, then riding the NE trades home. Study the map — watch where the winds blow, where the doldrums sit, how the belts are laid.",
      hint: "Toggle El Niño to see how the wind pattern shifts in those years. When you understand the map, press Continue.",
      showToggle: true,
    },
    2: {
      title: "Now choose your departure bearing.",
      body: "Hawaiʻi lies to the northwest. We must cross the doldrums — aim slightly west of north so the NE trades carry us onto the mark. Where do you point the bow?",
      hint: null,
      showToggle: false,
    },
    3: {
      title: selBearing === sc.correctBearing ? "335°. The right course." : selBearing ? "Check the wind again." : "335°. The right course.",
      body: selBearing === sc.correctBearing
        ? "North-northwest — aimed slightly west so the NE trades push you onto Hawaiʻi rather than past it. Arrive upwind and you can always fall off to leeward. Now — the map has changed. What has happened to the ITCZ?"
        : `${selBearing}° takes you too far ${selBearing < sc.correctBearing ? "east" : "west"}. The NE trades come from the northeast — they push west. Aim slightly west of your target so they carry you in, not past it.`,
      hint: null,
      showToggle: false,
    },
    4: {
      title: "The ITCZ moves south in El Niño.",
      body: "The doldrums belt drops below its usual position — directly across the route. The crossing window changes. A navigator who knows this changes their calendar, not their courage.",
      hint: null,
      showToggle: false,
    },
  };

  const palu = palus[step] || palus[4];
  const stepLabels = ["1 · Read", "2 · Bearing", "3 · El Niño", "✦ Done"];

  return (
    <div style={{ width:"100%", height:"100%", background:"#040810", display:"flex", flexDirection:"column", overflow:"hidden" }}>

      {/* Header */}
      <div style={{ height:"44px", borderBottom:"1px solid #0A1828", background:"rgba(4,8,18,0.97)", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 22px", flexShrink:0 }}>
        <span style={{ fontFamily:"Cinzel,serif", fontSize:"12px", fontWeight:"700", color:"#C8941A", letterSpacing:"0.12em" }}>OCEAN ADVENTURE</span>
        <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
          <span style={{ fontFamily:"Cinzel,serif", fontSize:"10.5px", color:"#4A70A8", letterSpacing:"0.09em" }}>HAUMĀNA · {name.toUpperCase()}</span>
          <button
            type="button"
            onClick={onOpenBag}
            style={{ background:unlocked.length>0?"rgba(200,148,26,0.10)":"none", border:`1px solid ${unlocked.length>0?"#C8941A55":"#0A1828"}`, borderRadius:"5px", padding:"5px 10px", cursor:"pointer", fontFamily:"Cinzel,serif", fontSize:"10px", color:unlocked.length>0?"#C8941A":"#7AACBE", letterSpacing:"0.08em" }}
          >
            {unlocked.length>0 ? `✦ BAG (${unlocked.length})` : "✦ BAG"}
          </button>
        </div>
      </div>

      {/* Module bar */}
      <div style={{ padding:"7px 22px", borderBottom:"1px solid #0A1828", background:"rgba(4,8,18,0.6)", flexShrink:0 }}>
        <span style={{ fontFamily:"Cinzel,serif", fontSize:"10.5px", color:"#4A70C0", letterSpacing:"0.16em" }}>MODULE 4 · HAU ME MATAGI</span>
        <span style={{ fontFamily:"Cinzel,serif", fontSize:"10.5px", color:"#7AACBE", marginLeft:"14px", letterSpacing:"0.1em" }}>WIND PATTERNS · VOYAGE STRATEGY</span>
      </div>

      {/* Body */}
      <div style={{ flex:1, display:"flex", overflow:"hidden", minHeight:0 }}>

        {/* Left panel */}
        <div style={{ width:"320px", flexShrink:0, borderRight:"1px solid #0A1828", overflowY:"auto" }}>
          <div style={{ display:"flex", flexDirection:"column", gap:"12px", padding:"18px", boxSizing:"border-box" }}>

            <button type="button" onClick={onBack} style={{ width:"100%", background:"none", border:"1px solid #0A1828", borderRadius:"4px", color:"#7AACBE", fontSize:"10px", fontFamily:"Cinzel,serif", letterSpacing:"0.1em", padding:"8px", cursor:"pointer" }}>← MAP</button>

            {/* Scenario card */}
            <div style={{ background:"rgba(8,14,28,0.85)", border:"1px solid #0E2040", borderRadius:"7px", padding:"12px 14px" }}>
              <div style={{ fontSize:"9px", letterSpacing:"0.18em", color:"#1A3858", fontFamily:"Cinzel,serif", marginBottom:"5px" }}>MARQUESAS → HAWAIʻI</div>
              <div style={{ fontSize:"14px", color:"#7AAAD8", fontFamily:"Cinzel,serif", fontWeight:"700", marginBottom:"2px" }}>NNW · Cross the ITCZ</div>
              <div style={{ fontSize:"10.5px", color:"#2A4868", fontFamily:"Cinzel,serif" }}>~3,200 km · Cross doldrums · Ride NE trades</div>
            </div>

            {/* Step indicators */}
            <div style={{ display:"flex", gap:"4px" }}>
              {stepLabels.map((label, i) => {
                const done = i+1 < step, curr = i+1 === step;
                return <div key={i} style={{ flex:1, textAlign:"center", padding:"6px 2px", fontSize:"10px", fontFamily:"Cinzel,serif", letterSpacing:"0.06em", background:curr?"rgba(74,112,192,0.18)":done?"rgba(26,120,110,0.18)":"rgba(255,255,255,0.03)", border:`1px solid ${curr?"#4A70C0":done?"#1A8870":"#0E2030"}`, borderRadius:"5px", color:curr?"#7AAAE0":done?"#2BB5A0":"#7AACBE" }}>{label}</div>;
              })}
            </div>

            {/* Palu speech */}
            <div style={{ background:"rgba(4,8,20,0.7)", border:"1px solid #0E1E34", borderRadius:"7px", padding:"16px", display:"flex", flexDirection:"column", gap:"10px", position:"relative" }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}><div style={{ fontSize:"11px", color:"#1A3050", fontFamily:"Cinzel,serif", letterSpacing:"0.14em" }}>THE PALU SPEAKS</div><span style={{ fontSize:"16px", opacity:0.75 }}>🦜</span></div>
              <div style={{ fontSize:"20px", color:"#D0A838", fontFamily:"Cinzel,serif", fontWeight:"700", lineHeight:"1.4" }}>{palu.title}</div>
              <div style={{ fontSize:"15px", color:"#7AACBE", fontFamily:"Georgia,serif", fontStyle:"italic", lineHeight:"1.75" }}>{palu.body}</div>
              {palu.hint && !niceWork && (
                <div style={{ padding:"9px 12px", background:"rgba(20,40,90,0.4)", borderLeft:"2px solid #4A70C0", borderRadius:"0 4px 4px 0", fontSize:"11px", color:"#6090C0", fontFamily:"Georgia,serif" }}>
                  {palu.hint}
                </div>
              )}
              {/* Nice work overlay */}
              {niceWork && (
                <div style={{ position:"absolute", inset:0, background:"rgba(4,8,20,0.93)", borderRadius:"7px", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"14px", padding:"20px" }}>
                  <div style={{ fontSize:"28px" }}>≋</div>
                  <div style={{ fontFamily:"Cinzel,serif", fontSize:"15px", fontWeight:"700", color:"#4A70C0", textAlign:"center" }}>
                    {niceWork === "done" ? "The wind is read." : "Correct bearing."}
                  </div>
                  <div style={{ fontFamily:"Georgia,serif", fontSize:"13px", color:"#7AACBE", fontStyle:"italic", textAlign:"center", lineHeight:"1.6" }}>
                    {niceWork === "step3"
                      ? "335°. Now — once you cross the doldrums into the NE trade belt, the wind shifts. You will need to adjust your bearing to compensate. Watch the map change."
                      : "Trade winds, ITCZ, El Niño shifts. A navigator who knows this changes their calendar, not their courage."}
                  </div>
                  <button onClick={handleNiceWorkContinue} style={{ padding:"11px 24px", borderRadius:"6px", cursor:"pointer", fontFamily:"Cinzel,serif", fontSize:"11px", fontWeight:"700", letterSpacing:"0.12em", border:"1px solid #4A70C0", background:"rgba(74,112,192,0.14)", color:"#7AAAE0" }}>
                    {niceWork === "done" ? "CONTINUE →" : "NEXT →"}
                  </button>
                </div>
              )}
            </div>

            {/* Toggle — step 1 only */}
            {palu.showToggle && (
              <div style={{ display:"flex", gap:"6px" }}>
                {["normal","elnino"].map(m => (
                  <button key={m} onClick={() => setMode(m)} style={{ flex:1, padding:"8px", borderRadius:"5px", fontFamily:"Cinzel,serif", fontSize:"9px", letterSpacing:"0.08em", cursor:"pointer", border:`1px solid ${mode===m?"#4A70C055":"#0A1828"}`, background:mode===m?"rgba(74,112,192,0.14)":"none", color:mode===m?"#7AAAE0":"#1A3848" }}>
                    {m === "normal" ? "NORMAL YEAR" : "EL NIÑO YEAR"}
                  </button>
                ))}
              </div>
            )}

            {/* Continue button — step 1 */}
            {step === 1 && (
              <button onClick={() => setStep(2)} style={{ padding:"11px", borderRadius:"6px", fontFamily:"Cinzel,serif", fontSize:"10px", fontWeight:"700", letterSpacing:"0.12em", cursor:"pointer", border:"1px solid #4A70C0", background:"rgba(74,112,192,0.12)", color:"#7AAAE0" }}>
                I UNDERSTAND THE WIND →
              </button>
            )}

            {/* Return button — step 4 */}
            {step === 4 && (
              <button onClick={onBack} style={{ padding:"11px", borderRadius:"6px", fontFamily:"Cinzel,serif", fontSize:"10px", fontWeight:"700", letterSpacing:"0.12em", cursor:"pointer", border:"1px solid #4A70C0", background:"rgba(74,112,192,0.12)", color:"#7AAAE0" }}>
                RETURN TO THE OCEAN →
              </button>
            )}

          </div>
        </div>

        {/* Right: wind map */}
        <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"20px 24px", overflow:"hidden" }}>
          <div style={{ width:"min(100%, 740px)" }}>
            <WindMapSVG
              mode={mode} step={step}
              selBearing={selBearing} selElNino={selElNino}
              confirming={confirming}
              onBearingSelect={handleBearingSelect}
              onElNinoSelect={handleElNinoSelect}
            />
          </div>
        </div>

      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   BIRD MODULE
══════════════════════════════════════════════════════════════ */

function BirdSilhouette({ birdId, color, size = 48 }) {
  const h = size * 0.6;
  // Each silhouette on a 60x36 viewBox — distinct wing shape + tail per species
  const shapes = {
    // White tern — long swept-back wings like a swift, tiny body, forked tail
    white_tern:
      `<path d="M2,16 C10,4 22,14 30,16 C38,14 50,4 58,16" strokeWidth="2" fill="none" strokeLinecap="round"/>
       <ellipse cx="30" cy="16" rx="2.5" ry="2" fill="currentColor"/>
       <line x1="28" y1="18" x2="25" y2="26" strokeWidth="1.6" strokeLinecap="round"/>
       <line x1="32" y1="18" x2="35" y2="26" strokeWidth="1.6" strokeLinecap="round"/>`,
    // Noddy — broader rounder wings, heavier body, wedge tail (no fork)
    noddy:
      `<path d="M3,17 C10,7 20,15 30,17 C40,15 50,7 57,17" strokeWidth="2.4" fill="none" strokeLinecap="round"/>
       <ellipse cx="30" cy="17" rx="3.2" ry="2.8" fill="currentColor"/>
       <line x1="30" y1="20" x2="30" y2="29" strokeWidth="2.2" strokeLinecap="round"/>`,
    // ʻIwa — bent-M kink at wrist, deeply forked long tail
    iwa_pelagic:
      `<path d="M0,18 C6,8 13,20 20,16 C24,13 30,18 36,16 C43,20 50,8 60,18" strokeWidth="2" fill="none" strokeLinecap="round"/>
       <ellipse cx="30" cy="17" rx="2.5" ry="2" fill="currentColor"/>
       <line x1="27" y1="19" x2="22" y2="30" strokeWidth="1.8" strokeLinecap="round"/>
       <line x1="33" y1="19" x2="38" y2="30" strokeWidth="1.8" strokeLinecap="round"/>`,
    iwa_carrier:
      `<path d="M0,18 C6,8 13,20 20,16 C24,13 30,18 36,16 C43,20 50,8 60,18" strokeWidth="2" fill="none" strokeLinecap="round"/>
       <ellipse cx="30" cy="17" rx="2.5" ry="2" fill="currentColor"/>
       <line x1="27" y1="19" x2="22" y2="30" strokeWidth="1.8" strokeLinecap="round"/>
       <line x1="33" y1="19" x2="38" y2="30" strokeWidth="1.8" strokeLinecap="round"/>`,
    // Kōlea — stubby compact shorebird wings, fat round body, very short straight tail
    golden_plover:
      `<path d="M8,16 C14,9 22,15 30,16 C38,15 46,9 52,16" strokeWidth="2.4" fill="none" strokeLinecap="round"/>
       <ellipse cx="30" cy="16" rx="4.2" ry="3.4" fill="currentColor"/>
       <line x1="30" y1="19" x2="30" y2="24" strokeWidth="2.2" strokeLinecap="round"/>`,
    // Koekoea — medium wings, tail nearly as long as the body with chevron tip
    long_tailed_cuckoo:
      `<path d="M5,15 C12,7 20,14 30,15 C40,14 48,7 55,15" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
       <ellipse cx="30" cy="15" rx="3" ry="2.5" fill="currentColor"/>
       <line x1="30" y1="18" x2="30" y2="34" strokeWidth="2.2" strokeLinecap="round"/>
       <path d="M27,30 L30,34 L33,30" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>`,
  };
  const d = shapes[birdId] || shapes.noddy;
  return (
    <svg width={size} height={h} viewBox="0 0 60 36" style={{ color, filter:`drop-shadow(0 0 6px ${color}66)` }}>
      <g stroke="currentColor">
        <g dangerouslySetInnerHTML={{ __html: d }} />
      </g>
    </svg>
  );
}

function RangeDiagram({ bird }) {
  const W = 320, H = 180, cx = 160, cy = 95;
  const r200 = 78, r65 = Math.round(r200 * 65 / 200);
  const pal = BIRD_TYPE_META[bird.type] || BIRD_TYPE_META.land;
  const is200 = bird.range === 200;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width:"100%", background:"rgba(3,12,8,0.7)", borderRadius:"6px" }}>
      {Array.from({length:5},(_,i) => <line key={i} x1={0} y1={20+i*38} x2={W} y2={20+i*38} stroke="#0A1E14" strokeWidth="0.5"/>)}
      {Array.from({length:8},(_,i) => <line key={i} x1={20+i*42} y1={0} x2={20+i*42} y2={H} stroke="#0A1E14" strokeWidth="0.5"/>)}

      <circle cx={cx} cy={cy} r={r200}
        fill={is200 ? "rgba(0,200,150,0.07)" : "none"}
        stroke={is200 ? pal.fill : "#1A4030"}
        strokeWidth={is200 ? 1.8 : 0.8}
        strokeDasharray={is200 ? "none" : "4,6"} />
      <text x={cx} y={cy - r200 - 6} textAnchor="middle"
        fill={is200 ? pal.fill : "#1A4030"} fontSize="9" fontFamily="Cinzel,serif">200 km</text>

      <circle cx={cx} cy={cy} r={r65}
        fill={!is200 ? "rgba(0,200,150,0.14)" : "none"}
        stroke={!is200 ? pal.fill : "#1A4030"}
        strokeWidth={!is200 ? 1.8 : 0.8}
        strokeDasharray={!is200 ? "none" : "3,5"} />
      <text x={cx} y={cy - r65 - 5} textAnchor="middle"
        fill={!is200 ? pal.fill : "#1A4030"} fontSize="9" fontFamily="Cinzel,serif">65 km</text>

      <circle cx={cx} cy={cy} r={7} fill="#0E2818" stroke="#2A5040" strokeWidth="1.5"/>
      <text x={cx} y={cy + 4} textAnchor="middle" fill="#3A8060" fontSize="6.5" fontFamily="Cinzel,serif">ISLAND</text>

      {[["N",cx,10],["S",cx,H-4],["W",8,cy+4],["E",W-8,cy+4]].map(([l,x,y])=>(
        <text key={l} x={x} y={y} textAnchor="middle" fill="#1A4030" fontSize="8" fontFamily="Cinzel,serif">{l}</text>
      ))}
    </svg>
  );
}

function MigrationMap({ migration, color }) {
  const { south, north, note } = migration;
  const bezPt = (x0,y0,cx,cy,x1,y1,t) => {
    const mt=1-t;
    return { x:mt*mt*x0+2*mt*t*cx+t*t*x1, y:mt*mt*y0+2*mt*t*cy+t*t*y1 };
  };
  const arrow = (x0,y0,cx0,cy0,x1,y1,sz=10) => {
    const p0=bezPt(x0,y0,cx0,cy0,x1,y1,0.85);
    const p1=bezPt(x0,y0,cx0,cy0,x1,y1,0.95);
    const dx=p1.x-p0.x, dy=p1.y-p0.y, len=Math.sqrt(dx*dx+dy*dy);
    const ux=dx/len, uy=dy/len;
    return `${x1.toFixed(1)},${y1.toFixed(1)} ${(x1-ux*sz-uy*sz*0.45).toFixed(1)},${(y1-uy*sz+ux*sz*0.45).toFixed(1)} ${(x1-ux*sz+uy*sz*0.45).toFixed(1)},${(y1-uy*sz-ux*sz*0.45).toFixed(1)}`;
  };
  return (
    <div style={{ background:"rgba(4,14,10,0.7)", border:"1px solid #1A3828", borderRadius:"8px", padding:"14px 16px" }}>
      <div style={{ fontFamily:"Cinzel,serif", fontSize:"9px", color:"#2A6050", letterSpacing:"0.16em", marginBottom:"10px" }}>MIGRATION ROUTES</div>
      <svg viewBox="0 0 260 224" style={{ width:"100%", display:"block" }}>
        <rect width="260" height="224" fill="#030C08"/>
        {Array.from({length:8},(_,i)=><line key={i} x1={0} y1={i*32} x2={260} y2={i*32} stroke="#0A1E14" strokeWidth="0.5"/>)}
        {Array.from({length:8},(_,i)=><line key={i} x1={i*38} y1={0} x2={i*38} y2={224} stroke="#0A1E14" strokeWidth="0.5"/>)}

        {/* Southbound — solid long-dash, full opacity */}
        <path d={`M${south.from.x},${south.from.y} Q${south.ctrl.x},${south.ctrl.y} ${south.to.x},${south.to.y}`}
          fill="none" stroke={color} strokeWidth="2" strokeDasharray="9,5" opacity="0.9"/>
        <polygon points={arrow(south.from.x,south.from.y,south.ctrl.x,south.ctrl.y,south.to.x,south.to.y)}
          fill={color} opacity="0.95"/>

        {/* Northbound — dotted short-dash, lighter */}
        <path d={`M${north.from.x},${north.from.y} Q${north.ctrl.x},${north.ctrl.y} ${north.to.x},${north.to.y}`}
          fill="none" stroke={color} strokeWidth="1.6" strokeDasharray="2,6" opacity="0.55"/>
        <polygon points={arrow(north.from.x,north.from.y,north.ctrl.x,north.ctrl.y,north.to.x,north.to.y,9)}
          fill={color} opacity="0.6"/>

        <circle cx={south.from.x} cy={south.from.y} r={5} fill={color} opacity="0.95"/>
        <circle cx={south.to.x}   cy={south.to.y}   r={5} fill={color} opacity="0.7"/>
        <text x={south.from.x} y={south.from.y - 10} textAnchor={south.from.x < 130 ? "start" : "middle"}
          fill={color} fontSize="10" fontFamily="Cinzel,serif" opacity="0.95">{south.from.name}</text>
        <text x={south.to.x}   y={south.to.y   - 10} textAnchor={south.to.x > 130 ? "end" : "middle"}
          fill={color} fontSize="10" fontFamily="Cinzel,serif" opacity="0.75">{south.to.name}</text>
      </svg>
      <div style={{ display:"flex", flexDirection:"column", gap:"5px", marginTop:"8px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"10px", fontSize:"10px", color, fontFamily:"Cinzel,serif" }}>
          <svg width="36" height="10" viewBox="0 0 36 10">
            <line x1="0" y1="5" x2="26" y2="5" stroke={color} strokeWidth="2" strokeDasharray="9,5"/>
            <polygon points="36,5 26,2 26,8" fill={color}/>
          </svg>
          {south.label}
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:"10px", fontSize:"10px", color, fontFamily:"Cinzel,serif", opacity:0.6 }}>
          <svg width="36" height="10" viewBox="0 0 36 10">
            <line x1="0" y1="5" x2="26" y2="5" stroke={color} strokeWidth="1.6" strokeDasharray="2,6"/>
            <polygon points="36,5 26,2 26,8" fill={color}/>
          </svg>
          {north.label}
        </div>
        <div style={{ fontSize:"9.5px", color:"#2A6050", marginTop:"2px", fontFamily:"Cinzel,serif" }}>{note}</div>
      </div>
    </div>
  );
}

function BirdModule({ name, onBack, onOpenBag, unlocked, onComplete, onBridge }) {
  const [phase,       setPhase]      = useState("intro");
  const [step,        setStep]       = useState(1);    // 1=field guide, 2=sightings challenge
  const [activeCard,  setActiveCard] = useState(0);    // which bird card is open
  const [sightingIdx, setSightingIdx]= useState(0);    // current sighting
  const [answers,     setAnswers]    = useState({});   // sightingIdx → chosen action
  const [confirming,  setConfirming] = useState(false);
  const [learnStep,   setLearnStep]  = useState(0);

  // For Module 5: intro → field guide (learn phase) → sightings (activity)
  // The field guide IS the learn phase, so "learn" maps to step 1, "activity" to step 2
  if (phase === "intro") return (
    <ModuleIntroScreen moduleNum={5} name={name}
      onBegin={() => setPhase("learn")}
      onBack={onBack} />
  );
  if (phase === "learn") {
    const concepts = MODULE_CONTENT[5].learn.concepts;
    const concept  = concepts[learnStep];
    const isLast   = learnStep === concepts.length - 1;
    const accent   = "#00C896";
    const dep      = MODULE_CONTENT[5].departure;

    return (
      <div style={{ width:"100%", height:"100%", background:"#060E08", display:"flex", flexDirection:"column", overflow:"hidden" }}>
        <div style={{ height:"44px", borderBottom:`1px solid ${accent}33`, background:"rgba(6,14,8,0.96)", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 22px", flexShrink:0 }}>
          <span style={{ fontFamily:"Cinzel,serif", fontSize:"12px", fontWeight:"700", color:"#C8941A", letterSpacing:"0.12em" }}>OCEAN ADVENTURE</span>
          <span style={{ fontFamily:"Cinzel,serif", fontSize:"10.5px", color:accent, letterSpacing:"0.09em", opacity:0.8 }}>HAUMĀNA · {name.toUpperCase()}</span>
        </div>
        <div style={{ padding:"7px 22px", borderBottom:`1px solid ${accent}22`, background:"rgba(4,10,6,0.7)", flexShrink:0, display:"flex", alignItems:"center", gap:"14px" }}>
          <span style={{ fontFamily:"Cinzel,serif", fontSize:"9.5px", color:accent, letterSpacing:"0.16em", opacity:0.9 }}>ON SHORE · {dep.location.toUpperCase()}</span>
          <span style={{ fontFamily:"Georgia,serif", fontSize:"9px", color:`${accent}66`, fontStyle:"italic" }}>{dep.note}</span>
        </div>
        <div style={{ flex:1, display:"flex", overflow:"hidden", minHeight:0 }}>
          <div style={{ width:"320px", flexShrink:0, borderRight:`1px solid ${accent}18`, overflowY:"auto", background:"rgba(4,10,6,0.85)", display:"flex", flexDirection:"column" }}>
            <div style={{ padding:"22px 20px", display:"flex", flexDirection:"column", gap:"16px", flex:1 }}>
              <div style={{ display:"flex", gap:"8px" }}>
                <button type="button" onClick={onBack} style={{ flex:1, background:"none", border:`1px solid ${accent}22`, borderRadius:"4px", color:"#2A3A28", fontSize:"9.5px", fontFamily:"Cinzel,serif", letterSpacing:"0.1em", padding:"8px", cursor:"pointer" }}>← MAP</button>
                <button type="button" onClick={onOpenBag} style={{ flex:1, background:unlocked.length>0?"rgba(200,148,26,0.10)":"none", border:`1px solid ${unlocked.length>0?"#C8941A55":accent+"22"}`, borderRadius:"4px", color:unlocked.length>0?"#C8941A":"#2A3A28", fontSize:"9.5px", fontFamily:"Cinzel,serif", letterSpacing:"0.1em", padding:"8px", cursor:"pointer" }}>
                  {unlocked.length>0 ? `✦ BAG (${unlocked.length})` : "✦ BAG"}
                </button>
              </div>
              <div style={{ display:"flex", gap:"6px", alignItems:"center" }}>
                {concepts.map((_,i) => (
                  <div key={i} onClick={() => i < learnStep && setLearnStep(i)} style={{ width:i===learnStep?"18px":"7px", height:"7px", borderRadius:"4px", background:i===learnStep?accent:i<learnStep?"#2A8860":"#1A2820", cursor:i<learnStep?"pointer":"default", transition:"all 0.25s" }}/>
                ))}
                <span style={{ fontFamily:"Cinzel,serif", fontSize:"9px", color:"#2A3A28", marginLeft:"4px" }}>{learnStep+1}/{concepts.length}</span>
              </div>
              <div style={{ fontFamily:"Cinzel,serif", fontSize:"19px", fontWeight:"700", color:accent, lineHeight:"1.3" }}>{concept.heading}</div>
              <div style={{ fontFamily:"Georgia,serif", fontSize:"16px", color:"#7AACBE", lineHeight:"1.82", fontStyle:"italic", borderLeft:`2px solid ${accent}44`, paddingLeft:"16px" }}>{concept.body}</div>
              <div style={{ display:"flex", gap:"8px", marginTop:"auto" }}>
                {learnStep > 0 && (
                  <button type="button" onClick={() => setLearnStep(i=>i-1)} style={{ flex:1, padding:"11px", borderRadius:"6px", cursor:"pointer", fontFamily:"Cinzel,serif", fontSize:"10px", fontWeight:"700", letterSpacing:"0.1em", border:`1px solid ${accent}33`, background:"none", color:`${accent}88` }}>← PREV</button>
                )}
                {!isLast ? (
                  <button type="button" onClick={() => setLearnStep(i=>i+1)} style={{ flex:1, padding:"11px", borderRadius:"6px", cursor:"pointer", fontFamily:"Cinzel,serif", fontSize:"10px", fontWeight:"700", letterSpacing:"0.12em", border:`1px solid ${accent}`, background:`${accent}18`, color:accent }}>NEXT →</button>
                ) : (
                  <button type="button" onClick={() => setPhase("activity")} style={{ flex:1, padding:"11px", borderRadius:"6px", cursor:"pointer", fontFamily:"Cinzel,serif", fontSize:"11px", fontWeight:"700", letterSpacing:"0.12em", border:`1px solid ${accent}`, background:`linear-gradient(135deg,${accent}22,${accent}0A)`, color:accent }}>WATCH THE BIRDS →</button>
                )}
              </div>
            </div>
          </div>
          {/* Right — bird illustration */}
          <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"24px", background:"rgba(4,10,5,0.4)" }}>
            {/* Simple bird range diagram — SVG */}
            <svg viewBox="0 0 480 280" style={{ width:"100%", maxWidth:"480px", borderRadius:"8px", background:"#030A10" }}>
              <rect width="480" height="280" fill="#030A10"/>
              {/* Ocean */}
              <rect x="0" y="160" width="480" height="120" fill="#040E18"/>
              <line x1="0" y1="160" x2="480" y2="160" stroke="#0A3040" strokeWidth="1"/>
              {/* Island */}
              <ellipse cx="80" cy="158" rx="40" ry="12" fill="#1A3020"/>
              <path d="M55,158 Q80,130 105,158" fill="#1A4028"/>
              <text x="80" y="178" textAnchor="middle" fill="#2A5030" fontSize="10" fontFamily="Cinzel,serif">LAND</text>
              {/* White tern range arc — 200km */}
              <path d="M80,148 Q280,60 400,148" fill="none" stroke="#00C896" strokeWidth="1.5" strokeDasharray="6,4" opacity="0.7"/>
              <text x="400" y="140" fill="#00C896" fontSize="11" fontFamily="Cinzel,serif" fontWeight="700">Manu-o-kū</text>
              <text x="400" y="155" fill="#00C896" fontSize="9" fontFamily="Cinzel,serif" opacity="0.7">200 km</text>
              {/* Black noddy range arc — 65km */}
              <path d="M80,150 Q160,100 200,150" fill="none" stroke="#7AACBE" strokeWidth="1.5" strokeDasharray="4,4" opacity="0.7"/>
              <text x="205" y="145" fill="#7AACBE" fontSize="10" fontFamily="Cinzel,serif">Noio · 65 km</text>
              {/* Frigatebird — open ocean, no arc */}
              <circle cx="380" cy="80" r="5" fill="#FF6644" opacity="0.8"/>
              <text x="395" y="76" fill="#FF6644" fontSize="10" fontFamily="Cinzel,serif">ʻIwa</text>
              <text x="395" y="89" fill="#FF6644" fontSize="9" fontFamily="Cinzel,serif" opacity="0.7">open ocean — ignore</text>
              {/* Birds flying */}
              {[[180,120],[220,108],[260,100]].map(([x,y],i)=>(
                <path key={i} d={`M${x-6},${y} Q${x},${y-4} ${x+6},${y}`} fill="none" stroke="#00C896" strokeWidth="1.5" opacity={0.5+i*0.15}/>
              ))}
            </svg>
          </div>
        </div>
      </div>
    );
  }
  if (phase === "bridge") return (
    <FijiBirdMateScreen name={name} unlocked={unlocked} onReturn={onBridge || onBack} />
  );
  if (phase === "done") return (
    <div style={{ width:"100%", height:"100%", background:"#040C0A", display:"flex", alignItems:"center", justifyContent:"center", padding:"24px" }}>
      <div style={{ maxWidth:"520px", width:"100%", background:"rgba(4,10,8,0.9)", border:"1px solid #0A1E18", borderRadius:"12px", padding:"22px 22px 18px", textAlign:"center" }}>
        <div style={{ fontFamily:"Cinzel,serif", fontSize:"10px", color:"#2A9A70", letterSpacing:"0.18em", marginBottom:"10px" }}>MODULE 5 COMPLETE</div>
        <div style={{ fontFamily:"Cinzel,serif", fontSize:"22px", fontWeight:"800", color:"#E8D8A8", lineHeight:"1.2", marginBottom:"10px" }}>You read what flies.</div>
        <div style={{ fontFamily:"Georgia,serif", fontSize:"14px", color:"#7AACBE", lineHeight:"1.75", fontStyle:"italic", marginBottom:"16px" }}>
          "The ʻiwa did not return. Somewhere ahead, beyond the horizon, it is landing. That is Fiji."
        </div>
        <button
          type="button"
          onClick={() => { onComplete(); setPhase("bridge"); }}
          style={{ padding:"12px 18px", borderRadius:"6px", cursor:"pointer", fontFamily:"Cinzel,serif", fontSize:"11px", fontWeight:"800", letterSpacing:"0.12em", border:"1px solid #2A9A70", background:"rgba(42,154,112,0.14)", color:"#2A9A70" }}
        >
          CONTINUE →
        </button>
      </div>
    </div>
  );

  const currentSighting = BIRD_SIGHTINGS[sightingIdx];
  const currentBird     = BIRDS.find(b => b.id === currentSighting?.birdId);
  const allAnswered     = BIRD_SIGHTINGS.every((s, i) => answers[i] !== undefined);

  const actionOptions = [
    { id: "land",    label: "Follow it",      sub: "land is near",       color: "#2AB870" },
    { id: "bearing", label: "Note direction", sub: "bearing signal",     color: "#C8941A" },
    { id: "ignore",  label: "Ignore it",      sub: "no useful signal",   color: "#6A7080" },
    { id: "release", label: "Release the ʻiwa", sub: "use your tool",    color: "#C8941A" },
  ];

  const handleAction = (action) => {
    if (confirming) return;
    const correct = action === currentSighting.correct;
    const newAnswers = { ...answers, [sightingIdx]: action };
    setAnswers(newAnswers);
    if (correct) {
      setConfirming(true);
      const isLast = sightingIdx === BIRD_SIGHTINGS.length - 1;
      setTimeout(() => {
        setConfirming(false);
        if (isLast) {
          setPhase("done");
        } else {
          setSightingIdx(i => i + 1);
        }
      }, 1800);
    }
  };

  // Palu speech
  const paluStep1 = {
    title: `E ${name}. Watch what flies.`,
    body: "We have left Hawaiʻi and the ocean ahead is wide. Before an island appears, before the sun or stars give us our bearing — the birds are already there. Each species carries a different message. Study them in the field guide, then we will test your eye.",
  };

  const paluStep2 = () => {
    const ans = answers[sightingIdx];
    const correct = ans === currentSighting?.correct;
    if (!ans) return {
      title: `Day ${3 + sightingIdx}. A sighting.`,
      body: currentSighting?.context,
    };
    if (correct) return {
      title: "Correct.",
      body: sightingIdx < BIRD_SIGHTINGS.length - 1
        ? "The next day brings another sighting."
        : "Every bird read correctly. Fiji is not far now.",
    };
    return {
      title: "Look again.",
      body: `A ${currentBird?.label} — ${currentBird?.desc.split('.')[0]}. What does that tell you?`,
    };
  };

  const palu = step === 1 ? paluStep1 : step === 2 ? paluStep2() : {
    title: "The ʻiwa has found land.",
    body: "It did not return. Somewhere ahead, beyond the horizon, it is landing. That is Fiji. We carry the bird guide with us now — and Matala approves.",
  };

  const stepLabels = ["1 · Field Guide", "2 · Sightings", "✦ Done"];
  const accent = "#2A9A70";

  return (
    <div style={{ width:"100%", height:"100%", background:"#040C0A", display:"flex", flexDirection:"column", overflow:"hidden" }}>

      {/* Header */}
      <div style={{ height:"44px", borderBottom:"1px solid #0A1E18", background:"rgba(4,10,8,0.97)", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 22px", flexShrink:0 }}>
        <span style={{ fontFamily:"Cinzel,serif", fontSize:"12px", fontWeight:"700", color:"#C8941A", letterSpacing:"0.12em" }}>OCEAN ADVENTURE</span>
        <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
          <span style={{ fontFamily:"Cinzel,serif", fontSize:"10.5px", color:"#2A9A70", letterSpacing:"0.09em" }}>HAUMĀNA · {name.toUpperCase()}</span>
          <button
            type="button"
            onClick={onOpenBag}
            style={{ background:unlocked.length>0?"rgba(200,148,26,0.10)":"none", border:`1px solid ${unlocked.length>0?"#C8941A55":"#0A1E18"}`, borderRadius:"5px", padding:"5px 10px", cursor:"pointer", fontFamily:"Cinzel,serif", fontSize:"10px", color:unlocked.length>0?"#C8941A":"#7AACBE", letterSpacing:"0.08em" }}
          >
            {unlocked.length>0 ? `✦ BAG (${unlocked.length})` : "✦ BAG"}
          </button>
        </div>
      </div>

      {/* Module bar */}
      <div style={{ padding:"7px 22px", borderBottom:"1px solid #0A1E18", background:"rgba(4,10,8,0.6)", flexShrink:0 }}>
        <span style={{ fontFamily:"Cinzel,serif", fontSize:"10.5px", color:"#2A9A70", letterSpacing:"0.16em" }}>MODULE 5 · NGĀ MANU</span>
        <span style={{ fontFamily:"Cinzel,serif", fontSize:"10.5px", color:"#7AACBE", marginLeft:"14px", letterSpacing:"0.1em" }}>THE BIRD GUIDE · READ WHAT FLIES</span>
      </div>

      {/* Body */}
      <div style={{ flex:1, display:"flex", overflow:"hidden", minHeight:0 }}>

        {/* Left panel */}
        <div style={{ width:"320px", flexShrink:0, borderRight:"1px solid #0A1E18", overflowY:"auto" }}>
          <div style={{ display:"flex", flexDirection:"column", gap:"12px", padding:"18px", boxSizing:"border-box" }}>

            <button type="button" onClick={onBack} style={{ width:"100%", background:"none", border:"1px solid #0A1818", borderRadius:"4px", color:"#7AACBE", fontSize:"10px", fontFamily:"Cinzel,serif", letterSpacing:"0.1em", padding:"8px", cursor:"pointer" }}>← MAP</button>

            {/* Step indicators */}
            <div style={{ display:"flex", gap:"4px" }}>
              {stepLabels.map((label, i) => {
                const done = i+1 < step, curr = i+1 === step;
                return <div key={i} style={{ flex:1, textAlign:"center", padding:"6px 2px", fontSize:"10px", fontFamily:"Cinzel,serif", letterSpacing:"0.06em", background:curr?`rgba(42,154,112,0.18)`:done?"rgba(26,120,110,0.18)":"rgba(255,255,255,0.03)", border:`1px solid ${curr?accent:done?"#1A8870":"#0E2018"}`, borderRadius:"5px", color:curr?"#3AC890":done?"#2BB5A0":"#7AACBE" }}>{label}</div>;
              })}
            </div>

            {/* Palu speech */}
            <div style={{ background:"rgba(4,10,8,0.7)", border:"1px solid #0E1E14", borderRadius:"7px", padding:"16px", display:"flex", flexDirection:"column", gap:"10px" }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}><div style={{ fontSize:"11px", color:"#1A3828", fontFamily:"Cinzel,serif", letterSpacing:"0.14em" }}>THE PALU SPEAKS</div><span style={{ fontSize:"16px", opacity:0.75 }}>🦜</span></div>
              <div style={{ fontSize:"20px", color:"#D0A838", fontFamily:"Cinzel,serif", fontWeight:"700", lineHeight:"1.4" }}>{palu.title}</div>
              <div style={{ fontSize:"15px", color:"#7AACBE", fontFamily:"Georgia,serif", fontStyle:"italic", lineHeight:"1.75" }}>{palu.body}</div>
              {step === 3 && (
                <div style={{ padding:"11px", background:"rgba(42,154,112,0.10)", border:`1px solid ${accent}44`, borderRadius:"6px", textAlign:"center", fontFamily:"Cinzel,serif", fontSize:"10px", color:accent, letterSpacing:"0.09em" }}>
                  🐦 BIRD GUIDE ADDED TO YOUR BAG 🐦
                </div>
              )}
            </div>

            {/* Step 1 — advance button */}
            {step === 1 && (
              <button onClick={() => setStep(2)} style={{ padding:"11px", borderRadius:"6px", fontFamily:"Cinzel,serif", fontSize:"10px", fontWeight:"700", letterSpacing:"0.12em", cursor:"pointer", border:`1px solid ${accent}`, background:`rgba(42,154,112,0.12)`, color:"#3AC890" }}>
                I KNOW THESE BIRDS →
              </button>
            )}

            {/* Step 2 — sighting counter */}
            {step === 2 && (
              <div style={{ textAlign:"center", fontFamily:"Cinzel,serif", fontSize:"9px", color:"#1A4030", letterSpacing:"0.12em" }}>
                SIGHTING {sightingIdx + 1} OF {BIRD_SIGHTINGS.length}
              </div>
            )}

            {/* Step 3 — return */}
            {step === 3 && (
              <button onClick={onBack} style={{ padding:"11px", borderRadius:"6px", fontFamily:"Cinzel,serif", fontSize:"10px", fontWeight:"700", letterSpacing:"0.12em", cursor:"pointer", border:`1px solid ${accent}`, background:`rgba(42,154,112,0.12)`, color:"#3AC890" }}>
                RETURN TO THE OCEAN →
              </button>
            )}

          </div>
        </div>

        {/* Right — field guide or sighting challenge */}
        <div style={{ flex:1, overflow:"hidden", display:"flex", flexDirection:"column" }}>

          {/* ── STEP 1: FIELD GUIDE ── */}
          {step === 1 && (
            <div style={{ flex:1, display:"flex", overflow:"hidden" }}>
              {/* Bird list */}
              <div style={{ width:"200px", flexShrink:0, borderRight:"1px solid #0A1E18", overflowY:"auto", padding:"12px 8px" }}>
                {BIRDS.map((bird, i) => {
                  const pal = BIRD_TYPE_META[bird.type] || BIRD_TYPE_META.land;
                  return (
                    <button
                      key={bird.id}
                      type="button"
                      aria-label={`Open ${bird.label}`}
                      aria-current={activeCard === i ? "true" : undefined}
                      onClick={() => setActiveCard(i)}
                      style={{ padding:"10px 12px", marginBottom:"4px", borderRadius:"6px", cursor:"pointer",
                        border:`1px solid ${activeCard===i ? pal.fill+"66" : "#0A1818"}`,
                        background:activeCard===i ? `${pal.fill}10` : "rgba(255,255,255,0.02)",
                        width:"100%",
                        textAlign:"left",
                      }}>
                      <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                        <BirdSilhouette birdId={bird.id} color={activeCard===i ? pal.fill : "#2A5040"} size={28} />
                        <div>
                          <div style={{ fontFamily:"Cinzel,serif", fontSize:"10.5px", fontWeight:"700", color:activeCard===i ? "#D0C8A8" : "#2A4038" }}>{bird.name}</div>
                          <div style={{ fontFamily:"Cinzel,serif", fontSize:"8px", color:activeCard===i ? pal.fill : "#1A3028", letterSpacing:"0.06em", marginTop:"1px" }}>
                            {pal.label}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Bird detail card */}
              {(() => {
                const bird = BIRDS[activeCard];
                const pal  = BIRD_TYPE_META[bird.type] || BIRD_TYPE_META.land;
                return (
                  <div style={{ flex:1, overflowY:"auto", display:"flex", flexDirection:"column" }}>

                    {/* Top row: left column + right column */}
                    <div style={{ display:"flex", borderBottom:"1px solid #0A2018" }}>

                      {/* Left column — silhouette + thumbnail */}
                      <div style={{ width:"110px", flexShrink:0, borderRight:"1px solid #0A2018", background:"#07110A", display:"flex", flexDirection:"column" }}>
                        <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"16px 8px" }}>
                          <BirdSilhouette birdId={bird.id} color={pal.fill} size={80} />
                        </div>
                        <div style={{ overflow:"hidden", borderTop:"1px solid #0A2018", height:"100px" }}>
                          {bird.photo && (
                            <img src={bird.photo} alt={bird.label}
                              style={{ width:"100%", height:"100px", objectFit:"cover", objectPosition:"center 25%", display:"block" }}
                              onError={e => { e.target.style.display = "none"; }} />
                          )}
                        </div>
                      </div>

                      {/* Right column — text */}
                      <div style={{ flex:1, padding:"16px 18px", display:"flex", flexDirection:"column", gap:"10px" }}>
                        <div>
                          <div style={{ fontFamily:"Cinzel,serif", fontSize:"18px", fontWeight:"700", color:"#E8D8A8", lineHeight:"1.2" }}>{bird.name}</div>
                          <div style={{ fontFamily:"Cinzel,serif", fontSize:"10px", color:"#2A6050", letterSpacing:"0.05em", marginTop:"2px" }}>{bird.label}</div>
                          <div style={{ fontFamily:"Georgia,serif", fontSize:"10px", color:"#1A3828", fontStyle:"italic", marginTop:"1px" }}>{bird.latin}</div>
                        </div>

                        {/* Type badge + explanation */}
                        <div style={{ display:"flex", flexDirection:"column", gap:"4px" }}>
                          <div style={{ display:"inline-flex", alignItems:"center", gap:"7px", padding:"5px 11px", borderRadius:"5px", background:pal.faint, border:`1px solid ${pal.fill}44`, alignSelf:"flex-start" }}>
                            <span style={{ width:"7px", height:"7px", borderRadius:"50%", background:pal.fill, flexShrink:0, display:"inline-block" }} />
                            <span style={{ fontFamily:"Cinzel,serif", fontSize:"8.5px", letterSpacing:"0.14em", color:pal.fill }}>{pal.label.toUpperCase()}</span>
                          </div>
                          <div style={{ fontFamily:"Cinzel,serif", fontSize:"10px", color:"#2A6050", paddingLeft:"2px" }}>{pal.explain}</div>
                        </div>

                        <div style={{ fontFamily:"Georgia,serif", fontSize:"12px", color:"#7AC8B0", lineHeight:"1.7", fontStyle:"italic", borderLeft:`2px solid ${pal.fill}55`, paddingLeft:"12px" }}>
                          {bird.desc}
                        </div>

                        <div style={{ fontFamily:"Cinzel,serif", fontSize:"8.5px", letterSpacing:"0.12em", color:pal.fill, paddingTop:"4px", borderTop:"1px solid #0A2018" }}>
                          {bird.signal}
                        </div>

                        {bird.type === "carrier" && (
                          <div style={{ padding:"10px 13px", background:"rgba(255,184,48,0.08)", border:"1px solid #FFB83033", borderRadius:"6px" }}>
                            <div style={{ fontFamily:"Cinzel,serif", fontSize:"9px", color:"#FFB830", letterSpacing:"0.1em", marginBottom:"4px" }}>◆ FINAL VOYAGE TOOL</div>
                            <div style={{ fontFamily:"Georgia,serif", fontSize:"11px", color:"#A08040", lineHeight:"1.6", fontStyle:"italic" }}>
                              You will carry one in the Final Voyage. Timing the release is everything — too early and it circles back. Too late and the moment has passed.
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Full photo */}
                    {bird.photo && (
                      <div style={{ borderBottom:"1px solid #0A2018", overflow:"hidden" }}>
                        <img src={bird.photo} alt={bird.label}
                          style={{ width:"100%", display:"block", maxHeight:"200px", objectFit:"cover", objectPosition:"center 25%" }}
                          onError={e => { e.target.parentNode.style.display = "none"; }} />
                        <div style={{ padding:"5px 12px", fontFamily:"Cinzel,serif", fontSize:"7.5px", color:"#2A5040", letterSpacing:"0.1em", background:"rgba(4,14,10,0.9)" }}>
                          {bird.photoCredit}
                        </div>
                      </div>
                    )}

                    {/* Range diagram (land birds) */}
                    {bird.type === "land" && (
                      <div style={{ padding:"14px 18px", borderBottom:"1px solid #0A2018" }}>
                        <div style={{ fontFamily:"Cinzel,serif", fontSize:"8.5px", color:"#2A6050", letterSpacing:"0.16em", marginBottom:"8px" }}>RANGE FROM NESTING ISLAND</div>
                        <RangeDiagram bird={bird} />
                      </div>
                    )}

                    {/* Migration map (migratory birds) */}
                    {bird.migration && (
                      <div style={{ padding:"14px 18px" }}>
                        <MigrationMap migration={bird.migration} color={pal.fill} />
                      </div>
                    )}

                  </div>
                );
              })()}
            </div>
          )}

          {/* ── STEP 2: SIGHTING CHALLENGE ── */}
          {step === 2 && (
            <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"24px", gap:"20px", overflowY:"auto" }}>

              {/* Ocean scene with bird */}
              <div style={{ width:"min(100%,520px)" }}>
                <svg viewBox="0 0 520 200" style={{ width:"100%", borderRadius:"10px", background:"#030C0A" }}>
                  <defs>
                    <linearGradient id="birdSkyG" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#040E18"/>
                      <stop offset="70%" stopColor="#061814"/>
                      <stop offset="100%" stopColor="#051008"/>
                    </linearGradient>
                    <filter id="birdGlow">
                      <feGaussianBlur stdDeviation="3" result="b"/>
                      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
                    </filter>
                  </defs>
                  <rect width="520" height="200" fill="url(#birdSkyG)"/>
                  {/* Horizon */}
                  <line x1="0" y1="140" x2="520" y2="140" stroke="#0A2820" strokeWidth="1"/>
                  {/* Ocean */}
                  <rect x="0" y="140" width="520" height="60" fill="#030C08"/>
                  {Array.from({length:8},(_,i)=>(
                    <line key={i} x1={i*70} y1={148+i%3*5} x2={i*70+50} y2={148+i%3*5}
                      stroke="#0A2018" strokeWidth="0.6" opacity="0.5"/>
                  ))}
                  {/* Stars */}
                  {Array.from({length:30},(_,i)=>(
                    <circle key={i} cx={((i*137+41)%97)/97*520} cy={((i*79+23)%89)/89*130}
                      r={i%5===0?1.2:0.6} fill="#4A8878" opacity={0.1+(i%5)*0.07}/>
                  ))}
                  {/* Bird silhouette large in scene */}
                  <g transform={`translate(${currentBird?.type==="carrier"?240:200}, ${currentBird?.type==="carrier"?95:75}) scale(2.2)`} filter="url(#birdGlow)">
                    <BirdSilhouette
                      birdId={currentBird?.id || "noddy"}
                      color={BIRD_TYPE_META[currentBird?.type]?.fill || "#00C896"}
                      size={40}
                    />
                  </g>
                  {/* Context text */}
                  <text x="260" y="170" textAnchor="middle" fill="#1A4030"
                    fontSize="10" fontFamily="Georgia,serif" fontStyle="italic">
                    {currentSighting?.context}
                  </text>
                </svg>
              </div>

              {/* Action buttons */}
              <div style={{ width:"min(100%,520px)", display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px",
                pointerEvents:confirming?"none":"auto", opacity:confirming?0.6:1, transition:"opacity 0.3s" }}>
                {actionOptions.map(opt => {
                  const chosen = answers[sightingIdx] === opt.id;
                  const isCorrect = opt.id === currentSighting?.correct;
                  const showResult = chosen;
                  return (
                    <button key={opt.id} onClick={() => handleAction(opt.id)} style={{
                      padding:"14px 12px", borderRadius:"8px", cursor:"pointer",
                      fontFamily:"Cinzel,serif", fontSize:"12px", fontWeight:"700",
                      display:"flex", flexDirection:"column", alignItems:"center", gap:"4px",
                      border:`1px solid ${showResult?(isCorrect?opt.color+"88":"#FF553388"):"#0A2018"}`,
                      background:showResult?(isCorrect?`${opt.color}18`:"rgba(255,85,51,0.08)"):"rgba(255,255,255,0.02)",
                      color:showResult?(isCorrect?opt.color:"#FF6644"):"#2A5040",
                    }}>
                      <span style={{fontSize:"13px"}}>{opt.label}</span>
                      <span style={{fontSize:"8.5px", letterSpacing:"0.08em", opacity:0.7}}>{opt.sub}</span>
                    </button>
                  );
                })}
              </div>

              {/* Wrong answer feedback */}
              {answers[sightingIdx] && answers[sightingIdx] !== currentSighting?.correct && (
                <div style={{ width:"min(100%,520px)", padding:"12px 16px", background:"rgba(255,85,51,0.06)", border:"1px solid #FF553322", borderRadius:"6px", fontFamily:"Georgia,serif", fontSize:"12px", color:"#8A6060", fontStyle:"italic", lineHeight:"1.6" }}>
                  {currentBird?.desc}
                </div>
              )}

            </div>
          )}

          {/* ── STEP 3: COMPLETE ── */}
          {step === 3 && (
            <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"32px" }}>
              <div style={{ textAlign:"center", display:"flex", flexDirection:"column", gap:"16px", maxWidth:"360px" }}>
                <div style={{ fontSize:"48px", opacity:0.8 }}>🐦</div>
                <div style={{ fontFamily:"Cinzel,serif", fontSize:"18px", fontWeight:"700", color:"#3AC890", lineHeight:"1.4" }}>
                  All sightings read.
                </div>
                <div style={{ fontFamily:"Georgia,serif", fontSize:"13px", color:"#6A9888", fontStyle:"italic", lineHeight:"1.7" }}>
                  White tern at dawn. Noddy circling low. The ʻiwa released at the right moment. You have learned to read what flies — and what not to follow.
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   CLOUDS MODULE
══════════════════════════════════════════════════════════════ */

// Cloud signs data — each has an animated SVG scene + question

// Animated SVG scene — different for each sign
function CloudScene({ sceneType, animOffset }) {
  const W = 560, H = 240;

  const clouds = Array.from({length:6}, (_,i) => ({
    x: ((i*137+41) % 97)/97 * W,
    y: 30 + (i*23)%60,
    w: 60 + (i*17)%80,
    h: 18 + (i*11)%22,
    speed: 0.3 + (i*0.13)%0.5,
  }));

  if (sceneType === "stationary_cloud") {
    // All clouds drift right; one central cloud stays fixed
    return (
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width:"100%", borderRadius:"8px" }}>
        <defs>
          <linearGradient id="skyG6" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#060D18"/>
            <stop offset="70%" stopColor="#091824"/>
            <stop offset="100%" stopColor="#0A2030"/>
          </linearGradient>
        </defs>
        <rect width={W} height={H} fill="url(#skyG6)"/>
        {/* Ocean */}
        <rect x={0} y={H*0.72} width={W} height={H*0.28} fill="#041018"/>
        <line x1={0} y1={H*0.72} x2={W} y2={H*0.72} stroke="#0A3040" strokeWidth="1"/>
        {Array.from({length:8},(_,i)=>(
          <path key={i} d={`M${(i*80+animOffset*0.4)%W},${H*0.76+i%3*6} Q${(i*80+animOffset*0.4)%W+25},${H*0.74+i%3*6} ${(i*80+animOffset*0.4)%W+50},${H*0.76+i%3*6}`}
            fill="none" stroke="#0E3848" strokeWidth="0.8" opacity="0.6"/>
        ))}
        {/* Moving clouds */}
        {clouds.map((c,i) => (
          <ellipse key={i}
            cx={((c.x + animOffset * c.speed) % (W+80)) - 40}
            cy={c.y} rx={c.w/2} ry={c.h/2}
            fill="#1A2A38" opacity="0.7"/>
        ))}
        {/* THE stationary cloud — slightly brighter, clear label */}
        <ellipse cx={W/2} cy={55} rx={70} ry={24} fill="#2A3E50" opacity="0.9"/>
        <ellipse cx={W/2 - 28} cy={62} rx={42} ry={18} fill="#243648" opacity="0.85"/>
        <ellipse cx={W/2 + 32} cy={60} rx={50} ry={20} fill="#243648" opacity="0.85"/>
        <text x={W/2} y={44} textAnchor="middle" fill="#7AAAC8" fontSize="9" fontFamily="Cinzel,serif" letterSpacing="0.12em">TU KAPUA</text>
        {/* Island silhouette below */}
        <ellipse cx={W/2} cy={H*0.74} rx={40} ry={8} fill="#0A2020" opacity="0.8"/>
        {/* Vertical dashed line connecting cloud to island */}
        <line x1={W/2} y1={82} x2={W/2} y2={H*0.71} stroke="#4A8A9A" strokeWidth="0.8" strokeDasharray="4,5" opacity="0.4"/>
        <text x={W - 12} y={H - 10} textAnchor="end" fill="#6A9AB8" fontSize="10" fontFamily="Cinzel,serif">ALL OTHER CLOUDS MOVING →</text>
      </svg>
    );
  }

  if (sceneType === "lagoon_glow") {
    const glowAmt = 0.45 + Math.sin(animOffset * 0.04) * 0.2;
    return (
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width:"100%", borderRadius:"8px" }}>
        <defs>
          <linearGradient id="lagoonSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#030810"/>
            <stop offset="100%" stopColor="#061420"/>
          </linearGradient>
          <radialGradient id="lagoonLight" cx="50%" cy="100%" r="55%">
            <stop offset="0%" stopColor="#00C896" stopOpacity={glowAmt * 0.55}/>
            <stop offset="100%" stopColor="#00C896" stopOpacity="0"/>
          </radialGradient>
        </defs>
        <rect width={W} height={H} fill="url(#lagoonSky)"/>
        {/* Ocean — teal near center, dark at edges */}
        <rect x={0} y={H*0.68} width={W} height={H*0.32} fill="#031410"/>
        <rect x={W*0.25} y={H*0.68} width={W*0.5} height={H*0.32} fill="#041C14" opacity="0.8"/>
        <line x1={0} y1={H*0.68} x2={W} y2={H*0.68} stroke="#0A3028" strokeWidth="1"/>
        {/* Lagoon teal water colour */}
        <ellipse cx={W/2} cy={H*0.82} rx={130} ry={26} fill="#00C896" opacity="0.1"/>
        {/* Cloud with glowing underside */}
        <ellipse cx={W/2} cy={85} rx={110} ry={32} fill="#1E3040" opacity="0.9"/>
        <ellipse cx={W/2 - 40} cy={95} rx={70} ry={22} fill="#182838" opacity="0.85"/>
        <ellipse cx={W/2 + 50} cy={92} rx={80} ry={24} fill="#182838" opacity="0.85"/>
        {/* Glow on cloud underside */}
        <ellipse cx={W/2} cy={112} rx={90} ry={14} fill="url(#lagoonLight)" opacity={glowAmt}/>
        <text x={W/2} y={122} textAnchor="middle" fill="#00C896" fontSize="9" fontFamily="Cinzel,serif" opacity={glowAmt * 1.2} letterSpacing="0.1em">LAGOON GLOW</text>
        {/* Dashed line */}
        <line x1={W/2} y1={126} x2={W/2} y2={H*0.66} stroke="#00C896" strokeWidth="0.8" strokeDasharray="4,5" opacity="0.3"/>
        <text x={W-12} y={H-10} textAnchor="end" fill="#2AB870" fontSize="10" fontFamily="Cinzel,serif">CORAL LAGOON BELOW</text>
      </svg>
    );
  }

  if (sceneType === "ocean_colour") {
    const waveOff = animOffset * 0.6;
    return (
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width:"100%", borderRadius:"8px" }}>
        <defs>
          <linearGradient id="oceanColourG" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#041028"/>
            <stop offset="45%"  stopColor="#062040"/>
            <stop offset="65%"  stopColor="#0A3848"/>
            <stop offset="100%" stopColor="#0E4030"/>
          </linearGradient>
          <linearGradient id="skyCG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#04080E"/>
            <stop offset="100%" stopColor="#060C14"/>
          </linearGradient>
        </defs>
        <rect width={W} height={H} fill="url(#skyCG)"/>
        {/* Ocean split — dark left, teal right */}
        <rect x={0} y={H*0.45} width={W} height={H*0.55} fill="url(#oceanColourG)"/>
        <line x1={0} y1={H*0.45} x2={W} y2={H*0.45} stroke="#0A2030" strokeWidth="1"/>
        {/* Colour boundary line */}
        <line x1={W*0.55} y1={H*0.45} x2={W*0.55} y2={H} stroke="#1A8060" strokeWidth="1" strokeDasharray="5,6" opacity="0.5"/>
        {/* Wave texture */}
        {Array.from({length:10},(_,i)=>(
          <path key={i}
            d={`M0,${H*0.5+i*17} Q${95+(waveOff%100)},${H*0.48+i*17} 190,${H*0.5+i*17} Q${285+(waveOff%80)},${H*0.52+i*17} 380,${H*0.5+i*17} Q${475+(waveOff%90)},${H*0.48+i*17} 560,${H*0.5+i*17}`}
            fill="none" stroke="#0E2838" strokeWidth="0.7" opacity="0.5"/>
        ))}
        {/* Labels */}
        <text x={W*0.25} y={H*0.62} textAnchor="middle" fill="#1A3A58" fontSize="9" fontFamily="Cinzel,serif" letterSpacing="0.1em">DEEP OCEAN</text>
        <text x={W*0.25} y={H*0.72} textAnchor="middle" fill="#1A3A58" fontSize="8" fontFamily="Cinzel,serif">dark blue-purple</text>
        <text x={W*0.78} y={H*0.62} textAnchor="middle" fill="#1A7050" fontSize="9" fontFamily="Cinzel,serif" letterSpacing="0.1em">REEF SHELF</text>
        <text x={W*0.78} y={H*0.72} textAnchor="middle" fill="#1A7050" fontSize="8" fontFamily="Cinzel,serif">green-turquoise</text>
        {/* Waka silhouette */}
        <ellipse cx={W*0.18} cy={H*0.47} rx={22} ry={4} fill="#1A2840" opacity="0.9"/>
        <text x={W*0.18} y={H*0.42} textAnchor="middle" fill="#2A5060" fontSize="8" fontFamily="Cinzel,serif">you are here</text>
      </svg>
    );
  }

  // sea_signs — floating debris
  const debrisItems = [
    { x:180, y:0.62, w:18, h:6, label:"pumice",   color:"#4A5848", dx:0.5 },
    { x:310, y:0.70, w:40, h:5, label:"driftwood", color:"#5A4020", dx:0.35 },
    { x:420, y:0.65, w:24, h:8, label:"seaweed",   color:"#1A5030", dx:0.45 },
  ];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width:"100%", borderRadius:"8px" }}>
      <defs>
        <linearGradient id="seaSignSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#04080E"/>
          <stop offset="100%" stopColor="#060E18"/>
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill="url(#seaSignSky)"/>
      <rect x={0} y={H*0.55} width={W} height={H*0.45} fill="#030C14"/>
      <line x1={0} y1={H*0.55} x2={W} y2={H*0.55} stroke="#0A2030" strokeWidth="1"/>
      {Array.from({length:8},(_,i)=>(
        <path key={i} d={`M${(i*80+animOffset*0.4)%W},${H*0.60+i%3*16} Q${(i*80+animOffset*0.4)%W+30},${H*0.58+i%3*16} ${(i*80+animOffset*0.4)%W+60},${H*0.60+i%3*16}`}
          fill="none" stroke="#0A2030" strokeWidth="0.7" opacity="0.5"/>
      ))}
      {/* Debris items with drift arrows */}
      {debrisItems.map((d,i) => (
        <g key={i}>
          <ellipse cx={d.x + (animOffset * d.dx) % 40} cy={H*d.y} rx={d.w/2} ry={d.h/2} fill={d.color} opacity="0.85"/>
          {/* Arrow showing drift direction */}
          <line
            x1={d.x + (animOffset * d.dx) % 40}
            y1={H*d.y}
            x2={d.x + (animOffset * d.dx) % 40 + 28}
            y2={H*d.y - 6}
            stroke="#4A8090" strokeWidth="1.2" strokeDasharray="3,3" opacity="0.6"/>
          <polygon
            points={`${d.x+(animOffset*d.dx)%40+28},${H*d.y-6} ${d.x+(animOffset*d.dx)%40+20},${H*d.y-10} ${d.x+(animOffset*d.dx)%40+20},${H*d.y-2}`}
            fill="#4A8090" opacity="0.6"/>
          <text x={d.x + (animOffset * d.dx) % 40} y={H*d.y - 12}
            textAnchor="middle" fill="#2A5060" fontSize="8" fontFamily="Cinzel,serif">{d.label}</text>
        </g>
      ))}
      {/* Land label in direction of drift */}
      <text x={W - 14} y={H*0.58} textAnchor="end" fill="#1A4050" fontSize="9" fontFamily="Cinzel,serif" letterSpacing="0.1em">LAND UPWIND →</text>
      <text x={W - 14} y={H - 10} textAnchor="end" fill="#0A2030" fontSize="8" fontFamily="Cinzel,serif">watch the direction, not just the debris</text>
    </svg>
  );
}

function CloudsModule({ name, onBack, onOpenBag, unlocked, onComplete, onBridge }) {
  const [phase,      setPhase]     = useState("intro");
  const [step,       setStep]      = useState(1);
  const [answers,    setAnswers]   = useState({});
  const [confirming, setConfirming]= useState(false);
  const [animOffset, setAnimOffset]= useState(0);
  const [learnStep,  setLearnStep] = useState(0);

  // Animate clouds — must be before any early return (Rules of Hooks)
  useEffect(() => {
    let frame;
    const tick = () => { setAnimOffset(o => (o + 0.6) % 1000); frame = requestAnimationFrame(tick); };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  if (phase === "intro") return (
    <ModuleIntroScreen moduleNum={6} name={name}
      onBegin={() => { setLearnStep(0); setPhase("learn"); }}
      onBack={onBack} />
  );
  if (phase === "bridge") return (
    <BridgeScreen moduleNum={6} name={name} unlocked={unlocked} onReturn={onBridge || onBack} />
  );
  if (phase === "done") return (
    <div style={{ width:"100%", height:"100%", background:"#040810", display:"flex", alignItems:"center", justifyContent:"center", padding:"24px" }}>
      <div style={{ maxWidth:"540px", width:"100%", background:"rgba(8,14,28,0.92)", border:"1px solid #0E2040", borderRadius:"12px", padding:"22px 22px 18px", textAlign:"center" }}>
        <div style={{ fontFamily:"Cinzel,serif", fontSize:"10px", color:"#7A9EC8", letterSpacing:"0.18em", marginBottom:"10px" }}>MODULE 6 COMPLETE</div>
        <div style={{ fontFamily:"Cinzel,serif", fontSize:"22px", fontWeight:"800", color:"#E8D8A8", lineHeight:"1.2", marginBottom:"10px" }}>You can read the approach.</div>
        <div style={{ fontFamily:"Georgia,serif", fontSize:"14px", color:"#7AACBE", lineHeight:"1.75", fontStyle:"italic", marginBottom:"16px" }}>
          "Standing cloud, lagoon glow, water colour, floating debris — together they form an approach map drawn by the ocean itself."
        </div>
        <button
          type="button"
          onClick={() => { onComplete(); setPhase("bridge"); }}
          style={{ padding:"12px 18px", borderRadius:"6px", cursor:"pointer", fontFamily:"Cinzel,serif", fontSize:"11px", fontWeight:"800", letterSpacing:"0.12em", border:"1px solid #7A9EC8", background:"rgba(122,158,200,0.14)", color:"#7A9EC8" }}
        >
          CONTINUE →
        </button>
      </div>
    </div>
  );
  if (phase === "learn") {
    const concepts = MODULE_CONTENT[6].learn.concepts;
    const concept  = concepts[learnStep];
    const isLast   = learnStep === concepts.length - 1;
    const accent   = "#7A9EC8";
    const dep      = MODULE_CONTENT[6].departure;

    return (
      <div style={{ width:"100%", height:"100%", background:"#060E08", display:"flex", flexDirection:"column", overflow:"hidden" }}>
        {/* Header */}
        <div style={{ height:"44px", borderBottom:`1px solid ${accent}33`, background:"rgba(6,14,8,0.96)", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 22px", flexShrink:0 }}>
          <span style={{ fontFamily:"Cinzel,serif", fontSize:"12px", fontWeight:"700", color:"#C8941A", letterSpacing:"0.12em" }}>OCEAN ADVENTURE</span>
          <span style={{ fontFamily:"Cinzel,serif", fontSize:"10.5px", color:accent, letterSpacing:"0.09em", opacity:0.8 }}>HAUMĀNA · {name.toUpperCase()}</span>
        </div>
        {/* Location bar */}
        <div style={{ padding:"7px 22px", borderBottom:`1px solid ${accent}22`, background:"rgba(4,10,6,0.7)", flexShrink:0, display:"flex", alignItems:"center", gap:"14px" }}>
          <span style={{ fontFamily:"Cinzel,serif", fontSize:"9.5px", color:accent, letterSpacing:"0.16em", opacity:0.9 }}>ON SHORE · {dep.location.toUpperCase()}</span>
          <span style={{ fontFamily:"Georgia,serif", fontSize:"9px", color:`${accent}66`, fontStyle:"italic" }}>{dep.note}</span>
        </div>
        {/* Body */}
        <div style={{ flex:1, display:"flex", overflow:"hidden", minHeight:0 }}>
          {/* Left panel */}
          <div style={{ width:"320px", flexShrink:0, borderRight:`1px solid ${accent}18`, overflowY:"auto", background:"rgba(4,10,6,0.85)", display:"flex", flexDirection:"column" }}>
            <div style={{ padding:"22px 20px", display:"flex", flexDirection:"column", gap:"16px", flex:1 }}>
              {/* Nav */}
              <div style={{ display:"flex", gap:"8px" }}>
                <button type="button" onClick={onBack} style={{ flex:1, background:"none", border:`1px solid ${accent}22`, borderRadius:"4px", color:"#2A3A28", fontSize:"9.5px", fontFamily:"Cinzel,serif", letterSpacing:"0.1em", padding:"8px", cursor:"pointer" }}>← MAP</button>
                <button type="button" onClick={onOpenBag} style={{ flex:1, background:unlocked.length>0?"rgba(200,148,26,0.10)":"none", border:`1px solid ${unlocked.length>0?"#C8941A55":accent+"22"}`, borderRadius:"4px", color:unlocked.length>0?"#C8941A":"#2A3A28", fontSize:"9.5px", fontFamily:"Cinzel,serif", letterSpacing:"0.1em", padding:"8px", cursor:"pointer" }}>
                  {unlocked.length>0 ? `✦ BAG (${unlocked.length})` : "✦ BAG"}
                </button>
              </div>
              {/* Step dots */}
              <div style={{ display:"flex", gap:"6px", alignItems:"center" }}>
                {concepts.map((_,i) => (
                  <div key={i} onClick={() => i < learnStep && setLearnStep(i)} style={{ width:i===learnStep?"18px":"7px", height:"7px", borderRadius:"4px", background:i===learnStep?accent:i<learnStep?"#2A8860":"#1A2820", cursor:i<learnStep?"pointer":"default", transition:"all 0.25s" }}/>
                ))}
                <span style={{ fontFamily:"Cinzel,serif", fontSize:"9px", color:"#2A3A28", marginLeft:"4px" }}>{learnStep+1}/{concepts.length}</span>
              </div>
              {/* Heading */}
              <div style={{ fontFamily:"Cinzel,serif", fontSize:"19px", fontWeight:"700", color:accent, lineHeight:"1.3" }}>
                {concept.heading}
              </div>
              {/* Body */}
              <div style={{ fontFamily:"Georgia,serif", fontSize:"16px", color:"#7AACBE", lineHeight:"1.82", fontStyle:"italic", borderLeft:`2px solid ${accent}44`, paddingLeft:"16px" }}>
                {concept.body}
              </div>
              {learnStep === concepts.length - 1 && MODULE_CONTENT[6].navigatorFact && (
                <div style={{
                  background: "rgba(200,148,26,0.06)",
                  border: "1px solid rgba(200,148,26,0.18)",
                  borderRadius: "7px",
                  padding: "14px 16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                }}>
                  <div style={{ fontFamily:"Cinzel,serif", fontSize:"9px", color:"#C8941A", letterSpacing:"0.16em", opacity:0.8 }}>
                    NAVIGATOR'S FACT
                  </div>
                  <div style={{ fontFamily:"Georgia,serif", fontSize:"13px", color:"#A8C8B0", fontStyle:"italic", lineHeight:"1.7" }}>
                    {MODULE_CONTENT[6].navigatorFact}
                  </div>
                </div>
              )}
              {/* Prev / Next / Activity */}
              <div style={{ display:"flex", gap:"8px", marginTop:"auto" }}>
                {learnStep > 0 && (
                  <button type="button" onClick={() => setLearnStep(i=>i-1)} style={{ flex:1, padding:"11px", borderRadius:"6px", cursor:"pointer", fontFamily:"Cinzel,serif", fontSize:"10px", fontWeight:"700", letterSpacing:"0.1em", border:`1px solid ${accent}33`, background:"none", color:`${accent}88` }}>← PREV</button>
                )}
                {!isLast ? (
                  <button type="button" onClick={() => setLearnStep(i=>i+1)} style={{ flex:1, padding:"11px", borderRadius:"6px", cursor:"pointer", fontFamily:"Cinzel,serif", fontSize:"10px", fontWeight:"700", letterSpacing:"0.12em", border:`1px solid ${accent}`, background:`${accent}18`, color:accent }}>NEXT →</button>
                ) : (
                  <button type="button" onClick={() => setPhase("activity")} style={{ flex:1, padding:"11px", borderRadius:"6px", cursor:"pointer", fontFamily:"Cinzel,serif", fontSize:"11px", fontWeight:"700", letterSpacing:"0.12em", border:`1px solid ${accent}`, background:`linear-gradient(135deg,${accent}22,${accent}0A)`, color:accent }}>READ THE SKY →</button>
                )}
              </div>
            </div>
          </div>
          {/* Right — concept illustration placeholder */}
          <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"24px", background:"rgba(4,10,5,0.4)" }}>
            <div style={{ width:"min(100%,500px)", display:"flex", flexDirection:"column", gap:"16px" }}>
              <svg viewBox="0 0 500 280" style={{ width:"100%", borderRadius:"8px", background:"#04080E" }}>
                <defs>
                  <linearGradient id="cloudLearnSky" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#04080E"/><stop offset="100%" stopColor="#071424"/>
                  </linearGradient>
                </defs>
                <rect width="500" height="280" fill="url(#cloudLearnSky)"/>
                {/* Moving clouds */}
                {[{x:60,y:60,w:90,h:26},{x:300,y:45,w:110,h:30},{x:170,y:80,w:70,h:20}].map((c,i)=>(
                  <ellipse key={i} cx={c.x} cy={c.y} rx={c.w/2} ry={c.h/2} fill="#182838" opacity="0.7"/>
                ))}
                {/* Arrow showing clouds moving */}
                <text x="420" y="75" fill="#1A3040" fontSize="9" fontFamily="Cinzel,serif" letterSpacing="0.1em">→ moving</text>
                {/* Tu Kapua — stationary cloud */}
                <ellipse cx="250" cy="70" rx="80" ry="28" fill="#2A3E50" opacity="0.92"/>
                <ellipse cx="220" cy="80" rx="50" ry="20" fill="#223040" opacity="0.85"/>
                <ellipse cx="284" cy="78" rx="58" ry="22" fill="#223040" opacity="0.85"/>
                {/* Glow on Tu Kapua */}
                <ellipse cx="250" cy="96" rx="65" ry="10" fill="rgba(122,158,200,0.15)"/>
                <text x="250" y="55" textAnchor="middle" fill="#7A9EC8" fontSize="10" fontFamily="Cinzel,serif" letterSpacing="0.1em">TU KAPUA — STATIONARY</text>
                {/* Dashed line down */}
                <line x1="250" y1="100" x2="250" y2="215" stroke="#7A9EC8" strokeWidth="1" strokeDasharray="5,5" opacity="0.4"/>
                {/* Ocean */}
                <rect x="0" y="215" width="500" height="65" fill="#030C10"/>
                <line x1="0" y1="215" x2="500" y2="215" stroke="#0A3028" strokeWidth="1"/>
                {/* Island */}
                <ellipse cx="250" cy="220" rx="42" ry="12" fill="#0A2018" stroke="#2A5040" strokeWidth="1.5"/>
                <text x="250" y="223" textAnchor="middle" fill="#3A7050" fontSize="9" fontFamily="Cinzel,serif">ISLAND BELOW</text>
                {/* Lagoon glow */}
                <ellipse cx="250" cy="240" rx="90" ry="20" fill="rgba(0,200,150,0.07)"/>
                <text x="250" y="265" textAnchor="middle" fill="#008060" fontSize="9" fontFamily="Cinzel,serif" letterSpacing="0.1em">lagoon glow · turquoise tint</text>
              </svg>
              <div style={{ fontFamily:"Cinzel,serif", fontSize:"10px", color:"#2A4060", textAlign:"center", letterSpacing:"0.1em" }}>
                TU KAPUA VISIBLE 50+ KM · LAGOON GLOW VISIBLE BEFORE ATOLL CRESTS HORIZON
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const signIdx   = Math.min(step - 1, CLOUD_SIGNS.length - 1);
  const sign      = CLOUD_SIGNS[signIdx];
  const answered  = answers[signIdx];
  const isCorrect = answered && sign.options.find(o => o.id === answered)?.correct;

  const handleAnswer = optId => {
    if (confirming || answered) return;
    const correct = sign.options.find(o => o.id === optId)?.correct;
    setAnswers(prev => ({ ...prev, [signIdx]: optId }));
    if (correct) {
      setConfirming(true);
      const isLast = signIdx === CLOUD_SIGNS.length - 1;
      setTimeout(() => {
        setConfirming(false);
        if (isLast) { setPhase("done"); }
        else setStep(s => s + 1);
      }, 1800);
    }
  };

  // Palu speech
  const paluSpeeches = {
    0: { title: `E ${name}. Look up.`, body: "The sky reads the ocean beneath it. Every navigator who found land in this ocean learned to read clouds first — before the shore was visible, before the birds appeared. We are heading home to Tonga. These signs will bring us in safely." },
    1: { title: "Now the water itself speaks.", body: "Light moves through water. The deeper the ocean, the darker and bluer it reads. When the colour changes, the floor has risen — land is near." },
    2: { title: "Not all signs are in the sky.", body: "The ocean surface carries everything that has fallen into it upstream. Pumice from volcanoes. Driftwood from forests. Seaweed from reefs. Read what the current has carried." },
    3: { title: "One more sign.", body: "Kupe taught this one: a cloud that sits still while all the others move is standing on land. He used it to find Aotearoa. We can use it to find the low-lying atolls of Tonga, still invisible below the horizon." },
    4: { title: "You can read the approach.", body: "Standing cloud, lagoon glow, water colour, floating debris — each one a layer of knowledge. Together they form an approach map drawn by the ocean itself. Home is close." },
  };
  const speech = paluSpeeches[Math.min(step - 1, 4)];

  const stepLabels = CLOUD_SIGNS.map((_, i) => `${i+1}`).concat(["✦"]);
  const accent     = "#7A9EC8";

  return (
    <div style={{ width:"100%", height:"100%", background:"#040810", display:"flex", flexDirection:"column", overflow:"hidden" }}>

      {/* Header */}
      <div style={{ height:"44px", borderBottom:"1px solid #0A1428", background:"rgba(4,8,18,0.97)", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 22px", flexShrink:0 }}>
        <span style={{ fontFamily:"Cinzel,serif", fontSize:"12px", fontWeight:"700", color:"#C8941A", letterSpacing:"0.12em" }}>OCEAN ADVENTURE</span>
        <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
          <span style={{ fontFamily:"Cinzel,serif", fontSize:"10.5px", color:accent, letterSpacing:"0.09em" }}>HAUMĀNA · {name.toUpperCase()}</span>
          <button
            type="button"
            onClick={onOpenBag}
            style={{ background:unlocked.length>0?"rgba(200,148,26,0.10)":"none", border:`1px solid ${unlocked.length>0?"#C8941A55":"#0A1428"}`, borderRadius:"5px", padding:"5px 10px", cursor:"pointer", fontFamily:"Cinzel,serif", fontSize:"10px", color:unlocked.length>0?"#C8941A":"#7AACBE", letterSpacing:"0.08em" }}
          >
            {unlocked.length>0 ? `✦ BAG (${unlocked.length})` : "✦ BAG"}
          </button>
        </div>
      </div>

      {/* Module bar */}
      <div style={{ padding:"7px 22px", borderBottom:"1px solid #0A1428", background:"rgba(4,8,18,0.6)", flexShrink:0 }}>
        <span style={{ fontFamily:"Cinzel,serif", fontSize:"10.5px", color:accent, letterSpacing:"0.16em" }}>MODULE 6 · KAPUA ME TE MOANA</span>
        <span style={{ fontFamily:"Cinzel,serif", fontSize:"10.5px", color:"#7AACBE", marginLeft:"14px", letterSpacing:"0.1em" }}>CLOUDS, SEA SIGNS & KUPE'S INSTRUCTIONS</span>
      </div>

      {/* Body */}
      <div style={{ flex:1, display:"flex", overflow:"hidden", minHeight:0 }}>

        {/* Left panel */}
        <div style={{ width:"320px", flexShrink:0, borderRight:"1px solid #0A1428", overflowY:"auto" }}>
          <div style={{ display:"flex", flexDirection:"column", gap:"12px", padding:"18px", boxSizing:"border-box" }}>

            <button type="button" onClick={onBack} style={{ width:"100%", background:"none", border:"1px solid #0A1428", borderRadius:"4px", color:"#7AACBE", fontSize:"10px", fontFamily:"Cinzel,serif", letterSpacing:"0.1em", padding:"8px", cursor:"pointer" }}>← MAP</button>

            {/* Scenario card */}
            <div style={{ background:"rgba(8,14,28,0.85)", border:"1px solid #0E2040", borderRadius:"7px", padding:"12px 14px" }}>
              <div style={{ fontSize:"9px", letterSpacing:"0.18em", color:"#1A2A40", fontFamily:"Cinzel,serif", marginBottom:"5px" }}>DAY 16 · APPROACHING LAND</div>
              <div style={{ fontSize:"14px", color:accent, fontFamily:"Cinzel,serif", fontWeight:"700", marginBottom:"2px" }}>Read the Sky</div>
              <div style={{ fontSize:"10.5px", color:"#2A3A58", fontFamily:"Cinzel,serif" }}>Four signs before landfall</div>
            </div>

            {/* Step indicators */}
            <div style={{ display:"flex", gap:"4px" }}>
              {stepLabels.map((label, i) => {
                const done = i < step - 1, curr = i === step - 1;
                return <div key={i} style={{ flex:1, textAlign:"center", padding:"6px 2px", fontSize:"10px", fontFamily:"Cinzel,serif", background:curr?`rgba(122,158,200,0.18)`:done?"rgba(26,120,110,0.18)":"rgba(255,255,255,0.03)", border:`1px solid ${curr?accent:done?"#1A8870":"#0E2030"}`, borderRadius:"5px", color:curr?accent:done?"#2BB5A0":"#7AACBE" }}>{label}</div>;
              })}
            </div>

            {/* Palu speech */}
            <div style={{ background:"rgba(4,8,20,0.7)", border:"1px solid #0E1E34", borderRadius:"7px", padding:"16px", display:"flex", flexDirection:"column", gap:"10px" }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}><div style={{ fontSize:"11px", color:"#1A2A40", fontFamily:"Cinzel,serif", letterSpacing:"0.14em" }}>THE PALU SPEAKS</div><span style={{ fontSize:"16px", opacity:0.75 }}>🦜</span></div>
              <div style={{ fontSize:"20px", color:"#D0A838", fontFamily:"Cinzel,serif", fontWeight:"700", lineHeight:"1.4" }}>{speech.title}</div>
              <div style={{ fontSize:"15px", color:"#7AACBE", fontFamily:"Georgia,serif", fontStyle:"italic", lineHeight:"1.75" }}>{speech.body}</div>

              {/* Sign explanation — shows after correct answer */}
              {answered && isCorrect && step <= CLOUD_SIGNS.length && (
                <div style={{ padding:"10px 12px", background:`rgba(122,158,200,0.10)`, border:`1px solid ${accent}33`, borderRadius:"5px", fontSize:"11px", color:"#6A9AB8", fontFamily:"Georgia,serif", fontStyle:"italic", lineHeight:"1.6" }}>
                  {sign.explanation}
                </div>
              )}

              {step > CLOUD_SIGNS.length && (
                <div style={{ padding:"11px", background:"rgba(122,158,200,0.10)", border:`1px solid ${accent}33`, borderRadius:"6px", textAlign:"center", fontFamily:"Cinzel,serif", fontSize:"10px", color:accent, letterSpacing:"0.09em" }}>
                  ☁ CLOUD & SEA READER ADDED TO YOUR BAG ☁
                </div>
              )}
            </div>

            {step > CLOUD_SIGNS.length && (
              <button onClick={onBack} style={{ padding:"11px", borderRadius:"6px", fontFamily:"Cinzel,serif", fontSize:"10px", fontWeight:"700", letterSpacing:"0.12em", cursor:"pointer", border:`1px solid ${accent}`, background:`rgba(122,158,200,0.10)`, color:accent }}>
                RETURN TO THE OCEAN →
              </button>
            )}

          </div>
        </div>

        {/* Right — scene + question */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
          {step <= CLOUD_SIGNS.length ? (
            <div style={{ flex:1, display:"flex", flexDirection:"column", padding:"20px 24px", gap:"14px", overflowY:"auto" }}>

              {/* Sign title */}
              <div style={{ fontFamily:"Cinzel,serif", fontSize:"13px", fontWeight:"700", color:accent, letterSpacing:"0.06em" }}>
                {sign.title}
              </div>

              {/* Animated scene */}
              <CloudScene sceneType={sign.sceneType} animOffset={animOffset} />

              {/* Question */}
              <div style={{ fontFamily:"Georgia,serif", fontSize:"13px", color:"#7AACBE", lineHeight:"1.65", fontStyle:"italic" }}>
                {sign.question}
              </div>

              {/* Answer buttons */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px",
                pointerEvents:confirming?"none":"auto", opacity:confirming?0.6:1, transition:"opacity 0.3s" }}>
                {sign.options.map(opt => {
                  const chosen = answered === opt.id;
                  const right  = chosen && opt.correct;
                  const wrong  = chosen && !opt.correct;
                  return (
                    <button key={opt.id} onClick={() => handleAnswer(opt.id)} style={{
                      padding:"13px 10px", borderRadius:"7px", cursor:"pointer",
                      fontFamily:"Cinzel,serif", fontSize:"11.5px", fontWeight:"600",
                      textAlign:"center", lineHeight:"1.4",
                      border:`1px solid ${right?"#7AAAC8":wrong?"#FF5533":answered?"#0A1828":"#0E2040"}`,
                      background:right?"rgba(122,170,200,0.14)":wrong?"rgba(255,85,51,0.08)":"rgba(255,255,255,0.02)",
                      color:right?accent:wrong?"#FF6644":answered?"#1A2A40":"#3A5878",
                    }}>
                      {opt.text}
                    </button>
                  );
                })}
              </div>

              {/* Wrong answer hint */}
              {answered && !isCorrect && (
                <div style={{ padding:"10px 14px", background:"rgba(255,85,51,0.06)", border:"1px solid #FF553322", borderRadius:"6px", fontFamily:"Georgia,serif", fontSize:"11.5px", color:"#7A5050", fontStyle:"italic", lineHeight:"1.6" }}>
                  {sign.explanation}
                </div>
              )}

            </div>
          ) : (
            <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"32px" }}>
              <div style={{ textAlign:"center", display:"flex", flexDirection:"column", gap:"16px", maxWidth:"380px" }}>
                <div style={{ fontSize:"48px", opacity:0.7 }}>☁</div>
                <div style={{ fontFamily:"Cinzel,serif", fontSize:"18px", fontWeight:"700", color:accent, lineHeight:"1.4" }}>All four signs read.</div>
                <div style={{ fontFamily:"Georgia,serif", fontSize:"13px", color:"#5A8090", fontStyle:"italic", lineHeight:"1.7" }}>
                  Standing cloud. Lagoon glow. Water colour. The drift of debris. You can now read the approach to any island — from 50 kilometres out — without instruments.
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   WELCOME SCREEN
══════════════════════════════════════════════════════════════ */

function WelcomeScreen({ onSubmit }) {
  const [input, setInput] = useState("");
  const stars = Array.from({ length: 100 }, (_, i) => ({ x: ((i*137+41)%97)/97*100, y: ((i*79+23)%89)/89*100, r: i%7===0?1.6:i%3===0?1.0:0.6, op: 0.2+(i%6)*0.09 }));

  return (
    <div style={{ width: "100%", height: "100%", background: "#04070E", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
        {stars.map((s, i) => <circle key={i} cx={`${s.x}%`} cy={`${s.y}%`} r={s.r} fill="#7AACCC" opacity={s.op} />)}
        <circle cx="50%" cy="50%" r="350" fill="none" stroke="rgba(30,60,100,0.10)" strokeWidth="1" />
      </svg>
      <div style={{ zIndex: 1, textAlign: "center", padding: "32px 24px", maxWidth: "520px", display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
        <div style={{ fontSize: "10px", letterSpacing: "0.32em", color: "#354A60", fontFamily: "Cinzel,serif" }}>A POLYNESIAN VOYAGING EXPERIENCE</div>
        <div>
          <div style={{ fontSize: "48px", fontFamily: "Cinzel,serif", fontWeight: "900", color: "#C8941A", lineHeight: "1.0", textShadow: "0 0 60px rgba(200,148,26,0.3)" }}>Ocean</div>
          <div style={{ fontSize: "48px", fontFamily: "Cinzel,serif", fontWeight: "900", color: "#C8941A", lineHeight: "1.1", textShadow: "0 0 60px rgba(200,148,26,0.3)" }}>Adventure</div>
        </div>
        <div style={{ width: "52px", height: "1px", background: "linear-gradient(to right, transparent, #C8941A, transparent)" }} />
        <div style={{ fontSize: "14px", color: "#7AABBB", fontFamily: "Georgia,serif", fontStyle: "italic", lineHeight: "1.72", maxWidth: "400px" }}>
          Do you have what it takes to become an expert navigator?
        </div>
        <div style={{ fontFamily:"Georgia,serif", fontSize:"12px", color:"#2A4050", lineHeight:"1.65", fontStyle:"italic", maxWidth:"380px", textAlign:"center" }}>
          This experience is inspired by the voyaging traditions of the Pacific — and by the work of Mau Piailug, Nainoa Thompson, and the navigators of the Polynesian Voyaging Society who revived them.
        </div>
        <div style={{ width: "100%", background: "rgba(8,14,28,0.88)", border: "1px solid #1E3050", borderRadius: "10px", padding: "24px 26px", display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <div style={{ fontSize: "13px", color: "#D0A840", fontFamily: "Cinzel,serif", fontWeight: "700", marginBottom: "4px" }}>Ko wai tō ingoa, haumāna?</div>
            <div style={{ fontSize: "11px", color: "#5A8090", fontFamily: "Cinzel,serif", letterSpacing: "0.04em" }}>What is your name, apprentice?</div>
          </div>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key==="Enter"&&input.trim()&&onSubmit(input.trim())} placeholder="Enter your name…" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid #253550", borderRadius: "5px", padding: "11px 14px", color: "#EEE5C8", fontSize: "14px", fontFamily: "Cinzel,serif", outline: "none", width: "100%", boxSizing: "border-box" }} />
          <button onClick={() => input.trim()&&onSubmit(input.trim())} style={{ background: "linear-gradient(135deg,#C8941A,#9A7010)", border: "none", borderRadius: "5px", padding: "12px", color: "#050810", fontSize: "12px", fontFamily: "Cinzel,serif", fontWeight: "800", letterSpacing: "0.14em", cursor: "pointer", textTransform: "uppercase" }}>Begin the Voyage →</button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   STORY CARD — intro narrative after name entry
══════════════════════════════════════════════════════════════ */


function PaluPortrait() {
  return (
    <svg viewBox="0 0 140 160" style={{ width:"100%", height:"100%", borderRadius:"10px" }}>
      <rect width="140" height="160" fill="#060E18" rx="8"/>
      <circle cx="14" cy="8" r="0.9" fill="#C8D8E8" opacity="0.5"/>
      <circle cx="120" cy="14" r="0.7" fill="#C8D8E8" opacity="0.4"/>
      <circle cx="130" cy="30" r="0.8" fill="#C8D8E8" opacity="0.45"/>
      {/* teal bg panel — lifts figure off dark background */}
      <ellipse cx="70" cy="80" rx="45" ry="48" fill="#071820"/>
      {/* body */}
      <ellipse cx="70" cy="150" rx="46" ry="24" fill="#181008"/>
      <ellipse cx="70" cy="143" rx="38" ry="19" fill="#201808"/>
      <rect x="60" y="108" width="20" height="22" rx="7" fill="#8A6038"/>
      {/* head */}
      <path d="M38,76 Q38,52 54,41 Q70,32 86,41 Q102,52 102,76 Q102,106 88,114 Q70,120 52,114 Q38,106 38,76Z" fill="#8A6038"/>
      {/* hair — medium brown, clearly distinct from background */}
      <path d="M38,74 Q36,50 54,39 Q70,30 86,39 Q104,50 102,74" fill="#3A2A18" opacity="0.98"/>
      <path d="M38,74 Q30,54 38,74Z" fill="#3A2A18" opacity="0.9"/>
      <path d="M102,74 Q110,54 102,74Z" fill="#3A2A18" opacity="0.9"/>
      {/* hair edge — separates from background */}
      <path d="M38,74 Q36,50 54,39 Q70,30 86,39 Q104,50 102,74" fill="none" stroke="#4A3A28" strokeWidth="1" opacity="0.6"/>
      {/* silver streak */}
      <path d="M52,44 Q54,55 50,72" stroke="#9AAAA8" strokeWidth="1.5" fill="none" opacity="0.45"/>
      {/* eyes */}
      <ellipse cx="57" cy="77" rx="4.5" ry="3.8" fill="#150B04"/>
      <ellipse cx="83" cy="77" rx="4.5" ry="3.8" fill="#150B04"/>
      <circle cx="56" cy="76" r="1.3" fill="#FFFFFF" opacity="0.85"/>
      <circle cx="82" cy="76" r="1.3" fill="#FFFFFF" opacity="0.85"/>
      {/* brows */}
      <path d="M52,70 Q57,68 63,70" stroke="#6A4828" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M77,70 Q83,68 88,70" stroke="#6A4828" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      {/* cheekbones */}
      <ellipse cx="47" cy="84" rx="7" ry="4" fill="#9A6838" opacity="0.3"/>
      <ellipse cx="93" cy="84" rx="7" ry="4" fill="#9A6838" opacity="0.3"/>
      {/* nose */}
      <path d="M68,80 L68,91" stroke="#7A5030" strokeWidth="1.3" fill="none" opacity="0.55"/>
      <path d="M64,93 Q70,96 76,93" stroke="#7A5030" strokeWidth="1.1" fill="none" opacity="0.6"/>
      {/* mouth */}
      <path d="M62,101 Q70,105 78,101" stroke="#6A3010" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
      {/* tattoo lines on chin */}
      <path d="M64,110 L65,118" stroke="#4A7858" strokeWidth="1.2" opacity="0.7"/>
      <path d="M70,111 L70,119" stroke="#4A7858" strokeWidth="1.2" opacity="0.7"/>
      <path d="M76,110 L75,118" stroke="#4A7858" strokeWidth="1.2" opacity="0.7"/>
      {/* necklace */}
      <path d="M56,117 Q70,129 84,117" stroke="#C8941A" strokeWidth="1.5" fill="none" opacity="0.75"/>
      <rect x="67" y="126" width="6" height="4" rx="1" fill="#C8941A" opacity="0.65"/>
      <text x="70" y="154" textAnchor="middle" fontFamily="Cinzel,serif" fontSize="7" fill="#C8941A" opacity="0.8" letterSpacing="0.1em">PALU HEMI</text>
    </svg>
  );
}

function StoryCard({ name, onComplete, onUnlockItem = () => {} }) {
  const [pageIdx,  setPageIdx]  = useState(0);
  const [revealed, setRevealed] = useState(0);
  const [choice,   setChoice]   = useState(null);

  const pages = STORY_PAGES(name);
  const page  = pages[pageIdx];
  const isLast = pageIdx === pages.length - 1;

  useEffect(() => {
    const timers = page.text.map((_, i) =>
      setTimeout(() => setRevealed(r => Math.max(r, i + 1)), 350 + i * 1100)
    );
    return () => timers.forEach(clearTimeout);
  }, [pageIdx]);

  const allRevealed = revealed >= page.text.length;

  const handleNext = () => {
    if (!allRevealed) { setRevealed(page.text.length); return; }
    if (isLast) return;
    if (pageIdx === 1 && onUnlockItem) onUnlockItem("sweet_potato_seeds");
    setRevealed(0);
    setPageIdx(p => p + 1);
    setChoice(null);
  };

  const handleBack = () => {
    if (pageIdx === 0) return;
    setRevealed(pages[pageIdx - 1].text.length);
    setPageIdx(p => p - 1);
    setChoice(null);
  };

  const handleDotClick = (i) => {
    if (i > pageIdx) return;
    setRevealed(pages[i].text.length);
    setPageIdx(i);
    setChoice(null);
  };

  const handleChoice = (c) => {
    setChoice(c.id);
    if (c.advance && !c.joke) setTimeout(() => onComplete(), 600);
  };

  const isMatala = page.id === "matala";
  const stars = Array.from({length:60},(_,i)=>({ x:((i*137+41)%97)/97*100, y:((i*79+23)%89)/89*100, r:i%5===0?1.1:0.5, op:0.08+(i%5)*0.06 }));

  return (
    <div style={{ width:"100%", height:"100%", background:"#04080E", display:"flex", alignItems:"center", justifyContent:"center", position:"relative", overflow:"hidden" }}>

      {/* Star field */}
      <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none" }}>
        {stars.map((s,i) => <circle key={i} cx={`${s.x}%`} cy={`${s.y}%`} r={s.r} fill="#7AACCC" opacity={s.op}/>)}
      </svg>

      {/* Card */}
      <div style={{ position:"relative", zIndex:1, width:"min(680px, 95%)", background:"rgba(6,12,22,0.96)", border:"1px solid #1A3050", borderRadius:"14px", overflow:"hidden", boxShadow:"0 0 80px rgba(200,148,26,0.08)" }}>

        {/* Progress dots */}
        <div style={{ display:"flex", justifyContent:"center", gap:"10px", padding:"16px 0 0" }}>
          {pages.map((_,i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to page ${i + 1}`}
              aria-current={i === pageIdx ? "page" : undefined}
              disabled={i > pageIdx}
              onClick={() => handleDotClick(i)}
              style={{
              width: i === pageIdx ? "20px" : "8px", height:"8px", borderRadius:"4px",
              background: i === pageIdx ? "#C8941A" : i < pageIdx ? "#2A8860" : "#1A2840",
              transition:"all 0.3s", cursor: i <= pageIdx ? "pointer" : "default",
              border:"none",
              padding:0,
              margin:0,
            }}
            />
          ))}
        </div>

        {/* Location tag */}
        <div style={{ textAlign:"center", padding:"10px 0 0", fontFamily:"Cinzel,serif", fontSize:"9px", color:"#2A4060", letterSpacing:"0.2em" }}>
          {page.location.toUpperCase()}
        </div>

        {/* Main content row */}
        <div style={{ display:"flex", gap:"0", minHeight:"340px" }}>

          {/* Left — portrait */}
          <div style={{ width:"180px", flexShrink:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"20px 16px", borderRight:"1px solid #0E1E30", gap:"12px" }}>
            <div style={{ width:"140px", height:"160px", borderRadius:"10px", overflow:"hidden", border:"1px solid #1A3040", display:"flex", alignItems:"center", justifyContent:"center" }}>
              {isMatala
                ? <div style={{ fontSize:"80px", lineHeight:1, filter:"drop-shadow(0 0 12px rgba(200,148,26,0.5))" }}>🦜</div>
                : <PaluPortrait />}
            </div>
            <div style={{ textAlign:"center" }}>
              <div style={{ fontFamily:"Cinzel,serif", fontSize:"11px", fontWeight:"700", color: isMatala ? "#2AB870" : "#C8941A" }}>
                {page.speaker}
              </div>
              <div style={{ fontFamily:"Cinzel,serif", fontSize:"9px", color:"#2A4050", letterSpacing:"0.06em", marginTop:"3px" }}>
                {isMatala ? "Palu's Parrot · Tongatapu" : "Master Navigator · Tongatapu"}
              </div>
            </div>
          </div>

          {/* Right — text */}
          <div style={{ flex:1, padding:"20px 24px 20px", display:"flex", flexDirection:"column", justifyContent:"space-between", gap:"16px", position:"relative" }}>
            {!isMatala && <div style={{ position:"absolute", top:"12px", right:"16px", fontSize:"22px", opacity:0.85, lineHeight:1, filter:"drop-shadow(0 0 6px rgba(200,148,26,0.4))" }}>🦜</div>}
            <div key={pageIdx} style={{ display:"flex", flexDirection:"column", gap:"14px" }}>
              {page.text.map((line, i) => (
                <p key={i} style={{
                  fontFamily:"Georgia,serif", fontSize:"17px",
                  color: isMatala ? "#80D8A0" : "#A8C8C0",
                  lineHeight:"1.72", fontStyle:"italic", margin:0,
                  opacity: i < revealed ? 1 : 0,
                  transform: i < revealed ? "translateY(0)" : "translateY(6px)",
                  transition:"opacity 0.5s ease, transform 0.5s ease",
                }}>
                  "{line}"
                </p>
              ))}
            </div>

            {/* Choices or navigation buttons */}
            <div style={{ paddingTop:"12px", borderTop:"1px solid #0E1E30", display:"flex", gap:"8px", flexWrap:"wrap" }}>
              {/* Back button — always show if not first page */}
              {pageIdx > 0 && (
                <button onClick={handleBack} style={{
                  padding:"10px 18px", borderRadius:"6px", cursor:"pointer",
                  fontFamily:"Cinzel,serif", fontSize:"10px", fontWeight:"700", letterSpacing:"0.1em",
                  border:"1px solid #1A3050", background:"none", color:"#3A5060",
                }}>← Back</button>
              )}
              {isLast && allRevealed && page.choices ? (
                <div style={{ display:"flex", flexDirection:"column", gap:"8px", flex:1 }}>
                  {page.choices.map(c => (
                    <button key={c.id} onClick={() => handleChoice(c)} style={{
                      padding:"12px 18px", borderRadius:"6px", cursor:"pointer",
                      fontFamily:"Cinzel,serif", fontSize:"11px", fontWeight:"700", letterSpacing:"0.08em",
                      textAlign:"left",
                      border:`1px solid ${choice===c.id && !c.joke ? "#C8941A" : "#1A3050"}`,
                      background: choice===c.id && !c.joke ? "rgba(200,148,26,0.14)" : "rgba(255,255,255,0.02)",
                      color: choice===c.id && !c.joke ? "#C8941A" : "#3A6070",
                      transition:"all 0.2s",
                    }}>
                      {c.label}
                    </button>
                  ))}
                </div>
              ) : !isLast ? (
                <button onClick={handleNext} style={{
                  flex:1, padding:"10px 22px", borderRadius:"6px", cursor:"pointer",
                  fontFamily:"Cinzel,serif", fontSize:"10px", fontWeight:"700", letterSpacing:"0.12em",
                  border:"1px solid #C8941A44", background:"rgba(200,148,26,0.08)", color:"#C8941A",
                  opacity: allRevealed ? 1 : 0.4,
                }}>
                  {!allRevealed ? "…" : "Continue →"}
                </button>
              ) : (
                <div style={{ height:"8px" }} />
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding:"10px 24px", borderTop:"1px solid #0A1828", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div style={{ fontFamily:"Cinzel,serif", fontSize:"8.5px", color:"#1A2A40", letterSpacing:"0.1em" }}>
            OCEAN ADVENTURE · A POLYNESIAN VOYAGING EXPERIENCE
          </div>
        </div>
      </div>

      {/* Joke popup — beach setting */}
      {choice && page.choices?.find(c => c.id === choice)?.joke && (
        <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", zIndex:10, padding:"24px" }}>
          <div style={{ background:"rgba(4,8,18,0.7)", position:"absolute", inset:0, backdropFilter:"blur(2px)" }}/>
          <div style={{ position:"relative", zIndex:1, background:"rgba(6,12,24,0.98)", border:"1px solid #C8941A55", borderRadius:"12px", padding:"28px 32px", maxWidth:"460px", width:"100%", display:"flex", flexDirection:"column", gap:"18px", boxShadow:"0 0 60px rgba(200,148,26,0.15)" }}>
            <div style={{ fontFamily:"Cinzel,serif", fontSize:"11px", color:"#C8941A", letterSpacing:"0.18em", opacity:0.7 }}>PALU HEMI</div>
            <div style={{ fontFamily:"Georgia,serif", fontSize:"15px", color:"#A8C8C0", lineHeight:"1.75", fontStyle:"italic" }}>
              "Nobody is born ready! Bravery is a learned skill — something I am sure you will pick up along the way. Let us begin right here on this beach."
            </div>
            <div style={{ fontFamily:"Georgia,serif", fontSize:"13px", color:"#5A8090", lineHeight:"1.7", fontStyle:"italic" }}>
              You feel a sharp pain at the back of your head. You wake up on a strange beach just as the sun is setting. You may still be on Tonga, but you're disoriented — and Palu Hemi is already drawing something in the sand.
            </div>
            <button onClick={() => onComplete()} style={{ padding:"13px", borderRadius:"6px", cursor:"pointer", fontFamily:"Cinzel,serif", fontSize:"11px", fontWeight:"700", letterSpacing:"0.12em", border:"1px solid #C8941A", background:"rgba(200,148,26,0.14)", color:"#C8941A" }}>
              What the heck? →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}



export default function AppWithBoundary() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}

function App() {
  const [screen,   setScreen]   = useState("loading");
  const [name,     setName]     = useState("");
  const [step,     setStep]     = useState(1);
  const [selHouse, setSelHouse] = useState(null);
  const [selStar,  setSelStar]  = useState(null);
  const [hovHouse, setHovHouse] = useState(null);
  const [hovStar,  setHovStar]  = useState(null);
  const [matalaScolded, setMatalaScolded] = useState(false);
  const [matalaScoldStarId, setMatalaScoldStarId] = useState(null);
  const [bagOpen,  setBagOpen]  = useState(false);
  const [unlocked, setUnlocked] = useState([]);
  const [pendingItem, setPendingItem] = useState(null); // itemId string | null
  const [bagIntroSeen, setBagIntroSeen] = useState(true);
  const [mapNavSeen,   setMapNavSeen]   = useState(true);

  useEffect(() => {
    const savedName = localStorage.getItem("pvs_haumana");
    const savedBag  = JSON.parse(localStorage.getItem("pvs_bag") || "[]");
    const introSeen = localStorage.getItem("pvs_bag_intro") === "1";
    const navSeen   = localStorage.getItem("pvs_map_nav")   === "1";
    setUnlocked(savedBag);
    setBagIntroSeen(introSeen);
    setMapNavSeen(navSeen);
    if (savedName) { setName(savedName); setScreen("map"); }
    else setScreen("welcome");
  }, []);

  const addToBag = itemId => {
    setUnlocked(prev => {
      if (prev.includes(itemId)) return prev;
      const next = [...prev, itemId];
      localStorage.setItem("pvs_bag", JSON.stringify(next));
      // Fire module_completed when the primary tool for each module is unlocked
      const moduleCompletionMap = {
        star_compass: 1, sun_arc: 2, wave_reader: 3,
        wind_reader: 4, bird_guide: 5, cloud_reader: 6,
      };
      if (moduleCompletionMap[itemId]) {
        analyticsEvents.moduleCompleted(moduleCompletionMap[itemId]);
      }
      return next;
    });
  };

  const unlock = itemId => {
    setUnlocked(prev => {
      if (prev.includes(itemId)) return prev; // already owned, no card
      setPendingItem(itemId);
      return prev; // don't add to bag yet
    });
  };

  const confirmItem = () => {
    if (!pendingItem) return;
    const itemId = pendingItem;
    setPendingItem(null);
    setUnlocked(prev => {
      if (prev.includes(itemId)) return prev;
      const next = [...prev, itemId];
      localStorage.setItem("pvs_bag", JSON.stringify(next));
      const moduleCompletionMap = {
        star_compass: 1, sun_arc: 2, wave_reader: 3,
        wind_reader: 4, bird_guide: 5, cloud_reader: 6,
      };
      if (moduleCompletionMap[itemId]) {
        analyticsEvents.moduleCompleted(moduleCompletionMap[itemId]);
      }
      return next;
    });
  };

  const [compassPhase, setCompassPhase] = useState("intro");
  const [shoreIntroSeen, setShoreIntroSeen] = useState(false);

  const handleSubmit = n => {
    localStorage.setItem("pvs_haumana", n);
    setName(n);
    analyticsEvents.voyageStarted(n);
    setScreen("story");
  };

  const handleReset = () => {
    localStorage.removeItem("pvs_haumana");
    localStorage.removeItem("pvs_bag");
    localStorage.removeItem("pvs_bag_intro");
    localStorage.removeItem("pvs_map_nav");
    setName(""); setUnlocked([]); setStep(1); setCompassPhase("intro");
    setSelHouse(null); setSelStar(null); setBagIntroSeen(false); setMapNavSeen(false); setKeepGoing(false);
    setScreen("welcome");
  };

  // Scattered star positions — defined by angle+distance from center, then rotated
  // so the pattern doesn't match the compass orientation (canoe is drifting)
  // Mānaiakalani ends up on the left side after 140° rotation
  const ROTATION_OFFSET = 140; // degrees — rotate whole sky so it's disorienting
  const toXY = (angleDeg, dist, rot=ROTATION_OFFSET) => {
    const rad = (angleDeg + rot - 90) * Math.PI / 180;
    return { x: 300 + dist * Math.cos(rad), y: 300 + dist * Math.sin(rad) };
  };
  // Positions: [star_id, compass_angle_deg, distance_from_center]
  const SCATTERED_STARS = [
    { id:"manaiakalani", ...toXY(22.5,  200) },
    { id:"hokule_a",     ...toXY(67.5,  185) },
    { id:"tawera",       ...toXY(78.75, 165) },
    { id:"takurua",      ...toXY(101.25,190) },
    { id:"atutahi",      ...toXY(146.25,175) },
  ];

  const [keepGoing, setKeepGoing] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [animT, setAnimT] = useState(0);

  const handleStarClick = s => {
    if (step !== 1 || keepGoing) return;
    setSelStar(s);
    if (!s.correct && !matalaScolded) {
      setMatalaScolded(true);
      setMatalaScoldStarId(s.id);
    }
    if (s.correct) {
      unlock("star_compass");
      setKeepGoing(true);
    }
  };

  useEffect(() => {
    if (!animating) return;
    let frame;
    const start = performance.now();
    const DURATION = 2500; // ms
    const tick = (now) => {
      const t = Math.min(1, (now - start) / DURATION);
      setAnimT(t);
      if (t < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        setAnimating(false);
        setStep(2);
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [animating]);

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body, #root { width: 100%; height: 100%; overflow: hidden; }
    input::placeholder { color: #2A4050; }
    .m2-learn-dual-sky { display: flex; flex-direction: row; gap: 8px; align-items: stretch; width: 100%; }
    .m2-learn-dual-sky svg { flex: 1; min-width: 0; border-radius: 8px; display: block; background: #050A14; }
    @media (max-width: 720px) {
      .m2-learn-dual-sky { flex-direction: column; }
    }
  `;

  if (screen === "loading") return <div style={{ width:"100%",height:"100%",background:"#04070E" }} />;

  if (screen === "welcome") return <><style>{css}</style><WelcomeScreen onSubmit={handleSubmit} /></>;

  if (screen === "credits") return (
    <><style>{css}</style>
    <CreditsScreen onBack={() => setScreen("map")} />
    </>
  );
  if (screen === "story") return (
    <>
      <style>{css}</style>
      <StoryCard name={name} onComplete={() => setScreen("map")} onUnlockItem={unlock} />
      {pendingItem && (
        <ItemCard itemId={pendingItem} onConfirm={confirmItem} />
      )}
    </>
  );

  const bgStars = Array.from({ length: 55 }, (_, i) => ({ x:((i*113+37)%97)/97*100, y:((i*79+23)%89)/89*100, r:i%5===0?1.1:0.55, op:0.10+(i%5)*0.06 }));

  return (
    <>
      <style>{css}</style>
      <NavigatorsBag open={bagOpen} onClose={() => setBagOpen(false)} unlocked={unlocked} />

      {screen === "map" && (
        <VoyageMap name={name} onNavigate={m => {
          if (m===1) setScreen("compass");
          if (m===2) setScreen("sunarc");
          if (m===3) setScreen("swells");
          if (m===4) setScreen("wind");
          if (m===5) setScreen("birds");
          if (m===6) setScreen("clouds");
          if (m===7) setScreen("voyage");
        }} unlocked={unlocked} onOpenBag={() => setBagOpen(true)} onReset={handleReset} onCredits={() => setScreen("credits")} />
      )}
      {screen === "map" && !bagIntroSeen && (
        <BagIntroPopup onDismiss={() => {
          localStorage.setItem("pvs_bag_intro", "1");
          setBagIntroSeen(true);
        }} onOpenBag={() => {
          localStorage.setItem("pvs_bag_intro", "1");
          setBagIntroSeen(true);
          setBagOpen(true);
        }} />
      )}
      {screen === "map" && bagIntroSeen && !mapNavSeen && (
        <MapNavPopup onDismiss={() => {
          localStorage.setItem("pvs_map_nav", "1");
          setMapNavSeen(true);
        }} />
      )}

      {screen === "compass" && compassPhase === "intro" && (
        <ModuleIntroScreen moduleNum={1} name={name}
          onBegin={() => setCompassPhase("learn")}
          onBack={() => setScreen("map")} />
      )}
      {screen === "compass" && compassPhase === "learn" && (
        <>
          <CompassLearnScreen
            name={name}
            onReady={() => setCompassPhase("depart")}
            onBack={() => setScreen("map")}
            onOpenBag={() => setBagOpen(true)}
            unlocked={unlocked}
          />
          {!shoreIntroSeen && (
            <ShoreIntroPopup onDismiss={() => setShoreIntroSeen(true)} />
          )}
        </>
      )}
      {screen === "compass" && compassPhase === "depart" && (
        <div style={{ width:"100%", height:"100%", background:"#04070E", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", position:"relative", overflow:"hidden" }}>
          {/* Star field */}
          <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none" }}>
            {bgStars.map((s,i) => <circle key={i} cx={`${s.x}%`} cy={`${s.y}%`} r={s.r} fill="#6A9AB8" opacity={s.op} />)}
          </svg>
          {/* Departure illustration */}
          <div style={{ position:"relative", zIndex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:"32px", maxWidth:"520px", padding:"32px", textAlign:"center" }}>
            {/* Waka SVG silhouette */}
            <svg viewBox="0 0 400 160" style={{ width:"min(100%, 400px)", opacity:0.9 }}>
              <defs>
                <linearGradient id="seaG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#041018"/><stop offset="100%" stopColor="#020810"/>
                </linearGradient>
                <linearGradient id="skyG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#02060E"/><stop offset="100%" stopColor="#041828"/>
                </linearGradient>
              </defs>
              {/* Sky */}
              <rect width="400" height="100" fill="url(#skyG)"/>
              {/* Stars */}
              {[[40,20,1.2],[80,35,0.8],[130,15,1.4],[200,25,0.9],[270,18,1.1],[320,40,0.7],[360,22,1.3],[170,45,0.8],[60,55,0.6]].map(([x,y,r],i)=>(
                <circle key={i} cx={x} cy={y} r={r} fill="#C0E8FF" opacity="0.8"/>
              ))}
              {/* Horizon */}
              <line x1="0" y1="100" x2="400" y2="100" stroke="#0A3848" strokeWidth="1"/>
              {/* Sea */}
              <rect y="100" width="400" height="60" fill="url(#seaG)"/>
              {/* Wave hints */}
              {[0,1,2,3].map(i=>(
                <path key={i} d={`M${i*110},108 Q${i*110+28},104 ${i*110+55},108`} fill="none" stroke="#0A4050" strokeWidth="1" opacity="0.6"/>
              ))}
              {/* Waka hull */}
              <path d="M80,96 Q200,86 320,96 L310,104 Q200,100 90,104 Z" fill="#0A1E18" stroke="#1A4030" strokeWidth="1.5"/>
              {/* Outrigger */}
              <path d="M120,104 L110,112 Q180,110 250,112 L240,104" fill="none" stroke="#1A4030" strokeWidth="1.2"/>
              <line x1="140" y1="104" x2="130" y2="112" stroke="#1A4030" strokeWidth="1"/>
              <line x1="220" y1="104" x2="210" y2="112" stroke="#1A4030" strokeWidth="1"/>
              {/* Mast */}
              <line x1="200" y1="96" x2="200" y2="38" stroke="#2A5040" strokeWidth="2"/>
              {/* Sail */}
              <path d="M200,40 Q235,58 230,90 L200,90 Z" fill="#1A3828" stroke="#2A5040" strokeWidth="1" opacity="0.9"/>
              {/* Palu figure silhouette */}
              <circle cx="185" cy="90" r="4" fill="#2A5040"/>
              <rect x="183" y="90" width="4" height="8" fill="#2A5040"/>
            </svg>
            <div style={{ fontFamily:"Cinzel,serif", fontSize:"11px", color:"#C8941A", letterSpacing:"0.2em", opacity:0.8 }}>
              TONGA → SĀMOA · NIGHT 1
            </div>
            <div style={{ fontFamily:"Georgia,serif", fontSize:"17px", color:"#A8C8C0", lineHeight:"1.75", fontStyle:"italic" }}>
              "We've left Tonga. The shore is behind us now. Find our heading."
            </div>
            <button
              onClick={() => setCompassPhase("activity")}
              style={{ padding:"14px 36px", borderRadius:"6px", cursor:"pointer", fontFamily:"Cinzel,serif", fontSize:"12px", fontWeight:"700", letterSpacing:"0.14em", border:"1px solid #C8941A", background:"rgba(200,148,26,0.14)", color:"#C8941A" }}>
              I'M ON THE POLA →
            </button>
          </div>
        </div>
      )}
      {screen === "compass" && compassPhase === "activity" && (
        <div style={{ width:"100%",height:"100%",background:"#04070E",display:"flex",flexDirection:"column",overflow:"hidden" }}>
          <div style={{ height:"44px",borderBottom:"1px solid #0E1826",background:"rgba(4,8,18,0.95)",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 22px",flexShrink:0 }}>
            <span style={{ fontFamily:"Cinzel,serif",fontSize:"12px",fontWeight:"700",color:"#C8941A",letterSpacing:"0.12em" }}>OCEAN ADVENTURE</span>
            <div style={{ display:"flex",gap:"10px",alignItems:"center" }}>
              <span style={{ fontFamily:"Cinzel,serif",fontSize:"10.5px",color:"#3A6070",letterSpacing:"0.09em" }}>HAUMĀNA · {name.toUpperCase()}</span>
              <button onClick={() => setBagOpen(true)} style={{ background:unlocked.length>0?"rgba(200,148,26,0.10)":"none", border:`1px solid ${unlocked.length>0?"#C8941A55":"#1A2840"}`, borderRadius:"5px", padding:"5px 12px", cursor:"pointer", fontFamily:"Cinzel,serif", fontSize:"10px", color:unlocked.length>0?"#C8941A":"#2A4050", letterSpacing:"0.08em" }}>✦ BAG ({unlocked.length})</button>
            </div>
          </div>
          <div style={{ padding:"7px 22px",borderBottom:"1px solid #0E1826",background:"rgba(4,8,18,0.6)",flexShrink:0 }}>
            <span style={{ fontFamily:"Cinzel,serif",fontSize:"9.5px",color:"#C8941A",letterSpacing:"0.16em" }}>MODULE 01 · TONGA → SĀMOA</span>
            <span style={{ fontFamily:"Cinzel,serif",fontSize:"9.5px",color:"#2A4858",marginLeft:"14px",letterSpacing:"0.1em" }}>THE STAR COMPASS</span>
          </div>
          <div style={{ flex:1,display:"flex",overflow:"hidden",minHeight:0 }}>

            {/* Left — Palu */}
            <div style={{ width:"320px",flexShrink:0,borderRight:"1px solid #0E1826",overflowY:"auto" }}>
              <div style={{ display:"flex",flexDirection:"column",gap:"12px",padding:"18px",height:"100%",boxSizing:"border-box" }}>
                <div style={{ display:"flex",gap:"8px" }}>
                  <button onClick={() => setScreen("map")} style={{ flex:1,background:"none",border:"1px solid #0E1826",borderRadius:"4px",color:"#2A4050",fontSize:"9px",fontFamily:"Cinzel,serif",letterSpacing:"0.1em",padding:"7px",cursor:"pointer" }}>← MAP</button>
                </div>
                <div style={{ background:"rgba(12,20,40,0.85)",border:"1px solid #1E3050",borderRadius:"7px",padding:"12px 14px" }}>
                  <div style={{ fontSize:"9px",letterSpacing:"0.18em",color:"#3A6070",fontFamily:"Cinzel,serif",marginBottom:"5px" }}>TONGA → SĀMOA</div>
                  <div style={{ fontSize:"14px",color:"#C0DCF0",fontFamily:"Cinzel,serif",fontWeight:"700",marginBottom:"2px" }}>Night 1 · Departure</div>
                  <div style={{ fontSize:"10.5px",color:"#507080",fontFamily:"Cinzel,serif" }}>Midnight · Tongatapu · 21°S</div>
                </div>
                <div style={{ flex:1,background:"rgba(6,11,22,0.7)",border:"1px solid #161F34",borderRadius:"7px",padding:"16px",display:"flex",flexDirection:"column",gap:"10px",minHeight:0,overflowY:"auto" }}>
                  <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between" }}>
                    <div style={{ fontSize:"11px",color:"#365060",fontFamily:"Cinzel,serif",letterSpacing:"0.14em" }}>THE PALU SPEAKS</div>
                    <span style={{ fontSize:"16px",opacity:0.75 }}>🦜</span>
                  </div>
                  {step === 1 && !selStar && !hovStar && !keepGoing && (
                    <>
                      <div style={{ fontSize:"20px",color:"#D0A838",fontFamily:"Cinzel,serif",fontWeight:"700",lineHeight:"1.4" }}>OK {name}. Your turn to guide us.</div>
                      <div style={{ fontSize:"15px",color:"#7AACBE",fontFamily:"Georgia,serif",fontStyle:"italic",lineHeight:"1.7" }}>We've left Tonga. You stand on the pola at midnight. The sky is full of stars — but the canoe is drifting, not yet oriented. You know from my story that Sāmoa lies in the Nāleo-Koʻolau house. Find the star that rises there.</div>
                      <div style={{ padding:"9px 12px",background:"rgba(18,55,80,0.4)",borderLeft:"2px solid #1A7A6E",borderRadius:"0 4px 4px 0",fontSize:"11px",color:"#5AABB8",fontFamily:"Georgia,serif" }}>Hover each star to learn its name and house. Then choose the one that rises in Nāleo-Koʻolau.</div>
                    </>
                  )}
                  {step === 1 && hovStar && !selStar && (
                    <>
                      <div style={{ fontSize:"17px",color:"#D0A838",fontFamily:"Cinzel,serif",fontWeight:"700",lineHeight:"1.4" }}>{hovStar.name}</div>
                      <div style={{ fontSize:"14px",color:"#7AACBE",fontFamily:"Georgia,serif",fontStyle:"italic",lineHeight:"1.7" }}>{hovStar.desc}</div>
                    </>
                  )}
                  {step === 1 && selStar && !selStar.correct && (
                    <>
                      {matalaScolded && matalaScoldStarId === selStar.id && (
                        <>
                          <div style={{
                            background: "rgba(42,150,80,0.08)",
                            border: "1px solid rgba(42,150,80,0.3)",
                            borderRadius: "6px",
                            padding: "10px 14px",
                            display: "flex",
                            gap: "10px",
                            alignItems: "flex-start",
                          }}>
                            <span style={{ fontSize: "20px", flexShrink: 0 }}>🦜</span>
                            <div>
                              <div style={{ fontFamily: "Cinzel,serif", fontSize: "10px", color: "#2A9A70", letterSpacing: "0.1em", marginBottom: "4px" }}>MATALA</div>
                              <div style={{ fontFamily: "Georgia,serif", fontSize: "13px", color: "#6AD898", fontStyle: "italic", lineHeight: "1.6" }}>
                                {"SKRAWWK. That is not the right house. SKRAWWK."}
                              </div>
                            </div>
                          </div>
                          <div style={{ fontFamily: "Georgia,serif", fontSize: "11px", color: "#5A8090", fontStyle: "italic", paddingLeft: "14px", borderLeft: "1px solid #1A3040" }}>
                            — Palu: "She is not wrong. Take another look."
                          </div>
                        </>
                      )}
                      <div style={{ fontSize:"17px",color:"#D0A838",fontFamily:"Cinzel,serif",fontWeight:"700",lineHeight:"1.4" }}>{selStar.name}.</div>
                      <div style={{ fontSize:"14px",color:"#7AACBE",fontFamily:"Georgia,serif",fontStyle:"italic",lineHeight:"1.7" }}>{selStar.desc} We need the one that rises in Nāleo-Koʻolau.</div>
                    </>
                  )}
                  {step === 1 && selStar?.correct && !keepGoing && (
                    <>
                      <div style={{ fontSize:"20px",color:"#D0A838",fontFamily:"Cinzel,serif",fontWeight:"700",lineHeight:"1.4" }}>Mānaiakalani!</div>
                      <div style={{ fontSize:"15px",color:"#7AACBE",fontFamily:"Georgia,serif",fontStyle:"italic",lineHeight:"1.7" }}>That is the one. The compass is finding its orientation now...</div>
                    </>
                  )}
                  {animating && (
                    <>
                      <div style={{ fontSize:"20px", color:"#D0A838", fontFamily:"Cinzel,serif", fontWeight:"700", lineHeight:"1.4" }}>Mānaiakalani.</div>
                      <div style={{ fontSize:"15px", color:"#7AACBE", fontFamily:"Georgia,serif", fontStyle:"italic", lineHeight:"1.7" }}>
                        The compass is finding its orientation. Watch the sky.
                      </div>
                    </>
                  )}
                  {keepGoing && step === 1 && !animating && (
                    <>
                      <div style={{ fontSize:"20px",color:"#D0A838",fontFamily:"Cinzel,serif",fontWeight:"700",lineHeight:"1.4" }}>Mānaiakalani!</div>
                      <div style={{ fontSize:"15px",color:"#7AACBE",fontFamily:"Georgia,serif",fontStyle:"italic",lineHeight:"1.7" }}>That is the one. Keep it on your starboard bow all night and we hold our heading for Sāmoa.</div>
                      <button onClick={() => { setAnimT(0); setAnimating(true); }} style={{ marginTop:"8px", padding:"12px", borderRadius:"6px", cursor:"pointer", fontFamily:"Cinzel,serif", fontSize:"11px", fontWeight:"700", letterSpacing:"0.12em", border:"1px solid #C8941A", background:"rgba(200,148,26,0.14)", color:"#C8941A" }}>
                        KEEP GOING →
                      </button>
                    </>
                  )}
                  {step === 2 && (
                    <>
                      <div style={{ fontSize:"17px",color:"#D0A838",fontFamily:"Cinzel,serif",fontWeight:"700",lineHeight:"1.4" }}>Mānaiakalani. You found it.</div>
                      <div style={{ fontSize:"14px",color:"#7AACBE",fontFamily:"Georgia,serif",fontStyle:"italic",lineHeight:"1.7" }}>See how it sits in the Nāleo-Koʻolau house — north-northeast. Keep it on your starboard bow all night and we hold our heading for Sāmoa.</div>
                      <div style={{ padding:"11px",background:"rgba(200,148,26,0.10)",border:"1px solid rgba(200,148,26,0.28)",borderRadius:"6px",textAlign:"center",fontFamily:"Cinzel,serif",fontSize:"10px",color:"#C8941A",letterSpacing:"0.09em" }}>✦ STAR COMPASS ADDED TO YOUR BAG ✦</div>
                      <button onClick={() => setCompassPhase("crossing")} style={{ padding:"12px", borderRadius:"6px", cursor:"pointer", fontFamily:"Cinzel,serif", fontSize:"11px", fontWeight:"700", letterSpacing:"0.12em", border:"1px solid #C8941A", background:"rgba(200,148,26,0.14)", color:"#C8941A" }}>
                        SAIL TO SĀMOA →
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Right — night sky (step 1) or oriented compass (step 2) */}
            <div style={{ flex:1,display:"flex",alignItems:"center",justifyContent:"center",position:"relative",padding:"16px",background:"#04070E" }}>
              {/* Ambient background stars */}
              <svg style={{ position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none" }}>
                {bgStars.map((s,i) => <circle key={i} cx={`${s.x}%`} cy={`${s.y}%`} r={s.r} fill="#6A9AB8" opacity={s.op} />)}
              </svg>

              {step === 1 && !animating && (
                /* Night sky — stars scattered, not oriented */
                <svg viewBox="0 0 600 600" style={{ width:"min(100%,520px)",height:"min(100%,520px)",position:"relative",zIndex:1 }}>
                  <defs>
                    <filter id="nightGlow"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                  </defs>
                  {SCATTERED_STARS.map(pos => {
                    const star = STARS.find(s => s.id === pos.id);
                    const sx = pos.x, sy = pos.y;
                    const isHov = hovStar?.id === star.id;
                    const isSel = selStar?.id === star.id;
                    const isCorrect = isSel && star.correct;
                    const isWrong = isSel && !star.correct;
                    // Label: place radially outward from centre (300,300)
                    const dx = sx - 300, dy = sy - 300;
                    const len = Math.sqrt(dx*dx+dy*dy)||1;
                    const lx = sx + (dx/len)*(star.r+14), ly = sy + (dy/len)*(star.r+14);
                    const anchor = dx > 30 ? "start" : dx < -30 ? "end" : "middle";
                    return (
                      <g key={star.id}
                        style={{ cursor:"pointer" }}
                        onClick={() => handleStarClick(star)}
                        onMouseEnter={() => setHovStar(star)}
                        onMouseLeave={() => setHovStar(null)}>
                        {(isHov || isSel) && <circle cx={sx} cy={sy} r={star.r+16} fill="none" stroke={isCorrect?"#C0E8FF":isWrong?"#FF5533":star.color} strokeWidth="1.5" opacity="0.4"/>}
                        <circle cx={sx} cy={sy} r={isHov||isSel ? star.r+3 : star.r}
                          fill={isCorrect?"#C0E8FF":isWrong?"#FF6644":star.color}
                          filter="url(#nightGlow)" opacity={isWrong ? 0.4 : 1}/>
                        {isHov && !isSel && (
                          <text x={lx} y={ly+4} textAnchor={anchor} fill="#EEE5C8" fontSize="13" fontFamily="Cinzel,serif" fontWeight="600"
                            style={{ pointerEvents:"none" }}>{star.name}</text>
                        )}
                        {isWrong && <text x={lx} y={ly+4} textAnchor={anchor} fill="#FF6644" fontSize="11" fontFamily="Cinzel,serif"
                          style={{ pointerEvents:"none" }}>Not Nāleo-Koʻolau</text>}
                      </g>
                    );
                  })}
                </svg>
              )}

              {animating && (() => {
                const ease = t => t < 0.5 ? 2*t*t : -1+(4-2*t)*t;
                const compassOp = Math.max(0, Math.min(1, (animT - 0.3) / 0.5));
                const moveT = ease(Math.max(0, Math.min(1, (animT - 0.4) / 0.6)));

                const starData = [
                  { id:"manaiakalani", angle:22.5,   dist:205, color:"#C0E8FF", r:9,  name:"Mānaiakalani" },
                  { id:"hokule_a",     angle:67.5,   dist:185, color:"#E8C060", r:7  },
                  { id:"tawera",       angle:78.75,  dist:165, color:"#A0B8F0", r:5  },
                  { id:"takurua",      angle:101.25, dist:190, color:"#F0D070", r:8  },
                  { id:"atutahi",      angle:146.25, dist:175, color:"#FFFFFF",  r:6  },
                ];

                return (
                  <svg viewBox="0 0 600 600" style={{ width:"min(100%,520px)", height:"min(100%,520px)", position:"relative", zIndex:1 }}>
                    <defs>
                      <filter id="animGlow"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                    </defs>

                    <rect width="600" height="600" fill="#04070E"/>

                    {Array.from({length:32},(_,i)=>{
                      const rad=(i*11.25-90)*Math.PI/180;
                      const isCard=i%8===0, isManu=i%4===0&&!isCard;
                      const r1=isCard?52:isManu?72:95, r2=258;
                      return <line key={i}
                        x1={(300+r1*Math.cos(rad)).toFixed(1)} y1={(300+r1*Math.sin(rad)).toFixed(1)}
                        x2={(300+r2*Math.cos(rad)).toFixed(1)} y2={(300+r2*Math.sin(rad)).toFixed(1)}
                        stroke={isCard?"#3A5A80":isManu?"#253860":"#162840"}
                        strokeWidth={isCard?1.8:isManu?1.1:0.5}
                        opacity={compassOp}/>;
                    })}
                    <circle cx="300" cy="300" r="258" fill="none" stroke="#253850" strokeWidth="1.5" opacity={compassOp}/>

                    {[["rgba(200,120,20,0.13)",0],["rgba(155,145,15,0.10)",90],["rgba(15,95,155,0.13)",180],["rgba(90,35,170,0.10)",270]].map(([c,a],i)=>{
                      const r1=(a-90)*Math.PI/180, r2=(a+90-90)*Math.PI/180;
                      return <path key={i} d={`M300,300 L${(300+258*Math.cos(r1)).toFixed(1)},${(300+258*Math.sin(r1)).toFixed(1)} A258,258 0 0,1 ${(300+258*Math.cos(r2)).toFixed(1)},${(300+258*Math.sin(r2)).toFixed(1)} Z`} fill={c} opacity={compassOp}/>;
                    })}

                    <circle cx="300" cy="300" r="52" fill="#060D1C" stroke="#1A2840" strokeWidth="1" opacity={compassOp}/>

                    <path d={`M300,300 L${(300+257*Math.cos((22.5-5.625-90)*Math.PI/180)).toFixed(1)},${(300+257*Math.sin((22.5-5.625-90)*Math.PI/180)).toFixed(1)} A257,257 0 0,1 ${(300+257*Math.cos((22.5+5.625-90)*Math.PI/180)).toFixed(1)},${(300+257*Math.sin((22.5+5.625-90)*Math.PI/180)).toFixed(1)} Z`}
                      fill="rgba(200,148,26,0.2)" stroke="#C8941A" strokeWidth="1.8" opacity={compassOp}/>

                    {starData.map(star => {
                      const scattered = SCATTERED_STARS.find(s => s.id === star.id);
                      const compass = toXY(star.angle, star.dist, 0);
                      const cx = scattered.x + (compass.x - scattered.x) * moveT;
                      const cy = scattered.y + (compass.y - scattered.y) * moveT;
                      const isMana = star.id === "manaiakalani";
                      return (
                        <g key={star.id} filter={isMana ? "url(#animGlow)" : undefined}>
                          {isMana && moveT > 0 && (
                            <line
                              x1={scattered.x.toFixed(1)} y1={scattered.y.toFixed(1)}
                              x2={cx.toFixed(1)} y2={cy.toFixed(1)}
                              stroke="#C0E8FF" strokeWidth="1" strokeDasharray="4,6"
                              opacity={moveT * 0.4}/>
                          )}
                          {isMana && <circle cx={cx.toFixed(1)} cy={cy.toFixed(1)} r={star.r+10} fill="#C0E8FF" opacity={0.1 + animT*0.1}/>}
                          <circle cx={cx.toFixed(1)} cy={cy.toFixed(1)} r={isMana ? star.r + 2 : star.r} fill={star.color}/>
                          {isMana && moveT > 0.6 && (
                            <text x={(cx+16).toFixed(1)} y={(cy-8).toFixed(1)} fill="#EEE5C8" fontSize="12"
                              fontFamily="Cinzel,serif" fontWeight="700" opacity={(moveT-0.6)/0.4}>
                              {star.name}
                            </text>
                          )}
                        </g>
                      );
                    })}

                    <circle cx="300" cy="300" r="4" fill="#5A92BC" opacity={compassOp}/>
                  </svg>
                );
              })()}

              {step === 2 && (
                /* Oriented compass — success state — simple SVG, no complex component */
                <svg viewBox="-60 -60 720 720" style={{ width:"min(100%,520px)",height:"min(100%,520px)",position:"relative",zIndex:1, filter:"drop-shadow(0 0 40px rgba(15,90,150,0.4))" }}>
                  <defs>
                    <radialGradient id="successBg"><stop offset="0%" stopColor="#0D1B30"/><stop offset="100%" stopColor="#060D1C"/></radialGradient>
                    <filter id="successGlow"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                  </defs>
                  {/* Background */}
                  <circle cx={300} cy={300} r={268} fill="url(#successBg)"/>
                  {/* House lines */}
                  {Array.from({length:32},(_,i)=>{
                    const rad=(i*11.25-90)*Math.PI/180;
                    const isCard=i%8===0, isManu=i%4===0&&!isCard;
                    const r1=isCard?52:isManu?72:95, r2=258;
                    return <line key={i} x1={(300+r1*Math.cos(rad)).toFixed(1)} y1={(300+r1*Math.sin(rad)).toFixed(1)} x2={(300+r2*Math.cos(rad)).toFixed(1)} y2={(300+r2*Math.sin(rad)).toFixed(1)} stroke={isCard?"#3A5A80":isManu?"#253860":"#162840"} strokeWidth={isCard?1.8:isManu?1.1:0.5}/>;
                  })}
                  <circle cx={300} cy={300} r={258} fill="none" stroke="#253850" strokeWidth="1.5"/>
                  {/* Quadrant fills */}
                  {[["rgba(200,120,20,0.13)",0],["rgba(155,145,15,0.10)",90],["rgba(15,95,155,0.13)",180],["rgba(90,35,170,0.10)",270]].map(([c,a],i)=>{
                    const r1=(a-90)*Math.PI/180, r2=(a+90-90)*Math.PI/180;
                    return <path key={i} d={`M300,300 L${(300+258*Math.cos(r1)).toFixed(1)},${(300+258*Math.sin(r1)).toFixed(1)} A258,258 0 0,1 ${(300+258*Math.cos(r2)).toFixed(1)},${(300+258*Math.sin(r2)).toFixed(1)} Z`} fill={c}/>;
                  })}
                  {/* Hub */}
                  <circle cx={300} cy={300} r={52} fill="#060D1C" stroke="#1A2840" strokeWidth="1"/>
                  {/* Cardinal labels */}
                  {[["Ākau",0],["Hikina",90],["Hema",180],["Komohana",270]].map(([n,a])=>{
                    const rad=(a-90)*Math.PI/180;
                    return <text key={n} x={(300+162*Math.cos(rad)).toFixed(1)} y={(300+162*Math.sin(rad)+5).toFixed(1)} textAnchor="middle" fill="#5A92BC" fontSize="14" fontFamily="Cinzel,serif" fontWeight="600">{n}</text>;
                  })}
                  {/* Quadrant labels */}
                  {[["KOʻOLAU","#B07825",45],["MALANAI","#9A9A20",135],["KONA","#2090C0",225],["HOʻOLUA","#8040C8",315]].map(([n,c,a])=>{
                    const rad=(a-90)*Math.PI/180;
                    return <text key={n} x={(300+295*Math.cos(rad)).toFixed(1)} y={(300+295*Math.sin(rad)+4).toFixed(1)} textAnchor="middle" fill={c} fontSize="11" fontFamily="Cinzel,serif" fontWeight="700" letterSpacing="0.15em">{n}</text>;
                  })}
                  {/* Nāleo-Koʻolau wedge highlighted */}
                  <path d={`M300,300 L${(300+257*Math.cos((22.5-5.625-90)*Math.PI/180)).toFixed(1)},${(300+257*Math.sin((22.5-5.625-90)*Math.PI/180)).toFixed(1)} A257,257 0 0,1 ${(300+257*Math.cos((22.5+5.625-90)*Math.PI/180)).toFixed(1)},${(300+257*Math.sin((22.5+5.625-90)*Math.PI/180)).toFixed(1)} Z`}
                    fill="rgba(200,148,26,0.2)" stroke="#C8941A" strokeWidth="1.8"/>
                  {/* Bearing line */}
                  <line x1={300} y1={300} x2={(300+250*Math.cos((22.5-90)*Math.PI/180)).toFixed(1)} y2={(300+250*Math.sin((22.5-90)*Math.PI/180)).toFixed(1)} stroke="#C8941A" strokeWidth="2" strokeDasharray="6,4" opacity="0.8"/>
                  {/* Nāleo-Koʻolau label */}
                  {(()=>{ const rad=(22.5-90)*Math.PI/180; return <text x={(300+290*Math.cos(rad)).toFixed(1)} y={(300+290*Math.sin(rad)).toFixed(1)} textAnchor="middle" fill="#C8941A" fontSize="11" fontFamily="Cinzel,serif" fontWeight="700">Nāleo-Koʻolau</text>; })()}
                  {/* Mānaiakalani star */}
                  {(()=>{ const rad=(22.5-90)*Math.PI/180; const sx=300+205*Math.cos(rad), sy=300+205*Math.sin(rad); return (
                    <g filter="url(#successGlow)">
                      <circle cx={sx.toFixed(1)} cy={sy.toFixed(1)} r={20} fill="none" stroke="#C0E8FF" strokeWidth="1" opacity="0.3"/>
                      <circle cx={sx.toFixed(1)} cy={sy.toFixed(1)} r={12} fill="none" stroke="#C0E8FF" strokeWidth="1" opacity="0.5"/>
                      <circle cx={sx.toFixed(1)} cy={sy.toFixed(1)} r={9} fill="#C0E8FF"/>
                      <text x={(sx+18).toFixed(1)} y={(sy-10).toFixed(1)} fill="#EEE5C8" fontSize="13" fontFamily="Cinzel,serif" fontWeight="700">Mānaiakalani</text>
                      <text x={(sx+18).toFixed(1)} y={(sy+5).toFixed(1)} fill="#C0E8FF" fontSize="10" fontFamily="Cinzel,serif" opacity="0.7">your guide star</text>
                    </g>
                  ); })()}
                  <circle cx={300} cy={300} r={5} fill="#5A92BC"/>
                </svg>
              )}
            </div>

          </div>
        </div>
      )}
      {screen === "compass" && compassPhase === "crossing" && (
        <SamoaCrossing
          name={name}
          onArrive={() => setCompassPhase("bridge")}
        />
      )}
      {screen === "compass" && compassPhase === "bridge" && (
        <SamoaArrivalScreen
          name={name}
          unlocked={unlocked}
          onUnlock={unlock}
          onReturn={() => { setScreen("map"); setCompassPhase("intro"); setStep(1); setSelHouse(null); setSelStar(null); }}
        />
      )}
      {screen === "sunarc" && (
        <SunArcModule
          name={name}
          onBack={() => setScreen("map")}
          onOpenBag={() => setBagOpen(true)}
          unlocked={unlocked}
          onComplete={() => unlock("sun_arc")}
          onBridge={() => setScreen("map")}
        />
      )}
      {screen === "swells" && (
        <SwellModule
          name={name}
          onBack={() => setScreen("map")}
          onOpenBag={() => setBagOpen(true)}
          unlocked={unlocked}
          onComplete={() => { unlock("wave_reader"); unlock("taro_plant"); }}
          onBridge={() => setScreen("map")}
        />
      )}
      {screen === "wind" && (
        <WindModule
          name={name}
          onBack={() => setScreen("map")}
          onOpenBag={() => setBagOpen(true)}
          unlocked={unlocked}
          onComplete={() => unlock("wind_reader")}
          onBridge={() => setScreen("map")}
        />
      )}
      {screen === "birds" && (
        <BirdModule
          name={name}
          onBack={() => setScreen("map")}
          onOpenBag={() => setBagOpen(true)}
          unlocked={unlocked}
          onComplete={() => unlock("bird_guide")}
          onBridge={() => setScreen("map")}
        />
      )}
      {screen === "clouds" && (
        <CloudsModule
          name={name}
          onBack={() => setScreen("map")}
          onOpenBag={() => setBagOpen(true)}
          unlocked={unlocked}
          onComplete={() => unlock("cloud_reader")}
          onBridge={() => setScreen("map")}
        />
      )}
      {screen === "voyage" && (
        <FinalVoyageModule
          name={name}
          onBack={() => setScreen("map")}
          onOpenBag={() => setBagOpen(true)}
          unlocked={unlocked}
        />
      )}
      {pendingItem && (
        <ItemCard itemId={pendingItem} onConfirm={confirmItem} />
      )}
    </>
  );
}