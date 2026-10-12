"""Compute CLIP embeddings for all reference artwork images.

Outputs:
    data/embeddings/clip_vit_b32.npy      array of shape (n_artworks, 512)
    data/embeddings/artwork_index.json    Met object ids, in the same row order

Usage (from the project root):
    python scripts/build_embeddings.py
"""
import json
import sys
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from backend.app.services.embedding import MODEL_NAME, ClipEmbedder  # noqa: E402

METADATA_FILE = ROOT / "data" / "metadata" / "artworks.json"
IMAGES_DIR = ROOT / "data" / "images"
OUTPUT_DIR = ROOT / "data" / "embeddings"


def main():
    artworks = json.loads(METADATA_FILE.read_text(encoding="utf-8"))
    paths = [IMAGES_DIR / artwork["image_file"] for artwork in artworks]
    object_ids = [artwork["object_id"] for artwork in artworks]

    embedder = ClipEmbedder()
    print(f"Model: {MODEL_NAME}, device: {embedder.device}")

    embeddings = embedder.embed_paths(paths)
    print(f"Embeddings shape: {embeddings.shape}")

    norms = np.linalg.norm(embeddings, axis=1)
    print(f"Vector lengths (should be 1.0): min {norms.min():.4f}, max {norms.max():.4f}")

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    np.save(OUTPUT_DIR / "clip_vit_b32.npy", embeddings)
    (OUTPUT_DIR / "artwork_index.json").write_text(json.dumps(object_ids), encoding="utf-8")

    # Sanity check: each image must be most similar to itself.
    similarity = embeddings @ embeddings.T
    self_matches = int((similarity.argmax(axis=1) == np.arange(len(object_ids))).sum())
    print(f"Images whose best match is themselves: {self_matches} of {len(object_ids)}")

    # Show the most confusable pairs of different artworks (useful for error analysis later).
    np.fill_diagonal(similarity, -1.0)
    order = np.dstack(np.unravel_index(np.argsort(-similarity, axis=None), similarity.shape))[0]
    print("\nMost similar pairs of different artworks:")
    shown = 0
    for i, j in order:
        if i < j:
            print(f"  {similarity[i, j]:.3f}  {artworks[i]['title']}  <->  {artworks[j]['title']}")
            shown += 1
            if shown == 5:
                break

    print(f"\nSaved to {OUTPUT_DIR}")


if __name__ == "__main__":
    main()