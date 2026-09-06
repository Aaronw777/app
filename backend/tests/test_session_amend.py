"""Backend tests for iteration 3 - Session Amend feature."""
import os
import uuid
import requests
import pytest

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    # fallback to frontend/.env
    from pathlib import Path
    for line in (Path(__file__).resolve().parents[2] / "frontend/.env").read_text().splitlines():
        if line.startswith("REACT_APP_BACKEND_URL="):
            BASE_URL = line.split("=", 1)[1].strip().rstrip("/")


@pytest.fixture(scope="module")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    email = f"TEST_amend_{uuid.uuid4().hex[:8]}@test.com"
    r = s.post(f"{BASE_URL}/api/auth/register", json={
        "email": email, "password": "testpass1", "name": "Amend Tester"
    })
    assert r.status_code == 200, r.text
    token = r.json()["token"]
    s.headers.update({"Authorization": f"Bearer {token}"})
    return s


@pytest.fixture(scope="module")
def program(client):
    r = client.post(f"{BASE_URL}/api/programs", json={
        "player_name": "TEST_Player",
        "gender": "mens",
        "starting_age": 12,
        "skill_level": "developing",
    })
    assert r.status_code == 200, r.text
    return r.json()


# --- Drill library endpoint ---
def test_drills_library_size():
    r = requests.get(f"{BASE_URL}/api/drills")
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    assert len(data) >= 50, f"Expected 50+ drills, got {len(data)}"
    # verify sample fields
    d = data[0]
    for k in ("id", "name", "category", "level", "duration"):
        assert k in d


# --- PATCH session with drills ---
def test_patch_drills_recomputes_total(client, program):
    week = program["sessions"][0]["week"]
    new_drills = [
        {"id": "lib-1", "name": "Layup Lines", "category": "Shooting", "level": 2, "duration": 10,
         "description": "d", "coach_notes": "n"},
        {"id": "lib-2", "name": "Defensive Slides", "category": "Defense", "level": 2, "duration": 15,
         "description": "d", "coach_notes": "n"},
    ]
    r = client.patch(f"{BASE_URL}/api/programs/{program['id']}/sessions/{week}",
                     json={"drills": new_drills})
    assert r.status_code == 200, r.text
    updated = r.json()
    sess = next(s for s in updated["sessions"] if s["week"] == week)
    assert len(sess["drills"]) == 2
    assert sess["total_minutes"] == 25
    assert sess["drills"][0]["name"] == "Layup Lines"


def test_patch_theme(client, program):
    week = program["sessions"][1]["week"]
    r = client.patch(f"{BASE_URL}/api/programs/{program['id']}/sessions/{week}",
                     json={"theme": "Focus Week Custom"})
    assert r.status_code == 200
    sess = next(s for s in r.json()["sessions"] if s["week"] == week)
    assert sess["theme"] == "Focus Week Custom"


def test_patch_clamps_duration(client, program):
    week = program["sessions"][2]["week"]
    drills = [
        {"id": "x1", "name": "Too long", "category": "Custom", "level": 1, "duration": 999},
        {"id": "x2", "name": "Too short", "category": "Custom", "level": 1, "duration": -5},
    ]
    r = client.patch(f"{BASE_URL}/api/programs/{program['id']}/sessions/{week}",
                     json={"drills": drills})
    assert r.status_code == 200
    sess = next(s for s in r.json()["sessions"] if s["week"] == week)
    assert sess["drills"][0]["duration"] == 60
    assert sess["drills"][1]["duration"] == 1
    assert sess["total_minutes"] == 61


def test_patch_marks_custom_by_id_prefix(client, program):
    week = program["sessions"][3]["week"]
    drills = [
        {"id": "custom-123", "name": "My Own Drill", "category": "Custom", "level": 2, "duration": 12},
        {"id": "lib-5", "name": "Standard Drill", "category": "Shooting", "level": 2, "duration": 10},
    ]
    r = client.patch(f"{BASE_URL}/api/programs/{program['id']}/sessions/{week}",
                     json={"drills": drills})
    assert r.status_code == 200
    sess = next(s for s in r.json()["sessions"] if s["week"] == week)
    assert sess["drills"][0]["custom"] is True
    assert sess["drills"][1]["custom"] is False


def test_persistence_after_reload(client, program):
    week = program["sessions"][4]["week"]
    drills = [{"id": "p-1", "name": "Persist Me", "category": "Passing", "level": 1, "duration": 8}]
    client.patch(f"{BASE_URL}/api/programs/{program['id']}/sessions/{week}",
                 json={"drills": drills})
    # fresh GET
    r = client.get(f"{BASE_URL}/api/programs/{program['id']}")
    assert r.status_code == 200
    sess = next(s for s in r.json()["sessions"] if s["week"] == week)
    assert len(sess["drills"]) == 1
    assert sess["drills"][0]["name"] == "Persist Me"
    assert sess["total_minutes"] == 8


def test_patch_ignores_unknown_fields(client, program):
    week = program["sessions"][5]["week"]
    drills = [{"id": "u1", "name": "Kept", "category": "Warm-Up", "level": 1, "duration": 5,
               "malicious_field": "bad", "another": 123}]
    r = client.patch(f"{BASE_URL}/api/programs/{program['id']}/sessions/{week}",
                     json={"drills": drills})
    assert r.status_code == 200
    sess = next(s for s in r.json()["sessions"] if s["week"] == week)
    assert "malicious_field" not in sess["drills"][0]
    assert "another" not in sess["drills"][0]


def test_patch_completed_still_works(client, program):
    week = program["sessions"][6]["week"]
    r = client.patch(f"{BASE_URL}/api/programs/{program['id']}/sessions/{week}",
                     json={"completed": True})
    assert r.status_code == 200
    sess = next(s for s in r.json()["sessions"] if s["week"] == week)
    assert sess["completed"] is True


def test_patch_invalid_week(client, program):
    r = client.patch(f"{BASE_URL}/api/programs/{program['id']}/sessions/9999",
                     json={"drills": []})
    assert r.status_code == 404


def test_unauthorised_patch(program):
    r = requests.patch(f"{BASE_URL}/api/programs/{program['id']}/sessions/1",
                       json={"drills": []})
    assert r.status_code == 401
