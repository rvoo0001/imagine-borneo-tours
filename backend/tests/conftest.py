import os
import sys
import tempfile
from pathlib import Path

TEST_DIRECTORY = tempfile.TemporaryDirectory(prefix='ibt-api-tests-')
os.environ.update(DATABASE_URL=f'sqlite:///{Path(TEST_DIRECTORY.name) / "test.db"}', ADMIN_PASSWORD='local-test-password-only', SESSION_SECRET='isolated-test-session-secret-never-use-in-production', UPLOAD_DIR=str(Path(TEST_DIRECTORY.name) / 'uploads'))
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import pytest
from fastapi.testclient import TestClient
from main import app
from database import Base, engine
from routers.admin import attempts

@pytest.fixture
def client():
    Base.metadata.drop_all(engine)
    attempts.clear()
    with TestClient(app) as client:
        yield client

@pytest.fixture
def admin(client):
    response = client.post('/admin/login', json={'password': os.environ['ADMIN_PASSWORD']})
    assert response.status_code == 200
    assert 'HttpOnly' in response.headers['set-cookie']
    return client


def pytest_sessionfinish(session, exitstatus):
    engine.dispose()
    TEST_DIRECTORY.cleanup()
