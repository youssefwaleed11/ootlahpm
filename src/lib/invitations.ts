import { randomBytes } from 'crypto';

export const INVITE_TTL_DAYS = 7;

export function generateInviteToken(): string {
  return randomBytes(32).toString('base64url');
}

export function inviteExpiryDate(days: number = INVITE_TTL_DAYS): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

export function buildInviteUrl(token: string, baseUrl?: string): string {
  const base =
    baseUrl ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '') ||
    '';
  const clean = base.replace(/\/$/, '');
  return `${clean}/invite/accept/${token}`;
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
