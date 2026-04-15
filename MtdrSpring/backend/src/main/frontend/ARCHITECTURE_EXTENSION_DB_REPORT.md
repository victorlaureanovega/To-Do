# PMS Frontend Architecture, Extensibility, and Database Communication Guide

## 1. Current Architecture Snapshot

The project is structured as a React + Vite frontend with a layered architecture:

- UI Layer
  - Pages in `src/pages`
  - Reusable UI components in `src/components/common` and `src/components/tasks`
  - Feature-specific components in `src/features/analytics/components`

- Routing and App Shell Layer
  - Route composition in `src/app/routes/AppRouter.jsx`
  - Layout shell in `src/app/layout`
  - Route guards with `ProtectedRoute`

- State and Orchestration Layer
  - Global data context in `src/app/providers/DataProvider.jsx`
  - Auth context in `src/app/providers/AuthProvider.jsx`
  - Shared hooks in `src/hooks` (for example: `useData`, `useForm`, `useFilter`, `useModal`)
  - Feature hooks in `src/features/analytics/hooks`

- Service Layer
  - API-facing services in `src/services/api`
  - Response normalization in `src/services/api/restAdapter.js`
  - Mock transport/data source in `src/services/mocks/mockDataService.js`

- Domain Data Layer
  - Consolidated mock data in `src/data/index.js`

This gives clear boundaries:

1. Pages orchestrate UI + hooks
2. Providers own application state
3. Services own network/data-source access
4. Adapters own shape mapping
5. Components stay mostly presentational

## 2. Data Flow (Current)

Current runtime flow (tasks example):

1. A page calls a provider method from `useData()` (for example: `getTasks`, `createTask`, `updateTask`)
2. `DataProvider` calls `taskService`
3. `taskService` calls `mockDataService`
4. Result is normalized by `restAdapter`
5. `DataProvider` updates context state
6. React re-renders consumers

Equivalent analytics flow:

1. Page gets analytics data from hooks (`useAnalyticsAggregation`)
2. Hook computes derived metrics and chart datasets
3. Feature components render KPI/cards/charts

## 3. Why This Is Extensible

### 3.1 Feature-first structure already started

Analytics was moved to a feature module:

- `src/features/analytics/components`
- `src/features/analytics/hooks`
- `src/features/analytics/services`

This pattern should be reused for new domains such as:

- `src/features/tasks`
- `src/features/auth`
- `src/features/teams`
- `src/features/notifications`

### 3.2 Decoupled service contracts

Services return a common response shape:

- `success`
- `data`
- `error`

This allows changing data source implementation without page/provider rewrites.

### 3.3 Provider as anti-corruption boundary

`DataProvider` currently works as an application facade. Pages do not need to know transport details.

## 4. Recommended Extension Strategy

## 4.1 Add a new feature module

For any new feature (example: notifications), use:

- `src/features/notifications/components`
- `src/features/notifications/hooks`
- `src/features/notifications/services`
- Optional: `src/features/notifications/types` (if TypeScript migration happens)

Rules:

1. Keep domain UI in feature folder
2. Keep cross-domain primitives in `src/components/common`
3. Keep provider/service APIs small and explicit

## 4.2 Add a new page safely

Checklist:

1. Add route in `AppRouter`
2. Build page as composition layer only
3. Reuse existing hooks/providers before creating new local state
4. Add service method only when data operation is new
5. Keep complex transforms in feature hooks, not page component

## 4.3 Add a new API operation

Implement in this order:

1. `mockDataService` method (for local simulation)
2. `restAdapter` mapping
3. feature or core service method
4. provider method + state update strategy
5. page/component usage

This keeps behavior deterministic while transitioning from mock to real backend.

## 5. Database Communication Blueprint

The frontend should not communicate with the database directly. It should communicate with backend APIs, and backend services communicate with the DB.

Target architecture:

1. Frontend -> API Gateway or Backend-for-Frontend
2. Gateway -> domain microservices (`task-service`, `analytics-service`, `auth-service`)
3. Services -> database (PostgreSQL/MySQL/Mongo, etc.)

## 5.1 API contract design

Use stable, versioned REST endpoints:

- `GET /api/v1/tasks`
- `POST /api/v1/tasks`
- `PATCH /api/v1/tasks/:id`
- `DELETE /api/v1/tasks/:id`
- `GET /api/v1/analytics/dashboard`

Response format recommendation:

```json
{
  "success": true,
  "data": {},
  "error": null,
  "meta": {
    "requestId": "...",
    "timestamp": "..."
  }
}
```

Use pagination for list endpoints:

```json
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 321
  }
}
```

## 5.2 Frontend transport implementation plan

Introduce a single HTTP client abstraction (for example `src/services/api/httpClient.js`) with:

- base URL
- auth token injection
- timeout
- retry policy for idempotent requests
- central error parsing

Then services call the client, not `fetch` directly.

## 5.3 Auth and security

Recommended flow:

1. Access token in memory
2. Refresh token in secure httpOnly cookie
3. Automatic refresh on 401 (single-flight lock to prevent refresh storms)
4. Role and permission claims used by route guards and UI capability checks

## 5.4 Consistency and concurrency

For updates/deletes:

- Keep optimistic UI updates in provider
- On API failure, rollback local optimistic changes
- Consider entity versioning (`updatedAt`, `version`) to detect stale writes

## 5.5 Real-time updates (optional)

If task/analytics freshness is required:

- add WebSocket or SSE channel
- push events like `task.created`, `task.updated`, `task.completed`
- provider listens and patches local state incrementally

## 6. Migration Plan: Mock to Real Backend

Phase A: Transport and env

1. Create `httpClient`
2. Add `.env` API URL configuration
3. Keep service signatures unchanged

Phase B: Swap data source gradually

1. Replace `mockDataService` calls in `taskService`
2. Replace analytics fetches in `analyticsService`
3. Keep `restAdapter` active to absorb backend shape differences

Phase C: Hardening

1. Add request cancellation for page transitions
2. Add retry/backoff for transient failures
3. Add error UI conventions for all pages
4. Add pagination and server-side filtering

Phase D: Performance

1. Consider React Query or SWR for cache/stale revalidation
2. Split large analytics payloads into focused endpoints
3. Lazy-load heavy chart sections if needed

## 7. Suggested Next Improvements

1. Move tasks domain into `src/features/tasks` (same pattern as analytics)
2. Extract shared API helpers (`httpClient`, `errorMapper`, `querySerializer`)
3. Add integration tests around provider-service interactions
4. Add API schema documentation (OpenAPI) and align `restAdapter` against it
5. Normalize naming consistency (`fetchX` vs `getX`) across provider APIs

## 8. Minimal Example: Real API Task Service

```js
// src/services/api/taskService.js (concept)
import { httpClient } from './httpClient'
import { restAdapter } from './restAdapter'

export const taskService = {
  async fetchDeveloperTasks(filters = {}) {
    try {
      const response = await httpClient.get('/api/v1/tasks', { params: filters })
      return { success: true, data: restAdapter.normalizeTasks(response.data) }
    } catch (error) {
      return { success: false, data: null, error: restAdapter.normalizeError(error) }
    }
  }
}
```

## 9. Conclusion

The current codebase is already in a strong transitional state for database-backed operation:

- Clear UI/provider/service separation
- Feature modularization started (analytics)
- Unified data and adapter patterns in place

By completing the same modular pattern for remaining domains and introducing a shared HTTP client, the project can scale cleanly while minimizing refactor risk during backend integration.
