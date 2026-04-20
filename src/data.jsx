// Ocean Adventure — Game Data
// All static data constants extracted from App.jsx
// Edit this file to update narrative, scenario, or island data.

export const HOUSES = [
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

// STARS — updated for Tonga → Sāmoa heading (NNE, ~22.5°, house: Nāleo-Koʻolau)
// Correct star: Mānaiakalani (Vega, dec +38.8°) rises at ~22° from north when observed
// from Tonga's latitude (21°S) — historically used for NNE headings in the western Pacific
export const STARS = [
  {
    id: "manaiakalani", name: "Mānaiakalani", western: "Vega",
    angle: 22.5, r: 7, color: "#C0E8FF", correct: true,
    desc: "Rises in Nāleo-Koʻolau — just north-northeast. In the old stories shared between Tonga and Sāmoa, this star marked the path the first voyagers followed when the two islands first met. Keep it in mind.",
  },
  {
    id: "hokule_a", name: "Hōkūleʻa", western: "Arcturus",
    angle: 67.5, r: 7, color: "#FFD060", correct: false,
    desc: "The zenith star of Hawaiʻi — it passes directly overhead there. Rises in ʻĀina-Koʻolau, east-northeast. Too far east for our NNE heading to Sāmoa.",
  },
  {
    id: "tawera", name: "Tāwera", western: "Venus",
    angle: 78.75, r: 10, color: "#FFE840", correct: false,
    desc: "The morning star — the brightest object in the sky on many nights. But Tāwera is a planet and drifts across houses over weeks. Reliable only in short windows, not for a multi-day voyage.",
  },
  {
    id: "takurua", name: "Takurua", western: "Sirius",
    angle: 101.25, r: 8, color: "#A0C8FF", correct: false,
    desc: "The brightest true star in the sky. Rises in Lā-Malanai — east-southeast. A beautiful star, but this heading would carry us southeast, away from Sāmoa.",
  },
  {
    id: "atutahi", name: "Atutahi", western: "Canopus",
    angle: 146.25, r: 6, color: "#FFFCE0", correct: false,
    desc: "The great southern anchor — it barely moves all night because it sits close to the south celestial pole. Rises far south of east. Use it to check your latitude, never as a northbound guide.",
  },
];

// Journey order: Tonga(home) → Sāmoa(1) → Tahiti(2) → Marquesas(3) → Hawaiʻi(4) → Fiji(5) → Tonga return(6) → Aotearoa(7)
// Module unlock items in order: star_compass, sun_arc, wave_reader, wind_reader, bird_guide, cloud_reader
export const JOURNEY_ORDER = [
  { island: "tonga",    module: 0, unlockItem: null         },
  { island: "samoa",    module: 1, unlockItem: "star_compass" },
  { island: "tahiti",   module: 2, unlockItem: "sun_arc"      },
  { island: "marquesas",module: 3, unlockItem: "wave_reader"  },
  { island: "hawaii",   module: 4, unlockItem: "wind_reader"  },
  { island: "fiji",     module: 5, unlockItem: "bird_guide"   },
  { island: "tonga",    module: 6, unlockItem: "cloud_reader" },
  { island: "aotearoa", module: 7, unlockItem: null           },
];

// Helper: given unlocked bag items, return which journey step we're on (0-indexed)
export const getJourneyStep = (unlocked) => {
  const items = ["star_compass","sun_arc","wave_reader","wind_reader","bird_guide","cloud_reader"];
  return items.findIndex(item => !unlocked.includes(item));
  // returns -1 if all unlocked (final voyage available)
};

export const ISLANDS = [
  { id: "hawaii",    name: "Hawaiʻi",          x: 380, y: 55,  module: 4, active: true,  label: "Module 4 · Wind Patterns" },
  { id: "marquesas", name: "Marquesas",         x: 530, y: 175, module: 3, active: true,  label: "Module 3 · Ocean Swells" },
  { id: "tahiti",    name: "Tahiti",            x: 450, y: 310, module: 2, active: true,  label: "Module 2 · Sun Arc" },
  { id: "samoa",     name: "Sāmoa",             x: 245, y: 200, module: 1, active: true,  label: "Module 1 · Star Compass" },
  { id: "tonga",     name: "Tonga",             x: 210, y: 310, module: 6, active: true,  label: "Home · Module 6 · Return Voyage", isHome: true },
  { id: "fiji",      name: "Fiji",              x: 130, y: 248, module: 5, active: true,  label: "Module 5 · Bird Guide" },
  { id: "aotearoa",  name: "Aotearoa",          x: 118, y: 430, module: 7, active: true, label: "Final Voyage · Tonga → Aotearoa" },
  { id: "rarotonga", name: "Rarotonga",         x: 330, y: 370, module: null, active: false },
  { id: "rapanui",   name: "Rapa Nui",          x: 640, y: 390, module: null, active: false },
];

// Sea roads — shown dynamically as the voyage progresses (revealed after each leg)
// unlockAfterStep: show this road once the player has completed journeyStep N
export const VOYAGE_ROADS = [
  { from: "tonga",    to: "samoa",     name: "Te Ara Sāmoa",        unlockAfterStep: 0 }, // always visible (home→first destination)
  { from: "samoa",    to: "tahiti",    name: "Ke Ala Tahiti",        unlockAfterStep: 1 },
  { from: "tahiti",   to: "marquesas", name: "Te Ara Marquesas",     unlockAfterStep: 2 },
  { from: "marquesas",to: "hawaii",    name: "Ke Ala Hawaiʻi",       unlockAfterStep: 3 },
  { from: "hawaii",   to: "fiji",      name: "Te Ara Viti",          unlockAfterStep: 4 },
  { from: "fiji",     to: "tonga",     name: "Te Ara Kāinga",        unlockAfterStep: 5 },
  { from: "tonga",    to: "aotearoa",  name: "Ara-i-te-uru",         unlockAfterStep: 6 },
];

// Keep SEA_ROADS for backward compat but leave empty (roads now driven by VOYAGE_ROADS)
export const SEA_ROADS = [];

export const TRIANGLE = ["hawaii", "rapanui", "aotearoa"];

export const BAG_ITEMS = [
  {
    id: "sweet_potato_seeds", name: "Sweet Potato Seeds", hawaiian: "ʻUala",
    unlockedBy: "home", icon: "🍠", color: "#C8741A",
    content: [
      { label: "The king's gift",  body: "A drought-resistant variety cultivated by the king of Tonga. Hardy, plentiful, and able to grow in poor soil. Your mission: share these seeds across the ocean." },
      { label: "Why it matters",   body: "In years when the rains fail, a resilient crop may be the difference between hunger and survival. These seeds carry the hope of communities yet to receive them." },
    ],
  },
  {
    id: "star_compass", name: "Star Compass", hawaiian: "Ka Pā Hōkū",
    unlockedBy: "module1", icon: "✦", color: "#C8941A",
    content: [
      { label: "32 Houses",        body: "The horizon is divided into 32 houses, each 11.25° apart. Four quadrants: Koʻolau (NE), Malanai (SE), Kona (SW), Hoʻolua (NW)." },
      { label: "Mānaiakalani",     body: "Vega. Rises in Nāleo-Koʻolau (NNE). From Tonga, your guide star for Sāmoa — keep it on your starboard bow through the night." },
      { label: "Hōkūleʻa",        body: "Arcturus. Rises in ʻĀina-Koʻolau (ENE). Zenith star of Hawaiʻi — used for the long crossing to the north." },
      { label: "Takurua",          body: "Sirius. Brightest in the sky. Rises in Lā-Malanai (SE). Latitude checker, not a heading star." },
      { label: "Atutahi",          body: "Canopus. Southern anchor. Never sets south of 20°S — use to confirm you are in the deep south." },
    ],
  },
  {
    id: "samoan_star_map", name: "Samoan Star Map", hawaiian: "Faʻailoga Fetu",
    unlockedBy: "module1gift", icon: "⭐", color: "#7AACBE",
    content: [
      { label: "A gift from Sāmoa", body: "The Samoan wayfinders were impressed by your navigation. They have shared a star map marking the seasonal positions of key stars as seen from the central Pacific — a guide for future voyages." },
      { label: "Matagi fetu",        body: "The Samoan tradition of reading the wind alongside the stars — Matagi (wind) and Fetu (star) together tell the full story of any crossing." },
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
  {
    id: "taro_plant", name: "Taro Plant", hawaiian: "Talo",
    unlockedBy: "module3gift", icon: "🌿", color: "#2A8050",
    content: [
      { label: "A gift from Marquesas", body: "The new wayfarer of the Marquesas gifted you a rare variety of taro — able to weather stormy springs and dry summers where other crops fail." },
      { label: "Why taro matters",      body: "Taro has sustained Pacific peoples for thousands of years. This hardy variety, grown correctly, may prove as valuable as the sweet potato seeds you carry." },
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
    id: "cloud_reader", name: "Cloud & Sea Reader", hawaiian: "Kapua me te Moana",
    unlockedBy: "module6", icon: "☁", color: "#7A9EC8",
    content: [
      { label: "Tu Kapua",       body: "A stationary cloud sitting still while others move is standing over land. Low atolls invisible to the eye can still be read from 50+ km." },
      { label: "Lagoon glow",    body: "A green or turquoise tint in the underside of clouds — light reflecting off a coral lagoon below. A sign of shallow water and an atoll near." },
      { label: "Ocean colour",   body: "Deep ocean is dark blue-purple. Shallow water near reefs turns green. Freshwater outflow from rivers tints the sea brown — land upstream." },
      { label: "Kupe's signs",   body: "Floating pumice, driftwood, seaweed mats — all mean land is not far. The direction they drift tells you which way the current has come from." },
    ],
  },
];

/* ══════════════════════════════════════════════════════════════
   SUN ARC DATA
══════════════════════════════════════════════════════════════ */

export const SUN_SCENARIOS = [
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
export const SWELL_SCENARIOS = [
  {
    id: "A",
    label: "Scenario A · Tahiti to Marquesas",
    // Tahiti (17°S 149°W) → Marquesas (10°S 140°W): bearing ~NNE 25°
    // SE trade swell from ~135° (classic Pacific trade swell)
    swellFromDeg: 135,       // swell FROM SE — classic South Pacific trade swell
    swellLabel: "Southeast",
    swellPeriod: 14,         // seconds (long-period = ocean swell)
    windFromDeg: 115,        // wind FROM ESE — SE trades curving slightly east here
    heading: 25,             // canoe heading NNE toward Marquesas
    hullAngle: 110,          // swell hits starboard beam/quarter for NNE heading
    dirOptions: ["Northeast", "Southeast", "Southwest", "Northwest"],
    correctDir: "Southeast",
    headingOptions: [5, 25, 45, 70],
    correctHeading: 25,
    interferenceType: "block",
  },
];

/* ══════════════════════════════════════════════════════════════
   WIND DATA
══════════════════════════════════════════════════════════════ */

// Pacific wind map — schematic, not cartographic
export const WIND_MAP_W = 700;
export const WIND_MAP_H = 440;

export const latLonToXY = (lat, lon) => ({
  x: ((lon + 180) / 80) * WIND_MAP_W * 0.72 + 30,
  y: ((35 - lat) / 70) * WIND_MAP_H,
});

export const WIND_BELTS = {
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

// Scenario: Marquesas (10°S 140°W) → Hawaiʻi (20°N 156°W) — heading NNW ~335°
// Must cross ITCZ, then ride NE trades from the north side
export const WIND_SCENARIO = {
  depart:  { name: "Marquesas", lat: -10, lon: -140 },
  arrive:  { name: "Hawaiʻi",   lat:  20, lon: -156 },
  // bearing options — correct is ~335° (NNW): aim slightly west, cross ITCZ, let NE trades carry you
  bearingOptions: [315, 335, 355, 20],
  correctBearing: 335,
  correctLabel: "NNW — cross the ITCZ, ride the NE trades home",
  windName: "NE Trade Wind",
  elNinoEffect: "weaken",
  elNinoOptions: ["Shift the ITCZ south", "Strengthen the NE trades", "Push the waka west", "Make the crossing shorter"],
  correctElNino: "Shift the ITCZ south",
};

/* ══════════════════════════════════════════════════════════════
   BIRD DATA
══════════════════════════════════════════════════════════════ */

export const BIRD_TYPE_META = {
  land:      { fill:"#00C896", faint:"rgba(0,200,150,0.12)",  label:"Land signal bird",  explain:"Nests on shore — follow it toward land" },
  trap:      { fill:"#FF6B4A", faint:"rgba(255,107,74,0.12)", label:"Pelagic trap",       explain:"Lives at sea — following it leads nowhere" },
  carrier:   { fill:"#FFB830", faint:"rgba(255,184,48,0.12)", label:"Carrier tool",       explain:"Brought aboard — release to find land" },
  migratory: { fill:"#48CAE4", faint:"rgba(72,202,228,0.12)", label:"Migratory bird",     explain:"Seasonal direction signal, not land proximity" },
};

export const BIRDS = [
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
export const BIRD_SIGHTINGS = [
  { birdId: "white_tern",      context: "Dawn. Two white birds flying northeast.",       correct: "land" },
  { birdId: "iwa_pelagic",     context: "Midday. A large dark bird circling overhead.",  correct: "ignore" },
  { birdId: "noddy",           context: "Late afternoon. Dark terns flying low, south.", correct: "land" },
  { birdId: "golden_plover",   context: "Dawn. A flock of speckled birds heading north.",correct: "bearing" },
  { birdId: "iwa_carrier",     context: "The cage stirs. You feel land is near.",        correct: "release" },
];

export const VOYAGE_NODES = [
  {
    id: "stars",
    day: "Night 1",
    skill: "Star Compass",
    scene: "🌟",
    setup: "You stand alone on the pola. Palu stayed behind — he left notes. His handwriting, by firelight before you sailed: \"Bearing SE, about 155°. Use your compass. Find Atutahi — it will not leave you.\"",
    question: "Aotearoa lies SE at roughly 155°. Which star guides you through the night?",
    options: [
      { id: "atutahi",    text: "Atutahi (Canopus)",       correct: true  },
      { id: "hokule_a",   text: "Hōkūleʻa (Arcturus)",    correct: false },
      { id: "manaiakalani",text:"Mānaiakalani (Vega)",     correct: false },
      { id: "tawera",     text: "Tāwera (Venus)",          correct: false },
    ],
    hint: "Atutahi — Canopus — is the great southern anchor star. It rises in Nālani-Malanai, south-southeast. From Tonga heading south, keep it to port and you hold your bearing through the night.",
    correct: "Atutahi. The southern anchor. Palu knew you would find it.",
  },
  {
    id: "sun",
    day: "Day 3",
    skill: "Sun Arc",
    scene: "☀",
    setup: "Cloud has covered the stars for two nights. But Tama-nui-te-rā still crosses the sky. Palu's note: \"If you lose the stars, use the sun. Equinox — no correction. Latitude = 90° minus noon altitude.\"",
    question: "Local noon. The sun stands 49° above the northern horizon. What is your latitude?",
    options: [
      { id: "28s", text: "28°S", correct: false },
      { id: "35s", text: "35°S", correct: false },
      { id: "41s", text: "41°S", correct: true  },
      { id: "47s", text: "47°S", correct: false },
    ],
    hint: "Latitude = 90° − 49° = 41°. At the equinox, no seasonal correction is needed. You are at 41°S — deep into the southern ocean, approaching Aotearoa's latitude.",
    correct: "41°S. You are almost there. Aotearoa lies near 37°S — you will need to aim north as you approach.",
  },
  {
    id: "swells",
    day: "Day 5",
    skill: "Ocean Swells",
    scene: "🌊",
    setup: "The swell has changed. The long SE trade swell you left Tonga with — steady, reliable — has given way to something different. A new roll, from the southwest, slow and massive. Palu's note: \"When the swell changes, the ocean is telling you where you are.\"",
    question: "The long swell now rolls in from the southwest instead of the southeast. What has happened?",
    options: [
      { id: "storm",    text: "A storm is approaching from the SW",                      correct: false },
      { id: "southern", text: "You have crossed into the Southern Ocean's westerly swell zone", correct: true  },
      { id: "current",  text: "A current has pushed you off course to the west",         correct: false },
      { id: "land",     text: "Land is behind you to the southwest",                     correct: false },
    ],
    hint: "Around 30°S, the SE trade swell gives way to the long-period westerly swell generated by the Southern Ocean storms. This is not a warning — it is a position marker. You have crossed the boundary.",
    correct: "Correct. The Southern Ocean's westerly swell. You have crossed 30°S. Aotearoa is close now.",
  },
  {
    id: "wind",
    day: "Day 7",
    skill: "Wind Patterns",
    scene: "💨",
    setup: "The SE trades are gone. A steady wind now comes from the WNW — the Roaring Forties. Palu's note: \"In the forties the wind comes from the west. It will push you northeast. Do not fight it. Use it. Think about what I taught you.\"",
    question: "The WNW westerlies will push you northeast if you hold your original bearing. What is the correct response?",
    options: [
      { id: "hold",    text: "Hold the SE bearing and fight the wind",                  correct: false },
      { id: "south",   text: "Bear further south to compensate — let the wind carry you onto the mark", correct: true  },
      { id: "north",   text: "Turn back north into the trade winds",                    correct: false },
      { id: "wait",    text: "Heave to and wait for the wind to change",                correct: false },
    ],
    hint: "In the trades, you aimed upwind of your destination to compensate for the wind pushing you west. The same logic applies: the westerlies push you northeast, so aim southwest of Aotearoa. Let the wind carry you onto the mark.",
    correct: "Bear south. The wind becomes your ally. Palu wrote: \"A navigator who fights the wind is tired. A navigator who uses it arrives rested.\"",
  },
  {
    id: "birds",
    day: "Day 8",
    skill: "Bird Signs",
    scene: "🐦",
    setup: "At dusk, you sight birds. Three white terns — Manu-o-kū — flying to the northwest. Matala would know what to do. Palu's note: \"At dusk, follow them. At dawn, watch which way they leave. The rule never fails.\"",
    question: "Three white terns fly northwest at dusk. What does this tell you?",
    options: [
      { id: "land_nw",  text: "Land is to the northwest — they are flying home to roost", correct: true  },
      { id: "storm_nw", text: "A storm approaches from the northwest",                    correct: false },
      { id: "sea",      text: "They are heading out to sea for the night — ignore them",  correct: false },
      { id: "nothing",  text: "Terns at dusk carry no useful signal",                     correct: false },
    ],
    hint: "At dusk, land-based birds fly inland to roost. The direction they fly = the direction of land. Manu-o-kū flying northwest means land is northwest. They are going home.",
    correct: "Northwest. Land. Tomorrow at dawn watch where they leave from — that will confirm it. Aotearoa.",
  },
  {
    id: "clouds",
    day: "Day 9",
    skill: "Clouds & Sea Signs",
    scene: "☁",
    setup: "The horizon ahead is alive with signs. A stationary cloud while others move. The water beneath the bow has turned green. Kelp floats past from the south. And a frigatebird circles overhead. Palu's note: \"Read everything. But remember what I told you about the ʻiwa.\"",
    question: "Four things are visible. Which one is NOT a reliable sign of land?",
    options: [
      { id: "cloud",     text: "A cloud sitting still while others move",           correct: false },
      { id: "green",     text: "The water turning from blue to green",              correct: false },
      { id: "frigatebird",text:"A frigatebird circling overhead",                  correct: true  },
      { id: "kelp",      text: "Kelp floating up from the south",                  correct: false },
    ],
    hint: "The frigatebird — the ʻiwa — sleeps on the open ocean for weeks without landing. It tells you nothing about land. The standing cloud, the green water, and the kelp are all real signs. The frigatebird is the pelagic trap.",
    correct: "The ʻiwa. You remembered. Everything else — the cloud, the colour, the kelp — those are real. Land is very close now.",
  },
];

// Waypoints for the waka's position along the route (in SVG coords for the voyage map)
export const VOYAGE_WAYPOINTS = [
  { x: 440, y: 75  }, // Tonga (start)
  { x: 400, y: 115 }, // After node 1 (stars)
  { x: 355, y: 168 }, // After node 2 (sun)
  { x: 298, y: 228 }, // After node 3 (swells)
  { x: 238, y: 290 }, // After node 4 (wind)
  { x: 178, y: 345 }, // After node 5 (birds)
  { x: 128, y: 395 }, // After node 6 (clouds)
  { x: 88,  y: 430 }, // Aotearoa (end)
];

export const BRIDGE_CONTENT = {
  1: {
    destination: "Sāmoa",
    arrivalScene: "🏝",
    paluLines: [
      "We have made it to Sāmoa! Congratulations, young Wayfinder. You carry the star compass in your mind now.",
      "Let's rest here, and see if we can find anyone to talk with.",
    ],
    storyTitle: "The Star Compass",
    story: "The thirty-two houses of the horizon are not lines on a chart — they are held in the mind. Nainoa Thompson, who revived this knowledge in the twentieth century, described the compass as something you build inside yourself during training, until you can feel where every house sits even with your eyes closed. The star does not move. You move around it. That is the secret.",
    storyCitation: "Polynesian Voyaging Society tradition",
    bagItems: ["star_compass", "samoan_star_map"],
    bagNote: "The Samoan wayfinders were impressed. Before we left, they gifted us their seasonal star map — a record of star positions as seen from the central Pacific. It joins the star compass in your bag.",
    bridgeLine: "We've been able to rest and exchange knowledge with the Samoans. But we cannot stay — we have more people to meet and we have not yet found a companion for our feathered friend. Let's prepare to sail. Tahiti is waiting.",
  },
  2: {
    destination: "Tahiti",
    arrivalScene: "☀",
    paluLines: [
      "There. The green of the mountains — do you see it? Tahiti.",
      "I came here once, years ago, when the old wayfinding master Tū-te-rangi-ātea still held court on Raʻiatea. He has passed on now. But the marae still stands, and knowledge lives here. Let us see what we can learn.",
      "The sun guided us across that crossing. You read it well.",
    ],
    storyTitle: "Tama-nui-te-rā",
    story: "Māui, the great trickster, lassoed the sun with his grandmother's jawbone to slow its crossing of the sky — giving the people more daylight to dry their fish and finish their work. Navigators carry a version of this story too: the sun at the solstice barely moves in altitude for days. That stillness is a gift. A long, stable noon means a long, reliable latitude fix — days of the same reading, not just one.",
    storyCitation: "Māui cycle, Polynesian oral tradition",
    bagItems: ["sun_arc"],
    bagNote: "The sun arc joins your bag — a mental instrument. No sextant, no quadrant. Just the angle of your arm and the memory of what Palu showed you.",
    bridgeLine: "Two nights here. Then we sail north-northeast — to the Marquesas. The swells up there will feel different from anything you have felt before. I will teach you to read them.",
  },
  3: {
    destination: "Marquesas",
    arrivalScene: "🌊",
    paluLines: [
      "Three days on that ocean. You read the swell well — I barely had to say a word.",
      "I have old friends ashore here. Tonight we eat, rest, and trade stories around the fire. They will want to hear about Tonga.",
      "The new wayfarer of the Marquesas — a young woman named Hina — has gifted us a cutting from a drought-resistant taro. It needs water each day. Treat it carefully.",
    ],
    storyTitle: "Reading by Feel",
    story: "Mau Piailug — Mau of Satawal — could read two separate swell trains simultaneously while lying in the hull of Hōkūleʻa with his eyes closed. He learned this as a child, sleeping on the outrigger platform of his father's canoe, letting the sea teach his body before his mind could interfere. He said a navigator who must think about the swell has not yet learned it. When it is truly known, it is simply there — like breathing.",
    storyCitation: "Ben Finney, Voyage of Rediscovery, 1994",
    bagItems: ["wave_reader", "taro_plant"],
    bagNote: "The wave reader and the taro cutting both join your bag. One teaches you to read the sea. The other feeds people when the rains fail. Both are worth carrying carefully.",
    bridgeLine: "Two nights here, then northwest. Hawaiʻi — the longest crossing of the voyage. We must cross the doldrums to get there. Sleep well. I will explain in the morning.",
  },
  4: {
    destination: "Hawaiʻi",
    arrivalScene: "🌺",
    paluLines: [
      "The doldrums gave us two hard days — calms, then squalls, then confused wind from every direction. But you held your nerve. We are through.",
      "There. The first island. Hawaiʻi. The NE trades brought us in exactly where we planned.",
      "Tonight we rest ashore. Tomorrow we share the last of the sweet potato cuttings with the chiefs here. Then sleep — real sleep.",
    ],
    storyTitle: "The Wind Has Names",
    story: "In Pacific tradition, naming the wind is not poetry — it is navigation. Hau, Matagi, Tokelau, Rēhia — each name carries information about season, bearing, and what the wind means for a voyage. A navigator who knows the names knows what each wind will do next and where it has come from. Unnamed wind is dangerous wind. When Palu tells you to learn the wind's names, he is telling you to study its patterns until they have the solidity of facts.",
    storyCitation: "Pacific voyaging oral tradition",
    bagItems: ["wind_reader"],
    bagNote: "The wind reader is yours now. Trade winds, ITCZ, El Niño shifts — you have read them all. You have crossed the longest passage of the voyage.",
    bridgeLine: "From here we swing southwest to Fiji. A shorter crossing — and the birds will guide us in. Pay attention to what flies.",
  },
  5: {
    destination: "Fiji",
    arrivalScene: "🐦",
    paluLines: [
      "The frigatebirds led us straight in — just as I said they would. Fiji.",
      "The people here are old friends of Tonga. We share deep roots. Tonight there will be a feast — and I suspect Matala will be very interested in some of the birds we saw on the approach.",
      "I noticed her watching a pair of lories in the trees above the reef. She pretended not to notice me noticing.",
    ],
    storyTitle: "The Bird Roads",
    story: "Ancient navigators did not simply watch birds — they maintained mental maps of bird territories, migration routes, and daily patterns across the whole ocean. Some voyages were deliberately timed to follow bird migrations: a voyage from Tahiti to Aotearoa might follow the long-tailed cuckoo south, just as a voyage to Hawaiʻi followed the Pacific golden plover north. The birds were not just signs of land — they were guides, calendars, and companions.",
    storyCitation: "Harold Gatty, The Raft Book, 1943; Polynesian voyaging oral tradition",
    bagItems: ["bird_guide"],
    bagNote: "The bird guide joins your bag — and Matala has found her companion on the island of Fiji. She has been unusually quiet ever since, which for Matala means something.",
    bridgeLine: "One last crossing to get home. Fiji to Tonga — southeast, familiar water. The clouds and the sea itself will tell us when we are close. I will show you the last of what I know.",
  },
  6: {
    destination: "Tonga",
    arrivalScene: "⚓",
    paluLines: [
      "Tonga. Home. Can you smell the land? There is nothing like it after weeks at sea.",
      "You have done something remarkable on this voyage. I have been teaching for thirty years — not every student learns as fast as you have.",
      "Come. Let us bring the taro ashore before we celebrate. It has had a long journey too.",
    ],
    storyTitle: "Kupe's Instructions",
    story: "Before Kupe departed Hawaiki for Aotearoa, he left sailing instructions for those who would follow. Not coordinates — there were none. Instead: watch for the long south swells. Keep the star to port. When clouds appear that do not move, sail toward them. When the sea changes colour — greenish, turbid — land is below. When seabirds fly inland at dusk, follow them the next morning. He described a complete sensory system. Every sign in this voyage is part of that same system.",
    storyCitation: "Kupe narrative, Māori oral tradition",
    bagItems: ["cloud_reader"],
    bagNote: "The cloud and sea reader joins your bag — the final tool of a wayfinder. Standing cloud, lagoon glow, water colour, debris drift. You have learned every sign.",
    bridgeLine: "Rest. Eat. Sleep in a real place. When you are ready — there is one more thing I need to ask of you. But it can wait until morning.",
  },
};

/* ══════════════════════════════════════════════════════════════
   BRIDGE SCREEN — arrival narrative shown after each module
══════════════════════════════════════════════════════════════ */

export const MODULE_CONTENT = {
  1: {
    accent: "#C8941A",
    hawaiian: "Ka Pā Hōkū",
    destination: "Sāmoa",
    departure: { location: "Tongatapu, Tonga", note: "The beach at dusk. Shells laid in a circle in the sand." },
    intro: {
      quote: "First, apprentice — let us travel together to Sāmoa. It is a shorter crossing, a good place to begin your training. The stars will guide us.",
      attribution: "Palu Hemi, Tongatapu",
      facts: [
        "Sāmoa lies roughly NNE of Tonga — about 800 km across open ocean, a 3-4 day voyage in favourable conditions.",
        "The Samoan islands were settled by Lapita voyagers around 800 BCE, making them one of the oldest Polynesian cultures in the Pacific.",
        "Samoan navigators are known for their tradition of Vā — the relational space between people and nature — which includes a deep reading of ocean, wind, and sky.",
      ],
    },
    learn: {
      title: "The Star Compass",
      concepts: [
        { heading: "Using the Stars", body: "Your first skill will be to learn the stars to help you navigate. In the north, sailors follow Polaris — the north star — because it sits directly above the Earth's pole and barely moves. From Tonga, Polaris is below the horizon. We cannot use it. There is no bright star above the south pole either. So our ancestors asked a different question: not 'which star stays still?' but 'what about a star never changes?'" },
        { heading: "Star Rise and Star Set", body: "A star moves across the sky all night — it rises, arcs overhead, and sets. That moving position is useless for navigation. But the point on the horizon where it rises is fixed. It rises in exactly the same place tonight as it did last night, last season, and a hundred years ago. That fixed point on the horizon is our compass. We do not navigate by where a star is in the sky. We navigate by where it touches the horizon." },
        { heading: "Dividing the Sky", body: "Palu Hemi points to the shells on the sand and starts drawing lines through the circle with his finger. The horizon is divided into 32 equal houses, each spanning 11.25°. Every star rises in one house and sets in the opposite — every night, for centuries. The compass does not move. You hold it in your mind and carry it to sea." },
        { heading: "The Four Quadrants", body: "There are four quadrants: Koʻolau (NE), Malanai (SE), Kona (SW), and Hoʻolua (NW). The four cardinal points are Ākau (N), Hikina (E), Hema (S), and Komohana (W). Each name belongs to a wind, a direction, a feeling on the water. These names were passed down through chant and memorised, not derived from a formula." },
        { heading: "How to Find Sāmoa", body: "The last Wayfinder shared a story with us of his voyage to Sāmoa, and named its house as Nāleo-Koʻolau. Nāleo means 'voices' or 'sounds' — these houses carry the voices of the navigators who named them. Nāleo-Koʻolau sits about 22.5° from north. We know Sāmoa lies there because a trusted navigator said so, and we are trusting he told the story right." },
        { heading: "Reading with Anchor Stars", body: "Different stars are visible on different nights — seasons change which ones rise before dawn. So a navigator learns many stars for each part of the horizon, not just one. Hōkūleʻa anchors the ENE. Takurua anchors the ESE. Atutahi anchors the deep south. When one guide star sets or climbs too high, you switch to another in the same house, or use a different star to cross-check your heading." },
        { heading: "Mānaiakalani — Your Guide", body: "Mānaiakalani rises in Nāleo-Koʻolau — north-northeast, exactly where Sāmoa lies. Keep it on your starboard bow as it rises from the horizon and you hold your heading. When it climbs too high to give direction, check it against Hōkūleʻa to your right and Ākau (north) above — you should be holding the angle between them. Mānaiakalani is the hook of Māui, and tonight it hooks us toward Sāmoa." },
      ],
    },
  },
  2: {
    accent: "#D06030",
    hawaiian: "Tama-nui-te-rā",
    destination: "Tahiti",
    departure: { location: "Apia, Sāmoa", note: "The harbour before sunrise. The stars are fading. Palu stands at the water's edge and traces the sun's coming arc across the sky with his hand." },
    intro: {
      quote: "Great work on our first voyage. The Samoan wayfinders were impressed — they shared their star maps with us, and a story about how their ancestors first found Tahiti. Now for a new challenge: the stars are not always visible. We need to learn the sky by day as well as by night. Our next destination is Tahiti, and the sun will help us find it.",
      attribution: "Palu Hemi",
      facts: [
        "Tahiti lies roughly ESE of Sāmoa — a long crossing of about 2,500 km through the heart of the South Pacific.",
        "Tahiti and its neighboring island Raʻiatea are considered the spiritual homeland of much of eastern Polynesia — Raʻiatea's marae Taputapuātea was a gathering place for navigators from across the ocean.",
        "The Society Islands were likely settled from the Marquesas around 300 CE, and later became the launching point for voyages to Hawaiʻi and Aotearoa.",
      ],
    },
    learn: {
      title: "The Sun's Arc",
      concepts: [
        { heading: "Every island has a star", body: "Each island in the ocean has a zenith star — a star that passes directly overhead at its latitude. This is not a coincidence. Every star sits at a fixed height above the celestial equator. When you sail south until that star passes above your head, you are on that island's path. Tahiti's zenith star is ʻAʻā — what we know as Sirius, the brightest star in the sky." },
        { heading: "ʻAʻā belongs to Tahiti", body: "ʻAʻā sits permanently 17° south of the celestial equator. Tahiti lies at 17° south latitude. These are the same number — that is how a zenith star works. When ʻAʻā passes directly above your head and not in front of you, you are standing on Tahiti's invisible path across the ocean. Sail east along that path, and Tahiti will find you." },
        { heading: "The problem: two nights of cloud", body: "ʻAʻā rises only at night. But the clouds have hidden the stars for two nights now. Palu needs a daytime method. Here is the key: the noon sun and ʻAʻā travel the same dome — but ʻAʻā lives 17° south of where the equinox sun peaks. They are partners. When the noon sun is 17° short of directly overhead, ʻAʻā would pass directly overhead tonight. The sun is ʻAʻā's shadow." },
        { heading: "Reading the noon sun", body: "At the equinox, the noon sun peaks on the celestial equator — directly overhead at the equator, falling 1° short for every degree south you sail. At Tahiti's latitude (17°S), the sun is 17° short of directly overhead. Palu measures that gap — not from the horizon upward, but from the zenith downward. At arm's length, one hand-width is roughly 6°. Three hand-widths below the zenith point is Tahiti. No formula. Just a gap Palu has memorised." },
      ],
    },
  },
  3: {
    accent: "#2A90A8",
    hawaiian: "Te Moana",
    destination: "Marquesas",
    departure: { location: "Papeete, Tahiti", note: "The shore before dawn. Palu sketches a cross-section in the wet sand with a stick." },
    intro: {
      quote: "You are learning fast — faster than I expected, and I expected a lot. The wayfinders of Tahiti have shared their knowledge freely with us. Now we sail north-northeast. The Marquesas. Some of the most remote islands on earth, and perhaps the most important launching point in all of Polynesian history.",
      attribution: "Palu Hemi, Tahiti",
      facts: [
        "The Marquesas Islands lie NNE of Tahiti — about 1,500 km across open ocean, in the direction of the Nāleo-Koʻolau house on the star compass.",
        "The Marquesas are among the most remote inhabited islands on Earth and were likely the first eastern Polynesian islands to be settled, around 300 CE.",
        "Marquesan voyagers are believed to have launched the great expansion to Hawaiʻi, Easter Island, and possibly the Americas — making this archipelago one of the most important waypoints in Pacific navigation history.",
      ],
    },
    // TODO: Add stick chart visual/exchange mechanic at Marquesas arrival (future island arrival screen)
    learn: {
      title: "Ocean Swells",
      concepts: [
        { heading: "Swells vs waves", body: "Swells are generated by distant storms, travel thousands of kilometres, and keep their direction for days. Wind-waves are local, short, and chaotic. Learn to filter out the noise and feel only the swell." },
        { heading: "Period is the key", body: "A 14-second swell means one crest every 14 seconds passing under the hull. Wind-waves are 3–6 seconds. Long period = ocean swell = reliable compass. Short period = local wind = ignore it." },
        { heading: "Island interference", body: "Islands disturb swells in three ways: Block (calm shadow behind), Refract (swells bend around the sides), Reflect (cross-chop bounces back ahead). You can detect an island 30–40 km away by how the hull moves." },
        { heading: "Mau's method", body: "Master navigator Mau Piailug would lie flat in the hull, feet touching the sides, to feel swell direction through his whole body. He could separate two different swell trains simultaneously — and navigate by both." },
        { heading: "The Marshallese Stick Chart", body: "Not all navigators kept their knowledge only in their minds. The navigators of the Marshall Islands created rebbelib — stick charts made from curved sticks and shells, recording the pattern of swells around islands. These were teaching tools built on shore, not carried to sea — the knowledge was memorised, then the chart left behind. On our next stop, a Marquesan navigator will show us one." },
      ],
    },
  },
  4: {
    accent: "#4A70C0",
    hawaiian: "Hau me Matagi",
    destination: "Hawaiʻi",
    departure: { location: "Atuona, Marquesas", note: "The valley floor at evening. A fire, a map drawn in ash." },
    intro: {
      quote: "Now for the longest crossing of our journey — northwest to Hawaiʻi. Last night around the fire, one of the Marquesan elders shared the story of Makanikeoe, a trickster wind spirit who disguised himself as a fellow traveller, then slowly shifted direction until the navigator was completely lost. A story. But a useful one. Wind alone will not get us there — you must understand it, not just follow it.",
      attribution: "Palu Hemi, Marquesas",
      facts: [
        "Hawaiʻi is the northernmost point of the Polynesian Triangle, about 3,200 km northwest of the Marquesas — a major crossing through the ITCZ.",
        "The Polynesian settlement of Hawaiʻi is estimated to have occurred around 300–600 CE, most likely from the Marquesas, with a later wave from Tahiti around 1000 CE.",
      ],
    },
    learn: {
      title: "Wind Patterns",
      concepts: [
        { heading: "Trade wind belts", body: "The NE trades blow from the northeast between 5°–30°N. The SE trades blow from the southeast between 5°–30°S. Both are steady, reliable, and the backbone of all Polynesian voyaging. They have blown the same way for ten thousand years." },
        { heading: "The ITCZ", body: "Between the two trade wind belts sits the Inter-Tropical Convergence Zone — the doldrums. Calms, unpredictable squalls, shifting winds. Cross it fast. Never linger. It is the one part of the Pacific with no reliable wind compass." },
        { heading: "Aim upwind", body: "Always depart with your destination upwind — east of where you want to go. The trades carry you west. Arrive upwind and you can fall off to leeward at any time. Arrive downwind of your destination and you cannot return." },
        { heading: "When the Calendar Changes", body: "Every few years El Niño shifts the ITCZ south and weakens the SE trades. The crossing window changes, the doldrums widen, the familiar wind calendar no longer holds. Ancient navigators who recognised this changed their departure month, not their route — reading the signs of an unusual season before ever leaving the shore." },
      ],
    },
  },
  5: {
    accent: "#00C896",
    hawaiian: "Ngā Manu",
    destination: "Fiji",
    departure: { location: "Hilo, Hawaiʻi", note: "The reef's edge at low tide. Matala perched nearby." },
    intro: {
      quote: "Hawaiʻi. We have been here before — in the old stories, in the names of the stars. Now we have seen it with our own eyes. The mission is nearly complete. One stop before we head home: Fiji. Southwest, familiar water, and the birds will help us find it.",
      attribution: "Palu Hemi, Hawaiʻi",
      facts: [
        "Fiji lies roughly southwest of Hawaiʻi, and west-northwest of Tonga — the crossroads of Melanesian and Polynesian culture, and a vital stop on ancient trade routes.",
        "Fijian waters are rich with seabirds that nest on the outer reef islands, making bird navigation particularly reliable in this part of the Pacific.",
        "The Lapita people — ancestors of Polynesians — passed through Fiji around 1100 BCE on their eastward migration into the Pacific.",
      ],
    },
    learn: {
      title: "Bird Signs",
      concepts: [
        { heading: "Land-based birds", body: "White tern (Manu-o-kū) and black noddy (Noio) nest on land and return every night. At dawn, flying away from a point — land is behind it. At dusk, flying toward a point — follow it home. Ranges: 200 km and 65 km respectively." },
        { heading: "Pelagic trap", body: "The frigatebird (ʻIwa) sleeps on the open ocean for weeks without landing. A frigatebird over open water tells you nothing. Do not follow it. This mistake has cost navigators days of sailing in the wrong direction." },
        { heading: "The carrier bird", body: "Polynesian navigators kept frigatebirds in cages on the waka. Release one when you suspect land is near. If it circles and returns — no land. If it flies away and does not return — it has found land and is flying toward it." },
        { heading: "Migratory birds", body: "Kōlea (Pacific golden plover) migrates non-stop between Alaska and Hawaiʻi — 4,800 km. Koekoea (long-tailed cuckoo) between Aotearoa and the tropical Pacific. Their seasonal flight paths give directional bearings, not land proximity." },
      ],
    },
  },
  6: {
    accent: "#7A9EC8",
    hawaiian: "Kapua me te Moana",
    destination: "Tonga",
    departure: { location: "Suva, Fiji", note: "The headland above the harbour. The sky and ocean spread before you." },
    intro: {
      quote: "Fiji has been good to us. And I think Matala has found what she was looking for — though she will not admit it yet. Now: southeast, home. The clouds and the sea will guide us in. I will teach you the last of what I know on this crossing.",
      attribution: "Palu Hemi, Fiji",
      facts: [
        "The return crossing from Fiji to Tonga is roughly south-southeast — about 850 km, passing through familiar waters that Tongan navigators have crossed for thousands of years.",
        "The Tongan maritime empire once stretched across much of the Pacific, with trading voyages reaching as far as Sāmoa, Fiji, and the Cook Islands.",
        "Approaching Tonga from the northwest, the islands' coral reefs and low atolls are invisible until close — making cloud and sea signs critical for the final approach.",
      ],
    },
    learn: {
      title: "Clouds & Sea Signs",
      concepts: [
        { heading: "Tu Kapua — the standing cloud", body: "An island forces warm air upward, building a stationary cloud above it. When the sky is full of moving clouds and one does not move — it is standing on land. This sign can be read from 50 km or more." },
        { heading: "Lagoon glow", body: "A coral lagoon reflects sunlight upward into the base of overlying clouds as a green or turquoise tinge. Deep ocean reflects nothing — cloud bases stay grey-white. This glow can be seen before the atoll itself crests the horizon." },
        { heading: "Ocean colour", body: "Deep ocean is dark blue-purple — the colour of 4,000 metres of water. When it shifts to green or turquoise, the seabed has risen to a reef shelf and land is near. Brown water signals a river mouth — fresh water from a large island upstream." },
        { heading: "Kupe's signs", body: "Floating pumice, driftwood, seaweed mats — all mean land is upstream of the current. The direction they drift tells you where the current has come from. Kupe's sailing instructions: watch how debris moves, not just that it is there." },
      ],
    },
  },
};

export const CLOUD_SIGNS = [
  {
    id: "tu_kapua",
    title: "Tu Kapua — The Standing Cloud",
    question: "You have been sailing for six hours. The sky is full of moving clouds — all except one. What does the stationary cloud tell you?",
    options: [
      { id: "land",    text: "Land below it",           correct: true  },
      { id: "storm",   text: "A storm forming",         correct: false },
      { id: "nothing", text: "Nothing — clouds vary",   correct: false },
      { id: "wind",    text: "A wind change coming",    correct: false },
    ],
    explanation: "A cloud that sits still while all others drift is standing on land. The island below keeps air rising, building the cloud in place. This is Tu Kapua — the standing cloud. Kupe used this to find Aotearoa from 50 km away.",
    sceneType: "stationary_cloud",
  },
  {
    id: "lagoon_glow",
    title: "The Lagoon Glow",
    question: "At dawn you notice the underside of a low cloud has an unusual tinge. Which colour signals a coral lagoon below?",
    options: [
      { id: "green",  text: "Green or turquoise",  correct: true  },
      { id: "red",    text: "Red or pink",          correct: false },
      { id: "grey",   text: "Deep grey",            correct: false },
      { id: "white",  text: "Brilliant white",      correct: false },
    ],
    explanation: "A coral lagoon reflects sunlight upward into the cloud base as a green or turquoise tinge. Deep ocean reflects nothing. This lagoon glow can be seen before the atoll itself is visible — it gives you minutes to prepare for landfall.",
    sceneType: "lagoon_glow",
  },
  {
    id: "ocean_colour",
    title: "Reading the Water",
    question: "The ocean ahead has changed from deep blue-purple to a lighter green. What does this most likely mean?",
    options: [
      { id: "shallow", text: "Shallow reef nearby",     correct: true  },
      { id: "deep",    text: "Deeper water ahead",      correct: false },
      { id: "cold",    text: "Cold current",            correct: false },
      { id: "plankton",text: "Plankton bloom only",     correct: false },
    ],
    explanation: "Deep ocean is dark blue-purple — the colour of 4,000 metres of water. When it shifts to green or turquoise, the seabed has risen. You are over a reef shelf, and land is near. Brown water means a river mouth — fresh water from land ahead.",
    sceneType: "ocean_colour",
  },
  {
    id: "sea_signs",
    title: "Kupe's Signs — Debris and Drift",
    question: "You sight floating pumice, a mat of seaweed, and a drifting log. What is the most useful thing to do?",
    options: [
      { id: "direction", text: "Note which way they drift",       correct: true  },
      { id: "collect",   text: "Collect them as supplies",        correct: false },
      { id: "ignore",    text: "Ignore — common in open ocean",   correct: false },
      { id: "turn",      text: "Turn immediately toward them",    correct: false },
    ],
    explanation: "Pumice, seaweed and driftwood mean land is upstream. But the direction they drift tells you where the current has come from — and therefore which direction to look. Kupe taught: watch how debris moves, not just that it is there.",
    sceneType: "sea_signs",
  },
];

export const STORY_PAGES = (name) => [
  {
    id: "meeting",
    image: "🦜",
    imageAlt: "Matala the parrot",
    speaker: "Palu Hemi",
    location: "Tongatapu, Tonga · beach at sunset",
    text: [
      `Hello, ${name}. My parrot Matala told me you volunteered as a navigation apprentice — she has an eye for promising young people, and recommended we speak.`,
      `I have been navigating these waters for fifty years. My knees are filing formal complaints — so it is time I pass this knowledge on. The life of a Wayfinder is not easy, and neither am I… but stay close, do as I say, and you will rise to the challenge.`,
      `What I teach you comes from generations of Pacific navigators — Mau Piailug of Satawal, Nainoa Thompson of Hawaiʻi, and many before them whose names the ocean still carries. We honour that tradition by learning it with care.`,
    ],
  },
  {
    id: "mission",
    image: "🍠",
    imageAlt: "Sweet potato",
    speaker: "Palu Hemi",
    location: "Tongatapu, Tonga · beach at sunset",
    text: [
      `We have an important task, and you will be the one to carry it out as you build your wayfinding skills.`,
      `The king of our Tongan islands has cultivated a new variety of sweet potato — hardy, plentiful, and resistant to drought. In the years ahead, when the rains fail, this crop may be the difference between hunger and survival for communities across the ocean.`,
      `Your voyage will take you to Sāmoa, Tahiti, the Marquesas, Hawaiʻi, and Fiji — sharing what we have grown, bringing back knowledge, new foods, and perhaps new companions for the journey home.`,
    ],
  },
  {
    id: "matala",
    image: "🦜",
    imageAlt: "Matala the parrot",
    speaker: "Matala",
    location: "Tongatapu, Tonga · beach at sunset",
    text: [
      `SKRAWWK. You there. Yes, you. Listen closely because I will not repeat myself.`,
      `I am Matala. I have flown with Palu Hemi for twelve years and I know every island between here and the far north. I am also the last of my kind on this island, and I intend to do something about that.`,
      `If we encounter any birds on this voyage who might make a suitable companion — bring them home. I am not asking. SKRAWWK.`,
    ],
  },
  {
    id: "challenge",
    image: "🌊",
    imageAlt: "Open ocean",
    speaker: "Palu Hemi",
    location: "Tongatapu, Tonga · beach at sunset",
    text: [
      `${name}, I will be honest with you. This is not a task for the faint-hearted.`,
      `The ocean is vast and unpredictable. There are no charts, no compass, no engine. Only sky, sea, wind, and everything I am about to teach you.`,
      `The sun is setting behind us. In a moment, the stars will appear — and your first lesson begins right here, on this beach. Are you ready?`,
    ],
    choices: [
      { id: "yes", label: "I am ready. Let us begin.", advance: true },
      { id: "no",  label: "I am not sure I am ready…", advance: true, joke: true },
    ],
  },
];