import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "@/lib/api";
import { ArrowLeft, Check, Printer, Clock, Zap, ExternalLink, Play, FileText, Edit3, Trash2, ChevronUp, ChevronDown, Plus, Save, RotateCcw } from "lucide-react";
import SessionTimer from "@/components/SessionTimer";
import CourtDiagram from "@/components/CourtDiagram";
import DrillPicker from "@/components/DrillPicker";
import CustomDrillForm from "@/components/CustomDrillForm";
import KeyPoints from "@/components/KeyPoints";
import MediaUpload, { MediaImage } from "@/components/MediaUpload";
import { API } from "@/lib/api";
import { toast } from "sonner";

export default function SessionView() {
  const { id, week } = useParams();
  const weekNum = parseInt(week, 10);
  const [program, setProgram] = useState(null);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draftDrills, setDraftDrills] = useState([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [customOpen, setCustomOpen] = useState(false);

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

  // ---- Edit mode helpers ----
  const startEdit = () => {
    setDraftDrills(JSON.parse(JSON.stringify(session.drills)));
    setEditing(true);
  };
  const cancelEdit = () => {
    setEditing(false);
    setDraftDrills([]);
  };
  const moveDrill = (idx, dir) => {
    const j = idx + dir;
    if (j < 0 || j >= draftDrills.length) return;
    const copy = [...draftDrills];
    [copy[idx], copy[j]] = [copy[j], copy[idx]];
    setDraftDrills(copy);
  };
  const removeDrill = (idx) => {
    setDraftDrills(draftDrills.filter((_, i) => i !== idx));
  };
  const addDrill = (drill) => {
    setDraftDrills([...draftDrills, { ...drill }]);
  };
  const saveDrills = async () => {
    if (draftDrills.length === 0) {
      toast.error("Add at least one drill before saving.");
      return;
    }
    setSaving(true);
    try {
      const { data } = await api.patch(`/programs/${id}/sessions/${weekNum}`, {
        drills: draftDrills,
      });
      setProgram(data);
      setEditing(false);
      setDraftDrills([]);
      toast.success("Session updated");
    } catch (e) {
      toast.error(e.response?.data?.detail || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const drillsToRender = editing ? draftDrills : session.drills;
  const draftTotal = draftDrills.reduce((sum, d) => sum + (d.duration || 0), 0);

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
          {editing ? (
            <>
              <button
                data-testid="session-cancel-edit-btn"
                onClick={cancelEdit}
                className="btn-ghost"
              >
                <RotateCcw size={14} /> Cancel
              </button>
              <button
                data-testid="session-save-drills-btn"
                onClick={saveDrills}
                disabled={saving}
                className="btn-primary disabled:opacity-50"
              >
                <Save size={14} /> Save Session
              </button>
            </>
          ) : (
            <>
              <Link
                to={`/programs/${id}/week/${weekNum}/handout`}
                data-testid="session-handout-link"
                className="btn-ghost"
              >
                <FileText size={14} /> Parent Handout
              </Link>
              <button
                data-testid="session-edit-btn"
                onClick={startEdit}
                className="btn-ghost"
              >
                <Edit3 size={14} /> Amend Session
              </button>
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
            </>
          )}
        </div>
      </div>

      {editing && (
        <div
          data-testid="edit-banner"
          className="mb-6 border border-[#FF7324]/50 bg-[#FF7324]/10 rounded-sm p-4 flex flex-wrap items-center justify-between gap-3 no-print"
        >
          <div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-[#FF7324] font-bold">
              Editing Session
            </div>
            <div className="text-sm text-white/80 mt-1">
              Add, reorder or remove drills to tailor this week to your squad&apos;s needs.
              Current total: <span className="font-display text-[#FFCD00]">{draftTotal} min</span>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              data-testid="add-from-library-btn"
              onClick={() => setPickerOpen(true)}
              className="btn-primary"
              style={{ padding: "0.55rem 1rem" }}
            >
              <Plus size={14} /> From Library
            </button>
            <button
              data-testid="add-custom-btn"
              onClick={() => setCustomOpen(true)}
              className="btn-ghost"
              style={{ padding: "0.55rem 1rem" }}
            >
              <Plus size={14} /> Custom Drill
            </button>
          </div>
        </div>
      )}

      {!editing && <SessionTimer drills={session.drills} />}

      <div className="space-y-6 stagger">
        {drillsToRender.map((d, idx) => (
          <div key={`${d.id}-${idx}`} data-testid={`drill-${d.id}`} className="card-tactical relative">
            {editing && (
              <div
                className="absolute top-3 right-3 flex items-center gap-1 no-print z-10"
                data-testid={`drill-edit-controls-${d.id}`}
              >
                <button
                  data-testid={`drill-move-up-${idx}`}
                  onClick={() => moveDrill(idx, -1)}
                  disabled={idx === 0}
                  className="p-1.5 border border-white/10 hover:border-[#FFCD00] rounded-sm text-white/70 hover:text-[#FFCD00] disabled:opacity-30"
                  aria-label="Move up"
                >
                  <ChevronUp size={14} />
                </button>
                <button
                  data-testid={`drill-move-down-${idx}`}
                  onClick={() => moveDrill(idx, 1)}
                  disabled={idx === drillsToRender.length - 1}
                  className="p-1.5 border border-white/10 hover:border-[#FFCD00] rounded-sm text-white/70 hover:text-[#FFCD00] disabled:opacity-30"
                  aria-label="Move down"
                >
                  <ChevronDown size={14} />
                </button>
                <button
                  data-testid={`drill-remove-${idx}`}
                  onClick={() => removeDrill(idx)}
                  className="p-1.5 border border-red-500/30 hover:border-red-400 rounded-sm text-red-300 hover:text-red-200"
                  aria-label="Remove drill"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="font-display text-2xl text-[#FFCD00]">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <span className="tag">{d.category}</span>
                  {d.custom && <span className="tag tag-orange">Coach&apos;s Own</span>}
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
                <div className="mt-4">
                  <KeyPoints drill={d} />
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
                {d.media_id ? (
                  (() => {
                    const token =
                      typeof window !== "undefined"
                        ? localStorage.getItem("cm_token")
                        : null;
                    const url = `${API}/media/${d.media_id}${
                      token ? `?auth=${token}` : ""
                    }`;
                    // Naive video vs image inference: presence of ".mp4"/etc isn't stored,
                    // so we render both — video preview if it plays, else fallback to img.
                    return (
                      <video
                        src={url}
                        className="w-full h-full object-cover"
                        controls
                        preload="metadata"
                        onError={(e) => {
                          const img = document.createElement("img");
                          img.src = url;
                          img.className = "w-full h-full object-cover";
                          e.currentTarget.replaceWith(img);
                        }}
                      />
                    );
                  })()
                ) : (
                  (() => {
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
                })()
                )}
              </div>
              <div className="md:col-span-3 mt-2">
              </div>
            </div>
          </div>
        ))}
        {editing && drillsToRender.length === 0 && (
          <div className="card-tactical text-center py-10">
            <div className="text-white/60 mb-3">This session has no drills yet.</div>
            <button
              onClick={() => setPickerOpen(true)}
              className="btn-primary"
              data-testid="empty-add-drill-btn"
            >
              <Plus size={14} /> Add Your First Drill
            </button>
          </div>
        )}
        {editing && drillsToRender.length > 0 && (
          <button
            data-testid="add-drill-bottom-btn"
            onClick={() => setPickerOpen(true)}
            className="w-full border-2 border-dashed border-white/15 hover:border-[#FFCD00] hover:text-[#FFCD00] text-white/50 uppercase tracking-[0.25em] text-xs font-bold py-6 rounded-sm transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={14} /> Add Another Drill
          </button>
        )}
      </div>

      <DrillPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={addDrill}
        currentLevel={session.target_level}
      />
      <CustomDrillForm
        open={customOpen}
        onClose={() => setCustomOpen(false)}
        onSave={addDrill}
      />

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
        <div className="mt-4">
          <div className="text-[10px] uppercase tracking-[0.25em] text-white/60 mb-2 font-bold">
            Session Photos & Clips
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {(session.photos || []).map((mid) => {
              const token =
                typeof window !== "undefined"
                  ? localStorage.getItem("cm_token")
                  : null;
              const url = `${API}/media/${mid}${token ? `?auth=${token}` : ""}`;
              return (
                <div key={mid} className="relative w-24 h-24">
                  {/* Try <video>; if not a real video the poster event errors → swap to <img> */}
                  <video
                    src={url}
                    className="w-full h-full object-cover rounded-sm border border-white/10 bg-black"
                    controls
                    preload="metadata"
                    onError={(e) => {
                      const img = document.createElement("img");
                      img.src = url;
                      img.className =
                        "w-full h-full object-cover rounded-sm border border-white/10";
                      e.currentTarget.replaceWith(img);
                    }}
                  />
                  <button
                    data-testid={`session-photo-remove-${mid}`}
                    onClick={async () => {
                      const next = (session.photos || []).filter((x) => x !== mid);
                      try {
                        const { data } = await api.patch(
                          `/programs/${id}/sessions/${weekNum}`,
                          { photos: next }
                        );
                        setProgram(data);
                      } catch {
                        toast.error("Failed to remove");
                      }
                    }}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-black text-white border border-white/30 rounded-full flex items-center justify-center hover:bg-red-500 z-10"
                    aria-label="Remove media"
                  >
                    <span className="text-xs">×</span>
                  </button>
                </div>
              );
            })}
            <MediaUpload
              kind="session-photo"
              value={null}
              onChange={async (mid) => {
                if (!mid) return;
                const next = [...(session.photos || []), mid];
                try {
                  const { data } = await api.patch(
                    `/programs/${id}/sessions/${weekNum}`,
                    { photos: next }
                  );
                  setProgram(data);
                } catch {
                  toast.error("Failed to save media");
                }
              }}
              accept="image/*,video/*"
              size="md"
            />
          </div>
        </div>
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
