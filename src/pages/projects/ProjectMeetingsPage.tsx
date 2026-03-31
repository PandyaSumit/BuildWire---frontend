import { useMemo, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { KpiStatCard } from "@/components/ui/kpi-stat-card";
import { PageHeader } from "@/components/ui/page-header";
import { SheetDrawer } from "@/components/ui/sheet-drawer";
import {
  MEETING_STATUS_BADGE,
  MEETING_TYPE_PILL_CLASSES,
} from "@/config/pm/meetings";
import { ModulePageShell, SemanticPill } from "@/features/project-ui/components";
import { DUMMY_MEETINGS } from "@/features/project-ui/projectDummyData";

type MeetingRow = (typeof DUMMY_MEETINGS)[number];
type FilterStatus = "all" | "Scheduled" | "Completed" | "Cancelled";

// ── Extended meeting detail data ──────────────────────────────────────────────
const MEETING_DETAILS: Record<
  string,
  {
    location: string;
    callLink?: string;
    organizer: string;
    attendeeNames: string[];
    agenda: string[];
    minutes?: string;
    actionItems: { task: string; assignee: string; due: string; done: boolean }[];
  }
> = {
  "Weekly site coordination": {
    location: "Site office — Board room",
    organizer: "Ananya Mehta",
    attendeeNames: ["Ananya Mehta", "Raj Kumar", "Vikram Sinha", "Priya Shah", "Amit Verma", "MEP Lead", "GC Rep", "Safety Officer"],
    agenda: [
      "Review last week's task closures",
      "Superstructure L11 progress update",
      "MEP rough-in delay — mitigation plan",
      "Safety incident report review",
      "Upcoming inspections",
    ],
    minutes: "Slab L11 pour rescheduled to Apr 1. MEP team to accelerate conduit work. Safety walk scheduled for Apr 2.",
    actionItems: [
      { task: "Submit revised slab pour plan", assignee: "Raj Kumar", due: "Mar 21", done: true },
      { task: "MEP progress report", assignee: "Vikram Sinha", due: "Mar 22", done: false },
      { task: "Safety checklist update", assignee: "Safety Officer", due: "Mar 20", done: true },
      { task: "Arrange inspection for L10 waterproofing", assignee: "Ananya Mehta", due: "Mar 25", done: false },
      { task: "Follow up on CO-007 approval", assignee: "PM", due: "Mar 24", done: false },
    ],
  },
  "Facade design review": {
    location: "Virtual — Google Meet",
    callLink: "meet.google.com/abc-defg-hij",
    organizer: "Neha Desai",
    attendeeNames: ["Neha Desai", "Ananya Mehta", "Raj Kumar", "GlassCo Rep", "Owner Rep", "Structural consultant"],
    agenda: [
      "Review revised cladding shop drawings",
      "Corner detail clarification (RFI-009)",
      "Sealant specification sign-off",
      "Revised programme for north elevation",
    ],
    actionItems: [
      { task: "Approve updated shop drawings", assignee: "Neha Desai", due: "Mar 25", done: false },
      { task: "Confirm sealant brand substitution", assignee: "Ananya Mehta", due: "Mar 22", done: false },
      { task: "Revised Gantt from GlassCo", assignee: "GlassCo Rep", due: "Mar 23", done: false },
    ],
  },
  "Toolbox — working at height": {
    location: "Site — L8 staging area",
    organizer: "Safety Officer",
    attendeeNames: ["Safety Officer", "All site workers (42 attendees)"],
    agenda: [
      "Harness inspection procedure",
      "Anchor point usage protocol",
      "Emergency rescue plan brief",
      "Signage and barricade zones update",
    ],
    minutes: "All workers briefed. 2 harnesses flagged for replacement. Safety nets to be re-installed at L10 by Mar 22.",
    actionItems: [],
  },
  "Owner walk — L12": {
    location: "On-site — Level 12",
    organizer: "Ananya Mehta",
    attendeeNames: ["Ananya Mehta", "Owner (Mr. Patel)", "Neha Desai", "Raj Kumar"],
    agenda: [
      "L12 slab progress walkthrough",
      "Penthouse unit preview",
      "Finishes and material board review",
      "Timeline discussion",
    ],
    actionItems: [
      { task: "Prepare finishes sample board", assignee: "Priya Shah", due: "Mar 22", done: false },
      { task: "L12 safety clearance for owner visit", assignee: "Safety Officer", due: "Mar 23", done: false },
    ],
  },
  "MEP clash review": {
    location: "Site office — War room",
    organizer: "Vikram Sinha",
    attendeeNames: ["Vikram Sinha", "MEP Lead", "Structural GC", "Neha Desai", "BIM Coordinator", "Electrical Sub", "Plumbing Sub", "HVAC Sub", "Fire Consultant"],
    agenda: [
      "BIM clash report — L7–L9",
      "HVAC duct vs beam clash (Grid C)",
      "Electrical tray routing revision",
      "Coordination drawing sign-off",
    ],
    minutes: "7 clashes resolved. HVAC duct to be rerouted via Grid D. Electrical tray to drop 200mm at junction box. Revised drawings due Mar 20.",
    actionItems: [
      { task: "Revise HVAC routing drawing", assignee: "MEP Lead", due: "Mar 20", done: true },
      { task: "Update electrical tray detail", assignee: "Electrical Sub", due: "Mar 20", done: true },
      { task: "Re-run BIM clash check", assignee: "BIM Coordinator", due: "Mar 21", done: true },
      { task: "Plumbing sleeves confirmation", assignee: "Plumbing Sub", due: "Mar 19", done: false },
      { task: "Distribute resolved clash report", assignee: "Vikram Sinha", due: "Mar 18", done: true },
      { task: "Update site mark-up drawings", assignee: "GC", due: "Mar 22", done: false },
      { task: "Confirm drainage slope at L8", assignee: "Plumbing Sub", due: "Mar 23", done: false },
    ],
  },
  "Concrete pour sequence": {
    location: "Site office",
    organizer: "Raj Kumar",
    attendeeNames: ["Raj Kumar", "Structural Engineer", "Concrete sub foreman", "Site GC", "QC Lead"],
    agenda: [
      "L11 Zone A pour sequence",
      "Pump placement and access",
      "Curing and protection plan",
      "Traffic management during pour",
    ],
    actionItems: [
      { task: "Submit pour checklist", assignee: "QC Lead", due: "Mar 25", done: false },
    ],
  },
};

// ── Meeting detail drawer ─────────────────────────────────────────────────────
function MeetingDrawer({
  meeting,
  onClose,
}: {
  meeting: MeetingRow;
  onClose: () => void;
}) {
  const detail = MEETING_DETAILS[meeting.name];
  const doneActions = detail?.actionItems.filter((a) => a.done) ?? [];

  return (
    <SheetDrawer
      open
      title={meeting.name}
      onClose={onClose}
      widthClassName="max-w-[560px]"
    >
      <div className="space-y-5">
        {/* Meta */}
        <div className="flex flex-wrap gap-3">
          <SemanticPill label={meeting.type} palette={MEETING_TYPE_PILL_CLASSES} />
          <Badge variant={MEETING_STATUS_BADGE[meeting.status] ?? "secondary"} size="sm">
            {meeting.status}
          </Badge>
          {detail?.callLink && (
            <a
              href={`https://${detail.callLink}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-brand/30 bg-brand-light px-3 py-1 text-xs font-medium text-primary hover:border-brand/50"
            >
              Join call →
            </a>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">Date & time</p>
            <p className="mt-0.5 font-mono text-primary">{meeting.date}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">Location</p>
            <p className="mt-0.5 text-primary">{detail?.location ?? "—"}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">Organizer</p>
            <p className="mt-0.5 text-primary">{detail?.organizer ?? "—"}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">Attendees</p>
            <p className="mt-0.5 text-primary">{meeting.attendees} people</p>
          </div>
        </div>

        {/* Attendees */}
        {detail?.attendeeNames && (
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
              Attendees
            </p>
            <div className="flex flex-wrap gap-1.5">
              {detail.attendeeNames.map((name) => (
                <div key={name} className="flex items-center gap-1.5 rounded-full border border-border/50 bg-bg px-2.5 py-1">
                  <Avatar name={name} size="sm" />
                  <span className="text-[12px] text-secondary">{name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Agenda */}
        {detail?.agenda && (
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
              Agenda
            </p>
            <ol className="space-y-1.5">
              {detail.agenda.map((item, i) => (
                <li key={i} className="flex gap-2.5 text-[13px] text-secondary">
                  <span className="shrink-0 font-mono text-[11px] text-muted">{i + 1}.</span>
                  {item}
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Minutes */}
        {detail?.minutes && (
          <div className="rounded-xl border border-border/50 bg-muted/[0.04] p-3">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted">
              Meeting minutes
            </p>
            <p className="text-[13px] text-secondary">{detail.minutes}</p>
          </div>
        )}

        {/* Action items */}
        {detail && detail.actionItems.length > 0 && (
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                Action items
              </p>
              <span className="text-[11px] text-muted">
                {doneActions.length}/{detail.actionItems.length} done
              </span>
            </div>
            <div className="space-y-1.5">
              {detail.actionItems.map((a, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-3 rounded-lg border px-3 py-2 ${
                    a.done
                      ? "border-success/20 bg-success/[0.04]"
                      : "border-border/50 bg-bg"
                  }`}
                >
                  <span
                    className={`mt-0.5 shrink-0 text-sm ${a.done ? "text-success" : "text-muted"}`}
                  >
                    {a.done ? "✓" : "○"}
                  </span>
                  <div className="flex-1">
                    <p className={`text-[13px] ${a.done ? "text-muted line-through" : "text-primary"}`}>
                      {a.task}
                    </p>
                    <p className="text-[11px] text-muted">
                      {a.assignee} · Due {a.due}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </SheetDrawer>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ProjectMeetingsPage() {
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<MeetingRow | null>(null);

  const filtered = useMemo(() => {
    let rows = DUMMY_MEETINGS as MeetingRow[];
    if (filterStatus !== "all") rows = rows.filter((r) => r.status === filterStatus);
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.type.toLowerCase().includes(q),
      );
    }
    return rows;
  }, [filterStatus, search]);

  const totalActions = DUMMY_MEETINGS.reduce((s, m) => s + m.actions, 0);
  const scheduled = DUMMY_MEETINGS.filter((m) => m.status === "Scheduled").length;

  const columns = useMemo((): DataTableColumn<MeetingRow>[] => [
    {
      id: "name",
      header: "Meeting",
      headerClassName: "",
      cellClassName: "",
      sortValue: (r) => r.name,
      cell: (r) => (
        <span className="text-[13px] font-medium text-primary">{r.name}</span>
      ),
    },
    {
      id: "type",
      header: "Type",
      headerClassName: "",
      cellClassName: "",
      sortValue: (r) => r.type,
      cell: (r) => (
        <SemanticPill label={r.type} palette={MEETING_TYPE_PILL_CLASSES} />
      ),
    },
    {
      id: "date",
      header: "Date & time",
      headerClassName: "",
      cellClassName: "whitespace-nowrap",
      sortValue: (r) => r.date,
      cell: (r) => (
        <span className="font-mono text-[13px] text-secondary">{r.date}</span>
      ),
    },
    {
      id: "attendees",
      header: "Attendees",
      headerClassName: "",
      cellClassName: "",
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
      headerClassName: "",
      cellClassName: "",
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
      headerClassName: "pr-4",
      cellClassName: "pr-4",
      sortValue: (r) => r.status,
      cell: (r) => (
        <Badge variant={MEETING_STATUS_BADGE[r.status] ?? "secondary"} size="sm">
          {r.status}
        </Badge>
      ),
    },
  ], []);

  return (
    <>
      <ModulePageShell>
        <PageHeader
          title="Meetings"
          description="Agenda, minutes, and action items linked to tasks."
          actions={<Button size="sm">+ New meeting</Button>}
        />

        {/* KPIs */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <KpiStatCard label="Total meetings" value={String(DUMMY_MEETINGS.length)} sublabel="This month" />
          <KpiStatCard label="Upcoming" value={String(scheduled)} sublabel="Scheduled" accent="default" />
          <KpiStatCard label="Open action items" value={String(totalActions)} sublabel="Across all meetings" accent="warning" />
          <KpiStatCard label="Completed" value={String(DUMMY_MEETINGS.filter((m) => m.status === "Completed").length)} sublabel="This month" accent="success" />
        </div>

        {/* Filter & search bar */}
        <div className="flex flex-wrap items-center gap-2">
          {(["all", "Scheduled", "Completed"] as FilterStatus[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFilterStatus(s)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                filterStatus === s
                  ? "border-brand/40 bg-brand-light text-primary"
                  : "border-border/60 text-secondary hover:border-brand/30 hover:text-primary"
              }`}
            >
              {s === "all" ? "All meetings" : s}
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
              placeholder="Search meetings…"
              className="rounded-xl border border-border/60 bg-bg py-1.5 pl-9 pr-4 text-sm text-primary placeholder:text-muted focus:border-brand/50 focus:outline-none"
            />
          </div>
        </div>

        <DataTable<MeetingRow>
          variant="card"
          columns={columns}
          data={filtered}
          rowKey={(r) => r.name}
          tableMinWidthClassName="min-w-[620px]"
          maxHeightClassName="max-h-none"
          onRowClick={(r) => setSelected(r)}
          emptyFallback={
            <EmptyState
              title="No meetings found"
              description={
                search || filterStatus !== "all"
                  ? "Try adjusting your filters."
                  : "Schedule your first meeting to track agendas and action items."
              }
              action={
                !search && filterStatus === "all"
                  ? { label: "+ New meeting" }
                  : undefined
              }
            />
          }
        />
      </ModulePageShell>

      {selected && (
        <MeetingDrawer meeting={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
