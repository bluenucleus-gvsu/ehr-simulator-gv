"use client"
import { UserRound } from "lucide-react"
import { Student } from "../types"
import { cn } from "@/lib/utils"

interface StudentBlockProps {
  student: Student
  className?: string
}

export const StudentBlock = ({
  student,
  className = "",
}: StudentBlockProps) => {
  return (
    <div
      key={student.email}
      className={cn(
        "flex items-center gap-2 p-2 bg-slate-50 rounded border border-slate-200",
        className
      )}
    >
      <UserRound className="size-4 text-slate-400 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900 truncate">
          {student.full_name ?? "Unknown"}
        </p>
        <p className="text-xs text-slate-500 truncate">
          {student.email ?? ""}
        </p>
      </div>
    </div>
  )
}

export default StudentBlock