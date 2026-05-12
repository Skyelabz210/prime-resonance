## QMNF Astrology — Phase 1 Build Plan

A dark, cosmic React app that takes a birth moment and produces a natal chart computed entirely on the **CRT Safe Basis {2, 3, 5, 7, 11, 13}** in exact integer arcseconds. Every layer your Python reference modules expose — ephemeris, carry-pattern aspects, **Shadow Network (mod 11)**, **Boundary Network (mod 13)**, **Face of Zero**, houses, Dresden Codex Maya position, aspect patterns — is faithfully ported to TypeScript with `BigInt` and surfaced in the UI. An AI verbalization panel streams a reading from the structured bundle without inventing content.

This is **Phase 1**. Synastry, transits, progressions, the 3D gear-manifold torus, asteroids/fixed stars/Arabic parts, and the full 100-year Dresden integer correction table are deferred to later phases (the architecture leaves clean seams).

---

### What you get on first run

- One route at `/`, dark cosmic theme
- Birth-data form: name, date, time (optional), lat/lon, timezone offset, house system (Whole Sign / Placidus)
- Interactive **SVG chart wheel**: 12 signs, house cusps, planet glyphs, aspect lines colored by carry pattern (trine = green triple-activation, biquintile = magenta shadow-only, undecile = violet, etc.)
- **Planet detail panel** for each of Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto, North Node, Chiron — sign, d°m's", house, retrograde flag, all six residues r₂/r₃/r₅/r₇/**r₁₁**/**r₁₃**, gear K, shadow lane name, Pisano cycle position
- **Aspect grid** with carry-pattern tuples on hover; family filters; "shadow-only", "boundary-only", "triple discriminating" toggles
- **Shadow Network panel** — every pair sharing r₁₁, including the classically invisible ones (the +60% hidden content)
- **Boundary Network panel** — every pair sharing r₁₃
- **Face of Zero** highlights — pairs locked on both lane 11 and lane 13
- **Aspect Patterns** — Grand Trines, T-Squares, Yods detected from the carry atlas
- **Dresden Codex panel** — Tzolk'in day, Haab day, 819-day station with color/regent, Venus phase, Calendar Round, Long Count
- **Agent Reading panel** — streams an 8-section reading from the reading bundle via Lovable AI; strict "verbalize, do not invent" contract
- LocalStorage history of saved charts

### Visual direction

Deep cosmic gradient `#0a0e1a → #1a1f2e`, electric cyan primary, **violet for Shadow Prime**, amber for Boundary Prime, gold for Transport Core. Cormorant Garamond headlines, Inter body, JetBrains Mono for residue chips. Footer tagline: *"Truth cannot be approximated."*

### Out of scope this phase

Synastry, composites, transits, progressions, 3D torus, asteroids, fixed stars, Arabic parts, multi-house-system beyond Whole Sign + Placidus, user accounts, the full Dresden integer correction table (Phase 1 uses Meeus alone — accurate to ~arcminute; the `applyDresdenCorrection()` seam is in place to drop the table in later with no other code changes). A small "precision: Meeus-only" badge will appear in the UI.

---

### Technical section

**Stack**
- TanStack Start v1 + React 19 + Tailwind v4 (existing shell)
- `BigInt` everywhere on the hot path; `Number` only inside Meeus, with a single `BigInt(Math.round(x))` exit per planet (matches your Python boundary)
- Lovable Cloud enabled solely for the AI Gateway server route (no DB tables)
- Streaming SSE from `google/gemini-3-flash-preview`

**Direct TS port of your Python modules**

