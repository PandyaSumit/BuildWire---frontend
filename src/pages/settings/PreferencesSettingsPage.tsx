import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useTheme, type ThemePreference } from "@/components/theme-provider";
import { LanguageMenu } from "@/components/layout/LanguageMenu";
import { useAppSelector } from "@/store/hooks";
import { Checkbox, Select } from "@/components/ui";
import {
  getDateFormatPref,
  getNotifyDailyDigest,
  getNotifyRfi,
  getTasksDefaultViewPref,
  getUnitsPref,
  setDateFormatPref,
  setNotifyDailyDigest,
  setNotifyRfi,
  setTasksDefaultViewPref,
  setUnitsPref,
  type DateFormatPref,
  type TasksViewPref,
  type UnitsPref,
  type WorkspaceThemePref,
} from "@/lib/userPreferences";

function ThemePreview({ kind }: { kind: ThemePreference }) {
  if (kind === "light") {
    return (
      <div className="mt-3 overflow-hidden rounded-md border border-border bg-[hsl(0_0%_98%)]">
        <div className="flex h-14 gap-0.5 p-1">
          <div className="w-2 rounded-sm bg-[hsl(0_0%_92%)]" />
          <div className="min-w-0 flex-1 rounded-sm bg-white">
            <div className="h-2 w-8 bg-[hsl(0_0%_90%)]" />
          </div>
        </div>
      </div>
    );
  }
  if (kind === "dark") {
    return (
      <div className="mt-3 overflow-hidden rounded-md border border-border bg-[hsl(210_6.5%_12.2%)]">
        <div className="flex h-14 gap-0.5 p-1">
          <div className="w-2 rounded-sm bg-[hsl(210_8%_10%)]" />
          <div className="min-w-0 flex-1 rounded-sm bg-[hsl(210_5%_14%)]">
            <div className="h-2 w-8 bg-[hsl(210_10%_22%)]" />
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="mt-3 flex overflow-hidden rounded-md border border-border">
      <div className="flex h-14 flex-1 gap-0.5 bg-[hsl(0_0%_98%)] p-1">
        <div className="w-1.5 rounded-sm bg-[hsl(0_0%_90%)]" />
        <div className="min-w-0 flex-1 rounded-sm bg-white" />
      </div>
      <div className="flex h-14 flex-1 gap-0.5 bg-[hsl(210_6.5%_12.2%)] p-1">
        <div className="w-1.5 rounded-sm bg-[hsl(210_8%_10%)]" />
        <div className="min-w-0 flex-1 rounded-sm bg-[hsl(210_5%_14%)]" />
      </div>
    </div>
  );
}

/** Preview tokens — keep aligned with `src/styles/workspace-themes.css` and `:root` / `.dark` defaults. */
type WsPreviewTok = {
  bg: string;
  surface: string;
  border: string;
  sidebar: string;
  brand: string;
};

const workspaceThemeMeta: {
  value: WorkspaceThemePref;
  titleKey: string;
  descKey: string;
  light: WsPreviewTok;
  dark: WsPreviewTok;
}[] = [
  {
    value: "neutral",
    titleKey: "prefs.wsNeutralTitle",
    descKey: "prefs.wsNeutralDesc",
    light: {
      bg: "0 0% 98%",
      surface: "0 0% 100%",
      border: "0 0% 90%",
      sidebar: "0 0% 98%",
      brand: "0 0% 9%",
    },
    dark: {
      bg: "210 6.5% 12.2%",
      surface: "0 0% 12%",
      border: "0 0% 20%",
      sidebar: "210 6.5% 12.2%",
      brand: "0 0% 100%",
    },
  },
  {
    value: "general",
    titleKey: "prefs.wsGeneralTitle",
    descKey: "prefs.wsGeneralDesc",
    light: {
      bg: "220 10% 96%",
      surface: "0 0% 100%",
      border: "220 12% 86%",
      sidebar: "220 11% 94%",
      brand: "215 45% 38%",
    },
    dark: {
      bg: "215 14% 8%",
      surface: "215 12% 11%",
      border: "215 12% 22%",
      sidebar: "215 16% 7%",
      brand: "215 72% 70%",
    },
  },
  {
    value: "civil",
    titleKey: "prefs.wsCivilTitle",
    descKey: "prefs.wsCivilDesc",
    light: {
      bg: "200 12% 95%",
      surface: "200 8% 99%",
      border: "200 14% 82%",
      sidebar: "200 14% 93%",
      brand: "204 40% 34%",
    },
    dark: {
      bg: "200 18% 7%",
      surface: "200 14% 10%",
      border: "200 14% 20%",
      sidebar: "200 20% 6%",
      brand: "198 58% 60%",
    },
  },
  {
    value: "mep",
    titleKey: "prefs.wsMepTitle",
    descKey: "prefs.wsMepDesc",
    light: {
      bg: "220 20% 97%",
      surface: "0 0% 100%",
      border: "220 14% 88%",
      sidebar: "220 22% 95%",
      brand: "221 78% 44%",
    },
    dark: {
      bg: "222 18% 7%",
      surface: "222 14% 10%",
      border: "222 14% 20%",
      sidebar: "222 20% 6%",
      brand: "213 90% 66%",
    },
  },
  {
    value: "safety",
    titleKey: "prefs.wsSafetyTitle",
    descKey: "prefs.wsSafetyDesc",
    light: {
      bg: "38 22% 95%",
      surface: "40 35% 99%",
      border: "35 18% 84%",
      sidebar: "36 24% 93%",
      brand: "18 88% 38%",
    },
    dark: {
      bg: "28 16% 8%",
      surface: "26 14% 11%",
      border: "28 14% 22%",
      sidebar: "28 18% 7%",
      brand: "28 96% 56%",
    },
  },
  {
    value: "landscape",
    titleKey: "prefs.wsLandscapeTitle",
    descKey: "prefs.wsLandscapeDesc",
    light: {
      bg: "145 14% 95%",
      surface: "140 22% 99%",
      border: "145 14% 84%",
      sidebar: "148 16% 93%",
      brand: "152 58% 28%",
    },
    dark: {
      bg: "150 16% 7%",
      surface: "148 14% 10%",
      border: "148 14% 20%",
      sidebar: "150 18% 6%",
      brand: "148 55% 48%",
    },
  },
  {
    value: "interiors",
    title: "Interior & finishes",
    description:
      "Warm plaster tones, soft borders, and clay brand suited to interiors and FF&E.",
    light: {
      bg: "28 18% 96%",
      surface: "25 28% 99%",
      border: "22 14% 86%",
      sidebar: "26 20% 94%",
      brand: "12 64% 38%",
    },
    dark: {
      bg: "20 14% 8%",
      surface: "18 12% 11%",
      border: "20 12% 22%",
      sidebar: "22 16% 7%",
      brand: "22 75% 64%",
    },
  },
  {
    value: "developer",
    titleKey: "prefs.wsDeveloperTitle",
    descKey: "prefs.wsDeveloperDesc",
    light: {
      bg: "260 12% 96%",
      surface: "260 8% 100%",
      border: "260 14% 86%",
      sidebar: "262 14% 94%",
      brand: "262 44% 44%",
    },
    dark: {
      bg: "262 16% 7%",
      surface: "260 14% 10%",
      border: "262 14% 20%",
      sidebar: "264 18% 6%",
      brand: "268 58% 70%",
    },
  },
  {
    value: "energy",
    titleKey: "prefs.wsEnergyTitle",
    descKey: "prefs.wsEnergyDesc",
    light: {
      bg: "48 24% 95%",
      surface: "52 40% 99%",
      border: "45 20% 84%",
      sidebar: "48 26% 93%",
      brand: "42 90% 38%",
    },
    dark: {
      bg: "45 18% 7%",
      surface: "42 14% 10%",
      border: "45 14% 20%",
      sidebar: "46 20% 6%",
      brand: "48 92% 54%",
    },
  },
];

function WorkspaceThemePreview({ light, dark }: { light: WsPreviewTok; dark: WsPreviewTok }) {
  const mini = (tok: WsPreviewTok) => (
    <div
      className="flex h-16 min-w-0 flex-1 gap-0.5 p-1"
      style={{ backgroundColor: `hsl(${tok.bg})` }}
    >
      <div
        className="w-2 shrink-0 rounded-sm"
        style={{ backgroundColor: `hsl(${tok.sidebar})` }}
      />
      <div
        className="flex min-w-0 flex-1 flex-col gap-1 rounded-sm border p-1"
        style={{
          backgroundColor: `hsl(${tok.surface})`,
          borderColor: `hsl(${tok.border})`,
        }}
      >
        <div
          className="h-1.5 w-8 max-w-full rounded-sm"
          style={{ backgroundColor: `hsl(${tok.border})` }}
        />
        <div className="mt-auto flex items-center gap-1">
          <div
            className="h-2.5 w-2.5 shrink-0 rounded-sm"
            style={{ backgroundColor: `hsl(${tok.brand})` }}
          />
          <div
            className="h-1.5 flex-1 rounded-sm opacity-60"
            style={{ backgroundColor: `hsl(${tok.border})` }}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div
      className="mt-3 flex overflow-hidden rounded-md border border-border"
      aria-hidden
    >
      {mini(light)}
      {mini(dark)}
    </div>
  );
}

const appearanceOptions: {
  value: ThemePreference;
  titleKey: string;
  descKey: string;
  icon: ReactNode;
}[] = [
  {
    value: "light",
    titleKey: "prefs.appearanceLightTitle",
    descKey: "prefs.appearanceLightDesc",
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <circle cx="12" cy="12" r="4" strokeWidth={2} />
        <path
          strokeWidth={2}
          strokeLinecap="round"
          d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"
        />
      </svg>
    ),
  },
  {
    value: "dark",
    titleKey: "prefs.appearanceDarkTitle",
    descKey: "prefs.appearanceDarkDesc",
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
        />
      </svg>
    ),
  },
  {
    value: "system",
    titleKey: "prefs.appearanceSystemTitle",
    descKey: "prefs.appearanceSystemDesc",
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <rect x={2} y={3} width={20} height={14} rx={2} strokeWidth={2} />
        <path strokeWidth={2} strokeLinecap="round" d="M8 21h8M12 17v4" />
      </svg>
    ),
  },
];

