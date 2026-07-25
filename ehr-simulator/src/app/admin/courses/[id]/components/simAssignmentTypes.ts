export interface SimAssignment {
  id: string;
  simTime: string;
  presimTime: string;
  sessionId: string | null;
  sessionStatus: string | null;
  sessions?: Array<{
    id: string;
    status: string | null;
    groupId: string | null;
    currentPhase: number | null;
  }>;
  sectionName: string;
  sectionId: string;
  caseName: string;
  caseId: string;
  caseDescription: string;
  caseDiagnosis: string;
}
