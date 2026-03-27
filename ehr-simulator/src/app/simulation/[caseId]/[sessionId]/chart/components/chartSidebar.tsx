 "use client";

import { CircleUserRound, Info } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { differenceInYears, format, subDays } from "date-fns";
import { useMemo } from "react";
import { useSimulationCase } from "@/context/SimulationCaseContext";
import {
  buildMarFromCaseBundle,
  countMarOrdersByCategory,
} from "@/app/simulation/[sessionId]/chart/mar/components/marFromBundle";

function ChartSidebarSkeleton() {
  return (
    <div className="flex flex-col items-center justify-start h-full w-full py-8 gap-3">
      <Skeleton className="h-28 w-1/2 bg-gray-300 rounded-full mb-6" />
      <Skeleton className="h-4 w-3/4 bg-gray-300" />
      <Skeleton className="h-4 w-3/5 bg-gray-300" />
      <Skeleton className="h-4 w-3/4 bg-gray-300 mb-6" />
      <Skeleton className="h-4 w-3/4 bg-gray-300" />
      <Skeleton className="h-4 w-3/4 bg-gray-300" />
      <Skeleton className="h-4 w-5/8 bg-gray-300 mb-6" />
      <Skeleton className="h-4 w-3/4 bg-gray-300" />
      <Skeleton className="h-4 w-3/4 bg-gray-300" />
      <Skeleton className="h-4 w-3/4 bg-gray-300" />
    </div>
  );
}

