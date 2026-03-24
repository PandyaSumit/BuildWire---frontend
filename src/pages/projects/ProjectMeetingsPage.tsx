import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { DUMMY_MEETINGS } from "@/features/project-ui/projectDummyData";

type MeetingRow = (typeof DUMMY_MEETINGS)[number];

const STATUS_VARIANT: Record<string, "success" | "secondary"> = {
  Completed: "success",
  Scheduled: "secondary",
};

const TYPE_COLORS: Record<string, string> = {
  "Site Progress Meeting":
    "border-blue-500/25 bg-blue-500/10 text-blue-700 dark:text-blue-200",
  "Design Review Meeting":
    "border-violet-500/25 bg-violet-500/10 text-violet-700 dark:text-violet-200",
  "Safety Toolbox Talk":
    "border-green-500/25 bg-green-500/10 text-green-700 dark:text-green-200",
  "Owner/Client Meeting":
    "border-amber-500/25 bg-amber-500/10 text-amber-800 dark:text-amber-200",
  "Subcontractor Coordination":
    "border-cyan-500/25 bg-cyan-500/10 text-cyan-700 dark:text-cyan-200",
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

const COLUMNS: DataTableColumn<MeetingRow>[] = [
  {
    id: "name",
    header: "Meeting",
    headerClassName: "pl-4 pr-3",
    cellClassName: "pl-4 pr-3",
    cell: (r) => (
      <span className="text-[13px] font-medium text-primary">{r.name}</span>
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
    id: "date",
    header: "Date & time",
    headerClassName: "px-3",
    cellClassName: "px-3 whitespace-nowrap",
    cell: (r) => (
      <span className="font-mono text-[13px] text-secondary">{r.date}</span>
    ),
  },
  {
    id: "attendees",
    header: "Attendees",
    headerClassName: "px-3",
    cellClassName: "px-3",
    align: "right",
    cell: (r) => (
      <span className="text-[13px] tabular-nums text-secondary">
        {r.attendees}
      </span>
    ),
  },
  {
    id: "actions",
    header: "Action items",
    headerClassName: "px-3",
    cellClassName: "px-3",
    align: "right",
    cell: (r) => (
      <span
        className={`text-[13px] tabular-nums ${r.actions > 0 ? "font-semibold text-primary" : "text-muted"}`}
      >
        {r.actions > 0 ? r.actions : "—"}
      </span>
    ),
  },
  {
    id: "status",
    header: "Status",
    headerClassName: "px-3 pr-4",
    cellClassName: "px-3 pr-4",
    cell: (r) => (
      <Badge variant={STATUS_VARIANT[r.status] ?? "secondary"} size="sm">
        {r.status}
      </Badge>
    ),
  },
];

export default function ProjectMeetingsPage() {
  return (
    <div className="flex min-h-full flex-col gap-5 p-6">
      <PageHeader
        title="Meetings"
        description="Agenda, minutes, action items → tasks."
        actions={<Button size="sm">+ New meeting</Button>}
      />

      <DataTable<MeetingRow>
        variant="card"
        columns={COLUMNS}
        data={DUMMY_MEETINGS}
        rowKey={(r) => r.name}
        tableMinWidthClassName="min-w-[620px]"
        maxHeightClassName="max-h-none"
        onRowClick={() => {}}
        emptyFallback={
          <EmptyState
            title="No meetings yet"
            description="Schedule your first meeting to start tracking agendas and action items."
            action={{ label: "+ New meeting" }}
          />
        }
      />
    </div>
  );
}
