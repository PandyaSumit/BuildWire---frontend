import type { ReactNode } from "react";

export type DrawingViewerToolId =
  | "pan"
  | "select"
  | "measure"
  | "markup"
  | "pin"
  | "layers";

export type LayerVisibility = {
  sheet: boolean;
  pins: boolean;
  markup: boolean;
};

type ToolDef = {
  id: DrawingViewerToolId;
  label: string;
  icon: ReactNode;
};

function IconWrap({ children }: { children: ReactNode }) {
  return (
    <span className="flex h-4 w-4 shrink-0 items-center justify-center [&>svg]:h-4 [&>svg]:w-4">
      {children}
    </span>
  );
}

const TOOL_DEFS: ToolDef[] = [
  {
    id: "pan",
    label: "Pan",
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6v-1.5a1.5 1.5 0 113 0V14m0 0v.5a1.5 1.5 0 11-3 0V14m0 0v-1.5a1.5 1.5 0 113 0V14M9 9v1.5a1.5 1.5 0 11-3 0V9m0 0a1.5 1.5 0 113 0m-3 0V14m0 0v-1.5a1.5 1.5 0 113 0V14"
        />
      </svg>
    ),
  },
  {
    id: "select",
    label: "Select",
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M4 4l7 7v6h4v-4l-7-7-4-2z"
        />
      </svg>
    ),
  },
  {
    id: "measure",
    label: "Measure",
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M3 6h3m-3 6h3m-3 6h3M9 4v16m6-16v5m0 6v5m6-16v16"
        />
      </svg>
    ),
  },
  {
    id: "markup",
    label: "Markup",
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
        />
      </svg>
    ),
  },
  {
    id: "pin",
    label: "Pin",
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
  },
  {
    id: "layers",
    label: "Layers",
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
        />
      </svg>
    ),
  },
];

export type DrawingViewerToolbarProps = {
  activeTool: DrawingViewerToolId;
  onToolChange: (id: DrawingViewerToolId) => void;
  layerVisibility?: LayerVisibility;
  onLayerVisibilityChange?: (next: LayerVisibility) => void;
  className?: string;
  /**
   * `floating` — Figma-style centered pill on the canvas (use with absolute bottom placement).
   * `header` — full-width strip under the page title (legacy).
   */
  variant?: "header" | "floating";
};

function ToolButtons({
  activeTool,
  onToolChange,
  compact,
}: {
  activeTool: DrawingViewerToolId;
  onToolChange: (id: DrawingViewerToolId) => void;
  compact?: boolean;
}) {
  return (
    <>
      {TOOL_DEFS.map((t) => {
        const active = activeTool === t.id;
        return (
          <button
            key={t.id}
            type="button"
            title={t.label}
            aria-pressed={active}
            aria-label={t.label}
            onClick={() => onToolChange(t.id)}
            className={`inline-flex min-w-0 items-center gap-1.5 rounded-lg text-left text-[11px] font-medium transition-colors ${
              compact ? "min-h-8 px-2 py-1.5" : "min-h-9 px-2.5 py-1.5"
            } ${
              active
                ? "bg-muted/50 text-primary shadow-sm ring-1 ring-brand/40 dark:bg-muted/35"
                : "text-secondary hover:bg-muted/25 hover:text-primary"
            }`}
          >
            <IconWrap>{t.icon}</IconWrap>
            <span className="whitespace-nowrap">{t.label}</span>
          </button>
        );
      })}
    </>
  );
}

function LayersVisibilityRow({
  layerVisibility,
  onLayerVisibilityChange,
}: {
  layerVisibility: LayerVisibility;
  onLayerVisibilityChange: (next: LayerVisibility) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Layer visibility"
      className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-secondary"
    >
      <span className="shrink-0 font-medium text-muted">Show</span>
      {(
        [
          ["sheet", "Sheet"],
          ["pins", "Pins"],
          ["markup", "Markup"],
        ] as const
      ).map(([key, label]) => (
        <label
          key={key}
          className="inline-flex cursor-pointer items-center gap-1.5 select-none"
        >
          <input
            type="checkbox"
            className="h-3.5 w-3.5 rounded border-border text-brand focus:ring-brand/40"
            checked={layerVisibility[key]}
            onChange={(e) =>
              onLayerVisibilityChange({
                ...layerVisibility,
                [key]: e.target.checked,
              })
            }
          />
          <span className="text-primary/90">{label}</span>
        </label>
      ))}
    </div>
  );
}

export function DrawingViewerToolbar({
  activeTool,
  onToolChange,
  layerVisibility,
  onLayerVisibilityChange,
  className = "",
  variant = "header",
}: DrawingViewerToolbarProps) {
  const showLayers =
    activeTool === "layers" &&
    layerVisibility &&
    onLayerVisibilityChange;

  if (variant === "floating") {
    const pill =
      "rounded-2xl border border-border/80 bg-surface/95 shadow-lg backdrop-blur-md dark:border-border/60 dark:bg-surface/90";
    return (
      <div
        className={`flex max-w-[min(100%,calc(100vw-2rem))] flex-col items-center gap-2 ${className}`}
      >
        {showLayers && (
          <div className={`${pill} px-3 py-2`}>
            <LayersVisibilityRow
              layerVisibility={layerVisibility}
              onLayerVisibilityChange={onLayerVisibilityChange}
            />
          </div>
        )}
        <div
          role="toolbar"
          aria-label="Drawing tools"
          className={`flex flex-wrap items-center justify-center gap-0.5 px-1.5 py-1 ${pill}`}
        >
          <ToolButtons
            activeTool={activeTool}
            onToolChange={onToolChange}
            compact
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`shrink-0 border-b border-border bg-surface ${className}`}>
      <div
        role="toolbar"
        aria-label="Drawing tools"
        className="flex flex-wrap items-center gap-x-1 gap-y-1 px-3 py-1.5"
      >
        <span className="mr-1.5 shrink-0 text-[10px] font-semibold uppercase tracking-wide text-muted">
          Tools
        </span>
        <ToolButtons activeTool={activeTool} onToolChange={onToolChange} />

        {showLayers && (
          <div className="ml-auto flex min-w-0 border-l border-border pl-3">
            <LayersVisibilityRow
              layerVisibility={layerVisibility}
              onLayerVisibilityChange={onLayerVisibilityChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}
