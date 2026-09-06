"""Iteration 6 backend tests:
- Assistant coach flow (invite code, join, leave, remove, role-based access)
- Player bio + season stats (sanitisation)
- Attendance auto-log on session completion toggle
- HTTP Range streaming for /api/media/{id}
- Regressions: /api/programs CRUD, /api/programs/{id}/cover with video media
"""
import os
import io
import time
import uuid
import struct
import pytest
import requests

_env_url = os.environ.get("REACT_APP_BACKEND_URL")
if not _env_url:
    # fallback to frontend/.env
    from pathlib import Path
    for line in Path("/app/frontend/.env").read_text().splitlines():
        if line.startswith("REACT_APP_BACKEND_URL="):
            _env_url = line.split("=", 1)[1].strip()
            break
BASE_URL = _env_url.rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "coach@basketballaus.com"
ADMIN_PASSWORD = "CoachAdmin2026!"


def _auth_headers(token):
    return {"Authorization": f"Bearer {token}"}


def _register(email, password="testpass1", name="Tester"):
    r = requests.post(f"{API}/auth/register", json={"email": email, "password": password, "name": name})
    if r.status_code == 400:
        # login instead
        r = requests.post(f"{API}/auth/login", json={"email": email, "password": password})
    assert r.status_code == 200, r.text
    return r.json()


# ---------- Fixtures ----------
@pytest.fixture(scope="module")
def owner():
    """Owner = seeded admin."""
    r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, r.text
    return r.json()


@pytest.fixture(scope="module")
def assistant():
    email = f"TEST_iter6_asst_{uuid.uuid4().hex[:8]}@test.com"
    u = _register(email, name="Assistant Coach")
    u["email"] = email
    return u


@pytest.fixture(scope="module")
def stranger():
    email = f"TEST_iter6_str_{uuid.uuid4().hex[:8]}@test.com"
    u = _register(email, name="Stranger")
    u["email"] = email
    return u


@pytest.fixture(scope="module")
def program(owner):
    r = requests.post(
        f"{API}/programs",
        headers=_auth_headers(owner["token"]),
        json={"player_name": "TEST_iter6_prog", "gender": "mens", "starting_age": 14, "skill_level": "developing"},
    )
    assert r.status_code == 200, r.text
    return r.json()


@pytest.fixture(scope="module")
def team(owner, program):
    r = requests.post(
        f"{API}/teams",
        headers=_auth_headers(owner["token"]),
        json={"name": "TEST_iter6_Team", "program_id": program["id"]},
    )
    assert r.status_code == 200, r.text
    t = r.json()
    yield t
    # teardown
    requests.delete(f"{API}/teams/{t['id']}", headers=_auth_headers(owner["token"]))
    requests.delete(f"{API}/programs/{program['id']}", headers=_auth_headers(owner["token"]))


# ---------- Auth & basic team ----------
class TestAuth:
    def test_admin_login(self, owner):
        assert owner["email"] == ADMIN_EMAIL
        assert owner["token"]


