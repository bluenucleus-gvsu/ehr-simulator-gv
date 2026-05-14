import { getAllCourses } from "@/actions/courses";
import CoursesClient from "./components/CoursesClient";

export default async function CoursesPage() {
  const courseResult = await getAllCourses();

  if (!courseResult.success || !courseResult.data) {
    return (
      <div className="flex h-screen items-center justify-center text-muted-foreground">
        Courses not found.
      </div>
    )
  }

  const courses = courseResult.data || [];

  return <CoursesClient courses={courses} />;
}
