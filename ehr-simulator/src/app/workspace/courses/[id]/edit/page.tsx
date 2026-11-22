import { getCourseFull } from "@/actions/courses";
import { notFound } from "next/navigation";
import CourseForm from "./components/courseForm";
import { getAuthUser } from "@/lib/userAccess";

interface EditCoursePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCoursePage({ params }: EditCoursePageProps) {
  const { id } = await params;
  const course = await getCourseFull(id);

  if (!course) {
    notFound();
  }
  const { role, isDevAdmin } = await getAuthUser();
  const isAdmin = role === "admin" || isDevAdmin

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
