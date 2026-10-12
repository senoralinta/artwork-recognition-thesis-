"""Download public-domain paintings from The Metropolitan Museum of Art.

Source: The Met Open Access collection API (CC0 license, no API key required).

Usage (from the project root):
    python scripts/download_met.py
"""
import json
import time
import urllib.parse
import urllib.request
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
IMAGES_DIR = ROOT / "data" / "images"
METADATA_DIR = ROOT / "data" / "metadata"

BASE_URL = "https://collectionapi.metmuseum.org/public/collection"
DEPARTMENT_ID = 11  # European Paintings
TARGET_COUNT = 60  # number of artworks to collect
MAX_PER_ARTIST = 2  # limit per artist to keep the dataset diverse
REQUEST_DELAY_SECONDS = 0.15  # stay well below the API rate limit
HEADERS = {"User-Agent": "artwork-recognition-thesis/1.0 (student project)"}


def get_json(url):
    request = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(request, timeout=30) as response:
        return json.loads(response.read().decode("utf-8"))


def download_file(url, destination):
    request = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(request, timeout=60) as response:
        destination.write_bytes(response.read())


def prepare_folders():
    for folder in (IMAGES_DIR, METADATA_DIR):
        # An empty placeholder file with the same name may exist; replace it with a folder.
        if folder.is_file():
            if folder.stat().st_size == 0:
                folder.unlink()
            else:
                raise SystemExit(f"{folder} is a non-empty file but must be a folder. Remove it manually.")
        folder.mkdir(parents=True, exist_ok=True)


def search_object_ids():
    object_ids = []
    for offset in (0, 100):
        params = urllib.parse.urlencode({
            "q": "painting",
            "departmentId": DEPARTMENT_ID,
            "hasImages": "true",
            "isHighlight": "true",
            "limit": 100,
            "offset": offset,
        })
        data = get_json(f"{BASE_URL}/v1.1/search?{params}")
        batch = data.get("objectIDs") or []
        object_ids.extend(batch)
        if len(batch) < 100:
            break
    return object_ids


def main():
    prepare_folders()
    object_ids = search_object_ids()
    print(f"Candidate artworks found: {len(object_ids)}")

    records = []
    artist_counts = Counter()

    for object_id in object_ids:
        if len(records) >= TARGET_COUNT:
            break
        try:
            artwork = get_json(f"{BASE_URL}/v1/objects/{object_id}")
            time.sleep(REQUEST_DELAY_SECONDS)

            # Keep only public-domain paintings that have an image.
            if not artwork.get("isPublicDomain") or not artwork.get("primaryImageSmall"):
                continue
            if "Painting" not in (artwork.get("classification") or ""):
                continue

            artist = artwork.get("artistDisplayName") or "Unknown"
            if artist_counts[artist] >= MAX_PER_ARTIST:
                continue

            image_file = f"{object_id}.jpg"
            image_path = IMAGES_DIR / image_file
            if not image_path.exists():
                download_file(artwork["primaryImageSmall"], image_path)

            artist_counts[artist] += 1
            records.append({
                "object_id": object_id,
                "title": artwork.get("title"),
                "artist": artist,
                "year": artwork.get("objectDate"),
                "type": artwork.get("medium"),
                "museum": "The Metropolitan Museum of Art, New York",
                "department": artwork.get("department"),
                "image_file": image_file,
                "source_url": artwork.get("objectURL"),
                "license": "CC0 (The Met Open Access)",
                "description_tr": "",
                "description_en": "",
            })
            print(f"[{len(records):02d}/{TARGET_COUNT}] {artist} - {artwork.get('title')}")
        except Exception as error:
            # A single failing artwork should not stop the whole download.
            print(f"Skipped {object_id}: {error}")

    output_file = METADATA_DIR / "artworks.json"
    output_file.write_text(json.dumps(records, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\nDone: {len(records)} artworks saved to {output_file}")


if __name__ == "__main__":
    main()