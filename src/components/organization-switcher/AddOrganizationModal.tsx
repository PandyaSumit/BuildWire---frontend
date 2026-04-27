import { useEffect, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Button } from "@/components/ui/button";

type Path = "create" | "join";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function AddOrganizationModal({ open, onClose }: Props) {
  const { t } = useTranslation();
  const [path, setPath] = useState<Path>("create");
  const [orgName, setOrgName] = useState("");
  const [orgType, setOrgType] = useState("contractor");
  const [country, setCountry] = useState("");
  const [timezone, setTimezone] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [showThanks, setShowThanks] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitted) onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, submitted, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      setPath("create");
      setOrgName("");
      setOrgType("contractor");
      setCountry("");
      setTimezone("");
      setInviteCode("");
      setSubmitted(false);
      setShowThanks(false);
    }
  }, [open]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    window.setTimeout(() => {
      setSubmitted(false);
      setShowThanks(true);
    }, 280);
  }

  const orgTypes = [
    { value: "contractor", label: t("orgSwitcher.create.orgTypeContractor") },
    { value: "developer", label: t("orgSwitcher.create.orgTypeDeveloper") },
    { value: "consultant", label: t("orgSwitcher.create.orgTypeConsultant") },
    { value: "owner", label: t("orgSwitcher.create.orgTypeOwner") },
  ];

  if (!open || typeof document === "undefined") return null;

  const modal = (
    <div className="fixed inset-0 z-[130] flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/55 backdrop-blur-[3px]"
        aria-label={t("common.closeDialog")}
        onClick={() => !submitted && !showThanks && onClose()}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-org-title"
        className="relative z-10 flex max-h-[min(92dvh,720px)] w-full max-w-xl flex-col rounded-t-2xl border border-border bg-elevated shadow-token-xl sm:mx-4 sm:rounded-2xl"
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-border/60 px-4 pb-3 pt-4 sm:px-6 sm:pb-3 sm:pt-4">
          <div className="min-w-0">
            <h2 id="add-org-title" className="text-[17px] font-semibold tracking-tight text-primary">
              {showThanks ? t("orgSwitcher.thanksTitle") : t("orgSwitcher.addModalTitle")}
            </h2>
            <p className="mt-1 text-[13px] leading-snug text-secondary">
              {showThanks ? t("orgSwitcher.thanksBody") : t("orgSwitcher.addModalSubtitle")}
            </p>
          </div>
          <button
            type="button"
            onClick={() => !submitted && !showThanks && onClose()}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-muted transition-colors hover:bg-primary/8 hover:text-primary"
            aria-label={t("common.closeDialog")}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 py-3 sm:px-6 sm:py-4">
          {showThanks ? (
            <div className="rounded-xl border border-brand/25 bg-brand/8 px-4 py-6 text-center">
              <p className="text-[14px] font-medium text-primary">{t("orgSwitcher.thanksHint")}</p>
            </div>
          ) : (
            <>
          <SegmentedControl<Path>
            value={path}
            onChange={setPath}
            variant="underline"
            className="mb-3"
            options={[
              { value: "create", label: t("orgSwitcher.tabCreate") },
              { value: "join", label: t("orgSwitcher.tabJoin") },
            ]}
          />

          <form id="add-org-form" onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            {path === "create" ? (
              <>
                <div className="min-w-0">
                  <label htmlFor="bw-new-org-name" className="mb-1.5 block text-[12px] font-medium text-primary">
                    {t("orgSwitcher.create.nameLabel")}
                  </label>
                  <input
                    id="bw-new-org-name"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder={t("orgSwitcher.create.namePlaceholder")}
                    className="w-full min-w-0 rounded-lg border border-border bg-bg px-3 py-2.5 text-[13px] text-primary outline-none ring-brand/0 transition-[box-shadow] focus:border-brand/40 focus:ring-2 focus:ring-brand/25"
                    autoComplete="organization"
                  />
                </div>
                <div>
                  <span className="mb-2 block text-[12px] font-medium text-primary">
                    {t("orgSwitcher.create.typeLabel")}
                  </span>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {orgTypes.map((o) => (
                      <button
                        key={o.value}
                        type="button"
                        onClick={() => setOrgType(o.value)}
                        className={`flex min-h-[2.75rem] w-full min-w-0 items-center justify-start rounded-lg border px-3 py-2.5 text-left text-[13px] font-medium leading-snug transition-colors ${
                          orgType === o.value
                            ? "border-brand/40 bg-brand/10 text-primary"
                            : "border-border bg-bg text-secondary hover:border-border/80"
                        }`}
                      >
                        <span className="whitespace-normal break-words">{o.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2">
                  <div className="min-w-0">
                    <label htmlFor="bw-new-org-country" className="mb-1.5 block text-[12px] font-medium text-primary">
                      {t("orgSwitcher.create.countryLabel")}
                    </label>
                    <input
                      id="bw-new-org-country"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder={t("orgSwitcher.create.countryPlaceholder")}
                      className="w-full min-w-0 rounded-lg border border-border bg-bg px-3 py-2.5 text-[13px] text-primary outline-none focus:border-brand/40 focus:ring-2 focus:ring-brand/25"
                    />
                  </div>
                  <div className="min-w-0">
                    <label htmlFor="bw-new-org-tz" className="mb-1.5 block text-[12px] font-medium text-primary">
                      {t("orgSwitcher.create.timezoneLabel")}
                    </label>
                    <input
                      id="bw-new-org-tz"
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      placeholder={t("orgSwitcher.create.timezonePlaceholder")}
                      className="w-full min-w-0 rounded-lg border border-border bg-bg px-3 py-2.5 text-[13px] text-primary outline-none focus:border-brand/40 focus:ring-2 focus:ring-brand/25"
                    />
                  </div>
                </div>
                <p className="rounded-lg border border-border/80 bg-primary/[0.03] px-3 py-2.5 text-[12px] leading-relaxed text-secondary">
                  {t("orgSwitcher.create.hint")}
                </p>
              </>
            ) : (
              <div>
                <label htmlFor="bw-invite-code" className="mb-1.5 block text-[12px] font-medium text-primary">
                  {t("orgSwitcher.join.codeLabel")}
                </label>
                <input
                  id="bw-invite-code"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  placeholder={t("orgSwitcher.join.codePlaceholder")}
                  className="w-full rounded-lg border border-border bg-bg px-3 py-2.5 font-mono text-[13px] text-primary outline-none focus:border-brand/40 focus:ring-2 focus:ring-brand/25"
                  autoCapitalize="characters"
                />
                <p className="mt-2 text-[12px] leading-relaxed text-secondary">{t("orgSwitcher.join.hint")}</p>
              </div>
            )}
          </form>
            </>
          )}
        </div>

        <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-border/60 bg-elevated px-4 py-3 sm:flex-row sm:justify-end sm:px-6 sm:py-3">
          {showThanks ? (
            <Button type="button" variant="primary" onClick={onClose} className="w-full sm:w-auto">
              {t("orgSwitcher.thanksClose")}
            </Button>
          ) : (
            <>
          <Button type="button" variant="outline" onClick={() => !submitted && onClose()} className="w-full sm:w-auto">
            {t("common.cancel")}
          </Button>
          <Button
            type="submit"
            form="add-org-form"
            disabled={submitted || (path === "create" && !orgName.trim()) || (path === "join" && !inviteCode.trim())}
            className="w-full sm:w-auto"
            loading={submitted}
            loadingText={t("orgSwitcher.submitting")}
          >
            {t("orgSwitcher.continue")}
          </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
