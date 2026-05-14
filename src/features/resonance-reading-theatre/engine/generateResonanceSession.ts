import type {
  CalculationConfig,
  ResonanceReadingSession,
  ReadingSummary,
  EngineDiagnostics,
} from "../types/resonanceTypes";
import type { FullChart } from "@/lib/qmnf/chart";
import { buildResonanceCards } from "./buildResonanceCards";
import { rankResonanceEvents } from "./rankResonanceEvents";

const ENGINE_VERSION = "rrt-1.0.0";

export const DEFAULT_CONFIG: CalculationConfig = {
  maxCards: 12,
  minConfidence: 0.4,
  includeShadow: true,
  includeResidue: true,
};

export function generateResonanceSession(
  chart: FullChart,
  config: CalculationConfig = DEFAULT_CONFIG,
  boostBodies: string[] = [],
): ResonanceReadingSession {
  const t0 =
    typeof performance !== "undefined" && typeof performance.now === "function"
      ? performance.now()
      : Date.now();
  const all = buildResonanceCards(chart);
  const rejectedLowConfidence = all.filter((c) => c.confidence.total < config.minConfidence).length;
  const filtered = all.filter((c) => c.confidence.total >= config.minConfidence);
  const cards = rankResonanceEvents(filtered, {
    maxCards: config.maxCards,
    boostBodies,
  });
  const t1 =
    typeof performance !== "undefined" && typeof performance.now === "function"
      ? performance.now()
      : Date.now();

  const bodyCounts: Record<string, number> = {};
  for (const c of cards) for (const b of c.bodies) bodyCounts[b.name] = (bodyCounts[b.name] ?? 0) + 1;
  const dominantBodies = Object.entries(bodyCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([n]) => n);

  const summary: ReadingSummary = {
    totalCards: cards.length,
    topEventType: cards[0]?.eventType ?? "natal_static",
    averageConfidence:
      cards.length === 0 ? 0 : cards.reduce((s, c) => s + c.confidence.total, 0) / cards.length,
    dominantBodies,
    notes: [
      cards.some((c) => c.eventType === "crt_lane_overlap")
        ? "Face-of-Zero locus present — rare alignment detected."
        : "No Face-of-Zero loci in this chart.",
      cards.some((c) => c.eventType === "shadow_contact")
        ? "Shadow Network contains classically invisible bonds."
        : "Shadow Network entirely overlaps the conventional aspect grid.",
    ],
  };

  const diagnostics: EngineDiagnostics = {
    totalCandidates: all.length,
    rejectedLowConfidence,
    computeMs: Math.round(t1 - t0),
    warnings:
      chart.birth.houseSystem === "Placidus"
        ? ["Placidus houses become unstable above ~66° latitude."]
        : [],
  };

  return {
    sessionId: `rrt-${Date.now().toString(36)}`,
    birthDataLabel: `${chart.birth.name || "Unnamed"} · ${chart.birth.year}-${String(chart.birth.month).padStart(2, "0")}-${String(chart.birth.day).padStart(2, "0")}`,
    calculationConfig: config,
    generatedAt: new Date().toISOString(),
    engineVersion: ENGINE_VERSION,
    cards,
    globalSummary: summary,
    diagnostics,
  };
}
