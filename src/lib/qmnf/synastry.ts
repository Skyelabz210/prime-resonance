// Synastry — two-chart comparison.
// Computes:
//   - Classical cross-aspects (chart A planet vs. chart B planet)
//   - Shadow bonds (lane-11 cross-locks) — including classically invisible ones
//   - Boundary events (lane-13 cross-locks)
//   - Top pairs ranked by lock strength
//
// Source: astrology_system.py SynastryReport.

import { classifyPair, type ClassifiedAspect } from "./aspects";
import { SHADOW_LANE_NAMES, BOUNDARY_LANE_NAMES } from "./constants";
import type { FullChart } from "./chart";
import type { PlanetPosition } from "./ephemeris";

export interface CrossPair {
  planetA: string; // chart A planet
  planetB: string; // chart B planet
  aspects: ClassifiedAspect[];
  shadowResidue?: number; // common r11 if locked
  shadowLane?: string;
  boundaryResidue?: number; // common r13 if locked
  boundaryLane?: string;
  classicallyInvisible: boolean; // no cardinal/classical aspect but residue locked
  lockScore: number; // 0-100 composite
}

export interface SynastryReport {
  /** All planet pairs with at least one event (aspect or residue lock). */
  pairs: CrossPair[];
  /** Pairs locked on lane-11. */
  shadowBonds: CrossPair[];
  /** Pairs locked on lane-13. */
  boundaryBonds: CrossPair[];
  /** Pairs locked on both r11 AND r13 — Face of Zero crossing. */
  faceOfZero: CrossPair[];
  /** Shadow-bond pairs that have NO cardinal/classical aspect. */
  invisibleLocks: CrossPair[];
  /** Top `n` strongest pairs by lockScore. */
  topPairs: CrossPair[];
}

function rename(p: PlanetPosition, prefix: string): PlanetPosition {
  return { ...p, name: `${prefix}.${p.name}` };
}

function nameAfterPrefix(s: string): string {
  const i = s.indexOf(".");
  return i < 0 ? s : s.slice(i + 1);
}

function isClassical(a: ClassifiedAspect): boolean {
  return a.aspect.family === "cardinal" || a.aspect.family === "classical";
}

function computeLockScore(p: CrossPair): number {
  let s = 0;
  if (p.aspects.some((a) => a.aspect.family === "cardinal")) s += 35;
  if (p.aspects.some((a) => a.aspect.family === "classical")) s += 25;
  if (p.shadowResidue !== undefined) s += 25; // Lane-11 lock weighty
  if (p.boundaryResidue !== undefined) s += 15;
  if (p.classicallyInvisible) s += 10; // bonus for hidden link
  return Math.min(100, s);
}

export function computeSynastry(a: FullChart, b: FullChart, topN = 10): SynastryReport {
  const pairs: CrossPair[] = [];

  for (const pa of a.ephemeris.planets) {
    for (const pb of b.ephemeris.planets) {
      const aspects = classifyPair(rename(pa, "A"), rename(pb, "B"));
      const sameR11 = pa.address.r11 === pb.address.r11;
      const sameR13 = pa.address.r13 === pb.address.r13;
      if (!aspects.length && !sameR11 && !sameR13) continue;

      const hasClassical = aspects.some(isClassical);

      const cp: CrossPair = {
        planetA: pa.name,
        planetB: pb.name,
        aspects: aspects.map((asp) => ({ ...asp, a: pa.name, b: pb.name })),
        shadowResidue: sameR11 ? Number(pa.address.r11) : undefined,
        shadowLane: sameR11 ? SHADOW_LANE_NAMES[Number(pa.address.r11)] : undefined,
        boundaryResidue: sameR13 ? Number(pa.address.r13) : undefined,
        boundaryLane: sameR13 ? BOUNDARY_LANE_NAMES[Number(pa.address.r13)] : undefined,
        classicallyInvisible: sameR11 && !hasClassical,
        lockScore: 0,
      };
      cp.lockScore = computeLockScore(cp);
      pairs.push(cp);
    }
  }

  const shadowBonds = pairs.filter((p) => p.shadowResidue !== undefined);
  const boundaryBonds = pairs.filter((p) => p.boundaryResidue !== undefined);
  const faceOfZero = pairs.filter(
    (p) => p.shadowResidue !== undefined && p.boundaryResidue !== undefined,
  );
  const invisibleLocks = pairs.filter((p) => p.classicallyInvisible);
  const topPairs = [...pairs].sort((x, y) => y.lockScore - x.lockScore).slice(0, topN);

  void nameAfterPrefix;
  return { pairs, shadowBonds, boundaryBonds, faceOfZero, invisibleLocks, topPairs };
}
