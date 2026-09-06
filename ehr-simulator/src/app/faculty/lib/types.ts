import { Tables } from "../../../../database.types"; // path to the file you uploaded

// Aliases for the raw rows you care about
type DBUser             = Tables<"users">;
type DBGroup            = Tables<"groups">;
type DBCaseSession      = Tables<"case_sessions">;
type DBSectionAssignment = Tables<"section_assignments">;
type DBCase             = Tables<"cases">;
type DBSection          = Tables<"sections">;
type DBCourse           = Tables<"courses">;

// Member: id comes from users, name is derived (full_name || email) so stays string
export type Member = Pick<DBUser, "id"> & { name: string };

// Group: id/name from groups, caseSessionId/currentPhase from case_sessions
export type Group = Pick<DBGroup, "id" | "name"> & {
  caseSessionId:  DBCaseSession["id"];
  currentPhase:   DBCaseSession["current_phase"];
  members: Member[];
};

// Simulation: id from section_assignments, caseName is derived so stays string
export type Simulation = {
  id:         DBSectionAssignment["id"];
  caseName:   string;                        // derived: cases.name || first+last
  phaseCount: DBCase["phase_count"];
  simTime:    DBSectionAssignment["sim_time"] & string;
  presimTime: DBSectionAssignment["presim_time"] & string;
  groups:     Group[];
};

export type Section = Pick<DBSection, "id" | "name"> & {
  simulations:  Simulation[];
};

export type Course = Pick<DBCourse, "id" | "code" | "name" | "active"> & {
  sections: Section[];
};

// Used for SimulationGroupsView.tsx
export type FeedbackTarget =
  | { kind: "group"; groupId: string; groupName: string }
  | { kind: "individual"; studentId: string; studentName: string; groupName: string };


export type ActiveSimView = {
  simulation: Simulation;
  courseName: string;
  sectionName: string;
};