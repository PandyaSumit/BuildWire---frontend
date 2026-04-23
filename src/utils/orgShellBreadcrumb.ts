/**
 * Maps the current URL (org dashboard shell, not inside `/projects/:id/...`)
 * to an i18n key under `nav.*` for the header breadcrumb.
 * Returns `null` when no known mapping — caller may format a fallback label.
 */
export function orgShellBreadcrumbNavKey(pathname: string): string | null {
    const path = pathname.replace(/\/+$/, "") || "/";

    if (path === "/dashboard") return "nav.dashboard";
    if (path === "/projects") return "nav.projects";
    if (path === "/sales") return "nav.salesCrm";
    if (path === "/brokers") return "nav.brokers";
    if (path === "/intelligence/ai-map") return "nav.aiMap";
    if (path === "/team") return "nav.team";

    if (path === "/settings" || path.startsWith("/settings/preferences"))
        return "nav.preferences";
    if (path.startsWith("/settings/roles")) return "nav.rolesPermissions";
    if (path.startsWith("/settings/organization")) return "nav.organization";
    if (path.startsWith("/settings/billing")) return "nav.billing";
    if (path.startsWith("/settings/bot-integrations"))
        return "nav.botIntegrations";

    return null;
}

/** Title-case fallback from the first path segment (e.g. `/foo-bar` → "Foo Bar"). */
export function formatShellBreadcrumbFallback(pathname: string): string {
    const seg = pathname.split("/").filter(Boolean)[0] ?? "";
    if (!seg) return "";
    return seg
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(" ");
}
