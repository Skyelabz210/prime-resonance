// Vedic layer — Lahiri ayanamsa, sidereal longitudes, nakshatras, Vimsottari Dasha.
// All arcsec quantities are BigInt; all time quantities are days (number) keyed to JD.
//
// Source: vedic_layer.py (HackFate Research Laboratory)

import { J2000_JD } from "./julian";
import { FULL_CIRCLE_ARCSEC } from "./constants";
import { modBig } from "./crt";

// ─── Ayanamsa (integer math, mas precision) ───────────────────────────────

const LAHIRI_J2000_MAS = 85_801_800n; // 23.8338° × 3,600,000 mas/deg
const PRECESSION_RATE_MAS = 50_290n; // 50.29 "/yr × 1000 mas/"

/** Lahiri ayanamsa at JD, in BigInt arcseconds. */
export function ayanamsaArcsec(jd: number): bigint {
  const daysFromJ2000 = BigInt(Math.round(jd - J2000_JD));
  // years × 4 = days × 4 / 1461 (Julian year exact via the 4/1461 trick)
  const yearsX4 = daysFromJ2000 * 4n;
  const mas = LAHIRI_J2000_MAS + (PRECESSION_RATE_MAS * yearsX4) / 1461n;
  return mas / 1000n;
}

/** Tropical → sidereal longitude (arcsec). Pure integer subtraction mod 1,296,000. */
export function siderealLongitudeArcsec(tropicalArcsec: bigint, jd: number): bigint {
  return modBig(tropicalArcsec - ayanamsaArcsec(jd), FULL_CIRCLE_ARCSEC);
}

// ─── Nakshatras (27 lunar mansions, each 13°20' = 48,000") ────────────────

export const NAKSHATRA_SPAN_ARCSEC = 48_000n;

export const NAKSHATRA_NAMES = [
  "Ashvini",
  "Bharani",
  "Krittika",
  "Rohini",
  "Mrigashira",
  "Ardra",
  "Punarvasu",
  "Pushya",
  "Ashlesha",
  "Magha",
  "Purva Phalguni",
  "Uttara Phalguni",
  "Hasta",
  "Chitra",
  "Swati",
  "Vishakha",
  "Anuradha",
  "Jyeshtha",
  "Mula",
  "Purva Ashadha",
  "Uttara Ashadha",
  "Shravana",
  "Dhanishta",
  "Shatabhisha",
  "Purva Bhadrapada",
  "Uttara Bhadrapada",
  "Revati",
] as const;

export type DashaPlanet =
  | "Ketu"
  | "Venus"
  | "Sun"
  | "Moon"
  | "Mars"
  | "Rahu"
  | "Jupiter"
  | "Saturn"
  | "Mercury";

// Each nakshatra ruled by a planet (Dasha lord); 9 rulers × 3 cycles = 27.
export const NAKSHATRA_RULERS: readonly DashaPlanet[] = [
  "Ketu",
  "Venus",
  "Sun",
  "Moon",
  "Mars",
  "Rahu",
  "Jupiter",
  "Saturn",
  "Mercury",
  "Ketu",
  "Venus",
  "Sun",
  "Moon",
  "Mars",
  "Rahu",
  "Jupiter",
  "Saturn",
  "Mercury",
  "Ketu",
  "Venus",
  "Sun",
  "Moon",
  "Mars",
  "Rahu",
  "Jupiter",
  "Saturn",
  "Mercury",
] as const;

export interface NakshatraInfo {
  index: number; // 0..26
  name: string;
  ruler: DashaPlanet;
  pada: 1 | 2 | 3 | 4;
  positionInNakArcsec: bigint;
}

export function nakshatraInfo(siderealArcsec: bigint): NakshatraInfo {
  const lon = modBig(siderealArcsec, FULL_CIRCLE_ARCSEC);
  const idx = Number(lon / NAKSHATRA_SPAN_ARCSEC);
  const inside = lon % NAKSHATRA_SPAN_ARCSEC;
  const pada = (Number(inside / 12_000n) + 1) as 1 | 2 | 3 | 4;
  return {
    index: idx,
    name: NAKSHATRA_NAMES[idx],
    ruler: NAKSHATRA_RULERS[idx],
    pada,
    positionInNakArcsec: inside,
  };
}

// ─── Vimsottari Dasha (120 years = 2³ · 3 · 5) ────────────────────────────

