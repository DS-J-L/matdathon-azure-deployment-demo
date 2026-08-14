from typing import Any

from fastapi.testclient import TestClient

from app.core.config import Settings
from app.main import create_app
from app.schedules.repository import ScheduleRepositoryError
from app.schedules.schemas import Schedule


def schedule_payload(
    *,
    title: str = " 팀 회의 ",
    start_at: str = "2026-08-22T01:00:00Z",
    end_at: str = "2026-08-22T02:00:00Z",
) -> dict[str, Any]:
    return {
        "title": title,
        "description": " 개발 진행 상황 공유 ",
        "startAt": start_at,
        "endAt": end_at,
        "category": "team",
        "status": "scheduled",
    }


def test_health(client: TestClient) -> None:
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_schedule_crud_and_sorting(client: TestClient) -> None:
    later = client.post(
        "/api/schedules",
        json=schedule_payload(
            title="나중 일정",
            start_at="2026-08-22T03:00:00Z",
            end_at="2026-08-22T04:00:00Z",
        ),
    )
    earlier = client.post("/api/schedules", json=schedule_payload())

    assert later.status_code == 201
    assert earlier.status_code == 201
    created = earlier.json()
    assert created["title"] == "팀 회의"
    assert created["description"] == "개발 진행 상황 공유"
    assert created["id"]
    assert created["createdAt"]

    listed = client.get("/api/schedules")
    assert listed.status_code == 200
    assert [item["title"] for item in listed.json()] == ["팀 회의", "나중 일정"]

    fetched = client.get(f"/api/schedules/{created['id']}")
    assert fetched.status_code == 200
    assert fetched.json() == created

    updated = client.put(
        f"/api/schedules/{created['id']}",
        json=schedule_payload(title="수정된 일정"),
    )
    assert updated.status_code == 200
    assert updated.json()["title"] == "수정된 일정"
    assert updated.json()["createdAt"] == created["createdAt"]

    deleted = client.delete(f"/api/schedules/{created['id']}")
    assert deleted.status_code == 204
    assert client.get(f"/api/schedules/{created['id']}").status_code == 404


def test_rejects_missing_title_and_invalid_date_range(client: TestClient) -> None:
    missing_title = schedule_payload()
    missing_title.pop("title")

    assert client.post("/api/schedules", json=missing_title).status_code == 422
    assert client.post(
        "/api/schedules",
        json=schedule_payload(
            start_at="2026-08-22T02:00:00Z",
            end_at="2026-08-22T01:00:00Z",
        ),
    ).status_code == 422


def test_returns_404_for_unknown_schedule(client: TestClient) -> None:
    assert client.get("/api/schedules/missing").status_code == 404
    assert client.put(
        "/api/schedules/missing", json=schedule_payload()
    ).status_code == 404
    assert client.delete("/api/schedules/missing").status_code == 404


class FailingRepository:
    async def list(self) -> list[Schedule]:
        raise ScheduleRepositoryError("데이터베이스를 사용할 수 없습니다.")

    async def get(self, schedule_id: str) -> Schedule | None:
        raise ScheduleRepositoryError("데이터베이스를 사용할 수 없습니다.")

    async def create(self, schedule: Schedule) -> Schedule:
        raise ScheduleRepositoryError("데이터베이스를 사용할 수 없습니다.")

    async def update(self, schedule: Schedule) -> Schedule:
        raise ScheduleRepositoryError("데이터베이스를 사용할 수 없습니다.")

    async def delete(self, schedule_id: str) -> bool:
        raise ScheduleRepositoryError("데이터베이스를 사용할 수 없습니다.")

    def close(self) -> None:
        return None


def test_returns_consistent_error_for_repository_failure() -> None:
    app = create_app(
        settings=Settings(app_env="test"),
        repository=FailingRepository(),
    )

    with TestClient(app) as client:
        response = client.get("/api/schedules")

    assert response.status_code == 503
    assert response.json() == {"detail": "데이터베이스를 사용할 수 없습니다."}
