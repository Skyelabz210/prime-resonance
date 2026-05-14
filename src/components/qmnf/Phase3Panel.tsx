// Phase 3 panel — asteroids, midpoints, Firdaria time-lord, declinations.
// Each section has a Rigorous slot exposing the integer / Dresden
// derivation that defines the technique in this framework.

import { useState } from "react";
import type { FullChart } from "@/lib/qmnf/chart";
import { currentFirdar } from "@/lib/qmnf/firdaria";
import { formatPosition } from "@/lib/qmnf/format";
import { ZODIAC_SIGNS } from "@/lib/qmnf/constants";
import { Rigorous } from "./Rigorous";

const cardClass =
  "rounded-lg border border-white/10 bg-white/[0.02] backdrop-blur-sm p-4 space-y-3";
const labelClass = "text-[10px] uppercase tracking-widest text-white/45 font-mono";

function signFromArcsec(arcsec: bigint): string {
  return ZODIAC_SIGNS[Number(arcsec / 108_000n)].name;
}

export function Phase3Panel({ chart }: { chart: FullChart }) {
  const [age, setAge] = useState(30);
  const fd = currentFirdar(chart.firdaria, age);

  return (
    <div className="space-y-4">
      <header className="flex items-baseline justify-between">
        <h2 className="font-serif text-xl text-white/80">
          Asteroids · Midpoints · Firdaria · Declinations
        </h2>
        <span className="text-[10px] uppercase tracking-widest text-white/40 font-mono">
          phase 3 substrate
        </span>
      </header>

      <div className="grid lg:grid-cols-2 gap-3">
        {/* Asteroids */}
        <div className={cardClass}>
          <h3 className={labelClass}>The feminine four (Ceres / Pallas / Juno / Vesta)</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-white/40 text-xs">
                <th className="py-1 pr-3">Body</th>
                <th className="py-1 pr-3">Position</th>
                <th className="py-1 pr-3 text-xs">Meaning</th>
              </tr>
            </thead>
            <tbody>
              {chart.asteroids.map((a) => (
                <tr key={a.name} className="border-t border-white/5">
                  <td className="py-1 pr-3 font-mono">
                    {a.name} {a.retrograde && <span className="text-rose-300">℞</span>}
                  </td>
                  <td className="py-1 pr-3 font-mono text-white/85">
                    {formatPosition(a.longitudeArcsec)}{" "}
                    <span className="text-white/45">
                      {signFromArcsec(a.longitudeArcsec).slice(0, 3)}
                    </span>
                  </td>
                  <td className="py-1 pr-3 text-xs text-white/65">{a.meaning}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Rigorous>
            <div className="text-[10px] font-mono text-violet-300/80 pt-2 border-t border-white/5">
              Kepler orbits with JPL Small-Body Database J2000 elements. Each asteroid is folded
              into the planet list early — so its r₁₁ and r₁₃ participate in shadow and boundary
              networks like any planet.
            </div>
          </Rigorous>
        </div>

        {/* Firdaria */}
        <div className={cardClass}>
          <h3 className={labelClass}>Firdaria — Persian time-lord (75-yr cycle)</h3>
          <div className="flex items-center gap-2 text-xs font-mono mb-2">
            <span className="text-white/45">Age</span>
            <input
              type="text"
              inputMode="numeric"
              value={age}
              onFocus={(e) => e.currentTarget.select()}
              onChange={(e) => setAge(parseInt(e.target.value, 10) || 0)}
              className="w-16 rounded border bg-black/30 px-2 py-1 text-white/85"
              style={{ borderColor: "#9d7bff40" }}
            />
          </div>
          {fd ? (
            <div className="text-sm font-mono space-y-1">
              <div>
                <span className="text-white/45">Major:</span>{" "}
                <span className="text-amber-200">{fd.major.lord}</span>{" "}
                <span className="text-white/45 text-xs">
                  ({fd.major.startAge}–{fd.major.endAge})
                </span>
              </div>
              <div>
                <span className="text-white/45">Sub:</span>{" "}
                <span className="text-cyan-300">{fd.sub.lord}</span>{" "}
                <span className="text-white/45 text-xs">
                  ({fd.sub.startAge.toFixed(2)}–{fd.sub.endAge.toFixed(2)})
                </span>
              </div>
            </div>
          ) : (
            <div className="text-xs text-white/40">out of cycle range</div>
          )}
          <div className="mt-2 grid grid-cols-7 gap-1 text-[10px] font-mono">
            {chart.firdaria.map((f) => (
              <div
                key={f.lord}
                className="rounded bg-black/20 px-1 py-1 text-center"
                title={`${f.startAge}–${f.endAge}`}
              >
                <div className="text-white/85">{f.lord.slice(0, 3)}</div>
                <div className="text-white/45">{f.years}y</div>
              </div>
            ))}
          </div>
          <Rigorous>
            <div className="text-[10px] font-mono text-violet-300/80 pt-2 border-t border-white/5">
              Day sequence: Sun 10, Venus 8, Mercury 13, Moon 9, Saturn 11, Jupiter 12, Mars 7.
              Night sequence permutes by sect. Each major period subdivides into 7 equal sub-Firdars
              cycling through the same lords.
            </div>
          </Rigorous>
        </div>
      </div>

      {/* Midpoints */}
      <div className={cardClass}>
        <h3 className={labelClass}>Midpoint triggers (Ebertin direct + indirect, orb ≤ 1.5°)</h3>
        {chart.midpoints.length === 0 ? (
          <div className="text-xs text-white/40">none within orb</div>
        ) : (
          <div className="max-h-60 overflow-y-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-white/40 text-xs">
                  <th className="py-1 pr-3">Pair (midpoint)</th>
                  <th className="py-1 pr-3">Activator</th>
                  <th className="py-1 pr-3 text-right">Orb</th>
                  <th className="py-1 pr-3 text-xs">r₁₁ · r₁₃ at midpoint</th>
                </tr>
              </thead>
              <tbody>
                {chart.midpoints.slice(0, 20).map((m, i) => (
                  <tr key={i} className="border-t border-white/5">
                    <td className="py-1 pr-3 font-mono">{m.pair}</td>
                    <td className="py-1 pr-3 font-mono text-amber-200">{m.activator}</td>
                    <td className="py-1 pr-3 text-right font-mono text-xs">
                      {(Number(m.orbArcsec) / 3600).toFixed(2)}°
                    </td>
                    <td className="py-1 pr-3 font-mono text-xs">
                      <span className="text-violet-300">{m.address.r11}</span>
                      {" · "}
                      <span className="text-amber-300">{m.address.r13}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Rigorous>
          <div className="text-[10px] font-mono text-violet-300/80 pt-2 border-t border-white/5">
            M(λ_a, λ_b) = (λ_a + λ_b) / 2 mod 360° — integer arithmetic on the 1,296,000″ ring. The
            midpoint's r₁₁ is the address where the *pair* lives as a single shadow object; an
            activator's r₁₁ matching it inserts the activator into the bond between the two parents.
          </div>
        </Rigorous>
      </div>

      {/* Declinations */}
      <div className={cardClass}>
        <h3 className={labelClass}>Declinations + parallel contacts</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-white/40 font-mono mb-1">
              By body
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-white/40 text-xs">
                  <th className="py-1 pr-3">Body</th>
                  <th className="py-1 pr-3 text-right">δ</th>
                </tr>
              </thead>
              <tbody>
                {chart.declinations.map((d) => (
                  <tr key={d.name} className="border-t border-white/5">
                    <td className="py-1 pr-3 font-mono">{d.name}</td>
                    <td
                      className={
                        "py-1 pr-3 text-right font-mono text-xs " +
                        (d.outOfBounds ? "text-rose-300" : "text-white/85")
                      }
                    >
                      {d.declinationDeg > 0 ? "+" : ""}
                      {d.declinationDeg.toFixed(2)}°{d.outOfBounds && " ⚠ OOB"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-white/40 font-mono mb-1">
              Parallels (within 1°)
            </div>
            {chart.declinationContacts.length === 0 ? (
              <div className="text-xs text-white/40">none</div>
            ) : (
              <table className="w-full text-sm">
                <tbody>
                  {chart.declinationContacts.map((c, i) => (
                    <tr key={i} className="border-t border-white/5">
                      <td className="py-1 pr-3 font-mono">
                        {c.a} ‖ {c.b}
                      </td>
                      <td className="py-1 pr-3 text-xs">{c.kind}</td>
                      <td className="py-1 pr-3 text-right font-mono text-xs text-white/55">
                        {c.orbDeg.toFixed(2)}°
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
        <Rigorous>
          <div className="text-[10px] font-mono text-violet-300/80 pt-2 border-t border-white/5">
            sin(δ) = sin(β) cos(ε) + cos(β) sin(ε) sin(λ). Out-of-bounds when |δ| &gt; ε (≈ 23.43°).
            A parallel ties two bodies along the celestial equator independently of zodiacal
            longitude — a hidden classical aspect.
          </div>
        </Rigorous>
      </div>
    </div>
  );
}
