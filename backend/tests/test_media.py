"""Iteration 4 — Media / Object Storage integration tests."""
import io
import os
import uuid
import struct
import zlib

import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://court-mastery-9.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"


def _tiny_png_bytes():
    # Minimal 1x1 red PNG
    sig = b"\x89PNG\r\n\x1a\n"
    def chunk(typ, data):
        return struct.pack(">I", len(data)) + typ + data + struct.pack(">I", zlib.crc32(typ + data) & 0xffffffff)
    ihdr = chunk(b"IHDR", struct.pack(">IIBBBBB", 1, 1, 8, 2, 0, 0, 0))
    raw = b"\x00\xff\x00\x00"  # filter byte + RGB
    idat = chunk(b"IDAT", zlib.compress(raw))
    iend = chunk(b"IEND", b"")
    return sig + ihdr + idat + iend


PNG = _tiny_png_bytes()


@pytest.fixture(scope="module")
def user_a():
    email = f"TEST_media_a_{uuid.uuid4().hex[:8]}@test.com"
    r = requests.post(f"{API}/auth/register", json={"email": email, "password": "testpass1", "name": "A"})
    assert r.status_code == 200, r.text
    return {"email": email, "token": r.json()["token"], "id": r.json()["id"]}


@pytest.fixture(scope="module")
def user_b():
    email = f"TEST_media_b_{uuid.uuid4().hex[:8]}@test.com"
    r = requests.post(f"{API}/auth/register", json={"email": email, "password": "testpass1", "name": "B"})
    assert r.status_code == 200, r.text
    return {"email": email, "token": r.json()["token"], "id": r.json()["id"]}


def _auth(u):
    return {"Authorization": f"Bearer {u['token']}"}


class TestMediaUpload:
    def test_upload_requires_auth(self):
        r = requests.post(f"{API}/media/upload", files={"file": ("a.png", PNG, "image/png")}, data={"kind": "team-logo"})
        assert r.status_code == 401

    def test_upload_invalid_kind(self, user_a):
        r = requests.post(f"{API}/media/upload",
                          files={"file": ("a.png", PNG, "image/png")},
                          data={"kind": "not-a-kind"},
                          headers=_auth(user_a))
        assert r.status_code == 400

    def test_upload_rejects_bad_content_type(self, user_a):
        r = requests.post(f"{API}/media/upload",
                          files={"file": ("a.txt", b"hello", "text/plain")},
                          data={"kind": "misc"},
                          headers=_auth(user_a))
        assert r.status_code == 400

    def test_upload_success_and_download(self, user_a):
        r = requests.post(f"{API}/media/upload",
                          files={"file": ("logo.png", PNG, "image/png")},
                          data={"kind": "team-logo"},
                          headers=_auth(user_a))
        assert r.status_code == 200, r.text
        data = r.json()
        for k in ("id", "kind", "url", "size", "content_type", "storage_path"):
            assert k in data, f"missing {k}"
        assert data["kind"] == "team-logo"
        assert data["content_type"] == "image/png"
        assert data["url"] == f"/api/media/{data['id']}"
        pytest.media_id_a = data["id"]

        # Download with Bearer
        g = requests.get(f"{API}/media/{data['id']}", headers=_auth(user_a))
        assert g.status_code == 200
        assert g.headers.get("Content-Type", "").startswith("image/png")
        assert g.content[:8] == b"\x89PNG\r\n\x1a\n"

        # Download with ?auth= query
        g2 = requests.get(f"{API}/media/{data['id']}?auth={user_a['token']}")
        assert g2.status_code == 200
        assert g2.content[:8] == b"\x89PNG\r\n\x1a\n"

    def test_download_401_without_auth(self):
        # Assumes previous test ran
        mid = getattr(pytest, "media_id_a", None)
        if not mid:
            pytest.skip("no media id")
        r = requests.get(f"{API}/media/{mid}")
        assert r.status_code == 401

    def test_download_403_other_user(self, user_b):
        mid = getattr(pytest, "media_id_a", None)
        if not mid:
            pytest.skip("no media id")
        r = requests.get(f"{API}/media/{mid}", headers=_auth(user_b))
        assert r.status_code == 403

    def test_download_404_missing(self, user_a):
        r = requests.get(f"{API}/media/{uuid.uuid4()}", headers=_auth(user_a))
        assert r.status_code == 404

    def test_soft_delete(self, user_a):
        # Upload fresh, delete, expect 404 on GET
        r = requests.post(f"{API}/media/upload",
                          files={"file": ("d.png", PNG, "image/png")},
                          data={"kind": "misc"},
                          headers=_auth(user_a))
        mid = r.json()["id"]
        d = requests.delete(f"{API}/media/{mid}", headers=_auth(user_a))
        assert d.status_code == 200
        g = requests.get(f"{API}/media/{mid}", headers=_auth(user_a))
        assert g.status_code == 404


