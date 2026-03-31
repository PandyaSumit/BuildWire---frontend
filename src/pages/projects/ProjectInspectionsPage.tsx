import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useGlobalSearch } from "@/components/layout/GlobalSearchContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Select, type SelectOption } from "@/components/ui/select";
import { SheetDrawer } from "@/components/ui/sheet-drawer";
import { StatsBar } from "@/components/ui/stats-bar";
import {
  INSPECTION_RESULT_BADGE,
  INSPECTION_TYPE_PILL_CLASSES,
} from "@/config/pm/inspections";
import {
  InspectionDetailDrawer,
  nextInspectionId,
  ScheduleInspectionDrawer,
} from "@/features/project-ui/InspectionDrawers";
import { ModulePageShell, SemanticPill, FilterPopover } from "@/features/project-ui/components";
import {
  computeInspectionStats,
  DUMMY_INSPECTIONS,
  type DummyInspection,
  type InspectionResult,
} from "@/features/project-ui/projectDummyData";

function inspectionRowKey(r: DummyInspection) {
  return r.id;
}

function matchesInspectionQuery(row: DummyInspection, q: string): boolean {
  if (!q) return true;
  const n = q.toLowerCase();
  const blob = [
    row.title,
    row.type,
    row.trade ?? "",
    row.location,
    row.by,
    row.date,
    row.result,
    row.status,
    row.templateName,
    ...(row.attachmentLabels ?? []),
    ...row.observations.map((o) => [o.description, o.linkedTaskId ?? "", o.severity].join(" ")),
    ...row.checklistItems.map((c) => c.label),
  ]
    .join(" ")
    .toLowerCase();
  return blob.includes(n);
}

