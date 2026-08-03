/** Shared row shape for course simulation assignment tables (admin course detail). */
export interface SimAssignment {
  id: string;
  simTime: string;
  presimTime: string;
  sessionId: string | null;
  sessionStatus: string | null;
  sectionName: string;
  sectionId: string;
  caseName: string;
  caseId: string;
  caseDescription: string;
  caseDiagnosis: string;
}
