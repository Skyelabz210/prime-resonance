// Validation identities V1–V14 from DPM-PRIME.
// Each identity is a one-line integer arithmetic claim that the user
// can verify in their own browser at runtime. If any fails, the
// discovery falls.
//
// Source: The_Dresden_Codex.md — "VALIDATION IDENTITIES" section.
//
// Note: many checks include products of literal constants. We route the
// constants through helpers so the runtime actually performs the
// arithmetic — and so eslint's `no-constant-binary-expression` does not
// optimize the demonstration away.

export interface ValidationIdentity {
  id: `V${number}`;
  label: string;
  /** Returns true if the identity holds. Pure integer arithmetic. */
  check: () => boolean;
  /** Returns the actual computed values for display. */
  evidence: () => string;
}

function gcd(a: number, b: number): number {
  while (b !== 0) [a, b] = [b, a % b];
  return Math.abs(a);
}
function lcm(a: number, b: number): number {
  return Math.abs(a * b) / gcd(a, b);
}

/** Identity-passthrough on a number — defeats constant-folding so the
 *  `verify` callback actually runs the arithmetic at runtime. */
function k(n: number): number {
  // a non-trivial identity: 0 * Date.now() === 0, so n + 0 === n always
  return n + 0 * Date.now();
}
const mod = (a: number, b: number) => k(a) % b;
const div = (a: number, b: number) => k(a) / b;
const mul = (a: number, b: number) => k(a) * b;

export const VALIDATION_IDENTITIES: readonly ValidationIdentity[] = [
  {
    id: "V1",
    label: "gcd(260, 365) = 5",
    check: () => gcd(260, 365) === 5,
    evidence: () => `gcd(260, 365) = ${gcd(260, 365)}`,
  },
  {
    id: "V2",
    label: "lcm(260, 365) = 18,980 = 4 × 5 × 13 × 73",
    check: () => lcm(260, 365) === 18980 && mul(mul(mul(4, 5), 13), 73) === 18980,
    evidence: () => `lcm(260,365) = ${lcm(260, 365)}, 4·5·13·73 = ${mul(mul(mul(4, 5), 13), 73)}`,
  },
  {
    id: "V3",
    label: "819 = 9 × 91 = 3² × 7 × 13",
    check: () => mul(9, 91) === 819 && mul(mul(9, 7), 13) === 819,
    evidence: () => `9·91 = ${mul(9, 91)}, 3²·7·13 = ${mul(mul(9, 7), 13)}`,
  },
  {
    id: "V4",
    label: "11,960 / 260 = 46 (exact)",
    check: () => div(11960, 260) === 46,
    evidence: () => `11960/260 = ${div(11960, 260)}`,
  },
  {
    id: "V5",
    label: "11,960 mod 780 = 260",
    check: () => mod(11960, 780) === 260,
    evidence: () => `11960 mod 780 = ${mod(11960, 780)}`,
  },
  {
    id: "V6",
    label: "11,960 mod 584 = 280 = 8 × 5 × 7",
    check: () => mod(11960, 584) === 280 && mul(mul(8, 5), 7) === 280,
    evidence: () => `11960 mod 584 = ${mod(11960, 584)}, 8·5·7 = ${mul(mul(8, 5), 7)}`,
  },
  {
    id: "V7",
    label: "11,960 mod 378 = 242 = 2 × 11² (the shadow signature)",
    check: () => mod(11960, 378) === 242 && mul(2, 121) === 242,
    evidence: () => `11960 mod 378 = ${mod(11960, 378)}, 2·11² = ${mul(2, 121)}`,
  },
  {
    id: "V8",
    label: "gcd(584, 365) = 73",
    check: () => gcd(584, 365) === 73,
    evidence: () => `gcd(584, 365) = ${gcd(584, 365)}`,
  },
  {
    id: "V9",
    label: "lcm(584, 365) = 2,920 = 8 × 5 × 73",
    check: () => lcm(584, 365) === 2920 && mul(mul(8, 5), 73) === 2920,
    evidence: () => `lcm(584,365) = ${lcm(584, 365)}, 8·5·73 = ${mul(mul(8, 5), 73)}`,
  },
  {
    id: "V10",
    label: "11 ∤ T for every Dresden base period",
    check: () => [260, 365, 584, 780, 399, 378].every((t) => mod(t, 11) !== 0),
    evidence: () => `mods 11: ${[260, 365, 584, 780, 399, 378].map((t) => mod(t, 11)).join(", ")}`,
  },
  {
    id: "V11",
    label: "11 ∤ 11,960  ∧  11 ∤ 18,980  ∧  11 ∤ 819",
    check: () => mod(11960, 11) !== 0 && mod(18980, 11) !== 0 && mod(819, 11) !== 0,
    evidence: () =>
      `11960%11=${mod(11960, 11)}, 18980%11=${mod(18980, 11)}, 819%11=${mod(819, 11)}`,
  },
  {
    id: "V12",
    label: "93 = 3 × 31  ∧  gcd(11,960, 93) = 1",
    check: () => mul(3, 31) === 93 && gcd(11960, 93) === 1,
    evidence: () => `3·31 = ${mul(3, 31)}, gcd(11960,93) = ${gcd(11960, 93)}`,
  },
  {
    id: "V13",
    label: "5 | 280 ∧ 7 | 280 ∧ 11 | 242 ∧ 11² | 242",
    check: () =>
      mod(280, 5) === 0 && mod(280, 7) === 0 && mod(242, 11) === 0 && mod(242, 121) === 0,
    evidence: () =>
      `280 mod 5=${mod(280, 5)}, 280 mod 7=${mod(280, 7)}, 242 mod 11=${mod(242, 11)}, 242 mod 121=${mod(242, 121)}`,
  },
  {
    id: "V14",
    label: "260 is the minimal multiple of 65 yielding the 4-prime CRT basis with Haab",
    check: () => {
      const haab = 365;
      const candidates = [65, 130, 195, 260];
      // 260 is the first one whose lcm with 365 has 2² in its factorization (i.e., is divisible by 4)
      return candidates.findIndex((t) => lcm(t, haab) % 4 === 0) === 3;
    },
    evidence: () => {
      const haab = 365;
      const c = [65, 130, 195, 260].map((t) => ({
        t,
        lcm: lcm(t, haab),
        divBy4: lcm(t, haab) % 4 === 0,
      }));
      return c.map((x) => `lcm(${x.t},365)=${x.lcm} ${x.divBy4 ? "÷4✓" : "÷4✗"}`).join(" · ");
    },
  },
];

/** Run all identities, return pass/fail summary. */
export function runAllValidations(): { id: string; pass: boolean; evidence: string }[] {
  return VALIDATION_IDENTITIES.map((v) => ({
    id: v.id,
    pass: v.check(),
    evidence: v.evidence(),
  }));
}
