"""Validate and re-encode image uploads; never serve arbitrary uploaded bytes."""
import io
import warnings
from uuid import uuid4

from fastapi import HTTPException, UploadFile
from PIL import Image, UnidentifiedImageError
from settings import UPLOAD_DIR

MAX_BYTES = 10 * 1024 * 1024

async def save_image(file: UploadFile) -> str:
    raw = await file.read(MAX_BYTES + 1)
    if not raw or len(raw) > MAX_BYTES:
        raise HTTPException(400, 'Choose an image smaller than 10 MB.')
    try:
        with warnings.catch_warnings():
            warnings.simplefilter('error', Image.DecompressionBombWarning)
            with Image.open(io.BytesIO(raw)) as original:
                if original.format not in {'JPEG', 'PNG', 'WEBP'}:
                    raise ValueError('Unsupported image format')
                original.load()
                image = original.convert('RGB')
                image.thumbnail((2400, 2400))
                name = f'{uuid4().hex}.webp'
                image.save(UPLOAD_DIR / name, 'WEBP', quality=85)
                return name
    except (UnidentifiedImageError, ValueError, OSError, Image.DecompressionBombError, Image.DecompressionBombWarning):
        raise HTTPException(400, 'Upload a valid JPEG, PNG or WebP image.')
