import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { StatsBar } from "@/components/ui/stats-bar";
import {
  DUMMY_INSPECTIONS,
  DUMMY_INSPECTION_STATS,
  type DummyInspection,
} from "@/features/project-ui/projectDummyData";

const RESULT_VARIANT: Record<
  DummyInspection["result"],
  "success" | "danger" | "warning"
> = {
  Pass: "success",
  Fail: "danger",
  Conditional: "warning",
};

const TYPE_COLORS: Record<string, string> = {
  Quality:
    "border-blue-500/25 bg-blue-500/10 text-blue-700 dark:text-blue-200",
  MEP: "border-cyan-500/25 bg-cyan-500/10 text-cyan-700 dark:text-cyan-200",
  Structural:
    "border-amber-500/25 bg-amber-500/10 text-amber-800 dark:text-amber-200",
  Safety:
    "border-green-500/25 bg-green-500/10 text-green-700 dark:text-green-200",
  Fire: "border-red-500/25 bg-red-500/10 text-red-700 dark:text-red-200",
};

function TypePill({ type }: { type: string }) {
  const cls =
    TYPE_COLORS[type] ?? "border-border bg-muted/20 text-secondary";
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${cls}`}
    >
      {type}
    </span>
  );
}

const COLUMNS: DataTableColumn<DummyInspection>[] = [
  {
    id: "title",
    header: "Inspection",
    headerClassName: "pl-4 pr-3",
    cellClassName: "pl-4 pr-3",
    cell: (r) => (
      <span className="text-[13px] font-medium text-primary">{r.title}</span>
    ),
  },
  {
    id: "type",
    header: "Type",
    headerClassName: "px-3",
    cellClassName: "px-3",
    cell: (r) => <TypePill type={r.type} />,
  },
  {
    id: "location",
    header: "Location",
    headerClassName: "px-3",
    cellClassName: "px-3",
    cell: (r) => (
      <span className="text-[13px] text-secondary">{r.location}</span>
    ),
  },
  {
    id: "by",
    header: "Conducted by",
    headerClassName: "px-3",
    cellClassName: "px-3",
    cell: (r) => (
      <span className="text-[13px] text-secondary">{r.by}</span>
    ),
  },
  {
    id: "date",
    header: "Date",
    headerClassName: "px-3",
    cellClassName: "px-3 whitespace-nowrap",
    cell: (r) => (
      <span className="font-mono text-[13px] text-secondary">{r.date}</span>
    ),
  },
  {
    id: "result",
    header: "Result",
    headerClassName: "px-3",
    cellClassName: "px-3",
    cell: (r) => (
      <Badge variant={RESULT_VARIANT[r.result]} size="sm">
        {r.result}
      </Badge>
    ),
  },
  {
    id: "status",
    header: "Status",
    headerClassName: "px-3 pr-4",
    cellClassName: "px-3 pr-4",
    cell: (r) => (
      <span className="text-[13px] text-secondary">{r.status}</span>
    ),
  },
];

const s = DUMMY_INSPECTION_STATS;

export default function ProjectInspectionsPage() {
  return (
    <div className="flex min-h-full flex-col gap-5 p-6">
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
        columns={COLUMNS}
        data={DUMMY_INSPECTIONS}
        rowKey={(r) => `${r.title}-${r.date}`}
        tableMinWidthClassName="min-w-[680px]"
        maxHeightClassName="max-h-none"
        onRowClick={() => {}}
        emptyFallback={
          <EmptyState
            title="No inspections yet"
            description="Schedule your first inspection to start tracking quality."
            action={{ label: "+ Schedule inspection" }}
          />
        }
      />
    </div>
  );
}
