# Ocean Adventure — Design Log

> Living document. Updated each session as decisions are made.  
> Last updated: March 2026 — Pass 1 of narrative restructure complete

---

## Project Overview

An interactive, gamified web experience teaching Polynesian wayfinding techniques.  
**App name: Ocean Adventure** (subtitle: "A Polynesian Voyaging Experience")  
Target audience: ages 12+. Core framing: the user is a **haumāna** (apprentice) learning under **Palu Hemi**, a master navigator from Tongatapu whose parrot Matala spotted the player arriving on the island.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React + Vite |
| Styling | Inline styles |
| Storage | localStorage (`pvs_haumana`, `pvs_bag`) |
| Fonts | Cinzel (UI), Georgia (Palu speech) |
| Hosting | TBD — GitHub Pages or Netlify |

---

## Screens & Navigation

```
Welcome → Story Card → Voyage Map → [Intro] → [Learn] → [Activity] → Voyage Map
                                         ↕
                                Navigator's Bag (overlay)
```

---

## Voyage Order & Module Mapping

| Stop | Island | Module | Technique | Screen | Unlock item(s) |
|---|---|---|---|---|---|
| Home | Tonga ⚓ | 0 | — | — | sweet_potato_seeds (on start) |
| 1 | Sāmoa | 1 | Star Compass | compass | star_compass + samoan_star_map |
| 2 | Tahiti | 2 | Sun Arc | sunarc | sun_arc |
| 3 | Marquesas | 3 | Ocean Swells | swells | wave_reader + taro_plant |
| 4 | Hawaiʻi | 4 | Wind Patterns | wind | wind_reader |
| 5 | Fiji | 5 | Bird Guide | birds | bird_guide |
| 6 | Tonga (return) | 6 | Clouds & Sea Signs | clouds | cloud_reader |
| Final | Aotearoa | 7 | Final Voyage | voyage | — |

### Navigation directions (historically accurate)
- Tonga → Sāmoa: NNE ~22.5° · house: Nāleo-Koʻolau · star: Mānaiakalani (Vega)
- Sāmoa → Tahiti: ESE ~118°
- Tahiti → Marquesas: NNE ~25° (updated swell scenario)
- Marquesas → Hawaiʻi: NNW ~335° · cross ITCZ, ride NE trades
- Hawaiʻi → Fiji: WSW ~245°
- Fiji → Tonga: SSE ~160°
- Tonga → Aotearoa: SE ~155° (Final Voyage)

---

## Progression System

Three island states on the Voyage Map:
1. **Next destination** — gold pulse ring, clickable
2. **Completed** — green ✓ dot, revisitable
3. **Locked** — muted, tooltip "Complete previous stop"

**Tonga home base:** permanent anchor ⚓ icon.  
**Sea roads:** revealed dynamically after each leg is completed.  
**Star compass rose:** replaces generic orientation labels — 8 Polynesian compass houses (Ākau, Koʻolau, Hikina, Malanai, Hema, Kona, Komohana, Hoʻolua). Polynesian navigators did not use magnetic compasses.

---

## Three-Beat Module Flow

```
[1. INTRO]           [2. LEARN]           [3. ACTIVITY]
Full-screen   →   Left: concepts    →   Interactive
atmospheric        Right: visual         challenge
narrative          illustration
```

Bridge screens (Pass 3 — pending): arrival narrative, cultural story card, bag item animation, "Return to Ocean" button.

---

## Module Narratives (Pass 1 complete, Pass 2 review pending)

### Module 1 — Star Compass: Tonga → Sāmoa
- **Premise:** First crossing together. Sāmoa is NNE, ~800 km, 3–4 day voyage.
- **Star scenario:** Correct house = Nāleo-Koʻolau (22.5°). Correct star = Mānaiakalani (Vega).
- **Sāmoa facts:** Lapita-settled ~800 BCE; tradition of Vā (relational ocean literacy).
- **Bridge line (to build):** "We've arrived! Let's pull our canoe ashore. I'll head inland with Matala to share our first sweet potato seeds."
- **Bag gifts:** star_compass + samoan_star_map (gifted by Samoan wayfinders)

### Module 2 — Sun Arc: Sāmoa → Tahiti
- **Premise:** Longer daytime crossing ESE to Tahiti. Samoan wayfinders impressed, gifted a star map.
- **Tahiti facts:** Raʻiatea's marae Taputapuātea was the great navigator gathering point; settled ~300 CE.
- **Bridge line (to build):** "I can see it. I wonder if their old Wayfinding master is still here..."

### Module 3 — Ocean Swells: Tahiti → Marquesas
- **Premise:** Tahiti's new wayfinder gifted us taro. Now NNE to the Marquesas.
- **Swell scenario:** Heading NNE ~25°, SE trade swell hits port beam/quarter.
- **Marquesas facts:** Among the most remote islands; likely launch point for expansion to Hawaiʻi and Easter Island.
- **Bridge line (to build):** "Swell work! We can stay a few nights with friends ashore."
- **Bag gift:** taro_plant

