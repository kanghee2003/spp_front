# ts-vite-csr-auto-router-mdi

Vite + React + TS 기반 CSR 스타터 (자동 라우팅 + GNB/LNB/MDI/Main).

## What you get

- **Auto routing**: `src/pages/**` 아래 파일을 자동으로 라우팅 (import.meta.glob 기반)
- **Layout**: GNB / LNB(2-depth Menu) / MDI(Tab bar) / Main(Content)
- **MDI Tabs**: 메뉴 클릭 → 탭 추가, 탭 클릭 → 이동, 탭 드래그 정렬
- DnD: `@hello-pangea/dnd` (react-beautiful-dnd의 유지보수 포크, API 거의 동일)

## Included

- axios 1.13.2
- env-cmd 11.0.0
- eslint 9.39.2 (flat config)
- prettier 3.7.4
- react-router-dom 7.11.0
- @hello-pangea/dnd 18.0.1
- antd 6.1.4 + @ant-design/icons 6.1.0
- zustand 5.0.9 (MDI 탭 상태 persist)

## Start

```bash
npm i
npm run dev
```

## Local env (env-cmd)

```bash
cp .env.local.example .env.local
npm run dev:local
```

## Notes: EBADENGINE warning

- Node가 **22.12 미만**이면 Vite 7 / plugin-react 5에서 `EBADENGINE` 경고가 나올 수 있지만, 대개 설치/실행은 정상입니다.
- 경고를 없애려면 Node를 22.12+ 또는 20.19+로 올려주세요.

## Auth bootstrap + permission guard

- 앱 시작 시 `/auth/bootstrap`을 호출(또는 `VITE_USE_MOCK_BOOTSTRAP=true`면 mock 데이터 사용)하여
  - `permissions`
  - `menuTree`
    를 가져옵니다.
- LNB는 **bootstrap.menuTree**로 렌더링됩니다.
- 각 페이지는 `export const meta = { title, perm }`로 권한을 선언할 수 있고,
  권한이 없으면 `/403`으로 이동합니다.
- 딥링크(주소창 직접 접근/새로고침) 시에도 동일하게 권한 체크 후
  - 허용: 탭 유지/생성
  - 불가: `/403` 리다이렉트 (탭 생성 안 함)

## Dev server port

- Vite dev server is fixed to **3000** (`vite.config.ts` with `strictPort: true`).

## Backend 연결

- 기본 backend base URL: `http://localhost:8081`
- Bootstrap 호출: `GET /api/bootstrap`
- dev user header: `.env(.local)`의 `VITE_DEV_USER_ID`를 설정하면 프론트가 `X-User-Id` 헤더를 자동으로 붙입니다.

## 호출 구조 (service → api → 공통 axios)

- 공통 Axios: `src/app/core/services/cmm/axios.service.ts`
- API 모듈: `src/app/core/api/*.api.ts`
- React Query 서비스(훅): `src/app/core/services/*.service.ts`
