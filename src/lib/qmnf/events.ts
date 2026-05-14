// Modular Event Predictor — no brute-force sampling. All event dates are
// solved by linear congruences against mean planetary motion.
//
// Source: event_predictor.py — adapted to JD-based dating.
//
// Convention:
//   - All longitudes BigInt arcseconds.
//   - All dates Julian Day numbers (number).
//   - Mean motion stored in arcsec/day (integer) — Saturn = 120"/day, etc.

import { FULL_CIRCLE_ARCSEC } from "./constants";
import { modBig } from "./crt";
import { extGcd } from "./kelim";

/** Mean daily motion (arcsec/day) — integer constants. */
export const MEAN_MOTION_ARCSEC_PER_DAY: Record<string, number> = {
  Sun: 3548,
  Moon: 47_400,
  Mercury: 14_400,
  Venus: 5760,
  Mars: 1886,
  Jupiter: 299,
  Saturn: 120,
  Uranus: 42,
  Neptune: 21,
  Pluto: 14,
  NorthNode: 190,
  Chiron: 30,
};

/** Sidereal (orbital) periods, integer days — for return prediction. */
export const SIDEREAL_DAYS: Record<string, number> = {
  Sun: 365,
  Moon: 27,
  Mercury: 88,
  Venus: 225,
  Mars: 687,
  Jupiter: 4333,
  Saturn: 10_759,
  Uranus: 30_687,
  Neptune: 60_190,
  Pluto: 90_560,
  NorthNode: 6798,
  Chiron: 18_400,
};

const DAYS_PER_YEAR = 365.25;

export type EventKind =
  | "aspect"
  | "shadow_activation" // Δ ≡ 0 (mod 11)
  | "boundary_activation" // Δ ≡ 0 (mod 13)
  | "return"
  | "tzolkin_return"
  | "calendar_round"
  | "eclipse_shadow"
  | "saturn_return";

export interface EventHit {
  kind: EventKind;
  jd: number;
  age: number; // years since natalJd
  planet: string;
  natalPlanet?: string;
  aspect?: string;
  harmonic?: number;
  detail?: string;
}

// ─── Linear congruence solver wrapper ─────────────────────────────────────

/** Solve speed · t ≡ target (mod m) for non-negative t.
 *  Returns the principal solution t0 and the step. */
function solveTime(speed: number, target: bigint, m: bigint): { t0: number; step: number } | null {
  const a = BigInt(speed);
  const { gcd, s } = extGcd(modBig(a, m), m);
  if (modBig(target, gcd) !== 0n) return null;
  const step = m / gcd;
  const t0 = modBig(s * (target / gcd), step);
  return { t0: Number(t0), step: Number(step) };
}

function* allHits(t0: number, step: number, maxDays: number): Generator<number> {
  let t = t0;
  while (t <= maxDays) {
    if (t >= 0) yield t;
    t += step;
  }
}

// ─── Aspect prediction ────────────────────────────────────────────────────

const ASPECT_ANGLES_ARCSEC: Array<{ harmonic: number; name: string; arcsec: bigint }> = [
  { harmonic: 1, name: "Conjunction", arcsec: 0n },
  { harmonic: 2, name: "Opposition", arcsec: 648_000n },
  { harmonic: 3, name: "Trine", arcsec: 432_000n },
  { harmonic: 4, name: "Square", arcsec: 324_000n },
  { harmonic: 6, name: "Sextile", arcsec: 216_000n },
  { harmonic: 10, name: "Biquintile", arcsec: 518_400n }, // shadow aspect
];

/**
 * Predict exact dates when a transit planet forms an aspect to a natal point.
 * Uses linear congruence over mean motion — exact integer dates.
 */
export function predictAspects(
  transit: string,
  natalArcsec: bigint,
  natalJd: number,
  yearsForward = 30,
  yearsBack = 0,
): EventHit[] {
  const speed = MEAN_MOTION_ARCSEC_PER_DAY[transit];
  if (!speed) return [];
  const maxFwd = Math.round(yearsForward * DAYS_PER_YEAR);
  const minBack = -Math.round(yearsBack * DAYS_PER_YEAR);
  const out: EventHit[] = [];
  for (const asp of ASPECT_ANGLES_ARCSEC) {
    // We want longitude(t) = natalArcsec + aspect.angle → speed·t ≡ aspect (mod 1_296_000)
    const sol = solveTime(speed, asp.arcsec, FULL_CIRCLE_ARCSEC);
    if (!sol) continue;
    for (const t of allHits(sol.t0, sol.step, maxFwd)) {
      out.push({
        kind: "aspect",
        jd: natalJd + t,
        age: t / DAYS_PER_YEAR,
        planet: transit,
        aspect: asp.name,
        harmonic: asp.harmonic,
      });
    }
    // Backward
    let t = sol.t0 - sol.step;
    while (t >= minBack) {
      out.push({
        kind: "aspect",
        jd: natalJd + t,
        age: t / DAYS_PER_YEAR,
        planet: transit,
        aspect: asp.name,
        harmonic: asp.harmonic,
      });
      t -= sol.step;
    }
  }
  return out.sort((a, b) => a.jd - b.jd);
}

