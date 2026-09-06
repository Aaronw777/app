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
from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Response
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr, Field, ConfigDict

from drills_data import build_program, DRILLS

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
    starting_age: int = Field(ge=6, le=60)
    skill_level: Literal["fundamental", "developing", "intermediate", "advanced", "professional"]


class SessionUpdate(BaseModel):
    completed: Optional[bool] = None
    notes: Optional[str] = None


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
