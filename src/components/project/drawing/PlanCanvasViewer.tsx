import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import type {
  AnnotationStyle,
  DrawingViewerToolId,
  LayerVisibility,
} from "./DrawingViewerToolbar";
import {
  BUILDWIRE_TASK_DRAG_TYPE,
  parseTaskDragPayload,
} from "@/utils/project/taskDrag";
import {
  isImage,
  isPdf,
  rasterizePdfPageToDataUrl,
  resolvePlanFileUrl,
} from "@/utils/project/planPdf";

/* ─────────────────────────────────────────────────── Constants ── */
const MIN_ZOOM = 0.05;
const MAX_ZOOM = 12;
const PIN_HIT_PX = 28;
const CLICK_MAX_MOVE = 6;
const ERASER_RADIUS = 24;

/* ────────────────────────────────────────── Annotation types ── */
type BaseAnnotation = {
  id: string;
  color: string;
  strokeWidth: number;
  fill: boolean;
};

type FreehandAnnotation = BaseAnnotation & {
  kind: "freehand";
  points: [number, number][];
};
type LineAnnotation = BaseAnnotation & {
  kind: "line";
  x1: number; y1: number; x2: number; y2: number;
};
type ArrowAnnotation = BaseAnnotation & {
  kind: "arrow";
  x1: number; y1: number; x2: number; y2: number;
};
type RectAnnotation = BaseAnnotation & {
  kind: "rect";
  x: number; y: number; w: number; h: number;
};
type EllipseAnnotation = BaseAnnotation & {
  kind: "ellipse";
  cx: number; cy: number; rx: number; ry: number;
};
type CloudAnnotation = BaseAnnotation & {
  kind: "cloud";
  x: number; y: number; w: number; h: number;
};
type TextAnnotation = BaseAnnotation & {
  kind: "text";
  x: number; y: number; text: string; fontSize: number;
};
type MeasureAnnotation = BaseAnnotation & {
  kind: "measure";
  x1: number; y1: number; x2: number; y2: number;
};

export type Annotation =
  | FreehandAnnotation
  | LineAnnotation
  | ArrowAnnotation
  | RectAnnotation
  | EllipseAnnotation
  | CloudAnnotation
  | TextAnnotation
  | MeasureAnnotation;

type DraftAnnotation =
  | { kind: "freehand"; points: [number, number][] }
  | { kind: "line" | "arrow" | "rect" | "ellipse" | "cloud" | "measure"; x1: number; y1: number; x2: number; y2: number };

/* ────────────────────────────────────────── Pin types ── */
export type PlanCanvasPin = {
  id: string;
  label: string;
  x: number;
  y: number;
  status: string;
  taskId?: string;
};

/* ────────────────────────────────────── Handle type ── */
export type PlanCanvasViewerHandle = {
  zoomIn: () => void;
  zoomOut: () => void;
  fitToView: () => void;
  getZoomPercent: () => number;
  undo: () => void;
  redo: () => void;
  clearAnnotations: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
};

/* ────────────────────────────────────── Props ── */
type PlanCanvasViewerProps = {
  fileUrl: string;
  fileName?: string | null;
  pdfRenderScale?: number;
  pageNumber?: number;
  pins?: PlanCanvasPin[];
  className?: string;
  onViewportChange?: (v: { zoomPercent: number }) => void;
  tool?: DrawingViewerToolId;
  layerVisibility?: LayerVisibility;
  annotationStyle?: AnnotationStyle;
  onUserPinsChange?: (pins: PlanCanvasPin[]) => void;
  onAnnotationsChange?: (annotations: Annotation[]) => void;
  onPageCountChange?: (totalPages: number) => void;
};

const defaultLayers: LayerVisibility = {
  sheet: true,
  pins: true,
  markup: true,
};

const defaultStyle: AnnotationStyle = {
  color: "#EF4444",
  strokeWidth: 2,
  fill: false,
};

/* ────────────────────────────────────── Pin styles ── */
const STATUS_PIN_STYLES: Record<string, string> = {
  open:                "bg-zinc-800 text-white ring-1 ring-zinc-950/25 shadow-md dark:bg-zinc-700",
  in_progress:         "bg-brand text-white ring-1 ring-brand/30 shadow-md",
  in_review:           "bg-amber-500 text-zinc-950 ring-1 ring-amber-600/40 shadow-md",
  blocked:             "bg-red-600 text-white ring-1 ring-red-900/30 shadow-md",
  awaiting_inspection: "bg-slate-600 text-white ring-1 ring-slate-900/25 shadow-md",
  completed:           "bg-emerald-600 text-white ring-1 ring-emerald-900/30 shadow-md",
  closed:              "bg-zinc-500 text-white ring-1 ring-zinc-800/30 shadow-md",
};

function pinClass(status: string) {
  return STATUS_PIN_STYLES[status] ?? STATUS_PIN_STYLES.open;
}

/* ────────────────────────────────────── Utilities ── */
function clientToSheet(
  clientX: number,
  clientY: number,
  container: HTMLElement,
  pan: { x: number; y: number },
  zoom: number,
) {
  const r = container.getBoundingClientRect();
  return {
    x: (clientX - r.left - pan.x) / zoom,
    y: (clientY - r.top - pan.y) / zoom,
  };
}

