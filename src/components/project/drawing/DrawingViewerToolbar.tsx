import { type ReactNode, useRef, useState } from "react";

/* ─────────────────────────────────────────────────────────────── Types ── */

export type DrawingViewerToolId =
  | "pan"
  | "select"
  | "freehand"
  | "line"
  | "arrow"
  | "rect"
  | "ellipse"
  | "cloud"
  | "text"
  | "eraser"
  | "measure"
  | "pin"
  | "layers";

export type LayerVisibility = {
  sheet: boolean;
  pins: boolean;
  markup: boolean;
};

export type AnnotationStyle = {
  color: string;
  strokeWidth: number;
  fill: boolean;
};

/** Tools that create annotations and need a style panel */
export const ANNOTATION_TOOL_IDS: DrawingViewerToolId[] = [
  "freehand", "line", "arrow", "rect", "ellipse", "cloud", "text",
];

export function isAnnotationTool(id: DrawingViewerToolId): boolean {
  return ANNOTATION_TOOL_IDS.includes(id);
}

export const DEFAULT_ANNOTATION_STYLE: AnnotationStyle = {
  color: "#EF4444",
  strokeWidth: 2,
  fill: false,
};

/* ─────────────────────────────────────────────────── Color swatches ── */

const PRESET_COLORS = [
  { hex: "#EF4444", label: "Red" },
  { hex: "#F97316", label: "Orange" },
  { hex: "#EAB308", label: "Yellow" },
  { hex: "#22C55E", label: "Green" },
  { hex: "#3B82F6", label: "Blue" },
  { hex: "#A855F7", label: "Purple" },
  { hex: "#18181B", label: "Black" },
];

const STROKE_WIDTHS = [
  { value: 1, label: "Thin" },
  { value: 2, label: "Default" },
  { value: 3, label: "Medium" },
  { value: 5, label: "Thick" },
  { value: 8, label: "Bold" },
];

/* ───────────────────────────────────────────── Tool definitions ── */

interface ToolDef {
  id: DrawingViewerToolId;
  label: string;
  shortcut?: string;
  icon: ReactNode;
  group: "navigate" | "draw" | "shapes" | "other";
}

function Ico({ d, children }: { d?: string; children?: ReactNode }) {
  if (children) {
    return (
      <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center [&>svg]:h-[18px] [&>svg]:w-[18px]">
        {children}
      </span>
    );
  }
  return (
    <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center">
      <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={d} />
      </svg>
    </span>
  );
}

const TOOL_DEFS: ToolDef[] = [
  {
    id: "pan", label: "Pan", shortcut: "V", group: "navigate",
    icon: <Ico d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6v-1.5a1.5 1.5 0 113 0V14m0 0v.5a1.5 1.5 0 11-3 0V14m3-5v1.5a1.5 1.5 0 11-3 0V9m0 0a1.5 1.5 0 113 0" />,
  },
  {
    id: "select", label: "Select", shortcut: "S", group: "navigate",
    icon: <Ico d="M3 3l7 18 3-7 7-3L3 3z" />,
  },
  {
    id: "freehand", label: "Freehand", shortcut: "F", group: "draw",
    icon: <Ico d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />,
  },
  {
    id: "line", label: "Line", shortcut: "L", group: "draw",
    icon: (
      <Ico>
        <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <line x1="4" y1="20" x2="20" y2="4" strokeWidth={2} strokeLinecap="round" />
        </svg>
      </Ico>
    ),
  },
  {
    id: "arrow", label: "Arrow", shortcut: "A", group: "draw",
    icon: <Ico d="M5 19L19 5M13 5h6v6" />,
  },
  {
    id: "rect", label: "Rectangle", shortcut: "R", group: "shapes",
    icon: (
      <Ico>
        <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <rect x="3" y="5" width="18" height="14" rx="1.5" strokeWidth={1.5} />
        </svg>
      </Ico>
    ),
  },
  {
    id: "ellipse", label: "Ellipse", shortcut: "E", group: "shapes",
    icon: (
      <Ico>
        <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <ellipse cx="12" cy="12" rx="9.5" ry="6.5" strokeWidth={1.5} />
        </svg>
      </Ico>
    ),
  },
  {
    id: "cloud", label: "Cloud", shortcut: "C", group: "shapes",
    icon: (
      <Ico>
        <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M3 16.5A4.5 4.5 0 016 8a6 6 0 0111.874-1A4.5 4.5 0 0118 16.5H3z" />
        </svg>
      </Ico>
    ),
  },
  {
    id: "text", label: "Text", shortcut: "T", group: "shapes",
    icon: (
      <Ico>
        <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M12 4v16M8 20h8" />
        </svg>
      </Ico>
    ),
  },
  {
    id: "eraser", label: "Eraser", shortcut: "X", group: "other",
    icon: <Ico d="M20 20H7L3 16l9-9 8 8-3.5 3.5M6.5 17.5l4-4" />,
  },
  {
    id: "measure", label: "Measure", shortcut: "M", group: "other",
    icon: (
      <Ico>
        <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6h2M3 12h2M3 18h2M7 4v16m6-16v4m0 8v4m6-16v16" />
        </svg>
      </Ico>
    ),
  },
  {
    id: "pin", label: "Pin", shortcut: "P", group: "other",
    icon: <Ico d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" />,
  },
  {
    id: "layers", label: "Layers", group: "other",
    icon: <Ico d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />,
  },
];

