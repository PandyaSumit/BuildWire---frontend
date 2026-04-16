# Frontend architecture

The codebase favors a **layer-first** layout under `src/`: code is grouped by **role** (components, hooks, services, types, utils), then by **domain** inside each layer (e.g. `project/`).

## Global layers (`src/`)

| Folder | Purpose |
|--------|---------|
| `components/` | Composed UI and app shell (see below). |
| `hooks/` | React hooks; domain-specific hooks under `hooks/<domain>/` (e.g. `hooks/project/useProjectUi.ts`). |
| `services/` | Side effects, persistence, HTTP/API modules; group by domain (e.g. `services/project/projectApi.ts`, mock/demo data loaders). |
| `utils/` | Pure helpers and derivations; domain subfolders (e.g. `utils/project/`). |
| `types/` | TypeScript types; shared (`types/task.ts`) or domain (`types/project/mockUi.ts`). |
| `lib/` | App-wide infrastructure (API client, theme, RBAC helpers). |
| `config/` | Static configuration (navigation, PM labels). |
| `pages/` | Route screens — keep **thin** (layout + composition). Group by **area** (see below). Under a domain folder, omit redundant prefixes in filenames. |
| `api/` | Optional thin re-exports for legacy paths; prefer `services/` for new code. |
| `features/` | Remaining vertical slices (e.g. `tasks/`, `plans/`) until migrated to the same layer pattern. |

## `components/` layout

| Subfolder | Purpose |
|-----------|---------|
| `components/ui/` | Reusable primitives (buttons, inputs, tables, dialogs). Import from `@/components/ui` barrel or per-file. |
| `components/layout/` | Shell: `DashboardLayout`, `Sidebar`, `Header`, global search, sidebar layout context. Public API: `@/components/layout` (`index.ts`). |
| `components/theme/` | `ThemeProvider`, `useTheme`, `ThemeToggle`. Import from `@/components/theme`. |
| `components/providers/` | App-level providers (e.g. `StoreProvider`). Barrel: `@/components/providers`. |
| `components/auth/` | Auth-specific forms and `AuthProvider` (not the same as `pages/auth/` routes). |
| `components/brand/` | Logos and marks. |
| `components/project/` | Project workspace UI (modals, module shell, drawers, project context). |

## `pages/` layout (route composition)

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

`App.tsx` imports from these barrels or explicit paths; avoid dumping new screens at `pages/` root unless they are truly global one-offs.

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
