// Database types for Ootlah PM System

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  favicon_url: string | null;
  theme_color: string;
  created_at: string;
  updated_at: string;
}

export interface Department {
  id: string;
  organization_id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string;
  icon: string | null;
  created_at: string;
  updated_at: string;
}

export type UserRole = 'admin' | 'team_leader' | 'agent';
export type ThemePreference = 'light' | 'dark' | 'auto';

export interface User {
  id: string;
  organization_id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  position: string | null;
  is_active: boolean;
  last_login: string | null;
  theme_preference: ThemePreference;
  invited_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface DepartmentMember {
  id: string;
  user_id: string;
  department_id: string;
  role: UserRole;
  position: string | null;
  joined_at: string;
}

export type InvitationStatus = 'pending' | 'accepted' | 'revoked' | 'expired';

export interface Invitation {
  id: string;
  organization_id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  department_id: string | null;
  position: string | null;
  token: string;
  status: InvitationStatus;
  invited_by: string | null;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
}

export type ProjectStatus = 'active' | 'completed' | 'on_hold' | 'archived';
export type PriorityLevel = 'low' | 'medium' | 'high' | 'critical';

export interface Project {
  id: string;
  organization_id: string;
  department_id: string;
  name: string;
  slug: string;
  description: string | null;
  client_name: string | null;
  status: ProjectStatus;
  priority: PriorityLevel;
  start_date: string | null;
  end_date: string | null;
  budget: number | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'completed';

export interface Task {
  id: string;
  organization_id: string;
  project_id: string;
  department_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: PriorityLevel;
  assigned_to: string | null;
  created_by: string | null;
  start_date: string | null;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskComment {
  id: string;
  task_id: string;
  author_id: string;
  content: string;
  mentions: string[];
  created_at: string;
  updated_at: string;
}

export interface Attachment {
  id: string;
  task_id: string | null;
  comment_id: string | null;
  file_name: string;
  file_url: string;
  file_type: string | null;
  file_size: number | null;
  uploaded_by: string;
  created_at: string;
}

export type CustomFieldType = 'text' | 'number' | 'select' | 'multi_select' | 'date' | 'checkbox';

export interface CustomField {
  id: string;
  organization_id: string;
  department_id: string | null;
  name: string;
  field_type: CustomFieldType;
  options: Record<string, unknown> | null;
  is_required: boolean;
  display_order: number | null;
  created_at: string;
  updated_at: string;
}

export interface TaskCustomFieldValue {
  id: string;
  task_id: string;
  custom_field_id: string;
  value: unknown;
  created_at: string;
  updated_at: string;
}

export interface SavedFilter {
  id: string;
  user_id: string;
  name: string;
  filters: Record<string, unknown>;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  organization_id: string;
  user_id: string | null;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  changes: Record<string, unknown> | null;
  created_at: string;
}

// Extended types for UI
export interface TaskWithDetails extends Task {
  assignee?: User;
  creator?: User;
  project?: Project;
  department?: Department;
  comments?: TaskComment[];
  attachments?: Attachment[];
}

export interface ProjectWithDepartment extends Project {
  department?: Department;
  tasks_count?: number;
  completed_tasks_count?: number;
}
