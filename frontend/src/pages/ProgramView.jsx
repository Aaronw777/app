import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { ChevronRight, Check, Printer, ArrowLeft, Users, FileText } from "lucide-react";
import { toast } from "sonner";
import MediaUpload, { MediaImage } from "@/components/MediaUpload";

export default function ProgramView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/programs/${id}`);
      setProgram(data);
    } catch {
      toast.error("Failed to load program");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  if (loading) return <div className="max-w-7xl mx-auto px-6 py-16 text-white/40 uppercase tracking-[0.3em]">Loading...</div>;
  if (!program) return <div className="max-w-7xl mx-auto px-6 py-16">Program not found.</div>;

  const completed = program.sessions.filter((s) => s.completed).length;
  const pct = Math.round((completed / program.sessions.length) * 100);

  return (
    <div className="max-w-7xl mx-auto px-6 py-16" data-testid="program-view-page">
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/60 hover:text-[#FFCD00] mb-6 no-print"
        data-testid="program-back-link"
      >
        <ArrowLeft size={14} /> All Programs
      </Link>

      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-12">
        <div className="flex items-start gap-5">
          <div className="no-print">
            <MediaUpload
              kind="program-cover"
              value={program.cover_media_id}
              onChange={async (id) => {
                try {
                  await api.patch(`/programs/${program.id}/cover`, {
                    cover_media_id: id,
                  });
                  setProgram((p) => ({ ...p, cover_media_id: id }));
                } catch {
                  toast.error("Failed to save cover");
                }
              }}
              accept="image/*"
              size="lg"
            />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <span className="tag tag-gold">10-Week Program</span>
              <span className="tag">{program.gender === "womens" ? "Womens" : "Mens"}</span>
              <span className="tag">Age {program.starting_age}+</span>
              <span className="tag tag-orange">{program.skill_level}</span>
            </div>
            <h1 className="font-display text-4xl md:text-6xl uppercase tracking-tight leading-none">
              {program.player_name}
            </h1>
            <p className="text-white/60 mt-3">
              FIBA-style rules · Inspired by the Australian{" "}
              {program.gender === "womens" ? "women's" : "men's"} basketball pathway
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 md:gap-6 flex-wrap">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-white/50">Progress</div>
            <div className="font-display text-4xl text-[#FFCD00]">
              {completed}/{program.sessions.length}
            </div>
          </div>
          <button
            onClick={async () => {
              const name = window.prompt("Team name?", `${program.player_name}'s Squad`);
              if (!name) return;
              try {
                const { data } = await api.post("/teams", { name, program_id: program.id });
                toast.success("Team created");
                navigate(`/teams/${data.id}`);
              } catch {
                toast.error("Failed to create team");
              }
            }}
            data-testid="program-create-team-btn"
            className="btn-ghost no-print"
          >
            <Users size={14} /> Create Team
          </button>
          <button
            onClick={() => window.print()}
            data-testid="program-print-btn"
            className="btn-ghost no-print"
          >
            <Printer size={14} /> Export PDF
          </button>
        </div>
      </div>

      <div className="h-1 bg-white/10 rounded-sm overflow-hidden mb-12 max-w-md">
        <div className="h-full bg-[#FFCD00] transition-all" style={{ width: `${pct}%` }} />
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 stagger">
        {program.sessions.map((s) => (
          <div key={s.week} className="card-tactical group relative" data-testid={`week-card-${s.week}`}>
            {s.completed && (
              <div className="absolute top-4 right-4 w-7 h-7 bg-[#FFCD00] text-black rounded-full flex items-center justify-center">
                <Check size={14} strokeWidth={3} />
              </div>
            )}
            <Link to={`/programs/${program.id}/week/${s.week}`} className="block">
              <div className="font-display text-xs uppercase tracking-[0.3em] text-[#FFCD00] mb-2">
                Week {String(s.week).padStart(2, "0")}
              </div>
              <div className="font-display text-2xl uppercase tracking-wide leading-tight mb-4">
                {s.theme}
              </div>
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-white/50 mb-4">
                <span>{s.drills.length} Drills</span>
                <span>{s.total_minutes} Min</span>
                <span>Tier {s.target_level}/5</span>
              </div>
              <div className="flex items-center gap-1 text-xs uppercase tracking-[0.2em] text-white/60 group-hover:text-[#FFCD00] transition-colors">
                Open session <ChevronRight size={12} />
              </div>
            </Link>
            <Link
              to={`/programs/${program.id}/week/${s.week}/handout`}
              data-testid={`week-handout-${s.week}`}
              className="mt-3 pt-3 border-t border-white/10 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.25em] text-white/50 hover:text-[#FFCD00] transition-colors no-print"
            >
              <FileText size={11} />
              {program.skill_level === "mini_ballers" ? "Parent Handout" : "Home Sheet"}
            </Link>
          </div>
        ))}
      </div>

      {/* Print-only detailed view */}
      <div className="hidden print:block mt-12">
        {program.sessions.map((s) => (
          <div key={s.week} className="print-page mb-12">
            <h2 className="font-display text-3xl uppercase mb-2">
              Week {s.week} — {s.theme}
            </h2>
            <p className="text-sm mb-6">
              {program.player_name} · {s.total_minutes} minutes · Tier {s.target_level}
            </p>
            {s.drills.map((d) => {
              const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(d.name + " basketball drill tutorial")}`;
              return (
                <div key={d.id} className="mb-4 pb-4 border-b">
                  <div className="font-semibold">
                    {d.name} ({d.duration} min) — {d.category}
                  </div>
                  <div className="text-sm">{d.description}</div>
                  <div className="text-xs italic mt-1">Coach: {d.coach_notes}</div>
                  <div className="text-xs mt-1">Find video: {searchUrl}</div>
                </div>
              );
            })}
            {s.notes && (
              <div className="mt-4 text-sm">
                <strong>Coach notes:</strong> {s.notes}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
