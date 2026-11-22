import { getUserRole } from "@/actions/users";
import NotAuthorized from "@/components/notAuthorized";
import { Button } from "@/components/ui/button";
import { emailIsDevAdminAllowlist } from "@/lib/devAdminEmails";
import { routes } from "@/lib/routes";
import { createServerSupabase } from "@/utils/supabase/server";
import Link from "next/link";

export default async function CourseLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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

  if (role !== "admin" && !devBypass) {
    return (
      <NotAuthorized>
        <Link href={routes.home.forRole(role, user.id)} passHref>
          <Button>My Profile</Button>
        </Link>
      </NotAuthorized>
    );
  }

  return (
    <>
      {children}
    </>
  );
}
