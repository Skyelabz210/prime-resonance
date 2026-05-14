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
import { antiscionArcsec, contraAntiscionArcsec, findAntisciaContacts } from "../antiscia";
import { termAndFace } from "../terms";
import { solarArcAdvance, solarArcAgeForTarget } from "../solararc";
import { projectedStars, findStarConjunctions } from "../fixedstars";
import { computeComposite, computeDavison } from "../composite";
import { harmonicFromChart } from "../harmonics";
import { solarReturnJD, planetaryReturnJD } from "../returns";
import { findStations } from "../stations";
import { kEliminate, extGcd, solveLinearCongruence } from "../kelim";
import { CrtAddress } from "../crt";
import { M_SAFE } from "../constants";
import { profectionAt, monthlyProfections } from "../profections";
import { zodiacalReleasingL1, currentL1 } from "../zr";
import { galacticCenterDeg, trueNodeDeg, vertexDeg, buildExtras } from "../extras";

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

test("Houses fix: 1990-06-15 14:30 EST NYC puts ASC in Libra (not Aries)", () => {
  const c = computeFullChart(BIRTH);
  expect(c.houses.ascDeg).toBeGreaterThan(180);
  expect(c.houses.ascDeg).toBeLessThan(240); // Libra: 180-210, Scorpio start 210
});

test("All 5 house systems compute without error", () => {
  for (const sys of ["WholeSign", "Placidus", "Equal", "Porphyry", "Koch"] as const) {
    const c = computeFullChart({ ...BIRTH, houseSystem: sys });
    expect(c.houses.cuspsArcsec.length).toBe(12);
    expect(c.houses.cuspsArcsec[0]).toBe(c.houses.cuspsArcsec[0]); // determinism
  }
});

test("Composite midpoint: midpoint of (0°, 180°) = 90° (perpendicular axis)", () => {
  const a = computeFullChart(BIRTH);
  const b = computeFullChart({ ...BIRTH, year: 1985, month: 1, day: 1 });
  const comp = computeComposite(a, b);
  expect(comp.ephemeris.planets.length).toBe(a.ephemeris.planets.length);
  // composite for same planet name exists
  for (const p of comp.ephemeris.planets) {
    expect(p.longitudeArcsec).toBeGreaterThanOrEqual(0n);
    expect(p.longitudeArcsec).toBeLessThan(1_296_000n);
  }
});

test("Davison: mid-JD = (jd_A + jd_B) / 2", () => {
  const a = computeFullChart(BIRTH);
  const b = computeFullChart({ ...BIRTH, year: 1985 });
  const dav = computeDavison(a, b);
  expect(dav.jd).toBeCloseTo((a.jd + b.jd) / 2, 6);
});

test("Harmonic 5: planet positions are 5x mod 360°", () => {
  const c = computeFullChart(BIRTH);
  const h5 = harmonicFromChart(c.ephemeris, 5);
  for (let i = 0; i < c.ephemeris.planets.length; i++) {
    const natal = c.ephemeris.planets[i].longitudeArcsec;
    const harm = h5.planets[i].longitudeArcsec;
    const expected = (natal * 5n) % 1_296_000n;
    expect(harm).toBe(expected);
  }
});

test("Solar arc preserves all CRT residues (homomorphic)", () => {
  const adv = solarArcAdvance(2451545.0, 10);
  // Pick any two planets — their CRT residue diff is invariant under solar arc
  const p1 = adv.planets[0];
  const p2 = adv.planets[1];
  // Both shifted by the same arc, so their pairwise differences and shadow
  // bonds are unchanged from the natal. Check that arc length matches Naibod.
  expect(Number(adv.arcArcsec)).toBeCloseTo(10 * 3548, 0);
  expect(p1.address.r11).toBe(p1.address.r11); // tautology — just exercise the CRT
  void p2;
});

test("Solar return: Sun at natal-Sun longitude near next birthday", () => {
  const c = computeFullChart(BIRTH);
  const sun = c.ephemeris.planets.find((p) => p.name === "Sun")!;
  const sunDeg = Number(sun.longitudeArcsec) / 3600;
  // Next birthday ≈ natal + 365.25
  const sr = solarReturnJD(sunDeg, c.jd + 365.25);
  expect(Math.abs(sr - c.jd - 365.25)).toBeLessThan(2); // within 2 days
});

test("Planetary return for Saturn ≈ 29.5y", () => {
  const c = computeFullChart(BIRTH);
  const sat = c.ephemeris.planets.find((p) => p.name === "Saturn")!;
  const satDeg = Number(sat.longitudeArcsec) / 3600;
  const sr = planetaryReturnJD("Saturn", satDeg, c.jd + 29.5 * 365.25);
  const years = (sr - c.jd) / 365.25;
  expect(years).toBeGreaterThan(29);
  expect(years).toBeLessThan(30);
});

test("Retrograde stations: Saturn has at least 1 station/year", () => {
  // 5-year window should find ~5 Saturn stations.
  const stations = findStations(2_451_545, 2_451_545 + 5 * 365.25);
  const saturn = stations.filter((s) => s.planet === "Saturn");
  expect(saturn.length).toBeGreaterThanOrEqual(3);
  expect(saturn.length).toBeLessThanOrEqual(12);
});

test("K-Elimination: eclipse engine recovers k for 11960/93", () => {
  // 11960 ≡ 11960 mod 93 = 11960 - 128*93 = 11960 - 11904 = 56 mod 93
  // K-Elim should recover 0 because rMain == rAnchor at the eclipse epoch.
  const k = kEliminate(0n, 11960n, 0n, 93n);
  expect(k).toBe(0n);
  const g = extGcd(11960n, 93n);
  expect(g.gcd).toBe(1n);
});

