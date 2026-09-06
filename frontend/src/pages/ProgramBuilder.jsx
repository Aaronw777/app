import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, formatApiError } from "@/lib/api";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";

const LEVELS = [
  { key: "mini_ballers", label: "Mini-Ballers", desc: "Aussie Hoops kids age 4-7. Ball familiarity & fun games." },
  { key: "fundamental", label: "Fundamental", desc: "Just picking up the ball. Beginner mechanics." },
  { key: "developing", label: "Developing", desc: "Basic drills known. Working on consistency." },
  { key: "intermediate", label: "Intermediate", desc: "Local domestic competition level." },
  { key: "advanced", label: "Advanced", desc: "State / NBL1 aspirant. Complex reads." },
  { key: "expert", label: "Expert", desc: "NBL / WNBL / national team prep." },
];

export default function ProgramBuilder() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    player_name: "",
    gender: "mens",
    starting_age: 8,
    skill_level: "developing",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/programs", form);
      toast.success("Program created!");
      navigate(`/programs/${data.id}`);
    } catch (err) {
      setError(formatApiError(err.response?.data?.detail) || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-16" data-testid="builder-page">
      <div className="tag tag-gold mb-3">Program Builder</div>
      <h1 className="font-display text-4xl md:text-6xl uppercase tracking-tight leading-none">
        Design The <span className="text-[#FFCD00]">Ladder</span>
      </h1>
      <p className="text-white/60 mt-3 mb-12 max-w-2xl">
        Answer four questions. We&apos;ll generate a 10-week, 60-minute-per-session training plan
        aligned to FIBA rules and Basketball Australia&apos;s competitive pathway.
      </p>

      <form onSubmit={submit} className="space-y-10">
        {/* Player Name */}
        <div className="card-tactical">
          <label className="text-xs uppercase tracking-[0.25em] text-white/60 mb-3 block">
            Player Name
          </label>
          <input
            data-testid="builder-player-name-input"
            type="text"
            required
            value={form.player_name}
            onChange={(e) => setForm({ ...form, player_name: e.target.value })}
            placeholder="e.g. Sarah Mitchell"
            className="w-full bg-black/40 border border-white/10 focus:border-[#FFCD00] focus:outline-none px-4 py-3 rounded-sm text-white"
          />
        </div>

        {/* Gender */}
        <div className="card-tactical">
          <label className="text-xs uppercase tracking-[0.25em] text-white/60 mb-4 block">
            Basketball Stream
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { k: "mens", l: "Mens", s: "Boomers / NBL / NBL1 Men" },
              { k: "womens", l: "Womens", s: "Opals / WNBL / NBL1 Women" },
            ].map((g) => (
              <button
                type="button"
                key={g.k}
                data-testid={`builder-gender-${g.k}`}
                onClick={() => setForm({ ...form, gender: g.k })}
                className={`p-5 border rounded-sm text-left transition-colors ${
                  form.gender === g.k
                    ? "border-[#FFCD00] bg-[#FFCD00]/5"
                    : "border-white/10 hover:border-white/30"
                }`}
              >
                <div className={`font-display text-2xl uppercase ${form.gender === g.k ? "text-[#FFCD00]" : "text-white"}`}>
                  {g.l}
                </div>
                <div className="text-xs uppercase tracking-[0.2em] text-white/50 mt-1">
                  {g.s}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Age */}
        <div className="card-tactical">
          <div className="flex items-center justify-between mb-4">
            <label className="text-xs uppercase tracking-[0.25em] text-white/60">Starting Age</label>
            <div className="font-display text-3xl text-[#FFCD00]" data-testid="builder-age-value">
              {form.starting_age}
            </div>
          </div>
          <input
            data-testid="builder-age-slider"
            type="range"
            min="4"
            max="35"
            value={form.starting_age}
            onChange={(e) => setForm({ ...form, starting_age: parseInt(e.target.value) })}
            className="w-full accent-[#FFCD00]"
          />
          <div className="flex justify-between text-xs uppercase tracking-[0.2em] text-white/40 mt-2">
            <span>4</span>
            <span>Aussie Hoops</span>
            <span>Junior (U14)</span>
            <span>Senior</span>
            <span>35+</span>
          </div>
        </div>

        {/* Skill level */}
        <div className="card-tactical">
          <label className="text-xs uppercase tracking-[0.25em] text-white/60 mb-4 block">
            Starting Skill Level
          </label>
          <div className="space-y-2">
            {LEVELS.map((l) => (
              <button
                type="button"
                key={l.key}
                data-testid={`builder-level-${l.key}`}
                onClick={() => setForm({ ...form, skill_level: l.key })}
                className={`w-full p-4 border rounded-sm text-left flex items-center justify-between transition-colors ${
                  form.skill_level === l.key
                    ? "border-[#FFCD00] bg-[#FFCD00]/5"
                    : "border-white/10 hover:border-white/30"
                }`}
              >
                <div>
                  <div className={`font-display text-lg uppercase tracking-wide ${form.skill_level === l.key ? "text-[#FFCD00]" : "text-white"}`}>
                    {l.label}
                  </div>
                  <div className="text-sm text-white/60">{l.desc}</div>
                </div>
                <div className={`w-4 h-4 border rounded-full ${form.skill_level === l.key ? "border-[#FFCD00] bg-[#FFCD00]" : "border-white/30"}`} />
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div data-testid="builder-error" className="text-sm text-red-400 border border-red-500/30 bg-red-500/10 p-3 rounded-sm">
            {error}
          </div>
        )}
        <button
          data-testid="builder-submit-btn"
          type="submit"
          disabled={loading}
          className="btn-primary w-full justify-center disabled:opacity-50"
        >
          {loading ? "Building..." : "Generate 10-Week Program"} <ArrowRight size={16} />
        </button>
      </form>
    </div>
  );
}
