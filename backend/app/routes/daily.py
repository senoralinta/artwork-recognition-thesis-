import json
from datetime import date
from functools import lru_cache
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models.artwork import Artwork
from backend.app.models.user import User
from backend.app.routes.recognition import to_detail
from backend.app.schemas.recognition import ArtworkDetail
from backend.app.security import get_current_user

# Facts are stored next to the dataset, keyed by Met object id.
FACTS_PATH = Path(__file__).resolve().parents[3] / "data" / "daily_facts.json"

# Stepping through the list by a fixed number makes consecutive days jump
# across the collection instead of walking through it in database order.
DAY_STEP = 17

router = APIRouter(tags=["Daily"])


class DailyResponse(BaseModel):
    day: date
    artwork: ArtworkDetail
    fact_tr: Optional[str] = None
    fact_en: Optional[str] = None


@lru_cache(maxsize=1)
def load_facts() -> dict:
    if not FACTS_PATH.exists():
        return {}
    with FACTS_PATH.open(encoding="utf-8") as handle:
        return json.load(handle)


@router.get("/daily", response_model=DailyResponse)
def get_daily(
    day: Optional[date] = Query(None, description="Local date of the user, YYYY-MM-DD"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    selected = day or date.today()
    artworks = db.query(Artwork).order_by(Artwork.id).all()
    if not artworks:
        raise HTTPException(status_code=404, detail="No artworks available")

    artwork = artworks[(selected.toordinal() * DAY_STEP) % len(artworks)]
    fact = load_facts().get(str(artwork.met_object_id), {})
    return DailyResponse(
        day=selected,
        artwork=to_detail(artwork),
        fact_tr=fact.get("tr"),
        fact_en=fact.get("en"),
    )
