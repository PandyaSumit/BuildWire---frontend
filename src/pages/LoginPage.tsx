import { Suspense } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';

function LoginFallback() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto mb-4" />
        <p className="text-secondary text-sm">Loading…</p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  );
}
