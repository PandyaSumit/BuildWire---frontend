import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { verifyEmail, resendVerification } from '@/store/slices/authSlice';
import { Button } from '@/components/ui/button';

export function VerifyEmailForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);

  const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'resending'>('verifying');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setError('Verification token is missing');
      return;
    }

    const verify = async () => {
      try {
        await dispatch(verifyEmail(token)).unwrap();
        setStatus('success');
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      } catch (err) {
        setStatus('error');
        const payload =
          typeof err === 'object' && err !== null && 'payload' in err && typeof (err as { payload: unknown }).payload === 'string'
            ? (err as { payload: string }).payload
            : undefined;
        setError(payload || (err instanceof Error ? err.message : 'Verification failed'));
      }
    };

    verify();
  }, [token, dispatch, navigate]);

  const handleResend = async () => {
    if (!user?.email) return;

    setStatus('resending');
    try {
      await dispatch(resendVerification(user.email)).unwrap();
      setError('Verification email sent! Please check your inbox.');
      setTimeout(() => setStatus('error'), 2000);
    } catch (err) {
      setError((err as Error).message || 'Failed to resend email');
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-surface border border-border rounded-xl p-8 shadow-lg dark:shadow-none text-center">
          {status === 'verifying' && (
            <>
              <div className="mb-6 flex justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-brand"></div>
              </div>
              <h2 className="text-2xl font-bold text-primary mb-2">Verifying Email</h2>
              <p className="text-secondary">Please wait while we verify your email address...</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="mb-6 flex justify-center">
                <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-primary mb-3">Email Verified!</h2>
              <p className="text-secondary mb-6">
                Your email has been successfully verified. You now have full access to all features.
              </p>
              <Link to="/dashboard">
                <Button className="w-full">Continue to Dashboard</Button>
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="mb-6 flex justify-center">
                <div className="w-16 h-16 bg-danger/10 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-primary mb-2">Verification Failed</h2>
              <p className="text-danger text-sm mb-6">{error}</p>

              {user && (
                <Button onClick={handleResend} variant="outline" className="w-full mb-4">
                  Resend Verification Email
                </Button>
              )}

              <Link to="/login">
                <Button variant="outline" className="w-full">
                  Back to Login
                </Button>
              </Link>
            </>
          )}

          {status === 'resending' && (
            <>
              <div className="mb-6 flex justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-brand"></div>
              </div>
              <h2 className="text-2xl font-bold text-primary mb-2">Sending Email</h2>
              <p className="text-secondary">Please wait...</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
