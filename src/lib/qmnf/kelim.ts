// K-Elimination primitives — signed winding number recovery.
// Used by progressions to keep a progressed chart on the same gear
// (winding number K) as the natal chart, and by the eclipse/codex
// engines to extract the carry from coprime CRT lifts.
//
// Source: gear_manifold_v3.py (CRTManifold + SafeAnchor)

import { modBig, modInverse } from "./crt";

/** Extended Euclidean → gcd and Bezout coefficients (s, t with s·a + t·b = gcd). */
export function extGcd(a: bigint, b: bigint): { gcd: bigint; s: bigint; t: bigint } {
  let [old_r, r] = [a, b];
  let [old_s, s] = [1n, 0n];
  let [old_t, t] = [0n, 1n];
  while (r !== 0n) {
    const q = old_r / r;
    [old_r, r] = [r, old_r - q * r];
    [old_s, s] = [s, old_s - q * s];
    [old_t, t] = [t, old_t - q * t];
  }
  return { gcd: old_r, s: old_s, t: old_t };
}

/**
 * K-Elimination: given a residue r_main mod m_main and an anchor residue
 * r_anchor mod m_anchor (coprime), recover the unique signed winding k
 * such that k ≡ (r_anchor - r_main) · m_main^{-1} (mod m_anchor).
 *
 * Eclipse-table example: m_main = 11960 (5-channel closure),
 * m_anchor = 93 (3-channel correction). K-Elim recovers the integer k that
 * places the 33-year epoch uniquely in [0, m_main·m_anchor).
 */
export function kEliminate(rMain: bigint, mMain: bigint, rAnchor: bigint, mAnchor: bigint): bigint {
  const inv = modInverse(modBig(mMain, mAnchor), mAnchor);
  return modBig((rAnchor - rMain) * inv, mAnchor);
}

/**
 * Linear congruence solver: a·x ≡ c (mod m) → all solutions in [0, m).
 * Returns the principal solution and the modular step; full solution set
 * is { x0 + k·step : k ∈ ℤ }. If no solution, returns null.
 */
export function solveLinearCongruence(
  a: bigint,
  c: bigint,
  m: bigint,
): { x0: bigint; step: bigint } | null {
  const { gcd, s } = extGcd(modBig(a, m), m);
  if (modBig(c, gcd) !== 0n) return null;
  const step = m / gcd;
  const x0 = modBig(s * (c / gcd), step);
  return { x0, step };
}
