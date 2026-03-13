# Polynesian Wayfinding — Design Log

> Living document. Updated each session as decisions are made.  
> Last updated: March 2026 — Phase 2 / Sprint 2

---

## Project Overview

An interactive, gamified web experience teaching Polynesian wayfinding techniques.  
Target audience: ages 12+. Distribution: public shareable link.  
Core framing: the user is a **haumāna** (apprentice) learning under a **palu** (master navigator).

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | React + Vite | Fast dev server, JSX, hot reload |
| Styling | Inline styles (no CSS framework) | Full control, no build step for Tailwind |
| Astronomy | Astronomy Engine (planned, Phase 3) | Open-source JS, runs in browser, no API key, ±1 arcminute accuracy |
| Storage | localStorage | No backend needed; persists name + bag across sessions |
| Hosting | TBD — GitHub Pages or Netlify | Connect repo, auto-deploy on push |
| Fonts | Cinzel (headings/UI), Georgia (palu speech) | Via Google Fonts CSS import |

---

## Screens & Navigation

```
Welcome → Voyage Map → [Module Intro] → [Module Activity] → [Module Bridge] → Voyage Map
                ↕
         Navigator's Bag (overlay drawer, accessible from any screen)
```

### Screen: Welcome
- Hawaiian prompt: *Ko wai tō ingoa, haumāna?* ("What is your name, apprentice?")
- Free text input → stored in `localStorage` key `pvs_haumana`
- On return visits, skips welcome and goes directly to Voyage Map

### Screen: Voyage Map
- **Aesthetic: Living Ocean (Option C)** — decided March 2026
  - Rich blue-green animated wave lines (requestAnimationFrame)
  - Teal island dots, gold on hover for all islands
  - Named sea roads in teal-gold dashed lines
  - Polynesian Triangle outline
- Active modules shown as glowing gold dots, inactive modules as muted teal
- `↺ RESET` button in header (dev/testing utility)

---

## Teaching Philosophy & Narrative Flow

### The Problem We're Solving
The original Learn → Practice → Challenge structure was right in principle, but the current
build only does *reactive* teaching — the Palu responds to what you click but doesn't
introduce concepts *before* you're asked to perform. A 12-year-old landing on the compass
cold doesn't know what they're looking at.

### The Three-Beat Structure (per module)

Every module follows the same three beats, each a distinct screen state:

```
[1. INTRO]          [2. ACTIVITY]         [3. BRIDGE]
Palu teaches   →   Haumāna practises  →   Palu reflects + 
the concept        the skill              unlocks next island
(read/listen)      (interactive)          (narrative payoff)
```

**Beat 1 — Intro (new)**
- The Palu delivers a short teaching monologue: 3–5 sentences max
- Accompanied by a static or gently animated illustration of the concept
- A single "I'm ready" or "Begin" button advances to the activity
- No interaction required — this is pure teaching
- Keeps the voice consistent: always the Palu speaking directly to the haumāna

**Beat 2 — Activity (existing)**
- The current interactive component (compass dial, sky arc, etc.)
- Palu speech becomes reactive — responds to right/wrong answers
- Step indicators show progress within the activity

**Beat 3 — Bridge (new)**
- Appears after the final correct answer
- Palu gives a reflective closing line + names the next technique
- A "cultural story" card appears: a 2–3 sentence oral story excerpt connecting the
  technique to Māori/Hawaiian tradition (sourced from UNESCO doc)
- The new bag item animates into view with a brief description
- A "Return to the Ocean" button sends the user back to the Voyage Map,
  where the next island is now glowing

### Narrative Arc Across All Modules

The modules are not just separate lessons — they form a continuous voyage story.
The palu is guiding the haumāna from Hawaiʻi to Aotearoa, teaching each skill
as it becomes needed on that journey. Each bridge explicitly names the next challenge.

| Module | Voyage moment | Bridge line (draft) |
|---|---|---|
| 1 · Star Compass | Departure night, Hawaiʻi | "You can hold south in your mind. But the stars hide when cloud comes. Tomorrow I will show you what never hides." |
| 2 · Sun Arc | Day 6, mid-ocean | "You know your latitude. But the ocean itself speaks — if you know how to lie still and listen. Tonight, feel the hull." |
| 3 · Swells | Day 8, cloud cover again | "The sea has told you its direction. Now the wind. Learn its names before it shifts." |
| 4 · Wind | Day 10, ITCZ crossing | "Wind and star and sun. But we are not alone out here. Watch what flies." |
| 5 · Birds | Day 14, first bird sighted | "Land is close. But close is not enough — you must read the sky above the island before you can see the island itself." |
| 6 · Clouds & Signs | Day 16, cloud on horizon | "You have learned every sign. Now there is only the voyage itself. Rarotonga to Aotearoa. The longest passage. Your hands, your eyes, everything you carry in your mind." |
| 7 · Final Voyage | The full passage | — landfall — |

