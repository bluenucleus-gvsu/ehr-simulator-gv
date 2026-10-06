"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import CaseCardField from "@/app/user/components/CaseCardField";

type Props = {
  id: string;
  caseId?: string | null;
  sessionId?: string | null;
  name?: string | null;
  groupMembers?: string[];
  feedback?: string | null;
};

export default function CompletedCaseCard({ id, caseId, sessionId, name, groupMembers = [], feedback }: Props) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const canOpenChart = Boolean(caseId && sessionId);

  return (
    <div
      data-testid="case-card"
      data-session-id={sessionId ?? undefined}
      className="border rounded-md p-3 bg-white shadow-sm"
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="font-semibold text-lg pb-2">{name ?? "Untitled Simulation"}</div>
          <CaseCardField label="Group">
            {groupMembers.length ? groupMembers.join(", ") : "No members"}
          </CaseCardField>
        </div>

        <div className="ml-4 flex flex-col gap-2">
          {canOpenChart ? (
            <button
              className="px-3 py-1 text-sm bg-slate-500 text-white rounded hover:bg-slate-700"
              onClick={() => router.push(`/simulation/${caseId}/${sessionId}/chart/overview`)}
              aria-label={`Open read-only chart for ${name ?? id}`}
            >
              View Chart (read-only)
            </button>
          ) : null}
          <button
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() => setOpen(true)}
            aria-label={`View feedback for ${name ?? id}`}
          >
            View Feedback
          </button>
        </div>
      </div>

      {open ? (
        <div className="mt-3 p-3 border rounded bg-slate-50">
          <div className="flex justify-between items-start">
            <div>
              <div className="font-medium">Feedback</div>
              <div className="text-sm text-muted-foreground mt-1">{feedback ?? ""}</div>
            </div>
            <button className="text-sm text-slate-500 ml-4" onClick={() => setOpen(false)} aria-label="Close feedback">
              Close
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
