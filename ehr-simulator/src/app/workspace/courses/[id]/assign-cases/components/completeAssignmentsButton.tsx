"use client";

import {
  completeSessionAssignments,
} from "@/actions/simulation";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface CompleteAssignmentsButtonProps {
  assignmentIds: string[];
  onSubmit: () => void;
};

export default function CompleteAssignmentsButton({ assignmentIds, onSubmit }: CompleteAssignmentsButtonProps) {
  const router = useRouter();
  const [isCompleting, setIsCompleting] = useState(false);

  const handleComplete = async () => {
    setIsCompleting(true);
    const result = await completeSessionAssignments(assignmentIds);
    if (!result.success) {
      toast.error(result.message ?? "Failed to mark session complete.");
    } else {
      toast.success("Session marked as completed.");
      router.refresh();
    }
    onSubmit();

    setIsCompleting(false);
  };

  return (
    <Button
      className="border-blue-500 text-blue-700 hover:text-blue-700"
      variant="outline"
      onClick={handleComplete}
      disabled={isCompleting}
    >
      {isCompleting ? "Completing..." : "Complete Assignments"}
    </Button>
  );
}
