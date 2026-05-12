"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import CourseListItem from "./CourseListItem";
import { Course } from "@/actions/courses";
import { getTesterCourses } from "@/utils/testerLocalStore";
import { isTesterModeClient } from "@/utils/testerMode";

interface CoursesClientProps {
  courses: Course[];
}

export default function CoursesClient({ courses }: CoursesClientProps) {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const mergedCourses = useMemo(() => {
    if (!hydrated) return courses;
    if (!isTesterModeClient()) return courses;
    const localCourses = getTesterCourses<Course>();
    const byId = new Map<string, Course>();
    [...courses, ...localCourses].forEach((course) => byId.set(course.id, course));
    return Array.from(byId.values());
  }, [hydrated, courses]);

  return (
    <div className="w-full">
      <header className="bg-white border-b px-8 py-4 pb-4 sticky top-0 z-10">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h1 className="text-5xl font-bold tracking-tight">COURSES</h1>
            <p className="text-xs text-gray-500">Manage all simulation courses</p>
          </div>
          <Link href='/admin/courses/new'>
            <Button>Create Course</Button>
          </Link>
        </div>
      </header>

      <div className="px-4">
        {mergedCourses.map((course) =>
          <CourseListItem key={course.id} course={course} />
        )}
      </div>
    </div>
  );
}
