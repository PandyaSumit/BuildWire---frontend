import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { KpiStatCard } from "@/components/ui/kpi-stat-card";
import { PageHeader } from "@/components/ui/page-header";
import { ProgressBar } from "@/components/ui/progress-bar";
import { SheetDrawer } from "@/components/ui/sheet-drawer";
import { StatsBar } from "@/components/ui/stats-bar";
import { INVENTORY_UNIT_STATUS_STYLE } from "@/config/pm/inventory";
import { ModulePageShell } from "@/features/project-ui/components";
import {
  DUMMY_INVENTORY_STATS,
  DUMMY_UNITS_L7,
  type DummyUnit,
  type UnitStatus,
} from "@/features/project-ui/projectDummyData";

const ALL_FLOORS = ["L12", "L11", "L10", "L9", "L8", "L7", "L6", "L5"];

// ── Generate units for all floors ─────────────────────────────────────────────
function buildFloorUnits(floor: string): DummyUnit[] {
  const floorNum = parseInt(floor.slice(1), 10);
  const types = ["2BHK", "3BHK", "2BHK", "3BHK", "Duplex"];
  const count = floor === "L12" || floor === "L11" ? 8 : 24;
  return Array.from({ length: count }).map((_, i) => {
    // Higher floors have more unsold/available inventory
    const adjustedIndex = (i + floorNum) % 5;
    const s = adjustedIndex;
    const status: UnitStatus =
      s === 0 ? "sold"
      : s === 1 ? "booked"
      : s === 2 ? (floorNum > 9 ? "available" : "reserved")
      : s === 3 ? (floorNum > 8 ? "available" : "handed")
      : "available";
    const unitNum = 100 + i + 1;
    return {
      id: `${floor.slice(1) >= "10" ? "A" : "B"}-${floorNum}${String(unitNum).padStart(2, "0")}`,
      status,
      type: types[i % 5],
    };
  });
}

// ── Unit detail data ──────────────────────────────────────────────────────────
const STATUS_LABEL: Record<UnitStatus, string> = {
  available: "Available",
  reserved: "Reserved",
  booked: "Booked",
  sold: "Sold",
  handed: "Handed over",
};

const STATUS_BADGE_VARIANT: Record<UnitStatus, "success" | "secondary" | "warning" | "default" | "danger"> = {
  available: "success",
  reserved: "secondary",
  booked: "warning",
  sold: "default",
  handed: "danger",
};

const UNIT_BUYER_DATA: Record<string, { buyer: string; phone: string; broker?: string; bookingDate: string; totalValue: string; paid: string; nextDue?: string; overdueDay?: number }> = {
  sold: { buyer: "K. Menon", phone: "+91 98765 00001", bookingDate: "Jan 2026", totalValue: "₹2.85 Cr", paid: "₹2.85 Cr" },
  booked: { buyer: "S. Patel", phone: "+91 98765 00002", broker: "RealtyPro Associates", bookingDate: "Feb 2026", totalValue: "₹2.40 Cr", paid: "₹1.20 Cr", nextDue: "Apr 5" },
  reserved: { buyer: "R. Shah (inquiry)", phone: "+91 98765 00003", bookingDate: "Mar 2026", totalValue: "₹3.10 Cr", paid: "Token ₹5L", nextDue: "Apr 1" },
  handed: { buyer: "V. Nair", phone: "+91 98765 00004", bookingDate: "Sep 2025", totalValue: "₹2.20 Cr", paid: "₹2.20 Cr" },
};

