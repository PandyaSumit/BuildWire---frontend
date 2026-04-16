# Frontend architecture

The codebase favors a **layer-first** layout under `src/`: code is grouped by **role** (components, hooks, services, types, utils), then by **domain** inside each layer (e.g. `project/`).

For the **full responsibility plan** (what belongs in `pages/` vs other folders, dependency rules, and checklists), see [FOLDER_AND_FILE_STRUCTURE_PLAN.md](./FOLDER_AND_FILE_STRUCTURE_PLAN.md).

## Global layers (`src/`)

| Folder | Purpose |
|--------|---------|
| `components/` | Composed UI and app shell (see below). |
| `hooks/` | React hooks; domain-specific hooks under `hooks/<domain>/` (e.g. `hooks/project/useProjectUi.ts`, `hooks/task/TaskProjectContext.tsx` for task list state). |
| `services/` | Side effects, persistence, HTTP/API modules; group by domain (e.g. `services/project/projectApi.ts`, `services/task/taskService.ts`, `services/auth/authService.ts`, `services/organization/organizationService.ts`). |
| `utils/` | Pure helpers and derivations; domain subfolders (e.g. `utils/project/`). |
| `types/` | TypeScript types; shared (`types/task.ts`) or domain (`types/project/mockUi.ts`). |
| `lib/` | App-wide infrastructure (API client, theme, RBAC helpers). |
| `config/` | Static configuration (navigation, PM labels). |
| `pages/` | **Module-based route screens** — each subfolder is a **domain module** containing only route-level pages for that area. Keep files **thin**: routing + layout composition; logic and reusable UI live elsewhere (see [FOLDER_AND_FILE_STRUCTURE_PLAN.md](./FOLDER_AND_FILE_STRUCTURE_PLAN.md)). |
| `api/` | Deprecated thin re-exports for legacy paths; prefer `services/` for new code. |

## `components/` layout

| Subfolder | Purpose |
|-----------|---------|
| `components/ui/` | Reusable primitives (buttons, inputs, tables, dialogs). Import from `@/components/ui` barrel or per-file. |
| `components/layout/` | Shell: `DashboardLayout`, `Sidebar`, `Header`, global search, sidebar layout context. Public API: `@/components/layout` (`index.ts`). |
| `components/theme/` | `ThemeProvider`, `useTheme`, `ThemeToggle`. Import from `@/components/theme`. |
| `components/providers/` | App-level providers (e.g. `StoreProvider`). Barrel: `@/components/providers`. |
| `components/auth/` | Auth-specific forms and `AuthProvider` (not the same as `pages/auth/` routes). |
| `components/brand/` | Logos and marks. |
| `components/project/` | Project workspace UI (modals, module shell, drawers, project context, `drawing/` for plan viewer). |
| `components/task/` | Task views (kanban, list columns, drawers, filters) used from `pages/projects/TasksPage`. |

## `pages/` layout (by module)

Each row is a **`pages/<module>/`** folder: all **route-level pages** for that domain live there. Pages should only handle **routing and composition**; business logic, data, and reusable widgets belong in `hooks/`, `services/`, `components/`, etc.

| Folder | Purpose |
|--------|---------|
| `pages/auth/` | Login, signup, password reset, email verification. Barrel: `pages/auth/index.ts`. |
| `pages/onboarding/` | Invite acceptance, welcome. Barrel: `pages/onboarding/index.ts`. |
| `pages/home/` | Marketing / logged-out landing. Barrel: `pages/home/index.ts`. |
| `pages/dev/` | Internal tooling (e.g. component showcase). Barrel: `pages/dev/index.ts`. |
| `pages/dashboard/` | Authenticated KPI home (`DashboardPage`). Barrel: `pages/dashboard/index.ts`. |
| `pages/workspace/` | Org workspace routes (`/sales`, `/brokers`, `/intelligence/ai-map`). |
| `pages/settings/` | Org settings; short names (`PreferencesPage`, `OrganizationPage`, `RolesPage`, …). |
| `pages/projects/` | Project catalog + project-scoped module screens. |
| `pages/shared/` | Shared page wrappers (`AppPage`). |

`App.tsx` imports from these barrels or explicit paths. **Do not** add new product screens at `pages/` root—place them under the right **module** folder (or `shared/` for cross-cutting page shells).

## Project domain (example)

| Location | Contents |
|----------|----------|
| `components/project/` | Project shell UI, modals, drawers, overview widgets, `ProjectRouteLayout`, `ProjectIndexEntry`, `ProjectUiProvider`. |
| `hooks/project/useProjectUi.ts` | `useProjectUi`, `useOptionalProjectUi`. |
| `services/project/` | `projectApi.ts` (REST), `projectDummyData.ts`, `projectFixtures.ts`, `lastRoute.ts` (localStorage). |
| `utils/project/` | `display.ts`, `breadcrumbs.ts`, `overviewTaskStats.ts`. |
| `types/project/mockUi.ts` | Mock UI-only project shape for demos. |

Imports use the `@/` alias, for example `@/services/project/projectDummyData`, `@/components/project`.

## Naming

- **Components:** `PascalCase.tsx`
- **Hooks:** `useThing.ts`
- **Services / utils:** `camelCase.ts`
- **Types:** domain folder or descriptive file name under `types/`

## Imports

- Prefer `@/…` over deep relative paths.
- Lazy route imports in `App.tsx` should use the same alias style.
