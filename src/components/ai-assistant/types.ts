/**
 * BuildWire AI assistant — user-facing configuration and runtime options.
 * Keep JSON-serialisable user fields compatible with `userPreferences` storage.
 */

/** How the assistant attaches to the workspace shell */
export type AiAssistantPresentation = 'dock_end' | 'dock_start' | 'modal';

/**
 * User preferences (persisted). Safe to extend with optional fields;
 * unknown keys are preserved on parse where possible.
 */
export interface AiAssistantUserConfig {
  presentation: AiAssistantPresentation;
  /** Docked panel width in CSS pixels */
  widthPx: number;
  /** Persist open/closed across sessions */
  rememberOpen: boolean;
  /** Used when `rememberOpen` is false */
  defaultOpen: boolean;
  /**
   * When true, the panel uses a fixed neutral palette so global theme
   * or layout CSS changes cannot alter its look unintentionally.
   */
  isolatedChrome: boolean;
  /** Optional title shown in panel header */
  title: string;
}

/** Runtime overrides (not persisted) — e.g. from a host route */
export interface AiAssistantRuntimeOptions {
  /** Override header title for this session */
  titleOverride?: string | null;
}

export const AI_ASSISTANT_WIDTH_MIN = 320;
export const AI_ASSISTANT_WIDTH_MAX = 560;
export const AI_ASSISTANT_WIDTH_DEFAULT = 400;

export const AI_ASSISTANT_BREAKPOINT = '(max-width: 1023px)';
