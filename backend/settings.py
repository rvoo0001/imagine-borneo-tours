"""Environment-only configuration shared by the API, migrations and tests."""
import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / '.env')
DATABASE_URL = os.getenv('DATABASE_URL', f'sqlite:///{BASE_DIR / "imagine_borneo.db"}')
ADMIN_PASSWORD = os.getenv('ADMIN_PASSWORD', '')
SESSION_SECRET = os.getenv('SESSION_SECRET', os.getenv('ADMIN_TOKEN', ''))
PRODUCTION = os.getenv('APP_ENV') == 'production'
if not ADMIN_PASSWORD or not SESSION_SECRET:
    raise RuntimeError('Set ADMIN_PASSWORD and SESSION_SECRET in backend/.env.')
if PRODUCTION and (len(ADMIN_PASSWORD) < 16 or len(SESSION_SECRET) < 32 or 'replace-with' in ADMIN_PASSWORD + SESSION_SECRET):
    raise RuntimeError('Production requires unique credentials: password >=16 and session secret >=32 characters.')
SESSION_MAX_AGE = 8 * 60 * 60
COOKIE_NAME = 'ibt_session'
UPLOAD_DIR = Path(os.getenv('UPLOAD_DIR', str(BASE_DIR / 'uploaded_images'))).resolve()
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
ALLOWED_ORIGINS = [value.strip() for value in os.getenv('ALLOWED_ORIGINS', 'http://localhost:3000,http://127.0.0.1:3000,http://localhost:4173,http://127.0.0.1:4173').split(',') if value.strip()]
