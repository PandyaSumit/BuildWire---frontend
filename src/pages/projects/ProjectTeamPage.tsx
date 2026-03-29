import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { StatsBar } from "@/components/ui/stats-bar";
import { TEAM_ROLE_BADGE_VARIANT } from "@/config/pm/team";
import { ModulePageShell } from "@/features/project-ui/components";
import {
  DUMMY_SUBCONTRACTORS,
  DUMMY_TEAM_MEMBERS,
  DUMMY_TEAM_STATS,
  type DummySub,
  type DummyTeamMember,
} from "@/features/project-ui/projectDummyData";

const MEMBER_COLUMNS: DataTableColumn<DummyTeamMember>[] = [
  {
    id: "name",
    header: "Member",
    headerClassName: "pl-4 pr-3",
    cellClassName: "pl-4 pr-3",
    cell: (r) => (
      <div className="flex items-center gap-2.5">
        <Avatar name={r.name} size="sm" />
        <div className="min-w-0">
          <p className="text-[13px] font-medium text-primary">{r.name}</p>
          <p className="text-[11px] text-muted">{r.company}</p>
        </div>
      </div>
    ),
  },
  {
    id: "role",
    header: "Role",
    headerClassName: "px-3",
    cellClassName: "px-3",
    cell: (r) => (
      <Badge variant={TEAM_ROLE_BADGE_VARIANT[r.role] ?? "default"} size="sm">
        {r.role}
      </Badge>
    ),
  },
  {
    id: "joined",
    header: "Joined",
    headerClassName: "px-3",
    cellClassName: "px-3",
    cell: (r) => (
      <span className="text-[13px] text-secondary">{r.joined}</span>
    ),
  },
  {
    id: "lastActive",
    header: "Last active",
    headerClassName: "px-3",
    cellClassName: "px-3",
    cell: (r) => (
      <span className="text-[13px] text-secondary">{r.lastActive}</span>
    ),
  },
  {
    id: "tasks",
    header: "Tasks",
    headerClassName: "px-3",
    cellClassName: "px-3",
    align: "right",
    cell: (r) => (
      <span className="text-[13px] tabular-nums text-secondary">{r.tasks}</span>
    ),
  },
  {
    id: "onSite",
    header: "On site",
    headerClassName: "px-3 pr-4",
    cellClassName: "px-3 pr-4",
    align: "center",
    cell: (r) =>
      r.onSite ? (
        <span className="inline-flex items-center gap-1 text-[13px] text-success">
          <span className="h-1.5 w-1.5 rounded-full bg-success" />
          Yes
        </span>
      ) : (
        <span className="text-[13px] text-muted">—</span>
      ),
  },
];

const SUB_COLUMNS: DataTableColumn<DummySub>[] = [
  {
    id: "name",
    header: "Company",
    headerClassName: "pl-4 pr-3",
    cellClassName: "pl-4 pr-3",
    cell: (r) => (
      <span className="text-[13px] font-medium text-primary">{r.name}</span>
    ),
  },
  {
    id: "trade",
    header: "Trade",
    headerClassName: "px-3",
    cellClassName: "px-3",
    cell: (r) => (
      <span className="text-[13px] text-secondary">{r.trade}</span>
    ),
  },
  {
    id: "contact",
    header: "Contact",
    headerClassName: "px-3",
    cellClassName: "px-3",
    cell: (r) => (
      <span className="text-[13px] text-secondary">{r.contact}</span>
    ),
  },
  {
    id: "workers",
    header: "Active workers",
    headerClassName: "px-3",
    cellClassName: "px-3",
    align: "right",
    cell: (r) => (
      <span className="text-[13px] tabular-nums text-secondary">{r.workers}</span>
    ),
  },
  {
    id: "tasks",
    header: "Tasks",
    headerClassName: "px-3 pr-4",
    cellClassName: "px-3 pr-4",
    align: "right",
    cell: (r) => (
      <span className="text-[13px] tabular-nums text-secondary">{r.tasks}</span>
    ),
  },
];

export default function ProjectTeamPage() {
  const s = DUMMY_TEAM_STATS;

  return (
    <ModulePageShell className="gap-6">
      <PageHeader
        title="Team"
        description="Roles, companies, and who is on site today."
        actions={<Button size="sm">+ Add member</Button>}
      />

      <StatsBar
        stats={[
          { label: "Total", value: s.total },
          { label: "Active today", value: s.activeToday, accent: "success" },
          { label: "Companies", value: s.companies },
        ]}
      />

      {/* On-site alert */}
      <div className="flex items-center gap-3 rounded-xl border border-success/25 bg-success/[0.06] px-4 py-2.5 text-sm">
        <span className="h-2 w-2 animate-pulse rounded-full bg-success" />
        <span className="text-secondary">
          <span className="font-medium text-primary">On site now:</span> Raj
          Kumar — active 5m ago (L3) · Amit Verma — active 12m ago (Gate)
        </span>
      </div>

      {/* Members table */}
      <section>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
          Members
        </p>
        <DataTable<DummyTeamMember>
          variant="card"
          columns={MEMBER_COLUMNS}
          data={DUMMY_TEAM_MEMBERS}
          rowKey={(r) => r.name}
          tableMinWidthClassName="min-w-[580px]"
          maxHeightClassName="max-h-none"
          emptyFallback={
            <EmptyState
              title="No team members yet"
              description="Add members to your project team."
              action={{ label: "+ Add member" }}
            />
          }
        />
      </section>

      {/* Subcontractors table */}
      <section>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
          Subcontractor companies
        </p>
        <DataTable<DummySub>
          variant="card"
          columns={SUB_COLUMNS}
          data={DUMMY_SUBCONTRACTORS}
          rowKey={(r) => r.name}
          tableMinWidthClassName="min-w-[480px]"
          maxHeightClassName="max-h-none"
          emptyFallback={
            <EmptyState
              title="No subcontractors yet"
              description="Add subcontractor companies to this project."
              action={{ label: "+ Add company" }}
            />
          }
        />
      </section>
    </ModulePageShell>
  );
}
