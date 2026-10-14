"""Prepare the labeling files for the test photos.

Creates (or updates) two files:
  data/test_photos/labels.csv        one row per artwork photo, fill in object_id by hand
  documentation/artwork-list.md      list of all reference artworks with thumbnails

Layout of the test photo folder:
  data/test_photos/                  photos of artworks (jpg)
  data/test_photos/non_artworks/     photos of other objects (no label needed)

Usage (from the project root):
    python scripts/make_labels.py
"""
import csv
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PHOTOS_DIR = ROOT / "data" / "test_photos"
METADATA_FILE = ROOT / "data" / "metadata" / "artworks.json"
LABELS_FILE = PHOTOS_DIR / "labels.csv"
LIST_FILE = ROOT / "documentation" / "artwork-list.md"
EXTENSIONS = {".jpg", ".jpeg"}


def list_photos():
    return sorted(
        path.name
        for path in PHOTOS_DIR.iterdir()
        if path.is_file() and path.suffix.lower() in EXTENSIONS
    )


def read_existing_labels():
    if not LABELS_FILE.exists():
        return {}
    with open(LABELS_FILE, newline="", encoding="utf-8") as file:
        return {row["filename"]: row["object_id"] for row in csv.DictReader(file)}


def write_labels(photos, existing):
    with open(LABELS_FILE, "w", newline="", encoding="utf-8") as file:
        writer = csv.writer(file)
        writer.writerow(["filename", "object_id"])
        for name in photos:
            writer.writerow([name, existing.get(name, "")])


def write_artwork_list():
    artworks = json.loads(METADATA_FILE.read_text(encoding="utf-8"))
    lines = ["# Reference artworks", "", "Find the artwork in your photo and copy its ID.", ""]
    for artwork in artworks:
        object_id = artwork["object_id"]
        lines.append(f"## ID: {object_id}")
        lines.append(f"{artwork['title']} - {artwork['artist']}")
        lines.append("")
        lines.append(f'<img src="../data/images/{object_id}.jpg" width="220">')
        lines.append("")
    LIST_FILE.parent.mkdir(exist_ok=True)
    LIST_FILE.write_text("\n".join(lines), encoding="utf-8")


def main():
    PHOTOS_DIR.mkdir(parents=True, exist_ok=True)
    (PHOTOS_DIR / "non_artworks").mkdir(exist_ok=True)

    photos = list_photos()
    existing = read_existing_labels()
    write_labels(photos, existing)
    write_artwork_list()

    filled = sum(1 for name in photos if existing.get(name))
    non_artworks = [
        p for p in (PHOTOS_DIR / "non_artworks").iterdir() if p.suffix.lower() in EXTENSIONS
    ]
    print(f"Artwork photos: {len(photos)} (already labeled: {filled})")
    print(f"Non-artwork photos: {len(non_artworks)}")
    print(f"Labels file: {LABELS_FILE}")
    print(f"Artwork list: {LIST_FILE}")


if __name__ == "__main__":
    main()