import { AppSidebar } from "@/components/app-sidebar";
import NotAuthorized from "@/components/notAuthorized";
import AccessError from "@/components/accessError";
import { Button } from "@/components/ui/button";
import { SidebarProvider } from "@/components/ui/sidebar";
import { routes } from "@/lib/routes";
import { getAuthUser } from "@/lib/userAccess";
import Link from "next/link";

export default async function WorkspaceLayout({
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

  if (authUser.role !== "admin" && authUser.role !== "faculty" && !authUser.isDevAdmin) {
    return (
      <NotAuthorized>
        <Link href={routes.user.getHref(authUser.user.id)} passHref>
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
