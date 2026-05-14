// Build cards from a FullChart. Ranks aspects, house placements, shadow bonds,
// face-of-zero loci. Each card has a complete MathTrace.
import type {
  ResonanceCard,
  CelestialBodyState,
  AspectContext,
  HouseContext,
  ShadowContactContext,
  ResidueContext,
  PhaseContext,
  CardVisualState,
  MathTrace,
  NarrationTrack,
} from "../types/resonanceTypes";
import { depthIconFor, phaseStateFor } from "./computeDepthIcon";
import { buildConfidence } from "./computeConfidenceVector";
import { buildNarrationFor } from "./buildNarrationTrack";
import type { FullChart } from "@/lib/qmnf/chart";
import type { PlanetPosition } from "@/lib/qmnf/ephemeris";
import { computeEphemeris } from "@/lib/qmnf/ephemeris";

const ZODIAC = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces",
];

const PLANET_GLYPHS: Record<string, string> = {
  Sun: "☉",
  Moon: "☽",
  Mercury: "☿",
  Venus: "♀",
  Mars: "♂",
  Jupiter: "♃",
  Saturn: "♄",
  Uranus: "♅",
  Neptune: "♆",
  Pluto: "♇",
  NorthNode: "☊",
  Chiron: "⚷",
  Lilith: "⚸",
};

const arcsecToDeg = (n: bigint): number => Number(n) / 3600;

function bodyStateFor(p: PlanetPosition, velocity: number): CelestialBodyState {
  const lon = arcsecToDeg(p.longitudeArcsec);
  const signIdx = Math.floor(lon / 30);
  return {
    name: p.name,
    longitudeDeg: lon,
    sign: ZODIAC[signIdx],
    degreeInSign: lon - signIdx * 30,
    velocityDegPerDay: velocity,
    retrograde: p.retrograde,
    source: "qmnf-meeus+dresden",
    sourceConfidence: 0.85,
  };
}

function emptyPhase(depth: number): PhaseContext {
  return {
    phaseAngleDeg: 0,
    phaseDepth: depth,
    phaseState: phaseStateFor(depth),
    visualDepthIcon: depthIconFor(depth),
  };
}

function visualFor(
  glyphs: string[],
  overlay: CardVisualState["overlayMode"],
  anim: CardVisualState["animationMode"],
  depth: number,
): CardVisualState {
  return {
    glyphs,
    primaryBodyColorToken: "primary",
    depthIcon: depthIconFor(depth),
    overlayMode: overlay,
    animationMode: anim,
  };
}

