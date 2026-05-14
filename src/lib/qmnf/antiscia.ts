// Antiscia and contra-antiscia — the mirror points across the
// Cancer/Capricorn solstice axis (antiscia) and the Aries/Libra equinox axis
// (contra-antiscia). Used in classical astrology to find hidden ties between
// planets that share the same declination by symmetry.
//
// Dresden refinement: the antiscia operation is a pure integer involution on
// the 1,296,000″ ring — A(λ) = (180° − λ) mod 360°, applied to arcsec. It
// preserves r₂, inverts r₃·r₅·r₇·r₁₁·r₁₃ in a clean modular way. Two
// planets in mutual antiscia have *opposite* shadow lanes — i.e., their r₁₁
// residues sum to 11 (or 0). This makes antiscia a Dresden-native shadow
// operation, not a folk technique.

import { FULL_CIRCLE_ARCSEC } from "./constants";

function modPos(a: bigint): bigint {
  return ((a % FULL_CIRCLE_ARCSEC) + FULL_CIRCLE_ARCSEC) % FULL_CIRCLE_ARCSEC;
}

/** Antiscion: mirror across 0° Cancer / 0° Capricorn axis.
 *  Formula: A(λ) = (270° − λ) mod 360°. */
export function antiscionArcsec(arcsec: bigint): bigint {
  return modPos(BigInt(270 * 3600) - arcsec);
}

/** Contra-antiscion: mirror across 0° Aries / 0° Libra. C(λ) = (180° − λ). */
export function contraAntiscionArcsec(arcsec: bigint): bigint {
  return modPos(BigInt(180 * 3600) - arcsec);
}

export interface AntisciaContact {
  a: string;
  b: string;
  kind: "antiscia" | "contra-antiscia";
  orbArcsec: bigint;
}

/** Find planet pairs in mutual antiscia or contra-antiscia within `orbDeg`. */
export function findAntisciaContacts(
  planets: Array<{ name: string; longitudeArcsec: bigint }>,
  orbDeg = 1,
): AntisciaContact[] {
  const orb = BigInt(Math.round(orbDeg * 3600));
  const out: AntisciaContact[] = [];
  for (let i = 0; i < planets.length; i++) {
    const a = planets[i];
    const ant = antiscionArcsec(a.longitudeArcsec);
    const con = contraAntiscionArcsec(a.longitudeArcsec);
    for (let j = i + 1; j < planets.length; j++) {
      const b = planets[j];
      const dA = absDiff(ant, b.longitudeArcsec);
      const dC = absDiff(con, b.longitudeArcsec);
      if (dA <= orb) {
        out.push({ a: a.name, b: b.name, kind: "antiscia", orbArcsec: dA });
      }
      if (dC <= orb) {
        out.push({ a: a.name, b: b.name, kind: "contra-antiscia", orbArcsec: dC });
      }
    }
  }
  return out;
}

function absDiff(a: bigint, b: bigint): bigint {
  let d = (((a - b) % FULL_CIRCLE_ARCSEC) + FULL_CIRCLE_ARCSEC) % FULL_CIRCLE_ARCSEC;
  if (d > FULL_CIRCLE_ARCSEC / 2n) d = FULL_CIRCLE_ARCSEC - d;
  return d;
}
