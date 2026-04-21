import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export type BotIntegrationPlatform = "whatsapp" | "telegram";

export interface BotIntegrationCardLabels {
  statusConnected: string;
  statusDisconnected: string;
  webhookUrl: string;
  placeholderWebhook: string;
  verifyToken: string;
  botToken: string;
  secretStored: string;
  credentialsHint: string;
  credentialsPendingWa: string;
  credentialsPendingTg: string;
  connect: string;
  disconnect: string;
  copy: string;
  copied: string;
  docs: string;
}

export interface BotIntegrationCardProps {
  platform: BotIntegrationPlatform;
  title: string;
  description: string;
  connected: boolean;
  canEdit: boolean;
  webhookUrl: string;
  onConnect: () => void;
  onDisconnect: () => void;
  labels: BotIntegrationCardLabels;
  copied: boolean;
  onCopy: () => void;
  /** Override default vendor documentation URL */
  docsHref?: string;
}

const DEFAULT_DOCS: Record<BotIntegrationPlatform, string> = {
  whatsapp: "https://developers.facebook.com/docs/whatsapp/cloud-api",
  telegram: "https://core.telegram.org/bots/api",
};

export function buildMockOrganizationWebhookUrl(
  orgId: string | undefined,
  platform: BotIntegrationPlatform,
): string {
  const origin =
    typeof globalThis !== "undefined" &&
    "location" in globalThis &&
    globalThis.location?.origin
      ? globalThis.location.origin
      : "https://app.buildwire.io";
  const id = orgId ?? "…";
  return `${origin}/api/v1/organizations/${id}/integrations/${platform}/webhook`;
}

function PlatformIcon({ platform }: { platform: BotIntegrationPlatform }) {
  if (platform === "whatsapp") {
    return (
      <svg viewBox="0 0 24 24" className="h-9 w-9 shrink-0" aria-hidden>
        <path
          fill="#25D366"
          d="M12.04 2C6.58 2 2.2 6.37 2.2 11.8c0 1.88.49 3.65 1.35 5.18L2 22l5.17-1.5a9.9 9.9 0 005.87 1.89h.01c5.46 0 9.84-4.37 9.84-9.8C22.9 6.35 18.5 2 12.04 2zm5.43 13.97c-.23.64-1.13 1.18-1.55 1.26-.4.08-.91.12-1.47-.12-.34-.14-1.38-.54-2.64-1.7-1.23-1.15-2.05-2.57-2.29-3-.25-.43-.03-.66.17-.87.18-.2.4-.52.6-.78.2-.26.27-.44.4-.73.13-.29.07-.55-.03-.78-.1-.23-.86-2.08-1.18-2.85-.31-.74-.63-.64-.86-.65h-.73c-.25 0-.66.1-1 .49-.34.4-1.3 1.27-1.3 3.08 0 1.81 1.32 3.56 1.5 3.81.18.25 2.6 3.97 6.3 5.56.88.38 1.57.61 2.1.78.88.28 1.68.24 2.31.15.7-.11 2.15-.88 2.45-1.73.3-.85.3-1.58.21-1.73-.1-.15-.35-.24-.73-.42z"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="h-9 w-9 shrink-0" aria-hidden>
      <path
        fill="#229ED9"
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.83 5.42-1.17 7.19-.14.75-.42 1-.69 1.03-.59.05-1.04-.39-1.61-.76-.89-.58-1.39-.94-2.25-1.5-1-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.13-.31-1.09-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.23.14.33-.01.06.01.24 0 .38z"
      />
    </svg>
  );
}

function CredentialOkIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
      />
    </svg>
  );
}

function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
      />
    </svg>
  );
}

