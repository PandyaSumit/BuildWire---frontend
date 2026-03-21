import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/authSlice';

type AccountDropdownProps = {
  open: boolean;
  onClose: () => void;
};

export function AccountDropdown({ open, onClose }: AccountDropdownProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

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
      className="absolute bottom-full left-0 right-0 z-50 mb-1 origin-bottom rounded-lg border border-border bg-elevated py-1 shadow-lg"
      role="menu"
    >
      <Link
        to="/settings/organization"
        role="menuitem"
        onClick={onClose}
        className="flex items-center gap-2 px-3 py-2 text-sm text-primary hover:bg-surface"
      >
        <svg className="h-4 w-4 shrink-0 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Settings
      </Link>
      <button
        type="button"
        role="menuitem"
        onClick={handleLogout}
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-danger hover:bg-danger/10"
      >
        <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          />
        </svg>
        Log out
      </button>
    </div>
  );
}
