import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Select, type SelectOption } from "@/components/ui/select";
import { INSPECTION_RESULT_BADGE, INSPECTION_TYPE_PILL_CLASSES } from "@/config/pm/inspections";
import { SemanticPill } from "@/features/project-ui/components";
import type {
  DummyInspection,
  InspectionChecklistItem,
  InspectionObservation,
} from "@/features/project-ui/projectDummyData";

const INSPECTION_TYPES = ["Quality", "MEP", "Structural", "Safety", "Fire"] as const;

function checklistResponseLabel(
  t: (k: string) => string,
  r: InspectionChecklistItem["response"],
): string {
  switch (r) {
    case "pass":
      return t("inspectionPage.checklist.pass");
    case "fail":
      return t("inspectionPage.checklist.fail");
    case "na":
      return t("inspectionPage.checklist.na");
    default:
      return t("inspectionPage.checklist.pending");
  }
}

function checklistDotClass(r: InspectionChecklistItem["response"]): string {
  switch (r) {
    case "pass":
      return "bg-success";
    case "fail":
      return "bg-danger";
    case "na":
      return "bg-muted";
    default:
      return "bg-warning/70";
  }
}

function observationSeverityClass(sev: InspectionObservation["severity"]): string {
  switch (sev) {
    case "Major":
      return "border-danger/40 bg-danger/[0.06]";
    case "Minor":
      return "border-warning/40 bg-warning/[0.06]";
    default:
      return "border-border/60 bg-muted/[0.06]";
  }
}

