// Composite chart — midpoint of two charts.
// Each composite planet is the midpoint of the two corresponding natal
// planets (in arcseconds, mod 360°).
//
// Dresden refinement: the CRT residues compose homomorphically — the
// composite r_p ≡ ((r_p_a + r_p_b)/2) mod p, but only when (a+b) is even
// modulo p. The Rigorous view flags pairs where parity breaks.

import { computeEphemeris, type PlanetPosition, type EphemerisChart } from "./ephemeris";
import { FULL_CIRCLE_ARCSEC } from "./constants";
import { CrtAddress } from "./crt";
import {
  buildAspects,
  buildShadowNetwork,
  buildBoundaryNetwork,
  type ClassifiedAspect,
  type ResidueBond,
} from "./aspects";
import { SHADOW_LANE_NAMES, BOUNDARY_LANE_NAMES } from "./constants";
import type { FullChart } from "./chart";

function midpointArcsec(a: bigint, b: bigint): bigint {
  // Midpoint along the shorter arc.
  const diff = (((b - a) % FULL_CIRCLE_ARCSEC) + FULL_CIRCLE_ARCSEC) % FULL_CIRCLE_ARCSEC;
  const half = FULL_CIRCLE_ARCSEC / 2n;
  const m = diff > half ? (a + b + FULL_CIRCLE_ARCSEC) / 2n : (a + b) / 2n;
  return ((m % FULL_CIRCLE_ARCSEC) + FULL_CIRCLE_ARCSEC) % FULL_CIRCLE_ARCSEC;
}

export interface CompositeChart {
  ephemeris: EphemerisChart;
  aspects: ClassifiedAspect[];
  shadowNetwork: ResidueBond[];
  boundaryNetwork: ResidueBond[];
  /** Davison reference JD = midpoint of (jdA, jdB). */
  jd: number;
}

export function computeComposite(a: FullChart, b: FullChart): CompositeChart {
  const planets: PlanetPosition[] = a.ephemeris.planets.map((pa) => {
    const pb = b.ephemeris.planets.find((q) => q.name === pa.name)!;
    const lon = midpointArcsec(pa.longitudeArcsec, pb.longitudeArcsec);
    return {
      name: pa.name,
      longitudeArcsec: lon,
      retrograde: pa.retrograde && pb.retrograde,
      address: CrtAddress.fromArcsec(lon),
    };
  });
  const aspects = buildAspects(planets);
  const shadowNetwork = buildShadowNetwork(planets, SHADOW_LANE_NAMES);
  const boundaryNetwork = buildBoundaryNetwork(planets, BOUNDARY_LANE_NAMES);
  return {
    ephemeris: { jd: (a.jd + b.jd) / 2, planets },
    aspects,
    shadowNetwork,
    boundaryNetwork,
    jd: (a.jd + b.jd) / 2,
  };
}

/** Davison Relationship chart — actual ephemeris at the midpoint date/space.
 *  Different from composite (midpoint of positions); same name commonly. */
export function computeDavison(a: FullChart, b: FullChart): CompositeChart {
  const mid = (a.jd + b.jd) / 2;
  const eph = computeEphemeris(mid);
  return {
    ephemeris: eph,
    aspects: buildAspects(eph.planets),
    shadowNetwork: buildShadowNetwork(eph.planets, SHADOW_LANE_NAMES),
    boundaryNetwork: buildBoundaryNetwork(eph.planets, BOUNDARY_LANE_NAMES),
    jd: mid,
  };
}
