from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from auth import ADMIN_PASSWORD, ADMIN_TOKEN

router = APIRouter(prefix="/admin", tags=["admin"])


class AdminLoginRequest(BaseModel):
    password: str


class AdminLoginResponse(BaseModel):
    token: str


@router.post("/login", response_model=AdminLoginResponse)
def admin_login(body: AdminLoginRequest):
    if body.password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid admin password")
    return AdminLoginResponse(token=ADMIN_TOKEN)