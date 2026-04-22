# Quick Start - Ootlah PM 2026

Get up and running in 5 minutes.

## Prerequisites
- Supabase account (free at supabase.com)
- Node.js 18+
- pnpm installed

## Step 1: Clone & Install (1 min)

```bash
git clone https://github.com/youssefwaleed11/ootlahpm.git
cd ootlahpm
pnpm install
```

## Step 2: Setup Supabase Database (2 mins)

1. Create a new project on [supabase.com](https://supabase.com)
2. Go to **SQL Editor**
3. Create new query and paste content from `/scripts/01_create_schema.sql`
4. Click **Run**
5. Copy your **Project URL** and **Anon Key** from Settings

## Step 3: Configure Environment (1 min)

Create `.env.local` in project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Step 4: Load Demo Data (1 min)

1. Back in Supabase SQL Editor
2. Create new query and paste content from `/scripts/02_seed_data.sql`
3. Click **Run**

## Step 5: Start Dev Server (1 min)

```bash
pnpm dev
```

Open [http://localhost:4028](http://localhost:4028)

---

## Login with Demo Accounts

**Admin Account:**
```
Email: layla@ootlah.com
Password: Admin@2026
```

**Regular User:**
```
Email: nour@ootlah.com
Password: Agent@2026
```

---

## What You Can Do Now

### As Admin (layla@ootlah.com)
- View **Admin Dashboard** → `/admin/dashboard`
- See department performance
- Click any department to drill-down
- View employee performance metrics
- Go to **Admin** section to manage users/departments
- Create new projects and tasks

### As Regular User (nour@ootlah.com)
- View **My Tasks** → `/my-tasks`
- Click any task to see details + chat
- View projects portfolio
- Edit personal settings
- Add comments to tasks

---

## Main Pages

| Path | Purpose | Access |
|------|---------|--------|
| `/login` | Login page | Everyone |
| `/dashboard` | Main dashboard | All users |
| `/admin/dashboard` | Performance metrics | Admin only |
| `/my-tasks` | Your tasks | All users |
| `/my-projects` | Your projects | All users |
| `/portfolios` | Department portfolios | All users |
| `/settings` | User settings | All users |
| `/admin/users` | Manage users | Admin only |
| `/admin/departments` | Manage departments | Admin only |

---

## API Endpoints (Behind the Scenes)

```bash
# Login
POST /api/auth/login

# Users
GET /api/users
POST /api/users

# Projects
GET /api/projects
POST /api/projects

# Tasks
GET /api/tasks
POST /api/tasks
PATCH /api/tasks?id={id}

# Performance
GET /api/performance?departmentId={id}

# Comments
GET /api/comments?taskId={id}
POST /api/comments
```

**Full API docs**: See `BACKEND_GUIDE.md`

---

## Troubleshooting

### "Cannot find module '@supabase/supabase-js'"
```bash
pnpm install
```

### "Unauthorized" errors
- Check `.env.local` is configured correctly
- Verify Supabase URL and Anon Key are correct
- Try logging in again

### "Database connection failed"
- Ensure `/scripts/01_create_schema.sql` was run
- Check Supabase project is active
- Verify environment variables

### "Tasks page is empty"
- Run `/scripts/02_seed_data.sql` to add demo data
- Or create a task manually via the API
- Assign it to the logged-in user

---

## Next Steps

1. **Explore the UI**: Click around all pages
2. **Test APIs**: Use the custom hooks or curl
3. **Create Data**: Add projects and tasks
4. **Add Comments**: Click a task to add comments
5. **View Performance**: Go to Admin Dashboard as admin

---

## Key Features to Try

✅ Login with different roles  
✅ Create a new project  
✅ Add a task to the project  
✅ Assign task to user  
✅ Add comment with mention (@username)  
✅ Mark task as complete  
✅ View admin dashboard  
✅ Drill-down to see employee metrics  

---

## File Organization

```
ootlahpm/
├── src/
│   ├── app/
│   │   ├── api/              ← API Routes
│   │   ├── login/            ← Login page
│   │   ├── dashboard/        ← Main dashboard
│   │   ├── admin/            ← Admin pages
│   │   ├── my-tasks/         ← Personal tasks
│   │   └── ...
│   ├── components/           ← React components
│   ├── hooks/                ← Custom hooks
│   └── lib/
├── scripts/
│   ├── 01_create_schema.sql  ← Database setup
│   └── 02_seed_data.sql      ← Demo data
├── BACKEND_GUIDE.md          ← API docs
├── FOCUS_BUILD_COMPLETE.md   ← Architecture
└── README.md                 ← Project info
```

---

## Common Tasks

### Create a Task
1. Go to `/my-projects`
2. Click into a project
3. Click "New Task"
4. Fill in details and save

### Add a Comment
1. Go to `/my-tasks`
2. Click on a task
3. Type in the comment box
4. Press "Comment"

### View Performance
1. Login as admin (layla@ootlah.com)
2. Go to `/admin/dashboard`
3. See department metrics
4. Click a department to see employees

### Manage Users
1. Login as admin
2. Go to `/admin/users`
3. See all users, add new, edit roles

---

## Development

```bash
# Start dev server
pnpm dev

# Build for production
pnpm build

# Run linter
pnpm lint

# Format code
pnpm format
```

---

## Deployment

Ready to deploy? Push to GitHub and connect to Vercel.

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables
5. Deploy!

---

## Support

- API Documentation: `BACKEND_GUIDE.md`
- Architecture: `FOCUS_BUILD_COMPLETE.md`
- Project README: `README.md`
- Database Schema: `scripts/01_create_schema.sql`

---

## You're Ready! 🚀

Start by:
1. Creating a new project
2. Adding tasks to it
3. Assigning to team members
4. Checking the admin dashboard

That's it! The system is ready to use.

Need help? Check the documentation files or review the API guide.
