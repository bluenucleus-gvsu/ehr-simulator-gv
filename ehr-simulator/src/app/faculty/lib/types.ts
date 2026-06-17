export type Member = {
  id: string;
  name: string;
};

export type Group = {
  id: string;
  name: string;
  caseSessionId: string;
  currentPhase: number;
  members: Member[];
};

export type Simulation = {
  id: string;            // This is section_assignment_id (The Master Key)
  caseName: string;
  phaseCount: number;
  simTime: string;
  presimTime: string;   
  groups: Group[];
};

export type Section = {
  id: string;
  name: string;
  simulations: Simulation[];
};

export type Course = {
  id: string;
  code: string;
  name: string;
  active: boolean;
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