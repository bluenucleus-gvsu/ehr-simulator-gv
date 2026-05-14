"use client";

import { Badge } from "@/components/ui/badge";
import { useSimSessionContext } from "@/context/SimSessionContext";
import { BookOpenCheck, HeartPulse } from "lucide-react";

const SimulationModeBanner = () => {
  const { isPresim, loading } = useSimSessionContext();

  const isPreSimMode = isPresim ?? true;
  const modeLabel = isPreSimMode ? "PRE-SIM MODE" : "ACTIVE SIMULATION";
  const helperText = isPreSimMode
    ? "Review materials before the active simulation begins"
    : "You are now in the live patient chart";
  const accentClasses = isPreSimMode
    ? "border-amber-300 bg-amber-50"
    : "border-emerald-300 bg-emerald-50";
  const iconContainerClasses = isPreSimMode
    ? "bg-amber-100 text-amber-900"
    : "bg-emerald-100 text-emerald-900";
  const statusText = isPreSimMode ? "Preparation Experience" : "Live Simulation Experience";

  return (
    <div className="sticky top-0 z-20 w-full shrink-0 border-b border-slate-200/80 bg-white/95 px-4 py-2 backdrop-blur-sm shadow-sm">
      <div className={`flex items-center justify-between gap-3 rounded-xl border-2 px-4 py-3 shadow-sm ${accentClasses}`}>
        <div className="flex items-center gap-3">
          <div className={`rounded-lg p-2.5 shadow-sm ${iconContainerClasses}`} aria-hidden="true">
            {isPreSimMode ? <BookOpenCheck className="h-5 w-5" /> : <HeartPulse className="h-5 w-5" />}
          </div>
          <div className="flex flex-col">
            <Badge variant="secondary" className="mb-1 w-fit rounded-md text-[11px] font-semibold tracking-[0.08em]">
              {modeLabel}
            </Badge>
            <p className="text-sm font-semibold text-slate-900">
              {loading ? "Loading simulation mode..." : helperText}
            </p>
            <p className="text-xs font-medium text-slate-700/90">{statusText}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimulationModeBanner;
