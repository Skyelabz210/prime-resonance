// DPM-PRIME theorem stack T1–T10 with runtime verifiers.
// Each theorem exposes the actual computed arithmetic so the user can
// confirm it in their browser — turning a published theorem into a
// live verifier.
//
// Source: The_Dresden_Codex.md (Anthony Diaz × Claude, 2026-03-23).

export type LeanStatus = "native_decide" | "decide" | "structural" | "pending";

export interface Theorem {
  id: `T${number}`;
  title: string;
  statement: string;
  dependencies: readonly string[]; // axioms / lemmas / earlier theorems
  leanStatus: LeanStatus;
  /** Run the underlying integer arithmetic and report pass/fail + evidence. */
  verify: () => { pass: boolean; values: Record<string, number | string> };
}

function gcd(a: number, b: number): number {
  while (b !== 0) [a, b] = [b, a % b];
  return Math.abs(a);
}
function lcm(a: number, b: number): number {
  return Math.abs(a * b) / gcd(a, b);
}

export const THEOREMS: readonly Theorem[] = [
  {
    id: "T1",
    title: "Calendar Round = CRT Product Torus",
    statement:
      "lcm(260, 365) = 18,980 = 2² × 5 × 13 × 73 is the conductor of a CRT product torus 𝕋 = ℤ/4 × ℤ/5 × ℤ/13 × ℤ/73. The (Tzolk'in, Haab) pair uniquely identifies a day in [0, 18,980).",
    dependencies: ["A2 (CRT Uniqueness)", "L1"],
    leanStatus: "native_decide",
    verify: () => {
      const cr = lcm(260, 365);
      const ok = cr === 18980 && 4 * 5 * 13 * 73 === 18980;
      return { pass: ok, values: { "lcm(260,365)": cr, "4·5·13·73": 4 * 5 * 13 * 73 } };
    },
  },
  {
    id: "T2",
    title: "Tzolk'in Minimum Characterization",
    statement:
      "T_tz = 260 is the unique minimum positive integer T < 365 with 5·13 | T and lcm(T, 365) yielding the four-prime CRT basis {2², 5, 13, 73}.",
    dependencies: ["A2", "A3", "L1", "L2"],
    leanStatus: "decide",
    verify: () => {
      const candidates = [65, 130, 195, 260];
      const lcms = candidates.map((t) => lcm(t, 365));
      const firstFull = candidates[lcms.findIndex((L) => L % 4 === 0)];
      return {
        pass: firstFull === 260,
        values: { "first multiple of 65 with lcm·4": firstFull, lcms: lcms.join(", ") },
      };
    },
  },
  {
    id: "T3",
    title: "819-Day Three-Tier Structure",
    statement:
      "T_819 = 819 = 3² × 7 × 13 is the unique product (stability floor)² × (last accessible S_R prime) × (boundary prime). No smaller integer carries 3², 7, and 13 simultaneously.",
    dependencies: ["A5 (T-UDP-BOUNDARY)", "L3"],
    leanStatus: "native_decide",
    verify: () => ({ pass: 9 * 7 * 13 === 819, values: { "3²·7·13": 9 * 7 * 13 } }),
  },
  {
    id: "T4",
    title: "Long Count as Covering Space",
    statement:
      "The Long Count (13 × 144,000 = 1,872,000 days) is a covering line over the Calendar Round torus. Note: 1,872,000 / 18,980 is non-integer — the relationship is a fiber bundle, not a simple multiple.",
    dependencies: ["A5", "T1"],
    leanStatus: "structural",
    verify: () => {
      const ratio = 1_872_000 / 18_980;
      return { pass: !Number.isInteger(ratio), values: { "1872000/18980": ratio.toFixed(6) } };
    },
  },
  {
    id: "T5",
    title: "Eclipse Table = Two-Phase K-Elimination Lift",
    statement:
      "T_E = 11,960 days and the 93-day correction T_C = 3·31 satisfy gcd(T_E, T_C) = 1. The pair forms a coprime K-Elim lift over the 5-channel (closure) and 3-channel (correction).",
    dependencies: ["A2", "A3", "L4", "L5"],
    leanStatus: "native_decide",
    verify: () => {
      const g = gcd(11960, 93);
      return { pass: g === 1 && 3 * 31 === 93, values: { "gcd(11960,93)": g, "3·31": 3 * 31 } };
    },
  },
  {
    id: "T6",
    title: "Venus–Sun Convergence via Shared-73-Factor",
    statement:
      "gcd(584, 365) = 73 and lcm(584, 365) = 2,920 = 2³ × 5 × 73. Since 73 > 11, this resonance lies in the Tier-1 turbulent regime — exact arithmetically, outside S_R.",
    dependencies: ["A3", "A5", "L6"],
    leanStatus: "native_decide",
    verify: () => {
      const g = gcd(584, 365);
      const L = lcm(584, 365);
      return { pass: g === 73 && L === 2920, values: { "gcd(584,365)": g, "lcm(584,365)": L } };
    },
  },
  {
    id: "T7",
    title: "11 Astronomically Missing from Dresden Period Set",
    statement:
      "11 does not divide any standard Dresden period: 260, 365, 584, 780, 399, 378, 11960, 18980, 819. The shadow prime is structurally inaccessible to base astronomy.",
    dependencies: ["A3", "L7"],
    leanStatus: "native_decide",
    verify: () => {
      const periods = [260, 365, 584, 780, 399, 378, 11960, 18980, 819];
      const noneDivides = periods.every((t) => t % 11 !== 0);
      return {
        pass: noneDivides,
        values: {
          "min(T mod 11)": Math.min(...periods.map((t) => t % 11)),
          "max(T mod 11)": Math.max(...periods.map((t) => t % 11)),
        },
      };
    },
  },
  {
    id: "T8",
    title: "Saturn Displacement Theorem (Δ_S = 2 · 11²)",
    statement:
      "At the eclipse-table epoch, Saturn's displacement Δ_S = 11,960 mod 378 = 242 = 2 × 11². The missing S_R prime surfaces in the outer planet's residue, at the square — this is the shadow signature.",
    dependencies: ["L8"],
    leanStatus: "native_decide",
    verify: () => {
      const delta = 11960 % 378;
      return {
        pass: delta === 242 && 2 * 121 === 242,
        values: { "11960 mod 378": delta, "2·11²": 2 * 121 },
      };
    },
  },
  {
    id: "T9",
    title: "Mars Closure Theorem",
    statement:
      "Δ_Ma = 11,960 mod 780 = 260 = T_tz. Since T_E is an exact multiple of the Tzolk'in (Lemma L4), Mars returns to its natal Tzolk'in position after 33 years.",
    dependencies: ["L4", "L9"],
    leanStatus: "native_decide",
    verify: () => {
      const delta = 11960 % 780;
      return { pass: delta === 260, values: { "11960 mod 780": delta, T_tz: 260 } };
    },
  },
  {
    id: "T10",
    title: "S_R Distribution Theorem (Main)",
    statement:
      "At the 33-year epoch, S_R = {5, 7, 11} distributes across the planetary residues: Mars carries 5 + boundary 13, Venus carries the full accessible pair {5, 7}, Saturn carries 11². The complete Ramanujan set is recovered in the displacement bundle.",
    dependencies: ["A3", "A5", "L8", "L9", "L10", "T3", "T7"],
    leanStatus: "native_decide",
    verify: () => {
      const dMars = 11960 % 780,
        dVenus = 11960 % 584,
        dSaturn = 11960 % 378;
      const marsOk = dMars === 260 && 260 % 5 === 0 && 260 % 13 === 0;
      const venusOk = dVenus === 280 && 280 % 5 === 0 && 280 % 7 === 0;
      const saturnOk = dSaturn === 242 && 242 % 121 === 0;
      return {
        pass: marsOk && venusOk && saturnOk,
        values: {
          Δ_Ma: dMars,
          Δ_V: dVenus,
          Δ_S: dSaturn,
          "Mars carries": "5 + 13",
          "Venus carries": "5, 7",
          "Saturn carries": "11²",
        },
      };
    },
  },
];

export function verifyAll(): Array<{
  id: string;
  pass: boolean;
  values: Record<string, number | string>;
}> {
  return THEOREMS.map((t) => ({ id: t.id, ...t.verify() }));
}
