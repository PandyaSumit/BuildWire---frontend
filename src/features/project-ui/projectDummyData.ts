/**
 * Rich dummy data for project-area UI (no API).
 * Import from screens to keep copy consistent across Overview, lists, and stats.
 */

import type { TaskColumn } from "@/features/tasks/fixtures";
import { DEMO_PLAN_PDF_URL } from "@/features/plans/pdf";

export type RfiScheduleImpact = 'none' | 'potential' | 'confirmed';

export type RfiActivityItem = { who: string; what: string; when: string };

export type DummyRfiRow = {
    num: string;
    title: string;
    questionBody: string;
    responseBody?: string;
    trade: string;
    priority: 'Normal' | 'Urgent';
    status: string;
    ballInCourt: string;
    submittedBy: string;
    assignedTo: string;
    due: string;
    daysOpen: number;
    costImpact: boolean;
    scheduleImpact: RfiScheduleImpact;
    scheduleLagDays?: number;
    attachmentCount: number;
    attachmentLabels?: string[];
    specSection: string;
    location: string;
    drawingRef: string;
    distribution: string;
    activity: RfiActivityItem[];
    linkedTaskIds?: string[];
    isOverdue: boolean;
    highlight?: boolean;
};

const RFI_ACTIVE_STATUSES: readonly string[] = ['Open', 'Under Review', 'Draft', 'Answered'];

export function computeRfiStats(rows: DummyRfiRow[]) {
    const total = rows.length;
    const open = rows.filter((r) => RFI_ACTIVE_STATUSES.includes(r.status)).length;
    const overdue = rows.filter((r) => r.isOverdue).length;
    const closedOrAnswered = rows.filter((r) => r.status === 'Closed' || r.status === 'Answered');
    const avgResponseDays =
        closedOrAnswered.length > 0
            ? Math.round((closedOrAnswered.reduce((s, r) => s + r.daysOpen, 0) / closedOrAnswered.length) * 10) / 10
            : 0;
    const scheduleRisk = rows.filter((r) => r.scheduleImpact !== 'none').length;
    return { total, open, overdue, avgResponseDays, scheduleRisk } as const;
}

