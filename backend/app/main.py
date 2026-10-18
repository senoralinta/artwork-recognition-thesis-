from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from backend.app.database import engine, Base
from backend.app.models.user import User  # noqa: F401
from backend.app.models.artwork import Artwork  # noqa: F401
from backend.app.models.history import RecognitionHistory  # noqa: F401
from backend.app.routes import auth, daily, recognition, users
from backend.app.services.recognizer import get_service

IMAGES_DIR = Path(__file__).resolve().parents[2] / "data" / "images"

# Create database tables automatically on startup
Base.metadata.create_all(bind=engine)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load the CLIP model once at startup so the first request is not slow.
    get_service()
    yield


app = FastAPI(title="Artwork Recognition API", lifespan=lifespan)

# Reference artwork images (public domain) served to the mobile app
app.mount("/static/artworks", StaticFiles(directory=IMAGES_DIR), name="artwork-images")

# Include routes
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(recognition.router)
app.include_router(daily.router)


@app.get("/")
def home():
    return {"message": "Artwork Recognition API is running"}