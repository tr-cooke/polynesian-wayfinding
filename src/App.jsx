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
  { id: "samoa",     name: "Sāmoa",            x: 245, y: 200, module: 3, active: true, label: "Module 3 · Ocean Swells" },
  { id: "tonga",     name: "Tonga",             x: 210, y: 290, module: 4, active: true, label: "Module 4 · Wind Patterns" },
  { id: "fiji",      name: "Fiji",              x: 168, y: 255, module: 5, active: true, label: "Module 5 · Bird Guide" },
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
    id: "wind_reader", name: "Wind Reader", hawaiian: "Hau me Matagi",
    unlockedBy: "module4", icon: "≋", color: "#4A70C0",
    content: [
      { label: "Trade winds",   body: "NE trades blow 5°–30°N; SE trades blow 5°–30°S. Both reliable and steady — the backbone of Polynesian voyaging." },
      { label: "ITCZ",          body: "The doldrums belt near the equator. Calms, squalls, unpredictable. Cross it fast, don't linger." },
      { label: "Aim upwind",    body: "Always aim east of your destination. The trades will carry you west. Arrive upwind and you can always fall off; arrive downwind and you cannot return." },
      { label: "El Niño shift", body: "In El Niño years the ITCZ shifts south and SE trades weaken. The crossing window changes — depart earlier in the season." },
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
   SWELL DATA
══════════════════════════════════════════════════════════════ */

// swellFromDeg: compass bearing the swell travels FROM (so lines move toward opposite)
// hullAngle: degrees off the bow the swell should strike for correct heading
// correctDir / correctHeading: button labels for steps 1 & 2
const SWELL_SCENARIOS = [
  {
    id: "A",
    label: "Scenario A · Trade Swell",
    swellFromDeg: 135,       // swell FROM SE — classic South Pacific trade swell
    swellLabel: "Southeast",
    swellPeriod: 14,         // seconds (long-period = ocean swell)
    windFromDeg: 70,         // wind FROM NE — trade winds
    heading: 180,            // canoe heading south
    hullAngle: 135,          // swell hits port quarter (left-rear) — correct for south heading
    dirOptions: ["Northeast", "Southeast", "Southwest", "Northwest"],
    correctDir: "Southeast",
    headingOptions: [135, 160, 180, 200],
    correctHeading: 180,
    interferenceType: "block", // island effect to identify in step 3
  },
];

/* ══════════════════════════════════════════════════════════════
   WIND DATA
══════════════════════════════════════════════════════════════ */

// Pacific wind map — schematic, not cartographic
// Viewport: 140°W–160°E longitude, 35°N–35°S latitude → mapped to 760×500 SVG
const WIND_MAP_W = 700, WIND_MAP_H = 440;

// Convert lat/lon to SVG coords (rough linear mapping)
const latLonToXY = (lat, lon) => ({
  x: ((lon + 180) / 80) * WIND_MAP_W * 0.72 + 30,   // longitude range ~110° wide
  y: ((35 - lat) / 70) * WIND_MAP_H,                 // latitude 35N to 35S
});

// Wind belt definitions  — y in SVG coords
const WIND_BELTS = {
  normal: [
    { name: "NE Trades",   latTop: 30, latBot: 8,   color: "#1A4A80", dir: 225, label: "NE TRADE WINDS" },
    { name: "ITCZ",        latTop: 8,  latBot: 2,   color: "#2A2A18", dir: null, label: "ITCZ · DOLDRUMS" },
    { name: "SE Trades",   latTop: 2,  latBot: -28, color: "#1A5050", dir: 315, label: "SE TRADE WINDS" },
  ],
  elnino: [
    { name: "NE Trades",   latTop: 30, latBot: 5,   color: "#1A4A80", dir: 225, label: "NE TRADE WINDS" },
    { name: "ITCZ",        latTop: 5,  latBot: -5,  color: "#2A2A18", dir: null, label: "ITCZ (EL NIÑO — SHIFTED SOUTH)" },
    { name: "SE Trades",   latTop: -5, latBot: -28, color: "#1A5050", dir: 315, label: "SE TRADE WINDS (WEAKENED)" },
  ],
};

// Scenario: Rarotonga (21°S) → Aotearoa (37°S)  — SE trades, aim upwind (east)
const WIND_SCENARIO = {
  depart:  { name: "Rarotonga", lat: -21, lon: -160 },
  arrive:  { name: "Aotearoa",  lat: -37, lon: -174 },
  // bearing options — correct is ~190° (aim slightly east of south, trades push you west)
  bearingOptions: [160, 175, 190, 210],
  correctBearing: 190,
  correctLabel: "SSE — aim east of Aotearoa",
  windName: "SE Trade Wind",
  // El Niño question
  elNinoEffect: "weaken",
  elNinoOptions: ["Shift the ITCZ south", "Strengthen the SE trades", "Push the waka east", "Make the crossing shorter"],
  correctElNino: "Shift the ITCZ south",
};

/* ══════════════════════════════════════════════════════════════
   BIRD DATA
══════════════════════════════════════════════════════════════ */

const BIRD_TYPE_META = {
  land:      { fill:"#00C896", faint:"rgba(0,200,150,0.12)",  label:"Land signal bird",  explain:"Nests on shore — follow it toward land" },
  trap:      { fill:"#FF6B4A", faint:"rgba(255,107,74,0.12)", label:"Pelagic trap",       explain:"Lives at sea — following it leads nowhere" },
  carrier:   { fill:"#FFB830", faint:"rgba(255,184,48,0.12)", label:"Carrier tool",       explain:"Brought aboard — release to find land" },
  migratory: { fill:"#48CAE4", faint:"rgba(72,202,228,0.12)", label:"Migratory bird",     explain:"Seasonal direction signal, not land proximity" },
};

const BIRDS = [
  {
    id: "white_tern", name: "Manu-o-kū", latin: "Gygis alba", label: "White Tern",
    range: 200, type: "land", color: "#00C896",
    desc: "Brilliant white, delicate. Flies up to 200 km from its nesting island. At dawn, flying away from a point means land is behind it. In the evening, follow it home.",
    signal: "LAND WITHIN 200 KM", signalColor: "#00C896",
    photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Gygis_alba_05.JPG/400px-Gygis_alba_05.JPG",
    photoCredit: "Wikimedia Commons · CC BY-SA 3.0",
  },
  {
    id: "noddy", name: "Noio", latin: "Anous minutus", label: "Black Noddy Tern",
    range: 65, type: "land", color: "#00C896",
    desc: "Dark brown, smaller. Rarely ventures beyond 65 km from its nesting island. Sighting means you are very close. Multiple noddies circling means land is just below the horizon.",
    signal: "LAND WITHIN 65 KM", signalColor: "#00C896",
    photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Anous_minutus_by_Gregg_Yan_02.jpg/400px-Anous_minutus_by_Gregg_Yan_02.jpg",
    photoCredit: "Gregg Yan · Wikimedia Commons · CC BY-SA 3.0",
  },
  {
    id: "iwa_pelagic", name: "ʻIwa", latin: "Fregata minor", label: "Frigatebird (pelagic)",
    range: null, type: "trap", color: "#FF6B4A",
    desc: "Long forked tail, hooked beak. Sleeps on the open ocean for weeks without landing. A frigatebird over open water tells you nothing about land. Do not follow it.",
    signal: "NO LAND SIGNAL — IGNORE", signalColor: "#FF6B4A",
    photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Fregata_minor-juvenile_male_soaring.jpg/400px-Fregata_minor-juvenile_male_soaring.jpg",
    photoCredit: "Wikimedia Commons · Public Domain",
  },
  {
    id: "iwa_carrier", name: "ʻIwa (carried)", latin: "Fregata minor", label: "Carrier Frigatebird",
    range: null, type: "carrier", color: "#FFB830",
    desc: "The same bird — but kept in a cage on the waka. Release it when you suspect land is near. If it circles and returns to the canoe, no land is close. If it flies away and does not return, it has found land and is flying toward it.",
    signal: "RELEASE WHEN LAND SUSPECTED", signalColor: "#FFB830",
    photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Fregata_minor-juvenile_male_soaring.jpg/400px-Fregata_minor-juvenile_male_soaring.jpg",
    photoCredit: "Wikimedia Commons · Public Domain",
  },
  {
    id: "golden_plover", name: "Kōlea", latin: "Pluvialis fulva", label: "Pacific Golden Plover",
    range: null, type: "migratory", color: "#48CAE4",
    desc: "Migrates annually between Alaska and Hawaiʻi — 4,800 km non-stop. Flocks flying in formation give a directional bearing, not a proximity signal. They are flying toward a specific destination — watch which way.",
    signal: "DIRECTIONAL BEARING ONLY", signalColor: "#48CAE4",
    photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Pacific_golden_plover_%28Pluvialis_fulva%29_%2823444429066%29.jpg/400px-Pacific_golden_plover_%28Pluvialis_fulva%29_%2823444429066%29.jpg",
    photoCredit: "Wikimedia Commons · CC BY 2.0",
    migration: {
      south: { from:{ name:"Alaska", x:80,  y:32  }, to:{ name:"Hawaiʻi", x:176, y:178 }, ctrl:{ x:30,  y:120 }, label:"Southbound Aug–Oct" },
      north: { from:{ name:"Hawaiʻi", x:188, y:172 }, to:{ name:"Alaska",  x:92,  y:38  }, ctrl:{ x:230, y:88  }, label:"Northbound Apr–May" },
      note: "4,800 km non-stop over open ocean",
    },
  },
  {
    id: "long_tailed_cuckoo", name: "Koekoea", latin: "Urodynamis taitensis", label: "Long-tailed Cuckoo",
    range: null, type: "migratory", color: "#48CAE4",
    desc: "Migrates from Aotearoa to the tropical Pacific in autumn — and back in spring. Polynesian navigators used its seasonal appearance as a calendar. Follow its spring flight toward Aotearoa.",
    signal: "SEASONAL CALENDAR SIGNAL", signalColor: "#48CAE4",
    photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Long-tailed_Cuckoo.jpg/400px-Long-tailed_Cuckoo.jpg",
    photoCredit: "J. G. Keulemans · Wikimedia Commons · Public Domain",
    migration: {
      south: { from:{ name:"Aotearoa", x:60,  y:186 }, to:{ name:"Tropical Pacific", x:196, y:52  }, ctrl:{ x:20,  y:100 }, label:"Northbound Sep–Nov (to Aotearoa)" },
      north: { from:{ name:"Tropical Pacific", x:208, y:60  }, to:{ name:"Aotearoa",  x:72,  y:194 }, ctrl:{ x:236, y:140 }, label:"Southbound Feb–Apr (to Pacific)" },
      note: "2,500–6,000 km across open ocean",
    },
  },
];

// Classification challenge — shown in step 2
const BIRD_SIGHTINGS = [
  { birdId: "white_tern",      context: "Dawn. Two white birds flying northeast.",       correct: "land" },
  { birdId: "iwa_pelagic",     context: "Midday. A large dark bird circling overhead.",  correct: "ignore" },
  { birdId: "noddy",           context: "Late afternoon. Dark terns flying low, south.", correct: "land" },
  { birdId: "golden_plover",   context: "Dawn. A flock of speckled birds heading north.",correct: "bearing" },
  { birdId: "iwa_carrier",     context: "The cage stirs. You feel land is near.",        correct: "release" },
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

function SunArcModule({ name, onBack, onOpenBag, unlocked, onComplete }) {
  const [step,        setStep]       = useState(1);
  const [timeVal,     setTimeVal]    = useState(120);
  const [selAlt,      setSelAlt]     = useState(null);
  const [selLat,      setSelLat]     = useState(null);
  const [confirming,  setConfirming] = useState(false);

  const sc = SUN_SCENARIOS[0];

  const handleTimeChange = val => {
    if (step !== 1 || confirming) return;
    setTimeVal(val);
    if (Math.abs(val - 360) <= 10) {
      setConfirming(true);
      setTimeout(() => { setStep(s => s === 1 ? 2 : s); setConfirming(false); }, 1800);
    }
  };

  const handleAltSelect = alt => {
    if (confirming) return;
    setSelAlt(alt);
    if (alt === sc.noonAlt) {
      setConfirming(true);
      setTimeout(() => { setStep(3); setConfirming(false); }, 1800);
    }
  };

  const handleLatSelect = lat => {
    if (confirming) return;
    setSelLat(lat);
    if (lat === sc.lat) {
      setConfirming(true);
      onComplete();
      setTimeout(() => { setStep(4); setConfirming(false); }, 1800);
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
              confirming={confirming}
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
            const startAngle = backRad + side * (0.5 + t * 0.9);
            const sx = islX + spread * Math.cos(startAngle);
            const sy = islY + spread * Math.sin(startAngle);
            // control point: pulls arc around the island flank
            const ctrlAngle = backRad + side * (Math.PI * 0.45);
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

function SwellModule({ name, onBack, onOpenBag, unlocked, onComplete }) {
  const [step,          setStep]         = useState(1);
  const [selDir,        setSelDir]       = useState(null);
  const [canoeHeading,  setCanoeHeading] = useState(90);
  const [headingLocked, setHeadingLocked]= useState(false);
  const [animOffset,    setAnimOffset]   = useState(0);
  const [confirming,    setConfirming]   = useState(false);

  const sc = SWELL_SCENARIOS[0];

  // Animate swells
  useEffect(() => {
    let frame;
    const tick = () => {
      setAnimOffset(o => (o + 0.55) % 400);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  const handleDirSelect = dir => {
    if (confirming) return;
    setSelDir(dir);
    if (dir === sc.correctDir) {
      setConfirming(true);
      setTimeout(() => { setStep(2); setConfirming(false); }, 1800);
    }
  };

  const handleLockHeading = () => {
    if (confirming) return;
    if (Math.abs(canoeHeading - sc.correctHeading) <= 12) {
      setHeadingLocked(true);
      setConfirming(true);
      setTimeout(() => { setStep(3); setConfirming(false); }, 1800);
    }
  };

  const handleInterference = type => {
    if (confirming) return;
    if (type === sc.interferenceType) {
      setConfirming(true);
      onComplete();
      setTimeout(() => { setStep(4); setConfirming(false); }, 1800);
    }
  };

  // Palu speech per step
  const palus = {
    1: {
      title: `E ${name}. Close your eyes.`,
      body: "Feel the motion beneath you — not the chop on the surface, but the long slow roll underneath it. That roll is the swell. It travels thousands of kilometres without changing direction. Watch the water. Which direction is the swell travelling from?",
      hint: "Observe the long parallel lines — those are swell crests. The shorter, choppier lines are wind-waves. Identify which direction the swell is coming from, then choose.",
    },
    2: {
      title: "Southeast. That is the trade swell.",
      body: "It rolls in from the Southern Ocean, steady as breathing. Now use it. Our heading is south — Hema. Rotate the waka until the swell strikes your port quarter. Hold that angle and you hold your heading even when the stars are hidden.",
      hint: "Drag the slider to rotate the canoe. Aim the bow (gold dot) toward 180° — due south. The swell will then hit the rear-left of the hull.",
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
        <span style={{ fontFamily:"Cinzel,serif", fontSize:"12px", fontWeight:"700", color:"#C8941A", letterSpacing:"0.12em" }}>POLYNESIAN WAYFINDING</span>
        <span style={{ fontFamily:"Cinzel,serif", fontSize:"10.5px", color:"#2A9090", letterSpacing:"0.09em" }}>HAUMĀNA · {name.toUpperCase()}</span>
      </div>

      {/* Module bar */}
      <div style={{ padding:"7px 22px", borderBottom:"1px solid #0A1E2C", background:"rgba(3,8,18,0.6)", flexShrink:0 }}>
        <span style={{ fontFamily:"Cinzel,serif", fontSize:"9.5px", color:"#2A90A8", letterSpacing:"0.16em" }}>MODULE 3 · TE MOANA</span>
        <span style={{ fontFamily:"Cinzel,serif", fontSize:"9.5px", color:"#1A3848", marginLeft:"14px", letterSpacing:"0.1em" }}>OCEAN SWELLS · NAVIGATION BY FEEL</span>
      </div>

      {/* Body */}
      <div style={{ flex:1, display:"flex", overflow:"hidden", minHeight:0 }}>

        {/* Left panel */}
        <div style={{ width:"260px", flexShrink:0, borderRight:"1px solid #0A1E2C", overflowY:"auto" }}>
          <div style={{ display:"flex", flexDirection:"column", gap:"12px", padding:"18px", boxSizing:"border-box" }}>

            <div style={{ display:"flex", gap:"8px" }}>
              <button onClick={onBack} style={{ flex:1, background:"none", border:"1px solid #0A1826", borderRadius:"4px", color:"#1A3848", fontSize:"9px", fontFamily:"Cinzel,serif", letterSpacing:"0.1em", padding:"7px", cursor:"pointer" }}>← MAP</button>
              <button onClick={onOpenBag} style={{ flex:1, background:unlocked.length>0?"rgba(200,148,26,0.10)":"none", border:`1px solid ${unlocked.length>0?"#C8941A55":"#0A1826"}`, borderRadius:"4px", color:unlocked.length>0?"#C8941A":"#1A3848", fontSize:"9px", fontFamily:"Cinzel,serif", letterSpacing:"0.1em", padding:"7px", cursor:"pointer" }}>
                {unlocked.length > 0 ? `✦ BAG (${unlocked.length})` : "✦ BAG"}
              </button>
            </div>

            {/* Scenario card */}
            <div style={{ background:"rgba(8,18,32,0.85)", border:"1px solid #0E2A3A", borderRadius:"7px", padding:"12px 14px" }}>
              <div style={{ fontSize:"9px", letterSpacing:"0.18em", color:"#1A4858", fontFamily:"Cinzel,serif", marginBottom:"5px" }}>SCENARIO A · SOUTH PACIFIC</div>
              <div style={{ fontSize:"14px", color:"#90C8D8", fontFamily:"Cinzel,serif", fontWeight:"700", marginBottom:"2px" }}>Day 8 — Open Ocean</div>
              <div style={{ fontSize:"10.5px", color:"#2A5868", fontFamily:"Cinzel,serif" }}>Stars hidden · Overcast · 14s swell</div>
            </div>

            {/* Step indicators */}
            <div style={{ display:"flex", gap:"4px" }}>
              {stepLabels.map((label, i) => {
                const done = i+1 < step, curr = i+1 === step;
                return <div key={i} style={{ flex:1, textAlign:"center", padding:"5px 1px", fontSize:"7px", fontFamily:"Cinzel,serif", letterSpacing:"0.04em", background:curr?"rgba(42,144,168,0.18)":done?"rgba(26,120,110,0.18)":"rgba(255,255,255,0.03)", border:`1px solid ${curr?"#2A90A8":done?"#1A8870":"#0E2030"}`, borderRadius:"4px", color:curr?"#2AB8C8":done?"#2BB5A0":"#1A3848" }}>{label}</div>;
              })}
            </div>

            {/* Palu speech */}
            <div style={{ background:"rgba(4,10,20,0.7)", border:"1px solid #0E1E2E", borderRadius:"7px", padding:"16px", display:"flex", flexDirection:"column", gap:"10px" }}>
              <div style={{ fontSize:"9px", color:"#1A4050", fontFamily:"Cinzel,serif", letterSpacing:"0.14em" }}>THE PALU SPEAKS</div>
              <div style={{ fontSize:"14px", color:"#D0A838", fontFamily:"Cinzel,serif", fontWeight:"700", lineHeight:"1.45" }}>{palu.title}</div>
              <div style={{ fontSize:"12px", color:"#7AACBE", fontFamily:"Georgia,serif", fontStyle:"italic", lineHeight:"1.65" }}>{palu.body}</div>
              {palu.hint && (
                <div style={{ padding:"9px 12px", background:"rgba(18,55,70,0.4)", borderLeft:"2px solid #2A90A8", borderRadius:"0 4px 4px 0", fontSize:"11px", color:"#2A90A8", fontFamily:"Georgia,serif" }}>
                  {palu.hint}
                </div>
              )}
              {step === 4 && (
                <div style={{ padding:"11px", background:"rgba(42,144,168,0.10)", border:"1px solid rgba(42,144,168,0.28)", borderRadius:"6px", textAlign:"center", fontFamily:"Cinzel,serif", fontSize:"10px", color:"#2A90A8", letterSpacing:"0.09em" }}>
                  〰 WAVE READER ADDED TO YOUR BAG 〰
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
        <text x={W-8} y={(35/70)*H - 4} textAnchor="end" fill="#1A3A30" fontSize="8" fontFamily="Cinzel,serif">EQUATOR</text>

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

function WindModule({ name, onBack, onOpenBag, unlocked, onComplete }) {
  const [step,        setStep]       = useState(1);
  const [mode,        setMode]       = useState("normal");
  const [selBearing,  setSelBearing] = useState(null);
  const [selElNino,   setSelElNino]  = useState(null);
  const [confirming,  setConfirming] = useState(false);

  const sc = WIND_SCENARIO;

  const handleBearingSelect = b => {
    if (confirming) return;
    setSelBearing(b);
    if (b === sc.correctBearing) {
      setConfirming(true);
      setTimeout(() => { setStep(3); setConfirming(false); }, 1800);
    }
  };

  const handleElNinoSelect = opt => {
    if (confirming) return;
    setSelElNino(opt);
    if (opt === sc.correctElNino) {
      setConfirming(true);
      onComplete();
      setTimeout(() => { setStep(4); setConfirming(false); }, 1800);
    }
  };

  // Auto-switch map to El Niño when step 3 starts
  useEffect(() => { if (step === 3) setMode("elnino"); }, [step]);

  const palus = {
    1: {
      title: `E ${name}. Read the wind before you leave the harbour.`,
      body: "The SE trade winds blow steady from the east across the southern Pacific. Your voyage from Rarotonga to Aotearoa will cross their full width. Study the map — watch where the winds blow, where the doldrums sit, how the belts are laid.",
      hint: "Toggle El Niño to see how the wind pattern changes in those years. When you understand the map, press Continue.",
      showToggle: true,
    },
    2: {
      title: "Now choose your departure bearing.",
      body: "Aotearoa lies to the southwest. But if you aim straight for it, the SE trades will push you west — you will miss to the leeward side. Aim east of your destination and let the wind carry you in. Where do you point the bow?",
      hint: null,
      showToggle: false,
    },
    3: {
      title: selBearing === sc.correctBearing ? "190°. Upwind of the mark." : selBearing ? "Check the wind direction again." : "190°. Upwind of the mark.",
      body: selBearing === sc.correctBearing
        ? "You aim slightly east of south. The SE trades will push you west-southwest across the full passage. Arrive upwind and you can always fall off to leeward — arrive downwind and you cannot return. Now — the map has changed. What year is this?"
        : `${selBearing}° points too far ${selBearing < sc.correctBearing ? "east" : "west"}. The SE trades come from the east. They will push you west. Aim east of Aotearoa so they carry you onto the mark.`,
      hint: null,
      showToggle: false,
    },
    4: {
      title: "The ITCZ moves south in El Niño.",
      body: "The doldrums belt drops below the equator — directly across the route. The SE trades weaken. The crossing window changes. A navigator who knows this changes their calendar, not their courage.",
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
        <span style={{ fontFamily:"Cinzel,serif", fontSize:"12px", fontWeight:"700", color:"#C8941A", letterSpacing:"0.12em" }}>POLYNESIAN WAYFINDING</span>
        <span style={{ fontFamily:"Cinzel,serif", fontSize:"10.5px", color:"#4A70A8", letterSpacing:"0.09em" }}>HAUMĀNA · {name.toUpperCase()}</span>
      </div>

      {/* Module bar */}
      <div style={{ padding:"7px 22px", borderBottom:"1px solid #0A1828", background:"rgba(4,8,18,0.6)", flexShrink:0 }}>
        <span style={{ fontFamily:"Cinzel,serif", fontSize:"9.5px", color:"#4A70C0", letterSpacing:"0.16em" }}>MODULE 4 · HAU ME MATAGI</span>
        <span style={{ fontFamily:"Cinzel,serif", fontSize:"9.5px", color:"#1A3048", marginLeft:"14px", letterSpacing:"0.1em" }}>WIND PATTERNS · VOYAGE STRATEGY</span>
      </div>

      {/* Body */}
      <div style={{ flex:1, display:"flex", overflow:"hidden", minHeight:0 }}>

        {/* Left panel */}
        <div style={{ width:"260px", flexShrink:0, borderRight:"1px solid #0A1828", overflowY:"auto" }}>
          <div style={{ display:"flex", flexDirection:"column", gap:"12px", padding:"18px", boxSizing:"border-box" }}>

            <div style={{ display:"flex", gap:"8px" }}>
              <button onClick={onBack} style={{ flex:1, background:"none", border:"1px solid #0A1828", borderRadius:"4px", color:"#1A3048", fontSize:"9px", fontFamily:"Cinzel,serif", letterSpacing:"0.1em", padding:"7px", cursor:"pointer" }}>← MAP</button>
              <button onClick={onOpenBag} style={{ flex:1, background:unlocked.length>0?"rgba(200,148,26,0.10)":"none", border:`1px solid ${unlocked.length>0?"#C8941A55":"#0A1828"}`, borderRadius:"4px", color:unlocked.length>0?"#C8941A":"#1A3048", fontSize:"9px", fontFamily:"Cinzel,serif", letterSpacing:"0.1em", padding:"7px", cursor:"pointer" }}>
                {unlocked.length > 0 ? `✦ BAG (${unlocked.length})` : "✦ BAG"}
              </button>
            </div>

            {/* Scenario card */}
            <div style={{ background:"rgba(8,14,28,0.85)", border:"1px solid #0E2040", borderRadius:"7px", padding:"12px 14px" }}>
              <div style={{ fontSize:"9px", letterSpacing:"0.18em", color:"#1A3858", fontFamily:"Cinzel,serif", marginBottom:"5px" }}>SCENARIO A · SE PACIFIC</div>
              <div style={{ fontSize:"14px", color:"#7AAAD8", fontFamily:"Cinzel,serif", fontWeight:"700", marginBottom:"2px" }}>Rarotonga → Aotearoa</div>
              <div style={{ fontSize:"10.5px", color:"#2A4868", fontFamily:"Cinzel,serif" }}>~2,400 km · SE trade wind passage</div>
            </div>

            {/* Step indicators */}
            <div style={{ display:"flex", gap:"4px" }}>
              {stepLabels.map((label, i) => {
                const done = i+1 < step, curr = i+1 === step;
                return <div key={i} style={{ flex:1, textAlign:"center", padding:"5px 1px", fontSize:"7px", fontFamily:"Cinzel,serif", letterSpacing:"0.04em", background:curr?"rgba(74,112,192,0.18)":done?"rgba(26,120,110,0.18)":"rgba(255,255,255,0.03)", border:`1px solid ${curr?"#4A70C0":done?"#1A8870":"#0E2030"}`, borderRadius:"4px", color:curr?"#7AAAE0":done?"#2BB5A0":"#1A3848" }}>{label}</div>;
              })}
            </div>

            {/* Palu speech */}
            <div style={{ background:"rgba(4,8,20,0.7)", border:"1px solid #0E1E34", borderRadius:"7px", padding:"16px", display:"flex", flexDirection:"column", gap:"10px" }}>
              <div style={{ fontSize:"9px", color:"#1A3050", fontFamily:"Cinzel,serif", letterSpacing:"0.14em" }}>THE PALU SPEAKS</div>
              <div style={{ fontSize:"14px", color:"#D0A838", fontFamily:"Cinzel,serif", fontWeight:"700", lineHeight:"1.45" }}>{palu.title}</div>
              <div style={{ fontSize:"12px", color:"#7AACBE", fontFamily:"Georgia,serif", fontStyle:"italic", lineHeight:"1.65" }}>{palu.body}</div>
              {palu.hint && (
                <div style={{ padding:"9px 12px", background:"rgba(20,40,90,0.4)", borderLeft:"2px solid #4A70C0", borderRadius:"0 4px 4px 0", fontSize:"11px", color:"#6090C0", fontFamily:"Georgia,serif" }}>
                  {palu.hint}
                </div>
              )}
              {step === 4 && (
                <div style={{ padding:"11px", background:"rgba(74,112,192,0.10)", border:"1px solid rgba(74,112,192,0.28)", borderRadius:"6px", textAlign:"center", fontFamily:"Cinzel,serif", fontSize:"10px", color:"#4A70C0", letterSpacing:"0.09em" }}>
                  ≋ WIND READER ADDED TO YOUR BAG ≋
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
      <g stroke="currentColor">{/* eslint-disable-next-line react/no-danger */}
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

function BirdModule({ name, onBack, onOpenBag, unlocked, onComplete }) {
  const [step,        setStep]       = useState(1);    // 1=field guide, 2=sightings challenge
  const [activeCard,  setActiveCard] = useState(0);    // which bird card is open
  const [sightingIdx, setSightingIdx]= useState(0);    // current sighting
  const [answers,     setAnswers]    = useState({});   // sightingIdx → chosen action
  const [confirming,  setConfirming] = useState(false);

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
          onComplete();
          setStep(3);
        } else {
          setSightingIdx(i => i + 1);
        }
      }, 1800);
    }
  };

  // Palu speech
  const paluStep1 = {
    title: `E ${name}. Watch what flies.`,
    body: "Before a star is visible, before the sun has risen — the birds are already there. Each species carries a different message. Study them in the field guide, then we will test your eye.",
  };

  const paluStep2 = () => {
    const ans = answers[sightingIdx];
    const correct = ans === currentSighting?.correct;
    if (!ans) return {
      title: `Day ${14 + sightingIdx}. A sighting.`,
      body: currentSighting?.context,
    };
    if (correct) return {
      title: "Correct.",
      body: sightingIdx < BIRD_SIGHTINGS.length - 1
        ? "The next day brings another sighting."
        : "Every bird read correctly. Your eye is sharp.",
    };
    return {
      title: "Look again.",
      body: `A ${currentBird?.label} — ${currentBird?.desc.split('.')[0]}. What does that tell you?`,
    };
  };

  const palu = step === 1 ? paluStep1 : step === 2 ? paluStep2() : {
    title: "The ʻiwa has found land.",
    body: "It did not return. Somewhere ahead, beyond the horizon, it is landing. You carry this knowledge now — and the bird guide — for the voyage ahead.",
  };

  const stepLabels = ["1 · Field Guide", "2 · Sightings", "✦ Done"];
  const accent = "#2A9A70";

  return (
    <div style={{ width:"100%", height:"100%", background:"#040C0A", display:"flex", flexDirection:"column", overflow:"hidden" }}>

      {/* Header */}
      <div style={{ height:"44px", borderBottom:"1px solid #0A1E18", background:"rgba(4,10,8,0.97)", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 22px", flexShrink:0 }}>
        <span style={{ fontFamily:"Cinzel,serif", fontSize:"12px", fontWeight:"700", color:"#C8941A", letterSpacing:"0.12em" }}>POLYNESIAN WAYFINDING</span>
        <span style={{ fontFamily:"Cinzel,serif", fontSize:"10.5px", color:"#2A9A70", letterSpacing:"0.09em" }}>HAUMĀNA · {name.toUpperCase()}</span>
      </div>

      {/* Module bar */}
      <div style={{ padding:"7px 22px", borderBottom:"1px solid #0A1E18", background:"rgba(4,10,8,0.6)", flexShrink:0 }}>
        <span style={{ fontFamily:"Cinzel,serif", fontSize:"9.5px", color:"#2A9A70", letterSpacing:"0.16em" }}>MODULE 5 · NGĀ MANU</span>
        <span style={{ fontFamily:"Cinzel,serif", fontSize:"9.5px", color:"#1A3028", marginLeft:"14px", letterSpacing:"0.1em" }}>THE BIRD GUIDE · READ WHAT FLIES</span>
      </div>

      {/* Body */}
      <div style={{ flex:1, display:"flex", overflow:"hidden", minHeight:0 }}>

        {/* Left panel */}
        <div style={{ width:"260px", flexShrink:0, borderRight:"1px solid #0A1E18", overflowY:"auto" }}>
          <div style={{ display:"flex", flexDirection:"column", gap:"12px", padding:"18px", boxSizing:"border-box" }}>

            <div style={{ display:"flex", gap:"8px" }}>
              <button onClick={onBack} style={{ flex:1, background:"none", border:"1px solid #0A1818", borderRadius:"4px", color:"#1A3028", fontSize:"9px", fontFamily:"Cinzel,serif", letterSpacing:"0.1em", padding:"7px", cursor:"pointer" }}>← MAP</button>
              <button onClick={onOpenBag} style={{ flex:1, background:unlocked.length>0?"rgba(200,148,26,0.10)":"none", border:`1px solid ${unlocked.length>0?"#C8941A55":"#0A1818"}`, borderRadius:"4px", color:unlocked.length>0?"#C8941A":"#1A3028", fontSize:"9px", fontFamily:"Cinzel,serif", letterSpacing:"0.1em", padding:"7px", cursor:"pointer" }}>
                {unlocked.length > 0 ? `✦ BAG (${unlocked.length})` : "✦ BAG"}
              </button>
            </div>

            {/* Step indicators */}
            <div style={{ display:"flex", gap:"4px" }}>
              {stepLabels.map((label, i) => {
                const done = i+1 < step, curr = i+1 === step;
                return <div key={i} style={{ flex:1, textAlign:"center", padding:"5px 1px", fontSize:"7px", fontFamily:"Cinzel,serif", letterSpacing:"0.04em", background:curr?`rgba(42,154,112,0.18)`:done?"rgba(26,120,110,0.18)":"rgba(255,255,255,0.03)", border:`1px solid ${curr?accent:done?"#1A8870":"#0E2018"}`, borderRadius:"4px", color:curr?"#3AC890":done?"#2BB5A0":"#1A3028" }}>{label}</div>;
              })}
            </div>

            {/* Palu speech */}
            <div style={{ background:"rgba(4,10,8,0.7)", border:"1px solid #0E1E14", borderRadius:"7px", padding:"16px", display:"flex", flexDirection:"column", gap:"10px" }}>
              <div style={{ fontSize:"9px", color:"#1A3828", fontFamily:"Cinzel,serif", letterSpacing:"0.14em" }}>THE PALU SPEAKS</div>
              <div style={{ fontSize:"14px", color:"#D0A838", fontFamily:"Cinzel,serif", fontWeight:"700", lineHeight:"1.45" }}>{palu.title}</div>
              <div style={{ fontSize:"12px", color:"#7AACBE", fontFamily:"Georgia,serif", fontStyle:"italic", lineHeight:"1.65" }}>{palu.body}</div>
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
                    <div key={bird.id} onClick={() => setActiveCard(i)}
                      style={{ padding:"10px 12px", marginBottom:"4px", borderRadius:"6px", cursor:"pointer",
                        border:`1px solid ${activeCard===i ? pal.fill+"66" : "#0A1818"}`,
                        background:activeCard===i ? `${pal.fill}10` : "rgba(255,255,255,0.02)" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                        <BirdSilhouette birdId={bird.id} color={activeCard===i ? pal.fill : "#2A5040"} size={28} />
                        <div>
                          <div style={{ fontFamily:"Cinzel,serif", fontSize:"10.5px", fontWeight:"700", color:activeCard===i ? "#D0C8A8" : "#2A4038" }}>{bird.name}</div>
                          <div style={{ fontFamily:"Cinzel,serif", fontSize:"8px", color:activeCard===i ? pal.fill : "#1A3028", letterSpacing:"0.06em", marginTop:"1px" }}>
                            {pal.label}
                          </div>
                        </div>
                      </div>
                    </div>
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
        <VoyageMap name={name} onNavigate={m => { if (m===1) setScreen("compass"); if (m===2) setScreen("sunarc"); if (m===3) setScreen("swells"); if (m===4) setScreen("wind"); if (m===5) setScreen("birds"); }} unlocked={unlocked} onOpenBag={() => setBagOpen(true)} onReset={handleReset} />
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
      {screen === "swells" && (
        <SwellModule
          name={name}
          onBack={() => setScreen("map")}
          onOpenBag={() => setBagOpen(true)}
          unlocked={unlocked}
          onComplete={() => unlock("wave_reader")}
        />
      )}
      {screen === "wind" && (
        <WindModule
          name={name}
          onBack={() => setScreen("map")}
          onOpenBag={() => setBagOpen(true)}
          unlocked={unlocked}
          onComplete={() => unlock("wind_reader")}
        />
      )}
      {screen === "birds" && (
        <BirdModule
          name={name}
          onBack={() => setScreen("map")}
          onOpenBag={() => setBagOpen(true)}
          unlocked={unlocked}
          onComplete={() => unlock("bird_guide")}
        />
      )}
    </>
  );
}