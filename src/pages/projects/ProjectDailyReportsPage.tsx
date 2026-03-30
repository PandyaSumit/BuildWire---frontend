import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useGlobalSearch } from "@/components/layout/GlobalSearchContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { SheetDrawer } from "@/components/ui/sheet-drawer";
import { DAILY_REPORT_CALENDAR_LEGEND, DAILY_REPORT_STATUS_BADGE, WEEKDAY_LABELS } from "@/config/pm/daily-reports";
import { DailyReportDrawer } from "@/features/project-ui/DailyReportDrawer";
import { ModulePageShell } from "@/features/project-ui/components";
import {
  buildDailyReportDayDotsForMonth,
  dailyReportMissingCutoffForMonth,
  DUMMY_DAILY_REPORTS,
  defaultNewDailyReportDateIso,
  formatLocalDateIso,
  dailyReportDateIso,
  totalDailyReportCrew,
  type CalendarDot,
  type DailyReportRow,
} from "@/features/project-ui/projectDummyData";

const calCellH = "h-9 w-full min-w-0 sm:h-10";

function shiftCalendarMonth(year: number, monthIndex: number, delta: number): { year: number; monthIndex: number } {
  const d = new Date(year, monthIndex + delta, 1);
  return { year: d.getFullYear(), monthIndex: d.getMonth() };
}

function monthLabel(year: number, monthIndex: number, locale: string): string {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar" : locale === "es" ? "es" : locale === "hi" ? "hi" : "en", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, monthIndex, 1));
}

