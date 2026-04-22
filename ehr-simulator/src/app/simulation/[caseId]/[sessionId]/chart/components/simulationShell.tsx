"use client";

import { useSimSessionContext } from "@/context/SimSessionContext";

const SimulationShell = ({ children }: { children: React.ReactNode }) => {
  const { isPresim } = useSimSessionContext();
  const shellClasses = isPresim ?? true ? "bg-amber-600" : "bg-lime-600";

  return (
    <div className={`${shellClasses} h-screen w-full overflow-hidden flex flex-col [--header-height:calc(--spacing(16))]`}>
      {children}
    </div>
  );
};

export default SimulationShell;
