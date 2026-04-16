/** Demo directory: stable user ids → display (until org directory API is wired). */

export type DemoUser = { id: string; name: string; initials: string };

/** Demo “current user” for My work / field assignment chips until auth is wired */
export const DEMO_ACTOR_USER_ID = 'u_raj';

export const DEMO_USERS: DemoUser[] = [
  { id: 'u_raj', name: 'Raj Kumar', initials: 'RK' },
  { id: 'u_priya', name: 'Priya Shah', initials: 'PS' },
  { id: 'u_amit', name: 'Amit Verma', initials: 'AV' },
  { id: 'u_neha', name: 'Neha K', initials: 'NK' },
  { id: 'u_qc', name: 'QC', initials: 'Q' },
  { id: 'u_site', name: 'Site Eng.', initials: 'SE' },
  { id: 'u_safety', name: 'Safety Off.', initials: 'S' },
  { id: 'u_mep', name: 'MEP Lead', initials: 'ML' },
  { id: 'u_qclead', name: 'QC Lead', initials: 'QL' },
];

const BY_ID = Object.fromEntries(DEMO_USERS.map((u) => [u.id, u])) as Record<string, DemoUser>;

const NAME_TO_ID: Record<string, string> = Object.fromEntries(
  DEMO_USERS.map((u) => [u.name.toLowerCase(), u.id])
);

export function demoUserById(id: string): DemoUser | undefined {
  return BY_ID[id];
}

/** Resolve legacy mock assignee name to demo user id */
export function demoUserIdFromName(name: string): string {
  const id = NAME_TO_ID[name.trim().toLowerCase()];
  return id ?? DEMO_USERS[0].id;
}

export function demoPrimaryAssigneeName(task: { assignees: string[] }): string {
  const first = task.assignees[0];
  if (!first) return '—';
  return demoUserById(first)?.name ?? first;
}

/** Unique assignees in order, with demo directory names (falls back to raw id). */
export function demoAssigneesDisplayList(task: {
  assignees: string[];
}): { id: string; name: string }[] {
  const seen = new Set<string>();
  const out: { id: string; name: string }[] = [];
  for (const id of task.assignees) {
    if (!id || seen.has(id)) continue;
    seen.add(id);
    const u = demoUserById(id);
    out.push({ id, name: u?.name ?? id });
  }
  return out;
}

export function demoPrimaryInitials(task: { assignees: string[] }): string {
  const first = task.assignees[0];
  if (!first) return '?';
  return demoUserById(first)?.initials ?? first.slice(0, 2).toUpperCase();
}
