import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout } from '@/store/authSlice';
import { canAccessOrganizationSettings, parseOrgRole } from '@/lib/rbac';

type AccountDropdownProps = {
  open: boolean;
  onClose: () => void;
  /** Sidebar rail: open menu to the inline-end with a fixed width so labels are not clipped. */
  collapsed?: boolean;
};

const menuItemClass =
  'flex items-center gap-2 px-3 py-2 text-sm text-primary hover:bg-surface';

export function AccountDropdown({ open, onClose, collapsed = false }: AccountDropdownProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const orgRole = parseOrgRole(user?.org?.role);
  const showOrgSettings = canAccessOrganizationSettings(orgRole);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleLogout = async () => {
    onClose();
    await dispatch(logout()).unwrap();
    navigate('/login');
  };

  return (
    <div
      className={
        collapsed
          ? 'absolute bottom-4 start-full z-[60] ms-2 w-52 origin-bottom-start rounded-lg border border-border bg-elevated py-1 shadow-lg'
          : 'absolute bottom-full start-0 end-0 z-50 mb-1 origin-bottom rounded-lg border border-border bg-elevated py-1 shadow-lg'
      }
      role="menu"
    >
      <Link
        to="/settings/preferences"
        role="menuitem"
        onClick={onClose}
        className={menuItemClass}
      >
        <svg className="h-4 w-4 shrink-0 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
          />
        </svg>
        {t('account.preferences')}
      </Link>
      {showOrgSettings && (
        <Link
          to="/settings/organization"
          role="menuitem"
          onClick={onClose}
          className={menuItemClass}
        >
          <svg className="h-4 w-4 shrink-0 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
          {t('account.organization')}
        </Link>
      )}
      <button
        type="button"
        role="menuitem"
        onClick={handleLogout}
        className="flex w-full items-center gap-2 px-3 py-2 text-start text-sm text-danger hover:bg-danger/10"
      >
        <svg className="h-4 w-4 shrink-0 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          />
        </svg>
        {t('account.logOut')}
      </button>
    </div>
  );
}
