"""Iteration 5 — Expanded video MIME support + 500MB size cap.

Covers:
  * Auth: seeded admin login sets access_token cookie; /api/auth/me works.
  * Media upload accepts every newly-allowed video MIME (mp4, mov, webm, avi, 3gp, mkv)
    and one image MIME (png) for baseline.
  * Rejections: >25MB image, >500MB video (unit level), disallowed content-type,
    invalid kind.
  * GET/DELETE ownership + soft-delete semantics for a video.
  * Regression: /api/programs POST+GET and /api/teams CRUD.
"""
import io
import os
import sys
import uuid
import struct
import zlib

import pytest
import requests

def _load_backend_url():
    v = os.environ.get("REACT_APP_BACKEND_URL")
    if v:
        return v.rstrip("/")
    # Fallback: read from /app/frontend/.env
    try:
        with open("/app/frontend/.env") as f:
            for line in f:
                if line.startswith("REACT_APP_BACKEND_URL="):
                    return line.split("=", 1)[1].strip().rstrip("/")
    except Exception:
        pass
    raise RuntimeError("REACT_APP_BACKEND_URL not set")

BASE_URL = _load_backend_url()
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "coach@basketballaus.com"
ADMIN_PASSWORD = "CoachAdmin2026!"

# ---------- helpers ----------

def _tiny_png():
    sig = b"\x89PNG\r\n\x1a\n"
    def chunk(t, d):
        return struct.pack(">I", len(d)) + t + d + struct.pack(">I", zlib.crc32(t + d) & 0xffffffff)
    ihdr = chunk(b"IHDR", struct.pack(">IIBBBBB", 1, 1, 8, 2, 0, 0, 0))
    idat = chunk(b"IDAT", zlib.compress(b"\x00\xff\x00\x00"))
    iend = chunk(b"IEND", b"")
    return sig + ihdr + idat + iend

PNG = _tiny_png()
# ~1MB "video" payload (Emergent storage does not validate container)
FAKE_VIDEO_1MB = b"\x00\x00\x00\x20ftypisom" + os.urandom(1024 * 1024)


def _auth(u):
    return {"Authorization": f"Bearer {u['token']}"}


# ---------- fixtures ----------

@pytest.fixture(scope="module")
def admin():
    r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=30)
    assert r.status_code == 200, f"admin login failed: {r.status_code} {r.text}"
    body = r.json()
    assert "token" in body
    # Cookie set on the session
    assert "access_token" in r.cookies, f"access_token cookie missing; got {r.cookies}"
    return {"email": body["email"], "id": body["id"], "token": body["token"], "cookies": r.cookies}


@pytest.fixture(scope="module")
def user_a():
    email = f"TEST_iter5_a_{uuid.uuid4().hex[:8]}@test.com"
    r = requests.post(f"{API}/auth/register", json={"email": email, "password": "testpass1", "name": "A"}, timeout=30)
    assert r.status_code == 200, r.text
    b = r.json()
    return {"email": email, "id": b["id"], "token": b["token"]}


@pytest.fixture(scope="module")
def user_b():
    email = f"TEST_iter5_b_{uuid.uuid4().hex[:8]}@test.com"
    r = requests.post(f"{API}/auth/register", json={"email": email, "password": "testpass1", "name": "B"}, timeout=30)
    assert r.status_code == 200, r.text
    b = r.json()
    return {"email": email, "id": b["id"], "token": b["token"]}


# ---------- Auth ----------

class TestAuth:
    def test_admin_login_and_me(self, admin):
        # /auth/me via Bearer
        r = requests.get(f"{API}/auth/me", headers=_auth(admin), timeout=30)
        assert r.status_code == 200
        assert r.json()["email"] == ADMIN_EMAIL

    def test_admin_login_and_me_via_cookie(self):
        s = requests.Session()
        r = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=30)
        assert r.status_code == 200
        assert s.cookies.get("access_token"), "cookie not persisted"
        r2 = s.get(f"{API}/auth/me", timeout=30)
        assert r2.status_code == 200
        assert r2.json()["email"] == ADMIN_EMAIL


