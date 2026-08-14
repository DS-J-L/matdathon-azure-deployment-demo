import asyncio
from datetime import datetime, timezone
from unittest.mock import MagicMock, patch

from app.core.config import Settings
from app.schedules.repository import CosmosScheduleRepository
from app.schedules.schemas import Schedule


def test_cosmos_repository_uses_managed_identity_and_sdk() -> None:
    credential = MagicMock()
    container = MagicMock()
    client = MagicMock()
    client.get_database_client.return_value.get_container_client.return_value = container
    schedule = Schedule(
        id="schedule-1",
        title="Cosmos 일정",
        description="",
        startAt="2026-08-22T01:00:00Z",
        endAt="2026-08-22T02:00:00Z",
        category="team",
        status="scheduled",
        createdAt=datetime.now(timezone.utc),
    )
    container.create_item.return_value = schedule.model_dump(mode="json", by_alias=True)

    with (
        patch(
            "app.schedules.repository.ManagedIdentityCredential",
            return_value=credential,
        ) as managed_identity,
        patch("app.schedules.repository.CosmosClient", return_value=client),
    ):
        repository = CosmosScheduleRepository(
            Settings(
                app_env="production",
                cosmos_endpoint="https://example.documents.azure.com:443/",
            )
        )
        created = asyncio.run(repository.create(schedule))
        repository.close()

    managed_identity.assert_called_once_with()
    container.create_item.assert_called_once()
    assert created == schedule
    client.close.assert_called_once_with()
    credential.close.assert_called_once_with()
