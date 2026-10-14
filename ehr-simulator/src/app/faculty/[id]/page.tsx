import { notFound } from "next/navigation";
import { createServerSupabase } from "@/utils/supabase/server";
import FacultyHeader from "@/app/faculty/components/FacultyHeader";
import FacultyCoursesView from "@/app/faculty/components/FacultyCoursesView";
import { getUserRole } from "@/actions/users";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getFacultyCourses } from "@/actions/faculty";

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

  const role = await getUserRole(user.id)
  if ((role !== "admin") && (role !== "faculty")) {
    return (
      <main className="p-8 min-h-screen flex items-center justify-center">
        <div className="max-w-xl w-full text-center bg-white rounded-lg shadow p-6 space-y-4">
          <h1 className="text-2xl font-semibold">Not authorized</h1>
          <p className="text-sm text-muted-foreground">You do not have permission to access the faculty area.</p>
          <Link href={`/user/profile/${id}`} passHref>
            <Button>My Profile</Button>
          </Link>
        </div>
      </main>
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
