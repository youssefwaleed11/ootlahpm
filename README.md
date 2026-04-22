# Ootlah Project Management System 2026

<div align="center">

![Ootlah](public/logo.png)

A professional, full-featured project management system built specifically for digital marketing agencies.

**[Setup Guide](./SETUP_GUIDE.md)** • **[Implementation Details](./IMPLEMENTATION_SUMMARY.md)**

</div>

---

## Features

### Core Management
- 📊 **Global Dashboard** - Company-wide KPIs, statistics, and performance metrics
- 🎯 **Task Management** - Full lifecycle management with priority and status tracking
- 📁 **Project Management** - Portfolio organization by department with progress tracking
- 💼 **Department System** - Support for 6+ digital marketing departments
- 👥 **Team Management** - User roles, permissions, and department assignments

### Collaboration
- 💬 **Real-time Comments** - Chat on tasks with @mentions
- 📎 **File Attachments** - Attach documents and assets to tasks
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 🔔 **Notifications** - Task assignments and updates

### Analytics & Reporting
- 📈 **Department Performance** - Revenue, efficiency, and productivity metrics
- 💰 **Budget Tracking** - Monitor department budgets and spending
- ⏱️ **Time Metrics** - On-time delivery rates and task completion
- 📊 **Custom Reports** - Financial and operational analytics

### Advanced Features
- 🔍 **Advanced Filtering** - Multi-select filters with save presets
- 🎨 **Custom Fields** - Extensible schema for organization-specific data
- 🔐 **Role-Based Access** - Admin, Manager, Department Head, Team Member
- 📜 **Audit Logging** - Full compliance and activity tracking
- 🌓 **Theme Support** - Light/Dark mode preferences

## Supported Departments

The system is pre-configured for digital marketing agencies with these departments:

- **Marketing** - Paid ads, campaigns, strategy
- **SEO** - Search engine optimization, organic growth
- **Content** - Blog writing, copywriting, content creation
- **BD** - Business development, client acquisition
- **Designers** - UI/UX and graphic design
- **Social Media** - Social management and community engagement

Additional departments can be added via the admin panel.

## Tech Stack

