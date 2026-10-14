"""Evaluate artwork recognition on the test photos.

Inputs:
  data/test_photos/labels.csv          artwork photos with the true object_id
  data/test_photos/non_artworks/*.jpg  photos that contain no reference artwork

Outputs:
  documentation/test-results.md        summary tables for the thesis
  documentation/test-predictions.csv   one row per photo (prediction, score, correct)

Usage (from the project root):
    python scripts/evaluate.py
"""
import csv
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from backend.app.services.embedding import ClipEmbedder  # noqa: E402
from backend.app.services.recognition import ArtworkMatcher  # noqa: E402

PHOTOS_DIR = ROOT / "data" / "test_photos"
NON_ARTWORKS_DIR = PHOTOS_DIR / "non_artworks"
LABELS_FILE = PHOTOS_DIR / "labels.csv"
METADATA_FILE = ROOT / "data" / "metadata" / "artworks.json"
RESULTS_FILE = ROOT / "documentation" / "test-results.md"
PREDICTIONS_FILE = ROOT / "documentation" / "test-predictions.csv"
EXTENSIONS = {".jpg", ".jpeg"}
BATCH_SIZE = 8


def load_image(path):
    image = Image.open(path)
    image = ImageOps.exif_transpose(image)
    return image.convert("RGB")


def embed_files(embedder, paths):
    vectors = []
    for start in range(0, len(paths), BATCH_SIZE):
        batch = [load_image(path) for path in paths[start:start + BATCH_SIZE]]
        vectors.append(embedder.embed_images(batch))
    return np.concatenate(vectors, axis=0)


def read_labels():
    with open(LABELS_FILE, newline="", encoding="utf-8") as file:
        rows = [row for row in csv.DictReader(file) if row["object_id"].strip()]
    return [(row["filename"], row["object_id"].strip()) for row in rows]


def list_non_artworks():
    if not NON_ARTWORKS_DIR.exists():
        return []
    return sorted(
        path for path in NON_ARTWORKS_DIR.iterdir() if path.suffix.lower() in EXTENSIONS
    )


def choose_threshold(artwork_results, non_artwork_scores):
    """Pick the score threshold that gives the most correct decisions overall."""
    total = len(artwork_results) + len(non_artwork_scores)
    best_value, best_thresholds = -1.0, []
    for threshold in np.arange(0.50, 0.96, 0.01):
        accepted_correct = sum(1 for r in artwork_results if r["correct"] and r["score"] >= threshold)
        rejected = sum(1 for s in non_artwork_scores if s < threshold)
        value = (accepted_correct + rejected) / total
        if value > best_value + 1e-9:
            best_value, best_thresholds = value, [threshold]
        elif abs(value - best_value) <= 1e-9:
            best_thresholds.append(threshold)
    return float(np.median(best_thresholds)), best_value


def threshold_table(artwork_results, non_artwork_scores):
    lines = [
        "| Threshold | Artwork photos accepted | Accepted and correct | Non-artwork photos rejected |",
        "|---|---|---|---|",
    ]
    for threshold in np.arange(0.60, 0.951, 0.05):
        accepted = [r for r in artwork_results if r["score"] >= threshold]
        accepted_correct = [r for r in accepted if r["correct"]]
        rejected = [s for s in non_artwork_scores if s < threshold]
        lines.append(
            f"| {threshold:.2f} "
            f"| {len(accepted)}/{len(artwork_results)} "
            f"| {len(accepted_correct)}/{len(artwork_results)} "
            f"| {len(rejected)}/{len(non_artwork_scores)} |"
        )
    return lines


