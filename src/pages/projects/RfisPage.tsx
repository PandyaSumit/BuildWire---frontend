import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useGlobalSearch } from "@/components/layout/GlobalSearchContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { Select, type SelectOption } from "@/components/ui/select";
import { SheetDrawer } from "@/components/ui/sheet-drawer";
import { StatsBar } from "@/components/ui/stats-bar";
import { Textarea } from "@/components/ui/textarea";
import {
  RFI_PRIORITY_BADGE_VARIANT,
  RFI_STATUS_BADGE_VARIANT,
  RFI_TRADE_PILL_CLASSES,
} from "@/config/pm/rfi";
import {
  SemanticPill,
  ModulePageShell,
  FilterPopover,
} from "@/components/project";
import {
  computeRfiStats,
  DUMMY_RFIS,
  type DummyRfiRow,
} from "@/services/project/projectDummyData";

const TRADE_OTHER = "__other__";

type ImpactFilter = "all" | "cost" | "schedule" | "both";

const ACTIVE = ["Open", "Under Review", "Draft", "Answered"];

function rfiNumericId(num: string) {
  return parseInt(num.replace(/\D/g, ""), 10) || 0;
}

function formatRfiDueFromIso(iso: string): string {
  if (!iso?.trim()) return "—";
  const [y, m, d] = iso.trim().split("-").map((x) => parseInt(x, 10));
  if (!y || !m || !d) return iso.trim();
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(new Date(y, m - 1, d));
}

function parseLinkedTaskIds(raw: string): string[] | undefined {
  const ids = raw
    .split(/[,\n]/g)
    .map((s) => s.trim())
    .filter(Boolean);
  return ids.length ? ids : undefined;
}

function matchesGlobalQuery(rfi: DummyRfiRow, q: string): boolean {
  if (!q) return true;
  const hay = [
    rfi.num,
    rfi.title,
    rfi.questionBody,
    rfi.specSection,
    rfi.location,
    rfi.drawingRef,
    rfi.distribution,
    rfi.trade,
    rfi.submittedBy,
    rfi.assignedTo,
    ...(rfi.attachmentLabels ?? []),
  ]
    .join(" ")
    .toLowerCase();
  return hay.includes(q);
}

function scheduleSortRank(rfi: DummyRfiRow) {
  const m = { none: 0, potential: 1, confirmed: 2 } as const;
  return m[rfi.scheduleImpact] + (rfi.scheduleLagDays ?? 0) * 0.01;
}

function ClipIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M11.5 4.5a3 3 0 0 0-4.24 0L3.65 8.1a2.5 2.5 0 0 0 3.54 3.54l4.2-4.2a.5.5 0 0 1 .71.71l-4.2 4.2a3.5 3.5 0 1 1-4.95-4.95l3.61-3.6a4 4 0 0 1 5.66 5.66l-4.2 4.2a.5.5 0 0 1-.71-.71l4.2-4.2a3 3 0 0 0-4.24-4.24l-.18.18a.5.5 0 1 1-.71-.71l.18-.18a4 4 0 0 1 5.66 0Z" />
    </svg>
  );
}

function ScheduleCell({ rfi }: { rfi: DummyRfiRow }) {
  const { t } = useTranslation();
  if (rfi.scheduleImpact === "none") {
    return <span className="text-muted">—</span>;
  }
  if (rfi.scheduleImpact === "potential") {
    return (
      <span className="inline-flex max-w-full items-center rounded-md border border-warning/30 bg-warning/10 px-2 py-0.5 text-[11px] font-semibold text-warning">
        {t("rfiPage.schedulePotential")}
      </span>
    );
  }
  const lag = rfi.scheduleLagDays;
  return (
    <span
      className="inline-flex max-w-full items-center gap-1 rounded-md border border-danger/30 bg-danger/10 px-2 py-0.5 text-[11px] font-semibold text-danger"
      title={lag ? t("rfiPage.scheduleLagHint", { days: lag }) : undefined}
    >
      {t("rfiPage.scheduleConfirmed")}
      {lag ? ` +${lag}d` : null}
    </span>
  );
}

