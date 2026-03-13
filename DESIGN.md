# Polynesian Wayfinding — Design Log

> Living document. Updated each session as decisions are made.  
> Last updated: March 2026 — Phase 2 / Sprint 1

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
Welcome → Voyage Map → Module (1–7) → back to Voyage Map
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
  - No compass rose (removed for simplicity)
- Active modules shown as glowing gold dots, inactive modules as muted teal
- `↺ RESET` button in header (dev/testing utility)

### Screen: Module
- Left panel (260px): Palu speech + step indicators + nav buttons
- Right: interactive component (compass, sun arc, etc.)
- Header: app title + haumāna name
- Module bar: module name + subtitle

---

## Navigator's Bag

Persistent drawer sliding in from the right. Accessible from any screen via `✦ BAG` button.  
State stored in `localStorage` key `pvs_bag` as a JSON array of unlocked item IDs.

| Item ID | Name | Hawaiian | Unlocked by | Status |
|---|---|---|---|---|
| `star_compass` | Star Compass | Ka Pā Hōkū | Module 1 complete | ✓ Built |
| `sun_arc` | Sun Arc | Tama-nui-te-rā | Module 2 complete | Planned |
| `wave_reader` | Wave Reader | Te Moana | Module 3 complete | Planned |
| `bird_guide` | Bird Guide | Ngā Manu | Module 5 complete | Planned |

---

## Modules

### Module 0 — Prologue (not yet built)
- Story: Tāwhaki climbs to the heavens for knowledge baskets
- Octopus map (Peter Buck 1938) as interactive route selector
- Haumāna name entry lives here in the full version

### Module 1 — The Star Compass ✓ Built
**Scenario A (Summer Solstice): Hawaiʻi → Tahiti, June 21, midnight, 20°N**

Flow:
1. Step 1 — Bearing: user clicks a house on the 32-house compass dial. Only Hema (180°, south) is correct. Wrong clicks give directional feedback.
2. Step 2 — Star: five stars appear at their correct rise azimuths. User hovers to read descriptions, clicks to choose. Only Hōkūleʻa (Arcturus, ʻĀina-Koʻolau) is correct.
3. Step 3 — Complete: palu explains why Hōkūleʻa works. Star Compass added to bag.

Key data:
- 32 houses at 11.25° intervals
- 4 quadrants: Koʻolau (NE), Malanai (SE), Kona (SW), Hoʻolua (NW)
- 4 cardinals: Ākau (N), Hikina (E), Hema (S), Komohana (W)
- Stars: Hōkūleʻa/Arcturus ✓, Tāwera/Venus ✗, Takurua/Sirius ✗, Atutahi/Canopus ✗, Te Matau ā Māui/Antares ✗

Compass implementation: 2D SVG horizon dial (not 3D dome).  
Rationale: more faithful to how Nainoa Thompson describes the compass as a *mental construct oriented around the horizon*.

4 planned voyage scenarios (only A built):
- A: Summer solstice, Hawaiʻi → Tahiti — Hōkūleʻa (Arcturus)
- B: Autumn, Rarotonga → Tahiti — Tāwera (Venus as evening star)
- C: Winter, Tahiti → Hawaiʻi — Southern Cross latitude reading
- D: Spring, Sāmoa → Aotearoa — Milky Way / Te Ika ā Māui

### Module 2 — The Sun Arc (not yet built)
- Given a date and time of day, deduce latitude from sun altitude at noon
- Mechanic: arc tool with draggable time slider, 4 preset date scenarios
- Formula: latitude = 90° − noon altitude ± 23.5° (solstice correction)
- Story: Māui Slows the Sun (solstice sun barely moves for weeks → stable bearing)
- Unlocks: Sun Arc item in bag

### Module 3 — Ocean Swells (not yet built)
- Animated swell trains with island interference (block / refract / reflect)
- "Feel the hull" challenge — muted visual cues only, like Mau Piailug lying below decks
- Implementation note: pre-animated Canvas 2D, not real physics simulation
- Unlocks: Wave Reader item in bag

### Module 4 — Wind Patterns (not yet built)
- Static SVG Pacific wind map + seasonal toggle (El Niño / La Niña)
- Voyage strategy scoring: did you aim upwind of destination?

### Module 5 — Bird Guide (not yet built)
- In-experience field guide panel (persistent reference during module + final voyage)
- Bird classification game: land-based vs pelagic vs migratory
- Carrier frigatebird: one-use strategic tool in the final voyage
- Unlocks: Bird Guide item in bag

