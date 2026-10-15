"""Recognition service: image -> CLIP embedding -> most similar reference artworks."""
import os
import threading

from backend.app.services.embedding import ClipEmbedder
from backend.app.services.recognition import ArtworkMatcher

# Minimum cosine similarity for a match to be accepted as a recognized artwork.
# Chosen from the test-photo evaluation (see documentation/test-results.md).
RECOGNITION_THRESHOLD = float(os.getenv("RECOGNITION_THRESHOLD", "0.70"))

_service = None
_service_lock = threading.Lock()


class RecognitionService:
    def __init__(self):
        self.embedder = ClipEmbedder()
        self.matcher = ArtworkMatcher()
        self._inference_lock = threading.Lock()

    def identify(self, image, k=3):
        """Return the k most similar reference artworks as (object_id, score) pairs."""
        with self._inference_lock:
            vector = self.embedder.embed_images([image])[0]
        return self.matcher.top_k(vector, k=k)


def get_service():
    global _service
    if _service is None:
        with _service_lock:
            if _service is None:
                _service = RecognitionService()
    return _service