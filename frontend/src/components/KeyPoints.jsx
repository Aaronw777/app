/**
 * KeyPoints — coaching cheat-sheet bullets keyed off the drill category.
 * Sits under the Coach Notes as a fast-scan checklist for what to focus on.
 */

const POINTS = {
  "Warm-Up": [
    "Start static, progress to dynamic movement",
    "Cover every joint through full range of motion",
    "Reach game-speed intensity by the final minute",
    "Never skip — reduces soft-tissue and ACL injury risk",
    "Heart rate up before the ball comes out",
  ],
  "Ball Handling": [
    "Fingertips only — no palm contact",
    "Ball stays below the knee",
    "Head up, eyes forward, chest tall",
    "Ambidextrous — no favourite hand",
    "Change of pace pairs with change of direction",
  ],
  Shooting: [
    "Balance — feet square, shoulder-width apart",
    "Eyes locked on the front of the rim",
    "Elbow at 90°, under the ball",
    "Snap the wrist, hold the follow-through",
    "Land where you jumped from",
  ],
  Passing: [
    "Step into every pass — transfer your weight",
    "Chest to chest, direct line to the receiver",
    "Thumbs finish pointing down on release",
    "Bounce pass lands two-thirds of the way to target",
    "Show target hands early, palms up",
  ],
  Footwork: [
    "Two-foot jump stop — either foot can be the pivot",
    "Chin over the ball on every catch",
    "Pivot foot stays anchored — no drag",
    "Land in triple-threat, never flat-footed",
    "Shot fake, jab, sweep — sell every move",
  ],
  Defense: [
    "Butt down, chest up, hands active",
    "Slide — never cross your feet",
    "Nose on ball, hip matched to attacker",
    "Force weakness (usually baseline on the wings)",
    "Contest vertically — no fouls on the shooter",
  ],
  Rebounding: [
    "Find the body first — reverse-pivot to seal",
    "Make contact before you go for the ball",
    "Chin the rebound, elbows out",
    "Two hands and two feet on the landing",
    "Every rebound is one more possession",
  ],
  Conditioning: [
    "Change of direction is basketball fitness",
    "Match work-to-rest ratio of a live quarter",
    "Recover on your feet, not your knees",
    "Track times against a benchmark each week",
    "Legs fresh into Q4 separates elite from the rest",
  ],
  "Basketball IQ": [
    "Read the defence, not the play call",
    "Ball movement beats player movement",
    "Pick-and-roll: read drop, hedge and switch coverage",
    "Cut with intent — hands ready to catch",
    "Space the floor — never two players in the same spot",
  ],
  Custom: [
    "Set a clear objective before the whistle",
    "Define what a rep looks like — quality over quantity",
    "Give one coaching cue at a time",
    "Finish with a competitive rep or scoreable outcome",
    "Log what worked so it can repeat next week",
  ],
};

export default function KeyPoints({ category, light = false }) {
  const list = POINTS[category] || POINTS.Custom;

  const wrapCls = light
    ? "border border-black bg-white rounded-sm p-4"
    : "border border-white/10 bg-black/30 rounded-sm p-4 print:bg-white print:border-black";
  const headingCls = light
    ? "text-[10px] uppercase tracking-[0.3em] text-black font-bold mb-3 flex items-center gap-2"
    : "text-[10px] uppercase tracking-[0.3em] text-[#FFCD00] font-bold mb-3 flex items-center gap-2 print:text-black";
  const itemCls = light
    ? "flex items-start gap-2 text-sm text-black leading-snug"
    : "flex items-start gap-2 text-sm text-white/80 leading-snug print:text-black";
  const bulletCls = light
    ? "mt-1.5 w-1.5 h-1.5 rounded-full bg-black shrink-0"
    : "mt-1.5 w-1.5 h-1.5 rounded-full bg-[#FFCD00] shrink-0 print:bg-black";

  return (
    <div className={wrapCls} data-testid="key-points">
      <div className={headingCls}>
        <span>Key Points · {category}</span>
      </div>
      <ul className="space-y-2">
        {list.map((point, i) => (
          <li key={i} className={itemCls}>
            <span className={bulletCls} aria-hidden="true" />
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
