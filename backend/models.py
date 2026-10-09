from __future__ import annotations

from datetime import datetime
from decimal import Decimal

from sqlalchemy import DateTime, String, Text, Float, Numeric, ForeignKey, Integer, func
from sqlalchemy.orm import relationship, Mapped, mapped_column

from database import Base


class Animal(Base):
    __tablename__ = "animals"

    animal_id: Mapped[int] = mapped_column(primary_key=True, index=True)
    animal_name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)

    tours: Mapped[list["TourAnimal"]] = relationship(back_populates="animal")
    images: Mapped[list["AnimalImage"]] = relationship(back_populates="animal")


class Tour(Base):
    __tablename__ = "tours"

    tour_id: Mapped[int] = mapped_column(primary_key=True, index=True)
    tour_name: Mapped[str] = mapped_column(String(200), nullable=False)
    tour_desc: Mapped[str | None] = mapped_column(Text, nullable=True)
    tour_price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)

    cover_image_id: Mapped[int | None] = mapped_column(
        ForeignKey("images.image_id"),
        nullable=True,
    )

    cover_image: Mapped["Image"] = relationship(foreign_keys=[cover_image_id])

    animals: Mapped[list["TourAnimal"]] = relationship(back_populates="tour")
    images: Mapped[list["TourImage"]] = relationship(back_populates="tour")


class TourAnimal(Base):
    __tablename__ = "tour_animals"

    tour_id: Mapped[int] = mapped_column(
        ForeignKey("tours.tour_id"), primary_key=True
    )
    animal_id: Mapped[int] = mapped_column(
        ForeignKey("animals.animal_id"), primary_key=True
    )
    sighting_probability: Mapped[float] = mapped_column(Float, nullable=False)

    tour: Mapped["Tour"] = relationship(back_populates="animals")
    animal: Mapped["Animal"] = relationship(back_populates="tours")


class Image(Base):
    __tablename__ = "images"

    image_id: Mapped[int] = mapped_column(primary_key=True, index=True)
    file_name: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)

    tour_links: Mapped[list["TourImage"]] = relationship(back_populates="image")
    animal_links: Mapped[list["AnimalImage"]] = relationship(back_populates="image")

    @property
    def url(self) -> str:
        # keep this in sync with where you mounted StaticFiles
        return f"/static/images/{self.file_name}"
        # or "/images/..." if that's what you're using


class TourImage(Base):
    __tablename__ = "tour_images"

    tour_id: Mapped[int] = mapped_column(
        ForeignKey("tours.tour_id"), primary_key=True
    )
    image_id: Mapped[int] = mapped_column(
        ForeignKey("images.image_id"), primary_key=True
    )

    tour: Mapped["Tour"] = relationship(back_populates="images")
    image: Mapped["Image"] = relationship(back_populates="tour_links")


class AnimalImage(Base):
    __tablename__ = "animal_images"

    animal_id: Mapped[int] = mapped_column(
        ForeignKey("animals.animal_id"), primary_key=True
    )
    image_id: Mapped[int] = mapped_column(
        ForeignKey("images.image_id"), primary_key=True
    )

    animal: Mapped["Animal"] = relationship(back_populates="images")
    image: Mapped["Image"] = relationship(back_populates="animal_links")


class ContactMessage(Base):
    __tablename__ = "contact_messages"

    message_id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(254), nullable=False)
    phone: Mapped[str | None] = mapped_column(String(30), nullable=True)
    subject: Mapped[str] = mapped_column(String(200), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )