import { useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  DrawingViewerToolbar,
  type DrawingViewerToolbarProps,
  type LayerVisibility,
} from "@/features/plans/DrawingViewerToolbar";
import { DrawingViewerTaskPanel } from "@/features/plans/DrawingViewerTaskPanel";
import {
  PlanCanvasViewer,
  type PlanCanvasPin,
  type PlanCanvasViewerHandle,
} from "@/features/plans/PlanCanvasViewer";
import { MOCK_TASKS } from "@/features/tasks/fixtures";
import { DEMO_PLAN_PDF_URL } from "@/features/plans/pdf";
import {
  getDrawingPlanById,
  getDemoPinsForPlan,
} from "@/features/project-ui/projectDummyData";

export default function ProjectDrawingViewerPage() {
  const { projectId, planId } = useParams<{
    projectId: string;
    planId: string;
  }>();
  const viewerRef = useRef<PlanCanvasViewerHandle>(null);
  const [zoomPct, setZoomPct] = useState(100);
  const [activeTool, setActiveTool] =
    useState<DrawingViewerToolbarProps["activeTool"]>("pan");
  const [layerVisibility, setLayerVisibility] = useState<LayerVisibility>({
    sheet: true,
    pins: true,
    markup: true,
  });
  const [viewerUserPins, setViewerUserPins] = useState<PlanCanvasPin[]>([]);

  const pinnedTaskIds = useMemo(() => {
    const s = new Set<string>();
    for (const p of viewerUserPins) {
      if (p.taskId) s.add(p.taskId);
    }
    return s;
  }, [viewerUserPins]);

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

  if (!projectId || !planId) {
    return (
      <div className="p-6 text-sm text-secondary">Missing project or plan.</div>
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

  const hintShort =
    "Wheel: zoom · Drag to pan · Drop tasks from the panel onto the plan";
  const hintFull = `${hintShort} · Use tools for Select, Pin, Measure, Markup · Layers tool: show or hide Sheet, Pins, Markup`;

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-bg">
      <div className="shrink-0 border-b border-border bg-surface">
        <div className="flex items-center justify-between gap-3 px-3 py-1.5">
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            <Link
              to={`/projects/${projectId}/drawings`}
              className="shrink-0 text-xs font-medium text-secondary hover:text-primary sm:text-sm"
            >
              ← Plans
            </Link>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold leading-tight text-primary sm:text-sm">
                <span className="font-mono text-muted">{plan.sheet}</span>
                <span className="text-muted"> · </span>
                <span>{plan.name}</span>
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1 rounded-md border border-border/80 bg-bg/50 p-0.5">
            <button
              type="button"
              className="rounded px-2 py-0.5 text-xs font-medium text-secondary hover:bg-muted/20 hover:text-primary"
              onClick={() => viewerRef.current?.zoomOut()}
              aria-label="Zoom out"
            >
              −
            </button>
            <span className="min-w-[2.75rem] text-center text-[11px] tabular-nums text-secondary">
              {zoomPct}%
            </span>
            <button
              type="button"
              className="rounded px-2 py-0.5 text-xs font-medium text-secondary hover:bg-muted/20 hover:text-primary"
              onClick={() => viewerRef.current?.zoomIn()}
              aria-label="Zoom in"
            >
              +
            </button>
            <button
              type="button"
              className="rounded px-2 py-0.5 text-xs font-medium text-secondary hover:bg-muted/20 hover:text-primary"
              onClick={() => viewerRef.current?.fitToView()}
            >
              Fit
            </button>
          </div>
        </div>
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 flex-row">
        <div className="relative flex min-h-0 min-w-0 flex-1 flex-col px-2 pb-2 pt-1.5">
          <PlanCanvasViewer
            ref={viewerRef}
            fileUrl={fileUrl}
            fileName={fileName}
            pins={pins}
            tool={activeTool}
            layerVisibility={layerVisibility}
            onUserPinsChange={setViewerUserPins}
            onViewportChange={({ zoomPercent }) => setZoomPct(zoomPercent)}
            className="min-h-0 flex-1"
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex flex-col items-center gap-2 pb-3 pt-8">
            <div className="pointer-events-auto">
              <DrawingViewerToolbar
                variant="floating"
                activeTool={activeTool}
                onToolChange={setActiveTool}
                layerVisibility={layerVisibility}
                onLayerVisibilityChange={setLayerVisibility}
              />
            </div>
          </div>
          <p
            className="pointer-events-none absolute bottom-2 left-3 z-10 max-w-[min(100%,calc(100%-14rem))] truncate text-[10px] text-muted"
            title={hintFull}
          >
            {hintShort}
          </p>
        </div>
        <DrawingViewerTaskPanel tasks={MOCK_TASKS} pinnedTaskIds={pinnedTaskIds} />
      </div>
    </div>
  );
}
