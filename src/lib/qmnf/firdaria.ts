// Firdaria — Persian time-lord system. The 75-year life cycle is divided
// among the 7 traditional planets in fixed durations; each major period
// (Firdar) is further divided into 7 sub-periods (Sub-Firdars) ruled by
// each planet in turn for 1/7 of the major period.
//
// Day-chart sequence (Sun above horizon at birth):
//   Sun 10, Venus 8, Mercury 13, Moon 9, Saturn 11, Jupiter 12, Mars 7
// Night-chart sequence (Sun below horizon at birth):
//   Moon 9, Saturn 11, Jupiter 12, Mars 7, Sun 10, Venus 8, Mercury 13
// (Nodes are sometimes included at the end with 3-2 years; we omit for clarity.)

import type { PlanetName } from "./dignities";

const DAY_SEQUENCE: ReadonlyArray<readonly [PlanetName, number]> = [
  ["Sun", 10],
  ["Venus", 8],
  ["Mercury", 13],
  ["Moon", 9],
  ["Saturn", 11],
  ["Jupiter", 12],
  ["Mars", 7],
];

const NIGHT_SEQUENCE: ReadonlyArray<readonly [PlanetName, number]> = [
  ["Moon", 9],
  ["Saturn", 11],
  ["Jupiter", 12],
  ["Mars", 7],
  ["Sun", 10],
  ["Venus", 8],
  ["Mercury", 13],
];

export interface FirdarPeriod {
  lord: PlanetName;
  startAge: number;
  endAge: number;
  years: number;
  /** Sub-periods (one per planet), each = years / 7. */
  subPeriods: SubFirdar[];
}

export interface SubFirdar {
  lord: PlanetName;
  startAge: number;
  endAge: number;
}

/** Compute the complete Firdaria timeline (~75 years) given chart sect. */
export function firdariaTimeline(isDayChart: boolean): FirdarPeriod[] {
  const seq = isDayChart ? DAY_SEQUENCE : NIGHT_SEQUENCE;
  const out: FirdarPeriod[] = [];
  let age = 0;
  for (const [lord, years] of seq) {
    const subYears = years / 7;
    const subs: SubFirdar[] = [];
    let subAge = age;
    // Sub-periods cycle through all 7 traditional planets *starting with the
    // major period's lord*.
    const lordIdx = seq.findIndex(([n]) => n === lord);
    for (let k = 0; k < 7; k++) {
      const [sl] = seq[(lordIdx + k) % 7];
      subs.push({ lord: sl, startAge: subAge, endAge: subAge + subYears });
      subAge += subYears;
    }
    out.push({ lord, startAge: age, endAge: age + years, years, subPeriods: subs });
    age += years;
  }
  return out;
}

export interface CurrentFirdar {
  major: FirdarPeriod;
  sub: SubFirdar;
}

export function currentFirdar(
  timeline: readonly FirdarPeriod[],
  age: number,
): CurrentFirdar | null {
  const major = timeline.find((p) => age >= p.startAge && age < p.endAge);
  if (!major) return null;
  const sub = major.subPeriods.find((s) => age >= s.startAge && age < s.endAge);
  if (!sub) return null;
  return { major, sub };
}
