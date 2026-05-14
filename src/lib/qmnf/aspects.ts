// Aspect catalog and carry-pattern classification.
// Identifies conventional aspects + shadow (mod 11) and boundary (mod 13)
// bonds, including pairs the angular system makes invisible.

import { CrtAddress, arcsecDiff, carryTuple } from "./crt";
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
  applying?: boolean;
}

function angularDist(sep: bigint, exact: bigint): bigint {
  // Distance considering both directions
  const half = FULL_CIRCLE_ARCSEC / 2n;
  let d = sep > exact ? sep - exact : exact - sep;
  if (d > half) d = FULL_CIRCLE_ARCSEC - d;
  return d;
}

export function classifyPair(a: PlanetPosition, b: PlanetPosition): ClassifiedAspect[] {
  const sep = arcsecDiff(a.longitudeArcsec, b.longitudeArcsec);
  const carry = carryTuple(sep);
  const matches: ClassifiedAspect[] = [];
  for (const def of ASPECT_CATALOG) {
    const d1 = angularDist(sep, def.exactArcsec);
    const d2 = angularDist(sep, (FULL_CIRCLE_ARCSEC - def.exactArcsec) % FULL_CIRCLE_ARCSEC);
    const d = d1 < d2 ? d1 : d2;
    if (d <= def.orbArcsec) {
      matches.push({
        a: a.name,
        b: b.name,
        aspect: def,
        separationArcsec: sep,
        orbDeltaArcsec: d,
        carry,
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
export interface Pattern {
  type: "Grand Trine" | "T-Square" | "Yod" | "Grand Cross";
  planets: string[];
}

export function findAspectPatterns(aspects: ClassifiedAspect[]): Pattern[] {
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

  // Grand Trine: 3 planets all trine
  for (let i = 0; i < ps.length; i++)
    for (let j = i + 1; j < ps.length; j++)
      for (let l = j + 1; l < ps.length; l++)
        if (has(ps[i], ps[j], "Trine") && has(ps[j], ps[l], "Trine") && has(ps[i], ps[l], "Trine"))
          out.push({ type: "Grand Trine", planets: [ps[i], ps[j], ps[l]] });

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

  return out;
}
