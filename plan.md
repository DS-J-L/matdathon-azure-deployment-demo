맞다톤 일정관리 앱 개발 계획

1. 프로젝트 개요

맞다톤 참가자가 행사 공식 일정과 팀 작업 일정을 한 화면에서 확인하고 관리하는 웹 앱을 만든다.

행사 시간표를 확인하려고 공지 채널을 다시 찾거나, 팀별 마감 시간을 여러 메신저에서 확인하는 불편을 줄인다. 사용자는 캘린더에서 날짜를 선택하고 일정을 등록하며, 오늘 해야 할 작업과 가까운 마감을 바로 확인할 수 있다.

핵심 사용자

맞다톤 참가자

팀 일정과 작업 마감을 관리하는 팀장

발표, 멘토링, 제출 시간을 놓치고 싶지 않은 팀원

핵심 가치

공식 일정과 팀 일정을 한곳에서 확인한다.

다음 일정과 남은 시간을 빠르게 파악한다.

모바일에서도 3번 이내의 조작으로 일정을 등록한다.

2. MVP 범위

반드시 구현할 기능

캘린더

월간 캘린더를 표시한다.

이전 달, 다음 달, 오늘로 이동할 수 있다.

날짜별 일정 개수와 대표 일정 2개를 표시한다.

오늘 날짜와 사용자가 선택한 날짜를 서로 다른 스타일로 구분한다.

날짜를 누르면 해당 날짜의 일정 목록을 표시한다.

일정 카테고리를 색상으로 구분한다.

일정 관리

제목, 날짜, 시작 시간, 종료 시간, 카테고리, 설명을 입력해 일정을 등록한다.

기존 일정을 조회, 수정, 삭제할 수 있다.

일정 완료 여부를 변경할 수 있다.

종료 시간이 시작 시간보다 빠르면 저장하지 않고 오류를 표시한다.

필수 항목을 입력하지 않으면 해당 입력란 아래에 오류 문구를 표시한다.

대시보드

오늘의 날짜와 가장 가까운 다음 일정을 표시한다.

오늘 남은 일정 수를 표시한다.

24시간 안에 마감되는 일정을 강조한다.

오늘 일정과 다가오는 일정을 시간순으로 보여준다.

일정이 없을 때 빈 화면 안내와 일정 추가 버튼을 제공한다.

데이터 저장

새로고침 후에도 일정이 유지되어야 한다.

백엔드 전환 후에는 FastAPI와 Azure Cosmos DB를 일정 데이터의 유일한 원본으로 사용한다.

프런트엔드는 API 저장소 모듈을 통해서만 일정을 읽고 변경하며 화면 컴포넌트에서 fetch를 직접 호출하지 않는다.

첫 실행 시 맞다톤 예시 일정을 시드 데이터로 제공한다.

기존 브라우저의 `matdathon-schedules` 데이터는 키를 바꾸거나 즉시 삭제하지 않고, API 전환 시 한 번만 이전할 수 있는 호환 경로를 제공한다.

후순위 기능

주간 캘린더 보기

일정 검색과 카테고리 필터

담당자 지정

마감까지 남은 시간 카운트다운

JSON 일정 내보내기와 가져오기

다크 모드

이번 버전에서 제외할 기능

로그인과 팀 권한 관리

실시간 공동 편집

반복 일정

일정 드래그 앤 드롭

Google Calendar 및 Outlook 연동

푸시 알림

채팅

3. 디자인 방향

디자인 키워드

깔끔한 여백 · 둥근 카드 · 또렷한 정보 위계 · 절제된 포인트 컬러 · 대학생다운 가벼운 분위기

캘린더 앱에서 자주 보이는 빽빽한 업무 도구 화면을 피한다. 한 화면에서 중요한 일정만 먼저 보이게 만들고, 세부 정보는 패널과 모달에서 보여준다.

컬러 시스템

용도

색상

값

화면 배경

Warm White

#F7F7F2

카드 배경

White

#FFFFFF

기본 텍스트

Charcoal

#20231F

보조 텍스트

Gray

#747970

메인 포인트

Fresh Green

#5E8C61

연한 포인트

Soft Green

#E5EFE3

경고

Coral

#E76F51

구분선

Light Gray

#E7E8E3

