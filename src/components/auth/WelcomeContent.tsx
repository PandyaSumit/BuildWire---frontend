import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui';
import api from '@/lib/api';

export function WelcomeContent() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const firstName = searchParams.get('name') || '';

  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  const handleResendEmail = async () => {
    if (!email) return;

    setResending(true);
    setResendMessage('');
    try {
      await api.post('/auth/resend-verification', { email });
      setResendMessage('Verification email sent successfully!');
    } catch {
      setResendMessage('Failed to resend email. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="bg-surface border border-border rounded-xl p-8 shadow-lg dark:shadow-none">
          <div className="text-center mb-6">
            <div className="mb-6 flex justify-center">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-primary mb-2">
              Welcome to BuildWire{firstName ? `, ${firstName}` : ''}!
            </h2>
            <p className="text-secondary">Your account has been successfully created.</p>
          </div>

          <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 mb-6">
            <div className="flex gap-3">
              <svg className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <div className="flex-1 text-left">
                <p className="text-primary font-medium text-sm mb-2">Verify Your Email</p>
                <p className="text-secondary text-sm mb-3">
                  We&apos;ve sent a verification link to <strong className="text-primary">{email}</strong>
                </p>
                <p className="text-secondary text-sm">
                  Please check your inbox and click the link to activate your account and unlock all features.
                </p>
                {resendMessage && (
                  <p className={`text-xs mt-2 ${resendMessage.includes('success') ? 'text-success' : 'text-danger'}`}>
                    {resendMessage}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-elevated border border-border rounded-lg p-4 mb-6">
            <p className="text-sm text-secondary mb-2">
              <strong className="text-primary">What&apos;s next?</strong>
            </p>
            <ol className="text-sm text-secondary space-y-1.5 list-decimal list-inside">
              <li>Check your email inbox for our verification email</li>
              <li>Click the verification link in the email</li>
              <li>Return here and access your dashboard with full features</li>
            </ol>
          </div>

          <div className="space-y-3">
            <Button onClick={() => navigate('/dashboard')} className="w-full">
              Continue to Dashboard
            </Button>

            <Button onClick={handleResendEmail} variant="outline" className="w-full" disabled={resending}>
              {resending ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Sending...
                </span>
              ) : (
                "Didn't receive email? Resend"
              )}
            </Button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted">
              Wrong email?{' '}
              <Link to="/signup" className="text-primary hover:text-primary/80 transition-colors font-medium">
                Create a new account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
