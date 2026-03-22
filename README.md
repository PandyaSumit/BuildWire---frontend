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

```
src/
  main.tsx              # Entry: BrowserRouter + providers
  App.tsx               # Route definitions
  styles/globals.css    # Tailwind + design tokens + fonts
  vite-env.d.ts
  components/           # UI, layout (sidebar, header, shell), auth forms, providers
  pages/
    shared/             # Shared page primitives (e.g. AppPage)
    projects/           # Project list + project-scoped screens
    dashboard/          # KPI overview route component (`/dashboard`)
    workspace/          # Sales, brokers, AI map (`/sales`, `/brokers`, `/intelligence/ai-map`)
    settings/           # Team, roles, org, billing, bots (`/team`, `/settings/*`)
    *.tsx at pages root # Public / auth (HomePage, LoginPage, …)
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