class TestTeamCreationAndInvite:
    def test_team_has_invite_code(self, team):
        assert "invite_code" in team
        code = team["invite_code"]
        assert isinstance(code, str) and len(code) == 6 and code.isdigit()
        assert team["assistant_ids"] == []

    def test_get_team_owner_sees_invite_code(self, owner, team):
        r = requests.get(f"{API}/teams/{team['id']}", headers=_auth_headers(owner["token"]))
        assert r.status_code == 200
        data = r.json()
        assert data["role"] == "owner"
        assert data["invite_code"] == team["invite_code"]
        assert isinstance(data["assistants"], list)

    def test_join_invalid_code(self, assistant):
        r = requests.post(f"{API}/teams/join", headers=_auth_headers(assistant["token"]),
                          json={"code": "000000"})
        # Might collide theoretically but extremely unlikely; try another one
        if r.status_code == 200:
            pytest.skip("collision on 000000")
        assert r.status_code == 404
        assert "Invalid" in r.json().get("detail", "")

    def test_owner_cannot_join_own_team(self, owner, team):
        r = requests.post(f"{API}/teams/join", headers=_auth_headers(owner["token"]),
                          json={"code": team["invite_code"]})
        assert r.status_code == 400

    def test_assistant_joins(self, assistant, team):
        r = requests.post(f"{API}/teams/join", headers=_auth_headers(assistant["token"]),
                          json={"code": team["invite_code"]})
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["team_id"] == team["id"]
        assert body["already_member"] is False

    def test_assistant_idempotent_join(self, assistant, team):
        r = requests.post(f"{API}/teams/join", headers=_auth_headers(assistant["token"]),
                          json={"code": team["invite_code"]})
        assert r.status_code == 200
        assert r.json()["already_member"] is True

    def test_list_teams_role(self, owner, assistant, team):
        r = requests.get(f"{API}/teams", headers=_auth_headers(owner["token"]))
        assert r.status_code == 200
        owner_teams = {t["id"]: t for t in r.json()}
        assert owner_teams[team["id"]]["role"] == "owner"

        r2 = requests.get(f"{API}/teams", headers=_auth_headers(assistant["token"]))
        assert r2.status_code == 200
        asst_teams = {t["id"]: t for t in r2.json()}
        assert team["id"] in asst_teams
        assert asst_teams[team["id"]]["role"] == "assistant"

    def test_assistant_get_team_hides_invite_code(self, assistant, team):
        r = requests.get(f"{API}/teams/{team['id']}", headers=_auth_headers(assistant["token"]))
        assert r.status_code == 200
        data = r.json()
        assert data["role"] == "assistant"
        assert "invite_code" not in data

    def test_rotate_invite_code_owner_only(self, owner, assistant, team):
        old = team["invite_code"]
        # assistant forbidden -> 404 (owner query fails)
        r_asst = requests.post(f"{API}/teams/{team['id']}/invite-code/rotate",
                               headers=_auth_headers(assistant["token"]))
        assert r_asst.status_code == 404

        r = requests.post(f"{API}/teams/{team['id']}/invite-code/rotate",
                          headers=_auth_headers(owner["token"]))
        assert r.status_code == 200
        new_code = r.json()["invite_code"]
        assert new_code != old
        assert len(new_code) == 6 and new_code.isdigit()
        team["invite_code"] = new_code


class TestAssistantRemoval:
    def test_delete_team_forbidden_for_assistant(self, assistant, team):
        r = requests.delete(f"{API}/teams/{team['id']}",
                            headers=_auth_headers(assistant["token"]))
        assert r.status_code == 404

    def test_remove_assistant(self, owner, assistant, team):
        r = requests.delete(f"{API}/teams/{team['id']}/assistants/{assistant['id']}",
                            headers=_auth_headers(owner["token"]))
        assert r.status_code == 200
        # verify no more access
        r2 = requests.get(f"{API}/teams/{team['id']}", headers=_auth_headers(assistant["token"]))
        assert r2.status_code == 404
        # re-join for later tests
        r3 = requests.post(f"{API}/teams/join", headers=_auth_headers(assistant["token"]),
                           json={"code": team["invite_code"]})
        assert r3.status_code == 200

    def test_leave_team(self, assistant, team):
        r = requests.post(f"{API}/teams/{team['id']}/leave",
                          headers=_auth_headers(assistant["token"]))
        assert r.status_code == 200
        # verify removed
        r2 = requests.get(f"{API}/teams/{team['id']}", headers=_auth_headers(assistant["token"]))
        assert r2.status_code == 404
        # rejoin for downstream tests
        r3 = requests.post(f"{API}/teams/join", headers=_auth_headers(assistant["token"]),
                           json={"code": team["invite_code"]})
        assert r3.status_code == 200


# ---------- Player bio & stats ----------
@pytest.fixture(scope="module")
def player(owner, team):
    r = requests.post(f"{API}/teams/{team['id']}/players",
                      headers=_auth_headers(owner["token"]),
                      json={"name": "TEST_Player"})
    assert r.status_code == 200
    p = r.json()
    assert p["stats"] == {"games_played": 0, "points_3s": 0, "points_2s": 0, "points_1s": 0, "total_fouls": 0}
    assert p["attendance"] == []
    return p


