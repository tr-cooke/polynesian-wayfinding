import { useState, useEffect } from "react";

/* ══════════════════════════════════════════════════════════════
   DATA
══════════════════════════════════════════════════════════════ */

const HOUSES = [
  { angle: 0,      name: "Ākau",            q: "card" },
  { angle: 11.25,  name: "Haka-Koʻolau",    q: "ko"   },
  { angle: 22.5,   name: "Nāleo-Koʻolau",   q: "ko"   },
  { angle: 33.75,  name: "Nālani-Koʻolau",  q: "ko"   },
  { angle: 45,     name: "Manu-Koʻolau",    q: "ko"   },
  { angle: 56.25,  name: "Noio-Koʻolau",    q: "ko"   },
  { angle: 67.5,   name: "ʻĀina-Koʻolau",   q: "ko"   },
  { angle: 78.75,  name: "Lā-Koʻolau",      q: "ko"   },
  { angle: 90,     name: "Hikina",           q: "card" },
  { angle: 101.25, name: "Lā-Malanai",       q: "ma"   },
  { angle: 112.5,  name: "ʻĀina-Malanai",    q: "ma"   },
  { angle: 123.75, name: "Noio-Malanai",     q: "ma"   },
  { angle: 135,    name: "Manu-Malanai",     q: "ma"   },
  { angle: 146.25, name: "Nālani-Malanai",   q: "ma"   },
  { angle: 157.5,  name: "Nāleo-Malanai",    q: "ma"   },
  { angle: 168.75, name: "Haka-Malanai",     q: "ma"   },
  { angle: 180,    name: "Hema",             q: "card" },
  { angle: 191.25, name: "Haka-Kona",        q: "kona" },
  { angle: 202.5,  name: "Nāleo-Kona",       q: "kona" },
  { angle: 213.75, name: "Nālani-Kona",      q: "kona" },
  { angle: 225,    name: "Manu-Kona",        q: "kona" },
  { angle: 236.25, name: "Noio-Kona",        q: "kona" },
  { angle: 247.5,  name: "ʻĀina-Kona",       q: "kona" },
  { angle: 258.75, name: "Lā-Kona",          q: "kona" },
  { angle: 270,    name: "Komohana",         q: "card" },
  { angle: 281.25, name: "Lā-Hoʻolua",       q: "ho"   },
  { angle: 292.5,  name: "ʻĀina-Hoʻolua",    q: "ho"   },
  { angle: 303.75, name: "Noio-Hoʻolua",     q: "ho"   },
  { angle: 315,    name: "Manu-Hoʻolua",     q: "ho"   },
  { angle: 326.25, name: "Nālani-Hoʻolua",   q: "ho"   },
  { angle: 337.5,  name: "Nāleo-Hoʻolua",    q: "ho"   },
  { angle: 348.75, name: "Haka-Hoʻolua",     q: "ho"   },
];

const STARS = [
  {
    id: "hokule_a", name: "Hōkūleʻa", western: "Arcturus",
    angle: 67.5, r: 7, color: "#FFD060", correct: true,
    desc: "Zenith star of Hawaiʻi. Rises in ʻĀina-Koʻolau — just north of east. As the waka moves south toward Tahiti, Hōkūleʻa rises on your port side all night.",
  },
  {
    id: "tawera", name: "Tāwera", western: "Venus",
    angle: 78.75, r: 10, color: "#FFE840", correct: false,
    desc: "The morning star. Also rises in Koʻolau — but Venus drifts nightly. Reliable only for short windows, not a 14-day voyage.",
  },
  {
    id: "takurua", name: "Takurua", western: "Sirius",
    angle: 101.25, r: 8, color: "#A0C8FF", correct: false,
    desc: "Brightest star in the sky. Rises in Lā-Malanai — south of east. Not useful for this heading; it would be ahead of you.",
  },
  {
    id: "atutahi", name: "Atutahi", western: "Canopus",
    angle: 146.25, r: 6, color: "#FFFCE0", correct: false,
    desc: "Deep south anchor. Rises in Nālani-Malanai, far south of east. Use it to check latitude — not as an eastern guide star.",
  },
  {
    id: "matau", name: "Te Matau ā Māui", western: "Antares",
    angle: 112.5, r: 6, color: "#FF7050", correct: false,
    desc: "Māui's fishhook (Scorpius). Rises in ʻĀina-Malanai — wrong quadrant for our heading south.",
  },
];

const ISLANDS = [
  { id: "hawaii",    name: "Hawaiʻi",          x: 380, y: 55,  module: 1, active: true,  label: "Module 1 · Star Compass" },
  { id: "marquesas", name: "Marquesas",         x: 530, y: 175, module: null, active: false },
  { id: "tahiti",    name: "Tahiti · Raʻiatea", x: 385, y: 275, module: 2, active: true, label: "Module 2 · Sun Arc" },
  { id: "rarotonga", name: "Rarotonga",         x: 330, y: 315, module: 7,    active: false, label: "Final Voyage" },
  { id: "samoa",     name: "Sāmoa",            x: 245, y: 200, module: null, active: false },
  { id: "tonga",     name: "Tonga",             x: 210, y: 290, module: null, active: false },
  { id: "fiji",      name: "Fiji",              x: 168, y: 255, module: null, active: false },
  { id: "aotearoa",  name: "Aotearoa",          x: 118, y: 430, module: null, active: false },
  { id: "rapanui",   name: "Rapa Nui",          x: 640, y: 390, module: null, active: false },
];

