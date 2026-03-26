"use client"

import Link from "next/link"
import { Course } from "@/actions/courses";

interface CourseListItemProps {
  course: Course;
}

export default function CourseListItem({ course }: CourseListItemProps) {
  const { id, name, code, active } = course;

  return (
    <Link href={`/admin/courses/${id}`}>
      <div className={`border rounded-md my-4 p-4 hover:bg-secondary dark:hover:bg-gray-800 transition border-l-10 cursor-pointer max-w-xl
        ${active ? "border-l-green-800" : "border-l-red-800"}`}
      >
        <h2 className="text-2xl font-semibold">{code}</h2>
        <p className="text-md text-gray-500">{name}</p>
      </div>
    </Link>
  );
} 
