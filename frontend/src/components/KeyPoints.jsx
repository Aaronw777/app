/**
 * KeyPoints — drill-specific coaching cheat-sheet.
 * Each drill has its own 4-5 focus bullets covering *only* what that drill
 * uniquely teaches — no repeats across weeks.
 * Falls back to category defaults for custom or unknown drills.
 */

// ---- Drill-specific key points, keyed by drill.id ----
const DRILL_POINTS = {
  // --- Mini-Ballers / Aussie-Hoops (Level 0) ---
  mb01: [
    "Bear crawl: hands under shoulders, hips low",
    "Crab walk: bottom off the floor, chest up",
    "Bunny hops: soft two-foot landings",
    "Kangaroo jumps: arms swing for height",
    "Finish with a smile — enjoyment locks the movement in",
  ],
  mb02: [
    "Roll the ball around your body, no gaps",
    "Ball stays in fingertip contact the whole way",
    "Change direction on coach's clap",
    "Reach behind without dropping it",
    "Look up between reps to build confidence",
  ],
  mb03: [
    "Two hands push the ball straight down",
    "Catch at waist height with soft hands",
    "Ball comes off the fingertips, not the palm",
    "Progress to one hand each after 10 reps",
    "Count out loud so the tempo becomes automatic",
  ],
  mb04: [
    "Freeze in an athletic stance — knees bent",
    "Hold the dribble hand at ball height",
    "Eyes on the coach at all times",
    "Move again only on the whistle",
    "Losing balance is out — cheer the last one standing",
  ],
  mb05: [
    "Scoop the ball from your hips",
    "Both hands push it up together",
    "Eyes on the top of the bin or ring",
    "Little jump-toss for height if you can reach",
    "Cheer every make — confidence first",
  ],
  mb06: [
    "Feet under shoulders, knees soft",
    "Ball starts at chest level",
    "Push up — don't throw",
    "Arms finish straight and tall",
    "Land in the same footprint you launched from",
  ],
  mb07: [
    "Two hands cradle the ball on the roll",
    "Push the roll straight — no spin",
    "Partner catches with soft hands",
    "Progress: sit → kneel → stand → bounce pass",
    "Say your partner's name each time",
  ],
  mb08: [
    "Elbows stay tight to the ribs",
    "Step toward the target with one foot",
    "Thumbs finish pointing down",
    "Ball travels in a straight line",
    "Aim small — hit the middle of the bullseye",
  ],
  mb09: [
    "Red = two-foot jump stop",
    "Yellow = walking dribble only",
    "Green = jog + dribble",
    "Head up so you can see the coach",
    "Add ORANGE for a spin move once smooth",
  ],
  mb10: [
    "Keep the ball below your knee",
    "Body shields the ball from the shark",
    "Head up to spot the shark",
    "Don't run out of bounds",
    "If tagged, high-five the shark",
  ],
  mb11: [
    "Match every step your partner takes",
    "Stay one step away — no touching",
    "Knees bent the whole drill",
    "Swap leader every 30 seconds",
    "Try silent — read the body, not the voice",
  ],
  mb12: [
    "Toss the ball above head height",
    "Time the jump so you catch at the peak",
    "Land two feet at the same instant",
    "Hold the ball tight to your chest",
    "Aim for five in a row without a drop",
  ],
  mb13: [
    "Only tag while dribbling — no running",
    "Five star-jumps if tagged, then rejoin",
    "Keep the dribble going whenever moving",
    "Head up to spot open space",
    "Everyone cheers when a friend comes back in",
  ],
  mb14: [
    "Copy the coach's dribble hand",
    "Copy the height of the dribble",
    "Copy the walking / jogging speed",
    "Add a spin when the coach spins",
    "Take turns as the leader",
  ],

  // --- Ball Handling ---
  bh01: [
    "Pound both balls at hip height",
    "Wrist snap only — no arm swing",
    "Wide athletic base, knees bent",
    "Chest and eyes up — never watch the ball",
    "Match the tempo of both hands exactly",
  ],
  bh02: [
    "Crossover at every cone",
    "Ball below the knee at the change point",
    "Plant hard on the outside foot",
    "Push off the plant into the new direction",
    "Ball stays within one hand-length of your body",
  ],
  bh03: [
    "Feet wider than shoulder-width",
    "Ball never leaves fingertip contact",
    "Smooth, unbroken figure-8 pattern",
    "Head up, eyes locked on a target",
    "Add a walking-forward variation once smooth",
  ],
  bh04: [
    "Both balls change hand at the same instant",
    "Keep the same rhythm through every move",
    "Between-the-legs: wide split of the legs",
    "Behind-the-back: ball wraps at hip height",
    "No looking down — feel the rhythm",
  ],
  bh05: [
    "Start in triple threat, chin over the ball",
    "Sell the first move with eyes and shoulders",
    "Second move must exit the first attack path",
    "Attack the defender's front foot",
    "Finish with a live-ball decision — shoot, pass or drive",
  ],
  bh06: [
    "React inside half a second of the signal",
    "Combo must match the direction called",
    "Stay in athletic base the whole rep",
    "No wasted bounces between moves",
    "Fail forward — reset and go again immediately",
  ],

  // --- Shooting ---
  sh01: [
    "Shooting hand only — guide hand off the ball",
    "Ball on the fingertips, wrist cocked",
    "Elbow lines up directly under the ball",
    "Snap the wrist, hold follow-through until it hits",
    "10 makes in a row before moving out one step",
  ],
  sh02: [
    "Alternate right and left hand every rep",
    "Use the backboard corner on every finish",
    "Off-hand knee drives up for lift",
    "Land inside the paint, ready to jump again",
    "Aim 20 consecutive makes without a drop",
  ],
  sh03: [
    "Two dribbles only — no wasted bounces",
    "Plant on the inside foot, square shoulders",
    "Consistent shot pocket every rep",
    "5 makes each spot before rotating",
    "Track your percentage per spot",
  ],
  sh04: [
    "Show hands early — call for the ball",
    "Curl tight to the screen — shoulder brushes it",
    "Feet arrive before the ball",
    "Land facing the rim",
    "Set-shoot rhythm — no dip",
  ],
  sh05: [
    "Attack with a hard first step to sell the drive",
    "Plant on the inside foot, step back on the outside",
    "Gather step + 2 steps (FIBA-legal footwork)",
    "Rise straight up — no drift",
    "Land balanced on both feet",
  ],
  sh06: [
    "Full-court sprint before every shot",
    "One dribble to gather, two steps into the pull-up",
    "Load the legs at the arc, not before",
    "Shoulders square to the rim on release",
    "5 makes each end — legs fatigued by rep 3",
  ],

  // --- Passing ---
  ps01: [
    "Chest pass: thumbs down, elbows tight",
    "Bounce pass: lands two-thirds of the way to target",
    "Overhead pass: ball behind head, snap the wrists",
    "Step into every pass — never arm-only",
    "Partner shows target hands before you release",
  ],
  ps02: [
    "45 continuous seconds of each pass type",
    "No soft passes — target speed every rep",
    "Feet stay active — small chops between passes",
    "Catch and release in one motion",
    "Track reps completed per 45-second block",
  ],
  ps03: [
    "No dribbles — passes only",
    "Pass and cut behind the receiver",
    "Sprint your lane at full speed",
    "Finish with a layup, not a jump shot",
    "Rotate roles each length of the court",
  ],
  ps04: [
    "Reject the drop coverage with a live dribble",
    "Pocket the ball at your hip",
    "Read the tag defender before you deliver",
    "Deliver on the move — one hand",
    "Pocket pass leads the roller into the paint",
  ],
  ps05: [
    "Ball must skip after two defensive rotations",
    "Skip receiver shows hands before the pass",
    "One-hand overhead skip only",
    "Receiver catches on the move",
    "No dribbling until the skip is delivered",
  ],

  // --- Footwork ---
  fw01: [
    "Two feet land at the same instant",
    "Either foot legal as pivot (FIBA)",
    "Forward pivot on inside foot: rip through",
    "Reverse pivot: sweep low through the ball",
    "10 clean reps each direction",
  ],
  fw02: [
    "Catch in a low, wide stance",
    "Chin over the ball on every catch",
    "Shot fake: eyes up to rim, shoulders lift",
    "Jab step: 6-inch push, ball stays live",
    "Sweep to the strong hand for the drive",
  ],
  fw03: [
    "Two-dribble attack to build speed",
    "First step wide toward the help defender",
    "Second step slashes back to the rim",
    "Both steps under the gather rule (FIBA)",
    "Finish with the far hand, ball protected",
  ],
  fw04: [
    "Catch on the block, sink your hips low",
    "Reverse-pivot on the baseline foot",
    "Face-up in triple threat",
    "One-dribble punch to the middle",
    "Finish square to the backboard",
  ],
  fw05: [
    "Chain hesitation into euro-step",
    "Add a step-through fake finish",
    "Reverse-layup counter on both sides",
    "Sell every finish with head and eyes",
    "5 clean reps each side, both directions",
  ],

  // --- Defense ---
  df01: [
    "Butt below the knees",
    "Feet outside the shoulders",
    "Hands mirror the ball",
    "Push off the back foot — never cross feet",
    "Change direction on the coach's whistle",
  ],
  df02: [
    "First 3 steps sprint, last 2 chop the feet",
    "High hand contests the release",
    "Low hand takes away the drive",
    "Land on balance — no fly-bys",
    "Force the shooter to the sideline",
  ],
  df03: [
    "Start with a hand on the ball",
    "Force baseline — funnel toward help",
    "Nose on the ball throughout",
    "Stay in stance on every dribble",
    "No reaching — move the feet",
  ],
  df04: [
    "Stunt at the ball, then recover to your player",
    "Two feet in the paint on help side",
    "Point one hand to ball, one to your player",
    "Close out with high hands after the skip",
    "Call names on every rotation",
  ],
  df05: [
    "Drop: big stays home, guard fights over the screen",
    "Hedge: big shows, forces retreat, recovers",
    "Switch: big and guard flip assignments cleanly",
    "Communicate coverage before the screen arrives",
    "Cover the pocket pass to the roller",
  ],

  // --- Rebounding ---
  rb01: [
    "Locate the shooter on release",
    "Reverse-pivot to feel their body",
    "Wide base, low hips, arms bent",
    "Hold contact for a full second",
    "Pursue the ball only after the seal is set",
  ],
  rb02: [
    "Alternate hands on every tip",
    "Contact the ball at the top of the jump",
    "Fingertip control — never slap",
    "Reset feet under the rim each rep",
    "Aim 10 tips without a catch",
  ],
  rb03: [
    "Toss the ball off the backboard from the wing",
    "Sprint under the ball as it comes off",
    "Two-foot power stance for the catch",
    "Chin the ball, elbows out wide",
    "Land ready to make the outlet pass",
  ],
  rb04: [
    "Attack the pad on the drive",
    "Absorb contact with shoulder and hip",
    "Extend the ball high with the off-hand",
    "Finish before the second bump",
    "Eyes stay on the target through the contact",
  ],

  // --- Conditioning ---
  cn01: [
    "Touch the line with your foot every time",
    "Bend low on the touch — don't stand tall",
    "Change of direction is where fitness lives",
    "Rest 30 seconds — recover on your feet",
    "Track your total time per set",
  ],
  cn02: [
    "17 sideline touches under 65 seconds",
    "Plant hard on each turn — no sliding",
    "Arms drive, don't just carry",
    "Breathe through the nose between reps",
    "Compare against last week's time",
  ],
  cn03: [
    "20 metres out and back on the beep",
    "10 seconds active recovery between shuttles",
    "Match the tempo — no early gates",
    "Record the level you reach",
    "Progress by 0.5 levels each week",
  ],

  // --- Basketball IQ ---
  iq01: [
    "Pass with intent — the receiver expects the cut",
    "Cut hard to the basket the instant you pass",
    "Hands up ready for the return pass",
    "Catch on the move, finish in stride",
    "Backdoor read if defender jumps the passing lane",
  ],
  iq02: [
    "Read on-ball defender first (over or under)",
    "Read screener's defender second (drop / hedge / switch)",
    "Reject the screen if defender goes over hard",
    "Split the two defenders if they hedge softly",
    "Heavy roll if they switch",
  ],
  iq03: [
    "On-ball screen sets first",
    "Back-screen on the drop big lands 0.5s later",
    "Roller pops if the back-screen is switched",
    "Ball handler reads three defenders at once",
    "Every action has a counter — rehearse both",
  ],
  iq04: [
    "Pass triggers a cut, cut triggers a fill",
    "No dribble in the first 3 seconds of possession",
    "Every pass must have a purpose",
    "Screen the screener for extra advantage",
    "Reset if the ball stops moving for 3 seconds",
  ],

  // --- Warm-Up ---
  wu01: [
    "High knees: hip flexors up to 90 degrees",
    "Butt kicks: heel to glute on every step",
    "Lateral lunges: knee tracks over the toe",
    "Inchworms: hands walk to plank, then back",
    "Arm circles: wide → small → reverse",
  ],
  wu02: [
    "React within half a second of the signal",
    "Sprint, slide and back-pedal at game speed",
    "Change direction with two hard plants",
    "Head up — visual cues only",
    "Progress to two-signal reactions",
  ],
};

