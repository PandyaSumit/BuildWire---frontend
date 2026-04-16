import { useMemo, type ReactNode } from 'react';
import { ProjectUiContext } from '@/components/project/ProjectUiContext';
import { getMockUiProject } from '@/services/project/projectFixtures';

export function ProjectUiProvider({
  projectId,
  children,
}: {
  projectId: string;
  children: ReactNode;
}) {
  const value = useMemo(
    () => ({ project: getMockUiProject(projectId) }),
    [projectId],
  );
  return (
    <ProjectUiContext.Provider value={value}>{children}</ProjectUiContext.Provider>
  );
}
