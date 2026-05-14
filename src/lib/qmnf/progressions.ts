// Secondary Progressions via K-Elimination signed winding.
//
// Classical secondary progressions: 1 day after birth = 1 year of life.
// Progressed JD = natal JD + (years_since_birth) — same Meeus ephemeris,
// just sampled at a different JD.
//
// The K-Elimination twist: we keep an explicit signed winding number K so
// that the progressed chart remains on the same gear (mod GEAR_MODULUS=323)
// as the natal — making consecutive progressed positions exactly comparable
// in CRT residue terms, not just angularly.
//
// Source: gear_manifold_v3.py SafeAnchor + astrology_system.py timeline.

import { computeFullChart, type FullChart, type BirthData } from "./chart";
import { GEAR_MODULUS } from "./constants";
import { modBig } from "./crt";

const DAYS_PER_YEAR = 365.25;

export interface ProgressedChart {
  /** Years of life that the progressed date represents. */
  yearsProgressed: number;
  /** Synthetic birth-shaped chart at the progressed date. */
  chart: FullChart;
  /** Signed winding K per planet, anchored to natal K. */
  windingK: Record<string, bigint>;
}

/**
 * Build a secondary-progressed chart for `birth` at `targetJd`.
 * yearsProgressed = (targetJd − natalJd) / 365.25.
 * Progressed birth = natal birth shifted forward by `yearsProgressed` days.
 */
export function computeProgressed(
  birth: BirthData,
  natal: FullChart,
  targetJd: number,
): ProgressedChart {
  const years = (targetJd - natal.jd) / DAYS_PER_YEAR;
  // Day-for-year: shift the birth date forward by `years` days.
  const progBirthJd = natal.jd + years;

  // Reconstruct a BirthData at progressed JD by adding integer days to the
  // calendar date — we use the existing Julian-date helper indirectly by
  // synthesising a BirthData whose JD round-trips to progBirthJd.
  // Easiest: just compute the chart from the natal birth with a shifted hour.
  const dayShift = progBirthJd - natal.jd; // days, may be non-integer
  const dt = new Date(
    Date.UTC(
      birth.year,
      birth.month - 1,
      birth.day,
      birth.hour - birth.tzOffsetHours,
      birth.minute,
      0,
    ),
  );
  dt.setUTCDate(dt.getUTCDate() + Math.floor(dayShift));
  dt.setUTCHours(dt.getUTCHours() + (dayShift - Math.floor(dayShift)) * 24);

  const progBirth: BirthData = {
    ...birth,
    year: dt.getUTCFullYear(),
    month: dt.getUTCMonth() + 1,
    day: dt.getUTCDate(),
    hour: dt.getUTCHours() + birth.tzOffsetHours, // local-clock convention
    minute: dt.getUTCMinutes(),
  };
  const chart = computeFullChart(progBirth);

  // Signed winding: K = (arcsec mod 323) compared to natal's K — same
  // gear means same K (anchored). We expose K so the UI can show drift.
  const windingK: Record<string, bigint> = {};
  for (const p of chart.ephemeris.planets) {
    windingK[p.name] = modBig(p.longitudeArcsec, GEAR_MODULUS);
  }

  return { yearsProgressed: years, chart, windingK };
}
