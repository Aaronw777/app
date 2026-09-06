# Court Mastery — Complete Feature List

**Version**: MVP + Iteration 2
**Last updated**: February 2026
**Stack**: FastAPI + MongoDB backend · React 19 + Tailwind + shadcn/ui frontend

---

## 1. Program Builder

- 10-week training blueprint generated from four inputs
- Configurable **gender**: Mens or Womens stream
- Configurable **starting age**: 4 to 35+ (slider with Aussie Hoops / Junior / Senior waypoints)
- **Six skill tiers**:
  1. Mini-Ballers (Aussie-Hoops-style, age 4-7)
  2. Fundamental
  3. Developing
  4. Intermediate
  5. Advanced
  6. Expert (NBL / WNBL / national-team-prep level)
- Programs automatically ladder in difficulty week over week
- Session length adapts to skill tier (~42 min for Mini-Ballers, ~55 min for older tiers)

## 2. Curated Drill Library

- **50+ hand-written drills** across 8 skill categories:
  - Warm-Up
  - Ball Handling
  - Shooting
  - Passing
  - Footwork
  - Defense
  - Rebounding
  - Conditioning
  - Basketball IQ
- Each drill carries: name, category, minutes, difficulty level (0-5), description, coach notes
- Level 0 tier = 14 dedicated Aussie-Hoops-style drills (Animal Movements, Bin Ball Toss, Sharks & Minnows, Traffic Lights, Follow the Leader, etc.)
- References FIBA-style rules and Australian junior-to-elite pathway concepts

## 3. Session View (Training Day)

- Sticky **Session Timer** at the top of every session
  - Big MM:SS countdown, ticks at 1 Hz
  - Drill counter (e.g. "Drill 1 / 6")
  - Play / Pause / Skip Forward / Skip Back / Reset controls
  - Auto-advances to next drill with a beep
- **Court Diagram** for every drill
  - SVG half-court with hoop, key, free-throw circle, 3-point arc
  - Category-specific overlays (cones for ball handling, pass lines for passing, defensive slides for defense, sprint lanes for warm-up, etc.)
  - Renders on the printed PDF
- **YouTube search fallback** — every drill links to a YouTube search for community tutorials (no dependency on any single creator)
- Coach notes displayed in a highlighted callout
- **Mark session complete** toggle
- **Per-session coach notes** field (persisted)

## 4. Program View

- Grid of 10 week cards with theme, drill count, minutes, tier
- Overall completion progress bar
- Completed weeks marked with a gold check badge
- Per-week **Parent Handout** shortcut
- **Create Team** shortcut (starts a new team using this program)
- **Export to PDF** button — print-optimised layout with all 10 weeks

## 5. Parent Handout (Take-Home Sheet)

- Route: `/programs/:id/week/:week/handout`
- One-page printable summary for parents/players
- Black-on-white kid-friendly design
- Numbered drills with descriptions and coach hints
- 3-star "Rate it" boxes per drill
- "This week I felt..." emoji reflection row
- Mini-Ballers programs get bonus **Grown-up tips** panel (soft ball, low ring, praise cadence)
- Reachable from every week card and every session page

## 6. Team Roster Board

- `/teams` — grid of all your teams (name, program, roster count, week count)
- Create a team from any existing program
- `/teams/:id` — full roster board
  - Add or remove players
  - **Players × Weeks completion grid** — click any cell to toggle a check
  - Live "Done" counter (e.g. `3 / 10`) per player
  - Print roster button
- Deleting a program also cleans up any linked teams

## 7. Dashboard

- Card view of every saved program per user
- Progress percentage + completed count per program
- Quick create / delete
- Empty state with a "Build Program" CTA

## 8. Landing Page

- Hero with an "athletic magazine" feel — Anton display font, Australian gold + NBL green accents
- Program preview snapshot (weeks 1, 4, 8, 10 themes)
- 4-stat strip (10 weeks, 60 min, 40+ drills, 6 skill tiers)
- 4-feature grid (Personalised Plan, Aussie Pathway, Video Illustrations, Track & Print)
- Prominent CTA to register or sign in

## 9. Authentication

- Email + password registration
- Login with the same credentials
- Bcrypt password hashing
- JWT access token (24-hour expiry)
- HTTP-only secure cookies **and** Bearer-token fallback (works even with third-party cookies blocked)
- Auto-seeded admin account on first startup: `coach@basketballaus.com` / `CoachAdmin2026!`
- All protected routes redirect to `/login` when unauthenticated
- Logout clears session cleanly

## 10. Progress Tracking

- Mark any session complete (toggleable)
- Save coach notes per session
- Progress percentage on Dashboard and Program view
- Independent progress per player when using Team Roster board

## 11. Print / PDF Export

- Every page has a print-optimised layout
- `window.print()` triggers native browser PDF export
- Court diagrams render in print
- Session and Program-level PDFs available
- Parent Handout is its own print-ready page
- Team roster prints as a clean checklist grid

## 12. Legal / Compliance

- Full disclaimer in the site footer
- No implication of affiliation with Basketball Australia, NBL, WNBL, NBL1, Aussie Hoops, Boomers, Opals or FIBA
- All trademark references used descriptively only
- Video links go to YouTube search (not to specific creators)
- No copyrighted imagery — hero photo is under Unsplash license
- Fonts (Anton, DM Sans) under SIL Open Font License
- shadcn/ui, lucid-react and other libraries MIT-licensed

## 13. Design System

- Dark "Performance Pro" aesthetic
- Anton (display) + DM Sans (body) typography
- Australian gold `#FFCD00`, NBL green `#006400`, Action orange `#FF7324`
- Subtle grain texture on every page
- Micro-animations: hover translate, staggered card entrance, custom scrollbar, gold selection
- Sharp-edged tactical cards, uppercase headings, monospace URLs, pill-tag metadata

## 14. Data Model (behind the scenes)

- **User**: id, email, name, password_hash, created_at
- **Program**: id, user_id, player_name, gender, starting_age, skill_level, sessions[], created_at
- **Session** (embedded): week, theme, target_level, total_minutes, drills[], completed, notes, coach_reference
- **Team**: id, user_id, name, program_id, roster[], created_at
- **Roster player** (embedded): player_id, player_name, added_at, sessions{weekNum: {completed, notes}}

## 15. API Endpoints

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET  /api/auth/me`

### Programs
- `POST   /api/programs`
- `GET    /api/programs`
- `GET    /api/programs/:id`
- `PATCH  /api/programs/:id/sessions/:week`
- `DELETE /api/programs/:id`

### Teams
- `POST   /api/teams`
- `GET    /api/teams`
- `GET    /api/teams/:id`
- `DELETE /api/teams/:id`
- `POST   /api/teams/:id/players`
- `DELETE /api/teams/:id/players/:player_id`
- `PATCH  /api/teams/:id/players/:player_id/sessions/:week`

### Reference
- `GET /api/drills` — the full drill library

## 16. Quality & Testing

- 100% pass on the backend test suite (15 pytest cases covering Team CRUD, roster ops, cross-user isolation, auth guards)
- 100% pass on the frontend Playwright suite (register/login flow, program CRUD, session tracking, timer countdown, diagram rendering, Team roster grid, Parent Handout render)
- Every interactive element has a stable `data-testid` for automated QA

---

**Court Mastery** — an independent basketball training tool.
Not affiliated with Basketball Australia, the NBL, WNBL, NBL1, Aussie Hoops, or FIBA.
