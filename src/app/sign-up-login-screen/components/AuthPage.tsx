'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';

type LoginForm = { email: string; password: string };

export default function AuthPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const { register, handleSubmit, formState: { errors }, setError } = useForm<LoginForm>({
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const payload = await res.json();
      if (!res.ok) {
        setError('email', { message: payload.error || 'Sign in failed' });
        return;
      }
      toast.success(`Welcome back, ${payload.user?.full_name || payload.user?.email}.`);
      router.push('/dashboard');
    } catch {
      setError('email', { message: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#0f0b05] text-[#f0ddb0]">
      {/* Left brand panel */}
      <div
        className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative flex-col items-center justify-center overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1e1508 0%, #0f0b05 70%, #2e200e 100%)' }}
      >
        <div
          className="absolute top-[-80px] right-[-80px] w-96 h-96 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #ecd862 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-[-60px] left-[-60px] w-72 h-72 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #c3802d 0%, transparent 70%)' }}
        />

        <div className="relative z-10 flex flex-col items-center text-center max-w-md px-8">
          <img src="/logo.png" alt="Ootlah" className="h-16 mb-8" />

          <h1 className="text-3xl font-800 text-[#f0ddb0] mb-2 leading-tight">
            Ootlah Project Management
          </h1>
          <p className="text-[#c4a46b] text-sm mb-8">
            Access is by invitation only. If you do not have an invite, contact your workspace admin.
          </p>

          <div className="flex flex-wrap justify-center gap-2">
            {['Projects', 'Tasks', 'Team Chat', 'Portfolios', 'Analytics'].map((f) => (
              <span
                key={`feat-${f}`}
                className="text-xs px-3 py-1.5 rounded-full border border-[#a3671d]/40 text-[#c4a46b] bg-[#1e1508]/50"
              >
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 bg-[#0f0b05]">
        <div className="lg:hidden flex items-center gap-2 mb-8">
          <img src="/logo.png" alt="Ootlah" className="h-10" />
        </div>

        <div className="w-full max-w-md">
          <h2 className="text-2xl font-800 text-[#f0ddb0] mb-2">Sign in to Ootlah</h2>
          <p className="text-[#7a5e35] text-sm mb-8">
            Enter the email address your admin invited. Sign-ups without an invitation are rejected.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-xs font-600 text-[#c4a46b] mb-1.5">
                Work email
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@company.com"
                className={`w-full px-3.5 py-2.5 text-sm rounded-lg bg-[#1e1508] text-[#f0ddb0] placeholder-[#7a5e35] border transition-all focus:outline-none focus:ring-2 focus:ring-[#ecd862]/40 ${
                  errors.email ? 'border-[#c3802d]' : 'border-[#a3671d]/30 focus:border-[#ecd862]'
                }`}
                autoComplete="email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' },
                })}
              />
              {errors.email && (
                <p className="text-[#f2cb50] text-xs mt-1.5 flex items-center gap-1">
                  <Icon name="ExclamationCircleIcon" size={12} />
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-600 text-[#c4a46b] mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Your password"
                  autoComplete="current-password"
                  className={`w-full px-3.5 py-2.5 text-sm rounded-lg bg-[#1e1508] text-[#f0ddb0] placeholder-[#7a5e35] border transition-all focus:outline-none focus:ring-2 focus:ring-[#ecd862]/40 pr-10 ${
                    errors.password ? 'border-[#c3802d]' : 'border-[#a3671d]/30 focus:border-[#ecd862]'
                  }`}
                  {...register('password', { required: 'Password is required' })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded text-[#7a5e35] hover:text-[#ecd862]"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <Icon name={showPassword ? 'EyeSlashIcon' : 'EyeIcon'} size={16} />
                </button>
              </div>
              {errors.password && (
                <p className="text-[#f2cb50] text-xs mt-1.5">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-lg font-700 text-[#0f0b05] bg-[#ecd862] hover:bg-[#f2cb50] disabled:opacity-60 transition-colors"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-8 p-4 rounded-lg border border-[#a3671d]/30 bg-[#1e1508]">
            <p className="text-xs font-600 text-[#c4a46b] mb-1">Invited but no account yet?</p>
            <p className="text-xs text-[#7a5e35]">
              Open the invitation link your admin shared with you to finish creating your account. New sign-ups without an invitation are not allowed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