export const DUMMY_RFIS: DummyRfiRow[] = [
    {
        "num": "RFI-003",
        "title": "IT cable tray crossing exit corridor",
        "questionBody": "Tray lowest point 2.25 m AFF; exit corridor requires 2.28 m clear per LS-09.",
        "trade": "Electrical",
        "priority": "Urgent",
        "status": "Under Review",
        "ballInCourt": "Architect",
        "submittedBy": "Site Eng.",
        "assignedTo": "Neha Desai",
        "due": "Mar 21",
        "daysOpen": 6,
        "costImpact": false,
        "scheduleImpact": "confirmed",
        "scheduleLagDays": 1,
        "attachmentCount": 3,
        "specSection": "26 05 33 · Cable trays",
        "location": "Exit corridor · L2",
        "drawingRef": "E-408 / LS-09",
        "distribution": "Architect · LS consultant · GC",
        "activity": [
            {
                "who": "Site Eng.",
                "what": "Submitted RFI-003",
                "when": "6d ago"
            },
            {
                "who": "Neha Desai",
                "what": "Coordinating LS sketch update",
                "when": "2d ago"
            }
        ],
        "isOverdue": false
    },
    {
        "num": "RFI-004",
        "title": "Stone anchorage tolerance stack-up",
        "questionBody": "Cumulative tolerance exceeds spec allowance by 6 mm over 3 m run.",
        "trade": "Finishing",
        "priority": "Normal",
        "status": "Draft",
        "ballInCourt": "Submitter",
        "submittedBy": "You",
        "assignedTo": "—",
        "due": "Mar 30",
        "daysOpen": 1,
        "costImpact": true,
        "scheduleImpact": "potential",
        "attachmentCount": 0,
        "specSection": "04 43 00 · Stone",
        "location": "Lobby stone · L1",
        "drawingRef": "FA-03",
        "distribution": "Draft",
        "activity": [
            {
                "who": "You",
                "what": "Draft saved",
                "when": "1d ago"
            }
        ],
        "isOverdue": false
    },
    {
        "num": "RFI-005",
        "title": "Sprinkler head elevation in congested corridor",
        "questionBody": "Ceiling soffit dropped 50 mm in corridor C2. Confirm new sprinkler deflector height.",
        "trade": "Fire protection",
        "priority": "Normal",
        "status": "Open",
        "ballInCourt": "Subcontractor",
        "submittedBy": "MEP",
        "assignedTo": "FP Lead",
        "due": "Mar 19",
        "daysOpen": 7,
        "costImpact": false,
        "scheduleImpact": "none",
        "attachmentCount": 2,
        "specSection": "21 13 00 · Fire sprinkler",
        "location": "Corridor C2 · L4",
        "drawingRef": "FP-201",
        "distribution": "FP trade · MEP · GC",
        "activity": [
            {
                "who": "MEP",
                "what": "Submitted RFI-005",
                "when": "7d ago"
            }
        ],
        "isOverdue": true,
        "highlight": true
    },
    {
        "num": "RFI-006",
        "title": "Lightning protection down conductor route",
        "questionBody": "Route LT-08 vs CW mullion.",
        "trade": "Electrical",
        "priority": "Urgent",
        "status": "Void",
        "ballInCourt": "—",
        "submittedBy": "MEP",
        "assignedTo": "—",
        "due": "—",
        "daysOpen": 0,
        "costImpact": false,
        "scheduleImpact": "none",
        "attachmentCount": 0,
        "specSection": "26 05 26",
        "location": "West face",
        "drawingRef": "E-512",
        "distribution": "Voided",
        "activity": [
            {
                "who": "PM",
                "what": "Voided",
                "when": "1d ago"
            }
        ],
        "isOverdue": false
    },
    {
        "num": "RFI-007",
        "title": "Temporary shoring removal sequence",
        "questionBody": "Confirm sequence for removing back-props on transfer slab TS-1 after PT stressing report TP-118 is signed.",
        "responseBody": "Remove props per sequence SK-TS-1 Rev B. Hold until TP-118 signed — completed.",
        "trade": "Structural",
        "priority": "Normal",
        "status": "Closed",
        "ballInCourt": "—",
        "submittedBy": "GC",
        "assignedTo": "SE",
        "due": "Feb 15",
        "daysOpen": 35,
        "costImpact": false,
        "scheduleImpact": "none",
        "attachmentCount": 2,
        "specSection": "03 30 00 · Cast-in-place",
        "location": "Transfer slab TS-1 · L5",
        "drawingRef": "S-210",
        "distribution": "SE · GC · Safety",
        "activity": [
            {
                "who": "GC",
                "what": "Submitted RFI-007",
                "when": "38d ago"
            },
            {
                "who": "SE",
                "what": "Closed with signed sequence",
                "when": "35d ago"
            }
        ],
        "isOverdue": false
    },
    {
        "num": "RFI-008",
        "title": "Stair flight width vs NBC exit width",
        "questionBody": "Verify stair clear width for CL-3.",
        "responseBody": "OK per NBCE-23-018.",
        "trade": "Architectural",
        "priority": "Normal",
        "status": "Closed",
        "ballInCourt": "—",
        "submittedBy": "QC",
        "assignedTo": "Architect",
        "due": "Feb 28",
        "daysOpen": 21,
        "costImpact": false,
        "scheduleImpact": "none",
        "attachmentCount": 2,
        "specSection": "01 41 00",
        "location": "ST-B Podium",
        "drawingRef": "A-205",
        "distribution": "Arch · GC",
        "activity": [
            {
                "who": "QC",
                "what": "Submitted",
                "when": "24d ago"
            }
        ],
        "isOverdue": false
    },
    {
        "num": "RFI-009",
        "title": "Slab penetration for riser — core drill allowed?",
        "questionBody": "Core drill through PT band at grid F?",
        "responseBody": "Allowed in shaded zone on R-VT-1; 75 mm edge distance.",
        "trade": "MEP",
        "priority": "Normal",
        "status": "Answered",
        "ballInCourt": "PM",
        "submittedBy": "Site Eng.",
        "assignedTo": "Architect",
        "due": "Mar 10",
        "daysOpen": 12,
        "costImpact": false,
        "scheduleImpact": "none",
        "attachmentCount": 4,
        "attachmentLabels": [
            "R-VT-1.pdf"
        ],
        "specSection": "03 15 00",
        "location": "Grid F",
        "drawingRef": "M-302",
        "distribution": "Structural · MEP",
        "activity": [
            {
                "who": "Architect",
                "what": "Responded",
                "when": "12d ago"
            }
        ],
        "linkedTaskIds": [
            "T-044"
        ],
        "isOverdue": false
    },
    {
        "num": "RFI-010",
        "title": "Exterior insulation thickness at reveals",
        "questionBody": "EIFS conflicts with stone reveal depth by 18 mm.",
        "responseBody": "Approve reduced insulation zone per detail FA-REV-7; thermal model on file.",
        "trade": "Finishing",
        "priority": "Urgent",
        "status": "Answered",
        "ballInCourt": "PM",
        "submittedBy": "Site Eng.",
        "assignedTo": "Architect",
        "due": "Mar 8",
        "daysOpen": 18,
        "costImpact": true,
        "scheduleImpact": "confirmed",
        "scheduleLagDays": 2,
        "attachmentCount": 5,
        "attachmentLabels": [
            "FA-REV-7.pdf",
            "thermal-note.xlsx"
        ],
        "specSection": "07 24 00 · EIFS",
        "location": "North elevation reveals",
        "drawingRef": "FA-07",
        "distribution": "Arch · Energy consultant · GC",
        "activity": [
            {
                "who": "Site Eng.",
                "what": "Submitted RFI-010",
                "when": "19d ago"
            },
            {
                "who": "Architect",
                "what": "Formal response issued",
                "when": "18d ago"
            }
        ],
        "isOverdue": false
    },
    {
        "num": "RFI-011",
        "title": "Waterproofing membrane overlap at planter",
        "questionBody": "Overlap 100 vs 150 mm per manufacturer.",
        "trade": "Waterproofing",
        "priority": "Normal",
        "status": "Draft",
        "ballInCourt": "Submitter",
        "submittedBy": "You",
        "assignedTo": "—",
        "due": "Mar 25",
        "daysOpen": 2,
        "costImpact": false,
        "scheduleImpact": "potential",
        "attachmentCount": 0,
        "specSection": "07 13 00 · Waterproofing",
        "location": "Planter L4 terrace",
        "drawingRef": "P-22 / A-104",
        "distribution": "Draft",
        "activity": [
            {
                "who": "You",
                "what": "Started draft",
                "when": "2d ago"
            }
        ],
        "isOverdue": false
    },
    {
        "num": "RFI-012",
        "title": "Riser sleeve fire seal rating",
        "questionBody": "UL fire seal assembly for mixed trades in shaft R-3.",
        "trade": "MEP",
        "priority": "Urgent",
        "status": "Open",
        "ballInCourt": "PM",
        "submittedBy": "Amit V.",
        "assignedTo": "MEP Lead",
        "due": "Mar 18",
        "daysOpen": 11,
        "costImpact": true,
        "scheduleImpact": "confirmed",
        "scheduleLagDays": 4,
        "attachmentCount": 1,
        "specSection": "07 84 00 · Firestopping",
        "location": "Riser R-3 · L2–roof",
        "drawingRef": "M-301",
        "distribution": "MEP · GC",
        "activity": [
            {
                "who": "Amit V.",
                "what": "Submitted RFI-012",
                "when": "11d ago"
            }
        ],
        "isOverdue": true,
        "highlight": true
    },
    {
        "num": "RFI-013",
        "title": "Façade anchor spacing vs shop drawing FA-12",
        "questionBody": "Anchor spacing 450 vs 400 mm at corners per FA-12.",
        "trade": "Finishing",
        "priority": "Normal",
        "status": "Under Review",
        "ballInCourt": "Reviewer",
        "submittedBy": "Priya S.",
        "assignedTo": "Consultant",
        "due": "Mar 22",
        "daysOpen": 5,
        "costImpact": false,
        "scheduleImpact": "none",
        "attachmentCount": 2,
        "attachmentLabels": [
            "FA-12-excerpt.pdf"
        ],
        "specSection": "08 44 00 · Curtain wall",
        "location": "East elevation · L6–L9",
        "drawingRef": "FA-12",
        "distribution": "Architect · CW vendor · GC",
        "activity": [
            {
                "who": "Priya S.",
                "what": "Submitted RFI-013",
                "when": "5d ago"
            }
        ],
        "isOverdue": false
    },
    {
        "num": "RFI-014",
        "title": "Beam opening at grid C",
        "questionBody": "Field opening 320mm. Confirm lap length per S-201.",
        "trade": "Structural",
        "priority": "Urgent",
        "status": "Open",
        "ballInCourt": "Arch",
        "submittedBy": "Raj K.",
        "assignedTo": "Neha Desai",
        "due": "Mar 20",
        "daysOpen": 9,
        "costImpact": true,
        "scheduleImpact": "potential",
        "attachmentCount": 3,
        "specSection": "03 20 00",
        "location": "Grid C-4 L3",
        "drawingRef": "S-201",
        "distribution": "Arch SE GC",
        "activity": [
            {
                "who": "Raj",
                "what": "Submitted",
                "when": "9d ago"
            }
        ],
        "linkedTaskIds": [
            "T-038"
        ],
        "isOverdue": true,
        "highlight": true
    },
    {
        "num": "RFI-015",
        "title": "LP system bonding at roof steel canopy",
        "questionBody": "Confirm bonding jumper size between structural steel canopy and LPS grid.",
        "trade": "Electrical",
        "priority": "Normal",
        "status": "Under Review",
        "ballInCourt": "Reviewer",
        "submittedBy": "MEP",
        "assignedTo": "Electrical consultant",
        "due": "Mar 21",
        "daysOpen": 6,
        "costImpact": true,
        "scheduleImpact": "none",
        "attachmentCount": 1,
        "specSection": "26 05 26 · Grounding",
        "location": "Roof canopy",
        "drawingRef": "E-520",
        "distribution": "MEP · Structural · AHJ",
        "activity": [
            {
                "who": "MEP",
                "what": "Submitted RFI-015",
                "when": "6d ago"
            }
        ],
        "isOverdue": false
    },
    {
        "num": "RFI-016",
        "title": "Terrace drainage slope vs finished tile buildup",
        "questionBody": "Net slope after 85 mm finish buildup?",
        "trade": "Architectural",
        "priority": "Normal",
        "status": "Open",
        "ballInCourt": "Arch",
        "submittedBy": "QC",
        "assignedTo": "Neha Desai",
        "due": "Mar 24",
        "daysOpen": 4,
        "costImpact": false,
        "scheduleImpact": "potential",
        "attachmentCount": 2,
        "specSection": "07 16 00",
        "location": "Terrace L12",
        "drawingRef": "A-115",
        "distribution": "Arch · Landscape",
        "activity": [
            {
                "who": "QC",
                "what": "Submitted",
                "when": "4d ago"
            }
        ],
        "isOverdue": false
    }
];