def main():
    artworks = json.loads(METADATA_FILE.read_text(encoding="utf-8"))
    by_id = {str(a["object_id"]): a for a in artworks}

    labeled = read_labels()
    non_artwork_paths = list_non_artworks()
    print(f"Artwork photos: {len(labeled)}, non-artwork photos: {len(non_artwork_paths)}")

    embedder = ClipEmbedder()
    matcher = ArtworkMatcher()

    artwork_paths = [PHOTOS_DIR / name for name, _ in labeled]
    artwork_vectors = embed_files(embedder, artwork_paths)

    artwork_results = []
    for (name, true_id), vector in zip(labeled, artwork_vectors):
        top = [(str(oid), score) for oid, score in matcher.top_k(vector, k=3)]
        artwork_results.append({
            "file": name,
            "true_id": true_id,
            "top": top,
            "score": top[0][1],
            "correct": top[0][0] == true_id,
            "in_top3": true_id in [oid for oid, _ in top],
        })

    non_artwork_scores = []
    non_artwork_rows = []
    if non_artwork_paths:
        vectors = embed_files(embedder, non_artwork_paths)
        for path, vector in zip(non_artwork_paths, vectors):
            oid, score = matcher.top_k(vector, k=1)[0]
            non_artwork_scores.append(score)
            non_artwork_rows.append((path.name, str(oid), score))

    n = len(artwork_results)
    top1 = sum(r["correct"] for r in artwork_results)
    top3 = sum(r["in_top3"] for r in artwork_results)
    wrong = [r for r in artwork_results if not r["correct"]]

    lines = ["# Test results", ""]
    lines.append("## Recognition accuracy (artwork photos)")
    lines.append("")
    lines.append(f"- Photos: {n}")
    lines.append(f"- Top-1 accuracy: {top1}/{n} = {top1 / n:.1%}")
    lines.append(f"- Top-3 accuracy: {top3}/{n} = {top3 / n:.1%}")
    correct_scores = [r["score"] for r in artwork_results if r["correct"]]
    if correct_scores:
        lines.append(
            f"- Top-1 score when correct: min {min(correct_scores):.3f}, "
            f"mean {np.mean(correct_scores):.3f}, max {max(correct_scores):.3f}"
        )
    lines.append("")

    lines.append("## Wrong top-1 predictions")
    lines.append("")
    if wrong:
        lines.append("| Photo | True artwork | Predicted artwork | Score | True artwork in top-3 |")
        lines.append("|---|---|---|---|---|")
        for r in wrong:
            predicted = by_id[r["top"][0][0]]["title"]
            lines.append(
                f"| {r['file']} | {by_id[r['true_id']]['title']} | {predicted} "
                f"| {r['score']:.3f} | {'yes' if r['in_top3'] else 'no'} |"
            )
    else:
        lines.append("None.")
    lines.append("")

    if non_artwork_scores:
        lines.append("## Non-artwork photos")
        lines.append("")
        lines.append(
            f"- Photos: {len(non_artwork_scores)}; top-1 score: min {min(non_artwork_scores):.3f}, "
            f"mean {np.mean(non_artwork_scores):.3f}, max {max(non_artwork_scores):.3f}"
        )
        lines.append("")
        lines.append("## Unknown threshold")
        lines.append("")
        lines.extend(threshold_table(artwork_results, non_artwork_scores))
        lines.append("")
        threshold, value = choose_threshold(artwork_results, non_artwork_scores)
        lines.append(
            f"Suggested threshold: {threshold:.2f} "
            f"(overall correct decisions: {value:.1%} of all test photos)."
        )
        lines.append("")

    RESULTS_FILE.parent.mkdir(exist_ok=True)
    RESULTS_FILE.write_text("\n".join(lines), encoding="utf-8")

    with open(PREDICTIONS_FILE, "w", newline="", encoding="utf-8") as file:
        writer = csv.writer(file)
        writer.writerow(["file", "kind", "true_id", "pred_1", "score_1", "pred_2", "pred_3", "correct"])
        for r in artwork_results:
            ids = [oid for oid, _ in r["top"]]
            writer.writerow([r["file"], "artwork", r["true_id"], ids[0], f"{r['score']:.4f}",
                             ids[1], ids[2], r["correct"]])
        for name, oid, score in non_artwork_rows:
            writer.writerow([name, "non_artwork", "", oid, f"{score:.4f}", "", "", ""])

    print("\n".join(lines))
    print(f"\nSaved {RESULTS_FILE}")
    print(f"Saved {PREDICTIONS_FILE}")


if __name__ == "__main__":
    main()