import { useLayoutEffect } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n/i18n';
import { htmlLangFor, isRtlLocale } from '@/i18n/locales';

function syncDocumentLangDir(lng: string) {
  const html = document.documentElement;
  const base = (lng || 'en').split('-')[0] || 'en';
  html.setAttribute('lang', htmlLangFor(base));
  html.setAttribute('dir', isRtlLocale(base) ? 'rtl' : 'ltr');
}

function DocumentI18nSync() {
  useLayoutEffect(() => {
    const run = () => syncDocumentLangDir(i18n.resolvedLanguage ?? i18n.language);
    run();
    i18n.on('languageChanged', run);
    return () => {
      i18n.off('languageChanged', run);
    };
  }, []);
  return null;
}

export function AppI18n({ children }: { children: React.ReactNode }) {
  return (
    <I18nextProvider i18n={i18n}>
      <DocumentI18nSync />
      {children}
    </I18nextProvider>
  );
}
