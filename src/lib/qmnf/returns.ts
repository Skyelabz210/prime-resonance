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
 *  Strategy: coarse scan in period/12 steps over [aroundJd - period, aroundJd + period],
 *  pick the first sign-change bracket, then bisect to arcsec precision. */
function solveReturn(planet: string, targetDeg: number, aroundJd: number): number {
  const period = SIDEREAL_DAYS[planet] ?? 365.25;
  const lonAt = (jd: number) => {
    const e = computeEphemeris(jd);
    const p = e.planets.find((q) => q.name === planet);
    return p ? Number(p.longitudeArcsec) / 3600 : 0;
  };
  const fDelta = (jd: number) => angularDelta(lonAt(jd), targetDeg);

  // Coarse scan: 24 samples across two full periods centered on aroundJd.
  const stride = period / 12;
  const samples: { jd: number; f: number }[] = [];
  for (let k = -12; k <= 12; k++) {
    const jd = aroundJd + k * stride;
    samples.push({ jd, f: fDelta(jd) });
  }
  // Pick the bracket whose midpoint is closest to aroundJd.
  let best: { lo: number; hi: number; fLo: number; fHi: number; dist: number } | null = null;
  for (let i = 0; i < samples.length - 1; i++) {
    if (samples[i].f * samples[i + 1].f <= 0) {
      const mid = (samples[i].jd + samples[i + 1].jd) / 2;
      const dist = Math.abs(mid - aroundJd);
      if (!best || dist < best.dist) {
        best = {
          lo: samples[i].jd,
          hi: samples[i + 1].jd,
          fLo: samples[i].f,
          fHi: samples[i + 1].f,
          dist,
        };
      }
    }
  }
  if (!best) return aroundJd; // no crossing found in ±2 periods — give up
  let { lo, hi, fLo } = best;
  // Bisection
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    const fMid = fDelta(mid);
    if (Math.abs(fMid) < 1e-5) return mid;
    if (fLo * fMid <= 0) {
      hi = mid;
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
