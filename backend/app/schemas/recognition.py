from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel


class ArtworkSummary(BaseModel):
    id: int
    title: str
    artist: str
    image_url: str


class ArtworkDetail(BaseModel):
    id: int
    met_object_id: int
    title: str
    artist: str
    year: Optional[str] = None
    type: Optional[str] = None
    museum: Optional[str] = None
    image_url: str
    source_url: Optional[str] = None
    description_tr: Optional[str] = None
    description_en: Optional[str] = None


class Candidate(BaseModel):
    artwork: ArtworkSummary
    score: float


class RecognitionResponse(BaseModel):
    recognized: bool
    score: float
    threshold: float
    history_id: int
    artwork: Optional[ArtworkDetail] = None
    candidates: List[Candidate]


class HistoryItem(BaseModel):
    id: int
    created_at: datetime
    recognized: bool
    score: float
    artwork: Optional[ArtworkSummary] = None