from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import os


from dotenv import load_dotenv
from pathlib import Path

load_dotenv(Path(__file__).with_name(".env"))
ADMIN_PASSWORD = os.environ["ADMIN_PASSWORD"]
ADMIN_TOKEN = os.environ["ADMIN_TOKEN"]

security = HTTPBearer()


def get_current_admin(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> None:
    raw_token = credentials.credentials or ""

    # Be forgiving: strip spaces and an accidental "Bearer " prefix
    token = raw_token.strip()
    if token.startswith("Bearer "):
        token = token[len("Bearer "):].strip()

    if token != ADMIN_TOKEN:
        # temporary debug – you can remove these prints later
        raise HTTPException(status_code=401, detail="Not authorised as admin")
    
