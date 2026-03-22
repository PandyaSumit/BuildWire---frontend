import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocalePref } from '@/lib/userPreferences';
import { APP_LOCALES, DEFAULT_LOCALE } from '@/i18n/locales';
import en from '@/locales/en/translation.json';
import ar from '@/locales/ar/translation.json';
import hi from '@/locales/hi/translation.json';
import es from '@/locales/es/translation.json';

const resources = {
  en: { translation: en },
  ar: { translation: ar },
  hi: { translation: hi },
  es: { translation: es },
} as const;

function initialLng() {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;
  return getLocalePref();
}

void i18n.use(initReactI18next).init({
  lng: initialLng(),
  fallbackLng: DEFAULT_LOCALE,
  supportedLngs: [...APP_LOCALES],
  resources: {
    en: resources.en,
    ar: resources.ar,
    hi: resources.hi,
    es: resources.es,
  },
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

export default i18n;
