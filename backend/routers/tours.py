# routers/tours.py
from typing import List

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlalchemy.orm import Session

import os
from uuid import uuid4
from pathlib import Path


from decimal import Decimal
from sqlalchemy import and_, func

import models
from database import get_db
from schemas import (
    TourCreate,
    TourRead,
    TourUpdate,
    TourAnimalLinkBase,
    TourImageLinkBase,
    TourAnimalLinkRead
)
from auth import get_current_admin

router = APIRouter(prefix="/tours", tags=["tours"])

BASE_DIR = Path(__file__).resolve().parent.parent
UPLOAD_DIR = BASE_DIR / "uploaded_images"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


# ---------- Tours ----------

@router.post("/", response_model=TourRead)
def create_tour(
    tour: TourCreate,
    db: Session = Depends(get_db),
    admin: None = Depends(get_current_admin),  # 🔒 admin-only
):
    db_tour = models.Tour(
        tour_name=tour.tour_name,
        tour_desc=tour.tour_desc,
        tour_price=tour.tour_price,
    )
    db.add(db_tour)
    db.flush()  # get tour_id before linking animals

    for item in tour.animals:
        db_animal = db.query(models.Animal).filter_by(
            animal_id=item.animal_id
        ).first()
        if not db_animal:
            raise HTTPException(
                status_code=404,
                detail=f"Animal {item.animal_id} not found",
            )

        link = models.TourAnimal(
            tour_id=db_tour.tour_id,
            animal_id=item.animal_id,
            sighting_probability=item.sighting_probability,
        )
        db.add(link)

    db.commit()
    db.refresh(db_tour)
    return db_tour


@router.get("/", response_model=List[TourRead])
def list_tours(
    name: str | None = None,
    min_price: Decimal | None = None,
    max_price: Decimal | None = None,

    # Accept BOTH query param styles:
    animal_id: List[int] = Query(default=[]),                 # animal_id=1&animal_id=2
    animal_id_brackets: List[int] = Query(default=[], alias="animal_id[]"),  # animal_id[]=1&animal_id[]=2

    db: Session = Depends(get_db),
):
    # Merge + de-duplicate
    animal_ids = list({*animal_id, *animal_id_brackets})

    q = db.query(models.Tour)

    if name:
        q = q.filter(models.Tour.tour_name.ilike(f"%{name}%"))

    if min_price is not None:
        q = q.filter(models.Tour.tour_price >= min_price)

    if max_price is not None:
        q = q.filter(models.Tour.tour_price <= max_price)

    if animal_ids:
        q = (
            q.join(models.TourAnimal)
            .filter(models.TourAnimal.animal_id.in_(animal_ids))
            .group_by(models.Tour.tour_id)
            .having(
                func.count(func.distinct(models.TourAnimal.animal_id))
                == len(set(animal_ids))
            )
        )

    return q.all()


@router.get("/{tour_id}", response_model=TourRead)
def get_tour(tour_id: int, db: Session = Depends(get_db)):
    tour = db.query(models.Tour).filter_by(tour_id=tour_id).first()
    if not tour:
        raise HTTPException(status_code=404, detail="Tour not found")
    return tour


@router.patch("/{tour_id}", response_model=TourRead)
def update_tour(
    tour_id: int,
    tour: TourUpdate,
    db: Session = Depends(get_db),
    admin: None = Depends(get_current_admin),  # 🔒 admin-only
):
    db_tour = db.query(models.Tour).filter_by(tour_id=tour_id).first()
    if not db_tour:
        raise HTTPException(status_code=404, detail="Tour not found")

    if tour.tour_name is not None:
        db_tour.tour_name = tour.tour_name
    if tour.tour_desc is not None:
        db_tour.tour_desc = tour.tour_desc
    if tour.tour_price is not None:
        db_tour.tour_price = tour.tour_price

    db.commit()
    db.refresh(db_tour)
    return db_tour


@router.delete("/{tour_id}")
def delete_tour(
    tour_id: int,
    db: Session = Depends(get_db),
    admin: None = Depends(get_current_admin),  # 🔒 admin-only
):
    tour = db.query(models.Tour).filter_by(tour_id=tour_id).first()
    if not tour:
        raise HTTPException(status_code=404, detail="Tour not found")

    db.query(models.TourAnimal).filter_by(tour_id=tour_id).delete()
    db.delete(tour)
    db.commit()
    return {"detail": "Tour deleted"}


# ---------- Tour–Animal relationship ----------

@router.post("/{tour_id}/animals/", response_model=TourRead)
def add_animals_to_tour(
    tour_id: int,
    animals: List[TourAnimalLinkBase],
    db: Session = Depends(get_db),
    admin: None = Depends(get_current_admin),  # 🔒 admin-only
):
    tour = db.query(models.Tour).filter_by(tour_id=tour_id).first()
    if not tour:
        raise HTTPException(status_code=404, detail="Tour not found")

    for item in animals:
        db_animal = db.query(models.Animal).filter_by(
            animal_id=item.animal_id
        ).first()
        if not db_animal:
            raise HTTPException(
                status_code=404,
                detail=f"Animal {item.animal_id} not found",
            )

        link = db.query(models.TourAnimal).filter_by(
            tour_id=tour_id,
            animal_id=item.animal_id,
        ).first()

        if link:
            link.sighting_probability = item.sighting_probability
        else:
            link = models.TourAnimal(
                tour_id=tour_id,
                animal_id=item.animal_id,
                sighting_probability=item.sighting_probability,
            )
            db.add(link)

    db.commit()
    db.refresh(tour)
    return tour

