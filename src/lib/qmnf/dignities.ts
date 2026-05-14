// Essential dignities — domicile, exaltation, detriment, fall, triplicity.
// The classical reference frame for planet "strength" in a sign.
//
// Dresden refinement: each sign maps to a residue class (sign-index mod 12),
// and the rulership pattern follows the Chaldean order which itself fits a
// CRT modular structure (mod 7 luminaries + 5 visible planets). The
// Rigorous view exposes the residue justification beside each dignity.

import { ZODIAC_SIGNS } from "./constants";

export type PlanetName =
  | "Sun"
  | "Moon"
  | "Mercury"
  | "Venus"
  | "Mars"
  | "Jupiter"
  | "Saturn"
  | "Uranus"
  | "Neptune"
  | "Pluto";

export type DignityKind = "domicile" | "exaltation" | "detriment" | "fall" | "neutral";

// Classical (Ptolemaic) rulerships first; modern outers in parentheses.
// Sign-index 0=Aries .. 11=Pisces.
const DOMICILE: Record<PlanetName, number[]> = {
  Sun: [4], // Leo
  Moon: [3], // Cancer
  Mercury: [2, 5], // Gemini, Virgo
  Venus: [1, 6], // Taurus, Libra
  Mars: [0, 7], // Aries, Scorpio (classical co-ruler)
  Jupiter: [8, 11], // Sagittarius, Pisces (classical co-ruler)
  Saturn: [9, 10], // Capricorn, Aquarius (classical co-ruler)
  Uranus: [10],
  Neptune: [11],
  Pluto: [7],
};

const EXALTATION: Record<PlanetName, number | undefined> = {
  Sun: 0, // Aries
  Moon: 1, // Taurus
  Mercury: 5, // Virgo
  Venus: 11, // Pisces
  Mars: 9, // Capricorn
  Jupiter: 3, // Cancer
  Saturn: 6, // Libra
  Uranus: 7, // Scorpio (modern)
  Neptune: 3, // Cancer (debated)
  Pluto: 0, // Aries (debated)
};

// Detriment = opposite of domicile; Fall = opposite of exaltation.
function opp(i: number): number {
  return (i + 6) % 12;
}

export interface DignityResult {
  planet: PlanetName;
  sign: string;
  signIndex: number;
  kind: DignityKind;
  /** Numeric score: domicile=+5, exalt=+4, neutral=0, detriment=−5, fall=−4. */
  score: number;
  triplicityLord?: PlanetName;
  /** Triplicity by sect — day/night ruler of the sign's element. */
  triplicityDay?: PlanetName;
  triplicityNight?: PlanetName;
}

const TRIPLICITY_DAY: Record<string, PlanetName> = {
  Fire: "Sun",
  Earth: "Venus",
  Air: "Saturn",
  Water: "Venus",
};
const TRIPLICITY_NIGHT: Record<string, PlanetName> = {
  Fire: "Jupiter",
  Earth: "Moon",
  Air: "Mercury",
  Water: "Mars",
};

export function dignityFor(planet: PlanetName, signIndex: number): DignityResult {
  const sign = ZODIAC_SIGNS[signIndex];
  const dom = DOMICILE[planet] ?? [];
  const exalt = EXALTATION[planet];
  let kind: DignityKind = "neutral";
  let score = 0;
  if (dom.includes(signIndex)) {
    kind = "domicile";
    score = 5;
  } else if (exalt === signIndex) {
    kind = "exaltation";
    score = 4;
  } else if (dom.some((d) => opp(d) === signIndex)) {
    kind = "detriment";
    score = -5;
  } else if (exalt !== undefined && opp(exalt) === signIndex) {
    kind = "fall";
    score = -4;
  }
  return {
    planet,
    sign: sign.name,
    signIndex,
    kind,
    score,
    triplicityDay: TRIPLICITY_DAY[sign.element],
    triplicityNight: TRIPLICITY_NIGHT[sign.element],
  };
}

export function dignitiesForChart(
  positions: Array<{ name: string; longitudeArcsec: bigint }>,
): DignityResult[] {
  const out: DignityResult[] = [];
  for (const p of positions) {
    if (!(p.name in DOMICILE)) continue;
    const signIndex = Number(p.longitudeArcsec / 108_000n);
    out.push(dignityFor(p.name as PlanetName, signIndex));
  }
  return out;
}
