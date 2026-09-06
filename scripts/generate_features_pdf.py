"""
Generates the shareable Court Mastery feature-list PDF into:
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
)

OUT = Path("/app/frontend/public/court-mastery-features.pdf")
OUT.parent.mkdir(parents=True, exist_ok=True)

GOLD = HexColor("#FFCD00")
INK = HexColor("#0d0d0d")
MID = HexColor("#3a3a3a")
LIGHT = HexColor("#7a7a7a")
ORANGE = HexColor("#FF7324")
GREEN = HexColor("#00854A")

FEATURES = [
    ("Program Builder", [
        "10-week training blueprint generated from four inputs",
        "Configurable gender: Mens or Womens stream",
        "Configurable starting age: 4 to 35+ (slider with Aussie Hoops / Junior / Senior waypoints)",
        "Six skill tiers: Mini-Ballers, Fundamental, Developing, Intermediate, Advanced, Expert",
        "Programs automatically ladder in difficulty week over week",
        "Session length adapts to skill tier (~42 min for Mini-Ballers, ~55 min for older tiers)",
    ]),
    ("Curated Drill Library (54+ drills)", [
        "8 categories: Warm-Up, Ball Handling, Shooting, Passing, Footwork, Defense, Rebounding, Conditioning, Basketball IQ",
        "Each drill tagged with category, minutes, difficulty (0-5), description, coach notes",
        "14 dedicated Aussie-Hoops-style Level 0 drills for ages 4-7",
        "References FIBA-style rules and Australian junior-to-elite pathway concepts",
    ]),
    ("Session View — Training Day", [
        "Sticky Session Timer at the top of every session",
        "MM:SS countdown, ticks at 1 Hz, auto-advances to next drill with a beep",
        "Play / Pause / Skip Forward / Skip Back / Reset controls",
        "Drill counter (e.g. \"Drill 1 / 6\")",
        "SVG Court Diagram per drill (category-specific overlays: cones, pass lines, defensive slides, sprint lanes, etc.)",
        "YouTube search link under Coach Notes for a demo tutorial",
        "Mark session complete toggle + per-session coach notes",
    ]),
    ("Amend Session — Coach Customisation", [
        "Amend any session's drill list in edit mode",
        "Add drills from the searchable, category- and level-filterable Drill Library",
        "Add fully custom drills (name, category, duration, level, description, coach notes)",
        "Reorder drills up/down; remove any drill",
        "Coach's Own drills tagged visibly on the card",
        "Live minute total updates as you edit; backend recomputes on save",
        "Team-scale changes: because teams share the program, edits propagate to every player",
    ]),
    ("Program View", [
        "Grid of 10 week cards with theme, drill count, minutes, tier",
        "Overall completion progress bar",
        "Completed weeks marked with a gold check badge",
        "Per-week Parent Handout shortcut",
        "Create Team shortcut (start a new team using this program)",
        "Export to PDF button — print-optimised layout with all 10 weeks",
    ]),
    ("Parent Handout — Take-Home Sheet", [
        "Route: /programs/:id/week/:week/handout",
        "One-page black-on-white printable summary for parents/players",
        "Numbered drills with descriptions and coach hints",
        "3-star \"Rate it\" boxes per drill",
        "\"This week I felt...\" emoji reflection row",
        "Mini-Ballers programs get an extra \"Grown-up tips\" panel",
        "YouTube example URL listed under each coach hint (survives printing)",
    ]),
    ("Team Roster Board", [
        "/teams — grid of every team (name, program, roster count, week count)",
        "Create a team from any existing program",
        "Add / remove players",
        "Players x Weeks completion grid — click any cell to toggle a check",
        "Live \"Done\" counter per player (e.g. 3 / 10)",
        "Print roster button",
        "Deleting a program cleans up any linked teams",
    ]),
    ("Dashboard", [
        "Card view of every saved program per user",
        "Progress percentage + completed count per program",
        "Quick create / delete",
        "Empty state with a Build Program CTA",
    ]),
    ("Landing Page", [
        "Athletic-magazine hero (Anton display font, Australian gold + green accents)",
        "Program preview snapshot (weeks 1, 4, 8, 10 themes)",
        "4-stat strip: 10 weeks, 60 minutes, 40+ drills, 6 skill tiers",
        "Feature grid: Personalised Plan, Aussie Pathway, Video Illustrations, Track & Print",
        "CTAs to register or sign in",
    ]),
    ("Authentication", [
        "Email + password registration and login",
        "Bcrypt password hashing",
        "JWT access token (24-hour expiry)",
        "HTTP-only secure cookies + Bearer-token fallback (works with third-party cookies blocked)",
        "Auto-seeded admin account on first startup",
        "Protected routes redirect to /login when unauthenticated",
        "Clean logout",
    ]),
    ("Progress Tracking", [
        "Mark any session complete (toggleable)",
        "Save coach notes per session",
        "Progress percentage on Dashboard and Program view",
        "Independent progress per player when using Team Roster",
    ]),
    ("Print / PDF Export", [
        "Every page has a print-optimised layout",
        "window.print() triggers native browser PDF export",
        "Court diagrams render in print",
        "Session and Program-level PDFs available",
        "Parent Handout is its own print-ready page",
        "Team roster prints as a clean checklist grid",
    ]),
    ("Legal / Compliance", [
        "Full site-wide disclaimer",
        "No implication of affiliation with Basketball Australia, NBL, WNBL, NBL1, Aussie Hoops, Boomers, Opals or FIBA",
        "All trademark references used descriptively only",
        "Video links go to YouTube search (not tied to any specific creator)",
        "Hero photo under Unsplash license",
        "Fonts (Anton, DM Sans) under SIL Open Font License",
        "shadcn/ui, lucide-react and other libraries MIT-licensed",
    ]),
    ("Design System", [
        "Dark \"Performance Pro\" aesthetic",
        "Anton (display) + DM Sans (body) typography",
        "Australian gold #FFCD00, NBL green #006400, Action orange #FF7324",
        "Subtle grain texture on every page",
        "Micro-animations: hover translate, staggered entrance, custom scrollbar, gold selection",
        "Sharp-edged tactical cards, uppercase headings, monospace URLs, pill-tag metadata",
    ]),
    ("Quality & Testing", [
        "100% pass on the backend test suite (Auth, Programs, Teams, Amend — 35+ pytest cases)",
        "100% pass on the frontend Playwright E2E suite",
        "Stable data-testid attributes on every interactive element",
    ]),
]

styles = {
    "h1": ParagraphStyle(
        "H1",
        fontName="Helvetica-Bold",
        fontSize=32,
        leading=36,
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
        fontSize=15,
        leading=19,
        textColor=INK,
        spaceBefore=10,
        spaceAfter=6,
    ),
    "bullet": ParagraphStyle(
        "Bullet",
        fontName="Helvetica",
        fontSize=10.2,
        leading=15,
        textColor=INK,
        leftIndent=14,
        bulletIndent=2,
        spaceAfter=1,
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
    # Top gold bar with logo mark
    canvas.setFillColor(GOLD)
    canvas.rect(0, A4[1] - 22 * mm, A4[0], 22 * mm, fill=1, stroke=0)
    canvas.setFillColor(INK)
    canvas.setFont("Helvetica-Bold", 22)
    canvas.drawString(20 * mm, A4[1] - 15 * mm, "COURT MASTERY")
    canvas.setFont("Helvetica", 8)
    canvas.drawRightString(
        A4[0] - 20 * mm, A4[1] - 15 * mm, "10-WEEK BASKETBALL PROGRAM BUILDER"
    )

    # Footer
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


def build():
    doc = BaseDocTemplate(
        str(OUT),
        pagesize=A4,
        leftMargin=20 * mm,
        rightMargin=20 * mm,
        topMargin=32 * mm,
        bottomMargin=24 * mm,
        title="Court Mastery — Feature List",
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

    # Cover block
    story.append(Paragraph("FEATURE LIST · FEBRUARY 2026", styles["kicker"]))
    story.append(Paragraph("Everything inside Court Mastery.", styles["h1"]))
    story.append(
        Paragraph(
            "A 10-week basketball training-program builder for coaches, players and parents "
            "— from Aussie-Hoops-style mini-ballers (age 4+) all the way to NBL / WNBL-level expert prep. "
            "Below is the complete, current feature list.",
            styles["subtitle"],
        )
    )

    # Stat strip
    stats = [
        ["10", "50+", "15", "6", "0"],
        ["Weeks", "Drills", "Feature areas", "Skill tiers", "Ads"],
    ]
    stat_table = Table(stats, colWidths=[doc.width / 5] * 5, rowHeights=[16 * mm, 8 * mm])
    stat_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), INK),
                ("TEXTCOLOR", (0, 0), (-1, 0), GOLD),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, 0), 26),
                ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                ("VALIGN", (0, 0), (-1, 0), "MIDDLE"),
                ("BACKGROUND", (0, 1), (-1, 1), HexColor("#f2f2f2")),
                ("TEXTCOLOR", (0, 1), (-1, 1), MID),
                ("FONTNAME", (0, 1), (-1, 1), "Helvetica-Bold"),
                ("FONTSIZE", (0, 1), (-1, 1), 8),
                ("VALIGN", (0, 1), (-1, 1), "MIDDLE"),
                ("LINEBEFORE", (1, 0), (-1, -1), 1, white),
            ]
        )
    )
    story.append(stat_table)
    story.append(Spacer(1, 12 * mm))

    for section, bullets in FEATURES:
        story.append(Paragraph(section.upper(), styles["h2"]))
        for b in bullets:
            story.append(Paragraph(b, styles["bullet"], bulletText="\u2022"))
        story.append(Spacer(1, 4 * mm))

    story.append(PageBreak())
    story.append(Paragraph("BEHIND THE SCENES", styles["h2"]))
    story.append(
        Paragraph(
            "Court Mastery is built on FastAPI (Python) + MongoDB on the backend and React 19 + Tailwind + shadcn/ui on the frontend. "
            "The full REST API covers Auth, Programs, Teams and the Drill Library. Sessions can be amended per team; "
            "custom drills, reordering and removal are all first-class.",
            styles["subtitle"],
        )
    )

    story.append(Paragraph("API ENDPOINTS", styles["h2"]))
    for line in [
        "Auth: POST /api/auth/register · POST /api/auth/login · POST /api/auth/logout · GET /api/auth/me",
        "Programs: POST /api/programs · GET /api/programs · GET /api/programs/:id · PATCH /api/programs/:id/sessions/:week · DELETE /api/programs/:id",
        "Teams: POST /api/teams · GET /api/teams · GET /api/teams/:id · DELETE /api/teams/:id",
        "Roster: POST /api/teams/:id/players · DELETE /api/teams/:id/players/:pid · PATCH /api/teams/:id/players/:pid/sessions/:week",
        "Reference: GET /api/drills",
    ]:
        story.append(Paragraph(line, styles["bullet"], bulletText="\u25B8"))

    story.append(Spacer(1, 10 * mm))
    story.append(
        Paragraph(
            "<b>Disclaimer</b> — Court Mastery is an independent training tool. It is not affiliated with, "
            "endorsed by or sponsored by Basketball Australia, the NBL, WNBL, NBL1, Aussie Hoops, the Australian Boomers, "
            "the Australian Opals or FIBA. All names and marks referenced belong to their respective owners and are used "
            "here descriptively to help coaches contextualise the drills.",
            styles["footer"],
        )
    )

    doc.build(story)
    print(f"Wrote {OUT} ({OUT.stat().st_size:,} bytes)")


if __name__ == "__main__":
    build()
