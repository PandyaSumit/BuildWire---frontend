import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { BuildWireTask } from '@/types/task';
import { useTaskProject } from '@/features/tasks/TaskProjectContext';
import { ganttBarClassForStatus } from '@/features/tasks/taskPresentation';
import { demoPrimaryAssigneeName } from '@/features/tasks/demoUsers';
import { taskWorkflowTKey } from '@/features/tasks/fixtures';
import { EmptyState, SegmentedControl } from '@/components/ui';

type Zoom = 'week' | 'month' | 'quarter';

function parseIso(d: string): Date {
  const x = new Date(`${d}T12:00:00`);
  return Number.isNaN(x.getTime()) ? new Date() : x;
}

function dayIndex(anchor: Date, d: Date): number {
  return Math.round((d.getTime() - anchor.getTime()) / 86400000);
}

function formatIsoRangeShort(startIso: string, endIso: string): string {
  const s = new Date(`${startIso.slice(0, 10)}T12:00:00`);
  const e = new Date(`${endIso.slice(0, 10)}T12:00:00`);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return '—';
  const sameMonth =
    s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear();
  if (sameMonth) {
    const mon = s.toLocaleDateString(undefined, { month: 'short' });
    return `${mon} ${s.getDate()}\u2009–\u2009${e.getDate()}`;
  }
  const left = s.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const right = e.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  return `${left} – ${right}`;
}

function taskRowTitle(task: BuildWireTask): string {
  return `${task.display_number} — ${task.title} · ${demoPrimaryAssigneeName(task)} · ${task.start_date.slice(0, 10)} → ${task.due_date.slice(0, 10)}`;
}

