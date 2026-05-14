import type { PhaseContext } from "../types/resonanceTypes";

export function depthIconFor(depth: number): PhaseContext["visualDepthIcon"] {
  if (depth < 0.1) return "new";
  if (depth < 0.3) return "crescent";
  if (depth < 0.45) return "quarter";
  if (depth < 0.7) return "gibbous";
  if (depth < 0.9) return "full";
  return "waning";
}

export function phaseStateFor(depth: number): PhaseContext["phaseState"] {
  if (depth < 0.1) return "dormant";
  if (depth < 0.3) return "entering";
  if (depth < 0.7) return "building";
  if (depth < 0.9) return "peak";
  return "waning";
}
