"use client"

import { useSimSessionContext } from "@/context/SimSessionContext";
import { Loader2 } from "lucide-react";
import FlexSheet, { FlexSheetProps } from "./flexSheet";

export function FlexSheetView({ documentation, caseId, sessionId }: FlexSheetProps) {
  const { loading } = useSimSessionContext();

  if (loading) {
    return (
      <div className="flex h-full min-h-0 w-full items-center justify-center bg-gray-100 px-4">
        <div className="flex items-center gap-2 text-sm text-neutral-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading FlexSheet data…
        </div>
      </div>
    );
  }

  return <FlexSheet documentation={documentation} caseId={caseId} sessionId={sessionId} />;
}