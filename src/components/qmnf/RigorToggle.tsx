import { useRigor } from "@/lib/qmnf/rigor";

export function RigorToggle() {
  const { mode, toggle } = useRigor();
  const on = mode === "rigorous";
  return (
    <button
      onClick={toggle}
      aria-pressed={on}
      title="Toggle Rigorous view — show the math behind every reading"
      className="inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[10px] font-mono uppercase tracking-widest transition"
      style={{
        borderColor: on ? "#9d7bff" : "#ffffff20",
        background: on ? "#9d7bff15" : "transparent",
        color: on ? "#c5b3ff" : "#9aa0c0",
      }}
    >
      <span
        className="inline-block h-2 w-2 rounded-full"
        style={{ background: on ? "#9d7bff" : "#ffffff30" }}
      />
      Rigor {on ? "On" : "Off"}
    </button>
  );
}
