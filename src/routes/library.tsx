import { createFileRoute } from "@tanstack/react-router";
import { LibraryView } from "@/components/qmnf/LibraryView";

export const Route = createFileRoute("/library")({
  head: () => ({ meta: [{ title: "Library — Prime Resonance Astrology" }] }),
  component: LibraryView,
});