export function TaskGanttView() {
  const { t } = useTranslation();
  const { filteredTasks } = useTaskProject();
  const [zoom, setZoom] = useState<Zoom>('month');

  const dayW = zoom === 'week' ? 36 : zoom === 'month' ? 14 : 5;

  const visible = useMemo(
    () => filteredTasks.filter((x) => x.status !== 'void'),
    [filteredTasks],
  );

  const { totalDays, bars, todayX } = useMemo(() => {
    const tasks = visible;
    if (tasks.length === 0) {
      return {
        totalDays: 30,
        bars: [] as {
          task: BuildWireTask;
          start: number;
          len: number;
          overdue: boolean;
        }[],
        todayX: 0,
      };
    }
    let min = parseIso(tasks[0].start_date);
    let max = parseIso(tasks[0].due_date);
    tasks.forEach((x) => {
      const s = parseIso(x.start_date);
      const e = parseIso(x.due_date);
      if (s < min) min = s;
      if (e > max) max = e;
    });
    const pad = 3;
    const anchor = new Date(min);
    anchor.setDate(anchor.getDate() - pad);
    anchor.setHours(12, 0, 0, 0);
    const end = new Date(max);
    end.setDate(end.getDate() + pad);
    const totalDays = Math.max(14, dayIndex(anchor, end) + 1);
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    const todayIdx = dayIndex(anchor, today);
    const bars = tasks.map((task) => {
      const s = dayIndex(anchor, parseIso(task.start_date));
      const e = dayIndex(anchor, parseIso(task.due_date));
      const start = Math.max(0, Math.min(s, totalDays - 1));
      const endIdx = Math.max(start + 1, Math.min(e + 1, totalDays));
      const len = endIdx - start;
      const overdue = task.status !== 'done' && parseIso(task.due_date) < today;
      return { task, start, len, overdue };
    });
    return { totalDays, bars, todayX: todayIdx };
  }, [visible]);

  const width = totalDays * dayW;
  const rowH = 72;
  const headerH = 40;
  const barH = 22;
  const barY = (rowIndex: number) => headerH + rowIndex * rowH + (rowH - barH) / 2;

  const zoomOptions = useMemo(
    () =>
      (['week', 'month', 'quarter'] as const).map((z) => ({
        value: z,
        label: t(
          z === 'week' ? 'tasks.gantt.zoomWeek' : z === 'month' ? 'tasks.gantt.zoomMonth' : 'tasks.gantt.zoomQuarter',
        ),
      })),
    [t],
  );

  if (visible.length === 0) {
    return (
      <div className="flex min-h-[min(40vh,320px)] flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-surface">
        <EmptyState
          title={t('tasks.gantt.emptyTitle')}
          description={t('tasks.gantt.emptyDesc')}
        />
      </div>
    );
  }

  const svgH = headerH + visible.length * rowH;

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
      <div className="flex shrink-0 flex-col gap-2 border-b border-border bg-elevated px-3 py-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <SegmentedControl<Zoom>
          value={zoom}
          onChange={setZoom}
          options={zoomOptions}
          size="md"
          className="min-w-0 max-w-full"
        />
        <p className="text-center text-[11px] leading-snug text-muted sm:text-end sm:text-xs">
          {t('tasks.gantt.scrollHint')}
        </p>
      </div>

      <div
        className="relative min-h-0 flex-1 touch-pan-x touch-pan-y"
        role="region"
        aria-label={t('tasks.scheduleTitle')}
      >
        <div className="h-full min-h-[min(280px,55vh)] overflow-auto overscroll-x-contain [-webkit-overflow-scrolling:touch]">
          <div className="inline-flex min-w-min flex-row items-stretch">
            <div
              className="sticky start-0 z-30 w-[min(20rem,calc(100vw-3rem))] shrink-0 border-e border-border bg-surface shadow-[4px_0_12px_-8px_rgba(0,0,0,0.15)] dark:shadow-[4px_0_12px_-8px_rgba(0,0,0,0.4)] sm:w-64 sm:shadow-[6px_0_16px_-10px_rgba(0,0,0,0.12)] md:w-72 lg:w-80"
            >
              <div
                className="sticky top-0 z-10 flex items-center border-b border-border bg-surface px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted"
                style={{ minHeight: headerH }}
              >
                {t('tasks.gantt.phaseDefault')}
              </div>
              {visible.map((task) => (
                <div
                  key={task.id}
                  className="box-border grid grid-cols-[auto_minmax(0,1fr)] gap-x-2 gap-y-1 border-b border-border/60 px-3 py-2.5 text-start content-center"
                  style={{ minHeight: rowH }}
                >
                  <span className="mt-0.5 shrink-0 self-start font-mono text-[11px] text-muted">{task.display_number}</span>
                  <span className="min-w-0 text-sm font-medium leading-snug text-primary line-clamp-2">{task.title}</span>
                  <div className="col-span-2 min-w-0 text-[11px] leading-relaxed text-secondary">
                    <span className="font-medium text-primary/90">{t(taskWorkflowTKey(task.status))}</span>
                    <span className="mx-1 text-muted" aria-hidden>
                      ·
                    </span>
                    <span className="break-words">{demoPrimaryAssigneeName(task)}</span>
                  </div>
                  <div className="col-span-2 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] tabular-nums text-muted">
                    <span>{formatIsoRangeShort(task.start_date, task.due_date)}</span>
                    {task.progress > 0 ? (
                      <>
                        <span className="text-border" aria-hidden>
                          ·
                        </span>
                        <span>{task.progress}%</span>
                      </>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>

            <div className="relative z-0 min-w-0 bg-surface">
              <svg
                width={width}
                height={svgH}
                className="block text-primary"
                role="img"
                aria-label={t('tasks.gantt.chartAria')}
              >
                {Array.from({ length: totalDays }).map((_, i) => (
                  <line
                    key={i}
                    x1={i * dayW}
                    y1={0}
                    x2={i * dayW}
                    y2={svgH}
                    className="stroke-border/40"
                    strokeWidth={i % 7 === 0 ? 1 : 0.5}
                  />
                ))}
                {todayX >= 0 && todayX < totalDays ? (
                  <g>
                    <line
                      x1={todayX * dayW + dayW / 2}
                      y1={0}
                      x2={todayX * dayW + dayW / 2}
                      y2={svgH}
                      className="stroke-danger"
                      strokeDasharray="4 3"
                      strokeWidth={1.5}
                    />
                    <text
                      x={todayX * dayW + dayW / 2 + 4}
                      y={16}
                      className="fill-danger text-[10px] font-semibold"
                    >
                      {t('tasks.gantt.today')}
                    </text>
                  </g>
                ) : null}
                {bars.map((b, i) => {
                  const y = barY(i);
                  const x = b.start * dayW + 2;
                  const w = Math.max(4, b.len * dayW - 4);
                  const fill = ganttBarClassForStatus(b.task.status);
                  return (
                    <g key={b.task.id}>
                      {b.task.is_milestone ? (
                        <polygon
                          points={`${x + w / 2},${y - 2} ${x + w},${y + barH - 2} ${x},${y + barH - 2}`}
                          className={fill}
                        />
                      ) : (
                        <rect
                          x={x}
                          y={y}
                          width={w}
                          height={barH}
                          rx={4}
                          className={`${fill} ${b.overdue ? 'stroke-danger stroke-2' : ''}`}
                        />
                      )}
                      <title>{taskRowTitle(b.task)}</title>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
