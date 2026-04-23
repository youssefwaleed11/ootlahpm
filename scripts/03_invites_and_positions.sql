-- Migration: invite-only access, editable departments, per-department positions.
-- Safe to run multiple times (idempotent where possible).

-- ===========================================================================
-- 1. Normalize user roles to the new 3-role taxonomy (admin | team_leader | agent)
-- ===========================================================================
UPDATE users SET role = 'team_leader' WHERE role IN ('manager', 'department_head');
UPDATE users SET role = 'agent'       WHERE role IN ('team_member', 'member');

ALTER TABLE users
  ALTER COLUMN role SET DEFAULT 'agent';

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

-- Optional free-text job title that applies across departments
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS position VARCHAR(120);

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS invited_by UUID REFERENCES users(id) ON DELETE SET NULL;

-- ===========================================================================
-- 2. Department membership: per-department role + position (what this user
--    actually does inside that specific department).
-- ===========================================================================
UPDATE department_members SET role = 'team_leader' WHERE role IN ('head', 'manager');
UPDATE department_members SET role = 'agent'       WHERE role IN ('team_member', 'member');

ALTER TABLE department_members
  ALTER COLUMN role SET DEFAULT 'agent';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'department_members_role_check'
  ) THEN
    ALTER TABLE department_members
      ADD CONSTRAINT department_members_role_check
      CHECK (role IN ('admin', 'team_leader', 'agent'));
  END IF;
END$$;

-- The user's job title inside this department (e.g. "Senior SEO Analyst").
ALTER TABLE department_members
  ADD COLUMN IF NOT EXISTS position VARCHAR(120);

-- ===========================================================================
-- 3. Invitations: the ONLY way new users can join the workspace. A successful
--    signup requires a valid, pending invitation that matches the user's email.
-- ===========================================================================
CREATE TABLE IF NOT EXISTS invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(50) NOT NULL DEFAULT 'agent'
    CHECK (role IN ('admin', 'team_leader', 'agent')),
  department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
  position VARCHAR(120),
  token TEXT NOT NULL UNIQUE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'revoked', 'expired')),
  invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invitations_email
  ON invitations (lower(email));
CREATE INDEX IF NOT EXISTS idx_invitations_token
  ON invitations (token);
CREATE INDEX IF NOT EXISTS idx_invitations_status
  ON invitations (organization_id, status);

-- Only one pending invitation per email per org (case-insensitive)
CREATE UNIQUE INDEX IF NOT EXISTS idx_invitations_unique_pending
  ON invitations (organization_id, lower(email))
  WHERE status = 'pending';

ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- Only admins of the org can read/write invitations.
DROP POLICY IF EXISTS "Admins manage invitations" ON invitations;
CREATE POLICY "Admins manage invitations" ON invitations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.organization_id = invitations.organization_id
        AND users.role = 'admin'
    )
  );

-- ===========================================================================
-- 4. Ensure the "Media Buying" department exists for every organization.
-- ===========================================================================
INSERT INTO departments (organization_id, name, slug, description, color, icon)
SELECT o.id, 'Media Buying', 'media-buying',
       'Paid media strategy and ad spend optimization',
       '#c3802d', 'chart-bar'
FROM organizations o
WHERE NOT EXISTS (
  SELECT 1 FROM departments d
  WHERE d.organization_id = o.id AND d.slug = 'media-buying'
);

-- ===========================================================================
-- 5. Gold theme: migrate stored brand colors away from the legacy red default.
-- ===========================================================================
UPDATE organizations SET theme_color = '#ecd862' WHERE theme_color = '#EF4444';
UPDATE departments   SET color       = '#ecd862' WHERE color       = '#EF4444';

ALTER TABLE organizations ALTER COLUMN theme_color SET DEFAULT '#ecd862';
ALTER TABLE departments   ALTER COLUMN color       SET DEFAULT '#ecd862';
