import { getUserRole } from "@/actions/users";
import { AppSidebar } from "@/components/app-sidebar";
import NotAuthorized from "@/components/notAuthorized";
import { Button } from "@/components/ui/button";
import { SidebarProvider } from "@/components/ui/sidebar";
import { emailIsDevAdminAllowlist } from "@/lib/devAdminEmails";
import { routes } from "@/lib/routes";
import { createServerSupabase } from "@/utils/supabase/server";
import Link from "next/link";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Server-side check: ensure the current user is an admin before rendering admin UI
  const supabase = await createServerSupabase();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error) {
    throw new Error(`Failed find user: ${error.message}`);
  }

  if (!user) {
    return (
      <NotAuthorized>
        <Link href={routes.auth.login.getHref()} passHref>
          <Button>Login</Button>
        </Link>
      </NotAuthorized>
    )
  }

  const role = await getUserRole(user.id);
  const devBypass = emailIsDevAdminAllowlist(user?.email ?? undefined);

  if (role !== "admin" && role !== "faculty" && !devBypass) {
    return (
      <NotAuthorized>
        <Link href={routes.user.getHref(user.id)} passHref>
          <Button>My Profile</Button>
        </Link>
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
