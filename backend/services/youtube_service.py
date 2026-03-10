"""
YouTube import service: validate URL, download audio via yt-dlp, convert to MP3 with ffmpeg,
and save into uploads/ using the same file_id naming convention as the upload flow.
"""

from __future__ import annotations

import logging
import re
import subprocess
import uuid
from pathlib import Path
from typing import Dict, Any

from fastapi import HTTPException

logger = logging.getLogger(__name__)

# Accept standard YouTube URL patterns; reject non-YouTube
YOUTUBE_URL_PATTERN = re.compile(
    r"^https?://(?:www\.)?(?:youtube\.com/(?:watch\?v=|shorts/)|youtu\.be/)[\w-]+"
)


def is_valid_youtube_url(url: str) -> bool:
    """Return True if the URL is a supported YouTube watch/shorts URL."""
    if not url or not isinstance(url, str):
        return False
    return bool(YOUTUBE_URL_PATTERN.match(url.strip()))


def download_youtube_audio_as_mp3(url: str, output_path: Path) -> int:
    """
    Download audio from a YouTube URL and write an MP3 file to output_path.

    Uses yt-dlp with --no-playlist and ffmpeg for extraction/conversion.
    Assumes ffmpeg is installed on the system.

    Returns the size of the written file in bytes.
    Raises HTTPException on validation or subprocess failure.
    """
    if not is_valid_youtube_url(url):
        raise HTTPException(
            status_code=400,
            detail="Invalid or non-YouTube URL. Only YouTube watch and shorts URLs are supported.",
        )

    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    # yt-dlp: extract audio, no playlist, output as mp3 (uses ffmpeg).
    # Use web_embedded player client to avoid 403 Forbidden when the default web
    # client hits YouTube's SABR/restrictions (see yt-dlp issue #12482, #12561).
    # Some videos with embedding disabled may still be unavailable.
    cmd = [
        "yt-dlp",
        "--no-playlist",
        "-x",
        "--audio-format",
        "mp3",
        "--audio-quality",
        "0",
        "--extractor-args",
        "youtube:player_client=web_embedded",
        "-o",
        str(output_path),
        url.strip(),
    ]

    try:
        completed = subprocess.run(
            cmd,
            check=False,
            capture_output=True,
            text=True,
            timeout=600,
        )
    except subprocess.TimeoutExpired:
        logger.error("yt-dlp timed out for url=%s", url)
        raise HTTPException(
            status_code=504,
            detail="Download timed out. Try a shorter video or check your connection.",
        ) from None
    except FileNotFoundError:
        logger.error("yt-dlp not found")
        raise HTTPException(
            status_code=500,
            detail="yt-dlp is not installed. Install it to use YouTube import (e.g. brew install yt-dlp).",
        ) from None

    if completed.returncode != 0:
        logger.error(
            "yt-dlp failed code=%s stdout=%s stderr=%s",
            completed.returncode,
            completed.stdout,
            completed.stderr,
        )
        raise HTTPException(
            status_code=502,
            detail="Failed to download or convert audio from YouTube. The video may be unavailable or restricted.",
        )

    if not output_path.exists():
        raise HTTPException(
            status_code=500,
            detail="Download completed but output file was not created.",
        )

    return output_path.stat().st_size


def import_youtube_to_uploads(url: str, uploads_dir: Path) -> Dict[str, Any]:
    """
    Import audio from a YouTube URL into the uploads directory.

    - Validates the URL
    - Creates a file_id and stored filename (file_id_audio.mp3)
    - Downloads and converts to MP3, saves to uploads_dir
    - Returns metadata compatible with the upload response so the frontend
      can pass file_id into the existing split flow.

    Returns dict with: file_id, original_filename, stored_filename, size_bytes.
    """
    if not is_valid_youtube_url(url):
        raise HTTPException(
            status_code=400,
            detail="Invalid or non-YouTube URL. Only YouTube watch and shorts URLs are supported.",
        )

    file_id = str(uuid.uuid4())
    stored_filename = f"{file_id}_audio.mp3"
    upload_path = Path(uploads_dir) / stored_filename

    size_bytes = download_youtube_audio_as_mp3(url, upload_path)

    return {
        "file_id": file_id,
        "original_filename": "audio.mp3",
        "stored_filename": stored_filename,
        "size_bytes": size_bytes,
    }