const SEA_ROADS = [
  { from: "hawaii",    to: "tahiti",   name: "Ke-ala-i-kahiki" },
  { from: "rarotonga", to: "aotearoa", name: "Ara-i-te-uru"    },
];

const TRIANGLE = ["hawaii", "rapanui", "aotearoa"];

const BAG_ITEMS = [
  {
    id: "star_compass", name: "Star Compass", hawaiian: "Ka Pā Hōkū",
    unlockedBy: "module1", icon: "✦", color: "#C8941A",
    content: [
      { label: "32 Houses",       body: "The horizon is divided into 32 houses, each 11.25° apart. Four quadrants: Koʻolau (NE), Malanai (SE), Kona (SW), Hoʻolua (NW)." },
      { label: "Hōkūleʻa",        body: "Arcturus. Zenith star of Hawaiʻi. Rises in ʻĀina-Koʻolau. Hold it on your port side heading south to Tahiti." },
      { label: "Tāwera",          body: "Venus as morning star. Rises in Koʻolau but drifts nightly — use for short-window orientation only." },
      { label: "Takurua",         body: "Sirius. Brightest in the sky. Rises in Lā-Malanai (SE). Latitude checker, not a heading star." },
      { label: "Atutahi",         body: "Canopus. Southern anchor. Never sets south of 20°S — use to confirm you are in the deep south." },
      { label: "Te Matau ā Māui", body: "Scorpius. Māui's fishhook. Story star — rises Malanai, not useful for north-south headings." },
    ],
  },
  {
    id: "bird_guide", name: "Bird Guide", hawaiian: "Ngā Manu",
    unlockedBy: "module5", icon: "🐦", color: "#2A9A70",
    content: [
      { label: "Manu-o-kū",        body: "White tern. Land-based. Flies up to 200 km from shore. Morning: follow toward land. Evening: follow home." },
      { label: "Noio",              body: "Noddy tern. Land-based. Up to 65 km. Closer signal than white tern." },
      { label: "ʻIwa (pelagic)",    body: "Frigatebird at sea. Sleeps on the ocean for weeks. Following it leads nowhere." },
      { label: "ʻIwa (carried)",    body: "Carried in a cage. Release when land is suspected — it flies toward land or returns to the canoe." },
    ],
  },
  {
    id: "sun_arc", name: "Sun Arc", hawaiian: "Tama-nui-te-rā",
    unlockedBy: "module2", icon: "☀", color: "#D06030",
    content: [
      { label: "Latitude Rule", body: "At local noon: latitude = 90° minus sun altitude, adjusted for season (±23.5° at solstices)." },
      { label: "Equinox",       body: "March 20 / Sep 23: sun rises due east, sets due west. Noon altitude = 90° minus latitude exactly." },
      { label: "When Reliable", body: "Use sun for bearing only when low — sunrise and sunset. High midday sun gives no directional information." },
    ],
  },
  {
    id: "wave_reader", name: "Wave Reader", hawaiian: "Te Moana",
    unlockedBy: "module3", icon: "〰", color: "#2070B0",
    content: [
      { label: "Swells vs Waves", body: "Swells are long-period, deep-source, travel straight for days. Wind-waves are local and unreliable." },
      { label: "Island Signs",    body: "Islands block (calm behind), refract (curves around sides), reflect (cross-chop in front). Range ~30-40 km for high islands." },
      { label: "Mau's Method",    body: "Lie in the hull and feel the swell direction through your whole body — separating swell from surface chop." },
    ],
  },
];

/* ══════════════════════════════════════════════════════════════
   SUN ARC DATA
══════════════════════════════════════════════════════════════ */

const SUN_SCENARIOS = [
  {
    id: "A", label: "Scenario A · Spring Equinox",
    lat: 20, decl: 0, noonAlt: 70,
    altOptions: [55, 63, 70, 78],
    latOptions: [10, 20, 30, 40],
  },
  {
    id: "B", label: "Scenario B · Winter Solstice",
    lat: 20, decl: -23.5, noonAlt: 46.5,
    altOptions: [35, 46.5, 58, 70],
    latOptions: [10, 20, 30, 40],
  },
  {
    id: "C", label: "Scenario C · Summer Solstice",
    lat: 44, decl: 23.5, noonAlt: 69.5,
    altOptions: [55, 62, 69.5, 77],
    latOptions: [20, 30, 44, 55],
  },
  {
    id: "D", label: "Scenario D · Autumn Equinox",
    lat: 34, decl: 0, noonAlt: 56,
    altOptions: [48, 56, 64, 72],
    latOptions: [20, 34, 44, 55],
  },
];

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

/* ══════════════════════════════════════════════════════════════
   NAVIGATOR'S BAG
══════════════════════════════════════════════════════════════ */

