'use client'

import { deleteSectionCaseAssignment } from "@/actions/cases";
import { useRouter } from "next/navigation";
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
import { Trash } from "lucide-react"
import { useState } from "react";
import { toast } from "sonner";

interface DeleteAssignmentsButtonProps {
  assignmentIds: string[];
  onSubmit: () => void;
}

const DeleteAssignmentsButton = ({ assignmentIds, onSubmit }: DeleteAssignmentsButtonProps) => {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deleteSectionCaseAssignment(assignmentIds);

    if (!result.success) {
      toast.error(result.message);
      setIsDeleting(false);
      return;
    }

    toast.success(result.message);
    onSubmit();
    setIsDeleting(false);
    router.refresh();
  }

  const count = assignmentIds.length;

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          className="border-red-500 text-red-700 hover:text-red-700"
          variant="outline"
          disabled={isDeleting}
        >
          <Trash />
          Delete Assignments
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Delete {count} assignment{count === 1 ? "" : "s"}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This permanently deletes student records for
            these simulations. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-red-600">
            Delete Assignments
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default DeleteAssignmentsButton;
