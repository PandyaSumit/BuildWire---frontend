import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

const isolatedRoot =
  'isolate flex h-full min-h-0 w-full flex-col border-zinc-700/90 bg-zinc-950 text-zinc-100 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]';

const inheritRoot =
  'isolate flex h-full min-h-0 w-full flex-col border-border/60 bg-elevated text-primary shadow-token-md dark:border-white/[0.06]';

export function AiAssistantPanelChrome({
  isolated,
  title,
  onClose,
  children,
}: {
  isolated: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const { t } = useTranslation();

  return (
    <div
      data-bw-ai-assistant-root
      className={isolated ? isolatedRoot : inheritRoot}
      style={{ contain: 'layout style' }}
    >
      <div className="flex shrink-0 items-center justify-between gap-2 border-b px-3 py-2.5 sm:px-4 border-inherit">
        <h2 className="truncate text-sm font-semibold tracking-tight">
          {title || t('aiAssistant.defaultTitle')}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className={
            isolated
              ? 'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50'
              : 'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-primary/8 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40'
          }
          aria-label={t('aiAssistant.close')}
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3 sm:px-4">{children}</div>
    </div>
  );
}
