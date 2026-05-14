// Time-Lord panel — annual profection (Lord of the Year + house activated)
// and Zodiacal Releasing L1 (released from Spirit and from Fortune).
//
// Each row is the Hellenistic answer to "what's running right now?".

import { useState } from "react";
import type { FullChart } from "@/lib/qmnf/chart";
import { profectionAt, monthlyProfections } from "@/lib/qmnf/profections";
import { currentL1 } from "@/lib/qmnf/zr";
import { Rigorous } from "./Rigorous";

const cardClass =
  "rounded-lg border border-white/10 bg-white/[0.02] backdrop-blur-sm p-4 space-y-3";
const labelClass = "text-[10px] uppercase tracking-widest text-white/45 font-mono";
const valClass = "font-mono text-white/85";

export function TimeLordPanel({ chart }: { chart: FullChart }) {
  const [age, setAge] = useState(30);
  const prof = profectionAt(chart.ascSignIndex, age);
  const monthly = monthlyProfections(chart.ascSignIndex, age);
  const zrSp = currentL1(chart.zrFromSpirit, age);
  const zrFo = currentL1(chart.zrFromFortune, age);

  return (
    <div className="space-y-4">
      <header className="flex items-baseline justify-between">
        <h2 className="font-serif text-xl text-white/80">Time-Lord Substrate</h2>
        <div className="flex items-center gap-2 text-xs font-mono">
          <label className="text-white/45">Age</label>
          <input
            type="number"
            min={0}
            max={90}
            value={age}
            onChange={(e) => setAge(Number(e.target.value))}
            className="w-16 rounded border bg-black/30 px-2 py-1 text-white/85"
            style={{ borderColor: "#9d7bff40" }}
          />
        </div>
      </header>

      <div className="grid md:grid-cols-3 gap-3">
        {/* Annual profection */}
        <div className={cardClass}>
          <div className={labelClass}>Annual Profection</div>
          <div className="flex items-baseline justify-between">
            <span className={labelClass}>Profected house</span>
            <span className={valClass}>H{prof.houseNumber}</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className={labelClass}>Sign</span>
            <span className={valClass}>{prof.signName}</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className={labelClass}>Lord of Year</span>
            <span className={valClass + " text-amber-200"}>{prof.lordOfYear}</span>
          </div>
          <Rigorous>
            <div className="text-[10px] font-mono text-violet-300/80 pt-2 border-t border-white/5">
              house = (age mod 12) + 1; profected sign = ASC + age mod 12. Pure 12-cycle modular
              walk.
            </div>
          </Rigorous>
        </div>

        {/* ZR from Spirit */}
        <div className={cardClass}>
          <div className={labelClass}>ZR — Spirit (action/career)</div>
          {zrSp ? (
            <>
              <div className="flex items-baseline justify-between">
                <span className={labelClass}>Period</span>
                <span className={valClass}>{zrSp.signName}</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className={labelClass}>Years</span>
                <span className={valClass}>
                  {zrSp.startAge.toFixed(0)}–{zrSp.endAge.toFixed(0)}
                </span>
              </div>
              {zrSp.loosingOfTheBond && (
                <div className="text-rose-300 text-xs font-mono">
                  ⚠ Loosing of the Bond — major destiny pivot
                </div>
              )}
            </>
          ) : (
            <div className="text-xs text-white/40">no active period</div>
          )}
          <Rigorous>
            <div className="text-[10px] font-mono text-violet-300/80 pt-2 border-t border-white/5">
              Released from Lot of Spirit's sign. Periods per Valens minor:
              {` {15,8,20,25,19,20,8,15,12,27,27,12}`}.
            </div>
          </Rigorous>
        </div>

        {/* ZR from Fortune */}
        <div className={cardClass}>
          <div className={labelClass}>ZR — Fortune (body/circumstance)</div>
          {zrFo ? (
            <>
              <div className="flex items-baseline justify-between">
                <span className={labelClass}>Period</span>
                <span className={valClass}>{zrFo.signName}</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className={labelClass}>Years</span>
                <span className={valClass}>
                  {zrFo.startAge.toFixed(0)}–{zrFo.endAge.toFixed(0)}
                </span>
              </div>
              {zrFo.loosingOfTheBond && (
                <div className="text-rose-300 text-xs font-mono">
                  ⚠ Loosing of the Bond — body/circumstance reversal
                </div>
              )}
            </>
          ) : (
            <div className="text-xs text-white/40">no active period</div>
          )}
        </div>
      </div>

      {/* Monthly profections */}
      <div className={cardClass}>
        <div className={labelClass}>Monthly profections (within annual {prof.signName})</div>
        <div className="grid grid-cols-6 gap-1 text-xs font-mono">
          {monthly.map((m) => (
            <div key={m.monthIndex} className="rounded bg-black/20 px-2 py-1 text-center">
              <div className="text-white/45 text-[10px]">m{m.monthIndex + 1}</div>
              <div className="text-white/85">{m.signName.slice(0, 3)}</div>
              <div className="text-amber-200 text-[10px]">{m.lord.slice(0, 3)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Extras: True Node + GC + Vertex */}
      <div className={cardClass}>
        <div className={labelClass}>Extra sensitive points</div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-white/40 text-xs">
              <th className="py-1 pr-3">Point</th>
              <th className="py-1 pr-3">Longitude</th>
              <th className="py-1 pr-3">r₁₁</th>
              <th className="py-1 pr-3">r₁₃</th>
            </tr>
          </thead>
          <tbody>
            {chart.extras.map((e) => {
              const deg = e.longitudeDeg;
              const sign = [
                "Ari",
                "Tau",
                "Gem",
                "Can",
                "Leo",
                "Vir",
                "Lib",
                "Sco",
                "Sag",
                "Cap",
                "Aqu",
                "Pis",
              ][Math.floor(deg / 30)];
              return (
                <tr key={e.name} className="border-t border-white/5">
                  <td className="py-1 pr-3 font-mono">{e.name}</td>
                  <td className="py-1 pr-3 font-mono">
                    {(deg % 30).toFixed(2)}° {sign}
                  </td>
                  <td className="py-1 pr-3 font-mono text-violet-300">{e.address.r11}</td>
                  <td className="py-1 pr-3 font-mono text-amber-300">{e.address.r13}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <Rigorous>
          <div className="text-[10px] font-mono text-violet-300/80 pt-2 border-t border-white/5">
            Galactic Center ≈ 27° Sagittarius (J2000), drifts 50.29″/yr. Vertex = western
            intersection of the prime vertical with the ecliptic — uses co-latitude (90° − φ) in the
            same atan2 form as the Ascendant. Each carries r₁₁ and joins the shadow network.
          </div>
        </Rigorous>
      </div>
    </div>
  );
}
