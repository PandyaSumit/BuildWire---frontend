import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '@/lib/api';
import { Button, Input, Alert } from '@/components/ui';

export function ResetPasswordForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);

  useEffect(() => {
    if (!token) {
      setError('Reset token is missing');
      setTokenValid(false);
      return;
    }

    const validateToken = async () => {
      try {
        await api.get(`/auth/reset-password?token=${token}`);
        setTokenValid(true);
      } catch {
        setError('This reset link has expired or is invalid');
        setTokenValid(false);
      }
    };

    validateToken();
  }, [token]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
    if (!/[0-9!@#$%^&*]/.test(formData.password)) {
      errors.password = 'Password must contain a number or special character';
    }
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !token) return;

    setIsSubmitting(true);
    setError('');

    try {
      await api.post('/auth/reset-password', {
        token,
        password: formData.password,
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string; message?: string } } };
      setError(e?.response?.data?.error || e?.response?.data?.message || 'Failed to reset password');
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  if (tokenValid === null) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
      </div>
    );
  }

  if (tokenValid === false) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-surface border border-border rounded-xl p-8 shadow-lg dark:shadow-none text-center">
            <div className="mb-6 flex justify-center">
              <div className="w-16 h-16 bg-danger/10 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-primary mb-2">Invalid Link</h2>
            <p className="text-secondary mb-6">{error}</p>
            <Link to="/forgot-password">
              <Button className="w-full">Request New Link</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-surface border border-border rounded-xl p-8 shadow-lg dark:shadow-none text-center">
            <div className="mb-6 flex justify-center">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-primary mb-3">Password Reset Successfully!</h2>
            <p className="text-secondary mb-6">
              Your password has been successfully updated. You can now sign in with your new password.
            </p>
            <Link to="/login">
              <Button className="w-full">Continue to Login</Button>
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
          <p className="text-secondary">Enter your new password</p>
        </div>

        <div className="bg-surface border border-border rounded-xl p-6 shadow-lg dark:shadow-none">
          {error && (
            <div className="mb-6">
              <Alert variant="danger">{error}</Alert>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-primary mb-2">
                New Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min. 8 characters"
                  required
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition-colors"
                  disabled={isSubmitting}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {validationErrors.password && (
                <p className="text-danger text-xs mt-1">{validationErrors.password}</p>
              )}
              <p className="text-xs text-muted mt-2">
                Must be at least 8 characters and contain a number or special character
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-primary mb-2">
                Confirm New Password
              </label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter your password"
                required
                disabled={isSubmitting}
              />
              {validationErrors.confirmPassword && (
                <p className="text-danger text-xs mt-1">{validationErrors.confirmPassword}</p>
              )}
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Resetting...
                </span>
              ) : (
                'Reset Password'
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
