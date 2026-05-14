// Declinations + parallels.
//
// Declination = the angular distance of a body north (+) or south (−) of
// the celestial equator. Computed from ecliptic longitude + latitude via
// the obliquity ε:
//   sin(δ) = sin(β) cos(ε) + cos(β) sin(ε) sin(λ)
// For most planets we ignore ecliptic latitude β (small) — except the
// Moon (β up to ±5°) and Pluto.
//
// Out-of-bounds: |δ| > obliquity (≈ 23.43°) — the planet has wandered
// beyond the Sun's seasonal latitude limits. Astrologically: amplified,
// untamed expression.
//
// Parallel: two bodies at the same declination (orb ~1°), regardless of
// hemisphere. Treated like a conjunction in classical astrology.
// Contra-parallel: same magnitude, opposite hemispheres — treated like
// an opposition.

import { jdToCenturiesJ2000 } from "./julian";

const DEG = Math.PI / 180;

function obliquityDeg(jd: number): number {
  const T = jdToCenturiesJ2000(jd);
  return 23.43929111 - 0.013004167 * T - 1.6389e-7 * T * T + 5.0361e-7 * T * T * T;
}

/** Declination in degrees, given ecliptic longitude (deg) and latitude (deg). */
export function declinationDeg(longitudeDeg: number, latitudeDeg: number, jd: number): number {
  const eps = obliquityDeg(jd) * DEG;
  const lam = longitudeDeg * DEG;
  const beta = latitudeDeg * DEG;
  const sinDelta = Math.sin(beta) * Math.cos(eps) + Math.cos(beta) * Math.sin(eps) * Math.sin(lam);
  return Math.asin(sinDelta) / DEG;
}

export interface DeclinationInfo {
  name: string;
  declinationDeg: number;
  outOfBounds: boolean;
}

/** For each planet, derive declination (assuming β = 0 for non-Moon
 *  bodies — accurate to ~0.5° for everything but Pluto). */
export function declinationsForPlanets(
  planets: ReadonlyArray<{ name: string; longitudeArcsec: bigint }>,
  jd: number,
): DeclinationInfo[] {
  const eps = obliquityDeg(jd);
  return planets.map((p) => {
    const lonDeg = Number(p.longitudeArcsec) / 3600;
    // We don't carry ecliptic latitude through the ephemeris pipeline yet;
    // β = 0 is correct for the Sun and adequate for everything else within
    // the ~arc-minute accuracy of this app.
    const delta = declinationDeg(lonDeg, 0, jd);
    return { name: p.name, declinationDeg: delta, outOfBounds: Math.abs(delta) > eps };
  });
}

export type DeclinationContactKind = "parallel" | "contra-parallel";

export interface DeclinationContact {
  a: string;
  b: string;
  kind: DeclinationContactKind;
  orbDeg: number;
}

/** Find planet pairs in parallel / contra-parallel within `orbDeg`. */
export function findDeclinationContacts(
  decls: ReadonlyArray<DeclinationInfo>,
  orbDeg = 1,
): DeclinationContact[] {
  const out: DeclinationContact[] = [];
  for (let i = 0; i < decls.length; i++) {
    for (let j = i + 1; j < decls.length; j++) {
      const a = decls[i];
      const b = decls[j];
      const dParallel = Math.abs(a.declinationDeg - b.declinationDeg);
      const dContra = Math.abs(a.declinationDeg + b.declinationDeg);
      if (dParallel <= orbDeg) {
        out.push({ a: a.name, b: b.name, kind: "parallel", orbDeg: dParallel });
      }
      if (dContra <= orbDeg && Math.sign(a.declinationDeg) !== Math.sign(b.declinationDeg)) {
        out.push({ a: a.name, b: b.name, kind: "contra-parallel", orbDeg: dContra });
      }
    }
  }
  return out.sort((a, b) => a.orbDeg - b.orbDeg);
}
