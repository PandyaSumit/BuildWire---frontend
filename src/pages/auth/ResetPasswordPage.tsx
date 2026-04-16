import { Suspense } from 'react';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';

function Fallback() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand" />
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<Fallback />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
