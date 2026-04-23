'use client';
import React, { Suspense, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useRouter, useSearchParams } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';

type Mode = 'login' | 'accept_invite';

type LoginForm = { email: string; password: string };
type AcceptForm = {
  email: string;
  fullName: string;
  password: string;
  confirmPassword: string;
};

interface InvitationSummary {
  email: string;
  full_name: string | null;
  role: 'admin' | 'team_leader' | 'agent';
  position: string | null;
  department: { name: string; color: string } | null;
}

function AuthPageInner() {
  const router = useRouter();
  const params = useSearchParams();
  const inviteToken = params.get('invite');

  const [mode, setMode] = useState<Mode>(inviteToken ? 'accept_invite' : 'login');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [invitation, setInvitation] = useState<InvitationSummary | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);

  const loginForm = useForm<LoginForm>({ defaultValues: { email: '', password: '' } });
  const acceptForm = useForm<AcceptForm>({
    defaultValues: { email: '', fullName: '', password: '', confirmPassword: '' },
  });

  useEffect(() => {
    if (!inviteToken) return;
    setMode('accept_invite');
    setIsLoading(true);
    fetch(`/api/invitations/${inviteToken}`)
      .then(async (r) => ({ ok: r.ok, body: await r.json() }))
      .then(({ ok, body }) => {
        if (!ok) {
          setInviteError(body?.error ?? 'Invitation is not valid.');
          setInvitation(null);
        } else {
          const inv = body.invitation as InvitationSummary;
          setInvitation(inv);
          acceptForm.reset({
            email: inv.email,
            fullName: inv.full_name ?? '',
            password: '',
            confirmPassword: '',
          });
        }
      })
      .catch(() => setInviteError('Could not reach the server.'))
      .finally(() => setIsLoading(false));
  }, [inviteToken, acceptForm]);

  const handleLogin = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const r = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: data.email, password: data.password }),
      });
      const body = await r.json();
      if (!r.ok) {
        loginForm.setError('password', {
          message: body?.error ?? 'Invalid email or password.',
        });
        return;
      }
      toast.success(`Welcome back, ${body.user.full_name ?? body.user.email}.`);
      const next = params.get('next') || '/dashboard';
      router.push(next);
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async (data: AcceptForm) => {
    if (data.password !== data.confirmPassword) {
      acceptForm.setError('confirmPassword', { message: 'Passwords do not match.' });
      return;
    }
    if (!inviteToken) return;
    setIsLoading(true);
    try {
      const r = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          fullName: data.fullName,
          password: data.password,
          token: inviteToken,
        }),
      });
      const body = await r.json();
      if (!r.ok) {
        toast.error(body?.error ?? 'Could not accept invitation.');
        return;
      }
      toast.success('Account created. Signing you in...');
      // Auto-login
      await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: data.email, password: data.password }),
      });
      router.push('/dashboard');
      router.refresh();
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const goToLogin = () => {
    setMode('login');
    router.replace('/sign-up-login-screen');
  };

  return (
    <div
      className="min-h-screen flex"
      style={{ background: 'linear-gradient(135deg, #0f0b05 0%, #1e1508 100%)' }}
    >
      {/* Left panel — brand */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative flex-col items-center justify-center overflow-hidden">
        <div
          className="absolute top-[-80px] right-[-80px] w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #ecd862 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-[-60px] left-[-60px] w-72 h-72 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #ddab33 0%, transparent 70%)' }}
        />

        <div className="relative z-10 flex flex-col items-center text-center max-w-md px-8">
          <div className="flex items-center gap-3 mb-8">
            <img src="/logo.png" alt="Ootlah" className="w-16 h-16 rounded-lg" />
            <span className="text-4xl font-800 text-brand-gold tracking-tight">Ootlah</span>
          </div>

          <h1 className="text-2xl font-700 text-content-primary mb-3 leading-tight">
            Project Management for Ootlah Agency
          </h1>
          <p className="text-content-secondary text-sm leading-relaxed mb-8">
            Plan campaigns, coordinate tasks across departments, and keep every client project
            moving forward — all in one place.
          </p>

          <div className="flex flex-wrap justify-center gap-2">
            {['Projects', 'Tasks', 'Team Chat', 'Approvals', 'Reporting'].map((f) => (
              <span
                key={`feat-${f}`}
                className="text-xs px-3 py-1.5 rounded-full border border-brand-gold/30 text-brand-gold bg-brand-gold/5"
              >
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10">
        <div className="lg:hidden flex items-center gap-2 mb-8">
          <img src="/logo.png" alt="Ootlah" className="w-10 h-10 rounded" />
          <span className="text-brand-gold text-lg font-700">Ootlah PM</span>
        </div>

        <div className="w-full max-w-md">
          {mode === 'login' && (
            <div className="bg-surface border border-brand-gold/10 rounded-2xl p-8 shadow-xl">
              <h2 className="text-2xl font-700 text-content-primary mb-2">Sign in to Ootlah</h2>
              <p className="text-content-secondary text-sm mb-6">
                Use the email and password your administrator set up for you.
              </p>

              <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                <div>
                  <label className="block text-sm font-600 text-content-primary mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    {...loginForm.register('email', { required: 'Email is required' })}
                    className="w-full px-4 py-2.5 rounded-lg bg-surface-dark border border-brand-gold/20 text-content-primary placeholder:text-content-muted focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold transition-colors"
                    placeholder="you@ootlah.com"
                  />
                  {loginForm.formState.errors.email && (
                    <p className="mt-1 text-xs text-brand-amber">
                      {loginForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-600 text-content-primary mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      {...loginForm.register('password', { required: 'Password is required' })}
                      className="w-full px-4 py-2.5 pr-10 rounded-lg bg-surface-dark border border-brand-gold/20 text-content-primary placeholder:text-content-muted focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold transition-colors"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-content-muted hover:text-brand-gold"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      <Icon name={showPassword ? 'EyeSlashIcon' : 'EyeIcon'} size={18} />
                    </button>
                  </div>
                  {loginForm.formState.errors.password && (
                    <p className="mt-1 text-xs text-brand-amber">
                      {loginForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 rounded-lg bg-brand-gold text-brand-navy-dark font-700 hover:bg-brand-gold-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </button>
              </form>

              <p className="mt-6 text-xs text-content-muted text-center">
                Access to Ootlah PM is invite-only.
                <br />
                Received an invitation link? Open it to create your account.
              </p>
            </div>
          )}

          {mode === 'accept_invite' && (
            <div className="bg-surface border border-brand-gold/10 rounded-2xl p-8 shadow-xl">
              <h2 className="text-2xl font-700 text-content-primary mb-2">
                Accept your invitation
              </h2>

              {isLoading && !invitation && !inviteError && (
                <p className="text-content-secondary text-sm">Checking invitation...</p>
              )}

              {inviteError && (
                <div className="rounded-lg bg-brand-amber/10 border border-brand-amber/30 text-brand-amber px-4 py-3 text-sm">
                  {inviteError}
                  <div className="mt-3">
                    <button onClick={goToLogin} className="text-brand-gold underline text-sm">
                      Back to sign in
                    </button>
                  </div>
                </div>
              )}

              {invitation && (
                <>
                  <p className="text-content-secondary text-sm mb-4">
                    You&apos;ve been invited as{' '}
                    <span className="text-brand-gold font-600">
                      {invitation.role === 'admin'
                        ? 'Admin'
                        : invitation.role === 'team_leader'
                          ? 'Team Leader'
                          : 'Agent'}
                    </span>
                    {invitation.department && (
                      <>
                        {' '}
                        in{' '}
                        <span
                          className="px-1.5 py-0.5 rounded font-600"
                          style={{
                            backgroundColor: `${invitation.department.color}25`,
                            color: invitation.department.color,
                          }}
                        >
                          {invitation.department.name}
                        </span>
                      </>
                    )}
                    {invitation.position && (
                      <>
                        {' '}
                        as <span className="text-content-primary">{invitation.position}</span>
                      </>
                    )}
                    .
                  </p>

                  <form onSubmit={acceptForm.handleSubmit(handleAccept)} className="space-y-4">
                    <div>
                      <label className="block text-sm font-600 text-content-primary mb-1.5">
                        Email
                      </label>
                      <input
                        readOnly
                        {...acceptForm.register('email')}
                        className="w-full px-4 py-2.5 rounded-lg bg-surface-dark border border-brand-gold/10 text-content-muted"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-600 text-content-primary mb-1.5">
                        Full name
                      </label>
                      <input
                        {...acceptForm.register('fullName', { required: 'Full name is required' })}
                        className="w-full px-4 py-2.5 rounded-lg bg-surface-dark border border-brand-gold/20 text-content-primary focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold"
                        placeholder="Jane Doe"
                      />
                      {acceptForm.formState.errors.fullName && (
                        <p className="mt-1 text-xs text-brand-amber">
                          {acceptForm.formState.errors.fullName.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-600 text-content-primary mb-1.5">
                        Create a password
                      </label>
                      <input
                        type="password"
                        {...acceptForm.register('password', {
                          required: 'Password is required',
                          minLength: { value: 8, message: 'Minimum 8 characters' },
                        })}
                        className="w-full px-4 py-2.5 rounded-lg bg-surface-dark border border-brand-gold/20 text-content-primary focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold"
                        placeholder="At least 8 characters"
                      />
                      {acceptForm.formState.errors.password && (
                        <p className="mt-1 text-xs text-brand-amber">
                          {acceptForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-600 text-content-primary mb-1.5">
                        Confirm password
                      </label>
                      <input
                        type="password"
                        {...acceptForm.register('confirmPassword', {
                          required: 'Please confirm your password',
                        })}
                        className="w-full px-4 py-2.5 rounded-lg bg-surface-dark border border-brand-gold/20 text-content-primary focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold"
                      />
                      {acceptForm.formState.errors.confirmPassword && (
                        <p className="mt-1 text-xs text-brand-amber">
                          {acceptForm.formState.errors.confirmPassword.message}
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-2.5 rounded-lg bg-brand-gold text-brand-navy-dark font-700 hover:bg-brand-gold-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isLoading ? 'Creating account...' : 'Create account'}
                    </button>
                  </form>

                  <p className="mt-4 text-center text-xs text-content-muted">
                    Already have an account?{' '}
                    <button onClick={goToLogin} className="text-brand-gold underline">
                      Sign in instead
                    </button>
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={null}>
      <AuthPageInner />
    </Suspense>
  );
}
