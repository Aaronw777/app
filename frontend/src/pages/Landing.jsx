import { Link } from "react-router-dom";
import { ArrowRight, Target, Trophy, Users, Zap } from "lucide-react";

export default function Landing() {
  return (
    <div data-testid="landing-page">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 opacity-30">
          <img
            src="https://images.unsplash.com/photo-1620743698514-c66c9a6c767f?auto=format&fit=crop&w=2000&q=80"
            alt="Basketball action"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-36 grid md:grid-cols-12 gap-8">
          <div className="md:col-span-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="tag tag-gold" data-testid="hero-tag">FIBA · NBL · WNBL Pathway</span>
              <span className="tag">Basketball Australia</span>
            </div>
            <h1
              data-testid="hero-title"
              className="font-display text-5xl md:text-7xl lg:text-8xl uppercase tracking-tight leading-[0.9]"
            >
              Build A <span className="text-[#FFCD00]">Player</span>
              <br />
              In 10 Weeks.
            </h1>
            <p className="text-lg md:text-xl text-white/70 max-w-2xl mt-8 leading-relaxed">
              A weekly 1-hour training blueprint that takes any player from{" "}
              <span className="text-[#FFCD00] font-semibold">fundamental</span> to{" "}
              <span className="text-[#FFCD00] font-semibold">expert</span> — engineered
              around FIBA rules and the Basketball Australia pathway to the NBL.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                to="/register"
                data-testid="hero-cta-primary"
                className="btn-primary"
              >
                Build My Program <ArrowRight size={16} />
              </Link>
              <Link to="/login" data-testid="hero-cta-secondary" className="btn-ghost">
                I have an account
              </Link>
            </div>
          </div>
          <div className="md:col-span-4 flex md:justify-end">
            <div className="card-tactical w-full max-w-sm">
              <div className="text-xs uppercase tracking-[0.25em] text-white/50 mb-3">
                Program Preview
              </div>
              <div className="space-y-3">
                {[
                  { w: "Wk 01", t: "Foundations & Footwork" },
                  { w: "Wk 04", t: "Passing & Court Vision" },
                  { w: "Wk 08", t: "Pick-and-Roll Concepts" },
                  { w: "Wk 10", t: "Game Simulation" },
                ].map((r) => (
                  <div key={r.w} className="flex items-center justify-between border-b border-white/10 pb-2 last:border-0">
                    <div className="font-display uppercase tracking-wider text-[#FFCD00] text-sm">
                      {r.w}
                    </div>
                    <div className="text-sm text-white/80">{r.t}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { n: "10", l: "Week Program" },
            { n: "60", l: "Minute Sessions" },
            { n: "40+", l: "Curated Drills" },
            { n: "5", l: "Skill Tiers" },
          ].map((s) => (
            <div key={s.l} className="text-left">
              <div className="font-display text-5xl md:text-6xl text-[#FFCD00] leading-none">
                {s.n}
              </div>
              <div className="text-xs uppercase tracking-[0.25em] text-white/50 mt-2">
                {s.l}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="mb-16 max-w-2xl">
          <div className="tag tag-gold mb-4">Why Court Mastery</div>
          <h2 className="font-display text-4xl md:text-5xl uppercase tracking-tight leading-none">
            Coach-Built.
            <br />
            <span className="text-[#FFCD00]">Athlete Approved.</span>
          </h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              i: Target,
              t: "Personalised Plan",
              d: "Tell us the gender, starting age and skill level. We build the 10-week ladder.",
            },
            {
              i: Trophy,
              t: "NBL Pathway",
              d: "Drills reference Boomers, Opals, NBL1 & WNBL benchmarks used by Basketball Australia.",
            },
            {
              i: Zap,
              t: "Video Illustrations",
              d: "Every drill includes a demo video. No guesswork on technique.",
            },
            {
              i: Users,
              t: "Track & Print",
              d: "Tick off sessions, log coaching notes, export a clean PDF for training day.",
            },
          ].map((f) => (
            <div key={f.t} className="card-tactical">
              <div className="w-10 h-10 bg-[#FFCD00]/10 border border-[#FFCD00]/30 flex items-center justify-center mb-4 rounded-sm">
                <f.i size={18} className="text-[#FFCD00]" />
              </div>
              <div className="font-display text-xl uppercase tracking-wide mb-2">
                {f.t}
              </div>
              <p className="text-white/60 text-sm leading-relaxed">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/10 bg-[#0d0d0d]">
        <div className="max-w-7xl mx-auto px-6 py-20 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <h3 className="font-display text-3xl md:text-4xl uppercase tracking-tight max-w-2xl">
              Your next player pathway starts today.
            </h3>
            <p className="text-white/60 mt-3">Free to build. Save unlimited programs.</p>
          </div>
          <Link to="/register" data-testid="cta-bottom-btn" className="btn-primary">
            Get Started <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