class TestMediaAttachments:
    """PATCH endpoints that store media_ids on domain objects."""

    def _upload(self, user, kind="misc"):
        r = requests.post(f"{API}/media/upload",
                          files={"file": ("x.png", PNG, "image/png")},
                          data={"kind": kind},
                          headers=_auth(user))
        assert r.status_code == 200, r.text
        return r.json()["id"]

    def test_program_cover_roundtrip(self, user_a):
        # Create program
        p = requests.post(f"{API}/programs",
                          json={"player_name": "TEST_Cover", "gender": "mens",
                                "starting_age": 12, "skill_level": "developing"},
                          headers=_auth(user_a))
        assert p.status_code == 200, p.text
        pid = p.json()["id"]
        mid = self._upload(user_a, "program-cover")

        r = requests.patch(f"{API}/programs/{pid}/cover",
                           json={"cover_media_id": mid},
                           headers=_auth(user_a))
        assert r.status_code == 200

        g = requests.get(f"{API}/programs/{pid}", headers=_auth(user_a))
        assert g.status_code == 200
        assert g.json().get("cover_media_id") == mid

    def test_team_logo_and_player_photo(self, user_a):
        # Need a program to make a team
        p = requests.post(f"{API}/programs",
                          json={"player_name": "TEST_ForTeam", "gender": "womens",
                                "starting_age": 14, "skill_level": "intermediate"},
                          headers=_auth(user_a))
        pid = p.json()["id"]
        t = requests.post(f"{API}/teams", json={"name": "TEST_Team", "program_id": pid},
                          headers=_auth(user_a))
        assert t.status_code == 200, t.text
        tid = t.json()["id"]

        logo_id = self._upload(user_a, "team-logo")
        r = requests.patch(f"{API}/teams/{tid}/logo",
                           json={"logo_media_id": logo_id},
                           headers=_auth(user_a))
        assert r.status_code == 200

        g = requests.get(f"{API}/teams/{tid}", headers=_auth(user_a))
        assert g.status_code == 200
        assert g.json().get("logo_media_id") == logo_id

        # Add player, set photo
        pl = requests.post(f"{API}/teams/{tid}/players", json={"name": "TEST_Player1"},
                           headers=_auth(user_a))
        assert pl.status_code == 200
        pl_id = pl.json()["player_id"]

        photo_id = self._upload(user_a, "player-photo")
        r = requests.patch(f"{API}/teams/{tid}/players/{pl_id}/photo",
                           json={"photo_media_id": photo_id},
                           headers=_auth(user_a))
        assert r.status_code == 200

        g = requests.get(f"{API}/teams/{tid}", headers=_auth(user_a))
        roster = g.json().get("roster", [])
        found = [p for p in roster if p["player_id"] == pl_id]
        assert found and found[0].get("photo_media_id") == photo_id

    def test_session_photos_and_drill_media(self, user_a):
        p = requests.post(f"{API}/programs",
                          json={"player_name": "TEST_Session", "gender": "mens",
                                "starting_age": 10, "skill_level": "fundamental"},
                          headers=_auth(user_a))
        pid = p.json()["id"]

        sp1 = self._upload(user_a, "session-photo")
        sp2 = self._upload(user_a, "session-photo")
        dm = self._upload(user_a, "drill-media")

        drills = [{
            "id": "custom-drill-1",
            "name": "TEST Custom",
            "category": "Custom",
            "level": 1,
            "duration": 10,
            "description": "d",
            "video": "",
            "coach_notes": "",
            "custom": True,
            "media_id": dm,
        }]
        r = requests.patch(f"{API}/programs/{pid}/sessions/1",
                           json={"photos": [sp1, sp2], "drills": drills},
                           headers=_auth(user_a))
        assert r.status_code == 200, r.text
        prog = r.json()
        s1 = next(s for s in prog["sessions"] if s["week"] == 1)
        assert s1.get("photos") == [sp1, sp2]
        assert s1["drills"][0].get("media_id") == dm
