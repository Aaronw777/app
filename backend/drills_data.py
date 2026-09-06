"""
Curated basketball drill library. Content is written descriptively and inspired by
FIBA-style rules and the well-known Australian junior-to-senior basketball pathway.
Court Mastery is not affiliated with FIBA, Basketball Australia, the NBL, WNBL,
NBL1 or Aussie Hoops. All names remain the property of their respective owners.
Drills are tagged by skill category and difficulty.
"""

# Skill levels: 0=Mini-Ballers (Aussie Hoops), 1=Fundamental, 2=Developing, 3=Intermediate, 4=Advanced, 5=Expert
DRILLS = [
    # =========================================================================
    # LEVEL 0 — MINI-BALLERS / AUSSIE HOOPS (Age 4+)
    # Fun, movement-based, ball-familiarity drills. Modified rules & lowered rings.
    # =========================================================================
    {"id": "mb01", "name": "Animal Movements Warm-Up", "category": "Warm-Up", "level": 0,
     "duration": 8, "description": "Bear crawls, crab walks, bunny hops, kangaroo jumps — baseline to half-court and back.",
     "video": "https://www.youtube.com/embed/CtwjbNJf5N4",
     "coach_notes": "Aussie Hoops staple. Builds coordination through play, not instruction."},
    {"id": "mb02", "name": "Ball Familiarisation Circle", "category": "Ball Handling", "level": 0,
     "duration": 6, "description": "Sit or stand — roll the ball around your head, waist, knees, ankles. Switch directions.",
     "video": "https://www.youtube.com/embed/GVmm3BdKn7c",
     "coach_notes": "Kids meet the ball. No dribble yet — build touch and confidence first."},
    {"id": "mb03", "name": "Big Bounce & Catch", "category": "Ball Handling", "level": 0,
     "duration": 6, "description": "Two-hand bounce the ball, catch it, repeat 10 times. Then one bounce with each hand.",
     "video": "https://www.youtube.com/embed/GVmm3BdKn7c",
     "coach_notes": "Use a size 5 (junior) ball. Aussie Hoops size 4 for under 8s is even better."},
    {"id": "mb04", "name": "Statues Freeze Dribble", "category": "Ball Handling", "level": 0,
     "duration": 6, "description": "Kids dribble around the key. On coach whistle: freeze in a statue pose. Whoever moves is out.",
     "video": "https://www.youtube.com/embed/DxsTgspEnwI",
     "coach_notes": "Game format keeps 4-6 year olds engaged. Rewards ball control."},
    {"id": "mb05", "name": "Bin Ball Toss", "category": "Shooting", "level": 0,
     "duration": 6, "description": "Underhand two-hand scoop-toss into a low bin or lowered ring (1.5-2m).",
     "video": "https://www.youtube.com/embed/mn6mCwoOSfM",
     "coach_notes": "Confidence first — never full-height rings for under 8s (Basketball Australia guideline)."},
    {"id": "mb06", "name": "Two-Hand Push Shot", "category": "Shooting", "level": 0,
     "duration": 8, "description": "Standing 1m from a low ring (2m). Push the ball up with both hands — legs jump for extra reach.",
     "video": "https://www.youtube.com/embed/mn6mCwoOSfM",
     "coach_notes": "Aussie Hoops progression before the one-hand shot at age 8+."},
    {"id": "mb07", "name": "Rolling Pass Partners", "category": "Passing", "level": 0,
     "duration": 6, "description": "Sit facing partner 3m away. Roll the ball back and forth using two hands. Then progress to a bounce pass.",
     "video": "https://www.youtube.com/embed/y8Ah4qU4o30",
     "coach_notes": "Teaches target eyes before power. Start with roll, add height as they improve."},
    {"id": "mb08", "name": "Chest Pass Bullseye", "category": "Passing", "level": 0,
     "duration": 6, "description": "Two-hand chest pass to a partner or into a taped bullseye on the wall from 2m.",
     "video": "https://www.youtube.com/embed/y8Ah4qU4o30",
     "coach_notes": "Thumbs finish pointing down. Cue: 'push the ball to the target'."},
    {"id": "mb09", "name": "Traffic Lights", "category": "Footwork", "level": 0,
     "duration": 6, "description": "Coach calls RED (stop / two-foot jump stop), YELLOW (walk-dribble), GREEN (jog-dribble).",
     "video": "https://www.youtube.com/embed/G7uDPnA8sPY",
     "coach_notes": "Introduces the FIBA jump stop through play. Add ORANGE = spin!"},
    {"id": "mb10", "name": "Sharks & Minnows Dribble", "category": "Basketball IQ", "level": 0,
     "duration": 10, "description": "Minnows dribble sideline to sideline. 1-2 sharks (no ball) try to tap their ball out of bounds.",
     "video": "https://www.youtube.com/embed/gU0e9zXhCMg",
     "coach_notes": "Aussie Hoops favourite. Teaches head-up dribbling under mild pressure."},
    {"id": "mb11", "name": "Shadow Me", "category": "Defense", "level": 0,
     "duration": 6, "description": "Partner up. One player is the shadow, mirrors every step of the leader for 30 seconds. Swap.",
     "video": "https://www.youtube.com/embed/OuG9L3rccS8",
     "coach_notes": "Introduces defensive slides without saying the word 'defence'."},
    {"id": "mb12", "name": "Rebound Toss-Off-Wall", "category": "Rebounding", "level": 0,
     "duration": 6, "description": "Toss the ball above head against a wall or backboard. Jump, catch it at the top, land two feet.",
     "video": "https://www.youtube.com/embed/BAvzn12QCEQ",
     "coach_notes": "Teaches 'chin the ball' safely. No contact needed."},
    {"id": "mb13", "name": "Dribble Tag", "category": "Conditioning", "level": 0,
     "duration": 6, "description": "Everyone dribbles inside the key. If tagged, do 5 star-jumps and rejoin.",
     "video": "https://www.youtube.com/embed/EGMK0DcQ7fs",
     "coach_notes": "Cardio + ball control disguised as a game."},
    {"id": "mb14", "name": "Follow the Leader", "category": "Basketball IQ", "level": 0,
     "duration": 6, "description": "Line up behind the coach — everyone dribbles and copies the coach's moves (spin, high dribble, low, walk-jog).",
     "video": "https://www.youtube.com/embed/gU0e9zXhCMg",
     "coach_notes": "Great first-week session opener for 4-6 year olds."},

    # =========================================================================
    # LEVEL 1+ — REGULAR PATHWAY (Age 8+)
    # =========================================================================
    # BALL HANDLING
    {"id": "bh01", "name": "Stationary Two-Ball Pounding", "category": "Ball Handling", "level": 1,
     "duration": 6, "description": "Pound two balls at hip height simultaneously. Keep head up, wide base.",
     "video": "https://www.youtube.com/embed/JErq0KyOSTU",
     "coach_notes": "Focus on fingertip control. FIBA travel rules mean clean handles win possessions."},
    {"id": "bh02", "name": "Cone Zig-Zag Dribble", "category": "Ball Handling", "level": 2,
     "duration": 8, "description": "6 cones staggered 1m apart. Change hands at each cone with a crossover.",
     "video": "https://www.youtube.com/embed/DxsTgspEnwI",
     "coach_notes": "Low athletic stance; ball below the knee. Basketball Australia junior pathway staple."},
    {"id": "bh03", "name": "Figure-8 Between the Legs", "category": "Ball Handling", "level": 2,
     "duration": 6, "description": "Weave the ball between your legs in a figure-8 while walking forward.",
     "video": "https://www.youtube.com/embed/eiodfSMuU_g",
     "coach_notes": "Keep eyes on target — simulate reading a help defender."},
    {"id": "bh04", "name": "Two-Ball Crossover Series", "category": "Ball Handling", "level": 3,
     "duration": 8, "description": "Alternate crossovers, between-the-legs, behind-back with two balls.",
     "video": "https://www.youtube.com/embed/mAV1JStN4Zk",
     "coach_notes": "Ambidexterity is non-negotiable at NBL1 level."},
    {"id": "bh05", "name": "Live-Ball Combo Escape", "category": "Ball Handling", "level": 4,
     "duration": 10, "description": "From triple-threat, chain hesitation → cross → between-legs → attack.",
     "video": "https://www.youtube.com/embed/1WvxCn9ETyU",
     "coach_notes": "Every move must have a purpose. Sell the fake with eyes and shoulders."},
    {"id": "bh06", "name": "Pro Reaction Handle", "category": "Ball Handling", "level": 5,
     "duration": 10, "description": "Partner signals direction; execute matching combo move within 0.5s.",
     "video": "https://www.youtube.com/embed/1WvxCn9ETyU",
     "coach_notes": "Reactive handles separate NBL guards from domestic players."},

    # SHOOTING
    {"id": "sh01", "name": "Form Shooting (Close Range)", "category": "Shooting", "level": 1,
     "duration": 10, "description": "One-hand shooting from 1m. 10 makes each spot: middle, left elbow, right elbow.",
     "video": "https://www.youtube.com/embed/mn6mCwoOSfM",
     "coach_notes": "BEEF: Balance, Eyes, Elbow, Follow-through. FIBA 3-point line is 6.75m — build habits early."},
    {"id": "sh02", "name": "Mikan Layup Series", "category": "Shooting", "level": 1,
     "duration": 8, "description": "Alternating right and left hand layups continuously under the ring.",
     "video": "https://www.youtube.com/embed/0hDgeVEIRxk",
     "coach_notes": "Use the backboard. Basketball Australia mandates ambidextrous finishing at U14+."},
    {"id": "sh03", "name": "Spot Shooting — 5 Spots", "category": "Shooting", "level": 2,
     "duration": 10, "description": "Two dribbles in and shoot from 5 perimeter spots. 5 makes each.",
     "video": "https://www.youtube.com/embed/HeCV61hlOtY",
     "coach_notes": "Square shoulders to rim. Consistent shot pocket."},
    {"id": "sh04", "name": "Catch-and-Shoot off Screen", "category": "Shooting", "level": 3,
     "duration": 10, "description": "Curl or fade off a chair 'screen'. Land in triple-threat.",
     "video": "https://www.youtube.com/embed/vTAcumemVfM",
     "coach_notes": "Show hands early — a WNBL/NBL1 habit."},
    {"id": "sh05", "name": "Step-Back Jumper", "category": "Shooting", "level": 4,
     "duration": 10, "description": "Attack, plant, step back into a balanced jumper. Both directions.",
     "video": "https://www.youtube.com/embed/gjeS0oCoJRk",
     "coach_notes": "FIBA travel: gather step + 2 steps. Practise legal footwork."},
    {"id": "sh06", "name": "NBA-Range Pull-Up Series", "category": "Shooting", "level": 5,
     "duration": 12, "description": "Full-court sprint, pull-up jumper at NBA/FIBA 3-point line each end.",
     "video": "https://www.youtube.com/embed/GNJ2f8AA3zc",
     "coach_notes": "Legs fresh in Q4 = professional. Condition and shoot."},

    # PASSING
    {"id": "ps01", "name": "Chest & Bounce Pass Reps", "category": "Passing", "level": 1,
     "duration": 6, "description": "Partner passes: 20 chest, 20 bounce, 20 overhead.",
     "video": "https://www.youtube.com/embed/y8Ah4qU4o30",
     "coach_notes": "Thumbs down on follow through. Bounce pass 2/3 to target."},
    {"id": "ps02", "name": "Wall Passing Circuit", "category": "Passing", "level": 2,
     "duration": 8, "description": "45 seconds each: chest, bounce, one-hand push, behind-back to wall.",
     "video": "https://www.youtube.com/embed/2sZM_pM7Yqs",
     "coach_notes": "Timing tempo — no soft passes."},
    {"id": "ps03", "name": "3-Man Weave Full Court", "category": "Passing", "level": 3,
     "duration": 10, "description": "Classic 3-man weave, finishing with layup. No dribbles.",
     "video": "https://www.youtube.com/embed/9EEvLXOWUOo",
     "coach_notes": "Pass and cut behind. Basketball Australia pathway warm-up."},
    {"id": "ps04", "name": "Pocket Pass off Ball Screen", "category": "Passing", "level": 4,
     "duration": 10, "description": "Live pick-and-roll reps: attack, pocket pass to roller.",
     "video": "https://www.youtube.com/embed/0lIbmDeuNzE",
     "coach_notes": "Read tag defender. Under-19 Boomers/Gems staple."},
    {"id": "ps05", "name": "Skip Pass Decision Drill", "category": "Passing", "level": 5,
     "duration": 10, "description": "Live 3-on-3 with 'shell' — must skip pass on 2 rotations.",
     "video": "https://www.youtube.com/embed/9wjRvxKp0J8",
     "coach_notes": "Ball movement > player movement at NBL level."},

    # FOOTWORK
    {"id": "fw01", "name": "Jump Stop & Pivot", "category": "Footwork", "level": 1,
     "duration": 6, "description": "Jump stop off catch. Pivot forward/reverse on inside foot 10 reps.",
     "video": "https://www.youtube.com/embed/G7uDPnA8sPY",
     "coach_notes": "Two-foot jump stop = either foot as pivot (FIBA rule)."},
    {"id": "fw02", "name": "Triple-Threat Reads", "category": "Footwork", "level": 2,
     "duration": 6, "description": "Catch → triple-threat → shot fake → jab → sweep. 5 reps each direction.",
     "video": "https://www.youtube.com/embed/5CIf6Ck4W-4",
     "coach_notes": "Chin over the ball. Eyes at the rim."},
    {"id": "fw03", "name": "Euro-Step Finish", "category": "Footwork", "level": 3,
     "duration": 8, "description": "Two-dribble attack, euro-step around a chair, finish.",
     "video": "https://www.youtube.com/embed/hE2Zt-djtwc",
     "coach_notes": "FIBA gather + 2 steps legal. Sell the direction change."},
    {"id": "fw04", "name": "Reverse Pivot Attack", "category": "Footwork", "level": 4,
     "duration": 8, "description": "Post catch, reverse pivot into face-up, one-dribble drive.",
     "video": "https://www.youtube.com/embed/eCyC3E5f2xY",
     "coach_notes": "NBL-level bigs use pivot mastery to create counter finishes."},
    {"id": "fw05", "name": "Combo Finish Package", "category": "Footwork", "level": 5,
     "duration": 12, "description": "Chain: hesitation → euro → step-through → reverse layup on both sides.",
     "video": "https://www.youtube.com/embed/BuInf68q5rY",
     "coach_notes": "Elite finishers have 5+ counters."},

    # DEFENSE
    {"id": "df01", "name": "Defensive Stance & Slide", "category": "Defense", "level": 1,
     "duration": 8, "description": "Sideline to sideline defensive slides — no crossing feet.",
     "video": "https://www.youtube.com/embed/OuG9L3rccS8",
     "coach_notes": "Butt down, chest up, hands active. Foundation for everything."},
    {"id": "df02", "name": "Closeout Drill", "category": "Defense", "level": 2,
     "duration": 8, "description": "Sprint 4 steps, chop feet last 2, high hand on shooter.",
     "video": "https://www.youtube.com/embed/USvLwuTf47c",
     "coach_notes": "Contest without fouling — FIBA cylinder rule."},
    {"id": "df03", "name": "1-on-1 Live from the Wing", "category": "Defense", "level": 3,
     "duration": 10, "description": "Wing 1-on-1, defender starts with hand on ball. Force baseline.",
     "video": "https://www.youtube.com/embed/gRz9Yfum2LM",
     "coach_notes": "Nose on ball. Take the challenge."},
    {"id": "df04", "name": "Help & Recover", "category": "Defense", "level": 4,
     "duration": 10, "description": "2-on-2 with skip pass; help defender must stunt and recover.",
     "video": "https://www.youtube.com/embed/DKAyQnzYAg8",
     "coach_notes": "Shell defense principles used by Boomers/Opals."},
    {"id": "df05", "name": "Pick-and-Roll Defense Reads", "category": "Defense", "level": 5,
     "duration": 12, "description": "Live PnR reps: drop, hedge, switch. Communicate every screen.",
     "video": "https://www.youtube.com/embed/fSABBcYNSHc",
     "coach_notes": "NBL coverage packages start here."},

    # REBOUNDING & FINISHING
    {"id": "rb01", "name": "Box-Out Fundamentals", "category": "Rebounding", "level": 1,
     "duration": 6, "description": "Partner shoots; box out with reverse pivot before pursuing ball.",
     "video": "https://www.youtube.com/embed/BAvzn12QCEQ",
     "coach_notes": "Find, hit, get. Rebounds = extra possessions."},
    {"id": "rb02", "name": "Tip Drill", "category": "Rebounding", "level": 2,
     "duration": 6, "description": "Alternating hands, tip ball off backboard 10 times without catching.",
     "video": "https://www.youtube.com/embed/RC1YkFPeOG8",
     "coach_notes": "Vertical jump + timing."},
    {"id": "rb03", "name": "Superman Rebounding", "category": "Rebounding", "level": 3,
     "duration": 8, "description": "Toss ball off backboard from wing, sprint and rebound in two-foot power stance.",
     "video": "https://www.youtube.com/embed/gvS9DrqCLKM",
     "coach_notes": "Chin the ball, elbows out. FIBA doesn't call soft over-the-back."},
    {"id": "rb04", "name": "Contact Finish Series", "category": "Rebounding", "level": 4,
     "duration": 10, "description": "Coach with pad; player attacks and finishes through contact.",
     "video": "https://www.youtube.com/embed/HxaLdNqBqhQ",
     "coach_notes": "Absorb, extend, finish high."},

    # CONDITIONING
    {"id": "cn01", "name": "Line Touches (Suicides)", "category": "Conditioning", "level": 1,
     "duration": 6, "description": "Full-court suicides: FT → half → far FT → baseline. Rest 30s.",
     "video": "https://www.youtube.com/embed/EGMK0DcQ7fs",
     "coach_notes": "Change-of-direction is basketball fitness."},
    {"id": "cn02", "name": "17s — Sideline to Sideline", "category": "Conditioning", "level": 3,
     "duration": 5, "description": "17 sideline touches in under 60 seconds. NBL benchmark 65s.",
     "video": "https://www.youtube.com/embed/pxdmZv9nH50",
     "coach_notes": "Common high-performance testing protocol used across Australian pathway programs."},
    {"id": "cn03", "name": "Yo-Yo Intermittent Recovery", "category": "Conditioning", "level": 4,
     "duration": 10, "description": "20m shuttle with progressive tempo. Track level reached.",
     "video": "https://www.youtube.com/embed/DePOTfshMzs",
     "coach_notes": "Used across NBL/WNBL pre-season."},

    # BASKETBALL IQ / TEAM PLAY
    {"id": "iq01", "name": "Give-and-Go", "category": "Basketball IQ", "level": 1,
     "duration": 6, "description": "Pass and cut hard to the basket for return pass and layup.",
     "video": "https://www.youtube.com/embed/gU0e9zXhCMg",
     "coach_notes": "Cut with intent; hands ready."},
    {"id": "iq02", "name": "Pick-and-Roll Reads", "category": "Basketball IQ", "level": 3,
     "duration": 10, "description": "Live 2-on-2 PnR: read drop, switch, hedge coverages.",
     "video": "https://www.youtube.com/embed/0lIbmDeuNzE",
     "coach_notes": "PnR is basketball's most-run action at every level."},
    {"id": "iq03", "name": "Spain Pick-and-Roll", "category": "Basketball IQ", "level": 4,
     "duration": 12, "description": "Ball screen + back-screen on the drop defender. 3-player action.",
     "video": "https://www.youtube.com/embed/l0m2iCbtiPY",
     "coach_notes": "Featured by Boomers at FIBA World Cup. Timing is everything."},
    {"id": "iq04", "name": "5-on-5 Half-Court Motion", "category": "Basketball IQ", "level": 5,
     "duration": 15, "description": "Live scrimmage — must pass and cut, no dribbles for first 3 seconds.",
     "video": "https://www.youtube.com/embed/9wjRvxKp0J8",
     "coach_notes": "Reads over calls. NBL free-flow offense."},

    # WARM UP
    {"id": "wu01", "name": "Dynamic Warm-Up", "category": "Warm-Up", "level": 1,
     "duration": 8, "description": "High knees, butt kicks, lateral lunges, inchworms, arm circles.",
     "video": "https://www.youtube.com/embed/L_xrDAtykMI",
     "coach_notes": "Never skip. FIBA injury data shows warm-up cuts ACL risk."},
    {"id": "wu02", "name": "Reactive Agility Warm-Up", "category": "Warm-Up", "level": 3,
     "duration": 8, "description": "Coach points direction; player sprints/slides/back-pedals accordingly.",
     "video": "https://www.youtube.com/embed/L_xrDAtykMI",
     "coach_notes": "Central nervous system prep for competitive intensity."},
]

