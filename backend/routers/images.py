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
from settings import UPLOAD_DIR
from uploads import save_image



@router.post("/upload", response_model=ImageRead)
async def upload_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    admin: None = Depends(get_current_admin),  # 🔒 admin-only
):
    unique_name = await save_image(file)

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

    if tour_links > 0 or animal_links > 0 or db.query(models.Tour).filter_by(cover_image_id=image_id).count() > 0:
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