// ───────────────────────────────────────────────────────────────────────
// Aspect cards
// ───────────────────────────────────────────────────────────────────────
function aspectCards(
  chart: FullChart,
  velocities: Record<string, number>,
  pById: Record<string, PlanetPosition>,
): ResonanceCard[] {
  const out: ResonanceCard[] = [];
  for (const a of chart.aspects) {
    const target = arcsecToDeg(a.aspect.exactArcsec);
    const sep = arcsecToDeg(a.separationArcsec);
    const orb = arcsecToDeg(a.orbDeltaArcsec);
    const maxOrb = arcsecToDeg(a.aspect.orbArcsec);
    const strength = Math.max(0, 1 - orb / maxOrb);
    const depth = strength;
    const intensity = strength;
    const vA = velocities[a.a] ?? 0;
    const vB = velocities[a.b] ?? 0;
    const angularVelocityDelta = Math.abs(vA - vB);
    const applying = !!a.applying;
    const aspectCtx: AspectContext = {
      bodyA: a.a,
      bodyB: a.b,
      angleActualDeg: sep,
      aspectTargetDeg: target,
      orbDeg: orb,
      maxOrbDeg: maxOrb,
      normalizedStrength: strength,
      applying,
      separating: !applying,
      angularVelocityDelta,
    };
    const eventType =
      orb < 0.1
        ? "aspect_exact"
        : applying
          ? "aspect_applying"
          : "aspect_separating";
    const bodies: CelestialBodyState[] = [pById[a.a], pById[a.b]]
      .filter(Boolean)
      .map((p) => bodyStateFor(p, velocities[p.name] ?? 0));
    const math: MathTrace = {
      summary: `Geometry between ${a.a} and ${a.b} relative to ${a.aspect.name} (${target}°).`,
      inputs: {
        bodyA: a.a,
        bodyB: a.b,
        bodyA_lonDeg: bodies[0]?.longitudeDeg,
        bodyB_lonDeg: bodies[1]?.longitudeDeg,
        velocityA: vA,
        velocityB: vB,
      },
      equations: [
        "separation = (lonB - lonA) mod 360",
        "orb = | separation - target |",
        "strength = max(0, 1 - orb / maxOrb)",
        "carry = (separation mod 7, separation mod 11, separation mod 13)",
      ],
      intermediateValues: {
        separationDeg: sep,
        targetDeg: target,
        orbDeg: orb,
        maxOrbDeg: maxOrb,
        carry: a.carry,
        applying,
        angularVelocityDelta,
      },
      finalScores: {
        normalizedStrength: strength,
        priority:
          strength * 0.6 +
          (applying ? 0.15 : 0.05) +
          Math.min(angularVelocityDelta / 1.0, 0.25),
      },
      reasoningPath: [
        `Measured separation = ${sep.toFixed(3)}°`,
        `Target = ${target}° (${a.aspect.name})`,
        `Orb = ${orb.toFixed(3)}° vs allowed ${maxOrb.toFixed(2)}°`,
        `Strength = ${strength.toFixed(3)}`,
        applying ? "Applying — pressure rising" : "Separating — pressure releasing",
      ],
    };
    const narration = buildNarrationFor("aspect", { aspect: a, ctx: aspectCtx, math });
    const isShadowy = a.aspect.shadowOnly === true;
    out.push({
      id: `aspect:${a.a}:${a.b}:${a.aspect.name}`,
      priority: math.finalScores.priority,
      eventType,
      title: `${PLANET_GLYPHS[a.a] ?? ""} ${a.a} ${a.aspect.symbol} ${PLANET_GLYPHS[a.b] ?? ""} ${a.b}`,
      subtitle: `${a.aspect.name} · orb ${orb.toFixed(2)}° / ${maxOrb.toFixed(2)}°`,
      bodies,
      aspectContext: aspectCtx,
      phaseContext: emptyPhase(depth),
      depth,
      intensity,
      confidence: buildConfidence({
        aspect: 0.95,
        shadow: isShadowy ? 0.85 : 0.9,
      }),
      visualState: visualFor(
        [PLANET_GLYPHS[a.a] ?? "•", a.aspect.symbol, PLANET_GLYPHS[a.b] ?? "•"],
        isShadowy ? "shadow_overlay" : strength > 0.85 ? "high_intensity" : "clean",
        "aspect_pulse",
        depth,
      ),
      narration,
      mathTrace: math,
    });
  }
  return out;
}

// ───────────────────────────────────────────────────────────────────────
// House depth cards (one per planet)
// ───────────────────────────────────────────────────────────────────────
function houseCards(
  chart: FullChart,
  velocities: Record<string, number>,
): ResonanceCard[] {
  const out: ResonanceCard[] = [];
  const cusps = chart.houses.cuspsArcsec.map(arcsecToDeg);
  for (const p of chart.ephemeris.planets) {
    const lon = arcsecToDeg(p.longitudeArcsec);
    const h = chart.planetHouses[p.name];
    if (!h) continue;
    const start = cusps[h - 1];
    const end = cusps[h % 12];
    let span = end - start;
    if (span <= 0) span += 360;
    let into = lon - start;
    if (into < 0) into += 360;
    if (into > 360) into -= 360;
    const depthPct = Math.max(0, Math.min(1, into / span));
    const distFromEntry = into;
    const distToExit = span - into;
    let phaseState: HouseContext["phaseState"] = "early";
    if (depthPct < 0.05) phaseState = "entering";
    else if (depthPct < 0.25) phaseState = "early";
    else if (depthPct < 0.55) phaseState = "building";
    else if (depthPct < 0.75) phaseState = "peak";
    else if (depthPct < 0.95) phaseState = "late";
    else phaseState = "egressing";
    const houseCtx: HouseContext = {
      houseNumber: h,
      cuspStartDeg: start,
      cuspEndDeg: end,
      houseSpanDeg: span,
      bodyLongitudeDeg: lon,
      depthPercent: depthPct * 100,
      distanceFromEntryCuspDeg: distFromEntry,
      distanceToExitCuspDeg: distToExit,
      phaseState,
      houseConfidence: chart.birth.houseSystem === "Placidus" ? 0.75 : 0.85,
    };
    // depth-peak intensity = how close to mid-house (50%)
    const peakness = 1 - Math.abs(depthPct - 0.5) * 2;
    const cuspProx = Math.min(distFromEntry, distToExit) / Math.max(span, 0.001);
    const intensity = Math.max(peakness, 1 - cuspProx * 4);
    const v = velocities[p.name] ?? 0;
    const math: MathTrace = {
      summary: `${p.name} sits ${(depthPct * 100).toFixed(1)}% through House ${h}.`,
      inputs: {
        planet: p.name,
        longitudeDeg: lon,
        houseSystem: chart.birth.houseSystem,
        cuspStart: start,
        cuspEnd: end,
        velocity: v,
      },
      equations: [
        "span = (cuspEnd - cuspStart) mod 360",
        "into = (longitude - cuspStart) mod 360",
        "depth = into / span",
      ],
      intermediateValues: {
        spanDeg: span,
        intoDeg: into,
        distanceToExitDeg: distToExit,
        depthFraction: depthPct,
        velocityDegPerDay: v,
      },
      finalScores: {
        depthPercent: depthPct * 100,
        cuspProximity: cuspProx,
        priority: intensity * 0.4 + (1 - cuspProx) * 0.3 + Math.min(Math.abs(v), 1) * 0.1,
      },
      reasoningPath: [
        `House ${h} spans ${span.toFixed(2)}° (${start.toFixed(2)}° → ${end.toFixed(2)}°)`,
        `${p.name} at ${lon.toFixed(3)}° = ${into.toFixed(2)}° into the house`,
        `Depth = ${(depthPct * 100).toFixed(1)}% (${phaseState})`,
        cuspProx < 0.05
          ? "Within 5% of a cusp — ingress/egress event"
          : "Mid-house residency",
      ],
    };
    const isCuspEvent = cuspProx < 0.05;
    const eventType = isCuspEvent
      ? distFromEntry < distToExit
        ? "planet_house_ingress"
        : "planet_house_egress"
      : "house_depth_peak";
    out.push({
      id: `house:${p.name}:${h}`,
      priority: math.finalScores.priority,
      eventType,
      title: `${PLANET_GLYPHS[p.name] ?? ""} ${p.name} · House ${h}`,
      subtitle: `${(depthPct * 100).toFixed(1)}% depth · ${phaseState}`,
      bodies: [bodyStateFor(p, v)],
      houseContext: houseCtx,
      phaseContext: emptyPhase(intensity),
      depth: intensity,
      intensity,
      confidence: buildConfidence({ house: houseCtx.houseConfidence }),
      visualState: visualFor(
        [PLANET_GLYPHS[p.name] ?? "•"],
        isCuspEvent ? "threshold" : "clean",
        isCuspEvent ? "cusp_crossing" : "orbit_drift",
        intensity,
      ),
      narration: buildNarrationFor("house", { planet: p, ctx: houseCtx, math }),
      mathTrace: math,
    });
  }
  return out;
}

