import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { AppPage } from "@/pages/shared/AppPage";
import {
  BotIntegrationCard,
  buildMockOrganizationWebhookUrl,
  type BotIntegrationPlatform,
} from "@/components/settings/bot-integration-card";
import { useAppSelector } from "@/store/hooks";
import { parseOrgRole, canAccessAdminOnlyOrgSettings } from "@/lib/rbac";
import { Alert } from "@/components/ui/alert";

export default function BotIntegrationsPage() {
  const { t } = useTranslation();
  const org = useAppSelector((s) => s.auth.user?.org);
  const orgRole = parseOrgRole(org?.role);
  const canEdit = canAccessAdminOnlyOrgSettings(orgRole);

  const [waConnected, setWaConnected] = useState(false);
  const [tgConnected, setTgConnected] = useState(false);
  const [copiedPlatform, setCopiedPlatform] =
    useState<BotIntegrationPlatform | null>(null);

  const waUrl = useMemo(
    () => buildMockOrganizationWebhookUrl(org?.id, "whatsapp"),
    [org?.id],
  );
  const tgUrl = useMemo(
    () => buildMockOrganizationWebhookUrl(org?.id, "telegram"),
    [org?.id],
  );

  const clearCopied = useCallback(() => {
    setCopiedPlatform(null);
  }, []);

  const handleCopy = useCallback(
    (platform: BotIntegrationPlatform, url: string) => {
      if (!canEdit) return;
      void navigator.clipboard.writeText(url).then(() => {
        setCopiedPlatform(platform);
        window.setTimeout(clearCopied, 2000);
      });
    },
    [canEdit, clearCopied],
  );

  const labels = useMemo(
    () => ({
      statusConnected: t("botIntegrationsPage.statusConnected"),
      statusDisconnected: t("botIntegrationsPage.statusDisconnected"),
      webhookUrl: t("botIntegrationsPage.webhookUrl"),
      placeholderWebhook: t("botIntegrationsPage.placeholderWebhook"),
      verifyToken: t("botIntegrationsPage.verifyToken"),
      botToken: t("botIntegrationsPage.botToken"),
      secretStored: t("botIntegrationsPage.secretStored"),
      credentialsHint: t("botIntegrationsPage.credentialsHint"),
      credentialsPendingWa: t("botIntegrationsPage.credentialsPendingWa"),
      credentialsPendingTg: t("botIntegrationsPage.credentialsPendingTg"),
      connect: t("botIntegrationsPage.connect"),
      disconnect: t("botIntegrationsPage.disconnect"),
      copy: t("botIntegrationsPage.copy"),
      copied: t("botIntegrationsPage.copied"),
      docs: t("botIntegrationsPage.docs"),
    }),
    [t],
  );

  return (
    <AppPage
      title={t("botIntegrationsPage.title")}
      description={t("botIntegrationsPage.description")}
    >
      <div className="mx-auto space-y-4">
        {!canEdit && (
          <Alert
            variant="warning"
            title={t("botIntegrationsPage.adminBannerTitle")}
          >
            {t("botIntegrationsPage.adminBannerBody")}
          </Alert>
        )}

        <Alert variant="info" title={t("botIntegrationsPage.demoNoteTitle")}>
          {t("botIntegrationsPage.demoNoteBody")}
        </Alert>

        <div className="grid items-start gap-5 sm:grid-cols-2">
          <BotIntegrationCard
            platform="whatsapp"
            title={t("botIntegrationsPage.whatsappTitle")}
            description={t("botIntegrationsPage.whatsappDesc")}
            connected={waConnected}
            canEdit={canEdit}
            webhookUrl={waUrl}
            onConnect={() => setWaConnected(true)}
            onDisconnect={() => setWaConnected(false)}
            labels={labels}
            copied={copiedPlatform === "whatsapp"}
            onCopy={() => handleCopy("whatsapp", waUrl)}
          />
          <BotIntegrationCard
            platform="telegram"
            title={t("botIntegrationsPage.telegramTitle")}
            description={t("botIntegrationsPage.telegramDesc")}
            connected={tgConnected}
            canEdit={canEdit}
            webhookUrl={tgUrl}
            onConnect={() => setTgConnected(true)}
            onDisconnect={() => setTgConnected(false)}
            labels={labels}
            copied={copiedPlatform === "telegram"}
            onCopy={() => handleCopy("telegram", tgUrl)}
          />
        </div>
      </div>
    </AppPage>
  );
}
