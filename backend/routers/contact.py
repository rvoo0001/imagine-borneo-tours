from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

import models
from database import get_db
from schemas import ContactMessageCreate, ContactMessageRead

router = APIRouter(prefix="/contact", tags=["contact"])


@router.post("/messages", response_model=ContactMessageRead, status_code=201)
def create_contact_message(
    payload: ContactMessageCreate,
    db: Session = Depends(get_db),
):
    message = models.ContactMessage(
        name=payload.name.strip(),
        email=payload.email.strip(),
        phone=payload.phone.strip() if payload.phone else None,
        subject=payload.subject.strip(),
        message=payload.message.strip(),
    )

    if not message.name or not message.email or not message.subject or len(message.message) < 10:
        raise HTTPException(status_code=422, detail="Please complete all required fields.")

    try:
        db.add(message)
        db.commit()
        db.refresh(message)
        return message
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=503, detail="Messages are temporarily unavailable.")