import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { getMockUiProject } from './fixtures';
import type { MockUiProject } from './types';

type ProjectUiValue = {
  project: MockUiProject;
};

const ProjectUiContext = createContext<ProjectUiValue | null>(null);

export function ProjectUiProvider({ projectId, children }: { projectId: string; children: ReactNode }) {
  const value = useMemo(() => ({ project: getMockUiProject(projectId) }), [projectId]);
  return <ProjectUiContext.Provider value={value}>{children}</ProjectUiContext.Provider>;
}

export function useProjectUi(): ProjectUiValue {
  const ctx = useContext(ProjectUiContext);
  if (!ctx) {
    throw new Error('useProjectUi must be used inside ProjectUiProvider');
  }
  return ctx;
}

export function useOptionalProjectUi(): ProjectUiValue | null {
  return useContext(ProjectUiContext);
}
