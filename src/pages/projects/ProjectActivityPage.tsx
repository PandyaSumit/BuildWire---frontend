import { memo, useMemo, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { ACTIVITY_ENTITY_ICON } from "@/config/pm/activity";
import { ModulePageShell } from "@/features/project-ui/components";
import {
  type LogEvent,
} from "@/features/project-ui/projectDummyData";

type EntityFilter =
  | "all"
  | "task"
  | "rfi"
  | "report"
  | "drawing"
  | "inspection"
  | "expense";

const ENTITY_LABELS: Record<EntityFilter, string> = {
  all: "All",
  task: "Tasks",
  rfi: "RFIs",
  report: "Reports",
  drawing: "Drawings",
  inspection: "Inspections",
  expense: "Expenses",
};

const ENTITY_COLOR: Record<string, string> = {
  task: "border-brand/25 bg-brand/[0.06] text-brand",
  rfi: "border-warning/25 bg-warning/[0.06] text-warning",
  report: "border-success/25 bg-success/[0.06] text-success",
  drawing: "border-purple-500/25 bg-purple-500/[0.06] text-purple-600 dark:text-purple-300",
  inspection: "border-danger/25 bg-danger/[0.06] text-danger",
  expense: "border-muted/30 bg-muted/10 text-muted",
};

// ── Richer activity data with more entries ────────────────────────────────────
const EXTENDED_ACTIVITY_LOG: { label: string; events: LogEvent[] }[] = [
  {
    label: "Today",
    events: [
      { user: "Raj Kumar", text: "changed status of T-042 from In Progress → Completed", when: "2h ago", entity: "task" },
      { user: "System", text: "Auto-reminder: Daily Report for Mar 20 not yet submitted", when: "3h ago", entity: "report" },
      { user: "Priya Shah", text: "submitted Daily Report for Mar 18", when: "5h ago", entity: "report" },
      { user: "Neha Desai", text: "uploaded A-102 Rev D to Drawings", when: "6h ago", entity: "drawing" },
      { user: "Ananya Mehta", text: "approved change order CO-006 (₹42L — lobby flooring upgrade)", when: "7h ago", entity: "expense" },
    ],
  },
  {
    label: "Yesterday",
    events: [
      { user: "System", text: "RFI-014 answered by Architect", when: "4:12 PM", entity: "rfi" },
      { user: "PM", text: "approved expense EX-441 (tower crane hire ₹8.2L)", when: "11:20 AM", entity: "expense" },
      { user: "QC Lead", text: "created inspection IN-088 (Floor 3 waterproofing)", when: "10:45 AM", entity: "inspection" },
      { user: "Vikram Sinha", text: "created RFI-015 (bonding at roof steel canopy)", when: "9:30 AM", entity: "rfi" },
      { user: "Amit Verma", text: "added 4 photos to task T-038", when: "9:15 AM", entity: "task" },
    ],
  },
  {
    label: "March 15",
    events: [
      { user: "QC Lead", text: "inspection IN-087 passed — MEP rough-in L2", when: "2:00 PM", entity: "inspection" },
      { user: "Raj Kumar", text: "moved T-035 to In Review", when: "11:30 AM", entity: "task" },
      { user: "Ananya Mehta", text: "approved Daily Report for Mar 14 (submitted by Priya Shah)", when: "10:00 AM", entity: "report" },
    ],
  },
  {
    label: "March 14",
    events: [
      { user: "MEP Lead", text: "responded to RFI-012 (fire seal rating)", when: "4:45 PM", entity: "rfi" },
      { user: "Neha Desai", text: "uploaded S-201 Rev B to Drawings", when: "2:30 PM", entity: "drawing" },
      { user: "PM", text: "rejected expense EX-440 (incomplete receipt)", when: "1:15 PM", entity: "expense" },
      { user: "Amit Verma", text: "created task T-042 (curtain wall anchor check)", when: "10:00 AM", entity: "task" },
    ],
  },
];

// ── Export modal ──────────────────────────────────────────────────────────────
function ExportModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label="Close"
      />
      <div className="relative w-full max-w-sm rounded-2xl border border-border bg-elevated p-6 shadow-2xl">
        <h3 className="mb-1 text-base font-semibold text-primary">Export activity log</h3>
        <p className="mb-4 text-sm text-secondary">
          Export a compliance-ready audit trail for the selected period.
        </p>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-[12px] font-medium text-secondary">Date range</label>
            <div className="flex gap-2">
              <input type="date" className="flex-1 rounded-lg border border-border/60 bg-bg px-2 py-2 text-sm text-primary" defaultValue="2026-03-01" />
              <input type="date" className="flex-1 rounded-lg border border-border/60 bg-bg px-2 py-2 text-sm text-primary" defaultValue="2026-03-30" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-[12px] font-medium text-secondary">Format</label>
            <select className="w-full rounded-lg border border-border/60 bg-bg px-3 py-2 text-sm text-primary">
              <option>CSV</option>
              <option>PDF (audit trail)</option>
              <option>Excel</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[12px] font-medium text-secondary">Filter by entity (optional)</label>
            <select className="w-full rounded-lg border border-border/60 bg-bg px-3 py-2 text-sm text-primary">
              <option>All entities</option>
              <option>Tasks only</option>
              <option>RFIs only</option>
              <option>Financial (expenses + COs)</option>
            </select>
          </div>
        </div>
        <div className="mt-5 flex gap-2">
          <Button size="sm" className="flex-1">Export</Button>
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

// ── Event row component ───────────────────────────────────────────────────────
const EventRow = memo(function EventRow({ event }: { event: LogEvent }) {
  const icon = event.entity ? ACTIVITY_ENTITY_ICON[event.entity] : "·";
  const colorClass = event.entity ? ENTITY_COLOR[event.entity] : "border-border/40 bg-bg text-muted";

  return (
    <li className="group flex gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-muted/[0.06]">
      <div className="relative mt-0.5 flex shrink-0 flex-col items-center">
        <Avatar name={event.user} size="sm" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] text-primary">
          <span className="font-semibold">{event.user}</span>{" "}
          <span className="text-secondary">{event.text}</span>
        </p>
        <p className="mt-0.5 text-[11px] text-muted">{event.when}</p>
      </div>
      {event.entity ? (
        <span
          className={`mt-1 shrink-0 rounded-md border px-1.5 py-0.5 text-[11px] capitalize ${colorClass}`}
        >
          {icon} {event.entity}
        </span>
      ) : null}
    </li>
  );
});

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ProjectActivityPage() {
  const [entityFilter, setEntityFilter] = useState<EntityFilter>("all");
  const [userFilter, setUserFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [showExport, setShowExport] = useState(false);
  const [visibleGroups, setVisibleGroups] = useState(2);

  // All unique users
  const allUsers = useMemo(() => {
    const users = new Set<string>();
    EXTENDED_ACTIVITY_LOG.forEach((g) => g.events.forEach((e) => users.add(e.user)));
    return ["all", ...Array.from(users)];
  }, []);

  const filteredGroups = useMemo(() => {
    return EXTENDED_ACTIVITY_LOG.map((group) => ({
      ...group,
      events: group.events.filter((e) => {
        const matchesEntity = entityFilter === "all" || e.entity === entityFilter;
        const matchesUser = userFilter === "all" || e.user === userFilter;
        const matchesSearch = !search || e.text.toLowerCase().includes(search.toLowerCase()) || e.user.toLowerCase().includes(search.toLowerCase());
        return matchesEntity && matchesUser && matchesSearch;
      }),
    })).filter((g) => g.events.length > 0);
  }, [entityFilter, userFilter, search]);

  const visibleGroupsData = filteredGroups.slice(0, visibleGroups);
  const hasMore = filteredGroups.length > visibleGroups;

  const totalEvents = filteredGroups.reduce((s, g) => s + g.events.length, 0);

  return (
    <>
      <ModulePageShell>
        <PageHeader
          title="Activity log"
          description="Immutable audit trail — filter, search, and export for compliance."
          actions={
            <div className="flex items-center gap-2">
              <Button size="sm" variant="secondary" onClick={() => setShowExport(true)}>
                Export CSV
              </Button>
            </div>
          }
        />

        {/* Live indicator */}
        <div className="flex items-center gap-2 rounded-xl border border-success/20 bg-success/[0.04] px-3 py-2 text-[12px] text-secondary">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
          <span>Live — updates in real-time as team members take actions on this project.</span>
          <span className="ml-auto font-medium text-primary">{totalEvents} events shown</span>
        </div>

        {/* Filters row */}
        <div className="space-y-2">
          {/* Entity filter chips */}
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(ENTITY_LABELS) as EntityFilter[]).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setEntityFilter(f)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  entityFilter === f
                    ? "border-brand/40 bg-brand-light text-primary"
                    : "border-border/60 text-secondary hover:border-brand/30 hover:text-primary"
                }`}
              >
                {f !== "all" && (
                  <span className="mr-1">{ACTIVITY_ENTITY_ICON[f] ?? ""}</span>
                )}
                {ENTITY_LABELS[f]}
              </button>
            ))}
          </div>

          {/* Search + user filter */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
                🔍
              </span>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search activity…"
                className="w-full rounded-xl border border-border/60 bg-bg py-1.5 pl-9 pr-4 text-sm text-primary placeholder:text-muted focus:border-brand/50 focus:outline-none"
              />
            </div>
            <select
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="rounded-xl border border-border/60 bg-bg px-3 py-1.5 text-sm text-primary focus:border-brand/50 focus:outline-none"
            >
              {allUsers.map((u) => (
                <option key={u} value={u}>
                  {u === "all" ? "All members" : u}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Activity timeline */}
        {visibleGroupsData.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted">
            No activity matches your filters.
          </div>
        ) : (
          <div className="space-y-8">
            {visibleGroupsData.map((group) => (
              <section key={group.label}>
                <div className="mb-2 flex items-center gap-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                    {group.label}
                  </p>
                  <div className="h-px flex-1 bg-border/50" />
                  <span className="text-[11px] text-muted">
                    {group.events.length} event{group.events.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <ul className="space-y-0.5">
                  {group.events.map((e, i) => (
                    <EventRow key={`${group.label}-${i}`} event={e} />
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}

        {/* Load more */}
        {hasMore && (
          <button
            type="button"
            onClick={() => setVisibleGroups((v) => v + 2)}
            className="w-full rounded-xl border border-border/60 py-2.5 text-sm text-secondary hover:bg-muted/10 hover:text-primary"
          >
            Load older activity ({filteredGroups.length - visibleGroups} more group{filteredGroups.length - visibleGroups !== 1 ? "s" : ""})
          </button>
        )}
      </ModulePageShell>

      {showExport && <ExportModal onClose={() => setShowExport(false)} />}
    </>
  );
}
