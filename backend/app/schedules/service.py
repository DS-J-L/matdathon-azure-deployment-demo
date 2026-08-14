from datetime import datetime, timezone
from uuid import uuid4

from app.schedules.repository import ScheduleRepository
from app.schedules.schemas import Schedule, ScheduleCreate, ScheduleUpdate


class ScheduleNotFoundError(LookupError):
    def __init__(self, schedule_id: str) -> None:
        super().__init__(f"일정 '{schedule_id}'을(를) 찾을 수 없습니다.")


class ScheduleService:
    def __init__(self, repository: ScheduleRepository) -> None:
        self._repository = repository

    async def list(self) -> list[Schedule]:
        schedules = await self._repository.list()
        return sorted(schedules, key=lambda schedule: schedule.start_at)

    async def get(self, schedule_id: str) -> Schedule:
        schedule = await self._repository.get(schedule_id)
        if schedule is None:
            raise ScheduleNotFoundError(schedule_id)
        return schedule

    async def create(self, data: ScheduleCreate) -> Schedule:
        schedule = Schedule(
            **data.model_dump(),
            id=str(uuid4()),
            created_at=datetime.now(timezone.utc),
        )
        return await self._repository.create(schedule)

    async def update(self, schedule_id: str, data: ScheduleUpdate) -> Schedule:
        current = await self.get(schedule_id)
        schedule = Schedule(
            **data.model_dump(),
            id=current.id,
            created_at=current.created_at,
        )
        return await self._repository.update(schedule)

    async def delete(self, schedule_id: str) -> None:
        if not await self._repository.delete(schedule_id):
            raise ScheduleNotFoundError(schedule_id)
