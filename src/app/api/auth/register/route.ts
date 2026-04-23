import { NextResponse } from 'next/server';

/**
 * Open sign-up is disabled. This workspace is invite-only: new accounts must
 * be created through an invitation flow at /api/invitations/accept.
 */
export async function POST() {
  return NextResponse.json(
    {
      error:
        'Open sign-up is disabled. Ask an admin to invite you; you will receive an invitation link to complete registration.',
    },
    { status: 403 },
  );
}
