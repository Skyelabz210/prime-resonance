// Smoke tests for the QMNF substrate — designed to run with `bun test`.
// These cover the discoveries that anchor the framework and a handful of
// traditional-astrology invariants.

import { test, expect } from "bun:test";
import { runAllValidations } from "../validation";
import { THEOREMS, verifyAll } from "../theorems";
import { ATLAS, classifyByFingerprint } from "../harmonic13";
import { computeFullChart, buildReadingBundle } from "../chart";
import { dignityFor } from "../dignities";
import { lunarPhase } from "../phase";
import { ayanamsaArcsec, nakshatraInfo, dashaTimeline } from "../vedic";
import { J2000_JD } from "../julian";
import { FULL_CIRCLE_ARCSEC } from "../constants";
import { antiscionArcsec, contraAntiscionArcsec } from "../antiscia";
import { termAndFace } from "../terms";
import { solarArcAgeForTarget } from "../solararc";
import { projectedStars } from "../fixedstars";

const BIRTH = {
  name: "Test",
  year: 1990,
  month: 6,
  day: 15,
  hour: 14,
  minute: 30,
  tzOffsetHours: -5,
  latitude: 40.7128,
  longitude: -74.006,
  houseSystem: "Placidus" as const,
};

test("V1–V14 all hold", () => {
  for (const v of runAllValidations()) expect(v.pass).toBe(true);
});

test("T1–T10 all verify", () => {
  for (const t of verifyAll()) expect(t.pass).toBe(true);
});

test("Biquintile fingerprint has exclusive-11 carry", () => {
  const biq = classifyByFingerprint(518_400n);
  expect(biq).not.toBeNull();
  expect(biq?.name).toBe("Biquintile");
  expect(biq?.sqrCarry).toEqual([0, 1, 0]);
});

test("Aspect atlas covers harmonics 1-13", () => {
  const harmonics = new Set(ATLAS.map((a) => a.harmonic));
  for (let h = 1; h <= 13; h++) expect(harmonics.has(h)).toBe(true);
});

test("Ayanamsa at J2000 ≈ 23.83°", () => {
  const a = ayanamsaArcsec(J2000_JD);
  // Lahiri at J2000 is 23°50.18' = 23.8338°
  const deg = Number(a) / 3600;
  expect(Math.abs(deg - 23.8338)).toBeLessThan(0.01);
});

test("Nakshatra coverage: every sidereal degree maps to one of 27", () => {
  for (let d = 0; d < 360; d += 3) {
    const n = nakshatraInfo(BigInt(d * 3600));
    expect(n.index).toBeGreaterThanOrEqual(0);
    expect(n.index).toBeLessThan(27);
    expect(n.pada).toBeGreaterThanOrEqual(1);
    expect(n.pada).toBeLessThanOrEqual(4);
  }
});

test("Vimsottari Dasha timeline totals 120 years", () => {
  const tl = dashaTimeline(0n, 120);
  // Last period.endAge may be cut short by `years` cap; the *sum of years*
  // across the full sequence should reach 120 within rounding.
  const sumYears = tl[tl.length - 1].endAge;
  expect(sumYears).toBeCloseTo(120, 0);
});

test("Full chart computes Sun in Gemini for 1990-06-15", () => {
  const c = computeFullChart(BIRTH);
  const sun = c.ephemeris.planets.find((p) => p.name === "Sun")!;
  const sign = Number(sun.longitudeArcsec / 108_000n);
  expect(sign).toBe(2); // Gemini
});

test("Reading bundle exposes traditional substrate", () => {
  const c = computeFullChart(BIRTH);
  const b = buildReadingBundle(c, true);
  expect(b.traditional.sect).toMatch(/day|night/);
  expect(b.traditional.lunarPhase.phase).toBeTruthy();
  expect(b.traditional.shape.shape).toBeTruthy();
  expect(b.traditional.dignities.length).toBeGreaterThan(0);
  expect(b.traditional.lots.length).toBeGreaterThanOrEqual(7);
});

test("Dignities: Sun in Leo is domicile +5, Saturn in Aries is fall −4", () => {
  expect(dignityFor("Sun", 4).kind).toBe("domicile");
  expect(dignityFor("Sun", 4).score).toBe(5);
  // Saturn's fall is in Aries (opposite Libra exaltation).
  expect(dignityFor("Saturn", 0).kind).toBe("fall");
  expect(dignityFor("Saturn", 0).score).toBe(-4);
});

test("Lunar phase: 0° elong = New Moon, 180° = Full", () => {
  expect(lunarPhase(0n, 0n).phase).toBe("New Moon");
  expect(lunarPhase(0n, FULL_CIRCLE_ARCSEC / 2n).phase).toBe("Full Moon");
});

test("Antiscion is an involution: A(A(λ)) = λ", () => {
  for (let d = 0; d < 360; d += 17) {
    const lam = BigInt(d * 3600);
    expect(antiscionArcsec(antiscionArcsec(lam))).toBe(lam);
    expect(contraAntiscionArcsec(contraAntiscionArcsec(lam))).toBe(lam);
  }
});

test("Antiscion of 0° Cancer (90°) = 0° Cancer (180° − 90° = 180°? no — 270 − 90 = 180°)", () => {
  // 270° − 90° = 180° (Libra 0°). Then 270° − 180° = 90° round-trips.
  const cancer0 = BigInt(90 * 3600);
  expect(antiscionArcsec(cancer0)).toBe(BigInt(180 * 3600));
});

test("Egyptian term: Mars 22° Aries → ruler Mars (own term, 20–25° band)", () => {
  const lam = BigInt(22 * 3600);
  const r = termAndFace("Mars", lam);
  expect(r.termRuler).toBe("Mars");
  expect(r.inOwnTerm).toBe(true);
});

test("Solar arc: 30 yrs ≈ 29.57° advance (Naibod 0.9856°/yr)", () => {
  const age = solarArcAgeForTarget(0n, BigInt(Math.round(29.57 * 3600)));
  expect(age).toBeCloseTo(30, 0);
});

test("Fixed stars: Regulus precesses ~50″/yr — Aug 2025 ≈ 0° Virgo", () => {
  // 25 years after J2000: 25 × 50.29″ ≈ 1257″ ≈ 0.35° shift from 29.83° Leo
  // → ~ 30.18° = 0.18° Virgo.
  const stars = projectedStars(2_460_900); // ~Aug 2025
  const regulus = stars.find((s) => s.name === "Regulus")!;
  const deg = Number(regulus.longitudeArcsec) / 3600;
  expect(deg).toBeGreaterThan(149.8);
  expect(deg).toBeLessThan(150.5);
});

test("Full chart returns fixed stars + antiscia + termFace arrays", () => {
  const c = computeFullChart(BIRTH);
  expect(Array.isArray(c.fixedStarContacts)).toBe(true);
  expect(Array.isArray(c.antisciaContacts)).toBe(true);
  expect(c.termFace.length).toBe(7);
});
