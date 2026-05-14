// 13-tone harmonic aspect atlas with CRT fingerprints + DKAM orb theory.
//
// Each aspect is identified not by angular proximity alone, but by its
// residue tuple mod the Full Basis (2,3,5,7,11,13). The discriminating
// primes D = {7,11,13} carry the distinguishing signature. The squaring
// carry (sqr_carry) is the canonical detector: only the Biquintile (144°)
// produces carry (0,1,0) — the unique signature of a lane-11 shadow event.
//
// Source: cram_planetary_schema.py — adapted to the FULL_CIRCLE_ARCSEC
// convention (1_296_000) and the existing ASPECT_CATALOG type.

import { FULL_CIRCLE_ARCSEC, SAFE_BASIS, DISCRIMINATING } from "./constants";

export const FULL_BASIS = [2n, 3n, 5n, 7n, 11n, 13n] as const;
export const DISC = DISCRIMINATING; // [7n, 11n, 13n]

export type HarmonicClass = "cardinal" | "soft" | "hard" | "generative" | "minor" | "shadow";

function classify(h: number): HarmonicClass {
  if (h === 1 || h === 2) return "cardinal"; // conj, opp
  if (h === 3 || h === 6) return "soft"; // trine, sextile
  if (h === 4 || h === 8) return "hard"; // square, semisquare
  if (h === 5 || h === 10) return "generative"; // quintile, biquintile
  if (h === 11) return "shadow"; // undecile family
  return "minor";
}

export interface AspectEntry {
  harmonic: number;
  name: string;
  symbol: string;
  angleArcsec: bigint;
  maxOrbArcsec: bigint;
  crt: [bigint, bigint, bigint, bigint, bigint, bigint]; // residues mod FULL_BASIS
  disc: [bigint, bigint, bigint]; // mod (7,11,13)
  /** Squaring carry: 1 if 2·(r²%p) ≥ p, else 0. Biquintile = (0,1,0). */
  sqrCarry: [0 | 1, 0 | 1, 0 | 1];
  mirrorDisc: [bigint, bigint, bigint];
  harmonicClass: HarmonicClass;
}

// Raw atlas: harmonic → (angle arcsec, name, symbol, default orb degrees)
// 1,296,000 = 360° × 3,600
const RAW: ReadonlyArray<readonly [number, bigint, string, string, number]> = [
  [1, 0n, "Conjunction", "☌", 10],
  [2, 648_000n, "Opposition", "☍", 10],
  [3, 432_000n, "Trine", "△", 8],
  [4, 324_000n, "Square", "□", 8],
  [5, 259_200n, "Quintile", "Q", 2],
  [6, 216_000n, "Sextile", "⚹", 6],
  [7, 185_142n, "Septile", "S", 1.5], // 360/7° ≈ 51.428°
  [8, 162_000n, "Semisquare", "∠", 3],
  [9, 144_000n, "Nonile", "N", 2],
  [10, 518_400n, "Biquintile", "bQ", 2],
  [11, 117_818n, "Undecile", "U", 1.2], // 360/11° ≈ 32.727°
  [12, 108_000n, "Semisextile", "⚺", 3],
  [13, 99_692n, "Tredecile", "T", 1.0], // 360/13° ≈ 27.692°
];

function buildEntry(
  harmonic: number,
  angleArcsec: bigint,
  name: string,
  symbol: string,
  orbDeg: number,
): AspectEntry {
  const angle = ((angleArcsec % FULL_CIRCLE_ARCSEC) + FULL_CIRCLE_ARCSEC) % FULL_CIRCLE_ARCSEC;
  const crt = FULL_BASIS.map((p) => angle % p) as AspectEntry["crt"];
  const disc = [angle % 7n, angle % 11n, angle % 13n] as AspectEntry["disc"];
  const mirror = (FULL_CIRCLE_ARCSEC - angle) % FULL_CIRCLE_ARCSEC;
  const mirrorDisc = [mirror % 7n, mirror % 11n, mirror % 13n] as AspectEntry["mirrorDisc"];
  const sqr = crt.map((r, i) => (r * r) % FULL_BASIS[i]);
  const sqrCarry = sqr.slice(3, 6).map((s, i) => {
    const p = FULL_BASIS[i + 3];
    return (2n * s >= p ? 1 : 0) as 0 | 1;
  }) as AspectEntry["sqrCarry"];
  return {
    harmonic,
    name,
    symbol,
    angleArcsec: angle,
    maxOrbArcsec: BigInt(Math.round(orbDeg * 3600)),
    crt,
    disc,
    sqrCarry,
    mirrorDisc,
    harmonicClass: classify(harmonic),
  };
}

