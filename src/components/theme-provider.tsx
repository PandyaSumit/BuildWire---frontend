import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import {
  getWorkspaceThemePref,
  setWorkspaceThemePref,
  type WorkspaceThemePref,
} from "@/lib/userPreferences";

export type { WorkspaceThemePref };

export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

const STORAGE_KEY = "buildwire-theme-preference";
const LEGACY_THEME_KEY = "theme";

function readInitialPreference(): ThemePreference {
  if (typeof window === "undefined") return "system";
  try {
    const v = localStorage.getItem(STORAGE_KEY) as ThemePreference | null;
    if (v === "light" || v === "dark" || v === "system") return v;
    const legacy = localStorage.getItem(LEGACY_THEME_KEY) as
      | "light"
      | "dark"
      | null;
    if (legacy === "light" || legacy === "dark") return legacy;
  } catch {
    /* ignore */
  }
  return "system";
}

function readInitialSystemDark(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function applyDom(resolved: ResolvedTheme) {
  if (resolved === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}

function applyWorkspaceThemeDom(pref: WorkspaceThemePref) {
  const el = document.documentElement;
  if (pref === "neutral") {
    el.removeAttribute("data-ws-theme");
  } else {
    el.setAttribute("data-ws-theme", pref);
  }
}

type ThemeContextType = {
  /** User choice: light, dark, or follow OS */
  themePreference: ThemePreference;
  /** Effective light/dark after resolving system */
  resolvedTheme: ResolvedTheme;
  setThemePreference: (preference: ThemePreference) => void;
  /** Sets explicit light or dark (same as setThemePreference) */
  setTheme: (theme: ResolvedTheme) => void;
  /** Flips between light and dark explicitly (leaves system if you call setThemePreference) */
  toggleTheme: () => void;
  /** Surfaces, shell, status, and brand preset (pairs with appearance above). */
  workspaceTheme: WorkspaceThemePref;
  setWorkspaceTheme: (pref: WorkspaceThemePref) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themePreference, setThemePreferenceState] = useState<ThemePreference>(
    readInitialPreference,
  );
  const [workspaceTheme, setWorkspaceThemeState] = useState<WorkspaceThemePref>(
    () => getWorkspaceThemePref(),
  );
  const [systemDark, setSystemDark] = useState(readInitialSystemDark);

  const resolvedTheme: ResolvedTheme = useMemo(
    () =>
      themePreference === "system"
        ? systemDark
          ? "dark"
          : "light"
        : themePreference,
    [themePreference, systemDark],
  );

  useEffect(() => {
    applyDom(resolvedTheme);
  }, [resolvedTheme]);

  useLayoutEffect(() => {
    applyWorkspaceThemeDom(workspaceTheme);
  }, [workspaceTheme]);

  useEffect(() => {
    if (themePreference !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setSystemDark(mq.matches);
    mq.addEventListener("change", onChange);
    setSystemDark(mq.matches);
    return () => mq.removeEventListener("change", onChange);
  }, [themePreference]);

  const setThemePreference = useCallback((preference: ThemePreference) => {
    setThemePreferenceState(preference);
    try {
      localStorage.setItem(STORAGE_KEY, preference);
      localStorage.removeItem(LEGACY_THEME_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const setTheme = useCallback(
    (theme: ResolvedTheme) => {
      setThemePreference(theme);
    },
    [setThemePreference],
  );

  const toggleTheme = useCallback(() => {
    setThemePreference(resolvedTheme === "dark" ? "light" : "dark");
  }, [resolvedTheme, setThemePreference]);

  const setWorkspaceTheme = useCallback((pref: WorkspaceThemePref) => {
    setWorkspaceThemeState(pref);
    setWorkspaceThemePref(pref);
  }, []);

  const value = useMemo(
    () => ({
      themePreference,
      resolvedTheme,
      setThemePreference,
      setTheme,
      toggleTheme,
      workspaceTheme,
      setWorkspaceTheme,
    }),
    [
      themePreference,
      resolvedTheme,
      setThemePreference,
      setTheme,
      toggleTheme,
      workspaceTheme,
      setWorkspaceTheme,
    ],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
