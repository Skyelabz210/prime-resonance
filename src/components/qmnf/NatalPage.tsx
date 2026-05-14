import { useEffect, useMemo, useState } from "react";
import { useSearch } from "@tanstack/react-router";
import {
  computeFullChart,
  buildReadingBundle,
  type FullChart,
  type BirthData,
} from "@/lib/qmnf/chart";
import { ChartWheel } from "@/components/qmnf/ChartWheel";
import { PlanetCard } from "@/components/qmnf/PlanetCard";
import { AspectGrid } from "@/components/qmnf/AspectGrid";
import { ShadowNetworkPanel } from "@/components/qmnf/ShadowNetworkPanel";
import { BoundaryNetworkPanel } from "@/components/qmnf/BoundaryNetworkPanel";
import { FaceOfZeroPanel } from "@/components/qmnf/FaceOfZeroPanel";
import { PatternsPanel } from "@/components/qmnf/PatternsPanel";
import { DresdenPanel } from "@/components/qmnf/DresdenPanel";
import { AgentReading } from "@/components/qmnf/AgentReading";
import { BirthForm } from "@/components/qmnf/BirthForm";
import { VedicPanel } from "@/components/qmnf/VedicPanel";
import { TraditionalPanel } from "@/components/qmnf/TraditionalPanel";
import { HarmonicsPanel } from "@/components/qmnf/HarmonicsPanel";
import { SolarArcPanel } from "@/components/qmnf/SolarArcPanel";
import { TimeLordPanel } from "@/components/qmnf/TimeLordPanel";
import { Phase3Panel } from "@/components/qmnf/Phase3Panel";
import { useRigor } from "@/lib/qmnf/rigor";
import { getChart, saveChart } from "@/lib/qmnf/store";

export function NatalPage() {
  const search = useSearch({ strict: false }) as { id?: string };
  const [birth, setBirth] = useState<BirthData | null>(null);
  const [savedFlash, setSavedFlash] = useState<string | null>(null);

  useEffect(() => {
    if (search?.id) {
      const c = getChart(search.id);
      if (c) setBirth(c.birth);
    }
  }, [search?.id]);

  const chart = useMemo<FullChart | null>(() => (birth ? computeFullChart(birth) : null), [birth]);
  const { mode } = useRigor();
  const bundle = useMemo(
    () => (chart ? buildReadingBundle(chart, mode === "rigorous") : null),
    [chart, mode],
  );

  const onSave = () => {
    if (!birth) return;
    const saved = saveChart(birth);
    setSavedFlash(`Saved as ${saved.id.slice(0, 8)}…`);
    setTimeout(() => setSavedFlash(null), 2500);
  };

  return (
    <div className="space-y-8">
      <BirthForm onSubmit={setBirth} />

      {chart && bundle && (
        <>
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={onSave}
              className="rounded border px-3 py-1.5 text-xs font-mono uppercase tracking-widest text-white/85"
              style={{ borderColor: "#9d7bff66", background: "#9d7bff15" }}
            >
              Save chart
            </button>
            {savedFlash && <span className="text-xs font-mono text-emerald-300">{savedFlash}</span>}
          </div>

          <section className="grid lg:grid-cols-[1fr_400px] gap-6">
            <ChartWheel chart={chart} />
            <div className="space-y-3">
              <h2 className="font-serif text-xl text-white/80">Foundation</h2>
              <div className="grid gap-2">
                {chart.ephemeris.planets.map((p) => (
                  <PlanetCard key={p.name} planet={p} house={chart.planetHouses[p.name]} />
                ))}
              </div>
            </div>
          </section>

          <section className="grid lg:grid-cols-2 gap-6">
            <AspectGrid chart={chart} />
            <ShadowNetworkPanel chart={chart} />
          </section>

          <section className="grid lg:grid-cols-2 gap-6">
            <BoundaryNetworkPanel chart={chart} />
            <FaceOfZeroPanel chart={chart} />
          </section>

          <section className="grid lg:grid-cols-2 gap-6">
            <PatternsPanel chart={chart} />
            <DresdenPanel chart={chart} />
          </section>

          <section>
            <TraditionalPanel chart={chart} />
          </section>

          <section>
            <TimeLordPanel chart={chart} />
          </section>

          <section>
            <Phase3Panel chart={chart} />
          </section>

          <section className="grid lg:grid-cols-2 gap-6">
            <HarmonicsPanel chart={chart} />
            <SolarArcPanel chart={chart} />
          </section>

          <section>
            <VedicPanel chart={chart} />
          </section>

          <section>
            <AgentReading bundle={bundle} />
          </section>
        </>
      )}
    </div>
  );
}
