import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { KpiStatCard } from "@/components/ui/kpi-stat-card";
import { PageHeader } from "@/components/ui/page-header";
import { ProgressBar } from "@/components/ui/progress-bar";
import { SegmentedControl } from "@/components/ui/segmented-control";
import {
  PM_APPROVAL_TRI_STATE_BADGE,
  PM_APPROVED_PENDING_BADGE,
} from "@/design-system/pm-label-system";
import { ModulePageShell } from "@/features/project-ui/components";
import {
  DUMMY_BUDGET_LINES,
  DUMMY_CHANGE_ORDERS,
  DUMMY_EXPENSES,
  DUMMY_PAYMENT_PLANS,
} from "@/features/project-ui/projectDummyData";

type Tab = "budget" | "expenses" | "change_orders" | "payment_plans" | "invoices";

// ── S-curve mini chart ────────────────────────────────────────────────────────
// Planned vs actual spend curve (weekly, 34 weeks)
const SCURVE_PLANNED = [0, 2, 5, 9, 14, 20, 27, 34, 41, 48, 54, 60, 65, 69, 72, 75, 77, 79, 81, 83, 84, 85, 86, 87, 88, 90, 92, 94, 96, 97, 98, 99, 99, 100];
const SCURVE_ACTUAL  = [0, 2, 4, 8, 13, 18, 24, 30, 37, 44, 50, 55, 59, 62, 65, 67, 69, 70, 72, 73, 75, 77, 62]; // up to today (week 22)
const TODAY_WK = 22;

function SCurveChart() {
  const W = 560;
  const H = 120;
  const PAD = { l: 32, r: 12, t: 12, b: 20 };
  const weeks = SCURVE_PLANNED.length;

  const xScale = (w: number) => PAD.l + (w / (weeks - 1)) * (W - PAD.l - PAD.r);
  const yScale = (v: number) => PAD.t + ((100 - v) / 100) * (H - PAD.t - PAD.b);

  const toPath = (data: number[]) =>
    data.map((v, i) => `${i === 0 ? "M" : "L"} ${xScale(i).toFixed(1)} ${yScale(v).toFixed(1)}`).join(" ");

  const plannedPath = toPath(SCURVE_PLANNED);
  const actualPath = toPath(SCURVE_ACTUAL);

  const todayX = xScale(TODAY_WK);

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="min-w-[320px] w-full"
        aria-label="Budget S-curve"
      >
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((v) => (
          <g key={v}>
            <line
              x1={PAD.l}
              x2={W - PAD.r}
              y1={yScale(v)}
              y2={yScale(v)}
              stroke="currentColor"
              strokeOpacity={0.08}
              strokeWidth={1}
              className="text-muted"
            />
            <text
              x={PAD.l - 4}
              y={yScale(v)}
              textAnchor="end"
              dominantBaseline="middle"
              className="fill-muted text-[9px]"
              fontSize={9}
            >
              {v}%
            </text>
          </g>
        ))}

        {/* Today line */}
        <line
          x1={todayX}
          x2={todayX}
          y1={PAD.t}
          y2={H - PAD.b}
          stroke="#3B82F6"
          strokeOpacity={0.5}
          strokeWidth={1.5}
          strokeDasharray="3 2"
        />
        <text x={todayX + 3} y={PAD.t + 10} fontSize={8} className="fill-brand">
          Today
        </text>

        {/* Planned curve */}
        <path
          d={plannedPath}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeOpacity={0.25}
          className="text-muted"
          strokeDasharray="4 2"
        />

        {/* Actual curve */}
        <path
          d={actualPath}
          fill="none"
          stroke="#3B82F6"
          strokeWidth={2}
        />

        {/* Legend */}
        <g transform={`translate(${PAD.l + 8}, ${H - PAD.b + 14})`}>
          <line x1={0} x2={16} y1={0} y2={0} stroke="currentColor" strokeOpacity={0.3} strokeWidth={1.5} strokeDasharray="4 2" className="text-muted" />
          <text x={20} y={0} dominantBaseline="middle" fontSize={9} className="fill-muted">Planned</text>
          <line x1={68} x2={84} y1={0} y2={0} stroke="#3B82F6" strokeWidth={2} />
          <text x={88} y={0} dominantBaseline="middle" fontSize={9} className="fill-muted">Actual</text>
        </g>

        {/* Variance annotation */}
        <text
          x={todayX - 6}
          y={yScale(SCURVE_ACTUAL[TODAY_WK]) - 6}
          textAnchor="end"
          fontSize={9}
          fill="#EF4444"
        >
          -5% variance
        </text>
      </svg>
    </div>
  );
}