메인 포인트 컬러는 버튼, 선택 날짜, 활성 메뉴에만 사용한다. 큰 배경 전체를 초록색으로 채우지 않는다.

일정 카테고리

카테고리

예시

색상

공식 일정

개회식, 멘토링, 발표

#5E8C61

팀 일정

회의, 중간 점검

#5B7DB1

마감

제출, 배포 완료

#E76F51

개인 일정

식사, 휴식

#B08968

색상만으로 상태를 전달하지 않는다. 카테고리 이름이나 아이콘을 함께 표시한다.

타이포그래피

한글 폰트: Pretendard

숫자와 시간도 같은 폰트를 사용한다.

페이지 제목: 28~32px / 700

카드 제목: 16~18px / 600

본문: 14~16px / 400

보조 정보: 12~13px / 400

컴포넌트 스타일

카드 모서리: 16px

버튼과 입력창 모서리: 10~12px

그림자는 약하게 사용하고 테두리로 카드 경계를 잡는다.

아이콘은 Lucide 아이콘을 사용한다.

이모지는 UI 아이콘으로 사용하지 않는다.

버튼에는 아이콘만 두지 말고 텍스트 라벨을 함께 제공한다.

로딩, 오류, 빈 상태를 각각 디자인한다.

과한 그라데이션, 유리 효과, 네온 색상은 사용하지 않는다.

4. 화면 구성

데스크톱 레이아웃

┌──────────────────────────────────────────────────────────────┐
│ 로고/앱 이름                         오늘     + 일정 추가    │
├────────────────────────────────────┬─────────────────────────┤
│                                    │ 오늘의 일정             │
│ 월간 캘린더                         │ 다음 일정 카드          │
│                                    │ 선택 날짜 일정 목록     │
│                                    │ 다가오는 마감           │
└────────────────────────────────────┴─────────────────────────┘

왼쪽 영역은 월간 캘린더가 차지한다.

오른쪽 사이드 패널은 오늘 또는 선택한 날짜의 일정 정보를 보여준다.

화면 상단의 일정 추가 버튼은 항상 같은 위치에 둔다.

모바일 레이아웃

상단에 월과 이동 버튼을 배치한다.

캘린더 아래에 선택 날짜의 일정 목록을 이어서 표시한다.

오른쪽 패널은 사용하지 않는다.

화면 오른쪽 아래에 + 플로팅 버튼을 표시한다.

일정 등록과 수정 화면은 하단 시트 또는 전체 화면 모달로 연다.

날짜 칸의 일정 제목을 숨기고 색상 점과 일정 개수만 표시한다.

주요 화면과 상태

홈 /

월간 캘린더

오늘 요약

선택 날짜 일정 목록

다가오는 마감

일정 추가 버튼

일정 등록 모달

제목

날짜

시작 시간

종료 시간

카테고리

설명

저장 및 취소 버튼

일정 상세 패널 또는 모달

일정 제목과 카테고리

날짜와 시간

설명

완료 처리

수정 및 삭제 버튼

빈 상태

선택 날짜에 일정이 없다는 짧은 안내

이 날짜에 일정 추가 버튼

불필요한 일러스트는 넣지 않는다.

5. 사용자 흐름

일정 확인

사용자가 앱에 접속한다.

앱이 오늘 날짜가 포함된 월간 캘린더를 연다.

사용자가 날짜를 선택한다.

앱이 해당 날짜의 일정을 시작 시간순으로 표시한다.

사용자가 일정 카드를 누르면 상세 정보를 확인한다.

일정 등록

사용자가 일정 추가 버튼을 누르거나 캘린더 날짜를 두 번 누른다.

앱이 선택한 날짜를 기본값으로 입력한다.

사용자가 제목, 시간, 카테고리를 입력한다.

앱이 입력값을 검증한다.

앱이 일정을 저장하고 캘린더와 일정 목록을 갱신한다.

앱이 일정을 추가했어요 토스트를 표시한다.

일정 수정과 삭제

사용자가 일정 카드를 누른다.

사용자가 수정 또는 삭제를 선택한다.

수정 시 기존 값을 입력 폼에 채운다.

삭제 시 확인 창을 한 번 표시한다.

앱이 변경 사항을 저장하고 화면을 갱신한다.

6. 기술 스택

Frontend: React + TypeScript + Vite

Backend: Python + FastAPI + Pydantic

Styling: Tailwind CSS

