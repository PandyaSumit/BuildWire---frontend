import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { KpiStatCard } from "@/components/ui/kpi-stat-card";
import { PageHeader } from "@/components/ui/page-header";
import { ProgressBar } from "@/components/ui/progress-bar";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { ModulePageShell } from "@/features/project-ui/components";
import {
  DUMMY_BUDGET_LINES,
  DUMMY_CHANGE_ORDERS,
  DUMMY_EXPENSES,
  DUMMY_PAYMENT_PLANS,
} from "@/features/project-ui/projectDummyData";

type Tab = "budget" | "expenses" | "change_orders" | "payment_plans";

// ─── Budget ─────────────────────────────────────────────────────────────────
type BudgetLine = (typeof DUMMY_BUDGET_LINES)[number];

const BUDGET_COLUMNS: DataTableColumn<BudgetLine>[] = [
  {
    id: "cat",
    header: "Category",
    headerClassName: "pl-4 pr-3",
    cellClassName: "pl-4 pr-3",
    cell: (r) => (
      <span className="text-[13px] font-medium text-primary">{r.cat}</span>
    ),
  },
  {
    id: "budgeted",
    header: "Budgeted",
    headerClassName: "px-3",
    cellClassName: "px-3",
    align: "right",
    cell: (r) => (
      <span className="font-mono text-[13px] text-secondary">{r.budgeted}</span>
    ),
  },
  {
    id: "cos",
    header: "Approved COs",
    headerClassName: "px-3",
    cellClassName: "px-3",
    align: "right",
    cell: (r) => (
      <span className="font-mono text-[13px] text-secondary">{r.cos}</span>
    ),
  },
  {
    id: "revised",
    header: "Revised",
    headerClassName: "px-3",
    cellClassName: "px-3",
    align: "right",
    cell: (r) => (
      <span className="font-mono text-[13px] text-secondary">{r.revised}</span>
    ),
  },
  {
    id: "spent",
    header: "Spent",
    headerClassName: "px-3",
    cellClassName: "px-3",
    align: "right",
    cell: (r) => (
      <span className="font-mono text-[13px] font-semibold text-primary">
        {r.spent}
      </span>
    ),
  },
  {
    id: "remaining",
    header: "Remaining",
    headerClassName: "px-3",
    cellClassName: "px-3",
    align: "right",
    cell: (r) => (
      <span className="font-mono text-[13px] text-secondary">{r.remaining}</span>
    ),
  },
  {
    id: "pct",
    header: "% used",
    headerClassName: "px-3 pr-4",
    cellClassName: "px-3 pr-4",
    cell: (r) => (
      <div className="flex items-center gap-2">
        <ProgressBar
          value={r.pct}
          max={100}
          size="sm"
          className="w-20"
          variant={r.pct >= 90 ? "danger" : r.pct >= 80 ? "warning" : "success"}
        />
        <span className="w-8 text-right text-[12px] tabular-nums text-muted">
          {r.pct}%
        </span>
      </div>
    ),
  },
];

// ─── Expenses ────────────────────────────────────────────────────────────────
type Expense = (typeof DUMMY_EXPENSES)[number];

const EXPENSE_COLUMNS: DataTableColumn<Expense>[] = [
  {
    id: "desc",
    header: "Description",
    headerClassName: "pl-4 pr-3",
    cellClassName: "pl-4 pr-3",
    cell: (r) => (
      <span className="text-[13px] font-medium text-primary">{r.desc}</span>
    ),
  },
  {
    id: "category",
    header: "Category",
    headerClassName: "px-3",
    cellClassName: "px-3",
    cell: (r) => (
      <span className="text-[13px] text-secondary">{r.category}</span>
    ),
  },
  {
    id: "vendor",
    header: "Vendor",
    headerClassName: "px-3",
    cellClassName: "px-3",
    cell: (r) => (
      <span className="text-[13px] text-secondary">{r.vendor}</span>
    ),
  },
  {
    id: "amount",
    header: "Amount",
    headerClassName: "px-3",
    cellClassName: "px-3",
    align: "right",
    cell: (r) => (
      <span className="font-mono text-[13px] font-semibold text-primary">
        {r.amount}
      </span>
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
    id: "by",
    header: "By",
    headerClassName: "px-3",
    cellClassName: "px-3",
    cell: (r) => <span className="text-[13px] text-secondary">{r.by}</span>,
  },
  {
    id: "status",
    header: "Status",
    headerClassName: "px-3 pr-4",
    cellClassName: "px-3 pr-4",
    cell: (r) => (
      <Badge
        variant={
          r.status === "Approved"
            ? "success"
            : r.status === "Pending"
              ? "warning"
              : "danger"
        }
        size="sm"
      >
        {r.status}
      </Badge>
    ),
  },
];

// ─── Change orders ────────────────────────────────────────────────────────────
type ChangeOrder = (typeof DUMMY_CHANGE_ORDERS)[number];

const CO_COLUMNS: DataTableColumn<ChangeOrder>[] = [
  {
    id: "num",
    header: "CO #",
    headerClassName: "pl-4 pr-3 w-[80px]",
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
      <span className="text-[13px] font-medium text-primary">{r.title}</span>
    ),
  },
  {
    id: "reason",
    header: "Reason",
    headerClassName: "px-3",
    cellClassName: "px-3",
    cell: (r) => (
      <span className="text-[13px] text-secondary">{r.reason}</span>
    ),
  },
  {
    id: "amount",
    header: "Amount",
    headerClassName: "px-3",
    cellClassName: "px-3",
    align: "right",
    cell: (r) => (
      <span
        className={`font-mono text-[13px] font-semibold ${r.amount.startsWith("+") ? "text-success" : "text-danger"}`}
      >
        {r.amount}
      </span>
    ),
  },
  {
    id: "status",
    header: "Status",
    headerClassName: "px-3",
    cellClassName: "px-3",
    cell: (r) => (
      <Badge
        variant={r.status === "Approved" ? "success" : "warning"}
        size="sm"
      >
        {r.status}
      </Badge>
    ),
  },
  {
    id: "date",
    header: "Date",
    headerClassName: "px-3 pr-4",
    cellClassName: "px-3 pr-4 whitespace-nowrap",
    cell: (r) => (
      <span className="font-mono text-[13px] text-secondary">{r.date}</span>
    ),
  },
];

