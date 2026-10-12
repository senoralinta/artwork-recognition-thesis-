from sqlalchemy import Column, DateTime, Integer, String, Text, func

from backend.app.database import Base


class Artwork(Base):
    __tablename__ = "artworks"

    id = Column(Integer, primary_key=True, index=True)
    met_object_id = Column(Integer, unique=True, nullable=False, index=True)
    title = Column(String(500), nullable=False)
    artist = Column(String(255), nullable=False)
    year = Column(String(100))
    type = Column(String(255))
    museum = Column(String(255))
    image_file = Column(String(255), nullable=False)
    source_url = Column(String(500))
    description_tr = Column(Text)
    description_en = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())