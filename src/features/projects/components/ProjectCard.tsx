import { Link } from 'react-router-dom';
import type { ProjectDto } from '@/types/project';
import { ProjectStatusBadge } from './ProjectStatusBadge';
import { formatPersonName, projectCardSubtitle } from '@/features/projects/lib/display';

export function ProjectCard({ project }: { project: ProjectDto }) {
  const creator = formatPersonName(project.createdBy);

  return (
    <Link
      to={`/projects/${project.id}`}
      className="group flex flex-col rounded-xl border border-border bg-surface p-5 transition-shadow hover:border-brand/40 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <h2 className="min-w-0 flex-1 text-base font-semibold text-primary group-hover:text-brand">
          {project.name}
        </h2>
        <ProjectStatusBadge status={project.status} />
      </div>
      {project.description ? (
        <p className="mb-4 line-clamp-2 text-sm text-secondary">{project.description}</p>
      ) : (
        <p className="mb-4 text-sm italic text-muted">No description</p>
      )}
      <div className="mt-auto space-y-1 border-t border-border pt-3 text-xs text-muted">
        <p className="text-secondary">{projectCardSubtitle(project)}</p>
        {creator ? <p>Created by {creator}</p> : null}
      </div>
    </Link>
  );
}
