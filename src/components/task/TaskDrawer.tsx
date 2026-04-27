import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Avatar, Button } from "@/components/ui";
import { Select } from "@/components/ui/select";
import type { BuildWireTask, TaskPriorityKey, TaskStatus } from "@/types/task";
import {
  TASK_COLUMNS,
  taskPriorityTKey,
  taskWorkflowTKey,
} from "@/utils/task/fixtures";
import {
  taskTypeKeyTKey,
  taskTradeKeyTKey,
} from "@/utils/task/taskI18nKeys";
import {
  demoAssigneesDisplayList,
  demoPrimaryAssigneeName,
  demoPrimaryInitials,
  DEMO_USERS,
} from "@/utils/task/demoUsers";
import {
  draftToNewTaskValues,
  draftToPatch,
  emptyTaskDraft,
  taskToDraft,
  type TaskEditorDraft,
} from "@/utils/task/taskEditorState";
import { useTaskProject } from "@/hooks/task/TaskProjectContext";
import {
  BUILTIN_TASK_TEMPLATES,
  orderedTemplatesForPicker,
  recordTemplateUse,
} from "@/utils/task/taskTemplates";
import { createBuildWireTask } from "@/utils/task/taskFactory";
import { ALL_TASK_TYPE_KEYS, ALL_TRADE_KEYS, FLOOR_OPTIONS } from "@/utils/task/taskConstants";
import { UserMultiSelect } from "@/components/ui/user-multi-select";

function toggleAssigneeId(ids: string[], id: string): string[] {
  return ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];
}

function isDueOverdue(due: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(due)) return false;
  const d = new Date(`${due}T12:00:00`);
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  return d < t;
}

function draftFingerprint(d: TaskEditorDraft): string {
  const { templateId: _t, advancedOpen: _a, ...core } = d;
  return JSON.stringify(core);
}

/** Status bar color at top of drawer */
function statusBarColor(status: TaskStatus): string {
  switch (status) {
    case "done": return "bg-success";
    case "blocked": return "bg-danger";
    case "in_review": return "bg-brand";
    case "awaiting_inspection": return "bg-warning";
    case "in_progress": return "bg-info";
    default: return "bg-muted/40";
  }
}

/** Status pill color */
function statusPillClass(status: TaskStatus): string {
  switch (status) {
    case "done": return "bg-success text-white";
    case "blocked": return "bg-danger text-white";
    case "in_review": return "bg-brand text-white";
    case "awaiting_inspection": return "bg-warning text-white";
    case "in_progress": return "bg-info text-white";
    default: return "bg-muted/20 text-secondary";
  }
}

/** Priority dot color */
function priorityDot(p: TaskPriorityKey): string {
  switch (p) {
    case "critical": return "bg-danger";
    case "high": return "bg-warning";
    case "medium": return "bg-brand";
    default: return "bg-muted";
  }
}

/** Stacked field row — label above, control below */
function FieldRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="border-b border-border/30 py-2.5 last:border-0">
      <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-muted">
        {label}
      </span>
      <div className="min-w-0 text-sm text-primary">{children}</div>
    </div>
  );
}

const MOCK_SUBTASKS = [
  { id: "s1", label: "Verify shop drawing against field measure", done: false },
  { id: "s2", label: "Photo documentation uploaded", done: true },
  { id: "s3", label: "GC sign-off", done: false },
];

export type TaskDrawerProps =
  | {
      mode: "create";
      onClose: () => void;
      expanded?: boolean;
      onToggleExpand?: () => void;
      onCreated?: (task: BuildWireTask) => void;
      defaultKanbanSectionId?: string;
    }
  | {
      mode: "edit";
      task: BuildWireTask;
      onClose: () => void;
      expanded?: boolean;
      onToggleExpand?: () => void;
    };

