const prefix = 'bw:projectLast:';

export function storageKeyProjectLast(projectId: string): string {
  return `${prefix}${projectId}`;
}

/** Relative path within project, e.g. `/tasks` or `` for overview. */
export function readLastProjectPath(projectId: string): string {
  try {
    return localStorage.getItem(storageKeyProjectLast(projectId)) ?? '';
  } catch {
    return '';
  }
}

export function writeLastProjectPath(projectId: string, pathWithinProject: string): void {
  try {
    localStorage.setItem(storageKeyProjectLast(projectId), pathWithinProject);
  } catch {
    /* ignore */
  }
}
