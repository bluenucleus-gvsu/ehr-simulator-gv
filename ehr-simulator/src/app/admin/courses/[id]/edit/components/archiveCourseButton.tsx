"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Archive, Loader2 } from "lucide-react"
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
import { archiveCourse } from "@/actions/courses"

interface ArchiveCourseButtonProps {
  courseId: string
  courseCode?: string | null
}

export default function ArchiveCourseButton({ courseId, courseCode }: ArchiveCourseButtonProps) {
  const router = useRouter()
  const [isArchiving, setIsArchiving] = useState(false)

  const handleArchive = async () => {
    setIsArchiving(true)
    const result = await archiveCourse(courseId)
    if (!result.success) {
      toast.error(result.message)
      setIsArchiving(false)
      return
    }
    toast.success("Course archived.")
    router.push("/admin/courses")
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={isArchiving}
          className="cursor-pointer"
        >
          {isArchiving ? <Loader2 className="animate-spin" /> : <Archive />}
          Archive
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Archive course{courseCode ? ` ${courseCode}` : ""}?</AlertDialogTitle>
          <AlertDialogDescription>
            {"The course will be hidden from the active list and moves to students' "}
            Inactive Courses section. All history is preserved, and it can be
            unarchived at any time.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleArchive}>Archive Course</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
