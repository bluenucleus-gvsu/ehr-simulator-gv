"use client"
import React from "react"
import { GripVertical, X } from "lucide-react"
import { Student } from "./types"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface StudentBlockProps {
  student: Student
  draggable?: boolean
  onDragStart?: (e: React.DragEvent, student: Student, fromGroup?: string, fromSection?: string) => void
  onDragEnd?: () => void
  onRemove?: (student: Student) => void
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
  onRemove,
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
      {onRemove && (
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0 flex-shrink-0 text-slate-400 hover:text-red-600 hover:bg-red-50"
          onClick={(e) => {
            e.stopPropagation()
            e.preventDefault()
            onRemove(student)
          }}
          onMouseDown={(e) => e.stopPropagation()}
          aria-label={`Remove ${student.full_name ?? "student"}`}
        >
          <X className="w-3.5 h-3.5" />
        </Button>
      )}
    </div>
  )
}

export default StudentBlock
