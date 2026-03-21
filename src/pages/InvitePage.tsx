import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, Button, Checkbox, Input } from '@/components/ui';
import { acceptInvite, getInviteDetails, type InviteDetailsDto } from '@/api/auth';
import { setAccessToken } from '@/lib/tokenStore';

export default function InvitePage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [details, setDetails] = useState<InviteDetailsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** Default true: most invitees are new users and must send name + password. */
  const [needsAccount, setNeedsAccount] = useState(true);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (!token) {
      setError('Invalid invite link.');
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const data = await getInviteDetails(token);
        if (!cancelled) setDetails(data);
      } catch (err) {
        if (!cancelled) {
          const e = err as { response?: { data?: { error?: string; message?: string } } };
          setError(e?.response?.data?.error || e?.response?.data?.message || 'Invite is invalid or expired.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  async function onAccept() {
    if (!token) return;
    if (needsAccount) {
      if (!firstName.trim() || !lastName.trim() || !password.trim()) {
        setError('Please enter your first name, last name, and password to create your account.');
        return;
      }
    }
    setSubmitting(true);
    setError(null);
    try {
      const data = await acceptInvite(
        token,
        needsAccount ? { firstName: firstName.trim(), lastName: lastName.trim(), password: password.trim() } : {}
      );
      setAccessToken(data.accessToken);
      navigate('/dashboard');
    } catch (err) {
      const e = err as { response?: { data?: { error?: string; message?: string } } };
      setError(e?.response?.data?.error || e?.response?.data?.message || 'Failed to accept invitation');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-lg">
        <h1 className="text-xl font-semibold text-primary">Organization invitation</h1>
        {loading ? <p className="mt-3 text-sm text-secondary">Loading invitation details...</p> : null}
        {error ? <div className="mt-4"><Alert variant="danger">{error}</Alert></div> : null}

        {!loading && !error && details ? (
          <div className="mt-4 space-y-4">
            <div className="rounded-lg border border-border bg-bg p-3 text-sm">
              <p className="text-secondary">Organization</p>
              <p className="font-medium text-primary">{details.orgName}</p>
              <p className="mt-2 text-secondary">Invited as</p>
              <p className="font-medium text-primary">{details.role}</p>
              <p className="mt-2 text-secondary">Email</p>
              <p className="font-medium text-primary">{details.invitedEmail}</p>
            </div>

            <Checkbox
              checked={needsAccount}
              onChange={(e) => setNeedsAccount(e.target.checked)}
              label="I am creating a new account (uncheck if you already have a BuildWire login for this email)"
            />

            {needsAccount ? (
              <div className="space-y-3">
                <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name" />
                <Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last name" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create password"
                />
              </div>
            ) : null}

            <Button
              type="button"
              fullWidth
              loading={submitting}
              loadingText="Joining..."
              onClick={onAccept}
            >
              Accept invitation
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
