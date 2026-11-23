import NotAuthorized from "@/components/notAuthorized";
import AccessError from "@/components/accessError";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";
import { getAuthUser } from "@/lib/userAccess";
import Link from "next/link";

export default async function CourseLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const authUser = await getAuthUser();

  if (authUser.lookupFailed && !authUser.isDevAdmin) {
    return <AccessError />;
  }

  if (!authUser.user) {
    return (
      <NotAuthorized>
        <Link href={routes.auth.login.getHref()} passHref>
          <Button>Login</Button>
        </Link>
      </NotAuthorized>
    )
  }

  if (authUser.role !== "admin" && !authUser.isDevAdmin) {
    return (
      <NotAuthorized>
        <Link href={routes.home.forRole(authUser.role, authUser.user.id)} passHref>
          <Button>Go to my homepage</Button>
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
