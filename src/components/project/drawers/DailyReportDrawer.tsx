import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type {
  DailyReportDeliveryLine,
  DailyReportEquipmentLine,
  DailyReportManpowerLine,
  DailyReportRow,
  DailyReportStatus,
} from "@/services/project/projectDummyData";

function emptyManpowerRow(): DailyReportManpowerLine {
  return { company: "", trade: "", workers: 0, hours: 0, costCode: "" };
}

function emptyEquipmentRow(): DailyReportEquipmentLine {
  return { asset: "", hours: 0 };
}

function emptyDeliveryRow(): DailyReportDeliveryLine {
  return { description: "", supplier: "" };
}

function parseRfis(raw: string): string[] | undefined {
  const ids = raw
    .split(/[,\n]/g)
    .map((s) => s.trim())
    .filter(Boolean);
  return ids.length ? ids : undefined;
}

export type DailyReportDrawerProps = {
  open: boolean;
  onClose: () => void;
  /** `null` = create new report */
  report: DailyReportRow | null;
  defaultDateIso: string;
  occupiedDates: Set<string>;
  onSave: (row: DailyReportRow) => void;
  onApprove?: (date: string) => void;
  onReject?: (date: string) => void;
};

export function DailyReportDrawer({
  open,
  onClose,
  report,
  defaultDateIso,
  occupiedDates,
  onSave,
  onApprove,
  onReject,
}: DailyReportDrawerProps) {
  const { t } = useTranslation();
  const [dateIso, setDateIso] = useState(defaultDateIso);
  const [submittedBy, setSubmittedBy] = useState("");
  const [weather, setWeather] = useState("");
  const [narrative, setNarrative] = useState("");
  const [linkedRfisRaw, setLinkedRfisRaw] = useState("");
  const [manpower, setManpower] = useState<DailyReportManpowerLine[]>([emptyManpowerRow()]);
  const [equipment, setEquipment] = useState<DailyReportEquipmentLine[]>([]);
  const [deliveries, setDeliveries] = useState<DailyReportDeliveryLine[]>([]);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<{ date?: string; narrative?: string; manpower?: string }>({});

  const editingDate = report?.date ?? null;

  useEffect(() => {
    if (!open) return;
    setErrors({});
    if (report) {
      setDateIso(report.date);
      setSubmittedBy(report.submittedBy);
      setWeather(report.weather);
      setNarrative(report.narrative);
      setLinkedRfisRaw((report.linkedRfis ?? []).join(", "));
      setManpower(report.manpower.length ? report.manpower : [emptyManpowerRow()]);
      setEquipment(report.equipment.length ? report.equipment : []);
      setDeliveries(report.deliveries.length ? report.deliveries : []);
      setPhotoFiles([]);
    } else {
      setDateIso(defaultDateIso);
      setSubmittedBy(t("dailyReportsPage.create.youLabel"));
      setWeather("");
      setNarrative("");
      setLinkedRfisRaw("");
      setManpower([emptyManpowerRow()]);
      setEquipment([]);
      setDeliveries([]);
      setPhotoFiles([]);
    }
  }, [open, report, defaultDateIso, t]);

  const dateConflict = useMemo(() => {
    if (!dateIso) return false;
    if (editingDate === dateIso) return false;
    return occupiedDates.has(dateIso);
  }, [dateIso, editingDate, occupiedDates]);

  const totalWorkers = useMemo(
    () => manpower.reduce((s, m) => s + (Number(m.workers) || 0), 0),
    [manpower],
  );

  function buildRow(status: DailyReportStatus): DailyReportRow | null {
    const newErrors: { date?: string; narrative?: string; manpower?: string } = {};
    if (!dateIso) newErrors.date = t("dailyReportsPage.create.errorDate");
    else if (dateConflict) newErrors.date = t("dailyReportsPage.create.errorDateTaken");
    if (!narrative.trim()) newErrors.narrative = t("dailyReportsPage.create.errorNarrative");
    const mp = manpower
      .filter((m) => m.company.trim() || m.trade.trim() || (m.workers ?? 0) > 0)
      .map((m) => ({
        company: m.company.trim() || t("dailyReportsPage.create.manpowerFallbackCompany"),
        trade: m.trade.trim() || "—",
        workers: Math.max(0, Number(m.workers) || 0),
        hours: Math.max(0, Number(m.hours) || 0),
        ...(m.costCode?.trim() ? { costCode: m.costCode.trim() } : {}),
      }));
    if (mp.length === 0 || mp.every((m) => m.workers === 0)) {
      newErrors.manpower = t("dailyReportsPage.create.errorManpower");
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return null;
    }
    const linked = parseRfis(linkedRfisRaw);
    const photoLabels = [...(report?.photoLabels ?? []), ...photoFiles.map((f) => f.name)];
    const eq = equipment
      .filter((e) => e.asset.trim())
      .map((e) => ({ asset: e.asset.trim(), hours: Math.max(0, Number(e.hours) || 0) }));
    const del = deliveries
      .filter((d) => d.description.trim())
      .map((d) => ({
        description: d.description.trim(),
        ...(d.supplier?.trim() ? { supplier: d.supplier.trim() } : {}),
      }));
    return {
      date: dateIso,
      submittedBy: submittedBy.trim() || t("dailyReportsPage.create.youLabel"),
      weather: weather.trim() || "—",
      status,
      narrative: narrative.trim(),
      ...(photoLabels.length ? { photoLabels } : {}),
      ...(linked ? { linkedRfis: linked } : {}),
      manpower: mp,
      equipment: eq,
      deliveries: del,
    };
  }

  function handleSaveDraft() {
    const row = buildRow("Draft");
    if (!row) return;
    onSave(row);
    onClose();
  }

  function handleSubmit() {
    const row = buildRow("Pending");
    if (!row) return;
    onSave(row);
    onClose();
  }

  const showReview = report?.status === "Pending";
  const readOnly = report?.status === "Approved";

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex shrink-0 items-start justify-between border-b border-border/60 px-5 py-4">
        <h2 className="font-[family-name:var(--font-dm-sans)] text-base font-semibold text-primary">
          {report ? t("dailyReportsPage.drawer.editTitle") : t("dailyReportsPage.drawer.createTitle")}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded-lg p-1.5 text-muted hover:bg-muted/15 hover:text-primary"
          aria-label={t("dailyReportsPage.close")}
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
        <div>
          <DatePicker
            label={t("dailyReportsPage.create.fieldDate")}
            required
            value={dateIso}
            onChange={(e) => { setDateIso(e.target.value); setErrors((p) => ({ ...p, date: undefined })); }}
            fullWidth
            disabled={readOnly}
          />
          {errors.date ? <p className="mt-1 text-xs text-danger">{errors.date}</p> : null}
        </div>

        <Input
          label={t("dailyReportsPage.create.fieldSubmittedBy")}
          value={submittedBy}
          onChange={(e) => setSubmittedBy(e.target.value)}
          disabled={readOnly}
        />
        <Input
          label={t("dailyReportsPage.create.fieldWeather")}
          value={weather}
          onChange={(e) => setWeather(e.target.value)}
          placeholder={t("dailyReportsPage.create.fieldWeatherPh")}
          disabled={readOnly}
        />
        <div>
          <Textarea
            label={t("dailyReportsPage.create.fieldNarrative")}
            required
            fullWidth
            value={narrative}
            onChange={(e) => { setNarrative(e.target.value); setErrors((p) => ({ ...p, narrative: undefined })); }}
            placeholder={t("dailyReportsPage.create.fieldNarrativePh")}
            rows={5}
            className="min-h-[7rem] w-full"
            disabled={readOnly}
          />
          {errors.narrative ? <p className="mt-1 text-xs text-danger">{errors.narrative}</p> : null}
        </div>
        <Input
          label={t("dailyReportsPage.create.fieldLinkedRfis")}
          value={linkedRfisRaw}
          onChange={(e) => setLinkedRfisRaw(e.target.value)}
          placeholder={t("dailyReportsPage.create.fieldLinkedRfisPh")}
          disabled={readOnly}
        />

        <div className="space-y-2 rounded-lg border border-border/50 bg-muted/[0.04] p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            {t("dailyReportsPage.create.sectionPhotos")}
          </p>
          <p className="text-[12px] text-secondary">{t("dailyReportsPage.create.attachmentsHint")}</p>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              const list = e.target.files;
              if (!list?.length) return;
              setPhotoFiles((prev) => [...prev, ...Array.from(list)]);
              e.target.value = "";
            }}
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => fileRef.current?.click()}
            disabled={readOnly}
          >
            {t("dailyReportsPage.create.addPhotos")}
          </Button>
          {(report?.photoLabels?.length || photoFiles.length) ? (
            <ul className="max-h-24 space-y-0.5 overflow-y-auto text-[12px] text-secondary">
              {(report?.photoLabels ?? []).map((name) => (
                <li key={name} className="truncate">
                  {name}
                </li>
              ))}
              {photoFiles.map((f, i) => (
                <li key={`${f.name}-${i}`} className="flex items-center justify-between gap-1">
                  <span className="min-w-0 truncate">{f.name}</span>
                  <button
                    type="button"
                    className="shrink-0 text-muted hover:text-danger"
                    aria-label={t("dailyReportsPage.create.removePhoto")}
                    onClick={() => setPhotoFiles((prev) => prev.filter((_, j) => j !== i))}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        {errors.manpower ? <p className="text-xs text-danger">{errors.manpower}</p> : null}
        <details className="rounded-lg border border-border/50 bg-muted/[0.04] [&_summary]:cursor-pointer" open>
          <summary className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted">
            {t("dailyReportsPage.create.sectionManpower")} <span className="text-danger">*</span> ({totalWorkers} {t("dailyReportsPage.create.workersSuffix")})
          </summary>
          <div className="space-y-3 border-t border-border/35 px-3 py-3">
            {manpower.map((row, i) => (
              <div key={i} className="grid gap-2 sm:grid-cols-2">
                <Input
                  label={t("dailyReportsPage.create.mpCompany")}
                  value={row.company}
                  onChange={(e) => {
                    const v = e.target.value;
                    setManpower((prev) => prev.map((p, j) => (j === i ? { ...p, company: v } : p)));
                  }}
                  disabled={readOnly}
                />
                <Input
                  label={t("dailyReportsPage.create.mpTrade")}
                  value={row.trade}
                  onChange={(e) => {
                    const v = e.target.value;
                    setManpower((prev) => prev.map((p, j) => (j === i ? { ...p, trade: v } : p)));
                  }}
                  disabled={readOnly}
                />
                <Input
                  label={t("dailyReportsPage.create.mpWorkers")}
                  type="number"
                  min={0}
                  value={row.workers === 0 ? "" : String(row.workers)}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    setManpower((prev) =>
                      prev.map((p, j) => (j === i ? { ...p, workers: Number.isFinite(v) ? v : 0 } : p)),
                    );
                    setErrors((p) => ({ ...p, manpower: undefined }));
                  }}
                  disabled={readOnly}
                />
                <Input
                  label={t("dailyReportsPage.create.mpHours")}
                  type="number"
                  min={0}
                  step={0.5}
                  value={row.hours === 0 ? "" : String(row.hours)}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    setManpower((prev) =>
                      prev.map((p, j) => (j === i ? { ...p, hours: Number.isFinite(v) ? v : 0 } : p)),
                    );
                  }}
                  disabled={readOnly}
                />
                <Input
                  label={t("dailyReportsPage.create.mpCostCode")}
                  value={row.costCode ?? ""}
                  onChange={(e) => {
                    const v = e.target.value;
                    setManpower((prev) => prev.map((p, j) => (j === i ? { ...p, costCode: v } : p)));
                  }}
                  className="sm:col-span-2"
                  disabled={readOnly}
                />
                {manpower.length > 1 && !readOnly ? (
                  <div className="sm:col-span-2">
                    <button
                      type="button"
                      className="text-xs text-danger hover:underline"
                      onClick={() => setManpower((prev) => prev.filter((_, j) => j !== i))}
                    >
                      {t("dailyReportsPage.create.removeManpowerRow")}
                    </button>
                  </div>
                ) : null}
              </div>
            ))}
            {!readOnly ? (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setManpower((prev) => [...prev, emptyManpowerRow()])}
              >
                {t("dailyReportsPage.create.addManpowerRow")}
              </Button>
            ) : null}
          </div>
        </details>

        <details className="rounded-lg border border-border/50 bg-muted/[0.04] [&_summary]:cursor-pointer">
          <summary className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted">
            {t("dailyReportsPage.create.sectionEquipment")}
          </summary>
          <div className="space-y-3 border-t border-border/35 px-3 py-3">
            {equipment.length === 0 ? (
              <p className="text-[12px] text-muted">{t("dailyReportsPage.create.sectionEmptyHint")}</p>
            ) : null}
            {equipment.map((row, i) => (
              <div key={i} className="grid gap-2 sm:grid-cols-2">
                <Input
                  label={t("dailyReportsPage.create.eqAsset")}
                  value={row.asset}
                  onChange={(e) => {
                    const v = e.target.value;
                    setEquipment((prev) => prev.map((p, j) => (j === i ? { ...p, asset: v } : p)));
                  }}
                  disabled={readOnly}
                />
                <Input
                  label={t("dailyReportsPage.create.eqHours")}
                  type="number"
                  min={0}
                  step={0.5}
                  value={row.hours === 0 ? "" : String(row.hours)}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    setEquipment((prev) =>
                      prev.map((p, j) => (j === i ? { ...p, hours: Number.isFinite(v) ? v : 0 } : p)),
                    );
                  }}
                  disabled={readOnly}
                />
                {!readOnly ? (
                  <div className="sm:col-span-2">
                    <button
                      type="button"
                      className="text-xs text-danger hover:underline"
                      onClick={() => setEquipment((prev) => prev.filter((_, j) => j !== i))}
                    >
                      {t("dailyReportsPage.create.removeEquipmentRow")}
                    </button>
                  </div>
                ) : null}
              </div>
            ))}
            {!readOnly ? (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setEquipment((prev) => [...prev, emptyEquipmentRow()])}
              >
                {t("dailyReportsPage.create.addEquipmentRow")}
              </Button>
            ) : null}
          </div>
        </details>

        <details className="rounded-lg border border-border/50 bg-muted/[0.04] [&_summary]:cursor-pointer">
          <summary className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted">
            {t("dailyReportsPage.create.sectionDeliveries")}
          </summary>
          <div className="space-y-3 border-t border-border/35 px-3 py-3">
            {deliveries.length === 0 ? (
              <p className="text-[12px] text-muted">{t("dailyReportsPage.create.sectionEmptyHint")}</p>
            ) : null}
            {deliveries.map((row, i) => (
              <div key={i} className="grid gap-2 sm:grid-cols-2">
                <Input
                  label={t("dailyReportsPage.create.dlDescription")}
                  value={row.description}
                  onChange={(e) => {
                    const v = e.target.value;
                    setDeliveries((prev) => prev.map((p, j) => (j === i ? { ...p, description: v } : p)));
                  }}
                  className="sm:col-span-2"
                  disabled={readOnly}
                />
                <Input
                  label={t("dailyReportsPage.create.dlSupplier")}
                  value={row.supplier ?? ""}
                  onChange={(e) => {
                    const v = e.target.value;
                    setDeliveries((prev) => prev.map((p, j) => (j === i ? { ...p, supplier: v } : p)));
                  }}
                  className="sm:col-span-2"
                  disabled={readOnly}
                />
                {!readOnly ? (
                  <div className="sm:col-span-2">
                    <button
                      type="button"
                      className="text-xs text-danger hover:underline"
                      onClick={() => setDeliveries((prev) => prev.filter((_, j) => j !== i))}
                    >
                      {t("dailyReportsPage.create.removeDeliveryRow")}
                    </button>
                  </div>
                ) : null}
              </div>
            ))}
            {!readOnly ? (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setDeliveries((prev) => [...prev, emptyDeliveryRow()])}
              >
                {t("dailyReportsPage.create.addDeliveryRow")}
              </Button>
            ) : null}
          </div>
        </details>
      </div>

      <div className="flex shrink-0 flex-col gap-2 border-t border-border/60 px-5 py-3">
        {showReview && !readOnly ? (
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => {
                if (report) onApprove?.(report.date);
                onClose();
              }}
            >
              {t("dailyReportsPage.drawer.approve")}
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="border-danger/40 text-danger hover:bg-danger/10"
              onClick={() => {
                if (report) onReject?.(report.date);
                onClose();
              }}
            >
              {t("dailyReportsPage.drawer.reject")}
            </Button>
          </div>
        ) : null}
        {readOnly ? (
          <div className="flex justify-end">
            <Button type="button" variant="secondary" size="sm" onClick={onClose}>
              {t("dailyReportsPage.create.close")}
            </Button>
          </div>
        ) : (
          <div className="flex flex-wrap justify-end gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={onClose}>
              {t("dailyReportsPage.create.cancel")}
            </Button>
            <Button type="button" variant="secondary" size="sm" onClick={handleSaveDraft}>
              {t("dailyReportsPage.create.saveDraft")}
            </Button>
            <Button type="button" variant="primary" size="sm" onClick={handleSubmit}>
              {t("dailyReportsPage.create.submit")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
