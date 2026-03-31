import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useGlobalSearch } from '@/components/layout/GlobalSearchContext';

type GlobalSearchBarProps = {
  className?: string;
};

function useIsApplePlatform() {
  if (typeof navigator === 'undefined') return false;
  return /Mac|iPhone|iPad|iPod/.test(navigator.userAgent);
}

export function GlobalSearchBar({ className }: GlobalSearchBarProps) {
  const { t } = useTranslation();
  const { query, setQuery, inputRef, focusSearch } = useGlobalSearch();
  const apple = useIsApplePlatform();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== 'k') return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }
      e.preventDefault();
      focusSearch();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [focusSearch]);

  return (
    <div className={['relative w-full max-w-lg min-w-[7.5rem]', className].filter(Boolean).join(' ')}>
      <svg
        className="pointer-events-none absolute start-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t('header.globalSearchPlaceholder')}
        aria-label={t('header.globalSearchAria')}
        enterKeyHint="search"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        className="h-9 w-full rounded-lg border border-border/70 bg-bg py-2 ps-9 pe-16 text-[13px] text-primary placeholder:text-muted shadow-token-xs transition-all duration-150 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/40 dark:border-white/[0.07]"
      />
      <span
        className="pointer-events-none absolute end-2 top-1/2 hidden -translate-y-1/2 select-none items-center gap-0.5 sm:flex"
        aria-hidden
      >
        <kbd className="rounded border border-border/80 bg-muted/15 px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted">
          {apple ? '⌘' : 'Ctrl'}
        </kbd>
        <kbd className="rounded border border-border/80 bg-muted/15 px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted">
          K
        </kbd>
      </span>
    </div>
  );
}
