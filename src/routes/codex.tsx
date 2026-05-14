import { createFileRoute } from "@tanstack/react-router";
import { CodexHub } from "@/components/qmnf/CodexHub";

export const Route = createFileRoute("/codex")({
  head: () => ({
    meta: [
      { title: "The Discovery — Prime Resonance Astrology" },
      {
        name: "description",
        content:
          "The Dresden Codex / Shadow Prime 11 framework — Theorem U-P, DPM-PRIME T1–T10, and the page-by-page HULTA/CRAM decoding.",
      },
    ],
  }),
  component: CodexHub,
});
