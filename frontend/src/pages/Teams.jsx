import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { Plus, Users, ChevronRight, Trash2, LogIn } from "lucide-react";
import { toast } from "sonner";

export default function Teams() {
  const [teams, setTeams] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [joining, setJoining] = useState(false);
  const [form, setForm] = useState({ name: "", program_id: "" });
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    try {
      const [t, p] = await Promise.all([api.get("/teams"), api.get("/programs")]);
      setTeams(t.data);
      setPrograms(p.data);
      if (p.data.length && !form.program_id) {
        setForm((f) => ({ ...f, program_id: p.data[0].id }));
      }
    } catch {
      toast.error("Failed to load teams");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, []);

  const create = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post("/teams", form);
      toast.success("Team created");
      navigate(`/teams/${data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to create team");
    }
  };

  const remove = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm("Delete this team?")) return;
    try {
      await api.delete(`/teams/${id}`);
      toast.success("Team deleted");
      load();
    } catch {
      toast.error("Delete failed");
    }
  };

  const join = async (e) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;
    setJoining(true);
    try {
      const { data } = await api.post("/teams/join", { code: inviteCode.trim() });
      toast.success(data.already_member ? "Already on this team" : "Joined team");
      setInviteCode("");
      setShowJoin(false);
      navigate(`/teams/${data.team_id}`);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Invalid code");
    } finally {
      setJoining(false);
    }
  };

  const leave = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm("Leave this team? You will lose assistant access.")) return;
    try {
      await api.post(`/teams/${id}/leave`);
      toast.success("Left team");
      load();
    } catch {
      toast.error("Leave failed");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-16" data-testid="teams-page">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
        <div>
          <div className="tag tag-gold mb-3">Team Rosters</div>
          <h1 className="font-display text-4xl md:text-6xl uppercase tracking-tight leading-none">
            Squad <span className="text-[#FFCD00]">Board</span>
          </h1>
          <p className="text-white/60 mt-3 max-w-xl">
            Group your players under one program and track each player&apos;s progress on the same board.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            data-testid="teams-join-btn"
            onClick={() => setShowJoin((s) => !s)}
            className="btn-ghost"
          >
            <LogIn size={16} /> Join Team
          </button>
          <button
            data-testid="teams-new-btn"
            onClick={() => setShowForm((s) => !s)}
            className="btn-primary"
            disabled={programs.length === 0}
          >
            <Plus size={16} /> New Team
          </button>
        </div>
      </div>

      {showJoin && (
        <form
          onSubmit={join}
          className="card-tactical mb-6 flex flex-col sm:flex-row gap-3 items-stretch sm:items-end"
          data-testid="teams-join-form"
        >
          <div className="flex-1">
            <label className="text-xs uppercase tracking-[0.25em] text-white/60 mb-2 block">
              Assistant Invite Code
            </label>
            <input
              data-testid="teams-join-code-input"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              inputMode="numeric"
              placeholder="6-digit code from head coach"
              className="w-full bg-black/40 border border-white/10 focus:border-[#FFCD00] focus:outline-none px-4 py-3 rounded-sm text-white font-display text-xl tracking-[0.3em]"
            />
          </div>
          <button
            type="submit"
            data-testid="teams-join-submit"
            disabled={joining || inviteCode.length < 4}
            className="btn-primary disabled:opacity-50"
          >
            <LogIn size={14} /> {joining ? "Joining..." : "Join"}
          </button>
        </form>
      )}

      {programs.length === 0 && (
        <div className="card-tactical mb-6">
          <div className="font-display uppercase text-xl mb-1">
            Build a program first
          </div>
          <p className="text-white/60 mb-4">
            Teams share a training program. Create one to unlock the team roster.
          </p>
          <Link to="/build" className="btn-primary inline-flex" data-testid="teams-empty-build-link">
            <Plus size={14} /> Create Program
          </Link>
        </div>
      )}

      {showForm && programs.length > 0 && (
        <form
          onSubmit={create}
          className="card-tactical mb-8 space-y-4"
          data-testid="teams-create-form"
        >
          <div>
            <label className="text-xs uppercase tracking-[0.25em] text-white/60 mb-2 block">
              Team Name
            </label>
            <input
              data-testid="teams-name-input"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Under-12 Wolves"
              className="w-full bg-black/40 border border-white/10 focus:border-[#FFCD00] focus:outline-none px-4 py-3 rounded-sm text-white"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.25em] text-white/60 mb-2 block">
              Training Program
            </label>
            <select
              data-testid="teams-program-select"
              required
              value={form.program_id}
              onChange={(e) => setForm({ ...form, program_id: e.target.value })}
              className="w-full bg-black/40 border border-white/10 focus:border-[#FFCD00] focus:outline-none px-4 py-3 rounded-sm text-white"
            >
              {programs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.player_name} · {p.skill_level} · age {p.starting_age}
                </option>
              ))}
            </select>
          </div>
          <button data-testid="teams-create-submit" type="submit" className="btn-primary">
            Create Team
          </button>
        </form>
      )}

      {loading ? (
        <div className="text-white/40 uppercase tracking-[0.3em] text-sm">Loading...</div>
      ) : teams.length === 0 ? (
        <div className="card-tactical text-center py-16">
          <Users size={32} className="mx-auto text-white/30 mb-3" />
          <div className="font-display text-2xl uppercase text-white/80 mb-1">
            No teams yet
          </div>
          <p className="text-white/50">
            Group a squad and track every player&apos;s week-by-week progress.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 stagger">
          {teams.map((t) => {
            const isAssistant = t.role === "assistant";
            return (
              <Link
                key={t.id}
                to={`/teams/${t.id}`}
                data-testid={`team-card-${t.id}`}
                className="card-tactical block group relative"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {isAssistant && (
                        <span className="tag tag-gold text-[9px]" data-testid={`team-role-tag-${t.id}`}>
                          Assistant
                        </span>
                      )}
                    </div>
                    <div className="font-display text-2xl uppercase tracking-wide leading-tight">
                      {t.name}
                    </div>
                    <div className="text-xs uppercase tracking-[0.2em] text-white/50 mt-1">
                      {t.program_name} · {t.program_skill_level}
                    </div>
                  </div>
                  {isAssistant ? (
                    <button
                      data-testid={`team-leave-${t.id}`}
                      onClick={(e) => leave(t.id, e)}
                      className="text-white/30 hover:text-red-400 transition-colors p-1"
                      aria-label="Leave team"
                      title="Leave team"
                    >
                      <LogIn size={16} className="rotate-180" />
                    </button>
                  ) : (
                    <button
                      data-testid={`team-delete-${t.id}`}
                      onClick={(e) => remove(t.id, e)}
                      className="text-white/30 hover:text-red-400 transition-colors p-1"
                      aria-label="Delete team"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                <div className="flex items-end justify-between mb-4">
                  <div>
                    <div className="text-xs uppercase tracking-[0.2em] text-white/50">Roster</div>
                    <div className="font-display text-3xl text-[#FFCD00]">{t.roster_count}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs uppercase tracking-[0.2em] text-white/50">Weeks</div>
                    <div className="font-display text-3xl">{t.total_weeks}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs uppercase tracking-[0.2em] text-white/60 group-hover:text-[#FFCD00] transition-colors">
                  Open board <ChevronRight size={12} />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
