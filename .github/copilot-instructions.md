# GitHub Copilot 작업 지침

이 저장소에서 코드를 생성하거나 수정할 때 아래 규칙을 따른다. 작업을 시작하기 전에 관련 코드와 테스트를 읽고, 요청 범위 안에서 가장 작은 변경으로 문제를 해결한다.

## 1. 프로젝트 개요

이 프로젝트는 일정 관리 애플리케이션을 개발하고 Azure에 배포하기 위한 모노레포이다.

- `frontend/`: React 18, TypeScript, Vite 기반 SPA
- `backend/`: FastAPI 백엔드를 위한 영역
- `.github/`: GitHub 및 Copilot 설정
- `azure.yaml`: Azure Developer CLI 배포 설정

현재 프론트엔드는 구현되어 있으며 일정 데이터를 브라우저 `localStorage`에 저장한다. 백엔드는 기본 디렉터리만 준비된 상태이므로, 구현되지 않은 API나 인증 기능이 이미 존재한다고 가정하지 않는다.

## 2. 기본 작업 원칙

- 사용자의 요청과 직접 관련된 파일만 수정한다.
- 기존 사용자 변경 사항과 관련 없는 코드를 삭제하거나 되돌리지 않는다.
- 새 파일이나 추상화를 만들기 전에 기존 타입, 함수, 컴포넌트를 재사용할 수 있는지 확인한다.
- 프론트엔드와 백엔드의 책임을 분리하고 한쪽의 구현 세부사항을 다른 쪽에 중복 작성하지 않는다.
- 파일은 UTF-8로 저장하고 사용자에게 표시되는 문구는 자연스러운 한국어로 작성한다.
- 비밀값, 토큰, 연결 문자열, 개인 정보는 코드나 저장소에 커밋하지 않는다.
- 임시 로그, 주석 처리된 코드, 사용하지 않는 import를 남기지 않는다.
- 기능을 변경하면 관련 테스트와 문서도 함께 갱신한다.

## 3. 디렉터리별 책임

### 프론트엔드

- `frontend/src/App.tsx`: 주요 화면, 앱 상태, 일정 CRUD 사용자 흐름
- `frontend/src/types.ts`: 일정과 폼에서 공유하는 TypeScript 타입
- `frontend/src/lib/storage.ts`: `localStorage` 읽기와 쓰기
- `frontend/src/lib/eventSchedule.ts`: 행사 기본 일정과 날짜 표시 유틸리티
- `frontend/src/styles.css`: 공통 화면 스타일
- `frontend/src/App.test.tsx`: 주요 사용자 흐름 테스트
- `frontend/src/test/`: 테스트 공통 설정

기능이 커져 `App.tsx`를 분리할 필요가 있을 때는 다음 구조를 우선한다.

```text
frontend/src/
├── components/        # 여러 기능에서 재사용하는 UI
├── features/
│   └── schedules/     # 일정 관련 컴포넌트, 훅, 유틸리티
├── lib/               # 저장소, 날짜 처리 등 공통 로직
├── test/              # 테스트 설정과 공통 도구
└── types.ts           # 현재 공통 타입 진입점
```

작은 변경을 위해 불필요하게 전체 구조를 재편하지 않는다.

### 백엔드

- `backend/app/`: FastAPI 애플리케이션 코드
- `backend/tests/`: 단위 테스트와 API 통합 테스트

백엔드 구현을 시작할 때는 도메인별로 다음과 같이 분리한다.

```text
backend/
├── app/
│   ├── main.py
│   ├── core/          # 설정, 공통 예외, 보안
│   ├── schedules/     # 일정 라우터, 스키마, 서비스, 저장소
│   ├── users/         # 사용자 기능
│   └── notifications/ # 알림 기능
└── tests/
```

라우터에서 데이터 접근과 비즈니스 로직을 직접 처리하지 말고 서비스 또는 저장소 계층으로 분리한다. 단, 실제 요구가 단순한 초기 단계에서는 사용되지 않는 계층을 미리 만들지 않는다.

## 4. 일정 데이터 규칙

프론트엔드의 `Schedule` 타입을 현재 일정 데이터 형식의 기준으로 사용한다.

```ts
interface Schedule {
  id: string;
  title: string;
  description: string;
  startAt: string;
  endAt: string;
  category: 'official' | 'team' | 'deadline' | 'personal';
  status: 'scheduled' | 'completed';
  createdAt: string;
}
```

