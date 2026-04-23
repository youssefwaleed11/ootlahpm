'use client';
import { useEffect, useState } from 'react';
import type { User } from '@/types/database';

interface MeResponse {
  user: User | null;
  memberships?: Array<{
    department_id: string;
    role: string;
    position: string | null;
    department: { id: string; name: string; slug: string; color: string; icon: string | null };
  }>;
}

export function useCurrentUser() {
  const [state, setState] = useState<{
    user: User | null;
    memberships: MeResponse['memberships'];
    loading: boolean;
  }>({
    user: null,
    memberships: [],
    loading: true,
  });

  useEffect(() => {
    let alive = true;
    fetch('/api/auth/me', { credentials: 'include' })
      .then((r) => r.json() as Promise<MeResponse>)
      .then((data) => {
        if (!alive) return;
        setState({
          user: data.user ?? null,
          memberships: data.memberships ?? [],
          loading: false,
        });
      })
      .catch(() => {
        if (alive) setState({ user: null, memberships: [], loading: false });
      });
    return () => {
      alive = false;
    };
  }, []);

  return state;
}

export function useUnreadNotifications() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let alive = true;
    const load = () =>
      fetch('/api/notifications?unreadOnly=true&limit=1', { credentials: 'include' })
        .then((r) => r.json())
        .then((d) => {
          if (alive) setCount(Number(d.unreadCount ?? 0));
        })
        .catch(() => null);
    load();
    const i = setInterval(load, 60_000);
    return () => {
      alive = false;
      clearInterval(i);
    };
  }, []);
  return count;
}

export function usePendingApprovals() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let alive = true;
    const load = () =>
      fetch('/api/tasks?status=in_review&limit=1', { credentials: 'include' })
        .then((r) => r.json())
        .then((d) => {
          if (alive) setCount(Number(d?.pagination?.total ?? 0));
        })
        .catch(() => null);
    load();
    const i = setInterval(load, 60_000);
    return () => {
      alive = false;
      clearInterval(i);
    };
  }, []);
  return count;
}
