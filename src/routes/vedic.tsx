import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { useSearch } from "@tanstack/react-router";
import { computeFullChart, type BirthData } from "@/lib/qmnf/chart";
import { BirthForm } from "@/components/qmnf/BirthForm";
import { VedicPanel } from "@/components/qmnf/VedicPanel";
import { DashaTimeline } from "@/components/qmnf/DashaTimeline";
import { getChart } from "@/lib/qmnf/store";

function VedicRoute() {
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
      <h1 className="font-serif text-3xl" style={{ color: "#ffd56b" }}>
        Vedic Layer
      </h1>
      <p className="text-sm text-white/70 max-w-2xl">
        Sidereal positions, nakshatra placements, and the 120-year Vimsottari Dasha walk — all in
        integer arithmetic, no float drift over centuries.
      </p>
      <BirthForm onSubmit={setBirth} />
      {chart && (
        <div className="grid lg:grid-cols-2 gap-6">
          <VedicPanel chart={chart} />
          <DashaTimeline chart={chart} />
        </div>
      )}
    </div>
  );
}

export const Route = createFileRoute("/vedic")({
  head: () => ({ meta: [{ title: "Vedic — Prime Resonance Astrology" }] }),
  component: VedicRoute,
});
