import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: String(email).toLowerCase().trim(),
      password: String(password),
    });

    if (error || !data.user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 },
      );
    }

    // Only users who have an active profile (i.e. accepted an invite) may sign
    // in. Everyone else is rejected and the Supabase session is cleared.
    const { data: profile } = await supabase
      .from('users')
      .select('id, email, full_name, avatar_url, role, organization_id, position, is_active')
      .eq('id', data.user.id)
      .maybeSingle();

    if (!profile || profile.is_active === false) {
      await supabase.auth.signOut();
      return NextResponse.json(
        { error: 'This account is not active. Ask an admin for an invitation.' },
        { status: 403 },
      );
    }

    return NextResponse.json({
      user: profile,
      session: data.session,
    });
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
