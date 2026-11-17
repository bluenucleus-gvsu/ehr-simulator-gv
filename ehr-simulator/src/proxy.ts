import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'
import { routes } from '@/lib/routes'

const CASE_BUILDER_UNDER_MAINTENANCE = process.env.CASE_BUILDER_MAINTENANCE === 'true';

export async function proxy(request: NextRequest) {
  if (
    request.nextUrl.pathname.startsWith(routes.admin.caseBuilder.root) &&
    request.nextUrl.pathname !== routes.admin.caseBuilderMaintenance.getHref()
    && CASE_BUILDER_UNDER_MAINTENANCE
  ) {
    return NextResponse.redirect(new URL(routes.admin.caseBuilderMaintenance.getHref(), request.url))
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
