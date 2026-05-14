// Lunar phase (8-fold) and Void-of-Course Moon.
// Both purely a function of (Moon − Sun) angular distance and the next
// Moon-to-planet aspect.

import { FULL_CIRCLE_ARCSEC, ARCSEC_PER_DEGREE } from "./constants";

export type Phase =
  | "New Moon"
  | "Waxing Crescent"
  | "First Quarter"
  | "Waxing Gibbous"
  | "Full Moon"
  | "Waning Gibbous"
  | "Last Quarter"
  | "Waning Crescent";

function modPos(a: bigint): bigint {
  return ((a % FULL_CIRCLE_ARCSEC) + FULL_CIRCLE_ARCSEC) % FULL_CIRCLE_ARCSEC;
}

export interface LunarPhase {
  phase: Phase;
  /** Moon − Sun longitude, in arcseconds, mod 360°. */
  elongationArcsec: bigint;
  /** Same in degrees, 0..360. */
  elongationDeg: number;
  /** Illumination 0..1. */
  illumination: number;
  /** Waxing if elongation < 180°, else waning. */
  waxing: boolean;
}

/** Compute the 8-fold lunar phase from Sun and Moon arcsec longitudes. */
export function lunarPhase(sunArcsec: bigint, moonArcsec: bigint): LunarPhase {
  const elong = modPos(moonArcsec - sunArcsec);
  const deg = Number(elong) / 3600;
  // 45° bands centered on the 8 phase-points (0, 45, 90, ..., 315).
  let phase: Phase;
  if (deg < 22.5 || deg >= 337.5) phase = "New Moon";
  else if (deg < 67.5) phase = "Waxing Crescent";
  else if (deg < 112.5) phase = "First Quarter";
  else if (deg < 157.5) phase = "Waxing Gibbous";
  else if (deg < 202.5) phase = "Full Moon";
  else if (deg < 247.5) phase = "Waning Gibbous";
  else if (deg < 292.5) phase = "Last Quarter";
  else phase = "Waning Crescent";
  const illumination = (1 - Math.cos((deg * Math.PI) / 180)) / 2;
  return {
    phase,
    elongationArcsec: elong,
    elongationDeg: deg,
    illumination,
    waxing: deg < 180,
  };
}

/** Void-of-Course Moon: the Moon makes no further Ptolemaic aspect to a
 *  classical planet before changing signs.
 *  Returns true if the Moon's *next* exact aspect (cnj/sxt/sqr/tri/opp) to
 *  any of {Sun,Mercury,Venus,Mars,Jupiter,Saturn} would happen *after* the
 *  Moon crosses into the next sign. */
export function isMoonVoidOfCourse(
  moonArcsec: bigint,
  moonSpeedArcsecPerDay: number,
  others: Array<{ name: string; longitudeArcsec: bigint; speedArcsecPerDay: number }>,
): { voc: boolean; nextSignChangeDays: number; nextAspectDays: number | null } {
  // Days until Moon enters next sign.
  const inSignArcsec = moonArcsec % 108_000n; // 30° per sign
  const remainArcsec = 108_000n - inSignArcsec;
  const nextSignChangeDays = Number(remainArcsec) / moonSpeedArcsecPerDay;
  // Find Moon's next exact aspect to any classical planet.
  const ASPECTS_DEG = [0, 60, 90, 120, 180];
  let nextAspectDays: number | null = null;
  for (const o of others) {
    const relSpeed = moonSpeedArcsecPerDay - o.speedArcsecPerDay;
    if (relSpeed === 0) continue;
    for (const aspDeg of ASPECTS_DEG) {
      const aspArc = BigInt(aspDeg) * ARCSEC_PER_DEGREE;
      // Solve relSpeed · t ≡ (o + asp − moon) (mod 360°). Two branches.
      for (const sign of [aspArc, FULL_CIRCLE_ARCSEC - aspArc]) {
        const target = modPos(o.longitudeArcsec + sign - moonArcsec);
        const t = Number(target) / relSpeed;
        if (t > 0 && (nextAspectDays === null || t < nextAspectDays)) {
          nextAspectDays = t;
        }
      }
    }
  }
  const voc = nextAspectDays === null || nextAspectDays > nextSignChangeDays;
  return { voc, nextSignChangeDays, nextAspectDays };
}
