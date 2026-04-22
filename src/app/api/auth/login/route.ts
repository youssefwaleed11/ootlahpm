import { NextRequest, NextResponse } from 'next/server';

// Demo users - in production this would be from Supabase
const DEMO_USERS: Record<string, { id: string; email: string; password: string; name: string; role: 'admin' | 'manager' | 'team_member'; department: string }> = {
  'layla@ootlah.com': {
    id: 'user-admin-001',
    email: 'layla@ootlah.com',
    password: 'Admin@2026',
    name: 'Layla Admin',
    role: 'admin',
    department: 'management',
  },
  'omar@ootlah.com': {
    id: 'user-manager-001',
    email: 'omar@ootlah.com',
    password: 'Leader@2026',
    name: 'Omar Manager',
    role: 'manager',
    department: 'marketing',
  },
  'nour@ootlah.com': {
    id: 'user-member-001',
    email: 'nour@ootlah.com',
    password: 'Agent@2026',
    name: 'Nour Team Member',
    role: 'team_member',
    department: 'seo',
  },
};

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      );
    }

    const user = DEMO_USERS[email];

    if (!user || user.password !== password) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Create mock session
    const mockSession = {
      access_token: `token-${user.id}-${Date.now()}`,
      refresh_token: `refresh-${user.id}-${Date.now()}`,
      expires_in: 3600,
      token_type: 'Bearer',
    };

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department,
      },
      session: mockSession,
    });
  } catch (error) {
    console.error('[v0] Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
