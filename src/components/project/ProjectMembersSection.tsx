import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { OrganizationMemberRow } from '@/types/organization';
import type { ProjectMemberDto, ProjectMemberRole } from '@/types/project';
import { formatPersonName, projectMemberRoleTKey } from '@/utils/project/display';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { IconUserPlus, IconUserMinus } from '@/components/ui/icons';

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
  const { t } = useTranslation();
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
      setError(msg.response?.data?.error || msg.response?.data?.message || t('projectMembers.errorAdd'));
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
      setError(msg.response?.data?.error || msg.response?.data?.message || t('projectMembers.errorRemove'));
    } finally {
      setRemovingId(null);
    }
  }

  const selectPlaceholder =
    orgMembersLoading
      ? t('projectMembers.loadingPeople')
      : candidates.length === 0
        ? t('projectMembers.everyoneOnProject')
        : t('projectMembers.selectPerson');

  return (
    <section className="mt-10 border-t border-border pt-10">
      <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-muted">{t('projectMembers.teamTitle')}</h2>
      <p className="mb-4 text-sm text-secondary">{t('projectMembers.teamIntro')}</p>

      {canManage ? (
        <div className="mb-6 flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1">
            <Select
              id="add-member-user"
              label={t('projectMembers.addOrgMember')}
              value={userIdToAdd}
              onValueChange={setUserIdToAdd}
              disabled={orgMembersLoading || adding || candidates.length === 0}
              placeholder={selectPlaceholder}
              options={
                candidates.length === 0
                  ? [
                      {
                        value: '',
                        label: orgMembersLoading
                          ? t('projectMembers.loadingPeople')
                          : t('projectMembers.everyoneOnProject'),
                      },
                    ]
                  : [
                      { value: '', label: t('projectMembers.selectPerson') },
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
              label={t('projectMembers.projectRole')}
              value={roleToAdd}
              onValueChange={(v) => setRoleToAdd(v as ProjectMemberRole)}
              disabled={adding}
              options={projectRoles.map((r) => ({
                value: r,
                label: t(projectMemberRoleTKey(r)),
              }))}
              labelClassName="text-xs font-medium text-secondary"
            />
          </div>
          <Button
            type="button"
            variant="primary"
            size="md"
            disabled={!userIdToAdd || adding}
            loading={adding}
            loadingText={t('projectMembers.adding')}
            onClick={() => void handleAdd()}
            iconLeft={<IconUserPlus />}
          >
            {t('projectMembers.add')}
          </Button>
        </div>
      ) : null}

      {error ? (
        <div className="mb-4 rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-primary">{error}</div>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full text-start text-sm">
          <thead className="border-b border-border bg-muted/10 text-xs font-semibold uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3">{t('projectMembers.colPerson')}</th>
              <th className="px-4 py-3">{t('projectMembers.colRole')}</th>
              <th className="hidden px-4 py-3 sm:table-cell">{t('projectMembers.colAddedBy')}</th>
              {canManage ? <th className="w-24 px-4 py-3 text-end"> </th> : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-surface">
            {members.length === 0 ? (
              <tr>
                <td colSpan={canManage ? 4 : 3} className="px-4 py-8 text-center text-secondary">
                  {t('projectMembers.noMembersLoaded')}
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
                    <td className="px-4 py-3 text-secondary">{t(projectMemberRoleTKey(m.role))}</td>
                    <td className="hidden px-4 py-3 text-secondary sm:table-cell">{addedBy || '—'}</td>
                    {canManage ? (
                      <td className="px-4 py-3 text-end">
                        <button
                          type="button"
                          disabled={removingId === m.id}
                          onClick={() => void handleRemove(m.id)}
                          className="inline-flex items-center gap-1 text-xs font-medium text-danger hover:underline disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <IconUserMinus />{removingId === m.id ? '…' : t('projectMembers.remove')}
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
