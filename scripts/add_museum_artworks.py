"""Add artworks from another museum to the reference set.

Inputs:
    data/museum_import/wroclaw.csv      one row per artwork (see the columns below)
    data/museum_import/images/<file>    the image named in the "file" column
                                        (the file extension may be left out)

CSV columns:
    file, title, artist, year, type, source_url, description_en, description_tr

For every row the script
    - converts the image to a JPEG (longest side at most 1280 px)
      and saves it as data/images/<object_id>.jpg,
    - adds or updates the artwork in data/metadata/artworks.json.

Object ids for these artworks start at 900001 so that they never clash with
Met object ids. Running the script again updates existing entries
(matched by title and artist) and keeps their ids.

Usage (from the project root):
    python scripts/add_museum_artworks.py

Afterwards rebuild the embeddings and import the artworks:
    python scripts/build_embeddings.py
    python scripts/import_artworks.py
"""
import csv
import json
import sys
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]

IMPORT_DIR = ROOT / "data" / "museum_import"
CSV_FILE = IMPORT_DIR / "wroclaw.csv"
SOURCE_IMAGES_DIR = IMPORT_DIR / "images"
IMAGES_DIR = ROOT / "data" / "images"
METADATA_FILE = ROOT / "data" / "metadata" / "artworks.json"

MUSEUM = "National Museum in Wroc\u0142aw, Poland"
DEPARTMENT = "European and Polish Art"
LICENSE = (
    "Public domain work (artist died more than 70 years ago); "
    "image from the museum's online collection, used for research only"
)
FIRST_OBJECT_ID = 900001
MAX_SIDE = 1280
REQUIRED = ["file", "title", "artist", "year", "type", "source_url"]


def read_rows():
    with open(CSV_FILE, newline="", encoding="utf-8-sig") as handle:
        reader = csv.DictReader(handle)
        missing = [name for name in REQUIRED if name not in (reader.fieldnames or [])]
        if missing:
            sys.exit(f"Missing CSV columns: {missing}")
        rows = [row for row in reader if (row.get("file") or "").strip()]
    return rows


def find_image(name):
    """Return the image path for a CSV file name (the extension may be left out)."""
    exact = SOURCE_IMAGES_DIR / name
    if exact.is_file():
        return exact
    matches = [
        path for path in SOURCE_IMAGES_DIR.iterdir()
        if path.is_file() and path.stem.lower() == Path(name).stem.lower()
    ] if SOURCE_IMAGES_DIR.exists() else []
    return matches[0] if len(matches) == 1 else None


def save_jpeg(source, target):
    image = ImageOps.exif_transpose(Image.open(source)).convert("RGB")
    image.thumbnail((MAX_SIDE, MAX_SIDE))
    image.save(target, format="JPEG", quality=90)


def main():
    if not CSV_FILE.exists():
        sys.exit(f"Not found: {CSV_FILE}")

    records = json.loads(METADATA_FILE.read_text(encoding="utf-8"))
    own = {
        (r["title"].strip().lower(), r["artist"].strip().lower()): r
        for r in records
        if r["object_id"] >= FIRST_OBJECT_ID
    }
    next_id = max([r["object_id"] for r in records] + [FIRST_OBJECT_ID - 1]) + 1

    problems = []
    rows = read_rows()
    for row in rows:
        for name in REQUIRED:
            if not (row.get(name) or "").strip():
                problems.append(f"{row['file']}: column '{name}' is empty")
        if find_image(row["file"].strip()) is None:
            problems.append(f"{row['file']}: image not found in {SOURCE_IMAGES_DIR}")
    if problems:
        print("Fix these problems first:")
        for problem in problems:
            print("  -", problem)
        sys.exit(1)

    IMAGES_DIR.mkdir(parents=True, exist_ok=True)
    added = updated = 0
    for row in rows:
        title = row["title"].strip()
        artist = row["artist"].strip()
        key = (title.lower(), artist.lower())
        record = own.get(key)
        if record is None:
            record = {"object_id": next_id}
            records.append(record)
            own[key] = record
            next_id += 1
            added += 1
        else:
            updated += 1

        object_id = record["object_id"]
        save_jpeg(find_image(row["file"].strip()), IMAGES_DIR / f"{object_id}.jpg")
        record.update({
            "object_id": object_id,
            "title": title,
            "artist": artist,
            "year": row["year"].strip(),
            "type": row["type"].strip(),
            "museum": MUSEUM,
            "department": DEPARTMENT,
            "image_file": f"{object_id}.jpg",
            "source_url": row["source_url"].strip(),
            "license": LICENSE,
            "description_tr": (row.get("description_tr") or "").strip(),
            "description_en": (row.get("description_en") or "").strip(),
        })
        print(f"{object_id}  {artist} - {title}")

    METADATA_FILE.write_text(json.dumps(records, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\nAdded: {added}, updated: {updated}, artworks in file: {len(records)}")
    print("Next: python scripts/build_embeddings.py, then python scripts/import_artworks.py")


if __name__ == "__main__":
    main()