/* ────────────────────────────────────────────────── Sub-components ── */

const GROUP_DEFS = [
  { key: "navigate" as const, label: "Navigate" },
  { key: "draw" as const, label: "Draw" },
  { key: "shapes" as const, label: "Shapes" },
  { key: "other" as const, label: "Other" },
];

function ToolBtn({
  def,
  active,
  compact,
  onToolChange,
}: {
  def: ToolDef;
  active: boolean;
  compact?: boolean;
  onToolChange: (id: DrawingViewerToolId) => void;
}) {
  return (
    <button
      key={def.id}
      type="button"
      title={def.shortcut ? `${def.label} (${def.shortcut})` : def.label}
      aria-pressed={active}
      aria-label={def.label}
      onClick={() => onToolChange(def.id)}
      className={`relative inline-flex items-center justify-center rounded-lg transition-all duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 ${
        compact ? "h-8 w-8" : "h-9 w-9"
      } ${
        active
          ? "bg-brand text-white shadow-token-sm"
          : "text-secondary hover:bg-primary/8 hover:text-primary"
      }`}
    >
      {def.icon}
      {def.shortcut && (
        <span className="absolute -bottom-px -right-px hidden rounded-sm bg-surface px-[3px] text-[8px] font-semibold leading-none text-muted ring-1 ring-border/60 group-hover:block">
          {def.shortcut}
        </span>
      )}
    </button>
  );
}

function Separator({ compact }: { compact?: boolean }) {
  return (
    <div className={`shrink-0 bg-border/60 ${compact ? "h-5 w-px mx-0.5" : "h-6 w-px mx-1"}`} aria-hidden />
  );
}

function LayerToggle({
  layerVisibility,
  onLayerVisibilityChange,
}: {
  layerVisibility: LayerVisibility;
  onLayerVisibilityChange: (next: LayerVisibility) => void;
}) {
  const layers = [
    { key: "sheet" as const, label: "Sheet" },
    { key: "pins" as const, label: "Pins" },
    { key: "markup" as const, label: "Markup" },
  ];
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 px-3 py-2.5 text-[12px]">
      <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wide text-muted">Layers</span>
      {layers.map(({ key, label }) => (
        <label key={key} className="inline-flex cursor-pointer select-none items-center gap-1.5">
          <input
            type="checkbox"
            className="h-3.5 w-3.5 rounded border-border accent-brand"
            checked={layerVisibility[key]}
            onChange={(e) =>
              onLayerVisibilityChange({ ...layerVisibility, [key]: e.target.checked })
            }
          />
          <span className="text-primary/90">{label}</span>
        </label>
      ))}
    </div>
  );
}

/* ──────────────────────────────────────── Annotation style panel ── */

