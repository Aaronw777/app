import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "@/lib/api";
import { ArrowLeft, Check, Printer, Clock, Zap, ExternalLink, Play, FileText } from "lucide-react";
import SessionTimer from "@/components/SessionTimer";
import CourtDiagram from "@/components/CourtDiagram";
import { toast } from "sonner";

export default function SessionView() {
  const { id, week } = useParams();
  const weekNum = parseInt(week, 10);
  const [program, setProgram] = useState(null);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const { data } = await api.get(`/programs/${id}`);
      setProgram(data);
      const s = data.sessions.find((x) => x.week === weekNum);
      setNotes(s?.notes || "");
    } catch {
      toast.error("Failed to load session");
    }
  };

  useEffect(() => {
    load();
  }, [id, week]);

  if (!program) return <div className="max-w-4xl mx-auto px-6 py-16 text-white/40 uppercase tracking-[0.3em]">Loading...</div>;

  const session = program.sessions.find((s) => s.week === weekNum);
  if (!session) return <div className="max-w-4xl mx-auto px-6 py-16">Session not found.</div>;

  const toggleComplete = async () => {
    setSaving(true);
    try {
      const { data } = await api.patch(`/programs/${id}/sessions/${weekNum}`, {
        completed: !session.completed,
      });
      setProgram(data);
      toast.success(session.completed ? "Session reopened" : "Session marked complete!");
    } catch {
      toast.error("Update failed");
    } finally {
      setSaving(false);
    }
  };

  const saveNotes = async () => {
    setSaving(true);
    try {
      await api.patch(`/programs/${id}/sessions/${weekNum}`, { notes });
      toast.success("Notes saved");
    } catch {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-16" data-testid="session-view-page">
      <Link
        to={`/programs/${id}`}
        className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/60 hover:text-[#FFCD00] mb-6 no-print"
        data-testid="session-back-link"
      >
        <ArrowLeft size={14} /> Program Overview
      </Link>

      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="tag tag-gold">Week {String(session.week).padStart(2, "0")}</span>
            <span className="tag">Tier {session.target_level}/5</span>
            <span className="tag flex items-center gap-1">
              <Clock size={10} /> {session.total_minutes} min
            </span>
          </div>
          <h1 className="font-display text-4xl md:text-6xl uppercase tracking-tight leading-none">
            {session.theme}
          </h1>
          <p className="text-white/60 mt-3">{session.coach_reference}</p>
        </div>
        <div className="flex flex-wrap gap-3 no-print">
          <Link
            to={`/programs/${id}/week/${weekNum}/handout`}
            data-testid="session-handout-link"
            className="btn-ghost"
          >
            <FileText size={14} /> Parent Handout
          </Link>
          <button
            data-testid="session-print-btn"
            onClick={() => window.print()}
            className="btn-ghost"
          >
            <Printer size={14} /> Print / PDF
          </button>
          <button
            data-testid="session-complete-btn"
            onClick={toggleComplete}
            disabled={saving}
            className={session.completed ? "btn-ghost" : "btn-primary"}
          >
            <Check size={14} /> {session.completed ? "Completed ✓" : "Mark Complete"}
          </button>
        </div>
      </div>

      <SessionTimer drills={session.drills} />

      <div className="space-y-6 stagger">
        {session.drills.map((d, idx) => (
          <div key={`${d.id}-${idx}`} data-testid={`drill-${d.id}`} className="card-tactical">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="font-display text-2xl text-[#FFCD00]">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <span className="tag">{d.category}</span>
                  <span className="tag tag-orange flex items-center gap-1">
                    <Clock size={10} /> {d.duration} min
                  </span>
                  <span className="tag">Level {d.level}</span>
                </div>
                <h3 className="font-display text-2xl md:text-3xl uppercase tracking-wide mb-3">
                  {d.name}
                </h3>
                <p className="text-white/70 leading-relaxed mb-4">{d.description}</p>
                <div className="border-l-2 border-[#FFCD00] pl-4 text-sm text-white/60 italic">
                  <div className="flex items-center gap-2 text-[#FFCD00] not-italic uppercase tracking-[0.2em] text-xs font-bold mb-1">
                    <Zap size={12} /> Coach Notes
                  </div>
                  {d.coach_notes}
                </div>
                {(() => {
                  const searchQuery = encodeURIComponent(`${d.name} basketball drill tutorial`);
                  const watchUrl = `https://www.youtube.com/results?search_query=${searchQuery}`;
                  return (
                    <a
                      href={watchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-testid={`drill-video-url-${d.id}`}
                      className="mt-3 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-bold text-[#FFCD00] hover:underline"
                    >
                      <Play size={12} fill="currentColor" />
                      Watch YouTube Example
                      <ExternalLink size={11} />
                    </a>
                  );
                })()}
              </div>
              <div className="aspect-video bg-black/60 border border-white/10 rounded-sm overflow-hidden relative group">
                {(() => {
                  const searchQuery = encodeURIComponent(`${d.name} basketball drill tutorial`);
                  const watchUrl = `https://www.youtube.com/results?search_query=${searchQuery}`;
                  return (
                    <a
                      href={watchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-testid={`drill-video-link-${d.id}`}
                      className="block w-full h-full relative bg-gradient-to-br from-[#1a1a1a] to-black"
                    >
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center px-4">
                        <div className="w-14 h-14 bg-[#FFCD00] text-black flex items-center justify-center rounded-full group-hover:scale-110 transition-transform">
                          <Play size={22} fill="currentColor" />
                        </div>
                        <div className="text-xs uppercase tracking-[0.25em] text-white font-bold flex items-center gap-1">
                          Find on YouTube <ExternalLink size={11} />
                        </div>
                        <div className="text-[10px] uppercase tracking-[0.2em] text-white/40 max-w-[180px]">
                          Opens a search for tutorials by community coaches
                        </div>
                      </div>
                    </a>
                  );
                })()}
              </div>
              <div className="md:col-span-3 mt-2">
                <CourtDiagram category={d.category} label={d.name} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Coach notes */}
      <div className="mt-12 card-tactical no-print">
        <div className="text-xs uppercase tracking-[0.25em] text-white/60 mb-3">
          Session Coach Notes
        </div>
        <textarea
          data-testid="session-notes-textarea"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="What worked? What to adjust next week? Key observations..."
          rows={5}
          className="w-full bg-black/40 border border-white/10 focus:border-[#FFCD00] focus:outline-none px-4 py-3 rounded-sm text-white text-sm resize-y"
        />
        <div className="mt-4 flex justify-end">
          <button
            data-testid="session-save-notes-btn"
            onClick={saveNotes}
            disabled={saving}
            className="btn-primary disabled:opacity-50"
          >
            Save Notes
          </button>
        </div>
      </div>
    </div>
  );
}