# 10-Week Program Blueprint — themes progressing from fundamental → professional
WEEKS_BLUEPRINT = [
    {"week": 1, "theme": "Foundations & Footwork", "focus": ["Warm-Up", "Footwork", "Ball Handling"]},
    {"week": 2, "theme": "Ball Handling Mastery", "focus": ["Warm-Up", "Ball Handling", "Conditioning"]},
    {"week": 3, "theme": "Shooting Mechanics", "focus": ["Warm-Up", "Shooting", "Footwork"]},
    {"week": 4, "theme": "Passing & Court Vision", "focus": ["Warm-Up", "Passing", "Basketball IQ"]},
    {"week": 5, "theme": "1-on-1 Offence", "focus": ["Warm-Up", "Footwork", "Shooting"]},
    {"week": 6, "theme": "Defensive Principles", "focus": ["Warm-Up", "Defense", "Conditioning"]},
    {"week": 7, "theme": "Rebounding & Finishing", "focus": ["Warm-Up", "Rebounding", "Shooting"]},
    {"week": 8, "theme": "Pick-and-Roll Concepts", "focus": ["Warm-Up", "Basketball IQ", "Passing"]},
    {"week": 9, "theme": "Team Play Integration", "focus": ["Warm-Up", "Basketball IQ", "Defense"]},
    {"week": 10, "theme": "Game Simulation & Assessment", "focus": ["Warm-Up", "Basketball IQ", "Conditioning"]},
]

