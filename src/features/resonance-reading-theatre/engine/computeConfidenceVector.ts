import type { ConfidenceVector } from "../types/resonanceTypes";

export function buildConfidence(parts: Partial<ConfidenceVector>): ConfidenceVector {
  const ephemeris = parts.ephemeris ?? 0.85; // Meeus + Dresden corrections
  const house = parts.house ?? 0.7;
  const aspect = parts.aspect ?? 0.9;
  const residue = parts.residue ?? 1.0; // exact integer
  const shadow = parts.shadow ?? 0.8;
  const narration = parts.narration ?? 0.95;
  const weights = [0.25, 0.15, 0.2, 0.15, 0.1, 0.15];
  const vals = [ephemeris, house, aspect, residue, shadow, narration];
  const total = vals.reduce((s, v, i) => s + v * weights[i], 0);
  return { ephemeris, house, aspect, residue, shadow, narration, total };
}