export function InspectionDetailDrawer({
  row,
  onClose,
}: {
  row: DummyInspection;
  onClose: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex shrink-0 items-start justify-between border-b border-border/60 px-5 py-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <SemanticPill label={row.type} palette={INSPECTION_TYPE_PILL_CLASSES} />
            <Badge variant={INSPECTION_RESULT_BADGE[row.result]} size="sm">
              {row.result === "Pending" ? t("inspectionPage.resultPending") : row.result}
            </Badge>
            <span className="text-[11px] text-muted">{row.templateName}</span>
          </div>
          <h2 className="mt-2 font-[family-name:var(--font-dm-sans)] text-base font-semibold text-primary">
            {row.title}
          </h2>
          <p className="mt-1 text-sm text-secondary">
            {row.location}
            {row.trade ? ` · ${row.trade}` : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="ml-3 shrink-0 rounded-lg p-1.5 text-muted hover:bg-muted/15 hover:text-primary"
          aria-label={t("inspectionPage.close")}
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5 text-sm">
        <div className="grid grid-cols-2 gap-3 rounded-xl bg-muted/[0.06] p-4">
          <div>
            <p className="text-xs text-muted">{t("inspectionPage.conductedBy")}</p>
            <p className="mt-0.5 font-medium text-primary">{row.by}</p>
          </div>
          <div>
            <p className="text-xs text-muted">{t("inspectionPage.date")}</p>
            <p className="mt-0.5 font-mono font-medium text-primary">{row.date}</p>
          </div>
          <div className="col-span-2">
            <p className="text-xs text-muted">{t("inspectionPage.workflowStatus")}</p>
            <p className="mt-0.5 text-primary">{row.status}</p>
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
            {t("inspectionPage.sectionChecklist")}
          </p>
          <ul className="space-y-2">
            {row.checklistItems.map((item) => (
              <li
                key={item.id}
                className="flex gap-3 rounded-lg border border-border/50 bg-bg px-3 py-2.5"
              >
                <span
                  className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${checklistDotClass(item.response)}`}
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] text-primary">{item.label}</p>
                  <p className="mt-0.5 text-[11px] font-medium text-secondary">
                    {checklistResponseLabel(t, item.response)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
            {t("inspectionPage.sectionObservations")}
          </p>
          {row.observations.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border/60 bg-muted/[0.04] px-3 py-3 text-[13px] text-secondary">
              {t("inspectionPage.noObservations")}
            </p>
          ) : (
            <ul className="space-y-2">
              {row.observations.map((o) => (
                <li
                  key={o.id}
                  className={`rounded-lg border px-3 py-2.5 ${observationSeverityClass(o.severity)}`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                      {o.severity}
                    </span>
                    {o.linkedTaskId ? (
                      <span className="rounded-md border border-brand/30 bg-brand/10 px-2 py-0.5 font-mono text-[11px] text-brand">
                        {o.linkedTaskId}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1.5 text-[13px] text-primary">{o.description}</p>
                  {o.linkedTaskId ? (
                    <p className="mt-2 text-[11px] text-muted">{t("inspectionPage.linkedTaskHint")}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
            {t("inspectionPage.sectionAttachments")}
          </p>
          {!row.attachmentLabels?.length ? (
            <p className="text-[13px] text-secondary">{t("inspectionPage.noAttachments")}</p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {row.attachmentLabels.map((name) => (
                <li
                  key={name}
                  className="rounded-md border border-border/60 bg-muted/[0.06] px-2.5 py-1 font-mono text-[11px] text-secondary"
                >
                  {name}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
            {t("inspectionPage.sectionSignatures")}
          </p>
          {!row.signatures?.length ? (
            <p className="text-[13px] text-secondary">{t("inspectionPage.noSignatures")}</p>
          ) : (
            <ul className="space-y-2">
              {row.signatures.map((s, i) => (
                <li key={i} className="rounded-lg border border-border/50 px-3 py-2">
                  <p className="text-[12px] font-medium text-primary">{s.role}</p>
                  <p className="text-[13px] text-secondary">{s.name}</p>
                  {s.signedAt ? (
                    <p className="mt-0.5 font-mono text-[11px] text-muted">{s.signedAt}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap justify-end gap-2 border-t border-border/60 px-5 py-3">
        <Button size="sm" variant="secondary" type="button" onClick={onClose}>
          {t("inspectionPage.close")}
        </Button>
        <Button size="sm" variant="secondary" type="button">
          {t("inspectionPage.openPdf")}
        </Button>
      </div>
    </div>
  );
}

function defaultChecklistForTemplate(): InspectionChecklistItem[] {
  return [
    { id: "n1", label: "Scope of inspection identified and safe access confirmed", response: "pending" },
    { id: "n2", label: "Reference documents on site (latest revision)", response: "pending" },
    { id: "n3", label: "Deficiencies documented with photos", response: "pending" },
  ];
}

export function ScheduleInspectionDrawer({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (row: DummyInspection) => void;
}) {
  const { t } = useTranslation();
  const [title, setTitle] = useState("");
  const [type, setType] = useState<string>(INSPECTION_TYPES[0]);
  const [trade, setTrade] = useState("");
  const [templateName, setTemplateName] = useState("");
  const [location, setLocation] = useState("");
  const [by, setBy] = useState("");
  const [dateIso, setDateIso] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setTitle("");
    setType(INSPECTION_TYPES[0]);
    setTrade("");
    setTemplateName("");
    setLocation("");
    setBy(t("inspectionPage.schedule.youLabel"));
    setDateIso("");
    setError("");
  }, [t]);

  const typeOptions: SelectOption[] = useMemo(
    () => INSPECTION_TYPES.map((x) => ({ value: x, label: x })),
    [],
  );

  function handleSubmit() {
    if (!title.trim()) {
      setError(t("inspectionPage.schedule.errorTitle"));
      return;
    }
    if (!location.trim()) {
      setError(t("inspectionPage.schedule.errorLocation"));
      return;
    }
    if (!dateIso) {
      setError(t("inspectionPage.schedule.errorDate"));
      return;
    }
    const tmpl =
      templateName.trim() || t("inspectionPage.schedule.templateFallback", { type });
    onCreate({
      id: "", // filled by parent
      title: title.trim(),
      type,
      trade: trade.trim() || undefined,
      location: location.trim(),
      by: by.trim() || t("inspectionPage.schedule.youLabel"),
      date: dateIso,
      result: "Pending",
      status: "Scheduled",
      templateName: tmpl,
      checklistItems: defaultChecklistForTemplate(),
      observations: [],
    });
    onClose();
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex shrink-0 items-start justify-between border-b border-border/60 px-5 py-4">
        <h2 className="font-[family-name:var(--font-dm-sans)] text-base font-semibold text-primary">
          {t("inspectionPage.schedule.title")}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded-lg p-1.5 text-muted hover:bg-muted/15 hover:text-primary"
          aria-label={t("inspectionPage.close")}
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
        {error ? (
          <p className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
            {error}
          </p>
        ) : null}
        <Input
          label={t("inspectionPage.schedule.fieldTitle")}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t("inspectionPage.schedule.fieldTitlePh")}
        />
        <Select
          label={t("inspectionPage.schedule.fieldType")}
          options={typeOptions}
          value={type}
          onValueChange={setType}
          size="sm"
          fullWidth
          triggerClassName="h-10"
        />
        <Input
          label={t("inspectionPage.schedule.fieldTrade")}
          value={trade}
          onChange={(e) => setTrade(e.target.value)}
          placeholder={t("inspectionPage.schedule.fieldTradePh")}
        />
        <Input
          label={t("inspectionPage.schedule.fieldTemplate")}
          value={templateName}
          onChange={(e) => setTemplateName(e.target.value)}
          placeholder={t("inspectionPage.schedule.fieldTemplatePh")}
        />
        <Input
          label={t("inspectionPage.schedule.fieldLocation")}
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder={t("inspectionPage.schedule.fieldLocationPh")}
        />
        <Input
          label={t("inspectionPage.schedule.fieldInspector")}
          value={by}
          onChange={(e) => setBy(e.target.value)}
        />
        <DatePicker
          label={t("inspectionPage.schedule.fieldDate")}
          value={dateIso}
          onChange={(e) => setDateIso(e.target.value)}
          fullWidth
          className="pr-10"
        />
        <p className="text-[12px] text-muted">{t("inspectionPage.schedule.hint")}</p>
      </div>
      <div className="flex shrink-0 justify-end gap-2 border-t border-border/60 px-5 py-3">
        <Button type="button" variant="secondary" size="sm" onClick={onClose}>
          {t("inspectionPage.schedule.cancel")}
        </Button>
        <Button type="button" variant="primary" size="sm" onClick={handleSubmit}>
          {t("inspectionPage.schedule.submit")}
        </Button>
      </div>
    </div>
  );
}

export function nextInspectionId(rows: DummyInspection[]): string {
  const max = rows.reduce((m, r) => {
    const n = parseInt(r.id.replace(/\D/g, ""), 10) || 0;
    return Math.max(m, n);
  }, 0);
  return `ins-${String(max + 1).padStart(3, "0")}`;
}
