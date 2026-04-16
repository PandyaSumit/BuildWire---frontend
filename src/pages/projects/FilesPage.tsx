import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { FILE_TYPE_CARD_BADGE } from "@/config/pm/files";
import { ModulePageShell } from "@/components/project";
import {
  DUMMY_FILES,
  DUMMY_FOLDERS,
  type DummyFile,
} from "@/services/project/projectDummyData";

function fileRowKey(r: DummyFile) {
  return `${r.folder}::${r.name}`;
}

function typeLabel(type: string): string {
  return FILE_TYPE_CARD_BADGE[type]?.label ?? FILE_TYPE_CARD_BADGE.other.label;
}

// ── Improved grid card ────────────────────────────────────────────────────────
function FileGridCard({ file }: { file: DummyFile }) {
  const { t } = useTranslation();
  const meta = FILE_TYPE_CARD_BADGE[file.type] ?? FILE_TYPE_CARD_BADGE.other;
  return (
    <div className="group relative flex min-w-0 cursor-pointer flex-col gap-3 rounded-xl border border-border/60 bg-surface p-3.5 transition-all hover:border-border hover:shadow-sm">
      {/* File type badge */}
      <div className="flex items-start justify-between gap-2">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border text-[10px] font-bold ${meta.className}`}
        >
          {meta.label}
        </div>
        {/* Hover actions */}
        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            type="button"
            title={t("filesPage.actionDownload")}
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted hover:bg-muted/15 hover:text-primary"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
          <details className="relative">
            <summary
              className="flex h-7 w-7 cursor-pointer list-none items-center justify-center rounded-md text-muted marker:content-none hover:bg-muted/15 hover:text-primary [&::-webkit-details-marker]:hidden"
              aria-label={t("filesPage.actionsMenu")}
            >
              <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path d="M12 8a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </summary>
            <div className="absolute end-0 top-full z-20 mt-1 min-w-[10rem] rounded-lg border border-border/80 bg-elevated py-1 text-[13px] shadow-lg">
              <button type="button" className="flex w-full px-3 py-2 text-start text-primary hover:bg-muted/12">{t("filesPage.actionRename")}</button>
              <button type="button" className="flex w-full px-3 py-2 text-start text-primary hover:bg-muted/12">{t("filesPage.actionMove")}</button>
              <div className="my-1 border-t border-border/40" />
              <button type="button" className="flex w-full px-3 py-2 text-start text-danger hover:bg-danger/10">{t("filesPage.actionDelete")}</button>
            </div>
          </details>
        </div>
      </div>

      {/* File info */}
      <div className="min-w-0">
        <p className="truncate text-[13px] font-semibold text-primary leading-snug" title={file.name}>
          {file.name}
        </p>
        <p className="mt-0.5 text-[11px] text-muted">
          {file.size} · {file.date}
        </p>
        <p className="mt-0.5 truncate text-[11px] text-muted">
          {t("filesPage.colUploadedBy")}: {file.by}
        </p>
      </div>

      {/* Footer: version */}
      {file.version && (
        <div className="border-t border-border/40 pt-2">
          <span className="font-mono text-[10px] text-muted">{file.version}</span>
          {file.status && (
            <span className="ml-2 text-[10px] text-muted">{file.status}</span>
          )}
        </div>
      )}
    </div>
  );
}

// ── Folder sidebar item ───────────────────────────────────────────────────────
function FolderItem({
  label,
  count,
  active,
  onClick,
  isRoot,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  isRoot?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left text-[13px] transition-colors ${
        active
          ? "bg-brand-light font-semibold text-primary"
          : "text-secondary hover:bg-muted/10 hover:text-primary"
      }`}
    >
      <span className="flex min-w-0 items-center gap-2 truncate">
        {isRoot ? (
          <svg className="h-3.5 w-3.5 shrink-0 text-muted" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
          </svg>
        ) : (
          <svg className="h-3.5 w-3.5 shrink-0 text-muted" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
        )}
        <span className="truncate">{label}</span>
      </span>
      <span className={`shrink-0 text-[11px] tabular-nums ${active ? "text-secondary" : "text-muted"}`}>
        {count}
      </span>
    </button>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function FilesPage() {
  const { t } = useTranslation();
  const [folder, setFolder] = useState<string | null>(null);
  const [view, setView] = useState<"list" | "grid">("list");

  const filtered = useMemo(
    () => folder ? DUMMY_FILES.filter((f) => f.folder === folder) : [...DUMMY_FILES],
    [folder],
  );

  const folderCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const f of DUMMY_FILES) {
      map.set(f.folder, (map.get(f.folder) ?? 0) + 1);
    }
    return map;
  }, []);

  const listColumns: DataTableColumn<DummyFile>[] = useMemo(
    () => [
      {
        id: "name",
        header: t("filesPage.colName"),
        headerClassName: "min-w-[12rem]",
        cellClassName: "min-w-0",
        sortValue: (r) => r.name.toLowerCase(),
        cell: (r) => {
          const meta = FILE_TYPE_CARD_BADGE[r.type] ?? FILE_TYPE_CARD_BADGE.other;
          return (
            <div className="flex min-w-0 items-center gap-2.5">
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-[9px] font-bold ${meta.className}`}>
                {meta.label}
              </span>
              <span className="min-w-0 truncate text-[13px] font-medium text-primary" title={r.name}>
                {r.name}
              </span>
            </div>
          );
        },
      },
      {
        id: "modified",
        header: t("filesPage.colModified"),
        headerClassName: "whitespace-nowrap",
        cellClassName: "whitespace-nowrap",
        sortValue: (r) => r.date,
        cell: (r) => <span className="text-[13px] tabular-nums text-secondary">{r.date}</span>,
      },
      {
        id: "type",
        header: t("filesPage.colType"),
        headerClassName: "",
        cellClassName: "",
        sortValue: (r) => typeLabel(r.type),
        cell: (r) => <span className="text-[13px] text-secondary">{typeLabel(r.type)}</span>,
      },
      {
        id: "size",
        header: t("filesPage.colSize"),
        headerClassName: "",
        cellClassName: "",
        align: "right",
        sortValue: (r) => r.size,
        cell: (r) => <span className="text-[13px] tabular-nums text-secondary">{r.size}</span>,
      },
      {
        id: "by",
        header: t("filesPage.colUploadedBy"),
        headerClassName: "",
        cellClassName: "",
        sortValue: (r) => r.by,
        cell: (r) => <span className="text-[13px] text-secondary">{r.by}</span>,
      },
      {
        id: "version",
        header: t("filesPage.colVersion"),
        headerClassName: "hidden lg:table-cell",
        cellClassName: "hidden lg:table-cell",
        sortValue: (r) => r.version,
        cell: (r) => <span className="font-mono text-[12px] text-muted">{r.version}</span>,
      },
      {
        id: "status",
        header: t("filesPage.colStatus"),
        headerClassName: "hidden xl:table-cell",
        cellClassName: "hidden xl:table-cell",
        sortValue: (r) => r.status,
        cell: (r) => <span className="text-[12px] text-secondary">{r.status}</span>,
      },
      {
        id: "actions",
        header: "",
        headerClassName: "pr-4 w-10",
        cellClassName: "pr-4",
        cell: () => (
          <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
            <details className="relative">
              <summary
                className="flex h-8 w-8 cursor-pointer list-none items-center justify-center rounded-lg text-muted marker:content-none hover:bg-muted/12 hover:text-primary [&::-webkit-details-marker]:hidden"
                aria-label={t("filesPage.actionsMenu")}
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path d="M12 8a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </summary>
              <div className="absolute end-0 top-full z-20 mt-0.5 min-w-[10rem] rounded-lg border border-border/80 bg-elevated py-1 text-[13px] shadow-lg">
                <button type="button" className="flex w-full px-3 py-2 text-start text-primary hover:bg-muted/12">{t("filesPage.actionDownload")}</button>
                <button type="button" className="flex w-full px-3 py-2 text-start text-primary hover:bg-muted/12">{t("filesPage.actionRename")}</button>
                <button type="button" className="flex w-full px-3 py-2 text-start text-primary hover:bg-muted/12">{t("filesPage.actionMove")}</button>
                <div className="my-1 border-t border-border/40" />
                <button type="button" className="flex w-full px-3 py-2 text-start text-danger hover:bg-danger/10">{t("filesPage.actionDelete")}</button>
              </div>
            </details>
          </div>
        ),
      },
    ],
    [t],
  );

  const activeLabel = folder ?? t("filesPage.allFiles");

  return (
    <ModulePageShell padding="none">
      {/* ── Page header with padding ─────────────────────────────────── */}
      <div className="px-4 pb-4 pt-5 sm:px-6">
        <PageHeader
          title={t("filesPage.title")}
          description={t("filesPage.description")}
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <SegmentedControl
                value={view}
                onChange={setView}
                options={[
                  { value: "list", label: t("filesPage.viewList") },
                  { value: "grid", label: t("filesPage.viewGrid") },
                ]}
              />
              <Button type="button" size="sm">
                {t("filesPage.upload")}
              </Button>
            </div>
          }
        />
      </div>

      {/* ── Split layout: folder sidebar + file content ──────────────── */}
      <div className="flex min-h-0 flex-1 border-t border-border/40">

        {/* Folder sidebar — desktop */}
        <aside className="hidden w-48 shrink-0 flex-col overflow-y-auto border-e border-border/40 bg-surface/60 sm:flex">
          <div className="space-y-0.5 p-2.5">
            <p className="mb-2 px-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted">
              {t("filesPage.breadcrumbAria")}
            </p>
            <FolderItem
              label={t("filesPage.allFiles")}
              count={DUMMY_FILES.length}
              active={folder === null}
              onClick={() => setFolder(null)}
              isRoot
            />
            <div className="my-1.5 border-t border-border/40" />
            {DUMMY_FOLDERS.map((f) => (
              <FolderItem
                key={f}
                label={f}
                count={folderCounts.get(f) ?? 0}
                active={folder === f}
                onClick={() => setFolder(f)}
              />
            ))}
          </div>
        </aside>

        {/* Folder tabs — mobile (horizontal scroll) */}
        <div className="flex sm:hidden w-full shrink-0 flex-col border-b border-border/40">
          <div className="flex gap-1 overflow-x-auto px-3 py-2">
            <button
              type="button"
              onClick={() => setFolder(null)}
              className={`h-7 shrink-0 rounded-full border px-3 text-[11px] font-medium transition-colors ${
                folder === null
                  ? "border-brand/50 bg-brand-light text-primary"
                  : "border-border/60 text-secondary hover:border-border"
              }`}
            >
              {t("filesPage.allFiles")} ({DUMMY_FILES.length})
            </button>
            {DUMMY_FOLDERS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFolder(f)}
                className={`h-7 shrink-0 rounded-full border px-3 text-[11px] font-medium transition-colors ${
                  folder === f
                    ? "border-brand/50 bg-brand-light text-primary"
                    : "border-border/60 text-secondary hover:border-border"
                }`}
              >
                {f} ({folderCounts.get(f) ?? 0})
              </button>
            ))}
          </div>
        </div>

        {/* ── File content area ────────────────────────────────────────── */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Content toolbar */}
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border/40 px-4 py-2.5">
            <div>
              <p className="text-[13px] font-semibold text-primary">{activeLabel}</p>
              <p className="text-[11px] text-muted">{filtered.length} {t("filesPage.filesCount", { defaultValue: "files" })}</p>
            </div>
          </div>

          {/* File list / grid */}
          {filtered.length === 0 ? (
            <div className="flex flex-1 items-center justify-center p-8">
              <EmptyState
                title={t("filesPage.emptyTitle")}
                description={t("filesPage.emptyDescription")}
                action={{ label: t("filesPage.upload") }}
              />
            </div>
          ) : view === "list" ? (
            <DataTable<DummyFile>
              variant="flush"
              columns={listColumns}
              data={filtered}
              rowKey={fileRowKey}
              tableMinWidthClassName="min-w-[50rem]"
              minWidthTableLayout="fixed"
              maxHeightClassName="max-h-none"
              className="rounded-none border-0"
              hideScrollbar={false}
            />
          ) : (
            <div className="grid gap-3 overflow-y-auto p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((f) => (
                <FileGridCard key={fileRowKey(f)} file={f} />
              ))}
            </div>
          )}
        </div>
      </div>
    </ModulePageShell>
  );
}
