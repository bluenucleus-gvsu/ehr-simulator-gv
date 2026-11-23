import { PageNotFoundButton } from "@/components/pageNotFoundButton";

export default function NotFound() {
  return (
    <div className="p-8 min-h-screen flex items-center justify-center">
      <div className="max-w-xl w-full text-center bg-white rounded-lg shadow p-6 space-y-4">
        <h1 className="text-2xl font-semibold">Page not found</h1>
        <p className="text-sm text-muted-foreground">
          Whoops! That page doesn&apos;t exist.
        </p>
        <PageNotFoundButton />
      </div>
    </div>
  );
}