class TestPlayerBio:
    def test_patch_bio_and_stats(self, owner, team, player):
        r = requests.patch(
            f"{API}/teams/{team['id']}/players/{player['player_id']}",
            headers=_auth_headers(owner["token"]),
            json={"number": "23", "position": "PG",
                  "stats": {"games_played": 5, "points_3s": -3, "points_2s": 999999, "points_1s": 2, "total_fouls": 4}},
        )
        assert r.status_code == 200
        # verify persisted via GET team
        r2 = requests.get(f"{API}/teams/{team['id']}", headers=_auth_headers(owner["token"]))
        pl = next(p for p in r2.json()["roster"] if p["player_id"] == player["player_id"])
        assert pl["number"] == "23"
        assert pl["position"] == "PG"
        assert pl["stats"]["games_played"] == 5
        assert pl["stats"]["points_3s"] == 0    # negative clamped
        assert pl["stats"]["points_2s"] == 99999  # huge capped
        assert pl["stats"]["points_1s"] == 2
        assert pl["stats"]["total_fouls"] == 4

    def test_assistant_delete_player_forbidden(self, assistant, team, player):
        r = requests.delete(f"{API}/teams/{team['id']}/players/{player['player_id']}",
                            headers=_auth_headers(assistant["token"]))
        assert r.status_code == 404


# ---------- Attendance auto-log ----------
class TestAttendance:
    def test_autolog_on_complete_true(self, owner, team, player):
        r = requests.patch(
            f"{API}/teams/{team['id']}/players/{player['player_id']}/sessions/1",
            headers=_auth_headers(owner["token"]),
            json={"completed": True},
        )
        assert r.status_code == 200
        r2 = requests.get(f"{API}/teams/{team['id']}", headers=_auth_headers(owner["token"]))
        pl = next(p for p in r2.json()["roster"] if p["player_id"] == player["player_id"])
        att = pl["attendance"]
        assert len(att) == 1
        e = att[0]
        assert e["week"] == 1
        assert e["marked_by"] == owner["id"]
        assert e["marked_by_name"] == owner["name"]
        assert "date" in e

    def test_noop_on_repeated_true(self, owner, team, player):
        r = requests.patch(
            f"{API}/teams/{team['id']}/players/{player['player_id']}/sessions/1",
            headers=_auth_headers(owner["token"]),
            json={"completed": True},
        )
        assert r.status_code == 200
        r2 = requests.get(f"{API}/teams/{team['id']}", headers=_auth_headers(owner["token"]))
        pl = next(p for p in r2.json()["roster"] if p["player_id"] == player["player_id"])
        weeks = [a["week"] for a in pl["attendance"]]
        assert weeks.count(1) == 1

    def test_removes_on_false(self, owner, team, player):
        r = requests.patch(
            f"{API}/teams/{team['id']}/players/{player['player_id']}/sessions/1",
            headers=_auth_headers(owner["token"]),
            json={"completed": False},
        )
        assert r.status_code == 200
        r2 = requests.get(f"{API}/teams/{team['id']}", headers=_auth_headers(owner["token"]))
        pl = next(p for p in r2.json()["roster"] if p["player_id"] == player["player_id"])
        assert not any(a["week"] == 1 for a in pl["attendance"])

    def test_assistant_marks_attendance(self, assistant, owner, team, player):
        r = requests.patch(
            f"{API}/teams/{team['id']}/players/{player['player_id']}/sessions/2",
            headers=_auth_headers(assistant["token"]),
            json={"completed": True},
        )
        assert r.status_code == 200, r.text
        r2 = requests.get(f"{API}/teams/{team['id']}", headers=_auth_headers(owner["token"]))
        pl = next(p for p in r2.json()["roster"] if p["player_id"] == player["player_id"])
        e = next(a for a in pl["attendance"] if a["week"] == 2)
        assert e["marked_by"] == assistant["id"]
        assert e["marked_by_name"] == assistant["name"]


# ---------- Photos / Logo ACL ----------
class TestPhotoAndLogo:
    def test_assistant_can_patch_player_photo(self, assistant, team, player):
        r = requests.patch(
            f"{API}/teams/{team['id']}/players/{player['player_id']}/photo",
            headers=_auth_headers(assistant["token"]),
            json={"photo_media_id": "dummy-media-id"},
        )
        assert r.status_code == 200

    def test_assistant_cannot_patch_logo(self, assistant, team):
        r = requests.patch(
            f"{API}/teams/{team['id']}/logo",
            headers=_auth_headers(assistant["token"]),
            json={"logo_media_id": "dummy"},
        )
        assert r.status_code == 404


# ---------- Media Range streaming ----------
def _minimal_mp4_bytes(size=2048):
    # arbitrary bytes with a valid mp4-ish header so content-type is respected server-side (server trusts content_type param)
    header = b"\x00\x00\x00\x18ftypmp42\x00\x00\x00\x00mp42isom"
    pad = os.urandom(max(size - len(header), 0))
    return header + pad


