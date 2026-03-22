import {
  DUMMY_INVENTORY_STATS,
  DUMMY_UNITS_L7,
  type UnitStatus,
} from "@/features/project-ui/projectDummyData";

const statusStyle: Record<UnitStatus, string> = {
  available: "border-border bg-muted/15 text-secondary",
  reserved:
    "border-blue-500/50 bg-blue-500/10 text-blue-800 dark:text-blue-100",
  booked:
    "border-amber-500/50 bg-amber-500/15 text-amber-900 dark:text-amber-100",
  sold: "border-green-500/50 bg-green-500/15 text-green-800 dark:text-green-100",
  handed:
    "border-purple-500/50 bg-purple-500/15 text-purple-900 dark:text-purple-100",
};

export default function ProjectInventoryPage() {
  const s = DUMMY_INVENTORY_STATS;

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-dm-sans)] text-xl font-bold text-primary">
            Inventory
          </h1>
          <p className="text-sm text-secondary">
            Stacking plan / unit sales — sample units on L7.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="rounded border border-border px-2 py-1">
            Total {s.total}
          </span>
          <span className="rounded border border-border px-2 py-1">
            Avail. {s.available}
          </span>
          <span className="rounded border border-border px-2 py-1">
            Res. {s.reserved}
          </span>
          <span className="rounded border border-border px-2 py-1">
            Booked {s.booked}
          </span>
          <span className="rounded border border-border px-2 py-1">
            Sold {s.sold}
          </span>
          <span className="rounded border border-border px-2 py-1">
            Handed {s.handedOver}
          </span>
          <span className="rounded border border-border px-2 py-1 font-mono text-primary">
            {s.revenueBooked}
          </span>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-3 text-[10px] text-muted">
        <span>⬜ Available</span>
        <span className="text-blue-600 dark:text-blue-300">🔵 Reserved</span>
        <span className="text-amber-700 dark:text-amber-200">🟡 Booked</span>
        <span className="text-green-700 dark:text-green-200">🟢 Sold</span>
        <span className="text-purple-700 dark:text-purple-200">
          🟣 Handed over
        </span>
      </div>

      <div className="flex gap-4">
        <div className="flex w-14 shrink-0 flex-col gap-1">
          {["L12", "L11", "L10", "L9", "L8", "L7"].map((f) => (
            <button
              key={f}
              type="button"
              className={`rounded-lg border py-2 text-xs font-semibold ${f === "L7" ? "border-brand bg-brand-light text-primary" : "border-border bg-surface text-secondary"}`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="grid flex-1 grid-cols-4 gap-2 sm:grid-cols-6">
          {DUMMY_UNITS_L7.map((u) => (
            <button
              key={u.id}
              type="button"
              title={u.type}
              className={`aspect-square rounded-lg border text-[10px] font-semibold leading-tight sm:text-xs ${statusStyle[u.status]}`}
            >
              <span className="block">{u.id}</span>
              <span className="mt-0.5 block text-[9px] font-normal opacity-80">
                {u.type}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