### Intro Illustrations (one per module)

Each intro needs a simple visual that teaches the concept before the interaction.
These should be SVG-based (consistent with the rest of the app), not photographs.

| Module | Intro visual |
|---|---|
| 1 · Star Compass | Animated 32-house dial rotating slowly, houses labelling themselves |
| 2 · Sun Arc | Sun tracing its arc from east to west, noon altitude labelled |
| 3 · Swells | Cross-section showing swell vs wind-wave wavelength + island interference |
| 4 · Wind | Simplified Pacific wind map with trade wind arrows |
| 5 · Birds | Illustrated bird silhouettes with range circles (200km / 65km) |
| 6 · Clouds | Low island with flat cloud forming above it, arrow to cloud |

### Cultural Story Cards (Beat 3 — Bridge)

Each bridge includes a one-card story excerpt. Sources: UNESCO Tāwera doc (Thatcher/Evans 2023).

| Module | Story | Source |
|---|---|---|
| 1 | Tāne ascends to the heavens and receives the three baskets of knowledge — the stars are his to give | UNESCO p.12 |
| 2 | Māui slows the sun with his grandmother's jawbone — the solstice sun barely moves, giving navigators weeks of stable bearing | Māui cycle |
| 3 | Kupe reads the ocean before he sees land — the swells change beneath the hull three days before Aotearoa appears | Kupe narrative |
| 4 | The wind has names — Hau, Matagi, Rēhia — because named things can be reasoned with | Oral tradition |
| 5 | Kupe's wife Kuramārōtini is first to sight land — "He ao! He ao tea!" — because she watched the birds | Kupe narrative |
| 6 | Kupe's sailing instructions to future navigators: "Keep the star to port, the swell behind, the cloud ahead" | UNESCO p.34 |

---

## Module Specs

### Module 1 — The Star Compass ✓ Built (activity only, intro + bridge pending)

**Intro (to build):** Animated 32-house dial + palu explains the horizon as a mental map.  
"Before there were charts, there was this. The horizon, divided into 32 houses. Every star rises
in one house and sets in the opposite. Hold this in your mind and you hold the whole sky."

**Activity:** ✓ Done — bearing selection + star selection, 3 steps  
**Bridge (to build):** Story card — Tāne's three baskets. Unlock animation. Bridge line above.

Scenario data (Scenario A built, B–D planned):
- A: Summer solstice, Hawaiʻi → Tahiti — Hōkūleʻa (Arcturus), house ʻĀina-Koʻolau ✓
- B: Autumn, Rarotonga → Tahiti — Tāwera (Venus as evening star)
- C: Winter, Tahiti → Hawaiʻi — Southern Cross for south
- D: Spring, Sāmoa → Aotearoa — Atutahi (Canopus) for deep south

Compass implementation: 2D SVG horizon dial.  
Rationale: faithful to Nainoa Thompson's description of the compass as a *mental horizon construct*.

---

### Module 2 — The Sun Arc ✓ Built (activity only, intro + bridge pending)

**Intro (to build):** Sun arc animation, equinox vs solstice comparison diagram.  
"When cloud covers the stars, Tama-nui-te-rā still crosses the sky. At local noon he stands
due south — always. And his height above the horizon tells you exactly how far north or south
you stand on the ocean."

**Activity:** ✓ Done — time slider to find noon, altitude selection, latitude calculation  
**Bridge (to build):** Story card — Māui slows the sun. Unlock animation. Bridge line above.

Formula taught: `latitude = 90° − noon altitude ± 23.5° (solstice correction)`  
Equinox scenarios require no correction (most accessible starting point — Scenario A is equinox).

Scenario data (Scenario A built, B–D planned):
- A: Spring equinox, 20°N, noon alt 70° ✓
- B: Winter solstice, 20°N, noon alt 46.5° (−23.5° correction)
- C: Summer solstice, 44°N, noon alt 69.5° (+23.5° correction)
- D: Autumn equinox, 34°N, noon alt 56°

---

### Module 3 — Ocean Swells (not yet built)

**Intro:** Cross-section diagram — swell vs wind-wave, long period vs short.  
"The ocean breathes. Long slow swells travel thousands of kilometres without changing direction.
Wind-waves are noise. Learn to feel the difference in your whole body — Mau Piailug lay in the
hull to separate them."

