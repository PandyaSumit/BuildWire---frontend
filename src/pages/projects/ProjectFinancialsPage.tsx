import { useState } from "react";
import { KpiStatCard } from "@/components/ui/kpi-stat-card";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Badge } from "@/components/ui/badge";
import {
  DUMMY_BUDGET_LINES,
  DUMMY_CHANGE_ORDERS,
  DUMMY_EXPENSES,
  DUMMY_PAYMENT_PLANS,
} from "@/features/project-ui/projectDummyData";

export default function ProjectFinancialsPage() {
  const [tab, setTab] = useState<
    "budget" | "expenses" | "change_orders" | "payment_plans"
  >("budget");

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="font-[family-name:var(--font-dm-sans)] text-xl font-bold text-primary">
          Financials
        </h1>
        <p className="text-sm text-secondary">
          Budget, expenses, change orders, payment plans — sample data.
        </p>
      </div>

      <SegmentedControl
        value={tab}
        onChange={setTab}
        options={[
          { value: "budget", label: "Budget" },
          { value: "expenses", label: "Expenses" },
          { value: "change_orders", label: "Change orders" },
          { value: "payment_plans", label: "Payment plans" },
        ]}
        className="mb-6"
      />

      {tab === "budget" && (
        <>
          <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <KpiStatCard
              label="Total budget"
              value="₹12.4Cr"
              sublabel="Incl. approved COs"
            />
            <KpiStatCard label="Spent" value="₹7.7Cr" />
            <KpiStatCard
              label="Pending COs"
              value="3"
              sublabel="₹42L"
              accent="warning"
            />
            <KpiStatCard label="Remaining" value="31%" accent="success" />
          </div>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-border bg-surface text-xs uppercase text-muted">
                <tr>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Budgeted</th>
                  <th className="px-4 py-3">Approved COs</th>
                  <th className="px-4 py-3">Revised</th>
                  <th className="px-4 py-3">Spent</th>
                  <th className="px-4 py-3">Remaining</th>
                  <th className="px-4 py-3">% used</th>
                </tr>
              </thead>
              <tbody>
                {DUMMY_BUDGET_LINES.map((row) => (
                  <tr key={row.cat} className="border-b border-border/60">
                    <td className="px-4 py-3 font-medium">{row.cat}</td>
                    <td className="px-4 py-3">{row.budgeted}</td>
                    <td className="px-4 py-3">{row.cos}</td>
                    <td className="px-4 py-3">{row.revised}</td>
                    <td className="px-4 py-3">{row.spent}</td>
                    <td className="px-4 py-3">{row.remaining}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-28 rounded-full bg-muted/30">
                          <div
                            className={`h-2 rounded-full ${
                              row.pct >= 90
                                ? "bg-danger"
                                : row.pct >= 80
                                  ? "bg-warning"
                                  : "bg-success"
                            }`}
                            style={{ width: `${Math.min(row.pct, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted">{row.pct}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === "expenses" && (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-border bg-surface text-xs uppercase text-muted">
              <tr>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Vendor</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">By</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {DUMMY_EXPENSES.map((e, i) => (
                <tr key={i} className="border-b border-border/60">
                  <td className="px-4 py-3 font-medium text-primary">
                    {e.desc}
                  </td>
                  <td className="px-4 py-3">{e.category}</td>
                  <td className="px-4 py-3">{e.vendor}</td>
                  <td className="px-4 py-3 font-mono">{e.amount}</td>
                  <td className="px-4 py-3">{e.date}</td>
                  <td className="px-4 py-3">{e.by}</td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        e.status === "Approved"
                          ? "success"
                          : e.status === "Pending"
                            ? "warning"
                            : "danger"
                      }
                    >
                      {e.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "change_orders" && (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-border bg-surface text-xs uppercase text-muted">
              <tr>
                <th className="px-4 py-3">CO #</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Reason</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {DUMMY_CHANGE_ORDERS.map((c) => (
                <tr key={c.num} className="border-b border-border/60">
                  <td className="px-4 py-3 font-mono text-brand">{c.num}</td>
                  <td className="px-4 py-3">{c.title}</td>
                  <td className="px-4 py-3 text-secondary">{c.reason}</td>
                  <td
                    className={`px-4 py-3 font-mono ${c.amount.startsWith("+") ? "text-success" : "text-danger"}`}
                  >
                    {c.amount}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={c.status === "Approved" ? "success" : "warning"}
                    >
                      {c.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">{c.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "payment_plans" && (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-border bg-surface text-xs uppercase text-muted">
              <tr>
                <th className="px-4 py-3">Unit</th>
                <th className="px-4 py-3">Buyer</th>
                <th className="px-4 py-3">Total value</th>
                <th className="px-4 py-3">Paid</th>
                <th className="px-4 py-3">Next due</th>
                <th className="px-4 py-3">Days overdue</th>
              </tr>
            </thead>
            <tbody>
              {DUMMY_PAYMENT_PLANS.map((p) => (
                <tr key={p.unit} className="border-b border-border/60">
                  <td className="px-4 py-3 font-mono font-medium">{p.unit}</td>
                  <td className="px-4 py-3">{p.buyer}</td>
                  <td className="px-4 py-3">{p.value}</td>
                  <td className="px-4 py-3">{p.paid}</td>
                  <td className="px-4 py-3">{p.next}</td>
                  <td
                    className={`px-4 py-3 ${p.overdue > 0 ? "text-danger font-medium" : ""}`}
                  >
                    {p.overdue > 0 ? p.overdue : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
