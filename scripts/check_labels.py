"""Create an HTML page that shows each test photo next to its labeled reference image.

Usage (from the project root):
    python scripts/check_labels.py
Then open documentation/label-check.html in a browser.
"""
import csv
import json
from pathlib import Path
from urllib.parse import quote

ROOT = Path(__file__).resolve().parents[1]
LABELS_FILE = ROOT / "data" / "test_photos" / "labels.csv"
METADATA_FILE = ROOT / "data" / "metadata" / "artworks.json"
OUTPUT_FILE = ROOT / "documentation" / "label-check.html"


def main():
    artworks = json.loads(METADATA_FILE.read_text(encoding="utf-8"))
    by_id = {str(artwork["object_id"]): artwork for artwork in artworks}

    with open(LABELS_FILE, newline="", encoding="utf-8") as file:
        rows = list(csv.DictReader(file))

    cards = []
    for row in rows:
        object_id = row["object_id"]
        artwork = by_id.get(object_id)
        title = f"{artwork['title']} - {artwork['artist']}" if artwork else "NO LABEL"
        photo_src = "../data/test_photos/" + quote(row["filename"])
        reference_src = f"../data/images/{object_id}.jpg" if artwork else ""
        cards.append(
            "<div class='card'>"
            f"<img src='{photo_src}'>"
            f"<img src='{reference_src}'>"
            f"<p><b>{object_id}</b><br>{title}</p>"
            "</div>"
        )

    html = (
        "<html><head><meta charset='utf-8'><title>Label check</title>"
        "<style>"
        "body{font-family:sans-serif;margin:16px}"
        ".card{display:inline-block;border:1px solid #888;margin:8px;padding:8px;width:440px;vertical-align:top}"
        "img{height:200px;margin-right:6px}"
        "</style></head><body>"
        "<h2>Left: your photo. Right: the reference image it was labeled with.</h2>"
        + "".join(cards)
        + "</body></html>"
    )
    OUTPUT_FILE.parent.mkdir(exist_ok=True)
    OUTPUT_FILE.write_text(html, encoding="utf-8")
    print(f"Wrote {OUTPUT_FILE} ({len(rows)} cards)")


if __name__ == "__main__":
    main()