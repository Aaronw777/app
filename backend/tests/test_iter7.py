"""Iteration 7 backend tests:
- PATCH /api/teams/{tid}/players/{pid}/program (individual daily 1h plan)
    * 3-drill happy path stores drills/total_minutes/updated_at/updated_by
    * max_drills=10 cap
    * empty resets to drill_count=0
    * duration clamped 1..60
    * description truncated to 600 chars
    * player_media_ids preserved and capped at 24
    * assistant coach allowed
    * stranger -> 404
    * GET /api/teams/{id} returns individual_program embedded
- Media: POST /api/media/upload with kind=player-capture (PNG + MP4)
    * invalid kind -> 400
    * owner-only download (403 for other user)
- Regression: PATCH bio owner-only, PATCH sessions auto-attendance, GET /programs
"""
import os
import io
import uuid
import struct
import pytest
import requests
from pathlib import Path

_env_url = os.environ.get("REACT_APP_BACKEND_URL")
if not _env_url:
    for line in Path("/app/frontend/.env").read_text().splitlines():
        if line.startswith("REACT_APP_BACKEND_URL="):
            _env_url = line.split("=", 1)[1].strip()
            break
BASE_URL = _env_url.rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "coach@basketballaus.com"
ADMIN_PASSWORD = "CoachAdmin2026!"


def _auth(token):
    return {"Authorization": f"Bearer {token}"}


def _register(email, password="testpass1", name="Tester"):
    r = requests.post(f"{API}/auth/register", json={"email": email, "password": password, "name": name})
    if r.status_code == 400:
        r = requests.post(f"{API}/auth/login", json={"email": email, "password": password})
    assert r.status_code == 200, r.text
    return r.json()


# ---------- Fixtures ----------
@pytest.fixture(scope="module")
def owner():
    r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, r.text
    return r.json()


@pytest.fixture(scope="module")
def assistant():
    email = f"TEST_iter7_asst_{uuid.uuid4().hex[:8]}@test.com"
    u = _register(email, name="Iter7 Assist")
    u["email"] = email
    return u


@pytest.fixture(scope="module")
def stranger():
    email = f"TEST_iter7_str_{uuid.uuid4().hex[:8]}@test.com"
    u = _register(email, name="Iter7 Stranger")
    u["email"] = email
    return u


@pytest.fixture(scope="module")
def program(owner):
    r = requests.post(
        f"{API}/programs", headers=_auth(owner["token"]),
        json={"player_name": "TEST_iter7_prog", "gender": "mens", "starting_age": 14, "skill_level": "developing"},
    )
    assert r.status_code == 200, r.text
    return r.json()


@pytest.fixture(scope="module")
def team_and_player(owner, program, assistant):
    r = requests.post(
        f"{API}/teams", headers=_auth(owner["token"]),
        json={"name": "TEST_iter7_Team", "program_id": program["id"]},
    )
    assert r.status_code == 200, r.text
    t = r.json()

    # Add a player
    rp = requests.post(f"{API}/teams/{t['id']}/players",
                       headers=_auth(owner["token"]),
                       json={"name": "TEST_iter7_Player"})
    assert rp.status_code == 200, rp.text
    player = rp.json()

    # Register assistant onto team
    rj = requests.post(f"{API}/teams/join", headers=_auth(assistant["token"]),
                       json={"code": t["invite_code"]})
    assert rj.status_code == 200, rj.text

    yield t, player

    requests.delete(f"{API}/teams/{t['id']}", headers=_auth(owner["token"]))
    requests.delete(f"{API}/programs/{program['id']}", headers=_auth(owner["token"]))