// ── Unit detail drawer ────────────────────────────────────────────────────────
function UnitDrawer({ unit, onClose }: { unit: DummyUnit; onClose: () => void }) {
  const buyerData = UNIT_BUYER_DATA[unit.status] ?? null;
  const statusLabel = STATUS_LABEL[unit.status];
  const badgeVariant = STATUS_BADGE_VARIANT[unit.status];

  return (
    <SheetDrawer open title={`Unit ${unit.id}`} onClose={onClose} widthClassName="max-w-[440px]">
      <div className="space-y-5">
        {/* Unit header */}
        <div className="rounded-xl border border-border/50 bg-bg p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-2xl font-bold text-primary">{unit.id}</p>
              <p className="text-sm text-secondary">{unit.type} · Standard</p>
            </div>
            <Badge variant={badgeVariant} size="sm">{statusLabel}</Badge>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-3 border-t border-border/40 pt-3 text-center">
            <div>
              <p className="text-base font-semibold text-primary">~1,250</p>
              <p className="text-[11px] text-muted">sq.ft. carpet</p>
            </div>
            <div>
              <p className="text-base font-semibold text-primary">2</p>
              <p className="text-[11px] text-muted">bathrooms</p>
            </div>
            <div>
              <p className="text-base font-semibold text-primary">E</p>
              <p className="text-[11px] text-muted">facing</p>
            </div>
          </div>
        </div>

        {/* Available unit CTA */}
        {unit.status === "available" && (
          <div className="rounded-xl border border-success/25 bg-success/[0.06] p-4">
            <p className="text-sm font-semibold text-success">Available for sale</p>
            <p className="mt-0.5 text-[12px] text-secondary">Market price: ₹2.60–₹2.80 Cr (Est.)</p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                className="flex-1 rounded-lg border border-success/30 bg-success/[0.08] px-3 py-2 text-sm font-medium text-success hover:bg-success/15"
              >
                Reserve unit
              </button>
              <button
                type="button"
                className="flex-1 rounded-lg border border-border/60 px-3 py-2 text-sm text-secondary hover:bg-muted/10"
              >
                View floor plan
              </button>
            </div>
          </div>
        )}

        {/* Buyer information */}
        {buyerData && unit.status !== "available" && (
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">Buyer</p>
            <div className="space-y-2 text-[13px]">
              <div className="flex items-center gap-3">
                <span className="w-16 shrink-0 text-muted">Name</span>
                <span className="font-medium text-primary">{buyerData.buyer}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-16 shrink-0 text-muted">Phone</span>
                <a href={`tel:${buyerData.phone}`} className="text-brand hover:underline">{buyerData.phone}</a>
              </div>
              {buyerData.broker && (
                <div className="flex items-center gap-3">
                  <span className="w-16 shrink-0 text-muted">Broker</span>
                  <span className="text-secondary">{buyerData.broker}</span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <span className="w-16 shrink-0 text-muted">Booked</span>
                <span className="text-secondary">{buyerData.bookingDate}</span>
              </div>
            </div>
          </div>
        )}

        {/* Payment plan */}
        {buyerData && unit.status !== "available" && (
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">Payment plan</p>
            <div className="rounded-xl border border-border/50 bg-bg p-3 space-y-2">
              <div className="flex justify-between text-[13px]">
                <span className="text-muted">Total value</span>
                <span className="font-semibold text-primary">{buyerData.totalValue}</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-muted">Received</span>
                <span className="font-semibold text-success">{buyerData.paid}</span>
              </div>
              {buyerData.nextDue && (
                <div className="flex justify-between text-[13px]">
                  <span className="text-muted">Next due</span>
                  <span className={`font-medium ${buyerData.overdueDay ? "text-danger" : "text-primary"}`}>
                    {buyerData.nextDue}
                    {buyerData.overdueDay ? ` (${buyerData.overdueDay}d overdue)` : ""}
                  </span>
                </div>
              )}
              {unit.status !== "sold" && unit.status !== "handed" && (
                <div className="pt-1">
                  <ProgressBar
                    value={unit.status === "reserved" ? 15 : 50}
                    max={100}
                    size="sm"
                    variant={unit.status === "reserved" ? "warning" : "default"}
                  />
                  <p className="mt-1 text-[11px] text-muted text-right">
                    {unit.status === "reserved" ? "15" : "50"}% collected
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Documents */}
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">Documents</p>
          <div className="space-y-1.5">
            {["Allotment letter", "Sale agreement", "Floor plan PDF", "Possession checklist"].slice(
              0,
              unit.status === "available" ? 1 : unit.status === "handed" ? 4 : 2,
            ).map((doc) => (
              <button
                key={doc}
                type="button"
                className="flex w-full items-center gap-3 rounded-lg border border-border/50 bg-bg px-3 py-2 text-[13px] text-secondary hover:border-brand/30 hover:text-primary"
              >
                <span className="text-muted">📄</span>
                {doc}
                <span className="ml-auto text-muted">↓</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </SheetDrawer>
  );
}

// ── Floor summary bar ─────────────────────────────────────────────────────────
function FloorSummaryBar({ units }: { units: DummyUnit[] }) {
  const counts = units.reduce(
    (acc, u) => { acc[u.status] = (acc[u.status] ?? 0) + 1; return acc; },
    {} as Record<UnitStatus, number>,
  );
  const total = units.length;
  const soldPct = Math.round(((counts.sold ?? 0) / total) * 100);

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-muted">
      <span>{total} units total</span>
      <span className="text-success">{counts.available ?? 0} available</span>
      <span className="text-blue-600 dark:text-blue-300">{counts.reserved ?? 0} reserved</span>
      <span className="text-amber-600 dark:text-amber-300">{counts.booked ?? 0} booked</span>
      <span className="text-primary">{counts.sold ?? 0} sold</span>
      <span className="text-purple-600 dark:text-purple-300">{counts.handed ?? 0} handed</span>
      <span className="ml-auto font-semibold text-primary">{soldPct}% sold</span>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ProjectInventoryPage() {
  const s = DUMMY_INVENTORY_STATS;
  const [selectedFloor, setSelectedFloor] = useState("L7");
  const [statusFilter, setStatusFilter] = useState<UnitStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [selectedUnit, setSelectedUnit] = useState<DummyUnit | null>(null);

  const floorUnits = useMemo(
    () => (selectedFloor === "L7" ? DUMMY_UNITS_L7 : buildFloorUnits(selectedFloor)),
    [selectedFloor],
  );

  const unitTypes = useMemo(
    () => ["all", ...Array.from(new Set(floorUnits.map((u) => u.type)))],
    [floorUnits],
  );

  const filteredUnits = useMemo(() => {
    return floorUnits.filter((u) => {
      const matchStatus = statusFilter === "all" || u.status === statusFilter;
      const matchType = typeFilter === "all" || u.type === typeFilter;
      const matchSearch = !search || u.id.toLowerCase().includes(search.toLowerCase());
      return matchStatus && matchType && matchSearch;
    });
  }, [floorUnits, statusFilter, typeFilter, search]);

  const soldPct = Math.round((s.sold / s.total) * 100);
  const availablePct = Math.round((s.available / s.total) * 100);

  return (
    <>
      <ModulePageShell>
        <PageHeader
          title="Inventory"
          description="Stacking plan, unit status, and sales pipeline."
          actions={
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rounded-lg border border-border/60 px-3 py-2 text-sm text-secondary hover:bg-muted/10 hover:text-primary"
              >
                Export availability
              </button>
            </div>
          }
        />

        {/* KPIs */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <KpiStatCard label="Total units" value={String(s.total)} sublabel={`${s.available} available now`} />
          <KpiStatCard label="Sold" value={`${soldPct}%`} sublabel={`${s.sold} of ${s.total} units`} accent="success" />
          <KpiStatCard label="Revenue booked" value={s.revenueBooked} sublabel={`${s.booked + s.sold + s.handedOver} units`} />
          <KpiStatCard label="Handed over" value={String(s.handedOver)} sublabel={`${availablePct}% still available`} accent={availablePct > 30 ? "warning" : "success"} />
        </div>

        <StatsBar
          stats={[
            { label: "Total", value: s.total },
            { label: "Available", value: s.available },
            { label: "Reserved", value: s.reserved },
            { label: "Booked", value: s.booked },
            { label: "Sold", value: s.sold },
            { label: "Handed over", value: s.handedOver },
          ]}
        />

        {/* Overall sale progress */}
        <div className="rounded-xl border border-border/60 bg-surface p-4">
          <div className="mb-2 flex items-center justify-between text-[12px]">
            <span className="font-medium text-secondary">Overall sales progress</span>
            <span className="font-semibold text-primary">{soldPct}% sold · {s.revenueBooked}</span>
          </div>
          <div className="flex h-4 overflow-hidden rounded-full bg-muted/10">
            <div className="bg-success" style={{ width: `${Math.round((s.sold / s.total) * 100)}%` }} title="Sold" />
            <div className="bg-amber-400 dark:bg-amber-500" style={{ width: `${Math.round((s.booked / s.total) * 100)}%` }} title="Booked" />
            <div className="bg-blue-400 dark:bg-blue-500" style={{ width: `${Math.round((s.reserved / s.total) * 100)}%` }} title="Reserved" />
            <div className="bg-purple-400 dark:bg-purple-500" style={{ width: `${Math.round((s.handedOver / s.total) * 100)}%` }} title="Handed" />
          </div>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted">
            <span className="flex items-center gap-1"><span className="h-2 w-3 rounded-sm bg-success" /> Sold ({s.sold})</span>
            <span className="flex items-center gap-1"><span className="h-2 w-3 rounded-sm bg-amber-400" /> Booked ({s.booked})</span>
            <span className="flex items-center gap-1"><span className="h-2 w-3 rounded-sm bg-blue-400" /> Reserved ({s.reserved})</span>
            <span className="flex items-center gap-1"><span className="h-2 w-3 rounded-sm bg-purple-400" /> Handed ({s.handedOver})</span>
            <span className="flex items-center gap-1"><span className="h-2 w-3 rounded-sm bg-muted/30" /> Available ({s.available})</span>
          </div>
        </div>

        {/* Stacking plan */}
        <div className="rounded-2xl border border-border/60 bg-surface p-4">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
              Stacking plan — {selectedFloor}
            </p>
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search unit…"
                className="w-32 rounded-lg border border-border/60 bg-bg px-2.5 py-1 text-xs text-primary placeholder:text-muted focus:border-brand/50 focus:outline-none"
              />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="rounded-lg border border-border/60 bg-bg px-2.5 py-1 text-xs text-primary focus:border-brand/50 focus:outline-none"
              >
                {unitTypes.map((t) => (
                  <option key={t} value={t}>{t === "all" ? "All types" : t}</option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as UnitStatus | "all")}
                className="rounded-lg border border-border/60 bg-bg px-2.5 py-1 text-xs text-primary focus:border-brand/50 focus:outline-none"
              >
                <option value="all">All statuses</option>
                <option value="available">Available</option>
                <option value="reserved">Reserved</option>
                <option value="booked">Booked</option>
                <option value="sold">Sold</option>
                <option value="handed">Handed over</option>
              </select>
            </div>
          </div>

          <div className="flex min-w-0 gap-3 sm:gap-4">
            {/* Floor selector */}
            <div className="flex w-12 shrink-0 flex-col gap-1 sm:w-14">
              {ALL_FLOORS.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setSelectedFloor(f)}
                  className={`rounded-lg border py-2 text-[10px] font-semibold transition-colors sm:text-xs ${
                    f === selectedFloor
                      ? "border-brand bg-brand-light text-primary"
                      : "border-border/60 bg-surface text-secondary hover:border-brand/30"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Unit grid */}
            <div className="flex-1 min-w-0 space-y-2">
              <FloorSummaryBar units={floorUnits} />
              <div
                className={`grid gap-1.5 sm:gap-2 ${
                  floorUnits.length <= 8 ? "grid-cols-4 sm:grid-cols-8" : "grid-cols-3 sm:grid-cols-6"
                }`}
              >
                {filteredUnits.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    title={`${u.id} · ${u.type} · ${STATUS_LABEL[u.status]}`}
                    onClick={() => setSelectedUnit(u)}
                    className={`aspect-square rounded-lg border text-[9px] font-semibold leading-tight transition-transform hover:scale-105 sm:text-[10px] ${INVENTORY_UNIT_STATUS_STYLE[u.status]}`}
                  >
                    <span className="block">{u.id}</span>
                    <span className="mt-0.5 block text-[8px] font-normal opacity-80 sm:text-[9px]">
                      {u.type}
                    </span>
                  </button>
                ))}
                {filteredUnits.length === 0 && (
                  <div className="col-span-full py-8 text-center text-xs text-muted">
                    No units match your filters.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-3 text-[10px] text-muted sm:text-xs">
            <span>⬜ Available</span>
            <span className="text-blue-600 dark:text-blue-300">🔵 Reserved</span>
            <span className="text-amber-700 dark:text-amber-200">🟡 Booked</span>
            <span className="text-green-700 dark:text-green-200">🟢 Sold</span>
            <span className="text-purple-700 dark:text-purple-200">🟣 Handed over</span>
            <span className="ml-auto italic">Click any unit for details</span>
          </div>
        </div>

        {/* Unit type breakdown */}
        <div className="rounded-xl border border-border/60 bg-surface p-4">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted">
            Unit type breakdown — {selectedFloor}
          </p>
          <div className="space-y-2">
            {["2BHK", "3BHK", "Duplex"].map((type) => {
              const total = floorUnits.filter((u) => u.type === type).length;
              const sold = floorUnits.filter((u) => u.type === type && (u.status === "sold" || u.status === "handed")).length;
              const pct = total > 0 ? Math.round((sold / total) * 100) : 0;
              return (
                <div key={type} className="flex items-center gap-3">
                  <span className="w-14 text-[12px] font-medium text-secondary">{type}</span>
                  <ProgressBar value={pct} max={100} size="sm" className="flex-1" variant="success" />
                  <span className="w-16 text-right text-[11px] text-muted">{sold}/{total} sold</span>
                </div>
              );
            })}
          </div>
        </div>
      </ModulePageShell>

      {selectedUnit && (
        <UnitDrawer unit={selectedUnit} onClose={() => setSelectedUnit(null)} />
      )}
    </>
  );
}
