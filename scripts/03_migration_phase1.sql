-- Ootlah PM - Phase 1 Migration
-- Apply AFTER 01_create_schema.sql and 02_seed_data.sql.
-- Safe to re-run: uses IF NOT EXISTS / IF EXISTS guards where possible.

-- ────────────────────────────────────────────────────────────────────
-- 1. Role rename: manager -> team_leader, department_head -> team_leader,
--                 team_member -> agent. admin stays.
-- ────────────────────────────────────────────────────────────────────

UPDATE users SET role = 'team_leader' WHERE role IN ('manager', 'department_head');
UPDATE users SET role = 'agent' WHERE role = 'team_member';

UPDATE department_members SET role = 'team_leader' WHERE role IN ('manager', 'head');
UPDATE department_members SET role = 'agent' WHERE role = 'team_member';

-- Users table: add role check constraint if not present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_role_check'
  ) THEN
    ALTER TABLE users
      ADD CONSTRAINT users_role_check
      CHECK (role IN ('admin', 'team_leader', 'agent'));
  END IF;
END$$;

-- ────────────────────────────────────────────────────────────────────
-- 2. New columns on existing tables
-- ────────────────────────────────────────────────────────────────────

ALTER TABLE users         ADD COLUMN IF NOT EXISTS position VARCHAR(120);
ALTER TABLE users         ADD COLUMN IF NOT EXISTS preferences JSONB NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE department_members ADD COLUMN IF NOT EXISTS position VARCHAR(120);

ALTER TABLE tasks         ADD COLUMN IF NOT EXISTS approval_comment TEXT;
ALTER TABLE tasks         ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE tasks         ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
ALTER TABLE tasks         ADD COLUMN IF NOT EXISTS blocked_by UUID[] NOT NULL DEFAULT '{}';
ALTER TABLE tasks         ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE tasks         ADD COLUMN IF NOT EXISTS attachment_count INTEGER NOT NULL DEFAULT 0;

-- Task status check constraint: backlog, todo, in_progress, in_review, changes_requested, done
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'tasks_status_check'
  ) THEN
    ALTER TABLE tasks DROP CONSTRAINT tasks_status_check;
  END IF;
END$$;

UPDATE tasks SET status = 'done' WHERE status = 'completed';

ALTER TABLE tasks
  ADD CONSTRAINT tasks_status_check
  CHECK (status IN ('backlog','todo','in_progress','in_review','changes_requested','done'));

ALTER TABLE task_comments ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id) ON DELETE CASCADE;
ALTER TABLE task_comments ALTER COLUMN task_id DROP NOT NULL;

-- ────────────────────────────────────────────────────────────────────
-- 3. Invitations (invite-only signup)
-- ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin','team_leader','agent')),
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  position VARCHAR(120),
  token VARCHAR(120) UNIQUE NOT NULL,
  invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','accepted','revoked','expired')),
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invitations_token ON invitations(token);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON invitations(lower(email));
CREATE INDEX IF NOT EXISTS idx_invitations_org_status ON invitations(organization_id, status);

-- ────────────────────────────────────────────────────────────────────
-- 4. Notifications
-- ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  from_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN (
    'task_assigned','task_updated','task_approved','task_rejected','task_overdue',
    'mentioned','approval_requested','task_unblocked','project_created',
    'goal_set','comment_added','invited'
  )),
  title VARCHAR(200) NOT NULL,
  body TEXT,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user
  ON notifications(user_id, is_read, created_at DESC);

-- ────────────────────────────────────────────────────────────────────
-- 5. Personal goals
-- ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS personal_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  set_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  target_tasks INTEGER NOT NULL DEFAULT 0,
  target_period VARCHAR(20) NOT NULL DEFAULT 'month'
    CHECK (target_period IN ('week','month','quarter')),
  current_progress INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active','completed','cancelled')),
  due_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_personal_goals_user ON personal_goals(user_id, status);

-- ────────────────────────────────────────────────────────────────────
-- 6. Department resources (file library)
-- ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  file_url TEXT,
  file_type VARCHAR(80),
  file_name VARCHAR(255),
  file_size INTEGER,
  tags TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resources_department ON resources(department_id, created_at DESC);

-- ────────────────────────────────────────────────────────────────────
-- 7. Project members (project-level membership separate from department)
-- ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(30) NOT NULL DEFAULT 'member'
    CHECK (role IN ('owner','member')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_project_members_user ON project_members(user_id);

-- ────────────────────────────────────────────────────────────────────
-- 8. Add Media Buying department (7th) for every org
-- ────────────────────────────────────────────────────────────────────

INSERT INTO departments (organization_id, name, slug, description, color, icon)
SELECT o.id, 'Media Buying', 'media-buying',
       'Paid media planning and buying across channels',
       '#8B5CF6', 'chart-bar'
FROM organizations o
WHERE NOT EXISTS (
  SELECT 1 FROM departments d
  WHERE d.organization_id = o.id AND d.slug = 'media-buying'
);

-- Normalize existing department colors to the new gold palette
UPDATE departments SET color = '#ecd862' WHERE slug = 'marketing' AND color = '#EF4444';
UPDATE departments SET color = '#f2cb50' WHERE slug = 'seo'       AND color = '#EF4444';
UPDATE departments SET color = '#ddab33' WHERE slug = 'content'   AND color = '#EF4444';
UPDATE departments SET color = '#10B981' WHERE slug = 'bd'        AND color = '#EF4444';
UPDATE departments SET color = '#c3802d' WHERE slug = 'designers' AND color = '#EF4444';
UPDATE departments SET color = '#a3671d' WHERE slug = 'social-media' AND color = '#EF4444';

UPDATE organizations SET theme_color = '#ecd862' WHERE theme_color = '#EF4444';

-- ────────────────────────────────────────────────────────────────────
-- 9. Storage buckets (run once manually in Supabase Studio if not present)
-- ────────────────────────────────────────────────────────────────────
-- SELECT storage.create_bucket('avatars',           public := true);
-- SELECT storage.create_bucket('attachments',       public := true);
-- SELECT storage.create_bucket('chat-attachments',  public := true);
-- SELECT storage.create_bucket('resources',         public := true);
-- SELECT storage.create_bucket('brand',             public := true);
