from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer
from sqlalchemy.sql import func

from backend.app.database import Base


class RecognitionHistory(Base):
    """One recognition attempt of one user. The uploaded photo itself is not stored."""

    __tablename__ = "recognition_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    artwork_id = Column(Integer, ForeignKey("artworks.id", ondelete="SET NULL"), nullable=True)
    score = Column(Float, nullable=False)
    recognized = Column(Boolean, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)