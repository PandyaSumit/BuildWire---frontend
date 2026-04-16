import { AppPage } from '@/pages/shared/AppPage';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAppSelector } from '@/store/hooks';
import {
  createOrganizationRole,
  deleteOrganizationRole,
  listOrganizationRoles,
  updateOrganizationRole,
} from '@/api/organizations';
import type { OrganizationRoleTemplate } from '@/types/organization';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';

export default function RolesPage() {
  const orgId = useAppSelector((s) => s.auth.user?.org?.id);
  const myRole = useAppSelector((s) => s.auth.user?.org?.role);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [catalog, setCatalog] = useState<string[]>([]);
  const [templates, setTemplates] = useState<OrganizationRoleTemplate[]>([]);
  const [customRoles, setCustomRoles] = useState<OrganizationRoleTemplate[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [basedOn, setBasedOn] = useState('worker');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const allRoles = useMemo(() => [...templates, ...customRoles], [templates, customRoles]);
  const permissionsByRole = useMemo(
    () => allRoles.reduce<Record<string, string[]>>((acc, role) => {
      acc[role.key] = role.permissions || [];
      return acc;
    }, {}),
    [allRoles]
  );
  const myPermissions = permissionsByRole[myRole || ''] || [];
  const canManageRoles = myRole === 'org_admin' || myPermissions.includes('role:manage');

  const load = useCallback(async () => {
    if (!orgId) return;
    const res = await listOrganizationRoles(orgId);
    setCatalog(res.permissionsCatalog);
    setTemplates(res.templates);
    setCustomRoles(res.customRoles);
    if (res.templates.length > 0) {
      setBasedOn((prev) => (res.templates.some((r) => r.key === prev) ? prev : res.templates[0].key));
      setSelectedPermissions((prev) => (prev.length > 0 ? prev : res.templates[0].permissions));
    }
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
          setError(e?.response?.data?.error || e?.response?.data?.message || 'Failed to load roles');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [orgId, load]);

  function togglePermission(permission: string) {
    setSelectedPermissions((prev) =>
      prev.includes(permission) ? prev.filter((p) => p !== permission) : [...prev, permission]
    );
  }

  function onBasedOnChange(roleKey: string) {
    setBasedOn(roleKey);
    const base = allRoles.find((r) => r.key === roleKey);
    if (base) {
      setSelectedPermissions(base.permissions);
    }
  }

  async function onCreateRole(e: React.FormEvent) {
    e.preventDefault();
    if (!orgId || !name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await createOrganizationRole(orgId, {
        name: name.trim(),
        description: description.trim() || undefined,
        basedOn,
        permissions: selectedPermissions,
      });
      setName('');
      setDescription('');
      await load();
    } catch (err) {
      const e2 = err as { response?: { data?: { error?: string; message?: string } } };
      setError(e2?.response?.data?.error || e2?.response?.data?.message || 'Failed to create role');
    } finally {
      setSaving(false);
    }
  }

  async function onDeleteCustomRole(roleKey: string) {
    if (!orgId) return;
    setError(null);
    try {
      await deleteOrganizationRole(orgId, roleKey);
      await load();
    } catch (err) {
      const e = err as { response?: { data?: { error?: string; message?: string } } };
      setError(e?.response?.data?.error || e?.response?.data?.message || 'Failed to delete role');
    }
  }

  async function onQuickEditPermissions(role: OrganizationRoleTemplate, permission: string) {
    if (!orgId) return;
    const next = role.permissions.includes(permission)
      ? role.permissions.filter((p) => p !== permission)
      : [...role.permissions, permission];
    try {
      await updateOrganizationRole(orgId, role.key, { permissions: next });
      setCustomRoles((prev) => prev.map((r) => (r.key === role.key ? { ...r, permissions: next } : r)));
    } catch (err) {
      const e = err as { response?: { data?: { error?: string; message?: string } } };
      setError(e?.response?.data?.error || e?.response?.data?.message || 'Failed to update permissions');
    }
  }

  return (
    <AppPage
      title="Roles & permissions"
      description="Org-wide access control. Restricted to organization administrators."
    >
      {error ? <div className="mb-4 rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-primary">{error}</div> : null}

      <section className="mb-6 rounded-xl border border-border bg-surface p-4">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">Role templates</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {templates.map((role) => (
            <div key={role.key} className="rounded-lg border border-border/80 bg-bg p-3">
              <p className="text-sm font-semibold text-primary">{role.name}</p>
              <p className="mt-1 text-xs text-secondary">{role.description}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {role.permissions.map((p) => (
                  <span key={p} className="rounded bg-muted/20 px-2 py-0.5 text-[11px] text-secondary">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-6 rounded-xl border border-border bg-surface p-4">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">Create custom role</h2>
        <form className="space-y-3" onSubmit={onCreateRole}>
          <div className="grid gap-3 md:grid-cols-2">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Role name (e.g. Safety Inspector)"
              className="py-2"
              required
            />
            <Select
              value={basedOn}
              onValueChange={onBasedOnChange}
              options={allRoles.map((role) => ({ value: role.key, label: role.name }))}
              placeholder="Select base role"
              triggerClassName="py-2"
            />
          </div>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            className="py-2"
          />
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">Permissions</p>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {catalog.map((permission) => (
                <div key={permission} className="rounded border border-border/80 bg-bg px-2 py-1.5 text-xs text-secondary">
                  <Checkbox
                    checked={selectedPermissions.includes(permission)}
                    onChange={() => togglePermission(permission)}
                    label={permission}
                  />
                </div>
              ))}
            </div>
          </div>
          <Button
            type="submit"
            variant="outline"
            loading={saving}
            loadingText="Creating..."
            disabled={!canManageRoles}
          >
            Create custom role
          </Button>
        </form>
      </section>

      <section className="rounded-xl border border-border bg-surface p-4">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">Custom roles</h2>
        {loading ? (
          <div className="space-y-2">
            <div className="h-12 animate-pulse rounded bg-muted/20" />
            <div className="h-12 animate-pulse rounded bg-muted/20" />
          </div>
        ) : customRoles.length === 0 ? (
          <p className="text-sm text-secondary">No custom roles yet. Create one from a template above.</p>
        ) : (
          <div className="space-y-3">
            {customRoles.map((role) => (
              <div key={role.key} className="rounded-lg border border-border/80 bg-bg p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-primary">{role.name}</p>
                    <p className="text-xs text-secondary">{role.description || role.key}</p>
                  </div>
                  <Button
                    type="button"
                    onClick={() => onDeleteCustomRole(role.key)}
                    variant="danger"
                    size="sm"
                    disabled={!canManageRoles}
                  >
                    Delete
                  </Button>
                </div>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {catalog.map((permission) => (
                    <div key={permission} className="rounded border border-border/80 px-2 py-1 text-xs text-secondary">
                      <Checkbox
                        checked={role.permissions.includes(permission)}
                        onChange={() => onQuickEditPermissions(role, permission)}
                        label={permission}
                        disabled={!canManageRoles}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </AppPage>
  );
}
