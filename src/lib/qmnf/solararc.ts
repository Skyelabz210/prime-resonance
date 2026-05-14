// Solar Arc Directions — every natal point advances by the same arc that
// the Sun has traveled since birth.
// Solar arc per year ≈ 0.9856°/yr (the Sun's mean motion ≈ 1°/day, scaled
// by the day-for-year directional convention).
//
// Reference: Dirah/Naibod's measure. We use the exact "Naibod" arc
// 59′ 08″ per year = 0.9856° per year of life.

import { computeEphemeris, type PlanetPosition } from "./ephemeris";
import { CrtAddress } from "./crt";
import { FULL_CIRCLE_ARCSEC } from "./constants";

const NAIBOD_ARCSEC_PER_YEAR = 3548; // = 59'08" — same as the Sun's mean motion

export interface SolarArcChart {
  yearsForward: number;
  arcArcsec: bigint;
  planets: PlanetPosition[];
}

function modPos(a: bigint): bigint {
  return ((a % FULL_CIRCLE_ARCSEC) + FULL_CIRCLE_ARCSEC) % FULL_CIRCLE_ARCSEC;
}

/** Advance every natal position by `yearsForward` × Naibod arc. */
export function solarArcAdvance(natalJd: number, yearsForward: number): SolarArcChart {
  const arc = BigInt(Math.round(yearsForward * NAIBOD_ARCSEC_PER_YEAR));
  const natal = computeEphemeris(natalJd);
  return {
    yearsForward,
    arcArcsec: arc,
    planets: natal.planets.map((p) => {
      const lon = modPos(p.longitudeArcsec + arc);
      return {
        name: p.name,
        longitudeArcsec: lon,
        retrograde: p.retrograde,
        address: CrtAddress.fromArcsec(lon),
      };
    }),
  };
}

/** Exact age (yrs) at which a directed natal point reaches `targetArcsec`. */
export function solarArcAgeForTarget(natalArcsec: bigint, targetArcsec: bigint): number {
  const diff = modPos(targetArcsec - natalArcsec);
  return Number(diff) / NAIBOD_ARCSEC_PER_YEAR;
}
