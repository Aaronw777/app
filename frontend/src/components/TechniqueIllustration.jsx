/**
 * TechniqueIllustration — quick visual cheat-sheet showing the KEY body / technique
 * cue for the drill's category. Different aim from CourtDiagram (which shows the
 * court setup): this one shows form / stance / trajectory tied to the coach note.
 *
 * Kept small (fits under Coach Notes), works in both dark UI and print (uses
 * currentColor so it inverts in print mode via CSS).
 */

const W = 340;
const H = 130;

// ----- helpers -----
const Label = ({ x, y, text, anchor = "start", accent = false }) => (
  <text
    x={x}
    y={y}
    textAnchor={anchor}
    fontSize="9"
    fontWeight="700"
    letterSpacing="0.12em"
    fill={accent ? "#FFCD00" : "currentColor"}
    style={{ textTransform: "uppercase" }}
  >
    {text}
  </text>
);

const Arrow = ({ x1, y1, x2, y2, color = "#FFCD00", dashed = false }) => {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const size = 5.5;
  const ax = x2 - size * Math.cos(angle - Math.PI / 6);
  const ay = y2 - size * Math.sin(angle - Math.PI / 6);
  const bx = x2 - size * Math.cos(angle + Math.PI / 6);
  const by = y2 - size * Math.sin(angle + Math.PI / 6);
  return (
    <g stroke={color} fill={color} strokeWidth="1.6" strokeLinecap="round">
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        strokeDasharray={dashed ? "3 3" : ""}
      />
      <polygon points={`${x2},${y2} ${ax},${ay} ${bx},${by}`} />
    </g>
  );
};

// Simple stick figure at (x, y_feet) with height h
const Figure = ({ x, y, h = 70, stance = "up", color = "currentColor" }) => {
  // stance: 'up' | 'defense' | 'shoot' | 'boxout' | 'sprint'
  const head = { x, y: y - h + 8 };
  const shoulder = { x, y: y - h + 18 };
  const hip = { x, y: y - h + 42 };
  return (
    <g stroke={color} strokeWidth="2" fill="none" strokeLinecap="round">
      <circle cx={head.x} cy={head.y} r="6" strokeWidth="1.8" />
      {stance === "defense" && (
        <>
          <line x1={shoulder.x} y1={shoulder.y} x2={hip.x} y2={hip.y + 4} />
          <line x1={shoulder.x - 14} y1={shoulder.y + 6} x2={shoulder.x + 14} y2={shoulder.y + 6} />
          <line x1={hip.x - 12} y1={hip.y + 4} x2={x - 16} y2={y} />
          <line x1={hip.x + 12} y1={hip.y + 4} x2={x + 16} y2={y} />
        </>
      )}
      {stance === "shoot" && (
        <>
          <line x1={shoulder.x} y1={shoulder.y} x2={hip.x} y2={hip.y} />
          {/* Shooting arm — elbow at ~90 */}
          <line x1={shoulder.x + 3} y1={shoulder.y + 2} x2={shoulder.x + 14} y2={shoulder.y + 12} />
          <line x1={shoulder.x + 14} y1={shoulder.y + 12} x2={shoulder.x + 14} y2={shoulder.y - 4} />
          {/* Guide hand */}
          <line x1={shoulder.x - 3} y1={shoulder.y + 2} x2={shoulder.x + 6} y2={shoulder.y - 4} />
          {/* legs slightly bent */}
          <line x1={hip.x} y1={hip.y} x2={x - 8} y2={y} />
          <line x1={hip.x} y1={hip.y} x2={x + 8} y2={y} />
        </>
      )}
      {stance === "up" && (
        <>
          <line x1={shoulder.x} y1={shoulder.y} x2={hip.x} y2={hip.y} />
          <line x1={shoulder.x} y1={shoulder.y + 2} x2={x - 10} y2={hip.y - 4} />
          <line x1={shoulder.x} y1={shoulder.y + 2} x2={x + 10} y2={hip.y - 4} />
          <line x1={hip.x} y1={hip.y} x2={x - 8} y2={y} />
          <line x1={hip.x} y1={hip.y} x2={x + 8} y2={y} />
        </>
      )}
      {stance === "boxout" && (
        <>
          <line x1={shoulder.x} y1={shoulder.y} x2={hip.x} y2={hip.y} />
          {/* Wide arms */}
          <line x1={shoulder.x} y1={shoulder.y + 2} x2={x - 20} y2={shoulder.y + 10} />
          <line x1={shoulder.x} y1={shoulder.y + 2} x2={x + 20} y2={shoulder.y + 10} />
          {/* wide low stance */}
          <line x1={hip.x} y1={hip.y} x2={x - 14} y2={y} />
          <line x1={hip.x} y1={hip.y} x2={x + 14} y2={y} />
        </>
      )}
      {stance === "sprint" && (
        <>
          <line
            x1={shoulder.x - 4}
            y1={shoulder.y}
            x2={hip.x + 4}
            y2={hip.y}
          />
          {/* forward arm swing */}
          <line x1={shoulder.x - 2} y1={shoulder.y + 2} x2={x + 14} y2={shoulder.y - 4} />
          <line x1={shoulder.x - 2} y1={shoulder.y + 2} x2={x - 14} y2={hip.y - 2} />
          {/* running legs */}
          <line x1={hip.x + 2} y1={hip.y} x2={x + 14} y2={y} />
          <line x1={hip.x + 2} y1={hip.y} x2={x - 12} y2={y - 8} />
        </>
      )}
    </g>
  );
};

