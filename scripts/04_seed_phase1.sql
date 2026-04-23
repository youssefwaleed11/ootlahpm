-- Ootlah PM - Phase 1 Seed Data
-- Run AFTER 03_migration_phase1.sql.
-- Creates the three demo users in auth.users + users + department_members.
-- Re-runnable: uses ON CONFLICT DO NOTHING where relevant.

-- ────────────────────────────────────────────────────────────────────
-- 0. Helper CTE: pick the first organization. We always scope by it.
-- ────────────────────────────────────────────────────────────────────

-- You MUST run 01_create_schema.sql + 02_seed_data.sql first so the
-- "Ootlah" organization exists. If you deleted it, re-insert manually:
--
-- INSERT INTO organizations (id, name, slug, logo_url, favicon_url, theme_color)
-- VALUES ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'Ootlah', 'ootlah',
--         '/logo.png', '/favicon.ico', '#ecd862')
-- ON CONFLICT (id) DO NOTHING;

-- ────────────────────────────────────────────────────────────────────
-- 1. Demo auth users. Passwords are bcrypt-hashed via crypt().
--    crypt()/gen_salt() come from the pgcrypto extension (enabled by default
--    on Supabase). If missing: CREATE EXTENSION IF NOT EXISTS pgcrypto;
-- ────────────────────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Admin: layla@ootlah.com / Admin@2026
INSERT INTO auth.users (
  instance_id, id, aud, role, email,
  encrypted_password, email_confirmed_at,
  created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data,
  is_super_admin, confirmation_token, email_change, email_change_token_new, recovery_token
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  '11111111-1111-1111-1111-111111111111',
  'authenticated', 'authenticated',
  'layla@ootlah.com',
  crypt('Admin@2026', gen_salt('bf')),
  NOW(), NOW(), NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Layla Hassan"}'::jsonb,
  FALSE, '', '', '', ''
) ON CONFLICT (id) DO NOTHING;

-- Team leader: omar@ootlah.com / Leader@2026
INSERT INTO auth.users (
  instance_id, id, aud, role, email,
  encrypted_password, email_confirmed_at,
  created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data,
  is_super_admin, confirmation_token, email_change, email_change_token_new, recovery_token
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  '22222222-2222-2222-2222-222222222222',
  'authenticated', 'authenticated',
  'omar@ootlah.com',
  crypt('Leader@2026', gen_salt('bf')),
  NOW(), NOW(), NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Omar Khalid"}'::jsonb,
  FALSE, '', '', '', ''
) ON CONFLICT (id) DO NOTHING;

-- Agent: nour@ootlah.com / Agent@2026
INSERT INTO auth.users (
  instance_id, id, aud, role, email,
  encrypted_password, email_confirmed_at,
  created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data,
  is_super_admin, confirmation_token, email_change, email_change_token_new, recovery_token
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  '33333333-3333-3333-3333-333333333333',
  'authenticated', 'authenticated',
  'nour@ootlah.com',
  crypt('Agent@2026', gen_salt('bf')),
  NOW(), NOW(), NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Nour Samir"}'::jsonb,
  FALSE, '', '', '', ''
) ON CONFLICT (id) DO NOTHING;

-- ────────────────────────────────────────────────────────────────────
-- 2. App user profiles
-- ────────────────────────────────────────────────────────────────────

INSERT INTO users (id, organization_id, email, full_name, role, position, is_active)
VALUES
  ('11111111-1111-1111-1111-111111111111'::uuid,
   '550e8400-e29b-41d4-a716-446655440000'::uuid,
   'layla@ootlah.com', 'Layla Hassan', 'admin', 'Managing Director', TRUE),
  ('22222222-2222-2222-2222-222222222222'::uuid,
   '550e8400-e29b-41d4-a716-446655440000'::uuid,
   'omar@ootlah.com', 'Omar Khalid', 'team_leader', 'Marketing Team Lead', TRUE),
  ('33333333-3333-3333-3333-333333333333'::uuid,
   '550e8400-e29b-41d4-a716-446655440000'::uuid,
   'nour@ootlah.com', 'Nour Samir', 'agent', 'SEO Specialist', TRUE)
ON CONFLICT (id) DO UPDATE
SET full_name = EXCLUDED.full_name,
    role      = EXCLUDED.role,
    position  = EXCLUDED.position,
    is_active = EXCLUDED.is_active;

-- ────────────────────────────────────────────────────────────────────
-- 3. Assign them to departments
-- ────────────────────────────────────────────────────────────────────

INSERT INTO department_members (user_id, department_id, role, position)
SELECT
  '22222222-2222-2222-2222-222222222222'::uuid,
  d.id, 'team_leader', 'Marketing Team Lead'
FROM departments d
WHERE d.slug = 'marketing'
ON CONFLICT (user_id, department_id) DO UPDATE
SET role = EXCLUDED.role, position = EXCLUDED.position;

INSERT INTO department_members (user_id, department_id, role, position)
SELECT
  '33333333-3333-3333-3333-333333333333'::uuid,
  d.id, 'agent', 'SEO Specialist'
FROM departments d
WHERE d.slug = 'seo'
ON CONFLICT (user_id, department_id) DO UPDATE
SET role = EXCLUDED.role, position = EXCLUDED.position;

-- Admin implicitly has access to every department via role='admin'.
