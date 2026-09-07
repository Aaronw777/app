# Court Mastery — PRD

## Problem Statement
Create an app that helps create a basketball training program with weekly 1 hour sessions that build skills from a fundamental level to a professional level over a 10 week period. Configurable gender (mens/womens), starting age, and skill level. Tailored to FIBA rules and the Basketball Australia pathway to NBL / local domestic level.

## Personas
- Junior/development coach building weekly training plans for players 10-18
- Ambitious player (or parent) mapping a 10-week ladder toward representative teams
- Local domestic team coach preparing NBL1/state-league candidates

## Core Requirements (static)
- 10-week program, 60-min sessions, progressive skill building
- Toggle Mens / Womens (Boomers vs Opals framing)
- Starting age (6-35) + skill level (fundamental → professional)
- Curated drill library (no AI) tagged by category & level
- Auth (email/password, JWT httpOnly cookies + Bearer fallback)
- Save / list / delete multiple programs per user
- Per-session: mark complete, coach notes, video illustrations
- Printable / PDF-exportable session plan (window.print + print CSS)
- FIBA rules + Basketball Australia references baked into copy

## Architecture
- **Backend** (FastAPI + Motor + MongoDB): `/api/auth/*`, `/api/programs*`, `/api/drills`
- **Frontend** (React 19 + react-router 7 + Tailwind + shadcn): Landing / Auth / Dashboard / Builder / ProgramView / SessionView
- Auth: bcrypt + PyJWT, cookie `access_token` (samesite=none, secure) + Bearer fallback (`localStorage.cm_token`)
- Drill library: static Python module (`drills_data.py`) with 40+ curated drills across 8 categories × 5 levels
- Program engine: `build_program()` builds 10 weeks based on `LEVEL_MAP` progression + `WEEKS_BLUEPRINT` themes

## Implemented (2026-02)
- ✅ Auth (register/login/logout/me)
- ✅ Program CRUD + session progress patch
- ✅ Curated drill library (54+ drills) with YouTube search links (copyright safe)
- ✅ Aussie Hoops "Mini-Baller" tier (age 4+)
- ✅ Landing / Dashboard / Builder / Program overview / Session detail
- ✅ Print-to-PDF via `window.print()` with print CSS + Parent Handouts + Roster PDF
- ✅ Dark "Performance Pro" theme (Anton + DM Sans, Australian gold accents)
- ✅ Session timer / stopwatch component
- ✅ Team roster mode — assign program to multiple athletes, mark completion
- ✅ Amend Session (add/remove/reorder drills, create custom drills)
- ✅ Drill-specific Key Points (coaching cues)
- ✅ PlayHQ dashboard link
- ✅ Progressive Web App (manifest, service worker, icons)
- ✅ File & Media storage (Emergent Object Storage): team logos, player photos, drill media, session photos, program cover
- ✅ Expanded video uploads — MP4, MOV, WebM, AVI, MKV, 3GP, HEIC — up to 500MB (verified iter 5)
- ✅ **[iter 6] Player Bio Cards** — tap-through modal with #, position, live season stats (games, 3s, 2s, 1s, fouls) and attendance log
- ✅ **[iter 6] Attendance Register** — auto-logs training date + coach when a session cell is ticked complete
- ✅ **[iter 6] Assistant Coach Access** — 6-digit invite code per team; join / rotate / revoke / leave flows; role-based access (assistants can mark attendance + upload player photos; bio/stats owner-only)
- ✅ **[iter 6] Program Cover Hype Reel** — cover accepts videos, plays muted-autoplay-loop on the Dashboard
- ✅ **[iter 6] Streamed Video Player** — GET /api/media/{id} uses StreamingResponse with HTTP Range (206 Partial Content) — 500MB clips no longer buffer in RAM
- ✅ **[iter 6] User Guide PDF** — /public/court-mastery-features.pdf regenerated as a full step-by-step manual covering all 16 features
- ✅ **[iter 7] Individual Daily Program (per player)** — One 1-hour tailored plan per player, up to 10 drills from library or custom; same session timer as team programs; native camera capture (Photo/Video) opens phone camera and uploads instantly; coach-attached reference media viewable during each drill; head coach + assistants both edit and capture; User Guide PDF updated to 17 sections

## Prioritised Backlog
- P2: Post-Session Gallery / end-of-program highlight reel
- P2: Custom Drill Community Library
- P2: PWA Push Notifications + Offline Program Cache
- P2: Shareable public link to a program (view-only)
- P2: Weekly streak / consistency badge on the Dashboard

## Known Tech Debt (from iter 5 & 6 review, non-blocking)
- `download_media` reimplements token extraction (cookie/Bearer/?auth=) — extract shared helper (called out iter 4, 5, 6)
- `MIME_TYPES` contains dead `svg` mapping (not in ALLOWED_IMAGE)
- `rotate_invite_code` 10-attempt loop should raise 500 on exhaustion (currently would emit last colliding code)
- `leave_team` returns 404 for non-members — could be 403 for clearer semantics
- HTTP Range parsing doesn't honour suffix ranges like `bytes=-500` (interprets as 0-500)
