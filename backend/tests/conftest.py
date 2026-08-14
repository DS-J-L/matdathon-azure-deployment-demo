import pytest
from fastapi.testclient import TestClient

from app.core.config import Settings
from app.main import create_app
from app.schedules.repository import MemoryScheduleRepository


@pytest.fixture
def repository() -> MemoryScheduleRepository:
    return MemoryScheduleRepository()


@pytest.fixture
def client(repository: MemoryScheduleRepository) -> TestClient:
    app = create_app(
        settings=Settings(app_env="test"),
        repository=repository,
    )
    with TestClient(app) as test_client:
        yield test_client
