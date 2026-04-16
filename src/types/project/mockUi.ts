export type MockProjectType = 'residential' | 'commercial' | 'industrial' | 'mixed_use';

export type MockUiProject = {
  id: string;
  name: string;
  type: MockProjectType;
  statusLabel: 'Active' | 'Planning' | 'On Hold';
  healthScore: number;
  city: string;
  addressLine: string;
  startDate: string;
  endDate: string;
  showInventory: boolean;
};
