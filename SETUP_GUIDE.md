# Ootlah PM 2026 - Setup & Deployment Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (Already installed in v0)
- Supabase account (free tier available at supabase.com)
- GitHub account for deployment

### Installation

1. **Clone the repository** (if deploying elsewhere):
```bash
git clone https://github.com/youssefwaleed11/ootlahpm.git
cd ootlahpm
pnpm install
```

2. **Setup Supabase Database**:
   - Create a new Supabase project at https://supabase.com
   - Go to SQL Editor and run the migration script:
   - Copy contents from `scripts/01_create_schema.sql`
   - Paste and execute in Supabase SQL Editor
   - This creates all 12 tables with RLS policies

3. **Configure Environment Variables**:
   - In v0: Settings → Vars → Add these keys:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
   - Get these from Supabase Project Settings → API

4. **Seed Initial Data** (Optional but recommended):
   - Default organizations, departments, and demo users are configured
   - You can add real users through the admin panel

5. **Start Development**:
```bash
pnpm dev
```
Server runs on http://localhost:4028

## 📊 Database Setup Details

### Running the SQL Schema

**In Supabase:**
1. Navigate to SQL Editor
2. Click "New Query"
3. Copy entire contents of `scripts/01_create_schema.sql`
4. Click "Run"
5. Verify all tables are created in the Table Editor

### What Gets Created
- 12 PostgreSQL tables with proper relationships
- Row Level Security (RLS) policies for data protection
- 14 performance indexes
- Audit logging table for compliance

### Initial Data

Add demo data through:
- Admin Users panel (`/admin/users`)
- Department Settings (`/admin/departments`)

Or directly in Supabase:
```sql
INSERT INTO organizations (name, slug, theme_color) 
VALUES ('Ootlah Agency', 'ootlah', '#EF4444');

INSERT INTO departments (organization_id, name, slug, color)
SELECT id, 'Marketing', 'marketing', '#EF4444' 
FROM organizations WHERE slug = 'ootlah';
```

## 🔑 Authentication Setup

### Supabase Auth

1. **Enable Email Authentication**:
   - Supabase → Project → Authentication → Providers
   - Email provider is enabled by default

2. **Create First Admin User**:
   - Go to `/sign-up-login-screen` in your app
   - Use demo credentials or create new
   - Assign admin role in Supabase

3. **Invite Team Members**:
   - Use `/admin/users` → "Add User"
   - Set role and department
   - User receives invitation email

### Environment Setup for Auth
```bash
# Add to .env.local
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 📱 Feature Configuration

### Departments Setup

Go to `/admin/departments` and configure:

1. **Marketing**
   - Color: #EF4444 (Red)
   - Budget: $45,000/month
   - Members: 4

2. **SEO**
   - Color: #F97316 (Orange)
   - Budget: $32,000/month
   - Members: 3

3. **Content**
   - Color: #EAB308 (Yellow)
   - Budget: $28,000/month
   - Members: 5

4. **BD (Business Development)**
   - Color: #10B981 (Green)
   - Budget: $20,000/month
   - Members: 2

5. **Designers**
   - Color: #3B82F6 (Blue)
   - Budget: $25,000/month
   - Members: 3

6. **Social Media**
   - Color: #8B5CF6 (Purple)
   - Budget: $15,000/month
   - Members: 2

### Custom Fields

Create custom fields via `/admin/departments`:

Example fields to add:
- **Client Type** (Select): Direct, Agency, Internal
- **ROI Target** (Number): For marketing projects
- **Campaign Duration** (Select): Q1, Q2, Q3, Q4
- **Budget Spent** (Number): Track spending

## 🏗️ Project Structure

```
ootlahpm/
├── public/
│   ├── logo.png (Your Ootlah logo)
│   └── favicon.ico
├── scripts/
│   └── 01_create_schema.sql (Database setup)
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── dashboard/ (Main dashboard)
│   │   ├── portfolios/ (Project portfolios)
│   │   ├── reporting/ (Analytics)
│   │   ├── my-tasks/ (Personal tasks)
│   │   ├── my-projects/ (User projects)
│   │   ├── settings/ (User settings)
│   │   ├── admin/ (Admin pages)
│   │   │   ├── users/ (User management)
│   │   │   └── departments/ (Department settings)
│   │   └── sign-up-login-screen/ (Auth)
│   ├── components/
│   │   ├── Sidebar.tsx (Navigation)
│   │   ├── AppLayout.tsx (Main layout)
│   │   ├── TaskDetailPanel.tsx (Task chat)
│   │   ├── AdvancedFilters.tsx (Filtering)
│   │   └── ui/ (Reusable components)
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   ├── server.ts
│   │   │   └── queries.ts
│   │   ├── mockData.ts
│   │   └── types/
│   │       └── database.ts
│   └── styles/
├── tailwind.config.js
├── package.json
├── IMPLEMENTATION_SUMMARY.md
├── SETUP_GUIDE.md (this file)
└── README.md
```

## 🔐 Security & RLS Policies

### What Gets Protected

RLS policies automatically enforce:

1. **Organization Isolation**
   - Users can only see their organization's data
   - Cross-org data access is blocked

2. **Department Access**
   - Users see only their department's projects
   - Admins see all departments

3. **Project & Task Access**
   - Users see tasks assigned to them
   - Users see projects in their departments
   - Only creators can delete

4. **Comment Access**
   - Only users in project department can see comments
   - Task assignee can always see

### Testing RLS

In Supabase SQL Editor:
```sql
-- Check RLS policies
SELECT * FROM pg_policies 
WHERE tablename = 'tasks';

