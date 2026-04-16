import { Suspense } from 'react';
import { WelcomeContent } from '@/components/auth/WelcomeContent';

function Fallback() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand" />
    </div>
  );
}

export default function WelcomePage() {
  return (
    <Suspense fallback={<Fallback />}>
      <WelcomeContent />
    </Suspense>
  );
}
