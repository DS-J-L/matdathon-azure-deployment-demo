# Matdathon Azure Deployment Demo

GitHub Copilot을 활용해 일정 관리 애플리케이션을 개발하고 Azure에 배포하는 데모 프로젝트입니다.

프론트엔드는 React와 TypeScript로 구현되어 있으며 FastAPI 일정 API를
호출합니다. 백엔드는 로컬 개발에서 메모리 저장소를 사용하고 Azure에서는
관리 ID로 Cosmos DB for NoSQL에 접근합니다. 기존 브라우저
`matdathon-schedules` 데이터는 API가 비어 있을 때 한 번 이전됩니다.

## 디렉터리 구조

```text
.
├── .github/
│   └── copilot-instructions.md
├── backend/
│   ├── app/
│   └── tests/
├── frontend/
│   ├── src/
│   ├── index.html
│   ├── package.json
│   ├── staticwebapp.config.json
│   └── vite.config.ts
├── azure.yaml
└── README.md
```

## 프론트엔드 실행

먼저 백엔드를 실행한 뒤 Node.js와 npm이 설치된 환경에서 다음 명령을
실행합니다.

```bash
cd frontend
npm install
npm run dev
```

기본 API 주소는 `http://localhost:8000`입니다. 다른 주소를 사용하려면
`frontend/.env.example`을 참고해 `VITE_API_BASE_URL`을 설정합니다.

테스트와 프로덕션 빌드는 다음과 같이 실행합니다.

```bash
cd frontend
npm test
npm run build
```

## 백엔드 실행

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\python -m pip install -r requirements.txt
.\.venv\Scripts\python -m uvicorn app.main:app --reload
```

백엔드 테스트는 다음과 같이 실행합니다.

```powershell
cd backend
.\.venv\Scripts\python -m pytest -q
```

일정 API는 `/api/schedules`, 상태 확인 API는 `/health`입니다. 실제 환경
변수는 커밋하지 않으며 `backend/.env.example`에는 이름과 용도만
기록합니다.

## Azure 배포

목표 아키텍처는 Azure Static Web Apps, Azure App Service, Azure Cosmos DB,
Azure Key Vault, Application Insights입니다. 현재 루트의 `azure.yaml`에는
기존 Static Web Apps 서비스만 정의되어 있습니다. 인프라 준비와 배포는
`.azure/deployment-plan.md` 승인 후
`azure-prepare → azure-validate → azure-deploy` 순서로 진행합니다.
