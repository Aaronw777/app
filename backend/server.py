from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

import os
import uuid
import logging
import secrets
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Literal

import bcrypt
import jwt
from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Response, UploadFile, File, Form, Query, Header
from fastapi.responses import StreamingResponse
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr, Field, ConfigDict

from drills_data import build_program, DRILLS
import storage as storage_mod

# --- config ---
MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]
JWT_SECRET = os.environ["JWT_SECRET"]
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_MINUTES = 60 * 24  # 1 day — training app, keep users logged in
CORS_ORIGINS = [o.strip() for o in os.environ.get("CORS_ORIGINS", "").split(",") if o.strip()]

# --- db ---
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# --- app ---
app = FastAPI(title="Court Mastery API")
api_router = APIRouter(prefix="/api")


# ============ Auth helpers ============
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_MINUTES),
        "type": "access",
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def set_auth_cookie(response: Response, token: str):
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=ACCESS_TOKEN_MINUTES * 60,
        path="/",
    )


async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


# ============ Models ============
class RegisterInput(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)
    name: str = Field(min_length=1, max_length=80)


class LoginInput(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    email: EmailStr
    name: str
    created_at: str


class ProgramCreate(BaseModel):
    player_name: str = Field(min_length=1, max_length=80)
    gender: Literal["mens", "womens"]
    starting_age: int = Field(ge=4, le=60)
    skill_level: Literal["mini_ballers", "fundamental", "developing", "intermediate", "advanced", "expert", "professional"]


class SessionUpdate(BaseModel):
    completed: Optional[bool] = None
    notes: Optional[str] = None
    drills: Optional[List[dict]] = None
    theme: Optional[str] = None
    photos: Optional[List[str]] = None


class TeamCreate(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    program_id: str


class PlayerAdd(BaseModel):
    name: str = Field(min_length=1, max_length=80)


class RosterSessionUpdate(BaseModel):
    completed: Optional[bool] = None
    notes: Optional[str] = None


class PlayerBioUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=80)
    number: Optional[str] = Field(default=None, max_length=6)
    position: Optional[str] = Field(default=None, max_length=32)
    stats: Optional[dict] = None  # {games_played, points_3s, points_2s, points_1s, total_fouls}


class TeamJoinInput(BaseModel):
    code: str = Field(min_length=4, max_length=12)


class IndividualProgramUpdate(BaseModel):
    drills: List[dict]


def _clean_drills(raw: List[dict], *, max_drills: int = 10) -> tuple[List[dict], int]:
    """Sanitise a list of drills for either a session or an individual plan.
    Returns (cleaned_drills, total_minutes)."""
    cleaned: List[dict] = []
    for d in raw[:max_drills]:
        if not isinstance(d, dict):
            continue
        try:
            duration = int(d.get("duration", 0))
        except (TypeError, ValueError):
            duration = 0
        # captured media ids from the player/coach during the session
        cap_raw = d.get("player_media_ids") or []
        captures = [str(x) for x in cap_raw if x][:24] if isinstance(cap_raw, list) else []
        cleaned.append({
            "id": str(d.get("id") or f"custom-{uuid.uuid4()}"),
            "name": str(d.get("name", "Untitled drill"))[:120],
            "category": str(d.get("category", "Custom"))[:60],
            "level": int(d.get("level", 1) or 1),
            "duration": max(1, min(duration, 60)),
            "description": str(d.get("description", ""))[:600],
            "video": str(d.get("video", ""))[:200],
            "coach_notes": str(d.get("coach_notes", ""))[:600],
            "custom": bool(d.get("custom", False)) or str(d.get("id", "")).startswith("custom-"),
            "media_id": str(d.get("media_id") or "") or None,
            "player_media_ids": captures,
        })
    return cleaned, sum(x["duration"] for x in cleaned)


_STAT_KEYS = ("games_played", "points_3s", "points_2s", "points_1s", "total_fouls")


def _default_stats() -> dict:
    return {k: 0 for k in _STAT_KEYS}


def _clean_stats(raw) -> dict:
    if not isinstance(raw, dict):
        return _default_stats()
    out = _default_stats()
    for k in _STAT_KEYS:
        try:
            v = int(raw.get(k, 0) or 0)
        except (TypeError, ValueError):
            v = 0
        out[k] = max(0, min(v, 99999))
    return out


def _gen_invite_code() -> str:
    # 6-digit numeric, zero-padded
    return f"{secrets.randbelow(1_000_000):06d}"


async def _ensure_team_invite_code(team: dict) -> str:
    """Return an existing invite_code or lazily generate one (retries on collision)."""
    if team.get("invite_code"):
        return team["invite_code"]
    for _ in range(10):
        code = _gen_invite_code()
        clash = await db.teams.find_one({"invite_code": code}, {"_id": 0, "id": 1})
        if not clash:
            await db.teams.update_one({"id": team["id"]}, {"$set": {"invite_code": code}})
            team["invite_code"] = code
            return code
    raise HTTPException(status_code=500, detail="Could not allocate invite code")


async def _team_for_user(team_id: str, user_id: str, *, require_owner: bool = False) -> dict:
    """Fetch team where user is owner OR (unless require_owner) in assistant_ids."""
    q = {"id": team_id, "user_id": user_id} if require_owner else {
        "id": team_id,
        "$or": [{"user_id": user_id}, {"assistant_ids": user_id}],
    }
    team = await db.teams.find_one(q, {"_id": 0})
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    return team


# ============ Auth routes ============
@api_router.post("/auth/register")
async def register(payload: RegisterInput, response: Response):
    email = payload.email.lower().strip()
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user_id = str(uuid.uuid4())
    doc = {
        "id": user_id,
        "email": email,
        "name": payload.name.strip(),
        "password_hash": hash_password(payload.password),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.users.insert_one(doc)

    token = create_access_token(user_id, email)
    set_auth_cookie(response, token)
    return {"id": user_id, "email": email, "name": doc["name"], "created_at": doc["created_at"], "token": token}


@api_router.post("/auth/login")
async def login(payload: LoginInput, response: Response):
    email = payload.email.lower().strip()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token(user["id"], email)
    set_auth_cookie(response, token)
    return {
        "id": user["id"],
        "email": user["email"],
        "name": user["name"],
        "created_at": user["created_at"],
        "token": token,
    }


@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    return {"ok": True}


@api_router.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return user


# ============ Drill Library ============
@api_router.get("/drills")
async def list_drills():
    return DRILLS


# ============ Programs ============
@api_router.post("/programs")
async def create_program(payload: ProgramCreate, user: dict = Depends(get_current_user)):
    sessions = build_program(payload.gender, payload.starting_age, payload.skill_level)
    program_id = str(uuid.uuid4())
    doc = {
        "id": program_id,
        "user_id": user["id"],
        "player_name": payload.player_name.strip(),
        "gender": payload.gender,
        "starting_age": payload.starting_age,
        "skill_level": payload.skill_level,
        "sessions": sessions,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.programs.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api_router.get("/programs")
async def list_programs(user: dict = Depends(get_current_user)):
    programs = await db.programs.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(100)
    # Add progress summary
    for p in programs:
        completed = sum(1 for s in p.get("sessions", []) if s.get("completed"))
        p["completed_count"] = completed
        p["total_count"] = len(p.get("sessions", []))
    return programs


@api_router.get("/programs/{program_id}")
async def get_program(program_id: str, user: dict = Depends(get_current_user)):
    program = await db.programs.find_one({"id": program_id, "user_id": user["id"]}, {"_id": 0})
    if not program:
        raise HTTPException(status_code=404, detail="Program not found")
    return program


@api_router.patch("/programs/{program_id}/sessions/{week}")
async def update_session(
    program_id: str,
    week: int,
    payload: SessionUpdate,
    user: dict = Depends(get_current_user),
):
    program = await db.programs.find_one({"id": program_id, "user_id": user["id"]})
    if not program:
        raise HTTPException(status_code=404, detail="Program not found")

    updated = False
    for s in program["sessions"]:
        if s["week"] == week:
            if payload.completed is not None:
                s["completed"] = payload.completed
            if payload.notes is not None:
                s["notes"] = payload.notes
            if payload.theme is not None:
                s["theme"] = payload.theme.strip()[:120] or s["theme"]
            if payload.photos is not None:
                # Keep it a simple list of media_id strings; cap at 12
                s["photos"] = [str(p) for p in payload.photos if p][:12]
            if payload.drills is not None:
                # Sanitise: keep only fields we recognise; ensure duration is int
                cleaned = []
                for d in payload.drills:
                    if not isinstance(d, dict):
                        continue
                    try:
                        duration = int(d.get("duration", 0))
                    except (TypeError, ValueError):
                        duration = 0
                    cleaned.append({
                        "id": str(d.get("id") or f"custom-{uuid.uuid4()}"),
                        "name": str(d.get("name", "Untitled drill"))[:120],
                        "category": str(d.get("category", "Custom"))[:60],
                        "level": int(d.get("level", 1) or 1),
                        "duration": max(1, min(duration, 60)),
                        "description": str(d.get("description", ""))[:600],
                        "video": str(d.get("video", ""))[:200],
                        "coach_notes": str(d.get("coach_notes", ""))[:600],
                        "custom": bool(d.get("custom", False)) or str(d.get("id", "")).startswith("custom-"),
                        "media_id": str(d.get("media_id") or "") or None,
                    })
                s["drills"] = cleaned
                s["total_minutes"] = sum(d["duration"] for d in cleaned)
            updated = True
            break
    if not updated:
        raise HTTPException(status_code=404, detail="Session not found")

    await db.programs.update_one(
        {"id": program_id, "user_id": user["id"]},
        {"$set": {"sessions": program["sessions"]}},
    )
    program.pop("_id", None)
    return program


@api_router.delete("/programs/{program_id}")
async def delete_program(program_id: str, user: dict = Depends(get_current_user)):
    result = await db.programs.delete_one({"id": program_id, "user_id": user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Program not found")
    # Also delete any teams referencing this program
    await db.teams.delete_many({"user_id": user["id"], "program_id": program_id})
    return {"ok": True}


# ============ Teams ============
@api_router.post("/teams")
async def create_team(payload: TeamCreate, user: dict = Depends(get_current_user)):
    program = await db.programs.find_one({"id": payload.program_id, "user_id": user["id"]})
    if not program:
        raise HTTPException(status_code=404, detail="Program not found")
    team_id = str(uuid.uuid4())
    # Allocate a unique invite code (best-effort, retry on collision).
    invite_code = _gen_invite_code()
    for _ in range(10):
        if not await db.teams.find_one({"invite_code": invite_code}, {"_id": 0, "id": 1}):
            break
        invite_code = _gen_invite_code()
    doc = {
        "id": team_id,
        "user_id": user["id"],
        "name": payload.name.strip(),
        "program_id": payload.program_id,
        "roster": [],
        "invite_code": invite_code,
        "assistant_ids": [],
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.teams.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api_router.get("/teams")
async def list_teams(user: dict = Depends(get_current_user)):
    teams = await db.teams.find(
        {"$or": [{"user_id": user["id"]}, {"assistant_ids": user["id"]}]},
        {"_id": 0},
    ).sort("created_at", -1).to_list(100)
    # Attach program name for display — programs are owned by the head coach, so
    # look up by the team's user_id rather than the current user.
    program_ids = list({t["program_id"] for t in teams})
    owner_ids = list({t["user_id"] for t in teams})
    programs = await db.programs.find(
        {"id": {"$in": program_ids}, "user_id": {"$in": owner_ids}},
        {"_id": 0, "id": 1, "user_id": 1, "player_name": 1, "skill_level": 1, "sessions": 1},
    ).to_list(200)
    program_lookup = {(p["user_id"], p["id"]): p for p in programs}
    for t in teams:
        p = program_lookup.get((t["user_id"], t["program_id"]))
        t["program_name"] = p["player_name"] if p else "Deleted program"
        t["program_skill_level"] = p["skill_level"] if p else None
        t["total_weeks"] = len(p["sessions"]) if p else 10
        t["roster_count"] = len(t.get("roster", []))
        t["role"] = "owner" if t["user_id"] == user["id"] else "assistant"
    return teams


@api_router.get("/teams/{team_id}")
async def get_team(team_id: str, user: dict = Depends(get_current_user)):
    team = await _team_for_user(team_id, user["id"])
    is_owner = team["user_id"] == user["id"]
    # Programs are owned by the head coach.
    program = await db.programs.find_one({"id": team["program_id"], "user_id": team["user_id"]}, {"_id": 0})
    if program:
        program["sessions_summary"] = [
            {"week": s["week"], "theme": s["theme"], "total_minutes": s["total_minutes"], "target_level": s["target_level"]}
            for s in program.get("sessions", [])
        ]
    team["program"] = program
    team["role"] = "owner" if is_owner else "assistant"
    # Ensure invite_code exists (backfill for older teams).
    if is_owner:
        await _ensure_team_invite_code(team)
    else:
        # Hide invite code from assistants
        team.pop("invite_code", None)
    # Attach assistant emails (head coach only) for management UI.
    if is_owner and team.get("assistant_ids"):
        users = await db.users.find(
            {"id": {"$in": team["assistant_ids"]}},
            {"_id": 0, "id": 1, "email": 1, "name": 1},
        ).to_list(50)
        team["assistants"] = users
    else:
        team["assistants"] = []
    return team


@api_router.delete("/teams/{team_id}")
async def delete_team(team_id: str, user: dict = Depends(get_current_user)):
    result = await db.teams.delete_one({"id": team_id, "user_id": user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Team not found")
    return {"ok": True}


# --- Assistant coach invitation ---
@api_router.post("/teams/{team_id}/invite-code/rotate")
async def rotate_invite_code(team_id: str, user: dict = Depends(get_current_user)):
    team = await _team_for_user(team_id, user["id"], require_owner=True)
    code = _gen_invite_code()
    for _ in range(10):
        if not await db.teams.find_one({"invite_code": code}, {"_id": 0, "id": 1}):
            break
        code = _gen_invite_code()
    await db.teams.update_one({"id": team["id"]}, {"$set": {"invite_code": code}})
    return {"invite_code": code}


@api_router.post("/teams/join")
async def join_team(payload: TeamJoinInput, user: dict = Depends(get_current_user)):
    code = payload.code.strip()
    team = await db.teams.find_one({"invite_code": code}, {"_id": 0})
    if not team:
        raise HTTPException(status_code=404, detail="Invalid invite code")
    if team["user_id"] == user["id"]:
        raise HTTPException(status_code=400, detail="You are the head coach of this team")
    if user["id"] in team.get("assistant_ids", []):
        return {"team_id": team["id"], "already_member": True}
    await db.teams.update_one(
        {"id": team["id"]},
        {"$addToSet": {"assistant_ids": user["id"]}},
    )
    return {"team_id": team["id"], "already_member": False}


@api_router.delete("/teams/{team_id}/assistants/{assistant_id}")
async def remove_assistant(team_id: str, assistant_id: str, user: dict = Depends(get_current_user)):
    team = await _team_for_user(team_id, user["id"], require_owner=True)
    if assistant_id not in team.get("assistant_ids", []):
        raise HTTPException(status_code=404, detail="Assistant not found")
    await db.teams.update_one(
        {"id": team["id"]},
        {"$pull": {"assistant_ids": assistant_id}},
    )
    return {"ok": True}


@api_router.post("/teams/{team_id}/leave")
async def leave_team(team_id: str, user: dict = Depends(get_current_user)):
    team = await db.teams.find_one({"id": team_id}, {"_id": 0})
    if not team or user["id"] not in team.get("assistant_ids", []):
        raise HTTPException(status_code=404, detail="Team not found")
    await db.teams.update_one({"id": team_id}, {"$pull": {"assistant_ids": user["id"]}})
    return {"ok": True}


@api_router.post("/teams/{team_id}/players")
async def add_player(team_id: str, payload: PlayerAdd, user: dict = Depends(get_current_user)):
    team = await _team_for_user(team_id, user["id"], require_owner=True)
    player = {
        "player_id": str(uuid.uuid4()),
        "player_name": payload.name.strip(),
        "number": "",
        "position": "",
        "stats": _default_stats(),
        "attendance": [],
        "added_at": datetime.now(timezone.utc).isoformat(),
        "sessions": {},
    }
    await db.teams.update_one(
        {"id": team_id, "user_id": user["id"]},
        {"$push": {"roster": player}},
    )
    return player


@api_router.delete("/teams/{team_id}/players/{player_id}")
async def remove_player(team_id: str, player_id: str, user: dict = Depends(get_current_user)):
    result = await db.teams.update_one(
        {"id": team_id, "user_id": user["id"]},
        {"$pull": {"roster": {"player_id": player_id}}},
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Player not found")
    return {"ok": True}


@api_router.patch("/teams/{team_id}/players/{player_id}")
async def update_player_bio(
    team_id: str,
    player_id: str,
    payload: PlayerBioUpdate,
    user: dict = Depends(get_current_user),
):
    # Bio & season stats are head-coach only. Assistants can only mark
    # attendance and update photos.
    team = await _team_for_user(team_id, user["id"], require_owner=True)
    roster = team.get("roster", [])
    updated = False
    for p in roster:
        if p["player_id"] == player_id:
            if payload.name is not None:
                p["player_name"] = payload.name.strip()[:80] or p.get("player_name", "")
            if payload.number is not None:
                p["number"] = payload.number.strip()[:6]
            if payload.position is not None:
                p["position"] = payload.position.strip()[:32]
            if payload.stats is not None:
                p["stats"] = _clean_stats(payload.stats)
            # Keep older docs valid.
            p.setdefault("attendance", [])
            p.setdefault("stats", _default_stats())
            updated = True
            break
    if not updated:
        raise HTTPException(status_code=404, detail="Player not found")
    await db.teams.update_one(
        {"id": team_id},
        {"$set": {"roster": roster}},
    )
    return {"ok": True}


@api_router.patch("/teams/{team_id}/players/{player_id}/program")
async def update_individual_program(
    team_id: str,
    player_id: str,
    payload: IndividualProgramUpdate,
    user: dict = Depends(get_current_user),
):
    """Head-coach OR assistant can build/update a player's individual daily
    1-hour plan (up to 10 drills). Both roles need edit access because
    assistants often build ad-hoc plans on the sideline."""
    team = await _team_for_user(team_id, user["id"])
    roster = team.get("roster", [])
    drills, total_minutes = _clean_drills(payload.drills, max_drills=10)

    updated = False
    for p in roster:
        if p["player_id"] == player_id:
            p["individual_program"] = {
                "drills": drills,
                "total_minutes": total_minutes,
                "updated_at": datetime.now(timezone.utc).isoformat(),
                "updated_by": user["id"],
            }
            updated = True
            break
    if not updated:
        raise HTTPException(status_code=404, detail="Player not found")

    await db.teams.update_one({"id": team_id}, {"$set": {"roster": roster}})
    return {"ok": True, "total_minutes": total_minutes, "drill_count": len(drills)}


@api_router.patch("/teams/{team_id}/players/{player_id}/sessions/{week}")
async def update_roster_session(
    team_id: str,
    player_id: str,
    week: int,
    payload: RosterSessionUpdate,
    user: dict = Depends(get_current_user),
):
    team = await _team_for_user(team_id, user["id"])
    roster = team.get("roster", [])
    updated = False
    for p in roster:
        if p["player_id"] == player_id:
            sess = p.setdefault("sessions", {})
            entry = sess.get(str(week), {"completed": False, "notes": ""})
            was_completed = bool(entry.get("completed"))
            if payload.completed is not None:
                entry["completed"] = payload.completed
            if payload.notes is not None:
                entry["notes"] = payload.notes
            sess[str(week)] = entry

            # Auto-log attendance when transitioning to completed=true.
            attendance = p.setdefault("attendance", [])
            if payload.completed is True and not was_completed:
                # Only append once per week
                if not any(a.get("week") == week for a in attendance):
                    attendance.append({
                        "week": week,
                        "date": datetime.now(timezone.utc).isoformat(),
                        "marked_by": user["id"],
                        "marked_by_name": user.get("name", ""),
                    })
            elif payload.completed is False and was_completed:
                # Remove attendance entry for that week if user un-ticked
                p["attendance"] = [a for a in attendance if a.get("week") != week]
            updated = True
            break
    if not updated:
        raise HTTPException(status_code=404, detail="Player not found")
    await db.teams.update_one(
        {"id": team_id},
        {"$set": {"roster": roster}},
    )
    return {"ok": True}


# ============ Media / File Storage ============
_ALLOWED_KINDS = {"team-logo", "player-photo", "drill-media", "session-photo", "program-cover", "player-capture", "misc"}


@api_router.post("/media/upload")
async def upload_media(
    file: UploadFile = File(...),
    kind: str = Form("misc"),
    user: dict = Depends(get_current_user),
):
    if kind not in _ALLOWED_KINDS:
        raise HTTPException(status_code=400, detail=f"Invalid kind. Allowed: {sorted(_ALLOWED_KINDS)}")

    content_type = (file.content_type or "application/octet-stream").lower()
    ext = ""
    if file.filename and "." in file.filename:
        ext = file.filename.rsplit(".", 1)[-1].lower()

    data = await file.read()
    try:
        result = storage_mod.upload_bytes(user["id"], kind, data, content_type, ext)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.exception("Storage upload failed")
        raise HTTPException(status_code=502, detail=f"Storage upload failed: {e}")

    media_id = str(uuid.uuid4())
    doc = {
        "id": media_id,
        "user_id": user["id"],
        "kind": kind,
        "storage_path": result["path"],
        "original_filename": file.filename,
        "content_type": result["content_type"],
        "size": result["size"],
        "is_deleted": False,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.media.insert_one(doc)
    doc.pop("_id", None)
    doc["url"] = f"/api/media/{media_id}"
    return doc


@api_router.get("/media/{media_id}")
async def download_media(
    media_id: str,
    request: Request,
    auth: Optional[str] = Query(None),
):
    # Support auth via cookie, Authorization header, or ?auth=<token> (for <img src> / <video src>).
    token = request.cookies.get("access_token")
    if not token:
        header = request.headers.get("Authorization", "")
        if header.startswith("Bearer "):
            token = header[7:]
    if not token and auth:
        token = auth
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

    record = await db.media.find_one({"id": media_id, "is_deleted": False}, {"_id": 0})
    if not record:
        raise HTTPException(status_code=404, detail="Media not found")
    # Owner-only access
    if record["user_id"] != payload.get("sub"):
        raise HTTPException(status_code=403, detail="Forbidden")

    content_type = record.get("content_type") or "application/octet-stream"
    total_size = int(record.get("size") or 0)
    range_header = request.headers.get("range") or request.headers.get("Range")
    is_video = content_type.startswith("video/")

    # Open a streaming connection to object storage (65KB chunks, no RAM spike).
    try:
        upstream = storage_mod.open_stream(record["storage_path"])
    except Exception as e:
        logger.exception("Storage download failed")
        raise HTTPException(status_code=502, detail=f"Storage download failed: {e}")

    # Parse Range: bytes=start-end (video seek). Skip if not a video or malformed.
    start, end = 0, total_size - 1 if total_size else None
    partial = False
    if range_header and is_video and total_size:
        try:
            units, _, rng = range_header.partition("=")
            if units.strip().lower() == "bytes":
                s, _, e = rng.partition("-")
                start = int(s) if s.strip() else 0
                end = int(e) if e.strip() else total_size - 1
                if start < 0 or end >= total_size or start > end:
                    start, end = 0, total_size - 1
                else:
                    partial = True
        except (ValueError, AttributeError):
            partial = False

    def _iter_full():
        try:
            for chunk in upstream.iter_content(chunk_size=65536):
                if chunk:
                    yield chunk
        finally:
            upstream.close()

    def _iter_range(begin: int, finish: int):
        remaining_skip = begin
        remaining_yield = finish - begin + 1
        try:
            for chunk in upstream.iter_content(chunk_size=65536):
                if not chunk:
                    continue
                if remaining_skip:
                    if len(chunk) <= remaining_skip:
                        remaining_skip -= len(chunk)
                        continue
                    chunk = chunk[remaining_skip:]
                    remaining_skip = 0
                if len(chunk) >= remaining_yield:
                    yield chunk[:remaining_yield]
                    return
                yield chunk
                remaining_yield -= len(chunk)
        finally:
            upstream.close()

    headers = {
        "Accept-Ranges": "bytes" if is_video else "none",
        "Cache-Control": "private, max-age=3600",
    }
    if partial:
        headers["Content-Range"] = f"bytes {start}-{end}/{total_size}"
        headers["Content-Length"] = str(end - start + 1)
        return StreamingResponse(
            _iter_range(start, end),
            status_code=206,
            media_type=content_type,
            headers=headers,
        )

    if total_size:
        headers["Content-Length"] = str(total_size)
    return StreamingResponse(
        _iter_full(),
        status_code=200,
        media_type=content_type,
        headers=headers,
    )


@api_router.delete("/media/{media_id}")
async def delete_media(media_id: str, user: dict = Depends(get_current_user)):
    result = await db.media.update_one(
        {"id": media_id, "user_id": user["id"], "is_deleted": False},
        {"$set": {"is_deleted": True}},
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Media not found")
    return {"ok": True}


# ============ Attach media references to Teams / Programs ============
class TeamLogoUpdate(BaseModel):
    logo_media_id: Optional[str] = None


class PlayerPhotoUpdate(BaseModel):
    photo_media_id: Optional[str] = None


class ProgramCoverUpdate(BaseModel):
    cover_media_id: Optional[str] = None


@api_router.patch("/teams/{team_id}/logo")
async def set_team_logo(team_id: str, payload: TeamLogoUpdate, user: dict = Depends(get_current_user)):
    result = await db.teams.update_one(
        {"id": team_id, "user_id": user["id"]},
        {"$set": {"logo_media_id": payload.logo_media_id}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Team not found")
    return {"ok": True}


@api_router.patch("/teams/{team_id}/players/{player_id}/photo")
async def set_player_photo(
    team_id: str,
    player_id: str,
    payload: PlayerPhotoUpdate,
    user: dict = Depends(get_current_user),
):
    team = await _team_for_user(team_id, user["id"])
    updated = False
    for p in team.get("roster", []):
        if p["player_id"] == player_id:
            p["photo_media_id"] = payload.photo_media_id
            updated = True
            break
    if not updated:
        raise HTTPException(status_code=404, detail="Player not found")
    await db.teams.update_one(
        {"id": team_id},
        {"$set": {"roster": team["roster"]}},
    )
    return {"ok": True}


@api_router.patch("/programs/{program_id}/cover")
async def set_program_cover(program_id: str, payload: ProgramCoverUpdate, user: dict = Depends(get_current_user)):
    result = await db.programs.update_one(
        {"id": program_id, "user_id": user["id"]},
        {"$set": {"cover_media_id": payload.cover_media_id}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Program not found")
    return {"ok": True}


# ============ Health ============
@api_router.get("/")
async def root():
    return {"message": "Court Mastery API is live"}


# ============ Startup ============
@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.programs.create_index("user_id")
    await db.teams.create_index("user_id")
    await db.teams.create_index("assistant_ids")
    await db.teams.create_index("invite_code", unique=True, sparse=True)
    await db.media.create_index("user_id")

    # Warm up storage session (non-fatal on failure)
    try:
        storage_mod.init_storage()
        logger.info("Emergent object storage initialised")
    except Exception as e:
        logger.warning(f"Storage init failed (uploads will retry on-demand): {e}")

    # Seed admin
    admin_email = os.environ.get("ADMIN_EMAIL", "").lower().strip()
    admin_password = os.environ.get("ADMIN_PASSWORD", "")
    if admin_email and admin_password:
        existing = await db.users.find_one({"email": admin_email})
        if not existing:
            await db.users.insert_one({
                "id": str(uuid.uuid4()),
                "email": admin_email,
                "name": "Head Coach",
                "password_hash": hash_password(admin_password),
                "created_at": datetime.now(timezone.utc).isoformat(),
            })
        elif not verify_password(admin_password, existing["password_hash"]):
            await db.users.update_one(
                {"email": admin_email},
                {"$set": {"password_hash": hash_password(admin_password)}},
            )


@app.on_event("shutdown")
async def shutdown():
    client.close()


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS if CORS_ORIGINS else ["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)