# Skill level mapping — starting level shifts the drill difficulty band per week
LEVEL_MAP = {
    # Aussie Hoops / Mini-Ballers — mostly Level 0 with a taste of Level 1 by week 8
    "mini_ballers":[0, 0, 0, 0, 0, 0, 0, 1, 1, 1],
    "fundamental": [1, 1, 1, 2, 2, 2, 2, 3, 3, 3],
    "developing":  [1, 2, 2, 2, 3, 3, 3, 3, 4, 4],
    "intermediate":[2, 2, 3, 3, 3, 4, 4, 4, 4, 5],
    "advanced":    [3, 3, 4, 4, 4, 4, 5, 5, 5, 5],
    "expert":      [4, 4, 4, 5, 5, 5, 5, 5, 5, 5],
    # Backward compatibility for existing saved programs
    "professional":[4, 4, 4, 5, 5, 5, 5, 5, 5, 5],
}


def _pick_drill(category: str, level: int, exclude_ids=None):
    """Pick the drill in `category` whose level is closest to `level` (prefer equal or lower)."""
    exclude_ids = exclude_ids or set()
    candidates = [d for d in DRILLS if d["category"] == category and d["id"] not in exclude_ids]
    if not candidates:
        return None
    # Sort by distance, prefer <= level
    candidates.sort(key=lambda d: (abs(d["level"] - level), d["level"] > level))
    return candidates[0]


