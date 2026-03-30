/**
 * BuildWire — centralized labels, status pills, and taxonomy tags for construction PM UI.
 *
 * Industry patterns (Procore, Autodesk Build, etc.):
 * - Workflow status — who acts next matters: “Open” often means waiting on reviewers;
 *   “Ball in court” is a first-class concept in RFIs and submittals.
 * - Submittals — common defaults: Draft (not yet in workflow), Open (in review),
 *   Closed; many orgs add custom log statuses.
 * - RFIs — Draft / Open / Under review / Answered / Closed / Void maps cleanly to
 *   neutral → in-flight → resolved → risk.
 * - Drawings — “Current” vs superseded/archived; discipline is taxonomy (soft pill),
 *   not the same as workflow status.
 * - Field QA — Pass / Fail / Conditional reads as outcome, not process.
 * - Finance — Approved / Pending / Rejected recurs across expenses, invoices, COs.
 *
 * UI vocabulary in this app:
 * - Workflow / outcome → `Badge` (`@/components/ui/badge`) — compact capsule.
 * - Discipline, trade, meeting type, inspection type → `SemanticPill` — rounded-md soft border.
 * - Project lifecycle on marketing-style cards → ring capsule (`PM_PROJECT_STATUS_CAPSULE`).
 */

import type { BadgeProps } from '@/components/ui/badge';
import type { ProjectStatus } from '@/types/project';
import type { TaskPriorityKey, TaskStatus, TaskTypeKey } from '@/types/task';

// ─── Shared types ───────────────────────────────────────────────────────────

export type PmBadgeVariant = NonNullable<BadgeProps['variant']>;

/** Base layout utilities for label surfaces (append module-specific colors). */
export const PM_LABEL_SURFACE = {
    /** Matches `Badge`: rounded-full, border, table-friendly height. */
    badgeSm: 'inline-flex items-center justify-center font-medium rounded-full whitespace-nowrap px-2 py-0.5 text-xs',
    /** Ring-forward capsule (project cards). */
    statusRingCapsule:
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ring-1',
    /** `SemanticPill` baseline; pair with hue classes. */
    softTaxonomyPill:
        'inline-flex max-w-full items-center truncate rounded-md border px-2 py-0.5 text-xs font-medium',
} as const;

// ─── Reusable hue recipes (disciplines & similar taxonomies) ────────────────

export const PM_SOFT_PILL_HUE = {
    amber: 'border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-200',
    cyan: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-800 dark:text-cyan-200',
    violet: 'border-violet-500/30 bg-violet-500/10 text-violet-800 dark:text-violet-200',
    blue: 'border-blue-500/30 bg-blue-500/10 text-blue-800 dark:text-blue-200',
    indigo: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-800 dark:text-indigo-200',
    yellow: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-900 dark:text-yellow-200',
    red: 'border-red-500/30 bg-red-500/10 text-red-800 dark:text-red-200',
    green: 'border-green-500/30 bg-green-500/10 text-green-800 dark:text-green-200',
    sky: 'border-sky-500/30 bg-sky-500/10 text-sky-800 dark:text-sky-200',
    emerald: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-400',
} as const;

// ─── Cross-module workflow & approval (Badge variants) ───────────────────────

/** Recurring finance / compliance tri-state. */
export const PM_APPROVAL_TRI_STATE_BADGE: Record<
    'Approved' | 'Pending' | 'Rejected',
    PmBadgeVariant
> = {
    Approved: 'success',
    Pending: 'warning',
    Rejected: 'danger',
};

/** Change orders and similar two-state approval rows. */
export const PM_APPROVED_PENDING_BADGE: Record<'Approved' | 'Pending', PmBadgeVariant> = {
    Approved: 'success',
    Pending: 'warning',
};

/** Procore-style submittal log defaults (+ typical “for review” posture). */
export const PM_SUBMITTAL_DEFAULT_STATUS_BADGE: Record<
    'Draft' | 'Open' | 'Closed',
    PmBadgeVariant
