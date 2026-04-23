'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import Icon from '@/components/ui/AppIcon';

interface Invitation {
  email: string;
  full_name: string | null;
  role: 'admin' | 'team_leader' | 'agent';
  position: string | null;
  status: string;
  expires_at: string;
  organization: { name: string } | null;
  department: { id: string; name: string } | null;
}

type AcceptForm = {
  fullName: string;
  password: string;
  confirmPassword: string;
};

export default function AcceptInvitePage() {
  const params = useParams<{ token: string }>();
  const token = params?.token;
  const router = useRouter();

  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
    setError: setFormError,
  } = useForm<AcceptForm>({
    defaultValues: { fullName: '', password: '', confirmPassword: '' },
  });

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/invitations/validate?token=${encodeURIComponent(token)}`);
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setError(data.error || 'Invalid invitation');
          return;
        }
        setInvitation(data.invitation);
        if (data.invitation?.full_name) setValue('fullName', data.invitation.full_name);
      } catch {
        if (!cancelled) setError('Could not load invitation.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, setValue]);

  const onSubmit = async (data: AcceptForm) => {
    if (!token) return;
    if (data.password !== data.confirmPassword) {
      setFormError('confirmPassword', { message: 'Passwords do not match' });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/invitations/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: data.password, fullName: data.fullName }),
      });
      const payload = await res.json();
      if (!res.ok) {
        setFormError('password', { message: payload.error || 'Could not create account' });
        return;
      }
      toast.success('Welcome to Ootlah. Redirecting...');
      router.push(payload.redirect_to || '/dashboard');
    } catch {
      setFormError('password', { message: 'Network error. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const confirmPassword = watch('confirmPassword');
  const password = watch('password');

  return (
    <div className="min-h-screen bg-[#0f0b05] text-[#f0ddb0] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-8">
          <img src="/logo.png" alt="Ootlah" className="h-10" />
          <span className="text-lg font-700">Ootlah PM</span>
        </div>

        {loading && (
          <div className="p-6 rounded-xl border border-[#a3671d]/30 bg-[#1e1508]">
            <p className="text-sm text-[#c4a46b]">Loading invitation...</p>
          </div>
        )}

        {!loading && error && (
          <div className="p-6 rounded-xl border border-[#c3802d]/60 bg-[#1e1508]">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="ExclamationCircleIcon" size={18} className="text-[#f2cb50]" />
              <h2 className="text-base font-700">Invitation unavailable</h2>
            </div>
            <p className="text-sm text-[#c4a46b]">{error}</p>
            <a
              href="/sign-up-login-screen"
              className="inline-block mt-4 text-sm font-600 text-[#ecd862] hover:underline"
            >
              Back to sign in
            </a>
          </div>
        )}

        {!loading && invitation && (
          <div className="p-6 rounded-xl border border-[#a3671d]/30 bg-[#1e1508] space-y-5">
            <div>
              <h1 className="text-2xl font-800 mb-1">Accept your invitation</h1>
              <p className="text-sm text-[#c4a46b]">
                You&apos;ve been invited to join{' '}
                <strong className="text-[#ecd862]">
                  {invitation.organization?.name || 'Ootlah'}
                </strong>
                {invitation.department && (
                  <>
                    {' as '}
                    <strong className="text-[#ecd862]">
                      {invitation.position || invitation.role.replace('_', ' ')}
                    </strong>
                    {' in '}
                    <strong className="text-[#ecd862]">{invitation.department.name}</strong>
                  </>
                )}
                .
              </p>
            </div>

            <div className="p-3 rounded-lg bg-[#2e200e] border border-[#a3671d]/30 text-xs text-[#c4a46b]">
              Signing in as <strong className="text-[#f0ddb0]">{invitation.email}</strong>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label htmlFor="fullName" className="block text-xs font-600 text-[#c4a46b] mb-1.5">
                  Full name
                </label>
                <input
                  id="fullName"
                  type="text"
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg bg-[#0f0b05] border border-[#a3671d]/30 focus:border-[#ecd862] focus:ring-2 focus:ring-[#ecd862]/40 focus:outline-none"
                  {...register('fullName', { required: 'Full name is required' })}
                />
                {errors.fullName && (
                  <p className="text-[#f2cb50] text-xs mt-1">{errors.fullName.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-xs font-600 text-[#c4a46b] mb-1.5">
                  Create password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg bg-[#0f0b05] border border-[#a3671d]/30 focus:border-[#ecd862] focus:ring-2 focus:ring-[#ecd862]/40 focus:outline-none"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 8, message: 'At least 8 characters' },
                  })}
                />
                {errors.password && (
                  <p className="text-[#f2cb50] text-xs mt-1">{errors.password.message}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-xs font-600 text-[#c4a46b] mb-1.5"
                >
                  Confirm password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg bg-[#0f0b05] border border-[#a3671d]/30 focus:border-[#ecd862] focus:ring-2 focus:ring-[#ecd862]/40 focus:outline-none"
                  {...register('confirmPassword', { required: 'Please confirm your password' })}
                />
                {errors.confirmPassword && (
                  <p className="text-[#f2cb50] text-xs mt-1">{errors.confirmPassword.message}</p>
                )}
                {!errors.confirmPassword && confirmPassword && confirmPassword !== password && (
                  <p className="text-[#f2cb50] text-xs mt-1">Passwords do not match yet.</p>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 rounded-lg font-700 text-[#0f0b05] bg-[#ecd862] hover:bg-[#f2cb50] disabled:opacity-60 transition-colors"
              >
                {submitting ? 'Creating account...' : 'Accept invitation and sign in'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
