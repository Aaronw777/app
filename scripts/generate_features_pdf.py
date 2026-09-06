"""
Generates the shareable Court Mastery user-guide PDF into:
  /app/frontend/public/court-mastery-features.pdf

Ships publicly at <frontend origin>/court-mastery-features.pdf.
Run:  python /app/scripts/generate_features_pdf.py
"""

from pathlib import Path
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor, white
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    PageBreak,
    KeepTogether,
)

OUT = Path("/app/frontend/public/court-mastery-features.pdf")
OUT.parent.mkdir(parents=True, exist_ok=True)

GOLD = HexColor("#FFCD00")
INK = HexColor("#0d0d0d")
MID = HexColor("#3a3a3a")
LIGHT = HexColor("#7a7a7a")
ORANGE = HexColor("#FF7324")
GREEN = HexColor("#00854A")
PANEL = HexColor("#f6f6f6")

# Each entry: (Section Title, One-line summary, ["Step 1...", "Step 2..."])
FEATURES = [
    (
        "1. Sign Up & Sign In",
        "Create an account so your programs, teams and media stay saved across devices.",
        [
            "Go to the landing page and tap Register.",
            "Enter your name, email and a password (minimum 6 characters).",
            "Tap Create Account — you'll land straight on the Dashboard.",
            "Next time, tap Login and enter your email + password.",
            "Sessions last 24 hours. Tap Logout in the top nav bar to end early.",
        ],
    ),
    (
        "2. Build a 10-Week Program",
        "The Program Builder auto-generates a full 10-week training ladder from four inputs.",
        [
            "On the Dashboard, tap New Program (top-right).",
            "Enter the player's name (e.g. \"Under-12 Squad\").",
            "Toggle Mens or Womens.",
            "Slide Starting Age to the correct age (4 through 35+). Ages 4-7 unlock the Aussie-Hoops-style Mini-Ballers tier.",
            "Pick a Skill Level: Mini-Ballers, Fundamental, Developing, Intermediate, Advanced, Expert or Professional.",
            "Tap Build 10-Week Program. The system creates 10 progressively harder sessions and returns you to the Dashboard card view.",
        ],
    ),
    (
        "3. Program Cover Hype Reel",
        "Give any program a motion cover — an image thumbnail or a muted-autoplay video reel.",
        [
            "Open the program (Dashboard → Open Program).",
            "Next to the title, tap the large square placeholder marked Upload.",
            "Pick any image (JPG, PNG, WebP, HEIC up to 25MB) or a video (MP4, MOV, WebM, AVI, MKV, 3GP up to 500MB).",
            "The cover instantly saves. Return to the Dashboard — video covers play as a muted, looping hype reel behind the program card.",
            "Tap the × on the placeholder to remove it, then upload another to swap.",
        ],
    ),
    (
        "4. Session View — Run a Training Day",
        "The core coaching screen: drill list, timer, key points and coach notes.",
        [
            "From the Program view, tap any week (W01…W10).",
            "Read the drill list at the top — each drill shows minutes, category and difficulty level.",
            "Tap the Session Timer play button to start the auto-advancing MM:SS countdown. It beeps and jumps to the next drill when time is up.",
            "Use ⏮ / ⏭ / ⏸ / ▶ / Reset controls to move around drills manually.",
            "Under each drill, review the Key Points bullets (the specific coaching cues for that drill).",
            "Tap the YouTube link under Coach Notes to open a search for that drill on YouTube.",
            "Add photos or short video clips with the Session Photos upload block.",
            "Type Coach Notes in the notes box and toggle Mark Session Complete when you're done.",
        ],
    ),
    (
        "5. Amend a Session — Custom Drills",
        "Reshape any pre-built session with your own drills or extra library picks.",
        [
            "On any Session View, tap Amend Session.",
            "Use the Drill Library modal to filter by category and level, then tap Add on a library drill.",
            "Or tap New Custom Drill to enter name, category, minutes, level, description, coach notes and an optional media clip.",
            "Reorder drills with the up/down arrows on each card, or tap × to remove a drill.",
            "The total minutes recalculate live at the top of the list.",
            "Tap Save Changes. Every player on any team linked to this program picks up the new plan automatically.",
        ],
    ),
    (
        "6. Team Rosters",
        "Group players under one program and track everyone on a single completion board.",
        [
            "In the top nav, tap Teams then + New Team.",
            "Enter a team name and choose the training program that will drive the sessions.",
            "Tap Create Team — you're taken to the roster board.",
            "Tap the large team-logo upload square to attach a logo (image only, up to 25MB).",
            "Under Add Player, type a name and tap Add. Repeat for every athlete.",
            "The board shows one row per player × ten week columns. Tap any cell to tick that player's week complete. Ticking a cell automatically logs a training-attendance record (see feature 8).",
        ],
    ),
    (
        "7. Player Bio Cards",
        "Tap-through profile per player with jersey #, position, season stats and attendance log.",
        [
            "On a Team Roster board, tap any player's photo/name row.",
            "The Player Profile modal opens.",
            "Tap the large photo tile to upload a headshot.",
            "Edit Name, Jersey # and Position in the top row.",
            "Under Season Stats, update Games Played, 3-Pointers, 2-Pointers, Free Throws and Total Fouls. Total Points recomputes live (3s×3 + 2s×2 + 1s×1).",
            "Scroll to Training Attendance to see every session week and date this player was marked complete.",
            "Tap Save Profile to persist. Assistant coaches see this modal read-only.",
        ],
    ),
    (
        "8. Attendance Register (Auto)",
        "Every ticked session on the roster board logs an attendance row automatically.",
        [
            "Open a Team Roster board.",
            "Tap a session cell (e.g. W03) for any player.",
            "Behind the scenes, an attendance record with the week, current date and the coach's name is appended to that player's profile.",
            "Un-tick the cell to remove the attendance row for that week.",
            "View the full attendance history by opening the Player Bio Card (see feature 7).",
        ],
    ),
    (
        "9. Assistant Coach Access",
        "Invite another registered user to help run a specific team without giving away the whole account.",
        [
            "Owner: open the Team Roster board and find the Assistant Coach Invite panel at the top.",
            "Tap the 6-digit code once to reveal it, then Copy to send it to the assistant (SMS, email, chat).",
            "Assistant: create their own Court Mastery account (or log in).",
            "In the top nav, Assistant taps Teams then Join Team (top-right).",
            "Enter the 6-digit invite code and tap Join. They're taken straight to the team board.",
            "Assistant permissions: mark attendance, update player photos, view attendance history. They cannot add/remove players, edit stats, delete the team, or change the team logo.",
            "Owner can revoke access anytime: tap the × on the assistant's name chip, or Rotate the invite code to invalidate any codes already shared.",
            "Assistant can leave voluntarily via Teams → hover the team card → tap the leave icon.",
        ],
    ),
    (
        "10. Session Timer",
        "A sticky, floating countdown clock that runs a whole session hands-free.",
        [
            "On any Session View the timer sits pinned at the top.",
            "It automatically loads the current drill's duration.",
            "Tap ▶ Play to start, ⏸ to pause, Reset to reload the current drill's time.",
            "It ticks at 1 Hz. When it hits 00:00 it plays a beep, auto-advances to the next drill and starts a fresh countdown.",
            "Use ⏮ / ⏭ to jump back or forward between drills.",
            "The counter (\"Drill 3 / 6\") shows where you are in the session.",
        ],
    ),
    (
        "11. Parent Handout",
        "One-page take-home summary for parents or younger players.",
        [
            "Open a Session View.",
            "Tap Parent Handout in the top-right button row.",
            "A clean black-on-white printable page opens with the drills numbered, coach hints, 3-star rate boxes and a \"This week I felt…\" emoji row.",
            "Mini-Baller tier programs get an extra Grown-Up Tips panel.",
            "Tap Print — your browser's PDF dialog opens. Save or send it home with the player.",
        ],
    ),
    (
        "12. Print & PDF Export",
        "Every key page has a print-optimised layout.",
        [
            "Dashboard, Program, Session, Roster and Parent Handout all support the browser Print dialog.",
            "Tap Print Session / Print Roster / Print Program buttons where available, or use Cmd/Ctrl + P.",
            "The layout hides menus, buttons and modals, keeping content, diagrams and coach notes visible.",
            "Save as PDF from the browser dialog to archive or share.",
        ],
    ),
    (
        "13. Media — Photos & Videos",
        "Attach images and video clips throughout the app. Backed by secure per-user storage.",
        [
            "Upload spots: team logo, player photo, custom-drill media, session photos, program cover.",
            "Images: JPG, PNG, GIF, WebP, HEIC / HEIF up to 25MB.",
            "Videos: MP4, MOV, WebM, AVI, MKV, 3GP up to 500MB.",
            "iPhone .mov and Android .3gp files upload without conversion.",
            "Long videos stream (HTTP Range) — scrubbing works and the server does not buffer the whole file.",
            "Media is private to your account and served through an authenticated URL.",
            "Tap × on any upload tile to remove the attached media.",
        ],
    ),
    (
        "14. PlayHQ Shortcut",
        "One-tap link out to Basketball Australia's fixtures / stats platform.",
        [
            "On the Dashboard, tap the Open PlayHQ tile.",
            "playhq.com opens in a new tab — use it for real-world fixtures, ladders, registrations and match stats. (Independent third-party site; Court Mastery is not affiliated.)",
        ],
    ),
    (
        "15. Progressive Web App (PWA)",
        "Install Court Mastery like a native app on iOS, Android or desktop.",
        [
            "iOS: open Court Mastery in Safari → tap the Share icon → Add to Home Screen.",
            "Android: open in Chrome → tap the three-dot menu → Install app.",
            "Desktop: tap the install icon in the address bar (Chrome/Edge) or the Install Court Mastery prompt if it appears.",
            "Once installed it opens in its own window, offline shell loads from the service worker cache, and it behaves like a native app.",
        ],
    ),
    (
        "16. Drill Library Reference",
        "54+ curated static drills across skill tiers — no AI, no drift, no copyright risk.",
        [
            "Amend Session → Drill Library button opens the searchable modal.",
            "Filter by category (Ball Handling, Shooting, Defense, Rebounding, Conditioning, Footwork, Passing, Basketball IQ, Warm-Up) and by level (0-5).",
            "Each drill card shows duration, level, description, coach notes and Key Points.",
            "The library is versioned in code so drill descriptions stay consistent across every program and printout.",
        ],
    ),
]

