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
      (departments || []).map(async (dept) => {
        const { data: tasks } = await supabase
          .from('tasks')
          .select('id, status, assigned_to')
          .eq('department_id', dept.id);

        const totalTasks = tasks?.length || 0;
        const completedTasks = tasks?.filter(t => t.status === 'completed').length || 0;
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

      employeePerformance = await Promise.all(
        (employees || []).map(async (emp) => {
          const userId = emp.user_id;
          const { data: tasks } = await supabase
            .from('tasks')
            .select('id, status')
            .eq('assigned_to', userId)
            .eq('department_id', departmentId);

          const totalTasks = tasks?.length || 0;
          const completedTasks = tasks?.filter(t => t.status === 'completed').length || 0;
          const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

          return {
            userId,
            name: (emp.users as any)?.full_name || 'Unknown',
            avatar: (emp.users as any)?.avatar_url,
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
