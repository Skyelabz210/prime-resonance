import type { FullChart } from "@/lib/qmnf/chart";
import { ZODIAC_SIGNS, PLANET_GLYPHS } from "@/lib/qmnf/constants";

const SIZE = 560;
const CENTER = SIZE / 2;
const R_OUTER = 260;
const R_SIGN = 230;
const R_HOUSE = 195;
const R_PLANET = 165;
const R_INNER = 110;

// 0° Aries at left (9 o'clock) — convert ecliptic deg to SVG angle
function angleToXY(deg: number, r: number) {
  const a = ((180 - deg) * Math.PI) / 180;
  return { x: CENTER + r * Math.cos(a), y: CENTER - r * Math.sin(a) };
}

const ASPECT_COLOR: Record<string, string> = {
  cardinal: "#e6e8ff",
  classical: "#5dd6c4",
  minor: "#ffd56b",
  quintile: "#ff7bd6",
  septile: "#ff9b5d",
  undecile: "#9d7bff", // Shadow violet
  tredecile: "#ffb347", // Boundary amber
};

export function ChartWheel({ chart }: { chart: FullChart }) {
  // Working in tropical degrees directly, no rotation — easier visualization.
  // 0° Aries sits at 9 o'clock; angle markers label the four chart angles.
  return (
    <div className="rounded-lg border border-white/10 bg-black/30 p-4 backdrop-blur">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full h-auto">
        <defs>
          <radialGradient id="bg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1a1f3a" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#050810" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx={CENTER} cy={CENTER} r={R_OUTER} fill="url(#bg)" />
        <circle cx={CENTER} cy={CENTER} r={R_OUTER} fill="none" stroke="#9d7bff33" />
        <circle cx={CENTER} cy={CENTER} r={R_SIGN} fill="none" stroke="#ffffff10" />
        <circle cx={CENTER} cy={CENTER} r={R_HOUSE} fill="none" stroke="#ffffff10" />
        <circle cx={CENTER} cy={CENTER} r={R_INNER} fill="none" stroke="#ffffff15" />

        {/* Sign divisions */}
        {ZODIAC_SIGNS.map((s, i) => {
          const a1 = angleToXY(i * 30, R_OUTER);
          const a2 = angleToXY(i * 30, R_HOUSE);
          const mid = angleToXY(i * 30 + 15, (R_OUTER + R_SIGN) / 2);
          return (
            <g key={s.name}>
              <line x1={a1.x} y1={a1.y} x2={a2.x} y2={a2.y} stroke="#ffffff20" />
              <text
                x={mid.x}
                y={mid.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#e6e8ff"
                fontSize="18"
                fontFamily="serif"
              >
                {s.glyph}
              </text>
            </g>
          );
        })}

        {/* House cusps */}
        {chart.houses.cuspsArcsec.map((arcsec, i) => {
          const deg = Number(arcsec) / 3600;
          const p1 = angleToXY(deg, R_HOUSE);
          const p2 = angleToXY(deg, R_INNER);
          const isAxis = i === 0 || i === 3 || i === 6 || i === 9;
          return (
            <g key={i}>
              <line
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                stroke={isAxis ? "#9d7bff" : "#ffffff20"}
                strokeWidth={isAxis ? 1.5 : 0.5}
              />
            </g>
          );
        })}

        {/* Aspect lines */}
        {chart.aspects.map((asp, i) => {
          const a = chart.ephemeris.planets.find((p) => p.name === asp.a)!;
          const b = chart.ephemeris.planets.find((p) => p.name === asp.b)!;
          const pa = angleToXY(Number(a.longitudeArcsec) / 3600, R_INNER);
          const pb = angleToXY(Number(b.longitudeArcsec) / 3600, R_INNER);
          return (
            <line
              key={i}
              x1={pa.x}
              y1={pa.y}
              x2={pb.x}
              y2={pb.y}
              stroke={ASPECT_COLOR[asp.aspect.family]}
              strokeOpacity={asp.aspect.shadowOnly ? 0.55 : 0.35}
              strokeWidth={asp.aspect.family === "cardinal" ? 1.4 : 0.8}
            />
          );
        })}

        {/* Shadow bonds (mod 11) — dashed violet from center */}
        {chart.invisibleShadowBonds.map((s, i) => {
          const a = chart.ephemeris.planets.find((p) => p.name === s.a)!;
          const b = chart.ephemeris.planets.find((p) => p.name === s.b)!;
          const pa = angleToXY(Number(a.longitudeArcsec) / 3600, R_INNER);
          const pb = angleToXY(Number(b.longitudeArcsec) / 3600, R_INNER);
          return (
            <line
              key={`sh${i}`}
              x1={pa.x}
              y1={pa.y}
              x2={pb.x}
              y2={pb.y}
              stroke="#9d7bff"
              strokeOpacity={0.7}
              strokeWidth={1}
              strokeDasharray="3 3"
            />
          );
        })}

        {/* Planets — spread glyphs that fall within 6° of each other onto
            slightly different radii so they don't overlap. */}
        {(() => {
          const bodies = chart.ephemeris.planets
            .map((p) => ({ p, deg: Number(p.longitudeArcsec) / 3600 }))
            .sort((a, b) => a.deg - b.deg);
          // Assign a radius tier to each body; bump the tier when the previous
          // glyph is within MIN_SEP degrees.
          const MIN_SEP = 6;
          const tiers: number[] = [];
          let lastDeg = -999;
          let tier = 0;
          for (const body of bodies) {
            if (body.deg - lastDeg < MIN_SEP) tier = (tier + 1) % 3;
            else tier = 0;
            tiers.push(tier);
            lastDeg = body.deg;
          }
          return bodies.map(({ p, deg }, i) => {
            const r = R_PLANET - tiers[i] * 24;
            const pos = angleToXY(deg, r);
            const tick1 = angleToXY(deg, R_HOUSE);
            const tick2 = angleToXY(deg, r + 11);
            return (
              <g key={p.name}>
                {/* tick from house ring to glyph so position stays legible */}
                <line
                  x1={tick1.x}
                  y1={tick1.y}
                  x2={tick2.x}
                  y2={tick2.y}
                  stroke="#ffffff20"
                  strokeWidth={0.5}
                />
                <circle cx={pos.x} cy={pos.y} r={11} fill="#0a0e1a" stroke="#9d7bff" />
                <text
                  x={pos.x}
                  y={pos.y + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#e6e8ff"
                  fontSize="13"
                >
                  {PLANET_GLYPHS[p.name] || p.name[0]}
                </text>
                {p.retrograde && (
                  <text x={pos.x + 12} y={pos.y - 8} fontSize="8" fill="#ff7bd6">
                    ℞
                  </text>
                )}
              </g>
            );
          });
        })()}

        {/* Angle labels — ASC / IC / DSC / MC at the four cardinal cusps. */}
        {(
          [
            [0, "ASC"],
            [3, "IC"],
            [6, "DSC"],
            [9, "MC"],
          ] as const
        ).map(([cuspIdx, label]) => {
          const deg = Number(chart.houses.cuspsArcsec[cuspIdx]) / 3600;
          const p = angleToXY(deg, R_OUTER + 12);
          return (
            <text
              key={label}
              x={p.x}
              y={p.y}
              fontSize="10"
              fill="#9d7bff"
              textAnchor="middle"
              dominantBaseline="middle"
              fontFamily="monospace"
            >
              {label}
            </text>
          );
        })}
      </svg>
      <div className="mt-3 flex flex-wrap gap-3 text-[10px] font-mono uppercase tracking-widest text-white/50">
        <span>
          <span className="inline-block w-3 h-px bg-[#5dd6c4] mr-1 align-middle" />
          Classical
        </span>
        <span>
          <span className="inline-block w-3 h-px bg-[#9d7bff] mr-1 align-middle" />
          Shadow 11
        </span>
        <span>
          <span className="inline-block w-3 h-px bg-[#ffb347] mr-1 align-middle" />
          Boundary 13
        </span>
        <span>
          <span className="inline-block w-3 h-px bg-[#ff7bd6] mr-1 align-middle" />
          Quintile
        </span>
      </div>
    </div>
  );
}
