import { getUserRole } from "@/actions/users";
import { AppSidebar } from "@/components/app-sidebar";
import NotAuthorized from "@/components/notAuthorized";
import { Button } from "@/components/ui/button";
import { SidebarProvider } from "@/components/ui/sidebar";
import { emailIsDevAdminAllowlist } from "@/lib/devAdminEmails";
import { routes } from "@/lib/routes";
import { createServerSupabase } from "@/utils/supabase/server";
import type { User } from "@supabase/supabase-js";
import Link from "next/link";


function AccessError() {
  return (
    <div className="p-8 min-h-screen flex items-center justify-center">
      <div className="max-w-xl w-full text-center bg-white rounded-lg shadow p-6 space-y-4">
        <h1 className="text-2xl font-semibold">Something went wrong</h1>
        <p className="text-sm text-muted-foreground">
          We couldn&apos;t verify your access. This is usually temporary &mdash; please try again.
        </p>
        <Link href="/admin" passHref>
          <Button>Try again</Button>
        </Link>
      </div>
    </div>
  );
}

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Server-side check: ensure the current user is an admin before rendering admin UI
  let user: User | null = null;
  let role: string | null = null;
  let lookupFailed = false;

  try {
    const supabase = await createServerSupabase();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    user = authUser;

    if (user) {
      role = await getUserRole(user.id);
    }
  } catch {
    lookupFailed = true;
  }

  const devBypass = emailIsDevAdminAllowlist(user?.email ?? undefined);

  if (lookupFailed && !devBypass) {
    return <AccessError />;
  }

  if (!user) {
    return <NotAuthorized />;
  }

  if (role !== "admin" && !devBypass) {
    return (
      <NotAuthorized>
        {role === "faculty" ? (
          <Link href={routes.faculty.getHref(user.id)} passHref>
            <Button>My Profile</Button>
          </Link>
        ) : (
          <Link href={routes.user.getHref(user.id)} passHref>
            <Button>My Profile</Button>
          </Link>
        )}
      </NotAuthorized>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      {children}
    </SidebarProvider>
  );
}
