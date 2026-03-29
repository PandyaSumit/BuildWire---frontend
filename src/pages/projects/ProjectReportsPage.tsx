import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
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

export default function ProjectReportsPage() {
  const [cat, setCat] = useState<ReportCategoryId>("Overview");
  const items = useMemo(
    () => DUMMY_REPORTS_BY_CATEGORY[cat] ?? [],
    [cat],
  );

  const sidebar = (
    <nav className="flex flex-row gap-1 overflow-x-auto md:flex-col md:gap-0.5 md:overflow-visible">
      {REPORT_CATEGORIES.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => setCat(c)}
          className={`flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors md:w-full ${
            cat === c
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
    </nav>
  );

  return (
    <ModuleSplitLayout sidebar={sidebar} sidebarLabel="Categories">
      <ModulePageShell>
        <PageHeader
          title="Reports"
          description={`${cat} — choose a report to run or schedule.`}
          actions={<Button size="sm">Export bundle</Button>}
        />

        <ul className="space-y-2">
          {items.map((r) => (
            <li
              key={r.title}
              className="group flex flex-col gap-2 rounded-xl bg-surface/80 px-4 py-3 transition-colors hover:bg-muted/[0.06] sm:flex-row sm:items-center"
            >
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-primary">{r.title}</p>
                <p className="mt-0.5 text-xs text-secondary">{r.subtitle}</p>
              </div>
              <button
                type="button"
                className="shrink-0 rounded-lg border border-border/60 px-3 py-1.5 text-xs font-medium text-secondary opacity-80 transition-opacity hover:border-brand/35 hover:text-primary group-hover:opacity-100 sm:opacity-100"
              >
                Run →
              </button>
            </li>
          ))}
        </ul>
      </ModulePageShell>
    </ModuleSplitLayout>
  );
}