// ================= ILLUSTRATIONS =================

const Shooting = () => (
  <g>
    <Figure x={80} y={110} h={72} stance="shoot" />
    {/* Ball */}
    <circle cx={98} cy={40} r="6" fill="#FF7324" opacity="0.9" />
    {/* Follow-through arc */}
    <path
      d="M 98 40 Q 180 15 265 40"
      stroke="#FFCD00"
      fill="none"
      strokeWidth="1.8"
      strokeDasharray="4 3"
    />
    <Arrow x1={260} y1={40} x2={278} y2={50} />
    {/* Hoop */}
    <line x1={280} y1={55} x2={310} y2={55} stroke="#FFCD00" strokeWidth="2.5" />
    <line x1={295} y1={55} x2={295} y2={75} stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
    {/* Cues */}
    <Label x={132} y={62} text="Elbow 90°" accent />
    <Label x={132} y={74} text="Under ball" />
    <Label x={200} y={30} text="Arc + snap wrist" accent />
    <Label x={80} y={125} text="Feet · Balance" anchor="middle" />
  </g>
);

const BallHandling = () => (
  <g>
    {/* Palm silhouette */}
    <path
      d="M 40 90 L 40 45 Q 45 35 55 40 L 60 30 Q 68 25 74 33 L 78 25 Q 88 22 92 32 L 96 30 Q 106 30 108 40 L 108 65 Q 108 100 78 105 L 55 105 Q 40 105 40 90 Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    />
    {/* Fingertip highlights */}
    {[{ x: 57, y: 40 }, { x: 74, y: 30 }, { x: 90, y: 30 }, { x: 106, y: 40 }].map((p, i) => (
      <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="#FFCD00" />
    ))}
    {/* Ball */}
    <circle cx={200} cy={80} r="26" fill="none" stroke="#FF7324" strokeWidth="2" />
    <path d="M 174 80 Q 200 65 226 80" stroke="#FF7324" strokeWidth="1.5" fill="none" />
    <path d="M 174 80 Q 200 95 226 80" stroke="#FF7324" strokeWidth="1.5" fill="none" />
    <line x1={200} y1={54} x2={200} y2={106} stroke="#FF7324" strokeWidth="1.5" />
    {/* Contact points */}
    {[{ x: 179, y: 68 }, { x: 197, y: 56 }, { x: 216, y: 63 }, { x: 221, y: 82 }].map((p, i) => (
      <circle key={i} cx={p.x} cy={p.y} r="3" fill="#FFCD00" />
    ))}
    <Label x={75} y={20} text="Fingertips only" accent />
    <Label x={200} y={125} text="Pound at hip height" anchor="middle" />
    <Arrow x1={125} y1={45} x2={170} y2={70} dashed />
  </g>
);

const Passing = () => (
  <g>
    <Figure x={50} y={110} h={68} />
    <Figure x={290} y={110} h={68} />
    {/* Ball trajectory */}
    <circle cx={80} cy={70} r="5" fill="#FF7324" />
    <path
      d="M 80 70 Q 170 40 260 70"
      stroke="#FFCD00"
      strokeWidth="2"
      strokeDasharray="4 3"
      fill="none"
    />
    <Arrow x1={255} y1={68} x2={272} y2={70} />
    <Label x={170} y={30} text="Chest to chest" accent anchor="middle" />
    <Label x={170} y={95} text="Thumbs DOWN on release" anchor="middle" />
    <Label x={50} y={125} text="Step in" anchor="middle" />
    <Label x={290} y={125} text="Target hands" anchor="middle" />
  </g>
);