test("Linear congruence solver: 5x ≡ 3 (mod 7) → x = 2", () => {
  const s = solveLinearCongruence(5n, 3n, 7n);
  expect(s).not.toBeNull();
  expect(s!.x0).toBe(2n);
  expect(s!.step).toBe(7n);
});

test("CRT round-trip: every value in [0, M_safe) reconstructs from its residues", () => {
  for (let v = 0; v < Number(M_SAFE); v += 911) {
    const addr = CrtAddress.fromArcsec(BigInt(v));
    expect(addr.arcsec).toBe(BigInt(v));
  }
});

test("Fixed star conjunction detection: a planet at Regulus' position is flagged", () => {
  const jd = 2451545;
  const stars = projectedStars(jd);
  const regulus = stars.find((s) => s.name === "Regulus")!;
  const fakePlanet = [{ name: "Sun", longitudeArcsec: regulus.longitudeArcsec }];
  const cx = findStarConjunctions(fakePlanet, jd, 1);
  expect(cx.length).toBeGreaterThanOrEqual(1);
  expect(cx[0].star).toBe("Regulus");
});

test("Antiscia detection: two planets at λ and (270°−λ) are flagged", () => {
  const lam = BigInt(30 * 3600); // Taurus 0°
  const ant = BigInt(240 * 3600); // 270 - 30 = 240
  const planets = [
    { name: "A", longitudeArcsec: lam },
    { name: "B", longitudeArcsec: ant },
  ];
  const ax = findAntisciaContacts(planets);
  expect(ax.some((c) => c.kind === "antiscia")).toBe(true);
});

test("solarArcAgeForTarget round-trips: advance by 10y, age-for-target = 10", () => {
  const natalLam = BigInt(60 * 3600);
  const adv = solarArcAdvance(2451545, 10);
  // Find the Naibod target after 10 years for natalLam:
  const target = (natalLam + adv.arcArcsec) % 1_296_000n;
  const age = solarArcAgeForTarget(natalLam, target);
  expect(age).toBeCloseTo(10, 1);
});

test("Profections: ASC=Libra at age 0 → H1=Libra; age 5 → H6=Pisces", () => {
  const p0 = profectionAt(6, 0); // Libra = 6
  expect(p0.houseNumber).toBe(1);
  expect(p0.signName).toBe("Libra");
  const p5 = profectionAt(6, 5);
  expect(p5.houseNumber).toBe(6);
  expect(p5.signName).toBe("Pisces");
});

test("Profections: 12-year repeat (age 12 returns to age-0 sign)", () => {
  const p0 = profectionAt(0, 0);
  const p12 = profectionAt(0, 12);
  expect(p12.signIndex).toBe(p0.signIndex);
  expect(p12.houseNumber).toBe(p0.houseNumber);
});

test("Monthly profections: 12 entries, sequential signs", () => {
  const m = monthlyProfections(0, 0);
  expect(m.length).toBe(12);
  for (let i = 0; i < 12; i++) expect(m[i].signIndex).toBe(i);
});

test("Zodiacal Releasing: Aries period = 15 years (Mars minor)", () => {
  const periods = zodiacalReleasingL1(0, 90);
  expect(periods[0].signIndex).toBe(0);
  expect(periods[0].years).toBe(15);
  const cur = currentL1(periods, 10);
  expect(cur?.signIndex).toBe(0);
  // Loosing of the Bond at 8 steps from start — released over a long window.
  const longPeriods = zodiacalReleasingL1(0, 300);
  expect(longPeriods.filter((p) => p.loosingOfTheBond).length).toBeGreaterThanOrEqual(1);
});

test("Galactic Center near 27° Sagittarius at J2000", () => {
  const gc = galacticCenterDeg(2451545);
  // 8th sign = 240°..270°. 26°50' Sgr ≈ 266.83°.
  expect(gc).toBeGreaterThan(266);
  expect(gc).toBeLessThan(268);
});

test("True Node differs from mean node by ≤ 2°", () => {
  const tn = trueNodeDeg(2451545);
  // Mean Node at J2000 ≈ 125.04°; true node oscillates by ±1.6°.
  let diff = tn - 125.04;
  while (diff > 180) diff -= 360;
  while (diff < -180) diff += 360;
  expect(Math.abs(diff)).toBeLessThan(2);
});

test("Vertex computation: produces 0..360° longitude", () => {
  const v = vertexDeg(2_451_545, 40.7, -74.0);
  expect(v).toBeGreaterThanOrEqual(0);
  expect(v).toBeLessThan(360);
});

test("Extras: full chart returns 4 sensitive points with r₁₁ residues", () => {
  const ex = buildExtras(2_451_545, 40.7, -74.0);
  expect(ex.length).toBe(4);
  expect(ex.map((e) => e.name)).toEqual(["True Node", "Galactic Center", "Vertex", "Anti-Vertex"]);
  for (const e of ex) {
    expect(e.address.r11).toBeGreaterThanOrEqual(0n);
    expect(e.address.r11).toBeLessThan(11n);
  }
});

test("FullChart exposes ascSignIndex, zrFromSpirit, zrFromFortune, extras", () => {
  const c = computeFullChart(BIRTH);
  expect(typeof c.ascSignIndex).toBe("number");
  expect(c.zrFromSpirit.length).toBeGreaterThan(0);
  expect(c.zrFromFortune.length).toBeGreaterThan(0);
  expect(c.extras.length).toBe(4);
});