function distanceSq(ax: number, ay: number, bx: number, by: number) {
  return (ax - bx) ** 2 + (ay - by) ** 2;
}

function makeDraftRect(x1: number, y1: number, x2: number, y2: number) {
  return { x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.abs(x2 - x1), h: Math.abs(y2 - y1) };
}

let _annId = 1;
function nextAnnotationId() {
  return `ann-${++_annId}`;
}

/* ────────────────────────────────────── Canvas draw helpers ── */

function drawFreehand(ctx: CanvasRenderingContext2D, pts: [number, number][], color: string, width: number) {
  if (pts.length < 2) return;
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.stroke();
}

function drawArrowHead(
  ctx: CanvasRenderingContext2D,
  x1: number, y1: number, x2: number, y2: number,
  size: number,
) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - size * Math.cos(angle - Math.PI / 7), y2 - size * Math.sin(angle - Math.PI / 7));
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - size * Math.cos(angle + Math.PI / 7), y2 - size * Math.sin(angle + Math.PI / 7));
  ctx.stroke();
}

function drawCloudPath(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
) {
  const arcSize = Math.min(28, Math.max(10, Math.min(w, h) / 5));
  const nH = Math.max(2, Math.round(w / (arcSize * 2)));
  const nV = Math.max(2, Math.round(h / (arcSize * 2)));
  const rH = w / (nH * 2);
  const rV = h / (nV * 2);

  ctx.beginPath();
  ctx.moveTo(x, y + h);

  // Bottom: left → right, bumps DOWN
  for (let i = 0; i < nH; i++)
    ctx.arc(x + rH * (2 * i + 1), y + h, rH, Math.PI, 0, false);
  // Right: top → bottom, bumps RIGHT
  for (let i = 0; i < nV; i++)
    ctx.arc(x + w, y + h - rV * (2 * i + 1), rV, Math.PI / 2, -Math.PI / 2, false);
  // Top: right → left, bumps UP
  for (let i = 0; i < nH; i++)
    ctx.arc(x + w - rH * (2 * i + 1), y, rH, 0, Math.PI, true);
  // Left: bottom → top, bumps LEFT
  for (let i = 0; i < nV; i++)
    ctx.arc(x, y + rV * (2 * i + 1), rV, -Math.PI / 2, Math.PI / 2, true);

  ctx.closePath();
}

function applyStrokeStyle(
  ctx: CanvasRenderingContext2D,
  color: string,
  width: number,
  fill: boolean,
) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  if (fill) {
    ctx.fillStyle = color + "30"; // 19% opacity
  }
}

