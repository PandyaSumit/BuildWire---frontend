import { useState } from "react";
import {
  DUMMY_FILES,
  DUMMY_FOLDERS,
} from "@/features/project-ui/projectDummyData";

export default function ProjectFilesPage() {
  const [folder, setFolder] = useState<string | null>(null);
  const filtered = folder
    ? DUMMY_FILES.filter((f) => f.folder === folder)
    : DUMMY_FILES;

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <aside className="w-60 shrink-0 border-r border-border bg-surface p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase text-muted">Folders</p>
          <button
            type="button"
            className="text-lg font-bold text-muted hover:text-primary"
          >
            +
          </button>
        </div>
        <nav className="space-y-1 text-sm">
          <button
            type="button"
            onClick={() => setFolder(null)}
            className={`flex w-full rounded-lg px-3 py-2 text-left ${!folder ? "bg-brand-light font-medium text-primary" : "text-secondary hover:bg-muted/10 hover:text-primary"}`}
          >
            All files ({DUMMY_FILES.length})
          </button>
          {DUMMY_FOLDERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFolder(f)}
              className={`flex w-full rounded-lg px-3 py-2 text-left ${folder === f ? "bg-brand-light font-medium text-primary" : "text-secondary hover:bg-muted/10 hover:text-primary"}`}
            >
              {f}
            </button>
          ))}
        </nav>
      </aside>
      <div className="flex-1 p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-[family-name:var(--font-dm-sans)] text-xl font-bold text-primary">
              Files
            </h1>
            <p className="text-sm text-secondary">
              {folder ? `Showing: ${folder}` : "All folders · sample metadata"}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded-lg border border-border px-3 py-2 text-sm"
            >
              List
            </button>
            <button
              type="button"
              className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white dark:text-bg"
            >
              Upload
            </button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((f) => (
            <div
              key={f.name}
              className="rounded-2xl border border-border bg-bg p-4"
            >
              <div className="mb-3 flex h-24 items-center justify-center rounded-xl bg-muted/25 text-xs font-semibold uppercase text-muted">
                {f.type}
              </div>
              <p className="font-medium text-primary">{f.name}</p>
              <p className="mt-1 text-xs text-secondary">
                {f.size} · {f.by} · {f.date}
              </p>
              <p className="mt-1 text-[10px] text-muted">{f.folder}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
