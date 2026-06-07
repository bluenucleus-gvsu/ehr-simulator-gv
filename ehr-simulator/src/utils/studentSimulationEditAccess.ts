"use client";

import { useSimSessionContext } from "@/context/SimSessionContext";

/** Students may edit only after the session has started (active simulation). */
export function canStudentEditSimulation(input: {
  userRole?: string | null;
  isPresim?: boolean | null;
}): boolean {
  const role = input.userRole?.trim().toLowerCase() ?? "";
  if (role !== "student") {
    return true;
  }
  return !(input.isPresim ?? true);
}

export function useStudentSimulationEditAccess() {
  const { userRole, isPresim, loading } = useSimSessionContext();
  const isStudent = userRole?.trim().toLowerCase() === "student";
  const canEdit = !loading && canStudentEditSimulation({ userRole, isPresim });

  return {
    canEdit,
    isViewOnly: isStudent && !canEdit,
    isStudent,
    isPresim: isPresim ?? true,
    loading,
  };
}