function StylePanel({
  style,
  onChange,
}: {
  style: AnnotationStyle;
  onChange: (next: AnnotationStyle) => void;
}) {
  const customRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-wrap items-center gap-2 px-3 py-2">
      {/* Color swatches */}
      <div className="flex items-center gap-1">
        {PRESET_COLORS.map((c) => (
          <button
            key={c.hex}
            type="button"
            title={c.label}
            aria-label={c.label}
            onClick={() => onChange({ ...style, color: c.hex })}
            className={`h-5 w-5 shrink-0 rounded-full transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-brand/50 ${
              style.color === c.hex
                ? "ring-2 ring-offset-1 ring-primary/60 scale-110"
                : ""
            }`}
            style={{ backgroundColor: c.hex }}
          />
        ))}
        {/* Custom color */}
        <button
          type="button"
          title="Custom color"
          className="relative h-5 w-5 shrink-0 overflow-hidden rounded-full border border-border/70 bg-gradient-to-br from-red-400 via-blue-400 to-green-400 hover:scale-110 transition-transform"
          onClick={() => customRef.current?.click()}
        >
          <input
            ref={customRef}
            type="color"
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            value={style.color}
            onChange={(e) => onChange({ ...style, color: e.target.value })}
          />
        </button>
      </div>

      <Separator compact />

      {/* Stroke width */}
      <div className="flex items-center gap-0.5">
        {STROKE_WIDTHS.map((w) => (
          <button
            key={w.value}
            type="button"
            title={w.label}
            aria-label={`Stroke width ${w.value}px`}
            onClick={() => onChange({ ...style, strokeWidth: w.value })}
            className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
              style.strokeWidth === w.value
                ? "bg-primary/10 text-primary"
                : "text-muted hover:bg-primary/6 hover:text-secondary"
            }`}
          >
            <div
              className="rounded-full bg-current"
              style={{ width: Math.min(18, w.value + 8), height: w.value }}
            />
          </button>
        ))}
      </div>

      <Separator compact />

      {/* Fill toggle */}
      <button
        type="button"
        title={style.fill ? "Outline only" : "Fill shape"}
        onClick={() => onChange({ ...style, fill: !style.fill })}
        className={`flex h-7 items-center gap-1.5 rounded-md px-2 text-[11.5px] font-medium transition-colors ${
          style.fill
            ? "bg-primary/10 text-primary"
            : "text-muted hover:bg-primary/6 hover:text-secondary"
        }`}
      >
        <svg className="h-3.5 w-3.5" fill={style.fill ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
          <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth={1.5} />
        </svg>
        Fill
      </button>
    </div>
  );
}

/* ─────────────────────────────────────── Toolbar props & exports ── */

export type DrawingViewerToolbarProps = {
  activeTool: DrawingViewerToolId;
  onToolChange: (id: DrawingViewerToolId) => void;
  layerVisibility?: LayerVisibility;
  onLayerVisibilityChange?: (next: LayerVisibility) => void;
  annotationStyle?: AnnotationStyle;
  onAnnotationStyleChange?: (next: AnnotationStyle) => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  onClearAll?: () => void;
  className?: string;
  /**
   * `floating` — Figma-style pill centered on canvas (use with absolute bottom placement).
   * `header`   — full-width strip under the page title.
   */
  variant?: "header" | "floating";
};

const toolsByGroup = GROUP_DEFS.map((g) => ({
  ...g,
  tools: TOOL_DEFS.filter((t) => t.group === g.key),
}));

/* ────────────────────────────────────────────────────── Floating variant ── */

export function DrawingViewerToolbar({
  activeTool,
  onToolChange,
  layerVisibility,
  onLayerVisibilityChange,
  annotationStyle,
  onAnnotationStyleChange,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  onClearAll,
  className = "",
  variant = "floating",
}: DrawingViewerToolbarProps) {
  const [showLayers, setShowLayers] = useState(false);

  const pillBase =
    "rounded-2xl border border-border/70 bg-elevated/95 shadow-token-lg backdrop-blur-md dark:border-white/[0.08] dark:bg-elevated/92";

  if (variant === "floating") {
    const showStyle =
      isAnnotationTool(activeTool) && annotationStyle && onAnnotationStyleChange;

    return (
      <div className={`flex max-w-[min(100%,calc(100vw-2rem))] flex-col items-center gap-2 ${className}`}>
        {/* Style panel — shown when annotation tool is active */}
        {showStyle && (
          <div className={`${pillBase} animate-slide-down`}>
            <StylePanel style={annotationStyle} onChange={onAnnotationStyleChange} />
          </div>
        )}

        {/* Layer panel */}
        {showLayers && layerVisibility && onLayerVisibilityChange && (
          <div className={`${pillBase} animate-slide-down`}>
            <LayerToggle
              layerVisibility={layerVisibility}
              onLayerVisibilityChange={onLayerVisibilityChange}
            />
          </div>
        )}

        {/* Main toolbar pill */}
        <div role="toolbar" aria-label="Drawing tools" className={`flex items-center gap-0.5 px-1.5 py-1 ${pillBase}`}>

          {/* Undo / Redo */}
          <button
            type="button"
            title="Undo (Ctrl+Z)"
            aria-label="Undo"
            disabled={!canUndo}
            onClick={onUndo}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-secondary transition-colors disabled:opacity-30 hover:enabled:bg-primary/8 hover:enabled:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
          >
            <svg className="h-[17px] w-[17px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 9l4-4 4 4M7 5v14M21 15a6 6 0 01-10.93 3.38" />
            </svg>
          </button>
          <button
            type="button"
            title="Redo (Ctrl+Y)"
            aria-label="Redo"
            disabled={!canRedo}
            onClick={onRedo}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-secondary transition-colors disabled:opacity-30 hover:enabled:bg-primary/8 hover:enabled:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
          >
            <svg className="h-[17px] w-[17px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M21 9l-4-4-4 4M17 5v14M3 15a6 6 0 0010.93 3.38" />
            </svg>
          </button>

          <Separator compact />

          {/* Tool groups */}
          {toolsByGroup.map((group, gi) => (
            <div key={group.key} className="flex items-center gap-0.5">
              {group.tools.map((def) => {
                if (def.id === "layers") {
                  return (
                    <button
                      key={def.id}
                      type="button"
                      title="Layers"
                      aria-pressed={showLayers}
                      onClick={() => setShowLayers((v) => !v)}
                      className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 ${
                        showLayers
                          ? "bg-brand text-white shadow-token-sm"
                          : "text-secondary hover:bg-primary/8 hover:text-primary"
                      }`}
                    >
                      {def.icon}
                    </button>
                  );
                }
                return (
                  <ToolBtn
                    key={def.id}
                    def={def}
                    active={activeTool === def.id}
                    compact
                    onToolChange={onToolChange}
                  />
                );
              })}
              {gi < toolsByGroup.length - 1 && <Separator compact />}
            </div>
          ))}

          {/* Clear all */}
          {onClearAll && (
            <>
              <Separator compact />
              <button
                type="button"
                title="Clear all markup"
                aria-label="Clear all markup"
                onClick={onClearAll}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-danger/10 hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/40"
              >
                <svg className="h-[17px] w-[17px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  /* ── Header variant ── */
  return (
    <div className={`shrink-0 border-b border-border/50 bg-surface ${className}`}>
      <div
        role="toolbar"
        aria-label="Drawing tools"
        className="flex flex-wrap items-center gap-x-0.5 gap-y-1 px-3 py-1"
      >
        {/* Undo/Redo */}
        <button
          type="button"
          title="Undo (Ctrl+Z)"
          disabled={!canUndo}
          onClick={onUndo}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors disabled:opacity-30 hover:enabled:bg-primary/8 hover:enabled:text-primary"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 9l4-4 4 4M7 5v14M21 15a6 6 0 01-10.93 3.38" />
          </svg>
        </button>
        <button
          type="button"
          title="Redo (Ctrl+Y)"
          disabled={!canRedo}
          onClick={onRedo}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors disabled:opacity-30 hover:enabled:bg-primary/8 hover:enabled:text-primary"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M21 9l-4-4-4 4M17 5v14M3 15a6 6 0 0010.93 3.38" />
          </svg>
        </button>

        <Separator />

        {TOOL_DEFS.filter((t) => t.id !== "layers").map((def) => (
          <ToolBtn
            key={def.id}
            def={def}
            active={activeTool === def.id}
            onToolChange={onToolChange}
          />
        ))}

        {layerVisibility && onLayerVisibilityChange && (
          <div className="ml-auto border-l border-border/50 pl-3">
            <LayerToggle
              layerVisibility={layerVisibility}
              onLayerVisibilityChange={onLayerVisibilityChange}
            />
          </div>
        )}
      </div>

      {/* Style panel when annotation tool selected */}
      {isAnnotationTool(activeTool) && annotationStyle && onAnnotationStyleChange && (
        <div className="border-t border-border/40">
          <StylePanel style={annotationStyle} onChange={onAnnotationStyleChange} />
        </div>
      )}
    </div>
  );
}
