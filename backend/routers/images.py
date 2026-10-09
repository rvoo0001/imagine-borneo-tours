# routers/images.py
from typing import List
import os
from uuid import uuid4
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

import models
from database import get_db
from schemas import ImageRead
from auth import get_current_admin

router = APIRouter(prefix="/images", tags=["images"])

# Where to store uploaded images (same as in main.py)
BASE_DIR = Path(__file__).resolve().parent.parent
UPLOAD_DIR = BASE_DIR / "uploaded_images"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


@router.post("/upload", response_model=ImageRead)
async def upload_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    admin: None = Depends(get_current_admin),  # 🔒 admin-only
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="Uploaded file has no filename.")

    original_name = file.filename
    _, ext = os.path.splitext(original_name)
    ext = ext.lower()
    allowed_exts = {".jpg", ".jpeg", ".png", ".webp"}
    if ext not in allowed_exts:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {ext}. Allowed: {', '.join(allowed_exts)}",
        )

    unique_name = f"{uuid4().hex}{ext}"
    save_path = UPLOAD_DIR / unique_name

    content = await file.read()
    with save_path.open("wb") as buffer:
        buffer.write(content)

    db_image = models.Image(file_name=unique_name)
    db.add(db_image)
    db.commit()
    db.refresh(db_image)

    # thanks to Image.url property and from_attributes, we can just return the ORM object
    return db_image


@router.get("/", response_model=List[ImageRead])
def list_images(db: Session = Depends(get_db)):
    images = db.query(models.Image).all()
    return images


@router.get("/{image_id}", response_model=ImageRead)
def get_image(image_id: int, db: Session = Depends(get_db)):
    img = db.query(models.Image).filter_by(image_id=image_id).first()
    if not img:
        raise HTTPException(status_code=404, detail="Image not found")
    return img

@router.delete("/{image_id}")
def delete_image(
    image_id: int,
    db: Session = Depends(get_db),
    admin: None = Depends(get_current_admin),  # 🔒
):
    img = db.query(models.Image).filter_by(image_id=image_id).first()
    if not img:
        raise HTTPException(status_code=404, detail="Image not found")

    # Check if linked anywhere
    tour_links = db.query(models.TourImage).filter_by(image_id=image_id).count()
    animal_links = db.query(models.AnimalImage).filter_by(image_id=image_id).count()

    if tour_links > 0 or animal_links > 0:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete image: it is still linked to a tour or animal. Remove links first.",
        )

    # Delete file from disk
    file_path = UPLOAD_DIR / img.file_name
    if file_path.exists():
        file_path.unlink()  # remove file

    # Delete DB row
    db.delete(img)
    db.commit()

    return {"detail": "Image deleted"}