- 새 일정 ID는 프론트엔드 로컬 저장 방식에서는 `crypto.randomUUID()`로 생성한다.
- `title`은 필수이며 저장 전에 앞뒤 공백을 제거한다.
- `description`은 선택값이며 저장 전에 앞뒤 공백을 제거한다.
- `startAt`, `endAt`, `createdAt`은 ISO 8601 문자열로 저장하고 전달한다.
- 일반 일정의 `endAt`은 `startAt`보다 늦어야 한다.
- 일정 목록은 별도 요구가 없으면 `startAt` 오름차순으로 정렬한다.
- 카테고리나 상태 값을 추가할 때는 타입, 폼, 표시 문구, 색상, 초기 데이터, 테스트를 함께 갱신한다.
- 기존 `localStorage` 키인 `matdathon-schedules`는 데이터 호환성을 위해 임의로 변경하지 않는다.
- 저장 형식을 변경할 때는 기존 브라우저 데이터에 대한 마이그레이션 또는 안전한 기본값 처리를 제공한다.

## 5. 날짜와 시간 규칙

- 화면 입력은 사용자의 로컬 시간으로 처리하고 저장 또는 API 전송 시 ISO 8601 문자열로 변환한다.
- 날짜 계산과 표시는 직접 구현하기보다 기존 의존성인 date-fns를 사용한다.
- UTC 변환으로 날짜가 하루 앞뒤로 달라질 수 있으므로 날짜 전용 값과 날짜·시간 값을 구분한다.
- 월간 캘린더는 현재 구현처럼 월요일을 한 주의 시작으로 사용한다.
- 현재 시각에 따라 달라지는 테스트는 시스템 시간에 의존하지 않도록 시간을 고정한다.

## 6. 프론트엔드 구현 규칙

- 함수형 컴포넌트와 React 훅을 사용한다.
- TypeScript의 `strict` 설정을 유지한다.
- `any`, `@ts-ignore`, 불필요한 타입 단언으로 타입 오류를 우회하지 않는다.
- 상태 객체나 배열을 직접 변경하지 말고 불변성을 유지한다.
- 계산된 값은 우선 렌더링 과정에서 구하고, 계산 비용이 크거나 참조 안정성이 필요할 때만 `useMemo`를 사용한다.
- 목록의 `key`에는 배열 인덱스가 아닌 안정적인 고유 ID를 사용한다.
- 폼 제출 전 필수값과 시작·종료 시각을 검증한다.
- 검증 실패 시 저장하거나 모달을 닫지 않고 해당 입력 가까이에 구체적인 오류를 표시한다.
- 아이콘만 있는 버튼에는 `aria-label` 등 접근 가능한 이름을 제공한다.
- 입력 요소는 `label`과 연결하고 키보드로 모든 주요 기능을 사용할 수 있게 한다.
- 기존 CSS 클래스와 디자인을 우선 재사용하며, 동적 색상 외에는 인라인 스타일을 남용하지 않는다.
- 모바일과 데스크톱 화면에서 긴 제목, 빈 목록, 많은 일정이 레이아웃을 깨뜨리지 않는지 확인한다.

## 7. 저장소 처리 규칙

- 일정 변경 후 React 상태와 `localStorage`를 함께 갱신한다.
- `window`를 사용할 때는 테스트나 서버 환경에서도 안전한지 확인한다.
- 저장된 JSON이 없거나 파싱할 수 없으면 기본 일정으로 복구한다.
- 오류를 무조건 숨기지 말고 사용자에게 미치는 영향과 복구 방법을 고려한다.
- 백엔드 연동이 추가되면 컴포넌트에서 `fetch`를 반복 호출하지 말고 API 클라이언트 또는 저장소 모듈로 분리한다.
- 백엔드 전환 기간에는 `localStorage`와 API 중 어느 쪽이 데이터 원본인지 명확히 정의한다.

## 8. 백엔드 및 API 규칙

백엔드가 구현되기 전에는 프론트엔드에 동작하지 않는 API 호출을 추가하지 않는다. 구현을 시작할 경우 기본 일정 API는 다음 경로를 사용한다.

| 메서드 | 경로 | 역할 |
| --- | --- | --- |
| `GET` | `/api/schedules` | 일정 목록 조회 |
| `POST` | `/api/schedules` | 일정 생성 |
| `GET` | `/api/schedules/{id}` | 일정 단건 조회 |
| `PUT` | `/api/schedules/{id}` | 일정 전체 수정 |
| `DELETE` | `/api/schedules/{id}` | 일정 삭제 |

