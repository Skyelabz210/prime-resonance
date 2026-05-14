import type { AspectContext } from "../types/resonanceTypes";

export function AspectGeometryView({
  aspect,
  highlight,
}: {
  aspect: AspectContext;
  highlight: Set<string>;
}) {
  // Two body dots on a circle, separated by the actual angle.
  const r = 110;
  const cx = 140;
  const cy = 140;
  const angA = -90 * (Math.PI / 180);
  const angB = (-90 + aspect.angleActualDeg) * (Math.PI / 180);
  const ax = cx + r * Math.cos(angA);
  const ay = cy + r * Math.sin(angA);
  const bx = cx + r * Math.cos(angB);
  const by = cy + r * Math.sin(angB);
  const pulseAspect = highlight.has("value:orb") || highlight.has("value:target") || highlight.has("meter:strength");
  return (
    <svg viewBox="0 0 280 280" className="w-full max-w-[300px] mx-auto">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#ffffff20" strokeWidth={1} />
      <line
        x1={ax}
        y1={ay}
        x2={bx}
        y2={by}
        stroke={pulseAspect ? "#9d7bff" : "#9d7bff80"}
        strokeWidth={pulseAspect ? 2.5 : 1.4}
        strokeDasharray={aspect.applying ? "0" : "4 4"}
      />
      <circle
        cx={ax}
        cy={ay}
        r={highlight.has(`body:${aspect.bodyA}`) ? 11 : 7}
        fill="#e6e8ff"
      />
      <circle
        cx={bx}
        cy={by}
        r={highlight.has(`body:${aspect.bodyB}`) ? 11 : 7}
        fill="#e6e8ff"
      />
      <text x={ax} y={ay - 14} textAnchor="middle" fill="#9d7bff" fontSize={11} fontFamily="monospace">
        {aspect.bodyA}
      </text>
      <text x={bx} y={by + 22} textAnchor="middle" fill="#9d7bff" fontSize={11} fontFamily="monospace">
        {aspect.bodyB}
      </text>
      <text x={cx} y={cy - 4} textAnchor="middle" fill="#e6e8ff" fontSize={14} fontFamily="serif">
        {aspect.angleActualDeg.toFixed(2)}°
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle" fill="#ffffff70" fontSize={10} fontFamily="monospace">
        target {aspect.aspectTargetDeg}° · orb {aspect.orbDeg.toFixed(2)}°
      </text>
    </svg>
  );
}
