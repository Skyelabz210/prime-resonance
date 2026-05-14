// Egyptian Terms (bounds) — Hellenistic fine-dignity assignment.
// Each sign is divided into 5 unequal segments, each ruled by one of the 5
// non-luminary visible planets (Mercury, Venus, Mars, Jupiter, Saturn).
// A planet in its own term gets +2 essential-dignity points.
//
// Decans (faces) — each sign's 30° divided into three 10° decans, each
// ruled by a planet via the Chaldean order. A planet in its own face gets
// +1 essential-dignity point.

import type { PlanetName } from "./dignities";
import { ZODIAC_SIGNS } from "./constants";

// Egyptian terms: each entry = [signIndex, startDeg, endDeg, ruler].
// Source: Ptolemy via Robbins (Tetrabiblos I.20). Returns inclusive start,
// exclusive end within the sign.
export const EGYPTIAN_TERMS: ReadonlyArray<readonly [number, number, number, PlanetName]> = [
  // Aries
  [0, 0, 6, "Jupiter"],
  [0, 6, 12, "Venus"],
  [0, 12, 20, "Mercury"],
  [0, 20, 25, "Mars"],
  [0, 25, 30, "Saturn"],
  // Taurus
  [1, 0, 8, "Venus"],
  [1, 8, 14, "Mercury"],
  [1, 14, 22, "Jupiter"],
  [1, 22, 27, "Saturn"],
  [1, 27, 30, "Mars"],
  // Gemini
  [2, 0, 6, "Mercury"],
  [2, 6, 12, "Jupiter"],
  [2, 12, 17, "Venus"],
  [2, 17, 24, "Mars"],
  [2, 24, 30, "Saturn"],
  // Cancer
  [3, 0, 7, "Mars"],
  [3, 7, 13, "Venus"],
  [3, 13, 19, "Mercury"],
  [3, 19, 26, "Jupiter"],
  [3, 26, 30, "Saturn"],
  // Leo
  [4, 0, 6, "Jupiter"],
  [4, 6, 11, "Venus"],
  [4, 11, 18, "Saturn"],
  [4, 18, 24, "Mercury"],
  [4, 24, 30, "Mars"],
  // Virgo
  [5, 0, 7, "Mercury"],
  [5, 7, 17, "Venus"],
  [5, 17, 21, "Jupiter"],
  [5, 21, 28, "Mars"],
  [5, 28, 30, "Saturn"],
  // Libra
  [6, 0, 6, "Saturn"],
  [6, 6, 14, "Mercury"],
  [6, 14, 21, "Jupiter"],
  [6, 21, 28, "Venus"],
  [6, 28, 30, "Mars"],
  // Scorpio
  [7, 0, 7, "Mars"],
  [7, 7, 11, "Venus"],
  [7, 11, 19, "Mercury"],
  [7, 19, 24, "Jupiter"],
  [7, 24, 30, "Saturn"],
  // Sagittarius
  [8, 0, 12, "Jupiter"],
  [8, 12, 17, "Venus"],
  [8, 17, 21, "Mercury"],
  [8, 21, 26, "Saturn"],
  [8, 26, 30, "Mars"],
  // Capricorn
  [9, 0, 7, "Mercury"],
  [9, 7, 14, "Jupiter"],
  [9, 14, 22, "Venus"],
  [9, 22, 26, "Saturn"],
  [9, 26, 30, "Mars"],
  // Aquarius
  [10, 0, 7, "Mercury"],
  [10, 7, 13, "Venus"],
  [10, 13, 20, "Jupiter"],
  [10, 20, 25, "Mars"],
  [10, 25, 30, "Saturn"],
  // Pisces
  [11, 0, 12, "Venus"],
  [11, 12, 16, "Jupiter"],
  [11, 16, 19, "Mercury"],
  [11, 19, 28, "Mars"],
  [11, 28, 30, "Saturn"],
];

/** Chaldean order (slowest to fastest): Saturn, Jupiter, Mars, Sun, Venus,
 *  Mercury, Moon. Decans cycle through this sequence starting from each
 *  sign's own ruler. We use the simpler classical "triplicity decans":
 *  the 1st decan of any sign is ruled by the sign's natural ruler, the
 *  2nd and 3rd by the next signs of the same element in zodiacal order. */
export function decanRuler(signIndex: number, degInSign: number): PlanetName {
  const decanIdx = Math.floor(degInSign / 10); // 0, 1, or 2
  // Triplicity-decan: next-sign-of-element ruler.
  const elemSigns: number[] = [];
  const element = ZODIAC_SIGNS[signIndex].element;
  for (let i = 0; i < 12; i++) if (ZODIAC_SIGNS[i].element === element) elemSigns.push(i);
  const idx = elemSigns.indexOf(signIndex);
  const targetSignIdx = elemSigns[(idx + decanIdx) % 3];
  return SIGN_RULER[targetSignIdx];
}

const SIGN_RULER: PlanetName[] = [
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

export interface TermFaceResult {
  planet: PlanetName;
  signIndex: number;
  degInSign: number;
  termRuler: PlanetName;
  inOwnTerm: boolean;
  faceRuler: PlanetName;
  inOwnFace: boolean;
}

export function termAndFace(planet: PlanetName, longitudeArcsec: bigint): TermFaceResult {
  const total = Number(longitudeArcsec) / 3600;
  const signIndex = Math.floor(total / 30);
  const degInSign = total - signIndex * 30;
  const term = EGYPTIAN_TERMS.find(
    (t) => t[0] === signIndex && degInSign >= t[1] && degInSign < t[2],
  );
  const termRuler = term ? term[3] : "Saturn";
  const face = decanRuler(signIndex, degInSign);
  return {
    planet,
    signIndex,
    degInSign,
    termRuler,
    inOwnTerm: termRuler === planet,
    faceRuler: face,
    inOwnFace: face === planet,
  };
}
