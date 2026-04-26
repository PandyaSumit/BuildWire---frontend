import { createContext } from 'react';
import type { MockUiProject } from '@/types/project/mockUi';

export type ProjectUiValue = {
  project: MockUiProject;
};

export const ProjectUiContext = createContext<ProjectUiValue | null>(null);
