/**
 * CourtDiagram — FIBA-notation-style half-court diagrams.
 *
 * Conventions:
 *   O with number  = offensive player (1..5)
 *   X             = defender
 *   ▬             = screen
 *   solid arrow   = player cut / drive
 *   dashed arrow  = pass
 *   zigzag        = dribble
 *   orange dot    = ball
 */

const COURT_W = 340;
const COURT_H = 300;

// ------- Court background (half-court) -------
function CourtLines() {
  return (
    <g stroke="currentColor" strokeWidth="1.4" fill="none" opacity="0.85">
      {/* Outline */}
      <rect x="10" y="10" width={COURT_W - 20} height={COURT_H - 20} />
      {/* Half-court semicircle (bottom) */}
      <path d={`M ${COURT_W / 2 - 40} ${COURT_H - 10} A 40 40 0 0 1 ${COURT_W / 2 + 40} ${COURT_H - 10}`} />
      {/* Lane / key */}
      <rect x={COURT_W / 2 - 30} y="10" width="60" height="90" />
      {/* Free-throw circle */}
      <circle cx={COURT_W / 2} cy="100" r="30" strokeDasharray="3 3" />
      {/* Restricted-area arc */}
      <path d={`M ${COURT_W / 2 - 14} 30 A 14 14 0 0 0 ${COURT_W / 2 + 14} 30`} />
      {/* 3-point corner lines */}
      <line x1="38" y1="10" x2="38" y2="70" />
      <line x1={COURT_W - 38} y1="10" x2={COURT_W - 38} y2="70" />
      {/* 3-point arc */}
      <path d={`M 38 70 A 132 132 0 0 0 ${COURT_W - 38} 70`} />
      {/* Rim */}
      <circle cx={COURT_W / 2} cy="24" r="5.5" fill="currentColor" opacity="0.55" />
      {/* Backboard */}
      <line x1={COURT_W / 2 - 12} y1="18" x2={COURT_W / 2 + 12} y2="18" strokeWidth="2" />
    </g>
  );
}

// ------- Primitives -------
const O = ({ x, y, n, ball = false }) => (
  <g>
    <circle cx={x} cy={y} r="10" fill="none" stroke="currentColor" strokeWidth="2" />
    <text
      x={x}
      y={y + 4}
      textAnchor="middle"
      fontSize="11"
      fontWeight="700"
      fill="currentColor"
    >
      {n}
    </text>
    {ball && <circle cx={x + 13} cy={y - 7} r="3.5" fill="#FF7324" />}
  </g>
);

const X = ({ x, y, n }) => (
  <g stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <line x1={x - 7} y1={y - 7} x2={x + 7} y2={y + 7} />
    <line x1={x - 7} y1={y + 7} x2={x + 7} y2={y - 7} />
    {n && (
      <text
        x={x + 10}
        y={y + 4}
        fontSize="8"
        fontWeight="700"
        fill="currentColor"
        stroke="none"
      >
        {n}
      </text>
    )}
  </g>
);

const Screen = ({ x, y, angle = 0 }) => (
  <g transform={`rotate(${angle} ${x} ${y})`}>
    <rect x={x - 10} y={y - 2.5} width="20" height="5" fill="currentColor" opacity="0.85" />
  </g>
);

const Cone = ({ x, y }) => (
  <polygon
    points={`${x},${y - 6} ${x - 5},${y + 4} ${x + 5},${y + 4}`}
    fill="#FF7324"
  />
);

const ArrowHead = ({ x, y, angle, color }) => {
  const size = 6;
  const ax = x - size * Math.cos(angle - Math.PI / 6);
  const ay = y - size * Math.sin(angle - Math.PI / 6);
  const bx = x - size * Math.cos(angle + Math.PI / 6);
  const by = y - size * Math.sin(angle + Math.PI / 6);
  return <polygon points={`${x},${y} ${ax},${ay} ${bx},${by}`} fill={color} />;
};

// Solid cut/drive arrow
const Cut = ({ x1, y1, x2, y2, color = "#FFCD00" }) => {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  return (
    <g stroke={color} strokeWidth="2" strokeLinecap="round" fill={color}>
      <line x1={x1} y1={y1} x2={x2} y2={y2} />
      <ArrowHead x={x2} y={y2} angle={angle} color={color} />
    </g>
  );
};

