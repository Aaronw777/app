/**
 * CourtDiagram — SVG half-court schematic with per-category overlays.
 * Prints cleanly on the PDF export.
 */

const COURT_W = 300;
const COURT_H = 280;

function CourtLines() {
  return (
    <g stroke="currentColor" strokeWidth="1.2" fill="none" opacity="0.9">
      {/* Half-court outline */}
      <rect x="10" y="10" width={COURT_W - 20} height={COURT_H - 20} />
      {/* Half-court line arc top */}
      <path d={`M 10 ${COURT_H - 10} L ${COURT_W - 10} ${COURT_H - 10}`} />
      {/* Free-throw lane / key */}
      <rect x={COURT_W / 2 - 30} y="10" width="60" height="80" />
      {/* Free-throw circle */}
      <circle cx={COURT_W / 2} cy="90" r="30" strokeDasharray="3 3" />
      {/* Restricted arc */}
      <path
        d={`M ${COURT_W / 2 - 20} 30 A 20 20 0 0 0 ${COURT_W / 2 + 20} 30`}
      />
      {/* 3-point arc — corner extensions */}
      <line x1="35" y1="10" x2="35" y2="55" />
      <line x1={COURT_W - 35} y1="10" x2={COURT_W - 35} y2="55" />
      {/* 3-point arc */}
      <path
        d={`M 35 55 A 120 120 0 0 0 ${COURT_W - 35} 55`}
      />
      {/* Hoop */}
      <circle cx={COURT_W / 2} cy="24" r="6" fill="currentColor" opacity="0.6" />
    </g>
  );
}

function Player({ x, y, label, color = "#FFCD00" }) {
  return (
    <g>
      <circle cx={x} cy={y} r="9" fill={color} stroke="#000" strokeWidth="1.5" />
      <text
        x={x}
        y={y + 3.5}
        textAnchor="middle"
        fontSize="10"
        fontWeight="700"
        fill="#000"
      >
        {label}
      </text>
    </g>
  );
}

function Cone({ x, y }) {
  return (
    <polygon
      points={`${x},${y - 6} ${x - 5},${y + 4} ${x + 5},${y + 4}`}
      fill="#FF7324"
      stroke="#000"
      strokeWidth="0.8"
    />
  );
}

function Arrow({ x1, y1, x2, y2, color = "#FFCD00", dashed = false }) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const size = 6;
  const ax = x2 - size * Math.cos(angle - Math.PI / 6);
  const ay = y2 - size * Math.sin(angle - Math.PI / 6);
  const bx = x2 - size * Math.cos(angle + Math.PI / 6);
  const by = y2 - size * Math.sin(angle + Math.PI / 6);
  return (
    <g stroke={color} fill={color} strokeWidth="1.8">
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        strokeDasharray={dashed ? "4 3" : ""}
        strokeLinecap="round"
      />
      <polygon points={`${x2},${y2} ${ax},${ay} ${bx},${by}`} />
    </g>
  );
}

const OVERLAYS = {
  "Ball Handling": () => (
    <>
      <Cone x={90} y={200} />
      <Cone x={150} y={170} />
      <Cone x={210} y={200} />
      <Player x={150} y={240} label="1" />
      <Arrow x1={150} y1={230} x2={95} y2={210} dashed />
      <Arrow x1={90} y1={195} x2={150} y2={175} dashed />
      <Arrow x1={155} y1={170} x2={210} y2={195} dashed />
    </>
  ),
  Shooting: () => (
    <>
      <Player x={150} y={140} label="S" />
      <Arrow x1={150} y1={130} x2={150} y2={35} color="#34D17A" />
    </>
  ),
  Passing: () => (
    <>
      <Player x={80} y={200} label="1" />
      <Player x={220} y={200} label="2" />
      <Arrow x1={92} y1={200} x2={208} y2={200} dashed />
    </>
  ),
  Footwork: () => (
    <>
      <Player x={150} y={120} label="1" />
      <circle
        cx={150}
        cy={120}
        r="22"
        fill="none"
        stroke="#FF7324"
        strokeWidth="1.5"
        strokeDasharray="3 3"
      />
      <Arrow x1={150} y1={135} x2={150} y2={35} />
    </>
  ),
  Defense: () => (
    <>
      <Player x={150} y={180} label="O" color="#FFCD00" />
      <Player x={150} y={140} label="D" color="#34D17A" />
      <Arrow x1={150} y1={175} x2={90} y2={210} dashed color="#FF7324" />
      <Arrow x1={150} y1={135} x2={95} y2={165} dashed color="#34D17A" />
    </>
  ),
  Rebounding: () => (
    <>
      <Player x={130} y={70} label="1" />
      <Player x={170} y={70} label="2" color="#34D17A" />
      <Arrow x1={150} y1={30} x2={150} y2={60} color="#FF7324" />
    </>
  ),
  Conditioning: () => (
    <>
      <Arrow x1={40} y1={240} x2={260} y2={240} />
      <Arrow x1={260} y1={220} x2={40} y2={220} color="#FF7324" />
      <Player x={40} y={260} label="1" />
    </>
  ),
  "Basketball IQ": () => (
    <>
      <Player x={150} y={180} label="1" />
      <Player x={220} y={130} label="2" />
      <Player x={80} y={130} label="3" />
      <Arrow x1={162} y1={175} x2={210} y2={135} dashed />
      <Arrow x1={220} y1={140} x2={155} y2={40} color="#34D17A" />
    </>
  ),
  "Warm-Up": () => (
    <>
      <Player x={60} y={240} label="1" />
      <Player x={110} y={240} label="2" />
      <Player x={160} y={240} label="3" />
      <Player x={210} y={240} label="4" />
      <Arrow x1={60} y1={225} x2={60} y2={40} dashed />
      <Arrow x1={110} y1={225} x2={110} y2={40} dashed />
      <Arrow x1={160} y1={225} x2={160} y2={40} dashed />
      <Arrow x1={210} y1={225} x2={210} y2={40} dashed />
    </>
  ),
};

export default function CourtDiagram({ category, label }) {
  const Overlay = OVERLAYS[category] || OVERLAYS["Basketball IQ"];
  return (
    <div className="w-full">
      <div className="text-[10px] uppercase tracking-[0.25em] text-white/40 font-bold mb-2 print:text-black">
        Court Setup · {category}
      </div>
      <div className="bg-[#0d0d0d] border border-white/10 rounded-sm p-3 print:bg-white print:border-black">
        <svg
          viewBox={`0 0 ${COURT_W} ${COURT_H}`}
          className="w-full h-auto text-white/70 print:text-black"
          aria-label={`Court diagram: ${label || category}`}
        >
          <CourtLines />
          <Overlay />
        </svg>
      </div>
      <div className="mt-2 flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] text-white/40 print:text-black">
        <span className="flex items-center gap-1">
          <span className="inline-block w-2.5 h-2.5 bg-[#FFCD00] rounded-full" />
          Player
        </span>
        <span className="flex items-center gap-1">
          <span
            className="inline-block w-0 h-0"
            style={{
              borderLeft: "4px solid transparent",
              borderRight: "4px solid transparent",
              borderBottom: "7px solid #FF7324",
            }}
          />
          Cone
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-4 h-[2px] bg-[#FFCD00]" />
          Movement
        </span>
      </div>
    </div>
  );
}
