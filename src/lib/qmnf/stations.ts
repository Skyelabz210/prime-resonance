// Retrograde-station detection — finds the exact JDs when a planet's
// velocity changes sign within a given window. Used for the natal
// retrograde badge and for upcoming-station events in the timeline.

import { computeEphemeris } from "./ephemeris";
import { FULL_CIRCLE_ARCSEC } from "./constants";

const STATION_PLANETS = [
  "Mercury",
  "Venus",
  "Mars",
  "Jupiter",
  "Saturn",
  "Uranus",
  "Neptune",
  "Pluto",
];

function angularDelta(a: bigint, b: bigint): number {
  const half = Number(FULL_CIRCLE_ARCSEC) / 2;
  let d = Number(b - a);
  if (d > half) d -= Number(FULL_CIRCLE_ARCSEC);
  if (d < -half) d += Number(FULL_CIRCLE_ARCSEC);
  return d;
}

export interface Station {
  planet: string;
  jd: number;
  kind: "retrograde" | "direct";
}

/** Scan [startJd, endJd] in `stride`-day steps for sign-changes in mean
 *  daily motion. Returns the detected station crossings. */
export function findStations(startJd: number, endJd: number, stride = 5): Station[] {
  const out: Station[] = [];
  // For each planet, walk along the window comparing v(jd) to v(jd+stride).
  for (const planet of STATION_PLANETS) {
    let prevSign = 0;
    for (let jd = startJd; jd <= endJd; jd += stride) {
      const e1 = computeEphemeris(jd);
      const e2 = computeEphemeris(jd + 1);
      const p1 = e1.planets.find((p) => p.name === planet);
      const p2 = e2.planets.find((p) => p.name === planet);
      if (!p1 || !p2) continue;
      const v = angularDelta(p1.longitudeArcsec, p2.longitudeArcsec);
      const sign = v > 0 ? 1 : v < 0 ? -1 : 0;
      if (prevSign !== 0 && sign !== 0 && sign !== prevSign) {
        out.push({
          planet,
          jd,
          kind: sign < 0 ? "retrograde" : "direct",
        });
      }
      prevSign = sign;
    }
  }
  return out;
}
