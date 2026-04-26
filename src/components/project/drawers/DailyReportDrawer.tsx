import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IconThumbDown, IconThumbUp, IconSave, IconSend } from "@/components/ui/icons";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DAILY_REPORT_STATUS_BADGE } from "@/config/pm/daily-reports";
import type {
  DailyReportDeliveryLine,
  DailyReportEquipmentLine,
  DailyReportManpowerLine,
  DailyReportRow,
  DailyReportStatus,
  DailyReportVisitorLine,
  DailyReportWorkActivity,
  DailyReportSafetyEntry,
  DailyReportWeatherDetail,
} from "@/services/project/projectDummyData";

// ── Empty row factories ───────────────────────────────────────────────────────
const emptyManpower   = (): DailyReportManpowerLine  => ({ company: "", trade: "", workers: 0, hours: 0, costCode: "" });
const emptyEquipment  = (): DailyReportEquipmentLine => ({ asset: "", hours: 0, notes: "" });
const emptyDelivery   = (): DailyReportDeliveryLine  => ({ description: "", supplier: "", quantity: "" });
const emptyVisitor    = (): DailyReportVisitorLine   => ({ name: "", company: "", purpose: "" });
const emptyActivity   = (): DailyReportWorkActivity  => ({ area: "", trade: "", description: "", percentComplete: 0 });
const emptySafety     = (): DailyReportSafetyEntry   => ({ type: "observation", description: "", corrective: "" });
const emptyWeather    = (): DailyReportWeatherDetail => ({ condition: "Sunny", tempC: 30, humidity: 50, windKph: 10 });

function parseRfis(raw: string): string[] | undefined {
  const ids = raw.split(/[,\n]/g).map((s) => s.trim()).filter(Boolean);
  return ids.length ? ids : undefined;
}

// ── Section wrapper ───────────────────────────────────────────────────────────
function Section({ title, badge, required, defaultOpen = false, children }: {
  title: string; badge?: string | number; required?: boolean; defaultOpen?: boolean; children: React.ReactNode;
}) {
  return (
    <details className="group rounded-xl border border-border/50 bg-elevated/40 [&_summary]:cursor-pointer" open={defaultOpen}>
      <summary className="flex items-center gap-2 rounded-xl px-4 py-3 text-[12px] font-semibold uppercase tracking-wider text-muted group-open:rounded-b-none hover:bg-muted/[0.04]">
        <span className="flex-1">{title}{required && <span className="ml-1 text-danger">*</span>}</span>
        {badge !== undefined && (
          <span className="rounded-full bg-muted/15 px-2 py-0.5 text-[10px] tabular-nums">{badge}</span>
        )}
        <svg className="h-3.5 w-3.5 shrink-0 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </summary>
      <div className="border-t border-border/30 px-4 py-4 space-y-3">
        {children}
      </div>
    </details>
  );
}

