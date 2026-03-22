import i18n from '@/i18n/i18n';
import { setLocalePref, type AppLocale } from '@/lib/userPreferences';

/** Persist and apply UI language (updates <html lang dir> via AppI18n). */
export function changeAppLocale(locale: AppLocale) {
  setLocalePref(locale);
  void i18n.changeLanguage(locale);
}
