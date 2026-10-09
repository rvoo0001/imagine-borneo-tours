from collections import defaultdict
from secrets import compare_digest, token_urlsafe
from time import monotonic
from fastapi import APIRouter, HTTPException, Request, Response, Depends
from pydantic import BaseModel, Field
from auth import serializer, get_current_admin
from settings import ADMIN_PASSWORD, COOKIE_NAME, SESSION_MAX_AGE, PRODUCTION, ALLOWED_ORIGINS

router = APIRouter(prefix="/admin", tags=["admin"])
attempts = defaultdict(list)

class AdminLoginRequest(BaseModel):
    password: str = Field(min_length=1, max_length=256)

@router.post("/login")
def admin_login(body: AdminLoginRequest, request: Request, response: Response):
    origin = request.headers.get("origin")
    if origin and origin not in ALLOWED_ORIGINS:
        raise HTTPException(403, "Request origin is not allowed.")
    address = request.client.host if request.client else "unknown"
    now = monotonic()
    attempts[address] = [item for item in attempts[address] if now - item < 300]
    if len(attempts[address]) >= 10:
        raise HTTPException(429, "Too many attempts. Try again in five minutes.")
    if not compare_digest(body.password.encode(), ADMIN_PASSWORD.encode()):
        attempts[address].append(now)
        raise HTTPException(401, "Invalid admin password")
    attempts.pop(address, None)
    token = serializer.dumps({"role": "admin", "nonce": token_urlsafe(16)})
    response.set_cookie(COOKIE_NAME, token, max_age=SESSION_MAX_AGE, httponly=True, secure=PRODUCTION, samesite="strict", path="/")
    response.headers["Cache-Control"] = "no-store"
    return {"authenticated": True}

@router.get("/session")
def session(response: Response, admin=Depends(get_current_admin)):
    response.headers["Cache-Control"] = "no-store"
    return {"authenticated": True}

@router.post("/logout")
def logout(response: Response, admin=Depends(get_current_admin)):
    response.delete_cookie(COOKIE_NAME, path="/", secure=PRODUCTION, httponly=True, samesite="strict")
    return {"authenticated": False}
