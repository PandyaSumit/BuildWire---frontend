import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { SheetDrawer } from "@/components/ui/sheet-drawer";
import { StatsBar } from "@/components/ui/stats-bar";
import {
  DUMMY_RFIS,
  DUMMY_RFIS_STATS,
  type DummyRfiRow,
} from "@/features/project-ui/projectDummyData";

const STATUS_VARIANT: Record<
  string,
  "success" | "warning" | "secondary" | "default" | "danger"
> = {
  Open: "warning",
  "Under Review": "secondary",
  Answered: "success",
  Closed: "default",
  Draft: "secondary",
  Void: "danger",
};

const TRADE_COLORS: Record<string, string> = {
  Structural:
    "bg-amber-500/10 text-amber-800 dark:text-amber-200 border-amber-500/25",
  MEP: "bg-cyan-500/10 text-cyan-800 dark:text-cyan-200 border-cyan-500/25",
  Finishing:
    "bg-violet-500/10 text-violet-800 dark:text-violet-200 border-violet-500/25",
  Waterproofing:
    "bg-blue-500/10 text-blue-800 dark:text-blue-200 border-blue-500/25",
  Architectural:
    "bg-indigo-500/10 text-indigo-800 dark:text-indigo-200 border-indigo-500/25",
  Electrical:
    "bg-yellow-500/10 text-yellow-800 dark:text-yellow-200 border-yellow-500/25",
};

