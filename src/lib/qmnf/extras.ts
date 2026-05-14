// Extra sensitive points: true lunar node (vs. mean), Galactic Center,
// Vertex / Anti-Vertex.
//
// Dresden refinement: each of these is a first-class CRT address — its r₁₁
// participates in shadow networks and Face-of-Zero loci alongside the
// planets.

import { jdToCenturiesJ2000 } from "./julian";
import { CrtAddress } from "./crt";
import { FULL_CIRCLE_ARCSEC } from "./constants";

const DEG = Math.PI / 180;

function norm360(d: number): number {
  d = d % 360;
  return d < 0 ? d + 360 : d;
}

function degToArcsec(deg: number): bigint {
  const a = Math.round(deg * 3600);
  return ((BigInt(a) % FULL_CIRCLE_ARCSEC) + FULL_CIRCLE_ARCSEC) % FULL_CIRCLE_ARCSEC;
}

/** True lunar node — osculating ascending node (Meeus ch.47).
 *  Differs from the mean node by up to ~1.6°. */
export function trueNodeDeg(jd: number): number {
  const T = jdToCenturiesJ2000(jd);
  const omega = 125.04452 - 1934.136261 * T + 0.0020708 * T * T + (T * T * T) / 450000;
  // Apply nutation-like wobble (a simplified subset)
  const D = (297.85036 + 445267.11148 * T) * DEG;
  const M = (357.52772 + 35999.05034 * T) * DEG;
  const Mp = (134.96298 + 477198.867398 * T) * DEG;
  const F = (93.27191 + 483202.017538 * T) * DEG;
  const dOmega =
    -1.4979 * Math.sin(2 * (F - D)) -
    0.15 * Math.sin(M) -
    0.1226 * Math.sin(2 * D) +
    0.1176 * Math.sin(2 * F) -
    0.0801 * Math.sin(2 * (Mp - F));
  return norm360(omega + dOmega);
}

/** Galactic Center — Sgr A*. J2000.0 ecliptic longitude ≈ 26°50' Sagittarius
 *  = 266.83°. Precesses at the same rate as the equinox (50.29″/yr). */
export function galacticCenterDeg(jd: number): number {
  const days = jd - 2451545.0;
  const yrs = days / 365.25;
  return norm360(266.83 + (50.29 / 3600) * yrs);
}

/** Vertex — the western intersection of the prime vertical with the
 *  ecliptic. Often called the "third angle". Computed for a given
 *  birthplace and time. */
export function vertexDeg(jd: number, latDeg: number, lonDeg: number): number {
  const T = jdToCenturiesJ2000(jd);
  const gmst =
    280.46061837 +
    360.98564736629 * (jd - 2451545.0) +
    0.000387933 * T * T -
    (T * T * T) / 38710000;
  const lst = norm360(gmst + lonDeg);
  const eps = (23.43929111 - 0.013004167 * T - 1.6389e-7 * T * T + 5.0361e-7 * T * T * T) * DEG;
  const ramc = lst * DEG;
  // Vertex = "anti-ascendant" computed with co-latitude (90° − lat).
  const colat = (90 - latDeg) * DEG;
  const y = -Math.cos(ramc);
  const x = Math.sin(ramc) * Math.cos(eps) + Math.tan(colat) * Math.sin(eps);
  let v = norm360(Math.atan2(y, x) / DEG);
  // The vertex is the *western* intersection, so adjust by 180° if necessary
  v = norm360(v + 180);
  return v;
}

export function antiVertexDeg(jd: number, latDeg: number, lonDeg: number): number {
  return norm360(vertexDeg(jd, latDeg, lonDeg) + 180);
}

export interface SensitivePoint {
  name: string;
  longitudeArcsec: bigint;
  longitudeDeg: number;
  address: CrtAddress;
}

export function buildExtras(jd: number, latDeg: number, lonDeg: number): SensitivePoint[] {
  return [
    pointFromDeg("True Node", trueNodeDeg(jd)),
    pointFromDeg("Galactic Center", galacticCenterDeg(jd)),
    pointFromDeg("Vertex", vertexDeg(jd, latDeg, lonDeg)),
    pointFromDeg("Anti-Vertex", antiVertexDeg(jd, latDeg, lonDeg)),
  ];
}

function pointFromDeg(name: string, deg: number): SensitivePoint {
  const arc = degToArcsec(deg);
  return { name, longitudeArcsec: arc, longitudeDeg: deg, address: CrtAddress.fromArcsec(arc) };
}
