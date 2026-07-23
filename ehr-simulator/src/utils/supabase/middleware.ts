import { createServerClient } from '@supabase/ssr'
import { isAuthRetryableFetchError } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'
import {
  createFetchWithTimeout,
  getErrorDetails,
  SUPABASE_MIDDLEWARE_TIMEOUT_MS,
} from './fetchWithTimeout'

function createAuthUnavailableResponse(requestId: string) {
  return new NextResponse(
    `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Temporarily unavailable</title>
  </head>
  <body style="font-family: system-ui, sans-serif; margin: 0; padding: 2rem; color: #0f172a;">
    <main style="max-width: 36rem; margin: 10vh auto;">
      <h1>Authentication is temporarily unavailable</h1>
      <p>The application could not verify your session in time. Your work was not submitted.</p>
      <p><a href="">Try again</a> or <a href="/auth/login">return to sign in</a>.</p>
      <p style="color: #64748b; font-size: 0.875rem;">Reference: ${requestId}</p>
    </main>
  </body>
</html>`,
    {
      status: 503,
      headers: {
        'Cache-Control': 'private, no-store',
        'Content-Type': 'text/html; charset=utf-8',
        'Retry-After': '5',
        'X-Request-Id': requestId,
      },
    },
  )
}

export async function updateSession(request: NextRequest) {
  const startedAt = performance.now()
  const requestId = crypto.randomUUID()
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      global: {
        fetch: createFetchWithTimeout(
          SUPABASE_MIDDLEWARE_TIMEOUT_MS,
          'Supabase authentication timed out.',
        ),
      },
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
          Object.entries(headers).forEach(([name, value]) =>
            supabaseResponse.headers.set(name, value)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getClaims(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  let user: unknown

  try {
    // getClaims validates the JWT and refreshes it when needed. The custom
    // fetch above prevents an upstream problem from consuming Vercel's full
    // middleware timeout and making the site appear unreachable.
    const { data, error } = await supabase.auth.getClaims()

    if (error) {
      console.warn('[auth-middleware] Session validation failed', {
        requestId,
        pathname: request.nextUrl.pathname,
        durationMs: Math.round(performance.now() - startedAt),
        error: getErrorDetails(error),
      })

      // Auth requests convert fetch failures (including our AbortController
      // timeout) into AuthRetryableFetchError results instead of throwing.
      // Treat that as upstream unavailability, not an invalid user session.
      if (isAuthRetryableFetchError(error)) {
        return createAuthUnavailableResponse(requestId)
      }
    }

    user = data?.claims
  } catch (error) {
    console.error('[auth-middleware] Supabase request failed', {
      requestId,
      pathname: request.nextUrl.pathname,
      durationMs: Math.round(performance.now() - startedAt),
      error: getErrorDetails(error),
    })

    return createAuthUnavailableResponse(requestId)
  }

  if (!user) {
    // no user, potentially respond by redirecting the user to the login page
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  supabaseResponse.headers.set(
    'Server-Timing',
    `supabase-auth;dur=${Math.round(performance.now() - startedAt)}`,
  )
  supabaseResponse.headers.set('X-Request-Id', requestId)

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse
}
