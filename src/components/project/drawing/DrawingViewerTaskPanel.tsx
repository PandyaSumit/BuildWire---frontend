import { useCallback, useEffect, useRef, useState } from "react";
import type { UiTask } from "@/utils/task/fixtures";
import { priorityBorderClass, typeBadgeClass } from "@/utils/task/fixtures";
import { BUILDWIRE_TASK_DRAG_TYPE, buildTaskDragPayload } from "@/utils/project/taskDrag";

const STORAGE_W    = "buildwire.drawings.taskPanelWidth";
const STORAGE_OPEN = "buildwire.drawings.taskPanelOpen";

const DEFAULT_WIDTH = 280;
const MIN_WIDTH     = 220;
const MAX_WIDTH     = 560;

function readStoredWidth(): number {
  try {
    const n = parseInt(sessionStorage.getItem(STORAGE_W) ?? "", 10);
    return Number.isFinite(n) ? Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, n)) : DEFAULT_WIDTH;
  } catch { return DEFAULT_WIDTH; }
}

function readStoredOpen(): boolean {
  try { return sessionStorage.getItem(STORAGE_OPEN) !== "0"; }
  catch { return true; }
}

type Props = {
  tasks: UiTask[];
  pinnedTaskIds?: Set<string>;
};

// ── Task card (shared between desktop list and mobile sheet) ──────────────────
function TaskCard({ task, pinned }: { task: UiTask; pinned: boolean }) {
  return (
    <div className={`rounded-lg border border-border bg-bg ${priorityBorderClass(task.priority)} pl-0.5 transition hover:border-brand/40`}>
      <div
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData(BUILDWIRE_TASK_DRAG_TYPE, buildTaskDragPayload(task));
          e.dataTransfer.effectAllowed = "copy";
        }}
        className="cursor-grab rounded-[7px] p-2.5 pl-2 active:cursor-grabbing"
      >
        <div className="flex items-start justify-between gap-1.5">
          <p className="font-mono text-[9px] text-muted">{task.number}</p>
          {pinned && (
            <span className="shrink-0 rounded px-1 py-px text-[9px] font-medium text-brand">On plan</span>
          )}
        </div>
        <p className="mt-0.5 line-clamp-2 text-[12px] font-medium leading-snug text-primary">{task.title}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-1">
          <span className={`rounded px-1.5 py-px text-[9px] font-medium ${typeBadgeClass(task.type)}`}>
            {task.type}
          </span>
          <span className="text-[9px] text-muted">{task.floor}</span>
        </div>
      </div>
    </div>
  );
}