UI primitive: shadcn/ui 또는 Radix UI

Calendar logic: date-fns

Icons: Lucide React

Form: React Hook Form + Zod

State: React Context 또는 Zustand

Storage: Azure Cosmos DB for NoSQL

Secrets: Azure Key Vault

Monitoring: Application Insights + Log Analytics

Test: Vitest + React Testing Library

Deployment: Azure Static Web Apps + Azure App Service + Azure Developer CLI

패키지를 추가하기 전에 이미 설치된 의존성으로 해결할 수 있는지 확인한다. 캘린더 전체 UI 라이브러리를 도입하기보다 date-fns로 월간 날짜 배열을 만들고 앱 디자인에 맞는 캘린더 컴포넌트를 구현한다.

7. 데이터 모델

type ScheduleCategory = 'official' | 'team' | 'deadline' | 'personal';

type ScheduleStatus = 'scheduled' | 'completed';

interface Schedule {
  id: string;
  title: string;
  description: string;
  startAt: string;
  endAt: string;
  category: ScheduleCategory;
  status: ScheduleStatus;
  createdAt: string;
  updatedAt: string;
}

데이터 규칙

날짜와 시간은 ISO 8601 문자열로 저장한다.

사용자가 입력하고 확인하는 시간대는 Asia/Seoul로 고정한다.

일정 ID는 crypto.randomUUID()로 생성한다.

제목은 1~50자로 제한한다.

설명은 최대 500자로 제한한다.

종료 시간은 시작 시간과 같거나 늦어야 한다.

목록은 startAt 오름차순으로 정렬한다.

저장 인터페이스

interface ScheduleRepository {
  getAll(): Promise<Schedule[]>;
  getById(id: string): Promise<Schedule | null>;
  create(input: CreateScheduleInput): Promise<Schedule>;
  update(id: string, input: UpdateScheduleInput): Promise<Schedule>;
  remove(id: string): Promise<void>;
}

화면 컴포넌트에서 localStorage를 직접 호출하지 않는다. 모든 읽기와 쓰기는 ScheduleRepository를 통과한다.

8. 권장 폴더 구조

frontend/src/
├── app/
│   ├── App.tsx
│   └── providers.tsx
├── components/
│   └── ui/
├── features/
│   └── schedules/
│       ├── components/
│       │   ├── CalendarGrid.tsx
│       │   ├── CalendarHeader.tsx
│       │   ├── ScheduleCard.tsx
│       │   ├── ScheduleForm.tsx
│       │   ├── ScheduleList.tsx
│       │   └── UpcomingDeadline.tsx
│       ├── hooks/
│       ├── schedule.schema.ts
│       ├── schedule.types.ts
│       └── schedule.utils.ts
├── repositories/
│   ├── schedule.repository.ts
│   └── local-schedule.repository.ts
├── data/
│   └── seed-schedules.ts
├── lib/
│   ├── date.ts
│   └── storage.ts
├── styles/
│   └── globals.css
└── main.tsx

9. 구현 단계

1단계: 프로젝트 기반

Vite, React, TypeScript 프로젝트를 설정한다.

Tailwind CSS와 기본 디자인 토큰을 설정한다.

Pretendard와 Lucide 아이콘을 적용한다.

공통 버튼, 입력창, 카드, 모달을 만든다.

2단계: 일정 데이터

일정 타입과 Zod 검증 스키마를 작성한다.

ScheduleRepository 인터페이스를 작성한다.

localStorage 저장소 구현체를 작성한다.

맞다톤 예시 시드 데이터를 작성한다.

날짜 변환과 시간 정렬 유틸리티를 작성한다.

3단계: 캘린더

월간 날짜 배열을 계산한다.

이전 달, 다음 달, 오늘 이동 기능을 구현한다.

오늘 날짜와 선택 날짜 스타일을 구현한다.

날짜별 일정 요약을 표시한다.

날짜 선택 후 일정 목록을 갱신한다.

4단계: 일정 CRUD

일정 등록 폼을 구현한다.

입력값 검증과 오류 문구를 구현한다.

일정 상세 보기를 구현한다.

일정 수정과 삭제를 구현한다.

완료 상태 변경을 구현한다.

성공과 오류 토스트를 구현한다.

5단계: 대시보드와 반응형 UI

오늘 요약 카드를 구현한다.

