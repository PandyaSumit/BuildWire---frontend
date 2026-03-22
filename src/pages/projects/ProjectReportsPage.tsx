import { useState } from "react";
import { DUMMY_REPORTS_BY_CATEGORY } from "@/features/project-ui/projectDummyData";

const CATS = ["Overview", "Field", "Financial", "Quality", "Custom"] as const;

export default function ProjectReportsPage() {
  const [cat, setCat] = useState<(typeof CATS)[number]>("Overview");

  const items = DUMMY_REPORTS_BY_CATEGORY[cat] ?? [];

  return (
    <div className="flex min-h-[calc(100vh-4rem)] gap-0">
      <aside className="w-56 shrink-0 border-r border-border bg-surface p-4">
        <p className="mb-3 text-xs font-semibold uppercase text-muted">
          Categories
        </p>
        <nav className="space-y-1">
          {CATS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCat(c)}
              className={`w-full rounded-lg px-3 py-2 text-left text-sm font-medium ${
                cat === c
                  ? "bg-brand-light text-primary"
                  : "text-secondary hover:bg-muted/10"
              }`}
            >
              {c} reports
            </button>
          ))}
        </nav>
      </aside>
      <div className="flex-1 p-6">
        <h1 className="font-[family-name:var(--font-dm-sans)] text-xl font-bold text-primary">
          Reports
        </h1>
        <p className="mt-1 text-sm text-secondary">
          {cat} — pick a report to run (sample list).
        </p>
        <ul className="mt-6 space-y-2">
          {items.map((r) => (
            <li
              key={r.title}
              className="flex flex-col gap-1 rounded-xl border border-border bg-surface px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <span className="font-medium text-primary">{r.title}</span>
              <span className="text-xs text-secondary">{r.subtitle}</span>
              <button
                type="button"
                className="mt-2 shrink-0 rounded-lg border border-border px-3 py-1 text-xs font-medium sm:mt-0"
              >
                Run
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
