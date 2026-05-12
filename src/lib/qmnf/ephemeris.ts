// Simplified Meeus VSOP-style ephemeris.
// Accuracy ~arcminute for 1900-2100. Boundary: float math inside,
// single round() to bigint arcsec at exit. Slot for Dresden correction.

import { jdToCenturiesJ2000 } from "./julian";
import { CrtAddress } from "./crt";
import { FULL_CIRCLE_ARCSEC } from "./constants";

const DEG = Math.PI / 180;

// Reduce angle to [0, 360)
function norm360(d: number): number {
  d = d % 360;
  return d < 0 ? d + 360 : d;
}

// Solve Kepler's equation
function solveKepler(M: number, e: number): number {
  let E = M + e * Math.sin(M);
  for (let i = 0; i < 12; i++) {
    const dE = (M - E + e * Math.sin(E)) / (1 - e * Math.cos(E));
    E += dE;
    if (Math.abs(dE) < 1e-12) break;
  }
  return E;
}

// Mean orbital elements at epoch J2000 (degrees / AU / radians-per-century-ish)
// Source: Meeus Astronomical Algorithms ch.31, simplified linear terms.
// Format: [a, e, i, Ω, ϖ, L0]  (per planet)
//   a — semi-major (AU); e — eccentricity; i — inclination(deg);
//   Ω — long. ascending node(deg); ϖ — long. perihelion(deg); L — mean long(deg);
// Plus per-century rates.
interface Elements { a: number; e: number; i: number; O: number; w: number; L: number; }

const PLANETS: Record<string, { J2000: Elements; Cy: Elements }> = {
  Mercury: {
    J2000: { a: 0.38709927, e: 0.20563593, i: 7.00497902, O: 48.33076593, w: 77.45779628, L: 252.25032350 },
    Cy:    { a: 0.00000037, e: 0.00001906, i: -0.00594749, O: -0.12534081, w: 0.16047689,  L: 149472.67411175 },
  },
  Venus: {
    J2000: { a: 0.72333566, e: 0.00677672, i: 3.39467605, O: 76.67984255, w: 131.60246718, L: 181.97909950 },
    Cy:    { a: 0.00000390, e: -0.00004107, i: -0.00078890, O: -0.27769418, w: 0.00268329, L: 58517.81538729 },
  },
  Earth: {
    J2000: { a: 1.00000261, e: 0.01671123, i: -0.00001531, O: 0.0, w: 102.93768193, L: 100.46457166 },
    Cy:    { a: 0.00000562, e: -0.00004392, i: -0.01294668, O: 0.0, w: 0.32327364,  L: 35999.37244981 },
  },
  Mars: {
    J2000: { a: 1.52371034, e: 0.09339410, i: 1.84969142, O: 49.55953891, w: -23.94362959, L: -4.55343205 },
    Cy:    { a: 0.00001847, e: 0.00007882, i: -0.00813131, O: -0.29257343, w: 0.44441088, L: 19140.30268499 },
  },
  Jupiter: {
    J2000: { a: 5.20288700, e: 0.04838624, i: 1.30439695, O: 100.47390909, w: 14.72847983, L: 34.39644051 },
    Cy:    { a: -0.00011607, e: -0.00013253, i: -0.00183714, O: 0.20469106, w: 0.21252668, L: 3034.74612775 },
  },
  Saturn: {
    J2000: { a: 9.53667594, e: 0.05386179, i: 2.48599187, O: 113.66242448, w: 92.59887831, L: 49.95424423 },
    Cy:    { a: -0.00125060, e: -0.00050991, i: 0.00193609, O: -0.28867794, w: -0.41897216, L: 1222.49362201 },
  },
  Uranus: {
    J2000: { a: 19.18916464, e: 0.04725744, i: 0.77263783, O: 74.01692503, w: 170.95427630, L: 313.23810451 },
    Cy:    { a: -0.00196176, e: -0.00004397, i: -0.00242939, O: 0.04240589, w: 0.40805281, L: 428.48202785 },
  },
  Neptune: {
    J2000: { a: 30.06992276, e: 0.00859048, i: 1.77004347, O: 131.78422574, w: 44.96476227, L: -55.12002969 },
    Cy:    { a: 0.00026291, e: 0.00005105, i: 0.00035372, O: -0.00508664, w: -0.32241464, L: 218.45945325 },
  },
  Pluto: {
    J2000: { a: 39.48211675, e: 0.24882730, i: 17.14001206, O: 110.30393684, w: 224.06891629, L: 238.92903833 },
    Cy:    { a: -0.00031596, e: 0.00005170, i: 0.00004818, O: -0.01183482, w: -0.04062942, L: 145.20780515 },
  },
};

