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
   * `flush` — square corners, no side border; full-bleed in the main column (pair with `-mx-*` on parent).
   * `card` — rounded shell + border (embedded panels).
   */
  variant?: DataTableVariant;
  /** `comfortable` adds vertical padding to header and body cells (wide monitors / touch). */
  density?: DataTableDensity;
  /**
   * Max height of the scroll container (horizontal + vertical overflow).
   * `card` variant uses global thin scrollbars unless `hideScrollbar` is set.
   */
  maxHeightClassName?: string;
  /** Applied to the inner `<table>` (e.g. `min-w-[72rem]` for wide grids). */
  tableMinWidthClassName?: string;
  /**
   * When `tableMinWidthClassName` is set, which table layout to use.
   * Default `auto` (content-sized columns + horizontal scroll on narrow viewports).
   * Use `fixed` when the table should stretch to the container width on large screens (e.g. RFIs).
   */
  minWidthTableLayout?: "auto" | "fixed";
  tableLayout?: "auto" | "fixed";
  className?: string;
  /** Shown as a single full-width row when `data` is empty. */
  emptyFallback?: ReactNode;
  /**
   * Hide scrollbars while keeping overflow scroll (wheel / trackpad / touch).
   * Defaults to true for `flush`, false for `card`.
   */
  hideScrollbar?: boolean;
  /**
   * Whole-row activation (e.g. open detail drawer). Ignores clicks that originate
   * from interactive descendants (buttons, links, inputs, menu items).
   */
  onRowClick?: (row: T, rowIndex: number) => void;
  /** Controlled sort; omit to manage sorting inside the table */
  sort?: DataTableSortState | null;
  onSortChange?: (next: DataTableSortState | null) => void;
  /** Skeleton placeholder rows (keeps column layout stable) */
  loading?: boolean;
  loadingRows?: number;
  rowClassName?: (row: T, rowIndex: number) => string | undefined;
};

function alignClass(align: "left" | "right" | "center" = "left") {
  if (align === "right") return "text-right";
  if (align === "center") return "text-center";
  return "text-left";
}

/**
 * App-wide data table: sticky dense header, row dividers, hover rows, scroll shell.
 * Define columns with `cell` renderers for each screen (tasks, RFIs, team, etc.).
 */
const shellByVariant: Record<DataTableVariant, string> = {
  card: "rounded-md border border-border bg-bg",
  flush: "rounded-none border-x-0 border-b-0 border-t border-border bg-bg",
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
  return (
    String(a).localeCompare(String(b), undefined, { numeric: true }) * mult
  );
}

export function DataTable<T>({
  columns,
  data,
  rowKey,
  variant = "flush",
  density = "compact",
  maxHeightClassName = "max-h-[min(32rem,calc(100vh-14rem))]",
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
  const [sortInternal, setSortInternal] = useState<DataTableSortState | null>(
    null,
  );
  const sortState =
    sortControlled !== undefined ? sortControlled : sortInternal;
  const setSortState = onSortChange ?? setSortInternal;

  const sortedData = useMemo(() => {
    if (!sortState) return data;
    const col = columns.find((c) => c.id === sortState.columnId);
    if (!col?.sortValue) return data;
    return [...data].sort((a, b) =>
      compareSortValues(
        col.sortValue!(a),
        col.sortValue!(b),
        sortState.direction,
      ),
    );
  }, [columns, data, sortState]);

  const displayData = sortedData;

  const minW = tableMinWidthClassName ?? "";
  const thPad = density === "comfortable" ? "py-3" : "py-2.5";
  const tdPad = density === "comfortable" ? "py-3.5" : "py-2.5";
  const layoutResolved = minW
    ? minWidthTableLayout === "fixed"
      ? "table-fixed"
      : "table-auto"
    : tableLayout === "fixed"
      ? "table-fixed"
      : "table-auto";
  const hideBar = hideScrollbar ?? variant === "flush";
  /** `min-w-*` + `w-full`: fill the scroll container when it is wider than the floor; still scrolls when narrower. */
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
      el.closest(
        'button, a, input, textarea, select, option, [role="menuitem"], [role="combobox"]',
      ),
    );
  }

  function handleRowClick(
    row: T,
    rowIndex: number,
    e: MouseEvent<HTMLTableRowElement>,
  ) {
    if (!onRowClick || isInteractiveTarget(e.target)) return;
    onRowClick(row, rowIndex);
  }

  return (
    <div
      className={`min-h-0 min-w-0 overflow-auto ${shellByVariant[variant]} ${maxHeightClassName} ${hideBar ? "scrollbar-none" : ""} ${className}`.trim()}
    >
      <table
        className={`border-separate border-spacing-0 text-sm ${layoutResolved} ${tableWidthClass} [&_tbody>tr:last-child>td]:border-b-0`.trim()}
      >
        <thead className="sticky top-0 z-10 border-b border-border/80 bg-elevated/95 shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-elevated/80">
          <tr>
            {columns.map((col) => {
              const sortable = Boolean(col.sortValue);
              const active = sortState?.columnId === col.id;
              const ariaSort = !sortable
                ? undefined
                : !active
                  ? "none"
                  : sortState!.direction === "asc"
                    ? "ascending"
                    : "descending";
              return (
                <th
                  key={col.id}
                  scope="col"
                  aria-sort={ariaSort}
                  className={`whitespace-nowrap ${thPad} align-middle text-[11px] font-semibold leading-none text-secondary ${alignClass(col.align)} ${col.headerClassName ?? ""}`.trim()}
                >
                  {sortable ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(col.id)}
                      className={`inline-flex max-w-full items-center gap-1 rounded-md px-0.5 text-left text-inherit hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 ${alignClass(col.align)}`}
                    >
                      <span className="min-w-0 truncate">{col.header}</span>
                      <span
                        className="shrink-0 font-normal text-muted tabular-nums"
                        aria-hidden
                      >
                        {active
                          ? sortState!.direction === "asc"
                            ? "↑"
                            : "↓"
                          : "↕"}
                      </span>
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: loadingRows }).map((_, rowIndex) => (
              <tr key={`sk-${rowIndex}`} className="even:bg-muted/[0.025]">
                {columns.map((col) => (
                  <td
                    key={col.id}
                    className={`border-b border-border/45 ${tdPad} align-middle ${alignClass(col.align)} ${col.cellClassName ?? ""}`.trim()}
                  >
                    <Skeleton className="h-4 w-full max-w-[8rem]" />
                  </td>
                ))}
              </tr>
            ))
          ) : displayData.length === 0 && emptyFallback != null ? (
            <tr>
              <td
                colSpan={columns.length}
                className="border-b-0 py-12 text-center text-sm text-muted"
              >
                {emptyFallback}
              </td>
            </tr>
          ) : (
            displayData.map((row, rowIndex) => (
              <tr
                key={rowKey(row, rowIndex)}
                className={`transition-colors odd:bg-transparent even:bg-muted/[0.025] ${
                  onRowClick
                    ? "cursor-pointer hover:bg-muted/[0.08] active:bg-muted/[0.12]"
                    : "hover:bg-muted/[0.04]"
                } ${rowClassName?.(row, rowIndex) ?? ""}`.trim()}
                onClick={
                  onRowClick
                    ? (e) => handleRowClick(row, rowIndex, e)
                    : undefined
                }
              >
                {columns.map((col) => (
                  <td
                    key={col.id}
                    className={`border-b border-border/45 ${tdPad} align-middle text-[13px] leading-5 ${alignClass(col.align)} ${col.cellClassName ?? ""}`.trim()}
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
