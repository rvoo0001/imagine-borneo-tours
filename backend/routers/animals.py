# routers/animals.py
from typing import List

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

import os
from uuid import uuid4
from pathlib import Path

import models
from database import get_db
from schemas import (
    AnimalCreate,
    AnimalRead,
    AnimalImageLinkBase,
    AnimalUpdate
)
from auth import get_current_admin

router = APIRouter(prefix="/animals", tags=["animals"])

from settings import UPLOAD_DIR
from uploads import save_image


# ---------- Animals ----------

@router.post("/", response_model=AnimalRead)
def create_animal(
    animal: AnimalCreate,
    db: Session = Depends(get_db),
    admin: None = Depends(get_current_admin),  # 🔒 admin-only
):
    db_animal = models.Animal(animal_name=animal.animal_name)
    db.add(db_animal)
    db.commit()
    db.refresh(db_animal)
    return db_animal


@router.get("/", response_model=List[AnimalRead])
def list_animals(
    name: str | None = None,
    db: Session = Depends(get_db),
):
    query = db.query(models.Animal)
    if name:
        query = query.filter(models.Animal.animal_name.ilike(f"%{name}%"))
    return query.all()


@router.get("/{animal_id}", response_model=AnimalRead)
def get_animal(animal_id: int, db: Session = Depends(get_db)):
    animal = db.query(models.Animal).filter_by(animal_id=animal_id).first()
    if not animal:
        raise HTTPException(status_code=404, detail="Animal not found")
    return animal


@router.delete("/{animal_id}")
def delete_animal(
    animal_id: int,
    db: Session = Depends(get_db),
    admin: None = Depends(get_current_admin),  # 🔒 admin-only
):
    animal = db.query(models.Animal).filter_by(animal_id=animal_id).first()
    if not animal:
        raise HTTPException(status_code=404, detail="Animal not found")

    links = db.query(models.TourAnimal).filter_by(animal_id=animal_id).count()
    if links > 0:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete animal that is used in one or more tours.",
        )

    db.delete(animal)
    db.commit()
    return {"detail": "Animal deleted"}

@router.patch("/{animal_id}", response_model=AnimalRead)
def update_animal(
    animal_id: int,
    payload: AnimalUpdate,
    db: Session = Depends(get_db),
    admin: None = Depends(get_current_admin),  # 🔒
):
    animal = db.query(models.Animal).filter_by(animal_id=animal_id).first()
    if not animal:
        raise HTTPException(status_code=404, detail="Animal not found")

    if payload.animal_name is not None:
        animal.animal_name = payload.animal_name

    db.commit()
    db.refresh(animal)
    return animal

@router.get("/by-name/{animal_name}", response_model=List[AnimalRead])
def get_animals_by_name(animal_name: str, db: Session = Depends(get_db)):
    # exact match (case-insensitive) - tweak if you want partial match
    return (
        db.query(models.Animal)
        .filter(models.Animal.animal_name.ilike(animal_name))
        .all()
    )



# ---------- Animal–Image relationship ----------

@router.post("/{animal_id}/images/", response_model=AnimalRead)
def add_images_to_animal(
    animal_id: int,
    images: List[AnimalImageLinkBase],
    db: Session = Depends(get_db),
    admin: None = Depends(get_current_admin),  # 🔒 admin-only
):
    animal = db.query(models.Animal).filter_by(animal_id=animal_id).first()
    if not animal:
        raise HTTPException(status_code=404, detail="Animal not found")

    for item in images:
        db_image = db.query(models.Image).filter_by(
            image_id=item.image_id
        ).first()
        if not db_image:
            raise HTTPException(
                status_code=404,
                detail=f"Image {item.image_id} not found",
            )

        link = db.query(models.AnimalImage).filter_by(
            animal_id=animal_id,
            image_id=item.image_id,
        ).first()

        if not link:
            link = models.AnimalImage(
                animal_id=animal_id,
                image_id=item.image_id,
            )
            db.add(link)

    db.commit()
    db.refresh(animal)
    return animal


@router.delete("/{animal_id}/images/{image_id}", response_model=AnimalRead)
def remove_image_from_animal(
    animal_id: int,
    image_id: int,
    db: Session = Depends(get_db),
    admin: None = Depends(get_current_admin),  # 🔒 admin-only
):
    animal = db.query(models.Animal).filter_by(animal_id=animal_id).first()
    if not animal:
        raise HTTPException(status_code=404, detail="Animal not found")

    link = db.query(models.AnimalImage).filter_by(
        animal_id=animal_id,
        image_id=image_id,
    ).first()

    if not link:
        raise HTTPException(
            status_code=404,
            detail="This image is not linked to the animal.",
        )

    db.delete(link)
    db.commit()
    db.refresh(animal)
    return animal

@router.post("/{animal_id}/images/upload", response_model=AnimalRead)
async def upload_image_to_animal(
    animal_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    admin: None = Depends(get_current_admin),  # 🔒
):
    animal = db.query(models.Animal).filter_by(animal_id=animal_id).first()
    if not animal:
        raise HTTPException(status_code=404, detail="Animal not found")

    unique_name = await save_image(file)

    image = models.Image(file_name=unique_name)
    db.add(image)
    db.flush()  # get image.image_id

    link = models.AnimalImage(
        animal_id=animal_id,
        image_id=image.image_id,
    )
    db.add(link)

    db.commit()
    db.refresh(animal)
    return animal