@router.get("/{tour_id}/animals", response_model=List[TourAnimalLinkRead])
def get_tour_animals(tour_id: int, db: Session = Depends(get_db)):
    tour = db.query(models.Tour).filter_by(tour_id=tour_id).first()
    if not tour:
        raise HTTPException(status_code=404, detail="Tour not found")

    # "animals" on Tour is your relationship to TourAnimal link objects
    return tour.animals


@router.delete("/{tour_id}/animals/{animal_id}", response_model=TourRead)
def remove_animal_from_tour(
    tour_id: int,
    animal_id: int,
    db: Session = Depends(get_db),
    admin: None = Depends(get_current_admin),  # 🔒 admin-only
):
    tour = db.query(models.Tour).filter_by(tour_id=tour_id).first()
    if not tour:
        raise HTTPException(status_code=404, detail="Tour not found")

    link = db.query(models.TourAnimal).filter_by(
        tour_id=tour_id,
        animal_id=animal_id,
    ).first()

    if not link:
        raise HTTPException(
            status_code=404,
            detail="This animal is not linked to the tour.",
        )

    db.delete(link)
    db.commit()
    db.refresh(tour)
    return tour


# ---------- Tour–Image relationship ----------

@router.post("/{tour_id}/images/", response_model=TourRead)
def add_images_to_tour(
    tour_id: int,
    images: List[TourImageLinkBase],
    db: Session = Depends(get_db),
    admin: None = Depends(get_current_admin),  # 🔒 admin-only
):
    tour = db.query(models.Tour).filter_by(tour_id=tour_id).first()
    if not tour:
        raise HTTPException(status_code=404, detail="Tour not found")

    for item in images:
        db_image = db.query(models.Image).filter_by(
            image_id=item.image_id
        ).first()
        if not db_image:
            raise HTTPException(
                status_code=404,
                detail=f"Image {item.image_id} not found",
            )

        link = db.query(models.TourImage).filter_by(
            tour_id=tour_id,
            image_id=item.image_id,
        ).first()

        if not link:
            link = models.TourImage(
                tour_id=tour_id,
                image_id=item.image_id,
            )
            db.add(link)

    db.commit()
    db.refresh(tour)
    return tour


@router.delete("/{tour_id}/images/{image_id}", response_model=TourRead)
def remove_image_from_tour(
    tour_id: int,
    image_id: int,
    db: Session = Depends(get_db),
    admin: None = Depends(get_current_admin),  # 🔒 admin-only
):
    tour = db.query(models.Tour).filter_by(tour_id=tour_id).first()
    if not tour:
        raise HTTPException(status_code=404, detail="Tour not found")

    link = db.query(models.TourImage).filter_by(
        tour_id=tour_id,
        image_id=image_id,
    ).first()

    if not link:
        raise HTTPException(
            status_code=404,
            detail="This image is not linked to the tour.",
        )

    db.delete(link)
    db.commit()
    db.refresh(tour)
    return tour

@router.patch("/{tour_id}/cover-image/{image_id}", response_model=TourRead)
def set_cover_image(
    tour_id: int,
    image_id: int,
    db: Session = Depends(get_db),
    admin: None = Depends(get_current_admin),
):
    tour = db.query(models.Tour).filter_by(tour_id=tour_id).first()
    if not tour:
        raise HTTPException(status_code=404, detail="Tour not found")

    image = db.query(models.Image).filter_by(image_id=image_id).first()
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")

    tour.cover_image_id = image_id
    db.commit()
    db.refresh(tour)
    return tour

@router.post("/{tour_id}/images/upload", response_model=TourRead)
async def upload_image_to_tour(
    tour_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    admin: None = Depends(get_current_admin),
):
    tour = db.query(models.Tour).filter_by(tour_id=tour_id).first()
    if not tour:
        raise HTTPException(status_code=404, detail="Tour not found")

    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")

    _, ext = os.path.splitext(file.filename)
    ext = ext.lower()

    if ext not in {".jpg", ".jpeg", ".png", ".webp"}:
        raise HTTPException(status_code=400, detail="Unsupported image format")

    unique_name = f"{uuid4().hex}{ext}"
    path = UPLOAD_DIR / unique_name

    content = await file.read()
    path.write_bytes(content)

    image = models.Image(file_name=unique_name)
    db.add(image)
    db.flush()

    link = models.TourImage(
        tour_id=tour_id,
        image_id=image.image_id,
    )
    db.add(link)

    # auto-set cover image if not set
    if tour.cover_image_id is None:
        tour.cover_image_id = image.image_id

    db.commit()
    db.refresh(tour)
    return tour