**Activity:** Animated swell canvas. User adjusts canoe heading to maintain consistent swell angle.
Island interference challenge — identify block / refract / reflect zones.  
**Bridge:** Story card — Kupe reading the ocean. Unlock Wave Reader.

Implementation: Canvas 2D animated swells, pre-defined patterns (not real physics).

---

### Module 4 — Wind Patterns (not yet built)

**Intro:** Simplified Pacific wind map, trade wind belts, ITCZ marked.  
"The Pacific winds have names and seasons. The trade winds blow reliable and steady — aim upwind
of your destination, then let them carry you in. The ITCZ is the dangerous middle — doldrums,
unpredictable squalls, shifting winds."

**Activity:** Voyage strategy tool — given a season and destination, choose your departure bearing.
Scoring: did you allow for trade wind drift?  
El Niño / La Niña toggle showing how the ITCZ shifts.  
**Bridge:** Story card — wind names. Unlock Wind Reader (bag item TBD).

---

### Module 5 — Bird Guide (not yet built)

**Intro:** Illustrated bird guide — silhouettes with range circles.  
"A frigatebird sleeping on the ocean tells you nothing. A white tern flying at dawn tells you
land is within 200 kilometres. The noddy tern: 65 kilometres. Learn to read what is flying
before you follow it."

**Activity:** Bird identification game — scroll of bird sightings, classify each as land signal /
pelagic trap / migratory (not useful). Carrier frigatebird: decide when to release.  
**Bridge:** Story card — Kuramārōtini sights land. Unlock Bird Guide.

Carrier frigatebird mechanic carries forward into Module 7 (Final Voyage).

---

### Module 6 — Clouds & Sea Signs (not yet built)

**Intro:** Illustration of low atoll with flat stationary cloud above it.  
"An island too low to see still marks itself on the sky. A cloud that does not move with the
others — that sits still while everything else passes — is standing on land. Kupe taught this."

**Activity:** Time-lapse sky scene — identify the stationary cloud. Ocean colour change.
Kupe's sailing instructions as a sequencing challenge.  
**Bridge:** Story card — Kupe's instructions. Sets up Final Voyage.

---

### Module 7 — Final Voyage: Rarotonga → Aotearoa (not yet built)

No intro — the voyage begins immediately. The bridge narratives from all six modules
have been building to this moment.

**Structure:** 5–6 decision nodes, one per technique domain, presented as day-of-voyage moments:
1. Departure night — set heading by star compass
2. Day 3 — cloud cover, use sun arc for latitude check
3. Day 5 — swell direction changes, read the ocean
4. Day 8 — wind shifts, adjust strategy
5. Day 10 — bird sighted, decide whether to release carrier frigatebird
6. Day 12 — stationary cloud on horizon, confirm landfall approach

Landfall: *He ao! He ao tea!* — Kuramārōtini calls it.  
Certificate: personalised with haumāna name in English + te reo Māori.

---

## Navigator's Bag

Persistent drawer sliding in from the right. Accessible from any screen via `✦ BAG` button.  
State stored in `localStorage` key `pvs_bag` as a JSON array of unlocked item IDs.

| Item ID | Name | Hawaiian | Unlocked by | Status |
|---|---|---|---|---|
| `star_compass` | Star Compass | Ka Pā Hōkū | Module 1 complete | ✓ Built |
| `sun_arc` | Sun Arc | Tama-nui-te-rā | Module 2 complete | ✓ Built |
| `wave_reader` | Wave Reader | Te Moana | Module 3 complete | Planned |
| `bird_guide` | Bird Guide | Ngā Manu | Module 5 complete | Planned |

---

## Colour Palette

| Role | Value | Usage |
|---|---|---|
| Gold | `#C8941A` | Active islands, CTAs, bag button, correct answers |
| Gold light | `#E8C060` | Hovered island dots, star labels |
| Teal deep | `#0A4A65` | Ocean background centre |
| Teal mid | `#1A8090` | Wave lines, inactive islands, sea road lines |
| Teal text | `#1AA090` | Haumāna name in header |
| Night navy | `#04070E` | Compass + sun arc module background |
| Compass blue | `#5A92BC` | Cardinal labels on compass |
| Palu gold | `#D0A838` | Palu speech title text |
| Palu body | `#7AACBE` | Palu speech body text |
| Sun orange | `#D06030` | Module 2 accent, sun arc step indicators |
| Danger | `#FF5533` | Wrong answer highlight |

---

