"use client";

import {
  completeAllSessionsForAssignment,
  expireAllSessionsForAssignment,
} from "@/actions/courses";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

type Props = {
  assignmentId: string;
  sessionStatus?: string | null;
};

export default function AdminSessionActions({
  assignmentId,
  sessionStatus,
}: Props) {
  const router = useRouter();
  const [isCompleting, setIsCompleting] = useState(false);
  const [isExpiring, setIsExpiring] = useState(false);
  const normalizedStatus = sessionStatus?.toLowerCase() ?? null;
  const isCompleted = normalizedStatus === "completed";
  const isExpired = normalizedStatus === "archived";

  const handleComplete = async () => {
    setIsCompleting(true);
    const result = await completeAllSessionsForAssignment(assignmentId);
    if (!result.success) {
      toast.error(result.message ?? "Failed to mark sessions complete.");
    } else {
      toast.success(result.message ?? "Sessions marked as completed.");
      router.refresh();
    }
    setIsCompleting(false);
  };

  const handleExpire = async () => {
    setIsExpiring(true);
    const result = await expireAllSessionsForAssignment(assignmentId);
    if (!result.success) {
      toast.error(result.message ?? "Failed to mark sessions expired.");
    } else {
      toast.success(result.message ?? "Sessions marked as expired.");
      router.refresh();
    }
    setIsExpiring(false);
  };

  return (
    <div className="flex gap-2">
      <button
        className="px-2 py-1 text-xs bg-green-50 border border-green-200 text-green-700 rounded hover:bg-green-100 disabled:opacity-50"
        onClick={handleComplete}
        disabled={isCompleting || isExpiring || isCompleted || isExpired}
      >
        {isCompleted ? "Completed" : isCompleting ? "Completing..." : "Complete all"}
      </button>
      <button
        className="px-2 py-1 text-xs bg-amber-50 border border-amber-200 text-amber-700 rounded hover:bg-amber-100 disabled:opacity-50"
        onClick={handleExpire}
        disabled={isCompleting || isExpiring || isCompleted || isExpired}
      >
        {isExpired ? "Expired" : isExpiring ? "Expiring..." : "Expire all"}
      </button>
    </div>
  );
}
