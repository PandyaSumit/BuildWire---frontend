import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { resendVerification } from '@/store/slices/authSlice';
import { Button } from '@/components/ui/button';

export function EmailVerificationBanner() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState('');
  const [isDismissed, setIsDismissed] = useState(false);

  if (!user || user.emailVerified || isDismissed) return null;

  const handleResend = async () => {
    setIsSending(true);
    setMessage('');
    try {
      await dispatch(resendVerification(user.email)).unwrap();
      setMessage('Verification email sent! Please check your inbox.');
    } catch (err) {
      setMessage((err as Error).message || 'Failed to send email');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-warning/10 border-b border-warning/20 px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <svg className="w-5 h-5 text-warning flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div className="flex-1">
            <p className="text-sm text-primary">
              <strong>Verify your email</strong> - Check your inbox for a verification link.
            </p>
            {message && (
              <p className={`text-xs mt-1 ${message.includes('sent') ? 'text-success' : 'text-danger'}`}>
                {message}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleResend}
            disabled={isSending}
            size="sm"
            variant="ghost"
          >
            {isSending ? 'Sending...' : 'Resend'}
          </Button>
          <button
            onClick={() => setIsDismissed(true)}
            className="text-muted hover:text-primary transition-colors p-1"
            aria-label="Dismiss"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
