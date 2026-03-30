# BuildWire — Project management (what the product contains today)

This document describes **only** the **project management** experience inside BuildWire: routes under `/projects/:projectId/`, what each area shows, and the main data concepts the UI is built around. It excludes sales, brokers, the AI map, authentication, org settings, billing, and the global dashboard outside of entering a project.

**Implementation note:** Most lists and KPIs use **demo / fixture data** (`projectDummyData`, task fixtures). The **task** domain follows a typed model (`BuildWireTask` in `src/types/task.ts`) shaped like a future REST API under `/projects/:id/tasks`. Other PM modules are primarily UI-complete with consistent dummy rows.

---

## How you reach PM

- From **Projects** (`/projects`), pick a project; the app loads **`ProjectRouteLayout`** with the **project sidebar** (`getProjectSidebarGroups` in `src/config/navigation/project-sidebar.tsx`).
- All PM modules live at **`/projects/:projectId/<module>`** as declared in `src/App.tsx`.

---

## Sidebar structure (project-scoped)

1. **Home** — Overview  
2. **Execution** — Tasks, Drawings, RFIs, Daily reports, Inspections, Files  
3. **Planning** — Schedule, Reports, Meetings  
4. **Management** — Financials (if allowed), Team, Activity  
5. **Commercial** (conditional) — Inventory, only when the mock project enables inventory **and** the user passes **commercial RBAC** (`canAccessCommercial`).

---

## Overview (`/overview`)

**Purpose:** Single-page project health and navigation hub.

**What it shows (conceptually):**  
Project **name**, **type** (residential / commercial / industrial / mixed_use), **status** label, **health score**, **date range**, **address**. Rollups for **execution** (task stats computed from fixtures), plus richer sections from dummy data: **KPI stat cards** (tasks open/done/blocked, RFIs, budget %, inspection pass rate, team active, schedule delta), **activity feed** (who did what, when), **“my actions”** queue (deep links into tasks, RFIs, daily reports, inspections, files, financials), **drawing / floor-plan strip**, and other overview widgets tied to `projectDummyData` / overview helpers.

---

## Tasks (`/tasks`)

**Purpose:** Field and office **work management** — list and **Kanban**, filters, and a **task drawer** for create/edit.

**UX capabilities:**  
- **Filters:** type, priority, assignees, trade, floor, text search, overdue-only, blocked-only, my-work-only (`TaskListFilters`).  
- **Views:** Table/list and **Kanban** columns driven by `kanban_section_id` and `kanban_order`.  
- **Drawer:** Structured **form sections** (basics, location, assignment, schedule, links, attachments, etc.) using `TaskDrawer` / `TaskFormSections` and presentation helpers (`taskPresentation`).

**Core record (`BuildWireTask`):**  
- **Identity:** `id`, `display_number` (e.g. T-042), `title`, `description`.  
- **Classification:** `type` (general, safety, quality, punch_list, rfi_action, inspection_action), `priority` (critical → low), `trade` (civil, mep, finishing, waterproofing, safety, structural, electrical, plumbing, qc, management), `category`, `floor`, `location_detail`.  
- **Drawing link:** `sheet_pin` — `drawing_id` plus **x / y** on the sheet, or null.  
- **Workflow:** `status` (open, in_progress, in_review, blocked, awaiting_inspection, done, void), `blocked_reason`, `progress` (0–100), optional `pinned`, `is_milestone`.  
- **People:** `assignees`, `created_by`, `watchers`, `is_private`.  
- **Dates:** `start_date`, `due_date`, `created_at`, `updated_at`.  
- **Relations:** `related_rfis`, `related_drawings`, `related_files`, `related_inspections` (ID arrays); `parent_task_id` for hierarchy; `depends_on` for predecessors.  
- **Evidence:** `photos` (url, caption, uploaded metadata), `attachments` (name, size, mime, url).  
- **Quality / RCA:** `root_cause`, `root_cause_category`.  
- **Extensibility:** `custom_fields`, `tags`.  
- **Social:** `comments_count` (denormalized).  
- **Board layout:** `kanban_section_id`, `kanban_order`.

---

## Drawings (`/drawings` and `/drawings/viewer/:planId`)

**Purpose:** **Drawing register** and **PDF viewer** with **task pins** on sheets.

**Register (demo `DrawingPlanCard`):** Stable `id`, **sheet** code (e.g. A-101), **name**, **discipline**, **pins** count, **updated** label, **rev**, **status** (Current / Superseded), optional **pdfUrl** / **fileName** for the viewer.

**Viewer:** Opens a plan by `planId`; shows the sheet and **pins** (`DemoPlanPin`: id, label often matching a task number, x/y in sheet space, status column key for coloring).

---

## RFIs (`/rfis`)

**Purpose:** **Requests for information** — register, aging, ball-in-court, cost impact.

**List row shape (demo `DummyRfiRow`):** `num`, `title`, `trade`, `priority` (Normal / Urgent), `status` (Open, Under Review, Answered, Closed, Draft, Void, etc.), `ballInCourt`, `submittedBy`, `assignedTo`, `due`, `daysOpen`, `costImpact`, optional `highlight`.  
**UI:** Data table, **stats bar** (totals, open, overdue, avg response), **drawers** / badges wired to the PM **design-system** RFI label maps.

---

## Daily reports (`/daily-reports`)

