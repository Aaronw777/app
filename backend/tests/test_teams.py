"""Backend tests for new Teams feature endpoints (iteration 2)."""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://court-mastery-9.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture(scope="module")
def auth_session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    email = f"TEST_teams_{uuid.uuid4().hex[:8]}@test.com"
    r = s.post(f"{API}/auth/register", json={"email": email, "password": "testpass1", "name": "Team Tester"})
    assert r.status_code == 200, r.text
    token = r.json()["token"]
    s.headers.update({"Authorization": f"Bearer {token}"})
    return s


@pytest.fixture(scope="module")
def program_id(auth_session):
    r = auth_session.post(f"{API}/programs", json={
        "player_name": "TEST_Player",
        "gender": "mens",
        "starting_age": 10,
        "skill_level": "mini_ballers",
    })
    assert r.status_code == 200, r.text
    return r.json()["id"]


# ============ Auth guards ============
class TestAuthGuards:
    def test_teams_requires_auth(self):
        r = requests.get(f"{API}/teams")
        assert r.status_code == 401

    def test_create_team_requires_auth(self):
        r = requests.post(f"{API}/teams", json={"name": "X", "program_id": "y"})
        assert r.status_code == 401


# ============ Team CRUD ============
class TestTeamsCRUD:
    def test_create_team_invalid_program(self, auth_session):
        r = auth_session.post(f"{API}/teams", json={"name": "Bogus", "program_id": "nope"})
        assert r.status_code == 404

    def test_create_team_success(self, auth_session, program_id):
        r = auth_session.post(f"{API}/teams", json={"name": "TEST_Wolves", "program_id": program_id})
        assert r.status_code == 200
        data = r.json()
        assert data["name"] == "TEST_Wolves"
        assert data["program_id"] == program_id
        assert data["roster"] == []
        assert "id" in data
        pytest.team_id = data["id"]

    def test_list_teams_returns_enrichment(self, auth_session):
        r = auth_session.get(f"{API}/teams")
        assert r.status_code == 200
        arr = r.json()
        assert isinstance(arr, list) and len(arr) >= 1
        t = next((x for x in arr if x["id"] == pytest.team_id), None)
        assert t is not None
        assert "roster_count" in t and t["roster_count"] == 0
        assert "program_name" in t and t["program_name"] == "TEST_Player"
        assert "total_weeks" in t

    def test_get_team_has_sessions_summary(self, auth_session):
        r = auth_session.get(f"{API}/teams/{pytest.team_id}")
        assert r.status_code == 200
        data = r.json()
        assert data["program"] is not None
        assert "sessions_summary" in data["program"]
        assert len(data["program"]["sessions_summary"]) >= 1
        s0 = data["program"]["sessions_summary"][0]
        assert set(["week", "theme", "total_minutes", "target_level"]).issubset(s0.keys())

    def test_get_team_not_found(self, auth_session):
        r = auth_session.get(f"{API}/teams/nonexistent")
        assert r.status_code == 404


# ============ Player + Roster ============
class TestRoster:
    def test_add_player(self, auth_session):
        r = auth_session.post(f"{API}/teams/{pytest.team_id}/players", json={"name": "TEST_Kid"})
        assert r.status_code == 200
        p = r.json()
        assert p["player_name"] == "TEST_Kid"
        assert "player_id" in p
        pytest.player_id = p["player_id"]

    def test_add_player_team_not_found(self, auth_session):
        r = auth_session.post(f"{API}/teams/none/players", json={"name": "X"})
        assert r.status_code == 404

    def test_toggle_session_cell(self, auth_session):
        r = auth_session.patch(
            f"{API}/teams/{pytest.team_id}/players/{pytest.player_id}/sessions/1",
            json={"completed": True},
        )
        assert r.status_code == 200
        # Verify persisted
        r2 = auth_session.get(f"{API}/teams/{pytest.team_id}")
        assert r2.status_code == 200
        team = r2.json()
        p = next(x for x in team["roster"] if x["player_id"] == pytest.player_id)
        assert p["sessions"]["1"]["completed"] is True

    def test_toggle_session_untoggle(self, auth_session):
        r = auth_session.patch(
            f"{API}/teams/{pytest.team_id}/players/{pytest.player_id}/sessions/1",
            json={"completed": False},
        )
        assert r.status_code == 200
        r2 = auth_session.get(f"{API}/teams/{pytest.team_id}")
        team = r2.json()
        p = next(x for x in team["roster"] if x["player_id"] == pytest.player_id)
        assert p["sessions"]["1"]["completed"] is False

    def test_patch_player_not_found(self, auth_session):
        r = auth_session.patch(
            f"{API}/teams/{pytest.team_id}/players/nope/sessions/1",
            json={"completed": True},
        )
        assert r.status_code == 404

    def test_remove_player(self, auth_session):
        r = auth_session.delete(f"{API}/teams/{pytest.team_id}/players/{pytest.player_id}")
        assert r.status_code == 200
        r2 = auth_session.get(f"{API}/teams/{pytest.team_id}")
        assert len(r2.json()["roster"]) == 0


# ============ Team scoping + cleanup ============
class TestScopingAndDelete:
    def test_other_user_cannot_see_team(self, auth_session):
        s2 = requests.Session()
        s2.headers.update({"Content-Type": "application/json"})
        email = f"TEST_other_{uuid.uuid4().hex[:8]}@test.com"
        r = s2.post(f"{API}/auth/register", json={"email": email, "password": "testpass1", "name": "Other"})
        assert r.status_code == 200
        s2.headers.update({"Authorization": f"Bearer {r.json()['token']}"})
        r2 = s2.get(f"{API}/teams/{pytest.team_id}")
        assert r2.status_code == 404
        r3 = s2.get(f"{API}/teams")
        assert all(t["id"] != pytest.team_id for t in r3.json())

    def test_delete_team(self, auth_session):
        r = auth_session.delete(f"{API}/teams/{pytest.team_id}")
        assert r.status_code == 200
        r2 = auth_session.get(f"{API}/teams/{pytest.team_id}")
        assert r2.status_code == 404