interface XYZ { x: number; y: number; z: number; }

function elementsAt(name: string, T: number): Elements {
  const p = PLANETS[name];
  return {
    a: p.J2000.a + p.Cy.a * T,
    e: p.J2000.e + p.Cy.e * T,
    i: p.J2000.i + p.Cy.i * T,
    O: p.J2000.O + p.Cy.O * T,
    w: p.J2000.w + p.Cy.w * T,
    L: p.J2000.L + p.Cy.L * T,
  };
}

function heliocentricEcliptic(name: string, T: number): XYZ {
  const el = elementsAt(name, T);
  const M = norm360(el.L - el.w) * DEG;
  const e = el.e;
  const E = solveKepler(M, e);
  const a = el.a;
  // Position in orbital plane
  const xp = a * (Math.cos(E) - e);
  const yp = a * Math.sqrt(1 - e * e) * Math.sin(E);
  // Rotate to ecliptic
  const w = (el.w - el.O) * DEG;
  const O = el.O * DEG;
  const i = el.i * DEG;
  const cosw = Math.cos(w), sinw = Math.sin(w);
  const cosO = Math.cos(O), sinO = Math.sin(O);
  const cosi = Math.cos(i), sini = Math.sin(i);
  const x = (cosw * cosO - sinw * sinO * cosi) * xp + (-sinw * cosO - cosw * sinO * cosi) * yp;
  const y = (cosw * sinO + sinw * cosO * cosi) * xp + (-sinw * sinO + cosw * cosO * cosi) * yp;
  const z = (sinw * sini) * xp + (cosw * sini) * yp;
  return { x, y, z };
}

// Geocentric ecliptic longitude (degrees)
function geocentricLongitudeDeg(name: string, T: number): number {
  if (name === "Earth") return 0;
  const earth = heliocentricEcliptic("Earth", T);
  const planet = heliocentricEcliptic(name, T);
  const dx = planet.x - earth.x;
  const dy = planet.y - earth.y;
  let lon = Math.atan2(dy, dx) / DEG;
  return norm360(lon);
}

// Sun: geocentric ecliptic longitude (analytical, Meeus ch.25 simplified)
function sunLongitudeDeg(T: number): number {
  const L0 = norm360(280.46646 + 36000.76983 * T + 0.0003032 * T * T);
  const M = (357.52911 + 35999.05029 * T - 0.0001537 * T * T) * DEG;
  const e = 0.016708634 - 0.000042037 * T - 0.0000001267 * T * T;
  const C =
      (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M)
    + (0.019993 - 0.000101 * T) * Math.sin(2 * M)
    + 0.000289 * Math.sin(3 * M);
  return norm360(L0 + C);
}

// Moon: ELP-2000 truncated (Meeus ch.47), simplified
function moonLongitudeDeg(T: number): number {
  const Lp = 218.3164477 + 481267.88123421 * T;
  const D  = (297.8501921 + 445267.1114034 * T) * DEG;
  const M  = (357.5291092 + 35999.0502909 * T) * DEG;
  const Mp = (134.9633964 + 477198.8675055 * T) * DEG;
  const F  = (93.2720950 + 483202.0175233 * T) * DEG;
  const lon = Lp
    + 6.288774 * Math.sin(Mp)
    + 1.274027 * Math.sin(2 * D - Mp)
    + 0.658314 * Math.sin(2 * D)
    + 0.213618 * Math.sin(2 * Mp)
    - 0.185116 * Math.sin(M)
    - 0.114332 * Math.sin(2 * F)
    + 0.058793 * Math.sin(2 * D - 2 * Mp)
    + 0.057066 * Math.sin(2 * D - M - Mp)
    + 0.053322 * Math.sin(2 * D + Mp)
    + 0.045758 * Math.sin(2 * D - M);
  return norm360(lon);
}

