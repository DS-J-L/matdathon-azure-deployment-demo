# Matdathon Azure Deployment Demo

GitHub Copilot을 활용해 일정 관리 애플리케이션을 개발하고 Azure Static Web Apps에 배포하는 데모 프로젝트입니다.

현재 프론트엔드는 React와 TypeScript로 구현되어 있으며 브라우저 `localStorage`에 일정 데이터를 저장합니다. 백엔드 디렉터리는 FastAPI 도입을 위한 자리만 마련되어 있고 API는 아직 구현되지 않았습니다.

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

Node.js와 npm이 설치된 환경에서 다음 명령을 실행합니다.

```bash
cd frontend
npm install
npm run dev
```

테스트와 프로덕션 빌드는 다음과 같이 실행합니다.

```bash
cd frontend
npm test
npm run build
```

## 백엔드 상태

`backend/`는 향후 FastAPI 애플리케이션을 추가하기 위한 기본 구조입니다. 백엔드 구현 전까지 프론트엔드는 별도의 API를 호출하지 않습니다.

## Azure 배포

루트의 `azure.yaml`은 `frontend/`를 Azure Static Web Apps 프로젝트로 지정합니다. 배포 전에 `frontend/`에서 프로덕션 빌드가 성공하는지 확인하세요.