다음 일정과 다가오는 마감 카드를 구현한다.

데스크톱 2열 레이아웃을 구현한다.

모바일 1열 레이아웃과 하단 시트를 구현한다.

로딩, 오류, 빈 상태를 구현한다.

6단계: 검증과 배포

일정 생성, 수정, 삭제 테스트를 작성한다.

월 경계와 연도 변경을 테스트한다.

시작·종료 시간 검증을 테스트한다.

모바일 375px, 태블릿 768px, 데스크톱 1440px에서 확인한다.

키보드만으로 폼과 모달을 조작할 수 있는지 확인한다.

새로고침 후 데이터 유지 여부를 확인한다.

Azure Static Web Apps와 Azure App Service에 분리 배포한다.

10. 완료 기준

사용자가 월간 캘린더에서 날짜별 일정을 확인할 수 있다.

사용자가 일정을 등록, 수정, 삭제, 완료 처리할 수 있다.

앱이 잘못된 시간과 빈 필수 입력값을 저장하지 않는다.

새로고침 후에도 사용자가 만든 일정이 유지된다.

오늘, 선택 날짜, 일정 카테고리를 시각적으로 구분할 수 있다.

375px 모바일 화면에서 가로 스크롤이 생기지 않는다.

모든 버튼과 입력창에 접근 가능한 이름이 있다.

로딩, 오류, 빈 상태가 준비되어 있다.

개발자 도구 콘솔에 오류가 없다.

배포 주소에서 핵심 사용자 흐름을 끝까지 실행할 수 있다.

11. Copilot 작업 규칙

구현을 시작하기 전에 이 문서를 읽는다.

체크되지 않은 작업을 구현 순서에 따라 진행한다.

이 문서의 MVP 범위 밖 기능을 임의로 추가하지 않는다.

한 번에 한 단계만 구현하고 완료 후 체크박스를 갱신한다.

화면을 만들기 전에 기존 컴포넌트와 디자인 토큰을 확인한다.

화면 컴포넌트에서 localStorage를 직접 호출하지 않는다.

모든 날짜 계산은 공통 날짜 유틸리티를 사용한다.

일정 시간은 ISO 8601 형식으로 저장하고 화면에는 한국 시간으로 표시한다.

기능 구현 후 로딩, 오류, 빈 상태를 함께 확인한다.

기존 기능을 제거하거나 데이터 모델을 변경하기 전에 사용자에게 확인한다.

임시 더미 코드와 사용하지 않는 파일을 남기지 않는다.

Copilot 시작 프롬프트 예시:

#plan.md와 #.github/copilot-instructions.md를 읽어줘.
plan.md의 1단계만 구현하고, 완료한 항목의 체크박스를 갱신해줘.
계획에 없는 기능은 추가하지 말고 구현 후 실행 결과와 남은 작업을 알려줘.

12. 데모 시나리오

앱을 열어 오늘의 공식 일정과 다음 마감을 확인한다.

캘린더에서 발표 날짜를 선택한다.

최종 발표 자료 제출 일정을 등록한다.

캘린더에 마감 일정이 코랄 색상으로 표시되는지 확인한다.

일정을 수정하고 완료 상태로 바꾼다.

페이지를 새로고침해 일정이 유지되는지 확인한다.

모바일 화면으로 전환해 같은 일정을 확인한다.

데모에서는 캘린더 디자인보다 일정 등록부터 저장, 표시, 수정까지 끊기지 않는 흐름을 먼저 보여준다.

13. 백엔드 분리형 서비스 목표

서비스의 핵심 경계는 다음과 같이 정한다.

- 프런트엔드는 화면 표시, 사용자 입력, 로컬 시간 변환, 로딩·오류 상태를 담당한다.
- 백엔드는 일정 검증, ID와 생성 시각 생성, 정렬, 일관된 오류 응답을 담당한다.
- Cosmos DB는 일정 데이터의 영구 저장소다.
- Key Vault는 코드나 설정 파일에 둘 수 없는 비밀값의 단일 저장소다.
- Application Insights는 프런트엔드에서 백엔드로 이어지는 요청, 예외, Cosmos DB 의존성 호출을 관찰한다.
- `localStorage`는 기존 사용자 데이터 이전 용도로만 유지하며 전환 후 데이터 원본으로 사용하지 않는다.

