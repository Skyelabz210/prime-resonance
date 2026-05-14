// Transit evaluation — given a natal chart and a target date, compute the
// transit ephemeris and classify every transit-to-natal pair.
//
// Source: transit_engine.py

import { computeEphemeris, type PlanetPosition } from "./ephemeris";
import {
  classifyPair,
  type ClassifiedAspect,
  buildShadowNetwork,
  buildBoundaryNetwork,
  type ResidueBond,
} from "./aspects";
import { SHADOW_LANE_NAMES, BOUNDARY_LANE_NAMES } from "./constants";
import type { FullChart } from "./chart";

export interface TransitHit {
  transit: string;
  natal: string;
  aspect: ClassifiedAspect;
}

export interface TransitChart {
  jd: number;
  transitPlanets: PlanetPosition[];
  hits: TransitHit[];
  shadowCrossLocks: ResidueBond[];
  boundaryCrossLocks: ResidueBond[];
}

/** Compute the transit chart at `jd` against the natal chart. */
export function computeTransits(natal: FullChart, jd: number): TransitChart {
  const transit = computeEphemeris(jd);

  // Aspect hits: each transit planet vs. each natal planet
  const hits: TransitHit[] = [];
  for (const t of transit.planets) {
    for (const n of natal.ephemeris.planets) {
      // classifyPair already returns ClassifiedAspect[]
      const matches = classifyPair(
        { ...t, name: t.name } as PlanetPosition,
        { ...n, name: `n.${n.name}` } as PlanetPosition,
      );
      for (const m of matches) {
        hits.push({
          transit: t.name,
          natal: n.name,
          aspect: { ...m, a: t.name, b: n.name },
        });
      }
    }
  }

  // Cross-chart residue locks: transit_r11 == natal_r11 etc.
  const crossShadow: ResidueBond[] = [];
  const crossBoundary: ResidueBond[] = [];
  for (const t of transit.planets) {
    for (const n of natal.ephemeris.planets) {
      if (t.address.r11 === n.address.r11) {
        const r = Number(t.address.r11);
        crossShadow.push({
          a: `t.${t.name}`,
          b: `n.${n.name}`,
          residue: r,
          laneName: SHADOW_LANE_NAMES[r],
        });
      }
      if (t.address.r13 === n.address.r13) {
        const r = Number(t.address.r13);
        crossBoundary.push({
          a: `t.${t.name}`,
          b: `n.${n.name}`,
          residue: r,
          laneName: BOUNDARY_LANE_NAMES[r],
        });
      }
    }
  }

  return {
    jd,
    transitPlanets: transit.planets,
    hits,
    shadowCrossLocks: crossShadow,
    boundaryCrossLocks: crossBoundary,
  };
}

/** Quick scan: which days in [startJd, endJd] (stride days) have an active
 * cross-shadow lock for the named planet? Lightweight indicator only. */
export function scanShadowWindow(
  natal: FullChart,
  startJd: number,
  endJd: number,
  planet: string,
  stride = 1,
): number[] {
  const out: number[] = [];
  for (let jd = startJd; jd <= endJd; jd += stride) {
    const t = computeEphemeris(jd);
    const p = t.planets.find((x) => x.name === planet);
    if (!p) continue;
    for (const n of natal.ephemeris.planets) {
      if (p.address.r11 === n.address.r11) {
        out.push(jd);
        break;
      }
    }
  }
  return out;
}

void buildShadowNetwork;
void buildBoundaryNetwork;
