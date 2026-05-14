import { useState } from "react";
import type { BirthData } from "@/lib/qmnf/chart";

const DEFAULT: BirthData = {
  name: "Sample Native",
  year: 1990,
  month: 6,
  day: 15,
  hour: 14,
  minute: 30,
  tzOffsetHours: -5,
  latitude: 40.7128,
  longitude: -74.006,
  houseSystem: "WholeSign",
};

export function BirthForm({ onSubmit }: { onSubmit: (b: BirthData) => void }) {
  const [b, setB] = useState<BirthData>(DEFAULT);

  const upd = <K extends keyof BirthData>(k: K, v: BirthData[K]) =>
    setB((prev) => ({ ...prev, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(b);
  };

  const inputCls =
    "w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-sm font-mono text-white/90 focus:outline-none focus:border-[#9d7bff]";
  const labelCls = "block text-[10px] uppercase tracking-widest text-white/40 mb-1 font-mono";

  return (
    <form
      onSubmit={submit}
      className="rounded-lg border border-white/10 bg-black/20 p-5 backdrop-blur"
    >
      <h2 className="font-serif text-xl text-white/80 mb-4">Birth Moment</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="sm:col-span-2">
          <label className={labelCls}>Name</label>
          <input
            className={inputCls}
            value={b.name}
            onChange={(e) => upd("name", e.target.value)}
          />
        </div>
        <div>
          <label className={labelCls}>Year</label>
          <input
            type="number"
            className={inputCls}
            value={b.year}
            onChange={(e) => upd("year", +e.target.value)}
          />
        </div>
        <div>
          <label className={labelCls}>Month</label>
          <input
            type="number"
            min={1}
            max={12}
            className={inputCls}
            value={b.month}
            onChange={(e) => upd("month", +e.target.value)}
          />
        </div>
        <div>
          <label className={labelCls}>Day</label>
          <input
            type="number"
            min={1}
            max={31}
            className={inputCls}
            value={b.day}
            onChange={(e) => upd("day", +e.target.value)}
          />
        </div>
        <div>
          <label className={labelCls}>Hour (local)</label>
          <input
            type="number"
            min={0}
            max={23}
            className={inputCls}
            value={b.hour}
            onChange={(e) => upd("hour", +e.target.value)}
          />
        </div>
        <div>
          <label className={labelCls}>Minute</label>
          <input
            type="number"
            min={0}
            max={59}
            className={inputCls}
            value={b.minute}
            onChange={(e) => upd("minute", +e.target.value)}
          />
        </div>
        <div>
          <label className={labelCls}>UTC Offset</label>
          <input
            type="number"
            step="0.5"
            className={inputCls}
            value={b.tzOffsetHours}
            onChange={(e) => upd("tzOffsetHours", +e.target.value)}
          />
        </div>
        <div>
          <label className={labelCls}>Latitude</label>
          <input
            type="number"
            step="0.0001"
            className={inputCls}
            value={b.latitude}
            onChange={(e) => upd("latitude", +e.target.value)}
          />
        </div>
        <div>
          <label className={labelCls}>Longitude</label>
          <input
            type="number"
            step="0.0001"
            className={inputCls}
            value={b.longitude}
            onChange={(e) => upd("longitude", +e.target.value)}
          />
        </div>
        <div>
          <label className={labelCls}>House System</label>
          <select
            className={inputCls}
            value={b.houseSystem}
            onChange={(e) => upd("houseSystem", e.target.value as BirthData["houseSystem"])}
          >
            <option value="WholeSign">Whole Sign</option>
            <option value="Placidus">Placidus</option>
          </select>
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            className="w-full px-4 py-2 rounded font-mono text-sm uppercase tracking-widest"
            style={{ background: "linear-gradient(135deg,#9d7bff,#5a3fff)", color: "white" }}
          >
            Compute Chart
          </button>
        </div>
      </div>
    </form>
  );
}