서비스 호출 흐름은 다음과 같다.

```text
사용자
  -> Azure Static Web Apps의 React 앱
      -> HTTPS REST API
          -> Azure App Service의 FastAPI
              -> Managed Identity
                  -> Azure Cosmos DB for NoSQL
                  -> Azure Key Vault
              -> Application Insights / Log Analytics
```

14. 일정 API 계약

기본 엔드포인트는 저장소 지침의 경로를 그대로 사용한다.

| 메서드 | 경로 | 성공 상태 | 역할 |
| --- | --- | --- | --- |
| `GET` | `/api/schedules` | `200` | `startAt` 오름차순 일정 목록 조회 |
| `POST` | `/api/schedules` | `201` | 일정 생성 |
| `GET` | `/api/schedules/{id}` | `200` | 일정 단건 조회 |
| `PUT` | `/api/schedules/{id}` | `200` | 일정 전체 수정 |
| `DELETE` | `/api/schedules/{id}` | `204` | 일정 삭제 |
| `GET` | `/health` | `200` | App Service 상태 확인 |

생성 요청에는 `title`, `description`, `startAt`, `endAt`, `category`, `status`만 받는다. `id`와 `createdAt`은 서버가 생성한다.

수정 요청은 생성 요청과 같은 변경 가능 필드를 모두 받으며 기존 `id`와 `createdAt`은 유지한다.

응답의 일정 모델은 현재 `frontend/src/types.ts`의 `Schedule` 형식을 기준으로 한다.

검증 규칙은 다음과 같다.

- 제목과 설명은 저장 전에 앞뒤 공백을 제거한다.
- 제목은 필수이며 1~50자로 제한한다.
- 설명은 최대 500자로 제한한다.
- 모든 날짜·시간은 ISO 8601 문자열이어야 한다.
- `endAt`은 `startAt`보다 늦어야 한다.
- 카테고리와 상태는 현재 정의된 값만 허용한다.
- 잘못된 요청은 `422`, 없는 일정은 `404`로 응답한다.
- 예외 응답은 `detail`을 사용하는 한 가지 JSON 구조로 통일한다.

15. 백엔드 구현 구조

```text
backend/
├── app/
│   ├── main.py
│   ├── core/
│   │   ├── config.py
│   │   └── telemetry.py
│   └── schedules/
│       ├── router.py
│       ├── schemas.py
│       ├── service.py
│       └── repository.py
├── tests/
│   ├── conftest.py
│   └── test_schedules_api.py
├── .env.example
└── requirements.txt
```

각 계층의 책임은 다음과 같다.

- `router.py`: HTTP 입력과 출력, 상태 코드만 처리한다.
- `schemas.py`: Pydantic 요청·응답 모델과 날짜 범위 검증을 정의한다.
- `service.py`: 생성 시각과 ID 생성, 정렬, 존재 여부 확인 같은 일정 규칙을 처리한다.
- `repository.py`: Cosmos DB 접근을 캡슐화하고 테스트용 메모리 저장소와 같은 인터페이스를 제공한다.
- `config.py`: CORS, Cosmos DB 엔드포인트, 데이터베이스와 컨테이너 이름을 환경 변수에서 읽는다.
- `telemetry.py`: Application Insights 계측 초기화를 한곳에서 관리한다.

초기 일정 도메인만 구현하며 사용자, 알림, 인증 계층은 이번 범위에 포함하지 않는다.

16. Cosmos DB 데이터 설계

Cosmos DB for NoSQL에 데이터베이스 `scheduler`, 컨테이너 `schedules`를 만든다.

초기 파티션 키는 `/id`를 사용한다. 현재 MVP는 사용자와 팀 구분이 없으므로 불필요한 테넌트 모델을 먼저 만들지 않는다. 로그인이나 팀 기능을 도입할 때 `/ownerId` 또는 `/teamId` 기반 새 컨테이너로 이전하는 계획을 별도로 세운다.

일정 문서 예시는 다음과 같다.

```json
{
  "id": "uuid",
  "title": "최종 발표 자료 제출",
  "description": "발표 자료와 데모 링크 제출",
  "startAt": "2026-08-22T06:00:00.000Z",
  "endAt": "2026-08-22T06:30:00.000Z",
  "category": "deadline",
  "status": "scheduled",
  "createdAt": "2026-08-14T03:00:00.000Z"
}
```