// ── Invoice data ──────────────────────────────────────────────────────────────
const DUMMY_INVOICES = [
  { num: "INV-042", vendor: "Acme Infra Pvt Ltd", amount: "₹48.2L", period: "Mar 2026", submitted: "Mar 17", status: "Pending" as const, soV: "Civil — L9–L11" },
  { num: "INV-041", vendor: "MEP Pro", amount: "₹22.8L", period: "Mar 2026", submitted: "Mar 15", status: "Approved" as const, soV: "MEP rough-in L7–L9" },
  { num: "INV-040", vendor: "GlassCo", amount: "₹14.5L", period: "Feb 2026", submitted: "Feb 28", status: "Approved" as const, soV: "Curtain wall panels — N" },
  { num: "INV-039", vendor: "Acme Infra Pvt Ltd", amount: "₹52.0L", period: "Feb 2026", submitted: "Feb 20", status: "Approved" as const, soV: "Civil — L6–L8" },
];

type Invoice = (typeof DUMMY_INVOICES)[number];

const INVOICE_COLUMNS: DataTableColumn<Invoice>[] = [
  {
    id: "num",
    header: "Invoice #",
    headerClassName: "w-[100px]",
    cellClassName: "",
    cell: (r) => <span className="font-mono text-xs font-semibold text-brand">{r.num}</span>,
  },
  {
    id: "vendor",
    header: "Vendor",
    headerClassName: "",
    cellClassName: "",
    cell: (r) => <span className="text-[13px] font-medium text-primary">{r.vendor}</span>,
  },
  {
    id: "soV",
    header: "Scope (SOV)",
    headerClassName: "",
    cellClassName: "",
    cell: (r) => <span className="text-[13px] text-secondary">{r.soV}</span>,
  },
  {
    id: "amount",
    header: "Amount",
    headerClassName: "",
    cellClassName: "",
    align: "right",
    cell: (r) => <span className="font-mono text-[13px] font-semibold text-primary">{r.amount}</span>,
  },
  {
    id: "submitted",
    header: "Submitted",
    headerClassName: "",
    cellClassName: "whitespace-nowrap",
    cell: (r) => <span className="font-mono text-[13px] text-secondary">{r.submitted}</span>,
  },
  {
    id: "status",
    header: "Status",
    headerClassName: "pr-4",
    cellClassName: "pr-4",
    cell: (r) => (
      <Badge variant={PM_APPROVED_PENDING_BADGE[r.status]} size="sm">{r.status}</Badge>
    ),
  },
];

// ── Budget columns ────────────────────────────────────────────────────────────
type BudgetLine = (typeof DUMMY_BUDGET_LINES)[number];

const BUDGET_COLUMNS: DataTableColumn<BudgetLine>[] = [
  {
    id: "cat",
    header: "Category",
    headerClassName: "",
    cellClassName: "",
    cell: (r) => <span className="text-[13px] font-medium text-primary">{r.cat}</span>,
  },
  {
    id: "budgeted",
    header: "Budgeted",
    headerClassName: "",
    cellClassName: "",
    align: "right",
    cell: (r) => <span className="font-mono text-[13px] text-secondary">{r.budgeted}</span>,
  },
  {
    id: "cos",
    header: "Approved COs",
    headerClassName: "",
    cellClassName: "",
    align: "right",
    cell: (r) => <span className="font-mono text-[13px] text-secondary">{r.cos}</span>,
  },
  {
    id: "revised",
    header: "Revised",
    headerClassName: "",
    cellClassName: "",
    align: "right",
    cell: (r) => <span className="font-mono text-[13px] text-secondary">{r.revised}</span>,
  },
  {
    id: "spent",
    header: "Spent",
    headerClassName: "",
    cellClassName: "",
    align: "right",
    cell: (r) => <span className="font-mono text-[13px] font-semibold text-primary">{r.spent}</span>,
  },
  {
    id: "remaining",
    header: "Remaining",
    headerClassName: "",
    cellClassName: "",
    align: "right",
    cell: (r) => <span className="font-mono text-[13px] text-secondary">{r.remaining}</span>,
  },
  {
    id: "pct",
    header: "% used",
    headerClassName: "pr-4",
    cellClassName: "pr-4",
    cell: (r) => (
      <div className="flex items-center gap-2">
        <ProgressBar
          value={r.pct}
          max={100}
          size="sm"
          className="w-20"
          variant={r.pct >= 90 ? "danger" : r.pct >= 80 ? "warning" : "success"}
        />
        <span className="w-8 text-right text-[12px] tabular-nums text-muted">{r.pct}%</span>
      </div>
    ),
  },
];

