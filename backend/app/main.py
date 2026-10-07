from fastapi import FastAPI
from backend.app.database import engine, Base
from backend.app.models.user import User
from backend.app.routes import auth

# Create database tables automatically on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Artwork Recognition API")

# Include Authentication Routes
app.include_router(auth.router)

@app.get("/")
def home():
    return {"message": "Artwork Recognition API is running"}