export const DUMMY_RFIS_STATS = computeRfiStats(DUMMY_RFIS);

export type ActivityFeedItem = { who: string; text: string; when: string };

export const DUMMY_ACTIVITY_FEED: ActivityFeedItem[] = [
    { who: 'Raj Kumar', text: 'changed T-042 from In Progress → Completed', when: '2m ago' },
    { who: 'Priya Shah', text: 'submitted Daily Report for Mar 18', when: '18m ago' },
    { who: 'Architect', text: 'answered RFI-014', when: '1h ago' },
    { who: 'QC Lead', text: 'Inspection failed: Floor 3 Waterproofing — 3 items', when: '3h ago' },
    { who: 'Neha Desai', text: 'uploaded A-102 Rev D to Drawings', when: '5h ago' },
    { who: 'Amit Verma', text: 'added 4 photos to T-038', when: '6h ago' },
    { who: 'System', text: 'Daily Report Mar 17 approved by PM', when: 'Yesterday' },
    { who: 'MEP Lead', text: 'created RFI-012 (fire seal rating)', when: 'Yesterday' },
    { who: 'Raj Kumar', text: 'moved T-035 to In Review', when: 'Yesterday' },
    { who: 'Guest', text: 'commented on RFI-009', when: '2d ago' },
    { who: 'PM', text: 'exported Project Status PDF', when: '2d ago' },
    { who: 'QC', text: 'Inspection passed: MEP rough-in L2', when: '3d ago' },
];

export type MyActionItem = { label: string; to: string; hint: string };

export const DUMMY_MY_ACTIONS: MyActionItem[] = [
    { label: 'Task T-041 — MEP sleeve verification', to: 'tasks', hint: 'Due tomorrow · High' },
    { label: 'RFI-012 — ball in your court (respond)', to: 'rfis', hint: 'Overdue' },
    { label: 'Approve Daily Report — Mar 17', to: 'daily-reports', hint: 'Pending approval' },
    { label: 'Inspection — Waterproofing L3 (today 4 PM)', to: 'inspections', hint: 'Assigned to you' },
    { label: 'Review submittal SUB-044 — waterproofing membrane', to: 'files', hint: 'SLA 2d' },
    { label: 'CO-007 pending your approval', to: 'financials', hint: '₹18L' },
];

export type FloorPlanStripItem = {
    id: string;
    sheet: string;
    name: string;
    discipline: string;
    pins: number;
    updated: string;
};