초기 환경은 비용을 줄이기 위해 단일 리전과 Serverless 계정을 우선 검토한다. 실제 SKU와 리전은 `.azure/deployment-plan.md` 승인 단계에서 확정한다.

17. 프런트엔드 API 전환

기존 화면과 `Schedule` 타입을 최대한 유지하면서 데이터 접근만 교체한다.

```text
frontend/src/
├── App.tsx
├── types.ts
├── lib/
│   ├── eventSchedule.ts
│   ├── storage.ts
│   └── scheduleApi.ts
└── test/
```

- `scheduleApi.ts`에 목록, 생성, 수정, 삭제 함수를 모은다.
- API 기본 주소는 `VITE_API_BASE_URL`에서 읽는다.
- 앱 최초 진입 시 목록을 불러오는 동안 로딩 상태를 표시한다.
- API 오류가 발생하면 사용자가 다시 시도할 수 있는 오류 상태를 표시하고 성공한 것처럼 토스트를 띄우지 않는다.
- 일정 변경 후 서버 응답을 기준으로 React 상태를 갱신한다.
- API 전환 완료 후 `storage.ts`는 기존 데이터 읽기와 1회 이전 보조 기능만 담당한다.
- 이전 성공 여부는 별도 마이그레이션 표식으로 기록해 같은 일정을 반복 생성하지 않는다.
- 백엔드가 비어 있고 기존 로컬 일정이 있으면 사용자 데이터와 기본 행사 일정을 API에 한 번 이전한다.

18. Azure 서비스 구성 원칙

Frontend — Azure Static Web Apps

- 기존 `frontend/` 프로젝트와 `frontend/dist` 빌드 결과를 유지한다.
- `frontend/staticwebapp.config.json`의 SPA fallback을 유지한다.
- 백엔드 주소는 빌드 환경 변수로 주입한다.

Backend — Azure App Service

- Linux Python 런타임에서 FastAPI를 실행한다.
- 시작 명령은 Gunicorn과 Uvicorn worker 조합을 사용한다.
- 시스템 할당 Managed Identity를 활성화한다.
- HTTPS 전용, 최소 TLS 버전, FTPS 비활성화를 적용한다.
- CORS 허용 원본은 배포된 Static Web Apps 주소만 사용하며 와일드카드를 기본값으로 두지 않는다.

Database — Azure Cosmos DB

- 애플리케이션은 연결 문자열보다 `DefaultAzureCredential`과 Managed Identity를 우선 사용한다.
- App Service 관리 ID에는 데이터 읽기·쓰기 최소 권한만 부여한다.
- 데이터베이스와 컨테이너 이름은 환경 변수로 전달한다.

Secrets — Azure Key Vault

- 비밀값, 토큰, 연결 문자열을 저장소에 기록하지 않는다.
- Key Vault는 RBAC 권한 모델과 soft delete를 사용한다.
- App Service 관리 ID에 필요한 secret 읽기 권한만 부여한다.
- Cosmos DB가 Managed Identity로 연결되므로 단순 편의를 위해 연결 문자열을 새로 만들지 않는다.
- 현재 애플리케이션에 실제 비밀값이 없다면 빈 비밀을 만들지 않고 향후 비밀값의 저장 경계로만 준비한다.

Monitoring — Application Insights

- FastAPI 요청, 예외, 응답 시간과 Cosmos DB 의존성 호출을 수집한다.
- 연결 정보는 App Service 설정으로 주입한다.
- 민감한 일정 제목이나 설명을 로그 메시지에 기록하지 않는다.
- `/health` 성공 여부와 서버 오류율을 배포 후 확인한다.

19. 환경 변수

실제 값은 커밋하지 않고 예제 파일에는 이름과 용도만 기록한다.

프런트엔드:

| 이름 | 용도 |
| --- | --- |
| `VITE_API_BASE_URL` | FastAPI 공개 HTTPS 주소 |

백엔드:

| 이름 | 용도 |
| --- | --- |
| `APP_ENV` | `development`, `test`, `production` 환경 구분 |
| `CORS_ALLOWED_ORIGINS` | 쉼표로 구분한 허용 프런트엔드 원본 |
| `COSMOS_ENDPOINT` | Cosmos DB 계정 엔드포인트 |
| `COSMOS_DATABASE_NAME` | 기본값 `scheduler` |
| `COSMOS_CONTAINER_NAME` | 기본값 `schedules` |
| `APPLICATIONINSIGHTS_CONNECTION_STRING` | Application Insights 연결 정보 |
| `KEY_VAULT_URI` | Key Vault URI |

