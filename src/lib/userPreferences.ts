/** Client-only prefs until API exists */

import {
    DEFAULT_LOCALE,
    isAppLocale,
    type AppLocale,
} from '@/i18n/locales';
import type { AiAssistantUserConfig } from '@/components/ai-assistant/types';
export type { AiAssistantPresentation, AiAssistantUserConfig } from '@/components/ai-assistant/types';
import { normalizeAiAssistantUserConfig } from '@/components/ai-assistant/config';

export { DEFAULT_AI_ASSISTANT_USER_CONFIG } from '@/components/ai-assistant/config';

export const PREF_KEYS = {
    dateFormat: 'buildwire-pref-date-format',
    tasksDefaultView: 'buildwire-pref-tasks-view',
    units: 'buildwire-pref-units',
    notifyDailyDigest: 'buildwire-pref-notify-daily',
    notifyRfi: 'buildwire-pref-notify-rfi',
    workspaceTheme: 'buildwire-pref-workspace-theme',
    locale: 'buildwire-pref-locale',
    aiAssistant: 'buildwire-pref-ai-assistant',
    aiAssistantOpen: 'buildwire-pref-ai-assistant-open',
} as const;

export type { AppLocale };
export { DEFAULT_LOCALE };

/** Legacy key when presets were accent-only; migrated on read. */
const LEGACY_WORKSPACE_THEME_KEY = 'buildwire-pref-industry-accent';

export type DateFormatPref = 'iso' | 'us' | 'eu';
export type TasksViewPref = 'list' | 'kanban';
export type UnitsPref = 'imperial' | 'metric';

/** Full UI preset: surfaces, shell, status colors, and brand (see `workspace-themes.css`). */
export type WorkspaceThemePref =
    | 'neutral'
    | 'general'
    | 'civil'
    | 'mep'
    | 'safety'
    | 'landscape'
    | 'interiors'
    | 'developer'
    | 'energy';

export const WORKSPACE_THEME_IDS: readonly WorkspaceThemePref[] = [
    'neutral',
    'general',
    'civil',
    'mep',
    'safety',
    'landscape',
    'interiors',
    'developer',
    'energy',
] as const;

function isWorkspaceThemePref(v: string): v is WorkspaceThemePref {
    return (WORKSPACE_THEME_IDS as readonly string[]).includes(v);
}

function getItem(key: string, fallback: string): string {
    try {
        return localStorage.getItem(key) ?? fallback;
    } catch {
        return fallback;
    }
}

export function getDateFormatPref(): DateFormatPref {
    const v = getItem(PREF_KEYS.dateFormat, 'iso');
    if (v === 'us' || v === 'eu') return v;
    return 'iso';
}

export function setDateFormatPref(v: DateFormatPref) {
    try {
        localStorage.setItem(PREF_KEYS.dateFormat, v);
    } catch {
        /* ignore */
    }
}

export function getTasksDefaultViewPref(): TasksViewPref {
    const v = getItem(PREF_KEYS.tasksDefaultView, 'list');
    return v === 'kanban' ? 'kanban' : 'list';
}

export function setTasksDefaultViewPref(v: TasksViewPref) {
    try {
        localStorage.setItem(PREF_KEYS.tasksDefaultView, v);
    } catch {
        /* ignore */
    }
}

export function getUnitsPref(): UnitsPref {
    const v = getItem(PREF_KEYS.units, 'imperial');
    return v === 'metric' ? 'metric' : 'imperial';
}

export function setUnitsPref(v: UnitsPref) {
    try {
        localStorage.setItem(PREF_KEYS.units, v);
    } catch {
        /* ignore */
    }
}

export function getNotifyDailyDigest(): boolean {
    return getItem(PREF_KEYS.notifyDailyDigest, '0') === '1';
}

export function setNotifyDailyDigest(on: boolean) {
    try {
        localStorage.setItem(PREF_KEYS.notifyDailyDigest, on ? '1' : '0');
    } catch {
        /* ignore */
    }
}

export function getNotifyRfi(): boolean {
    return getItem(PREF_KEYS.notifyRfi, '1') === '1';
}

export function setNotifyRfi(on: boolean) {
    try {
        localStorage.setItem(PREF_KEYS.notifyRfi, on ? '1' : '0');
    } catch {
        /* ignore */
    }
}

export function getWorkspaceThemePref(): WorkspaceThemePref {
    let v = getItem(PREF_KEYS.workspaceTheme, '');
    if (!v) v = getItem(LEGACY_WORKSPACE_THEME_KEY, 'neutral');
    return isWorkspaceThemePref(v) ? v : 'neutral';
}

export function setWorkspaceThemePref(pref: WorkspaceThemePref) {
    try {
        localStorage.setItem(PREF_KEYS.workspaceTheme, pref);
        localStorage.removeItem(LEGACY_WORKSPACE_THEME_KEY);
    } catch {
        /* ignore */
    }
}

export function getLocalePref(): AppLocale {
    const v = getItem(PREF_KEYS.locale, DEFAULT_LOCALE);
    return isAppLocale(v) ? v : DEFAULT_LOCALE;
}

export function setLocalePref(locale: AppLocale) {
    try {
        localStorage.setItem(PREF_KEYS.locale, locale);
    } catch {
        /* ignore */
    }
}

// —— AI assistant (layout + behaviour) ——————————————————————————

export const AI_ASSISTANT_CONFIG_CHANGED = 'bw-ai-assistant-config';

export function getAiAssistantUserConfig(): AiAssistantUserConfig {
    try {
        const raw = localStorage.getItem(PREF_KEYS.aiAssistant);
        if (!raw) return normalizeAiAssistantUserConfig(null);
        const parsed = JSON.parse(raw) as Partial<AiAssistantUserConfig>;
        return normalizeAiAssistantUserConfig(parsed);
    } catch {
        return normalizeAiAssistantUserConfig(null);
    }
}

export function setAiAssistantUserConfig(config: AiAssistantUserConfig) {
    try {
        localStorage.setItem(PREF_KEYS.aiAssistant, JSON.stringify(config));
        window.dispatchEvent(new Event(AI_ASSISTANT_CONFIG_CHANGED));
    } catch {
        /* ignore */
    }
}

export function getAiAssistantOpenState(): boolean | null {
    try {
        const v = localStorage.getItem(PREF_KEYS.aiAssistantOpen);
        if (v === '1') return true;
        if (v === '0') return false;
        return null;
    } catch {
        return null;
    }
}

export function setAiAssistantOpenState(open: boolean) {
    try {
        localStorage.setItem(PREF_KEYS.aiAssistantOpen, open ? '1' : '0');
    } catch {
        /* ignore */
    }
}

export function clearAiAssistantOpenState() {
    try {
        localStorage.removeItem(PREF_KEYS.aiAssistantOpen);
    } catch {
        /* ignore */
    }
}

/** Format ISO date (YYYY-MM-DD) for task tables from user preference. */
export function formatTaskCreatedDate(
    iso: string,
    format: DateFormatPref,
): string {
    const [y, m, d] = iso.split('-').map(Number);
    if (!y || !m || !d) return iso;
    const date = new Date(y, m - 1, d);
    if (Number.isNaN(date.getTime())) return iso;
    if (format === 'iso') {
        return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    }
    if (format === 'us') {
        return new Intl.DateTimeFormat('en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        }).format(date);
    }
    return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(date);
}