export default function ChartSidebar() {
  const { caseBundle } = useSimulationCase();
  const caseRow = caseBundle?.caseRow;
  const sessionStartTime = new Date().getTime();

  const marCounts = useMemo(() => {
    const { medicationOrders } = buildMarFromCaseBundle(caseBundle ?? null);
    return countMarOrdersByCategory(medicationOrders);
  }, [caseBundle]);

  // --- Render Logic ---

  if (!caseRow) {
    return (
      <div className="w-64 h-[calc(100vh-4rem)] flex flex-col justify-start items-center bg-gray-200 border-r border-gray-300 p-2 flex-shrink-0">
        <ChartSidebarSkeleton />
      </div>
    )
  }

  // --- Helper Functions ---

  /** Parse DB yyyy-mm-dd in local time so the calendar day does not shift (UTC parse bug). */
  const parseDobLocal = (dobValue?: string | null): Date | null => {
    if (!dobValue) return null;
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(dobValue).trim());
    if (m) {
      const y = Number(m[1]);
      const mo = Number(m[2]);
      const d = Number(m[3]);
      if (Number.isFinite(y) && mo >= 1 && mo <= 12 && d >= 1 && d <= 31) {
        const dt = new Date(y, mo - 1, d);
        if (!isNaN(dt.getTime())) return dt;
      }
    }
    const fallback = new Date(dobValue);
    return isNaN(fallback.getTime()) ? null : fallback;
  };

  const displayDob = (dobValue?: string | null) => {
    const parsedDob = parseDobLocal(dobValue);
    if (!parsedDob) return "N/A";
    return format(parsedDob, "P");
  };

  const displayAdmissionDate = (currDate: number, daysIp?: number | null) => {
    if (daysIp === null || daysIp === undefined) return "N/A";
    const admissionDate = subDays(currDate, daysIp)
    return format(admissionDate, "P")
  };

  const resolvedPatientName =
    [caseRow?.first_name, caseRow?.last_name]
      .filter(Boolean)
      .join(" ")
      .trim() || caseRow?.name || "N/A";

  const dobForAge = parseDobLocal(caseRow?.date_of_birth);
  const displayDobAge = dobForAge
    ? differenceInYears(new Date(), dobForAge)
    : "N/A";
  const displayMrn = "N/A";
  const displayCode = caseRow?.code_status ?? "N/A";
  const displayAttending = caseRow?.attending_provider ?? "N/A";
  const displayLocation = "N/A";
  const displayHeight = (caseRow?.height_ft || caseRow?.height_in)
    ? `${caseRow.height_ft ?? 0}' ${caseRow.height_in ?? 0}"`
    : "N/A";
  const displayWeight = caseRow?.weight_kg ? `${caseRow.weight_kg} kg` : "N/A";
  const displayIsolation = caseRow?.isolation_precautions?.name ?? "N/A";
  const displayAllergies = caseRow?.allergies?.length ? caseRow.allergies.join(", ") : "N/A";
  const displayPmh = caseRow?.medical_history?.length ? caseRow.medical_history.join(", ") : "N/A";

  return (
    <div className="w-64 h-[calc(100vh-4rem)] flex flex-col justify-start items-center bg-gray-200 border-r border-gray-300 p-2 flex-shrink-0">
      <span className="rounded-full p-1 bg-gray-100 shadow-md">
        <CircleUserRound size={100} strokeWidth={0.8} color="oklch(38% 0.189 293.745)" className="rounded-full bg-white" />
      </span>
      <div className="flex flex-col items-center">
        <h1 className="text-purple-900 text-lg font-medium tracking-tight">{resolvedPatientName}</h1>
        <p className="text-purple-900 text-sm tracking-tight">
          <span className="font-normal">{displayDobAge === "N/A" ? "Age: N/A" : `Age: ${displayDobAge} y.o.`}</span>
        </p>
        <p className="text-purple-900 text-sm font-light tracking-tight">
          DOB:
          <span className="pl-2 font-normal">{displayDob(caseRow?.date_of_birth)}</span>
        </p>
        <p className="text-purple-900 text-sm font-light tracking-tight">
          MRN:
          <span className="pl-2 font-normal">{displayMrn}</span>
        </p>

        <p className="text-purple-900 text-sm font-light tracking-tight">
          Code:
          <span className="pl-2 font-normal">{displayCode}</span>
        </p>
      </div>

      <div className="flex flex-col h-fit max-h-full py-4 px-2 rounded-lg shadow-md mt-4 border gap-6 bg-white overflow-y-auto">
        {/* Current Admission Data */}
        <div className="relative flex flex-col border bg-white border-purple-900 w-full h-fit px-2 py-3 gap-1 rounded-lg shadow-md">
          <p className="font-medium text-purple-900 tracking-tight -top-3 absolute left-2 bg-white rounded-2xl  px-1">This Admission</p>

          <p className="text-purple-900 text-xs font-light tracking-tight">
            <span className="underline">Admission Date:</span>
            <span className="pl-2 font-normal">{displayAdmissionDate(sessionStartTime, caseRow?.inpatient_duration_days)}</span>
          </p>
          <p className="text-purple-900 text-xs font-light tracking-tight">
            <span className="underline">Attending Provider:</span>
            <span className="pl-2 font-normal">{displayAttending}</span>
          </p>
          <p className="text-purple-900 text-xs font-light tracking-tight">
            <span className="underline">Location:</span>
            <span className="pl-2 font-normal">{displayLocation}</span>
          </p>
        </div>

        {/* Clinical Info */}
        <div className="relative flex flex-col bg-white border border-purple-900 w-full h-fit px-2 py-3 gap-1 rounded-lg shadow-md">
          <p className="font-medium text-purple-900 tracking-tight -top-3 absolute left-2 bg-white rounded-2xl px-1">Clinical Info</p>
          <p className="text-purple-900 text-xs font-light tracking-tight">
            <span className="underline">Height:</span>
            <span className="pl-2 font-normal">{displayHeight}</span>
          </p>
          <p className="text-purple-900 text-xs font-light tracking-tight">
            <span className="underline">Weight:</span>
            <span className="pl-2 font-normal">{displayWeight}</span>
          </p>
          <p className="text-purple-900 text-xs font-light tracking-tight">
            <span className="underline text-nowrap">Isolation:</span>
            <span className="pl-2 font-normal">{displayIsolation}</span>
            <span className="pl-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info size={14} color="oklch(38.1% 0.176 304.987)" />
                  </TooltipTrigger>
                  <TooltipContent className="w-fit">
                    <p className="max-w-120 text-wrap">{displayIsolation}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </span> */}
          </p>
          <p className="text-purple-900 text-xs font-light tracking-tight">
            <span className="underline pr-2 text-nowrap">Allergies:</span>
            <span className='font-normal decoration-none no-underline px-2 bg-yellow-200 rounded-md'>
              {displayAllergies}
            </span>
          </p>
          <p className="text-purple-900 text-xs font-light tracking-tight">
            <span className="underline pr-2 text-nowrap">Past Medical History:</span>
            <span className='font-normal decoration-none no-underline rounded-md'>
              {displayPmh}
            </span>
          </p>

        </div>

        {/* MAR */}
        <div className="relative flex flex-col bg-white border border-purple-900 w-full h-fit px-2 py-3 gap-1 rounded-lg shadow-md">
          <p className="font-medium text-purple-900 tracking-tight -top-3 absolute left-2 bg-white rounded-2xl px-1">MAR</p>
          <p className="text-purple-900 text-xs tracking-tight">
            <span className="underline">Scheduled:</span>
            <span className="pl-2 font-medium">{marCounts.scheduled}</span>
          </p>
          <p className="text-purple-900 text-xs tracking-tight">
            <span className="underline">PRN:</span>
            <span className="pl-2 font-medium">{marCounts.prn}</span>
          </p>
          <p className="text-purple-900 text-xs tracking-tight">
            <span className="underline">Continuous:</span>
            <span className="pl-2 font-medium">{marCounts.continuous}</span>
          </p>
        </div>
      </div>
    </div>
  )
}