> = {
    Draft: 'secondary',
    Open: 'warning',
    Closed: 'default',
};

export const PM_RFI_STATUS_BADGE: Record<string, PmBadgeVariant> = {
    Open: 'warning',
    'Under Review': 'secondary',
    Answered: 'success',
    Closed: 'default',
    Draft: 'secondary',
    Void: 'danger',
};

export const PM_RFI_PRIORITY_BADGE: Record<'Normal' | 'Urgent', PmBadgeVariant> = {
    Normal: 'secondary',
    Urgent: 'danger',
};

export const PM_DRAWING_SHEET_STATUS_BADGE: Record<
    'Current' | 'Superseded',
    PmBadgeVariant
> = {
    Current: 'success',
    Superseded: 'secondary',
};

export const PM_MEETING_STATUS_BADGE: Record<string, PmBadgeVariant> = {
    Completed: 'success',
    Scheduled: 'secondary',
};

export type PmInspectionResult = 'Pass' | 'Fail' | 'Conditional';

export const PM_INSPECTION_RESULT_BADGE: Record<PmInspectionResult, PmBadgeVariant> = {
    Pass: 'success',
    Fail: 'danger',
    Conditional: 'warning',
};

export const PM_DAILY_REPORT_STATUS_BADGE: Record<
    'Approved' | 'Pending' | 'Rejected' | 'Draft',
    PmBadgeVariant
> = {
    Approved: 'success',
    Pending: 'warning',
    Rejected: 'danger',
    Draft: 'secondary',
};

export const PM_TEAM_ROLE_BADGE: Record<string, PmBadgeVariant> = {
    PM: 'secondary',
    Supervisor: 'default',
    Guest: 'secondary',
    Worker: 'default',
};

/** BuildWire task workflow — maps to the same Badge scale as other modules. */
export const PM_TASK_STATUS_BADGE: Record<TaskStatus, PmBadgeVariant> = {
    open: 'secondary',
    in_progress: 'warning',
    in_review: 'secondary',
    blocked: 'danger',
    awaiting_inspection: 'warning',
    done: 'success',
    void: 'default',
};

export const PM_TASK_PRIORITY_BADGE: Record<TaskPriorityKey, PmBadgeVariant> = {
    critical: 'danger',
    high: 'warning',
    medium: 'secondary',
    low: 'default',
};

// ─── Project lifecycle (card capsule, ring) ─────────────────────────────────

export const PM_PROJECT_STATUS_CAPSULE: Record<ProjectStatus, string> = {
    planning: 'bg-muted/25 text-secondary ring-1 ring-border',
    active: 'bg-brand/15 text-brand ring-1 ring-brand/25',
    on_hold: 'bg-warning/15 text-warning ring-1 ring-warning/20',
    completed: 'bg-success/15 text-success ring-1 ring-success/20',
    archived: 'bg-muted/50 text-muted ring-1 ring-border',
};

// ─── Task type & priority — chips (drawer) and table soft pills ─────────────

export const PM_TASK_TYPE_CHIP: Record<TaskTypeKey, string> = {
    general: 'bg-muted/30 text-secondary',
    punch_list: 'bg-brand/10 text-primary',
    safety: 'bg-danger/15 text-danger',
    quality: 'bg-success/15 text-success',
    rfi_action: 'bg-warning/15 text-warning',
    inspection_action: 'bg-brand/15 text-primary',
};

export const PM_TASK_TABLE_TYPE_PILL: Record<TaskTypeKey, string> = {
    general: 'border-border/70 bg-muted/20 text-secondary dark:bg-muted/15',
    punch_list:
        'border-violet-500/30 bg-violet-500/[0.12] text-violet-700 dark:text-violet-300',
    safety: 'border-danger/35 bg-danger/10 text-danger',
    quality: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    rfi_action: 'border-amber-500/35 bg-amber-500/10 text-amber-800 dark:text-amber-400',
    inspection_action: 'border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300',
};

