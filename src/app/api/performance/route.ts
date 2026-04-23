import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface DeptRow {
  id: string;
  name: string;
  color: string | null;
}
interface TaskSlim {
  id: string;
  status: string;
  assigned_to?: string | null;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's organization and role
    const { data: userData } = await supabase
      .from('users')
      .select('organization_id, role')
      .eq('id', user.id)
      .single();

    if (!userData || userData.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can view performance' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get('departmentId');

    // Get all departments
    const { data: departments } = await supabase
      .from('departments')
      .select('id, name, color')
      .eq('organization_id', userData.organization_id);

    // Get performance data for each department
    const performanceData = await Promise.all(
      (departments as DeptRow[] | null ?? []).map(async (dept) => {
        const { data: tasks } = await supabase
          .from('tasks')
          .select('id, status, assigned_to')
          .eq('department_id', dept.id);

        const taskList = (tasks as TaskSlim[] | null) ?? [];
        const totalTasks = taskList.length;
        const completedTasks = taskList.filter((t) => t.status === 'completed').length;
        const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        return {
          id: dept.id,
          name: dept.name,
          color: dept.color,
          totalTasks,
          completedTasks,
          completionRate,
        };
      })
    );

    // If specific department requested, get employee details
    let employeePerformance = null;

    if (departmentId) {
      const { data: employees } = await supabase
        .from('department_members')
        .select('user_id, users(id, full_name, avatar_url)')
        .eq('department_id', departmentId);

      type EmpRow = {
        user_id: string;
        users: { id: string; full_name: string | null; avatar_url: string | null } | null;
      };
      employeePerformance = await Promise.all(
        ((employees as EmpRow[] | null) ?? []).map(async (emp) => {
          const userId = emp.user_id;
          const { data: tasks } = await supabase
            .from('tasks')
            .select('id, status')
            .eq('assigned_to', userId)
            .eq('department_id', departmentId);

          const taskList = (tasks as TaskSlim[] | null) ?? [];
          const totalTasks = taskList.length;
          const completedTasks = taskList.filter((t) => t.status === 'completed').length;
          const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

          return {
            userId,
            name: emp.users?.full_name ?? 'Unknown',
            avatar: emp.users?.avatar_url ?? null,
            totalTasks,
            completedTasks,
            completionRate,
          };
        })
      );
    }

    return NextResponse.json({
      departments: performanceData,
      employeePerformance,
    });
  } catch (error) {
    console.error('Error fetching performance:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