export default function PreferencesSettingsPage() {
  const { t } = useTranslation();
  const user = useAppSelector((s) => s.auth.user);
  const { themePreference, setThemePreference, workspaceTheme, setWorkspaceTheme } =
    useTheme();

  const [draftAppearance, setDraftAppearance] =
    useState<ThemePreference>(themePreference);

  const [dateFormat, setDateFormat] = useState<DateFormatPref>(() =>
    getDateFormatPref(),
  );
  const [tasksView, setTasksView] = useState<TasksViewPref>(() =>
    getTasksDefaultViewPref(),
  );
  const [units, setUnits] = useState<UnitsPref>(() => getUnitsPref());
  const [dailyDigest, setDailyDigest] = useState(() => getNotifyDailyDigest());
  const [rfiNotify, setRfiNotify] = useState(() => getNotifyRfi());

  useEffect(() => {
    setDraftAppearance(themePreference);
  }, [themePreference]);

  const appearanceDirty = draftAppearance !== themePreference;

  const handleSaveAppearance = useCallback(() => {
    setThemePreference(draftAppearance);
  }, [draftAppearance, setThemePreference]);

  const handleCancelAppearance = useCallback(() => {
    setDraftAppearance(themePreference);
  }, [themePreference]);

  const displayName =
    user?.firstName || user?.lastName
      ? [user?.firstName, user?.lastName].filter(Boolean).join(" ")
      : (user?.email ?? "—");

  return (
    <div className="space-y-10 p-6">
      <div>
        <h1 className="text-lg font-semibold text-primary">{t("prefs.title")}</h1>
        <p className="mt-0.5 max-w-2xl text-sm text-secondary">{t("prefs.intro")}</p>
      </div>

      <section className="space-y-4 border-b border-border pb-10">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
          {t("prefs.profile")}
        </h2>
        <div className="rounded-xl border border-border bg-surface px-4 py-4">
          <p className="text-sm font-medium text-primary">{displayName}</p>
          {user?.email && (
            <p className="mt-1 text-sm text-secondary">{user.email}</p>
          )}
          {user?.org?.name && (
            <p className="mt-1 text-sm text-muted">
              {t("prefs.orgLabel", { name: user.org.name })}
            </p>
          )}
        </div>
      </section>

      <section className="space-y-4 border-b border-border pb-10">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
            {t("language.sectionTitle")}
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-secondary">
            {t("language.sectionHint")}
          </p>
        </div>
        <div className="max-w-md space-y-2">
          <p className="text-sm font-medium text-primary">{t("language.label")}</p>
          <LanguageMenu />
        </div>
      </section>

      <section className="space-y-4 border-b border-border pb-10">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
              {t("prefs.appearance")}
            </h2>
            <p className="mt-1 text-sm text-secondary">{t("prefs.appearanceHint")}</p>
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={handleCancelAppearance}
              disabled={!appearanceDirty}
              className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-muted/10 disabled:pointer-events-none disabled:opacity-40"
            >
              {t("prefs.cancel")}
            </button>
            <button
              type="button"
              onClick={handleSaveAppearance}
              disabled={!appearanceDirty}
              className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-40 dark:text-bg"
            >
              {t("prefs.saveChanges")}
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {appearanceOptions.map((opt) => {
            const selected = draftAppearance === opt.value;
            const activeSaved = themePreference === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setDraftAppearance(opt.value)}
                className={`rounded-xl border p-4 text-start transition-colors ${
                  selected
                    ? "border-brand ring-2 ring-brand/25"
                    : "border-border bg-surface hover:bg-muted/5"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-muted">{opt.icon}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-primary">
                        {t(opt.titleKey)}
                      </span>
                      {activeSaved && (
                        <span className="rounded-full bg-brand/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand">
                          {t("prefs.active")}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs leading-snug text-secondary">
                      {t(opt.descKey)}
                    </p>
                  </div>
                </div>
                <ThemePreview kind={opt.value} />
              </button>
            );
          })}
        </div>
      </section>

      <section className="space-y-4 border-b border-border pb-10">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
            {t("prefs.workspaceTheme")}
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-secondary">
            {t("prefs.workspaceThemeHint")}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {workspaceThemeMeta.map((opt) => {
            const selected = workspaceTheme === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setWorkspaceTheme(opt.value)}
                className={`rounded-xl border p-4 text-start transition-colors ${
                  selected
                    ? "border-brand ring-2 ring-brand/25"
                    : "border-border bg-surface hover:bg-muted/5"
                }`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-primary">{t(opt.titleKey)}</span>
                  {selected && (
                    <span className="rounded-full bg-brand/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand">
                      {t("prefs.active")}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs leading-snug text-secondary">
                  {t(opt.descKey)}
                </p>
                <WorkspaceThemePreview light={opt.light} dark={opt.dark} />
                <p className="mt-2 text-[10px] font-medium uppercase tracking-wide text-muted">
                  {t("prefs.previewLightDark")}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      <section className="space-y-4 border-b border-border pb-10">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
          {t("prefs.regional")}
        </h2>
        <Select
          label={t("prefs.dateFormat")}
          options={[
            { value: "iso", label: t("prefs.dfIso") },
            { value: "us", label: t("prefs.dfUs") },
            { value: "eu", label: t("prefs.dfEu") },
          ]}
          value={dateFormat}
          onValueChange={(v) => {
            const next = v as DateFormatPref;
            setDateFormat(next);
            setDateFormatPref(next);
          }}
          triggerClassName="sm:max-w-xs"
        />
      </section>

      <section className="space-y-4 border-b border-border pb-10">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
          {t("prefs.tasks")}
        </h2>
        <Select
          label={t("prefs.tasksDefaultView")}
          options={[
            { value: "list", label: t("prefs.viewList") },
            { value: "kanban", label: t("prefs.viewKanban") },
          ]}
          value={tasksView}
          onValueChange={(v) => {
            const next = v as TasksViewPref;
            setTasksView(next);
            setTasksDefaultViewPref(next);
          }}
          triggerClassName="sm:max-w-xs"
        />
      </section>

      <section className="space-y-4 border-b border-border pb-10">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
          {t("prefs.units")}
        </h2>
        <Select
          label={t("prefs.measurement")}
          options={[
            { value: "imperial", label: t("prefs.imperial") },
            { value: "metric", label: t("prefs.metric") },
          ]}
          value={units}
          onValueChange={(v) => {
            const next = v as UnitsPref;
            setUnits(next);
            setUnitsPref(next);
          }}
          triggerClassName="sm:max-w-xs"
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
          {t("prefs.notifications")}
        </h2>
        <p className="text-sm text-secondary">{t("prefs.notificationsHint")}</p>
        <div className="space-y-3">
          <Checkbox
            label={t("prefs.digest")}
            checked={dailyDigest}
            onChange={(e) => {
              const on = e.target.checked;
              setDailyDigest(on);
              setNotifyDailyDigest(on);
            }}
          />
          <Checkbox
            label={t("prefs.rfiNotify")}
            checked={rfiNotify}
            onChange={(e) => {
              const on = e.target.checked;
              setRfiNotify(on);
              setNotifyRfi(on);
            }}
          />
        </div>
      </section>
    </div>
  );
}
