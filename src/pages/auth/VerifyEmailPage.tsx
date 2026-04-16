import { Suspense } from 'react';
import { VerifyEmailForm } from '@/components/auth/VerifyEmailForm';

function Fallback() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand" />
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<Fallback />}>
      <VerifyEmailForm />
    </Suspense>
  );
}
