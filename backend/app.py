from fastapi import FastAPI

app = FastAPI(title="Artwork Recognition API")

@app.get("/")
def read_root():
    return {"message": "Artwork Recognition Backend is running!"}