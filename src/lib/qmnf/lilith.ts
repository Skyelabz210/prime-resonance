// Black Moon Lilith — mean lunar apogee.
// Period 8.85 years; mean motion 0.111404 deg/day.
// Reference: longitude at J2000.0 = 83.3532° (apogee of Moon's orbit).

import { J2000_JD } from "./julian";
import { CrtAddress } from "./crt";
import { FULL_CIRCLE_ARCSEC } from "./constants";

const J2000_LILITH_DEG = 83.3532;
const LILITH_MOTION_DEG_PER_DAY = 0.111404; // mean apogee precession

function norm360(d: number): number {
  d = d % 360;
  return d < 0 ? d + 360 : d;
}

export function meanLilithDeg(jd: number): number {
  const days = jd - J2000_JD;
  return norm360(J2000_LILITH_DEG + LILITH_MOTION_DEG_PER_DAY * days);
}

export function meanLilithArcsec(jd: number): bigint {
  const a = Math.round(meanLilithDeg(jd) * 3600);
  return ((BigInt(a) % FULL_CIRCLE_ARCSEC) + FULL_CIRCLE_ARCSEC) % FULL_CIRCLE_ARCSEC;
}

export function meanLilithAddress(jd: number): CrtAddress {
  return CrtAddress.fromArcsec(meanLilithArcsec(jd));
}
