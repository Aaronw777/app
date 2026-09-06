import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { Plus, Trash2, ChevronRight } from "lucide-react";
import { toast } from "sonner";

export default function Dashboard() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/programs");
      setPrograms(data);
    } catch {
      toast.error("Failed to load programs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm("Delete this program? This cannot be undone.")) return;
    try {
      await api.delete(`/programs/${id}`);
      toast.success("Program deleted");
      load();
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-16" data-testid="dashboard-page">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
        <div>
          <div className="tag tag-gold mb-3">My Programs</div>
          <h1 className="font-display text-4xl md:text-6xl uppercase tracking-tight leading-none">
            Training <span className="text-[#FFCD00]">Blueprints</span>
          </h1>
          <p className="text-white/60 mt-3 max-w-xl">
            Every program is a 10-week ladder built to your player&apos;s age, gender and starting level.
          </p>
        </div>
        <Link to="/build" data-testid="dashboard-new-program-btn" className="btn-primary">
          <Plus size={16} /> New Program
        </Link>
      </div>

      {loading ? (
        <div className="text-white/40 uppercase tracking-[0.3em] text-sm">Loading...</div>
      ) : programs.length === 0 ? (
        <div className="card-tactical text-center py-16">
          <div className="font-display text-3xl uppercase text-white/80 mb-2">No programs yet</div>
          <p className="text-white/50 mb-6">Build your first 10-week training blueprint.</p>
          <Link to="/build" data-testid="dashboard-empty-cta" className="btn-primary inline-flex">
            <Plus size={16} /> Build Program
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 stagger">
          {programs.map((p) => {
            const pct = p.total_count ? Math.round((p.completed_count / p.total_count) * 100) : 0;
            return (
              <Link
                key={p.id}
                to={`/programs/${p.id}`}
                data-testid={`program-card-${p.id}`}
                className="card-tactical block group relative"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="font-display text-2xl uppercase tracking-wide leading-tight">
                      {p.player_name}
                    </div>
                    <div className="text-xs uppercase tracking-[0.2em] text-white/50 mt-1">
                      {p.gender === "womens" ? "Womens" : "Mens"} · Age {p.starting_age} · {p.skill_level}
                    </div>
                  </div>
                  <button
                    data-testid={`program-delete-${p.id}`}
                    onClick={(e) => remove(p.id, e)}
                    className="text-white/30 hover:text-red-400 transition-colors p-1"
                    aria-label="Delete program"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="flex items-end justify-between mb-3">
                  <div>
                    <div className="text-xs uppercase tracking-[0.2em] text-white/50">Progress</div>
                    <div className="font-display text-3xl text-[#FFCD00]">
                      {p.completed_count}/{p.total_count}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs uppercase tracking-[0.2em] text-white/50">Complete</div>
                    <div className="font-display text-3xl">{pct}%</div>
                  </div>
                </div>
                <div className="h-1 bg-white/10 rounded-sm overflow-hidden mb-4">
                  <div
                    className="h-full bg-[#FFCD00] transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex items-center gap-1 text-xs uppercase tracking-[0.2em] text-white/60 group-hover:text-[#FFCD00] transition-colors">
                  Open program <ChevronRight size={12} />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