# ---------- Media happy paths (images + all new video mimes) ----------

VIDEO_CASES = [
    ("clip.mp4",  "video/mp4",          "drill-media"),
    ("clip.mov",  "video/quicktime",    "session-photo"),
    ("clip.webm", "video/webm",         "drill-media"),
    ("clip.avi",  "video/x-msvideo",    "drill-media"),
    ("clip.3gp",  "video/3gpp",         "drill-media"),
    ("clip.mkv",  "video/x-matroska",   "drill-media"),
]


class TestMediaUploadHappy:
    def test_image_png_team_logo(self, user_a):
        r = requests.post(f"{API}/media/upload",
                          files={"file": ("logo.png", PNG, "image/png")},
                          data={"kind": "team-logo"},
                          headers=_auth(user_a),
                          timeout=180)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["kind"] == "team-logo"
        assert d["content_type"] == "image/png"
        assert d["url"] == f"/api/media/{d['id']}"
        assert d["size"] == len(PNG)
        # Round-trip
        g = requests.get(f"{API}/media/{d['id']}", headers=_auth(user_a), timeout=60)
        assert g.status_code == 200
        assert g.headers.get("Content-Type", "").startswith("image/png")

    @pytest.mark.parametrize("fname,ctype,kind", VIDEO_CASES)
    def test_video_upload_all_mimes(self, user_a, fname, ctype, kind):
        r = requests.post(f"{API}/media/upload",
                          files={"file": (fname, FAKE_VIDEO_1MB, ctype)},
                          data={"kind": kind},
                          headers=_auth(user_a),
                          timeout=180)
        assert r.status_code == 200, f"{ctype}: {r.status_code} {r.text}"
        d = r.json()
        assert d["content_type"] == ctype
        assert d["kind"] == kind
        assert d["size"] == len(FAKE_VIDEO_1MB)
        # Save first video id for later ownership / delete tests
        if ctype == "video/mp4":
            pytest.iter5_video_id = d["id"]
            pytest.iter5_video_owner = user_a


# ---------- Media rejections ----------

class TestMediaUploadRejects:
    def test_reject_invalid_kind(self, user_a):
        r = requests.post(f"{API}/media/upload",
                          files={"file": ("a.png", PNG, "image/png")},
                          data={"kind": "not-a-kind"},
                          headers=_auth(user_a),
                          timeout=30)
        assert r.status_code == 400

    def test_reject_disallowed_content_type(self, user_a):
        r = requests.post(f"{API}/media/upload",
                          files={"file": ("evil.exe", b"MZ" + os.urandom(1024), "application/x-msdownload")},
                          data={"kind": "misc"},
                          headers=_auth(user_a),
                          timeout=30)
        assert r.status_code == 400
        assert "not allowed" in r.text.lower() or "content" in r.text.lower()

    def test_reject_oversize_image(self, user_a):
        # 26MB PNG-typed payload — server enforces 25MB image cap
        big = b"\x89PNG\r\n\x1a\n" + b"\x00" * (26 * 1024 * 1024)
        r = requests.post(f"{API}/media/upload",
                          files={"file": ("big.png", big, "image/png")},
                          data={"kind": "team-logo"},
                          headers=_auth(user_a),
                          timeout=180)
        assert r.status_code == 400, r.text
        assert "too large" in r.text.lower()

    def test_reject_oversize_video_unit(self):
        """Unit-level: storage.upload_bytes must reject >500MB video without hitting network.

        Uses a fake object exposing __len__ so no 500MB buffer is actually allocated.
        """
        # Import from backend package
        sys.path.insert(0, "/app/backend")
        import storage as storage_mod

        class FakeBig:
            def __init__(self, n): self._n = n
            def __len__(self): return self._n

        with pytest.raises(ValueError) as ei:
            storage_mod.upload_bytes(
                user_id="unit-test",
                kind="drill-media",
                data=FakeBig(500 * 1024 * 1024 + 1),
                content_type="video/mp4",
                ext="mp4",
            )
        msg = str(ei.value).lower()
        assert "too large" in msg
        assert "500" in msg  # message should reference MB cap

    def test_500mb_constant_is_correct(self):
        sys.path.insert(0, "/app/backend")
        import storage as storage_mod
        assert storage_mod.MAX_VIDEO_BYTES == 500 * 1024 * 1024
        assert storage_mod.MAX_IMAGE_BYTES == 25 * 1024 * 1024
        # New video mimes must all be present
        for m in ("video/mp4", "video/quicktime", "video/webm",
                  "video/x-msvideo", "video/3gpp", "video/x-matroska"):
            assert m in storage_mod.ALLOWED_VIDEO


