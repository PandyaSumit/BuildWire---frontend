import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { KpiStatCard } from "@/components/ui/kpi-stat-card";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import {
  REPORT_CATEGORIES,
  type ReportCategoryId,
} from "@/config/pm/reports";
import {
  ModulePageShell,
  ModuleSplitLayout,
} from "@/components/project";
import { DUMMY_REPORTS_BY_CATEGORY } from "@/services/project/projectDummyData";

// ── Extended report metadata ──────────────────────────────────────────────────
const REPORT_META: Record<string, { lastRun?: string; scheduled?: string; format: string[]; starred?: boolean }> = {
  "Project Status Report (weekly)": { lastRun: "Mar 20", scheduled: "Every Mon 8 AM", format: ["PDF", "Excel"], starred: true },
  "Progress Dashboard": { lastRun: "Mar 19", format: ["PDF", "Web"] },
  "Executive one-pager": { lastRun: "Mar 15", scheduled: "Every Friday", format: ["PDF"], starred: true },
  "Daily Report Summary": { lastRun: "Mar 20", format: ["PDF", "Excel"] },
  "Task Activity Report": { lastRun: "Mar 18", format: ["Excel", "CSV"] },
  "Punch List Report": { format: ["PDF"] },
  "Budget Variance Report": { lastRun: "Mar 17", format: ["PDF", "Excel"], starred: true },
  "Expense Report": { lastRun: "Mar 10", scheduled: "Monthly", format: ["Excel", "CSV"] },
  "Cash flow projection": { format: ["PDF", "Excel"] },
  "Inspection Summary": { lastRun: "Mar 15", format: ["PDF"] },
  "Deficiency Report": { format: ["PDF", "Excel"] },
  "My saved view — RFIs + Tasks": { lastRun: "Mar 19", format: ["Excel", "CSV"] },
  "Client pack — March": { lastRun: "Mar 1", format: ["PDF"], starred: true },
};

const SCHEDULED_REPORTS = [
  { title: "Project Status Report (weekly)", schedule: "Every Mon 8 AM", recipients: "PM, Owner", nextRun: "Mar 24", format: "PDF" },
  { title: "Executive one-pager", schedule: "Every Friday 6 PM", recipients: "Stakeholders", nextRun: "Mar 22", format: "PDF" },
  { title: "Expense Report", schedule: "1st of month", recipients: "Finance team", nextRun: "Apr 1", format: "Excel" },
];

// Category descriptions for sidebar
const CATEGORY_DESCRIPTIONS: Record<ReportCategoryId, string> = {
  Overview: "Status & dashboards",
  Field: "Daily reports & tasks",
  Financial: "Budget & cash flow",
  Quality: "Inspections & defects",
  Custom: "Saved & shared views",
};

// SVG icons for categories
function CategoryIcon({ cat }: { cat: ReportCategoryId }) {
  const icons: Record<ReportCategoryId, JSX.Element> = {
    Overview: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h7" />
      </svg>
    ),
    Field: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    Financial: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    Quality: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    Custom: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3h14a2 2 0 012 2v3a2 2 0 01-.586 1.414L15 15v6l-6-3v-3L3.586 9.414A2 2 0 013 8V5a2 2 0 012-2z" />
      </svg>
    ),
  };
  return icons[cat];
}

type Tab = "reports" | "scheduled";