def build_program(gender: str, starting_age: int, skill_level: str) -> list:
    """Return a list of 10 session objects."""
    skill_level = skill_level.lower()
    if skill_level not in LEVEL_MAP:
        skill_level = "developing"

    level_progression = LEVEL_MAP[skill_level]
    is_mini = skill_level == "mini_ballers"
    # Aussie Hoops recommends shorter attention-span sessions for age 4-7
    target_minutes = 40 if is_mini else 50

    sessions = []

    for wk in WEEKS_BLUEPRINT:
        week_level = level_progression[wk["week"] - 1]
        drills = []
        used = set()

        # Session structure: 1 warm-up + skill blocks
        for category in wk["focus"]:
            drill = _pick_drill(category, week_level, used)
            if drill:
                drills.append(drill)
                used.add(drill["id"])

        # Add a closing IQ / application piece if space permits
        if wk["week"] >= 4 and "Basketball IQ" not in wk["focus"]:
            iq = _pick_drill("Basketball IQ", week_level, used)
            if iq:
                drills.append(iq)
                used.add(iq["id"])

        total = sum(d["duration"] for d in drills)

        # Rotate through all focus categories (not just primary) when filling to target
        fill_categories = [c for c in wk["focus"] if c != "Warm-Up"] + ["Basketball IQ", "Conditioning"]
        idx = 0
        while total < target_minutes and idx < len(fill_categories) * 3:
            cat = fill_categories[idx % len(fill_categories)]
            extra = _pick_drill(cat, week_level, used)
            if extra:
                drills.append(extra)
                used.add(extra["id"])
                total += extra["duration"]
            idx += 1

        # Coach reference — Aussie Hoops copy for mini-ballers
        if is_mini:
            coach_ref = (
                f"Aussie-Hoops-style · {'Girls' if gender == 'womens' else 'Boys'} · Age {starting_age}+ · "
                f"Modified FIBA-style rules (lowered ring, size 4-5 ball)"
            )
        else:
            coach_ref = (
                f"Inspired by the Australian {'women' if gender == 'womens' else 'men'}'s "
                f"basketball pathway · Age {starting_age}+ · FIBA-style rules"
            )

        sessions.append({
            "week": wk["week"],
            "theme": wk["theme"],
            "target_level": week_level,
            "total_minutes": total,
            "drills": drills,
            "coach_reference": coach_ref,
            "completed": False,
            "notes": "",
        })
    return sessions
