import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { createServerSupabase } from "@/utils/supabase/server";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Server-side check: ensure the current user is an admin before rendering admin UI
  try {
    const supabase = await createServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // ensure we have an authenticated user
    if (!user) {
      return (
        <main className="p-8 min-h-screen flex items-center justify-center">
          <div className="max-w-xl w-full text-center bg-white rounded-lg shadow p-6">
            <h1 className="text-2xl font-semibold mb-2">Not authorized</h1>
            <p className="text-sm text-muted-foreground">You do not have permission to access the admin area.</p>
          </div>
        </main>
      );
    }

    // Check role from the application's users table (public.users)
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = profile?.role as string | undefined;

    if (profileError || !profile || role !== "admin") {
      return (
        <main className="p-8 min-h-screen flex items-center justify-center">
          <div className="max-w-xl w-full text-center bg-white rounded-lg shadow p-6">
            <h1 className="text-2xl font-semibold mb-2">Not authorized</h1>
            <p className="text-sm text-muted-foreground">You do not have permission to access the admin area.</p>
          </div>
        </main>
      );
    }
  } catch {
    return (
      <main className="p-8 min-h-screen flex items-center justify-center">
        <div className="max-w-xl w-full text-center bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-semibold mb-2">Not authorized</h1>
          <p className="text-sm text-muted-foreground">You do not have permission to access the admin area.</p>
        </div>
      </main>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      {children}
    </SidebarProvider>
  );
}
