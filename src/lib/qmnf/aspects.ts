// Aspect catalog and carry-pattern classification.
// Identifies conventional aspects + shadow (mod 11) and boundary (mod 13)
// bonds, including pairs the angular system makes invisible.

import { arcsecDiff, carryTuple } from "./crt";
import { FULL_CIRCLE_ARCSEC } from "./constants";
import type { PlanetPosition } from "./ephemeris";

export interface AspectDef {
  name: string;
  family: "cardinal" | "classical" | "minor" | "quintile" | "septile" | "undecile" | "tredecile";
  exactArcsec: bigint; // canonical separation
  orbArcsec: bigint; // allowable orb
  symbol: string;
  shadowOnly?: boolean; // true if aspect lives primarily in r11 lane
}

const D = (deg: number, orb: number): { exact: bigint; orb: bigint } => ({
  exact: BigInt(Math.round(deg * 3600)),
  orb: BigInt(Math.round(orb * 3600)),
});

export const ASPECT_CATALOG: AspectDef[] = (() => {
  const list: AspectDef[] = [];
  const add = (
    name: string,
    family: AspectDef["family"],
    deg: number,
    orb: number,
    symbol: string,
    shadowOnly = false,
  ) => {
    const { exact, orb: o } = D(deg, orb);
    list.push({ name, family, exactArcsec: exact, orbArcsec: o, symbol, shadowOnly });
  };
  // Cardinal
  add("Conjunction", "cardinal", 0, 8, "☌");
  add("Opposition", "cardinal", 180, 8, "☍");
  // Classical
  add("Trine", "classical", 120, 7, "△");
  add("Square", "classical", 90, 7, "□");
  add("Sextile", "classical", 60, 5, "⚹");
  // Minor
  add("Quincunx", "minor", 150, 3, "⚻");
  add("Semisextile", "minor", 30, 2, "⚺");
  add("Sesquisquare", "minor", 135, 2, "⚼");
  add("Semisquare", "minor", 45, 2, "∠");
  // Quintile family (mod 5)
  add("Quintile", "quintile", 72, 2, "Q");
  add("Biquintile", "quintile", 144, 2, "bQ");
  // Septile family (mod 7)
  add("Septile", "septile", 360 / 7, 1.5, "S");
  add("Biseptile", "septile", 720 / 7, 1.5, "bS");
  add("Triseptile", "septile", 1080 / 7, 1.5, "tS");
  // Undecile family (mod 11) — Shadow lane
  add("Undecile", "undecile", 360 / 11, 1.2, "U", true);
  add("Biundecile", "undecile", 720 / 11, 1.2, "bU", true);
  add("Triundecile", "undecile", 1080 / 11, 1.2, "tU", true);
  add("Quadundecile", "undecile", 1440 / 11, 1.2, "qU", true);
  add("Quintundecile", "undecile", 1800 / 11, 1.2, "5U", true);
  // Tredecile family (mod 13) — Boundary lane
  add("Tredecile", "tredecile", 360 / 13, 1.0, "T");
  add("Bitredecile", "tredecile", 720 / 13, 1.0, "bT");
  add("Tritredecile", "tredecile", 1080 / 13, 1.0, "tT");
  return list;
})();

export interface ClassifiedAspect {
  a: string;
  b: string;
  aspect: AspectDef;
  separationArcsec: bigint;
  orbDeltaArcsec: bigint; // |separation - exact| (canonical)
  carry: [number, number, number]; // (c7, c11, c13)
  /** True if the aspect is forming (faster body still approaching the angle). */
  applying?: boolean;
  /** Per-body mean daily motion in arcsec/day, signed (negative = retrograde). */
  relativeMotionArcsecPerDay?: number;
}

function angularDist(sep: bigint, exact: bigint): bigint {
  // Distance considering both directions
  const half = FULL_CIRCLE_ARCSEC / 2n;
  let d = sep > exact ? sep - exact : exact - sep;
  if (d > half) d = FULL_CIRCLE_ARCSEC - d;
  return d;
}

// Mean daily motion (arcsec/day) — used for applying/separating direction.
const MEAN_MOTION: Record<string, number> = {
  Sun: 3548,
  Moon: 47400,
  Mercury: 14400,
  Venus: 5760,
  Mars: 1886,
  Jupiter: 299,
  Saturn: 120,
  Uranus: 42,
  Neptune: 21,
  Pluto: 14,
  NorthNode: -190,
  Chiron: 30,
  Lilith: 401,
};

function signedSpeed(name: string, retrograde: boolean): number {
  const s = MEAN_MOTION[name] ?? 0;
  return retrograde ? -Math.abs(s) : s;
}

