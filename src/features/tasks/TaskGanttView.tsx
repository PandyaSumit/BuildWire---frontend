import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { BuildWireTask } from '@/types/task';
import { useTaskProject } from '@/features/tasks/TaskProjectContext';
import { ganttBarClassForStatus } from '@/features/tasks/taskPresentation';
import { demoPrimaryAssigneeName } from '@/features/tasks/demoUsers';

type Zoom = 'week' | 'month' | 'quarter';

function parseIso(d: string): Date {
  const x = new Date(`${d}T12:00:00`);
  return Number.isNaN(x.getTime()) ? new Date() : x;
}

function dayIndex(anchor: Date, d: Date): number {
  return Math.round((d.getTime() - anchor.getTime()) / 86400000);
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
  }, [visible, dayW]);

  const width = totalDays * dayW;
  const rowH = 36;
  const headerH = 28;

  return (
    <div className="mx-6 flex min-h-[420px] min-w-0 flex-1 overflow-hidden rounded-2xl border border-border bg-surface">
      <div
        className="shrink-0 overflow-y-auto border-e border-border bg-muted/5"
        style={{ width: 280 }}
      >
        <div
          className="sticky top-0 z-10 border-b border-border bg-muted/10 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted"
          style={{ height: headerH }}
        >
          {t('tasks.gantt.phaseDefault')}
        </div>
        {visible.map((task) => (
            <div
              key={task.id}
              className="flex items-center border-b border-border/60 px-3 text-sm text-primary"
              style={{ height: rowH }}
            >
              <span className="truncate font-mono text-xs text-muted">{task.display_number}</span>
              <span className="ms-2 truncate" title={task.title}>
                {task.title}
              </span>
            </div>
          ))}
      </div>
      <div className="min-w-0 flex-1 overflow-x-auto overflow-y-hidden">
        <div className="sticky top-0 z-20 flex gap-1 border-b border-border bg-elevated px-2 py-1">
          {(['week', 'month', 'quarter'] as const).map((z) => (
            <button
              key={z}
              type="button"
              onClick={() => setZoom(z)}
              className={`rounded-md px-2 py-1 text-xs font-medium ${
                zoom === z ? 'bg-brand/15 text-brand' : 'text-secondary hover:bg-muted/10'
              }`}
            >
              {t(`tasks.gantt.zoom${z === 'week' ? 'Week' : z === 'month' ? 'Month' : 'Quarter'}`)}
            </button>
          ))}
        </div>
        <svg
          width={width}
          height={headerH + bars.length * rowH}
          className="block text-primary"
        >
          {Array.from({ length: totalDays }).map((_, i) => (
            <line
              key={i}
              x1={i * dayW}
              y1={0}
              x2={i * dayW}
              y2={headerH + bars.length * rowH}
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
                y2={headerH + bars.length * rowH}
                className="stroke-danger"
                strokeDasharray="4 3"
                strokeWidth={1.5}
              />
              <text
                x={todayX * dayW + dayW / 2 + 4}
                y={14}
                className="fill-danger text-[10px] font-semibold"
              >
                {t('tasks.gantt.today')}
              </text>
            </g>
          ) : null}
          {bars.map((b, i) => {
            const y = headerH + i * rowH + 10;
            const x = b.start * dayW + 2;
            const w = Math.max(4, b.len * dayW - 4);
            const fill = ganttBarClassForStatus(b.task.status);
            return (
              <g key={b.task.id}>
                {b.task.is_milestone ? (
                  <polygon
                    points={`${x + w / 2},${y - 4} ${x + w},${y + 8} ${x},${y + 8}`}
                    className={fill}
                  />
                ) : (
                  <rect
                    x={x}
                    y={y}
                    width={w}
                    height={16}
                    rx={4}
                    className={`${fill} ${b.overdue ? 'stroke-danger stroke-2' : ''}`}
                  />
                )}
                <title>
                  {b.task.display_number} — {demoPrimaryAssigneeName(b.task)}
                </title>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