// ── Read-only detail view ─────────────────────────────────────────────────────
function ReportReadView({ report }: { report: DailyReportRow }) {
  const w = report.weatherDetail;
  const weatherIcon = w ? ({ Sunny: "☀️", Cloudy: "☁️", Rainy: "🌧️", Windy: "💨", Stormy: "⛈️" }[w.condition] ?? "🌤️") : "🌤️";
  const totalWorkers = report.manpower.reduce((s, m) => s + m.workers, 0);
  const totalHours   = report.manpower.reduce((s, m) => s + m.workers * m.hours, 0);

  return (
    <div className="space-y-4 px-5 py-5">
      {/* Status badge + approval */}
      <div className="flex items-center justify-between gap-3">
        <Badge variant={DAILY_REPORT_STATUS_BADGE[report.status]} size="sm">{report.status}</Badge>
        {report.approvedBy && (
          <p className="text-[12px] text-muted">
            Approved by <span className="font-medium text-primary">{report.approvedBy}</span>
            {report.approvedAt && <> · {new Date(report.approvedAt).toLocaleDateString("en", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</>}
          </p>
        )}
      </div>

      {/* Summary chips */}
      <div className="flex flex-wrap gap-2">
        <span className="flex items-center gap-1.5 rounded-full border border-border/50 bg-surface px-3 py-1 text-[12px] text-secondary">
          <span>👷</span> {totalWorkers} workers · {totalHours.toLocaleString()} hrs
        </span>
        {w && (
          <span className="flex items-center gap-1.5 rounded-full border border-border/50 bg-surface px-3 py-1 text-[12px] text-secondary">
            <span>{weatherIcon}</span> {w.condition} · {w.tempC}°C
            {w.humidity && <> · {w.humidity}%</>}
            {w.windKph && <> · {w.windKph} km/h</>}
          </span>
        )}
        {report.subcontractorConfirmed && (
          <span className="flex items-center gap-1 rounded-full border border-success/30 bg-success/10 px-3 py-1 text-[12px] text-success">✓ Subcon confirmed</span>
        )}
      </div>

      {/* Narrative */}
      <div>
        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted">Work Narrative</p>
        <p className="rounded-lg border border-border/40 bg-surface px-3 py-2.5 text-[13px] leading-relaxed text-primary">{report.narrative}</p>
      </div>

      {/* Work Activities */}
      {report.workActivities?.length ? (
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">Work Activities</p>
          <div className="space-y-2">
            {report.workActivities.map((a, i) => (
              <div key={i} className="rounded-lg border border-border/40 bg-surface px-3 py-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[12px] font-semibold text-primary">{a.area}</p>
                    <p className="text-[11px] text-muted">{a.trade} · {a.description}</p>
                  </div>
                  {a.percentComplete !== undefined && (
                    <span className="shrink-0 rounded-full bg-brand/10 px-2 py-0.5 text-[11px] font-bold text-brand">{a.percentComplete}%</span>
                  )}
                </div>
                {a.percentComplete !== undefined && (
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted/20">
                    <div className="h-full rounded-full bg-brand/60" style={{ width: `${a.percentComplete}%` }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Safety */}
      {report.safetyEntries?.length ? (
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">Safety</p>
          <div className="space-y-2">
            {report.safetyEntries.map((s, i) => {
              const color = s.type === "incident" ? "border-danger/30 bg-danger/[0.04]" : s.type === "near_miss" ? "border-warning/30 bg-warning/[0.04]" : "border-border/40 bg-surface";
              const badge = { incident: "Incident", near_miss: "Near-miss", observation: "Observation", toolbox_talk: "Toolbox Talk" }[s.type];
              return (
                <div key={i} className={`rounded-lg border px-3 py-2.5 ${color}`}>
                  <span className={`mb-1 inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold ${s.type === "incident" ? "bg-danger/15 text-danger" : s.type === "near_miss" ? "bg-warning/15 text-warning" : "bg-muted/15 text-muted"}`}>{badge}</span>
                  <p className="text-[12px] text-primary">{s.description}</p>
                  {s.corrective && <p className="mt-1 text-[11px] text-muted"><span className="font-medium">Corrective:</span> {s.corrective}</p>}
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* Manpower table */}
      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">Manpower ({totalWorkers} workers)</p>
        <div className="overflow-x-auto rounded-lg border border-border/40">
          <table className="w-full min-w-[400px] text-[12px]">
            <thead className="border-b border-border/30 bg-muted/[0.05]">
              <tr>
                {["Company", "Trade", "Workers", "Hours", "Cost Code"].map((h) => (
                  <th key={h} className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-muted">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {report.manpower.map((m, i) => (
                <tr key={i} className="hover:bg-muted/[0.03]">
                  <td className="px-3 py-2 font-medium text-primary">{m.company}</td>
                  <td className="px-3 py-2 text-secondary">{m.trade}</td>
                  <td className="px-3 py-2 tabular-nums text-primary">{m.workers}</td>
                  <td className="px-3 py-2 tabular-nums text-secondary">{m.hours}h</td>
                  <td className="px-3 py-2 font-mono text-[11px] text-muted">{m.costCode ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Equipment */}
      {report.equipment.length > 0 && (
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">Equipment</p>
          <div className="space-y-1.5">
            {report.equipment.map((e, i) => (
              <div key={i} className="flex items-center justify-between gap-2 rounded-lg border border-border/40 bg-surface px-3 py-2">
                <span className="text-[12px] font-medium text-primary">{e.asset}</span>
                <div className="text-right">
                  <span className="text-[12px] tabular-nums text-secondary">{e.hours}h</span>
                  {e.notes && <p className="text-[10px] text-muted">{e.notes}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Deliveries */}
      {report.deliveries.length > 0 && (
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">Deliveries</p>
          <div className="space-y-1.5">
            {report.deliveries.map((d, i) => (
              <div key={i} className="rounded-lg border border-border/40 bg-surface px-3 py-2">
                <p className="text-[12px] font-medium text-primary">{d.description}</p>
                <p className="text-[11px] text-muted">{[d.supplier, d.quantity].filter(Boolean).join(" · ")}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Visitors */}
      {report.visitors?.length ? (
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">Visitors ({report.visitors.length})</p>
          <div className="space-y-1.5">
            {report.visitors.map((v, i) => (
              <div key={i} className="flex items-center gap-2.5 rounded-lg border border-border/40 bg-surface px-3 py-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand/15 text-[12px] font-bold text-brand">
                  {v.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[12px] font-medium text-primary">{v.name}</p>
                  <p className="truncate text-[11px] text-muted">{v.company}{v.purpose ? ` · ${v.purpose}` : ""}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Photos */}
      {report.photoLabels?.length ? (
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">Photos ({report.photoLabels.length})</p>
          <div className="flex flex-wrap gap-2">
            {report.photoLabels.map((name) => (
              <span key={name} className="flex items-center gap-1.5 rounded-lg border border-border/40 bg-surface px-2.5 py-1.5 text-[11px] text-secondary">
                <span>📎</span>{name}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {/* Linked RFIs */}
      {report.linkedRfis?.length ? (
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">Linked RFIs</p>
          <div className="flex flex-wrap gap-1.5">
            {report.linkedRfis.map((rfi) => (
              <span key={rfi} className="rounded-full bg-brand/10 px-2.5 py-0.5 text-[11px] font-medium text-brand">{rfi}</span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

// ── Edit/Create form ──────────────────────────────────────────────────────────
export type DailyReportDrawerProps = {
  open: boolean;
  onClose: () => void;
  report: DailyReportRow | null;
  defaultDateIso: string;
  occupiedDates: Set<string>;
  onSave: (row: DailyReportRow) => void;
  onApprove?: (date: string) => void;
  onReject?: (date: string) => void;
};

const WEATHER_CONDITIONS = ["Sunny", "Partly Cloudy", "Cloudy", "Rainy", "Stormy", "Windy"] as const;
const SAFETY_TYPES: DailyReportSafetyEntry["type"][] = ["observation", "toolbox_talk", "near_miss", "incident"];
const SAFETY_TYPE_LABELS: Record<DailyReportSafetyEntry["type"], string> = {
  observation: "Observation", toolbox_talk: "Toolbox Talk", near_miss: "Near-miss", incident: "Incident",
};

export function DailyReportDrawer({ open, onClose, report, defaultDateIso, occupiedDates, onSave, onApprove, onReject }: DailyReportDrawerProps) {
  const { t } = useTranslation();
  const [dateIso,       setDateIso]       = useState(defaultDateIso);
  const [submittedBy,   setSubmittedBy]   = useState("");
  const [narrative,     setNarrative]     = useState("");
  const [linkedRfisRaw, setLinkedRfisRaw] = useState("");
  const [weather,       setWeather]       = useState<DailyReportWeatherDetail>(emptyWeather());
  const [manpower,      setManpower]      = useState<DailyReportManpowerLine[]>([emptyManpower()]);
  const [equipment,     setEquipment]     = useState<DailyReportEquipmentLine[]>([]);
  const [deliveries,    setDeliveries]    = useState<DailyReportDeliveryLine[]>([]);
  const [activities,    setActivities]    = useState<DailyReportWorkActivity[]>([]);
  const [safetyEntries, setSafetyEntries] = useState<DailyReportSafetyEntry[]>([]);
  const [visitors,      setVisitors]      = useState<DailyReportVisitorLine[]>([]);
  const [photoFiles,    setPhotoFiles]    = useState<File[]>([]);
  const [subconConfirmed, setSubconConfirmed] = useState(false);
  const [errors,        setErrors]        = useState<Record<string, string>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  const editingDate = report?.date ?? null;

  useEffect(() => {
    if (!open) return;
    setErrors({});
    if (report) {
      setDateIso(report.date);
      setSubmittedBy(report.submittedBy);
      setNarrative(report.narrative);
      setLinkedRfisRaw((report.linkedRfis ?? []).join(", "));
      setWeather(report.weatherDetail ?? { ...emptyWeather(), condition: report.weather.split(" · ")[0] ?? "Sunny" });
      setManpower(report.manpower.length ? report.manpower : [emptyManpower()]);
      setEquipment(report.equipment);
      setDeliveries(report.deliveries);
      setActivities(report.workActivities ?? []);
      setSafetyEntries(report.safetyEntries ?? []);
      setVisitors(report.visitors ?? []);
      setSubconConfirmed(report.subcontractorConfirmed ?? false);
      setPhotoFiles([]);
    } else {
      setDateIso(defaultDateIso);
      setSubmittedBy(t("dailyReportsPage.create.youLabel"));
      setNarrative("");
      setLinkedRfisRaw("");
      setWeather(emptyWeather());
      setManpower([emptyManpower()]);
      setEquipment([]);
      setDeliveries([]);
      setActivities([]);
      setSafetyEntries([]);
      setVisitors([]);
      setSubconConfirmed(false);
      setPhotoFiles([]);
    }
  }, [open, report, defaultDateIso, t]);

  const dateConflict = useMemo(() => {
    if (!dateIso || editingDate === dateIso) return false;
    return occupiedDates.has(dateIso);
  }, [dateIso, editingDate, occupiedDates]);

  const totalWorkers = useMemo(() => manpower.reduce((s, m) => s + (Number(m.workers) || 0), 0), [manpower]);

  function buildRow(status: DailyReportStatus): DailyReportRow | null {
    const newErrors: Record<string, string> = {};
    if (!dateIso) newErrors.date = t("dailyReportsPage.create.errorDate");
    else if (dateConflict) newErrors.date = t("dailyReportsPage.create.errorDateTaken");
    if (!narrative.trim()) newErrors.narrative = t("dailyReportsPage.create.errorNarrative");
    const mp = manpower.filter((m) => m.company.trim() || m.trade.trim() || (m.workers ?? 0) > 0)
      .map((m) => ({ company: m.company.trim() || t("dailyReportsPage.create.manpowerFallbackCompany"), trade: m.trade.trim() || "—", workers: Math.max(0, Number(m.workers) || 0), hours: Math.max(0, Number(m.hours) || 0), ...(m.costCode?.trim() ? { costCode: m.costCode.trim() } : {}) }));
    if (!mp.length || mp.every((m) => m.workers === 0)) newErrors.manpower = t("dailyReportsPage.create.errorManpower");
    if (Object.keys(newErrors).length) { setErrors(newErrors); return null; }

    const linked      = parseRfis(linkedRfisRaw);
    const photoLabels = [...(report?.photoLabels ?? []), ...photoFiles.map((f) => f.name)];
    const eq = equipment.filter((e) => e.asset.trim()).map((e) => ({ asset: e.asset.trim(), hours: Math.max(0, Number(e.hours) || 0), ...(e.notes?.trim() ? { notes: e.notes.trim() } : {}) }));
    const del = deliveries.filter((d) => d.description.trim()).map((d) => ({ description: d.description.trim(), ...(d.supplier?.trim() ? { supplier: d.supplier.trim() } : {}), ...(d.quantity?.trim() ? { quantity: d.quantity.trim() } : {}) }));
    const acts = activities.filter((a) => a.description.trim()).map((a) => ({ area: a.area.trim() || "General", trade: a.trade.trim() || "—", description: a.description.trim(), ...(a.percentComplete ? { percentComplete: a.percentComplete } : {}) }));
    const safety = safetyEntries.filter((s) => s.description.trim()).map((s) => ({ type: s.type, description: s.description.trim(), ...(s.corrective?.trim() ? { corrective: s.corrective.trim() } : {}) }));
    const vis = visitors.filter((v) => v.name.trim()).map((v) => ({ name: v.name.trim(), company: v.company.trim() || "—", ...(v.purpose?.trim() ? { purpose: v.purpose.trim() } : {}) }));
    const weatherStr = `${weather.condition} · ${weather.tempC}°C`;

    return {
      date: dateIso, submittedBy: submittedBy.trim() || t("dailyReportsPage.create.youLabel"),
      weather: weatherStr, weatherDetail: weather, status, narrative: narrative.trim(),
      ...(photoLabels.length ? { photoLabels } : {}), ...(linked ? { linkedRfis: linked } : {}),
      ...(acts.length ? { workActivities: acts } : {}), ...(safety.length ? { safetyEntries: safety } : {}),
      ...(vis.length ? { visitors: vis } : {}), manpower: mp, equipment: eq, deliveries: del,
      subcontractorConfirmed: subconConfirmed,
    };
  }

  const handleSaveDraft = () => { const row = buildRow("Draft"); if (row) { onSave(row); onClose(); } };
  const handleSubmit    = () => { const row = buildRow("Pending"); if (row) { onSave(row); onClose(); } };

  const showReview = report?.status === "Pending";
  const readOnly   = report?.status === "Approved";

  // Approved → read-only detail view
  if (readOnly && report) {
    return (
      <div className="flex h-full flex-col overflow-hidden">
        <DrawerHeader title={`Daily Report — ${report.date}`} status={report.status} onClose={onClose} />
        <div className="flex-1 overflow-y-auto">
          <ReportReadView report={report} />
        </div>
        <div className="flex shrink-0 justify-between gap-2 border-t border-border/60 px-5 py-3">
          <button type="button" onClick={() => window.print()} className="flex items-center gap-1.5 rounded-lg border border-border/60 px-3 py-1.5 text-[12px] text-secondary hover:bg-muted/10">
            🖨️ Export / Print
          </button>
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>{t("dailyReportsPage.create.close")}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <DrawerHeader
        title={report ? t("dailyReportsPage.drawer.editTitle") : t("dailyReportsPage.drawer.createTitle")}
        status={report?.status}
        onClose={onClose}
      />

      <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">

        {/* ── Date + submitted by ── */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <DatePicker label={t("dailyReportsPage.create.fieldDate")} required value={dateIso}
              onChange={(e) => { setDateIso(e.target.value); setErrors((p) => ({ ...p, date: "" })); }} fullWidth disabled={readOnly} />
            {errors.date && <p className="mt-1 text-xs text-danger">{errors.date}</p>}
          </div>
          <Input label={t("dailyReportsPage.create.fieldSubmittedBy")} value={submittedBy}
            onChange={(e) => setSubmittedBy(e.target.value)} disabled={readOnly} />
        </div>

        {/* ── Weather ── */}
        <Section title="Weather" defaultOpen>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-[11px] font-medium text-secondary">Condition</label>
              <select value={weather.condition}
                onChange={(e) => setWeather((p) => ({ ...p, condition: e.target.value }))}
                className="w-full rounded-lg border border-border/60 bg-bg px-3 py-2 text-[13px] text-primary focus:border-brand/50 focus:outline-none">
                {WEATHER_CONDITIONS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <Input label="Temp (°C)" type="number" value={weather.tempC === 0 ? "" : String(weather.tempC)}
              onChange={(e) => setWeather((p) => ({ ...p, tempC: parseInt(e.target.value, 10) || 0 }))} />
            <Input label="Humidity (%)" type="number" value={weather.humidity === 0 ? "" : String(weather.humidity ?? "")}
              onChange={(e) => setWeather((p) => ({ ...p, humidity: parseInt(e.target.value, 10) || 0 }))} />
            <Input label="Wind (km/h)" type="number" value={weather.windKph === 0 ? "" : String(weather.windKph ?? "")}
              onChange={(e) => setWeather((p) => ({ ...p, windKph: parseInt(e.target.value, 10) || 0 }))} />
            <div className="sm:col-span-2">
              <Input label="Weather notes" value={weather.notes ?? ""}
                onChange={(e) => setWeather((p) => ({ ...p, notes: e.target.value }))}
                placeholder="e.g. Rain stopped exterior work at 14:00" />
            </div>
          </div>
        </Section>

        {/* ── Narrative ── */}
        <Section title="Work Narrative" required defaultOpen>
          <Textarea fullWidth value={narrative}
            onChange={(e) => { setNarrative(e.target.value); setErrors((p) => ({ ...p, narrative: "" })); }}
            placeholder={t("dailyReportsPage.create.fieldNarrativePh")}
            rows={4} className="min-h-[6rem] w-full" />
          {errors.narrative && <p className="text-xs text-danger">{errors.narrative}</p>}
        </Section>

        {/* ── Work Activities ── */}
        <Section title="Work Activities" badge={activities.length || undefined}>
          {activities.length === 0 && <p className="text-[12px] text-muted">No activities yet. Add one to track progress by area.</p>}
          {activities.map((a, i) => (
            <div key={i} className="rounded-lg border border-border/40 bg-surface p-3 space-y-2">
              <div className="grid gap-2 sm:grid-cols-2">
                <Input label="Area / Location" value={a.area} placeholder="e.g. Level 3 – Grid C"
                  onChange={(e) => { const v = e.target.value; setActivities((p) => p.map((x, j) => j === i ? { ...x, area: v } : x)); }} />
                <Input label="Trade" value={a.trade}
                  onChange={(e) => { const v = e.target.value; setActivities((p) => p.map((x, j) => j === i ? { ...x, trade: v } : x)); }} />
                <Input label="Description" value={a.description} className="sm:col-span-2"
                  onChange={(e) => { const v = e.target.value; setActivities((p) => p.map((x, j) => j === i ? { ...x, description: v } : x)); }} />
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-secondary">% Complete</label>
                  <input type="range" min={0} max={100} step={5} value={a.percentComplete ?? 0}
                    onChange={(e) => { const v = parseInt(e.target.value, 10); setActivities((p) => p.map((x, j) => j === i ? { ...x, percentComplete: v } : x)); }}
                    className="w-full accent-brand" />
                  <p className="mt-0.5 text-right text-[11px] text-brand font-semibold">{a.percentComplete ?? 0}%</p>
                </div>
              </div>
              <button type="button" className="text-xs text-danger hover:underline"
                onClick={() => setActivities((p) => p.filter((_, j) => j !== i))}>Remove</button>
            </div>
          ))}
          <Button type="button" variant="secondary" size="sm" onClick={() => setActivities((p) => [...p, emptyActivity()])}>+ Add Activity</Button>
        </Section>

        {/* ── Manpower ── */}
        <Section title={t("dailyReportsPage.create.sectionManpower")} required badge={`${totalWorkers} workers`} defaultOpen>
          {errors.manpower && <p className="text-xs text-danger">{errors.manpower}</p>}
          {manpower.map((row, i) => (
            <div key={i} className="rounded-lg border border-border/40 bg-surface p-3 space-y-2">
              <div className="grid gap-2 sm:grid-cols-2">
                <Input label={t("dailyReportsPage.create.mpCompany")} value={row.company}
                  onChange={(e) => { const v = e.target.value; setManpower((p) => p.map((x, j) => j === i ? { ...x, company: v } : x)); }} />
                <Input label={t("dailyReportsPage.create.mpTrade")} value={row.trade}
                  onChange={(e) => { const v = e.target.value; setManpower((p) => p.map((x, j) => j === i ? { ...x, trade: v } : x)); }} />
                <Input label={t("dailyReportsPage.create.mpWorkers")} type="number" min={0}
                  value={row.workers === 0 ? "" : String(row.workers)}
                  onChange={(e) => { const v = parseInt(e.target.value, 10); setManpower((p) => p.map((x, j) => j === i ? { ...x, workers: Number.isFinite(v) ? v : 0 } : x)); setErrors((p) => ({ ...p, manpower: "" })); }} />
                <Input label={t("dailyReportsPage.create.mpHours")} type="number" min={0} step={0.5}
                  value={row.hours === 0 ? "" : String(row.hours)}
                  onChange={(e) => { const v = parseFloat(e.target.value); setManpower((p) => p.map((x, j) => j === i ? { ...x, hours: Number.isFinite(v) ? v : 0 } : x)); }} />
                <Input label={t("dailyReportsPage.create.mpCostCode")} value={row.costCode ?? ""} className="sm:col-span-2"
                  onChange={(e) => { const v = e.target.value; setManpower((p) => p.map((x, j) => j === i ? { ...x, costCode: v } : x)); }} />
              </div>
              {manpower.length > 1 && (
                <button type="button" className="text-xs text-danger hover:underline"
                  onClick={() => setManpower((p) => p.filter((_, j) => j !== i))}>
                  {t("dailyReportsPage.create.removeManpowerRow")}
                </button>
              )}
            </div>
          ))}
          <Button type="button" variant="secondary" size="sm" onClick={() => setManpower((p) => [...p, emptyManpower()])}>
            {t("dailyReportsPage.create.addManpowerRow")}
          </Button>
        </Section>

        {/* ── Equipment ── */}
        <Section title={t("dailyReportsPage.create.sectionEquipment")} badge={equipment.length || undefined}>
          {equipment.length === 0 && <p className="text-[12px] text-muted">{t("dailyReportsPage.create.sectionEmptyHint")}</p>}
          {equipment.map((row, i) => (
            <div key={i} className="rounded-lg border border-border/40 bg-surface p-3 space-y-2">
              <div className="grid gap-2 sm:grid-cols-2">
                <Input label={t("dailyReportsPage.create.eqAsset")} value={row.asset}
                  onChange={(e) => { const v = e.target.value; setEquipment((p) => p.map((x, j) => j === i ? { ...x, asset: v } : x)); }} />
                <Input label={t("dailyReportsPage.create.eqHours")} type="number" min={0} step={0.5}
                  value={row.hours === 0 ? "" : String(row.hours)}
                  onChange={(e) => { const v = parseFloat(e.target.value); setEquipment((p) => p.map((x, j) => j === i ? { ...x, hours: Number.isFinite(v) ? v : 0 } : x)); }} />
                <Input label="Notes" value={row.notes ?? ""} className="sm:col-span-2"
                  onChange={(e) => { const v = e.target.value; setEquipment((p) => p.map((x, j) => j === i ? { ...x, notes: v } : x)); }} />
              </div>
              <button type="button" className="text-xs text-danger hover:underline"
                onClick={() => setEquipment((p) => p.filter((_, j) => j !== i))}>
                {t("dailyReportsPage.create.removeEquipmentRow")}
              </button>
            </div>
          ))}
          <Button type="button" variant="secondary" size="sm" onClick={() => setEquipment((p) => [...p, emptyEquipment()])}>
            {t("dailyReportsPage.create.addEquipmentRow")}
          </Button>
        </Section>

        {/* ── Deliveries ── */}
        <Section title={t("dailyReportsPage.create.sectionDeliveries")} badge={deliveries.length || undefined}>
          {deliveries.length === 0 && <p className="text-[12px] text-muted">{t("dailyReportsPage.create.sectionEmptyHint")}</p>}
          {deliveries.map((row, i) => (
            <div key={i} className="rounded-lg border border-border/40 bg-surface p-3 space-y-2">
              <div className="grid gap-2 sm:grid-cols-2">
                <Input label={t("dailyReportsPage.create.dlDescription")} value={row.description} className="sm:col-span-2"
                  onChange={(e) => { const v = e.target.value; setDeliveries((p) => p.map((x, j) => j === i ? { ...x, description: v } : x)); }} />
                <Input label={t("dailyReportsPage.create.dlSupplier")} value={row.supplier ?? ""}
                  onChange={(e) => { const v = e.target.value; setDeliveries((p) => p.map((x, j) => j === i ? { ...x, supplier: v } : x)); }} />
                <Input label="Quantity" value={row.quantity ?? ""}
                  onChange={(e) => { const v = e.target.value; setDeliveries((p) => p.map((x, j) => j === i ? { ...x, quantity: v } : x)); }} />
              </div>
              <button type="button" className="text-xs text-danger hover:underline"
                onClick={() => setDeliveries((p) => p.filter((_, j) => j !== i))}>
                {t("dailyReportsPage.create.removeDeliveryRow")}
              </button>
            </div>
          ))}
          <Button type="button" variant="secondary" size="sm" onClick={() => setDeliveries((p) => [...p, emptyDelivery()])}>
            {t("dailyReportsPage.create.addDeliveryRow")}
          </Button>
        </Section>

        {/* ── Safety ── */}
        <Section title="Safety" badge={safetyEntries.length || undefined}>
          {safetyEntries.length === 0 && <p className="text-[12px] text-muted">No safety entries. Add observations, toolbox talks, or incidents.</p>}
          {safetyEntries.map((s, i) => (
            <div key={i} className={`rounded-lg border p-3 space-y-2 ${s.type === "incident" ? "border-danger/30 bg-danger/[0.03]" : s.type === "near_miss" ? "border-warning/30 bg-warning/[0.03]" : "border-border/40 bg-surface"}`}>
              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-secondary">Type</label>
                  <select value={s.type}
                    onChange={(e) => { const v = e.target.value as DailyReportSafetyEntry["type"]; setSafetyEntries((p) => p.map((x, j) => j === i ? { ...x, type: v } : x)); }}
                    className="w-full rounded-lg border border-border/60 bg-bg px-3 py-2 text-[13px] text-primary focus:border-brand/50 focus:outline-none">
                    {SAFETY_TYPES.map((st) => <option key={st} value={st}>{SAFETY_TYPE_LABELS[st]}</option>)}
                  </select>
                </div>
                <Input label="Description" value={s.description}
                  onChange={(e) => { const v = e.target.value; setSafetyEntries((p) => p.map((x, j) => j === i ? { ...x, description: v } : x)); }} />
                <Input label="Corrective Action" value={s.corrective ?? ""} className="sm:col-span-2"
                  onChange={(e) => { const v = e.target.value; setSafetyEntries((p) => p.map((x, j) => j === i ? { ...x, corrective: v } : x)); }} />
              </div>
              <button type="button" className="text-xs text-danger hover:underline"
                onClick={() => setSafetyEntries((p) => p.filter((_, j) => j !== i))}>Remove</button>
            </div>
          ))}
          <Button type="button" variant="secondary" size="sm" onClick={() => setSafetyEntries((p) => [...p, emptySafety()])}>+ Add Safety Entry</Button>
        </Section>

        {/* ── Visitors ── */}
        <Section title="Visitors" badge={visitors.length || undefined}>
          {visitors.length === 0 && <p className="text-[12px] text-muted">No visitors logged.</p>}
          {visitors.map((v, i) => (
            <div key={i} className="rounded-lg border border-border/40 bg-surface p-3 space-y-2">
              <div className="grid gap-2 sm:grid-cols-3">
                <Input label="Name" value={v.name}
                  onChange={(e) => { const val = e.target.value; setVisitors((p) => p.map((x, j) => j === i ? { ...x, name: val } : x)); }} />
                <Input label="Company" value={v.company}
                  onChange={(e) => { const val = e.target.value; setVisitors((p) => p.map((x, j) => j === i ? { ...x, company: val } : x)); }} />
                <Input label="Purpose" value={v.purpose ?? ""}
                  onChange={(e) => { const val = e.target.value; setVisitors((p) => p.map((x, j) => j === i ? { ...x, purpose: val } : x)); }} />
              </div>
              <button type="button" className="text-xs text-danger hover:underline"
                onClick={() => setVisitors((p) => p.filter((_, j) => j !== i))}>Remove</button>
            </div>
          ))}
          <Button type="button" variant="secondary" size="sm" onClick={() => setVisitors((p) => [...p, emptyVisitor()])}>+ Add Visitor</Button>
        </Section>

        {/* ── Photos ── */}
        <Section title={t("dailyReportsPage.create.sectionPhotos")}>
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
            onChange={(e) => { const list = e.target.files; if (!list?.length) return; setPhotoFiles((p) => [...p, ...Array.from(list)]); e.target.value = ""; }} />
          <Button type="button" variant="secondary" size="sm" onClick={() => fileRef.current?.click()}>
            {t("dailyReportsPage.create.addPhotos")}
          </Button>
          {(report?.photoLabels?.length || photoFiles.length) ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {(report?.photoLabels ?? []).map((name) => (
                <span key={name} className="flex items-center gap-1 rounded-lg border border-border/40 px-2 py-1 text-[11px] text-secondary">📎 {name}</span>
              ))}
              {photoFiles.map((f, i) => (
                <span key={`${f.name}-${i}`} className="flex items-center gap-1 rounded-lg border border-brand/30 bg-brand/5 px-2 py-1 text-[11px] text-brand">
                  📎 {f.name}
                  <button type="button" className="ml-0.5 text-muted hover:text-danger" onClick={() => setPhotoFiles((p) => p.filter((_, j) => j !== i))}>×</button>
                </span>
              ))}
            </div>
          ) : null}
        </Section>

        {/* ── Linked RFIs + Subcon confirm ── */}
        <Section title="Links & Confirmation">
          <Input label={t("dailyReportsPage.create.fieldLinkedRfis")} value={linkedRfisRaw}
            onChange={(e) => setLinkedRfisRaw(e.target.value)}
            placeholder={t("dailyReportsPage.create.fieldLinkedRfisPh")} />
          <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-border/40 bg-surface px-3 py-2.5">
            <input type="checkbox" checked={subconConfirmed} onChange={(e) => setSubconConfirmed(e.target.checked)}
              className="h-4 w-4 accent-brand rounded" />
            <div>
              <p className="text-[13px] font-medium text-primary">Subcontractor confirmation received</p>
              <p className="text-[11px] text-muted">All on-site subcontractors have acknowledged today's activities.</p>
            </div>
          </label>
        </Section>

      </div>

      {/* ── Footer actions ── */}
      <div className="flex shrink-0 flex-col gap-2 border-t border-border/60 px-5 py-3">
        {showReview && (
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="primary" size="sm" className="inline-flex items-center gap-1.5"
              onClick={() => { if (report) onApprove?.(report.date); onClose(); }}>
              <IconThumbUp />{t("dailyReportsPage.drawer.approve")}
            </Button>
            <Button type="button" variant="secondary" size="sm" className="inline-flex items-center gap-1.5 border-danger/40 text-danger hover:bg-danger/10"
              onClick={() => { if (report) onReject?.(report.date); onClose(); }}>
              <IconThumbDown />{t("dailyReportsPage.drawer.reject")}
            </Button>
          </div>
        )}
        <div className="flex flex-wrap justify-end gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>{t("dailyReportsPage.create.cancel")}</Button>
          <Button type="button" variant="secondary" size="sm" className="inline-flex items-center gap-1.5" onClick={handleSaveDraft}>
            <IconSave />{t("dailyReportsPage.create.saveDraft")}
          </Button>
          <Button type="button" variant="primary" size="sm" className="inline-flex items-center gap-1.5" onClick={handleSubmit}>
            <IconSend />{t("dailyReportsPage.create.submit")}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Shared drawer header ──────────────────────────────────────────────────────
function DrawerHeader({ title, status, onClose }: { title: string; status?: DailyReportStatus; onClose: () => void }) {
  return (
    <div className="flex shrink-0 items-center justify-between border-b border-border/60 px-5 py-4">
      <div className="flex items-center gap-2.5">
        <h2 className="font-[family-name:var(--font-dm-sans)] text-[15px] font-semibold text-primary">{title}</h2>
        {status && <Badge variant={DAILY_REPORT_STATUS_BADGE[status]} size="sm">{status}</Badge>}
      </div>
      <button type="button" onClick={onClose}
        className="shrink-0 rounded-lg p-1.5 text-muted hover:bg-muted/15 hover:text-primary">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
