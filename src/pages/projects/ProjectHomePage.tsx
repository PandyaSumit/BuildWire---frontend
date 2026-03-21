import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import { AppPage } from '@/pages/shared/AppPage';
import {
  addProjectMember,
  deleteProject,
  getProjectHome,
  removeProjectMember,
  updateProject,
} from '@/api/projects';
import type { OrganizationMemberRow } from '@/types/organization';
import type { ProjectDto, ProjectMemberDto, ProjectMemberRole } from '@/types/project';
import { ProjectStatusBadge } from '@/features/projects/components/ProjectStatusBadge';
import { ProjectTaskStatsGrid } from '@/features/projects/components/ProjectTaskStats';
import { EditProjectModal } from '@/features/projects/components/EditProjectModal';
import { DeleteProjectDialog } from '@/features/projects/components/DeleteProjectDialog';
import { ProjectMembersSection } from '@/features/projects/components/ProjectMembersSection';
import { formatDateOnly, formatPersonName } from '@/features/projects/lib/display';

function apiErrorMessage(err: unknown, fallback: string): string {
  const e = err as { response?: { data?: { error?: string; message?: string } }; message?: string };
  if (e?.response?.status === 404) return 'Project not found';
  return e?.response?.data?.error || e?.response?.data?.message || fallback;
}

const quickLinks: { to: string; label: string; hint: string }[] = [
  { to: 'tasks', label: 'Tasks', hint: 'Board and assignments' },
  { to: 'files', label: 'Files', hint: 'Drawings & docs' },
  { to: 'budget', label: 'Budget', hint: 'Cost tracking' },
  { to: 'rfis', label: 'RFIs', hint: 'Requests for information' },
];

export default function ProjectHomePage() {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const orgId = useAppSelector((s) => s.auth.user?.org?.id);
  const orgRole = useAppSelector((s) => s.auth.user?.org?.role);
  const currentUserId = useAppSelector((s) => s.auth.user?.id);

  const [project, setProject] = useState<ProjectDto | null>(null);
  const [members, setMembers] = useState<ProjectMemberDto[]>([]);
  const [orgMembers, setOrgMembers] = useState<OrganizationMemberRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const loadHome = useCallback(async () => {
    if (!orgId || !projectId) return;
    const home = await getProjectHome(orgId, projectId);
    setProject(home.project);
    setMembers(home.members);
    setOrgMembers(home.orgMembers);
  }, [orgId, projectId]);

  useEffect(() => {
    if (!orgId || !projectId) {
      setLoading(false);
      setProject(null);
      setMembers([]);
      setOrgMembers([]);
      setError(!orgId ? 'No organization context.' : null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        await loadHome();
      } catch (err) {
        if (!cancelled) {
          setError(apiErrorMessage(err, 'Failed to load project'));
          setProject(null);
          setMembers([]);
          setOrgMembers([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [orgId, projectId, loadHome]);

  const myMembership = useMemo(
    () => (currentUserId ? members.find((m) => m.user_id === currentUserId) : undefined),
    [members, currentUserId]
  );

  const canManageProject =
    orgRole === 'org_admin' || myMembership?.role === 'project_manager';
  const canDeleteProject = orgRole === 'org_admin';

  if (!orgId) {
    return (
      <AppPage title="Project" description="">
        <p className="text-sm text-secondary">No organization context on your account.</p>
      </AppPage>
    );
  }

  if (loading) {
    return (
      <AppPage title="Loading…" description="">
        <div className="space-y-4">
          <div className="h-8 max-w-md animate-pulse rounded-lg bg-muted/20" />
          <div className="h-24 animate-pulse rounded-xl bg-muted/10" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-lg bg-muted/10" />
            ))}
          </div>
        </div>
      </AppPage>
    );
  }

  if (error || !project) {
    return (
      <AppPage title="Project" description="">
        <div className="rounded-lg border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-primary">
          {error ?? 'Unable to load this project.'}
        </div>
      </AppPage>
    );
  }

  const creator = formatPersonName(project.createdBy);
  const stats = project.taskStats ?? {
    total: 0,
    open: 0,
    in_progress: 0,
    completed: 0,
    blocked: 0,
  };

  async function handleSaveEdit(body: {
    name: string;
    description: string;
    status: ProjectDto['status'];
    startDate: string | null;
    endDate: string | null;
  }) {
    if (!orgId || !projectId) return;
    await updateProject(orgId, projectId, {
      name: body.name,
      description: body.description,
      status: body.status,
      startDate: body.startDate,
      endDate: body.endDate,
    });
    await loadHome();
  }

  async function handleDeleteProject() {
    if (!orgId || !projectId) return;
    await deleteProject(orgId, projectId);
    navigate('/projects');
  }

  async function handleAddMember(userId: string, role: ProjectMemberRole) {
    if (!orgId || !projectId) return;
    await addProjectMember(orgId, projectId, { userId, role });
    await loadHome();
  }

  async function handleRemoveMember(memberId: string) {
    if (!orgId || !projectId) return;
    await removeProjectMember(orgId, projectId, memberId);
    await loadHome();
  }

  return (
    <AppPage
      title={project.name}
      description={project.description || 'Overview, team, and task health for this project.'}
    >
      <div className="mb-6 flex flex-wrap items-center justify-end gap-2">
        {canManageProject ? (
          <button
            type="button"
            onClick={() => setEditOpen(true)}
            className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-muted/10"
          >
            Edit project
          </button>
        ) : null}
        {canDeleteProject ? (
          <button
            type="button"
            onClick={() => setDeleteOpen(true)}
            className="rounded-lg border border-danger/40 bg-danger/10 px-4 py-2 text-sm font-medium text-danger transition-colors hover:bg-danger/20"
          >
            Delete project
          </button>
        ) : null}
      </div>

      <div className="mb-8 flex flex-wrap items-center gap-3">
        <ProjectStatusBadge status={project.status} />
        {creator ? (
          <span className="text-sm text-secondary">
            Created by <span className="text-primary">{creator}</span>
          </span>
        ) : null}
        <span className="text-sm text-muted">
          {project.start_date || project.end_date ? (
            <>
              {project.start_date ? <span>Start {formatDateOnly(project.start_date)}</span> : null}
              {project.start_date && project.end_date ? ' · ' : null}
              {project.end_date ? <span>End {formatDateOnly(project.end_date)}</span> : null}
            </>
          ) : (
            <span>No dates set</span>
          )}
        </span>
      </div>

      <section className="mb-10">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">Tasks</h2>
        <ProjectTaskStatsGrid stats={stats} />
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">Workspace</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {quickLinks.map((item) => (
            <Link
              key={item.to}
              to={`/projects/${project.id}/${item.to}`}
              className="group rounded-xl border border-border bg-surface p-4 transition-colors hover:border-brand/40 hover:bg-brand/5"
            >
              <p className="font-semibold text-primary group-hover:text-brand">{item.label}</p>
              <p className="mt-1 text-xs text-secondary">{item.hint}</p>
            </Link>
          ))}
        </div>
      </section>

      <ProjectMembersSection
        members={members}
        orgMembers={orgMembers}
        orgMembersLoading={false}
        canManage={canManageProject}
        onAdd={handleAddMember}
        onRemove={handleRemoveMember}
      />

      <EditProjectModal
        open={editOpen}
        project={project}
        onClose={() => setEditOpen(false)}
        onSubmit={handleSaveEdit}
      />

      <DeleteProjectDialog
        open={deleteOpen}
        projectName={project.name}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteProject}
      />
    </AppPage>
  );
}
