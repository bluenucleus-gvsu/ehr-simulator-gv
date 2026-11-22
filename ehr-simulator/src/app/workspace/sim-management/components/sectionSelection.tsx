"use client";
import { Course } from "@/lib/sim-management";
import CourseCard from "./courseCard";

export default function CoursesView({ courses }: { courses: Course[] }) {
  const activeCourses = courses.filter((c) => c.active);

  return (
    <div className="w-full space-y-4 p-6">
      {activeCourses.length === 0 ? (
        <div className="text-sm text-muted-foreground">No active courses.</div>
      ) : (
        <>
          {activeCourses.map(course => {
            return (
              <CourseCard key={course.id} course={course} />
            )
          })}
        </>
      )}
    </div>
  );
}
