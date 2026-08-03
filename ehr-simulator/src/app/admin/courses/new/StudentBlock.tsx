"use client"
import React from "react"
import { GripVertical, Trash2 } from "lucide-react"
import { Student } from "./types"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface StudentBlockProps {
  student: Student
  draggable?: boolean
  onDragStart?: (e: React.DragEvent, student: Student, fromGroup?: string, fromSection?: string) => void
  onDragEnd?: () => void
  className?: string
  isDimmed?: boolean
  fromGroup?: string
  fromSection?: string
  onDelete?: (student: Student) => void
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
  onDelete,
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
      {onDelete && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 flex-shrink-0"
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <Trash2 className="w-3.5 h-3.5 text-red-400" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove {student.full_name ?? "student"}?</AlertDialogTitle>
              <AlertDialogDescription>
                This removes them from this course roster and any groups.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600"
                onClick={() => onDelete(student)}
              >
                Remove
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  )
}

export default StudentBlock
