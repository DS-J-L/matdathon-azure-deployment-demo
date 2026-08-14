# Backend

일정 데이터를 관리하는 FastAPI 백엔드입니다. 로컬에서는 메모리 저장소를
사용할 수 있고, `COSMOS_ENDPOINT`가 설정되면 Azure Cosmos DB for NoSQL을
데이터 원본으로 사용합니다.

## 로컬 실행

```powershell
python -m venv .venv
.\.venv\Scripts\python -m pip install -r requirements.txt
.\.venv\Scripts\python -m uvicorn app.main:app --reload
```

기본 API 주소는 `http://127.0.0.1:8000`이며 상태 확인 경로는
`GET /health`입니다.

## 구조

```text
backend/
├── app/
│   ├── core/       # 설정과 Application Insights 계측
│   ├── schedules/  # 일정 라우터, 스키마, 서비스, 저장소
│   └── main.py
└── tests/
```

실제 환경 변수 이름과 용도는 `.env.example`을 참고합니다. 비밀값과 연결
문자열은 저장소에 커밋하지 않습니다. Azure 운영 환경에서는 App Service의
관리 ID로 Cosmos DB에 접근합니다.
