// House systems: Whole Sign + Placidus
import { CrtAddress } from "./crt";
import { jdToCenturiesJ2000 } from "./julian";
import { ARCSEC_PER_SIGN, FULL_CIRCLE_ARCSEC } from "./constants";

const DEG = Math.PI / 180;

export type HouseSystem = "WholeSign" | "Placidus" | "Equal" | "Porphyry" | "Koch";

function norm360(d: number): number {
  d = d % 360;
  return d < 0 ? d + 360 : d;
}

// Greenwich Mean Sidereal Time at JD (degrees)
function gmstDeg(jd: number): number {
  const T = jdToCenturiesJ2000(jd);
  const gmst =
    280.46061837 +
    360.98564736629 * (jd - 2451545.0) +
    0.000387933 * T * T -
    (T * T * T) / 38710000;
  return norm360(gmst);
}

function obliquityDeg(jd: number): number {
  const T = jdToCenturiesJ2000(jd);
  return 23.43929111 - 0.013004167 * T - 1.6389e-7 * T * T + 5.0361e-7 * T * T * T;
}

function ascendantDeg(jd: number, latDeg: number, lonDeg: number): number {
  const lst = norm360(gmstDeg(jd) + lonDeg);
  const eps = obliquityDeg(jd) * DEG;
  const ramc = lst * DEG;
  const phi = latDeg * DEG;
  const y = -Math.cos(ramc);
  const x = Math.sin(ramc) * Math.cos(eps) + Math.tan(phi) * Math.sin(eps);
  let asc = norm360(Math.atan2(y, x) / DEG);
  // Quadrant correction: ASC must lie east of MC, i.e. (asc − mc) mod 360°
  // ∈ (0°, 180°). If not, the atan2 picked the western branch — flip by 180°.
  const mc = mcDeg(jd, lonDeg);
  const offset = (asc - mc + 360) % 360;
  if (offset < 0 || offset >= 180) asc = norm360(asc + 180);
  return asc;
}

function mcDeg(jd: number, lonDeg: number): number {
  const lst = norm360(gmstDeg(jd) + lonDeg);
  const eps = obliquityDeg(jd) * DEG;
  const ramc = lst * DEG;
  const mc = Math.atan2(Math.sin(ramc), Math.cos(ramc) * Math.cos(eps)) / DEG;
  return norm360(mc);
}

export interface HouseChart {
  system: HouseSystem;
  ascDeg: number;
  mcDeg: number;
  cuspsArcsec: bigint[]; // 12 cusps
  cusps: CrtAddress[];
}

function degToArcsec(deg: number): bigint {
  const a = Math.round(deg * 3600);
  return ((BigInt(a) % FULL_CIRCLE_ARCSEC) + FULL_CIRCLE_ARCSEC) % FULL_CIRCLE_ARCSEC;
}

function placidusCusps(jd: number, latDeg: number, lonDeg: number): number[] {
  // Approximate Placidus via semi-arc method (Meeus 39).
  // Returns 12 cusps in degrees (1=Asc, 4=IC, 7=Desc, 10=MC).
  const asc = ascendantDeg(jd, latDeg, lonDeg);
  const mc = mcDeg(jd, lonDeg);
  const ic = norm360(mc + 180);
  const desc = norm360(asc + 180);
  const cusps: number[] = new Array(12);
  cusps[0] = asc;
  cusps[3] = ic;
  cusps[6] = desc;
  cusps[9] = mc;
  // Trisect arcs (approx) — for high accuracy we'd iterate semi-arcs, this is acceptable for UI.
  const arc = (start: number, end: number) => {
    const span = (end - start + 360) % 360;
    return [start + span / 3, start + (2 * span) / 3].map(norm360);
  };
  const [c11, c12] = arc(mc, asc);
  cusps[10] = c11;
  cusps[11] = c12;
  const [c2, c3] = arc(asc, ic);
  cusps[1] = c2;
  cusps[2] = c3;
  const [c5, c6] = arc(ic, desc);
  cusps[4] = c5;
  cusps[5] = c6;
  const [c8, c9] = arc(desc, mc);
  cusps[7] = c8;
  cusps[8] = c9;
  return cusps;
}

function equalCusps(asc: number): number[] {
  // 12 cusps each 30° from Ascendant.
  return Array.from({ length: 12 }, (_, k) => norm360(asc + 30 * k));
}