# ---------- Media ownership + delete (video) ----------

class TestMediaOwnershipDelete:
    def test_download_403_other_user(self, user_b):
        mid = getattr(pytest, "iter5_video_id", None)
        if not mid:
            pytest.skip("no video id")
        r = requests.get(f"{API}/media/{mid}", headers=_auth(user_b), timeout=60)
        assert r.status_code == 403

    def test_owner_download_video_content_type(self, user_a):
        mid = getattr(pytest, "iter5_video_id", None)
        if not mid:
            pytest.skip("no video id")
        r = requests.get(f"{API}/media/{mid}", headers=_auth(user_a), timeout=60)
        assert r.status_code == 200
        assert r.headers.get("Content-Type", "").startswith("video/mp4")

    def test_soft_delete_then_404(self, user_a):
        mid = getattr(pytest, "iter5_video_id", None)
        if not mid:
            pytest.skip("no video id")
        d = requests.delete(f"{API}/media/{mid}", headers=_auth(user_a), timeout=30)
        assert d.status_code == 200
        g = requests.get(f"{API}/media/{mid}", headers=_auth(user_a), timeout=30)
        assert g.status_code == 404


# ---------- Regression: programs + teams ----------

class TestRegression:
    def test_programs_create_and_list(self, user_a):
        r = requests.post(f"{API}/programs",
                          json={"player_name": "TEST_iter5", "gender": "mens",
                                "starting_age": 13, "skill_level": "developing"},
                          headers=_auth(user_a), timeout=60)
        assert r.status_code == 200, r.text
        pid = r.json()["id"]
        g = requests.get(f"{API}/programs", headers=_auth(user_a), timeout=30)
        assert g.status_code == 200
        assert any(p["id"] == pid for p in g.json())
        # Detail
        g2 = requests.get(f"{API}/programs/{pid}", headers=_auth(user_a), timeout=30)
        assert g2.status_code == 200
        assert g2.json()["player_name"] == "TEST_iter5"

    def test_teams_crud(self, user_a):
        # Need program for team
        p = requests.post(f"{API}/programs",
                          json={"player_name": "TEST_iter5_team_prog", "gender": "womens",
                                "starting_age": 15, "skill_level": "intermediate"},
                          headers=_auth(user_a), timeout=60)
        pid = p.json()["id"]
        # Create
        t = requests.post(f"{API}/teams", json={"name": "TEST_iter5_Team", "program_id": pid},
                          headers=_auth(user_a), timeout=30)
        assert t.status_code == 200, t.text
        tid = t.json()["id"]
        # List
        lst = requests.get(f"{API}/teams", headers=_auth(user_a), timeout=30)
        assert lst.status_code == 200
        assert any(x["id"] == tid for x in lst.json())
        # Get
        g = requests.get(f"{API}/teams/{tid}", headers=_auth(user_a), timeout=30)
        assert g.status_code == 200
        assert g.json()["name"] == "TEST_iter5_Team"
        # Delete
        d = requests.delete(f"{API}/teams/{tid}", headers=_auth(user_a), timeout=30)
        assert d.status_code == 200
        g2 = requests.get(f"{API}/teams/{tid}", headers=_auth(user_a), timeout=30)
        assert g2.status_code == 404
