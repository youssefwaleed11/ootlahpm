'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import Icon from '@/components/ui/AppIcon';
import { MOCK_TEAMS } from '@/lib/mockData';
import type { UserRole } from '@/lib/mockData';

interface InviteUserModalProps {
  onClose: () => void;
}

type InviteForm = {
  email: string;
  role: UserRole;
  teamId: string;
  message: string;
};

export default function InviteUserModal({ onClose }: InviteUserModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<InviteForm>({
    defaultValues: {
      email: '',
      role: 'agent',
      teamId: MOCK_TEAMS[0].id,
      message: '',
    },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: InviteForm) => {
    setIsLoading(true);
    // BACKEND INTEGRATION: Supabase insert invite_tokens table + Resend email with invite link
    // Email contains: workspace name, inviter name, role, join link with token
    await new Promise((r) => setTimeout(r, 1200));
    setIsLoading(false);
    setSent(true);
    toast.success(`Invitation sent to ${data.email}`);
  };

  const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
    admin:
      'Full workspace access — can create projects, manage teams, invite users, and delete content',
    team_leader: 'Manages their team, creates and assigns tasks, views all team projects',
    agent: 'Views and works on assigned tasks only — cannot manage team or project settings',
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-modal w-full max-w-md slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-orange/10 flex items-center justify-center">
              <Icon name="EnvelopeIcon" size={16} className="text-brand-orange" />
            </div>
            <h2 className="text-base font-700 text-slate-800">Invite Team Member</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
          >
            <Icon name="XMarkIcon" size={18} />
          </button>
        </div>

        {sent ? (
          <div className="p-8 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center mb-4">
              <Icon name="CheckCircleIcon" size={28} className="text-emerald-600" />
            </div>
            <h3 className="text-base font-700 text-slate-800 mb-2">Invitation Sent!</h3>
            <p className="text-sm text-slate-500 mb-1">
              An email invitation has been sent with a secure join link.
            </p>
            <p className="text-xs text-slate-400 mb-6">
              The user will not be able to access OotlahPM until they click the link and complete
              registration.
            </p>
            <button
              onClick={onClose}
              className="px-5 py-2 bg-brand-orange hover:bg-brand-orange-dark text-white text-sm font-600 rounded-lg transition-all duration-150 active:scale-95"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
            {/* Admin-only notice */}
            <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <Icon
                name="ShieldCheckIcon"
                size={14}
                className="text-blue-600 flex-shrink-0 mt-0.5"
              />
              <p className="text-xs text-blue-700">
                Only users you invite can join this workspace. The invitation link expires in 48
                hours.
              </p>
            </div>

            {/* Email */}
            <div>
              <label
                className="block text-xs font-600 text-slate-700 mb-1.5"
                htmlFor="invite-email"
              >
                Email Address <span className="text-red-400">*</span>
              </label>
              <input
                id="invite-email"
                type="email"
                placeholder="colleague@company.com"
                className={`w-full px-3.5 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange transition-all duration-150 ${errors.email ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-slate-50'}`}
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' },
                })}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <Icon name="ExclamationCircleIcon" size={12} />
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Role */}
            <div>
              <label className="block text-xs font-600 text-slate-700 mb-1.5" htmlFor="invite-role">
                Role <span className="text-red-400">*</span>
              </label>
              <select
                id="invite-role"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 bg-slate-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange transition-all duration-150 cursor-pointer"
                {...register('role')}
              >
                <option value="agent">Agent</option>
                <option value="team_leader">Team Leader</option>
                <option value="admin">Admin</option>
              </select>
              <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                {ROLE_DESCRIPTIONS[selectedRole]}
              </p>
            </div>

            {/* Team */}
            <div>
              <label className="block text-xs font-600 text-slate-700 mb-1.5" htmlFor="invite-team">
                Assign to Team
              </label>
              <select
                id="invite-team"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 bg-slate-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange transition-all duration-150 cursor-pointer"
                {...register('teamId')}
              >
                {MOCK_TEAMS.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Personal message */}
            <div>
              <label className="block text-xs font-600 text-slate-700 mb-1.5" htmlFor="invite-msg">
                Personal Message <span className="text-slate-400 font-400">(optional)</span>
              </label>
              <textarea
                id="invite-msg"
                rows={2}
                placeholder="Add a note to include in the invitation email..."
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 bg-slate-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange transition-all duration-150 resize-none"
                {...register('message')}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 border border-slate-200 rounded-lg text-sm font-600 text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-2.5 bg-brand-orange hover:bg-brand-orange-dark text-white rounded-lg text-sm font-600 transition-all duration-150 active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Icon name="ArrowPathIcon" size={16} className="animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Icon name="PaperAirplaneIcon" size={15} />
                    Send Invitation
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
