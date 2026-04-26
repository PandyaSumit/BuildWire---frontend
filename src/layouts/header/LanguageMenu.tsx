import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Select } from '@/components/ui';
import { APP_LOCALES, type AppLocale } from '@/i18n/locales';
import { changeAppLocale } from '@/i18n/setLocale';

function normalizeLocale(raw: string | undefined): AppLocale {
  const base = (raw ?? 'en').split('-')[0]?.toLowerCase() ?? 'en';
  return (APP_LOCALES as readonly string[]).includes(base) ? (base as AppLocale) : 'en';
}

export function LanguageMenu() {
  const { t, i18n } = useTranslation();
  const value = useMemo(
    () => normalizeLocale(i18n.resolvedLanguage ?? i18n.language),
    [i18n.resolvedLanguage, i18n.language],
  );

  return (
    <Select
      aria-label={t('header.language')}
      options={APP_LOCALES.map((code) => ({
        value: code,
        label: t(`language.${code}`),
      }))}
      value={value}
      onValueChange={(v) => changeAppLocale(v as AppLocale)}
      fullWidth={false}
      triggerClassName="h-9 min-w-[6.5rem] max-w-[11rem] text-start text-sm"
    />
  );
}
