"""Find the artworks most similar to one image file.

Usage (from the project root):
    python scripts/query_image.py path/to/photo.jpg
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from backend.app.services.embedding import ClipEmbedder  # noqa: E402
from backend.app.services.recognition import ArtworkMatcher  # noqa: E402

METADATA_FILE = ROOT / "data" / "metadata" / "artworks.json"


def main():
    if len(sys.argv) != 2:
        raise SystemExit("Usage: python scripts/query_image.py path/to/photo.jpg")

    image_path = Path(sys.argv[1])
    artworks = json.loads(METADATA_FILE.read_text(encoding="utf-8"))
    by_id = {artwork["object_id"]: artwork for artwork in artworks}

    embedder = ClipEmbedder()
    matcher = ArtworkMatcher()

    query = embedder.embed_paths([image_path])[0]
    print(f"Query image: {image_path}\n")
    for rank, (object_id, score) in enumerate(matcher.top_k(query, k=3), start=1):
        artwork = by_id[object_id]
        print(f"{rank}. {score:.3f}  {artwork['title']} - {artwork['artist']}")


if __name__ == "__main__":
    main()