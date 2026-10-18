import io
from typing import List

from fastapi import APIRouter, Depends, File, HTTPException, Query, Response, UploadFile, status
from PIL import Image, ImageOps, UnidentifiedImageError
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models.artwork import Artwork
from backend.app.models.history import RecognitionHistory
from backend.app.models.user import User
from backend.app.schemas.recognition import (
    ArtworkDetail,
    ArtworkSummary,
    Candidate,
    HistoryItem,
    RecognitionResponse,
)
from backend.app.security import get_current_user
from backend.app.services.recognizer import RECOGNITION_THRESHOLD, get_service

router = APIRouter(tags=["Recognition"])

MAX_UPLOAD_BYTES = 10 * 1024 * 1024
MAX_PIXELS = 40_000_000


def image_url(artwork: Artwork) -> str:
    return f"/static/artworks/{artwork.met_object_id}.jpg"


def to_summary(artwork: Artwork) -> ArtworkSummary:
    return ArtworkSummary(
        id=artwork.id,
        title=artwork.title,
        artist=artwork.artist,
        museum=artwork.museum,
        image_url=image_url(artwork),
    )


def to_detail(artwork: Artwork) -> ArtworkDetail:
    return ArtworkDetail(
        id=artwork.id,
        met_object_id=artwork.met_object_id,
        title=artwork.title,
        artist=artwork.artist,
        year=artwork.year,
        type=artwork.type,
        museum=artwork.museum,
        image_url=image_url(artwork),
        source_url=artwork.source_url,
        description_tr=artwork.description_tr,
        description_en=artwork.description_en,
    )


def read_image(upload: UploadFile) -> Image.Image:
    data = upload.file.read(MAX_UPLOAD_BYTES + 1)
    if not data:
        raise HTTPException(status_code=400, detail="The uploaded file is empty")
    if len(data) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="The image is too large (limit is 10 MB)")
    try:
        image = Image.open(io.BytesIO(data))
        if image.width * image.height > MAX_PIXELS:
            raise HTTPException(status_code=400, detail="The image resolution is too high")
        image.load()
    except HTTPException:
        raise
    except (UnidentifiedImageError, OSError, ValueError, SyntaxError, Image.DecompressionBombError):
        raise HTTPException(
            status_code=400, detail="The file is not a valid JPEG or PNG image"
        )
    image = ImageOps.exif_transpose(image)
    return image.convert("RGB")


@router.post("/recognize", response_model=RecognitionResponse)
def recognize(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    image = read_image(file)
    matches = get_service().identify(image, k=3)

    object_ids = [int(object_id) for object_id, _ in matches]
    artworks = {
        artwork.met_object_id: artwork
        for artwork in db.query(Artwork).filter(Artwork.met_object_id.in_(object_ids)).all()
    }

    best_id = object_ids[0]
    best_score = float(matches[0][1])
    recognized = best_score >= RECOGNITION_THRESHOLD and best_id in artworks

    entry = RecognitionHistory(
        user_id=current_user.id,
        artwork_id=artworks[best_id].id if recognized else None,
        score=best_score,
        recognized=recognized,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)

    candidates = [
        Candidate(artwork=to_summary(artworks[int(object_id)]), score=round(float(score), 4))
        for object_id, score in matches
        if int(object_id) in artworks
    ]
    return RecognitionResponse(
        recognized=recognized,
        score=round(best_score, 4),
        threshold=RECOGNITION_THRESHOLD,
        history_id=entry.id,
        artwork=to_detail(artworks[best_id]) if recognized else None,
        candidates=candidates,
    )


@router.get("/history", response_model=List[HistoryItem])
def list_history(
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    rows = (
        db.query(RecognitionHistory, Artwork)
        .outerjoin(Artwork, RecognitionHistory.artwork_id == Artwork.id)
        .filter(RecognitionHistory.user_id == current_user.id)
        .order_by(RecognitionHistory.created_at.desc(), RecognitionHistory.id.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    return [
        HistoryItem(
            id=entry.id,
            created_at=entry.created_at,
            recognized=entry.recognized,
            score=round(entry.score, 4),
            artwork=to_summary(artwork) if artwork is not None else None,
        )
        for entry, artwork in rows
    ]


@router.delete("/history/{history_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_history_item(
    history_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    entry = (
        db.query(RecognitionHistory)
        .filter(RecognitionHistory.id == history_id, RecognitionHistory.user_id == current_user.id)
        .first()
    )
    if entry is None:
        raise HTTPException(status_code=404, detail="History entry not found")
    db.delete(entry)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/artworks/{artwork_id}", response_model=ArtworkDetail)
def get_artwork(
    artwork_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    artwork = db.query(Artwork).filter(Artwork.id == artwork_id).first()
    if artwork is None:
        raise HTTPException(status_code=404, detail="Artwork not found")
    return to_detail(artwork)

@router.get("/artworks", response_model=List[ArtworkSummary])
def list_artworks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    artworks = db.query(Artwork).order_by(Artwork.id).all()
    return [to_summary(artwork) for artwork in artworks]