@pytest.fixture(scope="module")
def video_media(owner):
    data = _minimal_mp4_bytes(4096)
    files = {"file": ("test.mp4", data, "video/mp4")}
    r = requests.post(f"{API}/media/upload",
                      headers=_auth_headers(owner["token"]),
                      files=files, data={"kind": "drill-media"})
    assert r.status_code == 200, r.text
    m = r.json()
    m["_data"] = data
    return m


@pytest.fixture(scope="module")
def image_media(owner):
    # 1x1 PNG
    png = bytes.fromhex(
        "89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4"
        "890000000d49444154789c6360000000000200015e7ecb230000000049454e44ae426082"
    )
    files = {"file": ("test.png", png, "image/png")}
    r = requests.post(f"{API}/media/upload",
                      headers=_auth_headers(owner["token"]),
                      files=files, data={"kind": "team-logo"})
    assert r.status_code == 200, r.text
    return r.json()


class TestMediaRange:
    def test_video_full_get(self, owner, video_media):
        r = requests.get(f"{API}/media/{video_media['id']}",
                         headers=_auth_headers(owner["token"]))
        assert r.status_code == 200
        assert r.headers.get("Accept-Ranges") == "bytes"
        assert r.headers.get("Content-Type", "").startswith("video/mp4")
        assert r.content == video_media["_data"]

    def test_video_partial_range(self, owner, video_media):
        r = requests.get(
            f"{API}/media/{video_media['id']}",
            headers={**_auth_headers(owner["token"]), "Range": "bytes=0-99"},
        )
        assert r.status_code == 206
        total = len(video_media["_data"])
        assert r.headers["Content-Range"] == f"bytes 0-99/{total}"
        assert r.headers["Content-Length"] == "100"
        assert len(r.content) == 100
        assert r.content == video_media["_data"][:100]

    def test_video_partial_range_mid(self, owner, video_media):
        total = len(video_media["_data"])
        r = requests.get(
            f"{API}/media/{video_media['id']}",
            headers={**_auth_headers(owner["token"]), "Range": f"bytes=1000-1499"},
        )
        assert r.status_code == 206
        assert r.headers["Content-Range"] == f"bytes 1000-1499/{total}"
        assert len(r.content) == 500
        assert r.content == video_media["_data"][1000:1500]

    def test_video_malformed_range_falls_back(self, owner, video_media):
        r = requests.get(
            f"{API}/media/{video_media['id']}",
            headers={**_auth_headers(owner["token"]), "Range": "notbytes=abc"},
        )
        assert r.status_code == 200
        assert len(r.content) == len(video_media["_data"])

    def test_image_ignores_range(self, owner, image_media):
        r = requests.get(
            f"{API}/media/{image_media['id']}",
            headers={**_auth_headers(owner["token"]), "Range": "bytes=0-10"},
        )
        assert r.status_code == 200
        assert r.headers.get("Accept-Ranges") == "none"

    def test_forbidden_for_other_user(self, stranger, video_media):
        r = requests.get(f"{API}/media/{video_media['id']}",
                         headers=_auth_headers(stranger["token"]))
        assert r.status_code == 403

    def test_soft_delete_then_404(self, owner, image_media):
        r = requests.delete(f"{API}/media/{image_media['id']}",
                            headers=_auth_headers(owner["token"]))
        assert r.status_code == 200
        r2 = requests.get(f"{API}/media/{image_media['id']}",
                          headers=_auth_headers(owner["token"]))
        assert r2.status_code == 404


# ---------- Regression: programs + cover with video ----------
class TestRegression:
    def test_programs_crud(self, owner):
        r = requests.post(f"{API}/programs", headers=_auth_headers(owner["token"]),
                          json={"player_name": "TEST_reg", "gender": "womens",
                                "starting_age": 12, "skill_level": "fundamental"})
        assert r.status_code == 200
        pid = r.json()["id"]
        r2 = requests.get(f"{API}/programs/{pid}", headers=_auth_headers(owner["token"]))
        assert r2.status_code == 200
        r3 = requests.delete(f"{API}/programs/{pid}", headers=_auth_headers(owner["token"]))
        assert r3.status_code == 200

    def test_program_cover_accepts_video(self, owner, program, video_media):
        r = requests.patch(f"{API}/programs/{program['id']}/cover",
                           headers=_auth_headers(owner["token"]),
                           json={"cover_media_id": video_media["id"]})
        assert r.status_code == 200
