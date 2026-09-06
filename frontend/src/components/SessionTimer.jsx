import { useState, useEffect, useRef } from "react";
import { Play, Pause, SkipForward, SkipBack, RotateCcw } from "lucide-react";

function pad(n) {
  return String(n).padStart(2, "0");
}

export default function SessionTimer({ drills }) {
  const [drillIdx, setDrillIdx] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const audioCtxRef = useRef(null);

  const current = drills[drillIdx];
  const totalSecondsForDrill = current ? current.duration * 60 : 0;

  // Initialise or update seconds when drill index changes
  useEffect(() => {
    setSeconds(current ? current.duration * 60 : 0);
  }, [drillIdx, current]);

  // Beep helper
  const beep = () => {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      if (!audioCtxRef.current) audioCtxRef.current = new Ctx();
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch {
      /* audio not available */
    }
  };

  // Countdown ticker
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          beep();
          // auto-advance
          if (drillIdx < drills.length - 1) {
            setDrillIdx((i) => i + 1);
            return 0; // will be set by effect when drillIdx changes
          }
          setRunning(false);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [running, drillIdx, drills.length]);

  const next = () => {
    if (drillIdx < drills.length - 1) setDrillIdx(drillIdx + 1);
  };
  const prev = () => {
    if (drillIdx > 0) setDrillIdx(drillIdx - 1);
  };
  const reset = () => {
    setRunning(false);
    setDrillIdx(0);
    setSeconds(drills[0]?.duration * 60 || 0);
  };
  const toggle = () => setRunning((r) => !r);

  if (!current) return null;

  const mm = Math.floor(seconds / 60);
  const ss = seconds % 60;
  const pct = totalSecondsForDrill
    ? Math.round(((totalSecondsForDrill - seconds) / totalSecondsForDrill) * 100)
    : 0;

  return (
    <div
      data-testid="session-timer"
      className="card-tactical no-print sticky top-20 z-30 mb-6"
      style={{ padding: "1.25rem 1.5rem" }}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-bold">
            Drill {drillIdx + 1} / {drills.length}
          </div>
          <div className="font-display text-xl uppercase tracking-wide leading-tight mt-1">
            {current.name}
          </div>
        </div>
        <div
          data-testid="session-timer-display"
          className={`font-display text-5xl md:text-6xl leading-none tabular-nums transition-colors ${
            running ? "text-[#FFCD00]" : "text-white/80"
          }`}
        >
          {pad(mm)}:{pad(ss)}
        </div>
      </div>

      <div className="h-1 bg-white/10 rounded-sm overflow-hidden mb-4">
        <div
          className="h-full bg-[#FFCD00] transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <button
          data-testid="timer-toggle-btn"
          onClick={toggle}
          className={running ? "btn-ghost" : "btn-primary"}
          style={{ padding: "0.5rem 1rem" }}
        >
          {running ? (
            <>
              <Pause size={14} /> Pause
            </>
          ) : (
            <>
              <Play size={14} fill="currentColor" /> Start
            </>
          )}
        </button>
        <button
          data-testid="timer-prev-btn"
          onClick={prev}
          disabled={drillIdx === 0}
          className="btn-ghost disabled:opacity-40"
          style={{ padding: "0.5rem 0.85rem" }}
        >
          <SkipBack size={14} />
        </button>
        <button
          data-testid="timer-next-btn"
          onClick={next}
          disabled={drillIdx >= drills.length - 1}
          className="btn-ghost disabled:opacity-40"
          style={{ padding: "0.5rem 0.85rem" }}
        >
          <SkipForward size={14} />
        </button>
        <button
          data-testid="timer-reset-btn"
          onClick={reset}
          className="btn-ghost"
          style={{ padding: "0.5rem 0.85rem" }}
        >
          <RotateCcw size={14} />
        </button>
        <div className="ml-auto text-xs uppercase tracking-[0.2em] text-white/50">
          {current.duration} min • {current.category}
        </div>
      </div>
    </div>
  );
}
