import { useEffect, useMemo, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGlobalSearch } from '@/components/layout/GlobalSearchContext';

type Shortcut = { to: string; labelKey: string };

const SHORTCUTS: Shortcut[] = [
  { to: '/dashboard', labelKey: 'nav.dashboard' },
  { to: '/projects', labelKey: 'nav.projects' },
  { to: '/sales', labelKey: 'nav.salesCrm' },
  { to: '/settings/preferences', labelKey: 'account.preferences' },
];

export function GlobalSearchPalette() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const { query, setQuery, paletteOpen, closePalette, mobilePaletteInputRef } = useGlobalSearch();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SHORTCUTS;
    return SHORTCUTS.filter((s) => t(s.labelKey).toLowerCase().includes(q));
  }, [query, t]);

  useEffect(() => {
    if (!paletteOpen) return;
    const id = window.requestAnimationFrame(() => {
      mobilePaletteInputRef.current?.focus();
      mobilePaletteInputRef.current?.select();
    });
    return () => window.cancelAnimationFrame(id);
  }, [paletteOpen, mobilePaletteInputRef]);

  useEffect(() => {
    if (!paletteOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePalette();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [paletteOpen, closePalette]);

  const prevPathRef = useRef(pathname);
  useEffect(() => {
    if (prevPathRef.current === pathname) return;
    prevPathRef.current = pathname;
    closePalette();
  }, [pathname, closePalette]);

  if (!paletteOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] md:hidden" role="dialog" aria-modal aria-label={t('header.globalSearchAria')}>
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        aria-label={t('header.closeSearch')}
        onClick={closePalette}
      />
      <div className="absolute inset-x-3 top-[max(0.75rem,env(safe-area-inset-top))] flex max-h-[min(85dvh,calc(100dvh-1.5rem))] flex-col overflow-hidden rounded-2xl border border-border/60 bg-sidebar shadow-token-xl">
        <div className="flex shrink-0 items-center gap-2 border-b border-border/40 px-3 py-2.5 dark:border-white/[0.06]">
          <svg className="h-4 w-4 shrink-0 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={mobilePaletteInputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('header.globalSearchPlaceholder')}
            aria-label={t('header.globalSearchAria')}
            enterKeyHint="search"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            className="min-w-0 flex-1 bg-transparent py-1 text-[15px] text-primary placeholder:text-muted focus:outline-none"
          />
          <button
            type="button"
            onClick={closePalette}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-primary/8 hover:text-primary"
            aria-label={t('header.closeSearch')}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="scrollbar-none min-h-0 flex-1 overflow-y-auto px-2 py-2">
          <p className="px-2 pb-2 text-[11px] leading-snug text-muted">{t('header.globalSearchPaletteHint')}</p>
          <ul className="flex flex-col gap-0.5">
            {filtered.map((s) => (
              <li key={s.to}>
                <Link
                  to={s.to}
                  onClick={closePalette}
                  className="flex items-center gap-3 rounded-lg px-2.5 py-2.5 text-[13px] font-medium text-primary transition-colors hover:bg-primary/6"
                >
                  <span className="truncate">{t(s.labelKey)}</span>
                </Link>
              </li>
            ))}
          </ul>
          {filtered.length === 0 && (
            <p className="px-2.5 py-6 text-center text-[13px] text-muted">{t('header.globalSearchNoShortcuts')}</p>
          )}
        </div>
      </div>
    </div>
  );
}
