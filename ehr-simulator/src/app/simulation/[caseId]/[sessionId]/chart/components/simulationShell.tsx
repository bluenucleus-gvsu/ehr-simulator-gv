"use client";

import { useSimSessionContext } from "@/context/SimSessionContext";
import PhaseUpdateDialog from "./phaseUpdateDialog";

const SimulationShell = ({ children }: { children: React.ReactNode }) => {
  const { isPresim } = useSimSessionContext();
  const shellClasses = isPresim ?? true ? "bg-amber-600" : "bg-lime-600";

  return (
    <div className={`${shellClasses} h-screen w-full overflow-hidden flex flex-col [--header-height:calc(--spacing(16))]`}>
      <PhaseUpdateDialog />
      {children}
    </div>
  );
};

export default SimulationShell;