export function BotIntegrationCard({
  platform,
  title,
  description,
  connected,
  canEdit,
  webhookUrl,
  onConnect,
  onDisconnect,
  labels,
  copied,
  onCopy,
  docsHref,
}: BotIntegrationCardProps) {
  const disabled = !canEdit;
  const accent =
    platform === "whatsapp" ? "from-[#25D366]/25" : "from-[#229ED9]/25";
  const pendingCredentials =
    platform === "whatsapp"
      ? labels.credentialsPendingWa
      : labels.credentialsPendingTg;
  const credentialTitle =
    platform === "whatsapp" ? labels.verifyToken : labels.botToken;
  const docsUrl = docsHref ?? DEFAULT_DOCS[platform];

  return (
    <article className="relative flex flex-col overflow-hidden rounded-2xl border border-border bg-elevated shadow-token-md dark:shadow-[0_0_0_1px_hsl(0_0%_100%/0.05)_inset,0_14px_44px_-14px_rgb(0_0_0/0.6)]">
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent ${accent} to-transparent`}
        aria-hidden
      />
      <div className="flex flex-col p-5 sm:p-6">
        <div className="flex flex-wrap items-start gap-4">
          <div className="flex min-w-0 flex-1 gap-4">
            <div className="flex h-[3.25rem] w-[3.25rem] shrink-0 items-center justify-center rounded-2xl border border-border/90 bg-bg/80 shadow-[inset_0_1px_0_0_hsl(0_0%_100%/0.06)]">
              <PlatformIcon platform={platform} />
            </div>
            <div className="min-w-0 pt-0.5">
              <div className="flex flex-wrap items-center gap-2.5 gap-y-1">
                <h2 className="text-[17px] font-semibold leading-tight tracking-tight text-primary">
                  {title}
                </h2>
                <Badge
                  variant={connected ? "success" : "secondary"}
                  size="md"
                  shape="pill"
                  dot
                >
                  {connected
                    ? labels.statusConnected
                    : labels.statusDisconnected}
                </Badge>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-secondary">
                {description}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-5">
          <div>
            <p className="mb-2 text-[12.5px] font-medium text-primary">
              {labels.webhookUrl}
            </p>
            {connected ? (
              <div
                className="overflow-hidden rounded-xl border border-border bg-bg/90 shadow-[inset_0_1px_0_0_hsl(0_0%_100%/0.04)]"
                title={webhookUrl}
              >
                <div className="flex flex-col sm:flex-row sm:items-stretch">
                  <div className="min-h-[2.65rem] min-w-0 flex-1 overflow-x-auto overscroll-x-contain px-3 py-2.5 font-mono text-[11px] leading-snug text-primary [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border">
                    <span className="inline-block whitespace-nowrap">{webhookUrl}</span>
                  </div>
                  <div className="flex shrink-0 border-t border-border/80 bg-bg/55 p-1.5 sm:w-[5.5rem] sm:border-l sm:border-t-0 sm:bg-bg/40 sm:p-1">
                    <Button
                      type="button"
                      variant="secondary"
                      size="md"
                      className="h-9 w-full rounded-md border-0 shadow-none sm:h-full sm:min-h-0 sm:rounded-md"
                      onClick={onCopy}
                      disabled={disabled}
                    >
                      {copied ? labels.copied : labels.copy}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border/70 bg-bg/40 px-3.5 py-4 text-center text-sm text-muted">
                {labels.placeholderWebhook}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-border/80 bg-bg/35 p-4">
            <p className="text-[12.5px] font-medium text-primary">
              {credentialTitle}
            </p>
            {connected ? (
              <div className="mt-3 flex gap-3 rounded-lg border border-success/25 bg-success/[0.07] px-3 py-3">
                <CredentialOkIcon className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-success">
                    {labels.secretStored}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-secondary">
                    {labels.credentialsHint}
                  </p>
                </div>
              </div>
            ) : (
              <p className="mt-2 text-sm leading-relaxed text-secondary">
                {pendingCredentials}
              </p>
            )}
          </div>
        </div>

        <div className="relative mt-5 flex flex-col gap-3 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-border"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-x-0 top-px h-px bg-gradient-to-r from-transparent via-black/[0.07] to-transparent dark:via-white/10"
            aria-hidden
          />
          <div className="flex flex-wrap gap-2">
            {connected ? (
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={onDisconnect}
                disabled={disabled}
                className="border-danger/45 text-danger hover:border-danger/60 hover:bg-danger/10 hover:text-danger"
              >
                {labels.disconnect}
              </Button>
            ) : (
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={onConnect}
                disabled={disabled}
              >
                {labels.connect}
              </Button>
            )}
          </div>
          <a
            href={docsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 shrink-0 items-center justify-center gap-2 self-start rounded-lg border border-border bg-surface/80 px-3.5 text-[13px] font-medium text-primary shadow-token-xs transition-all duration-150 hover:border-border/80 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-1 focus-visible:ring-offset-elevated sm:self-auto"
          >
            {labels.docs}
            <ExternalLinkIcon className="h-3.5 w-3.5 text-muted" />
          </a>
        </div>
      </div>
    </article>
  );
}
