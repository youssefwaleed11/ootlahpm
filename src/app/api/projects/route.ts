import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get('departmentId');

    let query = supabase
      .from('projects')
      .select('*, created_by(full_name), department:departments(name, color)');

    if (departmentId) {
      query = query.eq('department_id', departmentId);
    }

    const { data: projects, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ projects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      name, 
      description, 
      departmentId, 
      clientName, 
      budget, 
      startDate, 
      endDate,
      priority = 'medium'
    } = await request.json();

    if (!name || !departmentId) {
      return NextResponse.json(
        { error: 'Name and departmentId required' },
        { status: 400 }
      );
    }

    // Check if user is in the department or is admin
    const { data: userData } = await supabase
      .from('users')
      .select('role, organization_id')
      .eq('id', user.id)
      .single();

    if (userData?.role !== 'admin') {
      const { data: isInDept } = await supabase
        .from('department_members')
        .select('id')
        .eq('user_id', user.id)
        .eq('department_id', departmentId)
        .single();

      if (!isInDept) {
        return NextResponse.json({ error: 'No permission' }, { status: 403 });
      }
    }

    // Create slug from name
    const slug = name.toLowerCase().replace(/\s+/g, '-').slice(0, 100);

    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        name,
        slug,
        description,
        department_id: departmentId,
        client_name: clientName,
        budget: budget ? parseFloat(budget) : null,
        start_date: startDate,
        end_date: endDate,
        priority,
        created_by: user.id,
        organization_id: userData?.organization_id,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
