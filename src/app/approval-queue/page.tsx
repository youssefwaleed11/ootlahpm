'use client';

import React from 'react';
import { CURRENT_USER } from '@/lib/mockData';
import ApprovalQueueContent from './components/ApprovalQueueContent';
import { useRouter } from 'next/navigation';

export default function ApprovalQueuePage() {
  const router = useRouter();

  // Protect route - only admin and team_leader can access
  React.useEffect(() => {
    if (CURRENT_USER.role === 'agent') {
      router.push('/my-tasks');
    }
  }, [router]);

  if (CURRENT_USER.role === 'agent') {
    return null;
  }

  return <ApprovalQueueContent />;
}
