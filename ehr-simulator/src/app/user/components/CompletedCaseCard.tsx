"use client";
import React, { useState } from "react";

type Props = {
  id: string;
  name?: string | null;
  groupMembers?: string[];
  date?: string | null;
  feedback?: string | null;
};

export default function CompletedCaseCard({ id, name, groupMembers = [], date, feedback }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border rounded-md p-3 bg-white shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <div className="font-semibold">{name ?? "Untitled Simulation"}</div>
          <div className="text-sm text-muted-foreground">Group: {groupMembers.length ? groupMembers.join(", ") : "No members"}</div>
          {date ? <div className="text-xs text-muted-foreground mt-1">{new Date(date).toLocaleString()}</div> : null}
        </div>

        <div className="ml-4 flex items-center gap-2">
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
              <div className="text-sm text-muted-foreground mt-1">{feedback ?? "No feedback available (dummy)"}</div>
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
