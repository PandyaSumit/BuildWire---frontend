import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useAiAssistant } from './AiAssistantContext';
import { AiAssistantPanelChrome } from './AiAssistantPanelChrome';
import { AiAssistantDefaultBody } from './AiAssistantDefaultBody';

export function AiAssistantWorkspace({
  children,
  panelBody,
}: {
  children: ReactNode;
  panelBody?: ReactNode;
}) {
  const {
    open,
    setOpen,
    effectivePresentation,
    dockWidthPx,
    userConfig,
    runtime,
  } = useAiAssistant();

  const title = runtime.titleOverride ?? userConfig.title;
  const isolated = userConfig.isolatedChrome;

  const panelInner = panelBody ?? <AiAssistantDefaultBody />;

  useEffect(() => {
    if (!open || effectivePresentation !== 'modal') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, effectivePresentation, setOpen]);

  const dockedPanel = (
    <aside
      data-bw-ai-assistant-dock
      aria-hidden={!open}
      className={[
        'flex shrink-0 flex-col overflow-hidden border-border transition-[width,opacity] duration-200 ease-out',
        open ? 'border-s opacity-100' : 'w-0 min-w-0 border-transparent opacity-0',
      ].join(' ')}
      style={
        open
          ? {
              width: dockWidthPx,
              minWidth: dockWidthPx,
            }
          : { width: 0, minWidth: 0 }
      }
    >
      {open && (
        <AiAssistantPanelChrome
          isolated={isolated}
          title={title}
          onClose={() => setOpen(false)}
        >
          {panelInner}
        </AiAssistantPanelChrome>
      )}
    </aside>
  );

  const main = (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-auto overscroll-contain">
      {children}
    </div>
  );

  if (effectivePresentation === 'modal') {
    return (
      <>
        {main}
        {open &&
          typeof document !== 'undefined' &&
          createPortal(
            <div
              data-bw-ai-assistant-modal-root
              className="fixed inset-0 z-[100] flex items-stretch justify-end"
              role="dialog"
              aria-modal="true"
            >
              <button
                type="button"
                className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
                aria-label="Close assistant"
                onClick={() => setOpen(false)}
              />
              <div
                className="relative flex h-full w-full max-w-[min(100vw,560px)] min-w-0 flex-col shadow-2xl animate-slide-in-right sm:max-w-[480px]"
                style={{ width: Math.min(dockWidthPx, window.innerWidth) }}
              >
                <AiAssistantPanelChrome
                  isolated={isolated}
                  title={title}
                  onClose={() => setOpen(false)}
                >
                  {panelInner}
                </AiAssistantPanelChrome>
              </div>
            </div>,
            document.body,
          )}
      </>
    );
  }

  const dockStart = effectivePresentation === 'dock_start';

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-row">
      {dockStart ? dockedPanel : main}
      {dockStart ? main : dockedPanel}
    </div>
  );
}
