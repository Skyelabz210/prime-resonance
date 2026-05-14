import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { useSearch } from "@tanstack/react-router";
import { computeFullChart, type BirthData } from "@/lib/qmnf/chart";
import { BirthForm } from "@/components/qmnf/BirthForm";
import { ProgressedView } from "@/components/qmnf/ProgressedView";
import { getChart } from "@/lib/qmnf/store";

function ProgressedRoute() {
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
      <h1 className="font-serif text-3xl" style={{ color: "#a8e6cf" }}>
        Progressed Chart
      </h1>
      <p className="text-sm text-white/70 max-w-2xl">
        Secondary progressions (day = year) lifted through K-Elimination, so every planet stays on
        its natal gear (mod 323). Drift across years is measurable in residue space, not just angle.
      </p>
      <BirthForm onSubmit={setBirth} />
      {chart && <ProgressedView chart={chart} />}
    </div>
  );
}

export const Route = createFileRoute("/progressed")({
  head: () => ({ meta: [{ title: "Progressed — Prime Resonance Astrology" }] }),
  component: ProgressedRoute,
});
