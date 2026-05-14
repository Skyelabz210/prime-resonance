// Modular Event Predictor — no brute-force sampling. All event dates are
// solved by linear congruences against mean planetary motion.
//
// Source: event_predictor.py — adapted to JD-based dating.
//
// Convention:
//   - All longitudes BigInt arcseconds.
//   - All dates Julian Day numbers (number).
//   - Mean motion stored in arcsec/day (integer) — Saturn = 120"/day, etc.
//
// Note on the congruence: we need the *current* (natalJd) longitude of the
// transit, not its natal-chart longitude, because mean motion advances from
// where the transit actually is today. The caller passes `transitNowArcsec`.

import { FULL_CIRCLE_ARCSEC } from "./constants";
import { modBig } from "./crt";
import { extGcd } from "./kelim";
import { computeEphemeris } from "./ephemeris";

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
  /** True when the aspect carries the exclusive-11 shadow signature (biquintile family). */
  shadow?: boolean;
}

// ─── Solvers ──────────────────────────────────────────────────────────────

/** Approximate solver in days for speed · t ≡ target (mod m), `speed` in
 *  arcsec/day, `target` in arcsec, `m` = 1_296_000 (full circle). Returns the
 *  first non-negative t and the cycle step. */
function solveTimeApprox(speed: number, target: bigint, m: bigint): { t0: number; step: number } {
  const mn = Number(m);
  const targetN = ((Number(target) % mn) + mn) % mn;
  const t0 = targetN / speed;
  const step = mn / speed;
  return { t0, step };
}

