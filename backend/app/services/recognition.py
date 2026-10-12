"""Match an image embedding against the reference artwork embeddings."""
import json
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[3]
EMBEDDINGS_FILE = ROOT / "data" / "embeddings" / "clip_vit_b32.npy"
INDEX_FILE = ROOT / "data" / "embeddings" / "artwork_index.json"


class ArtworkMatcher:
    """Finds the reference artworks that are most similar to a query embedding."""

    def __init__(self, embeddings_file=EMBEDDINGS_FILE, index_file=INDEX_FILE):
        self.embeddings = np.load(embeddings_file)
        self.object_ids = json.loads(Path(index_file).read_text(encoding="utf-8"))
        if len(self.object_ids) != len(self.embeddings):
            raise ValueError("Embedding file and artwork index have different lengths")

    def top_k(self, query_embedding, k=3):
        # Vectors are L2-normalized, so the dot product equals cosine similarity.
        scores = self.embeddings @ query_embedding
        best = np.argsort(-scores)[:k]
        return [(self.object_ids[i], float(scores[i])) for i in best]