import { useContext } from 'react';
import {
  ProjectUiContext,
  type ProjectUiValue,
} from '@/components/project/ProjectUiContext';

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
