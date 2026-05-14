// Traditional astrology panel — dignities, lots, lilith, lunar phase,
// void-of-course, chart shape, sect. Each item resolves an ambiguity the
// substrate makes precise: dignity scoring quantifies sign placement,
// lots and lilith give integer arcsec formulas, phase + VoC are derived
// from the (Moon − Sun) modular arc, and shape is a residue-distribution
// classification of the planetary cloud.

import type { FullChart } from "@/lib/qmnf/chart";
import { Rigorous } from "./Rigorous";
import { formatPosition } from "@/lib/qmnf/format";
import { ZODIAC_SIGNS } from "@/lib/qmnf/constants";

const cardClass =
  "rounded-lg border border-white/10 bg-white/[0.02] backdrop-blur-sm p-4 space-y-3";
const labelClass = "text-[10px] uppercase tracking-widest text-white/45 font-mono";
const valClass = "font-mono text-white/85";

function signFromArcsec(arcsec: bigint): string {
  return ZODIAC_SIGNS[Number(arcsec / 108_000n)].name;
}

function dignityColor(kind: string): string {
  switch (kind) {
    case "domicile":
      return "text-emerald-400";
    case "exaltation":
      return "text-amber-300";
    case "detriment":
      return "text-rose-400";
    case "fall":
      return "text-rose-300";
    default:
      return "text-white/45";
  }
}

