"use client"

import Link from "next/link"
import { ArchiveRestore, CalendarDays } from "lucide-react"
import { Course } from "@/actions/courses";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface CourseListItemProps {
  course: Course;
  onUnarchive?: (courseId: string) => void;
  isUnarchiving?: boolean;
}

export default function CourseListItem({ course, onUnarchive, isUnarchiving }: CourseListItemProps) {
  const { id, name, code, semester, active, created_at } = course;

  return (
    <div className={`relative border rounded-md my-4 transition border-l-10 max-w-xl
      ${active ? "border-l-green-800" : "border-l-gray-600"}`}
    >
      <Link href={`/admin/courses/${id}/assign-cases`} className="block p-4 hover:bg-secondary dark:hover:bg-gray-800  transition-colors cursor-pointer">
        <div className="flex items-center gap-x-3 gap-y-1">
          <h2 className="text-2xl font-semibold">{code}</h2>
          <Badge
            variant="secondary"
            className={cn("rounded-full text-sm font-medium", semester ? "" : "border border-dashed ")}
          >
            {semester || "No semester"}
          </Badge>
        </div>
        <p className="text-gray-500">{name}</p>
        {created_at && (
          <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-gray-500">
            <CalendarDays className="size-3.5" />
            Created {format(created_at, "PP")}
          </p>
        )}
      </Link>
      {onUnarchive && !active && (
        <Button
          size="sm"
          variant="outline"
          className="absolute top-4 right-4 cursor-pointer gap-1.5"
          onClick={() => onUnarchive(id)}
          disabled={isUnarchiving}
        >
          <ArchiveRestore /> Unarchive
        </Button>
      )}
    </div>
  );
}