function buildMonthGrid(
  year: number,
  monthIndex: number,
  dayDots: { day: number; dot: CalendarDot }[],
): ({ kind: "pad" } | { kind: "day"; day: number; dot: CalendarDot; weekend: boolean })[] {
  const dotByDay = new Map(dayDots.map((d) => [d.day, d.dot]));
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const startWeekday = new Date(year, monthIndex, 1).getDay();
  const cells: (
    | { kind: "pad" }
    | { kind: "day"; day: number; dot: CalendarDot; weekend: boolean }
  )[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push({ kind: "pad" });
  for (let day = 1; day <= daysInMonth; day++) {
    const dot = dotByDay.get(day) ?? "upcoming";
    const wd = new Date(year, monthIndex, day).getDay();
    cells.push({ kind: "day", day, dot, weekend: wd === 0 || wd === 6 });
  }
  while (cells.length % 7 !== 0) cells.push({ kind: "pad" });
  return cells;
}

function isWeekdayIso(iso: string): boolean {
  const [y, m, d] = iso.split("-").map((x) => parseInt(x, 10));
  const wd = new Date(y, m - 1, d).getDay();
  return wd !== 0 && wd !== 6;
}

function matchesDailyReportQuery(row: DailyReportRow, q: string): boolean {
  if (!q) return true;
  const n = q.toLowerCase();
  const blob = [
    row.date,
    row.submittedBy,
    row.weather,
    row.narrative,
    row.status,
    ...(row.linkedRfis ?? []),
    ...(row.photoLabels ?? []),
    ...row.manpower.flatMap((m) => [m.company, m.trade, m.costCode ?? ""]),
    ...row.equipment.map((e) => e.asset),
    ...row.deliveries.flatMap((d) => [d.description, d.supplier ?? ""]),
  ]
    .join(" ")
    .toLowerCase();
  return blob.includes(n);
}

export default function ProjectDailyReportsPage() {
  const { t, i18n } = useTranslation();
  const { query } = useGlobalSearch();
  const qNorm = query.trim().toLowerCase();

  const [rows, setRows] = useState<DailyReportRow[]>(() => [...DUMMY_DAILY_REPORTS]);
  const [mode, setMode] = useState<"calendar" | "list">("calendar");
  /** Start on March 2026 to align with seed data. */
  const [viewYear, setViewYear] = useState(2026);
  const [viewMonthIndex, setViewMonthIndex] = useState(2);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerReport, setDrawerReport] = useState<DailyReportRow | null>(null);
  const [drawerSeedDate, setDrawerSeedDate] = useState("");

  const realTodayIso = useMemo(() => formatLocalDateIso(new Date()), []);

  const rowsByDate = useMemo(() => new Map(rows.map((r) => [r.date, r] as const)), [rows]);

  const occupiedDates = useMemo(() => new Set(rows.map((r) => r.date)), [rows]);

  const missingCutoffIso = useMemo(
    () => dailyReportMissingCutoffForMonth(viewYear, viewMonthIndex, realTodayIso),
    [viewYear, viewMonthIndex, realTodayIso],
  );

  const dayDots = useMemo(
    () =>
      buildDailyReportDayDotsForMonth({
        year: viewYear,
        monthIndex: viewMonthIndex,
        rowsByDate,
        missingCutoffIso,
      }),
    [viewYear, viewMonthIndex, rowsByDate, missingCutoffIso],
  );

  const calendarCells = useMemo(
    () => buildMonthGrid(viewYear, viewMonthIndex, dayDots),
    [viewYear, viewMonthIndex, dayDots],
  );

  const listRowsFiltered = useMemo(() => {
    return rows
      .filter((r) => {
        const [y, m] = r.date.split("-").map((x) => parseInt(x, 10));
        return y === viewYear && m === viewMonthIndex + 1;
      })
      .filter((r) => matchesDailyReportQuery(r, qNorm))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [rows, viewYear, viewMonthIndex, qNorm]);

  const showMissingBanner =
    isWeekdayIso(realTodayIso) && !rowsByDate.has(realTodayIso);

  const openNew = useCallback(
    (dateIso?: string) => {
      setDrawerReport(null);
      setDrawerSeedDate(dateIso ?? defaultNewDailyReportDateIso(viewYear, viewMonthIndex, realTodayIso));
      setDrawerOpen(true);
    },
    [viewYear, viewMonthIndex, realTodayIso],
  );

  const openEdit = useCallback((dateIso: string) => {
    const existing = rowsByDate.get(dateIso);
    setDrawerReport(existing ?? null);
    setDrawerSeedDate(dateIso);
    setDrawerOpen(true);
  }, [rowsByDate]);

  const onMonthPick = useCallback((ym: string) => {
    const [y, m] = ym.split("-").map((x) => parseInt(x, 10));
    if (!y || !m) return;
    setViewYear(y);
    setViewMonthIndex(m - 1);
  }, []);

  const listColumns: DataTableColumn<DailyReportRow>[] = useMemo(
    () => [
      {
        id: "date",
        header: t("dailyReportsPage.colDate"),
        headerClassName: "pl-4 pr-3",
        cellClassName: "pl-4 pr-3 whitespace-nowrap",
        sortValue: (r) => r.date,
        cell: (r) => (
          <span className="font-mono text-[13px] text-primary">{r.date}</span>
        ),
      },
      {
        id: "submittedBy",
        header: t("dailyReportsPage.colSubmittedBy"),
        headerClassName: "px-3",
        cellClassName: "px-3",
        sortValue: (r) => r.submittedBy,
        cell: (r) => (
          <span className="text-[13px] font-medium text-primary">{r.submittedBy}</span>
        ),
      },
      {
        id: "crew",
        header: t("dailyReportsPage.colCrew"),
        headerClassName: "px-3",
        cellClassName: "px-3",
        align: "right",
        sortValue: (r) => totalDailyReportCrew(r),
        cell: (r) => (
          <span className="text-[13px] tabular-nums text-secondary">{totalDailyReportCrew(r)}</span>
        ),
      },
      {
        id: "weather",
        header: t("dailyReportsPage.colWeather"),
        headerClassName: "px-3",
        cellClassName: "px-3",
        sortValue: (r) => r.weather,
        cell: (r) => (
          <span className="text-[13px] text-secondary">{r.weather}</span>
        ),
      },
      {
        id: "status",
        header: t("dailyReportsPage.colStatus"),
        headerClassName: "px-3 pr-4",
        cellClassName: "px-3 pr-4",
        sortValue: (r) => r.status,
        cell: (r) => (
          <Badge variant={DAILY_REPORT_STATUS_BADGE[r.status]} size="sm">
            {r.status}
          </Badge>
        ),
      },
    ],
    [t],
  );

  const upsertReport = useCallback((row: DailyReportRow, removeDate?: string | null) => {
    setRows((prev) => {
      let base = prev;
      if (removeDate && removeDate !== row.date) {
        base = prev.filter((r) => r.date !== removeDate);
      }
      const i = base.findIndex((r) => r.date === row.date);
      if (i >= 0) {
        const next = [...base];
        next[i] = row;
        return next;
      }
      return [row, ...base];
    });
  }, []);

  const monthPickerValue = `${viewYear}-${String(viewMonthIndex + 1).padStart(2, "0")}`;

  return (
    <ModulePageShell>
      <PageHeader
        title={t("dailyReportsPage.title")}
        description={t("dailyReportsPage.description")}
        actions={
          <>
            <SegmentedControl
              value={mode}
              onChange={setMode}
              options={[
                { value: "calendar", label: t("dailyReportsPage.modeCalendar") },
                { value: "list", label: t("dailyReportsPage.modeList") },
              ]}
            />
            <Button type="button" size="sm" onClick={() => openNew()}>
              {t("dailyReportsPage.newReport")}
            </Button>
          </>
        }
      />

      {showMissingBanner ? (
        <div className="flex w-full min-w-0 flex-col gap-3 rounded-md border border-warning/25 bg-warning/[0.06] px-4 py-3 text-sm sm:flex-row sm:items-center">
          <span className="font-medium text-warning">{t("dailyReportsPage.bannerMissingTitle")}</span>
          <span className="text-secondary">{t("dailyReportsPage.bannerMissingBody")}</span>
          <button
            type="button"
            onClick={() => openNew(realTodayIso)}
            className="rounded-lg border border-warning/35 bg-warning/10 px-3 py-1.5 text-xs font-medium text-warning hover:bg-warning/15 sm:ms-auto"
          >
            {t("dailyReportsPage.bannerSubmitNow")}
          </button>
        </div>
      ) : null}

      {qNorm ? (
        <p className="text-xs text-muted">
          {t("dailyReportsPage.globalSearchHint", { count: listRowsFiltered.length })}
        </p>
      ) : null}

      {mode === "calendar" ? (
        <div className="w-full min-w-0 rounded-md border border-border/60 bg-surface p-3 sm:p-5">
          <div className="mb-3 flex flex-col gap-2 sm:mb-4 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            <p className="text-sm font-semibold text-primary sm:text-base">
              {monthLabel(viewYear, viewMonthIndex, i18n.language)}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 text-xs text-secondary">
                <span className="sr-only">{t("dailyReportsPage.jumpMonth")}</span>
                <input
                  type="month"
                  value={monthPickerValue}
                  onChange={(e) => onMonthPick(e.target.value)}
                  className="rounded-lg border border-border/60 bg-bg px-2 py-1.5 text-xs text-primary"
                />
              </label>
              <div className="hidden flex-wrap items-center gap-3 text-xs text-muted sm:flex">
                {(Object.entries(DAILY_REPORT_CALENDAR_LEGEND) as [
                  CalendarDot,
                  { className: string; label: string },
                ][]).map(([key, v]) => (
                  <span key={key} className="inline-flex items-center gap-1.5">
                    <span className={`h-2 w-2 shrink-0 rounded-full ${v.className}`} />
                    {v.label}
                  </span>
                ))}
              </div>
              <div className="flex gap-1">
                <button
                  type="button"
                  className="rounded-lg border border-border/60 px-2.5 py-1 text-xs text-secondary hover:bg-muted/10 hover:text-primary"
                  aria-label={t("dailyReportsPage.prevMonth")}
                  onClick={() => {
                    const n = shiftCalendarMonth(viewYear, viewMonthIndex, -1);
                    setViewYear(n.year);
                    setViewMonthIndex(n.monthIndex);
                  }}
                >
                  ‹
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-border/60 px-2.5 py-1 text-xs text-secondary hover:bg-muted/10 hover:text-primary"
                  aria-label={t("dailyReportsPage.nextMonth")}
                  onClick={() => {
                    const n = shiftCalendarMonth(viewYear, viewMonthIndex, 1);
                    setViewYear(n.year);
                    setViewMonthIndex(n.monthIndex);
                  }}
                >
                  ›
                </button>
              </div>
            </div>
          </div>

          <div className="mb-3 flex flex-wrap gap-3 text-xs text-muted sm:hidden">
            {(Object.entries(DAILY_REPORT_CALENDAR_LEGEND) as [
              CalendarDot,
              { className: string; label: string },
            ][]).map(([key, v]) => (
              <span key={key} className="inline-flex items-center gap-1.5">
                <span className={`h-2 w-2 shrink-0 rounded-full ${v.className}`} />
                {v.label}
              </span>
            ))}
          </div>

          <div className="mb-0.5 grid w-full min-w-0 grid-cols-7 gap-px sm:mb-1 sm:gap-1">
            {WEEKDAY_LABELS.map((d) => (
              <div
                key={d}
                className="px-0.5 py-1 text-center text-[9px] font-semibold uppercase leading-tight tracking-wide text-muted sm:py-1.5 sm:text-[11px]"
              >
                {d}
              </div>
            ))}
          </div>

          <div className="grid w-full min-w-0 grid-cols-7 gap-px sm:gap-1">
            {calendarCells.map((cell, idx) => {
              if (cell.kind === "pad") {
                return (
                  <div
                    key={`pad-${idx}`}
                    className={`${calCellH} rounded-md bg-muted/[0.04]`}
                    aria-hidden
                  />
                );
              }
              const { className: dotCls } = DAILY_REPORT_CALENDAR_LEGEND[cell.dot];
              return (
                <button
                  key={cell.day}
                  type="button"
                  disabled={cell.weekend}
                  onClick={() => {
                    if (cell.weekend) return;
                    const iso = dailyReportDateIso(viewYear, viewMonthIndex, cell.day);
                    if (rowsByDate.has(iso)) openEdit(iso);
                    else openNew(iso);
                  }}
                  className={`flex ${calCellH} touch-manipulation flex-row items-center justify-center gap-0.5 rounded-md px-0.5 text-[11px] transition-colors sm:gap-1 sm:text-xs ${
                    cell.weekend
                      ? "cursor-default opacity-50"
                      : "hover:bg-muted/10 hover:text-primary active:bg-muted/15"
                  } text-primary`}
                >
                  <span className="shrink-0 tabular-nums font-medium leading-none">
                    {cell.day}
                  </span>
                  <span
                    className={`h-1.5 w-1.5 shrink-0 rounded-full ${dotCls}`}
                    aria-hidden
                  />
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {mode === "list" ? (
        <DataTable<DailyReportRow>
          variant="card"
          columns={listColumns}
          data={listRowsFiltered}
          rowKey={(r) => r.date}
          tableMinWidthClassName="min-w-0 sm:min-w-full"
          minWidthTableLayout="fixed"
          maxHeightClassName="max-h-none"
          className="w-full min-w-0"
          onRowClick={(r) => openEdit(r.date)}
          emptyFallback={
            <EmptyState
              title={t("dailyReportsPage.emptyTitle")}
              description={t("dailyReportsPage.emptyDescription")}
              action={{ label: t("dailyReportsPage.newReport"), onClick: () => openNew() }}
            />
          }
        />
      ) : null}

      <SheetDrawer
        open={drawerOpen}
        hideTitleBar
        onClose={() => setDrawerOpen(false)}
        widthClassName="max-w-[560px]"
      >
        <DailyReportDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          report={drawerReport}
          defaultDateIso={drawerSeedDate}
          occupiedDates={occupiedDates}
          onSave={(row) => {
            const oldDate = drawerReport?.date;
            const removeDate = oldDate && oldDate !== row.date ? oldDate : undefined;
            upsertReport(row, removeDate);
          }}
          onApprove={(date) => {
            setRows((prev) => prev.map((r) => (r.date === date ? { ...r, status: "Approved" } : r)));
          }}
          onReject={(date) => {
            setRows((prev) => prev.map((r) => (r.date === date ? { ...r, status: "Rejected" } : r)));
          }}
        />
      </SheetDrawer>
    </ModulePageShell>
  );
}
