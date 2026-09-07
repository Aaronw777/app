import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { api, API } from "@/lib/api";
import { toast } from "sonner";
import {
  ArrowLeft,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Save,
  Play,
  Pencil,
  Camera,
  Video as VideoIcon,
} from "lucide-react";
import SessionTimer from "@/components/SessionTimer";
import DrillPicker from "@/components/DrillPicker";
import CustomDrillForm from "@/components/CustomDrillForm";
import KeyPoints from "@/components/KeyPoints";
import { MediaImage } from "@/components/MediaUpload";

/**
 * Individual Player Program — one 1-hour daily plan per player.
 * Route: /teams/:teamId/players/:playerId/program
 *
 * Modes:
 *   - "run"  → coach/player runs through the plan with timer + capture buttons
 *   - "edit" → head coach or assistant adds up to 10 drills (library or custom)
 */
const MAX_DRILLS = 10;

export default function IndividualProgram() {
  const { teamId, playerId } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [drills, setDrills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState("run"); // "run" | "edit"
  const [pickerOpen, setPickerOpen] = useState(false);
  const [customOpen, setCustomOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/teams/${teamId}`);
      setTeam(data);
      const p = data.roster.find((r) => r.player_id === playerId);
      const ip = p?.individual_program?.drills || [];
      setDrills(ip);
      setDirty(false);
      // Empty plans jump to edit
      if (!ip.length) setMode("edit");
    } catch {
      toast.error("Failed to load program");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [teamId, playerId]);

  const player = team?.roster?.find((r) => r.player_id === playerId);
  const totalMinutes = useMemo(
    () => drills.reduce((s, d) => s + (d.duration || 0), 0),
    [drills]
  );

  const save = async () => {
    setSaving(true);
    try {
      const { data } = await api.patch(
        `/teams/${teamId}/players/${playerId}/program`,
        { drills }
      );
      toast.success(`Saved · ${data.drill_count} drills · ${data.total_minutes} min`);
      setDirty(false);
      if (drills.length) setMode("run");
    } catch (e) {
      toast.error(e.response?.data?.detail || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const addDrill = (d) => {
    if (drills.length >= MAX_DRILLS) {
      toast.error(`Max ${MAX_DRILLS} drills`);
      return;
    }
    setDrills((prev) => [
      ...prev,
      {
        ...d,
        player_media_ids: d.player_media_ids || [],
      },
    ]);
    setDirty(true);
    setPickerOpen(false);
    setCustomOpen(false);
  };

  const removeAt = (i) => {
    setDrills((prev) => prev.filter((_, idx) => idx !== i));
    setDirty(true);
  };

  const moveUp = (i) => {
    if (i === 0) return;
    setDrills((prev) => {
      const next = prev.slice();
      [next[i - 1], next[i]] = [next[i], next[i - 1]];
      return next;
    });
    setDirty(true);
  };

  const moveDown = (i) => {
    setDrills((prev) => {
      if (i >= prev.length - 1) return prev;
      const next = prev.slice();
      [next[i], next[i + 1]] = [next[i + 1], next[i]];
      return next;
    });
    setDirty(true);
  };

  const attachCapture = async (drillIdx, mediaId) => {
    setDrills((prev) =>
      prev.map((d, i) =>
        i === drillIdx
          ? { ...d, player_media_ids: [...(d.player_media_ids || []), mediaId] }
          : d
      )
    );
    // Persist immediately — captures during a run should never be lost.
    const updated = drills.map((d, i) =>
      i === drillIdx
        ? { ...d, player_media_ids: [...(d.player_media_ids || []), mediaId] }
        : d
    );
    try {
      await api.patch(`/teams/${teamId}/players/${playerId}/program`, {
        drills: updated,
      });
      toast.success("Capture saved");
    } catch {
      toast.error("Failed to save capture");
    }
  };

  const removeCapture = async (drillIdx, mediaId) => {
    const updated = drills.map((d, i) =>
      i === drillIdx
        ? {
            ...d,
            player_media_ids: (d.player_media_ids || []).filter((x) => x !== mediaId),
          }
        : d
    );
    setDrills(updated);
    try {
      await api.patch(`/teams/${teamId}/players/${playerId}/program`, {
        drills: updated,
      });
      // Best-effort soft-delete on the media itself
      api.delete(`/media/${mediaId}`).catch(() => {});
    } catch {
      toast.error("Remove failed");
    }
  };

  if (loading)
    return (
      <div className="max-w-7xl mx-auto px-6 py-16 text-white/40 uppercase tracking-[0.3em]">
        Loading...
      </div>
    );

  if (!player)
    return (
      <div className="max-w-7xl mx-auto px-6 py-16">Player not found.</div>
    );

  return (
    <div className="max-w-7xl mx-auto px-6 py-16" data-testid="individual-program-page">
      <Link
        to={`/teams/${teamId}`}
        className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/60 hover:text-[#FFCD00] mb-6 no-print"
        data-testid="ip-back-link"
      >
        <ArrowLeft size={14} /> Back to Team
      </Link>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
        <div>
          <div className="tag tag-gold mb-3">Individual Daily Program</div>
          <h1 className="font-display text-4xl md:text-6xl uppercase tracking-tight leading-none">
            {player.player_name}
          </h1>
          <div className="text-xs uppercase tracking-[0.2em] text-white/50 mt-2">
            {player.number && `#${player.number}`}
            {player.number && player.position && " · "}
            {player.position}
            {(player.number || player.position) && " · "}
            {team.name}
          </div>
          <p className="text-white/60 mt-3">
            One 1-hour plan · Up to {MAX_DRILLS} drills · Currently {drills.length}/{MAX_DRILLS} · {totalMinutes} min
          </p>
        </div>
        <div className="flex items-center gap-3 no-print">
          {mode === "run" ? (
            <button
              data-testid="ip-edit-btn"
              onClick={() => setMode("edit")}
              className="btn-ghost"
            >
              <Pencil size={14} /> Edit Plan
            </button>
          ) : (
            <>
              <button
                data-testid="ip-save-btn"
                onClick={save}
                disabled={saving}
                className="btn-primary disabled:opacity-50"
              >
                <Save size={14} /> {saving ? "Saving..." : "Save Plan"}
              </button>
              {drills.length > 0 && (
                <button
                  data-testid="ip-run-btn"
                  onClick={() => (dirty ? save() : setMode("run"))}
                  className="btn-ghost"
                >
                  <Play size={14} /> Run
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Empty state */}
      {drills.length === 0 && mode === "edit" && (
        <div className="card-tactical text-center py-14 mb-6">
          <div className="font-display text-2xl uppercase text-white/80 mb-1">
            Empty plan
          </div>
          <p className="text-white/50 mb-6">
            Add up to {MAX_DRILLS} drills from the library or create your own.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              data-testid="ip-add-library"
              onClick={() => setPickerOpen(true)}
              className="btn-primary"
            >
              <Plus size={14} /> Library Drill
            </button>
            <button
              data-testid="ip-add-custom"
              onClick={() => setCustomOpen(true)}
              className="btn-ghost"
            >
              <Plus size={14} /> Custom Drill
            </button>
          </div>
        </div>
      )}

      {/* Timer (run mode only) */}
      {mode === "run" && drills.length > 0 && (
        <div className="mb-6">
          <SessionTimer drills={drills} />
        </div>
      )}

      {/* Drill list */}
      <div className="space-y-4">
        {drills.map((d, i) => (
          <DrillCard
            key={`${d.id}-${i}`}
            index={i}
            drill={d}
            mode={mode}
            onRemove={() => removeAt(i)}
            onUp={() => moveUp(i)}
            onDown={() => moveDown(i)}
            onCapture={(mediaId) => attachCapture(i, mediaId)}
            onRemoveCapture={(mediaId) => removeCapture(i, mediaId)}
            isLast={i === drills.length - 1}
          />
        ))}
      </div>

      {/* Add buttons in edit mode when list has items */}
      {mode === "edit" && drills.length > 0 && drills.length < MAX_DRILLS && (
        <div className="flex items-center justify-center gap-3 mt-6 no-print">
          <button
            data-testid="ip-add-library-2"
            onClick={() => setPickerOpen(true)}
            className="btn-primary"
          >
            <Plus size={14} /> Library Drill ({drills.length}/{MAX_DRILLS})
          </button>
          <button
            data-testid="ip-add-custom-2"
            onClick={() => setCustomOpen(true)}
            className="btn-ghost"
          >
            <Plus size={14} /> Custom Drill
          </button>
        </div>
      )}
      {mode === "edit" && drills.length >= MAX_DRILLS && (
        <div className="text-center text-white/40 text-xs uppercase tracking-[0.25em] mt-6">
          Max {MAX_DRILLS} drills reached
        </div>
      )}

      <DrillPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={addDrill}
      />
      <CustomDrillForm
        open={customOpen}
        onClose={() => setCustomOpen(false)}
        onSave={addDrill}
      />
    </div>
  );
}

function DrillCard({
  index,
  drill,
  mode,
  onRemove,
  onUp,
  onDown,
  onCapture,
  onRemoveCapture,
  isLast,
}) {
  const captures = drill.player_media_ids || [];
  return (
    <div
      className="card-tactical"
      data-testid={`ip-drill-${index}`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3">
          <div className="font-display text-3xl text-[#FFCD00] leading-none">
            {String(index + 1).padStart(2, "0")}
          </div>
          <div>
            <div className="font-display text-xl uppercase tracking-wide leading-tight">
              {drill.name}
            </div>
            <div className="text-xs uppercase tracking-[0.2em] text-white/50 mt-1">
              {drill.category} · Level {drill.level} · {drill.duration} min
              {drill.custom && " · Coach's Own"}
            </div>
          </div>
        </div>
        {mode === "edit" && (
          <div className="flex items-center gap-1 no-print">
            <button
              onClick={onUp}
              disabled={index === 0}
              data-testid={`ip-drill-up-${index}`}
              className="p-1.5 text-white/50 hover:text-[#FFCD00] disabled:opacity-30"
              aria-label="Move up"
            >
              <ArrowUp size={14} />
            </button>
            <button
              onClick={onDown}
              disabled={isLast}
              data-testid={`ip-drill-down-${index}`}
              className="p-1.5 text-white/50 hover:text-[#FFCD00] disabled:opacity-30"
              aria-label="Move down"
            >
              <ArrowDown size={14} />
            </button>
            <button
              onClick={onRemove}
              data-testid={`ip-drill-remove-${index}`}
              className="p-1.5 text-white/50 hover:text-red-400"
              aria-label="Remove drill"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>

      {drill.description && (
        <p className="text-sm text-white/70 mb-3">{drill.description}</p>
      )}

      <KeyPoints drillId={drill.id} category={drill.category} />

      {drill.coach_notes && (
        <div className="mt-3 border-l-2 border-[#FFCD00] pl-3">
          <div className="text-[10px] uppercase tracking-[0.25em] text-[#FFCD00] font-bold mb-1">
            Coach's Notes
          </div>
          <p className="text-sm text-white/70">{drill.coach_notes}</p>
        </div>
      )}

      {/* Coach-pre-attached reference media */}
      {drill.media_id && (
        <div className="mt-4">
          <div className="text-[10px] uppercase tracking-[0.25em] text-white/50 font-bold mb-2">
            Coach's Reference
          </div>
          <CoachRef mediaId={drill.media_id} />
        </div>
      )}

      {/* Captures during session (run mode + edit mode both show, but only run mode can capture) */}
      <div className="mt-5 border-t border-white/10 pt-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-[10px] uppercase tracking-[0.25em] text-white/50 font-bold">
            Session Captures ({captures.length})
          </div>
          {mode === "run" && (
            <div className="flex items-center gap-2 no-print">
              <CaptureButton
                label="Photo"
                icon={<Camera size={13} />}
                accept="image/*"
                capture="environment"
                testId={`ip-capture-photo-${index}`}
                onUploaded={onCapture}
              />
              <CaptureButton
                label="Video"
                icon={<VideoIcon size={13} />}
                accept="video/*"
                capture="environment"
                testId={`ip-capture-video-${index}`}
                onUploaded={onCapture}
              />
            </div>
          )}
        </div>
        {captures.length === 0 ? (
          <div className="text-xs text-white/40 italic">
            {mode === "run"
              ? "Tap Photo or Video to capture directly from your phone camera."
              : "No captures yet."}
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {captures.map((mid) => (
              <CaptureThumb
                key={mid}
                mediaId={mid}
                onRemove={() => onRemoveCapture(mid)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CoachRef({ mediaId }) {
  const [isVideo, setIsVideo] = useState(false);
  const token =
    typeof window !== "undefined" ? localStorage.getItem("cm_token") : null;
  const src = `${API}/media/${mediaId}${token ? `?auth=${token}` : ""}`;
  if (isVideo) {
    return (
      <video
        src={src}
        controls
        preload="metadata"
        className="w-full max-w-md rounded-sm border border-white/10"
        data-testid="coach-ref-video"
      />
    );
  }
  return (
    <img
      src={src}
      alt=""
      className="w-full max-w-md rounded-sm border border-white/10 object-cover"
      onError={() => setIsVideo(true)}
      data-testid="coach-ref-image"
    />
  );
}

function CaptureThumb({ mediaId, onRemove }) {
  const [isVideo, setIsVideo] = useState(false);
  const token =
    typeof window !== "undefined" ? localStorage.getItem("cm_token") : null;
  const src = `${API}/media/${mediaId}${token ? `?auth=${token}` : ""}`;
  return (
    <div className="relative aspect-square border border-white/10 bg-black/40 rounded-sm overflow-hidden group">
      {isVideo ? (
        <video
          src={src}
          controls
          preload="metadata"
          className="w-full h-full object-cover"
        />
      ) : (
        <img
          src={src}
          alt=""
          className="w-full h-full object-cover"
          onError={() => setIsVideo(true)}
        />
      )}
      <button
        data-testid={`ip-capture-remove-${mediaId}`}
        onClick={onRemove}
        className="absolute top-1 right-1 w-6 h-6 bg-black/80 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100"
        aria-label="Remove capture"
      >
        <Trash2 size={12} />
      </button>
    </div>
  );
}

/**
 * CaptureButton — a native camera trigger that uploads to the backend as
 * kind='player-capture', then calls onUploaded with the new media id.
 */
function CaptureButton({ label, icon, accept, capture, testId, onUploaded }) {
  const [busy, setBusy] = useState(false);
  const inputId = `capture-${testId}`;

  const handle = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("kind", "player-capture");
      const { data } = await api.post("/media/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onUploaded(data.id);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Capture failed");
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  };

  return (
    <>
      <label
        htmlFor={inputId}
        data-testid={testId}
        className={`btn-ghost cursor-pointer text-xs !py-1.5 ${
          busy ? "opacity-50 pointer-events-none" : ""
        }`}
      >
        {icon} {busy ? "..." : label}
      </label>
      <input
        id={inputId}
        type="file"
        accept={accept}
        capture={capture}
        onChange={handle}
        className="hidden"
      />
    </>
  );
}
