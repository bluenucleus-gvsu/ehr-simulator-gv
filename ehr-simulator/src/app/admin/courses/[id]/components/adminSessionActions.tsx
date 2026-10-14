"use client";

import { archiveCaseSession, completeCaseSession } from "@/actions/simulation";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

type AdminSessionActionsProps = {
  assignmentId: string;
  disabled?: boolean;
};

export default function AdminSessionActions({ assignmentId, disabled = false }: AdminSessionActionsProps) {
  const router = useRouter();
  const [isCompleting, setIsCompleting] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);

  const handleComplete = async () => {
    setIsCompleting(true);
    const result = await completeCaseSession(assignmentId);

    if (!result.success) {
      toast.error("Failed to mark sessions complete.");
    } else {
      toast.success(`Completed ${result.data} session${result.data === 1 ? "" : "s"}.`);
      router.refresh();
    }

    setIsCompleting(false);
  };

  const handleArchive = async () => {
    setIsArchiving(true);
    const result = await archiveCaseSession(assignmentId);

    if (!result.success) {
      toast.error("Failed to archive sessions.");
    } else {
      toast.success(`Archived ${result.data} session${result.data === 1 ? "" : "s"}.`);
      router.refresh();
    }

    setIsArchiving(false);
  };

  return (
    <div className="flex gap-2 items-center">
      <Button
        className="h-7 px-2 text-xs font-medium bg-green-600 hover:bg-green-700"
        onClick={handleComplete}
        disabled={disabled || isCompleting || isArchiving}
      >
        {isCompleting ? "Completing..." : "Complete"}
      </Button>
      <Button
        className="px-2 h-7 text-xs bg-yellow-500 hover:bg-amber-600"
        onClick={handleArchive}
        disabled={disabled || isCompleting || isArchiving}
      >
        {isArchiving ? "Archiving..." : "Archive"}
      </Button>
    </div>
  );
}