// Dashed pass arrow
const Pass = ({ x1, y1, x2, y2, color = "#FFCD00" }) => {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  return (
    <g stroke={color} strokeWidth="1.8" strokeLinecap="round" fill={color}>
      <line x1={x1} y1={y1} x2={x2} y2={y2} strokeDasharray="5 4" />
      <ArrowHead x={x2} y={y2} angle={angle} color={color} />
    </g>
  );
};

// Zigzag dribble
const Dribble = ({ points, color = "#FFCD00" }) => {
  if (points.length < 2) return null;
  // Build a zigzag path along the point sequence
  const parts = [];
  for (let i = 0; i < points.length - 1; i++) {
    const [x1, y1] = points[i];
    const [x2, y2] = points[i + 1];
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.hypot(dx, dy);
    const perpX = -dy / len;
    const perpY = dx / len;
    const steps = Math.max(2, Math.round(len / 8));
    for (let s = 1; s < steps; s++) {
      const t = s / steps;
      const cx = x1 + dx * t;
      const cy = y1 + dy * t;
      const off = (s % 2 === 0 ? 1 : -1) * 3;
      parts.push(`L ${cx + perpX * off} ${cy + perpY * off}`);
    }
    parts.push(`L ${x2} ${y2}`);
  }
  const d = `M ${points[0][0]} ${points[0][1]} ${parts.join(" ")}`;
  const last = points[points.length - 1];
  const prev = points[points.length - 2];
  const angle = Math.atan2(last[1] - prev[1], last[0] - prev[0]);
  return (
    <g stroke={color} strokeWidth="1.8" fill="none">
      <path d={d} />
      <ArrowHead x={last[0]} y={last[1]} angle={angle} color={color} />
    </g>
  );
};

const Note = ({ x, y, text, anchor = "start" }) => (
  <text
    x={x}
    y={y}
    textAnchor={anchor}
    fontSize="9"
    fontWeight="700"
    letterSpacing="0.1em"
    fill="#FFCD00"
    style={{ textTransform: "uppercase" }}
  >
    {text}
  </text>
);

// ================== PER-CATEGORY DIAGRAMS ==================

const WarmUp = () => (
  <g>
    <O x={60} y={260} n="1" />
    <O x={120} y={260} n="2" />
    <O x={180} y={260} n="3" />
    <O x={240} y={260} n="4" />
    <Cut x1={60} y1={250} x2={60} y2={140} />
    <Cut x1={60} y1={140} x2={60} y2={245} color="#FF7324" />
    <Cut x1={120} y1={250} x2={120} y2={90} />
    <Cut x1={120} y1={90} x2={120} y2={245} color="#FF7324" />
    <Cut x1={180} y1={250} x2={180} y2={140} />
    <Cut x1={180} y1={140} x2={180} y2={245} color="#FF7324" />
    <Cut x1={240} y1={250} x2={240} y2={90} />
    <Cut x1={240} y1={90} x2={240} y2={245} color="#FF7324" />
    <Note x={COURT_W / 2} y={285} text="Progressive-tempo sprints" anchor="middle" />
  </g>
);

const BallHandling = () => (
  <g>
    <Cone x={80} y={240} />
    <Cone x={140} y={210} />
    <Cone x={200} y={240} />
    <Cone x={260} y={210} />
    <O x={40} y={270} n="1" ball />
    <Dribble points={[[52, 270], [70, 245], [125, 240], [155, 200], [190, 235], [245, 240], [275, 200]]} />
    <Note x={COURT_W / 2} y={285} text="Weave · Change hand at each cone" anchor="middle" />
  </g>
);

const Shooting = () => (
  <g>
    {/* Passer at top */}
    <O x={COURT_W / 2} y={165} n="2" ball />
    {/* Shooter at wing */}
    <O x={70} y={130} n="1" />
    <Pass x1={COURT_W / 2 - 12} y1={162} x2={82} y2={132} />
    <Cut x1={70} y1={120} x2={COURT_W / 2 - 5} y2={30} />
    <Note x={110} y={110} text="Shoot" />
    <Note x={COURT_W / 2 + 25} y={155} text="Pass" />
    <Note x={COURT_W / 2} y={285} text="Catch-and-shoot from wing" anchor="middle" />
  </g>
);

