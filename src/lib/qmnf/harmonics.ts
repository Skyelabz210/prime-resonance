// nth-harmonic chart — Addey's harmonics technique.
// Each planet's longitude is multiplied by n and reduced mod 360°.
// The 5th harmonic reveals quintile patterns (creative talent);
// 7th reveals septile (purpose/fate); 9th reveals nonile (completion);
// 11th — the shadow signature — surfaces lane-11 bonds as conjunctions.

import { computeEphemeris, type PlanetPosition, type EphemerisChart } from "./ephemeris";
import { CrtAddress } from "./crt";
import { FULL_CIRCLE_ARCSEC } from "./constants";
import { buildAspects, type ClassifiedAspect } from "./aspects";

export interface HarmonicChart {
  n: number;
  jd: number;
  planets: PlanetPosition[];
  aspects: ClassifiedAspect[];
}

export function computeHarmonic(jd: number, n: number): HarmonicChart {
  const eph = computeEphemeris(jd);
  const planets: PlanetPosition[] = eph.planets.map((p) => {
    const N = BigInt(n);
    const lon =
      (((p.longitudeArcsec * N) % FULL_CIRCLE_ARCSEC) + FULL_CIRCLE_ARCSEC) % FULL_CIRCLE_ARCSEC;
    return {
      name: p.name,
      longitudeArcsec: lon,
      retrograde: p.retrograde,
      address: CrtAddress.fromArcsec(lon),
    };
  });
  return { n, jd, planets, aspects: buildAspects(planets) };
}

export function harmonicFromChart(eph: EphemerisChart, n: number): HarmonicChart {
  const planets: PlanetPosition[] = eph.planets.map((p) => {
    const N = BigInt(n);
    const lon =
      (((p.longitudeArcsec * N) % FULL_CIRCLE_ARCSEC) + FULL_CIRCLE_ARCSEC) % FULL_CIRCLE_ARCSEC;
    return {
      name: p.name,
      longitudeArcsec: lon,
      retrograde: p.retrograde,
      address: CrtAddress.fromArcsec(lon),
    };
  });
  return { n, jd: eph.jd, planets, aspects: buildAspects(planets) };
}
