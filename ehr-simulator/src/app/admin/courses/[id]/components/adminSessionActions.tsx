"use client";

import { completeSession, expireSession } from "@/actions/simulation";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

type Props = {
  sessionId: string | null;
  sessionStatus?: string | null;
};

export default function AdminSessionActions({ sessionId, sessionStatus }: Props) {
  const router = useRouter();
  const [isCompleting, setIsCompleting] = useState(false);
  const [isExpiring, setIsExpiring] = useState(false);
  const normalizedStatus = sessionStatus?.toLowerCase() ?? null;
  const isCompleted = normalizedStatus === "completed";
  const isExpired = normalizedStatus === "archived";

  if (!sessionId) {
    return <span className="text-xs text-gray-500">No session</span>;
  }

  const handleComplete = async () => {
    setIsCompleting(true);
    const result = await completeSession(sessionId);
    if (!result.success) {
      toast.error(result.message ?? "Failed to mark session completed.");
    } else {
      toast.success("Session marked as completed.");
      router.refresh();
    }
    setIsCompleting(false);
  };

  const handleExpire = async () => {
    setIsExpiring(true);
    const result = await expireSession(sessionId);
    if (!result.success) {
      toast.error(result.message ?? "Failed to mark session expired.");
    } else {
      toast.success("Session marked as expired without completion.");
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
        title="Use when the simulation was finished."
      >
        {isCompleted ? "Completed" : isCompleting ? "Completing..." : "Complete"}
      </button>
      <button
        className="px-2 py-1 text-xs bg-amber-50 border border-amber-200 text-amber-700 rounded hover:bg-amber-100 disabled:opacity-50"
        onClick={handleExpire}
        disabled={isCompleting || isExpiring || isCompleted || isExpired}
        title="Use when the simulation should be closed without counting as completed."
      >
        {isExpired ? "Expired" : isExpiring ? "Expiring..." : "Expire"}
      </button>
    </div>
  );
}