export default function ProjectInspectionsPage() {
  const { t } = useTranslation();
  const { query, setQuery } = useGlobalSearch();
  const qNorm = query.trim().toLowerCase();

  const [rows, setRows] = useState<DummyInspection[]>(() => [...DUMMY_INSPECTIONS]);
  const [selected, setSelected] = useState<DummyInspection | null>(null);
  const [scheduleOpen, setScheduleOpen] = useState(false);

  const [typeFilter, setTypeFilter] = useState("");
  const [resultFilter, setResultFilter] = useState<"" | InspectionResult>("");
  const [statusFilter, setStatusFilter] = useState("");
  const [tradeFilter, setTradeFilter] = useState("");

  const stats = useMemo(() => computeInspectionStats(rows), [rows]);

  const statusChoices = useMemo(() => {
    return [...new Set(rows.map((r) => r.status))].sort();
  }, [rows]);

  const resetFilters = useCallback(() => {
    setTypeFilter("");
    setResultFilter("");
    setStatusFilter("");
    setTradeFilter("");
    setQuery("");
  }, [setQuery]);

  const hasActiveFilters = Boolean(typeFilter || resultFilter || statusFilter || tradeFilter || qNorm);

  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      if (!matchesInspectionQuery(r, qNorm)) return false;
      if (typeFilter && r.type !== typeFilter) return false;
      if (resultFilter && r.result !== resultFilter) return false;
      if (statusFilter && r.status !== statusFilter) return false;
      if (tradeFilter && !(r.trade ?? "").toLowerCase().includes(tradeFilter.toLowerCase())) return false;
      return true;
    });
  }, [rows, qNorm, typeFilter, resultFilter, statusFilter, tradeFilter]);

  const typeOptions: SelectOption[] = useMemo(
    () => [
      { value: "", label: t("inspectionPage.filterAllTypes") },
      ...[...new Set(rows.map((r) => r.type))]
        .sort()
        .map((x) => ({ value: x, label: x })),
    ],
    [rows, t],
  );

  const resultOptions: SelectOption[] = useMemo(
    () => [
      { value: "", label: t("inspectionPage.filterAllResults") },
      { value: "Pass", label: "Pass" },
      { value: "Fail", label: "Fail" },
      { value: "Conditional", label: "Conditional" },
      { value: "Pending", label: t("inspectionPage.resultPending") },
    ],
    [t],
  );

  const statusOptions: SelectOption[] = useMemo(
    () => [
      { value: "", label: t("inspectionPage.filterAllStatuses") },
      ...statusChoices.map((x) => ({ value: x, label: x })),
    ],
    [statusChoices, t],
  );

  const listColumns: DataTableColumn<DummyInspection>[] = useMemo(
    () => [
      {
        id: "title",
        header: t("inspectionPage.colInspection"),
        headerClassName: "pl-4 pr-3 max-w-[14rem]",
        cellClassName: "pl-4 pr-3 max-w-[14rem]",
        sortValue: (r) => r.title,
        cell: (r) => (
          <span className="block min-w-0 truncate text-[13px] font-medium text-primary" title={r.title}>
            {r.title}
          </span>
        ),
      },
      {
        id: "type",
        header: t("inspectionPage.colType"),
        headerClassName: "px-3",
        cellClassName: "px-3",
        sortValue: (r) => r.type,
        cell: (r) => <SemanticPill label={r.type} palette={INSPECTION_TYPE_PILL_CLASSES} />,
      },
      {
        id: "location",
        header: t("inspectionPage.colLocation"),
        headerClassName: "px-3",
        cellClassName: "px-3",
        sortValue: (r) => r.location,
        cell: (r) => (
          <span className="text-[13px] text-secondary">{r.location}</span>
        ),
      },
      {
        id: "by",
        header: t("inspectionPage.colBy"),
        headerClassName: "px-3",
        cellClassName: "px-3",
        sortValue: (r) => r.by,
        cell: (r) => (
          <span className="text-[13px] text-secondary">{r.by}</span>
        ),
      },
      {
        id: "date",
        header: t("inspectionPage.colDate"),
        headerClassName: "px-3",
        cellClassName: "px-3 whitespace-nowrap",
        sortValue: (r) => r.date,
        cell: (r) => (
          <span className="font-mono text-[13px] text-secondary">{r.date}</span>
        ),
      },
      {
        id: "result",
        header: t("inspectionPage.colResult"),
        headerClassName: "px-3",
        cellClassName: "px-3",
        sortValue: (r) => r.result,
        cell: (r) => (
          <Badge variant={INSPECTION_RESULT_BADGE[r.result]} size="sm">
            {r.result === "Pending" ? t("inspectionPage.resultPending") : r.result}
          </Badge>
        ),
      },
      {
        id: "status",
        header: t("inspectionPage.colStatus"),
        headerClassName: "px-3 pr-4",
        cellClassName: "px-3 pr-4",
        sortValue: (r) => r.status,
        cell: (r) => (
          <span className="text-[13px] text-secondary">{r.status}</span>
        ),
      },
    ],
    [t],
  );

  const appendInspection = useCallback((draft: DummyInspection) => {
    setRows((prev) => [{ ...draft, id: nextInspectionId(prev) }, ...prev]);
  }, []);

  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (typeFilter) n++;
    if (resultFilter) n++;
    if (statusFilter) n++;
    if (tradeFilter) n++;
    return n;
  }, [typeFilter, resultFilter, statusFilter, tradeFilter]);

  const chipClass =
    "inline-flex max-w-full items-center gap-1 rounded-full border border-border/60 bg-muted/10 px-2.5 py-1 text-[11px] font-medium text-secondary hover:bg-muted/20";

  return (
    <ModulePageShell>
      <PageHeader
        title={t("inspectionPage.title")}
        description={t("inspectionPage.description")}
        actions={
          <Button type="button" size="sm" onClick={() => setScheduleOpen(true)}>
            {t("inspectionPage.scheduleCta")}
          </Button>
        }
      />

      <StatsBar
        stats={[
          {
            label: t("inspectionPage.statTotal"),
            value: stats.total,
            onClick: resetFilters,
            title: t("inspectionPage.statResetHint"),
          },
          {
            label: t("inspectionPage.statPassRate"),
            value: `${stats.passRate}%`,
            accent: "success",
          },
          {
            label: t("inspectionPage.statThisMonth"),
            value: stats.month,
          },
          {
            label: t("inspectionPage.statScheduled"),
            value: stats.scheduled,
            accent: "warning",
            onClick: () => {
              resetFilters();
              setStatusFilter("Scheduled");
            },
            title: t("inspectionPage.statScheduledHint"),
          },
        ]}
      />

      {qNorm ? (
        <p className="text-xs text-muted">
          {t("inspectionPage.globalSearchHint", { count: filteredRows.length })}
        </p>
      ) : null}

      {/* ── Toolbar row ──────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-end gap-2">
        {hasActiveFilters && (
          <button
            type="button"
            onClick={resetFilters}
            className="text-[11px] font-semibold text-brand hover:underline"
          >
            {t("inspectionPage.clearFiltersShort")}
          </button>
        )}
        <FilterPopover
          activeCount={activeFilterCount}
          label={t("inspectionPage.filterToggle")}
          onClear={resetFilters}
        >
          <Select
            label={t("inspectionPage.filterType")}
            options={typeOptions}
            value={typeFilter}
            onValueChange={setTypeFilter}
            size="sm"
            fullWidth
            triggerClassName="h-9"
          />
          <Select
            label={t("inspectionPage.filterResult")}
            options={resultOptions}
            value={resultFilter}
            onValueChange={(v) => setResultFilter(v as "" | InspectionResult)}
            size="sm"
            fullWidth
            triggerClassName="h-9"
          />
          <Select
            label={t("inspectionPage.filterStatus")}
            options={statusOptions}
            value={statusFilter}
            onValueChange={setStatusFilter}
            size="sm"
            fullWidth
            triggerClassName="h-9"
          />
          <label className="flex flex-col text-[12px] font-medium text-secondary">
            {t("inspectionPage.filterTrade")}
            <input
              type="text"
              value={tradeFilter}
              onChange={(e) => setTradeFilter(e.target.value)}
              placeholder={t("inspectionPage.filterTradePh")}
              className="mt-1.5 h-9 w-full rounded-lg border border-border bg-bg px-3 text-sm font-normal text-primary placeholder:text-muted focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </label>
        </FilterPopover>
      </div>

      {/* Active filter chips */}
      {hasActiveFilters ? (
        <div className="flex flex-wrap items-center gap-1.5">
          {typeFilter ? (
            <button type="button" className={chipClass} onClick={() => setTypeFilter("")}>{typeFilter} ×</button>
          ) : null}
          {resultFilter ? (
            <button type="button" className={chipClass} onClick={() => setResultFilter("")}>{resultFilter} ×</button>
          ) : null}
          {statusFilter ? (
            <button type="button" className={chipClass} onClick={() => setStatusFilter("")}>{statusFilter} ×</button>
          ) : null}
          {tradeFilter ? (
            <button type="button" className={chipClass} onClick={() => setTradeFilter("")}>{tradeFilter} ×</button>
          ) : null}
        </div>
      ) : null}

      <DataTable<DummyInspection>
        variant="card"
        columns={listColumns}
        data={filteredRows}
        rowKey={inspectionRowKey}
        tableMinWidthClassName="min-w-[720px]"
        maxHeightClassName="max-h-none"
        onRowClick={(r) => setSelected(r)}
        emptyFallback={
          <EmptyState
            title={t("inspectionPage.emptyTitle")}
            description={t("inspectionPage.emptyDescription")}
            action={{ label: t("inspectionPage.scheduleCta"), onClick: () => setScheduleOpen(true) }}
          />
        }
      />

      <SheetDrawer
        open={selected !== null}
        onClose={() => setSelected(null)}
        hideTitleBar
        widthClassName="max-w-[520px]"
      >
        {selected ? (
          <InspectionDetailDrawer row={selected} onClose={() => setSelected(null)} />
        ) : null}
      </SheetDrawer>

      <SheetDrawer
        open={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
        hideTitleBar
        widthClassName="max-w-[480px]"
      >
        {scheduleOpen ? (
          <ScheduleInspectionDrawer
            onClose={() => setScheduleOpen(false)}
            onCreate={(row) => appendInspection(row)}
          />
        ) : null}
      </SheetDrawer>
    </ModulePageShell>
  );
}
