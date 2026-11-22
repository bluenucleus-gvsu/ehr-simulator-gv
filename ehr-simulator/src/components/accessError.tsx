import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";
import Link from "next/link";

export default function AccessError() {
  return (
    <div className="p-8 min-h-screen flex items-center justify-center">
      <div className="max-w-xl w-full text-center bg-white rounded-lg shadow p-6 space-y-4">
        <h1 className="text-2xl font-semibold">Something went wrong</h1>
        <p className="text-sm text-muted-foreground">
          We couldn&apos;t verify your access. This is usually temporary &mdash; please try again.
        </p>
        <Link href={routes.workspace.getHref()} passHref>
          <Button>Try again</Button>
        </Link>
      </div>
    </div>
  );
}
