import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

const STORAGE_KEY = 'bw:sidebarCollapsed';

type SidebarLayoutContextValue = {
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
  toggle: () => void;
};

const SidebarLayoutContext = createContext<SidebarLayoutContextValue | null>(null);

export function SidebarLayoutProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsedState] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) === '1') {
        setCollapsedState(true);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const setCollapsed = useCallback((value: boolean) => {
    setCollapsedState(value);
    try {
      localStorage.setItem(STORAGE_KEY, value ? '1' : '0');
    } catch {
      /* ignore */
    }
  }, []);

  const toggle = useCallback(() => {
    setCollapsedState((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, next ? '1' : '0');
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const value = useMemo(() => ({ collapsed, setCollapsed, toggle }), [collapsed, setCollapsed, toggle]);

  return <SidebarLayoutContext.Provider value={value}>{children}</SidebarLayoutContext.Provider>;
}

export function useSidebarLayout(): SidebarLayoutContextValue {
  const ctx = useContext(SidebarLayoutContext);
  if (!ctx) {
    throw new Error('useSidebarLayout must be used within SidebarLayoutProvider');
  }
  return ctx;
}
