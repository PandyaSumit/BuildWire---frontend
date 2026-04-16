import { useCallback, useEffect, useMemo, useState } from 'react';
import { AppPage } from '@/pages/shared/AppPage';
import { useAppSelector } from '@/store/hooks';
import {
  inviteOrganizationMember,
  listOrganizationInvites,
  listOrganizationMembers,
  listOrganizationRoles,
  removeOrganizationMember,
  resendOrganizationInvite,
  updateOrganizationMemberRole,
} from '@/services/organization/organizationService';
import type { OrganizationInviteRow, OrganizationMemberRow } from '@/types/organization';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

function personName(m?: OrganizationMemberRow['user']) {
  const name = [m?.first_name, m?.last_name].filter(Boolean).join(' ').trim();
  return name || m?.email || 'Unknown user';
}

export default function TeamPage() {
  const orgId = useAppSelector((s) => s.auth.user?.org?.id);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [members, setMembers] = useState<OrganizationMemberRow[]>([]);
  const [invites, setInvites] = useState<OrganizationInviteRow[]>([]);
  const [roleOptions, setRoleOptions] = useState<string[]>([]);
  const [permissionsByRole, setPermissionsByRole] = useState<Record<string, string[]>>({});
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('worker');
  const [inviteBusy, setInviteBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [updatingMemberId, setUpdatingMemberId] = useState<string | null>(null);
  const [resendingInviteId, setResendingInviteId] = useState<string | null>(null);
  const [removeCandidate, setRemoveCandidate] = useState<OrganizationMemberRow | null>(null);

  const load = useCallback(async () => {
    if (!orgId) return;
    const [memberRes, rolesRes, invitesRes] = await Promise.all([
      listOrganizationMembers(orgId, { page: 1, limit: 200 }),
      listOrganizationRoles(orgId),
      listOrganizationInvites(orgId),
    ]);
    setMembers(memberRes.data);
    setInvites(invitesRes.filter((r) => r.status !== 'accepted'));
    const all = rolesRes.allRoles.map((r) => r.key);
    setRoleOptions(all);
    setPermissionsByRole(
      rolesRes.allRoles.reduce<Record<string, string[]>>((acc, role) => {
        acc[role.key] = role.permissions || [];
        return acc;
      }, {})
    );
    setInviteRole((prev) => (all.length > 0 && !all.includes(prev) ? all[0] : prev));
  }, [orgId]);

  useEffect(() => {
    if (!orgId) {
      setLoading(false);
      setError('No organization context found.');
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        await load();
      } catch (err) {
        if (!cancelled) {
          const e = err as { response?: { data?: { error?: string; message?: string } } };
          setError(e?.response?.data?.error || e?.response?.data?.message || 'Failed to load team members');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [orgId, load]);

  const myRole = useAppSelector((s) => s.auth.user?.org?.role);
  const myPermissions = useMemo(() => permissionsByRole[myRole || ''] || [], [permissionsByRole, myRole]);
  const canInvite = myRole === 'org_admin' || myPermissions.includes('member:invite');
  const canUpdateMembers = myRole === 'org_admin' || myPermissions.includes('member:update');
  const canRemoveMembers = myRole === 'org_admin' || myPermissions.includes('member:remove');
  const activeAdmins = useMemo(() => members.filter((m) => m.role === 'org_admin').length, [members]);

  async function onInviteSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!orgId || !inviteEmail || !inviteRole) return;
    setInviteBusy(true);
    setMessage(null);
    setError(null);
    try {
      await inviteOrganizationMember(orgId, { email: inviteEmail.trim(), role: inviteRole });
      setInviteEmail('');
      setMessage('Invitation sent successfully.');
      await load();
    } catch (err) {
      const e2 = err as { response?: { data?: { error?: string; message?: string } } };
      setError(e2?.response?.data?.error || e2?.response?.data?.message || 'Failed to send invitation');
    } finally {
      setInviteBusy(false);
    }
  }

  async function onChangeRole(memberId: string, role: string) {
    if (!orgId) return;
    setUpdatingMemberId(memberId);
    setError(null);
    try {
      const updated = await updateOrganizationMemberRole(orgId, memberId, role);
      setMembers((prev) => prev.map((m) => (m.id === memberId ? updated : m)));
    } catch (err) {
      const e = err as { response?: { data?: { error?: string; message?: string } } };
      setError(e?.response?.data?.error || e?.response?.data?.message || 'Failed to update role');
    } finally {
      setUpdatingMemberId(null);
    }
  }

  async function onRemove(memberId: string) {
    if (!orgId) return;
    setUpdatingMemberId(memberId);
    setError(null);
    try {
      await removeOrganizationMember(orgId, memberId);
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
    } catch (err) {
      const e = err as { response?: { data?: { error?: string; message?: string } } };
      setError(e?.response?.data?.error || e?.response?.data?.message || 'Failed to remove member');
    } finally {
      setUpdatingMemberId(null);
    }
  }

  async function onResendInvite(inviteId: string) {
    if (!orgId) return;
    setResendingInviteId(inviteId);
    setMessage(null);
    setError(null);
    try {
      await resendOrganizationInvite(orgId, inviteId);
      setMessage('Invitation resent successfully.');
      await load();
    } catch (err) {
      const e = err as { response?: { data?: { error?: string; message?: string } } };
      setError(e?.response?.data?.error || e?.response?.data?.message || 'Failed to resend invite');
    } finally {
      setResendingInviteId(null);
    }
  }

  return (
    <AppPage title="Organization members" description="Invite and manage organization members with role-based access controls.">
      <section className="mb-6 rounded-xl border border-border bg-surface p-4">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">Invite organization member</h2>
        <form className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_220px_auto]" onSubmit={onInviteSubmit}>
          <Input
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="member@company.com"
            className="py-2"
            required
          />
          <Select
            value={inviteRole}
            onValueChange={setInviteRole}
            disabled={!canInvite}
            options={roleOptions.map((r) => ({ value: r, label: r }))}
            placeholder="Select role"
            triggerClassName="py-2"
          />
          <Button
            type="submit"
            variant="outline"
            loading={inviteBusy}
            loadingText="Sending..."
            disabled={!canInvite}
            className="py-2"
          >
            Send invite
          </Button>
        </form>
        <p className="mt-2 text-xs text-muted">Members get an email invitation to set up their account and join the organization.</p>
        {!canInvite ? (
          <p className="mt-2 text-xs text-warning">You do not have permission to invite members.</p>
        ) : null}
      </section>

      {message ? <div className="mb-4 rounded-lg border border-success/40 bg-success/10 px-3 py-2 text-sm text-primary">{message}</div> : null}
      {error ? <div className="mb-4 rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-primary">{error}</div> : null}

      <section className="rounded-xl border border-border bg-surface p-4">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">Members and invitations</h2>
        {loading ? (
          <div className="space-y-2">
            <div className="h-10 animate-pulse rounded bg-muted/20" />
            <div className="h-10 animate-pulse rounded bg-muted/20" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                  <th className="px-3 py-2 font-medium">Member</th>
                  <th className="px-3 py-2 font-medium">Email</th>
                  <th className="px-3 py-2 font-medium">Role</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr key={member.id} className="border-b border-border/60">
                    <td className="px-3 py-2 text-primary">{personName(member.user)}</td>
                    <td className="px-3 py-2 text-secondary">{member.user?.email ?? '-'}</td>
                    <td className="px-3 py-2">
                      <Select
                        value={member.role}
                        onValueChange={(v) => onChangeRole(member.id, v)}
                        disabled={updatingMemberId === member.id || !canUpdateMembers}
                        options={roleOptions.map((r) => ({ value: r, label: r }))}
                        fullWidth={false}
                        triggerClassName="min-w-[170px] py-1.5"
                      />
                    </td>
                    <td className="px-3 py-2 text-secondary">Active</td>
                    <td className="px-3 py-2 text-right">
                      <Button
                        type="button"
                        onClick={() => setRemoveCandidate(member)}
                        disabled={
                          updatingMemberId === member.id ||
                          !canRemoveMembers ||
                          (member.role === 'org_admin' && activeAdmins <= 1)
                        }
                        variant="danger"
                        size="sm"
                      >
                        Remove
                      </Button>
                    </td>
                  </tr>
                ))}
                {invites.map((invite) => (
                  <tr key={invite.id} className="border-b border-border/60">
                    <td className="px-3 py-2 text-primary">{invite.invitedEmail ?? '-'}</td>
                    <td className="px-3 py-2 text-secondary">{invite.invitedEmail ?? '-'}</td>
                    <td className="px-3 py-2 text-secondary">{invite.role ?? '-'}</td>
                    <td className="px-3 py-2 text-secondary capitalize">{invite.status}</td>
                    <td className="px-3 py-2 text-right">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onResendInvite(invite.id)}
                        disabled={!canInvite}
                        loading={resendingInviteId === invite.id}
                        loadingText="Resending..."
                      >
                        Resend invite
                      </Button>
                    </td>
                  </tr>
                ))}
                {members.length === 0 && invites.length === 0 ? (
                  <tr>
                    <td className="px-3 py-8 text-center text-secondary" colSpan={5}>
                      No members or pending invites found.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {removeCandidate ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            aria-label="Close remove member dialog"
            onClick={() => setRemoveCandidate(null)}
          />
          <div className="relative z-10 w-full max-w-md rounded-xl border border-border bg-elevated p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-primary">Remove organization member?</h3>
            <p className="mt-2 text-sm text-secondary">
              {personName(removeCandidate.user)} will lose organization access immediately.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setRemoveCandidate(null)}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="danger"
                loading={updatingMemberId === removeCandidate.id}
                loadingText="Removing..."
                onClick={async () => {
                  await onRemove(removeCandidate.id);
                  setRemoveCandidate(null);
                }}
              >
                Remove member
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </AppPage>
  );
}