export const DUMMY_FLOOR_PLANS_STRIP: FloorPlanStripItem[] = [
    { id: 'a101', sheet: 'A-101', name: 'Ground Floor', discipline: 'Architectural', pins: 12, updated: 'Mar 18' },
    { id: 'a102', sheet: 'A-102', name: 'Typical Floor', discipline: 'Architectural', pins: 8, updated: 'Mar 17' },
    { id: 's201', sheet: 'S-201', name: 'Roof Slab', discipline: 'Structural', pins: 5, updated: 'Mar 12' },
    { id: 'm301', sheet: 'M-301', name: 'Riser Diagram', discipline: 'MEP', pins: 3, updated: 'Mar 10' },
    { id: 'e401', sheet: 'E-401', name: 'Power Layout L5', discipline: 'Electrical', pins: 6, updated: 'Mar 8' },
    { id: 'fp201', sheet: 'FP-201', name: 'Sprinkler Riser', discipline: 'Fire', pins: 2, updated: 'Mar 5' },
];

export type DrawingPlanCard = FloorPlanStripItem & {
    rev: string;
    status: 'Current' | 'Superseded';
    /** PDF or image URL for the drawings viewer (defaults to demo PDF). */
    pdfUrl?: string;
    fileName?: string;
};

export const DUMMY_DRAWING_PLANS: DrawingPlanCard[] = [
    {
        id: 'a101',
        sheet: 'A-101',
        name: 'Ground Floor — Architectural',
        discipline: 'Architectural',
        pins: 12,
        updated: 'Mar 18',
        rev: 'Rev C',
        status: 'Current',
        pdfUrl: DEMO_PLAN_PDF_URL,
        fileName: 'A-101-ground.pdf',
    },
    {
        id: 'a102',
        sheet: 'A-102',
        name: 'Typical Floor — Architectural',
        discipline: 'Architectural',
        pins: 8,
        updated: 'Mar 17',
        rev: 'Rev D',
        status: 'Current',
        pdfUrl: DEMO_PLAN_PDF_URL,
        fileName: 'A-102-typical.pdf',
    },
    {
        id: 's201',
        sheet: 'S-201',
        name: 'Roof Slab — Structural',
        discipline: 'Structural',
        pins: 5,
        updated: 'Mar 12',
        rev: 'Rev B',
        status: 'Current',
        pdfUrl: DEMO_PLAN_PDF_URL,
        fileName: 'S-201-roof.pdf',
    },
    {
        id: 'm301',
        sheet: 'M-301',
        name: 'Riser — MEP',
        discipline: 'MEP',
        pins: 0,
        updated: 'Feb 2',
        rev: 'Rev A',
        status: 'Superseded',
        pdfUrl: DEMO_PLAN_PDF_URL,
        fileName: 'M-301-riser.pdf',
    },
    {
        id: 'p101',
        sheet: 'P-101',
        name: 'Plumbing Riser',
        discipline: 'MEP Plumbing',
        pins: 4,
        updated: 'Mar 15',
        rev: 'Rev B',
        status: 'Current',
        pdfUrl: DEMO_PLAN_PDF_URL,
        fileName: 'P-101-plumbing.pdf',
    },
    {
        id: 'e401',
        sheet: 'E-401',
        name: 'Electrical Single Line',
        discipline: 'MEP Electrical',
        pins: 7,
        updated: 'Mar 14',
        rev: 'Rev A',
        status: 'Current',
        pdfUrl: DEMO_PLAN_PDF_URL,
        fileName: 'E-401-electrical.pdf',
    },
];

/** Mock task pins in sheet pixel space (matches rasterized PDF dimensions at default scale). */
export type DemoPlanPin = {
    id: string;
    label: string;
    x: number;
    y: number;
    status: TaskColumn;
};

export const DEMO_PLAN_PINS: Record<string, DemoPlanPin[]> = {
    a101: [
        { id: 'p1', label: 'T-042', x: 420, y: 320, status: 'in_progress' },
        { id: 'p2', label: 'T-041', x: 720, y: 540, status: 'open' },
    ],
    a102: [
        { id: 'p1', label: 'T-038', x: 380, y: 410, status: 'blocked' },
    ],
    s201: [
        { id: 'p1', label: 'T-020', x: 520, y: 380, status: 'completed' },
    ],
    m301: [],
    p101: [
        { id: 'p1', label: 'T-029', x: 460, y: 340, status: 'awaiting_inspection' },
    ],
    e401: [
        { id: 'p1', label: 'T-042', x: 540, y: 460, status: 'in_progress' },
        { id: 'p2', label: 'T-034', x: 780, y: 620, status: 'in_review' },
    ],
};

export function getDrawingPlanById(planId: string): DrawingPlanCard | undefined {
    return DUMMY_DRAWING_PLANS.find((p) => p.id === planId);
}

export function getDemoPinsForPlan(planId: string): DemoPlanPin[] {
    return DEMO_PLAN_PINS[planId] ?? [];
}

export const DUMMY_KPIS = [
    {
        label: 'Tasks',
        value: '38',
        sublabel: 'Open · 12 done this week · 3 blocked',
        trend: 'up' as const,
        accent: 'default' as const,
    },
    {
        label: 'RFIs',
        value: '14',
        sublabel: 'Open · 2 overdue · 4.2d avg',
        trend: 'warn' as const,
        accent: 'warning' as const,
    },
    {
        label: 'Budget',
        value: '62%',
        sublabel: 'Spent · 7d burn trending flat',
        trend: 'neutral' as const,
        accent: 'default' as const,
    },
    {
        label: 'Inspections',
        value: '91%',
        sublabel: 'Pass rate · Mar',
        trend: 'neutral' as const,
        accent: 'success' as const,
    },
    {
        label: 'Team',
        value: '7',
        sublabel: 'Active today',
        trend: 'neutral' as const,
        accent: 'default' as const,
    },
    {
        label: 'Schedule',
        value: '-4d',
        sublabel: 'Behind baseline',
        trend: 'down' as const,
        accent: 'danger' as const,
    },
];

export type DailyReportStatus = 'Approved' | 'Pending' | 'Rejected' | 'Draft';

export type DailyReportManpowerLine = {
    company: string;
    trade: string;
    workers: number;
    hours: number;
    costCode?: string;
};

export type DailyReportEquipmentLine = {
    asset: string;
    hours: number;
};

export type DailyReportDeliveryLine = {
    description: string;
    supplier?: string;
};

