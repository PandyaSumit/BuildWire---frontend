import type { MockUiProject } from './types';

const defaults: Omit<MockUiProject, 'id' | 'name'> = {
  type: 'residential',
  statusLabel: 'Active',
  healthScore: 84,
  city: 'Mumbai',
  addressLine: 'Andheri East',
  startDate: '2024-06-01',
  endDate: '2026-12-15',
  showInventory: true,
};

/** Deterministic mock project for any route `projectId` (UI-only). */
export function getMockUiProject(projectId: string): MockUiProject {
  const seed = projectId.replace(/-/g, '').slice(0, 8);
  const n = parseInt(seed, 16) || 0;
  const types: MockUiProject['type'][] = ['residential', 'commercial', 'industrial', 'mixed_use'];
  const type = types[n % types.length];
  const healthScore = 55 + (n % 45);
  const showInventory = type === 'residential' || type === 'mixed_use';

  return {
    id: projectId,
    name: 'Tower A — Andheri',
    type,
    statusLabel: n % 7 === 0 ? 'Planning' : n % 11 === 0 ? 'On Hold' : 'Active',
    healthScore,
    city: 'Mumbai',
    addressLine: 'Andheri East',
    startDate: defaults.startDate,
    endDate: defaults.endDate,
    showInventory,
  };
}