# ---------- Individual program tests ----------
class TestIndividualProgram:
    def _drill(self, i, **over):
        d = {"id": f"custom-d{i}", "name": f"Drill {i}", "category": "Custom",
             "level": 2, "duration": 6, "description": f"desc {i}", "video": "",
             "coach_notes": "", "custom": True, "media_id": None, "player_media_ids": []}
        d.update(over)
        return d

    def test_happy_path_3_drills(self, owner, team_and_player):
        team, player = team_and_player
        drills = [self._drill(i) for i in range(3)]
        r = requests.patch(
            f"{API}/teams/{team['id']}/players/{player['player_id']}/program",
            headers=_auth(owner["token"]), json={"drills": drills},
        )
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["ok"] is True
        assert body["drill_count"] == 3
        assert body["total_minutes"] == 18  # 6*3

        # GET team roster and inspect individual_program
        rg = requests.get(f"{API}/teams/{team['id']}", headers=_auth(owner["token"]))
        assert rg.status_code == 200
        roster = rg.json()["roster"]
        p = next(x for x in roster if x["player_id"] == player["player_id"])
        ip = p["individual_program"]
        assert ip["total_minutes"] == 18
        assert len(ip["drills"]) == 3
        assert ip["updated_by"] == owner["id"]
        assert "updated_at" in ip
        assert ip["drills"][0]["name"] == "Drill 0"

    def test_15_drills_cap_to_10(self, owner, team_and_player):
        team, player = team_and_player
        drills = [self._drill(i, duration=5) for i in range(15)]
        r = requests.patch(
            f"{API}/teams/{team['id']}/players/{player['player_id']}/program",
            headers=_auth(owner["token"]), json={"drills": drills},
        )
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["drill_count"] == 10
        assert body["total_minutes"] == 50  # 5*10

    def test_empty_resets(self, owner, team_and_player):
        team, player = team_and_player
        r = requests.patch(
            f"{API}/teams/{team['id']}/players/{player['player_id']}/program",
            headers=_auth(owner["token"]), json={"drills": []},
        )
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["drill_count"] == 0
        assert body["total_minutes"] == 0

        rg = requests.get(f"{API}/teams/{team['id']}", headers=_auth(owner["token"]))
        p = next(x for x in rg.json()["roster"] if x["player_id"] == player["player_id"])
        assert p["individual_program"]["drills"] == []

    def test_duration_clamp(self, owner, team_and_player):
        team, player = team_and_player
        drills = [self._drill(0, duration=0), self._drill(1, duration=200), self._drill(2, duration=30)]
        r = requests.patch(
            f"{API}/teams/{team['id']}/players/{player['player_id']}/program",
            headers=_auth(owner["token"]), json={"drills": drills},
        )
        assert r.status_code == 200, r.text
        assert r.json()["total_minutes"] == 1 + 60 + 30

        rg = requests.get(f"{API}/teams/{team['id']}", headers=_auth(owner["token"]))
        p = next(x for x in rg.json()["roster"] if x["player_id"] == player["player_id"])
        durs = [d["duration"] for d in p["individual_program"]["drills"]]
        assert durs == [1, 60, 30]

    def test_description_truncated(self, owner, team_and_player):
        team, player = team_and_player
        long_desc = "x" * 1000
        drills = [self._drill(0, description=long_desc)]
        r = requests.patch(
            f"{API}/teams/{team['id']}/players/{player['player_id']}/program",
            headers=_auth(owner["token"]), json={"drills": drills},
        )
        assert r.status_code == 200
        rg = requests.get(f"{API}/teams/{team['id']}", headers=_auth(owner["token"]))
        p = next(x for x in rg.json()["roster"] if x["player_id"] == player["player_id"])
        desc = p["individual_program"]["drills"][0]["description"]
        assert len(desc) == 600
        assert desc == "x" * 600

    def test_player_media_ids_preserved_and_capped(self, owner, team_and_player):
        team, player = team_and_player
        # 30 ids -> capped to 24
        ids = [f"mid-{i}" for i in range(30)]
        drills = [self._drill(0, player_media_ids=ids)]
        r = requests.patch(
            f"{API}/teams/{team['id']}/players/{player['player_id']}/program",
            headers=_auth(owner["token"]), json={"drills": drills},
        )
        assert r.status_code == 200

        rg = requests.get(f"{API}/teams/{team['id']}", headers=_auth(owner["token"]))
        p = next(x for x in rg.json()["roster"] if x["player_id"] == player["player_id"])
        pmids = p["individual_program"]["drills"][0]["player_media_ids"]
        assert len(pmids) == 24
        assert pmids == [f"mid-{i}" for i in range(24)]

    def test_assistant_can_patch(self, assistant, team_and_player):
        team, player = team_and_player
        drills = [{"id": "custom-a1", "name": "Asst drill", "duration": 10,
                   "description": "by asst", "player_media_ids": ["a", "b"]}]
        r = requests.patch(
            f"{API}/teams/{team['id']}/players/{player['player_id']}/program",
            headers=_auth(assistant["token"]), json={"drills": drills},
        )
        assert r.status_code == 200, r.text
        assert r.json()["drill_count"] == 1

        # Verify updated_by = assistant's user id
        rg = requests.get(f"{API}/teams/{team['id']}", headers=_auth(assistant["token"]))
        assert rg.status_code == 200
        p = next(x for x in rg.json()["roster"] if x["player_id"] == player["player_id"])
        assert p["individual_program"]["updated_by"] == assistant["id"]

    def test_stranger_gets_404(self, stranger, team_and_player):
        team, player = team_and_player
        r = requests.patch(
            f"{API}/teams/{team['id']}/players/{player['player_id']}/program",
            headers=_auth(stranger["token"]), json={"drills": []},
        )
        assert r.status_code == 404


