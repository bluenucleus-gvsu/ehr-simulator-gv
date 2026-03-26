import { getAllCourses } from "@/actions/courses";
import CourseListItem from "./components/CourseListItem";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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

  return (
    <div className="w-full">
      <header className="bg-white border-b px-8 py-4 pb-4 sticky top-0 z-10">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h1 className="text-5xl font-bold tracking-tight">COURSES</h1>
            <p className="text-xs text-gray-500">Manage all simulation courses</p>
          </div>
          <Link href='#'>
            <Button>Create Course</Button>
          </Link>
        </div>
      </header>

      <div className="px-4">
        {courses.map((course) =>
          <CourseListItem key={course.id} course={course} />
        )}
      </div>
    </div>
  );
}