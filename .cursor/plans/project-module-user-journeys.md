# Project module — how users use it (product flow)

This describes **end-user behavior** in BuildWire: what people do and see, not how the app is built.

## Mental model

- **Organization** = your company workspace (team, settings, maybe many projects).
- **Project** = one job site / contract / building (Tower A, Airport Phase 2, etc.). Almost all field work is **inside** a project.
- The **left sidebar** switches: outside a project you see org-level items; **inside** a project you see that project’s areas (Tasks, Drawings, RFIs, …).

## 1. Discovering and opening a project

1. User signs in and uses global navigation to open **Projects** (project directory).
2. They see **their organization’s projects** as a list or cards (name, status, etc.).
3. They can **search or filter** to find the right job.
4. If they’re allowed to, they can **create a new project** from here.
5. They **click a project** to open it.

**What happens next:** They land **inside that project**. The app tries to take them to **where they last worked** in that same project (for example back to Tasks). If there is no “last place,” they start on **Overview**.

## 2. Working inside a project

While the URL is “under” that project, the **sidebar is project-scoped**. Users move between sections without picking the project again:

| Area (examples) | What users do there |
|-----------------|----------------------|
| **Overview** | See project summary, health, rollups, entry points to other areas. |
| **Tasks** | Manage field tasks: boards or lists, priorities, assignees, open detail. |
| **Drawings** | Browse plan sets/sheets, open the **viewer**, zoom/pan, use tools (pan, select, measure, markup, pin), **drag tasks from the task panel onto the sheet** to place pins. |
| **RFIs** | Create and track RFIs for that job. |
| **Daily reports**, **Inspections**, **Files** | Log reports, inspections, and project files. |
| **Schedule**, **Reports**, **Meetings** | Planning and coordination. |
| **Financials** | (Where role allows) Cost / commercial views for that project. |
| **Team** | Who is on the project. |
| **Activity** | Audit-style activity for the project. |
| **Inventory** | (Where role and project type allow) Commercial inventory. |

Users treat this like **one app per job**: pick the job once, then jump between Tasks, Drawings, RFIs, etc., from the sidebar.

## 3. Deep example: drawings + tasks

1. User opens **Drawings** → picks a sheet → opens the **viewer**.
2. They use **zoom / fit** and **tools** at the bottom (Figma-style bar) to navigate and annotate.
3. They open the **Tasks** panel (can resize or hide it), **drag a task** onto the plan to drop a pin.
4. They can switch tools (select pin, measure, layers visibility) without leaving the viewer.

This is the intended **combined** workflow: plan + task location on the same screen.

## 4. Leaving the project or switching jobs

- User uses **Plans** / breadcrumbs / “all projects” patterns in the UI to go back to the **project list**, or uses global nav to leave the project area.
- Opening **another project** from the list switches context: sidebar and pages refer to the **new** project.

## 5. What users should not need to think about

- Exact URLs, technical IDs, or whether data is mock or live in development.
- That “last page per project” is remembered **per project** so returning feels consistent.

---

*Technical routing, APIs, and `ProjectUiProvider` are implementation details; they support this user flow but are not part of the end-user story.*
