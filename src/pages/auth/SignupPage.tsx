import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { register, clearError } from '@/store/authSlice';
import { Button, Input, Alert } from '@/components/ui';
import api from '@/lib/api';

export default function SignupPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const error = useAppSelector((s) => s.auth.error);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    orgName: '',
    phone: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong'>('weak');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [emailChecking, setEmailChecking] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const checkEmailAvailability = useCallback(async (email: string) => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailAvailable(null);
      return;
    }

    setEmailChecking(true);
    try {
      const { data } = await api.get(`/auth/check-email?email=${encodeURIComponent(email)}`);
      setEmailAvailable(data.data.available);
    } catch {
      setEmailAvailable(null);
    } finally {
      setEmailChecking(false);
    }
  }, []);

  useEffect(() => {
    if (formData.password) {
      const hasLength = formData.password.length >= 8;
      const hasNumber = /[0-9]/.test(formData.password);
      const hasSpecial = /[!@#$%^&*]/.test(formData.password);
      const hasUpper = /[A-Z]/.test(formData.password);
      
      const score = [hasLength, hasNumber, hasSpecial, hasUpper].filter(Boolean).length;
      
      if (score <= 2) setPasswordStrength('weak');
      else if (score === 3) setPasswordStrength('medium');
      else setPasswordStrength('strong');
    }
  }, [formData.password]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (formData.firstName.length < 2) {
      errors.firstName = 'First name must be at least 2 characters';
    }
    if (formData.lastName.length < 2) {
      errors.lastName = 'Last name must be at least 2 characters';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (emailAvailable === false) {
      errors.email = 'This email is already registered';
    }
    if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
    if (!/[0-9!@#$%^&*]/.test(formData.password)) {
      errors.password = 'Password must contain a number or special character';
    }
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    if (formData.orgName.length < 3) {
      errors.orgName = 'Organization name must be at least 3 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    dispatch(clearError());

    try {
      await dispatch(
        register({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          orgName: formData.orgName,
          phone: formData.phone || undefined,
        })
      ).unwrap();
      navigate(`/welcome?email=${encodeURIComponent(formData.email)}&name=${encodeURIComponent(formData.firstName)}`);
    } catch {
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

  const handleEmailBlur = () => {
    if (formData.email) {
      checkEmailAvailability(formData.email);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col lg:flex-row">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
              <span className="text-gray-900 font-bold text-xl">BW</span>
            </div>
            <span className="font-bold text-2xl text-white">BuildWire</span>
          </div>
          <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
            Start building smarter today
          </h2>
          <p className="text-white/90 text-lg mb-8 leading-relaxed">
            Join thousands of construction professionals managing their projects more efficiently.
          </p>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-white">Real-time project tracking</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-white">Budget management & forecasting</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-white">Team collaboration tools</span>
            </div>
          </div>
        </div>
        <div className="relative z-10 text-white/70 text-sm">
          Trusted by leading construction companies worldwide
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 lg:p-12">
        <div className="w-full max-w-2xl">
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-bg font-bold">BW</span>
              </div>
              <span className="font-bold text-2xl text-primary">BuildWire</span>
            </div>
            <p className="text-secondary">Create your account to get started</p>
          </div>

          <div className="hidden lg:block mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">Create an account</h1>
            <p className="text-secondary">Get started with your 14-day free trial.</p>
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-primary mb-2">
                  First Name
                </label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="John"
                  required
                  disabled={isSubmitting}
                />
                {validationErrors.firstName && (
                  <p className="text-danger text-xs mt-1">{validationErrors.firstName}</p>
                )}
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-primary mb-2">
                  Last Name
                </label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Doe"
                  required
                  disabled={isSubmitting}
                />
                {validationErrors.lastName && (
                  <p className="text-danger text-xs mt-1">{validationErrors.lastName}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-primary mb-2">
                Work Email
              </label>
              <div className="relative">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleEmailBlur}
                  placeholder="you@company.com"
                  required
                  disabled={isSubmitting}
                />
                {emailChecking && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <svg className="animate-spin h-4 w-4 text-muted" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  </div>
                )}
                {!emailChecking && emailAvailable === false && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-danger">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                )}
                {!emailChecking && emailAvailable === true && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-success">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                )}
              </div>
              {validationErrors.email && (
                <p className="text-danger text-xs mt-1">{validationErrors.email}</p>
              )}
              {!emailChecking && emailAvailable === false && (
                <p className="text-danger text-xs mt-1">This email is already registered</p>
              )}
              {!emailChecking && emailAvailable === true && (
                <p className="text-success text-xs mt-1">Email is available</p>
              )}
            </div>

            <div>
              <label htmlFor="orgName" className="block text-sm font-medium text-primary mb-2">
                Organization Name
              </label>
              <Input
                id="orgName"
                name="orgName"
                type="text"
                value={formData.orgName}
                onChange={handleChange}
                placeholder="Your Company Inc."
                required
                disabled={isSubmitting}
              />
              {validationErrors.orgName && (
                <p className="text-danger text-xs mt-1">{validationErrors.orgName}</p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-primary mb-2">
                Phone Number <span className="text-muted text-xs">(optional)</span>
              </label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 (555) 000-0000"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-primary mb-2">
                Password
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
              {formData.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    <div className={`h-1 flex-1 rounded-full ${passwordStrength === 'weak' ? 'bg-danger' : passwordStrength === 'medium' ? 'bg-warning' : 'bg-success'}`} />
                    <div className={`h-1 flex-1 rounded-full ${passwordStrength === 'medium' || passwordStrength === 'strong' ? passwordStrength === 'medium' ? 'bg-warning' : 'bg-success' : 'bg-border'}`} />
                    <div className={`h-1 flex-1 rounded-full ${passwordStrength === 'strong' ? 'bg-success' : 'bg-border'}`} />
                  </div>
                  <p className="text-xs text-muted">
                    {passwordStrength === 'weak' && 'Weak password'}
                    {passwordStrength === 'medium' && 'Medium strength'}
                    {passwordStrength === 'strong' && 'Strong password'}
                  </p>
                </div>
              )}
              {validationErrors.password && (
                <p className="text-danger text-xs mt-1">{validationErrors.password}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-primary mb-2">
                Confirm Password
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
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-secondary">
              Already have an account?{' '}
              <Link to="/login" className="text-brand hover:text-brand/80 transition-colors font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>

          <p className="text-center text-xs text-muted mt-8">
            By signing up, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
