-- Ootlah Digital Marketing PM System - Seed Data Script
-- Run this AFTER running 01_create_schema.sql

-- Note: This script assumes you have created auth users first
-- The user IDs below are placeholders - replace with actual auth user IDs from Supabase

-- 1. Create Organization
INSERT INTO organizations (id, name, slug, logo_url, favicon_url, theme_color)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000'::uuid,
  'Ootlah',
  'ootlah',
  '/logo.png',
  '/favicon.ico',
  '#EF4444'
);

-- 2. Create Departments
INSERT INTO departments (organization_id, name, slug, description, color, icon)
VALUES
  ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'Marketing', 'marketing', 'Paid ads and campaigns', '#EF4444', 'target'),
  ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'SEO', 'seo', 'Search engine optimization', '#F97316', 'search'),
  ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'Content', 'content', 'Content creation and copywriting', '#EAB308', 'document'),
  ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'BD', 'bd', 'Business development', '#10B981', 'handshake'),
  ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'Designers', 'designers', 'UI/UX and graphic design', '#3B82F6', 'palette'),
  ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'Social Media', 'social-media', 'Social media management', '#8B5CF6', 'share2');

-- Get department IDs for use in the rest of the script
-- Marketing: dept_marketing_id
-- SEO: dept_seo_id
-- Content: dept_content_id
-- BD: dept_bd_id
-- Designers: dept_designers_id
-- Social Media: dept_social_id

-- 3. Create Sample Projects
-- Marketing Project
INSERT INTO projects (
  organization_id, department_id, name, slug, description, client_name, 
  status, priority, budget, created_by
)
SELECT 
  '550e8400-e29b-41d4-a716-446655440000'::uuid,
  id,
  'Q2 Marketing Campaign',
  'q2-marketing-campaign',
  'Comprehensive marketing campaign for Q2 2024',
  'Acme Corp',
  'active',
  'high',
  15000.00,
  NULL
FROM departments
WHERE slug = 'marketing'
LIMIT 1;

-- SEO Project
INSERT INTO projects (
  organization_id, department_id, name, slug, description, client_name, 
  status, priority, budget, created_by
)
SELECT 
  '550e8400-e29b-41d4-a716-446655440000'::uuid,
  id,
  'Website SEO Optimization',
  'website-seo-optimization',
  'Full website SEO optimization and ranking improvement',
  'Tech Solutions Inc',
  'active',
  'high',
  8000.00,
  NULL
FROM departments
WHERE slug = 'seo'
LIMIT 1;

-- Content Project
INSERT INTO projects (
  organization_id, department_id, name, slug, description, client_name, 
  status, priority, budget, created_by
)
SELECT 
  '550e8400-e29b-41d4-a716-446655440000'::uuid,
  id,
  'Blog Content Calendar 2024',
  'blog-content-calendar-2024',
  'Monthly blog content creation and publishing',
  'Content Agency',
  'active',
  'medium',
  5000.00,
  NULL
FROM departments
WHERE slug = 'content'
LIMIT 1;

-- 4. Create Sample Tasks
-- Task 1: Marketing
INSERT INTO tasks (
  organization_id, project_id, department_id, title, description, 
  status, priority, due_date
)
SELECT 
  '550e8400-e29b-41d4-a716-446655440000'::uuid,
  p.id,
  d.id,
  'Create Ad Copy Variations',
  'Create 5 different ad copy variations for A/B testing',
  'in_progress',
  'high',
  NOW() + INTERVAL '3 days'
FROM projects p
JOIN departments d ON p.department_id = d.id
WHERE d.slug = 'marketing'
LIMIT 1;

-- Task 2: SEO
INSERT INTO tasks (
  organization_id, project_id, department_id, title, description, 
  status, priority, due_date
)
SELECT 
  '550e8400-e29b-41d4-a716-446655440000'::uuid,
  p.id,
  d.id,
  'Keyword Research and Analysis',
  'Research and analyze target keywords for top 10 pages',
  'todo',
  'high',
  NOW() + INTERVAL '5 days'
FROM projects p
JOIN departments d ON p.department_id = d.id
WHERE d.slug = 'seo'
LIMIT 1;

-- Task 3: Content
INSERT INTO tasks (
  organization_id, project_id, department_id, title, description, 
  status, priority, due_date
)
SELECT 
  '550e8400-e29b-41d4-a716-446655440000'::uuid,
  p.id,
  d.id,
  'Write Blog Post: SEO Best Practices',
  'Write comprehensive blog post on SEO best practices - 2000 words',
  'in_progress',
  'medium',
  NOW() + INTERVAL '2 days'
FROM projects p
JOIN departments d ON p.department_id = d.id
WHERE d.slug = 'content'
LIMIT 1;

-- Task 4: Completed Task
INSERT INTO tasks (
  organization_id, project_id, department_id, title, description, 
  status, priority, due_date, completed_at
)
SELECT 
  '550e8400-e29b-41d4-a716-446655440000'::uuid,
  p.id,
  d.id,
  'Design Email Template',
  'Design responsive email template for campaign',
  'completed',
  'medium',
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '1 day'
FROM projects p
JOIN departments d ON p.department_id = d.id
WHERE d.slug = 'designers'
LIMIT 1;

-- Task 5: Critical Task
INSERT INTO tasks (
  organization_id, project_id, department_id, title, description, 
  status, priority, due_date
)
SELECT 
  '550e8400-e29b-41d4-a716-446655440000'::uuid,
  p.id,
  d.id,
  'Client Meeting - Project Kickoff',
  'Initial meeting with client to discuss project requirements',
  'todo',
  'critical',
  NOW() + INTERVAL '1 day'
FROM projects p
JOIN departments d ON p.department_id = d.id
WHERE d.slug = 'bd'
LIMIT 1;

-- 5. Create Custom Fields (Example)
INSERT INTO custom_fields (
  organization_id, department_id, name, field_type, options, is_required
)
SELECT 
  '550e8400-e29b-41d4-a716-446655440000'::uuid,
  d.id,
  'Campaign Type',
  'select',
  '{"options": ["Paid Search", "Social Ads", "Display", "Video"]}',
  true
FROM departments d
WHERE d.slug = 'marketing'
LIMIT 1;

-- 6. Create some task comments
INSERT INTO task_comments (task_id, author_id, content)
SELECT 
  t.id,
  NULL,
  'Started working on this task. Will update tomorrow with progress.'
FROM tasks t
WHERE t.title = 'Create Ad Copy Variations'
LIMIT 1;

-- Summary of what was created:
-- Organization: Ootlah
-- Departments: 6 (Marketing, SEO, Content, BD, Designers, Social Media)
-- Projects: 3 sample projects
-- Tasks: 5 sample tasks (various statuses and priorities)
-- Custom Fields: 1 example field in Marketing department
-- Comments: 1 comment on a task

-- To see all the data:
-- SELECT * FROM organizations;
-- SELECT * FROM departments WHERE organization_id = '550e8400-e29b-41d4-a716-446655440000'::uuid;
-- SELECT * FROM projects WHERE organization_id = '550e8400-e29b-41d4-a716-446655440000'::uuid;
-- SELECT * FROM tasks WHERE organization_id = '550e8400-e29b-41d4-a716-446655440000'::uuid;
