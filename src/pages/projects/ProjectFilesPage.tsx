import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Select, type SelectOption } from "@/components/ui/select";
import { FILE_TYPE_CARD_BADGE } from "@/config/pm/files";
import { ModulePageShell } from "@/features/project-ui/components";
import {
  DUMMY_FILES,
  DUMMY_FOLDERS,
  type DummyFile,
} from "@/features/project-ui/projectDummyData";

function fileRowKey(r: DummyFile) {
  return `${r.folder}::${r.name}`;
}

function typeLabel(type: string): string {
  return FILE_TYPE_CARD_BADGE[type]?.label ?? FILE_TYPE_CARD_BADGE.other.label;
}

function FileGridCard({ file }: { file: DummyFile }) {
  const meta = FILE_TYPE_CARD_BADGE[file.type] ?? FILE_TYPE_CARD_BADGE.other;
  return (
    <div className="group flex min-w-0 flex-col gap-2 rounded-lg border border-border/60 bg-surface px-3 py-2.5 transition-colors hover:border-border">
      <div className="flex items-start gap-2">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md border text-[10px] font-bold ${meta.className}`}
        >
          {meta.label}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-medium text-primary" title={file.name}>
            {file.name}
          </p>
          <p className="truncate text-[11px] text-muted">
            {file.size} · {file.date}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ProjectFilesPage() {
  const { t } = useTranslation();
  const [folder, setFolder] = useState<string | null>(null);
  const [view, setView] = useState<"list" | "grid">("list");

  const filtered = useMemo(
    () =>
      folder ? DUMMY_FILES.filter((f) => f.folder === folder) : [...DUMMY_FILES],
    [folder],
  );

  const folderSelectOptions: SelectOption[] = useMemo(() => {
    const opts: SelectOption[] = [
      {
        value: "__all__",
        label: `${t("filesPage.allFiles")} (${DUMMY_FILES.length})`,
      },
    ];
    for (const f of DUMMY_FOLDERS) {
      const count = DUMMY_FILES.filter((file) => file.folder === f).length;
      opts.push({ value: f, label: `${f} (${count})` });
    }
    return opts;
  }, [t]);

  const folderSelectValue = folder ?? "__all__";

  const listColumns: DataTableColumn<DummyFile>[] = useMemo(
    () => [
      {
        id: "name",
        header: t("filesPage.colName"),
        headerClassName: "pl-4 pr-3 min-w-[12rem]",
        cellClassName: "pl-4 pr-3 min-w-0",
        sortValue: (r) => r.name.toLowerCase(),
        cell: (r) => {
          const meta = FILE_TYPE_CARD_BADGE[r.type] ?? FILE_TYPE_CARD_BADGE.other;
          return (
            <div className="flex min-w-0 items-center gap-2">
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md border text-[9px] font-bold ${meta.className}`}
              >
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
        headerClassName: "px-3 whitespace-nowrap",
        cellClassName: "px-3 whitespace-nowrap",
        sortValue: (r) => r.date,
        cell: (r) => (
          <span className="text-[13px] tabular-nums text-secondary">{r.date}</span>
        ),
      },
      {
        id: "type",
        header: t("filesPage.colType"),
        headerClassName: "px-3",
        cellClassName: "px-3",
        sortValue: (r) => typeLabel(r.type),
        cell: (r) => (
          <span className="text-[13px] text-secondary">{typeLabel(r.type)}</span>
        ),
      },
      {
        id: "size",
        header: t("filesPage.colSize"),
        headerClassName: "px-3",
        cellClassName: "px-3",
        align: "right",
        sortValue: (r) => r.size,
        cell: (r) => (
          <span className="text-[13px] tabular-nums text-secondary">{r.size}</span>
        ),
      },
      {
        id: "by",
        header: t("filesPage.colUploadedBy"),
        headerClassName: "px-3",
        cellClassName: "px-3",
        sortValue: (r) => r.by,
        cell: (r) => (
          <span className="text-[13px] text-secondary">{r.by}</span>
        ),
      },
      {
        id: "version",
        header: t("filesPage.colVersion"),
        headerClassName: "px-3 hidden lg:table-cell",
        cellClassName: "px-3 hidden lg:table-cell",
        sortValue: (r) => r.version,
        cell: (r) => (
          <span className="font-mono text-[12px] text-secondary">{r.version}</span>
        ),
      },
      {
        id: "status",
        header: t("filesPage.colStatus"),
        headerClassName: "px-3 hidden xl:table-cell",
        cellClassName: "px-3 hidden xl:table-cell",
        sortValue: (r) => r.status,
        cell: (r) => (
          <span className="text-[12px] text-secondary">{r.status}</span>
        ),
      },
      {
        id: "folder",
        header: t("filesPage.colFolder"),
        headerClassName: "px-3 hidden md:table-cell",
        cellClassName: "px-3 hidden md:table-cell",
        sortValue: (r) => r.folder,
        cell: (r) => (
          <span className="block max-w-[10rem] truncate text-[12px] text-muted" title={r.folder}>
            {r.folder}
          </span>
        ),
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
                <button
                  type="button"
                  className="flex w-full px-3 py-2 text-start text-primary hover:bg-muted/12"
                >
                  {t("filesPage.actionDownload")}
                </button>
                <button
                  type="button"
                  className="flex w-full px-3 py-2 text-start text-primary hover:bg-muted/12"
                >
                  {t("filesPage.actionRename")}
                </button>
                <button
                  type="button"
                  className="flex w-full px-3 py-2 text-start text-primary hover:bg-muted/12"
                >
                  {t("filesPage.actionMove")}
                </button>
                <button
                  type="button"
                  className="flex w-full px-3 py-2 text-start text-danger hover:bg-danger/10"
                >
                  {t("filesPage.actionDelete")}
                </button>
              </div>
            </details>
          </div>
        ),
      },
    ],
    [t],
  );

  return (
    <ModulePageShell>
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

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-lg border border-border/60 bg-surface">
        <div className="flex flex-col gap-3 border-b border-border/50 px-3 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-4">
          <nav
            aria-label={t("filesPage.breadcrumbAria")}
            className="flex min-w-0 flex-wrap items-center gap-1 text-[13px]"
          >
            <button
              type="button"
              onClick={() => setFolder(null)}
              className={`rounded-md px-2 py-1 font-medium transition-colors ${
                !folder
                  ? "bg-brand/10 text-primary"
                  : "text-secondary hover:bg-muted/10 hover:text-primary"
              }`}
            >
              {t("filesPage.rootLabel")}
            </button>
            {folder ? (
              <>
                <span className="text-muted" aria-hidden>
                  /
                </span>
                <span className="truncate font-medium text-primary" title={folder}>
                  {folder}
                </span>
              </>
            ) : null}
          </nav>

          <div className="flex w-full min-w-0 flex-col gap-2 sm:w-auto sm:max-w-sm">
            <Select
              label={t("filesPage.folderLocation")}
              options={folderSelectOptions}
              value={folderSelectValue}
              onValueChange={(v) => setFolder(v === "__all__" ? null : v)}
              size="sm"
              fullWidth
              triggerClassName="h-9"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="p-6">
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
            tableMinWidthClassName="min-w-[56rem]"
            minWidthTableLayout="fixed"
            maxHeightClassName="max-h-[min(65dvh,calc(100dvh-14rem))]"
            className="rounded-none border-0"
            hideScrollbar={false}
          />
        ) : (
          <div className="grid max-h-[min(65dvh,calc(100dvh-14rem))] gap-2 overflow-y-auto p-3 sm:grid-cols-2 sm:p-4 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((f) => (
              <FileGridCard key={fileRowKey(f)} file={f} />
            ))}
          </div>
        )}
      </div>
    </ModulePageShell>
  );
}