export type DailyReportRow = {
    date: string;
    submittedBy: string;
    weather: string;
    status: DailyReportStatus;
    narrative: string;
    photoLabels?: string[];
    linkedRfis?: string[];
    manpower: DailyReportManpowerLine[];
    equipment: DailyReportEquipmentLine[];
    deliveries: DailyReportDeliveryLine[];
};

export function totalDailyReportCrew(row: DailyReportRow): number {
    return row.manpower.reduce((s, m) => s + m.workers, 0);
}

/** Calendar dot — keep aligned with `PM_DAILY_REPORT_CALENDAR_LEGEND`. */
export type CalendarDot =
    | 'approved'
    | 'pending'
    | 'draft'
    | 'rejected'
    | 'missing'
    | 'weekend'
    | 'upcoming';

function pad2(n: number): string {
    return String(n).padStart(2, '0');
}

/** Local calendar date ISO (YYYY-MM-DD) — no TZ shift. */
export function dailyReportDateIso(year: number, monthIndex: number, day: number): string {
    return `${year}-${pad2(monthIndex + 1)}-${pad2(day)}`;
}

export function formatLocalDateIso(d: Date): string {
    return dailyReportDateIso(d.getFullYear(), d.getMonth(), d.getDate());
}

function compareIsoDates(a: string, b: string): number {
    return a.localeCompare(b);
}

function addDaysToIso(iso: string, deltaDays: number): string {
    const [y, m, d] = iso.split('-').map((x) => parseInt(x, 10));
    const dt = new Date(y, m - 1, d + deltaDays);
    return formatLocalDateIso(dt);
}

/**
 * Last calendar day in month that should show as "missing" (no row) vs "upcoming".
 * Past months → month end; future months → day before month start; current month → real today.
 */
/** First weekday in month, or real today when it falls in the viewed month. */
export function defaultNewDailyReportDateIso(
    viewYear: number,
    viewMonthIndex: number,
    realTodayIso: string,
): string {
    const [ty, tm, td] = realTodayIso.split('-').map((x) => parseInt(x, 10));
    if (ty === viewYear && tm === viewMonthIndex + 1) {
        const wd = new Date(ty, tm - 1, td).getDay();
        if (wd !== 0 && wd !== 6) return realTodayIso;
    }
    const dim = new Date(viewYear, viewMonthIndex + 1, 0).getDate();
    for (let d = 1; d <= dim; d++) {
        const wd = new Date(viewYear, viewMonthIndex, d).getDay();
        if (wd !== 0 && wd !== 6) return dailyReportDateIso(viewYear, viewMonthIndex, d);
    }
    return dailyReportDateIso(viewYear, viewMonthIndex, 1);
}

export function dailyReportMissingCutoffForMonth(
    viewYear: number,
    viewMonthIndex: number,
    realTodayIso: string,
): string {
    const lastDay = new Date(viewYear, viewMonthIndex + 1, 0).getDate();
    const viewEnd = dailyReportDateIso(viewYear, viewMonthIndex, lastDay);
    const viewStart = dailyReportDateIso(viewYear, viewMonthIndex, 1);
    if (compareIsoDates(viewEnd, realTodayIso) < 0) return viewEnd;
    if (compareIsoDates(viewStart, realTodayIso) > 0) return addDaysToIso(viewStart, -1);
    return realTodayIso;
}

function dailyReportStatusToDot(status: DailyReportStatus): CalendarDot {
    switch (status) {
        case 'Approved':
            return 'approved';
        case 'Pending':
            return 'pending';
        case 'Draft':
            return 'draft';
        case 'Rejected':
            return 'rejected';
    }
}

/**
 * Derive per-day calendar dots from stored rows + today's date (weekdays without rows:
 * past/today → missing, future → upcoming).
 */
export function buildDailyReportDayDotsForMonth(input: {
    year: number;
    monthIndex: number;
    rowsByDate: Map<string, DailyReportRow>;
    /** Use `dailyReportMissingCutoffForMonth(year, monthIndex, realTodayIso)`. */
    missingCutoffIso: string;
}): { day: number; dot: CalendarDot }[] {
    const { year, monthIndex, rowsByDate, missingCutoffIso } = input;
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const out: { day: number; dot: CalendarDot }[] = [];
    for (let day = 1; day <= daysInMonth; day++) {
        const wd = new Date(year, monthIndex, day).getDay();
        const weekend = wd === 0 || wd === 6;
        const dateIso = dailyReportDateIso(year, monthIndex, day);
        if (weekend) {
            out.push({ day, dot: 'weekend' });
            continue;
        }
        const row = rowsByDate.get(dateIso);
        if (row) {
            out.push({ day, dot: dailyReportStatusToDot(row.status) });
            continue;
        }
        if (dateIso <= missingCutoffIso) out.push({ day, dot: 'missing' });
        else out.push({ day, dot: 'upcoming' });
    }
    return out;
}