### Module 4 — Wind Patterns: Marquesas → Hawaiʻi
- **Premise:** NNW crossing, must cross ITCZ. Stories included Makanikeoe, the wind god who led navigators off-course.
- **Wind scenario:** Marquesas (10°S) → Hawaiʻi (20°N), correct bearing NNW ~335°.
- **Bridge line (to build):** "I can see the first Hawaiʻian islands ahead. Time to rest."

### Module 5 — Bird Guide: Hawaiʻi → Fiji
- **Premise:** Mission successful. On the way home, stop in Fiji.
- **Fiji facts:** Crossroads of Melanesian/Polynesian culture; Lapita passed through ~1100 BCE.
- **Bridge line (to build):** "The birds did not lead us astray! Come share our final sweet potatoes."

### Module 6 — Clouds & Sea Signs: Fiji → Tonga
- **Premise:** Ready to go home with stories, star map, taro plant.
- **Return facts:** ~850 km SSE; low atolls approaching Tonga make cloud signs essential.
- **Bridge line (to build):** "You've become a real wayfinder, [name]. But before you rest — we should check what's happened while we were away."

---

## Final Voyage (Module 7)

**Premise:** "Aotearoa is in trouble. Our chiefs need to travel there but I'm not well enough. They need you — and quickly."  
**Direction:** SE ~155° from Tonga.  
**Conclusion:** "You've gotten us safely to Aotearoa. Without your help we may not have made the journey. You have a great seafaring life ahead of you!"  
**Structure:** 5–6 decision nodes, one per technique domain.

---

## Navigator's Bag Items

| Item ID | Name | Hawaiian | Unlocked by |
|---|---|---|---|
| `sweet_potato_seeds` | Sweet Potato Seeds | ʻUala | Game start |
| `star_compass` | Star Compass | Ka Pā Hōkū | Module 1 |
| `samoan_star_map` | Samoan Star Map | Faʻailoga Fetu | Module 1 (gift) |
| `sun_arc` | Sun Arc | Tama-nui-te-rā | Module 2 |
| `wave_reader` | Wave Reader | Te Moana | Module 3 |
| `taro_plant` | Taro Plant | Talo | Module 3 (gift) |
| `wind_reader` | Wind Reader | Hau me Matagi | Module 4 |
| `bird_guide` | Bird Guide | Ngā Manu | Module 5 |
| `cloud_reader` | Cloud & Sea Reader | Kapua me te Moana | Module 6 |

---

## Three-Pass Plan

| Pass | Status | Description |
|---|---|---|
| Pass 1 — Remap | ✓ Complete | New island order, progression logic, all scenarios updated |
| Pass 2 — Narrative review | ⬜ Next | Review all text as a short story — voice, coherence, age-appropriateness |
| Pass 3 — Bridge screens | ⬜ Planned | Arrival/conclusion screens per module |

---

## Cultural Sensitivity Notes

- Hawaiian Star Compass: contact PVS before public launch.
- UNESCO oral stories: used with Jack Thatcher's consent via Te Puna I Rangiriri Trust.
- Tongan cultural advisor review recommended before public launch.
- The Makanikeoe wind god story is a teaching narrative invention — frame as "a story Palu told", not oral tradition.

---

## Open Questions

- [ ] Bridge screens: skippable on replay?
- [ ] Final voyage certificate: PDF or HTML?
- [ ] Bag auto-open or flash on new item?
- [ ] Astronomy Engine integration — Phase 3?
- [ ] Cultural advisor review before launch

---

## Open Issues from User Testing (Round 2)

### Pending feature work
- [ ] **Sun arc activity** — altitude selection still unintuitive. The visual relationship between the slider position, the sun on the arc, and the altitude angle needs clearer labelling. Consider adding a dynamic angle indicator that updates as the sun moves, and a clearer "measure from horizon" instruction.
- [ ] **Wind — doldrums bearing adjustment** — after crossing the ITCZ into the NE trade belt, a navigator must adjust bearing to compensate for the new wind direction. This is currently acknowledged in the "nice work" overlay text but not tested in the activity. Add a step 3b: after identifying El Niño year, ask the player to choose the adjusted bearing north of the doldrums.
- [ ] **Success/arrival screens** — modules need a clear "arriving at [island]" moment before the bridge screen. Consider a full-screen flash with an island illustration and "Arriving at Sāmoa..." before Palu's arrival speech.
- [ ] **Parrot mate** — narrative note: need to establish where Matala finds a mate on the voyage. Fiji is the most likely candidate (rich seabird populations, Lapita cultural connection). Could be a small narrative beat in the Module 5 bridge screen.

### Resolved this round
- [x] BridgeScreen crash (destination field missing from BRIDGE_CONTENT[1])
- [x] Auto-advance replaced with "nice work" click-through overlays (SunArc, Swell, Wind)
- [x] Wrong answer backtrack — "TRY AGAIN" buttons added to SunArc steps 2 and 3
- [x] Font sizes increased globally (Palu title 17→20px, body 14→15px, story lines 14.5→16px)
- [x] Wind doldrums — added note in niceWork overlay that bearing must adjust after crossing ITCZ
- [x] Hooks-after-early-return crashes fixed (SwellModule, WindModule, CloudsModule)