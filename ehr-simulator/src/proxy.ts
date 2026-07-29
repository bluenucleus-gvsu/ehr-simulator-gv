import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

const CASE_BUILDER_MAINTENANCE_PATH = '/admin/case-builder-maintenance'
const DEBUG_CASE_BUILDER_UNDER_MAINTENANCE = false;

export async function proxy(request: NextRequest) {
  if (
    request.nextUrl.pathname.startsWith('/admin/case-builder') &&
    request.nextUrl.pathname !== CASE_BUILDER_MAINTENANCE_PATH
    && DEBUG_CASE_BUILDER_UNDER_MAINTENANCE
  ) {
    return NextResponse.redirect(new URL(CASE_BUILDER_MAINTENANCE_PATH, request.url))
  }

  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
