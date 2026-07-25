"use client";

import {
  completeAllSessionsForAssignment,
  expireAllSessionsForAssignment,
} from "@/actions/courses";
import { completeSession, expireSession } from "@/actions/simulation";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

type Props = {
  sessionId?: string | null;
  sessionStatus?: string | null;
  assignmentId?: string | null;
  sessionCount?: number;
};

export default function AdminSessionActions({
  sessionId = null,
  sessionStatus,
  assignmentId = null,
  sessionCount = 0,
}: Props) {
  const router = useRouter();
  const [isCompleting, setIsCompleting] = useState(false);
  const [isExpiring, setIsExpiring] = useState(false);
  const normalizedStatus = sessionStatus?.toLowerCase() ?? null;
  const isCompleted = normalizedStatus === "completed";
  const isExpired = normalizedStatus === "archived";
  const useBulk = Boolean(assignmentId);

  if (!useBulk && !sessionId) {
    return <span className="text-xs text-gray-500">No session</span>;
  }

  const handleComplete = async () => {
    setIsCompleting(true);
    if (useBulk && assignmentId) {
      const result = await completeAllSessionsForAssignment(assignmentId);
      if (!result.success) {
        toast.error(result.message ?? "Failed to complete sessions.");
      } else {
        toast.success(result.message ?? "Sessions completed.");
        router.refresh();
      }
    } else if (sessionId) {
      const result = await completeSession(sessionId);
      if (!result.success) {
        toast.error(result.message ?? "Failed to mark session complete.");
      } else {
        toast.success("Session marked as completed.");
        router.refresh();
      }
    }
    setIsCompleting(false);
  };

  const handleExpire = async () => {
    setIsExpiring(true);
    if (useBulk && assignmentId) {
      const result = await expireAllSessionsForAssignment(assignmentId);
      if (!result.success) {
        toast.error(result.message ?? "Failed to expire sessions.");
      } else {
        toast.success(result.message ?? "Sessions expired.");
        router.refresh();
      }
    } else if (sessionId) {
      const result = await expireSession(sessionId);
      if (!result.success) {
        toast.error(result.message ?? "Failed to mark session expired.");
      } else {
        toast.success("Session marked as expired.");
        router.refresh();
      }
    }
    setIsExpiring(false);
  };

  const completeLabel = useBulk
    ? isCompleting
      ? "Completing..."
      : `Complete all${sessionCount ? ` (${sessionCount})` : ""}`
    : isCompleted
      ? "Completed"
      : isCompleting
        ? "Completing..."
        : "Complete";

  const expireLabel = useBulk
    ? isExpiring
      ? "Expiring..."
      : `Expire all${sessionCount ? ` (${sessionCount})` : ""}`
    : isExpired
      ? "Expired"
      : isExpiring
        ? "Expiring..."
        : "Expire";

  return (
    <div className="flex gap-2">
      <button
        className="px-2 py-1 text-xs bg-green-50 border border-green-200 text-green-700 rounded hover:bg-green-100 disabled:opacity-50"
        onClick={handleComplete}
        disabled={isCompleting || isExpiring || (!useBulk && (isCompleted || isExpired))}
      >
        {completeLabel}
      </button>
      <button
        className="px-2 py-1 text-xs bg-amber-50 border border-amber-200 text-amber-700 rounded hover:bg-amber-100 disabled:opacity-50"
        onClick={handleExpire}
        disabled={isCompleting || isExpiring || (!useBulk && (isCompleted || isExpired))}
      >
        {expireLabel}
      </button>
    </div>
  );
}