// ── Expenses columns ──────────────────────────────────────────────────────────
type Expense = (typeof DUMMY_EXPENSES)[number];

const EXPENSE_COLUMNS: DataTableColumn<Expense>[] = [
  {
    id: "desc",
    header: "Description",
    headerClassName: "",
    cellClassName: "",
    cell: (r) => <span className="text-[13px] font-medium text-primary">{r.desc}</span>,
  },
  {
    id: "category",
    header: "Category",
    headerClassName: "",
    cellClassName: "",
    cell: (r) => <span className="text-[13px] text-secondary">{r.category}</span>,
  },
  {
    id: "vendor",
    header: "Vendor",
    headerClassName: "",
    cellClassName: "",
    cell: (r) => <span className="text-[13px] text-secondary">{r.vendor}</span>,
  },
  {
    id: "amount",
    header: "Amount",
    headerClassName: "",
    cellClassName: "",
    align: "right",
    cell: (r) => <span className="font-mono text-[13px] font-semibold text-primary">{r.amount}</span>,
  },
  {
    id: "date",
    header: "Date",
    headerClassName: "",
    cellClassName: "whitespace-nowrap",
    cell: (r) => <span className="font-mono text-[13px] text-secondary">{r.date}</span>,
  },
  {
    id: "by",
    header: "By",
    headerClassName: "",
    cellClassName: "",
    cell: (r) => <span className="text-[13px] text-secondary">{r.by}</span>,
  },
  {
    id: "status",
    header: "Status",
    headerClassName: "pr-4",
    cellClassName: "pr-4",
    cell: (r) => (
      <Badge variant={PM_APPROVAL_TRI_STATE_BADGE[r.status]} size="sm">{r.status}</Badge>
    ),
  },
];

// ── Change orders columns ─────────────────────────────────────────────────────
type ChangeOrder = (typeof DUMMY_CHANGE_ORDERS)[number];

const CO_COLUMNS: DataTableColumn<ChangeOrder>[] = [
  {
    id: "num",
    header: "CO #",
    headerClassName: "w-[80px]",
    cellClassName: "",
    cell: (r) => <span className="font-mono text-xs font-semibold text-brand">{r.num}</span>,
  },
  {
    id: "title",
    header: "Title",
    headerClassName: "",
    cellClassName: "",
    cell: (r) => <span className="text-[13px] font-medium text-primary">{r.title}</span>,
  },
  {
    id: "reason",
    header: "Reason",
    headerClassName: "",
    cellClassName: "",
    cell: (r) => <span className="text-[13px] text-secondary">{r.reason}</span>,
  },
  {
    id: "amount",
    header: "Amount",
    headerClassName: "",
    cellClassName: "",
    align: "right",
    cell: (r) => (
      <span className={`font-mono text-[13px] font-semibold ${r.amount.startsWith("+") ? "text-success" : "text-danger"}`}>
        {r.amount}
      </span>
    ),
  },
  {
    id: "status",
    header: "Status",
    headerClassName: "",
    cellClassName: "",
    cell: (r) => (
      <Badge variant={PM_APPROVED_PENDING_BADGE[r.status]} size="sm">{r.status}</Badge>
    ),
  },
  {
    id: "date",
    header: "Date",
    headerClassName: "",
    cellClassName: "whitespace-nowrap",
    cell: (r) => <span className="font-mono text-[13px] text-secondary">{r.date}</span>,
  },
  {
    id: "actions",
    header: "",
    headerClassName: "pr-4 w-[100px]",
    cellClassName: "pr-4",
    cell: (r) =>
      r.status === "Pending" ? (
        <div className="flex gap-1.5">
          <button
            type="button"
            className="rounded-md border border-success/30 bg-success/[0.06] px-2.5 py-1 text-[11px] font-medium text-success hover:bg-success/10"
          >
            Approve
          </button>
          <button
            type="button"
            className="rounded-md border border-danger/30 bg-danger/[0.06] px-2.5 py-1 text-[11px] font-medium text-danger hover:bg-danger/10"
          >
            Reject
          </button>
        </div>
      ) : null,
  },
];

// ── Payment plan columns ──────────────────────────────────────────────────────
type PaymentPlan = (typeof DUMMY_PAYMENT_PLANS)[number];

