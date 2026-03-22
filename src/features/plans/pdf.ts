import * as pdfjsLib from "pdfjs-dist";

/** Public sample PDF for demos when no upload exists. */
export const DEMO_PLAN_PDF_URL =
  "https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf";

if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
  ).toString();
}

const API_BASE =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/api\/?$/, "") ??
  "";

/**
 * Resolve relative upload paths to absolute URLs (legacy `getFullFileUrl` behavior).
 */
export function resolvePlanFileUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("blob:") ||
    url.startsWith("data:")
  ) {
    return url;
  }
  if (!API_BASE) return url;
  return `${API_BASE}${url.startsWith("/") ? "" : "/"}${url}`;
}

export function isPdf(url: string | null | undefined, fileName?: string | null): boolean {
  if (!url && !fileName) return false;
  if (fileName && /\.pdf$/i.test(fileName)) return true;
  if (url && /\.pdf(\?|$)/i.test(url)) return true;
  if (url && /\/raw\/upload\//i.test(url) && fileName && /\.pdf$/i.test(fileName)) {
    return true;
  }
  return false;
}

export function isImage(url: string | null | undefined, fileName?: string | null): boolean {
  if (!url && !fileName) return false;
  const pattern = /\.(jpg|jpeg|png|gif|webp|svg|bmp|tiff?)(\?|$)/i;
  if (fileName && pattern.test(fileName)) return true;
  if (url && pattern.test(url)) return true;
  return false;
}

/**
 * Render PDF page 1 to an existing canvas. Returns pixel dimensions of the rendered page.
 */
export async function renderPdfPageToCanvas(
  url: string,
  canvas: HTMLCanvasElement,
  scale = 2,
): Promise<{ width: number; height: number }> {
  const task = pdfjsLib.getDocument({ url, withCredentials: false });
  const pdf = await task.promise;
  const page = await pdf.getPage(1);
  const viewport = page.getViewport({ scale });
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unsupported");
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const renderTask = page.render({ canvasContext: ctx, viewport });
  await renderTask.promise;
  return { width: viewport.width, height: viewport.height };
}

/**
 * Rasterize first PDF page to a PNG data URL for use as `<img src>` (matches legacy plan viewer flow).
 */
export async function rasterizePdfFirstPageToDataUrl(
  url: string,
  scale = 2,
): Promise<{ dataUrl: string; width: number; height: number }> {
  const canvas = document.createElement("canvas");
  const { width, height } = await renderPdfPageToCanvas(url, canvas, scale);
  return {
    dataUrl: canvas.toDataURL("image/png"),
    width,
    height,
  };
}
