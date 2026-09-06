import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "@/lib/api";
import { ArrowLeft, Plus, UserMinus, Check, Printer, Copy, RefreshCw, UserPlus } from "lucide-react";
import { toast } from "sonner";
import MediaUpload, { MediaImage } from "@/components/MediaUpload";
import PlayerBioCard from "@/components/PlayerBioCard";

export default function TeamDetail() {
  const { id } = useParams();
  const [team, setTeam] = useState(null);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [saving, setSaving] = useState(false);
  const [bioPlayer, setBioPlayer] = useState(null);
  const [showInvite, setShowInvite] = useState(false);

  const load = async () => {
    try {
      const { data } = await api.get(`/teams/${id}`);
      setTeam(data);
    } catch {
      toast.error("Failed to load team");
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [id]);

  if (!team)
    return (
      <div className="max-w-7xl mx-auto px-6 py-16 text-white/40 uppercase tracking-[0.3em]">
        Loading...
      </div>
    );

  const sessions = team.program?.sessions_summary || [];
  const isOwner = team.role !== "assistant";

  const addPlayer = async (e) => {
    e.preventDefault();
    if (!newPlayerName.trim()) return;
    setSaving(true);
    try {
      await api.post(`/teams/${id}/players`, { name: newPlayerName.trim() });
      setNewPlayerName("");
      toast.success("Player added");
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to add player");
    } finally {
      setSaving(false);
    }
  };

  const removePlayer = async (player_id) => {
    if (!window.confirm("Remove this player from the team?")) return;
    try {
      await api.delete(`/teams/${id}/players/${player_id}`);
      toast.success("Player removed");
      load();
    } catch {
      toast.error("Failed to remove player");
    }
  };

  const copyInvite = async () => {
    if (!team.invite_code) return;
    try {
      await navigator.clipboard.writeText(team.invite_code);
      toast.success("Invite code copied");
    } catch {
      toast.info(`Code: ${team.invite_code}`);
    }
  };

  const rotateInvite = async () => {
    if (!window.confirm("Generate a new invite code? The old code will stop working."))
      return;
    try {
      const { data } = await api.post(`/teams/${id}/invite-code/rotate`);
      setTeam((t) => ({ ...t, invite_code: data.invite_code }));
      toast.success("New invite code generated");
    } catch {
      toast.error("Rotate failed");
    }
  };

  const removeAssistant = async (assistantId) => {
    if (!window.confirm("Revoke this assistant coach's access?")) return;
    try {
      await api.delete(`/teams/${id}/assistants/${assistantId}`);
      toast.success("Assistant removed");
      load();
    } catch {
      toast.error("Remove failed");
    }
  };

  const toggleCell = async (player_id, week, current) => {
    // Optimistic update
    setTeam((t) => {
      if (!t) return t;
      const roster = t.roster.map((p) => {
        if (p.player_id !== player_id) return p;
        const sess = { ...(p.sessions || {}) };
        const entry = sess[String(week)] || { completed: false, notes: "" };
        sess[String(week)] = { ...entry, completed: !current };
        return { ...p, sessions: sess };
      });
      return { ...t, roster };
    });
    try {
      await api.patch(`/teams/${id}/players/${player_id}/sessions/${week}`, {
        completed: !current,
      });
    } catch {
      toast.error("Update failed");
      load();
    }
  };

  const playerCompleted = (p) =>
    Object.values(p.sessions || {}).filter((s) => s.completed).length;

  return (
    <div className="max-w-7xl mx-auto px-6 py-16" data-testid="team-detail-page">
      <Link
        to="/teams"
        className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/60 hover:text-[#FFCD00] mb-6 no-print"
        data-testid="team-back-link"
      >
        <ArrowLeft size={14} /> All Teams
      </Link>

      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-10">
        <div className="flex items-start gap-5">
          <div className="no-print">
            {isOwner ? (
              <MediaUpload
                kind="team-logo"
                value={team.logo_media_id}
                onChange={async (id) => {
                  try {
                    await api.patch(`/teams/${team.id}/logo`, { logo_media_id: id });
                    setTeam((t) => ({ ...t, logo_media_id: id }));
                  } catch {
                    toast.error("Failed to save logo");
                  }
                }}
                accept="image/*"
                size="lg"
              />
            ) : team.logo_media_id ? (
              <MediaImage
                mediaId={team.logo_media_id}
                className="w-40 h-40 object-cover border border-white/10"
                alt=""
              />
            ) : (
              <div className="w-40 h-40 border border-white/10 flex items-center justify-center text-white/40 text-[10px] uppercase tracking-[0.25em]">
                No logo
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="tag tag-gold">Team Roster</span>
              {team.program?.skill_level && (
                <span className="tag">{team.program.skill_level}</span>
              )}
            </div>
            <h1 className="font-display text-4xl md:text-6xl uppercase tracking-tight leading-none">
              {team.name}
            </h1>
            <p className="text-white/60 mt-3">
              Program:{" "}
              <Link
                to={`/programs/${team.program_id}`}
                className="text-[#FFCD00] hover:underline"
              >
                {team.program?.player_name || "Deleted program"}
              </Link>{" "}
              · {sessions.length} weeks
            </p>
          </div>
        </div>
        <button
          data-testid="team-print-btn"
          onClick={() => window.print()}
          className="btn-ghost no-print"
        >
          <Printer size={14} /> Print Roster
        </button>
      </div>

      {/* Owner-only invite panel */}
      {isOwner && (
        <div
          className="card-tactical mb-6 no-print"
          data-testid="invite-panel"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <UserPlus size={14} className="text-[#FFCD00]" />
                <div className="text-xs uppercase tracking-[0.25em] text-white/60 font-bold">
                  Assistant Coach Invite
                </div>
              </div>
              <div className="text-sm text-white/60">
                Share this 6-digit code with an assistant. They register on
                Court Mastery, tap <em>Join Team</em> and enter the code.
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                data-testid="invite-code-copy"
                onClick={() => setShowInvite((s) => !s)}
                onDoubleClick={copyInvite}
                className="font-display text-3xl tracking-[0.35em] text-[#FFCD00] hover:text-white transition-colors border border-dashed border-white/15 px-4 py-2 rounded-sm"
                title="Click to reveal / double-click to copy"
              >
                {showInvite ? team.invite_code : "••••••"}
              </button>
              <button
                data-testid="invite-code-copy-btn"
                onClick={copyInvite}
                className="btn-ghost"
                aria-label="Copy invite code"
              >
                <Copy size={14} /> Copy
              </button>
              <button
                data-testid="invite-code-rotate-btn"
                onClick={rotateInvite}
                className="btn-ghost"
                aria-label="Rotate invite code"
              >
                <RefreshCw size={14} /> Rotate
              </button>
            </div>
          </div>
          {team.assistants && team.assistants.length > 0 && (
            <div className="mt-5 border-t border-white/10 pt-4">
              <div className="text-[10px] uppercase tracking-[0.25em] text-white/50 font-bold mb-2">
                Current Assistant Coaches ({team.assistants.length})
              </div>
              <div className="flex flex-wrap gap-2">
                {team.assistants.map((a) => (
                  <div
                    key={a.id}
                    data-testid={`assistant-chip-${a.id}`}
                    className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-sm px-3 py-1.5 text-sm"
                  >
                    <span className="text-white/80">{a.name || a.email}</span>
                    <button
                      data-testid={`assistant-remove-${a.id}`}
                      onClick={() => removeAssistant(a.id)}
                      className="text-white/40 hover:text-red-400"
                      aria-label="Remove assistant"
                    >
                      <UserMinus size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Read-only banner for assistants */}
      {!isOwner && (
        <div
          className="card-tactical mb-6 no-print border-l-4 border-[#FFCD00]"
          data-testid="assistant-banner"
        >
          <div className="text-xs uppercase tracking-[0.25em] text-[#FFCD00] font-bold mb-1">
            Assistant Coach Access
          </div>
          <div className="text-sm text-white/70">
            You can mark attendance and update player photos. Only the head
            coach can add/remove players or edit season stats.
          </div>
        </div>
      )}

      {/* Add player (owner only) */}
      {isOwner && (
        <form
          onSubmit={addPlayer}
          className="card-tactical mb-8 flex flex-col sm:flex-row gap-3 items-stretch sm:items-end no-print"
          data-testid="team-add-form"
        >
          <div className="flex-1">
            <label className="text-xs uppercase tracking-[0.25em] text-white/60 mb-2 block">
              Add Player
            </label>
            <input
              data-testid="team-add-name-input"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              placeholder="Player name"
              className="w-full bg-black/40 border border-white/10 focus:border-[#FFCD00] focus:outline-none px-4 py-3 rounded-sm text-white"
            />
          </div>
          <button
            type="submit"
            data-testid="team-add-submit"
            disabled={saving || !newPlayerName.trim()}
            className="btn-primary disabled:opacity-50"
          >
            <Plus size={14} /> Add
          </button>
        </form>
      )}

      {/* Grid */}
      {team.roster.length === 0 ? (
        <div className="card-tactical text-center py-12">
          <div className="font-display text-2xl uppercase text-white/80 mb-1">
            Empty roster
          </div>
          <p className="text-white/50">Add players above to start tracking progress.</p>
        </div>
      ) : (
        <div className="overflow-x-auto card-tactical" style={{ padding: 0 }}>
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="border-b border-white/10 text-left">
                <th className="p-3 text-xs uppercase tracking-[0.2em] text-white/50 font-bold sticky left-0 bg-[#141414] z-10">
                  Player
                </th>
                {sessions.map((s) => (
                  <th
                    key={s.week}
                    className="p-3 text-center text-xs uppercase tracking-[0.2em] text-white/50 font-bold whitespace-nowrap"
                    title={s.theme}
                  >
                    W{String(s.week).padStart(2, "0")}
                  </th>
                ))}
                <th className="p-3 text-center text-xs uppercase tracking-[0.2em] text-[#FFCD00] font-bold">
                  Done
                </th>
                <th className="p-3 no-print" />
              </tr>
            </thead>
            <tbody>
              {team.roster.map((p) => {
                const done = playerCompleted(p);
                return (
                  <tr
                    key={p.player_id}
                    data-testid={`roster-row-${p.player_id}`}
                    className="border-b border-white/5 hover:bg-white/[0.02]"
                  >
                    <td className="p-3 font-display uppercase tracking-wide sticky left-0 bg-[#141414] z-10">
                      <button
                        type="button"
                        data-testid={`roster-open-bio-${p.player_id}`}
                        onClick={() => setBioPlayer(p)}
                        className="flex items-center gap-3 group text-left"
                      >
                        <MediaImage
                          mediaId={p.photo_media_id}
                          className="w-10 h-10 object-cover border border-white/10 group-hover:border-[#FFCD00] transition-colors"
                          alt=""
                        />
                        {!p.photo_media_id && (
                          <div className="w-10 h-10 border border-white/10 flex items-center justify-center text-[10px] text-white/40 uppercase group-hover:border-[#FFCD00] group-hover:text-[#FFCD00] transition-colors">
                            {(p.number && `#${p.number}`) || p.player_name?.[0] || "?"}
                          </div>
                        )}
                        <div>
                          <div className="group-hover:text-[#FFCD00] transition-colors">
                            {p.player_name}
                          </div>
                          {(p.number || p.position) && (
                            <div className="text-[10px] tracking-[0.2em] text-white/40 normal-case">
                              {p.number && `#${p.number}`}
                              {p.number && p.position && " · "}
                              {p.position}
                            </div>
                          )}
                        </div>
                      </button>
                    </td>
                    {sessions.map((s) => {
                      const cell = (p.sessions || {})[String(s.week)] || {};
                      const completed = !!cell.completed;
                      return (
                        <td key={s.week} className="p-2 text-center">
                          <button
                            data-testid={`roster-cell-${p.player_id}-${s.week}`}
                            onClick={() => toggleCell(p.player_id, s.week, completed)}
                            className={`w-8 h-8 rounded-sm border transition-colors flex items-center justify-center mx-auto ${
                              completed
                                ? "bg-[#FFCD00] border-[#FFCD00] text-black"
                                : "border-white/15 hover:border-[#FFCD00] text-white/30"
                            }`}
                            aria-label={`Week ${s.week} ${completed ? "completed" : "not completed"}`}
                          >
                            {completed && <Check size={14} strokeWidth={3} />}
                          </button>
                        </td>
                      );
                    })}
                    <td className="p-3 text-center font-display text-lg text-[#FFCD00]">
                      {done}/{sessions.length}
                    </td>
                    <td className="p-3 text-right no-print">
                      {isOwner && (
                        <button
                          data-testid={`roster-remove-${p.player_id}`}
                          onClick={() => removePlayer(p.player_id)}
                          className="text-white/30 hover:text-red-400 transition-colors"
                          aria-label="Remove player"
                        >
                          <UserMinus size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {bioPlayer && (
        <PlayerBioCard
          teamId={team.id}
          player={bioPlayer}
          isOwner={isOwner}
          sessions={sessions}
          onClose={() => setBioPlayer(null)}
          onSaved={load}
        />
      )}
    </div>
  );
}