- 요청과 응답은 JSON을 사용한다.
- HTTP 상태 코드를 의미에 맞게 사용한다. 생성은 `201`, 삭제 성공은 `204`, 잘못된 입력은 `422`, 존재하지 않는 리소스는 `404`를 기본으로 한다.
- Pydantic 스키마로 요청과 응답 형식을 명시한다.
- 클라이언트가 생성하면 안 되는 `id`, `createdAt` 등의 필드는 생성 요청 스키마에서 분리한다.
- 오류 응답은 엔드포인트마다 임의의 형식을 만들지 말고 일관된 구조를 사용한다.
- API 경로나 필드 이름을 변경할 때는 프론트엔드 호출부, 타입, 테스트, 문서를 함께 변경한다.
- CORS 허용 출처는 환경 변수로 관리하며 운영 환경에서 와일드카드를 기본값으로 사용하지 않는다.

## 9. 팀 작업 영역

작업 충돌을 줄이기 위해 기본 담당 영역을 다음과 같이 구분한다. 공통 타입이나 설정 변경이 필요하면 영향 범위를 먼저 확인한다.

### 짱구 — 일정 핵심 기능

- 일정 생성, 조회, 수정, 삭제
- 담당 경로: `backend/app/schedules/**`
- 관련 API: `/api/schedules`, `/api/schedules/{id}`

### 철수 — 사용자 및 알림 기능

- 사용자 정보, 일정 참여자, 일정 알림
- 담당 경로: `backend/app/users/**`, `backend/app/notifications/**`

### 유리 — 캘린더 UI

- 월간 캘린더, 일정 목록, 일정 등록·수정 화면
- 현재 담당 경로: `frontend/src/**`
- 기능 분리 후 우선 담당 경로: `frontend/src/features/schedules/**`

담당 영역 밖의 수정이 반드시 필요하면 변경 이유와 영향을 작업 결과에 명시한다.

## 10. 테스트와 완료 기준

프론트엔드 변경 후 `frontend/`에서 다음 명령을 실행한다.

```bash
npm test
npm run build
```

- Vitest와 Testing Library를 사용한다.
- 구현 내부 구조보다 사용자가 수행하는 행동과 화면 결과를 검증한다.
- 접근 가능한 쿼리인 `getByRole`, `getByLabelText`, `findByText`를 우선 사용한다.
- 테스트 간 영향을 막기 위해 `localStorage`, 타이머, mock을 정리한다.
- 일정 생성·수정·삭제, 상태 변경, 유효성 검사처럼 변경한 흐름에 대한 테스트를 추가한다.

백엔드가 구현되면 `backend/tests/`에 다음 항목을 검증하는 테스트를 추가한다.

- 정상 요청의 응답 상태와 본문
- 필수값 누락과 잘못된 날짜 범위
- 존재하지 않는 일정 조회·수정·삭제
- 저장소 또는 데이터베이스 오류 처리

작업 완료 전 다음 사항을 확인한다.

- 요청한 기능이 동작하고 기존 기능이 유지된다.
- 타입 오류, 깨진 한글, 잘못 닫힌 JSX가 없다.
- 관련 테스트와 프로덕션 빌드가 통과한다.
- API나 데이터 형식을 변경했다면 호환성과 영향 범위를 문서화했다.
- 실행하지 못한 검증이 있다면 완료했다고 표현하지 않고 이유를 알린다.

## 11. Azure Skills 배포 워크플로

Azure 관련 준비, 검증, 배포 작업은 일반적인 셸 명령을 임의로 조합하지 말고 다음 Azure Skills를 순서대로 사용한다.

```text
azure-prepare → azure-validate → azure-deploy
```

### 11.1 배포 준비 — `azure-prepare`

- Azure 배포 준비 요청을 받으면 가장 먼저 저장소 루트에 `.azure/deployment-plan.md` 초안을 생성한다.
- 기존 애플리케이션과 `azure.yaml`을 분석한 뒤 사용할 Azure 서비스, 리전, 비용·확장성 요구사항, 인프라 방식을 계획에 기록한다.
- 이 저장소는 기존 `azure.yaml`을 사용하는 azd 프로젝트이므로 기존 파일을 기준으로 수정하며, 템플릿을 이용한 `azd init -t`로 프로젝트를 덮어쓰지 않는다.
- 완성된 배포 계획을 사용자에게 보여주고 명시적인 승인을 받기 전에는 인프라 파일 생성이나 배포 작업을 실행하지 않는다.
- 승인 후 필요한 Bicep 또는 Terraform, Dockerfile, 환경 설정을 생성하고 보안 설정과 로컬 동작을 확인한다.
- 준비가 끝나면 `.azure/deployment-plan.md`의 상태를 `Ready for Validation`으로 변경한 뒤 `azure-validate`로 전달한다.
- `azure-prepare` 단계에서는 `azd up`, `azd deploy`, `terraform apply` 같은 실제 배포 명령을 실행하지 않는다.

### 11.2 배포 전 검증 — `azure-validate`