const Passing = () => (
  <g>
    {/* 3-man weave setup */}
    <O x={70} y={250} n="1" ball />
    <O x={COURT_W / 2} y={250} n="2" />
    <O x={COURT_W - 70} y={250} n="3" />
    {/* Pass 1->2, then cut behind */}
    <Pass x1={82} y1={248} x2={COURT_W / 2 - 12} y2={248} />
    <Cut x1={70} y1={240} x2={230} y2={165} />
    <Pass x1={COURT_W / 2 + 12} y1={248} x2={COURT_W - 82} y2={248} />
    <Cut x1={COURT_W / 2} y1={240} x2={110} y2={165} />
    <Cut x1={COURT_W - 70} y1={240} x2={COURT_W / 2} y2={80} />
    <Note x={COURT_W / 2} y={285} text="3-man weave · pass and cut behind" anchor="middle" />
  </g>
);

const Footwork = () => (
  <g>
    {/* Coach/passer top of key */}
    <O x={COURT_W / 2} y={140} n="C" />
    {/* Player at wing */}
    <O x={80} y={110} n="1" />
    <Pass x1={COURT_W / 2 - 12} y1={140} x2={92} y2={112} />
    {/* Jab step arrow */}
    <Cut x1={80} y1={122} x2={80} y2={140} color="#FF7324" />
    {/* Drive to rim */}
    <Cut x1={82} y1={120} x2={COURT_W / 2 - 20} y2={32} />
    <Note x={40} y={135} text="Jab" />
    <Note x={110} y={80} text="Rip · Drive" />
    <Note x={COURT_W / 2} y={285} text="Triple-threat · pivot · attack" anchor="middle" />
  </g>
);

const Defense = () => (
  <g>
    {/* Passer top */}
    <O x={COURT_W / 2} y={165} n="2" ball />
    {/* Wing shooter */}
    <O x={70} y={130} n="1" />
    {/* Defender starts near passer, closes out */}
    <X x={COURT_W / 2 - 25} y={185} n="1" />
    <Pass x1={COURT_W / 2 - 12} y1={162} x2={82} y2={132} />
    <Cut x1={COURT_W / 2 - 30} y1={180} x2={85} y2={148} color="#FFCD00" />
    <Note x={80} y={175} text="Closeout · high hand" />
    <Note x={COURT_W / 2} y={285} text="Chop feet · contest without fouling" anchor="middle" />
  </g>
);

const Rebounding = () => (
  <g>
    {/* Two offense low blocks, two defense between them and rim */}
    <O x={COURT_W / 2 - 40} y={80} n="4" />
    <O x={COURT_W / 2 + 40} y={80} n="5" />
    <X x={COURT_W / 2 - 40} y={55} n="4" />
    <X x={COURT_W / 2 + 40} y={55} n="5" />
    {/* Shot from top */}
    <O x={COURT_W / 2} y={200} n="1" ball />
    <path
      d={`M ${COURT_W / 2 + 10} 200 Q ${COURT_W / 2 + 40} 120 ${COURT_W / 2} 40`}
      stroke="#FF7324"
      strokeWidth="1.8"
      strokeDasharray="4 3"
      fill="none"
    />
    {/* Box-out arrows (defenders back into offense) */}
    <Cut x1={COURT_W / 2 - 40} y1={65} x2={COURT_W / 2 - 40} y2={75} />
    <Cut x1={COURT_W / 2 + 40} y1={65} x2={COURT_W / 2 + 40} y2={75} />
    <Note x={COURT_W / 2} y={285} text="Reverse pivot · seal · then pursue" anchor="middle" />
  </g>
);

const Conditioning = () => (
  <g>
    {/* Sideline to sideline shuttles (17s) */}
    <O x={30} y={COURT_H - 45} n="1" />
    <Cut x1={45} y1={COURT_H - 45} x2={COURT_W - 30} y2={COURT_H - 45} color="#FFCD00" />
    <Cut x1={COURT_W - 30} y1={COURT_H - 65} x2={40} y2={COURT_H - 65} color="#FF7324" />
    <Cut x1={45} y1={COURT_H - 85} x2={COURT_W - 30} y2={COURT_H - 85} color="#FFCD00" />
    <Cut x1={COURT_W - 30} y1={COURT_H - 105} x2={40} y2={COURT_H - 105} color="#FF7324" />
    <Note x={COURT_W / 2} y={100} text="Sideline · sideline · repeat" anchor="middle" />
    <Note x={COURT_W / 2} y={285} text="17 touches under 65 seconds" anchor="middle" />
  </g>
);