function RfiDetailDrawer({
  rfi,
  onClose,
}: {
  rfi: DummyRfiRow;
  onClose: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex shrink-0 items-start justify-between border-b border-border/60 px-5 py-4">
        <div className="min-w-0">
          <p className="font-mono text-xs font-medium text-muted">{rfi.num}</p>
          <h2 className="mt-1 font-[family-name:var(--font-dm-sans)] text-base font-semibold leading-snug text-primary">
            {rfi.title}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="ml-4 shrink-0 rounded-lg p-1.5 text-muted hover:bg-muted/15 hover:text-primary"
          aria-label={t("rfiPage.close")}
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={RFI_PRIORITY_BADGE_VARIANT[rfi.priority]} size="sm">
            {rfi.priority}
          </Badge>
          <Badge variant={RFI_STATUS_BADGE_VARIANT[rfi.status] ?? "default"} size="sm">
            {rfi.status}
          </Badge>
          <SemanticPill label={rfi.trade} palette={RFI_TRADE_PILL_CLASSES} />
          {rfi.costImpact ? (
            <span className="inline-flex items-center gap-1 rounded-md border border-warning/30 bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning">
              {t("rfiPage.costImpact")}
            </span>
          ) : null}
          {rfi.scheduleImpact !== "none" ? <ScheduleCell rfi={rfi} /> : null}
        </div>

        <div className="grid grid-cols-1 gap-3 rounded-xl bg-muted/[0.06] p-4 text-sm sm:grid-cols-2 sm:gap-x-6 sm:gap-y-3">
          <div className="sm:col-span-2">
            <p className="text-xs text-muted">{t("rfiPage.drawingSpec")}</p>
            <p className="mt-0.5 font-medium text-primary">
              <span className="font-mono text-[13px]">{rfi.drawingRef}</span>
              <span className="text-muted"> · </span>
              <span>{rfi.specSection}</span>
            </p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-xs text-muted">{t("rfiPage.location")}</p>
            <p className="mt-0.5 font-medium text-primary">{rfi.location}</p>
          </div>
          <div>
            <p className="text-xs text-muted">{t("rfiPage.ballInCourt")}</p>
            <p className="mt-0.5 font-medium text-primary">{rfi.ballInCourt || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted">{t("rfiPage.due")}</p>
            <p className="mt-0.5 font-medium text-primary">{rfi.due || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted">{t("rfiPage.submittedBy")}</p>
            <p className="mt-0.5 font-medium text-primary">{rfi.submittedBy || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted">{t("rfiPage.assignedTo")}</p>
            <p className="mt-0.5 font-medium text-primary">{rfi.assignedTo || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted">{t("rfiPage.daysOpen")}</p>
            <p className="mt-0.5 font-medium text-primary">{rfi.daysOpen}</p>
          </div>
          <div>
            <p className="text-xs text-muted">{t("rfiPage.distribution")}</p>
            <p className="mt-0.5 text-[13px] leading-snug text-secondary">{rfi.distribution}</p>
          </div>
        </div>

        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted">{t("rfiPage.question")}</p>
          <div className="rounded-xl bg-muted/[0.06] p-4">
            <p className="text-sm leading-relaxed text-secondary">{rfi.questionBody}</p>
          </div>
        </div>

        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted">{t("rfiPage.response")}</p>
          <div className={`rounded-xl p-4 ${rfi.responseBody ? "border border-border/60 bg-bg" : "border border-dashed border-border/60 bg-bg"}`}>
            {rfi.responseBody ? (
              <p className="text-sm leading-relaxed text-secondary">{rfi.responseBody}</p>
            ) : rfi.status === "Answered" || rfi.status === "Closed" ? (
              <p className="text-sm text-secondary">{t("rfiPage.responsePendingSync")}</p>
            ) : (
              <p className="text-sm italic text-muted">{t("rfiPage.noResponseYet")}</p>
            )}
          </div>
        </div>

        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted">{t("rfiPage.activity")}</p>
          <ul className="space-y-2.5 rounded-xl border border-border/50 bg-bg p-3">
            {rfi.activity.map((a, i) => (
              <li key={`${a.when}-${i}`} className="flex gap-2 text-[13px] leading-snug">
                <span className="shrink-0 text-[11px] tabular-nums text-muted">{a.when}</span>
                <span className="min-w-0 text-secondary">
                  <span className="font-medium text-primary">{a.who}</span> {a.what}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted">{t("rfiPage.attachments")}</p>
          {rfi.attachmentCount > 0 ? (
            <ul className="space-y-1.5 rounded-xl border border-border/60 bg-bg p-3 text-sm text-secondary">
              {(rfi.attachmentLabels?.length
                ? rfi.attachmentLabels
                : Array.from({ length: rfi.attachmentCount }, (_, n) =>
                    t("rfiPage.attachmentPlaceholder", { n: n + 1 }),
                  )
              ).map((name) => (
                <li key={name} className="flex items-center gap-2">
                  <ClipIcon className="h-3.5 w-3.5 shrink-0 text-muted" />
                  <span className="min-w-0 truncate">{name}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex h-14 items-center justify-center rounded-xl border border-dashed border-border/60 bg-bg text-sm text-muted">
              {t("rfiPage.noAttachments")}
            </div>
          )}
        </div>

        {rfi.linkedTaskIds?.length ? (
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted">{t("rfiPage.linkedTasks")}</p>
            <div className="flex flex-wrap gap-2">
              {rfi.linkedTaskIds.map((id) => (
                <span key={id} className="rounded-md border border-border/60 bg-muted/[0.06] px-2 py-1 font-mono text-xs text-brand">
                  {id}
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center justify-between gap-3 border-t border-border/60 px-5 py-3">
        <button type="button" className="shrink-0 text-sm text-secondary hover:text-primary">
          {t("rfiPage.viewFullPage")}
        </button>
        {rfi.status !== "Closed" && rfi.status !== "Void" ? (
          <Button size="sm">{t("rfiPage.respond")}</Button>
        ) : null}
      </div>
    </div>
  );
}

function RfiCreateDrawer({
  open,
  onClose,
  tradeChoices,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  tradeChoices: string[];
  onCreate: (row: DummyRfiRow) => void;
}) {
  const { t } = useTranslation();
  const [title, setTitle] = useState("");
  const [question, setQuestion] = useState("");
  const [trade, setTrade] = useState("");
  const [tradeOther, setTradeOther] = useState("");
  const [priority, setPriority] = useState<"Normal" | "Urgent">("Normal");
  const [dueIso, setDueIso] = useState("");
  const [location, setLocation] = useState("");
  const [specSection, setSpecSection] = useState("");
  const [drawingRef, setDrawingRef] = useState("");
  const [linkedTasksRaw, setLinkedTasksRaw] = useState("");
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [costImpact, setCostImpact] = useState(false);
  const [scheduleRisk, setScheduleRisk] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setTitle("");
    setQuestion("");
    setTrade(tradeChoices[0] ?? TRADE_OTHER);
    setTradeOther("");
    setPriority("Normal");
    setDueIso("");
    setLocation("");
    setSpecSection("");
    setDrawingRef("");
    setLinkedTasksRaw("");
    setAttachmentFiles([]);
    setCostImpact(false);
    setScheduleRisk(false);
    setError("");
  }, [open, tradeChoices]);

  const tradeOptions: SelectOption[] = useMemo(
    () => [
      ...tradeChoices.map((x) => ({ value: x, label: x })),
      { value: TRADE_OTHER, label: t("rfiPage.create.tradeOther") },
    ],
    [tradeChoices, t],
  );

  const priorityOptions: SelectOption[] = useMemo(
    () => [
      { value: "Normal", label: "Normal" },
      { value: "Urgent", label: "Urgent" },
    ],
    [],
  );

  function handleSubmit() {
    if (!title.trim()) {
      setError(t("rfiPage.create.errorTitle"));
      return;
    }
    if (!question.trim()) {
      setError(t("rfiPage.create.errorQuestion"));
      return;
    }
    const resolvedTrade =
      trade === TRADE_OTHER ? tradeOther.trim() || t("rfiPage.create.tradeFallback") : trade;
    if (!resolvedTrade) {
      setError(t("rfiPage.create.errorTrade"));
      return;
    }
    const linkedTaskIds = parseLinkedTaskIds(linkedTasksRaw);
    const attachmentLabels = attachmentFiles.map((f) => f.name);

    onCreate({
      num: "",
      title: title.trim(),
      questionBody: question.trim(),
      trade: resolvedTrade,
      priority,
      status: "Draft",
      ballInCourt: "Submitter",
      submittedBy: t("rfiPage.create.youLabel"),
      assignedTo: "—",
      due: formatRfiDueFromIso(dueIso),
      daysOpen: 0,
      costImpact: costImpact,
      scheduleImpact: scheduleRisk ? "potential" : "none",
      attachmentCount: attachmentFiles.length,
      ...(attachmentLabels.length ? { attachmentLabels } : {}),
      specSection: specSection.trim() || "—",
      location: location.trim() || "—",
      drawingRef: drawingRef.trim() || "—",
      ...(linkedTaskIds ? { linkedTaskIds } : {}),
      distribution: t("rfiPage.create.distributionDraft"),
      activity: [
        {
          who: t("rfiPage.create.youLabel"),
          what: t("rfiPage.create.activityCreated"),
          when: t("rfiPage.create.justNow"),
        },
      ],
      isOverdue: false,
    });
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex shrink-0 items-start justify-between border-b border-border/60 px-5 py-4">
        <h2 className="font-[family-name:var(--font-dm-sans)] text-base font-semibold text-primary">
          {t("rfiPage.create.drawerTitle")}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded-lg p-1.5 text-muted hover:bg-muted/15 hover:text-primary"
          aria-label={t("rfiPage.close")}
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
          label={t("rfiPage.create.fieldTitle")}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t("rfiPage.create.fieldTitlePh")}
        />
        <Textarea
          label={t("rfiPage.create.fieldQuestion")}
          fullWidth
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={t("rfiPage.create.fieldQuestionPh")}
          rows={5}
          className="min-h-[7rem] w-full"
        />
        <Select
          label={t("rfiPage.create.fieldTrade")}
          options={tradeOptions}
          value={trade}
          onValueChange={setTrade}
          size="sm"
          fullWidth
          triggerClassName="h-10"
        />
        {trade === TRADE_OTHER ? (
          <Input
            label={t("rfiPage.create.fieldTradeSpecify")}
            value={tradeOther}
            onChange={(e) => setTradeOther(e.target.value)}
          />
        ) : null}
        <Select
          label={t("rfiPage.create.fieldPriority")}
          options={priorityOptions}
          value={priority}
          onValueChange={(v) => setPriority(v as "Normal" | "Urgent")}
          size="sm"
          fullWidth
          triggerClassName="h-10"
        />
        <DatePicker
          label={t("rfiPage.create.fieldDue")}
          value={dueIso}
          onChange={(e) => setDueIso(e.target.value)}
          fullWidth
          className="pr-10"
        />
        <Input
          label={t("rfiPage.create.fieldLocation")}
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder={t("rfiPage.create.fieldLocationPh")}
        />
        <div className="space-y-3 rounded-lg border border-border/50 bg-muted/[0.04] p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            {t("rfiPage.create.sectionLinks")}
          </p>
          <Input
            label={t("rfiPage.create.fieldSpecSection")}
            value={specSection}
            onChange={(e) => setSpecSection(e.target.value)}
            placeholder={t("rfiPage.create.fieldSpecSectionPh")}
          />
          <Input
            label={t("rfiPage.create.fieldDrawingRef")}
            value={drawingRef}
            onChange={(e) => setDrawingRef(e.target.value)}
            placeholder={t("rfiPage.create.fieldDrawingRefPh")}
          />
          <Input
            label={t("rfiPage.create.fieldLinkedTasks")}
            value={linkedTasksRaw}
            onChange={(e) => setLinkedTasksRaw(e.target.value)}
            placeholder={t("rfiPage.create.fieldLinkedTasksPh")}
          />
        </div>
        <div className="space-y-2 rounded-lg border border-border/50 bg-muted/[0.04] p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            {t("rfiPage.create.sectionAttachments")}
          </p>
          <p className="text-[12px] text-secondary">{t("rfiPage.create.attachmentsHint")}</p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => {
              const list = e.target.files;
              if (!list?.length) return;
              setAttachmentFiles((prev) => [...prev, ...Array.from(list)]);
              e.target.value = "";
            }}
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="w-full sm:w-auto"
            onClick={() => fileInputRef.current?.click()}
          >
            {t("rfiPage.create.attachFiles")}
          </Button>
          {attachmentFiles.length ? (
            <ul className="mt-1 max-h-28 space-y-1 overflow-y-auto text-[12px] text-primary">
              {attachmentFiles.map((f, i) => (
                <li
                  key={`${f.name}-${i}`}
                  className="flex items-center justify-between gap-2 rounded-md border border-border/40 bg-bg/80 px-2 py-1"
                >
                  <span className="min-w-0 truncate" title={f.name}>
                    {f.name}
                  </span>
                  <button
                    type="button"
                    className="shrink-0 rounded p-0.5 text-muted hover:bg-muted/15 hover:text-danger"
                    aria-label={t("rfiPage.create.removeAttachment")}
                    onClick={() => setAttachmentFiles((prev) => prev.filter((_, j) => j !== i))}
                  >
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <div className="flex flex-col gap-2 rounded-lg border border-border/50 bg-muted/[0.04] p-3">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-primary">
            <input
              type="checkbox"
              className="rounded border-border text-brand focus:ring-brand"
              checked={costImpact}
              onChange={(e) => setCostImpact(e.target.checked)}
            />
            {t("rfiPage.create.toggleCost")}
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-primary">
            <input
              type="checkbox"
              className="rounded border-border text-brand focus:ring-brand"
              checked={scheduleRisk}
              onChange={(e) => setScheduleRisk(e.target.checked)}
            />
            {t("rfiPage.create.toggleSchedule")}
          </label>
        </div>
      </div>
      <div className="flex shrink-0 justify-end gap-2 border-t border-border/60 px-5 py-3">
        <Button type="button" variant="secondary" size="sm" onClick={onClose}>
          {t("rfiPage.create.cancel")}
        </Button>
        <Button type="button" variant="primary" size="sm" onClick={handleSubmit}>
          {t("rfiPage.create.submit")}
        </Button>
      </div>
    </div>
  );
}

function buildColumns(): DataTableColumn<DummyRfiRow>[] {
  return [
    {
      id: "num",
      header: "RFI #",
      headerClassName: "w-[88px]",
      sortValue: (r) => r.num,
      cell: (r) => <span className="font-mono text-xs font-semibold text-brand">{r.num}</span>,
    },
    {
      id: "title",
      header: "Title",
      headerClassName: "min-w-[11rem] w-[28%]",
      cellClassName: "min-w-0",
      sortValue: (r) => r.title,
      cell: (r) => (
        <span className="block min-w-0 truncate text-[13px] font-medium text-primary" title={r.title}>
          {r.title}
        </span>
      ),
    },
    {
      id: "location",
      header: "Location",
      headerClassName: "hidden lg:table-cell max-w-[9rem]",
      cellClassName: "hidden lg:table-cell max-w-[9rem]",
      sortValue: (r) => r.location,
      cell: (r) => (
        <span className="block min-w-0 truncate text-[12px] text-secondary" title={r.location}>
          {r.location}
        </span>
      ),
    },
    {
      id: "specSection",
      header: "Spec",
      headerClassName: "hidden xl:table-cell w-[8rem]",
      cellClassName: "hidden xl:table-cell",
      sortValue: (r) => r.specSection,
      cell: (r) => (
        <span className="block min-w-0 truncate font-mono text-[11px] text-secondary" title={r.specSection}>
          {r.specSection}
        </span>
      ),
    },
    {
      id: "trade",
      header: "Trade",
      sortValue: (r) => r.trade,
      cell: (r) => <SemanticPill label={r.trade} palette={RFI_TRADE_PILL_CLASSES} />,
    },
    {
      id: "priority",
      header: "Priority",
      sortValue: (r) => r.priority,
      cell: (r) => (
        <Badge variant={RFI_PRIORITY_BADGE_VARIANT[r.priority]} size="sm">{r.priority}</Badge>
      ),
    },
    {
      id: "status",
      header: "Status",
      sortValue: (r) => r.status,
      cell: (r) => (
        <Badge variant={RFI_STATUS_BADGE_VARIANT[r.status] ?? "default"} size="sm">
          {r.status}
        </Badge>
      ),
    },
    {
      id: "ballInCourt",
      header: "BIC",
      sortValue: (r) => r.ballInCourt,
      cell: (r) => <span className="text-[13px] text-secondary">{r.ballInCourt || "—"}</span>,
    },
    {
      id: "submittedBy",
      header: "Submitted by",
      sortValue: (r) => r.submittedBy,
      cell: (r) => <span className="text-[13px] text-secondary">{r.submittedBy}</span>,
    },
    {
      id: "assignedTo",
      header: "Assigned to",
      sortValue: (r) => r.assignedTo,
      cell: (r) => <span className="text-[13px] text-secondary">{r.assignedTo || "—"}</span>,
    },
    {
      id: "due",
      header: "Due",
      cellClassName: "whitespace-nowrap",
      sortValue: (r) => r.due,
      cell: (r) => <span className="text-[13px] text-secondary">{r.due || "—"}</span>,
    },
    {
      id: "daysOpen",
      header: "Days open",
      align: "right",
      sortValue: (r) => r.daysOpen,
      cell: (r) => (
        <span className={`text-[13px] tabular-nums ${r.daysOpen > 7 ? "font-semibold text-warning" : "text-secondary"}`}>
          {r.daysOpen}
        </span>
      ),
    },
    {
      id: "costImpact",
      header: "Cost",
      align: "center",
      sortValue: (r) => (r.costImpact ? 1 : 0),
      cell: (r) =>
        r.costImpact ? (
          <span className="font-mono text-sm font-semibold text-warning">$</span>
        ) : (
          <span className="text-muted">—</span>
        ),
    },
    {
      id: "scheduleImpact",
      header: "Schedule",
      cellClassName: "min-w-[5.5rem]",
      sortValue: (r) => scheduleSortRank(r),
      cell: (r) => <ScheduleCell rfi={r} />,
    },
    {
      id: "attachments",
      header: "Files",
      align: "center",
      sortValue: (r) => r.attachmentCount,
      cell: (r) =>
        r.attachmentCount > 0 ? (
          <span className="inline-flex items-center gap-1 tabular-nums text-[13px] text-secondary" title={`${r.attachmentCount}`}>
            <ClipIcon className="h-3.5 w-3.5 text-muted" />
            {r.attachmentCount}
          </span>
        ) : (
          <span className="text-muted">—</span>
        ),
    },
  ];
}

function nextRfiNumber(rows: DummyRfiRow[]) {
  const max = rows.reduce((m, r) => Math.max(m, rfiNumericId(r.num)), 0);
  return `RFI-${String(max + 1).padStart(3, "0")}`;
}

export default function RfisPage() {
  const { t } = useTranslation();
  const { query, setQuery } = useGlobalSearch();
  const [rfiRows, setRfiRows] = useState<DummyRfiRow[]>(() => [...DUMMY_RFIS]);
  const [selectedRfi, setSelectedRfi] = useState<DummyRfiRow | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [quickScope, setQuickScope] = useState<null | "open" | "overdue">(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [tradeFilter, setTradeFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<"" | "Normal" | "Urgent">("");
  const [impactFilter, setImpactFilter] = useState<ImpactFilter>("all");

  const rfiStats = useMemo(() => computeRfiStats(rfiRows), [rfiRows]);

  const columns = useMemo(() => buildColumns(), []);

  const orderedSource = useMemo(
    () => [...rfiRows].sort((a, b) => rfiNumericId(b.num) - rfiNumericId(a.num)),
    [rfiRows],
  );

  const tradeChoicesCreate = useMemo(() => {
    return [...new Set(rfiRows.map((r) => r.trade))].sort();
  }, [rfiRows]);

  const tradeOptions: SelectOption[] = useMemo(() => {
    const trades = [...new Set(orderedSource.map((r) => r.trade))].sort();
    return [{ value: "", label: t("rfiPage.filterAllTrades") }, ...trades.map((x) => ({ value: x, label: x }))];
  }, [orderedSource, t]);

  const statusOptions: SelectOption[] = useMemo(() => {
    const statuses = [...new Set(orderedSource.map((r) => r.status))].sort();
    return [{ value: "", label: t("rfiPage.filterAllStatuses") }, ...statuses.map((x) => ({ value: x, label: x }))];
  }, [orderedSource, t]);

  const priorityOptions: SelectOption[] = useMemo(
    () => [
      { value: "", label: t("rfiPage.filterAllPriorities") },
      { value: "Normal", label: "Normal" },
      { value: "Urgent", label: "Urgent" },
    ],
    [t],
  );

  const impactOptions: SelectOption[] = useMemo(
    () => [
      { value: "all", label: t("rfiPage.filterImpactAll") },
      { value: "cost", label: t("rfiPage.filterImpactCost") },
      { value: "schedule", label: t("rfiPage.filterImpactSchedule") },
      { value: "both", label: t("rfiPage.filterImpactBoth") },
    ],
    [t],
  );

  const qNorm = query.trim().toLowerCase();

  const clearQuick = () => setQuickScope(null);

  const hasActiveFilters = Boolean(
    statusFilter ||
      tradeFilter ||
      priorityFilter ||
      impactFilter !== "all" ||
      quickScope,
  );

  const resetFilters = useCallback(() => {
    setQuickScope(null);
    setStatusFilter("");
    setTradeFilter("");
    setPriorityFilter("");
    setImpactFilter("all");
    setQuery("");
    // filter panel closed via popover
  }, [setQuery]);

  const openCreate = useCallback(() => {
    setSelectedRfi(null);
    setCreateOpen(true);
  }, []);

  const appendRfi = useCallback((draft: DummyRfiRow) => {
    setRfiRows((prev) => {
      const num = nextRfiNumber(prev);
      return [{ ...draft, num }, ...prev];
    });
  }, []);

  const filteredRows = useMemo(() => {
    return orderedSource.filter((r) => {
      if (!matchesGlobalQuery(r, qNorm)) return false;
      if (quickScope === "open" && !ACTIVE.includes(r.status)) return false;
      if (quickScope === "overdue" && !r.isOverdue) return false;
      if (statusFilter && r.status !== statusFilter) return false;
      if (tradeFilter && r.trade !== tradeFilter) return false;
      if (priorityFilter && r.priority !== priorityFilter) return false;
      if (impactFilter === "cost" && !r.costImpact) return false;
      if (impactFilter === "schedule" && r.scheduleImpact === "none") return false;
      if (impactFilter === "both" && !(r.costImpact && r.scheduleImpact !== "none")) return false;
      return true;
    });
  }, [orderedSource, qNorm, quickScope, statusFilter, tradeFilter, priorityFilter, impactFilter]);

  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (statusFilter) n++;
    if (tradeFilter) n++;
    if (priorityFilter) n++;
    if (impactFilter !== "all") n++;
    if (quickScope) n++;
    return n;
  }, [statusFilter, tradeFilter, priorityFilter, impactFilter, quickScope]);

  const chipClass =
    "inline-flex max-w-full items-center gap-1 rounded-full border border-border/60 bg-muted/10 px-2.5 py-1 text-[11px] font-medium text-secondary hover:bg-muted/20";

  return (
    <ModulePageShell>
      <PageHeader
        title={t("rfiPage.title")}
        description={t("rfiPage.description")}
        actions={
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={openCreate}
            className="shrink-0"
          >
            {t("rfiPage.newRfi")}
          </Button>
        }
      />

      <StatsBar
        stats={[
          {
            label: t("rfiPage.statTotal"),
            value: rfiStats.total,
            onClick: resetFilters,
            title: t("rfiPage.statResetHint"),
          },
          {
            label: t("rfiPage.statOpen"),
            value: rfiStats.open,
            accent: "warning",
            onClick: () => {
              setStatusFilter("");
              setTradeFilter("");
              setPriorityFilter("");
              setQuery("");
              setQuickScope("open");
              setImpactFilter("all");
                    },
            title: t("rfiPage.statOpenHint"),
          },
          {
            label: t("rfiPage.statOverdue"),
            value: rfiStats.overdue,
            accent: "danger",
            onClick: () => {
              setStatusFilter("");
              setTradeFilter("");
              setPriorityFilter("");
              setQuery("");
              setQuickScope("overdue");
              setImpactFilter("all");
                    },
            title: t("rfiPage.statOverdueHint"),
          },
          {
            label: t("rfiPage.statScheduleRisk"),
            value: rfiStats.scheduleRisk,
            accent: "warning",
            onClick: () => {
              setStatusFilter("");
              setTradeFilter("");
              setPriorityFilter("");
              setQuery("");
              setQuickScope(null);
              setImpactFilter("schedule");
                    },
            title: t("rfiPage.statScheduleRiskHint"),
          },
          {
            label: t("rfiPage.statAvgResponse"),
            value: `${rfiStats.avgResponseDays}d`,
          },
        ]}
      />

      {qNorm ? (
        <p className="text-xs text-muted">{t("rfiPage.globalSearchHint", { count: filteredRows.length })}</p>
      ) : null}

      {/* ── Toolbar row ──────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* Quick scope chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              setStatusFilter(""); setTradeFilter(""); setPriorityFilter(""); setQuery(""); setImpactFilter("all");
              setQuickScope((v) => v === "open" ? null : "open");
            }}
            className={`h-7 rounded-full border px-3 text-[11px] font-medium transition-colors ${
              quickScope === "open"
                ? "border-brand bg-brand-light text-primary"
                : "border-border/60 bg-surface text-secondary hover:border-border hover:text-primary"
            }`}
          >
            {t("rfiPage.statOpen")} · {rfiStats.open}
          </button>
          <button
            type="button"
            onClick={() => {
              setStatusFilter(""); setTradeFilter(""); setPriorityFilter(""); setQuery(""); setImpactFilter("all");
              setQuickScope((v) => v === "overdue" ? null : "overdue");
            }}
            className={`h-7 rounded-full border px-3 text-[11px] font-medium transition-colors ${
              quickScope === "overdue"
                ? "border-danger/50 bg-danger/10 text-danger"
                : "border-border/60 bg-surface text-secondary hover:border-border hover:text-primary"
            }`}
          >
            {t("rfiPage.statOverdue")} · {rfiStats.overdue}
          </button>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="text-[11px] font-semibold text-brand hover:underline"
            >
              {t("rfiPage.clearFiltersShort")}
            </button>
          )}
          <FilterPopover
            activeCount={activeFilterCount}
            label={t("rfiPage.filterToggle")}
            onClear={resetFilters}
          >
            <Select
              label={t("rfiPage.filterStatus")}
              options={statusOptions}
              value={statusFilter}
              onValueChange={(v) => { clearQuick(); setStatusFilter(v); }}
              size="sm"
              fullWidth
              triggerClassName="h-9"
            />
            <Select
              label={t("rfiPage.filterTrade")}
              options={tradeOptions}
              value={tradeFilter}
              onValueChange={(v) => { clearQuick(); setTradeFilter(v); }}
              size="sm"
              fullWidth
              triggerClassName="h-9"
            />
            <Select
              label={t("rfiPage.filterPriority")}
              options={priorityOptions}
              value={priorityFilter}
              onValueChange={(v) => { clearQuick(); setPriorityFilter(v as "" | "Normal" | "Urgent"); }}
              size="sm"
              fullWidth
              triggerClassName="h-9"
            />
            <Select
              label={t("rfiPage.filterImpact")}
              options={impactOptions}
              value={impactFilter}
              onValueChange={(v) => { clearQuick(); setImpactFilter(v as ImpactFilter); }}
              size="sm"
              fullWidth
              triggerClassName="h-9"
            />
          </FilterPopover>
        </div>
      </div>

      {/* Active filter chips */}
      {hasActiveFilters ? (
        <div className="flex flex-wrap items-center gap-1.5">
          {quickScope === "open" ? (
            <button type="button" className={chipClass} onClick={() => setQuickScope(null)}>
              {t("rfiPage.chipOpenPipeline")} ×
            </button>
          ) : null}
          {quickScope === "overdue" ? (
            <button type="button" className={chipClass} onClick={() => setQuickScope(null)}>
              {t("rfiPage.chipOverdue")} ×
            </button>
          ) : null}
          {impactFilter !== "all" ? (
            <button type="button" className={chipClass} onClick={() => setImpactFilter("all")}>
              {impactFilter === "schedule" ? t("rfiPage.chipSchedule")
                : impactFilter === "cost" ? t("rfiPage.filterImpactCost")
                : t("rfiPage.filterImpactBoth")} ×
            </button>
          ) : null}
          {statusFilter ? (
            <button type="button" className={chipClass} onClick={() => setStatusFilter("")}>
              {statusFilter} ×
            </button>
          ) : null}
          {tradeFilter ? (
            <button type="button" className={chipClass} onClick={() => setTradeFilter("")}>
              {tradeFilter} ×
            </button>
          ) : null}
          {priorityFilter ? (
            <button type="button" className={chipClass} onClick={() => setPriorityFilter("")}>
              {priorityFilter} ×
            </button>
          ) : null}
        </div>
      ) : null}

      {/* ── Table card ────────────────────────────────────────────────────── */}
      <DataTable<DummyRfiRow>
        variant="card"
        density="comfortable"
        columns={columns}
        data={filteredRows}
        rowKey={(r) => r.num}
        tableMinWidthClassName="min-w-[1040px]"
        minWidthTableLayout="fixed"
        maxHeightClassName="max-h-none"
        onRowClick={(r) => setSelectedRfi(r)}
        rowClassName={(r) =>
          r.isOverdue ? "border-s-2 border-s-danger/55" : undefined
        }
        emptyFallback={
          rfiRows.length === 0 ? (
            <EmptyState
              title={t("rfiPage.emptyTitle")}
              description={t("rfiPage.emptyDescription")}
              action={{ label: t("rfiPage.newRfi"), onClick: openCreate }}
            />
          ) : (
            <EmptyState
              title={t("rfiPage.emptyFilteredTitle")}
              description={t("rfiPage.emptyFilteredDescription")}
              action={{
                label: t("rfiPage.resetFilters"),
                onClick: resetFilters,
              }}
            />
          )
        }
      />

      <SheetDrawer
        open={selectedRfi !== null}
        onClose={() => setSelectedRfi(null)}
        hideTitleBar
        widthClassName="max-w-[480px] sm:max-w-[560px]"
      >
        {selectedRfi ? (
          <RfiDetailDrawer rfi={selectedRfi} onClose={() => setSelectedRfi(null)} />
        ) : null}
      </SheetDrawer>

      <SheetDrawer
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        hideTitleBar
        widthClassName="max-w-[480px] sm:max-w-[520px]"
      >
        {createOpen ? (
          <RfiCreateDrawer
            open={createOpen}
            tradeChoices={tradeChoicesCreate}
            onClose={() => setCreateOpen(false)}
            onCreate={(row) => {
              appendRfi(row);
              setCreateOpen(false);
            }}
          />
        ) : null}
      </SheetDrawer>
    </ModulePageShell>
  );
}