export const ATLAS: ReadonlyArray<AspectEntry> = RAW.map(([h, a, n, s, o]) =>
  buildEntry(h, a, n, s, o),
);

/** Lookup by name (case-insensitive). */
export function findAspect(name: string): AspectEntry | undefined {
  return ATLAS.find((a) => a.name.toLowerCase() === name.toLowerCase());
}

// ─── DKAM orb theory ──────────────────────────────────────────────────────
// DKAM (Degree-Keyed Aspect Margin): orb scales with planet luminance
// classes and the harmonic order. Faster/brighter bodies (Sun, Moon,
// luminaries) get wider orbs; slower bodies get tighter ones. The harmonic
// applies a monotone shrink: each step beyond 4 trims a fixed fraction.

const LUMINANCE: Record<string, number> = {
  Sun: 1.0,
  Moon: 1.0,
  Mercury: 0.7,
  Venus: 0.7,
  Mars: 0.7,
  Jupiter: 0.85,
  Saturn: 0.85,
  Uranus: 0.55,
  Neptune: 0.55,
  Pluto: 0.55,
  NorthNode: 0.5,
  Chiron: 0.5,
};

function lum(p: string): number {
  return LUMINANCE[p] ?? 0.5;
}

/** DKAM orb in arcseconds for a (planetA, planetB, harmonic) triple. */
export function dkamOrb(planetA: string, planetB: string, harmonic: number): bigint {
  const entry = ATLAS.find((a) => a.harmonic === harmonic);
  const base = entry ? entry.maxOrbArcsec : 3600n; // default 1°
  // Luminance factor: average of the two bodies' luminance.
  const lf = (lum(planetA) + lum(planetB)) / 2;
  // Harmonic shrink: harmonics 7..13 trimmed 10% per step beyond 6.
  const shrink = harmonic <= 6 ? 1.0 : Math.max(0.5, 1.0 - 0.1 * (harmonic - 6));
  return BigInt(Math.round(Number(base) * lf * shrink));
}

// ─── Classification by fingerprint ────────────────────────────────────────

/**
 * Classify a separation by its discriminating-prime carry signature.
 * Returns the matching aspect or null. Returns the canonical (forward)
 * match before checking the mirror.
 */
export function classifyByFingerprint(separationArcsec: bigint): AspectEntry | null {
  const sep = ((separationArcsec % FULL_CIRCLE_ARCSEC) + FULL_CIRCLE_ARCSEC) % FULL_CIRCLE_ARCSEC;
  const disc: [bigint, bigint, bigint] = [sep % 7n, sep % 11n, sep % 13n];
  for (const e of ATLAS) {
    if (e.disc[0] === disc[0] && e.disc[1] === disc[1] && e.disc[2] === disc[2]) return e;
  }
  for (const e of ATLAS) {
    if (e.mirrorDisc[0] === disc[0] && e.mirrorDisc[1] === disc[1] && e.mirrorDisc[2] === disc[2])
      return e;
  }
  return null;
}

/** Is this aspect a Biquintile (the unique exclusive-lane-11 shadow trigger)? */
export function isBiquintile(entry: AspectEntry | null | undefined): boolean {
  if (!entry) return false;
  return (
    entry.harmonic === 10 &&
    entry.sqrCarry[0] === 0 &&
    entry.sqrCarry[1] === 1 &&
    entry.sqrCarry[2] === 0
  );
}

export { SAFE_BASIS };
