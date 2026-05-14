import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { useSearch } from "@tanstack/react-router";
import { computeFullChart, type BirthData } from "@/lib/qmnf/chart";
import { BirthForm } from "@/components/qmnf/BirthForm";
import { SynastryView } from "@/components/qmnf/SynastryView";
import { getChart } from "@/lib/qmnf/store";

function SynastryRoute() {
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
      <h1 className="font-serif text-3xl" style={{ color: "#e3b4ff" }}>
        Synastry
      </h1>
      <p className="text-sm text-white/70 max-w-2xl">
        Compare two charts on the CRT manifold. Beyond classical aspects, see lane-11 shadow bonds
        and lane-13 boundary events that traditional synastry can't detect.
      </p>
      <h2 className="font-serif text-lg text-white/80 mt-4">First chart</h2>
      <BirthForm onSubmit={setBirth} />
      {chart && <SynastryView chart={chart} />}
    </div>
  );
}

export const Route = createFileRoute("/synastry")({
  head: () => ({ meta: [{ title: "Synastry — Prime Resonance Astrology" }] }),
  component: SynastryRoute,
});
