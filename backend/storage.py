"""Emergent Object Storage helpers for Court Mastery."""
import os
import uuid
import logging

import requests

logger = logging.getLogger(__name__)

STORAGE_BASE = (os.environ.get("INTEGRATION_PROXY_URL") or "").strip() or "https://integrations.emergentagent.com"
STORAGE_URL = STORAGE_BASE.rstrip("/") + "/objstore/api/v1/storage"
EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY")
APP_NAME = "court-mastery"

MIME_TYPES = {
    "jpg": "image/jpeg", "jpeg": "image/jpeg", "png": "image/png",
    "gif": "image/gif", "webp": "image/webp", "svg": "image/svg+xml",
    "heic": "image/heic", "heif": "image/heif",
    "mp4": "video/mp4", "m4v": "video/mp4",
    "mov": "video/quicktime",
    "webm": "video/webm",
    "avi": "video/x-msvideo",
    "3gp": "video/3gpp", "3g2": "video/3gpp2",
    "mkv": "video/x-matroska",
    "pdf": "application/pdf",
}

ALLOWED_IMAGE = {
    "image/jpeg", "image/png", "image/gif", "image/webp",
    "image/heic", "image/heif",
}
ALLOWED_VIDEO = {
    "video/mp4", "video/quicktime", "video/webm",
    "video/x-msvideo", "video/3gpp", "video/3gpp2",
    "video/x-matroska",
}
ALLOWED = ALLOWED_IMAGE | ALLOWED_VIDEO

# 25 MB for images, 500 MB for videos (widened for iPhone .mov clips)
MAX_IMAGE_BYTES = 25 * 1024 * 1024
MAX_VIDEO_BYTES = 500 * 1024 * 1024

_storage_key: str | None = None


def init_storage(force: bool = False):
    global _storage_key
    if _storage_key and not force:
        return _storage_key
    if not EMERGENT_KEY:
        raise RuntimeError("EMERGENT_LLM_KEY is not set")
    resp = requests.post(
        f"{STORAGE_URL}/init",
        json={"emergent_key": EMERGENT_KEY},
        timeout=30,
    )
    resp.raise_for_status()
    _storage_key = resp.json()["storage_key"]
    return _storage_key


def _put(path: str, data: bytes, content_type: str) -> dict:
    key = init_storage()
    resp = requests.put(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key, "Content-Type": content_type},
        data=data,
        timeout=180,
    )
    if resp.status_code == 404:
        # Storage key expired — refresh once
        key = init_storage(force=True)
        resp = requests.put(
            f"{STORAGE_URL}/objects/{path}",
            headers={"X-Storage-Key": key, "Content-Type": content_type},
            data=data,
            timeout=180,
        )
    resp.raise_for_status()
    return resp.json()


def _get(path: str) -> tuple[bytes, str]:
    key = init_storage()
    resp = requests.get(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key},
        timeout=120,
    )
    if resp.status_code == 404:
        key = init_storage(force=True)
        resp = requests.get(
            f"{STORAGE_URL}/objects/{path}",
            headers={"X-Storage-Key": key},
            timeout=120,
        )
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")


def upload_bytes(user_id: str, kind: str, data: bytes, content_type: str, ext: str | None) -> dict:
    """kind: 'team-logo' | 'player-photo' | 'drill-media' | 'session-photo' | 'program-cover'"""
    if content_type not in ALLOWED:
        raise ValueError(f"Content type '{content_type}' not allowed")
    is_video = content_type in ALLOWED_VIDEO
    max_bytes = MAX_VIDEO_BYTES if is_video else MAX_IMAGE_BYTES
    if len(data) > max_bytes:
        raise ValueError(f"File too large — max {max_bytes // (1024*1024)} MB")

    ext = (ext or "bin").lower().lstrip(".") or "bin"
    path = f"{APP_NAME}/{kind}/{user_id}/{uuid.uuid4()}.{ext}"
    result = _put(path, data, content_type)
    return {
        "path": result.get("path", path),
        "size": result.get("size", len(data)),
        "content_type": content_type,
        "kind": kind,
    }


def download(path: str) -> tuple[bytes, str]:
    return _get(path)
