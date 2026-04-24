import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { bootstrapSession } from '@/lib/sessionBootstrap';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const location = useLocation();
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      setSessionChecked(true);
      return;
    }
    bootstrapSession(dispatch).finally(() => {
      setSessionChecked(true);
    });
  }, [dispatch, isAuthenticated]);

  if (!sessionChecked) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto mb-4" />
          <p className="text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    const returnUrl = location.pathname + location.search;
    const qs = returnUrl && returnUrl !== '/' ? `?returnUrl=${encodeURIComponent(returnUrl)}` : '';
    return <Navigate to={`/login${qs}`} replace />;
  }

  return <>{children}</>;
}