const Footwork = () => (
  <g>
    {/* Pivot foot with dashed circle */}
    <circle cx={110} cy={80} r="34" fill="none" stroke="#FF7324" strokeWidth="1.5" strokeDasharray="4 3" />
    {/* Pivot foot solid */}
    <ellipse cx={110} cy={80} rx="12" ry="6" fill="#FFCD00" stroke="currentColor" strokeWidth="1.2" />
    <Label x={110} y={125} text="Pivot foot locks" accent anchor="middle" />
    {/* Non-pivot foot swings */}
    <ellipse cx={155} cy={80} rx="12" ry="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
    <ellipse cx={140} cy={50} rx="12" ry="6" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
    <ellipse cx={90} cy={45} rx="12" ry="6" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
    <path
      d="M 155 74 A 45 45 0 0 0 90 45"
      stroke="#FFCD00"
      strokeWidth="1.5"
      strokeDasharray="3 3"
      fill="none"
    />
    <Arrow x1={95} y1={45} x2={82} y2={40} />
    {/* Body figure */}
    <Figure x={240} y={110} h={72} />
    <Label x={240} y={125} text="Chin over ball" anchor="middle" />
    <Arrow x1={180} y1={60} x2={215} y2={70} dashed color="#FFCD00" />
  </g>
);

const Defense = () => (
  <g>
    <Figure x={70} y={115} h={78} stance="defense" />
    <Figure x={230} y={115} h={78} stance="up" color="#FF7324" />
    {/* Slide arrow */}
    <Arrow x1={100} y1={110} x2={200} y2={110} color="#FFCD00" />
    <Label x={70} y={20} text="Butt DOWN" accent anchor="middle" />
    <Label x={70} y={30} text="Hands active" anchor="middle" />
    <Label x={230} y={20} text="Offense" anchor="middle" />
    <Label x={150} y={100} text="Slide, don't cross" accent anchor="middle" />
  </g>
);

const Rebounding = () => (
  <g>
    {/* Hoop line */}
    <line x1={20} y1={30} x2={320} y2={30} stroke="#FFCD00" strokeWidth="2" opacity="0.5" />
    {/* Ball dropping */}
    <circle cx={170} cy={50} r="5" fill="#FF7324" />
    <Arrow x1={170} y1={35} x2={170} y2={65} color="#FF7324" />
    <Figure x={130} y={115} h={70} stance="boxout" />
    <Figure x={210} y={115} h={70} stance="up" color="#FF7324" />
    <Label x={130} y={125} text="Find · Hit · Get" accent anchor="middle" />
    <Label x={210} y={125} text="Sealed out" anchor="middle" />
  </g>
);

const Conditioning = () => (
  <g>
    <Figure x={80} y={110} h={72} stance="sprint" />
    {/* Speed lines */}
    <line x1={40} y1={70} x2={20} y2={70} stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
    <line x1={40} y1={80} x2={15} y2={80} stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
    <line x1={40} y1={90} x2={22} y2={90} stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
    {/* Cone */}
    <polygon points="260,100 250,115 270,115" fill="#FF7324" />
    <Arrow x1={110} y1={100} x2={245} y2={110} color="#FFCD00" />
    <path
      d="M 260 100 Q 285 70 300 90"
      stroke="#FFCD00"
      strokeWidth="1.6"
      strokeDasharray="3 3"
      fill="none"
    />
    <Arrow x1={297} y1={87} x2={303} y2={92} />
    <Label x={170} y={125} text="Sprint · Plant · Change" accent anchor="middle" />
  </g>
);

const WarmUp = () => (
  <g>
    <Figure x={60} y={110} h={70} />
    <Figure x={150} y={110} h={70} stance="sprint" />
    <Figure x={240} y={110} h={70} stance="defense" />
    {/* Joint dots */}
    {[{ x: 60, y: 92 }, { x: 60, y: 68 }, { x: 150, y: 92 }, { x: 240, y: 92 }].map((p, i) => (
      <circle key={i} cx={p.x} cy={p.y} r="3" fill="#FFCD00" />
    ))}
    <Arrow x1={85} y1={110} x2={125} y2={110} color="#FFCD00" />
    <Arrow x1={175} y1={110} x2={215} y2={110} color="#FFCD00" />
    <Label x={60} y={125} text="Static → Dynamic" anchor="middle" />
    <Label x={150} y={125} text="Full range" anchor="middle" />
    <Label x={240} y={125} text="Game speed" anchor="middle" />
    <Label x={170} y={20} text="Never skip · Injury insurance" accent anchor="middle" />
  </g>
);