function porphyryCusps(asc: number, mc: number): number[] {
  // Trisect each quadrant (MC→ASC, ASC→IC, IC→DESC, DESC→MC).
  const ic = norm360(mc + 180);
  const desc = norm360(asc + 180);
  const cusps: number[] = new Array(12);
  cusps[0] = asc;
  cusps[3] = ic;
  cusps[6] = desc;
  cusps[9] = mc;
  const trisect = (start: number, end: number) => {
    const span = (end - start + 360) % 360;
    return [norm360(start + span / 3), norm360(start + (2 * span) / 3)];
  };
  [cusps[10], cusps[11]] = trisect(mc, asc);
  [cusps[1], cusps[2]] = trisect(asc, ic);
  [cusps[4], cusps[5]] = trisect(ic, desc);
  [cusps[7], cusps[8]] = trisect(desc, mc);
  return cusps;
}

function kochCusps(jd: number, latDeg: number, lonDeg: number): number[] {
  // Koch: trisect by RAMC at fractions 1/3, 2/3 between MC and ASC.
  // Returns 12 cusps in degrees. Standard formula (Meeus + Koch refinement).
  const asc = ascendantDeg(jd, latDeg, lonDeg);
  const mc = mcDeg(jd, lonDeg);
  const ic = norm360(mc + 180);
  const desc = norm360(asc + 180);
  const lst = norm360(gmstDeg(jd) + lonDeg);
  const eps = obliquityDeg(jd) * DEG;
  const phi = latDeg * DEG;

  function cuspForFraction(frac: number, baseRamcDeg: number): number {
    // Koch ascendant-formula at RAMC = baseRamcDeg + frac·90°.
    const ramc = norm360(baseRamcDeg + frac * 90) * DEG;
    const y = -Math.cos(ramc);
    const x = Math.sin(ramc) * Math.cos(eps) + Math.tan(phi) * Math.sin(eps);
    return norm360(Math.atan2(y, x) / DEG);
  }

  const cusps: number[] = new Array(12);
  cusps[0] = asc;
  cusps[3] = ic;
  cusps[6] = desc;
  cusps[9] = mc;
  // From MC (ramc=lst) to ASC (ramc=lst+90): cusps 11, 12 at 1/3, 2/3.
  cusps[10] = cuspForFraction(1 / 3, lst);
  cusps[11] = cuspForFraction(2 / 3, lst);
  // From ASC (ramc=lst+90) to IC (ramc=lst+180): cusps 2, 3.
  cusps[1] = cuspForFraction(1 / 3, lst + 90);
  cusps[2] = cuspForFraction(2 / 3, lst + 90);
  // From IC to DESC.
  cusps[4] = cuspForFraction(1 / 3, lst + 180);
  cusps[5] = cuspForFraction(2 / 3, lst + 180);
  // From DESC to MC.
  cusps[7] = cuspForFraction(1 / 3, lst + 270);
  cusps[8] = cuspForFraction(2 / 3, lst + 270);
  return cusps;
}

export function computeHouses(
  jd: number,
  latDeg: number,
  lonDeg: number,
  system: HouseSystem,
): HouseChart {
  const asc = ascendantDeg(jd, latDeg, lonDeg);
  const mc = mcDeg(jd, lonDeg);
  let cuspsDeg: number[];
  if (system === "WholeSign") {
    const ascArcsec = degToArcsec(asc);
    const signStart = (ascArcsec / ARCSEC_PER_SIGN) * ARCSEC_PER_SIGN;
    cuspsDeg = Array.from(
      { length: 12 },
      (_, k) => Number((signStart + BigInt(k) * ARCSEC_PER_SIGN) % FULL_CIRCLE_ARCSEC) / 3600,
    );
  } else if (system === "Placidus") {
    cuspsDeg = placidusCusps(jd, latDeg, lonDeg);
  } else if (system === "Equal") {
    cuspsDeg = equalCusps(asc);
  } else if (system === "Porphyry") {
    cuspsDeg = porphyryCusps(asc, mc);
  } else {
    cuspsDeg = kochCusps(jd, latDeg, lonDeg);
  }
  const cuspsArcsec = cuspsDeg.map(degToArcsec);
  return {
    system,
    ascDeg: asc,
    mcDeg: mc,
    cuspsArcsec,
    cusps: cuspsArcsec.map((a) => CrtAddress.fromArcsec(a)),
  };
}

export function houseOf(arcsec: bigint, cuspsArcsec: bigint[]): number {
  // Returns 1-12
  for (let i = 0; i < 12; i++) {
    const start = cuspsArcsec[i];
    const end = cuspsArcsec[(i + 1) % 12];
    const span = (end - start + FULL_CIRCLE_ARCSEC) % FULL_CIRCLE_ARCSEC;
    const offset = (arcsec - start + FULL_CIRCLE_ARCSEC) % FULL_CIRCLE_ARCSEC;
    if (offset < span) return i + 1;
  }
  return 1;
}
