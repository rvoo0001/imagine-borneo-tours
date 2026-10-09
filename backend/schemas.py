# schemas.py
from decimal import Decimal
from datetime import datetime
from typing import List

from pydantic import BaseModel, Field, ConfigDict


# ---------- Image Schemas ----------

class ImageBase(BaseModel):
    file_name: str


class ImageCreate(ImageBase):
    pass


class ImageRead(ImageBase):
    image_id: int
    url: str

    model_config = ConfigDict(from_attributes=True)


# ---------- Animal-Image Link Schemas ----------

class AnimalImageLinkBase(BaseModel):
    image_id: int


class AnimalImageLinkRead(AnimalImageLinkBase):
    image: ImageRead

    model_config = ConfigDict(from_attributes=True)


# ---------- Animal Schemas ----------

class AnimalBase(BaseModel):
    animal_name: str


class AnimalCreate(AnimalBase):
    pass


class AnimalRead(AnimalBase):
    animal_id: int
    images: List[AnimalImageLinkRead] = []

    model_config = ConfigDict(from_attributes=True)

class AnimalUpdate(BaseModel):
    animal_name: str | None = None


# ---------- Tour-Animal Link Schemas ----------

class TourAnimalLinkBase(BaseModel):
    animal_id: int
    sighting_probability: float = Field(
        ..., ge=0.0, le=1.0,
        description="0.0 to 1.0 (e.g. 0.8 = 80% chance)"
    )


class TourAnimalLinkRead(TourAnimalLinkBase):
    animal: AnimalRead

    model_config = ConfigDict(from_attributes=True)


# ---------- Tour-Image Link Schemas ----------

class TourImageLinkBase(BaseModel):
    image_id: int


class TourImageLinkRead(TourImageLinkBase):
    image: ImageRead

    model_config = ConfigDict(from_attributes=True)


# ---------- Tour Schemas ----------

class TourBase(BaseModel):
    tour_name: str
    tour_desc: str | None = None
    tour_price: Decimal = Field(..., description="Tour price in RM")


class TourCreate(TourBase):
    animals: List[TourAnimalLinkBase] = []


class TourRead(BaseModel):
    tour_id: int
    tour_name: str
    tour_desc: str | None
    tour_price: Decimal

    cover_image: ImageRead | None = None
    animals: list[TourAnimalLinkRead] = []
    images: list[TourImageLinkRead] = []

    model_config = ConfigDict(from_attributes=True)


class TourUpdate(BaseModel):
    tour_name: str | None = None
    tour_desc: str | None = None
    tour_price: Decimal | None = None


# ---------- Contact Messages ----------

class ContactMessageCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: str = Field(..., min_length=3, max_length=254)
    phone: str | None = Field(default=None, max_length=30)
    subject: str = Field(..., min_length=1, max_length=200)
    message: str = Field(..., min_length=10, max_length=5000)


class ContactMessageRead(ContactMessageCreate):
    message_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)