-- Verify enforcement
SELECT * FROM tasks 
WHERE organization_id = (SELECT id FROM organizations LIMIT 1);
```

## 🌐 Deployment

### Deploy to Vercel

1. **Push to GitHub**:
```bash
git push origin main
```

2. **In v0**:
   - Top-right → "Publish" button
   - Or go to Settings → GitHub → Connect

3. **In Vercel Console**:
   - Import repository
   - Set environment variables
   - Deploy

### Environment Variables for Production
```
NEXT_PUBLIC_SUPABASE_URL=your-production-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-key
```

## 📋 Usage Guide

### For Admin Users

1. **User Management** (`/admin/users`):
   - Add new team members
   - Assign roles (Admin, Manager, Department Head, Team Member)
   - Manage permissions
   - Deactivate inactive users

2. **Department Settings** (`/admin/departments`):
   - Configure department details
   - Set budgets
   - Manage custom fields
   - Assign department members

### For Team Members

1. **Dashboard** (`/dashboard`):
   - View company-wide statistics
   - See department performance
   - Monitor task completion rates

2. **My Tasks** (`/my-tasks`):
   - See assigned tasks
   - Filter by priority/status
   - Mark tasks complete
   - Add comments with @mentions

3. **My Projects** (`/my-projects`):
   - View projects you're part of
   - Track progress
   - See team members

4. **Portfolios** (`/portfolios`):
   - View completed projects by department
   - Showcase work to clients
   - Filter by department

5. **Reporting** (`/reporting`):
   - Financial metrics
   - Department performance
   - Revenue tracking
   - Time-based analytics

### For Department Heads

Everything team members can do, PLUS:

1. **Department Management**:
   - View department-specific dashboard
   - Manage department budget
   - Assign tasks within department

2. **Team Reporting**:
   - See detailed team metrics
   - Track individual productivity
   - Monitor project profitability

## 🐛 Troubleshooting

### Database Connection Issues

**Problem**: "Connection refused" error
- **Solution**: Verify Supabase URL and keys in environment variables
- Check Supabase status at status.supabase.com

**Problem**: RLS policy errors
- **Solution**: Ensure authenticated user
- Check RLS policies in SQL Editor

### Authentication Issues

**Problem**: Can't sign in
- **Solution**: 
  1. Check Supabase Auth settings enabled
  2. Verify email in users table
  3. Reset password via `/sign-up-login-screen`

**Problem**: Missing user role
- **Solution**: Add role in Supabase:
```sql
UPDATE users SET role = 'admin' 
WHERE email = 'user@example.com';
```

### UI Issues

**Problem**: Sidebar not collapsing
- **Solution**: Clear browser cache and hard refresh (Ctrl+Shift+R)

**Problem**: Logo not showing
- **Solution**: Ensure `/public/logo.png` exists and is valid PNG

## 📈 Performance Optimization

### Current Optimizations

1. **Database Indexes**: 14 indexes on frequently queried columns
2. **RLS Policies**: Efficient permission checking
3. **Query Helpers**: Optimized queries in `queries.ts`
4. **Component Splitting**: Lazy loading where appropriate

### Further Optimization

1. **Add Caching**:
```typescript
// Use SWR for client-side caching
import useSWR from 'swr'
const { data: tasks } = useSWR('/api/tasks', fetcher)
```

2. **Database Optimization**:
```sql
-- Analyze query performance
EXPLAIN ANALYZE 
SELECT * FROM tasks WHERE assigned_to = 'user-id';
```

3. **Image Optimization**: Use Next.js Image component

## 🎓 Learning Resources

### For Your Team

1. **Supabase Docs**: https://supabase.com/docs
2. **Next.js Guide**: https://nextjs.org/docs
3. **Tailwind CSS**: https://tailwindcss.com/docs
4. **PostgreSQL**: https://www.postgresql.org/docs/

### API Documentation

All database operations are in `src/lib/supabase/queries.ts`:
- `getTasks(organizationId, filters)`
- `getProjects(organizationId)`
- `getDepartments(organizationId)`
- `createTask(taskData)`
- And many more...

## 🔄 Maintenance

### Regular Tasks

1. **Weekly**:
   - Check audit logs for suspicious activity
   - Verify RLS policies are working

2. **Monthly**:
   - Review user activity
   - Archive completed projects
   - Update custom fields

3. **Quarterly**:
   - Analyze performance metrics
   - Optimize slow queries
   - Update dependencies

## 💡 Next Steps

1. **Connect Supabase**: Follow Database Setup section above
2. **Seed Initial Data**: Add your departments and team members
3. **Test Authentication**: Sign in with test credentials
4. **Create First Project**: Via `/portfolios` → "Add Project"
5. **Invite Team Members**: Via `/admin/users` → "Add User"
6. **Deploy**: Push to GitHub and deploy to Vercel

## 📞 Support

For issues or questions:
1. Check Supabase logs: Project → Logs
2. Review browser console for JavaScript errors
3. Check v0 for build errors
4. Verify environment variables

---

**Last Updated**: April 22, 2026  
**Version**: 2026.1.0  
**Status**: Production Ready
