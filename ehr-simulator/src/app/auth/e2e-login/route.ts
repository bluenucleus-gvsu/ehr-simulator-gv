import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Only e2e accounts may use this dev-only route.
const E2E_LOGIN_EMAILS = new Set([
  "e2e.admin@gvsu.edu",
  "e2e.faculty@gvsu.edu",
  "e2e.student@mail.gvsu.edu",
]);

export async function POST(request: NextRequest) {
  if (
    process.env.NODE_ENV === "production" ||
    process.env.NEXT_PUBLIC_VERCEL_ENV === "production"
  ) {
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  }

  const { email, password } = await request.json();

  if (typeof email !== "string" || !E2E_LOGIN_EMAILS.has(email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (typeof password !== "string") {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }

  const response = NextResponse.json({ success: true });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return response;
}