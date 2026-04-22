import { NextRequest, NextResponse } from 'next/server';

// Demo tasks database
const DEMO_TASKS = [
  {
    id: 'task-001',
    title: 'Review Q2 Marketing Strategy',
    description: 'Review the marketing strategy for Q2 and provide feedback',
    project_id: 'proj-001',
    project: { name: 'Marketing Campaign Q2' },
    assigned_to: { id: 'user-member-001', full_name: 'Nour Team Member', avatar_url: null },
    created_by: { id: 'user-admin-001', full_name: 'Layla Admin' },
    priority: 'high',
    status: 'in_progress',
    due_date: '2026-04-25',
    department: { name: 'Marketing', color: 'blue' },
    created_at: '2026-04-22T10:00:00Z',
  },
  {
    id: 'task-002',
    title: 'Create Blog Post on SEO Best Practices',
    description: 'Write a comprehensive blog post about SEO best practices',
    project_id: 'proj-002',
    project: { name: 'Content Strategy 2024' },
    assigned_to: { id: 'user-member-001', full_name: 'Nour Team Member', avatar_url: null },
    created_by: { id: 'user-admin-001', full_name: 'Layla Admin' },
    priority: 'medium',
    status: 'todo',
    due_date: '2026-04-28',
    department: { name: 'Content', color: 'purple' },
    created_at: '2026-04-20T14:30:00Z',
  },
  {
    id: 'task-003',
    title: 'Analyze Competitor Keywords',
    description: 'Conduct competitive keyword analysis for our target market',
    project_id: 'proj-003',
    project: { name: 'SEO Optimization' },
    assigned_to: { id: 'user-manager-001', full_name: 'Omar Manager', avatar_url: null },
    created_by: { id: 'user-admin-001', full_name: 'Layla Admin' },
    priority: 'high',
    status: 'in_progress',
    due_date: '2026-04-23',
    department: { name: 'SEO', color: 'green' },
    created_at: '2026-04-19T09:15:00Z',
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const assignedTo = searchParams.get('assignedTo');

    let tasks = [...DEMO_TASKS];

    if (status) {
      tasks = tasks.filter(t => t.status === status);
    }

    if (assignedTo) {
      tasks = tasks.filter(t => t.assigned_to.id === assignedTo);
    }

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('[v0] Error fetching tasks:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const newTask = {
      id: `task-${Date.now()}`,
      ...body,
      created_at: new Date().toISOString(),
    };

    DEMO_TASKS.push(newTask);
    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error('[v0] Error creating task:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('id');

    if (!taskId) {
      return NextResponse.json({ error: 'Task ID required' }, { status: 400 });
    }

    const updates = await request.json();
    const taskIndex = DEMO_TASKS.findIndex(t => t.id === taskId);

    if (taskIndex === -1) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    DEMO_TASKS[taskIndex] = { ...DEMO_TASKS[taskIndex], ...updates };
    return NextResponse.json(DEMO_TASKS[taskIndex]);
  } catch (error) {
    console.error('[v0] Error updating task:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
