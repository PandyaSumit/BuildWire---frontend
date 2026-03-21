import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '@/lib/api';
import { Button, Input, Alert } from '@/components/ui';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await api.post('/auth/forgot-password', { email });
      setSuccess(true);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string; message?: string } } };
      setError(e?.response?.data?.error || e?.response?.data?.message || 'Failed to send reset email');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-surface border border-border rounded-xl p-8 shadow-lg dark:shadow-none text-center">
            <div className="mb-6 flex justify-center">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-primary mb-3">Check Your Email</h2>
            <p className="text-secondary mb-4">
              If an account exists with <strong className="text-primary">{email}</strong>, you&apos;ll receive a password reset link shortly.
            </p>
            
            <div className="bg-elevated border border-border rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-secondary">
                <strong className="text-primary">Next steps:</strong>
              </p>
              <ol className="text-sm text-secondary mt-2 space-y-1 list-decimal list-inside">
                <li>Check your email inbox</li>
                <li>Click the reset link in the email</li>
                <li>Create a new password</li>
              </ol>
            </div>

            <Link to="/login">
              <Button className="w-full">
                Back to Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-bg font-bold">BW</span>
            </div>
            <span className="font-bold text-2xl text-primary">BuildWire</span>
          </div>
          <h1 className="text-2xl font-bold text-primary mb-2">Reset Password</h1>
          <p className="text-secondary">Enter your email to receive a reset link</p>
        </div>

        <div className="bg-surface border border-border rounded-xl p-6 shadow-lg dark:shadow-none">
          {error && (
            <div className="mb-6">
              <Alert variant="danger">
                {error}
              </Alert>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-primary mb-2">
                Email Address
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                disabled={isSubmitting}
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Sending...
                </span>
              ) : (
                'Send Reset Link'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm text-brand hover:text-brand/80 transition-colors">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
