import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  DrawingViewerToolbar,
  type DrawingViewerToolbarProps,
  type LayerVisibility,
  type AnnotationStyle,
  DEFAULT_ANNOTATION_STYLE,
} from "@/features/plans/DrawingViewerToolbar";
import { DrawingViewerTaskPanel } from "@/features/plans/DrawingViewerTaskPanel";
import {
  PlanCanvasViewer,
  type PlanCanvasPin,
  type PlanCanvasViewerHandle,
  type Annotation,
} from "@/features/plans/PlanCanvasViewer";
import { MOCK_TASKS } from "@/features/tasks/fixtures";
import { DEMO_PLAN_PDF_URL } from "@/features/plans/pdf";
import {
  getDrawingPlanById,
  getDemoPinsForPlan,
} from "@/services/project/projectDummyData";

/* ─── Page ─────────────────────────────────────────────────────────── */

export default function DrawingViewerPage() {
  const { projectId, planId } = useParams<{
    projectId: string;
    planId: string;
  }>();

  const viewerRef = useRef<PlanCanvasViewerHandle>(null);

  /* Viewport */
  const [zoomPct, setZoomPct] = useState(100);

  /* Active tool + layers */
  const [activeTool, setActiveTool] =
    useState<DrawingViewerToolbarProps["activeTool"]>("pan");
  const [layerVisibility, setLayerVisibility] = useState<LayerVisibility>({
    sheet: true,
    pins: true,
    markup: true,
  });

  /* Annotation style */
  const [annotationStyle, setAnnotationStyle] = useState<AnnotationStyle>(
    DEFAULT_ANNOTATION_STYLE,
  );

  /* Undo / Redo availability — updated whenever annotations change */
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const handleAnnotationsChange = useCallback((_annotations: Annotation[]) => {
    setCanUndo(viewerRef.current?.canUndo() ?? false);
    setCanRedo(viewerRef.current?.canRedo() ?? false);
  }, []);

  /* Multi-page PDF navigation */
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  /* User-placed pins */
  const [viewerUserPins, setViewerUserPins] = useState<PlanCanvasPin[]>([]);

  const pinnedTaskIds = useMemo(() => {
    const s = new Set<string>();
    for (const p of viewerUserPins) {
      if (p.taskId) s.add(p.taskId);
    }
    return s;
  }, [viewerUserPins]);

  /* Plan data */
  const plan = planId ? getDrawingPlanById(planId) : undefined;
  const demoPins = planId ? getDemoPinsForPlan(planId) : [];

  const fileUrl = plan?.pdfUrl ?? DEMO_PLAN_PDF_URL;
  const fileName = plan?.fileName;

  const pins = demoPins.map((p) => ({
    id: p.id,
    label: p.label,
    x: p.x,
    y: p.y,
    status: p.status,
  }));

  /* Keyboard shortcuts */
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (!e.ctrlKey && !e.metaKey) return;
      if (
        (e.target as HTMLElement).tagName === "INPUT" ||
        (e.target as HTMLElement).tagName === "TEXTAREA"
      )
        return;

      if (e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        viewerRef.current?.undo();
        setCanUndo(viewerRef.current?.canUndo() ?? false);
        setCanRedo(viewerRef.current?.canRedo() ?? false);
      } else if (e.key === "y" || (e.key === "z" && e.shiftKey)) {
        e.preventDefault();
        viewerRef.current?.redo();
        setCanUndo(viewerRef.current?.canUndo() ?? false);
        setCanRedo(viewerRef.current?.canRedo() ?? false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  /* Actions */
  const handleUndo = useCallback(() => {
    viewerRef.current?.undo();
    setCanUndo(viewerRef.current?.canUndo() ?? false);
    setCanRedo(viewerRef.current?.canRedo() ?? false);
  }, []);

  const handleRedo = useCallback(() => {
    viewerRef.current?.redo();
    setCanUndo(viewerRef.current?.canUndo() ?? false);
    setCanRedo(viewerRef.current?.canRedo() ?? false);
  }, []);

  const handleClearAll = useCallback(() => {
    viewerRef.current?.clearAnnotations();
    setCanUndo(false);
    setCanRedo(false);
  }, []);

  /* Page navigation */
  const handlePrevPage = useCallback(() => {
    setCurrentPage((p) => Math.max(1, p - 1));
  }, []);

  const handleNextPage = useCallback(() => {
    setCurrentPage((p) => Math.min(totalPages, p + 1));
  }, [totalPages]);

  /* ─── Guard ─────────────────────────────────────────────────────── */

  if (!projectId || !planId) {
    return (
      <div className="p-6 text-sm text-secondary">
        Missing project or plan.
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="p-6">
        <Link
          to={`/projects/${projectId}/drawings`}
          className="text-sm font-medium text-brand hover:underline"
        >
          ← Back to drawings
        </Link>
        <p className="mt-4 text-sm text-secondary">Plan not found.</p>
      </div>
    );
  }

  /* ─── Layout ─────────────────────────────────────────────────────── */

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-bg">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <header className="shrink-0 border-b border-border bg-surface">
        <div className="flex items-center gap-3 px-4 py-2">
          {/* Breadcrumb + drawing identity */}
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <Link
              to={`/projects/${projectId}/drawings`}
              className="flex shrink-0 items-center gap-1 rounded-md px-1.5 py-1 text-[12px] font-medium text-secondary transition-colors hover:bg-primary/6 hover:text-primary"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Plans
            </Link>

            <svg className="h-3 w-3 shrink-0 text-border" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>

            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-2">
                <span className="shrink-0 rounded bg-muted/20 px-1.5 py-0.5 font-mono text-[11px] font-semibold tracking-wide text-secondary">
                  {plan.sheet}
                </span>
                <p className="truncate text-[13px] font-semibold text-primary">
                  {plan.name}
                </p>
                {plan.discipline && (
                  <span className="hidden shrink-0 rounded-full bg-brand/10 px-2 py-0.5 text-[11px] font-medium text-brand sm:inline">
                    {plan.discipline}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right-side controls */}
          <div className="flex shrink-0 items-center gap-2">
            {/* Page navigation — only shown for multi-page PDFs */}
            {totalPages > 1 && (
              <div className="flex items-center gap-0.5 rounded-lg border border-border/70 bg-bg/60 px-0.5 py-0.5">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={handlePrevPage}
                  aria-label="Previous page"
                  className="flex h-7 w-7 items-center justify-center rounded-md text-secondary transition-colors disabled:opacity-30 hover:enabled:bg-primary/8 hover:enabled:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
                >
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <span className="min-w-[4.5rem] text-center text-[11px] tabular-nums text-secondary">
                  {currentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={handleNextPage}
                  aria-label="Next page"
                  className="flex h-7 w-7 items-center justify-center rounded-md text-secondary transition-colors disabled:opacity-30 hover:enabled:bg-primary/8 hover:enabled:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
                >
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}

            {/* Zoom controls */}
            <div className="flex items-center gap-0.5 rounded-lg border border-border/70 bg-bg/60 px-0.5 py-0.5">
              <button
                type="button"
                onClick={() => viewerRef.current?.zoomOut()}
                aria-label="Zoom out"
                className="flex h-7 w-7 items-center justify-center rounded-md text-secondary transition-colors hover:bg-primary/8 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16zM8 11h6" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => viewerRef.current?.fitToView()}
                className="min-w-[3.5rem] rounded-md px-2 py-1 text-center text-[11px] tabular-nums text-secondary transition-colors hover:bg-primary/8 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
                title="Fit to view"
              >
                {zoomPct}%
              </button>
              <button
                type="button"
                onClick={() => viewerRef.current?.zoomIn()}
                aria-label="Zoom in"
                className="flex h-7 w-7 items-center justify-center rounded-md text-secondary transition-colors hover:bg-primary/8 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16zM11 8v6M8 11h6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Canvas area + task panel ────────────────────────────────── */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-row">
        <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
          <PlanCanvasViewer
            ref={viewerRef}
            fileUrl={fileUrl}
            fileName={fileName}
            pins={pins}
            tool={activeTool}
            pageNumber={currentPage}
            layerVisibility={layerVisibility}
            annotationStyle={annotationStyle}
            onUserPinsChange={setViewerUserPins}
            onAnnotationsChange={handleAnnotationsChange}
            onPageCountChange={setTotalPages}
            onViewportChange={({ zoomPercent }) => setZoomPct(zoomPercent)}
            className="min-h-0 flex-1"
          />

          {/* Floating toolbar — bottom-center */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex flex-col items-center gap-2 pb-4">
            <div className="pointer-events-auto">
              <DrawingViewerToolbar
                variant="floating"
                activeTool={activeTool}
                onToolChange={setActiveTool}
                layerVisibility={layerVisibility}
                onLayerVisibilityChange={setLayerVisibility}
                annotationStyle={annotationStyle}
                onAnnotationStyleChange={setAnnotationStyle}
                canUndo={canUndo}
                canRedo={canRedo}
                onUndo={handleUndo}
                onRedo={handleRedo}
                onClearAll={handleClearAll}
              />
            </div>
          </div>

          {/* Hint */}
          <p className="pointer-events-none absolute bottom-2 left-3 z-10 hidden text-[10px] text-muted sm:block">
            Scroll: zoom · Drag: pan · Drop tasks onto the plan
          </p>
        </div>

        <DrawingViewerTaskPanel tasks={MOCK_TASKS} pinnedTaskIds={pinnedTaskIds} />
      </div>
    </div>
  );
}
