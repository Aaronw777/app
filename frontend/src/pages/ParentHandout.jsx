import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "@/lib/api";
import { Printer, ArrowLeft, Star } from "lucide-react";
import TechniqueIllustration from "@/components/TechniqueIllustration";

/**
 * ParentHandout — one-page kid-friendly session sheet designed for at-home
 * reference. Especially aimed at Aussie-Hoops / Mini-Ballers parents.
 */
export default function ParentHandout() {
  const { id, week } = useParams();
  const weekNum = parseInt(week, 10);
  const [program, setProgram] = useState(null);

  useEffect(() => {
    api.get(`/programs/${id}`).then(({ data }) => setProgram(data)).catch(() => {});
  }, [id]);

  if (!program)
    return <div className="max-w-4xl mx-auto px-6 py-16 text-white/40 uppercase tracking-[0.3em]">Loading...</div>;

  const session = program.sessions.find((s) => s.week === weekNum);
  if (!session) return <div className="max-w-4xl mx-auto px-6 py-16">Session not found.</div>;

  const isMini = program.skill_level === "mini_ballers";

  return (
    <div className="max-w-4xl mx-auto px-6 py-12" data-testid="parent-handout-page">
      <div className="no-print flex items-center justify-between mb-8">
        <Link
          to={`/programs/${id}/week/${weekNum}`}
          className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/60 hover:text-[#FFCD00]"
          data-testid="handout-back-link"
        >
          <ArrowLeft size={14} /> Back to session
        </Link>
        <button
          data-testid="handout-print-btn"
          onClick={() => window.print()}
          className="btn-primary"
        >
          <Printer size={14} /> Print Handout
        </button>
      </div>

      {/* Printable sheet */}
      <div className="bg-white text-black p-8 print:p-4 rounded-sm print:rounded-none">
        <div className="border-b-4 border-black pb-4 mb-6 flex items-end justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] font-bold">
              {isMini ? "Aussie-Hoops-Style Home Sheet" : "Family Training Sheet"}
            </div>
            <h1
              className="font-display text-4xl md:text-5xl uppercase tracking-tight leading-none mt-2"
              style={{ color: "#000" }}
            >
              Week {weekNum}: {session.theme}
            </h1>
            <div className="text-sm mt-2">
              For <strong>{program.player_name}</strong> · About {session.total_minutes} minutes of fun
            </div>
          </div>
          <div
            className="w-16 h-16 border-4 border-black flex items-center justify-center"
            aria-hidden="true"
          >
            <div className="font-display text-3xl">🏀</div>
          </div>
        </div>

        {isMini && (
          <div className="mb-6 bg-yellow-100 border border-black p-4 rounded-sm">
            <div className="font-display uppercase text-lg tracking-wide">
              Grown-up tips
            </div>
            <ul className="text-sm mt-2 space-y-1 list-disc list-inside">
              <li>Use a soft or size 4-5 basketball — smaller ball, bigger smile.</li>
              <li>Lower the ring to 2 m if you can (bin, laundry basket, low hoop).</li>
              <li>Celebrate effort every 30 seconds. Cheering beats coaching.</li>
              <li>Stop when they lose focus — short and joyful is the goal.</li>
            </ul>
          </div>
        )}

        <div className="space-y-4">
          {session.drills.map((d, idx) => (
            <div
              key={`${d.id}-${idx}`}
              data-testid={`handout-drill-${d.id}`}
              className="border-2 border-black p-4 rounded-sm break-inside-avoid"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-xs uppercase font-bold tracking-widest">
                    <span
                      className="inline-flex items-center justify-center w-6 h-6 bg-black text-white font-display"
                      aria-hidden="true"
                    >
                      {idx + 1}
                    </span>
                    <span>{d.category}</span>
                    <span>· {d.duration} min</span>
                  </div>
                  <h3 className="font-display text-2xl uppercase tracking-wide mt-2">
                    {d.name}
                  </h3>
                  <p className="text-sm mt-2 leading-relaxed">{d.description}</p>
                  <div className="mt-3 text-xs italic">
                    <strong className="not-italic">Coach hint:</strong>{" "}
                    {d.coach_notes}
                  </div>
                  <div className="mt-3">
                    <TechniqueIllustration category={d.category} />
                  </div>
                  {(() => {
                    const q = encodeURIComponent(`${d.name} basketball drill tutorial`);
                    const url = `https://www.youtube.com/results?search_query=${q}`;
                    return (
                      <div className="mt-2 text-xs">
                        <strong>YouTube example:</strong>{" "}
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          data-testid={`handout-video-${d.id}`}
                          className="underline break-all"
                        >
                          {url}
                        </a>
                      </div>
                    );
                  })()}
                </div>
                <div className="flex flex-col items-center gap-1">
                  {[1, 2, 3].map((n) => (
                    <Star
                      key={n}
                      size={22}
                      className="text-black"
                      strokeWidth={2}
                    />
                  ))}
                  <div className="text-[10px] uppercase tracking-widest font-bold mt-1">
                    Rate it
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t-2 border-black text-sm">
          <div className="font-display uppercase text-lg">This week I felt...</div>
          <div className="mt-2 grid grid-cols-3 gap-3 text-center">
            {["😀 Happy", "💪 Strong", "🤩 Proud"].map((t) => (
              <div key={t} className="border border-black py-2">
                {t}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 text-[10px] uppercase tracking-widest text-center opacity-70">
          Court Mastery · Independent training tool · Not affiliated with Basketball Australia, NBL, WNBL, Aussie Hoops or FIBA
        </div>
      </div>
    </div>
  );
}