// ─── Payment plans ────────────────────────────────────────────────────────────
type PaymentPlan = (typeof DUMMY_PAYMENT_PLANS)[number];

const PP_COLUMNS: DataTableColumn<PaymentPlan>[] = [
  {
    id: "unit",
    header: "Unit",
    headerClassName: "pl-4 pr-3",
    cellClassName: "pl-4 pr-3",
    cell: (r) => (
      <span className="font-mono text-[13px] font-semibold text-primary">
        {r.unit}
      </span>
    ),
  },
  {
    id: "buyer",
    header: "Buyer",
    headerClassName: "px-3",
    cellClassName: "px-3",
    cell: (r) => (
      <span className="text-[13px] text-secondary">{r.buyer}</span>
    ),
  },
  {
    id: "value",
    header: "Total value",
    headerClassName: "px-3",
    cellClassName: "px-3",
    align: "right",
    cell: (r) => (
      <span className="font-mono text-[13px] text-secondary">{r.value}</span>
    ),
  },
  {
    id: "paid",
    header: "Paid",
    headerClassName: "px-3",
    cellClassName: "px-3",
    align: "right",
    cell: (r) => (
      <span className="font-mono text-[13px] font-semibold text-primary">
        {r.paid}
      </span>
    ),
  },
  {
    id: "next",
    header: "Next due",
    headerClassName: "px-3",
    cellClassName: "px-3 whitespace-nowrap",
    cell: (r) => (
      <span className="font-mono text-[13px] text-secondary">{r.next}</span>
    ),
  },
  {
    id: "overdue",
    header: "Days overdue",
    headerClassName: "px-3 pr-4",
    cellClassName: "px-3 pr-4",
    align: "right",
    cell: (r) =>
      r.overdue > 0 ? (
        <span className="text-[13px] font-semibold tabular-nums text-danger">
          {r.overdue}
        </span>
      ) : (
        <span className="text-[13px] text-muted">—</span>
      ),
  },
];

export default function ProjectFinancialsPage() {
  const [tab, setTab] = useState<Tab>("budget");

  return (
    <ModulePageShell>
      <PageHeader
        title="Financials"
        description="Budget, expenses, change orders, and payment plans."
        actions={<Button size="sm">+ Add expense</Button>}
        toolbar={
          <SegmentedControl
            value={tab}
            onChange={setTab}
            options={[
              { value: "budget", label: "Budget" },
              { value: "expenses", label: "Expenses" },
              { value: "change_orders", label: "Change orders" },
              { value: "payment_plans", label: "Payment plans" },
            ]}
          />
        }
      />

      {tab === "budget" && (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <KpiStatCard
              label="Total budget"
              value="₹12.4 Cr"
              sublabel="Incl. approved COs"
            />
            <KpiStatCard
              label="Spent"
              value="₹7.7 Cr"
              sublabel="62% utilised"
            />
            <KpiStatCard
              label="Pending COs"
              value="3"
              sublabel="₹42 L exposure"
              accent="warning"
            />
            <KpiStatCard
              label="Remaining"
              value="31%"
              sublabel="₹3.8 Cr left"
              accent="success"
            />
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
        </>
      )}

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

      {tab === "change_orders" && (
        <DataTable<ChangeOrder>
          variant="card"
          columns={CO_COLUMNS}
          data={DUMMY_CHANGE_ORDERS}
          rowKey={(r) => r.num}
          tableMinWidthClassName="min-w-[560px]"
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
      )}

      {tab === "payment_plans" && (
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
      )}
    </ModulePageShell>
  );
}