export function classifyPair(a: PlanetPosition, b: PlanetPosition): ClassifiedAspect[] {
  const sep = arcsecDiff(a.longitudeArcsec, b.longitudeArcsec);
  const carry = carryTuple(sep);
  const matches: ClassifiedAspect[] = [];
  // Relative speed of A vs. B (signed). If |speed_a| > |speed_b|, A is the
  // faster body. Applying = faster body still approaching the aspect angle.
  const speedA = signedSpeed(a.name, !!a.retrograde);
  const speedB = signedSpeed(b.name, !!b.retrograde);
  const relSpeed = speedA - speedB;

  for (const def of ASPECT_CATALOG) {
    const d1 = angularDist(sep, def.exactArcsec);
    const d2 = angularDist(sep, (FULL_CIRCLE_ARCSEC - def.exactArcsec) % FULL_CIRCLE_ARCSEC);
    const d = d1 < d2 ? d1 : d2;
    if (d <= def.orbArcsec) {
      // Applying check: whether the absolute separation is decreasing.
      // If A is moving faster than B in the positive direction and currently
      // less than the aspect angle, the orb is closing → applying.
      // (Approximate; sufficient for UI badge.)
      let applying: boolean | undefined;
      if (relSpeed !== 0) {
        const closerSide = d1 < d2 ? def.exactArcsec : FULL_CIRCLE_ARCSEC - def.exactArcsec;
        applying = sep < closerSide ? relSpeed > 0 : relSpeed < 0;
      }
      matches.push({
        a: a.name,
        b: b.name,
        aspect: def,
        separationArcsec: sep,
        orbDeltaArcsec: d,
        carry,
        applying,
        relativeMotionArcsecPerDay: relSpeed,
      });
    }
  }
  return matches;
}

export function buildAspects(planets: PlanetPosition[]): ClassifiedAspect[] {
  const out: ClassifiedAspect[] = [];
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      out.push(...classifyPair(planets[i], planets[j]));
    }
  }
  return out;
}

export interface ResidueBond {
  a: string;
  b: string;
  residue: number;
  laneName: string;
}

export function buildShadowNetwork(
  planets: PlanetPosition[],
  laneNames: readonly string[],
): ResidueBond[] {
  const out: ResidueBond[] = [];
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      if (planets[i].address.r11 === planets[j].address.r11) {
        const r = Number(planets[i].address.r11);
        out.push({ a: planets[i].name, b: planets[j].name, residue: r, laneName: laneNames[r] });
      }
    }
  }
  return out;
}

export function buildBoundaryNetwork(
  planets: PlanetPosition[],
  laneNames: readonly string[],
): ResidueBond[] {
  const out: ResidueBond[] = [];
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      if (planets[i].address.r13 === planets[j].address.r13) {
        const r = Number(planets[i].address.r13);
        out.push({ a: planets[i].name, b: planets[j].name, residue: r, laneName: laneNames[r] });
      }
    }
  }
  return out;
}

export interface FaceOfZero {
  a: string;
  b: string;
  shadowResidue: number;
  boundaryResidue: number;
}

export function findFaceOfZero(shadow: ResidueBond[], boundary: ResidueBond[]): FaceOfZero[] {
  const key = (a: string, b: string) => (a < b ? `${a}|${b}` : `${b}|${a}`);
  const bMap = new Map<string, ResidueBond>();
  for (const bd of boundary) bMap.set(key(bd.a, bd.b), bd);
  return shadow
    .filter((s) => bMap.has(key(s.a, s.b)))
    .map((s) => {
      const b = bMap.get(key(s.a, s.b))!;
      return { a: s.a, b: s.b, shadowResidue: s.residue, boundaryResidue: b.residue };
    });
}

export function findClassicallyInvisible(
  shadow: ResidueBond[],
  aspects: ClassifiedAspect[],
): ResidueBond[] {
  const key = (a: string, b: string) => (a < b ? `${a}|${b}` : `${b}|${a}`);
  const visible = new Set<string>();
  for (const asp of aspects) {
    if (asp.aspect.family === "cardinal" || asp.aspect.family === "classical") {
      visible.add(key(asp.a, asp.b));
    }
  }
  return shadow.filter((s) => !visible.has(key(s.a, s.b)));
}

// Aspect patterns
export type PatternType =
  | "Grand Trine"
  | "T-Square"
  | "Yod"
  | "Grand Cross"
  | "Kite"
  | "Mystic Rectangle"
  | "Stellium";

export interface Pattern {
  type: PatternType;
  planets: string[];
}

