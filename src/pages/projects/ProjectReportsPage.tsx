import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { KpiStatCard } from "@/components/ui/kpi-stat-card";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import {
  REPORT_CATEGORIES,
  REPORT_CATEGORY_ICONS,
  type ReportCategoryId,
} from "@/config/pm/reports";
import {
  ModulePageShell,
  ModuleSplitLayout,
} from "@/features/project-ui/components";
import { DUMMY_REPORTS_BY_CATEGORY } from "@/features/project-ui/projectDummyData";

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
export default function ProjectReportsPage() {
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
      next.has(title) ? next.delete(title) : next.add(title);
      return next;
    });

  const sidebar = (
    <nav className="flex flex-row gap-1 overflow-x-auto md:flex-col md:gap-0.5 md:overflow-visible">
      {REPORT_CATEGORIES.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => { setCat(c); setTab("reports"); }}
          className={`flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors md:w-full ${
            cat === c && tab === "reports"
              ? "bg-brand-light font-medium text-primary"
              : "text-secondary hover:bg-muted/10 hover:text-primary"
          }`}
        >
          <span className="shrink-0 text-base leading-none text-muted">
            {REPORT_CATEGORY_ICONS[c]}
          </span>
          <span className="whitespace-nowrap">{c}</span>
        </button>
      ))}
      <div className="my-1 border-t border-border/50 md:my-2" />
      <button
        type="button"
        onClick={() => setTab("scheduled")}
        className={`flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors md:w-full ${
          tab === "scheduled"
            ? "bg-brand-light font-medium text-primary"
            : "text-secondary hover:bg-muted/10 hover:text-primary"
        }`}
      >
        <span className="shrink-0 text-base leading-none text-muted">🕐</span>
        <span className="whitespace-nowrap">Scheduled</span>
        <Badge variant="secondary" size="sm" className="ml-auto">
          {SCHEDULED_REPORTS.length}
        </Badge>
      </button>
    </nav>
  );

  return (
    <>
      <ModuleSplitLayout sidebar={sidebar} sidebarLabel="Categories">
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
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
                  className="rounded-xl border border-border/60 bg-surface px-4 py-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-[13px] font-semibold text-primary">{r.title}</p>
                      <p className="mt-0.5 text-xs text-secondary">{r.schedule} · To: {r.recipients}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" size="sm">{r.format}</Badge>
                      <button
                        type="button"
                        className="rounded-lg border border-border/60 px-3 py-1 text-xs text-secondary hover:border-danger/40 hover:text-danger"
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
                  <p className="mt-1.5 text-[11px] text-muted">Next run: {r.nextRun}</p>
                </div>
              ))}
              <button
                type="button"
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border/60 py-3 text-sm text-secondary hover:border-brand/40 hover:text-primary"
              >
                + Schedule a new report
              </button>
            </div>
          ) : (
            <>
              {/* Search */}
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
                  🔍
                </span>
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search reports…"
                  className="w-full rounded-xl border border-border/60 bg-bg py-2 pl-9 pr-4 text-sm text-primary placeholder:text-muted focus:border-brand/50 focus:outline-none"
                />
              </div>

              {/* Report list */}
              <ul className="space-y-2">
                {items.length === 0 ? (
                  <li className="py-8 text-center text-sm text-muted">
                    No reports match your search.
                  </li>
                ) : (
                  items.map((r) => {
                    const meta = REPORT_META[r.title];
                    const isStarred = starred.has(r.title);
                    return (
                      <li
                        key={r.title}
                        className="group rounded-xl border border-border/50 bg-surface/80 px-4 py-3 transition-colors hover:border-brand/25 hover:bg-muted/[0.04]"
                      >
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => toggleStar(r.title)}
                                className="shrink-0 text-base leading-none transition-transform hover:scale-110"
                                aria-label={isStarred ? "Unstar" : "Star"}
                              >
                                {isStarred ? "⭐" : "☆"}
                              </button>
                              <p className="text-[13px] font-semibold text-primary">
                                {r.title}
                              </p>
                              {meta?.scheduled && (
                                <Badge variant="secondary" size="sm">Scheduled</Badge>
                              )}
                            </div>
                            <p className="mt-0.5 pl-6 text-xs text-secondary">{r.subtitle}</p>
                            {meta && (
                              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 pl-6 text-[11px] text-muted">
                                {meta.lastRun && <span>Last run: {meta.lastRun}</span>}
                                <span>{meta.format.join(" · ")}</span>
                              </div>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => setRunningReport(r.title)}
                            className="shrink-0 rounded-lg border border-border/60 px-3 py-1.5 text-xs font-medium text-secondary transition-colors hover:border-brand/40 hover:bg-brand-light hover:text-primary"
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
