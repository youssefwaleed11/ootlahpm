import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const PUBLIC_PATHS = [
  '/sign-up-login-screen',
  '/api/auth/login',
  '/api/auth/logout',
  '/api/auth/register',
  '/api/invitations/accept',
  '/favicon.ico',
  '/logo.png',
];

const ADMIN_PATHS = ['/admin'];
const LEADER_PATHS = [
  '/approval-queue',
  '/team-dashboard',
  '/reporting',
  '/portfolios',
  '/resources',
];

function isUnderAny(pathname: string, prefixes: string[]) {
  return prefixes.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Static assets + Next internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/assets') ||
    pathname.startsWith('/api/health')
  ) {
    return NextResponse.next();
  }

  if (isUnderAny(pathname, PUBLIC_PATHS)) {
    return NextResponse.next();
  }

  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookies) {
          cookies.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    if (pathname.startsWith('/api')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const url = req.nextUrl.clone();
    url.pathname = '/sign-up-login-screen';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  // Role-gated routes
  if (isUnderAny(pathname, ADMIN_PATHS) || isUnderAny(pathname, LEADER_PATHS)) {
    const { data: profile } = await supabase
      .from('users')
      .select('role, is_active')
      .eq('id', user.id)
      .single();

    if (!profile || !profile.is_active) {
      const url = req.nextUrl.clone();
      url.pathname = '/sign-up-login-screen';
      return NextResponse.redirect(url);
    }

    if (isUnderAny(pathname, ADMIN_PATHS) && profile.role !== 'admin') {
      const url = req.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }

    if (
      isUnderAny(pathname, LEADER_PATHS) &&
      profile.role !== 'admin' &&
      profile.role !== 'team_leader'
    ) {
      const url = req.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  }

  return res;
}

export const config = {
  matcher: [
    // Match everything except static files handled above
    '/((?!_next/static|_next/image|favicon.ico|logo.png|assets).*)',
  ],
};
