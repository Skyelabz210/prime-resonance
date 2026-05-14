import { createFileRoute } from "@tanstack/react-router";
import { DiscoveryLanding } from "@/components/qmnf/DiscoveryLanding";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Prime Resonance — The Dresden Codex Discovery" },
      {
        name: "description",
        content:
          "Prime 11 is the unique shadow channel through which Saturn carries the missing Ramanujan prime. The Dresden Codex was the first machine to compute it.",
      },
    ],
  }),
  component: DiscoveryLanding,
});