// ── Mobile bottom sheet ───────────────────────────────────────────────────────
function MobileSheet({
  tasks, pinnedTaskIds, onClose,
}: { tasks: UiTask[]; pinnedTaskIds: Set<string>; onClose: () => void }) {
  const sheetRef = useRef<HTMLDivElement>(null);

  // Close on backdrop tap
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Scrim */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Sheet */}
      <div ref={sheetRef}
        className="relative z-10 flex max-h-[72vh] flex-col rounded-t-2xl border-t border-border bg-surface shadow-2xl">
        {/* Handle */}
        <div className="flex shrink-0 justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full bg-border/70" />
        </div>

        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-border/50 px-4 py-2.5">
          <div>
            <h2 className="text-[13px] font-semibold text-primary">Tasks</h2>
            <p className="text-[10px] text-muted">Drag onto the plan to place a pin.</p>
          </div>
          <button type="button" onClick={onClose}
            className="rounded-lg p-1.5 text-muted hover:bg-muted/20 hover:text-primary">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable task list */}
        <ul className="min-h-0 flex-1 list-none space-y-2 overflow-y-auto p-3">
          {tasks.map((task) => (
            <li key={task.id}>
              <TaskCard task={task} pinned={pinnedTaskIds.has(task.id)} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ── Desktop collapsed tab ─────────────────────────────────────────────────────
function CollapsedTab({ onOpen }: { onOpen: () => void }) {
  return (
    <div className="flex min-h-0 w-11 shrink-0 flex-col border-l border-border bg-surface">
      <button type="button" onClick={onOpen}
        className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 px-1 py-4 text-secondary hover:bg-muted/15 hover:text-primary"
        aria-label="Open tasks panel">
        <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span className="max-w-[2.5rem] text-center text-[9px] font-semibold leading-tight text-muted">Tasks</span>
      </button>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export function DrawingViewerTaskPanel({ tasks, pinnedTaskIds = new Set() }: Props) {
  const [open,    setOpen]    = useState(readStoredOpen);
  const [widthPx, setWidthPx] = useState(readStoredWidth);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const [sheetOpen, setSheetOpen] = useState(false);
  const resizeRef = useRef<{ startX: number; startW: number } | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    try { sessionStorage.setItem(STORAGE_OPEN, open ? "1" : "0"); } catch { /* */ }
  }, [open]);

  useEffect(() => {
    try { sessionStorage.setItem(STORAGE_W, String(widthPx)); } catch { /* */ }
  }, [widthPx]);

  const onResizePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    resizeRef.current = { startX: e.clientX, startW: widthPx };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, [widthPx]);

  const onResizePointerMove = useCallback((e: React.PointerEvent) => {
    if (!resizeRef.current) return;
    const dx = e.clientX - resizeRef.current.startX;
    setWidthPx(Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, resizeRef.current.startW - dx)));
  }, []);

  const onResizePointerUp = useCallback((e: React.PointerEvent) => {
    resizeRef.current = null;
    try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch { /* */ }
  }, []);

  // ── Mobile: render nothing in sidebar, expose FAB trigger via context ────
  if (isMobile) {
    return (
      <>
        {/* FAB to open sheet */}
        <button type="button"
          onClick={() => setSheetOpen(true)}
          className="fixed bottom-24 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-brand shadow-lg shadow-brand/30 text-white hover:bg-brand/90 active:scale-95 transition-transform"
          aria-label="Open tasks">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </button>

        {/* Bottom sheet */}
        {sheetOpen && (
          <MobileSheet tasks={tasks} pinnedTaskIds={pinnedTaskIds} onClose={() => setSheetOpen(false)} />
        )}
      </>
    );
  }

  // ── Desktop: collapsed tab or full panel ──────────────────────────────────
  if (!open) return <CollapsedTab onOpen={() => setOpen(true)} />;

  return (
    <aside className="relative flex min-h-0 shrink-0 flex-col border-l border-border bg-surface"
      style={{ width: widthPx }} aria-label="Tasks for placement">

      {/* Resize handle */}
      <div role="separator" aria-orientation="vertical"
        aria-valuemin={MIN_WIDTH} aria-valuemax={MAX_WIDTH} aria-valuenow={Math.round(widthPx)}
        aria-label="Resize tasks panel" tabIndex={0}
        className="group absolute left-0 top-0 z-10 h-full w-3 -translate-x-1/2 cursor-col-resize touch-none focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
        onPointerDown={onResizePointerDown} onPointerMove={onResizePointerMove}
        onPointerUp={onResizePointerUp} onPointerCancel={onResizePointerUp}
        onKeyDown={(e) => {
          const step = e.shiftKey ? 32 : 12;
          if (e.key === "ArrowLeft") { e.preventDefault(); setWidthPx((w) => Math.min(MAX_WIDTH, w + step)); }
          else if (e.key === "ArrowRight") { e.preventDefault(); setWidthPx((w) => Math.max(MIN_WIDTH, w - step)); }
        }}>
        <span className="pointer-events-none absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-border group-hover:bg-brand/40 group-focus-visible:bg-brand/50" aria-hidden />
      </div>

      {/* Header */}
      <div className="flex shrink-0 items-start justify-between gap-2 border-b border-border px-3 py-2.5">
        <div className="min-w-0">
          <h2 className="text-[11px] font-semibold uppercase tracking-wide text-muted">Tasks</h2>
          <p className="mt-0.5 text-[10px] leading-snug text-secondary">
            Drag onto the plan to place or move a pin.
          </p>
        </div>
        <button type="button" onClick={() => setOpen(false)}
          className="shrink-0 rounded-md p-1 text-muted hover:bg-muted/25 hover:text-primary"
          aria-label="Close tasks panel">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Task list */}
      <ul className="min-h-0 flex-1 list-none space-y-2 overflow-y-auto p-2.5">
        {tasks.map((task) => (
          <li key={task.id}>
            <TaskCard task={task} pinned={pinnedTaskIds.has(task.id)} />
          </li>
        ))}
      </ul>
    </aside>
  );
}
