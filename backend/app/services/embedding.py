"""CLIP image embedding service.

Turns an image into a normalized vector (512 numbers for CLIP ViT-B/32).
Images that look similar get vectors that point in similar directions, so
the cosine similarity between two vectors measures how alike two images are.
"""
from pathlib import Path

import numpy as np
import torch
from PIL import Image
from transformers import CLIPImageProcessor, CLIPModel

MODEL_NAME = "openai/clip-vit-base-patch32"


class ClipEmbedder:
    def __init__(self, model_name=MODEL_NAME, device=None):
        self.device = device or ("cuda" if torch.cuda.is_available() else "cpu")
        self.processor = CLIPImageProcessor.from_pretrained(model_name)
        self.model = CLIPModel.from_pretrained(model_name).to(self.device).eval()

    @torch.no_grad()
    def embed_images(self, images):
        """Embed a list of PIL images. Returns an array of shape (n, 512)."""
        inputs = self.processor(images=images, return_tensors="pt")
        pixel_values = inputs["pixel_values"].to(self.device)
        pooled = self.model.vision_model(pixel_values=pixel_values).pooler_output
        features = self.model.visual_projection(pooled)
        features = torch.nn.functional.normalize(features, dim=-1)
        return features.cpu().numpy().astype(np.float32)

    def embed_paths(self, paths, batch_size=16):
        """Embed image files in batches. Returns an array of shape (n, 512)."""
        batches = []
        for start in range(0, len(paths), batch_size):
            images = []
            for path in paths[start:start + batch_size]:
                with Image.open(Path(path)) as image:
                    images.append(image.convert("RGB"))
            batches.append(self.embed_images(images))
        return np.concatenate(batches, axis=0)