# Backend API Guide - Ootlah PM 2026

Complete guide to all backend APIs and how to integrate them with your frontend.

## Table of Contents
1. [Authentication APIs](#authentication-apis)
2. [User Management APIs](#user-management-apis)
3. [Project Management APIs](#project-management-apis)
4. [Task Management APIs](#task-management-apis)
5. [Performance & Dashboard APIs](#performance--dashboard-apis)
6. [Comments & Chat APIs](#comments--chat-apis)
7. [Custom Hooks](#custom-hooks)
8. [Error Handling](#error-handling)

---

## Authentication APIs

### POST /api/auth/login
Login user with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "team_member",
    "organization_id": "uuid",
    "avatar_url": "url"
  },
  "session": {
    "access_token": "token",
    "refresh_token": "token"
  }
}
```

**Error (401):**
```json
{ "error": "Invalid credentials" }
```

### POST /api/auth/register
Register a new user (for admin use typically).

**Request:**
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "fullName": "Jane Smith",
  "organizationId": "uuid",
  "departmentId": "uuid",
  "role": "team_member"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "email": "newuser@example.com",
  "full_name": "Jane Smith",
  "role": "team_member"
}
```

---

## User Management APIs

### GET /api/users
List all users in organization (or department for non-admins).

**Query Parameters:**
- None required (returns org users if admin, dept users if team member)

**Response (200):**
```json
{
  "users": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "full_name": "John Doe",
      "avatar_url": "url",
      "role": "team_member",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

**Error (401):**
```json
{ "error": "Unauthorized" }
```

### POST /api/users
Create a new user (admin only).

**Request:**
```json
{
  "email": "newuser@example.com",
  "fullName": "New User",
  "departmentId": "uuid",
  "role": "team_member"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "email": "newuser@example.com",
  "full_name": "New User",
  "role": "team_member"
}
```

**Error (403):**
```json
{ "error": "Only admins can create users" }
```

---

## Project Management APIs

### GET /api/projects
List all projects.

**Query Parameters:**
- `departmentId` (optional) - Filter by department

**Example:**
```
GET /api/projects?departmentId=dept-123
```

**Response (200):**
```json
{
  "projects": [
    {
      "id": "uuid",
      "name": "Marketing Campaign Q2",
      "slug": "marketing-campaign-q2",
      "description": "Q2 marketing campaign",
      "client_name": "Client A",
      "status": "active",
      "priority": "high",
      "budget": 5000.00,
      "start_date": "2024-01-01",
      "end_date": "2024-03-31",
      "created_by": { "full_name": "Admin" },
      "department": { "name": "Marketing", "color": "#EF4444" }
    }
  ]
}
```

### POST /api/projects
Create a new project.

**Request:**
```json
{
  "name": "New Project",
  "description": "Project description",
  "departmentId": "uuid",
  "clientName": "Client Name",
  "budget": 5000,
  "startDate": "2024-01-01",
  "endDate": "2024-03-31",
  "priority": "high"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "name": "New Project",
  "slug": "new-project",
  "description": "Project description",
  "department_id": "uuid",
  "client_name": "Client Name",
  "status": "active",
  "priority": "high",
  "budget": 5000.00
}
```

---

## Task Management APIs

### GET /api/tasks
List all tasks with filtering options.

**Query Parameters:**
- `projectId` (optional)
- `departmentId` (optional)
- `status` (optional) - todo, in_progress, in_review, completed
- `assignedTo` (optional) - User ID

**Examples:**
```
GET /api/tasks?projectId=proj-123
GET /api/tasks?departmentId=dept-123&status=completed
GET /api/tasks?assignedTo=user-123
```

**Response (200):**
```json
{
  "tasks": [
    {
      "id": "uuid",
      "title": "Create Blog Post",
      "description": "Write a blog post about...",
      "status": "in_progress",
      "priority": "high",
      "project": { "name": "Content Strategy 2024" },
      "department": { "name": "Content", "color": "#EAB308" },
      "assigned_to": {
        "id": "uuid",
        "full_name": "John Doe",
        "avatar_url": "url"
      },
      "due_date": "2024-04-28",
      "created_at": "2024-04-20T10:00:00Z"
    }
  ]
}
```

### POST /api/tasks
Create a new task.

**Request:**
```json
{
  "title": "Create Blog Post",
  "description": "Write a blog post about...",
  "projectId": "uuid",
  "departmentId": "uuid",
  "assignedTo": "uuid",
  "priority": "high",
  "dueDate": "2024-04-28",
  "status": "todo"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "title": "Create Blog Post",
  "description": "...",
  "status": "todo",
  "priority": "high",
  "assigned_to": "uuid",
  "due_date": "2024-04-28"
}
```

### PATCH /api/tasks?id={taskId}
Update a task.

**Query Parameters:**
- `id` (required) - Task ID

**Request:**
```json
{
  "status": "completed",
  "priority": "medium"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "status": "completed",
  "priority": "medium",
  "completed_at": "2024-04-20T15:30:00Z"
}
```

---

## Performance & Dashboard APIs

### GET /api/performance
Get department and employee performance metrics (admin only).

**Query Parameters:**
- `departmentId` (optional) - If provided, returns employee performance

**Examples:**
```
GET /api/performance
GET /api/performance?departmentId=dept-123
```

**Response (200) - Department Level:**
```json
{
  "departments": [
    {
      "id": "uuid",
      "name": "Marketing",
      "color": "#EF4444",
      "totalTasks": 28,
      "completedTasks": 26,
      "completionRate": 93
    }
  ],
  "employeePerformance": null
}
```

**Response (200) - Employee Level:**
```json
{
  "departments": [...],
  "employeePerformance": [
    {
      "userId": "uuid",
      "name": "John Doe",
      "avatar": "url",
      "totalTasks": 8,
      "completedTasks": 6,
      "completionRate": 75
    }
  ]
}
```

---

## Comments & Chat APIs

### GET /api/comments
Get all comments for a task.

**Query Parameters:**
- `taskId` (required) - Task ID

**Example:**
```
GET /api/comments?taskId=task-123
```

**Response (200):**
```json
{
  "comments": [
    {
      "id": "uuid",
      "task_id": "uuid",
      "content": "This looks great!",
      "mentions": ["user-123"],
      "author": {
        "id": "uuid",
        "full_name": "Jane Smith",
        "avatar_url": "url"
      },
      "attachments": [
        {
          "id": "uuid",
          "file_name": "design.png",
          "file_url": "https://...",
          "file_type": "image/png",
          "file_size": 1024
        }
      ],
      "created_at": "2024-04-20T10:00:00Z"
    }
  ]
}
```

### POST /api/comments
Add a comment to a task.

**Request:**
```json
{
  "taskId": "uuid",
  "content": "Great work! @user-123 can you review?",
  "mentions": ["user-123"]
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "task_id": "uuid",
  "content": "Great work! @user-123 can you review?",
  "mentions": ["user-123"],
  "author": { "id": "uuid", "full_name": "Current User" },
  "created_at": "2024-04-20T10:00:00Z"
}
```

---

## Custom Hooks

Use these React hooks for easy API integration:

### useTasks(options?)

**Usage:**
```tsx
import { useTasks } from '@/hooks/useTasks';

function MyComponent() {
  const { 
    tasks, 
    isLoading, 
    error, 
    refetch, 
    createTask, 
    updateTask 
  } = useTasks({
    projectId: 'proj-123',
    status: 'completed'
  });

  // Create task
  const handleCreate = async () => {
    await createTask({
      title: 'New Task',
      projectId: 'proj-123',
      departmentId: 'dept-123'
    });
  };

  // Update task
  const handleUpdate = async (taskId) => {
    await updateTask(taskId, { status: 'completed' });
  };

  return (
    <div>
      {isLoading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {tasks.map(task => (
        <div key={task.id}>{task.title}</div>
      ))}
    </div>
  );
}
```

### useProjects(departmentId?)

**Usage:**
```tsx
import { useProjects } from '@/hooks/useProjects';

function ProjectList() {
  const { 
    projects, 
    isLoading, 
    error, 
    createProject 
  } = useProjects('dept-123');

  return (
    <div>
      {projects.map(project => (
        <div key={project.id}>{project.name}</div>
      ))}
    </div>
  );
}
```

### useComments(taskId)

**Usage:**
```tsx
import { useComments } from '@/hooks/useComments';

function TaskComments({ taskId }) {
  const { 
    comments, 
    isLoading, 
    addComment 
  } = useComments(taskId);

  const handleAddComment = async () => {
    await addComment('Great job!', ['user-123']);
  };

  return (
    <div>
      {comments.map(comment => (
        <div key={comment.id}>{comment.content}</div>
      ))}
      <button onClick={handleAddComment}>Add Comment</button>
    </div>
  );
}
```

---

## Error Handling

All APIs return errors in this format:

**Error Response:**
```json
{
  "error": "Description of what went wrong"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (missing fields)
- `401` - Unauthorized (not logged in)
- `403` - Forbidden (no permission)
- `404` - Not Found
- `500` - Internal Server Error

**Example Error Handling:**
```tsx
try {
  const res = await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(taskData)
  });

  const data = await res.json();

  if (!res.ok) {
    console.error('Error:', data.error);
    return;
  }

  console.log('Success:', data);
} catch (error) {
  console.error('Network error:', error);
}
```

---

## Next Steps

1. **Environment Variables**: Make sure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set
2. **Database**: Run `scripts/01_create_schema.sql` in Supabase SQL Editor
3. **Demo Data**: Run `scripts/02_seed_data.sql` for test data
4. **Integration**: Use the custom hooks in your components
5. **Testing**: Test each API endpoint with the provided curl examples

---

## Demo Credentials

```
Admin User:
Email: layla@ootlah.com
Password: Admin@2026

Regular User:
Email: nour@ootlah.com
Password: Agent@2026
```

Use these to test the full flow in your application.
