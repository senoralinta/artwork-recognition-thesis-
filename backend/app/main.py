from fastapi import FastAPI
from backend.app.database import engine, Base
from backend.app.models.user import User
from backend.app.routes import auth, users

# Create database tables automatically on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Artwork Recognition API")

# Include routes
app.include_router(auth.router)
app.include_router(users.router)


@app.get("/")
def home():
    return {"message": "Artwork Recognition API is running"}