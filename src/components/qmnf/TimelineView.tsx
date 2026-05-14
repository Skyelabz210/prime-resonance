import { useMemo, useState } from "react";
import type { FullChart } from "@/lib/qmnf/chart";
import { fullTimeline, type EventHit } from "@/lib/qmnf/events";
import { findStations, type Station } from "@/lib/qmnf/stations";
import { solarReturnJD } from "@/lib/qmnf/returns";
import { Rigorous } from "./Rigorous";

function jdToDateStr(jd: number): string {
  // Standard JD → Date conversion
  const d = new Date((jd - 2440587.5) * 86400 * 1000);
  return d.toISOString().slice(0, 10);
}

const KIND_COLOR: Record<EventHit["kind"], string> = {
  aspect: "#cfd6ff",
  shadow_activation: "#9d7bff",
  boundary_activation: "#ffb347",
  return: "#5dd6c4",
  saturn_return: "#ff9aa2",
  tzolkin_return: "#ffd56b",
  calendar_round: "#e6a5ff",
  eclipse_shadow: "#9d7bff",
};

const KIND_LABEL: Record<EventHit["kind"], string> = {
  aspect: "Aspect",
  shadow_activation: "Shadow",
  boundary_activation: "Boundary",
  return: "Return",
  saturn_return: "Saturn Return",
  tzolkin_return: "Tzolk'in",
  calendar_round: "Calendar Round",
  eclipse_shadow: "Eclipse",
};

export function TimelineView({ chart }: { chart: FullChart }) {
  const [years, setYears] = useState(60);
  const [filter, setFilter] = useState<"all" | "shadow" | "returns" | "codex" | "stations">("all");

  const events = useMemo(
    () =>
      fullTimeline(
        chart.ephemeris.planets.map((p) => ({ name: p.name, longitudeArcsec: p.longitudeArcsec })),
        chart.jd,
        years,
        0,
      ),
    [chart, years],
  );

  // Retrograde stations within the timeline window.
  const stations = useMemo<Station[]>(() => {
    if (filter !== "stations" && filter !== "all") return [];
    return findStations(chart.jd, chart.jd + years * 365.25);
  }, [chart, years, filter]);

  // Solar return JDs (one per year, for ~10 years out).
  const solarReturns = useMemo(() => {
    const natalSun = chart.ephemeris.planets.find((p) => p.name === "Sun");
    if (!natalSun) return [] as number[];
    const natalDeg = Number(natalSun.longitudeArcsec) / 3600;
    const out: number[] = [];
    const maxYears = Math.min(years, 10);
    for (let k = 1; k <= maxYears; k++) {
      out.push(solarReturnJD(natalDeg, chart.jd + k * 365.25));
    }
    return out;
  }, [chart, years]);

  const filtered = events
    .filter((e) => {
      if (filter === "all") return true;
      if (filter === "shadow")
        return (
          e.kind === "shadow_activation" ||
          e.kind === "saturn_return" ||
          e.kind === "eclipse_shadow"
        );
      if (filter === "returns") return e.kind === "return" || e.kind === "saturn_return";
      if (filter === "codex")
        return (
          e.kind === "tzolkin_return" || e.kind === "calendar_round" || e.kind === "eclipse_shadow"
        );
      return true;
    })
    .slice(0, 200);

  return (
    <div
      className="rounded border p-4 backdrop-blur"
      style={{
        borderColor: "#9d7bff30",
        background: "linear-gradient(135deg,#1a1f3a40,#9d7bff08)",
      }}
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-serif text-xl" style={{ color: "#cfd6ff" }}>
          Life Timeline
        </h2>
        <div className="flex items-center gap-2 text-xs font-mono">
          <label className="text-white/50">Years</label>
          <input
            type="number"
            min={5}
            max={120}
            value={years}
            onChange={(e) => setYears(Number(e.target.value))}
            className="w-20 rounded border bg-black/30 px-2 py-1 text-white/85"
            style={{ borderColor: "#9d7bff40" }}
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="rounded border bg-black/30 px-2 py-1 text-white/85"
            style={{ borderColor: "#9d7bff40" }}
          >
            <option value="all">All</option>
            <option value="shadow">Shadow</option>
            <option value="returns">Returns</option>
            <option value="codex">Codex closures</option>
            <option value="stations">Retrograde stations</option>
          </select>
        </div>
      </div>

      <div className="max-h-[60vh] overflow-y-auto rounded bg-black/20 p-2">
        {filtered.map((e, i) => (
          <div
            key={i}
            className="flex items-center gap-3 px-2 py-1 text-xs font-mono border-b border-white/5"
          >
            <span className="w-24 text-white/50">{jdToDateStr(e.jd)}</span>
            <span className="w-14 text-white/40">age {e.age.toFixed(1)}</span>
            <span
              style={{ color: KIND_COLOR[e.kind] }}
              className="w-28 uppercase tracking-widest text-[10px]"
            >
              {KIND_LABEL[e.kind]}
            </span>
            <span className="flex-1 text-white/85">
              {e.planet} {e.natalPlanet ? `→ ${e.natalPlanet}` : ""}
              {e.aspect ? ` ${e.aspect}` : ""}
              {e.detail ? ` · ${e.detail}` : ""}
            </span>
          </div>
        ))}
        {!filtered.length && <div className="p-3 text-xs text-white/40">No events.</div>}
      </div>

      {(filter === "all" || filter === "stations") && stations.length > 0 && (
        <div className="mt-3">
          <h3 className="mb-1 text-[10px] uppercase tracking-widest font-mono text-white/45">
            Retrograde stations ({stations.length})
          </h3>
          <div className="max-h-32 overflow-y-auto rounded bg-black/20 p-2">
            {stations.slice(0, 40).map((s, i) => (
              <div
                key={i}
                className="flex gap-3 px-2 py-0.5 text-xs font-mono border-b border-white/5"
              >
                <span className="w-24 text-white/50">{jdToDateStr(s.jd)}</span>
                <span className="w-14 text-white/40">
                  age {((s.jd - chart.jd) / 365.25).toFixed(1)}
                </span>
                <span
                  className={s.kind === "retrograde" ? "text-rose-300" : "text-emerald-300"}
                  style={{ width: "5.5rem" }}
                >
                  {s.kind === "retrograde" ? "Retrograde" : "Direct"}
                </span>
                <span className="text-white/85">{s.planet} stations</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {solarReturns.length > 0 && (
        <div className="mt-3">
          <h3 className="mb-1 text-[10px] uppercase tracking-widest font-mono text-white/45">
            Solar Returns ({solarReturns.length})
          </h3>
          <div className="max-h-32 overflow-y-auto rounded bg-black/20 p-2">
            {solarReturns.map((jd, i) => (
              <div
                key={i}
                className="flex gap-3 px-2 py-0.5 text-xs font-mono border-b border-white/5"
              >
                <span className="w-24 text-white/50">{jdToDateStr(jd)}</span>
                <span className="w-14 text-white/40">
                  age {((jd - chart.jd) / 365.25).toFixed(1)}
                </span>
                <span className="text-amber-200" style={{ width: "5.5rem" }}>
                  Solar Return
                </span>
                <span className="text-white/85">Sun returns to natal longitude</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <Rigorous>
        <div className="mt-3 text-[10px] font-mono">
          Aspect events: linear congruence over mean motion. Stations: detected by sign-change of
          v(jd+1) − v(jd) in 5-day steps. Solar return: bisection on angular delta to natal Sun,
          root-finding to arcsec.
        </div>
      </Rigorous>
    </div>
  );
}