// ---- Category-level fallback (custom drills) ----
const CATEGORY_FALLBACK = {
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
    "Elbow at 90 degrees, under the ball",
    "Snap the wrist, hold the follow-through",
    "Land where you jumped from",
  ],
  Passing: [
    "Step into every pass — transfer your weight",
    "Chest to chest — direct line to the receiver",
    "Thumbs finish pointing down on release",
    "Bounce pass lands two-thirds of the way to target",
    "Show target hands early, palms up",
  ],
  Footwork: [
    "Two-foot jump stop — either foot legal as pivot",
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

function pointsFor(drill) {
  if (!drill) return CATEGORY_FALLBACK.Custom;
  if (Array.isArray(drill.key_points) && drill.key_points.length) {
    return drill.key_points;
  }
  if (drill.id && DRILL_POINTS[drill.id]) {
    return DRILL_POINTS[drill.id];
  }
  return CATEGORY_FALLBACK[drill.category] || CATEGORY_FALLBACK.Custom;
}

export default function KeyPoints({ drill, light = false }) {
  const list = pointsFor(drill);
  const drillName = drill?.name || "This drill";
  const cat = drill?.category || "Custom";

  const wrapCls = light
    ? "border border-black bg-white rounded-sm p-4"
    : "border border-white/10 bg-black/30 rounded-sm p-4 print:bg-white print:border-black";
  const kickerCls = light
    ? "text-[10px] uppercase tracking-[0.3em] text-black font-bold mb-1"
    : "text-[10px] uppercase tracking-[0.3em] text-[#FFCD00] font-bold mb-1 print:text-black";
  const subCls = light
    ? "text-[10px] uppercase tracking-[0.2em] text-black/60 mb-3"
    : "text-[10px] uppercase tracking-[0.2em] text-white/40 mb-3 print:text-black";
  const itemCls = light
    ? "flex items-start gap-2 text-sm text-black leading-snug"
    : "flex items-start gap-2 text-sm text-white/80 leading-snug print:text-black";
  const bulletCls = light
    ? "mt-1.5 w-1.5 h-1.5 rounded-full bg-black shrink-0"
    : "mt-1.5 w-1.5 h-1.5 rounded-full bg-[#FFCD00] shrink-0 print:bg-black";

  return (
    <div className={wrapCls} data-testid="key-points">
      <div className={kickerCls}>Key Points · {drillName}</div>
      <div className={subCls}>{cat}</div>
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
