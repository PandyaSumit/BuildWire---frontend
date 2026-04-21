import { useTranslation } from 'react-i18next';

export function AiAssistantDefaultBody() {
  const { t } = useTranslation();
  return (
    <div className="space-y-3 text-sm leading-relaxed opacity-90">
      <p>{t('aiAssistant.placeholderIntro')}</p>
      <p className="text-xs opacity-75">{t('aiAssistant.placeholderHint')}</p>
    </div>
  );
}
