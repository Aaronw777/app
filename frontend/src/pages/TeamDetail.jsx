import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "@/lib/api";
import { ArrowLeft, Plus, UserMinus, Check, Printer } from "lucide-react";
import { toast } from "sonner";

export default function TeamDetail() {
  const { id } = useParams();
  const [team, setTeam] = useState(null);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [saving, setSaving] = useState(false);

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

  const addPlayer = async (e) => {
    e.preventDefault();
    if (!newPlayerName.trim()) return;
    setSaving(true);
    try {
      await api.post(`/teams/${id}/players`, { name: newPlayerName.trim() });
      setNewPlayerName("");
      toast.success("Player added");
      load();
    } catch {
      toast.error("Failed to add player");
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

      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
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
        <button
          data-testid="team-print-btn"
          onClick={() => window.print()}
          className="btn-ghost no-print"
        >
          <Printer size={14} /> Print Roster
        </button>
      </div>

      {/* Add player */}
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
                      {p.player_name}
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
                      <button
                        data-testid={`roster-remove-${p.player_id}`}
                        onClick={() => removePlayer(p.player_id)}
                        className="text-white/30 hover:text-red-400 transition-colors"
                        aria-label="Remove player"
                      >
                        <UserMinus size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