function drawAnnotation(ctx: CanvasRenderingContext2D, ann: Annotation) {
  ctx.save();
  applyStrokeStyle(ctx, ann.color, ann.strokeWidth, ann.fill);

  switch (ann.kind) {
    case "freehand":
      drawFreehand(ctx, ann.points, ann.color, ann.strokeWidth);
      break;

    case "line":
      ctx.beginPath();
      ctx.moveTo(ann.x1, ann.y1);
      ctx.lineTo(ann.x2, ann.y2);
      ctx.stroke();
      break;

    case "arrow": {
      ctx.beginPath();
      ctx.moveTo(ann.x1, ann.y1);
      ctx.lineTo(ann.x2, ann.y2);
      ctx.stroke();
      const headSize = Math.max(12, ann.strokeWidth * 5);
      drawArrowHead(ctx, ann.x1, ann.y1, ann.x2, ann.y2, headSize);
      break;
    }

    case "rect": {
      ctx.beginPath();
      ctx.rect(ann.x, ann.y, ann.w, ann.h);
      if (ann.fill) ctx.fill();
      ctx.stroke();
      break;
    }

    case "ellipse": {
      ctx.beginPath();
      ctx.ellipse(ann.cx, ann.cy, Math.abs(ann.rx), Math.abs(ann.ry), 0, 0, Math.PI * 2);
      if (ann.fill) ctx.fill();
      ctx.stroke();
      break;
    }

    case "cloud": {
      drawCloudPath(ctx, ann.x, ann.y, ann.w, ann.h);
      if (ann.fill) ctx.fill();
      ctx.stroke();
      break;
    }

    case "text": {
      const font = `bold ${ann.fontSize}px ui-sans-serif, system-ui, sans-serif`;
      ctx.font = font;
      ctx.fillStyle = ann.color;
      ctx.textBaseline = "top";
      ctx.fillText(ann.text, ann.x, ann.y);
      break;
    }

    case "measure": {
      ctx.strokeStyle = ann.color;
      ctx.lineWidth = ann.strokeWidth;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(ann.x1, ann.y1);
      ctx.lineTo(ann.x2, ann.y2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Tick marks
      const angle = Math.atan2(ann.y2 - ann.y1, ann.x2 - ann.x1);
      const perp = angle + Math.PI / 2;
      const tk = 8;
      for (const [px, py] of [[ann.x1, ann.y1], [ann.x2, ann.y2]] as [number, number][]) {
        ctx.beginPath();
        ctx.moveTo(px - Math.cos(perp) * tk, py - Math.sin(perp) * tk);
        ctx.lineTo(px + Math.cos(perp) * tk, py + Math.sin(perp) * tk);
        ctx.stroke();
      }

      const len = Math.hypot(ann.x2 - ann.x1, ann.y2 - ann.y1);
      const mx = (ann.x1 + ann.x2) / 2;
      const my = (ann.y1 + ann.y2) / 2;
      ctx.font = `bold 13px ui-sans-serif, system-ui, sans-serif`;
      ctx.fillStyle = ann.color;
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.strokeStyle = "white";
      ctx.lineWidth = 3;
      ctx.strokeText(`${len.toFixed(0)}px`, mx, my - 6);
      ctx.fillText(`${len.toFixed(0)}px`, mx, my - 6);
      break;
    }
  }

  ctx.restore();
}

function drawDraftAnnotation(
  ctx: CanvasRenderingContext2D,
  draft: DraftAnnotation,
  style: AnnotationStyle,
) {
  ctx.save();
  ctx.globalAlpha = 0.65;
  applyStrokeStyle(ctx, style.color, style.strokeWidth, style.fill);

  switch (draft.kind) {
    case "freehand":
      drawFreehand(ctx, draft.points, style.color, style.strokeWidth);
      break;
    case "line":
      ctx.beginPath();
      ctx.moveTo(draft.x1, draft.y1);
      ctx.lineTo(draft.x2, draft.y2);
      ctx.stroke();
      break;
    case "arrow": {
      ctx.beginPath();
      ctx.moveTo(draft.x1, draft.y1);
      ctx.lineTo(draft.x2, draft.y2);
      ctx.stroke();
      drawArrowHead(ctx, draft.x1, draft.y1, draft.x2, draft.y2, Math.max(12, style.strokeWidth * 5));
      break;
    }
    case "rect": {
      const { x, y, w, h } = makeDraftRect(draft.x1, draft.y1, draft.x2, draft.y2);
      ctx.beginPath();
      ctx.rect(x, y, w, h);
      if (style.fill) ctx.fill();
      ctx.stroke();
      break;
    }
    case "ellipse": {
      const cx = (draft.x1 + draft.x2) / 2;
      const cy = (draft.y1 + draft.y2) / 2;
      const rx = Math.abs(draft.x2 - draft.x1) / 2;
      const ry = Math.abs(draft.y2 - draft.y1) / 2;
      ctx.beginPath();
      ctx.ellipse(cx, cy, Math.max(1, rx), Math.max(1, ry), 0, 0, Math.PI * 2);
      if (style.fill) ctx.fill();
      ctx.stroke();
      break;
    }
    case "cloud": {
      const { x, y, w, h } = makeDraftRect(draft.x1, draft.y1, draft.x2, draft.y2);
      if (w > 4 && h > 4) {
        drawCloudPath(ctx, x, y, w, h);
        if (style.fill) ctx.fill();
        ctx.stroke();
      }
      break;
    }
    case "measure": {
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(draft.x1, draft.y1);
      ctx.lineTo(draft.x2, draft.y2);
      ctx.stroke();
      ctx.setLineDash([]);
      const len = Math.hypot(draft.x2 - draft.x1, draft.y2 - draft.y1);
      const mx = (draft.x1 + draft.x2) / 2;
      const my = (draft.y1 + draft.y2) / 2;
      ctx.font = "bold 13px ui-sans-serif, system-ui, sans-serif";
      ctx.fillStyle = style.color;
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.fillText(`${len.toFixed(0)}px`, mx, my - 6);
      break;
    }
  }

  ctx.restore();
}

/* ────────────────────────────────────────── Hit detection ── */
function hitTestAnnotation(ann: Annotation, x: number, y: number, tol: number): boolean {
  switch (ann.kind) {
    case "freehand": {
      for (let i = 0; i < ann.points.length - 1; i++) {
        const [ax, ay] = ann.points[i];
        const [bx, by] = ann.points[i + 1];
        // Point-to-segment distance
        const dx = bx - ax; const dy = by - ay;
        const lenSq = dx * dx + dy * dy;
        if (lenSq === 0) {
          if (distanceSq(x, y, ax, ay) < tol * tol) return true;
          continue;
        }
        const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / lenSq));
        if (distanceSq(x, y, ax + t * dx, ay + t * dy) < tol * tol) return true;
      }
      return false;
    }
    case "line":
    case "arrow":
    case "measure": {
      const dx = ann.x2 - ann.x1; const dy = ann.y2 - ann.y1;
      const lenSq = dx * dx + dy * dy;
      if (lenSq === 0) return distanceSq(x, y, ann.x1, ann.y1) < tol * tol;
      const t = Math.max(0, Math.min(1, ((x - ann.x1) * dx + (y - ann.y1) * dy) / lenSq));
      return distanceSq(x, y, ann.x1 + t * dx, ann.y1 + t * dy) < tol * tol;
    }
    case "rect":
    case "cloud":
      return x >= ann.x - tol && x <= ann.x + ann.w + tol &&
             y >= ann.y - tol && y <= ann.y + ann.h + tol;
    case "ellipse":
      return (((x - ann.cx) / (ann.rx + tol)) ** 2 + ((y - ann.cy) / (ann.ry + tol)) ** 2) <= 1;
    case "text":
      return distanceSq(x, y, ann.x, ann.y) < (tol * 4) ** 2;
    default:
      return false;
  }
}

