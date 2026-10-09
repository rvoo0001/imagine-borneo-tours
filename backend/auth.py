from fastapi import HTTPException, Request
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired
from settings import SESSION_SECRET, SESSION_MAX_AGE, COOKIE_NAME, ALLOWED_ORIGINS

serializer = URLSafeTimedSerializer(SESSION_SECRET, salt="ibt-admin-v1")

def get_current_admin(request: Request):
    token = request.cookies.get(COOKIE_NAME)
    if not token:
        raise HTTPException(401, "Please sign in to continue.")
    try:
        payload = serializer.loads(token, max_age=SESSION_MAX_AGE)
        if payload.get("role") != "admin":
            raise BadSignature("Invalid role")
    except (BadSignature, SignatureExpired):
        raise HTTPException(401, "Your session expired. Please sign in again.")
    if request.method not in {"GET", "HEAD", "OPTIONS"}:
        origin = request.headers.get("origin")
        if origin and origin not in ALLOWED_ORIGINS:
            raise HTTPException(403, "Request origin is not allowed.")
    return payload
