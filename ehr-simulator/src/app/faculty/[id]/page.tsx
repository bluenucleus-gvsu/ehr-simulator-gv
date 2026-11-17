import { notFound } from "next/navigation";
import { createServerSupabase } from "@/utils/supabase/server";
import FacultyHeader from "@/app/faculty/components/FacultyHeader";
import FacultyCoursesView from "@/app/faculty/components/FacultyCoursesView";
import { getFacultyCourses } from "../lib/facultyData";
import { getUserRole } from "@/actions/users";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";
import NotAuthorized from "@/components/notAuthorized";




export default async function FacultyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  let role: string | null = null;
  try {
    role = await getUserRole(user.id)
  } catch {
    return (
      <div className="p-8 min-h-screen flex items-center justify-center">
        <div className="max-w-xl w-full text-center bg-white rounded-lg shadow p-6 space-y-4">
          <h1 className="text-2xl font-semibold">Something went wrong</h1>
          <p className="text-sm text-muted-foreground">
            We couldn&apos;t verify your access. This is usually temporary &mdash; please try again.
          </p>
          <Link href={`/faculty/${id}`} passHref>
            <Button>Try again</Button>
          </Link>
        </div>
      </div>
    );
  }

  if ((role !== "admin") && (role !== "faculty")) {
    return (
      <NotAuthorized>
        <Link href={routes.user.getHref(id)} passHref>
          <Button>My Profile</Button>
        </Link>
      </NotAuthorized>
    );
  }

  let facultyName = "Faculty";
  let avatarUrl = "";

  if (user.id === id) {
    facultyName =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email ||
      "Faculty";
    avatarUrl = user.user_metadata?.avatar_url || "";
  } else {
    const { data: profile } = await supabase
      .from("users")
      .select("full_name, email")
      .eq("id", id)
      .single();
    facultyName = profile?.full_name || profile?.email || "Faculty";
  }

  // May come from another file in future...
  const courses = await getFacultyCourses()

  const courseCodes = courses.filter((c) => c.active).map((c) => c.code || c.name);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <FacultyHeader
        name={facultyName}
        avatarUrl={avatarUrl}
        courses={courseCodes}
      />
      <FacultyCoursesView courses={courses} />
    </div>
  );
}
