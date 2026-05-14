// Annual Profections — Hellenistic time-lord system.
// Each year of life advances the "profected sign" by 1 sign starting from
// the Ascendant at age 0. The traditional ruler of that sign is the "Lord
// of the Year" — the planet that becomes the primary activator of the
// year's themes. Monthly profections divide each annual sign into 12
// further 1-month signs.
//
// Source: Vettius Valens, Anthologies VII; modern revival by Brennan.

import type { PlanetName } from "./dignities";
import { ZODIAC_SIGNS } from "./constants";

const TRAD_SIGN_RULER: PlanetName[] = [
  "Mars",
  "Venus",
  "Mercury",
  "Moon",
  "Sun",
  "Mercury",
  "Venus",
  "Mars",
  "Jupiter",
  "Saturn",
  "Saturn",
  "Jupiter",
];

export interface ProfectionState {
  age: number;
  /** Sign index reached this year (0=Aries..11=Pisces). */
  signIndex: number;
  signName: string;
  /** Equivalent natal house — house 1 at age 0/12/24/..., house 2 at age 1/13/... */
  houseNumber: number;
  /** Lord of the Year — traditional ruler of the profected sign. */
  lordOfYear: PlanetName;
}

/** Compute annual profection at age `age`, given the Ascendant sign index. */
export function profectionAt(ascSignIndex: number, age: number): ProfectionState {
  const houseNumber = (age % 12) + 1;
  const signIndex = (ascSignIndex + age) % 12;
  return {
    age,
    signIndex,
    signName: ZODIAC_SIGNS[signIndex].name,
    houseNumber,
    lordOfYear: TRAD_SIGN_RULER[signIndex],
  };
}

export interface MonthlyProfection {
  monthIndex: number; // 0..11 within the profection year
  signIndex: number;
  signName: string;
  lord: PlanetName;
}

/** 12 monthly profections within a given annual profection. */
export function monthlyProfections(ascSignIndex: number, age: number): MonthlyProfection[] {
  const annual = profectionAt(ascSignIndex, age);
  return Array.from({ length: 12 }, (_, m) => {
    const idx = (annual.signIndex + m) % 12;
    return {
      monthIndex: m,
      signIndex: idx,
      signName: ZODIAC_SIGNS[idx].name,
      lord: TRAD_SIGN_RULER[idx],
    };
  });
}

/** Full timeline: ages 0 to `maxAge`. */
export function profectionTimeline(ascSignIndex: number, maxAge: number): ProfectionState[] {
  return Array.from({ length: maxAge + 1 }, (_, age) => profectionAt(ascSignIndex, age));
}