// ───────────────────────────────────────────────────────────────────────
// Shadow / Boundary / Face-of-Zero cards
// ───────────────────────────────────────────────────────────────────────
function shadowCards(chart: FullChart): ResonanceCard[] {
  const out: ResonanceCard[] = [];
  // Classically invisible shadow bonds — the +60% hidden content
  for (const bond of chart.invisibleShadowBonds) {
    const a = chart.ephemeris.planets.find((p) => p.name === bond.a);
    const b = chart.ephemeris.planets.find((p) => p.name === bond.b);
    if (!a || !b) continue;
    const ctx: ShadowContactContext = {
      contactType: "residue_echo",
      bodies: [bond.a, bond.b],
      deviationDeg: 0,
      normalizedStrength: 0.85,
      explanation: `r₁₁(${bond.a}) = r₁₁(${bond.b}) — both bodies inhabit shadow lane "${bond.laneName}".`,
    };
    const math: MathTrace = {
      summary: `${bond.a} and ${bond.b} share residue ${a.address.r11} mod 11.`,
      inputs: {
        bodyA: bond.a,
        bodyB: bond.b,
        lonA_arcsec: a.longitudeArcsec.toString(),
        lonB_arcsec: b.longitudeArcsec.toString(),
      },
      equations: ["r11(x) = x_arcsec mod 11", "shadow_bond ⇔ r11(A) == r11(B)"],
      intermediateValues: {
        r11_A: a.address.r11.toString(),
        r11_B: b.address.r11.toString(),
        shadowLane: bond.laneName,
        classicallyInvisible: true,
      },
      finalScores: { strength: 0.85, priority: 0.55 },
      reasoningPath: [
        "Conventional aspect search returned no contact within orb.",
        `Mod-11 residue test: r₁₁(${bond.a}) = r₁₁(${bond.b}) = ${a.address.r11}`,
        `Both reside in shadow lane "${bond.laneName}".`,
        "Bond is structural, invisible to angular astrology.",
      ],
    };
    const depth = 0.7;
    out.push({
      id: `shadow:${bond.a}:${bond.b}`,
      priority: 0.55,
      eventType: "shadow_contact",
      title: `${PLANET_GLYPHS[bond.a] ?? ""} ${bond.a} ⟿ ${bond.b} ${PLANET_GLYPHS[bond.b] ?? ""}`,
      subtitle: `Shadow lane · ${bond.laneName}`,
      bodies: [a, b].map((p) => bodyStateFor(p, 0)),
      shadowContext: ctx,
      residueContext: {
        modulusSet: [11],
        residues: { [bond.a]: [Number(a.address.r11)], [bond.b]: [Number(b.address.r11)] },
        crtLaneId: bond.laneName,
        laneOverlapScore: 1.0,
      },
      phaseContext: { ...emptyPhase(depth), phaseState: "shadow_active" },
      depth,
      intensity: 0.7,
      confidence: buildConfidence({ shadow: 0.95, residue: 1.0, narration: 0.9 }),
      visualState: visualFor(
        [PLANET_GLYPHS[bond.a] ?? "•", "⟿", PLANET_GLYPHS[bond.b] ?? "•"],
        "shadow_overlay",
        "shadow_flicker",
        depth,
      ),
      narration: buildNarrationFor("shadow", { bond, ctx, math, a, b }),
      mathTrace: math,
    });
  }

  // Face of Zero — the rarest events
  for (const fz of chart.faceOfZero) {
    const a = chart.ephemeris.planets.find((p) => p.name === fz.a);
    const b = chart.ephemeris.planets.find((p) => p.name === fz.b);
    if (!a || !b) continue;
    const math: MathTrace = {
      summary: `${fz.a} and ${fz.b} lock simultaneously on lane 11 and lane 13.`,
      inputs: { bodyA: fz.a, bodyB: fz.b },
      equations: [
        "face_of_zero ⇔ r11(A)==r11(B) ∧ r13(A)==r13(B)",
        "joint probability ≈ 1/(11·13) = 1/143",
      ],
      intermediateValues: {
        r11: fz.shadowResidue,
        r13: fz.boundaryResidue,
      },
      finalScores: { rarity: 1 - 1 / 143, priority: 0.85 },
      reasoningPath: [
        "Both shadow (mod 11) and boundary (mod 13) residues coincide.",
        "Joint match probability ≈ 0.7%.",
        "This is a Face-of-Zero locus — a rare structural alignment.",
      ],
    };
    const depth = 0.95;
    out.push({
      id: `faceofzero:${fz.a}:${fz.b}`,
      priority: 0.85,
      eventType: "crt_lane_overlap",
      title: `Face of Zero · ${fz.a} ⟷ ${fz.b}`,
      subtitle: `r₁₁=${fz.shadowResidue}, r₁₃=${fz.boundaryResidue}`,
      bodies: [a, b].map((p) => bodyStateFor(p, 0)),
      residueContext: {
        modulusSet: [11, 13],
        residues: {
          [fz.a]: [Number(a.address.r11), Number(a.address.r13)],
          [fz.b]: [Number(b.address.r11), Number(b.address.r13)],
        },
        crtLaneId: `lane-11-${fz.shadowResidue}+lane-13-${fz.boundaryResidue}`,
        laneOverlapScore: 1.0,
        recurrenceScore: 0.99,
      },
      phaseContext: { ...emptyPhase(depth), phaseState: "shadow_active" },
      depth,
      intensity: 1.0,
      confidence: buildConfidence({ residue: 1.0, shadow: 1.0 }),
      visualState: visualFor(
        [PLANET_GLYPHS[fz.a] ?? "•", "⊛", PLANET_GLYPHS[fz.b] ?? "•"],
        "crt_lane",
        "lane_lock",
        depth,
      ),
      narration: buildNarrationFor("faceofzero", { fz, math, a, b }),
      mathTrace: math,
    });
  }

  return out;
}

// ───────────────────────────────────────────────────────────────────────
// Entry point
// ───────────────────────────────────────────────────────────────────────
export function buildResonanceCards(chart: FullChart): ResonanceCard[] {
  // velocities by neighboring ephemeris (deg/day)
  const next = computeEphemeris(chart.jd + 1);
  const velocities: Record<string, number> = {};
  for (const p of chart.ephemeris.planets) {
    const n = next.planets.find((q) => q.name === p.name);
    if (!n) {
      velocities[p.name] = 0;
      continue;
    }
    let d = arcsecToDeg(n.longitudeArcsec) - arcsecToDeg(p.longitudeArcsec);
    if (d > 180) d -= 360;
    if (d < -180) d += 360;
    velocities[p.name] = d;
  }
  const pById: Record<string, PlanetPosition> = {};
  for (const p of chart.ephemeris.planets) pById[p.name] = p;

  return [
    ...aspectCards(chart, velocities, pById),
    ...houseCards(chart, velocities),
    ...shadowCards(chart),
  ];
}

export { PLANET_GLYPHS };
