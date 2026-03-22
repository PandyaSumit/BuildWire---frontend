import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import type { DrawingViewerToolId, LayerVisibility } from "@/features/plans/DrawingViewerToolbar";
import {
  BUILDWIRE_TASK_DRAG_TYPE,
  parseTaskDragPayload,
} from "@/features/plans/taskDrag";
import {
  isImage,
  isPdf,
  rasterizePdfFirstPageToDataUrl,
  resolvePlanFileUrl,
} from "@/features/plans/pdf";

const MIN_ZOOM = 0.05;
const MAX_ZOOM = 12;
const PIN_HIT_PX = 28;
const CLICK_MAX_MOVE = 6;

export type PlanCanvasPin = {
  id: string;
  label: string;
  x: number;
  y: number;
  status: string;
  /** When placed from the task panel drag-drop. */
  taskId?: string;
};

export type PlanCanvasViewerHandle = {
  zoomIn: () => void;
  zoomOut: () => void;
  fitToView: () => void;
  getZoomPercent: () => number;
};

type PlanCanvasViewerProps = {
  fileUrl: string;
  fileName?: string | null;
  /** PDF.js rasterization scale (higher = sharper, larger bitmap). */
  pdfRenderScale?: number;
  pins?: PlanCanvasPin[];
  className?: string;
  onViewportChange?: (v: { zoomPercent: number }) => void;
  /** Active drawing tool (default pan). */
  tool?: DrawingViewerToolId;
  /** Toggle base sheet, pins, and markup overlay. */
  layerVisibility?: LayerVisibility;
  /** Called when user-placed pins change (click pin tool or task drag-drop). */
  onUserPinsChange?: (pins: PlanCanvasPin[]) => void;
};

const defaultLayers: LayerVisibility = {
  sheet: true,
  pins: true,
  markup: true,
};

/** Chips sit on light plan PDFs — use strong contrast for readability. */
const statusPinStyles: Record<string, string> = {
  open:
    "bg-zinc-800 text-white ring-1 ring-zinc-950/25 shadow-md dark:bg-zinc-700",
  in_progress: "bg-brand text-bg ring-1 ring-brand/30 shadow-md",
  in_review: "bg-amber-500 text-zinc-950 ring-1 ring-amber-600/40 shadow-md",
  blocked: "bg-red-600 text-white ring-1 ring-red-900/30 shadow-md",
  awaiting_inspection:
    "bg-slate-600 text-white ring-1 ring-slate-900/25 shadow-md",
  completed: "bg-emerald-700 text-white ring-1 ring-emerald-900/30 shadow-md",
  closed: "bg-zinc-500 text-white ring-1 ring-zinc-800/30 shadow-md",
};

function pinClass(status: string) {
  return statusPinStyles[status] ?? statusPinStyles.open;
}

function clientToSheet(
  clientX: number,
  clientY: number,
  container: HTMLElement,
  pan: { x: number; y: number },
  zoom: number,
) {
  const r = container.getBoundingClientRect();
  const vx = clientX - r.left;
  const vy = clientY - r.top;
  return { x: (vx - pan.x) / zoom, y: (vy - pan.y) / zoom };
}

function distanceSq(ax: number, ay: number, bx: number, by: number) {
  const dx = ax - bx;
  const dy = ay - by;
  return dx * dx + dy * dy;
}

