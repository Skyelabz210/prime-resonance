// Jones chart shapes — classify the gestalt of a natal chart.
// 7 archetypal patterns based on planet distribution around the wheel.
// Reference: Marc Edmund Jones, _The Guide to Horoscope Interpretation_.

import { FULL_CIRCLE_ARCSEC } from "./constants";

export type ChartShape =
  | "Bundle" // all planets within 120°
  | "Bowl" // within 180°
  | "Locomotive" // within 240°, 120° gap
  | "Bucket" // bowl + handle
  | "Seesaw" // two opposing groups
  | "Splash" // evenly distributed
  | "Splay"; // 3+ clusters separated by gaps

export interface ShapeResult {
  shape: ChartShape;
  /** The largest empty arc, in degrees. */
  largestGapDeg: number;
  /** Total occupied arc, in degrees. */
  occupiedArcDeg: number;
  /** For Bucket: the singleton handle's planet name. */
  handle?: string;
  /** Planet at the leading edge of the bowl/bucket/locomotive. */
  leadingPlanet?: string;
}

function modPos(a: bigint): bigint {
  return ((a % FULL_CIRCLE_ARCSEC) + FULL_CIRCLE_ARCSEC) % FULL_CIRCLE_ARCSEC;
}

interface PlanetPos {
  name: string;
  longitudeArcsec: bigint;
}

export function classifyChartShape(planets: PlanetPos[]): ShapeResult {
  if (planets.length < 7) {
    return { shape: "Splash", largestGapDeg: 0, occupiedArcDeg: 360 };
  }
  // Sort by longitude, find consecutive gaps.
  const sorted = [...planets].sort((a, b) => Number(a.longitudeArcsec - b.longitudeArcsec));
  const gaps: { afterIdx: number; gapArcsec: bigint }[] = [];
  for (let i = 0; i < sorted.length; i++) {
    const next = (i + 1) % sorted.length;
    let gap = sorted[next].longitudeArcsec - sorted[i].longitudeArcsec;
    if (next === 0)
      gap = FULL_CIRCLE_ARCSEC - sorted[i].longitudeArcsec + sorted[0].longitudeArcsec;
    gap = modPos(gap);
    gaps.push({ afterIdx: i, gapArcsec: gap });
  }
  gaps.sort((a, b) => Number(b.gapArcsec - a.gapArcsec));
  const largestGap = gaps[0];
  const secondGap = gaps[1];
  const largestGapDeg = Number(largestGap.gapArcsec) / 3600;
  const secondGapDeg = Number(secondGap.gapArcsec) / 3600;
  const occupied = 360 - largestGapDeg;
  const leading = sorted[(largestGap.afterIdx + 1) % sorted.length].name;

  // Bundle: all within 120°
  if (occupied <= 120) {
    return { shape: "Bundle", largestGapDeg, occupiedArcDeg: occupied, leadingPlanet: leading };
  }
  // Bowl: all within 180°
  if (occupied <= 180) {
    return { shape: "Bowl", largestGapDeg, occupiedArcDeg: occupied, leadingPlanet: leading };
  }
  // Locomotive: occupied > 240° (largest gap < 120°), no other gaps > 60°.
  if (largestGapDeg < 120 && largestGapDeg >= 60 && secondGapDeg < 60) {
    return {
      shape: "Locomotive",
      largestGapDeg,
      occupiedArcDeg: occupied,
      leadingPlanet: leading,
    };
  }
  // Bucket: bowl-like body + 1 singleton (handle) > 90° from the rest.
  // Heuristic: largest gap (180°+) + second gap (60°+) and ≥ 1 planet alone.
  if (largestGapDeg >= 150 && secondGapDeg >= 60 && secondGapDeg < 120) {
    const handleIdx = (largestGap.afterIdx + 1) % sorted.length;
    return {
      shape: "Bucket",
      largestGapDeg,
      occupiedArcDeg: occupied,
      handle: sorted[handleIdx].name,
      leadingPlanet: leading,
    };
  }
  // Seesaw: two gaps both ≥ 60° splitting the chart into ~2 groups.
  if (largestGapDeg >= 60 && secondGapDeg >= 60 && largestGapDeg + secondGapDeg >= 180) {
    return { shape: "Seesaw", largestGapDeg, occupiedArcDeg: occupied };
  }
  // Splay: 3+ clusters; default if not anything else.
  // Splash: all gaps < ~60°, very even.
  if (largestGapDeg < 60) {
    return { shape: "Splash", largestGapDeg, occupiedArcDeg: occupied };
  }
  return { shape: "Splay", largestGapDeg, occupiedArcDeg: occupied };
}
