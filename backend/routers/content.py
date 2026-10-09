"""Public read / authenticated write content store with optimistic concurrency."""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field, field_validator
from sqlalchemy.orm import Session
from sqlalchemy import update
from database import get_db
from auth import get_current_admin
import models

router = APIRouter(prefix='/content', tags=['content'])

class ContentPayload(BaseModel):
    values: dict[str, str] = Field(default_factory=dict)
    version: int = Field(ge=0)

    @field_validator('values')
    @classmethod
    def validate_values(cls, values):
        if len(values) > 500:
            raise ValueError('Too many content fields.')
        for key, value in values.items():
            if len(key) > 120 or len(value) > 5000:
                raise ValueError('A content field is too long.')
            if key.endswith('_url') and value and not value.startswith(('/static/images/', '/imagine-borneo.png', 'https://')):
                raise ValueError('Image URLs must use HTTPS or an uploaded image.')
        return values

@router.get('/')
def read_content(db: Session = Depends(get_db)):
    row = db.get(models.SiteContent, 1)
    return {'values': row.values if row else {}, 'version': row.version if row else 0}

@router.put('/')
def save_content(payload: ContentPayload, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    row = db.get(models.SiteContent, 1)
    if row is None:
        if payload.version != 0:
            raise HTTPException(409, 'Content changed. Reload before saving.')
        row = models.SiteContent(content_id=1, values=payload.values, version=1)
        db.add(row)
    else:
        result = db.execute(update(models.SiteContent).where(models.SiteContent.content_id == 1, models.SiteContent.version == payload.version).values(values=payload.values, version=payload.version + 1))
        if result.rowcount != 1:
            raise HTTPException(409, 'Another editor saved changes. Reload before saving.')
    db.commit()
    return read_content(db)
