import type { ResonanceCard } from "../types/resonanceTypes";

export interface RankOptions {
  maxCards?: number;
  minPriority?: number;
  boostBodies?: string[]; // user-pinned bodies receive +0.15
  boostEventTypes?: string[];
}

export function rankResonanceEvents(
  cards: ResonanceCard[],
  opts: RankOptions = {},
): ResonanceCard[] {
  const { maxCards = 10, minPriority = 0.05, boostBodies = [], boostEventTypes = [] } = opts;
  const scored = cards
    .map((c) => {
      let bonus = 0;
      for (const body of boostBodies) {
        if (c.bodies.some((b) => b.name === body)) bonus += 0.15;
      }
      if (boostEventTypes.includes(c.eventType)) bonus += 0.1;
      return { ...c, priority: c.priority + bonus };
    })
    .filter((c) => c.priority >= minPriority)
    .sort((a, b) => b.priority - a.priority);
  return scored.slice(0, maxCards);
}
