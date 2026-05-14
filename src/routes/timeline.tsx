import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { useSearch } from "@tanstack/react-router";
import { computeFullChart, type BirthData } from "@/lib/qmnf/chart";
import { BirthForm } from "@/components/qmnf/BirthForm";
import { TimelineView } from "@/components/qmnf/TimelineView";
import { getChart } from "@/lib/qmnf/store";

function TimelineRoute() {
  const search = useSearch({ strict: false }) as { id?: string };
  const [birth, setBirth] = useState<BirthData | null>(null);
  useEffect(() => {
    if (search?.id) {
      const c = getChart(search.id);
      if (c) setBirth(c.birth);
    }
  }, [search?.id]);

  const chart = useMemo(() => (birth ? computeFullChart(birth) : null), [birth]);

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl" style={{ color: "#cfd6ff" }}>
        Life Timeline
      </h1>
      <p className="text-sm text-white/70 max-w-2xl">
        Modular event predictor — every Saturn return, biquintile, and codex closure solved by
        linear congruence over mean motion. Exact integer dates, no float sampling.
      </p>
      <BirthForm onSubmit={setBirth} />
      {chart && <TimelineView chart={chart} />}
    </div>
  );
}

export const Route = createFileRoute("/timeline")({
  head: () => ({ meta: [{ title: "Life Timeline — Prime Resonance Astrology" }] }),
  component: TimelineRoute,
});
