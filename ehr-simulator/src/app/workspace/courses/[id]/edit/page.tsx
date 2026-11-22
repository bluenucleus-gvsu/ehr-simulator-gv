import { getCourseFull } from "@/actions/courses";
import { getUserRole } from "@/actions/users";
import { notFound } from "next/navigation";
import { createServerSupabase } from "@/utils/supabase/server";
import { emailIsDevAdminAllowlist } from "@/lib/devAdminEmails";
import CourseForm from "./components/courseForm";

interface EditCoursePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCoursePage({ params }: EditCoursePageProps) {
  const { id } = await params;
  const course = await getCourseFull(id);

  if (!course) {
    notFound();
  }

  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  const role = user ? await getUserRole(user.id) : null;
  const isAdmin = role === "admin" || (user ? emailIsDevAdminAllowlist(user.email ?? undefined) : false);

  return (
    <CourseForm
      mode="edit"
      courseId={course.id}
      initialCourse={course}
      isAdmin={isAdmin}
      isArchived={!course.active}
    />
  );
}
