import { getAllCourses } from "@/actions/courses";
import CoursesClient from "@/app/admin/courses/components/coursesClient";

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view } = await searchParams;
  const archived = view === "archived";

  const courseResult = await getAllCourses({ archived });

  if (!courseResult.success || !courseResult.data) {
    return (
      <div className="flex h-screen items-center justify-center text-muted-foreground">
        Courses not found.
      </div>
    )
  }

  const courses = courseResult.data || [];

  return <CoursesClient courses={courses} archived={archived} />;
}
