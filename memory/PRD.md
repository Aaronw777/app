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

## Prioritised Backlog
- P1: Program Cover Video (motion "hype reel" banner)
- P1: Player Bio Cards (tap-through profile: number, position, stats)
- P1: Attendance Register + Assistant Coach team login
- P1: Streamed video player (chunked; avoid 500MB RAM spike on download — see iter 5 code review)
- P2: Post-Session Gallery / end-of-program highlight reel
- P2: Custom Drill Community Library
- P2: PWA Push Notifications + Offline Program Cache
- P2: Shareable public link to a program (view-only)

## Known Tech Debt (from iter 5 review, non-blocking)
- `server.py` upload_media loads full file into RAM before size check — migrate to streaming with early abort
- `storage._get` buffers full object for download — swap to StreamingResponse for 500MB videos
- Auth token extraction duplicated in `download_media` — extract shared dependency
- `MIME_TYPES` contains dead `svg` mapping (not in ALLOWED_IMAGE)