// True lunar node (mean for now)
function meanNodeDeg(T: number): number {
  return norm360(125.0445479 - 1934.1362891 * T + 0.0020754 * T * T);
}

// Chiron approx (mean elements ~13700 BC era — usable to within 1-2°)
function chironLongitudeDeg(T: number): number {
  const a = 13.6404, e = 0.3823, i = 6.93 * DEG, O = 209.27 * DEG, w = 339.53 * DEG;
  // mean motion deg/century
  const n = 360 / (50.42); // ~50.42 yr period
  const L0 = 134.0; // approx mean longitude at J2000
  const meanLong = L0 + n * (T * 100);
  const M = (meanLong - 339.53) * DEG;
  const E = solveKepler(M, e);
  const xp = a * (Math.cos(E) - e);
  const yp = a * Math.sqrt(1 - e * e) * Math.sin(E);
  const cosw = Math.cos(w), sinw = Math.sin(w);
  const cosO = Math.cos(O), sinO = Math.sin(O);
  const cosi = Math.cos(i), sini = Math.sin(i);
  const x = (cosw * cosO - sinw * sinO * cosi) * xp + (-sinw * cosO - cosw * sinO * cosi) * yp;
  const y = (cosw * sinO + sinw * cosO * cosi) * xp + (-sinw * sinO + cosw * cosO * cosi) * yp;
  const earth = heliocentricEcliptic("Earth", T);
  return norm360(Math.atan2(y - earth.y, x - earth.x) / DEG);
}

// Phase 2 hook — always 0 for now
export function applyDresdenCorrection(_jd: number, _planet: string): bigint {
  return 0n;
}

function degToArcsec(deg: number): bigint {
  const a = Math.round(deg * 3600);
  return ((BigInt(a) % FULL_CIRCLE_ARCSEC) + FULL_CIRCLE_ARCSEC) % FULL_CIRCLE_ARCSEC;
}

export interface PlanetPosition {
  name: string;
  longitudeArcsec: bigint;
  retrograde: boolean;
  address: CrtAddress;
}

export interface EphemerisChart {
  jd: number;
  planets: PlanetPosition[];
}

const SAMPLE_DAYS = 1; // for retrograde detection

function rawLongitudeDeg(name: string, jd: number): number {
  const T = jdToCenturiesJ2000(jd);
  switch (name) {
    case "Sun":      return sunLongitudeDeg(T);
    case "Moon":     return moonLongitudeDeg(T);
    case "NorthNode":return meanNodeDeg(T);
    case "Chiron":   return chironLongitudeDeg(T);
    default:         return geocentricLongitudeDeg(name, T);
  }
}

export function computeEphemeris(jd: number): EphemerisChart {
  const order = ["Sun","Moon","Mercury","Venus","Mars","Jupiter","Saturn","Uranus","Neptune","Pluto","NorthNode","Chiron"];
  const planets: PlanetPosition[] = order.map((name) => {
    const lonNow = rawLongitudeDeg(name, jd);
    const lonNext = rawLongitudeDeg(name, jd + SAMPLE_DAYS);
    let delta = lonNext - lonNow;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    const retro = name === "NorthNode" ? true : delta < 0 && name !== "Sun" && name !== "Moon";
    let arcsec = degToArcsec(lonNow);
    arcsec = (arcsec + applyDresdenCorrection(jd, name) + FULL_CIRCLE_ARCSEC) % FULL_CIRCLE_ARCSEC;
    return {
      name,
      longitudeArcsec: arcsec,
      retrograde: retro,
      address: CrtAddress.fromArcsec(arcsec),
    };
  });
  return { jd, planets };
}