export function TraditionalPanel({ chart }: { chart: FullChart }) {
  const t = {
    dignities: chart.dignities,
    lots: chart.lots,
    lilith: chart.lilith,
    phase: chart.lunarPhase,
    voc: chart.voidOfCourse,
    shape: chart.shape,
    sect: chart.isDayChart ? "Day" : "Night",
  };
  const nonNeutralDignities = t.dignities.filter((d) => d.kind !== "neutral");

  return (
    <div className="space-y-4">
      <header className="flex items-baseline justify-between">
        <h2 className="font-serif text-xl text-white/80">Traditional Substrate</h2>
        <span className="text-[10px] uppercase tracking-widest text-white/40 font-mono">
          dignities · lots · phase · shape · sect
        </span>
      </header>

      <div className="grid md:grid-cols-2 gap-3">
        {/* Sect + Phase */}
        <div className={cardClass}>
          <div className="flex items-center justify-between">
            <span className={labelClass}>Sect</span>
            <span className={valClass}>{t.sect}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className={labelClass}>Lunar phase</span>
            <span className={valClass}>{t.phase.phase}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className={labelClass}>Illumination</span>
            <span className={valClass}>{(t.phase.illumination * 100).toFixed(0)}%</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className={labelClass}>Direction</span>
            <span className={valClass}>{t.phase.waxing ? "Waxing →" : "← Waning"}</span>
          </div>
          <Rigorous>
            <div className="text-[10px] font-mono text-violet-300/80 pt-2 border-t border-white/5">
              Δ = Moon − Sun ≡ {t.phase.elongationDeg.toFixed(2)}° (mod 360°)
            </div>
          </Rigorous>
        </div>

        {/* Void of Course */}
        <div className={cardClass}>
          <div className="flex items-center justify-between">
            <span className={labelClass}>Moon void of course?</span>
            <span className={valClass + (t.voc.voc ? " text-amber-300" : "")}>
              {t.voc.voc ? "Yes" : "No"}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className={labelClass}>Next sign change</span>
            <span className={valClass}>{t.voc.nextSignChangeDays.toFixed(2)} days</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className={labelClass}>Next Moon aspect</span>
            <span className={valClass}>
              {t.voc.nextAspectDays !== null
                ? `${t.voc.nextAspectDays.toFixed(2)} days`
                : "none in window"}
            </span>
          </div>
          <Rigorous>
            <div className="text-[10px] font-mono text-violet-300/80 pt-2 border-t border-white/5">
              VoC ⇔ next-aspect &gt; next-sign-change. Pure modular comparison on (Moon − planet)
              residues.
            </div>
          </Rigorous>
        </div>

        {/* Lilith */}
        <div className={cardClass}>
          <div className="flex items-center justify-between">
            <span className={labelClass}>Black Moon Lilith</span>
            <span className={valClass}>{formatPosition(chart.lilith.longitudeArcsec)}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className={labelClass}>House</span>
            <span className={valClass}>H{chart.lilith.house}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className={labelClass}>Sign</span>
            <span className={valClass}>{signFromArcsec(chart.lilith.longitudeArcsec)}</span>
          </div>
          <Rigorous>
            <div className="text-[10px] font-mono text-violet-300/80 pt-2 border-t border-white/5">
              Mean apogee: λ(jd) = 83.3532° + 0.111404° × (jd − J2000). 8.85-yr cycle ⇒ resonance
              with Saturn's 2nd-order shadow at age 17.7y.
            </div>
          </Rigorous>
        </div>

        {/* Chart Shape */}
        <div className={cardClass}>
          <div className="flex items-center justify-between">
            <span className={labelClass}>Chart shape</span>
            <span className={valClass}>{t.shape.shape}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className={labelClass}>Largest gap</span>
            <span className={valClass}>{t.shape.largestGapDeg.toFixed(1)}°</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className={labelClass}>Occupied arc</span>
            <span className={valClass}>{t.shape.occupiedArcDeg.toFixed(1)}°</span>
          </div>
          {t.shape.handle && (
            <div className="flex items-center justify-between text-xs">
              <span className={labelClass}>Bucket handle</span>
              <span className={valClass}>{t.shape.handle}</span>
            </div>
          )}
          {t.shape.leadingPlanet && (
            <div className="flex items-center justify-between text-xs">
              <span className={labelClass}>Leading planet</span>
              <span className={valClass}>{t.shape.leadingPlanet}</span>
            </div>
          )}
          <Rigorous>
            <div className="text-[10px] font-mono text-violet-300/80 pt-2 border-t border-white/5">
              Jones gestalt — the residue-distribution of 10 visible bodies on the 1,296,000″ ring.
              Splash = uniform; Splay = clustered.
            </div>
          </Rigorous>
        </div>
      </div>

      {/* Dignities table */}
      <div className={cardClass}>
        <h3 className={labelClass}>Essential dignities</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-white/40 text-xs">
                <th className="py-1 pr-3">Planet</th>
                <th className="py-1 pr-3">Sign</th>
                <th className="py-1 pr-3">Dignity</th>
                <th className="py-1 pr-3 text-right">Score</th>
              </tr>
            </thead>
            <tbody>
              {nonNeutralDignities.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-2 text-white/40 text-xs">
                    All bodies in neutral signs.
                  </td>
                </tr>
              )}
              {nonNeutralDignities.map((d) => (
                <tr key={d.planet} className="border-t border-white/5">
                  <td className="py-1 pr-3 font-mono">{d.planet}</td>
                  <td className="py-1 pr-3">{d.sign}</td>
                  <td className={"py-1 pr-3 " + dignityColor(d.kind)}>{d.kind}</td>
                  <td className="py-1 pr-3 text-right font-mono">
                    {d.score > 0 ? "+" : ""}
                    {d.score}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lots / Arabic Parts */}
      <div className={cardClass}>
        <h3 className={labelClass}>Hellenistic Lots</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-white/40 text-xs">
                <th className="py-1 pr-3">Lot</th>
                <th className="py-1 pr-3">Position</th>
                <th className="py-1 pr-3">Formula</th>
              </tr>
            </thead>
            <tbody>
              {chart.lots.map((l) => (
                <tr key={l.name} className="border-t border-white/5">
                  <td className="py-1 pr-3 font-mono">{l.name}</td>
                  <td className="py-1 pr-3 font-mono">{formatPosition(l.longitudeArcsec)}</td>
                  <td className="py-1 pr-3 text-xs text-white/55">{l.formula}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Rigorous>
          <div className="text-[10px] font-mono text-violet-300/80 pt-2 border-t border-white/5">
            Every lot is integer-arcsec arithmetic on the 1,296,000″ ring; sect inverts the Sun ↔
            Moon roles. The carry residue (mod 7, 11, 13) of each lot is the same residue derivation
            as any planet — they are first-class CRT objects, not auxiliary points.
          </div>
        </Rigorous>
      </div>
    </div>
  );
}