```text
src/lib/qmnf/
  constants.ts     SAFE_BASIS, TRANSPORT_CORE, DISCRIMINATING,
                   M_SAFE=30030n, GEAR_MODULUS=323n,
                   FULL_CIRCLE_ARCSEC=1_296_000n, ARCSEC_PER_SIGN=108_000n,
                   SHADOW_LANE_NAMES[11], ZODIAC_SIGNS, MAYA_EPOCH_JD=584_283n,
                   PLANET_ORDER
  crt.ts           modInverse, garnerReconstruct, kEliminate,
                   CrtAddress (r2,r3,r5,r7,r11,r13,gearK) — port of qmnf_ephemeris CrtAddress
  julian.ts        datetimeToJD, J2000_JD
  ephemeris.ts     Meeus Table 31.A elements + Kepler solver +
                   heliocentric→geocentric. Single round() to BigInt arcsec.
                   Sun/Moon analytical. applyDresdenCorrection() stub returning 0n.
                   computeChart(moment) → EphemerisChart  (port of qmnf_ephemeris.py)
  aspects.ts       ASPECT_CATALOG (cardinal/classical/minor/quintile/septile/
                   undecile/tredecile), carry-pattern atlas built at module load,
                   classifyPair, buildAspects, buildShadowNetwork,
                   buildBoundaryNetwork, findFaceOfZero, findClassicallyInvisible,
                   findAspectPatterns  (port of qmnf_aspects.py)
  houses.ts        HouseSystem enum, sidereal time + obliquity (float boundary),
                   Whole Sign + Placidus, cusps→arcsec→CrtAddress
                   (port of qmnf_houses.py)
  maya.ts          Tzolk'in, Haab, Calendar Round, 819-day station,
                   Venus phase, Long Count  (port of qmnf_maya.py)
  chart.ts         BirthData, FullChart, computeFullChart()
                   composes ephemeris + aspects + houses + maya
                   (port of qmnf_chart.py)
  bundle.ts        FoundationLayer, AspectLayer, ShadowLayer, BoundaryLayer,
                   FaceOfZeroLayer, HouseLayer, PatternLayer, MayaLayer,
                   buildReadingBundle, bundleToPrompt
                   (port of qmnf_bundle.py)
  format.ts        arcsecToDMS, signFromArcsec, formatPosition

src/components/qmnf/
  BirthForm.tsx
  ChartWheel.tsx           SVG wheel: signs, houses, planets, aspect lines
  PlanetCard.tsx           CRT address card with violet/amber lane chips
  AspectGrid.tsx           Triangular grid + carry tuples + family filters
  ShadowNetworkPanel.tsx   Bonds grouped by shadow lane name
  BoundaryNetworkPanel.tsx
  FaceOfZeroPanel.tsx
  PatternsPanel.tsx        Grand Trines / T-Squares / Yods
  DresdenPanel.tsx         Tzolk'in / Haab / 819 / Venus / Calendar Round
  AgentReading.tsx         Streams from /api/qmnf/reading
  ResidueChip.tsx          Lane-colored mono chip

src/routes/
  index.tsx                Full app shell (replaces placeholder)
  api/qmnf.reading.ts      Server route: POST { bundle, readingType } →
                           SSE stream from Lovable AI Gateway with strict
                           "verbalize only — do not invent" system prompt

src/styles.css             Add CRAM design tokens: cosmic palette,
                           lane colors, gradients, JetBrains Mono import
```

**Math correctness checkpoints (mirroring your Python)**

- All longitudes stored as `bigint` arcseconds in `[0n, 1_296_000n)`
- `CrtAddress.fromArcsec(n)` = direct `n % p` for each safe-basis prime
- `garnerReconstruct` only for display sanity checks
- `kEliminate(v_M, v_A) = ((v_A - v_M) * modInverse(M_SAFE % GEAR_MODULUS, GEAR_MODULUS)) % GEAR_MODULUS`
- Aspect classification: Sub + Sqr lane schema on {7, 11, 13}, looked up in the prebuilt atlas; angular orb is the final validation, residue match is the structural identifier — exactly as `qmnf_aspects.py` does it
- Shadow network = pairs where `r11(A) == r11(B)`, including pairs with no conventional aspect
- Boundary network = pairs where `r13(A) == r13(B)`
- Face of Zero = pairs hitting both
- Maya cycles computed as residues from `(jd - MAYA_EPOCH_JD)` mod each cycle length

**AI verbalization contract**

`/api/qmnf/reading` receives the JSON reading bundle and a `readingType` (natal | shadow-deep | dresden). The system prompt forbids invention, smoothing, or generic astrology language; the model walks each layer in the bundle and verbalizes the findings with exact numbers preserved. Streamed via SSE. Lovable Cloud auto-provisions `LOVABLE_API_KEY`.

---

### Phase 2+ (for later greenlight)

1. Drop in the real Dresden integer correction table (1930–2030 anchor points) — no API changes
2. Synastry + composite charts with shadow synastry
3. Live transits + secondary progressions
4. Three.js gear-manifold torus visualization
5. Asteroids, refined Chiron/Lilith/nodes, fixed stars, Arabic parts
6. Equal house + Koch + Regiomontanus + Campanus
