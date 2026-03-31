import type { MouseEvent, ReactNode } from "react";
import { useMemo, useState } from "react";
import { Skeleton } from "./skeleton";

export type DataTableSortState = {
  columnId: string;
  direction: "asc" | "desc";
};

export type DataTableColumn<T> = {
  id: string;
  header: ReactNode;
  headerClassName?: string;
  cellClassName?: string;
  align?: "left" | "right" | "center";
  cell: (row: T, rowIndex: number) => ReactNode;
  /** Enables header sort control; return string or number for stable ordering */
  sortValue?: (row: T) => string | number | null | undefined;
};

export type DataTableVariant = "card" | "flush";
export type DataTableDensity = "compact" | "comfortable";

export type DataTableProps<T> = {
  columns: DataTableColumn<T>[];
  data: T[];
  rowKey: (row: T, index: number) => string;
  /**
   * `flush` — no outer border/radius; full-bleed in the main column.
   * `card`  — rounded-md shell + border (embedded panels).
   */
  variant?: DataTableVariant;
  /** `comfortable` adds extra vertical padding (touch-friendly). */
  density?: DataTableDensity;
  maxHeightClassName?: string;
  /** Applied to the inner `<table>` (e.g. `min-w-[72rem]` for wide grids). */
  tableMinWidthClassName?: string;
  minWidthTableLayout?: "auto" | "fixed";
  tableLayout?: "auto" | "fixed";
  className?: string;
  /** Shown as a single full-width row when `data` is empty. */
  emptyFallback?: ReactNode;
  hideScrollbar?: boolean;
  /**
   * Whole-row activation. Ignores clicks that originate from interactive descendants
   * (buttons, links, inputs, menu items).
   */
  onRowClick?: (row: T, rowIndex: number) => void;
  /** Controlled sort; omit to manage sorting inside the table */
  sort?: DataTableSortState | null;
  onSortChange?: (next: DataTableSortState | null) => void;
  loading?: boolean;
  loadingRows?: number;
  rowClassName?: (row: T, rowIndex: number) => string | undefined;
};

function alignClass(align: "left" | "right" | "center" = "left") {
  if (align === "right") return "text-right";
  if (align === "center") return "text-center";
  return "text-left";
}

const shellByVariant: Record<DataTableVariant, string> = {
  card:  "rounded-md border border-border/60 bg-surface overflow-hidden",
  flush: "bg-transparent overflow-hidden",
};

function compareSortValues(
  a: string | number | null | undefined,
  b: string | number | null | undefined,
  direction: "asc" | "desc",
): number {
  const mult = direction === "asc" ? 1 : -1;
  if (a == null && b == null) return 0;
  if (a == null) return 1 * mult;
  if (b == null) return -1 * mult;
  if (typeof a === "number" && typeof b === "number") return (a - b) * mult;
  return String(a).localeCompare(String(b), undefined, { numeric: true }) * mult;
}

/** Sort direction chevron icons */
function SortIcon({ state }: { state: "asc" | "desc" | "none" }) {
  if (state === "asc") {
    return (
      <svg className="h-[11px] w-[11px] shrink-0 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
      </svg>
    );
  }
  if (state === "desc") {
    return (
      <svg className="h-[11px] w-[11px] shrink-0 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
      </svg>
    );
  }
  return (
    <svg className="h-[11px] w-[11px] shrink-0 text-muted/30" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4M16 15l-4 4-4-4" />
    </svg>
  );
}

