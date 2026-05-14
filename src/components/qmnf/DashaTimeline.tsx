import type { FullChart } from "@/lib/qmnf/chart";
import { dashaTimeline, currentDasha } from "@/lib/qmnf/vedic";
import { useMemo } from "react";
import { Rigorous } from "./Rigorous";

const COLOR: Record<string, string> = {
  Ketu: "#7a6f5d",
  Venus: "#e3b4ff",
  Sun: "#ffd56b",
  Moon: "#cfd6ff",
  Mars: "#ff8888",
  Rahu: "#7a6f5d",
  Jupiter: "#ffe39a",
  Saturn: "#9aa0c0",
  Mercury: "#a8e6cf",
};

export function DashaTimeline({ chart, years = 90 }: { chart: FullChart; years?: number }) {
  const moon = chart.vedic.planets.find((p) => p.name === "Moon");
  const tl = useMemo(() => (moon ? dashaTimeline(moon.siderealArcsec, years) : []), [moon, years]);
  const now = useMemo(() => {
    if (!moon) return null;
    return currentDasha(
      moon.siderealArcsec,
      chart.jd,
      chart.jd + (new Date().getTime() / 1000 / 86400 + 2440587.5 - chart.jd),
    );
  }, [moon, chart.jd]);

  if (!moon) return null;

  return (
    <div
      className="rounded border p-4 backdrop-blur"
      style={{
        borderColor: "#ffd56b30",
        background: "linear-gradient(135deg,#1a1f3a40,#ffd56b06)",
      }}
    >
      <h3 className="font-serif text-lg mb-2" style={{ color: "#ffd56b" }}>
        Vimsottari Dasha Timeline
      </h3>
      {now && (
        <div className="mb-3 text-xs font-mono text-white/70">
          Today: <span style={{ color: COLOR[now.mahadasha] }}>{now.mahadasha}</span> mahadasha (age{" "}
          {now.ageYears.toFixed(1)}),{" "}
          <span style={{ color: COLOR[now.antardasha] }}>{now.antardasha}</span> antardasha
        </div>
      )}
      <div className="flex flex-col gap-px overflow-hidden rounded text-[10px] font-mono">
        {tl.map((p, i) => (
          <div
            key={i}
            className="flex items-center gap-2 px-2 py-1 text-white/80"
            style={{ background: `${COLOR[p.planet] || "#888"}22` }}
          >
            <span className="w-16 truncate" style={{ color: COLOR[p.planet] || "white" }}>
              {p.planet}
            </span>
            <span className="text-white/50">
              {p.startAge.toFixed(1)} – {p.endAge.toFixed(1)} yr
            </span>
            <span className="ml-auto text-white/40">{p.years.toFixed(1)} y</span>
          </div>
        ))}
      </div>
      <Rigorous>
        <div className="mt-3 text-[10px]">
          Balance year = (1 − fractionElapsedInNakshatra) × firstDashaYears.
          <br />
          Sub-period length = mahaYears × subYears / 120 (integer at mille precision).
        </div>
      </Rigorous>
    </div>
  );
}
