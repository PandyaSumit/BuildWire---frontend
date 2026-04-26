import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useGlobalSearch } from "@/layouts/search/GlobalSearchContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconPlus } from "@/components/ui/icons";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { SheetDrawer } from "@/components/ui/sheet-drawer";
import { DAILY_REPORT_CALENDAR_LEGEND, DAILY_REPORT_STATUS_BADGE, WEEKDAY_LABELS } from "@/config/pm/daily-reports";
import { DailyReportDrawer } from "@/components/project/drawers/DailyReportDrawer";
import { ModulePageShell } from "@/components/project";
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
} from "@/services/project/projectDummyData";

const calCellH = "h-10 w-full min-w-0 sm:h-12";

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

export default function DailyReportsPage() {
  const { t, i18n } = useTranslation();
  const { query } = useGlobalSearch();
  const qNorm = query.trim().toLowerCase();

  const [rows, setRows] = useState<DailyReportRow[]>(() => [...DUMMY_DAILY_REPORTS]);
  const [mode, setMode] = useState<"calendar" | "list">("calendar");
  /** Start on April 2026 to align with seed data. */
  const [viewYear, setViewYear] = useState(2026);
  const [viewMonthIndex, setViewMonthIndex] = useState(3);

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

  const monthStats = useMemo(() => {
    const monthRows = rows.filter((r) => {
      const [y, m] = r.date.split("-").map((x) => parseInt(x, 10));
      return y === viewYear && m === viewMonthIndex + 1;
    });
    const totalWorkers = monthRows.reduce((s, r) => s + totalDailyReportCrew(r), 0);
    const totalHours   = monthRows.reduce((s, r) => s + r.manpower.reduce((ms, m) => ms + m.workers * m.hours, 0), 0);
    const approved     = monthRows.filter((r) => r.status === "Approved").length;
    const pending      = monthRows.filter((r) => r.status === "Pending").length;
    const incidents    = monthRows.reduce((s, r) => s + (r.safetyEntries?.filter((e) => e.type === "incident").length ?? 0), 0);
    return { count: monthRows.length, totalWorkers, totalHours, approved, pending, incidents };
  }, [rows, viewYear, viewMonthIndex]);

  const listColumns: DataTableColumn<DailyReportRow>[] = useMemo(
    () => [
      {
        id: "date",
        header: t("dailyReportsPage.colDate"),
        headerClassName: "",
        cellClassName: "whitespace-nowrap",
        sortValue: (r) => r.date,
        cell: (r) => {
          const d = new Date(r.date + "T12:00:00");
          return (
            <div>
              <p className="font-mono text-[13px] font-semibold text-primary">
                {d.toLocaleDateString("en", { month: "short", day: "numeric" })}
              </p>
              <p className="text-[11px] text-muted">{d.toLocaleDateString("en", { weekday: "short", year: "numeric" })}</p>
            </div>
          );
        },
      },
      {
        id: "submittedBy",
        header: t("dailyReportsPage.colSubmittedBy"),
        headerClassName: "",
        cellClassName: "",
        sortValue: (r) => r.submittedBy,
        cell: (r) => (
          <div>
            <p className="text-[13px] font-medium text-primary">{r.submittedBy}</p>
            {r.approvedBy && <p className="text-[11px] text-muted">Approved: {r.approvedBy}</p>}
          </div>
        ),
      },
      {
        id: "weather",
        header: t("dailyReportsPage.colWeather"),
        headerClassName: "",
        cellClassName: "",
        sortValue: (r) => r.weather,
        cell: (r) => {
          const w = r.weatherDetail;
          const icon = w ? { Sunny: "☀️", Cloudy: "☁️", Rainy: "🌧️", Windy: "💨", Stormy: "⛈️" }[w.condition] ?? "🌤️" : "🌤️";
          return (
            <div className="flex items-center gap-1.5">
              <span className="text-base leading-none">{icon}</span>
              <div>
                <p className="text-[12px] text-primary">{w ? `${w.condition} · ${w.tempC}°C` : r.weather}</p>
                {w?.humidity && <p className="text-[11px] text-muted">{w.humidity}% RH · {w.windKph} km/h</p>}
              </div>
            </div>
          );
        },
      },
      {
        id: "crew",
        header: "Workers / Hrs",
        headerClassName: "",
        cellClassName: "",
        align: "right",
        sortValue: (r) => totalDailyReportCrew(r),
        cell: (r) => {
          const hrs = r.manpower.reduce((s, m) => s + m.workers * m.hours, 0);
          return (
            <div className="text-right">
              <p className="text-[13px] font-semibold tabular-nums text-primary">{totalDailyReportCrew(r)}</p>
              <p className="text-[11px] tabular-nums text-muted">{hrs.toLocaleString()} hrs</p>
            </div>
          );
        },
      },
      {
        id: "safety",
        header: "Safety",
        headerClassName: "",
        cellClassName: "",
        sortValue: (r) => (r.safetyEntries?.length ?? 0),
        cell: (r) => {
          const incidents = r.safetyEntries?.filter((e) => e.type === "incident").length ?? 0;
          const nearMiss  = r.safetyEntries?.filter((e) => e.type === "near_miss").length ?? 0;
          if (!r.safetyEntries?.length) return <span className="text-[11px] text-muted">—</span>;
          return (
            <div className="flex flex-wrap gap-1">
              {incidents > 0 && <span className="rounded-full bg-danger/15 px-1.5 py-0.5 text-[10px] font-semibold text-danger">{incidents} incident</span>}
              {nearMiss  > 0 && <span className="rounded-full bg-warning/15 px-1.5 py-0.5 text-[10px] font-semibold text-warning">{nearMiss} near-miss</span>}
              {incidents === 0 && nearMiss === 0 && <span className="rounded-full bg-success/10 px-1.5 py-0.5 text-[10px] font-semibold text-success">✓</span>}
            </div>
          );
        },
      },
      {
        id: "status",
        header: t("dailyReportsPage.colStatus"),
        headerClassName: "pr-4",
        cellClassName: "pr-4",
        sortValue: (r) => r.status,
        cell: (r) => (
          <div className="flex flex-col gap-1">
            <Badge variant={DAILY_REPORT_STATUS_BADGE[r.status]} size="sm">{r.status}</Badge>
            {r.safetyEntries?.some((e) => e.type === "incident") && (
              <span className="text-[10px] font-medium text-danger">⚠ Incident</span>
            )}
          </div>
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
            <Button type="button" size="sm" className="inline-flex items-center gap-1.5" onClick={() => openNew()}>
              <IconPlus />{t("dailyReportsPage.newReport")}
            </Button>
          </>
        }
      />

      {showMissingBanner ? (
        <div className="flex w-full min-w-0 items-start gap-3 rounded-xl border border-warning/25 bg-warning/[0.06] px-4 py-3.5">
          {/* Accent dot */}
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-warning/20 text-[9px] text-warning">!</span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-warning">{t("dailyReportsPage.bannerMissingTitle")}</p>
            <p className="mt-0.5 text-xs text-secondary">{t("dailyReportsPage.bannerMissingBody")}</p>
          </div>
          <button
            type="button"
            onClick={() => openNew(realTodayIso)}
            className="shrink-0 rounded-lg border border-warning/40 bg-warning/10 px-3 py-1.5 text-xs font-semibold text-warning hover:bg-warning/20"
          >
            {t("dailyReportsPage.bannerSubmitNow")}
          </button>
        </div>
      ) : null}

      {/* ── Month stats bar ── */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {[
          { label: "Reports", value: monthStats.count, sub: "this month", icon: "📋" },
          { label: "Workers", value: monthStats.totalWorkers.toLocaleString(), sub: "total headcount", icon: "👷" },
          { label: "Man-hours", value: monthStats.totalHours.toLocaleString(), sub: "total hours", icon: "⏱️" },
          { label: "Approved", value: monthStats.approved, sub: `${monthStats.pending} pending`, icon: "✅" },
          { label: "Incidents", value: monthStats.incidents, sub: "recorded", icon: monthStats.incidents > 0 ? "⚠️" : "🟢", danger: monthStats.incidents > 0 },
        ].map((s) => (
          <div key={s.label}
            className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${(s as { danger?: boolean }).danger ? "border-danger/25 bg-danger/[0.04]" : "border-border/50 bg-surface"}`}>
            <span className="text-xl leading-none">{s.icon}</span>
            <div>
              <p className={`text-[18px] font-bold tabular-nums leading-tight ${(s as { danger?: boolean }).danger ? "text-danger" : "text-primary"}`}>{s.value}</p>
              <p className="text-[11px] font-medium text-muted">{s.label}</p>
              <p className="text-[10px] text-muted">{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {qNorm ? (
        <p className="text-xs text-muted">
          {t("dailyReportsPage.globalSearchHint", { count: listRowsFiltered.length })}
        </p>
      ) : null}

      {mode === "calendar" ? (
        <div className="w-full min-w-0 rounded-xl border border-border/60 bg-surface p-4 sm:p-6">
          {/* Calendar header */}
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              {/* Prev/Next month buttons */}
              <div className="flex gap-1">
                <button
                  type="button"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/60 text-muted hover:bg-muted/10 hover:text-primary"
                  aria-label={t("dailyReportsPage.prevMonth")}
                  onClick={() => {
                    const n = shiftCalendarMonth(viewYear, viewMonthIndex, -1);
                    setViewYear(n.year);
                    setViewMonthIndex(n.monthIndex);
                  }}
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  type="button"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/60 text-muted hover:bg-muted/10 hover:text-primary"
                  aria-label={t("dailyReportsPage.nextMonth")}
                  onClick={() => {
                    const n = shiftCalendarMonth(viewYear, viewMonthIndex, 1);
                    setViewYear(n.year);
                    setViewMonthIndex(n.monthIndex);
                  }}
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              <p className="text-base font-bold text-primary">
                {monthLabel(viewYear, viewMonthIndex, i18n.language)}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Legend */}
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted">
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
              {/* Month picker */}
              <label className="flex items-center gap-2 text-xs text-secondary">
                <span className="sr-only">{t("dailyReportsPage.jumpMonth")}</span>
                <input
                  type="month"
                  value={monthPickerValue}
                  onChange={(e) => onMonthPick(e.target.value)}
                  className="h-8 rounded-lg border border-border/60 bg-bg px-2 text-xs text-primary focus:border-brand/50 focus:outline-none"
                />
              </label>
            </div>
          </div>

          {/* Weekday labels */}
          <div className="mb-1 grid w-full min-w-0 grid-cols-7 gap-1">
            {WEEKDAY_LABELS.map((d) => (
              <div
                key={d}
                className="py-1.5 text-center text-[10px] font-semibold uppercase tracking-wider text-muted"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid w-full min-w-0 grid-cols-7 gap-1">
            {calendarCells.map((cell, idx) => {
              if (cell.kind === "pad") {
                return (
                  <div
                    key={`pad-${idx}`}
                    className={`${calCellH} rounded-lg bg-muted/[0.03]`}
                    aria-hidden
                  />
                );
              }
              const { className: dotCls } = DAILY_REPORT_CALENDAR_LEGEND[cell.dot];
              const todayIso = dailyReportDateIso(viewYear, viewMonthIndex, cell.day);
              const isToday = todayIso === realTodayIso;
              return (
                <button
                  key={cell.day}
                  type="button"
                  disabled={cell.weekend}
                  onClick={() => {
                    if (cell.weekend) return;
                    if (rowsByDate.has(todayIso)) openEdit(todayIso);
                    else openNew(todayIso);
                  }}
                  className={`flex ${calCellH} touch-manipulation flex-col items-center justify-center gap-1 rounded-lg text-[11px] transition-colors sm:text-xs ${
                    cell.weekend
                      ? "cursor-default opacity-40"
                      : isToday
                      ? "border border-brand/40 bg-brand-light text-primary hover:bg-brand/10"
                      : "hover:bg-muted/10 hover:text-primary active:bg-muted/15"
                  } text-primary`}
                >
                  <span className={`tabular-nums font-semibold leading-none ${isToday ? "text-brand" : ""}`}>
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