- **Frontend**: [Next.js 15](https://nextjs.org) + [React 19](https://react.dev)
- **Database**: [Supabase](https://supabase.com) (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: [Tailwind CSS 3.4](https://tailwindcss.com)
- **Package Manager**: [pnpm](https://pnpm.io)
- **Type Safety**: [TypeScript 5](https://www.typescriptlang.org)
- **Hosting**: [Vercel](https://vercel.com)

## Quick Start

### Prerequisites
- Node.js 18+
- pnpm (or npm/yarn)
- Supabase account (free at [supabase.com](https://supabase.com))

### Installation

1. **Clone and install**:
```bash
git clone https://github.com/youssefwaleed11/ootlahpm.git
cd ootlahpm
pnpm install
```

2. **Setup Supabase**:
   - Create a new project at supabase.com
   - Run `scripts/01_create_schema.sql` in SQL Editor
   - Copy Project URL and Anon Key

3. **Configure environment**:
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
```

4. **Start development**:
```bash
pnpm dev
```

Open [http://localhost:4028](http://localhost:4028) in your browser.

> For detailed setup, see **[SETUP_GUIDE.md](./SETUP_GUIDE.md)**

## File Structure

```
ootlahpm/
├── public/                    # Static assets
│   ├── logo.png              # Ootlah brand logo
│   └── favicon.ico           # Website favicon
├── scripts/
│   └── 01_create_schema.sql  # Database migration
├── src/
│   ├── app/                  # Next.js pages
│   │   ├── dashboard/        # Main dashboard
│   │   ├── portfolios/       # Project portfolios
│   │   ├── reporting/        # Analytics & reporting
│   │   ├── my-tasks/         # Personal task list
│   │   ├── my-projects/      # User's projects
│   │   ├── settings/         # User settings
│   │   ├── admin/            # Admin section
│   │   │   ├── users/        # User management
│   │   │   └── departments/  # Department settings
│   │   └── sign-up-login-screen/ # Authentication
│   ├── components/           # Reusable React components
│   │   ├── Sidebar.tsx       # Main navigation
│   │   ├── AppLayout.tsx     # Main layout wrapper
│   │   ├── TaskDetailPanel.tsx # Task chat interface
│   │   ├── AdvancedFilters.tsx # Filter system
│   │   └── ui/               # UI primitives
│   ├── lib/
│   │   ├── supabase/         # Database clients
│   │   │   ├── client.ts     # Browser client
│   │   │   ├── server.ts     # Server client
│   │   │   └── queries.ts    # Database operations
│   │   ├── mockData.ts       # Demo data
│   │   └── types/
│   │       └── database.ts   # Type definitions
│   └── styles/
│       └── tailwind.css      # Global styles
├── tailwind.config.js        # Tailwind configuration
├── tsconfig.json             # TypeScript config
├── package.json              # Dependencies
├── SETUP_GUIDE.md            # Detailed setup instructions
├── IMPLEMENTATION_SUMMARY.md # Technical details
└── README.md                 # This file
```

## Database Schema

12 tables with complete RLS (Row Level Security):

```
organizations (1) ← → (Many) departments, users, projects, tasks
    ├── departments (1) ← → (Many) projects, users
    ├── users (1) ← → (Many) tasks, comments
    ├── projects (1) ← → (Many) tasks
    ├── tasks (1) ← → (Many) comments, attachments
    ├── task_comments (1) ← → (Many) attachments
    ├── custom_fields (1) ← → (Many) task values
    ├── saved_filters
    ├── department_members
    └── audit_logs
```

**[View full schema](./scripts/01_create_schema.sql)**

## Key Pages

| Page | URL | Description |
|------|-----|-------------|
| Dashboard | `/dashboard` | Company KPIs and metrics |
| Portfolios | `/portfolios` | Department project showcase |
| Reporting | `/reporting` | Financial and productivity analytics |
| My Tasks | `/my-tasks` | Personal task list |
| My Projects | `/my-projects` | User's projects |
| Settings | `/settings` | User preferences |
| Users | `/admin/users` | User management (admin) |
| Departments | `/admin/departments` | Department settings (admin) |

## Navigation Structure

### For All Users
- **Home** - Dashboard overview
- **Portfolios** - View completed/active projects
- **Reporting** - Analytics and metrics
- **My Tasks** - Personal task list
- **My Projects** - User's projects
- **Settings** - Profile & preferences

### For Admins (Additional)
- **User Management** - Add/edit/remove users
- **Department Settings** - Manage departments and custom fields

## Authentication

Uses Supabase Auth with email/password. Default demo accounts:

```
Admin:        layla@ootlah.com / Admin@2026
Manager:      omar@ootlah.com / Leader@2026
Team Member:  nour@ootlah.com / Agent@2026
```

> Change these after first login for security

## Security Features

✅ Row Level Security (RLS) on all tables  
✅ Organization data isolation  
✅ Role-based access control  
✅ Audit logging for compliance  
✅ Secure file upload handling  
✅ HTTPS only in production  

## Available Scripts

- `pnpm dev` - Start development server on port 4028
- `pnpm build` - Build the application for production
- `pnpm start` - Start the development server
- `pnpm lint` - Run ESLint to check code quality
- `pnpm lint:fix` - Fix ESLint issues automatically
- `pnpm format` - Format code with Prettier

## Deployment

### Deploy to Vercel (Recommended)

1. Push to GitHub
2. Connect repository to Vercel
3. Add environment variables
4. Deploy

See **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** for detailed instructions.

## Learning Resources

- **[Setup Guide](./SETUP_GUIDE.md)** - Detailed installation instructions
- **[Implementation Summary](./IMPLEMENTATION_SUMMARY.md)** - Technical architecture
- **[Next.js Docs](https://nextjs.org/docs)**
- **[Supabase Docs](https://supabase.com/docs)**
- **[Tailwind CSS Docs](https://tailwindcss.com/docs)**

## Support

For setup help, see **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** for detailed instructions and troubleshooting.

---

<div align="center">

**Built with ❤️ for digital marketing teams**

Version 2026.1.0 • April 22, 2026

</div>
