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

/** Cached PDF document instances keyed by URL to avoid re-downloading. */
const pdfDocCache = new Map<string, pdfjsLib.PDFDocumentProxy>();

async function getPdfDoc(url: string): Promise<pdfjsLib.PDFDocumentProxy> {
  const cached = pdfDocCache.get(url);
  if (cached) return cached;
  const task = pdfjsLib.getDocument({ url, withCredentials: false });
  const doc = await task.promise;
  pdfDocCache.set(url, doc);
  return doc;
}

/** Returns the total page count for a PDF. */
export async function getPdfPageCount(url: string): Promise<number> {
  const doc = await getPdfDoc(url);
  return doc.numPages;
}

/**
 * Render a specific PDF page to an existing canvas.
 * @param pageNumber 1-based page index (default: 1)
 */
export async function renderPdfPageToCanvas(
  url: string,
  canvas: HTMLCanvasElement,
  scale = 2,
  pageNumber = 1,
): Promise<{ width: number; height: number }> {
  const doc = await getPdfDoc(url);
  const page = await doc.getPage(Math.max(1, Math.min(pageNumber, doc.numPages)));
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
 * Rasterize a PDF page to a PNG data URL.
 * @param pageNumber 1-based page index (default: 1)
 */
export async function rasterizePdfPageToDataUrl(
  url: string,
  scale = 2,
  pageNumber = 1,
): Promise<{ dataUrl: string; width: number; height: number; totalPages: number }> {
  const doc = await getPdfDoc(url);
  const totalPages = doc.numPages;
  const safePageNumber = Math.max(1, Math.min(pageNumber, totalPages));
  const canvas = document.createElement("canvas");
  const { width, height } = await renderPdfPageToCanvas(url, canvas, scale, safePageNumber);
  return {
    dataUrl: canvas.toDataURL("image/png"),
    width,
    height,
    totalPages,
  };
}

/** @deprecated Use rasterizePdfPageToDataUrl instead */
export async function rasterizePdfFirstPageToDataUrl(
  url: string,
  scale = 2,
): Promise<{ dataUrl: string; width: number; height: number }> {
  const { dataUrl, width, height } = await rasterizePdfPageToDataUrl(url, scale, 1);
  return { dataUrl, width, height };
}