20. 단계별 서비스 구현 순서

구현은 한 단계씩 진행하고, 각 단계의 테스트가 통과한 뒤 다음 단계로 이동한다.

- [x] 1단계 — FastAPI 기반과 테스트 환경
  - [x] 의존성 파일과 환경 변수 예제를 만든다.
  - [x] 설정 로딩, CORS, `/health` 엔드포인트를 구현한다.
  - [x] 테스트 클라이언트로 상태 확인을 검증한다.
- [x] 2단계 — 일정 도메인과 메모리 저장소
  - [x] Pydantic 스키마와 검증 규칙을 구현한다.
  - [x] 저장소 인터페이스와 테스트용 메모리 구현을 만든다.
  - [x] 일정 CRUD 서비스와 라우터를 구현한다.
  - [x] 정상·오류·없는 리소스 API 테스트를 작성한다.
- [x] 3단계 — Cosmos DB 저장소
  - [x] Azure Identity와 Cosmos SDK를 연결한다.
  - [x] 관리 ID 인증을 기본값으로 사용한다.
  - [x] Cosmos 오류를 일관된 API 오류로 변환한다.
  - [x] 저장소 단위 테스트에서 SDK 호출을 격리한다.
- [x] 4단계 — 프런트엔드 API 연동
  - [x] API 클라이언트와 요청 타입을 추가한다.
  - [x] 조회·생성·수정·삭제·상태 변경을 비동기로 전환한다.
  - [x] 로딩·오류·재시도 상태를 추가한다.
  - [x] 기존 `localStorage` 데이터의 1회 이전을 구현한다.
  - [x] 주요 사용자 흐름 테스트를 API mock 기반으로 갱신한다.
- [ ] 5단계 — Azure 배포 준비
  - [ ] 승인된 `.azure/deployment-plan.md`를 기준으로 Bicep을 작성한다.
  - [ ] 기존 `azure.yaml`에 실제 백엔드 서비스를 추가한다.
  - [ ] Managed Identity와 최소 RBAC 역할을 구성한다.
  - [ ] Static Web Apps 주소가 App Service CORS 설정으로 전달되게 한다.
  - [ ] Key Vault와 Application Insights 설정을 연결한다.
- [ ] 6단계 — 로컬 및 배포 전 검증
  - [x] 백엔드 전체 테스트를 실행한다.
  - [x] 프런트엔드 `npm test`와 `npm run build`를 실행한다.
  - [x] API 계약, CORS, 환경 변수, 비밀값 노출 여부를 점검한다.
  - [ ] `.azure/deployment-plan.md`를 `Ready for Validation`으로 변경한다.
  - [ ] `azure-validate` 절차를 실행한다.
- [ ] 7단계 — 사용자 승인 후 배포
  - [ ] 검증 증거와 `Validated` 상태를 확인한다.
  - [ ] `azure-deploy` 절차로 실제 배포한다.
  - [ ] 완전한 HTTPS URL에서 일정 CRUD와 모니터링을 확인한다.

21. 서비스 전환 완료 기준

- 프런트엔드 새로고침 후에도 Cosmos DB에 저장된 일정이 표시된다.
- 일정 생성, 조회, 수정, 삭제, 완료 상태 변경이 FastAPI를 통해 동작한다.
- 브라우저가 Cosmos DB나 Key Vault에 직접 접근하지 않는다.
- 백엔드가 일정 입력을 독립적으로 검증하며 잘못된 데이터는 저장하지 않는다.
- 기존 `matdathon-schedules` 데이터가 중복 없이 한 번 이전된다.
- 운영 CORS 설정에 와일드카드가 없다.
- 비밀값과 연결 문자열이 코드, Git 기록, 예제 파일에 포함되지 않는다.
- 백엔드 테스트, 프런트엔드 테스트와 프로덕션 빌드가 모두 통과한다.
- Application Insights에서 요청, 예외, 의존성 호출을 확인할 수 있다.
- 배포 전 `azure-validate`, 실제 배포 시 `azure-deploy` 순서를 지킨다.
