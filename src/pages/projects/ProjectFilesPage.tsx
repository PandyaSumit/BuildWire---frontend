import { useState } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import {
  DUMMY_FILES,
  DUMMY_FOLDERS,
  type DummyFile,
} from "@/features/project-ui/projectDummyData";

const FILE_ICON: Record<string, { icon: string; cls: string }> = {
  pdf: {
    icon: "PDF",
    cls: "bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20",
  },
  spreadsheet: {
    icon: "XLS",
    cls: "bg-green-500/10 text-green-700 dark:text-green-300 border-green-500/20",
  },
  doc: {
    icon: "DOC",
    cls: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20",
  },
  other: {
    icon: "FILE",
    cls: "bg-muted/30 text-muted border-border",
  },
};

function FileCard({ file }: { file: DummyFile }) {
  const { icon, cls } = FILE_ICON[file.type] ?? FILE_ICON.other;
  return (
    <div className="group flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 transition-all hover:border-brand/30 hover:shadow-sm">
      {/* Thumbnail */}
      <div
        className={`flex h-16 items-center justify-center rounded-xl border text-xs font-bold uppercase tracking-wide ${cls}`}
      >
        {icon}
      </div>

      {/* File info */}
      <div className="min-w-0">
        <p
          className="truncate text-sm font-medium text-primary"
          title={file.name}
        >
          {file.name}
        </p>
        <p className="mt-0.5 text-[11px] text-muted">
          {file.size} · {file.by} · {file.date}
        </p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-2">
        <span className="rounded-full bg-muted/15 px-2 py-0.5 text-[11px] text-muted">
          {file.folder}
        </span>
        <button
          type="button"
          className="rounded-lg border border-border px-2 py-1 text-[11px] text-secondary opacity-0 transition-opacity hover:text-primary group-hover:opacity-100"
        >
          Download
        </button>
      </div>
    </div>
  );
}

export default function ProjectFilesPage() {
  const [folder, setFolder] = useState<string | null>(null);

  const filtered = folder
    ? DUMMY_FILES.filter((f) => f.folder === folder)
    : DUMMY_FILES;

  return (
    <div className="flex min-h-full">
      {/* Folder sidebar */}
      <aside className="w-56 shrink-0 border-r border-border bg-surface p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
            Folders
          </p>
          <button
            type="button"
            className="flex h-5 w-5 items-center justify-center rounded text-muted hover:bg-muted/15 hover:text-primary"
            aria-label="New folder"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        <nav className="space-y-0.5 text-sm">
          <button
            type="button"
            onClick={() => setFolder(null)}
            className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-colors ${
              !folder
                ? "bg-brand-light font-medium text-primary"
                : "text-secondary hover:bg-muted/10 hover:text-primary"
            }`}
          >
            <span>All files</span>
            <span className="text-[11px] text-muted">{DUMMY_FILES.length}</span>
          </button>

          {DUMMY_FOLDERS.map((f) => {
            const count = DUMMY_FILES.filter((file) => file.folder === f).length;
            return (
              <button
                key={f}
                type="button"
                onClick={() => setFolder(f)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-colors ${
                  folder === f
                    ? "bg-brand-light font-medium text-primary"
                    : "text-secondary hover:bg-muted/10 hover:text-primary"
                }`}
              >
                <span className="truncate text-[13px]">{f}</span>
                {count > 0 && (
                  <span className="text-[11px] text-muted">{count}</span>
                )}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col gap-5 p-6">
        <PageHeader
          title="Files"
          description={
            folder ? `Showing: ${folder}` : "All folders · document library"
          }
          actions={
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rounded-lg border border-border px-3 py-2 text-sm text-secondary hover:bg-muted/10 hover:text-primary"
              >
                List
              </button>
              <Button size="sm">Upload</Button>
            </div>
          }
        />

        {filtered.length === 0 ? (
          <EmptyState
            title="No files in this folder"
            description="Upload documents to this folder."
            action={{ label: "Upload" }}
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((f) => (
              <FileCard key={f.name} file={f} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
