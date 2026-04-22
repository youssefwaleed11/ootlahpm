import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerComponentClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const departmentId = searchParams.get('departmentId');
    const status = searchParams.get('status');
    const assignedTo = searchParams.get('assignedTo');

    let query = supabase
      .from('tasks')
      .select(`
        *,
        assigned_to:users!assigned_to(id, full_name, avatar_url),
        created_by:users!created_by(id, full_name),
        project:projects(name),
        department:departments(name, color)
      `);

    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    if (departmentId) {
      query = query.eq('department_id', departmentId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (assignedTo) {
      query = query.eq('assigned_to', assignedTo);
    }

    const { data: tasks, error } = await query.order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('Error fetching tasks:', error);
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

    const { 
      title,
      description,
      projectId,
      departmentId,
      assignedTo,
      priority = 'medium',
      dueDate,
      status = 'todo'
    } = await request.json();

    if (!title || !projectId || !departmentId) {
      return NextResponse.json(
        { error: 'Title, projectId, and departmentId required' },
        { status: 400 }
      );
    }

    // Get organization_id from user
    const { data: userData } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    // Create the task
    const { data: task, error } = await supabase
      .from('tasks')
      .insert({
        title,
        description,
        project_id: projectId,
        department_id: departmentId,
        assigned_to: assignedTo || null,
        priority,
        due_date: dueDate,
        status,
        created_by: user.id,
        organization_id: userData.organization_id,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Update task
export async function PATCH(request: NextRequest) {
  try {
    const supabase = createServerComponentClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('id');

    if (!taskId) {
      return NextResponse.json({ error: 'Task ID required' }, { status: 400 });
    }

    const updates = await request.json();

    // If status is being updated to 'completed', set completed_at
    if (updates.status === 'completed') {
      updates.completed_at = new Date().toISOString();
    }

    const { data: task, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
