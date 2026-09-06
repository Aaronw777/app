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
- ✅ Curated drill library w/ YouTube video links
- ✅ Landing / Dashboard / Builder / Program overview / Session detail
- ✅ Print-to-PDF via `window.print()` with print CSS
- ✅ Dark "Performance Pro" theme (Anton + DM Sans, Australian gold accents)

## Prioritised Backlog
- P1: Drill diagrams / court-schematic SVGs on top of YouTube embeds
- P1: Session timer / stopwatch for coaches
- P2: Team mode — assign one program to multiple athletes
- P2: Video upload for player self-review
- P2: Shareable public link to a program (view-only)