export const PM_TASK_PRIORITY_RAIL: Record<TaskPriorityKey, string> = {
    low: 'border-l-4 border-border',
    medium: 'border-l-4 border-blue-500',
    high: 'border-l-4 border-amber-500',
    critical: 'border-l-4 border-red-500',
};

export const PM_TASK_TABLE_PRIORITY_PILL: Record<TaskPriorityKey, string> = {
    critical: 'border-red-500/35 bg-red-500/10 text-red-700 dark:text-red-400',
    high: 'border-amber-500/35 bg-amber-500/10 text-amber-800 dark:text-amber-400',
    medium: 'border-violet-500/35 bg-violet-500/10 text-violet-800 dark:text-violet-300',
    low: 'border-emerald-500/35 bg-emerald-500/10 text-emerald-800 dark:text-emerald-400',
};

// ─── Taxonomy: trades / disciplines / meeting & inspection types ───────────

export const PM_RFI_TRADE_PILL: Record<string, string> = {
    Structural: PM_SOFT_PILL_HUE.amber,
    MEP: PM_SOFT_PILL_HUE.cyan,
    Finishing: PM_SOFT_PILL_HUE.violet,
    Waterproofing: PM_SOFT_PILL_HUE.blue,
    Architectural: PM_SOFT_PILL_HUE.indigo,
    Electrical: PM_SOFT_PILL_HUE.yellow,
};

export const PM_DRAWING_DISCIPLINE_PILL: Record<string, string> = {
    Architectural: PM_SOFT_PILL_HUE.blue,
    Structural: PM_SOFT_PILL_HUE.amber,
    MEP: PM_SOFT_PILL_HUE.cyan,
    'MEP Plumbing': PM_SOFT_PILL_HUE.cyan,
    'MEP Electrical': PM_SOFT_PILL_HUE.yellow,
    Electrical: PM_SOFT_PILL_HUE.yellow,
    Fire: PM_SOFT_PILL_HUE.red,
};

export const PM_MEETING_TYPE_PILL: Record<string, string> = {
    'Site Progress Meeting': PM_SOFT_PILL_HUE.blue,
    'Design Review Meeting': PM_SOFT_PILL_HUE.violet,
    'Safety Toolbox Talk': PM_SOFT_PILL_HUE.green,
    'Owner/Client Meeting': PM_SOFT_PILL_HUE.amber,
    'Subcontractor Coordination': PM_SOFT_PILL_HUE.cyan,
};

export const PM_INSPECTION_TYPE_PILL: Record<string, string> = {
    Quality: PM_SOFT_PILL_HUE.blue,
    MEP: PM_SOFT_PILL_HUE.cyan,
    Structural: PM_SOFT_PILL_HUE.amber,
    Safety: PM_SOFT_PILL_HUE.green,
    Fire: PM_SOFT_PILL_HUE.red,
};

// ─── Daily report calendar legend (dots, not Badge) ─────────────────────────

export type PmDailyReportCalendarDot =
    | 'approved'
    | 'pending'
    | 'draft'
    | 'rejected'
    | 'missing'
    | 'weekend'
    | 'upcoming';

export const PM_DAILY_REPORT_CALENDAR_LEGEND: Record<
    PmDailyReportCalendarDot,
    { className: string; label: string }
> = {
    approved: { className: 'bg-success', label: 'Approved' },
    pending: { className: 'bg-blue-500', label: 'Pending' },
    draft: { className: 'bg-warning', label: 'Draft' },
    rejected: { className: 'bg-rose-600 dark:bg-rose-500', label: 'Rejected' },
    missing: { className: 'bg-danger', label: 'Missing' },
    weekend: { className: 'bg-muted/40', label: 'Weekend' },
    upcoming: { className: 'bg-muted/25 ring-1 ring-border/50', label: 'Upcoming' },
};
