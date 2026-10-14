"""Fill data/test_photos/labels.csv with the ground-truth artwork IDs.

The IDs were assigned by visually comparing each photo with the reference
images (independent of the recognition model). File names are matched
without their extension.

Usage (from the project root):
    python scripts/make_labels.py
    python scripts/fill_labels.py
"""
import csv
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LABELS_FILE = ROOT / "data" / "test_photos" / "labels.csv"
METADATA_FILE = ROOT / "data" / "metadata" / "artworks.json"

PREFIX = "WhatsApp Image 2026-10-12 at "

LABELS = {
    "16.35.54 (1)": "435984",
    "16.35.54": "435984",
    "16.35.55 (1)": "436095",
    "16.35.55 (2)": "436101",
    "16.35.55": "436095",
    "16.35.56 (1)": "436244",
    "16.35.56 (2)": "436244",
    "16.35.56": "436101",
    "16.35.57 (1)": "436819",
    "16.35.57 (2)": "436896",
    "16.35.57 (3)": "436896",
    "16.35.57 (4)": "437153",
    "16.35.57 (5)": "437153",
    "16.35.57": "436819",
    "16.35.58 (1)": "437175",
    "16.35.58 (2)": "435600",
    "16.35.58 (3)": "435600",
    "16.35.58 (4)": "437879",
    "16.35.58 (5)": "437879",
    "16.35.58": "437175",
    "16.35.59 (1)": "438754",
    "16.35.59 (2)": "437926",
    "16.35.59 (3)": "437926",
    "16.35.59 (4)": "437881",
    "16.35.59": "438754",
    "16.36.00 (1)": "437609",
    "16.36.00 (2)": "437609",
    "16.36.00 (3)": "437397",
    "16.36.00 (4)": "437397",
    "16.36.00": "437881",
}


def main():
    artworks = json.loads(METADATA_FILE.read_text(encoding="utf-8"))
    known_ids = {str(artwork["object_id"]) for artwork in artworks}
    unknown = sorted({v for v in LABELS.values() if v not in known_ids})
    if unknown:
        raise SystemExit(f"IDs not found in artworks.json: {unknown}")

    by_stem = {PREFIX + key: value for key, value in LABELS.items()}

    with open(LABELS_FILE, newline="", encoding="utf-8") as file:
        rows = list(csv.DictReader(file))

    matched = 0
    for row in rows:
        stem = Path(row["filename"]).stem
        if stem in by_stem:
            row["object_id"] = by_stem[stem]
            matched += 1

    with open(LABELS_FILE, "w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=["filename", "object_id"])
        writer.writeheader()
        writer.writerows(rows)

    print(f"Rows in labels.csv: {len(rows)}")
    print(f"Rows labeled: {matched}")
    missing = [row["filename"] for row in rows if not row["object_id"]]
    if missing:
        print("Rows without a label:")
        for name in missing:
            print(f"  {name}")


if __name__ == "__main__":
    main()