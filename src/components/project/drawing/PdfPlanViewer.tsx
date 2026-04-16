import { useEffect, useRef, useState } from "react";
import { DEMO_PLAN_PDF_URL, renderPdfPageToCanvas } from "@/utils/project/planPdf";

type PdfPlanViewerProps = {
  /** Optional override; defaults to a public sample PDF. */
  fileUrl?: string;
  className?: string;
};

/**
 * Simple single-page PDF preview (no zoom/pan). Prefer {@link PlanCanvasViewer} for full viewer.
 */
export function PdfPlanViewer({
  fileUrl = DEMO_PLAN_PDF_URL,
  className = "",
}: PdfPlanViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let cancelled = false;

    (async () => {
      setLoading(true);
      setErr(null);
      try {
        await renderPdfPageToCanvas(fileUrl, canvas, 1.25);
      } catch (e) {
        if (!cancelled) {
          setErr(e instanceof Error ? e.message : "Failed to load PDF");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [fileUrl]);

  return (
    <div className={`relative flex min-h-0 flex-1 flex-col ${className}`}>
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-bg/60 text-sm text-secondary">
          Loading PDF…
        </div>
      )}
      {err && (
        <div className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
          {err}
        </div>
      )}
      <canvas ref={canvasRef} className="mx-auto max-h-full w-auto rounded-lg shadow-sm" />
    </div>
  );
}
