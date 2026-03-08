from fastapi import APIRouter
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from ..paths import UPLOADS_DIR
from ..services.youtube_service import import_youtube_to_uploads


router = APIRouter(tags=["import"])


class YouTubeImportRequest(BaseModel):
    """Request body for YouTube URL import."""

    url: str


@router.post("/import/youtube")
async def import_youtube(request: YouTubeImportRequest):
    """
    Import audio from a YouTube URL: download and convert to MP3, store in uploads/.

    Returns file_id and metadata so the frontend can pass the file into the stem split flow.
    """
    result = import_youtube_to_uploads(request.url.strip(), UPLOADS_DIR)
    return JSONResponse(result)