function TradePill({ trade }: { trade: string }) {
  const cls =
    TRADE_COLORS[trade] ?? "bg-muted/20 text-secondary border-border";
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${cls}`}
    >
      {trade}
    </span>
  );
}

function RfiDetailDrawer({
  rfi,
  onClose,
}: {
  rfi: DummyRfiRow;
  onClose: () => void;
}) {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="flex shrink-0 items-start justify-between border-b border-border px-5 py-4">
        <div className="min-w-0">
          <p className="font-mono text-xs font-medium text-muted">{rfi.num}</p>
          <h2 className="mt-1 font-[family-name:var(--font-dm-sans)] text-base font-semibold leading-snug text-primary">
            {rfi.title}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="ml-4 shrink-0 rounded-lg p-1.5 text-muted hover:bg-surface hover:text-primary"
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

      {/* Body */}
      <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
        {/* Status badges */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={rfi.pri === "Urgent" ? "danger" : "secondary"} size="sm">
            {rfi.pri}
          </Badge>
          <Badge variant={STATUS_VARIANT[rfi.status] ?? "default"} size="sm">
            {rfi.status}
          </Badge>
          <TradePill trade={rfi.trade} />
          {rfi.cost && (
            <span className="inline-flex items-center gap-1 rounded-md border border-warning/30 bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning">
              $ Cost impact
            </span>
          )}
        </div>

        {/* Metadata grid */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-3 rounded-xl border border-border bg-surface p-4 text-sm">
          <div>
            <p className="text-xs text-muted">Ball in court</p>
            <p className="mt-0.5 font-medium text-primary">{rfi.bic || "—"}</p>
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
            <p className="mt-0.5 font-medium text-primary">{rfi.days}</p>
          </div>
          <div>
            <p className="text-xs text-muted">Trade</p>
            <p className="mt-0.5 font-medium text-primary">{rfi.trade}</p>
          </div>
        </div>

        {/* Question */}
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
            Question
          </p>
          <div className="rounded-xl border border-border bg-surface p-4">
            <p className="text-sm leading-relaxed text-secondary">
              {rfi.title} — full question body will appear after backend
              integration.
            </p>
          </div>
        </div>

        {/* Response */}
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
            Response
          </p>
          <div className="rounded-xl border border-dashed border-border bg-bg p-4">
            {rfi.status === "Answered" || rfi.status === "Closed" ? (
              <p className="text-sm text-secondary">
                Response recorded — full text shown after backend integration.
              </p>
            ) : (
              <p className="text-sm italic text-muted">No response yet.</p>
            )}
          </div>
        </div>

        {/* Attachments */}
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
            Attachments
          </p>
          <div className="flex h-14 items-center justify-center rounded-xl border border-dashed border-border bg-bg text-sm text-muted">
            No attachments
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex shrink-0 items-center justify-between border-t border-border px-5 py-3">
        <button
          type="button"
          className="text-sm text-secondary hover:text-primary"
        >
          View full page
        </button>
        {rfi.status !== "Closed" && rfi.status !== "Void" && (
          <Button size="sm">Respond</Button>
        )}
      </div>
    </div>
  );
}

const COLUMNS: DataTableColumn<DummyRfiRow>[] = [
  {
    id: "num",
    header: "RFI #",
    headerClassName: "pl-4 pr-3 w-[88px]",
    cellClassName: "pl-4 pr-3",
    cell: (r) => (
      <span className="font-mono text-xs font-semibold text-brand">{r.num}</span>
    ),
  },
  {
    id: "title",
    header: "Title",
    headerClassName: "px-3",
    cellClassName: "px-3",
    cell: (r) => (
      <span
        className="block max-w-[220px] truncate text-[13px] font-medium text-primary"
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
    cell: (r) => <TradePill trade={r.trade} />,
  },
  {
    id: "priority",
    header: "Priority",
    headerClassName: "px-3",
    cellClassName: "px-3",
    cell: (r) => (
      <Badge variant={r.pri === "Urgent" ? "danger" : "secondary"} size="sm">
        {r.pri}
      </Badge>
    ),
  },
  {
    id: "status",
    header: "Status",
    headerClassName: "px-3",
    cellClassName: "px-3",
    cell: (r) => (
      <Badge variant={STATUS_VARIANT[r.status] ?? "default"} size="sm">
        {r.status}
      </Badge>
    ),
  },
  {
    id: "bic",
    header: "BIC",
    headerClassName: "px-3",
    cellClassName: "px-3",
    cell: (r) => (
      <span className="text-[13px] text-secondary">{r.bic || "—"}</span>
    ),
  },
  {
    id: "submittedBy",
    header: "Submitted by",
    headerClassName: "px-3",
    cellClassName: "px-3",
    cell: (r) => (
      <span className="text-[13px] text-secondary">{r.submittedBy}</span>
    ),
  },
  {
    id: "assignedTo",
    header: "Assigned to",
    headerClassName: "px-3",
    cellClassName: "px-3",
    cell: (r) => (
      <span className="text-[13px] text-secondary">{r.assignedTo || "—"}</span>
    ),
  },
  {
    id: "due",
    header: "Due",
    headerClassName: "px-3",
    cellClassName: "px-3 whitespace-nowrap",
    cell: (r) => (
      <span className="text-[13px] text-secondary">{r.due || "—"}</span>
    ),
  },
  {
    id: "days",
    header: "Days open",
    headerClassName: "px-3",
    cellClassName: "px-3",
    align: "right",
    cell: (r) => (
      <span
        className={`text-[13px] tabular-nums ${r.days > 7 ? "font-semibold text-warning" : "text-secondary"}`}
      >
        {r.days}
      </span>
    ),
  },
  {
    id: "cost",
    header: "Cost",
    headerClassName: "px-3 pr-4",
    cellClassName: "px-3 pr-4",
    align: "center",
    cell: (r) =>
      r.cost ? (
        <span className="font-mono text-sm font-semibold text-warning">$</span>
      ) : (
        <span className="text-muted">—</span>
      ),
  },
];

export default function ProjectRfisPage() {
  const [selectedRfi, setSelectedRfi] = useState<DummyRfiRow | null>(null);

  return (
    <div className="flex min-h-full flex-col gap-5 p-6">
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
          { label: "Avg response", value: `${DUMMY_RFIS_STATS.avgResponseDays}d` },
        ]}
      />

      <DataTable<DummyRfiRow>
        variant="card"
        columns={COLUMNS}
        data={DUMMY_RFIS}
        rowKey={(r) => r.num}
        tableMinWidthClassName="min-w-[860px]"
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
        widthClassName="max-w-[480px]"
      >
        {selectedRfi && (
          <RfiDetailDrawer
            rfi={selectedRfi}
            onClose={() => setSelectedRfi(null)}
          />
        )}
      </SheetDrawer>
    </div>
  );
}
