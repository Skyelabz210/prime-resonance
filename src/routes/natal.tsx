import { createFileRoute } from "@tanstack/react-router";
import { NatalPage } from "@/components/qmnf/NatalPage";

export const Route = createFileRoute("/natal")({
  head: () => ({
    meta: [
      { title: "Natal Chart — Prime Resonance Astrology" },
      {
        name: "description",
        content:
          "Your natal chart computed in exact integer arithmetic on the Safe Basis primes, including shadow bonds and boundary events.",
      },
    ],
  }),
  component: NatalPage,
});