### Module 6 — Clouds & Sea Signs (not yet built)
- Tu kapua (stationary clouds), atoll cloud reflection, ocean colour
- Kupe's sailing instructions as the challenge scenario

### Module 7 — Final Voyage: Rarotonga → Aotearoa (not yet built)
- Based on Kupe's verified route and Jack Thatcher's 2013 voyage (~2,400 km)
- 5–6 decision nodes (reduced from 12 for feasibility), one per technique domain
- Carrier frigatebird available as one-use tool
- Landfall moment: *He ao! He ao tea!* — Kuramārōtini
- Certificate personalised with haumāna name in English + te reo Māori

---

## Colour Palette

| Role | Value | Usage |
|---|---|---|
| Gold | `#C8941A` | Active islands, CTAs, bag button, correct answers |
| Gold light | `#E8C060` | Hovered island dots, star labels |
| Teal deep | `#0A4A65` | Ocean background centre |
| Teal mid | `#1A8090` | Wave lines, inactive islands, sea road lines |
| Teal text | `#1AA090` | Haumāna name in header |
| Night navy | `#04070E` | Compass module background |
| Compass blue | `#5A92BC` | Cardinal labels on compass |
| Palu gold | `#D0A838` | Palu speech title text |
| Palu body | `#7AACBE` | Palu speech body text |
| Danger | `#FF5533` | Wrong answer highlight on compass |

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
| Evening star (Venus) | Meremere | Star data |
| Arcturus | Hōkūleʻa | Star data — zenith star of Hawaiʻi |
| Sirius | Takurua | Star data |
| Canopus | Atutahi | Star data |
| Scorpius | Te Matau ā Māui | Star data |
| Hawaiʻi → Tahiti route | Ke-ala-i-kahiki | Map sea road |
| Rarotonga → Aotearoa route | Ara-i-te-uru | Map sea road |

---

## Cultural Sensitivity Notes

- **Hawaiian Star Compass**: reproductions require express permission from C. Nainoa Thompson / Polynesian Voyaging Society. Action needed before public launch.
- **UNESCO content** (oral stories, Kupe's instructions): produced with Jack Thatcher's explicit consent via Te Puna I Rangiriri Trust. Consider reaching out for endorsement.
- Star compass presented as educational reference, not a reproduction of the official diagram.

---

## Feasibility Decisions Made

| Decision | Rationale |
|---|---|
| 2D horizon dial, not 3D star dome | More faithful to how the compass is actually used; far simpler to build |
| Pre-computed scenarios (4 per module), not live Astronomy Engine calls | Eliminates runtime complexity; Astronomy Engine used at build time only |
| Cap Final Voyage at 5–6 decision nodes | Prevents scope creep; all 6 technique domains still represented |
| No backend / no account system | localStorage only; no server needed for MVP |
| No audio narration in Phase 2–4 | Placeholder text only; audio is a Phase 5–6 stretch goal |
| Canvas 2D for swell animation | Educational point is the pattern, not physics accuracy |

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
| Welcome screen | ✓ Done | Name input, localStorage, Cinzel font |
| Voyage map | ✓ Done | Living ocean, animated waves, gold hover, sea roads, reset button |
| Navigator's bag | ✓ Done | Drawer, locked/unlocked items, detail view |
| Module 1 — Star Compass | ✓ Done | Scenario A only; 3 more scenarios planned |
| Module 2 — Sun Arc | ⬜ Next | |
| Module 3 — Swells | ⬜ Planned | Second risky component — tackle early |
| Module 4 — Wind | ⬜ Planned | |
| Module 5 — Birds | ⬜ Planned | |
| Module 6 — Clouds | ⬜ Planned | |
| Module 7 — Final Voyage | ⬜ Planned | Build last |
| Astronomy Engine integration | ⬜ Planned | Phase 3 |
| Netlify / GitHub Pages deploy | ⬜ Planned | Phase 3 |
| Cultural permissions | ⬜ Pending | Before public launch |

---

## Open Questions

- [ ] Do we want a progress indicator on the Voyage Map showing which modules are complete?
- [ ] Should the bag auto-open when a new item is added, or just flash the button?
- [ ] Module 1 currently has no way to return to it from the map once complete — do we want replay?
- [ ] Final voyage certificate: printable PDF, or styled HTML screen?
