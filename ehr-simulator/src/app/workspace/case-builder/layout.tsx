import { FormContextProvider } from "@/context/FormContext"
import NotAuthorized from "@/components/notAuthorized";
import AccessError from "@/components/accessError";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";
import { getAuthUser } from "@/lib/userAccess";
import { Suspense } from "react"
import { CaseBuilderBootstrap } from "./components/caseBuilderBootstrap"
import Link from "next/link";

export const dynamic = "force-dynamic"

export default async function CaseBuilderLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const viewer = await getAuthUser();

  if (viewer.lookupFailed && !viewer.isDevAdmin) {
    return <AccessError />;
  }

  if (!viewer.user) {
    return (
      <NotAuthorized>
        <Link href={routes.auth.login.getHref()} passHref>
          <Button>Login</Button>
        </Link>
      </NotAuthorized>
    )
  }

  if (viewer.role !== "admin" && !viewer.isDevAdmin) {
    return (
      <NotAuthorized>
        <Link href={routes.home.forRole(viewer.role, viewer.user.id)} passHref>
          <Button>Go to homepage</Button>
        </Link>
      </NotAuthorized>
    );
  }

  return (
    <FormContextProvider>
      <Suspense fallback={<main className="min-h-screen w-full bg-slate-50" />}>
        <CaseBuilderBootstrap>{children}</CaseBuilderBootstrap>
      </Suspense>
    </FormContextProvider>
  )
}
