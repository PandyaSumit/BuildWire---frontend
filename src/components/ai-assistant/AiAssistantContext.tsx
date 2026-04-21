import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import {
  AI_ASSISTANT_CONFIG_CHANGED,
  clearAiAssistantOpenState,
  getAiAssistantOpenState,
  getAiAssistantUserConfig,
  setAiAssistantOpenState,
  setAiAssistantUserConfig,
  type AiAssistantUserConfig,
} from '@/lib/userPreferences';
import type { AiAssistantPresentation, AiAssistantRuntimeOptions } from './types';
import { AI_ASSISTANT_BREAKPOINT } from './types';

function subscribeNarrowViewport(cb: () => void) {
  const mq = window.matchMedia(AI_ASSISTANT_BREAKPOINT);
  mq.addEventListener('change', cb);
  return () => mq.removeEventListener('change', cb);
}

function getNarrowViewportSnapshot() {
  return window.matchMedia(AI_ASSISTANT_BREAKPOINT).matches;
}

function getNarrowViewportServer() {
  return false;
}

function resolvePresentation(
  pref: AiAssistantPresentation,
  isNarrow: boolean,
): AiAssistantPresentation {
  if (isNarrow && (pref === 'dock_end' || pref === 'dock_start')) return 'modal';
  return pref;
}

export type AiAssistantContextValue = {
  open: boolean;
  setOpen: (next: boolean) => void;
  toggle: () => void;
  userConfig: AiAssistantUserConfig;
  setUserConfig: (next: AiAssistantUserConfig) => void;
  /** Presentation after responsive rules */
  effectivePresentation: AiAssistantPresentation;
  dockWidthPx: number;
  runtime: AiAssistantRuntimeOptions;
  setRuntime: (patch: AiAssistantRuntimeOptions) => void;
};

const AiAssistantContext = createContext<AiAssistantContextValue | null>(null);

export function AiAssistantProvider({
  children,
  initialRuntime,
}: {
  children: ReactNode;
  initialRuntime?: AiAssistantRuntimeOptions;
}) {
  const isNarrow = useSyncExternalStore(
    subscribeNarrowViewport,
    getNarrowViewportSnapshot,
    getNarrowViewportServer,
  );

  const [userConfig, setUserConfigState] = useState<AiAssistantUserConfig>(() =>
    getAiAssistantUserConfig(),
  );

  const [open, setOpenState] = useState<boolean>(() => {
    const cfg = getAiAssistantUserConfig();
    if (cfg.rememberOpen) {
      const stored = getAiAssistantOpenState();
      if (stored !== null) return stored;
    }
    return cfg.defaultOpen;
  });

  const [runtime, setRuntimeState] = useState<AiAssistantRuntimeOptions>(
    () => initialRuntime ?? {},
  );

  const rememberOpenRef = useRef(userConfig.rememberOpen);
  useEffect(() => {
    rememberOpenRef.current = userConfig.rememberOpen;
  }, [userConfig.rememberOpen]);

  useEffect(() => {
    const onCfg = () => {
      const next = getAiAssistantUserConfig();
      setUserConfigState(next);
      if (!next.rememberOpen) {
        clearAiAssistantOpenState();
        setOpenState(next.defaultOpen);
      } else {
        const stored = getAiAssistantOpenState();
        if (stored !== null) setOpenState(stored);
      }
    };
    window.addEventListener(AI_ASSISTANT_CONFIG_CHANGED, onCfg);
    return () => window.removeEventListener(AI_ASSISTANT_CONFIG_CHANGED, onCfg);
  }, []);

  const setUserConfig = useCallback((next: AiAssistantUserConfig) => {
    setAiAssistantUserConfig(next);
    setUserConfigState(next);
    if (!next.rememberOpen) {
      clearAiAssistantOpenState();
      setOpenState(next.defaultOpen);
    }
  }, []);

  const setOpen = useCallback((next: boolean) => {
    setOpenState(next);
    if (rememberOpenRef.current) setAiAssistantOpenState(next);
  }, []);

  const toggle = useCallback(() => {
    setOpenState((prev) => {
      const next = !prev;
      if (rememberOpenRef.current) setAiAssistantOpenState(next);
      return next;
    });
  }, []);

  const setRuntime = useCallback((patch: AiAssistantRuntimeOptions) => {
    setRuntimeState((prev) => ({ ...prev, ...patch }));
  }, []);

  const effectivePresentation = useMemo(
    () => resolvePresentation(userConfig.presentation, isNarrow),
    [userConfig.presentation, isNarrow],
  );

  const value = useMemo<AiAssistantContextValue>(
    () => ({
      open,
      setOpen,
      toggle,
      userConfig,
      setUserConfig,
      effectivePresentation,
      dockWidthPx: userConfig.widthPx,
      runtime,
      setRuntime,
    }),
    [
      open,
      setOpen,
      toggle,
      userConfig,
      setUserConfig,
      effectivePresentation,
      runtime,
      setRuntime,
    ],
  );

  return (
    <AiAssistantContext.Provider value={value}>{children}</AiAssistantContext.Provider>
  );
}

export function useAiAssistant(): AiAssistantContextValue {
  const ctx = useContext(AiAssistantContext);
  if (!ctx) {
    throw new Error('useAiAssistant must be used within AiAssistantProvider');
  }
  return ctx;
}

export function useOptionalAiAssistant(): AiAssistantContextValue | null {
  return useContext(AiAssistantContext);
}
