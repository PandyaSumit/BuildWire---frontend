import { PageHeader } from "@/components/ui/page-header";
import { StatsBar } from "@/components/ui/stats-bar";
import { INVENTORY_UNIT_STATUS_STYLE } from "@/config/pm/inventory";
import { ModulePageShell } from "@/features/project-ui/components";
import {
  DUMMY_INVENTORY_STATS,
  DUMMY_UNITS_L7,
} from "@/features/project-ui/projectDummyData";

export default function ProjectInventoryPage() {
  const s = DUMMY_INVENTORY_STATS;

  return (
    <ModulePageShell>
      <PageHeader
        title="Inventory"
        description="Stacking plan and unit sales — sample floor L7."
      />

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

      <p className="font-mono text-sm text-primary">{s.revenueBooked} booked revenue</p>

      <div className="flex flex-wrap gap-3 text-[10px] text-muted sm:text-xs">
        <span>⬜ Available</span>
        <span className="text-blue-600 dark:text-blue-300">🔵 Reserved</span>
        <span className="text-amber-700 dark:text-amber-200">🟡 Booked</span>
        <span className="text-green-700 dark:text-green-200">🟢 Sold</span>
        <span className="text-purple-700 dark:text-purple-200">🟣 Handed over</span>
      </div>

      <div className="flex min-w-0 gap-3 sm:gap-4">
        <div className="flex w-12 shrink-0 flex-col gap-1 sm:w-14">
          {["L12", "L11", "L10", "L9", "L8", "L7"].map((f) => (
            <button
              key={f}
              type="button"
              className={`rounded-lg border py-2 text-[10px] font-semibold sm:text-xs ${
                f === "L7"
                  ? "border-brand bg-brand-light text-primary"
                  : "border-border/60 bg-surface text-secondary"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="grid min-w-0 flex-1 grid-cols-3 gap-1.5 sm:grid-cols-6 sm:gap-2">
          {DUMMY_UNITS_L7.map((u) => (
            <button
              key={u.id}
              type="button"
              title={u.type}
              className={`aspect-square rounded-lg border text-[9px] font-semibold leading-tight sm:text-[10px] ${INVENTORY_UNIT_STATUS_STYLE[u.status]}`}
            >
              <span className="block">{u.id}</span>
              <span className="mt-0.5 block text-[8px] font-normal opacity-80 sm:text-[9px]">
                {u.type}
              </span>
            </button>
          ))}
        </div>
      </div>
    </ModulePageShell>
  );
}