/** Shadow activation: dates where Δ ≡ 0 (mod 11). */
export function predictShadowActivations(
  transit: string,
  natalArcsec: bigint,
  natalJd: number,
  years = 30,
): EventHit[] {
  const speed = MEAN_MOTION_ARCSEC_PER_DAY[transit];
  if (!speed) return [];
  const maxDays = Math.round(years * DAYS_PER_YEAR);
  // We want (natalArcsec + speed·t) mod 11 = natalArcsec mod 11 → speed·t ≡ 0 (mod 11)
  const sol = solveTime(speed, 0n, 11n);
  if (!sol) return [];
  const out: EventHit[] = [];
  for (const t of allHits(Math.max(1, sol.t0), sol.step, maxDays)) {
    out.push({
      kind: "shadow_activation",
      jd: natalJd + t,
      age: t / DAYS_PER_YEAR,
      planet: transit,
      detail: "Δ ≡ 0 (mod 11) — lane-11 lock",
    });
  }
  return out;
}

/** Boundary activation: dates where Δ ≡ 0 (mod 13). */
export function predictBoundaryActivations(
  transit: string,
  natalArcsec: bigint,
  natalJd: number,
  years = 30,
): EventHit[] {
  const speed = MEAN_MOTION_ARCSEC_PER_DAY[transit];
  if (!speed) return [];
  const maxDays = Math.round(years * DAYS_PER_YEAR);
  const sol = solveTime(speed, 0n, 13n);
  if (!sol) return [];
  const out: EventHit[] = [];
  for (const t of allHits(Math.max(1, sol.t0), sol.step, maxDays)) {
    out.push({
      kind: "boundary_activation",
      jd: natalJd + t,
      age: t / DAYS_PER_YEAR,
      planet: transit,
      detail: "Δ ≡ 0 (mod 13) — lane-13 lock",
    });
  }
  return out;
}

/** Returns: when does the transit planet return to its natal longitude. */
export function predictReturns(planet: string, natalJd: number, years = 90): EventHit[] {
  const period = SIDEREAL_DAYS[planet];
  if (!period) return [];
  const maxDays = years * DAYS_PER_YEAR;
  const out: EventHit[] = [];
  for (let k = 1; k * period <= maxDays; k++) {
    const t = k * period;
    out.push({
      kind: planet === "Saturn" ? "saturn_return" : "return",
      jd: natalJd + t,
      age: t / DAYS_PER_YEAR,
      planet,
      detail: `${k}× ${planet} return`,
    });
  }
  return out;
}

/** Codex closures: Tzolk'in (260), Calendar Round (18,980), Eclipse shadow (11,960). */
export function predictCodexClosures(natalJd: number, years = 90): EventHit[] {
  const maxDays = years * DAYS_PER_YEAR;
  const cycles: Array<{ kind: EventKind; days: number; detail: string }> = [
    { kind: "tzolkin_return", days: 260, detail: "Tzolk'in return (260 days)" },
    { kind: "calendar_round", days: 18_980, detail: "Calendar Round (18,980 days)" },
    { kind: "eclipse_shadow", days: 11_960, detail: "Eclipse table cycle (405 lunations)" },
  ];
  const out: EventHit[] = [];
  for (const c of cycles) {
    for (let k = 1; k * c.days <= maxDays; k++) {
      const t = k * c.days;
      out.push({
        kind: c.kind,
        jd: natalJd + t,
        age: t / DAYS_PER_YEAR,
        planet: "—",
        detail: `${k}× ${c.detail}`,
      });
    }
  }
  return out;
}

/** Full timeline: every event of every kind, sorted by date. */
export function fullTimeline(
  natalPlanets: Array<{ name: string; longitudeArcsec: bigint }>,
  natalJd: number,
  yearsForward = 60,
  yearsBack = 10,
): EventHit[] {
  const events: EventHit[] = [];
  // Slow movers only — Sun/Moon would flood the timeline.
  const slow = ["Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"];
  for (const transit of slow) {
    for (const natal of natalPlanets) {
      const asp = predictAspects(transit, natal.longitudeArcsec, natalJd, yearsForward, yearsBack);
      for (const a of asp) {
        a.natalPlanet = natal.name;
        events.push(a);
      }
      events.push(
        ...predictShadowActivations(transit, natal.longitudeArcsec, natalJd, yearsForward),
      );
      events.push(
        ...predictBoundaryActivations(transit, natal.longitudeArcsec, natalJd, yearsForward),
      );
    }
    events.push(...predictReturns(transit, natalJd, yearsForward));
  }
  events.push(...predictCodexClosures(natalJd, yearsForward));
  return events.sort((a, b) => a.jd - b.jd);
}
