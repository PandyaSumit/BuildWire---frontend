import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { SheetDrawer } from "@/components/ui/sheet-drawer";
import { StatsBar } from "@/components/ui/stats-bar";
import {
  INSPECTION_RESULT_BADGE,
  INSPECTION_TYPE_PILL_CLASSES,
} from "@/config/pm/inspections";
import { ModulePageShell, SemanticPill } from "@/features/project-ui/components";
import {
  DUMMY_INSPECTIONS,
  DUMMY_INSPECTION_STATS,
  type DummyInspection,
} from "@/features/project-ui/projectDummyData";

function inspectionRowKey(r: DummyInspection) {
  return `${r.title}-${r.date}`;
}

function InspectionDetailDrawer({
  row,
  onClose,
}: {
  row: DummyInspection;
  onClose: () => void;
}) {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex shrink-0 items-start justify-between border-b border-border/60 px-5 py-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <SemanticPill label={row.type} palette={INSPECTION_TYPE_PILL_CLASSES} />
            <Badge variant={INSPECTION_RESULT_BADGE[row.result]} size="sm">
              {row.result}
            </Badge>
          </div>
          <h2 className="mt-2 font-[family-name:var(--font-dm-sans)] text-base font-semibold text-primary">
            {row.title}
          </h2>
          <p className="mt-1 text-sm text-secondary">{row.location}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="ml-3 shrink-0 rounded-lg p-1.5 text-muted hover:bg-muted/15 hover:text-primary"
          aria-label="Close"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5 text-sm">
        <div className="grid grid-cols-2 gap-3 rounded-xl bg-muted/[0.06] p-4">
          <div>
            <p className="text-xs text-muted">Conducted by</p>
            <p className="mt-0.5 font-medium text-primary">{row.by}</p>
          </div>
          <div>
            <p className="text-xs text-muted">Date</p>
            <p className="mt-0.5 font-mono font-medium text-primary">{row.date}</p>
          </div>
          <div className="col-span-2">
            <p className="text-xs text-muted">Workflow status</p>
            <p className="mt-0.5 text-primary">{row.status}</p>
          </div>
        </div>
        <div className="rounded-xl border border-dashed border-border/60 bg-bg p-4 text-secondary">
          Checklist responses and photos will display here after backend
          integration.
        </div>
      </div>
      <div className="flex shrink-0 justify-end border-t border-border/60 px-5 py-3">
        <Button size="sm" variant="secondary">
          Open PDF
        </Button>
      </div>
    </div>
  );
}

function buildColumns(): DataTableColumn<DummyInspection>[] {
  return [
    {
      id: "title",
      header: "Inspection",
      headerClassName: "pl-4 pr-3",
      cellClassName: "pl-4 pr-3",
      sortValue: (r) => r.title,
      cell: (r) => (
        <span className="text-[13px] font-medium text-primary">{r.title}</span>
      ),
    },
    {
      id: "type",
      header: "Type",
      headerClassName: "px-3",
      cellClassName: "px-3",
      sortValue: (r) => r.type,
      cell: (r) => (
        <SemanticPill label={r.type} palette={INSPECTION_TYPE_PILL_CLASSES} />
      ),
    },
    {
      id: "location",
      header: "Location",
      headerClassName: "px-3",
      cellClassName: "px-3",
      sortValue: (r) => r.location,
      cell: (r) => (
        <span className="text-[13px] text-secondary">{r.location}</span>
      ),
    },
    {
      id: "by",
      header: "Conducted by",
      headerClassName: "px-3",
      cellClassName: "px-3",
      sortValue: (r) => r.by,
      cell: (r) => (
        <span className="text-[13px] text-secondary">{r.by}</span>
      ),
    },
    {
      id: "date",
      header: "Date",
      headerClassName: "px-3",
      cellClassName: "px-3 whitespace-nowrap",
      sortValue: (r) => r.date,
      cell: (r) => (
        <span className="font-mono text-[13px] text-secondary">{r.date}</span>
      ),
    },
    {
      id: "result",
      header: "Result",
      headerClassName: "px-3",
      cellClassName: "px-3",
      sortValue: (r) => r.result,
      cell: (r) => (
        <Badge variant={INSPECTION_RESULT_BADGE[r.result]} size="sm">
          {r.result}
        </Badge>
      ),
    },
    {
      id: "status",
      header: "Status",
      headerClassName: "px-3 pr-4",
      cellClassName: "px-3 pr-4",
      sortValue: (r) => r.status,
      cell: (r) => (
        <span className="text-[13px] text-secondary">{r.status}</span>
      ),
    },
  ];
}

const s = DUMMY_INSPECTION_STATS;

export default function ProjectInspectionsPage() {
  const [selected, setSelected] = useState<DummyInspection | null>(null);
  const columns = useMemo(() => buildColumns(), []);

  return (
    <ModulePageShell>
      <PageHeader
        title="Inspections"
        description="Templates, checklist conduct, and auto-tasks on fail."
        actions={<Button size="sm">+ Schedule inspection</Button>}
      />

      <StatsBar
        stats={[
          { label: "Total", value: s.total },
          { label: "Pass rate", value: `${s.passRate}%`, accent: "success" },
          { label: "This month", value: s.month },
          { label: "Scheduled", value: s.scheduled },
        ]}
      />

      <DataTable<DummyInspection>
        variant="card"
        columns={columns}
        data={DUMMY_INSPECTIONS}
        rowKey={inspectionRowKey}
        tableMinWidthClassName="min-w-[680px]"
        maxHeightClassName="max-h-none"
        onRowClick={(r) => setSelected(r)}
        emptyFallback={
          <EmptyState
            title="No inspections yet"
            description="Schedule your first inspection to start tracking quality."
            action={{ label: "+ Schedule inspection" }}
          />
        }
      />

      <SheetDrawer
        open={selected !== null}
        onClose={() => setSelected(null)}
        hideTitleBar
        widthClassName="max-w-[480px]"
      >
        {selected ? (
          <InspectionDetailDrawer row={selected} onClose={() => setSelected(null)} />
        ) : null}
      </SheetDrawer>
    </ModulePageShell>
  );
}
