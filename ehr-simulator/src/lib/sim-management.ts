import { Tables } from "@/../database.types";

type DBUser = Tables<"users">;
type DBGroup = Tables<"groups">;
type DBCaseSession = Tables<"case_sessions">;
type DBSectionAssignment = Tables<"section_assignments">;
type DBCase = Tables<"cases">;
type DBSection = Tables<"sections">;

// Member: id comes from users, name is derived (full_name || email) so stays string
export type Member = Pick<DBUser, "id"> & { name: string };

export type Group = Pick<DBGroup, "id" | "name"> & {
  caseSessionId: DBCaseSession["id"];
  currentPhase: DBCaseSession["current_phase"];
  members: Member[];
};

export type Simulation = {
  id: DBSectionAssignment["id"];
  caseName: string;
  phaseCount: DBCase["phase_count"];
  simTime: DBSectionAssignment["sim_time"] & string;
  presimTime: DBSectionAssignment["presim_time"] & string;
  groups: Group[];
};

export type Section = Pick<DBSection, "id" | "name"> & {
  simulations: Simulation[];
};

export type Course = Tables<"courses"> & {
  sections: Section[];
};

export type FeedbackTarget =
  | { kind: "group"; groupId: string; groupName: string }
  | { kind: "individual"; studentId: string; studentName: string; groupName: string };


export type ActiveSimView = {
  simulation: Simulation;
  courseName: string;
  sectionName: string;
};