**Purpose:** **Per-day site logs** and **submission calendar**.

**List (`DailyReportRow`):** `date` (ISO), `submittedBy`, `crew` count, `weather` text, `status` (Approved, Pending, Rejected, Draft).  
**Calendar:** Month grid with **dot legend** states: `approved`, `pending`, `draft`, `missing`, `weekend` (`CalendarDot`).

---

## Inspections (`/inspections`)

**Purpose:** **Field inspections** — QC, safety, MEP, structural, etc.

**Row (`DummyInspection`):** `title`, `type`, `location`, `by`, `date`, `result` (Pass / Fail / Conditional), `status` (Scheduled, Completed, In progress, …).  
**UI:** Stats (totals, pass rate, scheduled, etc. from dummy stats), table with **result** and **type** styling from design-system maps.

---

## Files (`/files`)

**Purpose:** **Project document repository** — folders and files.

**Row (`DummyFile`):** `name`, `type` (pdf, spreadsheet, doc, other), `size`, `by`, `date`, `folder`.  
**UI:** Folder list (contracts, permits, specs, submittals, etc.), file table, **type badges** from `FILE_TYPE_CARD_BADGE` in `src/config/pm/files.ts`.

---

## Schedule (`/schedule`)

**Purpose:** **High-level phased schedule** (demo).

**Shape:** Phases with **name**, **milestone** title, **progress** percentage, **owner**, and **children** (line items as strings) from `DUMMY_SCHEDULE_PHASES` — Gantt-style presentation in the UI.

---

## Reports (`/reports`)

**Purpose:** **Report catalog** — not live report execution; **templates** grouped for export/dashboard concepts.

**Data:** `DUMMY_REPORTS_BY_CATEGORY` — categories (Overview, Field, Financial, Quality, Custom) each with entries `{ title, subtitle }` describing the intended report output.

---

## Meetings (`/meetings`)

**Purpose:** **Meeting register** — coordination, design, safety, owner walks.

**Row (dummy array):** `name`, `type` (e.g. Site Progress Meeting, Design Review, Toolbox, Owner/Client, Subcontractor Coordination, Custom), `date` (display string), `attendees` count, `actions` count, `status` (Scheduled / Completed).

---

## Financials (`/financials`)

**Purpose:** **Budget, expenses, change orders, unit payment plans** — shown only when **`canAccessCommercial(orgRole)`** is true.

**Tabs:**  
- **Budget:** Lines with `cat`, `budgeted`, `cos` (approved COs), `revised`, `spent`, `remaining`, `pct` with **progress bar** variants by utilization.  
- **Expenses:** `desc`, `category`, `vendor`, `amount`, `date`, `by`, `status` (Pending / Approved / Rejected).  
- **Change orders:** `num`, `title`, `reason`, `amount`, `status`, `date`.  
- **Payment plans:** `unit`, `buyer`, `value`, `paid`, `next` due, `overdue` days.

Uses **approval / tri-state** badge helpers from the design system where applicable.

---

## Team (`/team`)

**Purpose:** **People and subs** on the job.

**Members (`DummyTeamMember`):** `name`, `role` (PM, Supervisor, Guest, Worker, …), `company`, `joined`, `lastActive`, `tasks` count, optional `onSite`.  
**Subcontractors (`DummySub`):** `name`, `trade`, `contact`, `workers`, `tasks`.  
**UI:** Stats (total members, active today, companies), role badges from the PM design-system team maps, tables for members and subs.

---

## Activity (`/activity`)

**Purpose:** **Audit-style timeline** for the project.

**Structure:** Grouped sections (e.g. Today, Yesterday, date) each with **events** (`LogEvent`: `user`, `text`, `when`, optional `entity` — task, rfi, report, drawing, expense, inspection). Aligns with **activity entity icons** in `src/config/pm/activity.ts`.

---

## Inventory (`/inventory`)

**Purpose:** **Unit-level sales / handover** pipeline (demo) for eligible projects.

**Visibility:** Same as financials: **commercial RBAC** plus **`showInventory`** from **`getMockUiProject(projectId)`**.

**Data:** **Unit** rows (`DummyUnit`: `id`, `status` available → handed, `type` e.g. 2BHK/3BHK), floor grids, **portfolio stats** (`DUMMY_INVENTORY_STATS`: counts, revenue booked).

---

## Cross-cutting PM implementation

- **Design system:** Central **PM label / badge / pill** maps (`src/design-system/pm-label-system` and thin re-exports under `src/config/pm/*`) keep RFI, meeting, inspection, daily report, drawing discipline, and team role styling consistent.  
- **Layout:** Project pages use shared **shells** (`ModulePageShell`, headers, **data-table**, **stats-bar**, **segmented controls**, **sheet drawers**, **KPI cards**, **progress bars**) for a single product language across modules.  
- **i18n:** PM copy is wired for **multiple locales** (`src/locales/*`) alongside English.  
- **Routing edge cases:** `ProjectIndexEntry` sends `/projects/:id` to the right default child route; **`/projects/:id/budget`** redirects into the financial/budget experience.

---

## Explicitly out of scope (not PM product surface)

Workspace **Sales**, **Brokers**, **Intelligence / AI map**, **Settings** (preferences, roles, org, billing, bots), **auth pages**, **marketing home**, **components showcase**, and the **projects list** page itself — except as the entry point into the project workspace described above.