const PP_COLUMNS: DataTableColumn<PaymentPlan>[] = [
  {
    id: "unit",
    header: "Unit",
    headerClassName: "",
    cellClassName: "",
    cell: (r) => <span className="font-mono text-[13px] font-semibold text-primary">{r.unit}</span>,
  },
  {
    id: "buyer",
    header: "Buyer",
    headerClassName: "",
    cellClassName: "",
    cell: (r) => <span className="text-[13px] text-secondary">{r.buyer}</span>,
  },
  {
    id: "value",
    header: "Total value",
    headerClassName: "",
    cellClassName: "",
    align: "right",
    cell: (r) => <span className="font-mono text-[13px] text-secondary">{r.value}</span>,
  },
  {
    id: "paid",
    header: "Paid",
    headerClassName: "",
    cellClassName: "",
    align: "right",
    cell: (r) => <span className="font-mono text-[13px] font-semibold text-primary">{r.paid}</span>,
  },
  {
    id: "next",
    header: "Next due",
    headerClassName: "",
    cellClassName: "whitespace-nowrap",
    cell: (r) => <span className="font-mono text-[13px] text-secondary">{r.next}</span>,
  },
  {
    id: "overdue",
    header: "Days overdue",
    headerClassName: "pr-4",
    cellClassName: "pr-4",
    align: "right",
    cell: (r) =>
      r.overdue > 0 ? (
        <span className="text-[13px] font-semibold tabular-nums text-danger">{r.overdue}</span>
      ) : (
        <span className="text-[13px] text-muted">—</span>
      ),
  },
];

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ProjectFinancialsPage() {
  const [tab, setTab] = useState<Tab>("budget");

  const pendingCO = DUMMY_CHANGE_ORDERS.filter((c) => c.status === "Pending");
  const overduePayments = DUMMY_PAYMENT_PLANS.filter((p) => p.overdue > 0);

  return (
    <ModulePageShell>
      <PageHeader
        title="Financials"
        description="Budget, S-curve, invoices, change orders, and payment plans."
        actions={
          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary">Export</Button>
            <Button size="sm">+ Add expense</Button>
          </div>
        }
        toolbar={
          <SegmentedControl
            value={tab}
            onChange={setTab}
            options={[
              { value: "budget", label: "Budget" },
              { value: "expenses", label: "Expenses" },
              { value: "change_orders", label: "Change orders" },
              { value: "payment_plans", label: "Payments" },
              { value: "invoices", label: "Invoices" },
            ]}
          />
        }
      />

      {/* ── Budget tab ── */}
      {tab === "budget" && (
        <>
          {/* KPI row */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiStatCard label="Total budget" value="₹12.4 Cr" sublabel="Incl. approved COs" />
            <KpiStatCard label="Spent to date" value="₹7.7 Cr" sublabel="62% utilised" />
            <KpiStatCard
              label="Pending COs"
              value={String(pendingCO.length)}
              sublabel="₹18L exposure"
              accent="warning"
            />
            <KpiStatCard label="Forecast at completion" value="₹12.8 Cr" sublabel="+₹40L over budget" accent="danger" />
          </div>

          {/* Alerts */}
          {pendingCO.length > 0 && (
            <div className="flex items-center gap-3 rounded-xl border border-warning/25 bg-warning/[0.05] px-4 py-2.5 text-sm">
              <span className="text-warning">⚠</span>
              <span className="text-secondary">
                <span className="font-medium text-primary">{pendingCO.length} change order{pendingCO.length > 1 ? "s" : ""} pending approval</span>
                {" "}— total exposure {pendingCO.map((c) => c.amount).join(", ")}.
              </span>
            </div>
          )}

          {/* S-curve */}
          <div className="rounded-2xl border border-border/60 bg-surface p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                Budget S-curve — planned vs actual spend
              </p>
              <span className="text-[12px] text-muted">Week {TODAY_WK} of 34</span>
            </div>
            <SCurveChart />
          </div>

          <DataTable<BudgetLine>
            variant="card"
            columns={BUDGET_COLUMNS}
            data={DUMMY_BUDGET_LINES}
            rowKey={(r) => r.cat}
            tableMinWidthClassName="min-w-[700px]"
            maxHeightClassName="max-h-none"
            emptyFallback={<EmptyState title="No budget lines" />}
          />

          {/* Cash flow summary */}
          <div className="rounded-xl border border-border/60 bg-surface p-4">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted">
              Monthly cash flow — last 4 months
            </p>
            <div className="flex items-end gap-3">
              {[
                { month: "Dec", inflow: 85, outflow: 70 },
                { month: "Jan", inflow: 110, outflow: 95 },
                { month: "Feb", inflow: 92, outflow: 88 },
                { month: "Mar", inflow: 78, outflow: 105 },
              ].map((m) => (
                <div key={m.month} className="flex flex-1 flex-col items-center gap-1">
                  <div className="flex w-full gap-0.5">
                    <div
                      className="flex-1 rounded-t bg-success/40"
                      style={{ height: `${m.inflow * 0.6}px` }}
                      title={`Inflow ₹${m.inflow}L`}
                    />
                    <div
                      className="flex-1 rounded-t bg-danger/40"
                      style={{ height: `${m.outflow * 0.6}px` }}
                      title={`Outflow ₹${m.outflow}L`}
                    />
                  </div>
                  <span className="text-[10px] text-muted">{m.month}</span>
                </div>
              ))}
              <div className="ml-2 space-y-1 text-[10px] text-muted">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-4 rounded bg-success/40" /> Inflow
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-4 rounded bg-danger/40" /> Outflow
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Expenses tab ── */}
      {tab === "expenses" && (
        <DataTable<Expense>
          variant="card"
          columns={EXPENSE_COLUMNS}
          data={DUMMY_EXPENSES}
          rowKey={(_, i) => String(i)}
          tableMinWidthClassName="min-w-[680px]"
          maxHeightClassName="max-h-none"
          onRowClick={() => {}}
          emptyFallback={
            <EmptyState
              title="No expenses yet"
              description="Add your first expense to start tracking costs."
              action={{ label: "+ Add expense" }}
            />
          }
        />
      )}

      {/* ── Change orders tab ── */}
      {tab === "change_orders" && (
        <>
          {pendingCO.length > 0 && (
            <div className="flex items-center gap-3 rounded-xl border border-warning/25 bg-warning/[0.05] px-4 py-2.5 text-sm">
              <span className="text-warning">⚠</span>
              <span className="text-secondary">
                <span className="font-medium text-primary">{pendingCO.length} CO{pendingCO.length > 1 ? "s" : ""} awaiting your approval.</span>
                {" "}Use the Approve / Reject buttons inline.
              </span>
            </div>
          )}
          <DataTable<ChangeOrder>
            variant="card"
            columns={CO_COLUMNS}
            data={DUMMY_CHANGE_ORDERS}
            rowKey={(r) => r.num}
            tableMinWidthClassName="min-w-[640px]"
            maxHeightClassName="max-h-none"
            onRowClick={() => {}}
            emptyFallback={
              <EmptyState
                title="No change orders"
                description="Change orders will appear here when created."
                action={{ label: "+ New CO" }}
              />
            }
          />
        </>
      )}

      {/* ── Payment plans tab ── */}
      {tab === "payment_plans" && (
        <>
          {overduePayments.length > 0 && (
            <div className="flex items-center gap-3 rounded-xl border border-danger/25 bg-danger/[0.04] px-4 py-2.5 text-sm">
              <span className="text-danger">●</span>
              <span className="text-secondary">
                <span className="font-medium text-danger">{overduePayments.length} payment{overduePayments.length > 1 ? "s" : ""} overdue.</span>
                {" "}Unit {overduePayments.map((p) => p.unit).join(", ")} — follow up with buyers.
              </span>
            </div>
          )}
          <DataTable<PaymentPlan>
            variant="card"
            columns={PP_COLUMNS}
            data={DUMMY_PAYMENT_PLANS}
            rowKey={(r) => r.unit}
            tableMinWidthClassName="min-w-[540px]"
            maxHeightClassName="max-h-none"
            onRowClick={() => {}}
            emptyFallback={
              <EmptyState
                title="No payment plans"
                description="Payment plans will appear here once units are booked."
              />
            }
          />
        </>
      )}

      {/* ── Invoices tab ── */}
      {tab === "invoices" && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <KpiStatCard label="Submitted this month" value="₹71L" sublabel="2 invoices" />
            <KpiStatCard label="Pending approval" value="1" sublabel="₹48.2L" accent="warning" />
            <KpiStatCard label="Paid this month" value="₹37.3L" sublabel="2 approved invoices" accent="success" />
          </div>
          <DataTable<Invoice>
            variant="card"
            columns={INVOICE_COLUMNS}
            data={DUMMY_INVOICES}
            rowKey={(r) => r.num}
            tableMinWidthClassName="min-w-[600px]"
            maxHeightClassName="max-h-none"
            onRowClick={() => {}}
            emptyFallback={<EmptyState title="No invoices yet" />}
          />
        </>
      )}
    </ModulePageShell>
  );
}
