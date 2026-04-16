import { useCallback, useEffect, useRef, useState } from "react";
import type { UiTask } from "@/utils/task/fixtures";
import { priorityBorderClass, typeBadgeClass } from "@/utils/task/fixtures";
import { BUILDWIRE_TASK_DRAG_TYPE, buildTaskDragPayload } from "@/utils/project/taskDrag";

const STORAGE_W = "buildwire.drawings.taskPanelWidth";
const STORAGE_OPEN = "buildwire.drawings.taskPanelOpen";

const DEFAULT_WIDTH = 280;
const MIN_WIDTH = 220;
const MAX_WIDTH = 560;

function readStoredWidth(): number {
  try {
    const s = sessionStorage.getItem(STORAGE_W);
    const n = s ? parseInt(s, 10) : DEFAULT_WIDTH;
    if (!Number.isFinite(n)) return DEFAULT_WIDTH;
    return Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, n));
  } catch {
    return DEFAULT_WIDTH;
  }
}

function readStoredOpen(): boolean {
  try {
    return sessionStorage.getItem(STORAGE_OPEN) !== "0";
  } catch {
    return true;
  }
}

type DrawingViewerTaskPanelProps = {
  tasks: UiTask[];
  /** Task ids that already have a pin on the sheet (for “On plan” state). */
  pinnedTaskIds?: Set<string>;
};

export function DrawingViewerTaskPanel({
  tasks,
  pinnedTaskIds = new Set(),
}: DrawingViewerTaskPanelProps) {
  const [open, setOpen] = useState(readStoredOpen);
  const [widthPx, setWidthPx] = useState(readStoredWidth);
  const resizeRef = useRef<{ startX: number; startW: number } | null>(null);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_OPEN, open ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [open]);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_W, String(widthPx));
    } catch {
      /* ignore */
    }
  }, [widthPx]);

  const onResizePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      resizeRef.current = { startX: e.clientX, startW: widthPx };
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    },
    [widthPx],
  );

  const onResizePointerMove = useCallback((e: React.PointerEvent) => {
    if (!resizeRef.current) return;
    const dx = e.clientX - resizeRef.current.startX;
    const next = resizeRef.current.startW - dx;
    setWidthPx(Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, next)));
  }, []);

  const onResizePointerUp = useCallback((e: React.PointerEvent) => {
    resizeRef.current = null;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  }, []);

  if (!open) {
    return (
      <div className="flex min-h-0 w-11 shrink-0 flex-col border-l border-border bg-surface">
        <button
          type="button"
          className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 border-0 bg-surface px-1 py-4 text-secondary hover:bg-muted/15 hover:text-primary"
          onClick={() => setOpen(true)}
          aria-label="Open tasks panel"
          title="Open tasks panel"
        >
          <svg
            className="h-5 w-5 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span className="max-w-[2.5rem] text-center text-[9px] font-semibold leading-tight text-muted">
            Tasks
          </span>
        </button>
      </div>
    );
  }

  return (
    <aside
      className="relative flex min-h-0 shrink-0 flex-col border-l border-border bg-surface"
      style={{ width: widthPx }}
      aria-label="Tasks for placement"
    >
      <div
        role="separator"
        aria-orientation="vertical"
        aria-valuemin={MIN_WIDTH}
        aria-valuemax={MAX_WIDTH}
        aria-valuenow={Math.round(widthPx)}
        aria-label="Resize tasks panel"
        tabIndex={0}
        className="group absolute left-0 top-0 z-10 h-full w-3 -translate-x-1/2 cursor-col-resize touch-none focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
        onPointerDown={onResizePointerDown}
        onPointerMove={onResizePointerMove}
        onPointerUp={onResizePointerUp}
        onPointerCancel={onResizePointerUp}
        onKeyDown={(e) => {
          const step = e.shiftKey ? 32 : 12;
          if (e.key === "ArrowLeft") {
            e.preventDefault();
            setWidthPx((w) => Math.min(MAX_WIDTH, w + step));
          } else if (e.key === "ArrowRight") {
            e.preventDefault();
            setWidthPx((w) => Math.max(MIN_WIDTH, w - step));
          }
        }}
      >
        <span
          className="pointer-events-none absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-border group-hover:bg-brand/40 group-focus-visible:bg-brand/50"
          aria-hidden
        />
      </div>

      <div className="flex shrink-0 items-start justify-between gap-2 border-b border-border px-2.5 py-2 pl-3">
        <div className="min-w-0">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">
            Tasks
          </h2>
          <p className="mt-0.5 text-[10px] leading-snug text-secondary">
            Drag onto the plan to place or move a pin.
          </p>
        </div>
        <button
          type="button"
          className="shrink-0 rounded-md p-1 text-muted hover:bg-muted/25 hover:text-primary"
          onClick={() => setOpen(false)}
          aria-label="Close tasks panel"
          title="Close panel"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
      <ul className="min-h-0 flex-1 list-none space-y-1.5 overflow-y-auto p-2">
        {tasks.map((task) => {
          const onPlan = pinnedTaskIds.has(task.id);
          return (
            <li key={task.id}>
              <div
                className={`rounded-md border border-border bg-bg ${priorityBorderClass(
                  task.priority,
                )} pl-0.5 transition hover:border-brand/40`}
              >
                <div
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData(
                      BUILDWIRE_TASK_DRAG_TYPE,
                      buildTaskDragPayload(task),
                    );
                    e.dataTransfer.effectAllowed = "copy";
                  }}
                  className="cursor-grab rounded-[5px] p-2 pl-1.5 active:cursor-grabbing"
                >
                  <div className="flex items-start justify-between gap-1.5">
                    <p className="font-mono text-[9px] text-muted">{task.number}</p>
                    {onPlan ? (
                      <span className="shrink-0 rounded px-1 py-px text-[9px] font-medium text-brand">
                        On plan
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-[12px] font-medium leading-snug text-primary">
                    {task.title}
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1">
                    <span
                      className={`rounded px-1.5 py-px text-[9px] font-medium ${typeBadgeClass(task.type)}`}
                    >
                      {task.type}
                    </span>
                    <span className="text-[9px] text-muted">{task.floor}</span>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
