from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.exc import IntegrityError
from sqlalchemy import text
from database import engine
from settings import ALLOWED_ORIGINS, UPLOAD_DIR
import models
from routers import animals, tours, images, admin, contact, content

@asynccontextmanager
async def lifespan(app):
    models.Base.metadata.create_all(bind=engine)
    yield

app = FastAPI(title="Imagine Borneo Tours API", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=ALLOWED_ORIGINS, allow_credentials=True, allow_methods=["GET", "POST", "PATCH", "PUT", "DELETE"], allow_headers=["Content-Type", "Authorization"])
app.mount("/static/images", StaticFiles(directory=str(UPLOAD_DIR)), name="images")
for router in (animals.router, tours.router, images.router, admin.router, contact.router, content.router):
    app.include_router(router)

@app.exception_handler(IntegrityError)
async def integrity_error(request: Request, error: IntegrityError):
    return JSONResponse(status_code=409, content={"detail": "This name already exists or the record is still in use."})

@app.get("/health")
def health():
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))
    return {"status": "ok"}
