import { createClient } from './server';
import {
  Task,
  Project,
  Department,
  User,
  TaskComment,
  SavedFilter,
  TaskStatus,
  ProjectStatus,
  PriorityLevel,
} from '@/types/database';

// ============ TASKS ============

export async function getTasks(organizationId: string, filters?: {
  departmentId?: string;
  projectId?: string;
  status?: TaskStatus;
  priority?: PriorityLevel;
  assignedTo?: string;
  search?: string;
}) {
  const supabase = await createClient();
  
  let query = supabase
    .from('tasks')
    .select('*')
    .eq('organization_id', organizationId);

  if (filters?.departmentId) {
    query = query.eq('department_id', filters.departmentId);
  }
  if (filters?.projectId) {
    query = query.eq('project_id', filters.projectId);
  }
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.priority) {
    query = query.eq('priority', filters.priority);
  }
  if (filters?.assignedTo) {
    query = query.eq('assigned_to', filters.assignedTo);
  }
  if (filters?.search) {
    query = query.ilike('title', `%${filters.search}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Task[];
}

export async function getTaskById(taskId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', taskId)
    .single();

  if (error) throw error;
  return data as Task;
}

export async function createTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('tasks')
    .insert([task])
    .select()
    .single();

  if (error) throw error;
  return data as Task;
}

export async function updateTask(taskId: string, updates: Partial<Task>) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('tasks')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', taskId)
    .select()
    .single();

  if (error) throw error;
  return data as Task;
}

// ============ PROJECTS ============

export async function getProjects(organizationId: string, departmentId?: string) {
  const supabase = await createClient();
  
  let query = supabase
    .from('projects')
    .select('*')
    .eq('organization_id', organizationId);

  if (departmentId) {
    query = query.eq('department_id', departmentId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Project[];
}

export async function getProjectById(projectId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single();

  if (error) throw error;
  return data as Project;
}

export async function createProject(project: Omit<Project, 'id' | 'created_at' | 'updated_at'>) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('projects')
    .insert([project])
    .select()
    .single();

  if (error) throw error;
  return data as Project;
}

// ============ DEPARTMENTS ============

export async function getDepartments(organizationId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('departments')
    .select('*')
    .eq('organization_id', organizationId)
    .order('name');

  if (error) throw error;
  return data as Department[];
}

export async function getDepartmentWithMembers(departmentId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('departments')
    .select(`
      *,
      department_members!inner(
        user_id,
        role
      )
    `)
    .eq('id', departmentId)
    .single();

  if (error) throw error;
  return data;
}

// ============ USERS ============

export async function getUsers(organizationId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('is_active', true)
    .order('full_name');

  if (error) throw error;
  return data as User[];
}

export async function getUserById(userId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data as User;
}

export async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) throw error || new Error('No user found');
  
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (userError) throw userError;
  return userData as User;
}

// ============ TASK COMMENTS ============

export async function getTaskComments(taskId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('task_comments')
    .select('*')
    .eq('task_id', taskId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data as TaskComment[];
}

export async function createTaskComment(comment: Omit<TaskComment, 'id' | 'created_at' | 'updated_at'>) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('task_comments')
    .insert([comment])
    .select()
    .single();

  if (error) throw error;
  return data as TaskComment;
}

// ============ FILTERS ============

export async function getSavedFilters(userId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('saved_filters')
    .select('*')
    .eq('user_id', userId)
    .order('name');

  if (error) throw error;
  return data as SavedFilter[];
}

export async function createSavedFilter(filter: Omit<SavedFilter, 'id' | 'created_at' | 'updated_at'>) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('saved_filters')
    .insert([filter])
    .select()
    .single();

  if (error) throw error;
  return data as SavedFilter;
}

// ============ DASHBOARD STATS ============

export async function getDashboardStats(organizationId: string) {
  const supabase = await createClient();
  
  // Total tasks
  const { data: totalTasks, error: tasksError } = await supabase
    .from('tasks')
    .select('id', { count: 'exact' })
    .eq('organization_id', organizationId);

  // Tasks by status
  const { data: tasksByStatus, error: statusError } = await supabase
    .from('tasks')
    .select('status')
    .eq('organization_id', organizationId);

  // Overdue tasks
  const { data: overdueTasks, error: overdueError } = await supabase
    .from('tasks')
    .select('id', { count: 'exact' })
    .eq('organization_id', organizationId)
    .lt('due_date', new Date().toISOString())
    .neq('status', 'completed');

  // Tasks by department
  const { data: tasksByDept, error: deptError } = await supabase
    .from('tasks')
    .select('department_id')
    .eq('organization_id', organizationId);

  if (tasksError || statusError || overdueError || deptError) {
    throw tasksError || statusError || overdueError || deptError;
  }

  const statsByStatus = (tasksByStatus || []).reduce((acc, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statsByDept = (tasksByDept || []).reduce((acc, task) => {
    acc[task.department_id] = (acc[task.department_id] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    total_tasks: totalTasks?.length || 0,
    tasks_by_status: statsByStatus,
    overdue_tasks: overdueTasks?.length || 0,
    tasks_by_department: statsByDept,
  };
}