export function findAspectPatterns(
  aspects: ClassifiedAspect[],
  positions?: Array<{ name: string; longitudeArcsec: bigint }>,
): Pattern[] {
  const byPair = new Map<string, ClassifiedAspect[]>();
  const k = (a: string, b: string) => (a < b ? `${a}|${b}` : `${b}|${a}`);
  for (const a of aspects) {
    const key = k(a.a, a.b);
    (byPair.get(key) ?? byPair.set(key, []).get(key)!).push(a);
  }
  const has = (a: string, b: string, name: string) =>
    (byPair.get(k(a, b)) ?? []).some((x) => x.aspect.name === name);

  const allPlanets = new Set<string>();
  aspects.forEach((a) => {
    allPlanets.add(a.a);
    allPlanets.add(a.b);
  });
  const ps = [...allPlanets];
  const out: Pattern[] = [];

  const grandTrines: string[][] = [];
  // Grand Trine: 3 planets all trine
  for (let i = 0; i < ps.length; i++)
    for (let j = i + 1; j < ps.length; j++)
      for (let l = j + 1; l < ps.length; l++)
        if (
          has(ps[i], ps[j], "Trine") &&
          has(ps[j], ps[l], "Trine") &&
          has(ps[i], ps[l], "Trine")
        ) {
          const t = [ps[i], ps[j], ps[l]];
          grandTrines.push(t);
          out.push({ type: "Grand Trine", planets: t });
        }

  // T-Square: A opp B; C square A and B
  for (let i = 0; i < ps.length; i++)
    for (let j = i + 1; j < ps.length; j++)
      if (has(ps[i], ps[j], "Opposition"))
        for (let l = 0; l < ps.length; l++) {
          if (l === i || l === j) continue;
          if (has(ps[i], ps[l], "Square") && has(ps[j], ps[l], "Square"))
            out.push({ type: "T-Square", planets: [ps[i], ps[j], ps[l]] });
        }

  // Yod: A sextile B; C quincunx A and B
  for (let i = 0; i < ps.length; i++)
    for (let j = i + 1; j < ps.length; j++)
      if (has(ps[i], ps[j], "Sextile"))
        for (let l = 0; l < ps.length; l++) {
          if (l === i || l === j) continue;
          if (has(ps[i], ps[l], "Quincunx") && has(ps[j], ps[l], "Quincunx"))
            out.push({ type: "Yod", planets: [ps[i], ps[j], ps[l]] });
        }

  // Grand Cross: two oppositions, four squares — 4 planets in a square + cross.
  for (let i = 0; i < ps.length; i++)
    for (let j = i + 1; j < ps.length; j++)
      for (let l = 0; l < ps.length; l++)
        for (let m = l + 1; m < ps.length; m++) {
          if (l === i || l === j || m === i || m === j) continue;
          if (
            has(ps[i], ps[j], "Opposition") &&
            has(ps[l], ps[m], "Opposition") &&
            has(ps[i], ps[l], "Square") &&
            has(ps[i], ps[m], "Square") &&
            has(ps[j], ps[l], "Square") &&
            has(ps[j], ps[m], "Square")
          )
            out.push({ type: "Grand Cross", planets: [ps[i], ps[j], ps[l], ps[m]] });
        }

  // Kite: a Grand Trine + a 4th planet opposing one apex, sextile to the other two.
  for (const gt of grandTrines) {
    const [A, B, C] = gt;
    for (const D of ps) {
      if (gt.includes(D)) continue;
      const opposesA = has(A, D, "Opposition");
      const opposesB = has(B, D, "Opposition");
      const opposesC = has(C, D, "Opposition");
      const opp = opposesA ? A : opposesB ? B : opposesC ? C : null;
      if (!opp) continue;
      const others = gt.filter((p) => p !== opp);
      if (others.every((p) => has(p, D, "Sextile")))
        out.push({ type: "Kite", planets: [...gt, D] });
    }
  }

  // Mystic Rectangle: two oppositions whose endpoints are also linked by sextiles + trines.
  for (let i = 0; i < ps.length; i++)
    for (let j = i + 1; j < ps.length; j++)
      for (let l = 0; l < ps.length; l++)
        for (let m = l + 1; m < ps.length; m++) {
          if (l === i || l === j || m === i || m === j) continue;
          if (
            has(ps[i], ps[j], "Opposition") &&
            has(ps[l], ps[m], "Opposition") &&
            ((has(ps[i], ps[l], "Sextile") &&
              has(ps[j], ps[m], "Sextile") &&
              has(ps[i], ps[m], "Trine") &&
              has(ps[j], ps[l], "Trine")) ||
              (has(ps[i], ps[m], "Sextile") &&
                has(ps[j], ps[l], "Sextile") &&
                has(ps[i], ps[l], "Trine") &&
                has(ps[j], ps[m], "Trine")))
          )
            out.push({
              type: "Mystic Rectangle",
              planets: [ps[i], ps[j], ps[l], ps[m]],
            });
        }

  // Stellium: 3+ planets within 10° (and ideally in same sign).
  if (positions) {
    const sorted = [...positions].sort((p, q) => Number(p.longitudeArcsec - q.longitudeArcsec));
    const STELLIUM_ARC = 36000n; // 10°
    for (let i = 0; i < sorted.length; i++) {
      const group: string[] = [sorted[i].name];
      for (let j = i + 1; j < sorted.length; j++) {
        const d = sorted[j].longitudeArcsec - sorted[i].longitudeArcsec;
        if (d > STELLIUM_ARC) break;
        group.push(sorted[j].name);
      }
      if (group.length >= 3) out.push({ type: "Stellium", planets: group });
    }
  }

  return out;
}
