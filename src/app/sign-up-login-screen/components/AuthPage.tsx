'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';

type LoginForm = { email: string; password: string; remember: boolean };
type SignupForm = { name: string; email: string; password: string; confirmPassword: string };

const DEMO_CREDENTIALS = [
  { role: 'Admin', email: 'layla@ootlah.com', password: 'Admin@2026' },
  { role: 'Team Leader', email: 'omar@ootlah.com', password: 'Leader@2026' },
  { role: 'Agent', email: 'nour@ootlah.com', password: 'Agent@2026' },
];

export default function AuthPage() {
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const loginForm = useForm<LoginForm>({ defaultValues: { email: '', password: '', remember: false } });
  const signupForm = useForm<SignupForm>({ defaultValues: { name: '', email: '', password: '', confirmPassword: '' } });

  const handleLoginSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    // BACKEND INTEGRATION: Supabase auth.signInWithPassword({ email, password })
    await new Promise(r => setTimeout(r, 1200));
    const valid = DEMO_CREDENTIALS.find(c => c.email === data.email && c.password === data.password);
    if (!valid) {
      setIsLoading(false);
      loginForm.setError('email', { message: 'Invalid credentials — use the demo accounts below to sign in' });
      return;
    }
    toast.success(`Welcome back! Signed in as ${valid.role}.`);
    router.push('/dashboard');
  };

  const handleSignupSubmit = async (data: SignupForm) => {
    if (data.password !== data.confirmPassword) {
      signupForm.setError('confirmPassword', { message: 'Passwords do not match' });
      return;
    }
    setIsLoading(true);
    // BACKEND INTEGRATION: Supabase auth.signUp() + check invite_tokens table for valid invite
    await new Promise(r => setTimeout(r, 1200));
    setIsLoading(false);
    toast.error('Sign-up requires an admin invitation. Contact your workspace admin.');
  };

  const autofillCredentials = (email: string, password: string) => {
    loginForm.setValue('email', email);
    loginForm.setValue('password', password);
    setTab('login');
    toast.info('Credentials filled — click Sign In to continue.');
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel — brand */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative flex-col items-center justify-center overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 60%, #1a3a4a 100%)' }}>
        {/* Decorative circles */}
        <div className="absolute top-[-80px] right-[-80px] w-96 h-96 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #F97316 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-60px] left-[-60px] w-72 h-72 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #0D9488 0%, transparent 70%)' }} />

        <div className="relative z-10 flex flex-col items-center text-center max-w-md px-8">
          <div className="flex items-center gap-3 mb-10">
            <AppLogo size={48} />
            <span className="text-white text-3xl font-800 tracking-tight">Ootlah</span>
          </div>

          <div className="w-full rounded-2xl overflow-hidden shadow-2xl mb-8 border border-white/10">
            <AppImage
              src="/assets/images/imgi_1_default-1776780049095.png"
              alt="OotlahPM dashboard preview showing Kanban board with task cards and team management"
              width={560}
              height={320}
              className="w-full object-cover"
            />
          </div>

          <h1 className="text-2xl font-700 text-white mb-3 leading-tight">
            Manage projects the way your team actually works
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-8">
            Kanban boards, team chat, role-based access, and real-time notifications — all in one place built for modern teams.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-2">
            {['Kanban Boards', 'Team Chat', 'Task Assignments', 'Real-time Updates', 'Role-based Access'].map(f => (
              <span key={`feat-${f}`} className="text-xs px-3 py-1.5 rounded-full border border-white/20 text-slate-300 bg-white/5">
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 bg-slate-50">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2 mb-8">
          <AppLogo size={36} />
          <span className="text-slate-800 text-xl font-700">OotlahPM</span>
        </div>

        <div className="w-full max-w-md">
          {/* Tabs */}
          <div className="flex bg-white rounded-xl border border-slate-200 p-1 mb-6 shadow-card">
            {(['login', 'signup'] as const).map(t => (
              <button
                key={`tab-${t}`}
                onClick={() => setTab(t)}
                className={`flex-1 py-2 text-sm font-600 rounded-lg transition-all duration-200 ${
                  tab === t
                    ? 'bg-brand-orange text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {t === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          {/* Login Form */}
          {tab === 'login' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-6 fade-in">
              <h2 className="text-lg font-700 text-slate-800 mb-1">Welcome back</h2>
              <p className="text-sm text-slate-500 mb-5">Sign in to your OotlahPM workspace</p>

              <form onSubmit={loginForm.handleSubmit(handleLoginSubmit)} className="space-y-4">
                <div>
                  <label className="block text-xs font-600 text-slate-700 mb-1.5" htmlFor="login-email">
                    Work Email
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    placeholder="you@company.com"
                    className={`w-full px-3.5 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange transition-all duration-150 ${loginForm.formState.errors.email ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-slate-50'}`}
                    {...loginForm.register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' } })}
                  />
                  {loginForm.formState.errors.email && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <Icon name="ExclamationCircleIcon" size={12} />
                      {loginForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-600 text-slate-700" htmlFor="login-password">Password</label>
                    <span className="text-xs text-brand-orange hover:underline cursor-pointer font-500">Forgot password?</span>
                  </div>
                  <div className="relative">
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className={`w-full px-3.5 py-2.5 pr-10 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange transition-all duration-150 ${loginForm.formState.errors.password ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-slate-50'}`}
                      {...loginForm.register('password', { required: 'Password is required', minLength: { value: 6, message: 'Minimum 6 characters' } })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <Icon name={showPassword ? 'EyeSlashIcon' : 'EyeIcon'} size={16} />
                    </button>
                  </div>
                  {loginForm.formState.errors.password && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <Icon name="ExclamationCircleIcon" size={12} />
                      {loginForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    id="remember"
                    type="checkbox"
                    className="w-3.5 h-3.5 accent-brand-orange"
                    {...loginForm.register('remember')}
                  />
                  <label htmlFor="remember" className="text-xs text-slate-600 cursor-pointer">Keep me signed in</label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 rounded-lg bg-brand-orange hover:bg-brand-orange-dark text-white text-sm font-600 transition-all duration-150 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Icon name="ArrowPathIcon" size={16} className="animate-spin" />
                      Signing in...
                    </>
                  ) : 'Sign In'}
                </button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-xs text-slate-400">or continue with</span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              {/* Social */}
              <div className="grid grid-cols-2 gap-2">
                {[{ label: 'Google', icon: 'GlobeAltIcon' }, { label: 'GitHub', icon: 'CodeBracketIcon' }].map(s => (
                  <button
                    key={`social-${s.label}`}
                    className="flex items-center justify-center gap-2 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 font-500 hover:bg-slate-50 hover:border-slate-300 transition-all duration-150"
                    onClick={() => toast.info(`${s.label} OAuth — connect Supabase OAuth provider`)}
                  >
                    <Icon name={s.icon as Parameters<typeof Icon>[0]['name']} size={16} />
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Signup Form */}
          {tab === 'signup' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-6 fade-in">
              <h2 className="text-lg font-700 text-slate-800 mb-1">Create your account</h2>
              <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                <Icon name="ShieldExclamationIcon" size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 leading-relaxed">
                  <strong>Invite-only access.</strong> You must be invited by a workspace admin before you can create an account. Check your email for an invitation link.
                </p>
              </div>

              <form onSubmit={signupForm.handleSubmit(handleSignupSubmit)} className="space-y-4">
                <div>
                  <label className="block text-xs font-600 text-slate-700 mb-1.5" htmlFor="signup-name">Full Name</label>
                  <input
                    id="signup-name"
                    type="text"
                    placeholder="Layla Al-Rashidi"
                    className={`w-full px-3.5 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange transition-all duration-150 ${signupForm.formState.errors.name ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-slate-50'}`}
                    {...signupForm.register('name', { required: 'Full name is required', minLength: { value: 2, message: 'Name must be at least 2 characters' } })}
                  />
                  {signupForm.formState.errors.name && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <Icon name="ExclamationCircleIcon" size={12} />
                      {signupForm.formState.errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-600 text-slate-700 mb-1.5" htmlFor="signup-email">Work Email</label>
                  <p className="text-[11px] text-slate-400 mb-1.5">Must match the email your admin used to invite you</p>
                  <input
                    id="signup-email"
                    type="email"
                    placeholder="you@company.com"
                    className={`w-full px-3.5 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange transition-all duration-150 ${signupForm.formState.errors.email ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-slate-50'}`}
                    {...signupForm.register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' } })}
                  />
                  {signupForm.formState.errors.email && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <Icon name="ExclamationCircleIcon" size={12} />
                      {signupForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-600 text-slate-700 mb-1.5" htmlFor="signup-password">Password</label>
                  <div className="relative">
                    <input
                      id="signup-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Min. 8 characters"
                      className={`w-full px-3.5 py-2.5 pr-10 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange transition-all duration-150 ${signupForm.formState.errors.password ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-slate-50'}`}
                      {...signupForm.register('password', { required: 'Password is required', minLength: { value: 8, message: 'Minimum 8 characters' } })}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                      <Icon name={showPassword ? 'EyeSlashIcon' : 'EyeIcon'} size={16} />
                    </button>
                  </div>
                  {signupForm.formState.errors.password && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <Icon name="ExclamationCircleIcon" size={12} />
                      {signupForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-600 text-slate-700 mb-1.5" htmlFor="signup-confirm">Confirm Password</label>
                  <div className="relative">
                    <input
                      id="signup-confirm"
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="Re-enter your password"
                      className={`w-full px-3.5 py-2.5 pr-10 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange transition-all duration-150 ${signupForm.formState.errors.confirmPassword ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-slate-50'}`}
                      {...signupForm.register('confirmPassword', { required: 'Please confirm your password' })}
                    />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                      <Icon name={showConfirm ? 'EyeSlashIcon' : 'EyeIcon'} size={16} />
                    </button>
                  </div>
                  {signupForm.formState.errors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <Icon name="ExclamationCircleIcon" size={12} />
                      {signupForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 rounded-lg bg-brand-orange hover:bg-brand-orange-dark text-white text-sm font-600 transition-all duration-150 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <><Icon name="ArrowPathIcon" size={16} className="animate-spin" />Creating account...</>
                  ) : 'Create Account'}
                </button>
              </form>

              <p className="text-[11px] text-slate-400 text-center mt-4">
                By creating an account you agree to our{' '}
                <span className="text-brand-orange hover:underline cursor-pointer">Terms of Service</span>
                {' '}and{' '}
                <span className="text-brand-orange hover:underline cursor-pointer">Privacy Policy</span>
              </p>
            </div>
          )}

          {/* Demo Credentials */}
          <div className="mt-4 bg-white rounded-xl border border-slate-200 shadow-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Icon name="KeyIcon" size={14} className="text-brand-orange" />
              <span className="text-xs font-600 text-slate-700">Demo Credentials</span>
              <span className="text-[10px] text-slate-400 ml-auto">Click to autofill</span>
            </div>
            <div className="space-y-1.5">
              {DEMO_CREDENTIALS.map(cred => (
                <div
                  key={`cred-${cred.role}`}
                  onClick={() => autofillCredentials(cred.email, cred.password)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-50 hover:bg-orange-50 border border-transparent hover:border-brand-orange/30 cursor-pointer transition-all duration-150 group"
                >
                  <span className={`text-[10px] font-700 px-2 py-0.5 rounded-full ${
                    cred.role === 'Admin' ? 'bg-red-100 text-red-600' :
                    cred.role === 'Team Leader'? 'bg-brand-teal/10 text-brand-teal' : 'bg-slate-200 text-slate-600'
                  }`}>{cred.role}</span>
                  <span className="text-xs text-slate-600 flex-1 font-mono">{cred.email}</span>
                  <Icon name="ArrowRightCircleIcon" size={14} className="text-slate-300 group-hover:text-brand-orange transition-colors" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
