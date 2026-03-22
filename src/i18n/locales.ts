/** Phase 1 launch locales. Phase 2: extend with de, fr, zh-CN, etc. */
export const APP_LOCALES = ['en', 'ar', 'hi', 'es'] as const;
export type AppLocale = (typeof APP_LOCALES)[number];

export const DEFAULT_LOCALE: AppLocale = 'en';

export function isAppLocale(v: string): v is AppLocale {
  return (APP_LOCALES as readonly string[]).includes(v);
}

/** BCP-47 style for <html lang> (base code, e.g. en, ar, hi, es). */
export function htmlLangFor(base: string): string {
  const b = base.split('-')[0]?.toLowerCase() ?? 'en';
  if (b === 'hi') return 'hi-IN';
  if (b === 'ar') return 'ar';
  if (b === 'es') return 'es';
  return 'en';
}

export function isRtlLocale(locale: string): boolean {
  const base = locale.split('-')[0]?.toLowerCase() ?? 'en';
  return base === 'ar' || base === 'he' || base === 'fa' || base === 'ur';
}