export function DataTable<T>({
  columns,
  data,
  rowKey,
  variant = "flush",
  density = "compact",
  maxHeightClassName = "max-h-[min(36rem,calc(100vh-14rem))]",
  tableMinWidthClassName,
  minWidthTableLayout = "auto",
  tableLayout = "fixed",
  className = "",
  emptyFallback,
  hideScrollbar,
  onRowClick,
  sort: sortControlled,
  onSortChange,
  loading = false,
  loadingRows = 5,
  rowClassName,
}: DataTableProps<T>) {
  const [sortInternal, setSortInternal] = useState<DataTableSortState | null>(null);
  const sortState = sortControlled !== undefined ? sortControlled : sortInternal;
  const setSortState = onSortChange ?? setSortInternal;

  const sortedData = useMemo(() => {
    if (!sortState) return data;
    const col = columns.find((c) => c.id === sortState.columnId);
    if (!col?.sortValue) return data;
    return [...data].sort((a, b) =>
      compareSortValues(col.sortValue!(a), col.sortValue!(b), sortState.direction),
    );
  }, [columns, data, sortState]);

  const minW = tableMinWidthClassName ?? "";
  const thPad = density === "comfortable" ? "py-3 px-4" : "py-2.5 px-4";
  const tdPad = density === "comfortable" ? "py-3.5 px-4" : "py-2.5 px-4";
  const layoutResolved = minW
    ? minWidthTableLayout === "fixed" ? "table-fixed" : "table-auto"
    : tableLayout === "fixed" ? "table-fixed" : "table-auto";
  const hideBar = hideScrollbar ?? variant === "flush";
  const tableWidthClass = minW ? `${minW} w-full` : "w-full";

  function toggleSort(columnId: string) {
    const col = columns.find((c) => c.id === columnId);
    if (!col?.sortValue) return;
    const next: DataTableSortState | null =
      sortState?.columnId === columnId
        ? sortState.direction === "asc"
          ? { columnId, direction: "desc" }
          : null
        : { columnId, direction: "asc" };
    setSortState(next);
  }

  function isInteractiveTarget(target: EventTarget | null): boolean {
    const el = target as HTMLElement | null;
    if (!el || typeof el.closest !== "function") return false;
    return Boolean(
      el.closest('button, a, input, textarea, select, option, [role="menuitem"], [role="combobox"]'),
    );
  }

  function handleRowClick(row: T, rowIndex: number, e: MouseEvent<HTMLTableRowElement>) {
    if (!onRowClick || isInteractiveTarget(e.target)) return;
    onRowClick(row, rowIndex);
  }

  const scrollShell = [
    "min-h-0 min-w-0 overflow-auto",
    shellByVariant[variant],
    maxHeightClassName,
    hideBar ? "scrollbar-none" : "",
    className,
  ].filter(Boolean).join(" ");

  return (
    <div className={scrollShell}>
      <table
        className={`border-separate border-spacing-0 text-sm ${layoutResolved} ${tableWidthClass} [&_tbody>tr:last-child>td]:border-b-0`}
      >
        {/* ── Header ── */}
        <thead className="sticky top-0 z-10">
          <tr>
            {columns.map((col) => {
              const sortable = Boolean(col.sortValue);
              const active = sortState?.columnId === col.id;
              const sortDir = !active ? "none" : sortState!.direction;
              const ariaSort = !sortable
                ? undefined
                : !active ? "none"
                : sortState!.direction === "asc" ? "ascending" : "descending";

              return (
                <th
                  key={col.id}
                  scope="col"
                  aria-sort={ariaSort}
                  className={[
                    thPad,
                    "border-b border-border/50 bg-surface",
                    "whitespace-nowrap align-middle",
                    "text-[11px] font-medium uppercase tracking-[0.055em] text-muted/70",
                    alignClass(col.align),
                    col.headerClassName ?? "",
                  ].filter(Boolean).join(" ")}
                >
                  {sortable ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(col.id)}
                      className={[
                        "inline-flex max-w-full items-center gap-1 text-left text-inherit",
                        "transition-colors duration-100 hover:text-primary",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 rounded",
                        active ? "text-primary" : "",
                        alignClass(col.align),
                      ].filter(Boolean).join(" ")}
                    >
                      <span className="min-w-0 truncate">{col.header}</span>
                      <SortIcon state={sortDir} />
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>

        {/* ── Body ── */}
        <tbody>
          {loading ? (
            Array.from({ length: loadingRows }).map((_, rowIndex) => (
              <tr key={`sk-${rowIndex}`} className="bg-surface">
                {columns.map((col) => (
                  <td
                    key={col.id}
                    className={[
                      "border-b border-border/30",
                      tdPad,
                      "align-middle",
                      alignClass(col.align),
                      col.cellClassName ?? "",
                    ].filter(Boolean).join(" ")}
                  >
                    <Skeleton className="h-3.5 w-full max-w-[9rem]" />
                  </td>
                ))}
              </tr>
            ))
          ) : sortedData.length === 0 && emptyFallback != null ? (
            <tr>
              <td
                colSpan={columns.length}
                className="border-b-0 py-16 text-center text-sm text-muted"
              >
                {emptyFallback}
              </td>
            </tr>
          ) : (
            sortedData.map((row, rowIndex) => (
              <tr
                key={rowKey(row, rowIndex)}
                onClick={onRowClick ? (e) => handleRowClick(row, rowIndex, e) : undefined}
                className={[
                  "bg-surface transition-colors duration-100",
                  onRowClick
                    ? "cursor-pointer hover:bg-primary/[0.03] active:bg-primary/[0.055]"
                    : "hover:bg-primary/[0.02]",
                  rowClassName?.(row, rowIndex) ?? "",
                ].filter(Boolean).join(" ")}
              >
                {columns.map((col) => (
                  <td
                    key={col.id}
                    className={[
                      "border-b border-border/30",
                      tdPad,
                      "align-middle text-[13px] leading-5 text-secondary",
                      alignClass(col.align),
                      col.cellClassName ?? "",
                    ].filter(Boolean).join(" ")}
                  >
                    {col.cell(row, rowIndex)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
