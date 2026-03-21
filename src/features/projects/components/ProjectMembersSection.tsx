import { useMemo, useState } from 'react';
import type { OrganizationMemberRow } from '@/types/organization';
import type { ProjectMemberDto, ProjectMemberRole } from '@/types/project';
import { formatPersonName, projectMemberRoleLabel } from '@/features/projects/lib/display';
import { Select } from '@/components/ui/select';

const projectRoles: ProjectMemberRole[] = ['project_manager', 'supervisor', 'worker', 'guest'];

type Props = {
  members: ProjectMemberDto[];
  orgMembers: OrganizationMemberRow[];
  orgMembersLoading: boolean;
  canManage: boolean;
  onAdd: (userId: string, role: ProjectMemberRole) => Promise<void>;
  onRemove: (memberId: string) => Promise<void>;
};

export function ProjectMembersSection({
  members,
  orgMembers,
  orgMembersLoading,
  canManage,
  onAdd,
  onRemove,
}: Props) {
  const [userIdToAdd, setUserIdToAdd] = useState('');
  const [roleToAdd, setRoleToAdd] = useState<ProjectMemberRole>('worker');
  const [adding, setAdding] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const projectUserIds = useMemo(() => new Set(members.map((m) => m.user_id)), [members]);

  const candidates = useMemo(
    () => orgMembers.filter((m) => m.user_id && !projectUserIds.has(m.user_id)),
    [orgMembers, projectUserIds]
  );

  async function handleAdd() {
    if (!userIdToAdd) return;
    setError(null);
    setAdding(true);
    try {
      await onAdd(userIdToAdd, roleToAdd);
      setUserIdToAdd('');
      setRoleToAdd('worker');
    } catch (err) {
      const msg = err as { response?: { data?: { error?: string; message?: string } } };
      setError(msg.response?.data?.error || msg.response?.data?.message || 'Could not add member');
    } finally {
      setAdding(false);
    }
  }

  async function handleRemove(memberId: string) {
    setError(null);
    setRemovingId(memberId);
    try {
      await onRemove(memberId);
    } catch (err) {
      const msg = err as { response?: { data?: { error?: string; message?: string } } };
      setError(msg.response?.data?.error || msg.response?.data?.message || 'Could not remove member');
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <section className="mt-10 border-t border-border pt-10">
      <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-muted">Team</h2>
      <p className="mb-4 text-sm text-secondary">Organization members who can access this project.</p>

      {canManage ? (
        <div className="mb-6 flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1">
            <Select
              id="add-member-user"
              label="Add org member"
              value={userIdToAdd}
              onValueChange={setUserIdToAdd}
              disabled={orgMembersLoading || adding || candidates.length === 0}
              placeholder={
                orgMembersLoading
                  ? 'Loading people…'
                  : candidates.length === 0
                    ? 'Everyone is already on the project'
                    : 'Select a person…'
              }
              options={
                candidates.length === 0
                  ? [
                      {
                        value: '',
                        label: orgMembersLoading ? 'Loading people…' : 'Everyone is already on the project',
                      },
                    ]
                  : [
                      { value: '', label: 'Select a person…' },
                      ...candidates.map((row) => ({
                        value: row.user_id,
                        label: formatPersonName(row.user) || row.user?.email || row.user_id,
                      })),
                    ]
              }
              labelClassName="text-xs font-medium text-secondary"
            />
          </div>
          <div className="w-full sm:w-44">
            <Select
              id="add-member-role"
              label="Project role"
              value={roleToAdd}
              onValueChange={(v) => setRoleToAdd(v as ProjectMemberRole)}
              disabled={adding}
              options={projectRoles.map((r) => ({
                value: r,
                label: projectMemberRoleLabel(r),
              }))}
              labelClassName="text-xs font-medium text-secondary"
            />
          </div>
          <button
            type="button"
            disabled={!userIdToAdd || adding}
            onClick={() => void handleAdd()}
            className="shrink-0 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white dark:text-bg transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {adding ? 'Adding…' : 'Add'}
          </button>
        </div>
      ) : null}

      {error ? (
        <div className="mb-4 rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-primary">{error}</div>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/10 text-xs font-semibold uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3">Person</th>
              <th className="px-4 py-3">Role</th>
              <th className="hidden px-4 py-3 sm:table-cell">Added by</th>
              {canManage ? <th className="w-24 px-4 py-3 text-right"> </th> : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-surface">
            {members.length === 0 ? (
              <tr>
                <td colSpan={canManage ? 4 : 3} className="px-4 py-8 text-center text-secondary">
                  No members loaded.
                </td>
              </tr>
            ) : (
              members.map((m) => {
                const name = formatPersonName(m.user);
                const email = m.user?.email ?? '—';
                const addedBy = formatPersonName(m.addedBy);
                return (
                  <tr key={m.id} className="hover:bg-muted/5">
                    <td className="px-4 py-3">
                      <p className="font-medium text-primary">{name || email}</p>
                      {name ? <p className="text-xs text-muted">{email}</p> : null}
                    </td>
                    <td className="px-4 py-3 text-secondary">{projectMemberRoleLabel(m.role)}</td>
                    <td className="hidden px-4 py-3 text-secondary sm:table-cell">{addedBy || '—'}</td>
                    {canManage ? (
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          disabled={removingId === m.id}
                          onClick={() => void handleRemove(m.id)}
                          className="text-xs font-medium text-danger hover:underline disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {removingId === m.id ? '…' : 'Remove'}
                        </button>
                      </td>
                    ) : null}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