export const DUMMY_DAILY_REPORTS: DailyReportRow[] = [
    {
        date: '2026-03-20',
        submittedBy: 'Raj Kumar',
        weather: 'Sunny · 33°C',
        status: 'Pending',
        narrative: 'Slab pour completed Zone C; curing blankets installed.',
        photoLabels: ['pour-west-edge.jpg'],
        linkedRfis: ['RFI-003'],
        manpower: [
            { company: 'Peak Concrete', trade: 'Structural', workers: 32, hours: 10, costCode: '03-3000' },
            { company: 'Spark MEP', trade: 'MEP', workers: 16, hours: 8, costCode: '23-0000' },
        ],
        equipment: [{ asset: 'Concrete pump 38m', hours: 6 }],
        deliveries: [{ description: 'Rebar bundle — Grid C', supplier: 'SteelCo' }],
    },
    {
        date: '2026-03-19',
        submittedBy: 'Priya Shah',
        weather: 'Partly cloudy · 31°C',
        status: 'Approved',
        narrative: 'Façade panels set on north elevation; swing stage moved.',
        manpower: [
            { company: 'Vertex Cladding', trade: 'Finishing', workers: 28, hours: 9, costCode: '07-4200' },
            { company: 'Site GC', trade: 'GC', workers: 24, hours: 8, costCode: '01-7416' },
        ],
        equipment: [{ asset: 'Swing stage NW', hours: 9 }],
        deliveries: [],
    },
    {
        date: '2026-03-18',
        submittedBy: 'Raj Kumar',
        weather: 'Light rain · 28°C',
        status: 'Approved',
        narrative: 'Rain stopped exterior work at 14:00; MEP rough-in continued indoors.',
        manpower: [
            { company: 'Spark MEP', trade: 'MEP', workers: 22, hours: 8, costCode: '23-0000' },
            { company: 'DryFit Interiors', trade: 'Drywall', workers: 22, hours: 8, costCode: '09-2100' },
        ],
        equipment: [],
        deliveries: [{ description: 'Cable tray fittings', supplier: 'ElecSupply' }],
    },
    {
        date: '2026-03-17',
        submittedBy: 'Amit Verma',
        weather: 'Sunny · 32°C',
        status: 'Approved',
        narrative: 'Tower crane picks for mechanical unit; traffic marshal on duty.',
        manpower: [
            { company: 'LiftRight Rigging', trade: 'Rigging', workers: 12, hours: 8 },
            { company: 'Site GC', trade: 'GC', workers: 27, hours: 10, costCode: '01-7416' },
        ],
        equipment: [{ asset: 'Tower crane', hours: 8 }],
        deliveries: [],
    },
    {
        date: '2026-03-16',
        submittedBy: 'Priya Shah',
        weather: 'Cloudy · 30°C',
        status: 'Rejected',
        narrative: 'Incomplete manpower breakdown — resubmit with cost codes.',
        manpower: [{ company: 'Various', trade: 'Mixed', workers: 41, hours: 8 }],
        equipment: [],
        deliveries: [],
    },
    {
        date: '2026-03-15',
        submittedBy: 'Raj Kumar',
        weather: 'Sunny · 34°C',
        status: 'Approved',
        narrative: 'Formwork strike L2 podium; debris cleared.',
        manpower: [
            { company: 'Peak Concrete', trade: 'Structural', workers: 26, hours: 9, costCode: '03-3000' },
            { company: 'Site GC', trade: 'GC', workers: 20, hours: 8, costCode: '01-7416' },
        ],
        equipment: [],
        deliveries: [],
    },
    {
        date: '2026-03-14',
        submittedBy: 'Site Sup.',
        weather: 'Windy · 29°C',
        status: 'Draft',
        narrative: 'Draft — toolbox talk notes pending.',
        manpower: [{ company: 'Site GC', trade: 'GC', workers: 38, hours: 6 }],
        equipment: [],
        deliveries: [],
    },
];

export const DUMMY_INSPECTION_STATS = {
    total: 24,
    passRate: 91,
    month: 8,
    scheduled: 3,
};

export type DummyInspection = {
    title: string;
    type: string;
    location: string;
    by: string;
    date: string;
    result: 'Pass' | 'Fail' | 'Conditional';
    status: string;
};

export const DUMMY_INSPECTIONS: DummyInspection[] = [
    {
        title: 'Waterproofing Check — L3',
        type: 'Quality',
        location: 'Floor 3 planter',
        by: 'QC Lead',
        date: '2026-03-18',
        result: 'Fail',
        status: 'Completed',
    },
    {
        title: 'MEP Rough-in',
        type: 'MEP',
        location: 'Level 2',
        by: 'MEP Lead',
        date: '2026-03-20',
        result: 'Pass',
        status: 'Scheduled',
    },
    {
        title: 'Concrete Pre-Pour — Grid B',
        type: 'Structural',
        location: 'Tower A Podium',
        by: 'Raj Kumar',
        date: '2026-03-21',
        result: 'Pass',
        status: 'Completed',
    },
    {
        title: 'Safety Toolbox Talk',
        type: 'Safety',
        location: 'Site gate',
        by: 'Safety Off.',
        date: '2026-03-19',
        result: 'Pass',
        status: 'Completed',
    },
    {
        title: 'Pre-Handover Unit 1204',
        type: 'Quality',
        location: 'Unit 1204',
        by: 'QC',
        date: '2026-03-22',
        result: 'Conditional',
        status: 'In progress',
    },
    {
        title: 'Fire Protection — Sprinkler head spacing',
        type: 'Fire',
        location: 'L6 corridor',
        by: 'MEP',
        date: '2026-03-25',
        result: 'Pass',
        status: 'Scheduled',
    },
];

export const DUMMY_FOLDERS = [
    'Contracts',
    'Permits & Approvals',
    'Specifications',
    'Correspondence',
    'Reports',
    'O&M Manuals',
    'Submittals',
    'Custom — Vendor quotes',
];

export type DummyFile = {
    name: string;
    type: string;
    size: string;
    by: string;
    date: string;
    folder: string;
};

export const DUMMY_FILES: DummyFile[] = [
    { name: 'GC Master Agreement — signed.pdf', type: 'pdf', size: '2.4 MB', by: 'PM', date: 'Mar 1', folder: 'Contracts' },
    { name: 'Structural GA — Rev C.pdf', type: 'pdf', size: '8.1 MB', by: 'Consultant', date: 'Feb 26', folder: 'Specifications' },
    { name: 'Fire NOC — scanned.pdf', type: 'pdf', size: '1.2 MB', by: 'Admin', date: 'Jan 12', folder: 'Permits & Approvals' },
    { name: 'Architectural IFB — Tower A.xlsx', type: 'spreadsheet', size: '420 KB', by: 'Architect', date: 'Mar 5', folder: 'Specifications' },
    { name: 'MEP shop drawing — riser.dwg', type: 'other', size: '3.8 MB', by: 'MEP', date: 'Mar 14', folder: 'Submittals' },
    { name: 'O&M — DG set.pdf', type: 'pdf', size: '6.0 MB', by: 'Vendor', date: 'Feb 2', folder: 'O&M Manuals' },
    { name: 'Weekly coordination — Mar 10.docx', type: 'doc', size: '88 KB', by: 'PM', date: 'Mar 10', folder: 'Correspondence' },
    { name: 'Concrete test reports — Mar.zip', type: 'other', size: '12 MB', by: 'QC', date: 'Mar 16', folder: 'Reports' },
    { name: 'Facade mock-up photos.zip', type: 'other', size: '24 MB', by: 'Site', date: 'Mar 8', folder: 'Reports' },
    { name: 'Insurance — CAR policy.pdf', type: 'pdf', size: '900 KB', by: 'Admin', date: 'Dec 1', folder: 'Contracts' },
];

