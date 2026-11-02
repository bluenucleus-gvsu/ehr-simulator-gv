"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import CourseListItem from "@/app/admin/courses/components/courseListItem";
import { unarchiveCourse } from "@/actions/courses";
import { Course } from "@/actions/courses";

interface CoursesClientProps {
  courses: Course[];
  archived?: boolean;
}

export default function CoursesClient({ courses, archived = false }: CoursesClientProps) {
  const router = useRouter();
  const [unarchivingId, setUnarchivingId] = useState<string | null>(null);

  const handleUnarchive = async (courseId: string) => {
    setUnarchivingId(courseId);
    const result = await unarchiveCourse(courseId);
    setUnarchivingId(null);
    if (!result.success) {
      toast.error(result.message);
      return;
    }
    toast.success("Course unarchived.");
    router.refresh();
  };

  return (
    <div className="w-full">
      <header className="bg-white border-b px-8 py-4 pb-4 sticky top-0 z-10">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h1 className="text-5xl font-bold tracking-tight">COURSES</h1>
            <p className="text-xs text-gray-500">Manage all simulation courses</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex rounded-lg bg-gray-100 p-1 text-sm font-medium">
              <Link
                href="/admin/courses"
                className={`rounded-md px-3 py-1.5 transition ${archived ? "text-gray-500 hover:text-gray-800" : "bg-white text-gray-900 shadow-sm"}`}
              >
                Active
              </Link>
              <Link
                href="/admin/courses?view=archived"
                className={`rounded-md px-3 py-1.5 transition ${archived ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-800"}`}
              >
                Archived
              </Link>
            </div>
            <Link href='/admin/courses/new'>
              <Button>Create Course</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="px-4">
        {courses.length === 0 ? (
          <p className="py-12 text-center text-muted-foreground">
            {archived ? "No archived courses." : "No courses yet."}
          </p>
        ) : (
          courses.map((course) => (
            <CourseListItem
              key={course.id}
              course={course}
              onUnarchive={archived ? (id) => handleUnarchive(id) : undefined}
              isUnarchiving={unarchivingId === course.id}
            />
          ))
        )}
      </div>
    </div>
  );
}
