import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import {
  MEETING_STATUS_BADGE,
  MEETING_TYPE_PILL_CLASSES,
} from "@/config/pm/meetings";
import { ModulePageShell, SemanticPill } from "@/features/project-ui/components";
import { DUMMY_MEETINGS } from "@/features/project-ui/projectDummyData";

type MeetingRow = (typeof DUMMY_MEETINGS)[number];

function buildColumns(): DataTableColumn<MeetingRow>[] {
  return [
    {
      id: "name",
      header: "Meeting",
      headerClassName: "pl-4 pr-3",
      cellClassName: "pl-4 pr-3",
      sortValue: (r) => r.name,
      cell: (r) => (
        <span className="text-[13px] font-medium text-primary">{r.name}</span>
      ),
    },
    {
      id: "type",
      header: "Type",
      headerClassName: "px-3",
      cellClassName: "px-3",
      sortValue: (r) => r.type,
      cell: (r) => (
        <SemanticPill label={r.type} palette={MEETING_TYPE_PILL_CLASSES} />
      ),
    },
    {
      id: "date",
      header: "Date & time",
      headerClassName: "px-3",
      cellClassName: "px-3 whitespace-nowrap",
      sortValue: (r) => r.date,
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
      sortValue: (r) => r.attendees,
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
      sortValue: (r) => r.actions,
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
      sortValue: (r) => r.status,
      cell: (r) => (
        <Badge variant={MEETING_STATUS_BADGE[r.status] ?? "secondary"} size="sm">
          {r.status}
        </Badge>
      ),
    },
  ];
}

export default function ProjectMeetingsPage() {
  const columns = useMemo(() => buildColumns(), []);

  return (
    <ModulePageShell>
      <PageHeader
        title="Meetings"
        description="Agenda, minutes, and action items linked to tasks."
        actions={<Button size="sm">+ New meeting</Button>}
      />

      <DataTable<MeetingRow>
        variant="card"
        columns={columns}
        data={DUMMY_MEETINGS}
        rowKey={(r) => r.name}
        tableMinWidthClassName="min-w-[620px]"
        maxHeightClassName="max-h-none"
        emptyFallback={
          <EmptyState
            title="No meetings yet"
            description="Schedule your first meeting to track agendas and action items."
            action={{ label: "+ New meeting" }}
          />
        }
      />
    </ModulePageShell>
  );
}
