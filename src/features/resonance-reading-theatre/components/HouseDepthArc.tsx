import type { HouseContext } from "../types/resonanceTypes";

export function HouseDepthArc({
  house,
  highlight,
}: {
  house: HouseContext;
  highlight: Set<string>;
}) {
  const cx = 140,
    cy = 140,
    r = 110;
  // depth fills along the arc
  const fillFraction = highlight.has("arc:depth") ? house.depthPercent / 100 : house.depthPercent / 100;
  const startA = -90 * (Math.PI / 180);
  const endA = (-90 + 360 * (house.houseSpanDeg / 360)) * (Math.PI / 180);
  // We'll draw a 270° arc representing the house span and fill the depth fraction.
  const span = 270 * (Math.PI / 180);
  const arcStart = -135 * (Math.PI / 180);
  const arcEnd = arcStart + span;
  const fillEnd = arcStart + span * fillFraction;
  const arcPath = (a0: number, a1: number) => {
    const x0 = cx + r * Math.cos(a0);
    const y0 = cy + r * Math.sin(a0);
    const x1 = cx + r * Math.cos(a1);
    const y1 = cy + r * Math.sin(a1);
    const large = a1 - a0 > Math.PI ? 1 : 0;
    return `M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1}`;
  };
  void startA;
  void endA;
  return (
    <svg viewBox="0 0 280 280" className="w-full max-w-[300px] mx-auto">
      <path d={arcPath(arcStart, arcEnd)} fill="none" stroke="#ffffff15" strokeWidth={12} />
      <path
        d={arcPath(arcStart, Math.max(fillEnd, arcStart + 0.001))}
        fill="none"
        stroke="#9d7bff"
        strokeWidth={12}
        strokeLinecap="round"
      />
      <text x={cx} y={cy - 8} textAnchor="middle" fill="#e6e8ff" fontSize={20} fontFamily="serif">
        H{house.houseNumber}
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle" fill="#9d7bff" fontSize={14} fontFamily="monospace">
        {house.depthPercent.toFixed(1)}%
      </text>
      <text x={cx} y={cy + 32} textAnchor="middle" fill="#ffffff70" fontSize={10} fontFamily="monospace">
        {house.phaseState}
      </text>
    </svg>
  );
}
