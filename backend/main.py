from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles  # ✅ add this

from database import engine
import models
from routers import animals, tours, images, admin, contact

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Imagine Borneo Tours API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Static image serving
BASE_DIR = Path(__file__).resolve().parent
UPLOAD_DIR = BASE_DIR / "uploaded_images"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# ✅ This is the missing line
app.mount("/static/images", StaticFiles(directory=str(UPLOAD_DIR)), name="images")

# Routers
app.include_router(animals.router)
app.include_router(tours.router)
app.include_router(images.router)
app.include_router(admin.router)
app.include_router(contact.router)