export const DUMMY_MEETINGS = [
    {
        name: 'Weekly site coordination',
        type: 'Site Progress Meeting',
        date: 'Mar 19 · 10:00',
        attendees: 8,
        actions: 5,
        status: 'Completed',
    },
    {
        name: 'Facade design review',
        type: 'Design Review Meeting',
        date: 'Mar 21 · 15:30',
        attendees: 6,
        actions: 3,
        status: 'Scheduled',
    },
    {
        name: 'Toolbox — working at height',
        type: 'Safety Toolbox Talk',
        date: 'Mar 18 · 08:00',
        attendees: 42,
        actions: 0,
        status: 'Completed',
    },
    {
        name: 'Owner walk — L12',
        type: 'Owner/Client Meeting',
        date: 'Mar 24 · 11:00',
        attendees: 4,
        actions: 2,
        status: 'Scheduled',
    },
    {
        name: 'MEP clash review',
        type: 'Subcontractor Coordination',
        date: 'Mar 17 · 16:00',
        attendees: 9,
        actions: 7,
        status: 'Completed',
    },
    {
        name: 'Concrete pour sequence',
        type: 'Custom',
        date: 'Mar 26 · 09:00',
        attendees: 5,
        actions: 1,
        status: 'Scheduled',
    },
];

export const DUMMY_TEAM_STATS = { total: 18, activeToday: 7, companies: 6 };

export type DummyTeamMember = {
    name: string;
    role: string;
    company: string;
    joined: string;
    lastActive: string;
    tasks: number;
    onSite?: boolean;
};

export const DUMMY_TEAM_MEMBERS: DummyTeamMember[] = [
    {
        name: 'Ananya Mehta',
        role: 'PM',
        company: 'BuildWire Org',
        joined: 'Jun 2024',
        lastActive: '2m ago',
        tasks: 12,
        onSite: true,
    },
    {
        name: 'Raj Kumar',
        role: 'Supervisor',
        company: 'Acme Infra',
        joined: 'Aug 2024',
        lastActive: '12m ago',
        tasks: 8,
        onSite: true,
    },
    {
        name: 'Priya Shah',
        role: 'Supervisor',
        company: 'Skyline Civil',
        joined: 'Sep 2024',
        lastActive: '1h ago',
        tasks: 6,
        onSite: false,
    },
    {
        name: 'Neha Desai',
        role: 'Guest',
        company: 'Design Partners',
        joined: 'Jan 2025',
        lastActive: '3h ago',
        tasks: 0,
        onSite: false,
    },
    {
        name: 'Amit Verma',
        role: 'Worker',
        company: 'Acme Infra',
        joined: 'Oct 2024',
        lastActive: '30m ago',
        tasks: 4,
        onSite: true,
    },
    {
        name: 'Vikram Sinha',
        role: 'Supervisor',
        company: 'MEP Pro',
        joined: 'Nov 2024',
        lastActive: '2d ago',
        tasks: 5,
        onSite: false,
    },
];

export type DummySub = { name: string; trade: string; contact: string; workers: number; tasks: number };

export const DUMMY_SUBCONTRACTORS: DummySub[] = [
    { name: 'Acme Infra Pvt Ltd', trade: 'Civil', contact: 'Raj Kumar', workers: 24, tasks: 18 },
    { name: 'Skyline Civil', trade: 'Structural', contact: 'Priya Shah', workers: 12, tasks: 9 },
    { name: 'MEP Pro', trade: 'MEP', contact: 'Vikram Sinha', workers: 16, tasks: 11 },
    { name: 'GlassCo', trade: 'Glazing', contact: 'R. Menon', workers: 8, tasks: 4 },
];

export type LogEvent = { user: string; text: string; when: string; entity?: string };

export const DUMMY_ACTIVITY_LOG: { label: string; events: LogEvent[] }[] = [
    {
        label: 'Today',
        events: [
            { user: 'Raj Kumar', text: 'changed status of T-042 from In Progress → Completed', when: '2h ago', entity: 'task' },
            { user: 'Priya Shah', text: 'submitted Daily Report for Mar 18', when: '5h ago', entity: 'report' },
            { user: 'Neha Desai', text: 'uploaded A-102 Rev D', when: '6h ago', entity: 'drawing' },
        ],
    },
    {
        label: 'Yesterday',
        events: [
            { user: 'System', text: 'RFI-014 answered by Architect', when: '4:12 PM', entity: 'rfi' },
            { user: 'PM', text: 'approved expense EX-441', when: '11:20 AM', entity: 'expense' },
        ],
    },
    {
        label: 'March 15',
        events: [
            { user: 'QC Lead', text: 'created inspection IN-088 (waterproofing)', when: '10:00 AM', entity: 'inspection' },
            { user: 'Amit Verma', text: 'commented on T-038', when: '9:15 AM', entity: 'task' },
        ],
    },
];

export const DUMMY_INVENTORY_STATS = {
    total: 120,
    available: 28,
    reserved: 14,
    booked: 22,
    sold: 48,
    handedOver: 8,
    revenueBooked: '₹186 Cr',
};

export type UnitStatus = 'available' | 'reserved' | 'booked' | 'sold' | 'handed';

export type DummyUnit = { id: string; status: UnitStatus; type: string };

