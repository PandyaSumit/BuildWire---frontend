import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';
import { useSidebarLayout } from '@/layouts/sidebar/SidebarLayoutContext';

/** App-wide search query; wire Elasticsearch (or any backend) to this state later. */
export type GlobalSearchContextValue = {
  query: string;
  setQuery: (value: string) => void;
  inputRef: RefObject<HTMLInputElement>;
  focusSearch: () => void;
  /** Mobile command-palette style overlay (< md) */
  paletteOpen: boolean;
  openPalette: () => void;
  closePalette: () => void;
  mobilePaletteInputRef: RefObject<HTMLInputElement>;
};

const GlobalSearchContext = createContext<GlobalSearchContextValue | null>(null);

function isEditableTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el) return false;
  const tag = el.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable;
}

export function GlobalSearchProvider({ children }: { children: ReactNode }) {
  const { setMobileOpen } = useSidebarLayout();
  const [query, setQuery] = useState('');
  const [paletteOpen, setPaletteOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const mobilePaletteInputRef = useRef<HTMLInputElement>(null);

  const focusSearch = useCallback(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const openPalette = useCallback(() => {
    setMobileOpen(false);
    setPaletteOpen(true);
  }, [setMobileOpen]);

  const closePalette = useCallback(() => {
    setPaletteOpen(false);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== 'k') return;
      const targetNode = e.target as Node | null;
      const fromPaletteInput = Boolean(
        mobilePaletteInputRef.current && targetNode === mobilePaletteInputRef.current,
      );
      if (isEditableTarget(targetNode) && !fromPaletteInput) return;
      e.preventDefault();
      const mobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches;
      if (mobile) {
        setPaletteOpen((open) => {
          if (open) return false;
          setMobileOpen(false);
          return true;
        });
        return;
      }
      inputRef.current?.focus();
      inputRef.current?.select();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [setMobileOpen]);

  const value = useMemo(
    () => ({
      query,
      setQuery,
      inputRef,
      focusSearch,
      paletteOpen,
      openPalette,
      closePalette,
      mobilePaletteInputRef,
    }),
    [query, setQuery, focusSearch, paletteOpen, openPalette, closePalette],
  );

  return <GlobalSearchContext.Provider value={value}>{children}</GlobalSearchContext.Provider>;
}

export function useGlobalSearch(): GlobalSearchContextValue {
  const ctx = useContext(GlobalSearchContext);
  if (!ctx) {
    throw new Error('useGlobalSearch must be used within GlobalSearchProvider');
  }
  return ctx;
}
