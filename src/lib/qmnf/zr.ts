// Zodiacal Releasing — Hellenistic time-lord system released from the Lot
// of Spirit (career/action) or Lot of Fortune (body/circumstance).
// Each sign releases a period of years equal to its planet's "minor period":
//   Aries/Scorpio = 15, Taurus/Libra = 8, Gemini/Virgo = 20, Cancer = 25,
//   Leo = 19, Sagittarius/Pisces = 12, Capricorn/Aquarius = 27.
// After a sign's period exhausts, releasing jumps to the next sign in
// zodiacal order (with the "loosing of the bond" peculiarity at sign 8
// from the starting sign).
//
// We compute Level-1 (general L1) periods only — the broad biographical
// chapters. Sub-periods (L2/L3/L4) can be added later.

const PERIOD_YEARS: number[] = [
  15, // Aries
  8, // Taurus
  20, // Gemini
  25, // Cancer
  19, // Leo
  20, // Virgo
  8, // Libra
  15, // Scorpio
  12, // Sagittarius
  27, // Capricorn
  27, // Aquarius
  12, // Pisces
];

import { ZODIAC_SIGNS } from "./constants";

export interface ZRPeriod {
  level: 1 | 2 | 3 | 4;
  signIndex: number;
  signName: string;
  startAge: number;
  endAge: number;
  years: number;
  /** True at the 8th-from-start sign — "loosing of the bond", a major
   *  reversal/destiny-pivot in the time-lord lineage. */
  loosingOfTheBond: boolean;
}

/** Generate L1 (annual-scale) zodiacal releasing periods from a starting
 *  sign (typically Lot of Spirit sign or Lot of Fortune sign). */
export function zodiacalReleasingL1(startSignIndex: number, maxAge = 90): ZRPeriod[] {
  const out: ZRPeriod[] = [];
  let cursor = startSignIndex;
  let age = 0;
  // Track distance-from-start for loosing-of-the-bond detection
  let stepsFromStart = 0;
  while (age < maxAge && out.length < 30) {
    const years = PERIOD_YEARS[cursor];
    const lob = stepsFromStart > 0 && stepsFromStart % 8 === 0;
    out.push({
      level: 1,
      signIndex: cursor,
      signName: ZODIAC_SIGNS[cursor].name,
      startAge: age,
      endAge: age + years,
      years,
      loosingOfTheBond: lob,
    });
    age += years;
    // Move to next sign in zodiacal order (with mid-cycle "leap" via LoB
    // simplification — full Valens rule is more complex).
    cursor = (cursor + 1) % 12;
    stepsFromStart++;
  }
  return out;
}

/** Return the active L1 period for a given age. */
export function currentL1(periods: readonly ZRPeriod[], age: number): ZRPeriod | null {
  return periods.find((p) => age >= p.startAge && age < p.endAge) ?? null;
}
