"""Import artworks from data/metadata/artworks.json into the database.

The JSON file is the source of truth: running this script again updates
existing rows (matched by Met object id) and inserts missing ones.

Usage (from the project root):
    python scripts/import_artworks.py
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from backend.app.database import Base, SessionLocal, engine  # noqa: E402
from backend.app.models.artwork import Artwork  # noqa: E402

METADATA_FILE = ROOT / "data" / "metadata" / "artworks.json"
IMAGES_DIR = ROOT / "data" / "images"


def main():
    records = json.loads(METADATA_FILE.read_text(encoding="utf-8"))
    Base.metadata.create_all(bind=engine)

    created = 0
    updated = 0
    missing_images = []

    with SessionLocal() as session:
        for record in records:
            if not (IMAGES_DIR / record["image_file"]).exists():
                missing_images.append(record["image_file"])

            artwork = (
                session.query(Artwork)
                .filter(Artwork.met_object_id == record["object_id"])
                .first()
            )
            if artwork is None:
                artwork = Artwork(met_object_id=record["object_id"])
                session.add(artwork)
                created += 1
            else:
                updated += 1

            artwork.title = record["title"]
            artwork.artist = record["artist"]
            artwork.year = record["year"]
            artwork.type = record["type"]
            artwork.museum = record["museum"]
            artwork.image_file = record["image_file"]
            artwork.source_url = record["source_url"]
            artwork.description_tr = record.get("description_tr") or None
            artwork.description_en = record.get("description_en") or None

        session.commit()
        total = session.query(Artwork).count()

    print(f"Created: {created}, updated: {updated}, total in database: {total}")
    if missing_images:
        print(f"Warning: {len(missing_images)} image files not found: {missing_images[:5]}")


if __name__ == "__main__":
    main()