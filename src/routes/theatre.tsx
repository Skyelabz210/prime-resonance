import { createFileRoute } from "@tanstack/react-router";
import { ResonanceTheatreScreen } from "@/features/resonance-reading-theatre/components/ResonanceTheatreScreen";

export const Route = createFileRoute("/theatre")({
  head: () => ({
    meta: [
      { title: "Resonance Reading Theatre — Prime Resonance" },
      {
        name: "description",
        content:
          "Watch your astrological reading constructed from computed chart mechanics. Every claim is backed by a math trace.",
      },
      { property: "og:title", content: "Resonance Reading Theatre" },
      {
        property: "og:description",
        content:
          "Explainable AI astronomical reading: the AI narrates, the card visualizes, the back of the card proves the computation.",
      },
    ],
  }),
  component: ResonanceTheatreScreen,
});
