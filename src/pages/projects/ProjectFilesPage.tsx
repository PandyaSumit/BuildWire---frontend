import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { FILE_TYPE_CARD_BADGE } from "@/config/pm/files";
import {
  ModulePageShell,
  ModuleSplitLayout,
} from "@/features/project-ui/components";
import {
  DUMMY_FILES,
  DUMMY_FOLDERS,
  type DummyFile,
} from "@/features/project-ui/projectDummyData";

function FileCard({ file }: { file: DummyFile }) {
  const meta = FILE_TYPE_CARD_BADGE[file.type] ?? FILE_TYPE_CARD_BADGE.other;
  return (
    <div className="group flex flex-col gap-3 rounded-2xl border border-border/60 bg-surface p-4 transition-all hover:border-brand/25 hover:shadow-sm">
      <div
        className={`flex h-16 items-center justify-center rounded-xl border text-xs font-bold uppercase tracking-wide ${meta.className}`}
      >
        {meta.label}
      </div>

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

      <div className="flex items-center justify-between gap-2">
        <span className="rounded-full bg-muted/15 px-2 py-0.5 text-[11px] text-muted">
          {file.folder}
        </span>
        <button
          type="button"
          className="rounded-lg border border-border/60 px-2 py-1 text-[11px] text-secondary opacity-0 transition-opacity hover:text-primary group-hover:opacity-100"
        >
          Download
        </button>
      </div>
    </div>
  );
}

export default function ProjectFilesPage() {
  const [folder, setFolder] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      folder ? DUMMY_FILES.filter((f) => f.folder === folder) : DUMMY_FILES,
    [folder],
  );

  const sidebar = (
    <>
      <div className="mb-3 hidden items-center justify-between md:flex">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
          Folders
        </p>
        <button
          type="button"
          className="flex h-5 w-5 items-center justify-center rounded text-muted hover:bg-muted/15 hover:text-primary"
          aria-label="New folder"
        >
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>
      </div>

      <nav className="flex flex-row gap-1 overflow-x-auto md:flex-col md:gap-0.5 md:overflow-visible">
        <button
          type="button"
          onClick={() => setFolder(null)}
          className={`flex w-max shrink-0 items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors md:w-full ${
            !folder
              ? "bg-brand-light font-medium text-primary"
              : "text-secondary hover:bg-muted/10 hover:text-primary"
          }`}
        >
          <span>All files</span>
          <span className="hidden text-[11px] text-muted md:inline">
            {DUMMY_FILES.length}
          </span>
        </button>

        {DUMMY_FOLDERS.map((f) => {
          const count = DUMMY_FILES.filter((file) => file.folder === f).length;
          return (
            <button
              key={f}
              type="button"
              onClick={() => setFolder(f)}
              className={`flex w-max shrink-0 items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors md:w-full ${
                folder === f
                  ? "bg-brand-light font-medium text-primary"
                  : "text-secondary hover:bg-muted/10 hover:text-primary"
              }`}
            >
              <span className="truncate">{f}</span>
              {count > 0 ? (
                <span className="hidden text-[11px] text-muted md:inline">
                  {count}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>
    </>
  );

  return (
    <ModuleSplitLayout sidebar={sidebar}>
      <ModulePageShell>
        <PageHeader
          title="Files"
          description={
            folder
              ? `Showing: ${folder}`
              : "All folders · project document library"
          }
          actions={
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rounded-lg border border-border/60 px-3 py-2 text-sm text-secondary hover:bg-muted/10 hover:text-primary"
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
      </ModulePageShell>
    </ModuleSplitLayout>
  );
}