/* ══════════════════════════════════════════ Component ══════════════════════════════════════════ */

export const PlanCanvasViewer = forwardRef<PlanCanvasViewerHandle, PlanCanvasViewerProps>(
  function PlanCanvasViewer(
    {
      fileUrl,
      fileName,
      pdfRenderScale = 2,
      pageNumber = 1,
      pins = [],
      className = "",
      onViewportChange,
      tool = "pan",
      layerVisibility = defaultLayers,
      annotationStyle = defaultStyle,
      onUserPinsChange,
      onAnnotationsChange,
      onPageCountChange,
    },
    ref,
  ) {
    const resolved = resolvePlanFileUrl(fileUrl) ?? fileUrl;

    /* ── Viewport ── */
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const zRef = useRef(zoom);
    const pRef = useRef(pan);
    zRef.current = zoom;
    pRef.current = pan;

    /* ── Sheet ── */
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);
    const [sheet, setSheet] = useState<{ src: string; w: number; h: number } | null>(null);
    const [totalPages, setTotalPages] = useState(1);
    const dim = useRef({ w: 0, h: 0 });

    /* ── Interaction refs ── */
    const containerRef = useRef<HTMLDivElement>(null);
    const strokeCanvasRef = useRef<HTMLCanvasElement>(null);
    const panDrag = useRef({ on: false, sx: 0, sy: 0, spx: 0, spy: 0 });
    const [isPanning, setIsPanning] = useState(false);

    /* ── Pins ── */
    const [selectedPinId, setSelectedPinId] = useState<string | null>(null);
    const [userPins, setUserPins] = useState<PlanCanvasPin[]>([]);
    const userPinSeq = useRef(1);
    const pinPointerRef = useRef<{ down: boolean; sx: number; sy: number; moved: boolean } | null>(null);
    const [taskDropHover, setTaskDropHover] = useState(false);

    /* ── Annotations ── */
    const [annotations, setAnnotations] = useState<Annotation[]>([]);
    const [draft, setDraft] = useState<DraftAnnotation | null>(null);
    const draftRef = useRef<DraftAnnotation | null>(null);
    draftRef.current = draft;

    /* ── Undo / Redo history ── */
    const historyRef = useRef<Annotation[][]>([[]]); // stack of annotation arrays
    const historyIdxRef = useRef(0);

    /* ── Text input overlay ── */
    const [textOverlay, setTextOverlay] = useState<{
      sheetX: number;
      sheetY: number;
      cssX: number;
      cssY: number;
    } | null>(null);
    const textInputRef = useRef<HTMLInputElement>(null);

    /* ── Helpers ── */
    const notifyViewport = useCallback(() => {
      onViewportChange?.({ zoomPercent: Math.round(zRef.current * 100) });
    }, [onViewportChange]);

    useEffect(() => { notifyViewport(); }, [zoom, notifyViewport]);

    const fit = useCallback(() => {
      const c = containerRef.current;
      const { w, h } = dim.current;
      if (!c || !w || !h) return;
      const r = c.getBoundingClientRect();
      const z = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.min(r.width / w, r.height / h) * 0.96));
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

    const zoomCenter = useCallback((nz: number) => {
      const c = containerRef.current;
      if (!c) return;
      const r = c.getBoundingClientRect();
      zoomAt(nz, r.width / 2, r.height / 2);
    }, [zoomAt]);

    /* ── History helpers ── */
    const pushHistory = useCallback((next: Annotation[]) => {
      const idx = historyIdxRef.current;
      historyRef.current = [...historyRef.current.slice(0, idx + 1), next];
      historyIdxRef.current = historyRef.current.length - 1;
      setAnnotations(next);
      onAnnotationsChange?.(next);
    }, [onAnnotationsChange]);

    const undo = useCallback(() => {
      const idx = historyIdxRef.current;
      if (idx <= 0) return;
      historyIdxRef.current = idx - 1;
      const prev = historyRef.current[historyIdxRef.current]!;
      setAnnotations(prev);
      onAnnotationsChange?.(prev);
    }, [onAnnotationsChange]);

    const redo = useCallback(() => {
      const idx = historyIdxRef.current;
      if (idx >= historyRef.current.length - 1) return;
      historyIdxRef.current = idx + 1;
      const next = historyRef.current[historyIdxRef.current]!;
      setAnnotations(next);
      onAnnotationsChange?.(next);
    }, [onAnnotationsChange]);

    const clearAnnotations = useCallback(() => {
      pushHistory([]);
    }, [pushHistory]);

    /* ── Sheet loading ── */
    useEffect(() => {
      let cancelled = false;
      setLoading(true);
      setErr(null);
      setSheet(null);

      (async () => {
        try {
          if (isPdf(resolved, fileName ?? undefined)) {
            const { dataUrl, width, height, totalPages: tp } = await rasterizePdfPageToDataUrl(
              resolved, pdfRenderScale, pageNumber,
            );
            if (cancelled) return;
            dim.current = { w: width, h: height };
            setTotalPages(tp);
            onPageCountChange?.(tp);
            setSheet({ src: dataUrl, w: width, h: height });
          } else if (isImage(resolved, fileName ?? undefined)) {
            await new Promise<void>((resolve, reject) => {
              const img = new Image();
              img.crossOrigin = "anonymous";
              img.onload = () => {
                if (cancelled) return;
                const w = img.naturalWidth || 1200;
                const h = img.naturalHeight || 900;
                dim.current = { w, h };
                setSheet({ src: resolved, w, h });
                setTotalPages(1);
                resolve();
              };
              img.onerror = () => reject(new Error("Failed to load image"));
              img.src = resolved;
            });
          } else {
            throw new Error("Unsupported file type (use PDF or image)");
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

      return () => { cancelled = true; };
    }, [resolved, fileName, pdfRenderScale, pageNumber]);

    useEffect(() => {
      if (!sheet || loading) return;
      requestAnimationFrame(() => fit());
    }, [sheet, loading, fit]);

    /* ── Mouse-wheel zoom ── */
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
        const nz = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, oz * Math.pow(2, -d * 0.0015)));
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

    /* ── Canvas size sync ── */
    useEffect(() => {
      const cv = strokeCanvasRef.current;
      if (!cv || !sheet) return;
      cv.width = sheet.w;
      cv.height = sheet.h;
    }, [sheet]);

    /* ── Canvas redraw ── */
    const redrawOverlay = useCallback(() => {
      const cv = strokeCanvasRef.current;
      if (!cv || !sheet) return;
      const ctx = cv.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, sheet.w, sheet.h);

      if (!layerVisibility.markup) return;

      // Committed annotations
      for (const ann of annotations) {
        drawAnnotation(ctx, ann);
      }

      // Draft (in-progress)
      if (draft) {
        drawDraftAnnotation(ctx, draft, annotationStyle);
      }
    }, [sheet, layerVisibility.markup, annotations, draft, annotationStyle]);

    useEffect(() => { redrawOverlay(); }, [redrawOverlay]);

    /* ── Notify user pins ── */
    useEffect(() => {
      onUserPinsChange?.(userPins);
    }, [userPins, onUserPinsChange]);

    const allPins = [...pins, ...userPins];

    function nearExistingPin(sx: number, sy: number) {
      for (const p of allPins) {
        if (distanceSq(sx, sy, p.x, p.y) <= PIN_HIT_PX * PIN_HIT_PX) return true;
      }
      return false;
    }

    /* ────────────────────── Text overlay commit ── */
    const commitText = useCallback((text: string, sheetX: number, sheetY: number) => {
      if (!text.trim()) return;
      const ann: TextAnnotation = {
        id: nextAnnotationId(),
        kind: "text",
        x: sheetX,
        y: sheetY,
        text: text.trim(),
        fontSize: Math.max(12, 14 / zRef.current),
        color: annotationStyle.color,
        strokeWidth: annotationStyle.strokeWidth,
        fill: false,
      };
      pushHistory([...historyRef.current[historyIdxRef.current]!, ann]);
      setTextOverlay(null);
    }, [annotationStyle, pushHistory]);

    /* ────────────────────── Pointer handlers ── */

    const onContainerPointerDown = useCallback((e: React.PointerEvent) => {
      if (e.button !== 0) return;
      const c = containerRef.current;
      if (!c || !sheet) return;

      // Close text overlay if clicking elsewhere
      if (textOverlay) {
        const txt = textInputRef.current?.value ?? "";
        commitText(txt, textOverlay.sheetX, textOverlay.sheetY);
        return;
      }

      const sp = clientToSheet(e.clientX, e.clientY, c, pRef.current, zRef.current);

      /* Pan */
      if (tool === "pan" || tool === "layers") {
        e.preventDefault();
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
        setIsPanning(true);
        panDrag.current = { on: true, sx: e.clientX, sy: e.clientY, spx: pRef.current.x, spy: pRef.current.y };
        return;
      }

      /* Select + erase */
      if (tool === "select") {
        setSelectedPinId(null);
        return;
      }

      if (tool === "eraser") {
        e.preventDefault();
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
        const tol = ERASER_RADIUS / zRef.current;
        const next = (historyRef.current[historyIdxRef.current] ?? []).filter(
          (ann) => !hitTestAnnotation(ann, sp.x, sp.y, tol),
        );
        pushHistory(next);
        return;
      }

      /* Pin */
      if (tool === "pin") {
        pinPointerRef.current = { down: true, sx: e.clientX, sy: e.clientY, moved: false };
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
        return;
      }

      /* Text */
      if (tool === "text") {
        const r = c.getBoundingClientRect();
        const cssX = e.clientX - r.left;
        const cssY = e.clientY - r.top;
        setTextOverlay({ sheetX: sp.x, sheetY: sp.y, cssX, cssY });
        setTimeout(() => textInputRef.current?.focus(), 50);
        return;
      }

      /* Drawing tools: freehand / line / arrow / rect / ellipse / cloud / measure */
      e.preventDefault();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);

      if (tool === "freehand") {
        const d: DraftAnnotation = { kind: "freehand", points: [[sp.x, sp.y]] };
        setDraft(d);
      } else if (["line", "arrow", "rect", "ellipse", "cloud", "measure"].includes(tool)) {
        const d: DraftAnnotation = {
          kind: tool as "line" | "arrow" | "rect" | "ellipse" | "cloud" | "measure",
          x1: sp.x, y1: sp.y, x2: sp.x, y2: sp.y,
        };
        setDraft(d);
      }
    }, [tool, sheet, textOverlay, commitText, pushHistory]);

    const onContainerPointerMove = useCallback((e: React.PointerEvent) => {
      const c = containerRef.current;
      if (!c) return;

      /* Pan */
      if (panDrag.current.on) {
        const np = {
          x: panDrag.current.spx + e.clientX - panDrag.current.sx,
          y: panDrag.current.spy + e.clientY - panDrag.current.sy,
        };
        pRef.current = np;
        setPan(np);
        return;
      }

      /* Pin drag detect */
      if (tool === "pin" && pinPointerRef.current?.down) {
        const dx = e.clientX - pinPointerRef.current.sx;
        const dy = e.clientY - pinPointerRef.current.sy;
        if (dx * dx + dy * dy > CLICK_MAX_MOVE * CLICK_MAX_MOVE) pinPointerRef.current.moved = true;
        return;
      }

      /* Freehand */
      if (draft?.kind === "freehand") {
        const sp = clientToSheet(e.clientX, e.clientY, c, pRef.current, zRef.current);
        setDraft((d) => d?.kind === "freehand" ? { ...d, points: [...d.points, [sp.x, sp.y]] } : d);
        return;
      }

      /* Shape drag */
      if (draft) {
        const sp = clientToSheet(e.clientX, e.clientY, c, pRef.current, zRef.current);
        setDraft((d) => d && d.kind !== "freehand" ? { ...d, x2: sp.x, y2: sp.y } : d);
        return;
      }

      /* Eraser move */
      if (tool === "eraser" && e.buttons === 1) {
        const sp = clientToSheet(e.clientX, e.clientY, c, pRef.current, zRef.current);
        const tol = ERASER_RADIUS / zRef.current;
        const cur = historyRef.current[historyIdxRef.current] ?? [];
        const next = cur.filter((ann) => !hitTestAnnotation(ann, sp.x, sp.y, tol));
        if (next.length !== cur.length) {
          // Update without creating undo step (erase is one undoable op — push on pointerup)
          setAnnotations(next);
        }
      }
    }, [tool, draft]);

    const onContainerPointerUp = useCallback((e: React.PointerEvent) => {
      const c = containerRef.current;
      try { (e.target as HTMLElement).releasePointerCapture(e.pointerId); } catch { /* ignore */ }

      /* Pan */
      if (panDrag.current.on) {
        panDrag.current.on = false;
        setIsPanning(false);
        return;
      }

      /* Pin place */
      if (tool === "pin" && pinPointerRef.current?.down && c && sheet) {
        const pr = pinPointerRef.current;
        pinPointerRef.current = null;
        if (pr.moved) return;
        const sp = clientToSheet(e.clientX, e.clientY, c, pRef.current, zRef.current);
        if (sp.x < 0 || sp.y < 0 || sp.x > sheet.w || sp.y > sheet.h) return;
        if (nearExistingPin(sp.x, sp.y)) return;
        const n = userPinSeq.current++;
        setUserPins((prev) => [...prev, { id: `user-pin-${n}`, label: `+${prev.length + 1}`, x: sp.x, y: sp.y, status: "open" }]);
        return;
      }

      /* Eraser — finalise into history */
      if (tool === "eraser" && e.buttons === 0) {
        const cur = historyRef.current[historyIdxRef.current] ?? [];
        if (annotations.length !== cur.length) {
          pushHistory([...annotations]);
        }
        return;
      }

      if (!draft) return;

      /* Freehand commit */
      if (draft.kind === "freehand" && draft.points.length >= 2) {
        const ann: FreehandAnnotation = {
          id: nextAnnotationId(),
          kind: "freehand",
          points: draft.points,
          color: annotationStyle.color,
          strokeWidth: annotationStyle.strokeWidth,
          fill: annotationStyle.fill,
        };
        pushHistory([...(historyRef.current[historyIdxRef.current] ?? []), ann]);
      }

      /* Line commit */
      if (draft.kind === "line") {
        const len = Math.hypot(draft.x2 - draft.x1, draft.y2 - draft.y1);
        if (len >= 4) {
          pushHistory([...(historyRef.current[historyIdxRef.current] ?? []), {
            id: nextAnnotationId(), kind: "line",
            x1: draft.x1, y1: draft.y1, x2: draft.x2, y2: draft.y2,
            color: annotationStyle.color, strokeWidth: annotationStyle.strokeWidth, fill: false,
          } as LineAnnotation]);
        }
      }

      /* Arrow commit */
      if (draft.kind === "arrow") {
        const len = Math.hypot(draft.x2 - draft.x1, draft.y2 - draft.y1);
        if (len >= 8) {
          pushHistory([...(historyRef.current[historyIdxRef.current] ?? []), {
            id: nextAnnotationId(), kind: "arrow",
            x1: draft.x1, y1: draft.y1, x2: draft.x2, y2: draft.y2,
            color: annotationStyle.color, strokeWidth: annotationStyle.strokeWidth, fill: false,
          } as ArrowAnnotation]);
        }
      }

      /* Rect commit */
      if (draft.kind === "rect") {
        const { x, y, w, h } = makeDraftRect(draft.x1, draft.y1, draft.x2, draft.y2);
        if (w >= 4 && h >= 4) {
          pushHistory([...(historyRef.current[historyIdxRef.current] ?? []), {
            id: nextAnnotationId(), kind: "rect", x, y, w, h,
            color: annotationStyle.color, strokeWidth: annotationStyle.strokeWidth, fill: annotationStyle.fill,
          } as RectAnnotation]);
        }
      }

      /* Ellipse commit */
      if (draft.kind === "ellipse") {
        const cx = (draft.x1 + draft.x2) / 2;
        const cy = (draft.y1 + draft.y2) / 2;
        const rx = Math.abs(draft.x2 - draft.x1) / 2;
        const ry = Math.abs(draft.y2 - draft.y1) / 2;
        if (rx >= 4 && ry >= 4) {
          pushHistory([...(historyRef.current[historyIdxRef.current] ?? []), {
            id: nextAnnotationId(), kind: "ellipse", cx, cy, rx, ry,
            color: annotationStyle.color, strokeWidth: annotationStyle.strokeWidth, fill: annotationStyle.fill,
          } as EllipseAnnotation]);
        }
      }

      /* Cloud commit */
      if (draft.kind === "cloud") {
        const { x, y, w, h } = makeDraftRect(draft.x1, draft.y1, draft.x2, draft.y2);
        if (w >= 20 && h >= 20) {
          pushHistory([...(historyRef.current[historyIdxRef.current] ?? []), {
            id: nextAnnotationId(), kind: "cloud", x, y, w, h,
            color: annotationStyle.color, strokeWidth: annotationStyle.strokeWidth, fill: annotationStyle.fill,
          } as CloudAnnotation]);
        }
      }

      /* Measure commit */
      if (draft.kind === "measure") {
        const len = Math.hypot(draft.x2 - draft.x1, draft.y2 - draft.y1);
        if (len >= 4) {
          pushHistory([...(historyRef.current[historyIdxRef.current] ?? []), {
            id: nextAnnotationId(), kind: "measure",
            x1: draft.x1, y1: draft.y1, x2: draft.x2, y2: draft.y2,
            color: "#F97316", strokeWidth: annotationStyle.strokeWidth, fill: false,
          } as MeasureAnnotation]);
        }
      }

      setDraft(null);
    }, [tool, draft, sheet, annotations, annotationStyle, pushHistory]);

    const onContainerPointerCancel = useCallback(() => {
      panDrag.current.on = false;
      setIsPanning(false);
      pinPointerRef.current = null;
      setDraft(null);
    }, []);

    /* ── Task drag/drop ── */
    const onTaskDragOver = (e: React.DragEvent) => {
      const types = Array.from(e.dataTransfer.types);
      e.preventDefault();
      if (types.includes(BUILDWIRE_TASK_DRAG_TYPE)) {
        e.dataTransfer.dropEffect = "copy";
        setTaskDropHover(true);
      } else {
        e.dataTransfer.dropEffect = "none";
      }
    };
    const onTaskDragLeave = (e: React.DragEvent) => {
      const next = e.relatedTarget as Node | null;
      if (!next || !e.currentTarget.contains(next)) setTaskDropHover(false);
    };
    const onTaskDrop = (e: React.DragEvent) => {
      e.preventDefault();
      setTaskDropHover(false);
      const c = containerRef.current;
      if (!c || !sheet) return;
      const raw = e.dataTransfer.getData(BUILDWIRE_TASK_DRAG_TYPE);
      const payload = parseTaskDragPayload(raw);
      if (!payload) return;
      const sp = clientToSheet(e.clientX, e.clientY, c, pRef.current, zRef.current);
      if (sp.x < 0 || sp.y < 0 || sp.x > sheet.w || sp.y > sheet.h) return;
      setUserPins((prev) => {
        const next = prev.filter((p) => p.taskId !== payload.taskId);
        next.push({ id: `task-pin-${payload.taskId}`, label: payload.number, x: sp.x, y: sp.y, status: payload.status, taskId: payload.taskId });
        return next;
      });
    };

    /* ── Handle ── */
    useImperativeHandle(ref, () => ({
      zoomIn:            () => zoomCenter(zRef.current * 1.25),
      zoomOut:           () => zoomCenter(zRef.current / 1.25),
      fitToView:         () => fit(),
      getZoomPercent:    () => Math.round(zRef.current * 100),
      undo,
      redo,
      clearAnnotations,
      canUndo:           () => historyIdxRef.current > 0,
      canRedo:           () => historyIdxRef.current < historyRef.current.length - 1,
    }), [zoomCenter, fit, undo, redo, clearAnnotations]);

    /* ── Cursor ── */
    const cursor =
      tool === "pan" || tool === "layers" ? (isPanning ? "grabbing" : "grab") :
      tool === "select" ? "default" :
      tool === "text" ? "text" :
      tool === "eraser" ? "cell" :
      "crosshair";

    const isDrawingTool =
      tool !== "pan" && tool !== "layers" && tool !== "select";

    return (
      <div className={`relative flex min-h-0 flex-1 flex-col overflow-hidden ${className}`}>
        {/* Loading */}
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-bg/70">
            <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-elevated px-4 py-3 shadow-token-md">
              <svg className="h-4 w-4 animate-spin text-brand" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="text-sm text-secondary">Loading sheet…</span>
            </div>
          </div>
        )}

        {/* Error */}
        {err && !loading && (
          <div className="m-4 rounded-xl border border-danger/30 bg-danger/8 px-4 py-3 text-sm text-danger">
            {err}
          </div>
        )}

        {/* Viewer canvas */}
        {!err && sheet && (
          <div
            ref={containerRef}
            className={`relative min-h-[min(280px,40vh)] flex-1 overflow-hidden rounded-lg bg-muted/8 ${
              taskDropHover ? "ring-2 ring-inset ring-brand/50" : ""
            }`}
            style={{ cursor }}
            onPointerDown={onContainerPointerDown}
            onPointerMove={onContainerPointerMove}
            onPointerUp={onContainerPointerUp}
            onPointerCancel={onContainerPointerCancel}
            onDragOver={onTaskDragOver}
            onDragLeave={onTaskDragLeave}
            onDrop={onTaskDrop}
          >
            <div
              className="absolute left-0 top-0 origin-top-left will-change-transform"
              style={{ transform: `translate(${pan.x}px,${pan.y}px) scale(${zoom})` }}
            >
              <div className="relative" style={{ width: sheet.w, height: sheet.h }}>
                {/* Sheet image */}
                {layerVisibility.sheet ? (
                  <img
                    src={sheet.src}
                    alt="Drawing sheet"
                    width={sheet.w}
                    height={sheet.h}
                    className="block max-w-none select-none rounded shadow-token-sm ring-1 ring-border/30"
                    draggable={false}
                  />
                ) : (
                  <div
                    className="flex items-center justify-center rounded bg-muted/20 ring-1 ring-border/30"
                    style={{ width: sheet.w, height: sheet.h }}
                  >
                    <span className="text-xs text-muted">Sheet hidden</span>
                  </div>
                )}

                {/* Annotation canvas */}
                <canvas
                  ref={strokeCanvasRef}
                  className={`absolute left-0 top-0 ${isDrawingTool ? "pointer-events-auto z-[5]" : "pointer-events-none z-[1]"}`}
                  width={sheet.w}
                  height={sheet.h}
                />

                {/* Pins */}
                {layerVisibility.pins &&
                  allPins.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      tabIndex={tool === "select" ? 0 : -1}
                      className={`absolute -translate-x-1/2 -translate-y-full rounded-md px-1.5 py-0.5 font-mono text-[10px] font-bold shadow-md transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 ${pinClass(p.status)} ${
                        tool === "select"
                          ? "pointer-events-auto z-[6] cursor-pointer"
                          : "pointer-events-none z-[4]"
                      } ${selectedPinId === p.id ? "ring-2 ring-brand ring-offset-1" : ""}`}
                      style={{ left: p.x, top: p.y }}
                      onPointerDown={(e) => { if (tool !== "select") return; e.stopPropagation(); }}
                      onClick={(e) => { if (tool !== "select") return; e.stopPropagation(); setSelectedPinId(p.id); }}
                    >
                      {p.label}
                    </button>
                  ))}
              </div>
            </div>

            {/* Text input overlay */}
            {textOverlay && (
              <div
                className="absolute z-20"
                style={{ left: textOverlay.cssX, top: textOverlay.cssY }}
              >
                <input
                  ref={textInputRef}
                  type="text"
                  autoFocus
                  placeholder="Type annotation…"
                  className="min-w-[120px] rounded border border-brand/60 bg-elevated/90 px-2 py-1 text-sm text-primary shadow-token-md backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      commitText(e.currentTarget.value, textOverlay.sheetX, textOverlay.sheetY);
                    }
                    if (e.key === "Escape") setTextOverlay(null);
                  }}
                  onBlur={(e) => commitText(e.target.value, textOverlay.sheetX, textOverlay.sheetY)}
                />
                <p className="mt-0.5 text-[10px] text-muted">Enter to confirm · Esc to cancel</p>
              </div>
            )}

            {/* Page count badge */}
            {totalPages > 1 && (
              <div className="pointer-events-none absolute right-2 top-2 z-10 rounded-md border border-border/60 bg-elevated/90 px-2 py-1 text-[11px] text-secondary backdrop-blur-sm">
                Page {pageNumber} / {totalPages}
              </div>
            )}
          </div>
        )}
      </div>
    );
  },
);
