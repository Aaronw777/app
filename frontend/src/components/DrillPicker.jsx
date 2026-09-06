import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { X, Plus, Search, Zap } from "lucide-react";

const LEVEL_LABEL = ["Mini", "Fund.", "Devel.", "Interm.", "Adv.", "Expert"];

export default function DrillPicker({ open, onClose, onSelect, currentLevel }) {
  const [library, setLibrary] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");

  useEffect(() => {
    if (!open || library.length) return;
    setLoading(true);
    api
      .get("/drills")
      .then(({ data }) => setLibrary(data))
      .finally(() => setLoading(false));
  }, [open, library.length]);

  const categories = useMemo(() => {
    const s = new Set(library.map((d) => d.category));
    return ["all", ...Array.from(s).sort()];
  }, [library]);

  const filtered = useMemo(() => {
    return library.filter((d) => {
      if (category !== "all" && d.category !== category) return false;
      if (levelFilter !== "all" && d.level !== Number(levelFilter)) return false;
      if (query && !d.name.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [library, category, levelFilter, query]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      data-testid="drill-picker-overlay"
      onClick={onClose}
    >
      <div
        className="bg-[#0d0d0d] border border-white/10 w-full max-w-4xl max-h-[85vh] flex flex-col rounded-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 p-5">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-[#FFCD00] font-bold">
              Drill Library
            </div>
            <div className="font-display text-2xl uppercase tracking-wide mt-1">
              Add a Drill
            </div>
          </div>
          <button
            data-testid="drill-picker-close"
            onClick={onClose}
            className="text-white/60 hover:text-white p-1"
            aria-label="Close"
          >
            <X size={22} />
          </button>
        </div>

        <div className="p-5 border-b border-white/10 space-y-3">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
            />
            <input
              data-testid="drill-picker-search"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search drill name..."
              className="w-full bg-black/40 border border-white/10 focus:border-[#FFCD00] focus:outline-none pl-9 pr-4 py-2 rounded-sm text-white text-sm"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {categories.map((c) => (
              <button
                key={c}
                data-testid={`drill-picker-cat-${c}`}
                onClick={() => setCategory(c)}
                className={`text-[10px] uppercase tracking-[0.2em] font-bold px-2.5 py-1.5 border rounded-sm transition-colors ${
                  category === c
                    ? "bg-[#FFCD00] text-black border-[#FFCD00]"
                    : "border-white/10 text-white/60 hover:border-white/30"
                }`}
              >
                {c === "all" ? "All" : c}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {["all", "0", "1", "2", "3", "4", "5"].map((l) => (
              <button
                key={l}
                data-testid={`drill-picker-lvl-${l}`}
                onClick={() => setLevelFilter(l)}
                className={`text-[10px] uppercase tracking-[0.2em] font-bold px-2.5 py-1.5 border rounded-sm transition-colors ${
                  levelFilter === l
                    ? "bg-[#FF7324] text-black border-[#FF7324]"
                    : "border-white/10 text-white/60 hover:border-white/30"
                }`}
              >
                {l === "all" ? "All Levels" : LEVEL_LABEL[Number(l)]}
              </button>
            ))}
          </div>
          {currentLevel != null && (
            <div className="text-[10px] uppercase tracking-[0.25em] text-white/40">
              Session target level: {LEVEL_LABEL[currentLevel] || currentLevel}
            </div>
          )}
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-2">
          {loading && (
            <div className="text-white/40 text-sm uppercase tracking-[0.2em]">
              Loading library...
            </div>
          )}
          {!loading && filtered.length === 0 && (
            <div className="text-white/40 text-sm py-8 text-center">
              No drills match your filters.
            </div>
          )}
          {filtered.map((d) => (
            <div
              key={d.id}
              data-testid={`drill-picker-item-${d.id}`}
              className="flex items-start gap-3 p-3 border border-white/10 rounded-sm hover:border-[#FFCD00]/60 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="tag">{d.category}</span>
                  <span className="tag tag-orange">{LEVEL_LABEL[d.level] || d.level}</span>
                  <span className="tag">{d.duration} min</span>
                </div>
                <div className="font-display text-lg uppercase tracking-wide leading-tight">
                  {d.name}
                </div>
                <div className="text-xs text-white/60 mt-1 line-clamp-2">
                  {d.description}
                </div>
                <div className="text-[10px] text-white/40 italic mt-1 flex items-start gap-1">
                  <Zap size={9} className="mt-0.5 shrink-0 text-[#FFCD00]" />
                  {d.coach_notes}
                </div>
              </div>
              <button
                data-testid={`drill-picker-add-${d.id}`}
                onClick={() => {
                  onSelect(d);
                  onClose();
                }}
                className="btn-primary shrink-0"
                style={{ padding: "0.4rem 0.75rem" }}
              >
                <Plus size={14} /> Add
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