## Typography

| Role | Font | Size | Weight |
|---|---|---|---|
| App title / UI labels | Cinzel (serif) | 9–14px | 400–700 |
| Palu speech title | Cinzel | 14px | 700 |
| Palu speech body | Georgia | 12px | 400 italic |
| Module bar | Cinzel | 9.5px | 400 |
| Island names | Cinzel | 9–10.5px | 400–700 |

---

## Key Terminology

| English | Hawaiian / Māori | Used in |
|---|---|---|
| Apprentice | Haumāna | Welcome screen, headers, bag |
| Master navigator | Palu | Left panel speaker label |
| North | Ākau | Compass |
| East | Hikina | Compass |
| South | Hema | Compass |
| West | Komohana | Compass |
| The Pacific Ocean | Ka Moana Nui / Moananuiākea | Map label |
| Navigator's bag | Kit kete | Bag drawer subtitle |
| Morning star (Venus) | Tāwera | Star data |
| Arcturus | Hōkūleʻa | Star data — zenith star of Hawaiʻi |
| Sirius | Takurua | Star data |
| Canopus | Atutahi | Star data |
| Scorpius | Te Matau ā Māui | Star data |
| Hawaiʻi → Tahiti route | Ke-ala-i-kahiki | Map sea road |
| Rarotonga → Aotearoa route | Ara-i-te-uru | Map sea road |

---

## Cultural Sensitivity Notes

- **Hawaiian Star Compass**: reproductions require express permission from C. Nainoa Thompson / Polynesian Voyaging Society. Action needed before public launch.
- **UNESCO content**: oral stories used with Jack Thatcher's explicit consent via Te Puna I Rangiriri Trust. Consider reaching out for endorsement before launch.
- Star compass presented as educational reference, not a reproduction of the official PVS diagram.

---

## Feasibility Decisions

| Decision | Rationale |
|---|---|
| 2D horizon dial, not 3D star dome | More faithful to how the compass is actually used as a mental construct |
| Pre-computed scenarios (4 per module) | Eliminates runtime complexity; Astronomy Engine used at build time only |
| Cap Final Voyage at 5–6 decision nodes | All 6 technique domains represented without scope creep |
| No backend / no account system | localStorage only; no server needed for MVP |
| No audio narration in Phase 2–4 | Placeholder text only; audio is a Phase 5–6 stretch goal |
| Canvas 2D for swell animation | Educational point is the pattern, not physics accuracy |
| Intro + bridge as separate screen states | Keeps component complexity low — same screen, different `step` value |

---

## localStorage Keys

| Key | Value | Set by |
|---|---|---|
| `pvs_haumana` | String — haumāna name | Welcome screen |
| `pvs_bag` | JSON array of unlocked item IDs | Module completion |

---

## Build Status

| Component | Status | Notes |
|---|---|---|
| Welcome screen | ✓ Done | |
| Voyage map | ✓ Done | Living ocean, animated waves, gold hover |
| Navigator's bag | ✓ Done | Drawer, locked/unlocked, detail view |
| Module 1 activity — Star Compass | ✓ Done | Scenario A only |
| Module 1 intro + bridge | ⬜ Planned | Beat 1 + Beat 3 |
| Module 2 activity — Sun Arc | ✓ Done | Scenario A only |
| Module 2 intro + bridge | ⬜ Planned | Beat 1 + Beat 3 |
| Module 3 — Swells | ⬜ Next | Start with activity, add intro+bridge after |
| Module 4 — Wind | ⬜ Planned | |
| Module 5 — Birds | ⬜ Planned | |
| Module 6 — Clouds | ⬜ Planned | |
| Module 7 — Final Voyage | ⬜ Planned | Build last |
| Intro screens (all modules) | ⬜ Planned | Can batch these once all activities exist |
| Bridge screens (all modules) | ⬜ Planned | Can batch these once all activities exist |
| Astronomy Engine integration | ⬜ Planned | Phase 3 |
| Netlify / GitHub Pages deploy | ⬜ Planned | Phase 3 |
| Cultural permissions | ⬜ Pending | Before public launch |

---

## Open Questions

- [ ] Progress indicator on Voyage Map showing completed vs available modules?
- [ ] Should the bag auto-open when a new item is added, or just flash the button?
- [ ] Module replay — can haumāna return to a completed module from the map?
- [ ] Final voyage certificate: printable PDF or styled HTML screen?
- [ ] Intro illustrations: purely SVG, or allow some CSS animation (requestAnimationFrame)?
- [ ] Should bridge story cards be skippable on replay, or always shown?