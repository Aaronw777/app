import { useEffect, useState } from "react";
import { X, Save, Trophy, Calendar } from "lucide-react";
import MediaUpload from "@/components/MediaUpload";
import { api } from "@/lib/api";
import { toast } from "sonner";

const STAT_FIELDS = [
  { key: "games_played", label: "Games Played", accent: "text-white" },
  { key: "points_3s", label: "3-Pointers", accent: "text-[#FFCD00]" },
  { key: "points_2s", label: "2-Pointers", accent: "text-[#FFCD00]" },
  { key: "points_1s", label: "Free Throws", accent: "text-[#FFCD00]" },
  { key: "total_fouls", label: "Total Fouls", accent: "text-red-400" },
];

/**
 * PlayerBioCard — tap-through profile modal with jersey #, position, live
 * season stats and attendance history. Read-only for assistants, editable
 * for the head coach (isOwner=true).
 */
export default function PlayerBioCard({
  teamId,
  player,
  isOwner,
  sessions = [],
  onClose,
  onSaved,
}) {
  const [form, setForm] = useState({
    name: player.player_name || "",
    number: player.number || "",
    position: player.position || "",
    stats: {
      games_played: player.stats?.games_played || 0,
      points_3s: player.stats?.points_3s || 0,
      points_2s: player.stats?.points_2s || 0,
      points_1s: player.stats?.points_1s || 0,
      total_fouls: player.stats?.total_fouls || 0,
    },
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const esc = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onClose]);

  const totalPoints =
    form.stats.points_3s * 3 + form.stats.points_2s * 2 + form.stats.points_1s;

  const attendance = Array.isArray(player.attendance) ? player.attendance : [];

  const save = async () => {
    setSaving(true);
    try {
      await api.patch(`/teams/${teamId}/players/${player.player_id}`, form);
      toast.success("Player saved");
      onSaved?.();
      onClose();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const updatePhoto = async (mediaId) => {
    try {
      await api.patch(`/teams/${teamId}/players/${player.player_id}/photo`, {
        photo_media_id: mediaId,
      });
      onSaved?.();
    } catch {
      toast.error("Failed to save photo");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      data-testid="player-bio-modal"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-2xl bg-[#141414] border border-white/10 rounded-sm max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            <MediaUpload
              kind="player-photo"
              value={player.photo_media_id}
              onChange={updatePhoto}
              accept="image/*"
              size="lg"
            />
            <div>
              <div className="tag tag-gold mb-2">Player Profile</div>
              <div className="font-display text-3xl md:text-4xl uppercase leading-none">
                {form.name || "Player"}
              </div>
              <div className="text-xs uppercase tracking-[0.2em] text-white/50 mt-2">
                #{form.number || "--"} · {form.position || "Position"} · {isOwner ? "Head Coach" : "Assistant view"}
              </div>
            </div>
          </div>
          <button
            data-testid="player-bio-close"
            onClick={onClose}
            className="text-white/40 hover:text-white p-2"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Bio fields */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field
              label="Name"
              value={form.name}
              disabled={!isOwner}
              testId="player-name-input"
              onChange={(v) => setForm({ ...form, name: v })}
            />
            <Field
              label="Jersey #"
              value={form.number}
              disabled={!isOwner}
              testId="player-number-input"
              onChange={(v) => setForm({ ...form, number: v })}
              maxLength={6}
            />
            <Field
              label="Position"
              value={form.position}
              disabled={!isOwner}
              testId="player-position-input"
              onChange={(v) => setForm({ ...form, position: v })}
              placeholder="e.g. PG, SF, C"
            />
          </div>

          {/* Stats */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Trophy size={14} className="text-[#FFCD00]" />
              <div className="text-xs uppercase tracking-[0.25em] text-white/60 font-bold">
                Season Stats
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {STAT_FIELDS.map((s) => (
                <StatField
                  key={s.key}
                  label={s.label}
                  accent={s.accent}
                  value={form.stats[s.key]}
                  disabled={!isOwner}
                  testId={`player-stat-${s.key}`}
                  onChange={(v) =>
                    setForm({ ...form, stats: { ...form.stats, [s.key]: v } })
                  }
                />
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-white/50">
              <span>Total Points</span>
              <span
                data-testid="player-total-points"
                className="font-display text-2xl text-[#FFCD00]"
              >
                {totalPoints}
              </span>
            </div>
          </div>

          {/* Attendance history */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Calendar size={14} className="text-[#FFCD00]" />
              <div className="text-xs uppercase tracking-[0.25em] text-white/60 font-bold">
                Training Attendance ({attendance.length}/{sessions.length || 10})
              </div>
            </div>
            {attendance.length === 0 ? (
              <div className="text-sm text-white/40 italic">
                No sessions logged yet — tick a week complete on the board to
                auto-log a training day here.
              </div>
            ) : (
              <div className="space-y-1 max-h-40 overflow-y-auto pr-2" data-testid="player-attendance-log">
                {attendance
                  .slice()
                  .sort((a, b) => (a.week || 0) - (b.week || 0))
                  .map((a) => {
                    const d = a.date ? new Date(a.date) : null;
                    return (
                      <div
                        key={a.week}
                        className="flex items-center justify-between border-b border-white/5 py-1.5 text-sm"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-display text-[#FFCD00] w-10">
                            W{String(a.week).padStart(2, "0")}
                          </span>
                          <span className="text-white/70">
                            {d ? d.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short", year: "numeric" }) : "—"}
                          </span>
                        </div>
                        {a.marked_by_name && (
                          <span className="text-[10px] uppercase tracking-[0.2em] text-white/40">
                            by {a.marked_by_name}
                          </span>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        {isOwner && (
          <div className="flex justify-end gap-3 p-4 border-t border-white/10">
            <button
              data-testid="player-bio-cancel"
              onClick={onClose}
              className="btn-ghost"
            >
              Cancel
            </button>
            <button
              data-testid="player-bio-save"
              onClick={save}
              disabled={saving}
              className="btn-primary disabled:opacity-50"
            >
              <Save size={14} /> {saving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, disabled, testId, maxLength, placeholder }) {
  return (
    <div>
      <label className="text-[10px] uppercase tracking-[0.25em] text-white/50 font-bold mb-1 block">
        {label}
      </label>
      <input
        data-testid={testId}
        disabled={disabled}
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-black/40 border border-white/10 focus:border-[#FFCD00] focus:outline-none px-3 py-2 rounded-sm text-white text-sm disabled:opacity-60 disabled:cursor-not-allowed"
      />
    </div>
  );
}

function StatField({ label, value, onChange, disabled, testId, accent }) {
  return (
    <div className="text-center bg-black/40 border border-white/10 rounded-sm p-3">
      <div className="text-[9px] uppercase tracking-[0.25em] text-white/50 font-bold mb-1">
        {label}
      </div>
      <input
        data-testid={testId}
        disabled={disabled}
        type="number"
        min="0"
        max="99999"
        value={value}
        onChange={(e) => {
          const n = parseInt(e.target.value || "0", 10);
          onChange(Number.isFinite(n) ? Math.max(0, n) : 0);
        }}
        className={`w-full bg-transparent font-display text-3xl text-center focus:outline-none ${accent} disabled:opacity-70`}
      />
    </div>
  );
}
