"use client";

import { useEffect, useMemo, useState } from "react";
import AssignedCaseCard from "@/app/user/components/AssignedCaseCard";
import { createBrowserClient } from "@supabase/ssr";
import { getAllTesterSectionAssignments, getTesterCases } from "@/utils/testerLocalStore";
import { isTesterModeClient } from "@/utils/testerMode";

type LocalAssignment = {
  id: string;
  case_id: string;
  sim_time: string;
  presim_time: string;
  session_id?: string | null;
  tester_user_id?: string | null;
};

export default function TesterAssignedCasesPanel() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!isTesterModeClient()) return;
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
    void supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  const assignments = useMemo(() => {
    if (!isTesterModeClient()) return [] as LocalAssignment[];
    const all = getAllTesterSectionAssignments<LocalAssignment>();
    if (!userId) return [];
    return all.filter((assignment) => assignment.tester_user_id === userId);
  }, [userId]);

  const casesById = useMemo(() => {
    const allCases = getTesterCases<Array<{ id: string; name?: string; first_name?: string; last_name?: string }>[number]>();
    return new Map(allCases.map((simCase) => [simCase.id, simCase]));
  }, [userId]);

  if (!isTesterModeClient() || assignments.length === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <h3 className="text-lg font-semibold mb-3">Tester Assigned Simulations</h3>
      <ul className="space-y-2">
        {assignments.map((assignment) => {
          const simCase = casesById.get(assignment.case_id);
          const displayName =
            simCase?.name || `${simCase?.first_name ?? ""} ${simCase?.last_name ?? ""}`.trim() || "Untitled Simulation";
          return (
            <li key={assignment.id}>
              <AssignedCaseCard
                id={assignment.id}
                caseId={assignment.case_id}
                sessionId={assignment.session_id ?? null}
                name={displayName}
                simTime={assignment.sim_time}
                presimTime={assignment.presim_time}
                groupMembers={["You (Tester)"]}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