styles = {
    "h1": ParagraphStyle(
        "H1",
        fontName="Helvetica-Bold",
        fontSize=30,
        leading=34,
        textColor=INK,
        spaceAfter=6,
    ),
    "kicker": ParagraphStyle(
        "Kicker",
        fontName="Helvetica-Bold",
        fontSize=9,
        leading=12,
        textColor=ORANGE,
        spaceAfter=8,
    ),
    "subtitle": ParagraphStyle(
        "Subtitle",
        fontName="Helvetica",
        fontSize=11,
        leading=15,
        textColor=MID,
        spaceAfter=14,
    ),
    "h2": ParagraphStyle(
        "H2",
        fontName="Helvetica-Bold",
        fontSize=14,
        leading=18,
        textColor=INK,
        spaceBefore=6,
        spaceAfter=2,
    ),
    "summary": ParagraphStyle(
        "Summary",
        fontName="Helvetica-Oblique",
        fontSize=10,
        leading=13,
        textColor=MID,
        spaceAfter=6,
    ),
    "howto": ParagraphStyle(
        "HowTo",
        fontName="Helvetica-Bold",
        fontSize=8.5,
        leading=11,
        textColor=ORANGE,
        spaceAfter=2,
    ),
    "step": ParagraphStyle(
        "Step",
        fontName="Helvetica",
        fontSize=10,
        leading=14,
        textColor=INK,
        leftIndent=14,
        bulletIndent=2,
        spaceAfter=0,
        alignment=TA_LEFT,
    ),
    "footer": ParagraphStyle(
        "Footer",
        fontName="Helvetica",
        fontSize=7.6,
        leading=10,
        textColor=LIGHT,
        alignment=TA_LEFT,
    ),
}


