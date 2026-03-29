import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { SheetDrawer } from "@/components/ui/sheet-drawer";
import { StatsBar } from "@/components/ui/stats-bar";
import {
  RFI_PRIORITY_BADGE_VARIANT,
  RFI_STATUS_BADGE_VARIANT,
  RFI_TRADE_PILL_CLASSES,
} from "@/config/pm/rfi";
import { SemanticPill, ModulePageShell } from "@/features/project-ui/components";
import {
  DUMMY_RFIS,
  DUMMY_RFIS_STATS,
  type DummyRfiRow,
} from "@/features/project-ui/projectDummyData";

function RfiDetailDrawer({
  rfi,
  onClose,
}: {
  rfi: DummyRfiRow;
  onClose: () => void;
}) {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex shrink-0 items-start justify-between border-b border-border/60 px-5 py-4">
        <div className="min-w-0">
          <p className="font-mono text-xs font-medium text-muted">{rfi.num}</p>
          <h2 className="mt-1 font-[family-name:var(--font-dm-sans)] text-base font-semibold leading-snug text-primary">
            {rfi.title}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="ml-4 shrink-0 rounded-lg p-1.5 text-muted hover:bg-muted/15 hover:text-primary"
          aria-label="Close"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant={RFI_PRIORITY_BADGE_VARIANT[rfi.priority]}
            size="sm"
          >
            {rfi.priority}
          </Badge>
          <Badge
            variant={RFI_STATUS_BADGE_VARIANT[rfi.status] ?? "default"}
            size="sm"
          >
            {rfi.status}
          </Badge>
          <SemanticPill label={rfi.trade} palette={RFI_TRADE_PILL_CLASSES} />
          {rfi.costImpact ? (
            <span className="inline-flex items-center gap-1 rounded-md border border-warning/30 bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning">
              Cost impact
            </span>
          ) : null}
        </div>

        <div className="grid grid-cols-1 gap-3 rounded-xl bg-muted/[0.06] p-4 text-sm sm:grid-cols-2 sm:gap-x-6 sm:gap-y-3">
          <div>
            <p className="text-xs text-muted">Ball in court</p>
            <p className="mt-0.5 font-medium text-primary">
              {rfi.ballInCourt || "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted">Due date</p>
            <p className="mt-0.5 font-medium text-primary">{rfi.due || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted">Submitted by</p>
            <p className="mt-0.5 font-medium text-primary">
              {rfi.submittedBy || "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted">Assigned to</p>
            <p className="mt-0.5 font-medium text-primary">
              {rfi.assignedTo || "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted">Days open</p>
            <p className="mt-0.5 font-medium text-primary">{rfi.daysOpen}</p>
          </div>
          <div>
            <p className="text-xs text-muted">Trade</p>
            <p className="mt-0.5 font-medium text-primary">{rfi.trade}</p>
          </div>
        </div>

        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
            Question
          </p>
          <div className="rounded-xl bg-muted/[0.06] p-4">
            <p className="text-sm leading-relaxed text-secondary">
              {rfi.title} — full question body will appear after backend
              integration.
            </p>
          </div>
        </div>

        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
            Response
          </p>
          <div className="rounded-xl border border-dashed border-border/60 bg-bg p-4">
            {rfi.status === "Answered" || rfi.status === "Closed" ? (
              <p className="text-sm text-secondary">
                Response recorded — full text shown after backend integration.
              </p>
            ) : (
              <p className="text-sm italic text-muted">No response yet.</p>
            )}
          </div>
        </div>

        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
            Attachments
          </p>
          <div className="flex h-14 items-center justify-center rounded-xl border border-dashed border-border/60 bg-bg text-sm text-muted">
            No attachments
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-between border-t border-border/60 px-5 py-3">
        <button
          type="button"
          className="text-sm text-secondary hover:text-primary"
        >
          View full page
        </button>
        {rfi.status !== "Closed" && rfi.status !== "Void" ? (
          <Button size="sm">Respond</Button>
        ) : null}
      </div>
    </div>
  );
}

function buildColumns(): DataTableColumn<DummyRfiRow>[] {
  return [
    {
      id: "num",
      header: "RFI #",
      headerClassName: "pl-4 pr-3 w-[88px]",
      cellClassName: "pl-4 pr-3",
      sortValue: (r) => r.num,
      cell: (r) => (
        <span className="font-mono text-xs font-semibold text-brand">{r.num}</span>
      ),
    },
    {
      id: "title",
      header: "Title",
      headerClassName: "px-3 min-w-[12rem] w-[40%]",
      cellClassName: "px-3 min-w-0",
      sortValue: (r) => r.title,
      cell: (r) => (
        <span
          className="block min-w-0 truncate text-[13px] font-medium text-primary"
          title={r.title}
        >
          {r.title}
        </span>
      ),
    },
    {
      id: "trade",
      header: "Trade",
      headerClassName: "px-3",
      cellClassName: "px-3",
      sortValue: (r) => r.trade,
      cell: (r) => (
        <SemanticPill label={r.trade} palette={RFI_TRADE_PILL_CLASSES} />
      ),
    },
    {
      id: "priority",
      header: "Priority",
      headerClassName: "px-3",
      cellClassName: "px-3",
      sortValue: (r) => r.priority,
      cell: (r) => (
        <Badge variant={RFI_PRIORITY_BADGE_VARIANT[r.priority]} size="sm">
          {r.priority}
        </Badge>
      ),
    },
    {
      id: "status",
      header: "Status",
      headerClassName: "px-3",
      cellClassName: "px-3",
      sortValue: (r) => r.status,
      cell: (r) => (
        <Badge variant={RFI_STATUS_BADGE_VARIANT[r.status] ?? "default"} size="sm">
          {r.status}
        </Badge>
      ),
    },
    {
      id: "ballInCourt",
      header: "BIC",
      headerClassName: "px-3",
      cellClassName: "px-3",
      sortValue: (r) => r.ballInCourt,
      cell: (r) => (
        <span className="text-[13px] text-secondary">{r.ballInCourt || "—"}</span>
      ),
    },
    {
      id: "submittedBy",
      header: "Submitted by",
      headerClassName: "px-3",
      cellClassName: "px-3",
      sortValue: (r) => r.submittedBy,
      cell: (r) => (
        <span className="text-[13px] text-secondary">{r.submittedBy}</span>
      ),
    },
    {
      id: "assignedTo",
      header: "Assigned to",
      headerClassName: "px-3",
      cellClassName: "px-3",
      sortValue: (r) => r.assignedTo,
      cell: (r) => (
        <span className="text-[13px] text-secondary">{r.assignedTo || "—"}</span>
      ),
    },
    {
      id: "due",
      header: "Due",
      headerClassName: "px-3",
      cellClassName: "px-3 whitespace-nowrap",
      sortValue: (r) => r.due,
      cell: (r) => (
        <span className="text-[13px] text-secondary">{r.due || "—"}</span>
      ),
    },
    {
      id: "daysOpen",
      header: "Days open",
      headerClassName: "px-3",
      cellClassName: "px-3",
      align: "right",
      sortValue: (r) => r.daysOpen,
      cell: (r) => (
        <span
          className={`text-[13px] tabular-nums ${r.daysOpen > 7 ? "font-semibold text-warning" : "text-secondary"}`}
        >
          {r.daysOpen}
        </span>
      ),
    },
    {
      id: "costImpact",
      header: "Cost",
      headerClassName: "px-3 pr-4",
      cellClassName: "px-3 pr-4",
      align: "center",
      sortValue: (r) => (r.costImpact ? 1 : 0),
      cell: (r) =>
        r.costImpact ? (
          <span className="font-mono text-sm font-semibold text-warning">$</span>
        ) : (
          <span className="text-muted">—</span>
        ),
    },
  ];
}

export default function ProjectRfisPage() {
  const [selectedRfi, setSelectedRfi] = useState<DummyRfiRow | null>(null);
  const columns = useMemo(() => buildColumns(), []);

  return (
    <ModulePageShell>
      <PageHeader
        title="RFIs"
        description="Ball-in-court, impact flags, and formal responses."
        actions={<Button size="sm">+ New RFI</Button>}
      />

      <StatsBar
        stats={[
          { label: "Total", value: DUMMY_RFIS_STATS.total },
          { label: "Open", value: DUMMY_RFIS_STATS.open, accent: "warning" },
          {
            label: "Overdue",
            value: DUMMY_RFIS_STATS.overdue,
            accent: "danger",
          },
          {
            label: "Avg response",
            value: `${DUMMY_RFIS_STATS.avgResponseDays}d`,
          },
        ]}
      />

      <DataTable<DummyRfiRow>
        variant="card"
        density="comfortable"
        columns={columns}
        data={DUMMY_RFIS}
        rowKey={(r) => r.num}
        tableMinWidthClassName="min-w-[860px]"
        minWidthTableLayout="fixed"
        maxHeightClassName="max-h-none"
        onRowClick={(r) => setSelectedRfi(r)}
        emptyFallback={
          <EmptyState
            title="No RFIs yet"
            description="Create your first RFI to track questions and formal responses."
            action={{ label: "+ New RFI" }}
          />
        }
      />

      <SheetDrawer
        open={selectedRfi !== null}
        onClose={() => setSelectedRfi(null)}
        hideTitleBar
        widthClassName="max-w-[480px] sm:max-w-[520px]"
      >
        {selectedRfi ? (
          <RfiDetailDrawer
            rfi={selectedRfi}
            onClose={() => setSelectedRfi(null)}
          />
        ) : null}
      </SheetDrawer>
    </ModulePageShell>
  );
}
