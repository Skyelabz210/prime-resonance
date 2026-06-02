import { useState, type ChangeEvent, type FocusEvent } from "react";
import type { BirthData } from "@/lib/qmnf/chart";
import { searchCities, type City } from "@/lib/qmnf/cities";

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

// Select the field's current content when the user taps in, so the next
// keystroke replaces it instead of prepending. Use rAF because mobile
// browsers (notably Android Chrome) re-set the selection after focus.
function selectAllOnFocus(e: FocusEvent<HTMLInputElement>) {
  const el = e.currentTarget;
  requestAnimationFrame(() => {
    try {
      el.select();
    } catch {
      /* number-typed input on some Safari builds; ignore */
    }
  });
}

export function BirthForm({ onSubmit }: { onSubmit: (b: BirthData) => void }) {
  const [b, setB] = useState<BirthData>(DEFAULT);
  const [cityQuery, setCityQuery] = useState("");
  const [cityResults, setCityResults] = useState<City[]>([]);
  const [cityLabel, setCityLabel] = useState("");

  const upd = <K extends keyof BirthData>(k: K, v: BirthData[K]) =>
    setB((prev) => ({ ...prev, [k]: v }));

  const onCityQuery = (e: ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setCityQuery(q);
    setCityResults(searchCities(q));
  };

  const pickCity = (c: City) => {
    setB((prev) => ({ ...prev, latitude: c.lat, longitude: c.lon, tzOffsetHours: c.tz }));
    setCityLabel(`${c.name}, ${c.country}`);
    setCityQuery("");
    setCityResults([]);
  };

  // Parse a numeric input string; if empty, keep the previous value so
  // mid-edit clears don't crash the chart computation.
  const parseNum = (s: string, fallback: number, isFloat = false): number => {
    if (s.trim() === "" || s.trim() === "-") return fallback;
    const n = isFloat ? Number(s) : parseInt(s, 10);
    return Number.isFinite(n) ? n : fallback;
  };

  const onNumChange =
    <K extends keyof BirthData>(k: K, isFloat = false) =>
    (e: ChangeEvent<HTMLInputElement>) =>
      upd(k, parseNum(e.target.value, b[k] as number, isFloat) as BirthData[K]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(b);
  };

  const inputCls =
    "w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-sm font-mono text-white/90 focus:outline-none focus:border-[#9d7bff]";
  const labelCls = "block text-[10px] uppercase tracking-widest text-white/40 mb-1 font-mono";

  // Common props for numeric fields. type="text" + inputMode="numeric"
  // gives the mobile number-pad while letting `.select()` actually work.
  const numProps = {
    type: "text" as const,
    inputMode: "numeric" as const,
    onFocus: selectAllOnFocus,
    onClick: selectAllOnFocus,
    className: inputCls,
  };
  const decProps = { ...numProps, inputMode: "decimal" as const };

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
            placeholder="Your name"
            value={b.name}
            onFocus={selectAllOnFocus}
            onChange={(e) => upd("name", e.target.value)}
          />
        </div>
        <div className="sm:col-span-2 relative">
          <label className={labelCls}>
            Birthplace {cityLabel && <span className="text-[#9d7bff]">· {cityLabel}</span>}
          </label>
          <input
            className={inputCls}
            placeholder="Search a city — fills lat / lon / UTC"
            value={cityQuery}
            onFocus={selectAllOnFocus}
            onChange={onCityQuery}
            autoComplete="off"
          />
          {cityResults.length > 0 && (
            <ul
              className="absolute z-20 mt-1 w-full max-h-56 overflow-y-auto rounded border bg-[#0a0e1a] shadow-xl"
              style={{ borderColor: "#9d7bff55" }}
            >
              {cityResults.map((c) => (
                <li key={`${c.name}-${c.country}`}>
                  <button
                    type="button"
                    onClick={() => pickCity(c)}
                    className="flex w-full items-center justify-between px-3 py-2 text-left text-xs font-mono text-white/85 hover:bg-[#9d7bff22]"
                  >
                    <span>
                      {c.name}, <span className="text-white/50">{c.country}</span>
                    </span>
                    <span className="text-white/40">
                      {c.lat.toFixed(2)}, {c.lon.toFixed(2)} · UTC
                      {c.tz >= 0 ? "+" : ""}
                      {c.tz}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <label className={labelCls}>Year</label>
          <input {...numProps} placeholder="1990" value={b.year} onChange={onNumChange("year")} />
        </div>
        <div>
          <label className={labelCls}>Month</label>
          <input {...numProps} placeholder="1-12" value={b.month} onChange={onNumChange("month")} />
        </div>
        <div>
          <label className={labelCls}>Day</label>
          <input {...numProps} placeholder="1-31" value={b.day} onChange={onNumChange("day")} />
        </div>
        <div>
          <label className={labelCls}>Hour (local)</label>
          <input {...numProps} placeholder="0-23" value={b.hour} onChange={onNumChange("hour")} />
        </div>
        <div>
          <label className={labelCls}>Minute</label>
          <input
            {...numProps}
            placeholder="0-59"
            value={b.minute}
            onChange={onNumChange("minute")}
          />
        </div>
        <div>
          <label className={labelCls}>UTC Offset</label>
          <input
            {...decProps}
            placeholder="-5"
            value={b.tzOffsetHours}
            onChange={onNumChange("tzOffsetHours", true)}
          />
        </div>
        <div>
          <label className={labelCls}>Latitude</label>
          <input
            {...decProps}
            placeholder="40.7128"
            value={b.latitude}
            onChange={onNumChange("latitude", true)}
          />
        </div>
        <div>
          <label className={labelCls}>Longitude</label>
          <input
            {...decProps}
            placeholder="-74.006"
            value={b.longitude}
            onChange={onNumChange("longitude", true)}
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
            <option value="Equal">Equal</option>
            <option value="Porphyry">Porphyry</option>
            <option value="Koch">Koch</option>
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