def draw_header(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(GOLD)
    canvas.rect(0, A4[1] - 22 * mm, A4[0], 22 * mm, fill=1, stroke=0)
    canvas.setFillColor(INK)
    canvas.setFont("Helvetica-Bold", 22)
    canvas.drawString(20 * mm, A4[1] - 15 * mm, "COURT MASTERY")
    canvas.setFont("Helvetica", 8)
    canvas.drawRightString(
        A4[0] - 20 * mm, A4[1] - 15 * mm, "USER GUIDE · 10-WEEK PROGRAM BUILDER"
    )

    canvas.setFillColor(MID)
    canvas.setStrokeColor(MID)
    canvas.setLineWidth(0.5)
    canvas.line(20 * mm, 18 * mm, A4[0] - 20 * mm, 18 * mm)
    canvas.setFont("Helvetica", 7.5)
    canvas.setFillColor(LIGHT)
    canvas.drawString(
        20 * mm,
        13 * mm,
        "Court Mastery is an independent training tool. Not affiliated with Basketball Australia, NBL, WNBL, NBL1, Aussie Hoops, Boomers, Opals or FIBA.",
    )
    canvas.drawString(
        20 * mm, 9 * mm, "All names and marks referenced belong to their respective owners and are used descriptively."
    )
    canvas.drawRightString(A4[0] - 20 * mm, 9 * mm, f"Page {doc.page}")
    canvas.restoreState()


def feature_block(title, summary, steps):
    """Return a KeepTogether flowable so a feature never splits across pages."""
    elems = [
        Paragraph(title.upper(), styles["h2"]),
        Paragraph(summary, styles["summary"]),
        Paragraph("HOW TO USE:", styles["howto"]),
    ]
    for s in steps:
        elems.append(Paragraph(s, styles["step"], bulletText="\u25B8"))
    elems.append(Spacer(1, 5 * mm))
    return KeepTogether(elems)


def build():
    doc = BaseDocTemplate(
        str(OUT),
        pagesize=A4,
        leftMargin=20 * mm,
        rightMargin=20 * mm,
        topMargin=32 * mm,
        bottomMargin=24 * mm,
        title="Court Mastery — User Guide",
        author="Court Mastery",
    )
    frame = Frame(
        doc.leftMargin,
        doc.bottomMargin,
        doc.width,
        doc.height,
        id="content",
    )
    doc.addPageTemplates([PageTemplate(id="all", frames=[frame], onPage=draw_header)])

    story = []

    story.append(Paragraph("USER GUIDE · FEBRUARY 2026", styles["kicker"]))
    story.append(Paragraph("How to use Court Mastery.", styles["h1"]))
    story.append(
        Paragraph(
            "A step-by-step handbook to every feature inside Court Mastery — the 10-week "
            "basketball training-program builder for coaches, players and parents. "
            "Works from Aussie-Hoops-style mini-ballers (age 4+) all the way to NBL / WNBL "
            "expert prep. Follow the steps in each section to get the most out of the app.",
            styles["subtitle"],
        )
    )

    stats = [
        ["16", "50+", "500MB", "6", "0"],
        ["Features", "Curated drills", "Max video size", "Skill tiers", "Ads"],
    ]
    stat_table = Table(stats, colWidths=[doc.width / 5] * 5, rowHeights=[16 * mm, 8 * mm])
    stat_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), INK),
                ("TEXTCOLOR", (0, 0), (-1, 0), GOLD),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, 0), 24),
                ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                ("VALIGN", (0, 0), (-1, 0), "MIDDLE"),
                ("BACKGROUND", (0, 1), (-1, 1), PANEL),
                ("TEXTCOLOR", (0, 1), (-1, 1), MID),
                ("FONTNAME", (0, 1), (-1, 1), "Helvetica-Bold"),
                ("FONTSIZE", (0, 1), (-1, 1), 7.5),
                ("VALIGN", (0, 1), (-1, 1), "MIDDLE"),
                ("LINEBEFORE", (1, 0), (-1, -1), 1, white),
            ]
        )
    )
    story.append(stat_table)
    story.append(Spacer(1, 10 * mm))

    for title, summary, steps in FEATURES:
        story.append(feature_block(title, summary, steps))

    story.append(PageBreak())
    story.append(Paragraph("QUICK REFERENCE", styles["h2"]))
    story.append(
        Paragraph(
            "Common workflows in one glance.",
            styles["subtitle"],
        )
    )

    quick = [
        ("Run today's training", "Programs → open program → tap this week → tap ▶ Play on the Session Timer."),
        ("Print a parent take-home", "Session View → Parent Handout → Print."),
        ("Bring on an assistant coach", "Team board → Assistant Coach Invite → Copy the 6-digit code → give it to the assistant → they Register + tap Join Team."),
        ("Update a player's stats", "Team board → tap the player row → edit fields in the Player Profile modal → Save Profile."),
        ("Upload a hype-reel cover", "Program view → tap the cover square → pick a video up to 500MB → returns to Dashboard playing muted on loop."),
        ("Install on phone", "Open in Safari (iOS) or Chrome (Android) → Add to Home Screen / Install App."),
    ]
    ref_rows = [[Paragraph(f"<b>{q[0]}</b>", styles["step"]), Paragraph(q[1], styles["step"])] for q in quick]
    ref_table = Table(ref_rows, colWidths=[55 * mm, doc.width - 55 * mm])
    ref_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (0, -1), PANEL),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("BOX", (0, 0), (-1, -1), 0.4, MID),
                ("INNERGRID", (0, 0), (-1, -1), 0.4, HexColor("#dddddd")),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )
    story.append(ref_table)

    story.append(Spacer(1, 10 * mm))
    story.append(
        Paragraph(
            "<b>Support & Disclaimer</b> — Court Mastery is an independent training tool. It is not affiliated with, "
            "endorsed by or sponsored by Basketball Australia, the NBL, WNBL, NBL1, Aussie Hoops, the Australian Boomers, "
            "the Australian Opals or FIBA. All names and marks referenced belong to their respective owners and are used "
            "here descriptively to help coaches contextualise the drills. Video tutorials linked out to YouTube are hosted "
            "by their original creators; Court Mastery claims no ownership over that content.",
            styles["footer"],
        )
    )

    doc.build(story)
    print(f"Wrote {OUT} ({OUT.stat().st_size:,} bytes)")


if __name__ == "__main__":
    build()
