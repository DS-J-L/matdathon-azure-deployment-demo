from __future__ import annotations

import asyncio
from typing import Protocol

from azure.cosmos import CosmosClient, exceptions
from azure.identity import DefaultAzureCredential, ManagedIdentityCredential

from app.core.config import Settings
from app.schedules.schemas import Schedule


class ScheduleRepositoryError(RuntimeError):
    pass


class ScheduleRepository(Protocol):
    async def list(self) -> list[Schedule]: ...

    async def get(self, schedule_id: str) -> Schedule | None: ...

    async def create(self, schedule: Schedule) -> Schedule: ...

    async def update(self, schedule: Schedule) -> Schedule: ...

    async def delete(self, schedule_id: str) -> bool: ...

    def close(self) -> None: ...


class MemoryScheduleRepository:
    def __init__(self, schedules: list[Schedule] | None = None) -> None:
        self._items = {
            schedule.id: schedule.model_copy(deep=True)
            for schedule in schedules or []
        }

    async def list(self) -> list[Schedule]:
        return [item.model_copy(deep=True) for item in self._items.values()]

    async def get(self, schedule_id: str) -> Schedule | None:
        schedule = self._items.get(schedule_id)
        return schedule.model_copy(deep=True) if schedule else None

    async def create(self, schedule: Schedule) -> Schedule:
        self._items[schedule.id] = schedule.model_copy(deep=True)
        return schedule.model_copy(deep=True)

    async def update(self, schedule: Schedule) -> Schedule:
        self._items[schedule.id] = schedule.model_copy(deep=True)
        return schedule.model_copy(deep=True)

    async def delete(self, schedule_id: str) -> bool:
        return self._items.pop(schedule_id, None) is not None

    def close(self) -> None:
        return None


class CosmosScheduleRepository:
    def __init__(self, settings: Settings) -> None:
        if not settings.cosmos_endpoint:
            raise ValueError("COSMOS_ENDPOINT가 필요합니다.")

        credential = (
            ManagedIdentityCredential()
            if settings.app_env == "production"
            else DefaultAzureCredential()
        )
        self._credential = credential
        self._client = CosmosClient(settings.cosmos_endpoint, credential=credential)
        database = self._client.get_database_client(settings.cosmos_database_name)
        self._container = database.get_container_client(
            settings.cosmos_container_name
        )

    @staticmethod
    def _to_document(schedule: Schedule) -> dict[str, object]:
        return schedule.model_dump(mode="json", by_alias=True)

    @staticmethod
    def _from_document(document: dict[str, object]) -> Schedule:
        document.pop("_rid", None)
        document.pop("_self", None)
        document.pop("_etag", None)
        document.pop("_attachments", None)
        document.pop("_ts", None)
        return Schedule.model_validate(document)

    async def list(self) -> list[Schedule]:
        try:
            documents = await asyncio.to_thread(
                lambda: list(
                    self._container.query_items(
                        query="SELECT * FROM c ORDER BY c.startAt ASC",
                        enable_cross_partition_query=True,
                    )
                )
            )
            return [self._from_document(document) for document in documents]
        except exceptions.CosmosHttpResponseError as exc:
            raise ScheduleRepositoryError("일정 목록을 읽지 못했습니다.") from exc

    async def get(self, schedule_id: str) -> Schedule | None:
        try:
            document = await asyncio.to_thread(
                self._container.read_item,
                item=schedule_id,
                partition_key=schedule_id,
            )
            return self._from_document(document)
        except exceptions.CosmosResourceNotFoundError:
            return None
        except exceptions.CosmosHttpResponseError as exc:
            raise ScheduleRepositoryError("일정을 읽지 못했습니다.") from exc

    async def create(self, schedule: Schedule) -> Schedule:
        try:
            document = await asyncio.to_thread(
                self._container.create_item,
                body=self._to_document(schedule),
            )
            return self._from_document(document)
        except exceptions.CosmosHttpResponseError as exc:
            raise ScheduleRepositoryError("일정을 저장하지 못했습니다.") from exc

    async def update(self, schedule: Schedule) -> Schedule:
        try:
            document = await asyncio.to_thread(
                self._container.replace_item,
                item=schedule.id,
                body=self._to_document(schedule),
            )
            return self._from_document(document)
        except exceptions.CosmosResourceNotFoundError:
            raise
        except exceptions.CosmosHttpResponseError as exc:
            raise ScheduleRepositoryError("일정을 수정하지 못했습니다.") from exc

    async def delete(self, schedule_id: str) -> bool:
        try:
            await asyncio.to_thread(
                self._container.delete_item,
                item=schedule_id,
                partition_key=schedule_id,
            )
            return True
        except exceptions.CosmosResourceNotFoundError:
            return False
        except exceptions.CosmosHttpResponseError as exc:
            raise ScheduleRepositoryError("일정을 삭제하지 못했습니다.") from exc

    def close(self) -> None:
        self._client.close()
        self._credential.close()


def build_repository(settings: Settings) -> ScheduleRepository:
    if settings.cosmos_endpoint:
        return CosmosScheduleRepository(settings)
    if settings.app_env == "production":
        raise RuntimeError("운영 환경에는 COSMOS_ENDPOINT가 필요합니다.")
    return MemoryScheduleRepository()
