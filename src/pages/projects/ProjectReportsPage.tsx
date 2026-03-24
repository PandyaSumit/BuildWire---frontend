import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { DUMMY_REPORTS_BY_CATEGORY } from "@/features/project-ui/projectDummyData";

const CATS = ["Overview", "Field", "Financial", "Quality", "Custom"] as const;
type Cat = (typeof CATS)[number];

const CAT_ICONS: Record<Cat, string> = {
  Overview: "◈",
  Field: "⛏",
  Financial: "₹",
  Quality: "✓",
  Custom: "⊞",
};

export default function ProjectReportsPage() {
  const [cat, setCat] = useState<Cat>("Overview");
  const items = DUMMY_REPORTS_BY_CATEGORY[cat] ?? [];

  return (
    <div className="flex min-h-full">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r border-border bg-surface p-4">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted">
          Categories
        </p>
        <nav className="space-y-0.5">
          {CATS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCat(c)}
              className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                cat === c
                  ? "bg-brand-light font-medium text-primary"
                  : "text-secondary hover:bg-muted/10 hover:text-primary"
              }`}
            >
              <span className="shrink-0 text-base leading-none text-muted">
                {CAT_ICONS[c]}
              </span>
              <span>{c}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col gap-5 p-6">
        <PageHeader
          title="Reports"
          description={`${cat} reports — pick a report to run.`}
          actions={<Button size="sm">Export bundle</Button>}
        />

        <ul className="space-y-2">
          {items.map((r) => (
            <li
              key={r.title}
              className="group flex flex-col gap-2 rounded-xl border border-border bg-surface px-4 py-3 transition-colors hover:border-brand/30 sm:flex-row sm:items-center"
            >
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-primary">
                  {r.title}
                </p>
                <p className="mt-0.5 text-xs text-secondary">{r.subtitle}</p>
              </div>
              <button
                type="button"
                className="shrink-0 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-secondary opacity-0 transition-opacity hover:border-brand/40 hover:text-primary group-hover:opacity-100 sm:opacity-100"
              >
                Run →
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
