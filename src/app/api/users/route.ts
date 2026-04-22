import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerComponentClient({ cookies });
    
    // Get authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's organization
    const { data: userData } = await supabase
      .from('users')
      .select('organization_id, role')
      .eq('id', user.id)
      .single();

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Build query based on user role
    let query = supabase
      .from('users')
      .select('id, email, full_name, avatar_url, role, created_at')
      .eq('organization_id', userData.organization_id);

    // Non-admins can only see users in their departments
    if (userData.role !== 'admin') {
      const { data: departments } = await supabase
        .from('department_members')
        .select('department_id')
        .eq('user_id', user.id);

      const deptIds = departments?.map(d => d.department_id) || [];
      
      const { data: users } = await supabase
        .from('users')
        .select('id, email, full_name, avatar_url, role, created_at')
        .eq('organization_id', userData.organization_id)
        .in('id', 
          (await supabase
            .from('department_members')
            .select('user_id')
            .in('department_id', deptIds)
            .then(r => r.data?.map(d => d.user_id) || [])
          )
        );

      return NextResponse.json({ users });
    }

    const { data: users, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerComponentClient({ cookies });
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: userData } = await supabase
      .from('users')
      .select('role, organization_id')
      .eq('id', user.id)
      .single();

    if (userData?.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can create users' }, { status: 403 });
    }

    const { email, fullName, departmentId, role = 'team_member' } = await request.json();

    // Create user in auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: Math.random().toString(36).slice(-12), // Temporary password
      email_confirm: true,
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    // Create user profile
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email,
        full_name: fullName,
        organization_id: userData.organization_id,
        role,
      })
      .select()
      .single();

    if (userError) {
      await supabase.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }

    // Add to department if specified
    if (departmentId) {
      await supabase.from('department_members').insert({
        user_id: authData.user.id,
        department_id: departmentId,
        role: 'team_member',
      });
    }

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
