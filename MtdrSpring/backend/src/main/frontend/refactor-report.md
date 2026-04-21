# Frontend Refactor Report

## Scope
This report summarizes the frontend refactor that was implemented, including file additions/removals, behavioral changes, and the current routing, API calls, and runtime logic.

## What Was Added
- New role route utility:
  - [src/utils/authRoutes.js](src/utils/authRoutes.js)
- New developer workspace page with tabs:
  - [src/pages/DeveloperWorkspacePage.jsx](src/pages/DeveloperWorkspacePage.jsx)
- New reusable developer tasks board component:
  - [src/features/developer/components/DeveloperTasksBoard.jsx](src/features/developer/components/DeveloperTasksBoard.jsx)

## What Was Changed
- Routing now redirects by role and includes the new developer workspace route:
  - [src/app/routes/AppRouter.jsx](src/app/routes/AppRouter.jsx)
- Authentication provider now uses a hardcoded username/profile lookup and normalizes stored user data:
  - [src/app/providers/AuthProvider.jsx](src/app/providers/AuthProvider.jsx)
- Login page switched from email mock login to username-based hardcoded profile login, with submit error handling:
  - [src/pages/LoginPage.jsx](src/pages/LoginPage.jsx)
- Auth service now returns hardcoded profiles for auth:
  - [src/services/api/authService.js](src/services/api/authService.js)
- Reusable form hook now exposes submitError and clears it on interaction/reset:
  - [src/hooks/useForm.js](src/hooks/useForm.js)
- Sidebar navigation now shows role-specific items using normalized roles:
  - [src/app/layout/Sidebar.jsx](src/app/layout/Sidebar.jsx)
- Topbar now displays dynamic user name and role:
  - [src/app/layout/Topbar.jsx](src/app/layout/Topbar.jsx)
- Legacy developer tasks page simplified to a wrapper around the new board component:
  - [src/pages/DeveloperTasksPage.jsx](src/pages/DeveloperTasksPage.jsx)
- Styles for workspace tabs, login error spacing, and developer workspace layout:
  - [src/styles/components.css](src/styles/components.css)
  - [src/styles/layout.css](src/styles/layout.css)

## What Was Removed
Legacy files tied to the old app entry flow were removed:
- [src/App.js](src/App.js)
- [src/NewItem.js](src/NewItem.js)
- [src/API.js](src/API.js)
- [src/index.js](src/index.js)
- [src/index.css](src/index.css)

## Current Frontend Routing
Main route configuration is defined in [src/app/routes/AppRouter.jsx](src/app/routes/AppRouter.jsx).

### Public Route
- /login -> LoginPage

### Protected Shell
All protected pages are wrapped by:
- ProtectedRoute in [src/app/routes/ProtectedRoute.jsx](src/app/routes/ProtectedRoute.jsx)
- AppShell in [src/app/layout/AppShell.jsx](src/app/layout/AppShell.jsx)

### Protected Routes
- / -> RoleHomeRedirect (dynamic destination by role)
- /developer -> redirect to /developer/tasks
- /developer/tasks -> DeveloperWorkspacePage
- /developer/dashboard -> DeveloperWorkspacePage
- /developer/ai -> DeveloperWorkspacePage
- /manager -> redirect to /manager/tasks
- /manager/tasks -> ManagerOverviewPage
- /manager/dashboard -> AnalyticsPage
- /tasks/:taskId -> TaskDetailPage
- * -> NotFoundPage

### Role-Based Home Mapping
Defined in [src/utils/authRoutes.js](src/utils/authRoutes.js):
- DEVELOPER -> /developer/tasks
- MANAGER -> /manager/tasks

## Current Authentication Flow
Auth context is provided through [src/app/providers/AppProviders.jsx](src/app/providers/AppProviders.jsx) and implemented in [src/app/providers/AuthProvider.jsx](src/app/providers/AuthProvider.jsx).

1. User submits username and password in [src/pages/LoginPage.jsx](src/pages/LoginPage.jsx).
2. LoginPage calls login from AuthProvider.
3. AuthProvider calls authService.login in [src/services/api/authService.js](src/services/api/authService.js).
4. authService resolves a hardcoded profile for:
  - admin -> MANAGER
  - developer -> DEVELOPER
5. On success:
   - user payload is normalized
   - role normalized to DEVELOPER or MANAGER
   - user object stored in localStorage key taskflow.auth.user
6. LoginPage redirects to role home path via getRoleHomePath.

### Local Storage Behavior
- Current key: taskflow.auth.user
- Legacy key cleanup supported: pms.mock.auth
- On logout, both keys are removed.

## Current API Calls in the New Flow

### Auth Call
Implemented in [src/services/api/authService.js](src/services/api/authService.js):
- Hardcoded admin/developer profile resolution.
- No backend call is performed yet.

### Developer Workspace Calls
Implemented in [src/features/developer/components/DeveloperTasksBoard.jsx](src/features/developer/components/DeveloperTasksBoard.jsx):
1. Fetch team developers via [src/utils/teamApi.js](src/utils/teamApi.js), using fallback endpoints:
   - /api/teams/{teamId}/users
   - /api/users?teamId={teamId}
   - /api/users
2. For each developer, fetch tasks:
   - /api/tasks/by-developer/{developerId}
3. Render grouped task tables by developer with expand/collapse behavior.

## Current UI Logic

### App Entry
- Entry remains Vite + React root in [src/main.jsx](src/main.jsx).
- Main app container remains [src/App.jsx](src/App.jsx), which mounts AppRouter.

### Provider Order
- AuthProvider wraps DataProvider in [src/app/providers/AppProviders.jsx](src/app/providers/AppProviders.jsx).
- This ensures auth user and role are available to data scope and route decisions.

### Navigation by Role
- Sidebar filters nav items by role in [src/app/layout/Sidebar.jsx](src/app/layout/Sidebar.jsx).
- Topbar shows normalized role label and user display name in [src/app/layout/Topbar.jsx](src/app/layout/Topbar.jsx).

### Developer Workspace Tabs
Defined in [src/pages/DeveloperWorkspacePage.jsx](src/pages/DeveloperWorkspacePage.jsx):
- Tasks tab -> DeveloperTasksBoard
- Dashboard tab -> currently reuses DeveloperTasksBoard
- AI prioritization tab -> placeholder panel

## Verification Status
Frontend build completed successfully after refactor:
- Command: npm run build
- Working directory: MtdrSpring/backend/src/main/frontend

## Notes
- There are additional unstaged changes outside this frontend refactor scope in the repository (for example backend whitespace and an analytics card label text update). They were not required for this report and are independent from the routing/auth workspace refactor described above.
