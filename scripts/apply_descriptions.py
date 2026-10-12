"""Merge the written descriptions into artworks.json and create a verification checklist.

Inputs:
    data/metadata/artworks.json       (created by download_met.py)
    data/metadata/descriptions.json   (description_en, description_tr and facts to verify)

Outputs:
    data/metadata/artworks.json       (updated with the descriptions)
    documentation/description-verification.md

Usage (from the project root):
    python scripts/apply_descriptions.py
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ARTWORKS_FILE = ROOT / "data" / "metadata" / "artworks.json"
DESCRIPTIONS_FILE = ROOT / "data" / "metadata" / "descriptions.json"
REPORT_FILE = ROOT / "documentation" / "description-verification.md"


def main():
    artworks = json.loads(ARTWORKS_FILE.read_text(encoding="utf-8"))
    descriptions = json.loads(DESCRIPTIONS_FILE.read_text(encoding="utf-8"))

    missing = []
    report_lines = [
        "# Description Verification Checklist",
        "",
        "The descriptions were drafted with an AI assistant. Each one must be checked against the",
        "museum record (source link) and a reliable reference before it is used in the thesis.",
        "Tick every item after checking it. If something is wrong, fix the text in",
        "`data/metadata/descriptions.json`, then run `python scripts/apply_descriptions.py` and",
        "`python scripts/import_artworks.py` again.",
        "",
    ]

    for index, artwork in enumerate(artworks, start=1):
        entry = descriptions.get(str(artwork["object_id"]))
        if entry is None:
            missing.append(artwork["object_id"])
            continue

        artwork["description_en"] = entry["description_en"]
        artwork["description_tr"] = entry["description_tr"]

        report_lines.append(f"## {index}. {artwork['title']} - {artwork['artist']} ({artwork['year']})")
        report_lines.append(f"Source: {artwork['source_url']}")
        report_lines.append("")
        for fact in entry["verify"]:
            report_lines.append(f"- [ ] {fact}")
        report_lines.append("")

    ARTWORKS_FILE.write_text(json.dumps(artworks, ensure_ascii=False, indent=2), encoding="utf-8")
    REPORT_FILE.parent.mkdir(parents=True, exist_ok=True)
    REPORT_FILE.write_text("\n".join(report_lines), encoding="utf-8")

    print(f"Descriptions applied to {len(artworks) - len(missing)} of {len(artworks)} artworks")
    if missing:
        print(f"No description found for object ids: {missing}")
    print(f"Verification checklist written to {REPORT_FILE}")


if __name__ == "__main__":
    main()
