
export interface SimAssignment {
  id: string;
  simTime: string;
  presimTime: string;
  /** Representative status across the assignment's per-group sessions (in progress > assigned > unassigned > first). */
  sessionStatus: string | null;
  sectionName: string;
  sectionId: string;
  caseName: string;
  caseId: string;
  caseDescription: string;
  caseDiagnosis: string;
}
