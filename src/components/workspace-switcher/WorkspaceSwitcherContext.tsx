import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";

export type WorkspaceId = "project" | "hiring" | "messages";

interface WorkspaceSwitcherContextValue {
  activeWorkspace: WorkspaceId;
  isSwitching: boolean;
  pendingWorkspace: WorkspaceId | null;
  switchVersion: number;
  switchWorkspace: (next: WorkspaceId) => void;
}

const STORAGE_KEY = "bw.activeWorkspace";

const defaultRouteByWorkspace: Record<WorkspaceId, string> = {
  project: "/dashboard",
  hiring: "/hiring",
  messages: "/messages",
};

function inferWorkspaceFromPath(pathname: string): WorkspaceId {
  if (pathname.startsWith("/hiring")) return "hiring";
  if (pathname.startsWith("/messages")) return "messages";
  return "project";
}

const WorkspaceSwitcherContext =
  createContext<WorkspaceSwitcherContextValue | null>(null);

export function WorkspaceSwitcherProvider({
  children,
}: {
  children: ReactNode;
}) {
  const location = useLocation();
  const navigate = useNavigate();

  const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceId>(() => {
    if (typeof window === "undefined") return "project";
    const stored = window.localStorage.getItem(STORAGE_KEY) as WorkspaceId | null;
    if (stored === "project" || stored === "hiring" || stored === "messages") {
      return stored;
    }
    return "project";
  });
  const [isSwitching, setIsSwitching] = useState(false);
  const [pendingWorkspace, setPendingWorkspace] = useState<WorkspaceId | null>(null);
  const [switchVersion, setSwitchVersion] = useState(0);
  const switchTokenRef = useRef(0);

  useEffect(() => {
    const routeWorkspace = inferWorkspaceFromPath(location.pathname);
    setActiveWorkspace(routeWorkspace);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, routeWorkspace);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (!isSwitching) return;
    if (!pendingWorkspace) return;

    const routeWorkspace = inferWorkspaceFromPath(location.pathname);
    if (routeWorkspace !== pendingWorkspace) return;

    // Keep a brief setup phase to avoid rendering stale/partial UI frames.
    const token = switchTokenRef.current;
    const timeout = window.setTimeout(() => {
      if (switchTokenRef.current !== token) return;
      setIsSwitching(false);
      setPendingWorkspace(null);
      setSwitchVersion((v) => v + 1);
    }, 180);

    return () => window.clearTimeout(timeout);
  }, [isSwitching, pendingWorkspace, location.pathname]);

  const switchWorkspace = useCallback(
    (next: WorkspaceId) => {
      if (next === activeWorkspace && !isSwitching) return;
      switchTokenRef.current += 1;
      setPendingWorkspace(next);
      setIsSwitching(true);
      setActiveWorkspace(next);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, next);
      }
      navigate(defaultRouteByWorkspace[next]);
    },
    [activeWorkspace, isSwitching, navigate]
  );

  const value = useMemo(
    () => ({
      activeWorkspace,
      isSwitching,
      pendingWorkspace,
      switchVersion,
      switchWorkspace,
    }),
    [activeWorkspace, isSwitching, pendingWorkspace, switchVersion, switchWorkspace]
  );

  return (
    <WorkspaceSwitcherContext.Provider value={value}>
      {children}
    </WorkspaceSwitcherContext.Provider>
  );
}

export function useWorkspaceSwitcher() {
  const ctx = useContext(WorkspaceSwitcherContext);
  if (!ctx) {
    throw new Error(
      "useWorkspaceSwitcher must be used within WorkspaceSwitcherProvider"
    );
  }
  return ctx;
}