/** Exact integer-congruence solver — used for mod-11 / mod-13 lane work. */
function solveTimeExact(
  speed: number,
  target: bigint,
  m: bigint,
): { t0: number; step: number } | null {
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

const ASPECT_ANGLES_ARCSEC: Array<{
  harmonic: number;
  name: string;
  arcsec: bigint;
  shadow?: boolean;
}> = [
  { harmonic: 1, name: "Conjunction", arcsec: 0n },
  { harmonic: 2, name: "Opposition", arcsec: 648_000n },
  { harmonic: 3, name: "Trine", arcsec: 432_000n },
  { harmonic: 4, name: "Square", arcsec: 324_000n },
  { harmonic: 5, name: "Quintile", arcsec: 259_200n },
  { harmonic: 6, name: "Sextile", arcsec: 216_000n },
  { harmonic: 10, name: "Biquintile", arcsec: 518_400n, shadow: true }, // exclusive-11 carry
];

function transitLongitudeAt(transit: string, jd: number): bigint {
  const e = computeEphemeris(jd);
  const p = e.planets.find((q) => q.name === transit);
  return p ? p.longitudeArcsec : 0n;
}

/**
 * Predict exact dates when a transit planet forms an aspect to a natal point.
 * Solves transit(jd0) + speed·t ≡ natal + aspect (mod 1_296_000) for t.
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
  const transitNow = transitLongitudeAt(transit, natalJd);
  const maxFwd = Math.round(yearsForward * DAYS_PER_YEAR);
  const minBack = -Math.round(yearsBack * DAYS_PER_YEAR);
  const out: EventHit[] = [];
  for (const asp of ASPECT_ANGLES_ARCSEC) {
    // Conj + opp covers ±aspect_angle. Other aspects fire twice per cycle
    // (once for +angle, once for −angle); we enumerate both targets.
    const angles =
      asp.arcsec === 0n || asp.arcsec * 2n === FULL_CIRCLE_ARCSEC
        ? [asp.arcsec]
        : [asp.arcsec, FULL_CIRCLE_ARCSEC - asp.arcsec];
    for (const ang of angles) {
      const target = modBig(natalArcsec + ang - transitNow, FULL_CIRCLE_ARCSEC);
      const sol = solveTimeApprox(speed, target, FULL_CIRCLE_ARCSEC);
      for (const t of allHits(sol.t0, sol.step, maxFwd)) {
        if (t === 0) continue;
        out.push({
          kind: "aspect",
          jd: natalJd + t,
          age: t / DAYS_PER_YEAR,
          planet: transit,
          aspect: asp.name,
          harmonic: asp.harmonic,
          shadow: !!asp.shadow,
        });
      }
      let t = sol.t0 - sol.step;
      while (t >= minBack) {
        out.push({
          kind: "aspect",
          jd: natalJd + t,
          age: t / DAYS_PER_YEAR,
          planet: transit,
          aspect: asp.name,
          harmonic: asp.harmonic,
          shadow: !!asp.shadow,
        });
        t -= sol.step;
      }
    }
  }
  return out.sort((a, b) => a.jd - b.jd);
}

/** Shadow activation: dates where transit_r11 ≡ natal_r11 (mod 11).
 *  Arcsec granularity = ~11 arcsec, so for fast movers this fires many times
 *  per day. Use the optional `minDayGap` to rate-limit consecutive hits.
 *  Not included in fullTimeline — biquintile aspects already carry the
 *  shadow:true tag at the meaningful resolution. */
export function predictShadowActivations(
  transit: string,
  natalArcsec: bigint,
  natalJd: number,
  years = 30,
  minDayGap = 7,
): EventHit[] {
  const speed = MEAN_MOTION_ARCSEC_PER_DAY[transit];
  if (!speed) return [];
  const transitNow = transitLongitudeAt(transit, natalJd);
  const maxDays = Math.round(years * DAYS_PER_YEAR);
  const target = modBig(natalArcsec - transitNow, 11n);
  const sol = solveTimeExact(speed, target, 11n);
  if (!sol) return [];
  const out: EventHit[] = [];
  let lastT = -Infinity;
  for (const t of allHits(Math.max(1, sol.t0), sol.step, maxDays)) {
    if (t - lastT < minDayGap) continue;
    lastT = t;
    out.push({
      kind: "shadow_activation",
      jd: natalJd + t,
      age: t / DAYS_PER_YEAR,
      planet: transit,
      detail: "transit r₁₁ ≡ natal r₁₁ — lane-11 lock",
    });
  }
  return out;
}

/** Boundary activation: dates where transit_r13 ≡ natal_r13 (mod 13). */
export function predictBoundaryActivations(
  transit: string,
  natalArcsec: bigint,
  natalJd: number,
  years = 30,
  minDayGap = 7,
): EventHit[] {
  const speed = MEAN_MOTION_ARCSEC_PER_DAY[transit];
  if (!speed) return [];
  const transitNow = transitLongitudeAt(transit, natalJd);
  const maxDays = Math.round(years * DAYS_PER_YEAR);
  const target = modBig(natalArcsec - transitNow, 13n);
  const sol = solveTimeExact(speed, target, 13n);
  if (!sol) return [];
  const out: EventHit[] = [];
  let lastT = -Infinity;
  for (const t of allHits(Math.max(1, sol.t0), sol.step, maxDays)) {
    if (t - lastT < minDayGap) continue;
    lastT = t;
    out.push({
      kind: "boundary_activation",
      jd: natalJd + t,
      age: t / DAYS_PER_YEAR,
      planet: transit,
      detail: "transit r₁₃ ≡ natal r₁₃ — lane-13 lock",
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
  // Shadow/boundary activations at arcsec granularity are too dense for a
  // human-readable life timeline; they live in the substrate (chart panels)
  // and the shadow:true flag on biquintile aspects gives the "shadow lit up"
  // signal at the meaningful resolution.
  const slow = ["Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"];
  for (const transit of slow) {
    for (const natal of natalPlanets) {
      const asp = predictAspects(transit, natal.longitudeArcsec, natalJd, yearsForward, yearsBack);
      for (const a of asp) {
        a.natalPlanet = natal.name;
        events.push(a);
      }
    }
    events.push(...predictReturns(transit, natalJd, yearsForward));
  }
  events.push(...predictCodexClosures(natalJd, yearsForward));
  return events.sort((a, b) => a.jd - b.jd);
}