const BasketballIQ = () => (
  <g>
    {/* 3 offensive players */}
    <circle cx={80} cy={100} r="10" fill="#FFCD00" stroke="currentColor" strokeWidth="1.5" />
    <text x={80} y={104} textAnchor="middle" fontSize="10" fontWeight="700" fill="#000">1</text>
    <circle cx={170} cy={70} r="10" fill="#FFCD00" stroke="currentColor" strokeWidth="1.5" />
    <text x={170} y={74} textAnchor="middle" fontSize="10" fontWeight="700" fill="#000">2</text>
    <circle cx={170} cy={110} r="10" fill="#FFCD00" stroke="currentColor" strokeWidth="1.5" />
    <text x={170} y={114} textAnchor="middle" fontSize="10" fontWeight="700" fill="#000">5</text>
    <circle cx={260} cy={100} r="10" fill="#FF7324" stroke="currentColor" strokeWidth="1.5" />
    <text x={260} y={104} textAnchor="middle" fontSize="10" fontWeight="700" fill="#000">D</text>
    {/* Screen — perpendicular short line at 2 */}
    <line x1={160} y1={70} x2={180} y2={70} stroke="currentColor" strokeWidth="4" />
    {/* Dribble */}
    <path d="M 90 100 L 155 100" stroke="#FFCD00" strokeWidth="1.8" strokeDasharray="4 3" />
    <Arrow x1={155} y1={100} x2={165} y2={100} />
    {/* Roll to rim */}
    <path
      d="M 170 82 Q 210 90 250 100"
      stroke="#FFCD00"
      strokeWidth="1.8"
      fill="none"
    />
    <Arrow x1={245} y1={98} x2={252} y2={100} />
    <Label x={80} y={125} text="Ball handler" anchor="middle" />
    <Label x={170} y={45} text="Screen" accent anchor="middle" />
    <Label x={210} y={125} text="Roll to rim" accent anchor="middle" />
  </g>
);

const OVERLAYS = {
  Shooting,
  "Ball Handling": BallHandling,
  Passing,
  Footwork,
  Defense,
  Rebounding,
  Conditioning,
  "Warm-Up": WarmUp,
  "Basketball IQ": BasketballIQ,
};

const CUE = {
  Shooting: "B.E.E.F. — Balance · Eyes · Elbow · Follow-through",
  "Ball Handling": "Fingertips only, ball below knee, eyes up",
  Passing: "Chest to chest, thumbs down on release",
  Footwork: "Pivot foot locks · chin over the ball",
  Defense: "Low stance · slide, never cross feet",
  Rebounding: "Find your body · hit first · get the ball",
  Conditioning: "Sprint, plant, change direction",
  "Warm-Up": "Dynamic movement — game-speed by end",
  "Basketball IQ": "Read the defender, not the play call",
};

export default function TechniqueIllustration({ category, light = false }) {
  const Overlay = OVERLAYS[category];
  if (!Overlay) return null;
  const cue = CUE[category] || "";
  const wrapCls = light
    ? "mt-4 border border-black bg-white rounded-sm p-3"
    : "mt-4 border border-white/10 bg-black/30 rounded-sm p-3 print:bg-white print:border-black";
  const kickerCls = light
    ? "text-[10px] uppercase tracking-[0.25em] text-black font-bold mb-2 flex items-center gap-2"
    : "text-[10px] uppercase tracking-[0.25em] text-[#FFCD00] font-bold mb-2 flex items-center gap-2 print:text-black";
  const svgCls = light
    ? "w-full h-auto text-black"
    : "w-full h-auto text-white/85 print:text-black";
  const cueCls = light
    ? "mt-2 text-xs text-black italic"
    : "mt-2 text-xs text-white/70 italic print:text-black";
  return (
    <div className={wrapCls} data-testid="technique-illustration">
      <div className={kickerCls}>
        <span>Quick Visual Cue · {category}</span>
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className={svgCls}
        aria-label={`Technique illustration for ${category}`}
      >
        <Overlay />
      </svg>
      {cue && <div className={cueCls}>{cue}</div>}
    </div>
  );
}