# ---------- Media: player-capture ----------
def _tiny_png() -> bytes:
    # 1x1 PNG (from PIL not needed; use a canonical minimal PNG)
    return bytes.fromhex(
        "89504E470D0A1A0A0000000D49484452000000010000000108060000001F15C489"
        "0000000A49444154789C6300010000000500010D0A2DB40000000049454E44AE426082"
    )


def _tiny_mp4() -> bytes:
    # Minimal valid MP4 stub: ftyp box + free box. Small but content_type is
    # driven by client-supplied content_type and .mp4 ext.
    ftyp = struct.pack(">I", 24) + b"ftyp" + b"isom" + struct.pack(">I", 512) + b"isomiso2mp41"
    free = struct.pack(">I", 8) + b"free"
    return ftyp + free


class TestPlayerCaptureMedia:
    def test_upload_png_player_capture(self, owner):
        files = {"file": ("cap.png", io.BytesIO(_tiny_png()), "image/png")}
        r = requests.post(f"{API}/media/upload", headers=_auth(owner["token"]),
                          files=files, data={"kind": "player-capture"})
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["kind"] == "player-capture"
        assert body["content_type"] == "image/png"
        assert body["size"] > 0
        assert body["url"].startswith("/api/media/")

    def test_upload_mp4_player_capture(self, owner):
        files = {"file": ("cap.mp4", io.BytesIO(_tiny_mp4()), "video/mp4")}
        r = requests.post(f"{API}/media/upload", headers=_auth(owner["token"]),
                          files=files, data={"kind": "player-capture"})
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["kind"] == "player-capture"
        assert body["content_type"] == "video/mp4"

    def test_invalid_kind_400(self, owner):
        files = {"file": ("cap.png", io.BytesIO(_tiny_png()), "image/png")}
        r = requests.post(f"{API}/media/upload", headers=_auth(owner["token"]),
                          files=files, data={"kind": "badkind"})
        assert r.status_code == 400
        assert "Invalid kind" in r.json().get("detail", "")

    def test_owner_download_other_user_403(self, owner, stranger):
        files = {"file": ("cap.png", io.BytesIO(_tiny_png()), "image/png")}
        r = requests.post(f"{API}/media/upload", headers=_auth(owner["token"]),
                          files=files, data={"kind": "player-capture"})
        assert r.status_code == 200
        mid = r.json()["id"]

        # Owner OK
        r_ok = requests.get(f"{API}/media/{mid}", headers=_auth(owner["token"]))
        assert r_ok.status_code == 200

        # Stranger forbidden
        r_no = requests.get(f"{API}/media/{mid}", headers=_auth(stranger["token"]))
        assert r_no.status_code == 403


# ---------- Regression sanity ----------
class TestRegression:
    def test_bio_still_owner_only(self, owner, assistant, team_and_player):
        team, player = team_and_player
        # assistant not allowed
        r = requests.patch(
            f"{API}/teams/{team['id']}/players/{player['player_id']}",
            headers=_auth(assistant["token"]), json={"number": "23"},
        )
        assert r.status_code == 404
        # owner allowed
        r2 = requests.patch(
            f"{API}/teams/{team['id']}/players/{player['player_id']}",
            headers=_auth(owner["token"]), json={"number": "23"},
        )
        assert r2.status_code == 200

    def test_sessions_auto_attendance(self, owner, team_and_player):
        team, player = team_and_player
        r = requests.patch(
            f"{API}/teams/{team['id']}/players/{player['player_id']}/sessions/1",
            headers=_auth(owner["token"]), json={"completed": True, "notes": "ok"},
        )
        assert r.status_code == 200
        rg = requests.get(f"{API}/teams/{team['id']}", headers=_auth(owner["token"]))
        p = next(x for x in rg.json()["roster"] if x["player_id"] == player["player_id"])
        assert any(a.get("week") == 1 for a in p.get("attendance", []))

    def test_programs_list_works(self, owner):
        r = requests.get(f"{API}/programs", headers=_auth(owner["token"]))
        assert r.status_code == 200
        assert isinstance(r.json(), list)
