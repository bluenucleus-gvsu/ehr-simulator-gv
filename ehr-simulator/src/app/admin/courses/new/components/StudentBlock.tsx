"use client"
import React from "react"
import { GripVertical } from "lucide-react"
import { Student } from "./types"
import { cn } from "@/lib/utils"

interface StudentBlockProps {
  student: Student
  draggable?: boolean
  onDragStart?: (e: React.DragEvent, student: Student, fromGroup?: string, fromSection?: string) => void
  onDragEnd?: () => void
  className?: string
  isDimmed?: boolean
  fromGroup?: string
  fromSection?: string
}

export const StudentBlock = ({
  student,
  draggable = true,
  onDragStart,
  onDragEnd,
  className = "",
  isDimmed = false,
  fromGroup,
  fromSection,
}: StudentBlockProps) => {
  return (
    <div
      key={student.email}
      draggable={draggable}
      onDragStart={(e) => onDragStart?.(e, student, fromGroup ?? "", fromSection ?? "")}
      onDragEnd={() => onDragEnd?.()}
      className={cn(
        `flex items-center gap-2 p-2 bg-slate-50 rounded border border-slate-200 hover:bg-slate-100 cursor-move transition-all select-none`,
        isDimmed ? "opacity-40" : "",
        className
      )}
    >
      <GripVertical className="size-4 text-slate-400 flex-shrink-0" />
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