// ── Create drawer ─────────────────────────────────────────────────────────────
function TaskDrawerCreate({
  onClose,
  expanded = false,
  onToggleExpand,
  onCreated,
  defaultKanbanSectionId,
}: {
  onClose: () => void;
  expanded?: boolean;
  onToggleExpand?: () => void;
  onCreated?: (task: BuildWireTask) => void;
  defaultKanbanSectionId?: string;
}) {
  const { t } = useTranslation();
  const { addTask, nextDisplayNumber, tasks, getNextKanbanOrder, resolveKanbanSectionId } = useTaskProject();
  const [draft, setDraft] = useState<TaskEditorDraft>(() => emptyTaskDraft());
  const [error, setError] = useState<string | null>(null);
  const templates = orderedTemplatesForPicker(BUILTIN_TASK_TEMPLATES);
  const previewDisplayNumber = useMemo(() => nextDisplayNumber(), [nextDisplayNumber, tasks]);

  function update(p: Partial<TaskEditorDraft>) {
    setDraft((d) => ({ ...d, ...p }));
  }

  function applyTemplate(id: string) {
    if (!id) { update({ templateId: "" }); return; }
    const tpl = BUILTIN_TASK_TEMPLATES.find((x) => x.id === id);
    if (!tpl) { update({ templateId: id }); return; }
    recordTemplateUse(id);
    setDraft((d) => ({
      ...d, templateId: id, type: tpl.type, priority: tpl.priority,
      trade: tpl.trade, floor: tpl.floor, description: tpl.description,
      assignees: tpl.assignees.length ? [...tpl.assignees] : [DEMO_USERS[0].id],
    }));
  }

  function submit(another: boolean) {
    const trimmed = draft.title.trim();
    if (!trimmed) { setError(t("newTaskDrawer.errorTitle")); return; }
    if (draft.status === "blocked" && !draft.blocked_reason.trim()) {
      setError(t("newTaskDrawer.errorBlocked")); return;
    }
    setError(null);
    const num = nextDisplayNumber();
    const values = draftToNewTaskValues({ ...draft, title: trimmed });
    const sid = resolveKanbanSectionId(defaultKanbanSectionId);
    const order = getNextKanbanOrder(sid);
    const task = createBuildWireTask(num, values, "u_current", { sectionId: sid, order });
    if (draft.root_cause.trim()) task.root_cause = draft.root_cause.trim();
    addTask(task);
    onCreated?.(task);
    if (another) { setDraft(emptyTaskDraft()); setError(null); }
    else onClose();
  }

  const overdue = draft.status !== "done" && draft.status !== "void" && isDueOverdue(draft.due_date.slice(0, 10));

  return (
    <div className="flex h-full min-h-0 flex-col bg-elevated">
      {/* Status color bar */}
      <div className={`h-1 w-full shrink-0 ${statusBarColor(draft.status)}`} />

      {/* Header */}
      <header className="shrink-0 border-b border-border/60 bg-elevated px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-muted">
                {previewDisplayNumber}
              </p>
              <h2 className="mt-0.5 text-[15px] font-semibold text-primary">
                {t("taskDetailDrawer.newTaskBadge")}
              </h2>
            </div>
            <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${statusPillClass(draft.status)}`}>
              {t(taskWorkflowTKey(draft.status))}
            </span>
            {overdue && (
              <span className="rounded-full bg-danger px-2.5 py-0.5 text-[11px] font-semibold text-white">
                Overdue
              </span>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {onToggleExpand && (
              <button type="button" onClick={onToggleExpand}
                className="rounded-lg p-1.5 text-muted hover:bg-surface hover:text-primary"
                title={expanded ? "Collapse" : "Expand"}>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {expanded
                    ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 15H5v4M15 9h4V5M19 15v4h-4M5 9V5h4" />
                    : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 3h6v6M9 21H3v-6M21 15v6h-6M3 9V3h6" />}
                </svg>
              </button>
            )}
            <button type="button" onClick={onClose}
              className="rounded-lg p-1.5 text-muted hover:bg-surface hover:text-primary"
              aria-label={t("common.closeDialog")}>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Body — two columns when expanded */}
      <div className={`min-h-0 flex-1 overflow-y-auto ${expanded ? "lg:grid lg:grid-cols-[1fr_300px] lg:divide-x lg:divide-border/40 lg:overflow-hidden" : ""}`}>
        {/* Main — title + description + template */}
        <form id="task-drawer-create-form" onSubmit={(e) => { e.preventDefault(); submit(false); }}
          className={`flex flex-col gap-5 p-5 ${expanded ? "lg:overflow-y-auto" : ""}`}>
          {error && (
            <div className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">{error}</div>
          )}

          {/* Template picker */}
          {templates.length > 0 && (
            <Select
              id="nt-template"
              label={t("newTaskDrawer.template")}
              value={draft.templateId}
              onValueChange={applyTemplate}
              options={[{ value: "", label: t("newTaskDrawer.noTemplate") }, ...templates.map((tpl) => ({ value: tpl.id, label: tpl.name }))]}
            />
          )}

          {/* Title */}
          <div>
            <label htmlFor="nt-title" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
              {t("newTaskDrawer.fieldTitle")} <span className="text-danger">*</span>
            </label>
            <input
              id="nt-title"
              value={draft.title}
              onChange={(e) => update({ title: e.target.value })}
              placeholder={t("newTaskDrawer.titlePlaceholder")}
              autoFocus
              className={`w-full rounded-lg border bg-bg px-3 py-2.5 text-sm text-primary placeholder:text-muted focus:outline-none focus:ring-2 ${error ? "border-danger focus:ring-danger/30" : "border-border focus:border-brand focus:ring-brand/20"}`}
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="nt-desc" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
              {t("newTaskDrawer.description")}
            </label>
            <textarea
              id="nt-desc"
              value={draft.description}
              onChange={(e) => update({ description: e.target.value })}
              rows={5}
              placeholder={t("taskDetailDrawer.descriptionPlaceholder")}
              className="w-full resize-y rounded-lg border border-border bg-bg px-3 py-2.5 text-sm text-primary placeholder:text-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
          </div>

          {/* Photos upload */}
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted">{t("taskForm.sectionPhotos")}</p>
            <button type="button"
              className="flex w-full flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border/60 bg-bg/50 px-4 py-6 text-center hover:border-brand/40 hover:bg-brand/5">
              <svg className="h-5 w-5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4-4 4 4 4-6 4 6M4 20h16M4 4h16v12H4z" />
              </svg>
              <span className="text-sm font-medium text-secondary">{t("taskForm.dropPhotos")}</span>
              <span className="text-xs text-muted">{t("taskForm.uploadHint")}</span>
            </button>
          </div>
        </form>

        {/* Sidebar — all meta fields */}
        <div className={`flex flex-col gap-0 border-t border-border/40 bg-surface/30 px-5 py-4 ${expanded ? "lg:overflow-y-auto lg:border-t-0" : ""}`}>
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-muted">{t("taskDetailDrawer.tabTask")}</p>

          <FieldRow label={t("newTaskDrawer.status")}>
            <Select size="sm" fullWidth value={draft.status}
              onValueChange={(v) => update({ status: v as TaskStatus })}
              options={[...TASK_COLUMNS.map((c) => ({ value: c.id, label: t(taskWorkflowTKey(c.id)) })), { value: "void", label: t(taskWorkflowTKey("void")) }]}
            />
          </FieldRow>

          {draft.status === "blocked" && (
            <FieldRow label={t("newTaskDrawer.blockedReasonLabel")}>
              <textarea value={draft.blocked_reason} onChange={(e) => update({ blocked_reason: e.target.value })}
                rows={2} className="w-full resize-none rounded-lg border border-danger/40 bg-bg px-2.5 py-1.5 text-sm text-primary focus:border-danger focus:outline-none" />
            </FieldRow>
          )}

          <FieldRow label={t("newTaskDrawer.priority")}>
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 shrink-0 rounded-full ${priorityDot(draft.priority)}`} />
              <Select size="sm" fullWidth value={draft.priority}
                onValueChange={(v) => update({ priority: v as TaskPriorityKey })}
                options={(["critical", "high", "medium", "low"] as const).map((p) => ({ value: p, label: t(taskPriorityTKey(p)) }))}
              />
            </div>
          </FieldRow>

          <FieldRow label={t("newTaskDrawer.type")}>
            <Select size="sm" fullWidth value={draft.type}
              onValueChange={(v) => update({ type: v as any })}
              options={ALL_TASK_TYPE_KEYS.map((k) => ({ value: k, label: t(taskTypeKeyTKey(k)) }))}
            />
          </FieldRow>

          <FieldRow label={t("newTaskDrawer.trade")}>
            <Select size="sm" fullWidth value={draft.trade}
              onValueChange={(v) => update({ trade: v as any })}
              options={ALL_TRADE_KEYS.map((k) => ({ value: k, label: t(taskTradeKeyTKey(k)) }))}
            />
          </FieldRow>

          <FieldRow label={t("newTaskDrawer.floor")}>
            <Select size="sm" fullWidth value={draft.floor}
              onValueChange={(v) => update({ floor: v })}
              options={FLOOR_OPTIONS.map((f) => ({ value: f, label: f }))}
            />
          </FieldRow>

          <FieldRow label={t("newTaskDrawer.locationDetail")}>
            <input value={draft.location_detail} onChange={(e) => update({ location_detail: e.target.value })}
              placeholder={t("newTaskDrawer.locationPlaceholder")}
              className="w-full rounded-lg border border-border bg-bg px-2.5 py-1.5 text-sm text-primary placeholder:text-muted focus:border-brand focus:outline-none" />
          </FieldRow>

          <FieldRow label={t("newTaskDrawer.assignees")}>
            <UserMultiSelect label={t("newTaskDrawer.assignees")} users={DEMO_USERS} selectedIds={draft.assignees} onChange={(ids) => update({ assignees: ids })} />
          </FieldRow>

          <FieldRow label={t("newTaskDrawer.watchers")}>
            <UserMultiSelect label={t("newTaskDrawer.watchers")} users={DEMO_USERS} selectedIds={draft.watchers} onChange={(ids) => update({ watchers: ids })} />
          </FieldRow>

          <FieldRow label={t("newTaskDrawer.startDate")}>
            <input type="date" value={draft.start_date} onChange={(e) => update({ start_date: e.target.value })}
              className="w-full rounded-lg border border-border bg-bg px-2.5 py-1.5 text-sm text-primary focus:border-brand focus:outline-none [color-scheme:dark]" />
          </FieldRow>

          <FieldRow label={t("newTaskDrawer.dueDate")}>
            <input type="date" value={draft.due_date} onChange={(e) => update({ due_date: e.target.value })}
              className="w-full rounded-lg border border-border bg-bg px-2.5 py-1.5 text-sm text-primary focus:border-brand focus:outline-none [color-scheme:dark]" />
          </FieldRow>
        </div>
      </div>

      {/* Footer */}
      <div className="shrink-0 border-t border-border/60 bg-elevated px-5 py-3">
        <div className="flex items-center justify-between gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => submit(true)}>
              {t("newTaskDrawer.createAndAdd")}
            </Button>
            <Button type="submit" form="task-drawer-create-form" variant="primary" size="sm"
              onClick={() => submit(false)}>
              {t("newTaskDrawer.create")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Edit drawer ───────────────────────────────────────────────────────────────
function TaskDrawerEdit({
  task,
  projectId,
  onClose,
  expanded = false,
  onToggleExpand,
}: {
  task: BuildWireTask;
  projectId: string;
  onClose: () => void;
  expanded?: boolean;
  onToggleExpand?: () => void;
}) {
  const { t } = useTranslation();
  const { patchTask, tasks, kanbanSections } = useTaskProject();
  const liveTask = useMemo(() => tasks.find((x) => x.id === task.id) ?? task, [tasks, task]);
  const base = `/projects/${projectId}`;
  const [subtasks, setSubtasks] = useState(MOCK_SUBTASKS);
  const [draft, setDraft] = useState(() => taskToDraft(task));
  const [baseline, setBaseline] = useState(() => taskToDraft(task));
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"details" | "checklist" | "activity">("details");

  const overdue = draft.status !== "done" && draft.status !== "void" && isDueOverdue(draft.due_date.slice(0, 10));

  useEffect(() => {
    const d = taskToDraft(task);
    setDraft(d); setBaseline(d); setError(null);
    setSubtasks(MOCK_SUBTASKS.map((s) => ({ ...s })));
  }, [task.id]);

  const update = useCallback((p: Partial<TaskEditorDraft>) => {
    setDraft((d) => ({ ...d, ...p }));
  }, []);

  const isDirty = useMemo(() => draftFingerprint(draft) !== draftFingerprint(baseline), [draft, baseline]);

  const doneSub = useMemo(() => subtasks.filter((s) => s.done).length, [subtasks]);

  const assigneePeople = useMemo(() => demoAssigneesDisplayList({ assignees: draft.assignees }), [draft.assignees]);

  const sectionTitle = kanbanSections.find((s) => s.id === liveTask.kanban_section_id)?.title || liveTask.kanban_section_id || "—";

  function save() {
    const trimmed = draft.title.trim();
    if (!trimmed) { setError(t("newTaskDrawer.errorTitle")); return; }
    if (draft.status === "blocked" && !draft.blocked_reason.trim()) {
      setError(t("newTaskDrawer.errorBlocked")); return;
    }
    setError(null);
    patchTask(liveTask.id, draftToPatch({ ...draft, title: trimmed }));
    setBaseline({ ...draft, title: trimmed });
  }

  const thread = [
    { type: "comment" as const, who: "QC Lead", body: "Please confirm tolerance before we close ceiling L12 corridor.", when: "2h ago", initial: "Q" },
    { type: "comment" as const, who: demoPrimaryAssigneeName(task), body: "Field measure matches shop drawing — photos attached.", when: "Yesterday", initial: demoPrimaryInitials(task) },
    { type: "update" as const, who: demoPrimaryAssigneeName(task), body: "uploaded 2 photos", when: "3h ago" },
    { type: "update" as const, who: "System", body: t("taskDetailDrawer.demoThreadStatusChange", { status: t(taskWorkflowTKey(draft.status)) }), when: "1d ago" },
  ];

  return (
    <div className="flex h-full min-h-0 flex-col bg-elevated">
      {/* Status color bar */}
      <div className={`h-1 w-full shrink-0 ${statusBarColor(draft.status)}`} />

      {/* Header */}
      <header className="shrink-0 border-b border-border/60 bg-elevated px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[11px] font-semibold text-muted">{liveTask.display_number}</span>
              <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${statusPillClass(draft.status)}`}>
                {t(taskWorkflowTKey(draft.status))}
              </span>
              {overdue && <span className="rounded-full bg-danger px-2.5 py-0.5 text-[11px] font-semibold text-white">Overdue</span>}
              {liveTask.pinned && <span className="rounded-full bg-brand/15 px-2.5 py-0.5 text-[11px] font-medium text-brand">{t("taskDetailDrawer.pinnedOnPlan")}</span>}
              {/* Quick complete toggle */}
              <button type="button"
                onClick={() => update({ status: draft.status === "done" ? "open" : "done" })}
                className={`ml-auto rounded-full border px-3 py-0.5 text-[11px] font-semibold transition-colors ${draft.status === "done" ? "border-success/40 bg-success/10 text-success hover:bg-success/20" : "border-border bg-transparent text-muted hover:border-success/40 hover:bg-success/10 hover:text-success"}`}>
                {draft.status === "done" ? "✓ " + t("taskDetailDrawer.completed") : t("taskDetailDrawer.markComplete")}
              </button>
            </div>
            <input
              value={draft.title}
              onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
              placeholder={t("newTaskDrawer.titlePlaceholder")}
              className="mt-2 w-full bg-transparent text-[20px] font-bold leading-snug text-primary outline-none placeholder:text-muted"
            />
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {onToggleExpand && (
              <button type="button" onClick={onToggleExpand}
                className="rounded-lg p-1.5 text-muted hover:bg-surface hover:text-primary"
                title={expanded ? "Collapse" : "Expand"}>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {expanded
                    ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 15H5v4M15 9h4V5M19 15v4h-4M5 9V5h4" />
                    : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 3h6v6M9 21H3v-6M21 15v6h-6M3 9V3h6" />}
                </svg>
              </button>
            )}
            <button type="button" onClick={onClose}
              className="rounded-lg p-1.5 text-muted hover:bg-surface hover:text-primary"
              aria-label={t("common.closeDialog")}>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-4 flex gap-0 border-b border-border/40">
          {(["details", "checklist", "activity"] as const).map((tab) => (
            <button key={tab} type="button" onClick={() => setActiveTab(tab)}
              className={`px-4 pb-2.5 pt-0.5 text-[12px] font-semibold transition-colors ${activeTab === tab ? "border-b-2 border-brand text-brand" : "text-muted hover:text-secondary"}`}>
              {tab === "details" ? t("taskDetailDrawer.tabTask")
                : tab === "checklist" ? `${t("taskDetailDrawer.sectionSubtasks")} (${doneSub}/${subtasks.length})`
                : t("taskDetailDrawer.tabCollab")}
            </button>
          ))}
        </div>
      </header>

      {/* Body */}
      <div className={`min-h-0 flex-1 overflow-y-auto ${expanded && activeTab === "details" ? "lg:grid lg:grid-cols-[1fr_300px] lg:divide-x lg:divide-border/40 lg:overflow-hidden" : ""}`}>

        {activeTab === "details" && (
          <>
            {/* Main content */}
            <div className={`flex flex-col gap-6 p-5 ${expanded ? "lg:overflow-y-auto" : ""}`}>
              {error && <div className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">{error}</div>}

              {/* Description */}
              <div>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted">{t("taskDetailDrawer.sectionDescription")}</p>
                <textarea
                  value={draft.description}
                  onChange={(e) => update({ description: e.target.value })}
                  placeholder={t("taskDetailDrawer.descriptionPlaceholder")}
                  rows={expanded ? 8 : 5}
                  className="w-full resize-y rounded-lg border border-border/60 bg-bg px-3 py-2.5 text-sm text-primary placeholder:text-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                />
              </div>

              {/* Site coordination strip */}
              {(liveTask.related_rfis?.length ?? 0) + (liveTask.related_drawings?.length ?? 0) > 0 && (
                <div className="rounded-lg border border-border/50 bg-surface/20 px-4 py-3">
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted">{t("taskDetailDrawer.siteCoordination")}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                    {(liveTask.related_rfis?.length ?? 0) > 0 && (
                      <Link to={`${base}/rfis`} className="font-medium text-brand hover:underline">
                        {t("taskDetailDrawer.linkedRfis")} ({liveTask.related_rfis?.length})
                      </Link>
                    )}
                    {(liveTask.related_drawings?.length ?? 0) > 0 && (
                      <Link to={`${base}/drawings`} className="font-medium text-brand hover:underline">
                        {t("taskDetailDrawer.linkedDrawings")} ({liveTask.related_drawings?.length})
                      </Link>
                    )}
                  </div>
                </div>
              )}

              {/* Photos */}
              <div>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted">{t("taskForm.sectionPhotos")}</p>
                <div className="flex flex-wrap gap-2">
                  {liveTask.photos.slice(0, 6).map((p) => (
                    <div key={p.id} className="h-16 w-16 shrink-0 rounded-lg border border-border bg-gradient-to-br from-muted/30 to-muted/10" />
                  ))}
                  <button type="button"
                    className="flex h-16 w-16 items-center justify-center rounded-lg border border-dashed border-border/60 bg-bg/50 hover:border-brand/40 hover:bg-brand/5">
                    <svg className="h-4 w-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Sidebar meta fields */}
            <div className={`border-t border-border/40 bg-surface/30 px-5 py-4 ${expanded ? "lg:overflow-y-auto lg:border-t-0" : ""}`}>
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-muted">{t("taskDetailDrawer.tabTask")}</p>

              <FieldRow label={t("newTaskDrawer.status")}>
                <Select size="sm" fullWidth value={draft.status}
                  onValueChange={(v) => update({ status: v as TaskStatus })}
                  options={[...TASK_COLUMNS.map((c) => ({ value: c.id, label: t(taskWorkflowTKey(c.id)) })), { value: "void", label: t(taskWorkflowTKey("void")) }]}
                />
              </FieldRow>

              {draft.status === "blocked" && (
                <FieldRow label={t("newTaskDrawer.blockedReasonLabel")}>
                  <textarea value={draft.blocked_reason} onChange={(e) => update({ blocked_reason: e.target.value })}
                    rows={2} className="w-full resize-none rounded-lg border border-danger/40 bg-bg px-2.5 py-1.5 text-sm text-primary focus:border-danger focus:outline-none" />
                </FieldRow>
              )}

              <FieldRow label={t("newTaskDrawer.priority")}>
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 shrink-0 rounded-full ${priorityDot(draft.priority)}`} />
                  <Select size="sm" fullWidth value={draft.priority}
                    onValueChange={(v) => update({ priority: v as TaskPriorityKey })}
                    options={(["critical", "high", "medium", "low"] as const).map((p) => ({ value: p, label: t(taskPriorityTKey(p)) }))}
                  />
                </div>
              </FieldRow>

              <FieldRow label={t("newTaskDrawer.type")}>
                <Select size="sm" fullWidth value={draft.type}
                  onValueChange={(v) => update({ type: v as any })}
                  options={ALL_TASK_TYPE_KEYS.map((k) => ({ value: k, label: t(taskTypeKeyTKey(k)) }))}
                />
              </FieldRow>

              <FieldRow label={t("newTaskDrawer.trade")}>
                <Select size="sm" fullWidth value={draft.trade}
                  onValueChange={(v) => update({ trade: v as any })}
                  options={ALL_TRADE_KEYS.map((k) => ({ value: k, label: t(taskTradeKeyTKey(k)) }))}
                />
              </FieldRow>

              <FieldRow label={t("newTaskDrawer.floor")}>
                <Select size="sm" fullWidth value={draft.floor}
                  onValueChange={(v) => update({ floor: v })}
                  options={FLOOR_OPTIONS.map((f) => ({ value: f, label: f }))}
                />
              </FieldRow>

              <FieldRow label={t("newTaskDrawer.locationDetail")}>
                <input value={draft.location_detail} onChange={(e) => update({ location_detail: e.target.value })}
                  placeholder="e.g. Unit 1102, Grid C"
                  className="w-full rounded-lg border border-border bg-bg px-2.5 py-1.5 text-sm text-primary placeholder:text-muted focus:border-brand focus:outline-none" />
              </FieldRow>

              <FieldRow label={t("newTaskDrawer.assignees")}>
                <div className="flex flex-wrap gap-1">
                  {assigneePeople.map((p) => (
                    <Avatar key={p.id} name={p.name} size="sm" className="ring-1 ring-bg" />
                  ))}
                  <fieldset className="mt-1 w-full rounded-md border border-border/50 p-1.5">
                    <div className="flex flex-wrap gap-x-3 gap-y-1">
                      {DEMO_USERS.map((u) => (
                        <label key={u.id} className="flex cursor-pointer items-center gap-1 text-xs text-primary">
                          <input type="checkbox" checked={draft.assignees.includes(u.id)}
                            onChange={() => update({ assignees: toggleAssigneeId(draft.assignees, u.id) })}
                            className="rounded border-border" />
                          {u.name}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                </div>
              </FieldRow>

              <FieldRow label={t("newTaskDrawer.startDate")}>
                <input type="date" value={draft.start_date} onChange={(e) => update({ start_date: e.target.value })}
                  className="w-full rounded-lg border border-border bg-bg px-2.5 py-1.5 text-sm text-primary focus:border-brand focus:outline-none [color-scheme:dark]" />
              </FieldRow>

              <FieldRow label={t("newTaskDrawer.dueDate")}>
                <input type="date" value={draft.due_date} onChange={(e) => update({ due_date: e.target.value })}
                  className={`w-full rounded-lg border bg-bg px-2.5 py-1.5 text-sm focus:outline-none [color-scheme:dark] ${overdue ? "border-danger/50 text-danger focus:border-danger" : "border-border text-primary focus:border-brand"}`} />
              </FieldRow>

              <FieldRow label="Section">
                <span className="text-sm text-secondary">{sectionTitle}</span>
              </FieldRow>

              <FieldRow label="Progress">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted/20">
                    <div className="h-full rounded-full bg-brand/70" style={{ width: `${liveTask.progress}%` }} />
                  </div>
                  <span className="text-xs tabular-nums text-muted">{liveTask.progress}%</span>
                </div>
              </FieldRow>
            </div>
          </>
        )}

        {activeTab === "checklist" && (
          <div className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-semibold text-primary">{t("taskDetailDrawer.sectionSubtasks")}</p>
              <span className="rounded-full bg-muted/15 px-2 py-0.5 text-xs font-semibold tabular-nums text-muted">{doneSub}/{subtasks.length}</span>
            </div>
            {/* Progress bar */}
            <div className="mb-5 h-1.5 w-full overflow-hidden rounded-full bg-muted/20">
              <div className="h-full rounded-full bg-success transition-all" style={{ width: subtasks.length ? `${(doneSub / subtasks.length) * 100}%` : "0%" }} />
            </div>
            <ul className="space-y-1">
              {subtasks.map((s) => (
                <li key={s.id}>
                  <label className="flex cursor-pointer items-start gap-3 rounded-lg px-2 py-2 hover:bg-surface/50">
                    <input type="checkbox" checked={s.done}
                      onChange={() => setSubtasks((prev) => prev.map((x) => x.id === s.id ? { ...x, done: !x.done } : x))}
                      className="mt-0.5 h-4 w-4 rounded border-border text-brand" />
                    <span className={`text-sm leading-snug ${s.done ? "text-muted line-through" : "text-primary"}`}>{s.label}</span>
                  </label>
                </li>
              ))}
            </ul>
            <button type="button" className="mt-3 flex items-center gap-1.5 text-sm font-medium text-brand hover:underline">
              <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
                <path d="M8 3a.75.75 0 0 1 .75.75v3.5h3.5a.75.75 0 0 1 0 1.5h-3.5v3.5a.75.75 0 0 1-1.5 0v-3.5h-3.5a.75.75 0 0 1 0-1.5h3.5v-3.5A.75.75 0 0 1 8 3z" />
              </svg>
              {t("taskDetailDrawer.addSubtask")}
            </button>
          </div>
        )}

        {activeTab === "activity" && (
          <div className="p-5">
            <div className="space-y-0 divide-y divide-border/40 rounded-xl border border-border/50 bg-surface/20">
              {thread.map((row, i) => (
                <div key={i} className="px-4 py-3">
                  {row.type === "comment" ? (
                    <div className="flex gap-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand/20 text-[10px] font-bold text-brand">{row.initial}</div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline gap-2">
                          <span className="text-sm font-semibold text-primary">{row.who}</span>
                          <span className="text-xs text-muted">{row.when}</span>
                        </div>
                        <p className="mt-0.5 text-sm leading-relaxed text-secondary">{row.body}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-secondary">
                      <span className="font-medium text-primary">{row.who}</span>{" "}{row.body}
                      <span className="ml-2 text-muted">{row.when}</span>
                    </p>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <input type="text" placeholder={t("taskDetailDrawer.writeComment")}
                className="min-w-0 flex-1 rounded-lg border border-border/60 bg-bg px-3 py-2 text-sm text-primary placeholder:text-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20" />
              <Button type="button" variant="primary" size="sm">{t("taskDetailDrawer.post")}</Button>
            </div>
          </div>
        )}
      </div>

      {/* Footer — only when dirty */}
      {isDirty && (
        <div className="shrink-0 border-t border-border/60 bg-elevated px-5 py-3">
          <div className="flex items-center justify-between gap-2">
            <button type="button" onClick={() => { setDraft({ ...baseline }); setError(null); }}
              className="text-sm font-medium text-muted hover:text-primary">
              {t("taskForm.discardChanges")}
            </button>
            <Button type="button" variant="primary" size="sm" onClick={save}>
              {t("taskForm.saveChanges")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Public export ─────────────────────────────────────────────────────────────
export function TaskDrawer(props: TaskDrawerProps) {
  const { projectId } = useTaskProject();

  if (props.mode === "create") {
    return (
      <TaskDrawerCreate
        onClose={props.onClose}
        expanded={props.expanded}
        onToggleExpand={props.onToggleExpand}
        onCreated={props.onCreated}
        defaultKanbanSectionId={props.defaultKanbanSectionId}
      />
    );
  }

  return (
    <TaskDrawerEdit
      task={props.task}
      projectId={projectId}
      onClose={props.onClose}
      expanded={props.expanded}
      onToggleExpand={props.onToggleExpand}
    />
  );
}
