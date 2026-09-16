import { notFound } from "next/navigation";
import { createServerSupabase } from "@/utils/supabase/server";
import FacultyHeader from "@/app/faculty/components/FacultyHeader";
import FacultyCoursesView from "@/app/faculty/components/FacultyCoursesView";
import { getFacultyCourses } from "../lib/facultyData";
import { getUserRole } from "@/actions/users";




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

  const role = await getUserRole(id)
  if ((role !== "admin") && (role !== "faculty")) {
      return (
        <main className="p-8 min-h-screen flex items-center justify-center">
          <div className="max-w-xl w-full text-center bg-white rounded-lg shadow p-6">
            <h1 className="text-2xl font-semibold mb-2">Not authorized</h1>
            <p className="text-sm text-muted-foreground">You do not have permission to access the faculty area.</p>
          </div>
        </main>
      );
    }

  return (
    <main className="p-6 max-w-6xl mx-auto space-y-6">
      <FacultyHeader
        name={facultyName}
        avatarUrl={avatarUrl}
        courses={courseCodes}
      />
      <FacultyCoursesView courses={courses} />
    </main>
  );
}
