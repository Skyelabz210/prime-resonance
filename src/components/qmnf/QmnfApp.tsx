import { useMemo, useState } from "react";
import {
  computeFullChart, buildReadingBundle, type FullChart, type BirthData,
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

export function QmnfApp() {
  const [birth, setBirth] = useState<BirthData | null>(null);
  const chart = useMemo<FullChart | null>(
    () => birth ? computeFullChart(birth) : null,
    [birth],
  );
  const bundle = useMemo(() => chart ? buildReadingBundle(chart) : null, [chart]);

  return (
    <div className="min-h-screen text-foreground" style={{
      background: "radial-gradient(ellipse at top, #1a1f3a 0%, #0a0e1a 60%, #050810 100%)",
    }}>
      <header className="border-b border-white/5 px-6 py-6">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl tracking-tight" style={{ color: "#e6e8ff" }}>
              QMNF <span style={{ color: "#9d7bff" }}>Astrology</span>
            </h1>
            <p className="text-xs sm:text-sm text-white/50 mt-1 font-mono">
              Safe Basis · {`{2,3,5,7,11,13}`} · Shadow Prime 11 · Boundary Prime 13
            </p>
          </div>
          <div className="text-[10px] uppercase tracking-widest text-white/40 font-mono">
            Precision: Meeus only · Phase 1
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-8">
        <BirthForm onSubmit={setBirth} />

        {chart && bundle && (
          <>
            <section className="grid lg:grid-cols-[1fr_400px] gap-6">
              <ChartWheel chart={chart} />
              <div className="space-y-3">
                <h2 className="font-serif text-xl text-white/80">Foundation</h2>
                <div className="grid gap-2">
                  {chart.ephemeris.planets.map(p => (
                    <PlanetCard
                      key={p.name}
                      planet={p}
                      house={chart.planetHouses[p.name]}
                    />
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
              <AgentReading bundle={bundle} />
            </section>
          </>
        )}
      </main>

      <footer className="border-t border-white/5 px-6 py-6 mt-12">
        <p className="text-center text-xs font-mono text-white/40 italic">
          Truth cannot be approximated.
        </p>
      </footer>
    </div>
  );
}
