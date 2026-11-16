"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Loader2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"
import { deleteCourse } from "@/actions/courses"

interface DeleteCourseButtonProps {
  courseId: string
  courseCode?: string | null
}

export default function DeleteCourseButton({ courseId, courseCode }: DeleteCourseButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    const result = await deleteCourse(courseId)
    if (result && !result.success) {
      toast.error(result.message)
    }
    setIsDeleting(false)
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={isDeleting}
          className="cursor-pointer gap-1.5 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
        >
          {isDeleting ? <Loader2 className="animate-spin" /> : <Trash2 />}
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete course{courseCode ? ` ${courseCode}` : ""}?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently deletes the course, its sections, groups, and all
            student session history.
            To preserve student history, archive the course instead.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-red-600">
            Delete Course
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
