# BuildWire frontend

React 18 + TypeScript + [Vite](https://vitejs.dev/) + Tailwind CSS. The API is a separate backend service.

## Setup

Copy `.env.example` to `.env` and set `VITE_API_URL` to your backend base URL (e.g. `http://localhost:5000/api/v1`).

## Scripts

```bash
npm run dev      # Vite dev server (default port 3000)
npm run build    # Production build → dist/
npm run preview  # Serve dist locally
npm run lint
```

## Project layout

Application code lives under **`src/`**. The `@/` import alias maps to `src/` (see `vite.config.ts` and `tsconfig.json`).

For **layer conventions** (`components/`, `hooks/`, `services/`, `utils/`, `types/` with domain subfolders such as `project/`), see [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md). For a **structured plan** (what belongs in `pages/` vs other folders, dependency rules, checklists), see [`docs/FOLDER_AND_FILE_STRUCTURE_PLAN.md`](docs/FOLDER_AND_FILE_STRUCTURE_PLAN.md).

```
src/
  main.tsx              # Entry: BrowserRouter + providers
  App.tsx               # Route definitions
  styles/globals.css    # Tailwind + design tokens + fonts
  vite-env.d.ts
  components/           # ui/, layout/, theme/, providers/, auth/, brand/, project/, task/
  hooks/                # use* hooks; e.g. hooks/project/, hooks/task/
  services/             # API + integrations; e.g. services/project/, task/, auth/, organization/
  utils/                # Pure helpers; e.g. utils/project/, utils/task/, utils/notification/
  types/                # Shared + domain types; e.g. types/project/
  pages/
    auth/               # Login, signup, verify email, password flows
    onboarding/       # Invite + welcome
    home/               # Landing (/)
    dev/                # Component showcase & similar
    shared/             # AppPage and other shared shells
    dashboard/          # `/dashboard` (DashboardPage)
    workspace/          # `/sales`, `/brokers`, `/intelligence/ai-map`
    settings/           # `/settings/*` (Preferences, Organization, Roles, …)
    projects/           # `/projects` + `/projects/:id/*` module pages
  routes/               # Route guards (e.g. ProtectedRoute)
  lib/                  # API client, token store, theme helpers
  store/                # Redux store and slices
public/                 # Static assets (favicon, fonts, …)
```

Static assets are served from **`public/`** (e.g. `/fonts/…`).

### User-facing: project module

See **[docs/PROJECT_MODULE_USER_README.md](docs/PROJECT_MODULE_USER_README.md)** for how users move through the app (org → project → features), how modules connect (including drawings + tasks), and a **Procore-style** workflow comparison.

### Auth & roles (backend contract)

Login and `GET /auth/me` return `user.org.role` from **`organization_members.role`** on the server (`org_admin`, `project_manager`, `supervisor`, `worker`, `guest`). The UI stores that on `user.org` in Redux and drives the **global** and **project** sidebars via `src/lib/rbac.ts` and `src/config/navigation/*`.

JWT access tokens only carry `userId`; org role is always read from the user payload, not from the JWT.

Project-scoped **membership roles** (`ProjectMember.role`) are enforced on the API for each request; the project sidebar still uses org role as a coarse filter until the client loads per-project membership from a dedicated endpoint.

## Deploying the SPA

Host the contents of `dist/` behind a server or CDN that **rewrites all routes to `index.html`** so client-side routing works on refresh and deep links.
