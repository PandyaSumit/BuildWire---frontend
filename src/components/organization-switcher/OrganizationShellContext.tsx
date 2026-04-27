import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";
import type { AuthOrg } from "@/store/slices/authSlice";

const STORAGE_KEY = "bw.activeOrganizationId";

export type OrgSwitcherListItem = AuthOrg & {
  /** Shown in the switcher list; replace with API counts when available. */
  projectCount?: number;
  /** Unread in-app items for this org; wire to notifications when available. */
  unreadCount?: number;
};

interface OrganizationShellContextValue {
  memberships: OrgSwitcherListItem[];
  activeOrganizationId: string | null;
  activeMembership: OrgSwitcherListItem | null;
  /** Primary org from `/auth/me` (API-backed context). */
  apiOrganization: AuthOrg | null;
  setActiveOrganization: (organizationId: string) => void;
}

const OrganizationShellContext =
  createContext<OrganizationShellContextValue | null>(null);

function buildMembershipList(userOrg: AuthOrg | undefined, extra: AuthOrg[] | undefined) {
  const list: AuthOrg[] = [];
  if (userOrg) list.push(userOrg);
  if (extra?.length) {
    for (const o of extra) {
      if (!list.some((x) => x.id === o.id)) list.push(o);
    }
  }
  const withUi: OrgSwitcherListItem[] = list.map((o) => ({
    ...o,
    projectCount: undefined,
    unreadCount: 0,
  }));
  return withUi;
}

export function OrganizationShellProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const user = useAppSelector((s) => s.auth.user);
  const apiOrganization = user?.org ?? null;

  const memberships = useMemo(
    () => buildMembershipList(user?.org, user?.organizations),
    [user?.org, user?.organizations]
  );

  const [activeOrganizationId, setActiveOrganizationId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(STORAGE_KEY);
  });

  useEffect(() => {
    setActiveOrganizationId((current) => {
      if (!memberships.length) {
        if (typeof window !== "undefined") window.localStorage.removeItem(STORAGE_KEY);
        return null;
      }
      const stored =
        typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
      const storedValid = stored && memberships.some((m) => m.id === stored);
      const nextId = storedValid ? stored! : memberships[0].id;
      if (nextId !== current) {
        if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, nextId);
        return nextId;
      }
      if (typeof window !== "undefined" && current) {
        window.localStorage.setItem(STORAGE_KEY, current);
      }
      return current;
    });
  }, [memberships]);

  const activeMembership = useMemo(() => {
    if (!memberships.length) return null;
    const match = memberships.find((m) => m.id === activeOrganizationId);
    return match ?? memberships[0];
  }, [memberships, activeOrganizationId]);

  const setActiveOrganization = useCallback(
    (organizationId: string) => {
      if (!memberships.some((m) => m.id === organizationId)) return;
      const prev = activeOrganizationId;
      setActiveOrganizationId(organizationId);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, organizationId);
      }
      if (prev !== organizationId) {
        navigate("/dashboard");
      }
    },
    [memberships, activeOrganizationId, navigate]
  );

  const value = useMemo(
    () => ({
      memberships,
      activeOrganizationId,
      activeMembership,
      apiOrganization,
      setActiveOrganization,
    }),
    [memberships, activeOrganizationId, activeMembership, apiOrganization, setActiveOrganization]
  );

  return (
    <OrganizationShellContext.Provider value={value}>
      {children}
    </OrganizationShellContext.Provider>
  );
}

export function useOrganizationShell() {
  const ctx = useContext(OrganizationShellContext);
  if (!ctx) {
    throw new Error("useOrganizationShell must be used within OrganizationShellProvider");
  }
  return ctx;
}

export function useOptionalOrganizationShell() {
  return useContext(OrganizationShellContext);
}