// ── Run report modal ──────────────────────────────────────────────────────────
function RunReportModal({ title, onClose }: { title: string; onClose: () => void }) {
  const meta = REPORT_META[title] ?? { format: ["PDF"] };
  const [format, setFormat] = useState(meta.format[0]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label="Close"
      />
      <div className="relative w-full max-w-sm rounded-2xl border border-border bg-elevated p-6 shadow-2xl">
        <h3 className="mb-1 text-base font-semibold text-primary">{title}</h3>
        <p className="mb-4 text-sm text-secondary">Configure and run this report.</p>

        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-[12px] font-medium text-secondary">Date range</label>
            <select className="w-full rounded-lg border border-border/60 bg-bg px-3 py-2 text-sm text-primary">
              <option>This month</option>
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Custom range</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[12px] font-medium text-secondary">Format</label>
            <div className="flex gap-2">
              {meta.format.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFormat(f)}
                  className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                    format === f
                      ? "border-brand bg-brand-light font-medium text-primary"
                      : "border-border/60 text-secondary hover:border-brand/40"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5 flex gap-2">
          <Button size="sm" className="flex-1">Run report</Button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border/60 px-4 py-2 text-sm text-secondary hover:bg-muted/10"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ReportsPage() {
  const [cat, setCat] = useState<ReportCategoryId>("Overview");
  const [tab, setTab] = useState<Tab>("reports");
  const [search, setSearch] = useState("");
  const [starred, setStarred] = useState<Set<string>>(
    new Set(Object.entries(REPORT_META).filter(([, m]) => m.starred).map(([k]) => k))
  );
  const [runningReport, setRunningReport] = useState<string | null>(null);

  const rawItems = useMemo(() => DUMMY_REPORTS_BY_CATEGORY[cat] ?? [], [cat]);
  const items = useMemo(
    () =>
      search
        ? rawItems.filter(
            (r) =>
              r.title.toLowerCase().includes(search.toLowerCase()) ||
              r.subtitle.toLowerCase().includes(search.toLowerCase()),
          )
        : rawItems,
    [rawItems, search],
  );

  const toggleStar = (title: string) =>
    setStarred((prev) => {
      const next = new Set(prev);
      if (next.has(title)) next.delete(title);
      else next.add(title);
      return next;
    });

  // ── Sidebar ──────────────────────────────────────────────────────────────
  const sidebar = (
    <nav className="flex flex-row gap-1 overflow-x-auto md:flex-col md:gap-0.5 md:overflow-visible" aria-label="Report categories">
      {/* Categories section */}
      <p className="mb-1.5 hidden px-2 text-[10px] font-semibold uppercase tracking-wider text-muted md:block">
        Categories
      </p>
      {REPORT_CATEGORIES.map((c) => {
        const count = (DUMMY_REPORTS_BY_CATEGORY[c] ?? []).length;
        const isActive = cat === c && tab === "reports";
        return (
          <button
            key={c}
            type="button"
            onClick={() => { setCat(c); setTab("reports"); setSearch(""); }}
            className={`group flex shrink-0 items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors md:w-full ${
              isActive
                ? "bg-brand-light text-primary"
                : "text-secondary hover:bg-muted/10 hover:text-primary"
            }`}
          >
            {/* Icon container */}
            <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md border transition-colors ${
              isActive
                ? "border-brand/30 bg-brand/10 text-brand"
                : "border-border/60 bg-surface text-muted group-hover:border-brand/20 group-hover:text-brand"
            }`}>
              <CategoryIcon cat={c} />
            </span>
            <span className="min-w-0 flex-1">
              <span className={`block whitespace-nowrap text-[13px] font-medium leading-snug ${isActive ? "text-primary" : ""}`}>
                {c}
              </span>
              <span className="hidden truncate text-[11px] text-muted leading-none mt-0.5 md:block">
                {CATEGORY_DESCRIPTIONS[c]}
              </span>
            </span>
            <span className={`hidden shrink-0 text-[11px] tabular-nums font-medium md:block ${isActive ? "text-secondary" : "text-muted"}`}>
              {count}
            </span>
          </button>
        );
      })}

      {/* Divider */}
      <div className="my-2 hidden border-t border-border/50 md:block" />

      {/* Scheduled section */}
      <p className="mb-1.5 hidden px-2 text-[10px] font-semibold uppercase tracking-wider text-muted md:block">
        Automation
      </p>
      <button
        type="button"
        onClick={() => setTab("scheduled")}
        className={`flex shrink-0 items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors md:w-full ${
          tab === "scheduled"
            ? "bg-brand-light text-primary"
            : "text-secondary hover:bg-muted/10 hover:text-primary"
        }`}
      >
        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md border transition-colors ${
          tab === "scheduled"
            ? "border-brand/30 bg-brand/10 text-brand"
            : "border-border/60 bg-surface text-muted"
        }`}>
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </span>
        <span className="min-w-0 flex-1">
          <span className="block whitespace-nowrap text-[13px] font-medium leading-snug">Scheduled</span>
          <span className="hidden text-[11px] text-muted leading-none mt-0.5 md:block">Auto-delivered reports</span>
        </span>
        <Badge variant="secondary" size="sm" className="hidden md:flex">{SCHEDULED_REPORTS.length}</Badge>
      </button>

      {/* Starred shortcut — desktop only */}
      {starred.size > 0 && (
        <>
          <div className="my-2 hidden border-t border-border/50 md:block" />
          <p className="mb-1.5 hidden px-2 text-[10px] font-semibold uppercase tracking-wider text-muted md:block">
            Starred
          </p>
          <div className="hidden space-y-0.5 md:block">
            {[...starred].slice(0, 4).map((title) => (
              <button
                key={title}
                type="button"
                onClick={() => {
                  // Find which category this report belongs to
                  for (const c of REPORT_CATEGORIES) {
                    const found = (DUMMY_REPORTS_BY_CATEGORY[c] ?? []).find((r) => r.title === title);
                    if (found) { setCat(c); setTab("reports"); setSearch(""); break; }
                  }
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[12px] text-secondary transition-colors hover:bg-muted/10 hover:text-primary"
              >
                <span className="text-warning text-[10px]">★</span>
                <span className="min-w-0 truncate">{title}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </nav>
  );

  return (
    <>
      <ModuleSplitLayout sidebar={sidebar} sidebarLabel="">
        <ModulePageShell>
          <PageHeader
            title="Reports"
            description={
              tab === "scheduled"
                ? "Automated reports — configure schedules and recipients."
                : `${cat} — run, schedule, or export any report.`
            }
            actions={
              <div className="flex items-center gap-2">
                <Button size="sm" variant="secondary">Export bundle</Button>
              </div>
            }
          />

          {/* Overview KPIs */}
          {cat === "Overview" && tab === "reports" && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <KpiStatCard label="Reports run this month" value="24" sublabel="↑ 6 vs last month" />
              <KpiStatCard label="Scheduled active" value="3" sublabel="Auto-delivered" accent="success" />
              <KpiStatCard label="Last export" value="Mar 20" sublabel="Project Status PDF" />
              <KpiStatCard label="Starred reports" value={String(starred.size)} sublabel="Quick access" />
            </div>
          )}

          {/* Scheduled reports */}
          {tab === "scheduled" ? (
            <div className="space-y-3">
              {SCHEDULED_REPORTS.map((r) => (
                <div
                  key={r.title}
                  className="group rounded-xl border border-border/60 bg-surface px-4 py-3.5 transition-colors hover:border-border/80"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success/15 text-[9px] text-success">●</span>
                        <p className="text-[13px] font-semibold text-primary">{r.title}</p>
                      </div>
                      <p className="mt-1 text-xs text-secondary">{r.schedule} · To: {r.recipients}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" size="sm">{r.format}</Badge>
                      <button
                        type="button"
                        className="rounded-lg border border-border/60 px-3 py-1 text-xs text-secondary hover:border-warning/40 hover:text-warning"
                      >
                        Pause
                      </button>
                      <button
                        type="button"
                        className="rounded-lg border border-border/60 px-3 py-1 text-xs text-secondary hover:border-brand/40 hover:text-primary"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                  <p className="mt-2 text-[11px] text-muted">Next run: <span className="font-medium text-secondary">{r.nextRun}</span></p>
                </div>
              ))}
              <button
                type="button"
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border/60 py-3.5 text-sm text-secondary hover:border-brand/40 hover:bg-brand-light/30 hover:text-primary"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Schedule a new report
              </button>
            </div>
          ) : (
            <>
              {/* Search */}
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                  <svg className="h-4 w-4 text-muted" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search reports…"
                  className="w-full rounded-xl border border-border/60 bg-bg py-2.5 pl-10 pr-4 text-sm text-primary placeholder:text-muted focus:border-brand/50 focus:outline-none focus:ring-2 focus:ring-brand/20"
                />
              </div>

              {/* Report list */}
              <ul className="space-y-2">
                {items.length === 0 ? (
                  <li className="rounded-xl border border-dashed border-border/50 py-10 text-center text-sm text-muted">
                    No reports match your search.
                  </li>
                ) : (
                  items.map((r) => {
                    const meta = REPORT_META[r.title];
                    const isStarred = starred.has(r.title);
                    return (
                      <li
                        key={r.title}
                        className="group rounded-xl border border-border/50 bg-surface/80 px-4 py-3.5 transition-all hover:border-border hover:shadow-sm"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => toggleStar(r.title)}
                                className="shrink-0 text-sm leading-none transition-transform hover:scale-110"
                                aria-label={isStarred ? "Unstar" : "Star"}
                              >
                                <span className={isStarred ? "text-warning" : "text-muted/50 hover:text-muted"}>
                                  {isStarred ? "★" : "☆"}
                                </span>
                              </button>
                              <p className="text-[13px] font-semibold text-primary">{r.title}</p>
                              {meta?.scheduled && (
                                <Badge variant="secondary" size="sm">Scheduled</Badge>
                              )}
                            </div>
                            <p className="mt-0.5 pl-6 text-xs text-secondary">{r.subtitle}</p>
                            {meta && (
                              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 pl-6 text-[11px] text-muted">
                                {meta.lastRun && <span>Last run: <span className="text-secondary">{meta.lastRun}</span></span>}
                                <span className="flex items-center gap-1">
                                  {meta.format.map((f) => (
                                    <span key={f} className="rounded-md border border-border/50 px-1.5 py-0.5 font-mono text-[10px] text-muted">{f}</span>
                                  ))}
                                </span>
                              </div>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => setRunningReport(r.title)}
                            className="shrink-0 rounded-lg border border-border/60 px-4 py-1.5 text-xs font-semibold text-secondary transition-colors hover:border-brand/40 hover:bg-brand-light hover:text-primary"
                          >
                            Run →
                          </button>
                        </div>
                      </li>
                    );
                  })
                )}
              </ul>
            </>
          )}
        </ModulePageShell>
      </ModuleSplitLayout>

      {runningReport && (
        <RunReportModal
          title={runningReport}
          onClose={() => setRunningReport(null)}
        />
      )}
    </>
  );
}
