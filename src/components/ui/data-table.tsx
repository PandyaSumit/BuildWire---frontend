import type { MouseEvent, ReactNode } from 'react';

export type DataTableColumn<T> = {
  id: string;
  header: ReactNode;
  headerClassName?: string;
  cellClassName?: string;
  align?: 'left' | 'right' | 'center';
  cell: (row: T, rowIndex: number) => ReactNode;
};

export type DataTableVariant = 'card' | 'flush';

export type DataTableProps<T> = {
  columns: DataTableColumn<T>[];
  data: T[];
  rowKey: (row: T, index: number) => string;
  /**
   * `flush` — square corners, no side border; full-bleed in the main column (pair with `-mx-*` on parent).
   * `card` — rounded shell + border (embedded panels).
   */
  variant?: DataTableVariant;
  /**
   * Max height of the scroll container (horizontal + vertical overflow).
   * `card` variant uses global thin scrollbars unless `hideScrollbar` is set.
   */
  maxHeightClassName?: string;
  /** Applied to the inner `<table>` (e.g. `min-w-[72rem]` for wide grids). */
  tableMinWidthClassName?: string;
  tableLayout?: 'auto' | 'fixed';
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
};

function alignClass(align: 'left' | 'right' | 'center' = 'left') {
  if (align === 'right') return 'text-right';
  if (align === 'center') return 'text-center';
  return 'text-left';
}

/**
 * App-wide data table: sticky dense header, row dividers, hover rows, scroll shell.
 * Define columns with `cell` renderers for each screen (tasks, RFIs, team, etc.).
 */
const shellByVariant: Record<DataTableVariant, string> = {
  card: 'rounded-xl border border-border bg-bg',
  flush:
    'rounded-none border-x-0 border-b-0 border-t border-border bg-bg',
};

export function DataTable<T>({
  columns,
  data,
  rowKey,
  variant = 'flush',
  maxHeightClassName = 'max-h-[min(32rem,calc(100vh-14rem))]',
  tableMinWidthClassName,
  tableLayout = 'fixed',
  className = '',
  emptyFallback,
  hideScrollbar,
  onRowClick,
}: DataTableProps<T>) {
  const minW = tableMinWidthClassName ?? '';
  /** Min-width scroll mode needs auto layout so column mins / content drive width. */
  const layoutResolved =
    minW ? 'table-auto' : tableLayout === 'fixed' ? 'table-fixed' : 'table-auto';
  const hideBar = hideScrollbar ?? variant === 'flush';
  /** Wide tables: intrinsic width + min floor; parent `overflow-auto` scrolls horizontally. */
  const tableWidthClass = minW ? `${minW} w-max max-w-none` : 'w-full';

  function isInteractiveTarget(target: EventTarget | null): boolean {
    const el = target as HTMLElement | null;
    if (!el || typeof el.closest !== 'function') return false;
    return Boolean(
      el.closest(
        'button, a, input, textarea, select, option, [role="menuitem"], [role="combobox"]',
      ),
    );
  }

  function handleRowClick(row: T, rowIndex: number, e: MouseEvent<HTMLTableRowElement>) {
    if (!onRowClick || isInteractiveTarget(e.target)) return;
    onRowClick(row, rowIndex);
  }

  return (
    <div
      className={`min-h-0 min-w-0 overflow-auto ${shellByVariant[variant]} ${maxHeightClassName} ${hideBar ? 'scrollbar-none' : ''} ${className}`.trim()}
    >
      <table
        className={`border-separate border-spacing-0 text-sm ${layoutResolved} ${tableWidthClass} [&_tbody>tr:last-child>td]:border-b-0`.trim()}
      >
        <thead className="sticky top-0 z-10 border-b border-border/80 bg-elevated/95 shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-elevated/80">
          <tr>
            {columns.map((col) => (
              <th
                key={col.id}
                scope="col"
                className={`whitespace-nowrap py-2.5 align-middle text-[11px] font-semibold leading-none text-secondary ${alignClass(col.align)} ${col.headerClassName ?? ''}`.trim()}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 && emptyFallback != null ? (
            <tr>
              <td
                colSpan={columns.length}
                className="border-b-0 py-12 text-center text-sm text-muted"
              >
                {emptyFallback}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={rowKey(row, rowIndex)}
                className={`transition-colors odd:bg-transparent even:bg-muted/[0.025] ${
                  onRowClick
                    ? 'cursor-pointer hover:bg-muted/[0.08] active:bg-muted/[0.12]'
                    : 'hover:bg-muted/[0.04]'
                }`.trim()}
                onClick={onRowClick ? (e) => handleRowClick(row, rowIndex, e) : undefined}
              >
                {columns.map((col) => (
                  <td
                    key={col.id}
                    className={`border-b border-border/45 py-2.5 align-middle text-[13px] leading-5 ${alignClass(col.align)} ${col.cellClassName ?? ''}`.trim()}
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
