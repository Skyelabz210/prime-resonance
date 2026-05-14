import { useMemo, useState } from "react";
import { computeFullChart, type BirthData, type FullChart } from "@/lib/qmnf/chart";
import { computeSynastry } from "@/lib/qmnf/synastry";
import { computeComposite, computeDavison } from "@/lib/qmnf/composite";
import { formatPosition } from "@/lib/qmnf/format";
import { BirthForm } from "./BirthForm";
import { Rigorous } from "./Rigorous";

const SIGNS = ["Ari", "Tau", "Gem", "Can", "Leo", "Vir", "Lib", "Sco", "Sag", "Cap", "Aqu", "Pis"];

export function SynastryView({ chart }: { chart: FullChart }) {
  const [otherBirth, setOtherBirth] = useState<BirthData | null>(null);

  const other = useMemo(() => (otherBirth ? computeFullChart(otherBirth) : null), [otherBirth]);
  const report = useMemo(() => (other ? computeSynastry(chart, other) : null), [chart, other]);
  const composite = useMemo(() => (other ? computeComposite(chart, other) : null), [chart, other]);
  const davison = useMemo(() => (other ? computeDavison(chart, other) : null), [chart, other]);

  return (
    <div className="space-y-6">
      <div
        className="rounded border p-4 backdrop-blur"
        style={{
          borderColor: "#e3b4ff30",
          background: "linear-gradient(135deg,#1a1f3a40,#e3b4ff08)",
        }}
      >
        <h2 className="font-serif text-xl mb-3" style={{ color: "#e3b4ff" }}>
          Synastry — Second Chart
        </h2>
        <BirthForm onSubmit={setOtherBirth} />
      </div>

      {report && (
        <>
          <div className="grid sm:grid-cols-3 gap-3">
            <Stat
              label="Cross-aspects (classical)"
              value={report.pairs.reduce(
                (n, p) =>
                  n +
                  p.aspects.filter(
                    (a) => a.aspect.family === "cardinal" || a.aspect.family === "classical",
                  ).length,
                0,
              )}
              color="#cfd6ff"
            />
            <Stat
              label="Shadow bonds (lane-11)"
              value={report.shadowBonds.length}
              color="#9d7bff"
            />
            <Stat
              label="Boundary bonds (lane-13)"
              value={report.boundaryBonds.length}
              color="#ffb347"
            />
          </div>

          <div className="rounded border p-4" style={{ borderColor: "#e3b4ff30" }}>
            <h3 className="font-serif text-lg mb-2" style={{ color: "#e3b4ff" }}>
              Top pairs
            </h3>
            <div className="space-y-1">
              {report.topPairs.map((p, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded bg-black/30 px-3 py-1.5 text-xs font-mono"
                >
                  <span className="text-white/85 w-44">
                    {p.planetA} ↔ {p.planetB}
                  </span>
                  <span className="text-white/60 flex-1 truncate">
                    {p.aspects.map((a) => a.aspect.name).join(", ") || "—"}
                  </span>
                  {p.shadowLane && <span style={{ color: "#9d7bff" }}>shadow:{p.shadowLane}</span>}
                  {p.boundaryLane && (
                    <span style={{ color: "#ffb347" }}>boundary:{p.boundaryLane}</span>
                  )}
                  <span className="text-white/40">{p.lockScore}/100</span>
                </div>
              ))}
            </div>
          </div>

          {report.invisibleLocks.length > 0 && (
            <div
              className="rounded border p-4"
              style={{ borderColor: "#9d7bff44", background: "#9d7bff08" }}
            >
              <h3 className="font-serif text-lg mb-2" style={{ color: "#9d7bff" }}>
                Classically-invisible shadow bonds
              </h3>
              <div className="mb-2 text-xs text-white/60 font-mono">
                These pairs share lane-11 residues but have <em>no</em> cardinal or classical aspect
                — invisible to traditional synastry, real on the CRT manifold.
              </div>
              {report.invisibleLocks.map((p, i) => (
                <div key={i} className="rounded bg-black/30 px-3 py-1.5 text-xs font-mono mb-1">
                  <span className="text-white/85">
                    {p.planetA} ↔ {p.planetB}
                  </span>
                  <span className="ml-3" style={{ color: "#9d7bff" }}>
                    {p.shadowLane}
                  </span>
                </div>
              ))}
            </div>
          )}

          <Rigorous>
            <div className="text-[10px] font-mono">
              Lock score = 35 (cardinal) + 25 (classical) + 25 (lane-11) + 15 (lane-13) + 10
              (invisible).
            </div>
          </Rigorous>

          {composite && davison && (
            <div className="grid lg:grid-cols-2 gap-3">
              <div className="rounded border p-4" style={{ borderColor: "#e3b4ff30" }}>
                <h3 className="font-serif text-lg mb-2" style={{ color: "#e3b4ff" }}>
                  Composite chart (midpoints)
                </h3>
                <div className="text-xs font-mono space-y-1">
                  {composite.ephemeris.planets.slice(0, 10).map((p) => {
                    const deg = Number(p.longitudeArcsec) / 3600;
                    return (
                      <div key={p.name} className="flex gap-3">
                        <span className="text-white/55 w-20">{p.name}</span>
                        <span className="text-white/85">
                          {formatPosition(p.longitudeArcsec)} {SIGNS[Math.floor(deg / 30)]}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-2 text-[10px] text-white/40">
                  {composite.aspects.length} aspects · {composite.shadowNetwork.length} shadow ·{" "}
                  {composite.boundaryNetwork.length} boundary
                </div>
                <Rigorous>
                  <div className="mt-2 text-[10px] font-mono text-violet-300/80">
                    composite λ = ½(λ_A + λ_B) along the shorter arc. Pure integer midpoint on the
                    1,296,000″ ring.
                  </div>
                </Rigorous>
              </div>

              <div className="rounded border p-4" style={{ borderColor: "#5dd6c430" }}>
                <h3 className="font-serif text-lg mb-2" style={{ color: "#5dd6c4" }}>
                  Davison relationship (mid-time)
                </h3>
                <div className="text-xs font-mono space-y-1">
                  {davison.ephemeris.planets.slice(0, 10).map((p) => {
                    const deg = Number(p.longitudeArcsec) / 3600;
                    return (
                      <div key={p.name} className="flex gap-3">
                        <span className="text-white/55 w-20">{p.name}</span>
                        <span className="text-white/85">
                          {formatPosition(p.longitudeArcsec)} {SIGNS[Math.floor(deg / 30)]}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-2 text-[10px] text-white/40">
                  Mid-JD: {davison.jd.toFixed(2)} · {davison.aspects.length} aspects
                </div>
                <Rigorous>
                  <div className="mt-2 text-[10px] font-mono text-violet-300/80">
                    Davison = actual ephemeris at (jd_A + jd_B) / 2. A live transit chart at the
                    temporal midpoint.
                  </div>
                </Rigorous>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded border bg-black/30 px-3 py-2" style={{ borderColor: `${color}44` }}>
      <div className="text-[10px] uppercase tracking-widest text-white/40">{label}</div>
      <div className="text-2xl font-mono" style={{ color }}>
        {value}
      </div>
    </div>
  );
}
