// Solar/Lunar/Saturn returns — find the JD when a transiting planet
// returns to its natal longitude.
// Computed via root-finding on the angular delta in a window.

import { computeEphemeris } from "./ephemeris";

const SIDEREAL_DAYS: Record<string, number> = {
  Sun: 365.2422,
  Moon: 27.3217,
  Mercury: 87.97,
  Venus: 224.7,
  Mars: 686.97,
  Jupiter: 4332.59,
  Saturn: 10759.22,
  Uranus: 30688.5,
  Neptune: 60182,
  Pluto: 90560,
};

function angularDelta(a: number, b: number): number {
  let d = a - b;
  while (d > 180) d -= 360;
  while (d < -180) d += 360;
  return d;
}

/** Locate the JD nearest `aroundJd` when `planet` is at `targetDeg`.
 *  Uses one quick bisection within ±half-cycle. */
function solveReturn(planet: string, targetDeg: number, aroundJd: number): number {
  const period = SIDEREAL_DAYS[planet] ?? 365.25;
  const half = period / 2;
  let lo = aroundJd - half;
  let hi = aroundJd + half;
  const lonAt = (jd: number) => {
    const e = computeEphemeris(jd);
    const p = e.planets.find((q) => q.name === planet);
    return p ? Number(p.longitudeArcsec) / 3600 : 0;
  };
  const fDelta = (jd: number) => angularDelta(lonAt(jd), targetDeg);
  // bisect: find sign change
  let fLo = fDelta(lo);
  let fHi = fDelta(hi);
  if (fLo * fHi > 0) {
    // No crossing in this window: walk outwards by period
    for (let k = 1; k <= 3; k++) {
      lo = aroundJd + (k - 0.5) * period;
      hi = aroundJd + (k + 0.5) * period;
      fLo = fDelta(lo);
      fHi = fDelta(hi);
      if (fLo * fHi < 0) break;
    }
  }
  for (let i = 0; i < 32; i++) {
    const mid = (lo + hi) / 2;
    const fMid = fDelta(mid);
    if (Math.abs(fMid) < 1e-4) return mid;
    if (fLo * fMid <= 0) {
      hi = mid;
      fHi = fMid;
    } else {
      lo = mid;
      fLo = fMid;
    }
  }
  return (lo + hi) / 2;
}

/** Solar return JD nearest `targetJd` (typically next birthday). */
export function solarReturnJD(natalSunDeg: number, targetJd: number): number {
  return solveReturn("Sun", natalSunDeg, targetJd);
}

/** Lunar return JD nearest `targetJd`. */
export function lunarReturnJD(natalMoonDeg: number, targetJd: number): number {
  return solveReturn("Moon", natalMoonDeg, targetJd);
}

/** Generic planetary return. */
export function planetaryReturnJD(planet: string, natalDeg: number, targetJd: number): number {
  return solveReturn(planet, natalDeg, targetJd);
}
