// Midpoints — Ebertin's cosmobiology. The midpoint of two planets is an
// active sensitive degree; any third body within ~1.5° of that midpoint
// activates the pair's combined meaning.
//
// Dresden refinement: the midpoint operation M(λ_a, λ_b) = (λ_a + λ_b)/2
// is the *arithmetic mean* on the 1,296,000″ ring. The midpoint inherits
// residues (r_a + r_b)/2 mod p when the parity allows — a clean CRT
// homomorphism. A planet conjunct a midpoint on lane-11 inserts itself
// into the shadow bond *between* two other bodies.

import { FULL_CIRCLE_ARCSEC } from "./constants";
import { CrtAddress } from "./crt";

function modPos(a: bigint): bigint {
  return ((a % FULL_CIRCLE_ARCSEC) + FULL_CIRCLE_ARCSEC) % FULL_CIRCLE_ARCSEC;
}

function midpointArcsec(a: bigint, b: bigint): bigint {
  // Midpoint along the shorter arc — same logic as composite.ts midpoint
  const diff = modPos(b - a);
  const half = FULL_CIRCLE_ARCSEC / 2n;
  const m = diff > half ? (a + b + FULL_CIRCLE_ARCSEC) / 2n : (a + b) / 2n;
  return modPos(m);
}

export interface MidpointTrigger {
  /** "A/B" — the parental midpoint (Ebertin notation). */
  pair: string;
  midpointArcsec: bigint;
  /** The third planet that activates the midpoint. */
  activator: string;
  /** Orb in arcseconds (absolute). */
  orbArcsec: bigint;
  /** Address of the midpoint (residues participate in shadow / boundary networks). */
  address: CrtAddress;
}

interface Pos {
  name: string;
  longitudeArcsec: bigint;
}

function absOrb(a: bigint, b: bigint): bigint {
  let d = modPos(a - b);
  if (d > FULL_CIRCLE_ARCSEC / 2n) d = FULL_CIRCLE_ARCSEC - d;
  return d;
}

/** Find all 3-body midpoint triggers: planet C within `orbDeg` of the
 *  midpoint of planets A and B. Also flags hard-aspects (square / opp) to
 *  the midpoint — Ebertin's primary "direct + indirect" triggering modes. */
export function findMidpoints(planets: readonly Pos[], orbDeg = 1.5): MidpointTrigger[] {
  const orb = BigInt(Math.round(orbDeg * 3600));
  const HARD = [
    0n,
    FULL_CIRCLE_ARCSEC / 4n,
    FULL_CIRCLE_ARCSEC / 2n,
    (FULL_CIRCLE_ARCSEC * 3n) / 4n,
  ];
  const out: MidpointTrigger[] = [];
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const m = midpointArcsec(planets[i].longitudeArcsec, planets[j].longitudeArcsec);
      for (let c = 0; c < planets.length; c++) {
        if (c === i || c === j) continue;
        for (const angle of HARD) {
          const target = modPos(m + angle);
          const d = absOrb(planets[c].longitudeArcsec, target);
          if (d <= orb) {
            out.push({
              pair: `${planets[i].name}/${planets[j].name}`,
              midpointArcsec: m,
              activator: planets[c].name,
              orbArcsec: d,
              address: CrtAddress.fromArcsec(m),
            });
          }
        }
      }
    }
  }
  // Sort by orb tightness
  return out.sort((a, b) => Number(a.orbArcsec - b.orbArcsec));
}
