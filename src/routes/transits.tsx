import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { useSearch } from "@tanstack/react-router";
import { computeFullChart, type BirthData } from "@/lib/qmnf/chart";
import { BirthForm } from "@/components/qmnf/BirthForm";
import { TransitsView } from "@/components/qmnf/TransitsView";
import { getChart } from "@/lib/qmnf/store";

function TransitsRoute() {
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
      <h1 className="font-serif text-3xl" style={{ color: "#5dd6c4" }}>
        Transits
      </h1>
      <p className="text-sm text-white/70 max-w-2xl">
        Live transits to your natal chart. Shadow-flagged rows fire when transit_r₁₁ matches
        natal_r₁₁ — a lane-11 lock independent of any angular orb.
      </p>
      <BirthForm onSubmit={setBirth} />
      {chart && <TransitsView chart={chart} />}
    </div>
  );
}

export const Route = createFileRoute("/transits")({
  head: () => ({ meta: [{ title: "Transits — Prime Resonance Astrology" }] }),
  component: TransitsRoute,
});
