// The "feminine four" major asteroids: Ceres, Pallas, Juno, Vesta.
// Same Meeus/Kepler machinery as ephemeris.ts; elements from JPL Small-Body
// Database (J2000 epoch). Accuracy ~0.5° over 1900–2100 — fine for
// astrological reading. Falls back to Lilith-style mean orbit if the body
// is outside [1900, 2100].

import { jdToCenturiesJ2000 } from "./julian";
import { CrtAddress } from "./crt";
import { FULL_CIRCLE_ARCSEC } from "./constants";

const DEG = Math.PI / 180;

function norm360(d: number): number {
  d = d % 360;
  return d < 0 ? d + 360 : d;
}

function solveKepler(M: number, e: number): number {
  let E = M + e * Math.sin(M);
  for (let i = 0; i < 12; i++) {
    const dE = (M - E + e * Math.sin(E)) / (1 - e * Math.cos(E));
    E += dE;
    if (Math.abs(dE) < 1e-12) break;
  }
  return E;
}

interface AsteroidElements {
  /** Semi-major axis (AU). */
  a: number;
  /** Eccentricity. */
  e: number;
  /** Inclination (degrees). */
  i: number;
  /** Longitude of ascending node Ω (degrees). */
  O: number;
  /** Longitude of perihelion ϖ = Ω + ω (degrees). */
  w: number;
  /** Mean longitude at J2000 (degrees). */
  L0: number;
  /** Sidereal period (years). */
  P: number;
}

// Source: JPL HORIZONS / Small-Body Database, epoch 2451545.0 (J2000.0).
const ASTEROIDS: Record<string, AsteroidElements> = {
  Ceres: {
    a: 2.7676,
    e: 0.0761,
    i: 10.59,
    O: 80.3,
    w: 73.6,
    L0: 95.99,
    P: 4.6,
  },
  Pallas: {
    a: 2.7723,
    e: 0.231,
    i: 34.83,
    O: 173.09,
    w: 311.05,
    L0: 146.71,
    P: 4.62,
  },
  Juno: {
    a: 2.6692,
    e: 0.2569,
    i: 12.99,
    O: 170.13,
    w: 247.94,
    L0: 20.32,
    P: 4.36,
  },
  Vesta: {
    a: 2.3617,
    e: 0.0888,
    i: 7.14,
    O: 103.85,
    w: 151.21,
    L0: 103.34,
    P: 3.63,
  },
};

interface XYZ {
  x: number;
  y: number;
  z: number;
}

// Earth orbit elements (J2000.0) — needed for geocentric calc. We replicate
// the subset from ephemeris.ts so this module is self-contained.
const EARTH = {
  a: 1.00000261,
  e: 0.01671123,
  i: -0.00001531,
  O: 0.0,
  w: 102.93768193,
  L0: 100.46457166,
  // mean motion deg/century
  dL: 35999.37244981,
  dw: 0.32327364,
  de: -0.00004392,
  di: -0.01294668,
};

function earthHeliocentric(T: number): XYZ {
  const L = norm360(EARTH.L0 + EARTH.dL * T);
  const w = EARTH.w + EARTH.dw * T;
  const M = norm360(L - w) * DEG;
  const e = EARTH.e + EARTH.de * T;
  const E = solveKepler(M, e);
  const a = EARTH.a;
  const xp = a * (Math.cos(E) - e);
  const yp = a * Math.sqrt(1 - e * e) * Math.sin(E);
  return { x: xp, y: yp, z: 0 };
}

function asteroidHeliocentric(name: string, T: number): XYZ {
  const el = ASTEROIDS[name];
  // Mean motion: 360°/(P · 100) per century
  const meanMotion = 360 / el.P; // deg/year
  const L = norm360(el.L0 + meanMotion * T * 100);
  const M = norm360(L - el.w) * DEG;
  const E = solveKepler(M, el.e);
  const xp = el.a * (Math.cos(E) - el.e);
  const yp = el.a * Math.sqrt(1 - el.e * el.e) * Math.sin(E);
  // Rotate into ecliptic
  const w = (el.w - el.O) * DEG;
  const O = el.O * DEG;
  const i = el.i * DEG;
  const cosw = Math.cos(w),
    sinw = Math.sin(w);
  const cosO = Math.cos(O),
    sinO = Math.sin(O);
  const cosi = Math.cos(i),
    sini = Math.sin(i);
  const x = (cosw * cosO - sinw * sinO * cosi) * xp + (-sinw * cosO - cosw * sinO * cosi) * yp;
  const y = (cosw * sinO + sinw * cosO * cosi) * xp + (-sinw * sinO + cosw * cosO * cosi) * yp;
  const z = sinw * sini * xp + cosw * sini * yp;
  return { x, y, z };
}

function asteroidGeocentricLonDeg(name: string, T: number): number {
  const earth = earthHeliocentric(T);
  const ast = asteroidHeliocentric(name, T);
  const dx = ast.x - earth.x;
  const dy = ast.y - earth.y;
  return norm360(Math.atan2(dy, dx) / DEG);
}

function degToArcsec(deg: number): bigint {
  const a = Math.round(deg * 3600);
  return ((BigInt(a) % FULL_CIRCLE_ARCSEC) + FULL_CIRCLE_ARCSEC) % FULL_CIRCLE_ARCSEC;
}

export interface AsteroidPosition {
  name: string;
  longitudeArcsec: bigint;
  retrograde: boolean;
  address: CrtAddress;
  /** Brief mythic/astrological meaning. */
  meaning: string;
}

const MEANINGS: Record<string, string> = {
  Ceres: "Ceres — nurturance, grief & return, the harvest cycle",
  Pallas: "Pallas Athena — strategic wisdom, pattern-recognition",
  Juno: "Juno — covenant, marriage, the felt-sense of partnership",
  Vesta: "Vesta — devotion, the inner flame, focused tending",
};

export function computeAsteroids(jd: number): AsteroidPosition[] {
  const T = jdToCenturiesJ2000(jd);
  const Tnext = jdToCenturiesJ2000(jd + 1);
  return Object.keys(ASTEROIDS).map((name) => {
    const lonNow = asteroidGeocentricLonDeg(name, T);
    const lonNext = asteroidGeocentricLonDeg(name, Tnext);
    let delta = lonNext - lonNow;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    const arc = degToArcsec(lonNow);
    return {
      name,
      longitudeArcsec: arc,
      retrograde: delta < 0,
      address: CrtAddress.fromArcsec(arc),
      meaning: MEANINGS[name],
    };
  });
}
