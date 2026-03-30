import { useMemo, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { KpiStatCard } from "@/components/ui/kpi-stat-card";
import { PageHeader } from "@/components/ui/page-header";
import { ProgressBar } from "@/components/ui/progress-bar";
import { SheetDrawer } from "@/components/ui/sheet-drawer";
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

type RoleFilter = "all" | "PM" | "Supervisor" | "Worker" | "Guest";

// ── Extended member details ────────────────────────────────────────────────────
const MEMBER_DETAILS: Record<
  string,
  {
    email: string;
    phone: string;
    certifications: string[];
    permissions: string[];
    laborHours: number;
    attendance: number;
  }
> = {
  "Ananya Mehta": {
    email: "ananya.mehta@buildwire.io",
    phone: "+91 98765 43210",
    certifications: ["PMP Certified", "OSHA 30"],
    permissions: ["Full admin", "Approve expenses", "Manage team"],
    laborHours: 52,
    attendance: 100,
  },
  "Raj Kumar": {
    email: "raj.kumar@acmeinfra.com",
    phone: "+91 97654 32109",
    certifications: ["OSHA 10", "First Aid"],
    permissions: ["Submit reports", "Manage tasks", "View financials"],
    laborHours: 48,
    attendance: 95,
  },
  "Priya Shah": {
    email: "priya.shah@skylinecivil.com",
    phone: "+91 96543 21098",
    certifications: ["Safety supervisor cert."],
    permissions: ["Submit reports", "Manage tasks"],
    laborHours: 40,
    attendance: 88,
  },
  "Neha Desai": {
    email: "neha.desai@designpartners.com",
    phone: "+91 95432 10987",
    certifications: ["LEED AP"],
    permissions: ["View drawings", "Comment on RFIs"],
    laborHours: 24,
    attendance: 70,
  },
  "Amit Verma": {
    email: "amit.verma@acmeinfra.com",
    phone: "+91 94321 09876",
    certifications: ["Working at height", "Scaffolding"],
    permissions: ["View tasks", "Submit daily report"],
    laborHours: 48,
    attendance: 100,
  },
  "Vikram Sinha": {
    email: "vikram.sinha@meppro.com",
    phone: "+91 93210 98765",
    certifications: ["MEP supervisor", "OSHA 10"],
    permissions: ["Submit reports", "Manage MEP tasks", "View financials"],
    laborHours: 44,
    attendance: 80,
  },
};

// ── Member detail drawer ──────────────────────────────────────────────────────
function MemberDrawer({
  member,
  onClose,
}: {
  member: DummyTeamMember;
  onClose: () => void;
}) {
  const detail = MEMBER_DETAILS[member.name];

  return (
    <SheetDrawer open title={member.name} onClose={onClose} widthClassName="max-w-[480px]">
      <div className="space-y-5">
        {/* Header card */}
        <div className="flex items-center gap-4 rounded-xl border border-border/50 bg-bg p-4">
          <Avatar name={member.name} size="lg" />
          <div>
            <p className="text-base font-semibold text-primary">{member.name}</p>
            <p className="text-sm text-secondary">{member.company}</p>
            <div className="mt-1 flex items-center gap-2">
              <Badge variant={TEAM_ROLE_BADGE_VARIANT[member.role] ?? "default"} size="sm">
                {member.role}
              </Badge>
              {member.onSite && (
                <span className="flex items-center gap-1 text-[12px] text-success">
                  <span className="h-1.5 w-1.5 rounded-full bg-success" />
                  On site
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Contact */}
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">Contact</p>
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-[13px]">
              <span className="w-5 text-center text-muted">✉</span>
              <a href={`mailto:${detail?.email}`} className="text-brand hover:underline">
                {detail?.email ?? "—"}
              </a>
            </div>
            <div className="flex items-center gap-3 text-[13px]">
              <span className="w-5 text-center text-muted">📞</span>
              <span className="text-secondary">{detail?.phone ?? "—"}</span>
            </div>
          </div>
        </div>

        {/* Activity metrics */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-border/50 bg-bg p-3 text-center">
            <p className="text-xl font-bold text-primary">{member.tasks}</p>
            <p className="text-[11px] text-muted">Active tasks</p>
          </div>
          <div className="rounded-xl border border-border/50 bg-bg p-3 text-center">
            <p className="text-xl font-bold text-primary">{detail?.laborHours ?? "—"}h</p>
            <p className="text-[11px] text-muted">This week</p>
          </div>
          <div className="rounded-xl border border-border/50 bg-bg p-3 text-center">
            <p className="text-xl font-bold text-primary">{detail?.attendance ?? "—"}%</p>
            <p className="text-[11px] text-muted">Attendance</p>
          </div>
        </div>

        {/* Attendance bar */}
        {detail && (
          <div>
            <div className="mb-1 flex items-center justify-between text-[12px]">
              <span className="text-muted">Attendance rate</span>
              <span className="font-medium text-primary">{detail.attendance}%</span>
            </div>
            <ProgressBar
              value={detail.attendance}
              max={100}
              size="sm"
              variant={detail.attendance >= 90 ? "success" : detail.attendance >= 75 ? "warning" : "danger"}
            />
          </div>
        )}

        {/* Certifications */}
        {detail?.certifications && (
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
              Certifications
            </p>
            <div className="flex flex-wrap gap-1.5">
              {detail.certifications.map((c) => (
                <span
                  key={c}
                  className="rounded-full border border-success/25 bg-success/[0.06] px-2.5 py-0.5 text-[12px] text-success"
                >
                  ✓ {c}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Permissions */}
        {detail?.permissions && (
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
              Permissions
            </p>
            <ul className="space-y-1">
              {detail.permissions.map((p) => (
                <li key={p} className="flex items-center gap-2 text-[13px] text-secondary">
                  <span className="text-muted">›</span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Last active */}
        <div className="rounded-lg border border-border/40 bg-muted/[0.04] px-3 py-2 text-[12px] text-muted">
          Last active: <span className="font-medium text-secondary">{member.lastActive}</span>
          {" "}· Joined: <span className="font-medium text-secondary">{member.joined}</span>
        </div>
      </div>
    </SheetDrawer>
  );
}

// ── Invite modal ──────────────────────────────────────────────────────────────
function InviteModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label="Close"
      />
      <div className="relative w-full max-w-sm rounded-2xl border border-border bg-elevated p-6 shadow-2xl">
        <h3 className="mb-1 text-base font-semibold text-primary">Invite team member</h3>
        <p className="mb-4 text-sm text-secondary">Send an invite link by email.</p>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-[12px] font-medium text-secondary">Email address</label>
            <input
              type="email"
              placeholder="name@company.com"
              className="w-full rounded-lg border border-border/60 bg-bg px-3 py-2 text-sm text-primary placeholder:text-muted focus:border-brand/50 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-[12px] font-medium text-secondary">Role</label>
            <select className="w-full rounded-lg border border-border/60 bg-bg px-3 py-2 text-sm text-primary">
              <option>Supervisor</option>
              <option>Worker</option>
              <option>Guest</option>
              <option>PM</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[12px] font-medium text-secondary">Company</label>
            <input
              type="text"
              placeholder="Subcontractor or org name"
              className="w-full rounded-lg border border-border/60 bg-bg px-3 py-2 text-sm text-primary placeholder:text-muted focus:border-brand/50 focus:outline-none"
            />
          </div>
        </div>
        <div className="mt-5 flex gap-2">
          <Button size="sm" className="flex-1">Send invite</Button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border/60 px-4 py-2 text-sm text-secondary hover:bg-muted/10"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Table columns ─────────────────────────────────────────────────────────────
const MEMBER_COLUMNS: DataTableColumn<DummyTeamMember>[] = [
  {
    id: "name",
    header: "Member",
    headerClassName: "pl-4 pr-3",
    cellClassName: "pl-4 pr-3",
    sortValue: (r) => r.name,
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
    sortValue: (r) => r.role,
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
    sortValue: (r) => r.joined,
    cell: (r) => <span className="text-[13px] text-secondary">{r.joined}</span>,
  },
  {
    id: "lastActive",
    header: "Last active",
    headerClassName: "px-3",
    cellClassName: "px-3",
    sortValue: (r) => r.lastActive,
    cell: (r) => <span className="text-[13px] text-secondary">{r.lastActive}</span>,
  },
  {
    id: "tasks",
    header: "Tasks",
    headerClassName: "px-3",
    cellClassName: "px-3",
    align: "right",
    sortValue: (r) => r.tasks,
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
    sortValue: (r) => r.name,
    cell: (r) => <span className="text-[13px] font-medium text-primary">{r.name}</span>,
  },
  {
    id: "trade",
    header: "Trade",
    headerClassName: "px-3",
    cellClassName: "px-3",
    sortValue: (r) => r.trade,
    cell: (r) => <span className="text-[13px] text-secondary">{r.trade}</span>,
  },
  {
    id: "contact",
    header: "Contact",
    headerClassName: "px-3",
    cellClassName: "px-3",
    cell: (r) => <span className="text-[13px] text-secondary">{r.contact}</span>,
  },
  {
    id: "workers",
    header: "Active workers",
    headerClassName: "px-3",
    cellClassName: "px-3",
    align: "right",
    sortValue: (r) => r.workers,
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
    sortValue: (r) => r.tasks,
    cell: (r) => (
      <span className="text-[13px] tabular-nums text-secondary">{r.tasks}</span>
    ),
  },
];

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ProjectTeamPage() {
  const s = DUMMY_TEAM_STATS;
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<DummyTeamMember | null>(null);
  const [showInvite, setShowInvite] = useState(false);

  const filtered = useMemo(() => {
    let rows = DUMMY_TEAM_MEMBERS;
    if (roleFilter !== "all") rows = rows.filter((m) => m.role === roleFilter);
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.company.toLowerCase().includes(q) ||
          m.role.toLowerCase().includes(q),
      );
    }
    return rows;
  }, [roleFilter, search]);

  const onSiteCount = DUMMY_TEAM_MEMBERS.filter((m) => m.onSite).length;
  const avgAttendance = Math.round(
    Object.values(MEMBER_DETAILS).reduce((s, d) => s + d.attendance, 0) /
      Object.keys(MEMBER_DETAILS).length,
  );

  return (
    <>
      <ModulePageShell className="gap-6">
        <PageHeader
          title="Team"
          description="Roles, companies, certifications, and who is on site today."
          actions={
            <div className="flex items-center gap-2">
              <Button size="sm" variant="secondary">Export roster</Button>
              <Button size="sm" onClick={() => setShowInvite(true)}>+ Invite member</Button>
            </div>
          }
        />

        {/* KPI cards */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <KpiStatCard label="Total members" value={String(s.total)} sublabel={`${s.companies} companies`} />
          <KpiStatCard label="On site now" value={String(onSiteCount)} sublabel="Active this session" accent="success" />
          <KpiStatCard label="Avg attendance" value={`${avgAttendance}%`} sublabel="This month" accent={avgAttendance >= 90 ? "success" : "warning"} />
          <KpiStatCard label="Open tasks" value={String(DUMMY_TEAM_MEMBERS.reduce((s, m) => s + m.tasks, 0))} sublabel="Across all members" />
        </div>

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
            <span className="font-medium text-primary">On site now:</span>{" "}
            Raj Kumar — active 5m ago (L3) · Amit Verma — active 12m ago (Gate) · Ananya Mehta — PM office
          </span>
        </div>

        {/* Filter & search */}
        <div className="flex flex-wrap items-center gap-2">
          {(["all", "PM", "Supervisor", "Worker", "Guest"] as RoleFilter[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRoleFilter(r)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                roleFilter === r
                  ? "border-brand/40 bg-brand-light text-primary"
                  : "border-border/60 text-secondary hover:border-brand/30 hover:text-primary"
              }`}
            >
              {r === "all" ? "All roles" : r}
            </button>
          ))}
          <div className="relative ml-auto">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
              🔍
            </span>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search members…"
              className="rounded-xl border border-border/60 bg-bg py-1.5 pl-9 pr-4 text-sm text-primary placeholder:text-muted focus:border-brand/50 focus:outline-none"
            />
          </div>
        </div>

        {/* Members table */}
        <section>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
            Members
            {filtered.length !== DUMMY_TEAM_MEMBERS.length && (
              <span className="ml-2 text-brand">{filtered.length} shown</span>
            )}
          </p>
          <DataTable<DummyTeamMember>
            variant="card"
            columns={MEMBER_COLUMNS}
            data={filtered}
            rowKey={(r) => r.name}
            tableMinWidthClassName="min-w-[580px]"
            maxHeightClassName="max-h-none"
            onRowClick={(r) => setSelected(r)}
            emptyFallback={
              <EmptyState
                title="No members found"
                description={
                  search || roleFilter !== "all"
                    ? "Try adjusting your filters."
                    : "Add members to your project team."
                }
                action={
                  !search && roleFilter === "all"
                    ? { label: "+ Invite member" }
                    : undefined
                }
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

      {selected && (
        <MemberDrawer member={selected} onClose={() => setSelected(null)} />
      )}

      {showInvite && <InviteModal onClose={() => setShowInvite(false)} />}
    </>
  );
}