export const DUMMY_UNITS_L7: DummyUnit[] = Array.from({ length: 24 }).map((_, i) => {
    const s = i % 5;
    const status: UnitStatus =
        s === 0 ? 'sold' : s === 1 ? 'booked' : s === 2 ? 'reserved' : s === 3 ? 'handed' : 'available';
    const types = ['2BHK', '3BHK', '2BHK', '3BHK', 'Duplex'];
    return { id: `A-7${String(10 + i).padStart(2, '0')}`, status, type: types[i % 5] };
});

export const DUMMY_REPORTS_BY_CATEGORY: Record<string, { title: string; subtitle: string }[]> = {
    Overview: [
        { title: 'Project Status Report (weekly)', subtitle: 'Health, tasks, RFIs, budget snapshot' },
        { title: 'Progress Dashboard', subtitle: 'Trends — tasks, RFIs, inspections, photos' },
        { title: 'Executive one-pager', subtitle: 'Stakeholder PDF with logo' },
    ],
    Field: [
        { title: 'Daily Report Summary', subtitle: 'Date range table · export PDF/Excel' },
        { title: 'Task Activity Report', subtitle: 'Created/completed/blocked by week & trade' },
        { title: 'Punch List Report', subtitle: 'Grouped by trade · resolution photos' },
    ],
    Financial: [
        { title: 'Budget Variance Report', subtitle: 'Budgeted vs spent vs projected' },
        { title: 'Expense Report', subtitle: 'Receipts by category · accounting export' },
        { title: 'Cash flow projection', subtitle: 'Milestones vs billing' },
    ],
    Quality: [
        { title: 'Inspection Summary', subtitle: 'Pass rate by type and trade' },
        { title: 'Deficiency Report', subtitle: 'Quality/punch tasks · aging 30/60/90' },
    ],
    Custom: [
        { title: 'My saved view — RFIs + Tasks', subtitle: 'User-defined columns' },
        { title: 'Client pack — March', subtitle: 'Branded bundle' },
    ],
};

export const DUMMY_BUDGET_LINES = [
    { cat: 'Civil & Structural', budgeted: '4.20 Cr', cos: '12 L', revised: '4.32 Cr', spent: '2.91 Cr', remaining: '1.41 Cr', pct: 67 },
    { cat: 'Foundation', budgeted: '85 L', cos: '0', revised: '85 L', spent: '82 L', remaining: '3 L', pct: 96 },
    { cat: 'MEP', budgeted: '2.10 Cr', cos: '8 L', revised: '2.18 Cr', spent: '1.44 Cr', remaining: '74 L', pct: 66 },
    { cat: 'Interior Finishing', budgeted: '1.60 Cr', cos: '15 L', revised: '1.75 Cr', spent: '0.42 Cr', remaining: '1.33 Cr', pct: 24 },
    { cat: 'Contingency', budgeted: '45 L', cos: '0', revised: '45 L', spent: '12 L', remaining: '33 L', pct: 27 },
];

export const DUMMY_EXPENSES = [
    {
        desc: 'Cement bulk — Mar lot',
        category: 'Civil & Structural',
        vendor: 'UltraTech',
        amount: '₹12.4L',
        date: 'Mar 18',
        by: 'Raj K.',
        status: 'Pending' as const,
    },
    {
        desc: 'Tower crane hire — Week 11',
        category: 'Preliminary & General',
        vendor: 'LiftCo',
        amount: '₹8.2L',
        date: 'Mar 17',
        by: 'PM',
        status: 'Approved' as const,
    },
    {
        desc: 'Copper cable — L7',
        category: 'MEP',
        vendor: 'Polycab',
        amount: '₹22.1L',
        date: 'Mar 15',
        by: 'MEP Lead',
        status: 'Approved' as const,
    },
    {
        desc: 'False ceiling material',
        category: 'Interior Finishing',
        vendor: 'Gyproc',
        amount: '₹6.0L',
        date: 'Mar 12',
        by: 'Site',
        status: 'Rejected' as const,
    },
];

export const DUMMY_CHANGE_ORDERS = [
    {
        num: 'CO-007',
        title: 'Additional balcony waterproofing',
        reason: 'Unforeseen Condition',
        amount: '+₹18L',
        status: 'Pending' as const,
        date: 'Mar 16',
    },
    {
        num: 'CO-006',
        title: 'Owner — upgrade lobby flooring',
        reason: 'Owner Request',
        amount: '+₹42L',
        status: 'Approved' as const,
        date: 'Mar 1',
    },
    {
        num: 'CO-005',
        title: 'Scope reduction — landscape package',
        reason: 'Scope Reduction',
        amount: '-₹15L',
        status: 'Approved' as const,
        date: 'Feb 20',
    },
];

export const DUMMY_PAYMENT_PLANS = [
    {
        unit: 'A-1104',
        buyer: 'K. Menon',
        value: '₹2.85 Cr',
        paid: '₹1.20 Cr',
        next: 'Apr 5',
        overdue: 0,
    },
    {
        unit: 'A-805',
        buyer: 'S. Patel',
        value: '₹2.40 Cr',
        paid: '₹2.40 Cr',
        next: '—',
        overdue: 0,
    },
    {
        unit: 'B-402',
        buyer: 'R. Shah',
        value: '₹3.10 Cr',
        paid: '₹0.80 Cr',
        next: 'Mar 22',
        overdue: 5,
    },
];

export const DUMMY_SCHEDULE_PHASES = [
    {
        name: 'Foundation',
        milestone: 'Pour complete — Tower A',
        progress: 100,
        owner: 'Ananya',
        children: ['Excavation', 'PCC', 'Raft', 'Columns G+2'],
    },
    {
        name: 'Superstructure',
        milestone: 'Slab L12 complete',
        progress: 72,
        owner: 'Raj',
        children: ['L3–L6', 'L7–L10', 'L11–L12'],
    },
    {
        name: 'MEP',
        milestone: 'Rough-in sign-off',
        progress: 45,
        owner: 'Vikram',
        children: ['Electrical', 'Plumbing', 'HVAC'],
    },
    {
        name: 'Finishing',
        milestone: 'Sample flat approval',
        progress: 18,
        owner: 'Priya',
        children: ['Flooring', 'Paint', 'Joinery'],
    },
];