- `.azure/deployment-plan.md`가 존재하고 승인된 상태인지 먼저 확인한다.
- Azure Validate Skill에서 제공하는 Windows용 `workflow.ps1` 절차를 사용해 구성, 인프라, 권한, 관리 ID, 필수 도구를 단계별로 검증한다.
- 검증 실패 항목이 있으면 원인을 수정하고 전체 관련 검증을 다시 실행한다.
- 모든 검증이 통과하기 전에는 배포를 시작하지 않는다.
- 계획의 상태를 임의로 `Validated`로 변경하지 않는다. 실제 검증을 완료한 `azure-validate`만 해당 상태와 검증 증거를 기록할 수 있다.
- 사용자가 준비나 검증만 요청했다면 검증 결과를 보고하고 여기서 중단한다.

### 11.3 실제 배포 — `azure-deploy`

- 사용자가 실제 배포를 명시적으로 요청한 경우에만 실행한다.
- `.azure/deployment-plan.md`의 상태가 `Validated`이고 Validation Proof가 기록되어 있는지 확인한다.
- 배포 전 체크리스트와 RBAC 상태를 확인한 뒤 선택된 레시피에 따라 배포한다.
- `azd up`, `azd deploy`, `terraform apply`, `az deployment` 실행은 `azure-deploy` 절차 안에서만 수행한다.
- 배포 후 애플리케이션 엔드포인트 접근, 리소스 상태, 실제 역할 할당을 확인한다.
- 사용자에게 제공하는 엔드포인트는 항상 `https://`를 포함한 완전한 URL로 작성한다.
- 실패한 배포를 성공으로 보고하지 않으며, 오류 원인과 복구 또는 재시도 결과를 함께 알린다.

### 11.4 이 저장소의 Azure 기준

- 루트 `azure.yaml`에서 프론트엔드 프로젝트 경로는 `frontend`이다.
- 프론트엔드 빌드 결과는 `frontend/dist`에 생성된다.
- SPA 라우팅은 `frontend/staticwebapp.config.json`의 `navigationFallback`과 일치해야 한다.
- 환경 변수가 필요하면 실제 값 없이 `.env.example`에 이름과 용도를 문서화한다.
- 배포 설정을 변경한 뒤에는 최소한 프론트엔드 테스트와 프로덕션 빌드를 실행한다.
- 백엔드 배포 구성이 실제로 추가되기 전에는 `azure.yaml`에 존재하지 않는 서비스를 가정하지 않는다.
- 구독, 리전, 비용에 영향을 주는 선택은 사용자의 확인을 받는다.
- 리소스 삭제나 교체 등 파괴적인 작업은 정확한 대상을 확인하고 사용자의 명시적인 승인을 받은 뒤 진행한다.

### 11.5 한국어 데모 및 문서 작성 규칙

- 사용자와의 대화, 진행 상황, 계획 설명, 검증 결과, 오류 원인과 배포 결과는 한국어로 작성한다.
- `.azure/deployment-plan.md`의 목표, 요구사항, 아키텍처 설명, 선택 이유, 메모와 체크리스트 설명은 한국어로 작성한다.
- 명령 실행 결과가 영어인 경우 원문은 그대로 보존하고, 바로 아래에 핵심 의미와 조치 사항을 한국어로 설명한다.
- 데모 중에는 현재 단계, 완료된 작업, 다음 작업, 사용자 확인이 필요한 항목을 짧고 명확한 한국어로 안내한다.
- 문서는 UTF-8로 저장해 Windows와 CI 환경에서 한글이 깨지지 않게 한다.

다만 Azure Skills와 자동화 도구가 판독하는 다음 값은 번역하거나 변형하지 않는다.

- 파일과 경로: `.azure/deployment-plan.md`, `.azure/validate-status.json`, `azure.yaml`, `infra/`
- 상태값: `Planning`, `Approved`, `Executing`, `Ready for Validation`, `Validated`, `Deployed`
- 필수 섹션명: `Validation Proof`
- 배포 방식: `AZD`, `AZCLI`, `Bicep`, `Terraform`
- 검증 단계값: `LoadPlan`, `AddValidationSteps`, `RunValidation`, `BuildVerification`, `StaticRoleVerification`, `RecordProof`, `ResolveErrors`, `UpdateStatus`
- 명령어, 코드, YAML·JSON·Bicep·Terraform 속성명, 환경 변수명

Azure 리소스 이름과 azd 환경 이름은 서비스별 문자 제한을 고려해 영문 소문자, 숫자, 하이픈을 기본으로 사용한다. 한국어 설명이 필요한 경우 영문 식별자 옆에 별도의 한국어 설명을 제공한다.