export const VIMSOTTARI: ReadonlyArray<readonly [DashaPlanet, number]> = [
  ["Ketu", 7],
  ["Venus", 20],
  ["Sun", 6],
  ["Moon", 10],
  ["Mars", 7],
  ["Rahu", 18],
  ["Jupiter", 16],
  ["Saturn", 19],
  ["Mercury", 17],
] as const;
export const DASHA_TOTAL = 120;
const DAYS_PER_YEAR = 365.25;

export interface DashaPeriod {
  planet: DashaPlanet;
  startAge: number; // years since birth (decimal)
  endAge: number;
  years: number;
}

export interface CurrentDasha {
  mahadasha: DashaPlanet;
  mahadashaYears: number;
  elapsedInMahadasha: number;
  remainingInMahadasha: number;
  antardasha: DashaPlanet;
  ageYears: number;
}

function startIndexFor(ruler: DashaPlanet): number {
  return VIMSOTTARI.findIndex(([n]) => n === ruler);
}

function balanceYears(moonSidArcsec: bigint, startIdx: number): number {
  const inside = modBig(moonSidArcsec, NAKSHATRA_SPAN_ARCSEC);
  // fraction elapsed (per-mille) in nakshatra
  const frac = Number((inside * 1000n) / NAKSHATRA_SPAN_ARCSEC);
  return (VIMSOTTARI[startIdx][1] * (1000 - frac)) / 1000;
}

/** Generate complete Dasha timeline from birth to `years`. */
export function dashaTimeline(moonSidArcsec: bigint, years = 80): DashaPeriod[] {
  const nak = nakshatraInfo(moonSidArcsec);
  const startIdx = startIndexFor(nak.ruler);
  const remaining = balanceYears(moonSidArcsec, startIdx);

  const out: DashaPeriod[] = [];
  let age = 0,
    idx = startIdx;

  out.push({
    planet: VIMSOTTARI[idx][0],
    startAge: 0,
    endAge: remaining,
    years: remaining,
  });
  age = remaining;
  idx = (idx + 1) % 9;

  while (age < years) {
    const [name, dur] = VIMSOTTARI[idx];
    const end = Math.min(age + dur, years);
    out.push({ planet: name, startAge: age, endAge: end, years: dur });
    age += dur;
    idx = (idx + 1) % 9;
  }
  return out;
}

/** Compute the current mahadasha + antardasha at `targetJd` for a chart whose
 *  Moon sidereal longitude is `moonSidArcsec` and birth JD is `birthJd`. */
export function currentDasha(
  moonSidArcsec: bigint,
  birthJd: number,
  targetJd: number,
): CurrentDasha {
  const nak = nakshatraInfo(moonSidArcsec);
  const startIdx = startIndexFor(nak.ruler);
  const remainingFirst = balanceYears(moonSidArcsec, startIdx);

  const elapsedDays = Math.max(0, targetJd - birthJd);
  const elapsedYears = elapsedDays / DAYS_PER_YEAR;

  let mdIdx = startIdx;
  let elapsedInMd: number;

  if (elapsedYears < remainingFirst) {
    elapsedInMd = VIMSOTTARI[startIdx][1] - remainingFirst + elapsedYears;
  } else {
    let consumed = remainingFirst;
    mdIdx = (startIdx + 1) % 9;
    while (consumed + VIMSOTTARI[mdIdx][1] <= elapsedYears) {
      consumed += VIMSOTTARI[mdIdx][1];
      mdIdx = (mdIdx + 1) % 9;
    }
    elapsedInMd = elapsedYears - consumed;
  }
  const [mdName, mdYears] = VIMSOTTARI[mdIdx];

  // Antardasha: sub-periods follow same sequence starting from MD lord.
  let adConsumed = 0,
    adIdx = mdIdx;
  for (let i = 0; i < 9; i++) {
    const j = (mdIdx + i) % 9;
    const [, adFull] = VIMSOTTARI[j];
    const adLenYears = (mdYears * adFull) / DASHA_TOTAL;
    if (adConsumed + adLenYears > elapsedInMd) {
      adIdx = j;
      break;
    }
    adConsumed += adLenYears;
  }

  return {
    mahadasha: mdName,
    mahadashaYears: mdYears,
    elapsedInMahadasha: elapsedInMd,
    remainingInMahadasha: mdYears - elapsedInMd,
    antardasha: VIMSOTTARI[adIdx][0],
    ageYears: elapsedYears,
  };
}