const BasketballIQ = () => (
  <g>
    {/* Ball handler top */}
    <O x={COURT_W / 2} y={180} n="1" ball />
    {/* Screener */}
    <O x={COURT_W / 2 + 30} y={155} n="5" />
    <Screen x={COURT_W / 2 + 30} y={155} angle={-20} />
    {/* Defenders */}
    <X x={COURT_W / 2} y={158} n="1" />
    <X x={COURT_W / 2 + 30} y={130} n="5" />
    {/* Dribble around screen */}
    <Dribble points={[[COURT_W / 2, 190], [COURT_W / 2 + 30, 190], [COURT_W / 2 + 50, 155], [COURT_W / 2 + 30, 90]]} />
    {/* Roll to rim */}
    <Cut x1={COURT_W / 2 + 30} y1={165} x2={COURT_W / 2 - 5} y2={45} color="#FF7324" />
    <Note x={COURT_W / 2 + 60} y={155} text="Screen" />
    <Note x={COURT_W / 2 - 55} y={100} text="Roll" />
    <Note x={COURT_W / 2} y={285} text="Pick and roll — read the drop" anchor="middle" />
  </g>
);

const OVERLAYS = {
  "Warm-Up": WarmUp,
  "Ball Handling": BallHandling,
  Shooting,
  Passing,
  Footwork,
  Defense,
  Rebounding,
  Conditioning,
  "Basketball IQ": BasketballIQ,
};

export default function CourtDiagram({ category, label, light = false }) {
  const Overlay = OVERLAYS[category];
  if (!Overlay) return null;

  const wrapCls = light
    ? "border border-black bg-white rounded-sm p-3"
    : "border border-white/10 bg-black/40 rounded-sm p-3 print:bg-white print:border-black";
  const kickerCls = light
    ? "text-[10px] uppercase tracking-[0.25em] text-black font-bold mb-2"
    : "text-[10px] uppercase tracking-[0.25em] text-[#FFCD00] font-bold mb-2 print:text-black";
  const svgCls = light
    ? "w-full h-auto text-black"
    : "w-full h-auto text-white/85 print:text-black";
  const legendCls = light
    ? "mt-2 flex flex-wrap items-center gap-3 text-[9px] uppercase tracking-[0.18em] text-black font-bold"
    : "mt-2 flex flex-wrap items-center gap-3 text-[9px] uppercase tracking-[0.18em] text-white/50 font-bold print:text-black";

  return (
    <div className={wrapCls} data-testid="court-diagram">
      <div className={kickerCls}>FIBA-style setup · {category}</div>
      <svg
        viewBox={`0 0 ${COURT_W} ${COURT_H}`}
        className={svgCls}
        aria-label={`Court diagram: ${label || category}`}
      >
        <CourtLines />
        <Overlay />
      </svg>
      <div className={legendCls}>
        <span className="flex items-center gap-1">
          <span
            className={`inline-flex w-3 h-3 rounded-full border ${
              light ? "border-black" : "border-white"
            } items-center justify-center`}
            aria-hidden="true"
          >
            <span className="text-[7px] font-bold">1</span>
          </span>
          Offense
        </span>
        <span className="flex items-center gap-1">
          <span className={light ? "text-black text-[11px] font-bold" : "text-white/85 text-[11px] font-bold"}>
            ×
          </span>
          Defender
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-4 h-[2px] bg-[#FFCD00]" /> Cut
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-4 h-[2px] bg-[#FFCD00]" style={{ borderTop: "1.5px dashed #FFCD00", background: "transparent" }} />
          Pass
        </span>
        <span className="flex items-center gap-1">
          <span
            className="inline-block w-4 h-3 bg-transparent"
            style={{
              backgroundImage:
                "linear-gradient(45deg, #FFCD00 25%, transparent 25%, transparent 50%, #FFCD00 50%, #FFCD00 75%, transparent 75%)",
              backgroundSize: "6px 6px",
            }}
            aria-hidden="true"
          />
          Dribble
        </span>
        <span className="flex items-center gap-1">
          <span className={light ? "inline-block w-4 h-[3px] bg-black" : "inline-block w-4 h-[3px] bg-white"} />
          Screen
        </span>
      </div>
    </div>
  );
}
