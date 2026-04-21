import type { AiAssistantUserConfig } from './types';
import {
  AI_ASSISTANT_WIDTH_DEFAULT,
  AI_ASSISTANT_WIDTH_MAX,
  AI_ASSISTANT_WIDTH_MIN,
} from './types';

export const DEFAULT_AI_ASSISTANT_USER_CONFIG: AiAssistantUserConfig = {
  presentation: 'dock_end',
  widthPx: AI_ASSISTANT_WIDTH_DEFAULT,
  rememberOpen: true,
  defaultOpen: false,
  isolatedChrome: true,
  title: 'Assistant',
};

function clampWidth(n: number): number {
  return Math.min(AI_ASSISTANT_WIDTH_MAX, Math.max(AI_ASSISTANT_WIDTH_MIN, Math.round(n)));
}

export function normalizeAiAssistantUserConfig(
  input: Partial<AiAssistantUserConfig> | null | undefined,
): AiAssistantUserConfig {
  const base = { ...DEFAULT_AI_ASSISTANT_USER_CONFIG };
  if (!input || typeof input !== 'object') return base;

  const presentation =
    input.presentation === 'dock_start' ||
    input.presentation === 'modal' ||
    input.presentation === 'dock_end'
      ? input.presentation
      : base.presentation;

  return {
    presentation,
    widthPx: clampWidth(
      typeof input.widthPx === 'number' && !Number.isNaN(input.widthPx)
        ? input.widthPx
        : base.widthPx,
    ),
    rememberOpen:
      typeof input.rememberOpen === 'boolean' ? input.rememberOpen : base.rememberOpen,
    defaultOpen:
      typeof input.defaultOpen === 'boolean' ? input.defaultOpen : base.defaultOpen,
    isolatedChrome:
      typeof input.isolatedChrome === 'boolean' ? input.isolatedChrome : base.isolatedChrome,
    title: typeof input.title === 'string' && input.title.trim() ? input.title.trim() : base.title,
  };
}