export const PlanCanvasViewer = forwardRef<PlanCanvasViewerHandle, PlanCanvasViewerProps>(
  function PlanCanvasViewer(
    {
      fileUrl,
      fileName,
      pdfRenderScale = 2,
      pins = [],
      className = "",
      onViewportChange,
      tool = "pan",
      layerVisibility = defaultLayers,
    },
    ref,
  ) {
    const resolved = resolvePlanFileUrl(fileUrl) ?? fileUrl;
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);
    const [sheet, setSheet] = useState<{
      kind: "image";
      src: string;
      w: number;
      h: number;
    } | null>(null);

    const containerRef = useRef<HTMLDivElement>(null);
    const strokeCanvasRef = useRef<HTMLCanvasElement>(null);
    const dim = useRef({ w: 0, h: 0 });
    const zRef = useRef(zoom);
    const pRef = useRef(pan);
    const panDrag = useRef({
      on: false,
      sx: 0,
      sy: 0,
      spx: 0,
      spy: 0,
    });
    const [isPanning, setIsPanning] = useState(false);

    const [selectedPinId, setSelectedPinId] = useState<string | null>(null);
    const [userPins, setUserPins] = useState<PlanCanvasPin[]>([]);
    const userPinSeq = useRef(1);

    const [measureDraft, setMeasureDraft] = useState<{
      x1: number;
      y1: number;
      x2: number;
      y2: number;
    } | null>(null);
    const [measureLine, setMeasureLine] = useState<{
      x1: number;
      y1: number;
      x2: number;
      y2: number;
    } | null>(null);

    const [markupStrokes, setMarkupStrokes] = useState<
      Array<{ points: [number, number][] }>
    >([]);
    const [markupCurrent, setMarkupCurrent] = useState<[number, number][] | null>(
      null,
    );

    const measureDragRef = useRef(false);
    const pinPointerRef = useRef<{
      down: boolean;
      sx: number;
      sy: number;
      moved: boolean;
    } | null>(null);

    const [taskDropHover, setTaskDropHover] = useState(false);

    zRef.current = zoom;
    pRef.current = pan;

    const notifyViewport = useCallback(() => {
      onViewportChange?.({ zoomPercent: Math.round(zRef.current * 100) });
    }, [onViewportChange]);

    useEffect(() => {
      notifyViewport();
    }, [zoom, pan, notifyViewport]);

    const fit = useCallback(() => {
      const c = containerRef.current;
      const { w, h } = dim.current;
      if (!c || !w || !h) return;
      const r = c.getBoundingClientRect();
      const z = Math.min(
        MAX_ZOOM,
        Math.max(MIN_ZOOM, Math.min(r.width / w, r.height / h) * 0.96),
      );
      const px = (r.width - w * z) / 2;
      const py = (r.height - h * z) / 2;
      zRef.current = z;
      pRef.current = { x: px, y: py };
      setZoom(z);
      setPan({ x: px, y: py });
    }, []);

    const zoomAt = useCallback((nz: number, sx: number, sy: number) => {
      const oz = zRef.current;
      const op = pRef.current;
      const cz = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, nz));
      const px = (sx - op.x) / oz;
      const py = (sy - op.y) / oz;
      const np = { x: sx - px * cz, y: sy - py * cz };
      zRef.current = cz;
      pRef.current = np;
      setZoom(cz);
      setPan(np);
    }, []);

    const zoomCenter = useCallback(
      (nz: number) => {
        const c = containerRef.current;
        if (!c) return;
        const r = c.getBoundingClientRect();
        zoomAt(nz, r.width / 2, r.height / 2);
      },
      [zoomAt],
    );

    useEffect(() => {
      let cancelled = false;
      setLoading(true);
      setErr(null);
      setSheet(null);

      (async () => {
        try {
          if (isPdf(resolved, fileName ?? undefined)) {
            const { dataUrl, width, height } = await rasterizePdfFirstPageToDataUrl(
              resolved,
              pdfRenderScale,
            );
            if (cancelled) return;
            dim.current = { w: width, h: height };
            setSheet({ kind: "image", src: dataUrl, w: width, h: height });
          } else if (isImage(resolved, fileName ?? undefined)) {
            await new Promise<void>((resolve, reject) => {
              const img = new Image();
              img.crossOrigin = "anonymous";
              img.onload = () => {
                if (cancelled) return;
                const w = img.naturalWidth || 1200;
                const h = img.naturalHeight || 900;
                dim.current = { w, h };
                setSheet({ kind: "image", src: resolved, w, h });
                resolve();
              };
              img.onerror = () => reject(new Error("Failed to load image"));
              img.src = resolved;
            });
          } else {
            throw new Error("Unsupported file type for viewer (use PDF or image)");
          }
        } catch (e) {
          if (!cancelled) {
            setErr(e instanceof Error ? e.message : "Failed to load sheet");
            dim.current = { w: 0, h: 0 };
          }
        } finally {
          if (!cancelled) setLoading(false);
        }
      })();

      return () => {
        cancelled = true;
      };
    }, [resolved, fileName, pdfRenderScale]);

    useEffect(() => {
      if (!sheet || loading) return;
      requestAnimationFrame(() => fit());
    }, [sheet, loading, fit]);

    useEffect(() => {
      const c = containerRef.current;
      if (!c) return;
      const fn = (e: WheelEvent) => {
        e.preventDefault();
        const r = c.getBoundingClientRect();
        let d = e.deltaY;
        if (e.deltaMode === 1) d *= 20;
        if (e.deltaMode === 2) d *= 400;
        const oz = zRef.current;
        const f = Math.pow(2, -d * 0.0015);
        const nz = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, oz * f));
        const cx = e.clientX - r.left;
        const cy = e.clientY - r.top;
        const px = (cx - pRef.current.x) / oz;
        const py = (cy - pRef.current.y) / oz;
        const np = { x: cx - px * nz, y: cy - py * nz };
        zRef.current = nz;
        pRef.current = np;
        setZoom(nz);
        setPan(np);
      };
      c.addEventListener("wheel", fn, { passive: false });
      return () => c.removeEventListener("wheel", fn);
    }, [sheet]);

    useEffect(() => {
      const cv = strokeCanvasRef.current;
      if (!cv || !sheet) return;
      cv.width = sheet.w;
      cv.height = sheet.h;
    }, [sheet]);

    const redrawOverlay = useCallback(() => {
      const cv = strokeCanvasRef.current;
      if (!cv || !sheet) return;
      const ctx = cv.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, sheet.w, sheet.h);

      const drawStrokePath = (
        points: [number, number][],
        style: { color: string; width: number },
      ) => {
        if (points.length < 2) return;
        ctx.beginPath();
        ctx.moveTo(points[0][0], points[0][1]);
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i][0], points[i][1]);
        }
        ctx.strokeStyle = style.color;
        ctx.lineWidth = style.width;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.stroke();
      };

      if (layerVisibility.markup) {
        for (const s of markupStrokes) {
          drawStrokePath(s.points, { color: "rgba(59, 130, 246, 0.9)", width: 2.5 });
        }
        if (markupCurrent && markupCurrent.length > 1) {
          drawStrokePath(markupCurrent, {
            color: "rgba(59, 130, 246, 0.9)",
            width: 2.5,
          });
        }
      }

      const drawMeasureSeg = (
        x1: number,
        y1: number,
        x2: number,
        y2: number,
        draft: boolean,
      ) => {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = draft
          ? "rgba(249, 115, 22, 0.55)"
          : "rgba(249, 115, 22, 0.95)";
        ctx.lineWidth = draft ? 2 : 2.5;
        ctx.lineCap = "round";
        ctx.stroke();
        const mx = (x1 + x2) / 2;
        const my = (y1 + y2) / 2;
        const len = Math.hypot(x2 - x1, y2 - y1);
        ctx.font = "bold 13px ui-sans-serif, system-ui, sans-serif";
        ctx.fillStyle = draft ? "rgba(234, 88, 12, 0.85)" : "rgba(194, 65, 12, 0.98)";
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.fillText(`${len.toFixed(0)} px`, mx, my - 6);
      };

      if (measureLine) {
        drawMeasureSeg(
          measureLine.x1,
          measureLine.y1,
          measureLine.x2,
          measureLine.y2,
          false,
        );
      }
      if (measureDraft) {
        drawMeasureSeg(
          measureDraft.x1,
          measureDraft.y1,
          measureDraft.x2,
          measureDraft.y2,
          true,
        );
      }
    }, [
      sheet,
      layerVisibility.markup,
      markupStrokes,
      markupCurrent,
      measureLine,
      measureDraft,
    ]);

    useEffect(() => {
      redrawOverlay();
    }, [redrawOverlay]);

    const allPins = [...pins, ...userPins];

    function nearExistingPin(sx: number, sy: number) {
      for (const p of allPins) {
        if (distanceSq(sx, sy, p.x, p.y) <= PIN_HIT_PX * PIN_HIT_PX) return true;
      }
      return false;
    }

    const onContainerPointerDown = (e: React.PointerEvent) => {
      if (e.button !== 0) return;
      const c = containerRef.current;
      if (!c || !sheet) return;

      if (tool === "pan" || tool === "layers") {
        e.preventDefault();
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
        setIsPanning(true);
        panDrag.current = {
          on: true,
          sx: e.clientX,
          sy: e.clientY,
          spx: pRef.current.x,
          spy: pRef.current.y,
        };
        return;
      }

      if (tool === "measure") {
        e.preventDefault();
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
        const { x, y } = clientToSheet(e.clientX, e.clientY, c, pRef.current, zRef.current);
        measureDragRef.current = true;
        setMeasureDraft({ x1: x, y1: y, x2: x, y2: y });
        return;
      }

      if (tool === "pin") {
        pinPointerRef.current = {
          down: true,
          sx: e.clientX,
          sy: e.clientY,
          moved: false,
        };
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
        return;
      }

      if (tool === "select") {
        setSelectedPinId(null);
      }
    };

    const onContainerPointerMove = (e: React.PointerEvent) => {
      const c = containerRef.current;
      if (!c) return;

      if (panDrag.current.on) {
        const np = {
          x: panDrag.current.spx + e.clientX - panDrag.current.sx,
          y: panDrag.current.spy + e.clientY - panDrag.current.sy,
        };
        pRef.current = np;
        setPan(np);
        return;
      }

      if (tool === "measure" && measureDragRef.current) {
        const { x, y } = clientToSheet(e.clientX, e.clientY, c, pRef.current, zRef.current);
        setMeasureDraft((d) =>
          d ? { ...d, x2: x, y2: y } : d,
        );
        return;
      }

      if (tool === "pin" && pinPointerRef.current?.down) {
        const dx = e.clientX - pinPointerRef.current.sx;
        const dy = e.clientY - pinPointerRef.current.sy;
        if (dx * dx + dy * dy > CLICK_MAX_MOVE * CLICK_MAX_MOVE) {
          pinPointerRef.current.moved = true;
        }
      }
    };

    const onContainerPointerUp = (e: React.PointerEvent) => {
      const c = containerRef.current;
      if (panDrag.current.on) {
        panDrag.current.on = false;
        setIsPanning(false);
        try {
          (e.target as HTMLElement).releasePointerCapture(e.pointerId);
        } catch {
          /* ignore */
        }
        return;
      }

      if (tool === "measure" && measureDragRef.current && measureDraft && c) {
        measureDragRef.current = false;
        const { x, y } = clientToSheet(e.clientX, e.clientY, c, pRef.current, zRef.current);
        const line = { ...measureDraft, x2: x, y2: y };
        setMeasureDraft(null);
        const len = Math.hypot(line.x2 - line.x1, line.y2 - line.y1);
        if (len >= 4) {
          setMeasureLine(line);
        }
        try {
          (e.target as HTMLElement).releasePointerCapture(e.pointerId);
        } catch {
          /* ignore */
        }
        return;
      }

      if (tool === "pin" && pinPointerRef.current?.down && c) {
        const pr = pinPointerRef.current;
        pinPointerRef.current = null;
        try {
          (e.target as HTMLElement).releasePointerCapture(e.pointerId);
        } catch {
          /* ignore */
        }
        if (pr.moved) return;
        const { x, y } = clientToSheet(e.clientX, e.clientY, c, pRef.current, zRef.current);
        if (x < 0 || y < 0 || x > sheet!.w || y > sheet!.h) return;
        if (nearExistingPin(x, y)) return;
        const n = userPinSeq.current++;
        setUserPins((prev) => [
          ...prev,
          {
            id: `user-pin-${n}`,
            label: `+${prev.length + 1}`,
            x,
            y,
            status: "open",
          },
        ]);
      }
    };

    const onContainerPointerCancel = () => {
      panDrag.current.on = false;
      setIsPanning(false);
      measureDragRef.current = false;
      setMeasureDraft(null);
      pinPointerRef.current = null;
    };

    const onMarkupPointerDown = (e: React.PointerEvent) => {
      if (e.button !== 0 || tool !== "markup" || !sheet) return;
      e.preventDefault();
      e.stopPropagation();
      const c = containerRef.current;
      if (!c) return;
      const { x, y } = clientToSheet(e.clientX, e.clientY, c, pRef.current, zRef.current);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      setMarkupCurrent([[x, y]]);
    };

    const onMarkupPointerMove = (e: React.PointerEvent) => {
      if (tool !== "markup" || !markupCurrent) return;
      e.preventDefault();
      e.stopPropagation();
      const c = containerRef.current;
      if (!c) return;
      const { x, y } = clientToSheet(e.clientX, e.clientY, c, pRef.current, zRef.current);
      setMarkupCurrent((prev) => (prev ? [...prev, [x, y]] : prev));
    };

    const onMarkupPointerUp = (e: React.PointerEvent) => {
      if (tool !== "markup" || !markupCurrent) return;
      e.preventDefault();
      e.stopPropagation();
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
      if (markupCurrent.length >= 2) {
        setMarkupStrokes((s) => [...s, { points: markupCurrent }]);
      }
      setMarkupCurrent(null);
    };

    useImperativeHandle(
      ref,
      () => ({
        zoomIn: () => zoomCenter(zRef.current * 1.25),
        zoomOut: () => zoomCenter(zRef.current / 1.25),
        fitToView: () => fit(),
        getZoomPercent: () => Math.round(zRef.current * 100),
      }),
      [zoomCenter, fit],
    );

    const cursor =
      tool === "pan" || tool === "layers"
        ? isPanning
          ? "grabbing"
          : "grab"
        : tool === "select"
          ? "default"
          : "crosshair";

    const containerPointer =
      tool === "pan" ||
      tool === "layers" ||
      tool === "measure" ||
      tool === "pin" ||
      tool === "select";

    const onTaskDragOver = (e: React.DragEvent) => {
      const types = Array.from(e.dataTransfer.types);
      const isTask = types.includes(BUILDWIRE_TASK_DRAG_TYPE);
      e.preventDefault();
      if (isTask) {
        e.dataTransfer.dropEffect = "copy";
        setTaskDropHover(true);
      } else {
        e.dataTransfer.dropEffect = "none";
      }
    };

    const onTaskDragLeave = (e: React.DragEvent) => {
      const next = e.relatedTarget as Node | null;
      if (!next || !e.currentTarget.contains(next)) {
        setTaskDropHover(false);
      }
    };

    const onTaskDrop = (e: React.DragEvent) => {
      e.preventDefault();
      setTaskDropHover(false);
      const c = containerRef.current;
      if (!c || !sheet) return;
      const raw = e.dataTransfer.getData(BUILDWIRE_TASK_DRAG_TYPE);
      const payload = parseTaskDragPayload(raw);
      if (!payload) return;
      const { x, y } = clientToSheet(e.clientX, e.clientY, c, pRef.current, zRef.current);
      if (x < 0 || y < 0 || x > sheet.w || y > sheet.h) return;
      setUserPins((prev) => {
        const next = prev.filter((p) => p.taskId !== payload.taskId);
        next.push({
          id: `task-pin-${payload.taskId}`,
          label: payload.number,
          x,
          y,
          status: payload.status,
          taskId: payload.taskId,
        });
        return next;
      });
    };

    return (
      <div
        className={`relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg bg-muted/10 ${className}`}
      >
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-bg/50 text-sm text-secondary">
            Loading sheet…
          </div>
        )}
        {err && (
          <div className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
            {err}
          </div>
        )}
        {!err && sheet && (
          <div
            ref={containerRef}
            className={`relative min-h-[min(280px,40vh)] flex-1 overflow-hidden transition-shadow ${
              taskDropHover ? "ring-2 ring-inset ring-brand/50" : ""
            }`}
            style={{ cursor }}
            onPointerDown={containerPointer ? onContainerPointerDown : undefined}
            onPointerMove={containerPointer ? onContainerPointerMove : undefined}
            onPointerUp={containerPointer ? onContainerPointerUp : undefined}
            onPointerCancel={onContainerPointerCancel}
            onDragOver={onTaskDragOver}
            onDragLeave={onTaskDragLeave}
            onDrop={onTaskDrop}
          >
            <div
              className="absolute left-0 top-0 origin-top-left will-change-transform"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              }}
            >
              <div
                className="relative"
                style={{ width: sheet.w, height: sheet.h }}
              >
                {layerVisibility.sheet ? (
                  <img
                    src={sheet.src}
                    alt=""
                    width={sheet.w}
                    height={sheet.h}
                    className="block max-w-none select-none rounded-sm shadow-sm ring-1 ring-border/40"
                    draggable={false}
                  />
                ) : (
                  <div
                    className="flex items-center justify-center rounded-sm bg-muted/30 ring-1 ring-border/40"
                    style={{ width: sheet.w, height: sheet.h }}
                  >
                    <span className="text-xs text-muted">Sheet hidden</span>
                  </div>
                )}
                <canvas
                  ref={strokeCanvasRef}
                  className={`absolute left-0 top-0 ${
                    tool === "markup"
                      ? "pointer-events-auto z-[5]"
                      : "pointer-events-none z-[1]"
                  }`}
                  width={sheet.w}
                  height={sheet.h}
                  onPointerDown={onMarkupPointerDown}
                  onPointerMove={onMarkupPointerMove}
                  onPointerUp={onMarkupPointerUp}
                />
                {layerVisibility.pins &&
                  allPins.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      tabIndex={tool === "select" ? 0 : -1}
                      className={`absolute -translate-x-1/2 -translate-y-full rounded-md px-1.5 py-0.5 font-mono text-[10px] font-bold shadow-md transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 ${pinClass(
                        p.status,
                      )} ${
                        tool === "select"
                          ? "pointer-events-auto z-[6] cursor-pointer"
                          : "pointer-events-none z-[4]"
                      } ${selectedPinId === p.id ? "ring-2 ring-brand ring-offset-1 ring-offset-transparent" : ""}`}
                      style={{ left: p.x, top: p.y }}
                      onPointerDown={(e) => {
                        if (tool !== "select") return;
                        e.stopPropagation();
                      }}
                      onClick={(e) => {
                        if (tool !== "select") return;
                        e.stopPropagation();
                        setSelectedPinId(p.id);
                      }}
                    >
                      {p.label}
                    </button>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  },
);