function NavigatorsBag({ open, onClose, unlocked }) {
  const [activeItem, setActiveItem] = useState(null);
  if (!open) return null;
  const item = activeItem ? BAG_ITEMS.find(b => b.id === activeItem) : null;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", justifyContent: "flex-end" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(2,5,12,0.72)", backdropFilter: "blur(3px)" }} />
      <div style={{ position: "relative", width: "340px", height: "100%", background: "#06101E", borderLeft: "1px solid #1A2E48", display: "flex", flexDirection: "column", overflow: "hidden" }}>

        <div style={{ padding: "18px 20px 14px", borderBottom: "1px solid #0E1E30", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div>
            <div style={{ fontFamily: "Cinzel,serif", fontSize: "14px", fontWeight: "700", color: "#C8941A" }}>Navigator's Bag</div>
            <div style={{ fontFamily: "Cinzel,serif", fontSize: "9px", color: "#2A4860", letterSpacing: "0.12em", marginTop: "2px" }}>KIT KETE · YOUR KNOWLEDGE</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "1px solid #1A2E48", borderRadius: "4px", color: "#3A5870", fontSize: "14px", cursor: "pointer", padding: "4px 9px", fontFamily: "Cinzel,serif" }}>✕</button>
        </div>

        {!activeItem ? (
          <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
            <div style={{ fontSize: "9.5px", color: "#1E3448", fontFamily: "Cinzel,serif", letterSpacing: "0.14em", marginBottom: "12px" }}>
              {unlocked.length} OF {BAG_ITEMS.length} ITEMS COLLECTED
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {BAG_ITEMS.map(it => {
                const isUnlocked = unlocked.includes(it.id);
                return (
                  <div key={it.id} onClick={() => isUnlocked && setActiveItem(it.id)} style={{
                    padding: "13px 15px", borderRadius: "7px",
                    border: `1px solid ${isUnlocked ? it.color + "44" : "#0E1E30"}`,
                    background: isUnlocked ? `${it.color}0C` : "rgba(255,255,255,0.02)",
                    cursor: isUnlocked ? "pointer" : "default",
                    display: "flex", alignItems: "center", gap: "13px",
                    opacity: isUnlocked ? 1 : 0.38,
                  }}>
                    <div style={{ fontSize: "22px", width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", background: isUnlocked ? `${it.color}18` : "transparent", borderRadius: "6px", flexShrink: 0, filter: isUnlocked ? `drop-shadow(0 0 8px ${it.color}66)` : "none" }}>
                      {it.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "Cinzel,serif", fontSize: "12px", fontWeight: "700", color: isUnlocked ? "#D0C8A8" : "#2A3A50" }}>{it.name}</div>
                      <div style={{ fontFamily: "Cinzel,serif", fontSize: "9px", color: isUnlocked ? it.color : "#1A2A3A", letterSpacing: "0.06em", marginTop: "2px" }}>{isUnlocked ? it.hawaiian : "— locked —"}</div>
                    </div>
                    {isUnlocked && <div style={{ color: "#2A4860", fontSize: "14px" }}>›</div>}
                  </div>
                );
              })}
            </div>
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

function VoyageMap({ name, onNavigate, unlocked, onOpenBag, onReset }) {
  const [hovIsland, setHovIsland] = useState(null);
  const [waveOffset, setWaveOffset] = useState(0);
  const W = 760, H = 500;

  const tri    = TRIANGLE.map(id => ISLANDS.find(i => i.id === id));
  const getIsl = id => ISLANDS.find(i => i.id === id);

  // Animate waves
  useEffect(() => {
    let frame;
    const tick = () => {
      setWaveOffset(o => (o + 0.5) % W);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div style={{ width: "100%", height: "100%", background: "#051C2C", display: "flex", flexDirection: "column", overflow: "hidden" }}>

      {/* Header */}
      <div style={{ height: "44px", borderBottom: "1px solid #0A2A3A", background: "rgba(4,14,22,0.97)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 22px", flexShrink: 0 }}>
        <span style={{ fontFamily: "Cinzel,serif", fontSize: "12px", fontWeight: "700", color: "#C8941A", letterSpacing: "0.12em" }}>POLYNESIAN WAYFINDING</span>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontFamily: "Cinzel,serif", fontSize: "10.5px", color: "#1AA090", letterSpacing: "0.09em" }}>HAUMĀNA · {name.toUpperCase()}</span>
          <button onClick={onOpenBag} style={{ background: unlocked.length > 0 ? "rgba(200,148,26,0.14)" : "rgba(255,255,255,0.03)", border: `1px solid ${unlocked.length > 0 ? "#C8941A66" : "#0A2A3A"}`, borderRadius: "5px", padding: "5px 12px", cursor: "pointer", fontFamily: "Cinzel,serif", fontSize: "10px", color: unlocked.length > 0 ? "#C8941A" : "#1A6070", letterSpacing: "0.08em" }}>
            {unlocked.length > 0 ? `✦ BAG (${unlocked.length})` : "✦ BAG"}
          </button>
          <button onClick={onReset} style={{ background: "none", border: "1px solid #0A2030", borderRadius: "5px", padding: "5px 10px", cursor: "pointer", fontFamily: "Cinzel,serif", fontSize: "9.5px", color: "#0E3040", letterSpacing: "0.08em" }}>↺ RESET</button>
        </div>
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
              <filter id="goldGlow">
                <feGaussianBlur stdDeviation="5" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <filter id="islandShadow">
                <feGaussianBlur stdDeviation="2.5" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            {/* Ocean base */}
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
              return (
                <path key={i} d={d} fill="none"
                  stroke="#1A8090" strokeWidth="0.65"
                  opacity={0.13 + (i % 5) * 0.055} />
              );
            })}

            {/* Sparse lat lines for orientation */}
            {[100, 200, 300, 400].map(y => (
              <line key={y} x1={0} y1={y} x2={W} y2={y}
                stroke="#1E9090" strokeWidth="0.5" strokeDasharray="4,14" opacity="0.2" />
            ))}

            {/* Polynesian Triangle */}
            <polygon points={tri.map(i => `${i.x},${i.y}`).join(" ")}
              fill="rgba(20,160,180,0.06)" stroke="#209090"
              strokeWidth="1.2" strokeDasharray="7,11" />

            {/* Named sea roads */}
            {SEA_ROADS.map(road => {
              const f = getIsl(road.from), t = getIsl(road.to);
              const mx = (f.x + t.x) / 2, my = (f.y + t.y) / 2;
              return (
                <g key={road.name}>
                  <line x1={f.x} y1={f.y} x2={t.x} y2={t.y}
                    stroke="#20C0A0" strokeWidth="1" strokeDasharray="6,9" opacity="0.45" />
                  <text x={mx + 6} y={my - 9} textAnchor="middle"
                    fill="#18A090" fontSize="8.5" fontFamily="Cinzel,serif" opacity="0.8"
                    style={{ letterSpacing: "0.09em" }}>
                    {road.name}
                  </text>
                </g>
              );
            })}

            {/* Islands */}
            {ISLANDS.map(island => {
              const isHov    = hovIsland === island.id;
              const isActive = island.active;
              const isGold   = isHov || isActive;
              const dotR     = isActive ? 6 : 4;

              return (
                <g key={island.id}
                  style={{ cursor: isActive ? "pointer" : "default" }}
                  onClick={() => isActive && island.module && onNavigate(island.module)}
                  onMouseEnter={() => setHovIsland(island.id)}
                  onMouseLeave={() => setHovIsland(null)}>

                  {/* Gold pulse ring — shows on hover for ALL islands, always on for active */}
                  {isGold && (
                    <circle cx={island.x} cy={island.y} r={dotR + 16}
                      fill="none" stroke="#D4A030"
                      strokeWidth={isHov ? 1.4 : 1}
                      opacity={isHov ? 0.65 : 0.28} />
                  )}

                  {/* Island dot */}
                  <circle cx={island.x} cy={island.y} r={dotR}
                    fill={isGold ? "#E8C060" : "#1A8090"}
                    stroke={isGold ? "#C8941A" : "#0A6070"}
                    strokeWidth={isGold ? 1.8 : 0.8}
                    filter={isGold ? "url(#goldGlow)" : "url(#islandShadow)"} />

                  {/* Island name */}
                  <text x={island.x} y={island.y - dotR - 8}
                    textAnchor="middle"
                    fill={isGold ? "#F0D870" : "#1AA0A0"}
                    fontSize={isActive ? "10.5" : "9"}
                    fontFamily="Cinzel,serif"
                    fontWeight={isActive ? "700" : "400"}
                    style={{ pointerEvents: "none" }}>
                    {island.name}
                  </text>

                  {/* Hover module label */}
                  {isHov && island.label && (
                    <g>
                      <rect x={island.x - 62} y={island.y + dotR + 7}
                        width="124" height="22" rx="3"
                        fill="#041220" stroke="#C8941A55" strokeWidth="1" />
                      <text x={island.x} y={island.y + dotR + 22}
                        textAnchor="middle" fill="#C8941A"
                        fontSize="8.5" fontFamily="Cinzel,serif"
                        letterSpacing="0.08em"
                        style={{ pointerEvents: "none" }}>
                        {island.label}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* Chart label */}
            <text x={14} y={H - 12} fill="#1A7080" fontSize="8.5"
              fontFamily="Cinzel,serif" style={{ letterSpacing: "0.12em" }}>
              KA MOANA NUI · THE GREAT OCEAN
            </text>
          </svg>

          {/* Instruction */}
          <div style={{ position: "absolute", bottom: "24px", right: "24px", background: "rgba(3,12,22,0.88)", border: "1px solid #0A3040", borderRadius: "6px", padding: "9px 14px", fontFamily: "Cinzel,serif", fontSize: "10px", color: "#1A8090", letterSpacing: "0.08em" }}>
            CLICK A GLOWING ISLAND TO BEGIN
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
  const correctHouse = selHouse && Math.abs(selHouse.angle - 180) < 6;
  const selC = ok => ok ? "#FFD700" : "#FF5533";

  return (
    <svg viewBox="0 0 600 618" style={{ width: "100%", height: "100%", filter: "drop-shadow(0 0 40px rgba(15,90,150,0.4))" }}>
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
              <text x={p.x} y={p.y - star.r - 17} textAnchor="middle" fill="#EEE5C8" fontSize="11" fontFamily="Cinzel,serif" fontWeight="600" style={{ pointerEvents: "none" }}>{star.name}</text>
              <text x={p.x} y={p.y - star.r - 7}  textAnchor="middle" fill="#6A9BAA" fontSize="9"  fontFamily="Cinzel,serif" style={{ pointerEvents: "none" }}>{star.western}</text>
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
   PALU PANEL
══════════════════════════════════════════════════════════════ */

function PaluPanel({ step, selHouse, selStar, hovHouse, hovStar, name, onBack, onOpenBag, unlocked }) {
  const correctHouse = selHouse && Math.abs(selHouse.angle - 180) < 6;
  const correctStar  = selStar?.correct;

  let title = "", body = "";
  if (step === 3) {
    title = "Hōkūleʻa. The star of joy.";
    body  = `It rises in ʻĀina-Koʻolau — just north of true east. As the waka moves south toward Tahiti, Hōkūleʻa rises on your port side all night. You hold this in your mind, ${name}. The voyage begins.`;
  } else if (step === 2) {
    if (selStar && !correctStar) {
      title = `${selStar.name}.`;
      body  = selStar.desc + " Look for the zenith star of Hawaiʻi.";
    } else if (hovStar) {
      title = hovStar.name;
      body  = `${hovStar.western} — ${hovStar.desc}`;
    } else {
      title = "Hema is locked.";
      body  = "Five stars are visible tonight. One rises in Koʻolau and sits at Hawaiʻiʻs zenith. Hover each — then choose.";
    }
  } else {
    if (!selHouse) {
      title = `E ${name}.`;
      body  = "You stand on the pola of the waka at midnight, June 21st. Tahiti lies 4,400 km to the south. Click the house on the compass that shows your heading.";
    } else if (!correctHouse) {
      title = `${selHouse.name}.`;
      body  = `That house faces ${dirName(selHouse.angle)}. Tahiti lies south — Hema. Try again.`;
    } else {
      title = "Hema. You have it.";
      body  = "South. True Hema. Your heading is locked.";
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
        <div style={{ fontSize: "9px", letterSpacing: "0.18em", color: "#3A6070", fontFamily: "Cinzel,serif", marginBottom: "5px" }}>SCENARIO A · SUMMER SOLSTICE</div>
        <div style={{ fontSize: "14px", color: "#C0DCF0", fontFamily: "Cinzel,serif", fontWeight: "700", marginBottom: "2px" }}>Hawaiʻi → Tahiti</div>
        <div style={{ fontSize: "10.5px", color: "#507080", fontFamily: "Cinzel,serif" }}>June 21 · Midnight · 20°N</div>
      </div>

      <div style={{ display: "flex", gap: "4px" }}>
        {["1 · Bearing", "2 · Star", "✦ Set"].map((label, i) => {
          const done = i + 1 < step, curr = i + 1 === step;
          return <div key={i} style={{ flex: 1, textAlign: "center", padding: "5px 2px", fontSize: "8px", fontFamily: "Cinzel,serif", letterSpacing: "0.06em", background: curr ? "rgba(200,148,26,0.18)" : done ? "rgba(26,120,110,0.18)" : "rgba(255,255,255,0.03)", border: `1px solid ${curr ? "#C8941A" : done ? "#1A8870" : "#1E3050"}`, borderRadius: "4px", color: curr ? "#F0C040" : done ? "#2BB5A0" : "#3A5060" }}>{label}</div>;
        })}
      </div>

      <div style={{ flex: 1, background: "rgba(6,11,22,0.7)", border: "1px solid #161F34", borderRadius: "7px", padding: "16px", display: "flex", flexDirection: "column", gap: "10px", minHeight: 0, overflowY: "auto" }}>
        <div style={{ fontSize: "9px", color: "#365060", fontFamily: "Cinzel,serif", letterSpacing: "0.14em" }}>THE PALU SPEAKS</div>
        <div style={{ fontSize: "14px", color: "#D0A838", fontFamily: "Cinzel,serif", fontWeight: "700", lineHeight: "1.45" }}>{title}</div>
        <div style={{ fontSize: "12px", color: "#7AACBE", fontFamily: "Georgia,serif", fontStyle: "italic", lineHeight: "1.65" }}>{body}</div>
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

function SkyArc({ scenario, timeVal, step, selAlt, selLat, onTimeChange, onAltSelect, onLatSelect }) {
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
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
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
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
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

function SunArcModule({ name, onBack, onOpenBag, unlocked, onComplete }) {
  const [step,    setStep]    = useState(1);
  const [timeVal, setTimeVal] = useState(120);  // start at 8am
  const [selAlt,  setSelAlt]  = useState(null);
  const [selLat,  setSelLat]  = useState(null);

  const sc = SUN_SCENARIOS[0];

  const handleTimeChange = val => {
    if (step !== 1) return;
    setTimeVal(val);
    if (Math.abs(val - 360) <= 10) {
      setTimeout(() => setStep(s => s === 1 ? 2 : s), 700);
    }
  };

  const handleAltSelect = alt => {
    setSelAlt(alt);
    if (alt === sc.noonAlt) setTimeout(() => setStep(3), 900);
  };

  const handleLatSelect = lat => {
    setSelLat(lat);
    if (lat === sc.lat) {
      onComplete();
      setTimeout(() => setStep(4), 900);
    }
  };

  // Palu speech
  let title = "", body = "";
  if (step === 1) {
    title = `E ${name}.`;
    body = "You are six days out from Hawaiʻi. Cloud has hidden the stars for two nights. But Tama-nui-te-rā — the great sun — still crosses the sky. Drag the slider to find when he stands at his highest point.";
  } else if (step === 2) {
    if (selAlt && selAlt !== sc.noonAlt) {
      title = "Look more carefully.";
      body = `${selAlt}° would place the sun ${selAlt < sc.noonAlt ? "lower" : "higher"} than it stands. Count the 15° reference lines from the horizon, then choose again.`;
    } else {
      title = "There. Local noon.";
      body = "The sun stands due south at his peak. Now read the angle between him and the horizon. Each dashed line marks 15°.";
    }
  } else if (step === 3) {
    if (selLat && selLat !== sc.lat) {
      title = "Check the arithmetic.";
      body = `latitude = 90° − altitude = 90° − ${sc.noonAlt}° = ${90 - sc.noonAlt}°. Which answer is ${90 - sc.noonAlt}°N?`;
    } else {
      title = `${sc.noonAlt}°. That is it.`;
      body = `The sun stands ${sc.noonAlt}° above the horizon at noon. At the equinox, no seasonal correction is needed. Latitude = 90° − altitude. Where are you standing on the ocean?`;
    }
  } else {
    title = `${sc.lat}° north.`;
    body = "You know exactly where you stand. No sextant, no instrument — only the angle of the sun and the knowledge of the season. Tama-nui-te-rā has spoken.";
  }

  const stepLabels = ["1 · Noon", "2 · Altitude", "3 · Latitude", "✦ Done"];

  return (
    <div style={{ width:"100%", height:"100%", background:"#04070E", display:"flex", flexDirection:"column", overflow:"hidden" }}>

      {/* Header */}
      <div style={{ height:"44px", borderBottom:"1px solid #0E1826", background:"rgba(4,8,18,0.95)", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 22px", flexShrink:0 }}>
        <span style={{ fontFamily:"Cinzel,serif", fontSize:"12px", fontWeight:"700", color:"#C8941A", letterSpacing:"0.12em" }}>POLYNESIAN WAYFINDING</span>
        <span style={{ fontFamily:"Cinzel,serif", fontSize:"10.5px", color:"#3A6070", letterSpacing:"0.09em" }}>HAUMĀNA · {name.toUpperCase()}</span>
      </div>

      {/* Module bar */}
      <div style={{ padding:"7px 22px", borderBottom:"1px solid #0E1826", background:"rgba(4,8,18,0.6)", flexShrink:0 }}>
        <span style={{ fontFamily:"Cinzel,serif", fontSize:"9.5px", color:"#D06030", letterSpacing:"0.16em" }}>MODULE 2 · TAMA-NUI-TE-RĀ</span>
        <span style={{ fontFamily:"Cinzel,serif", fontSize:"9.5px", color:"#2A4858", marginLeft:"14px", letterSpacing:"0.1em" }}>THE SUN'S ARC · LATITUDE BY DAY</span>
      </div>

      {/* Body */}
      <div style={{ flex:1, display:"flex", overflow:"hidden", minHeight:0 }}>

        {/* Left panel */}
        <div style={{ width:"260px", flexShrink:0, borderRight:"1px solid #0E1826", overflowY:"auto" }}>
          <div style={{ display:"flex", flexDirection:"column", gap:"12px", padding:"18px", boxSizing:"border-box" }}>

            {/* Nav buttons */}
            <div style={{ display:"flex", gap:"8px" }}>
              <button onClick={onBack} style={{ flex:1, background:"none", border:"1px solid #0E1826", borderRadius:"4px", color:"#2A4050", fontSize:"9px", fontFamily:"Cinzel,serif", letterSpacing:"0.1em", padding:"7px", cursor:"pointer" }}>← MAP</button>
              <button onClick={onOpenBag} style={{ flex:1, background:unlocked.length>0?"rgba(200,148,26,0.10)":"none", border:`1px solid ${unlocked.length>0?"#C8941A55":"#0E1826"}`, borderRadius:"4px", color:unlocked.length>0?"#C8941A":"#2A4050", fontSize:"9px", fontFamily:"Cinzel,serif", letterSpacing:"0.1em", padding:"7px", cursor:"pointer" }}>
                {unlocked.length > 0 ? `✦ BAG (${unlocked.length})` : "✦ BAG"}
              </button>
            </div>

            {/* Scenario card */}
            <div style={{ background:"rgba(12,20,40,0.85)", border:"1px solid #1E3050", borderRadius:"7px", padding:"12px 14px" }}>
              <div style={{ fontSize:"9px", letterSpacing:"0.18em", color:"#3A6070", fontFamily:"Cinzel,serif", marginBottom:"5px" }}>SCENARIO A · SPRING EQUINOX</div>
              <div style={{ fontSize:"14px", color:"#C0DCF0", fontFamily:"Cinzel,serif", fontWeight:"700", marginBottom:"2px" }}>Mid-voyage · 20°N</div>
              <div style={{ fontSize:"10.5px", color:"#507080", fontFamily:"Cinzel,serif" }}>March 20 · Observation 6am – 6pm</div>
            </div>

            {/* Step indicators */}
            <div style={{ display:"flex", gap:"4px" }}>
              {stepLabels.map((label, i) => {
                const done = i + 1 < step, curr = i + 1 === step;
                return (
                  <div key={i} style={{ flex:1, textAlign:"center", padding:"5px 1px", fontSize:"7px", fontFamily:"Cinzel,serif", letterSpacing:"0.04em", background:curr?"rgba(208,96,48,0.18)":done?"rgba(26,120,110,0.18)":"rgba(255,255,255,0.03)", border:`1px solid ${curr?"#D06030":done?"#1A8870":"#1E3050"}`, borderRadius:"4px", color:curr?"#E07040":done?"#2BB5A0":"#3A5060" }}>
                    {label}
                  </div>
                );
              })}
            </div>

            {/* Palu speech */}
            <div style={{ background:"rgba(6,11,22,0.7)", border:"1px solid #161F34", borderRadius:"7px", padding:"16px", display:"flex", flexDirection:"column", gap:"10px", overflowY:"auto" }}>
              <div style={{ fontSize:"9px", color:"#365060", fontFamily:"Cinzel,serif", letterSpacing:"0.14em" }}>THE PALU SPEAKS</div>
              <div style={{ fontSize:"14px", color:"#D0A838", fontFamily:"Cinzel,serif", fontWeight:"700", lineHeight:"1.45" }}>{title}</div>
              <div style={{ fontSize:"12px", color:"#7AACBE", fontFamily:"Georgia,serif", fontStyle:"italic", lineHeight:"1.65" }}>{body}</div>
              {step === 1 && (
                <div style={{ padding:"9px 12px", background:"rgba(18,55,80,0.4)", borderLeft:"2px solid #D06030", borderRadius:"0 4px 4px 0", fontSize:"11px", color:"#D08060", fontFamily:"Georgia,serif" }}>
                  Drag the time slider below the sky to find noon.
                </div>
              )}
              {step === 4 && (
                <div style={{ padding:"11px", background:"rgba(208,96,48,0.10)", border:"1px solid rgba(208,96,48,0.28)", borderRadius:"6px", textAlign:"center", fontFamily:"Cinzel,serif", fontSize:"10px", color:"#D06030", letterSpacing:"0.09em" }}>
                  ☀ SUN ARC ADDED TO YOUR BAG ☀
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Right: sky view */}
        <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"20px 24px", overflow:"hidden" }}>
          <div style={{ width:"min(100%, 640px)" }}>
            <SkyArc
              scenario={sc} timeVal={timeVal} step={step}
              selAlt={selAlt} selLat={selLat}
              onTimeChange={handleTimeChange}
              onAltSelect={handleAltSelect}
              onLatSelect={handleLatSelect}
            />
          </div>
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
      <div style={{ zIndex: 1, textAlign: "center", padding: "32px 24px", maxWidth: "500px", display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
        <div style={{ fontSize: "10px", letterSpacing: "0.32em", color: "#354A60", fontFamily: "Cinzel,serif" }}>A POLYNESIAN VOYAGING EXPERIENCE</div>
        <div>
          <div style={{ fontSize: "42px", fontFamily: "Cinzel,serif", fontWeight: "900", color: "#C8941A", lineHeight: "1.0", textShadow: "0 0 60px rgba(200,148,26,0.3)" }}>Polynesian</div>
          <div style={{ fontSize: "42px", fontFamily: "Cinzel,serif", fontWeight: "900", color: "#C8941A", lineHeight: "1.1", textShadow: "0 0 60px rgba(200,148,26,0.3)" }}>Wayfinding</div>
        </div>
        <div style={{ width: "52px", height: "1px", background: "linear-gradient(to right, transparent, #C8941A, transparent)" }} />
        <div style={{ fontSize: "14px", color: "#7AABBB", fontFamily: "Georgia,serif", fontStyle: "italic", lineHeight: "1.72", maxWidth: "380px" }}>For 3,000 years, navigators crossed 10 million km² of open ocean — without instruments. Sky, sea, birds, and wind alone.</div>
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
   APP
══════════════════════════════════════════════════════════════ */

export default function App() {
  const [screen,   setScreen]   = useState("loading");
  const [name,     setName]     = useState("");
  const [step,     setStep]     = useState(1);
  const [selHouse, setSelHouse] = useState(null);
  const [selStar,  setSelStar]  = useState(null);
  const [hovHouse, setHovHouse] = useState(null);
  const [hovStar,  setHovStar]  = useState(null);
  const [bagOpen,  setBagOpen]  = useState(false);
  const [unlocked, setUnlocked] = useState([]);

  useEffect(() => {
    const savedName = localStorage.getItem("pvs_haumana");
    const savedBag  = JSON.parse(localStorage.getItem("pvs_bag") || "[]");
    setUnlocked(savedBag);
    if (savedName) { setName(savedName); setScreen("map"); }
    else setScreen("welcome");
  }, []);

  const unlock = itemId => {
    setUnlocked(prev => {
      if (prev.includes(itemId)) return prev;
      const next = [...prev, itemId];
      localStorage.setItem("pvs_bag", JSON.stringify(next));
      return next;
    });
  };

  const handleSubmit = n => {
    localStorage.setItem("pvs_haumana", n);
    setName(n); setScreen("map");
  };

  const handleReset = () => {
    localStorage.removeItem("pvs_haumana");
    localStorage.removeItem("pvs_bag");
    setName(""); setUnlocked([]); setStep(1);
    setSelHouse(null); setSelStar(null);
    setScreen("welcome");
  };

  const handleHouseClick = h => {
    setSelHouse(h);
    if (Math.abs(h.angle - 180) < 6) setTimeout(() => setStep(2), 900);
  };

  const handleStarClick = s => {
    setSelStar(s);
    if (s.correct) { unlock("star_compass"); setTimeout(() => setStep(3), 900); }
  };

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body, #root { width: 100%; height: 100%; overflow: hidden; }
    input::placeholder { color: #2A4050; }
  `;

  if (screen === "loading") return <div style={{ width:"100%",height:"100%",background:"#04070E" }} />;

  if (screen === "welcome") return <><style>{css}</style><WelcomeScreen onSubmit={handleSubmit} /></>;

  const bgStars = Array.from({ length: 55 }, (_, i) => ({ x:((i*113+37)%97)/97*100, y:((i*79+23)%89)/89*100, r:i%5===0?1.1:0.55, op:0.10+(i%5)*0.06 }));

  return (
    <>
      <style>{css}</style>
      <NavigatorsBag open={bagOpen} onClose={() => setBagOpen(false)} unlocked={unlocked} />

      {screen === "map" && (
        <VoyageMap name={name} onNavigate={m => { if (m===1) setScreen("compass"); if (m===2) setScreen("sunarc"); }} unlocked={unlocked} onOpenBag={() => setBagOpen(true)} onReset={handleReset} />
      )}

      {screen === "compass" && (
        <div style={{ width:"100%",height:"100%",background:"#04070E",display:"flex",flexDirection:"column",overflow:"hidden" }}>
          <div style={{ height:"44px",borderBottom:"1px solid #0E1826",background:"rgba(4,8,18,0.95)",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 22px",flexShrink:0 }}>
            <span style={{ fontFamily:"Cinzel,serif",fontSize:"12px",fontWeight:"700",color:"#C8941A",letterSpacing:"0.12em" }}>POLYNESIAN WAYFINDING</span>
            <span style={{ fontFamily:"Cinzel,serif",fontSize:"10.5px",color:"#3A6070",letterSpacing:"0.09em" }}>HAUMĀNA · {name.toUpperCase()}</span>
          </div>
          <div style={{ padding:"7px 22px",borderBottom:"1px solid #0E1826",background:"rgba(4,8,18,0.6)",flexShrink:0 }}>
            <span style={{ fontFamily:"Cinzel,serif",fontSize:"9.5px",color:"#4A7090",letterSpacing:"0.16em" }}>MODULE 1 · THE STAR COMPASS</span>
            <span style={{ fontFamily:"Cinzel,serif",fontSize:"9.5px",color:"#2A4858",marginLeft:"14px",letterSpacing:"0.1em" }}>KOʻOLAU · MALANAI · KONA · HOʻOLUA</span>
          </div>
          <div style={{ flex:1,display:"flex",overflow:"hidden",minHeight:0 }}>
            <div style={{ width:"260px",flexShrink:0,borderRight:"1px solid #0E1826",overflowY:"auto" }}>
              <PaluPanel step={step} selHouse={selHouse} selStar={selStar} hovHouse={hovHouse} hovStar={hovStar} name={name} onBack={() => setScreen("map")} onOpenBag={() => setBagOpen(true)} unlocked={unlocked} />
            </div>
            <div style={{ flex:1,display:"flex",alignItems:"center",justifyContent:"center",position:"relative",padding:"16px" }}>
              <svg style={{ position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none" }}>
                {bgStars.map((s,i) => <circle key={i} cx={`${s.x}%`} cy={`${s.y}%`} r={s.r} fill="#6A9AB8" opacity={s.op} />)}
              </svg>
              <div style={{ width:"min(100%, calc(100vh - 160px))",aspectRatio:"600/618",position:"relative",zIndex:1 }}>
                <CompassDial step={step} selHouse={selHouse} selStar={selStar} hovHouse={hovHouse} hovStar={hovStar} onHouseClick={handleHouseClick} onHouseHover={setHovHouse} onStarClick={handleStarClick} onStarHover={setHovStar} />
              </div>
            </div>
          </div>
        </div>
      )}
      {screen === "sunarc" && (
        <SunArcModule
          name={name}
          onBack={() => setScreen("map")}
          onOpenBag={() => setBagOpen(true)}
          unlocked={unlocked}
          onComplete={() => unlock("sun_arc")}
        />
      )}
    </>
  );
}