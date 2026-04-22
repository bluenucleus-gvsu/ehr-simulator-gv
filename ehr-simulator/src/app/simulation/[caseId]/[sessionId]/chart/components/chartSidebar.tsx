"use client";

import { CircleUserRound } from "lucide-react";
import { useMemo } from "react";
import { buildChartDataFromCaseRow } from "./chartData";
import { Skeleton } from "@/components/ui/skeleton";
import { useSimulationCase } from "@/context/SimulationCaseContext";
import { useSimSessionContext } from "@/context/SimSessionContext";

// Define types for local state
interface MarCounts {
  prn: number;
  scheduled: number;
  continuous: number;
}

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
  const { simStartTime } = useSimSessionContext();
  const referenceTime = useMemo(
    () => new Date(simStartTime ?? Date.now()),
    [simStartTime],
  );
  const sidebarData = useMemo(
    () =>
      buildChartDataFromCaseRow((caseBundle?.caseRow as Record<string, unknown> | null | undefined) ?? null, {
        referenceTime,
      }),
    [caseBundle?.caseRow, referenceTime],
  );
  const marData = useMemo<MarCounts>(() => {
    const orders = (caseBundle?.medicationOrders ?? []) as Array<{ priority?: string | null; frequency?: string | null }>;
    return orders.reduce(
      (acc, order) => {
        if ((order.priority ?? "").toUpperCase() === "PRN") {
          acc.prn += 1;
        } else if ((order.frequency ?? "").toUpperCase() === "CONTINUOUS") {
          acc.continuous += 1;
        } else {
          acc.scheduled += 1;
        }
        return acc;
      },
      { prn: 0, continuous: 0, scheduled: 0 },
    );
  }, [caseBundle?.medicationOrders]);
  // --- Render Logic ---

  if (!caseBundle) {
    return (
      <div className="w-64 h-[calc(100vh-4rem)] flex flex-col justify-start items-center bg-gray-200 border-r border-gray-300 p-2 flex-shrink-0">
        <ChartSidebarSkeleton />
      </div>
    )
  }

  if (!sidebarData || Object.keys(sidebarData).length === 0) {
    return (
      <div className="w-64 h-[calc(100vh-4rem)] flex flex-col justify-start items-center bg-gray-200 border-r border-gray-300 p-2 flex-shrink-0">
        <p className="mt-10">No patient data.</p>
      </div>
    )
  }

  // --- Helper Functions ---

  const displayOrderCount = (count: number | undefined) => {
    if (count === undefined) return '';
    if (count === 1) {
      return 'order'
    }
    return 'orders'
  }

  return (
    <div className="w-64 h-[calc(100vh-4rem)] flex flex-col justify-start items-center bg-gray-200 border-r border-gray-300 p-2 flex-shrink-0">
      <span className="rounded-full p-1 bg-gray-100 shadow-md">
        <CircleUserRound size={100} strokeWidth={0.8} color="oklch(38% 0.189 293.745)" className="rounded-full bg-white" />
      </span>
      <div className="flex flex-col items-center">
        <h1 className="text-purple-900 text-lg font-medium tracking-tight">{sidebarData.name.value}</h1>
        <p className="text-purple-900 text-sm tracking-tight">
          {sidebarData.gender.value && sidebarData.gender.value !== "N/A" ? (
            <>
              {sidebarData.gender.value}
              <span className="pl-2 font-normal">
                {sidebarData.dob.value !== "—" ? `${sidebarData.age.value} y.o.` : "—"}
              </span>
            </>
          ) : (
            <span className="font-normal">
              {sidebarData.dob.value !== "—" ? `${sidebarData.age.value} y.o.` : "—"}
            </span>
          )}
        </p>
        <p className="text-purple-900 text-sm font-light tracking-tight">
          {sidebarData.dob.label}:
          <span className="pl-2 font-normal">{sidebarData.dob.value}</span>
        </p>
        <p className="text-purple-900 text-sm font-light tracking-tight">
          {sidebarData.mrn.label}:
          <span className="pl-2 font-normal font-mono text-xs break-all">{sidebarData.mrn.value}</span>
        </p>

        <p className="text-purple-900 text-sm font-light tracking-tight">
          {sidebarData.code.label}:
          <span className="pl-2 font-normal">{sidebarData.code.value}</span>
        </p>
      </div>

      <div className="flex flex-col h-fit max-h-full py-4 px-2 rounded-lg shadow-md mt-4 border gap-6 bg-white overflow-y-auto">
        {/* Current Admission Data */}
        <div className="relative flex flex-col border bg-white border-purple-900 w-full h-fit px-2 py-3 gap-1 rounded-lg shadow-md">
          <p className="font-medium text-purple-900 tracking-tight -top-3 absolute left-2 bg-white rounded-2xl  px-1">This Admission</p>

          <p className="text-purple-900 text-xs font-light tracking-tight">
            <span className="underline">{sidebarData.admissionDate.label}:</span>
            <span className="pl-2 font-normal">{sidebarData.admissionDate.value}</span>
          </p>
          <p className="text-purple-900 text-xs font-light tracking-tight">
            <span className="underline">{sidebarData.attending.label}:</span>
            <span className="pl-2 font-normal">{sidebarData.attending.value}</span>
          </p>
          <p className="text-purple-900 text-xs font-light tracking-tight">
            <span className="underline">{sidebarData.location.label}:</span>
            <span className="pl-2 font-normal">{sidebarData.location.value}</span>
          </p>
        </div>

        {/* Clinical Info */}
        <div className="relative flex flex-col bg-white border border-purple-900 w-full h-fit px-2 py-3 gap-1 rounded-lg shadow-md">
          <p className="font-medium text-purple-900 tracking-tight -top-3 absolute left-2 bg-white rounded-2xl px-1">Clinical Info</p>
          <p className="text-purple-900 text-xs font-light tracking-tight">
            <span className="underline">{sidebarData.height.label}:</span>
            <span className="pl-2 font-normal">{sidebarData.height.value}</span>
          </p>
          <p className="text-purple-900 text-xs font-light tracking-tight">
            <span className="underline">{sidebarData.weight.label}:</span>
            <span className="pl-2 font-normal">{sidebarData.weight.value}</span>
          </p>
          <p className="text-purple-900 text-xs font-light tracking-tight">
            <span className="underline text-nowrap">{sidebarData.isolation.label}:</span>
            <span className="pl-2 font-normal">{sidebarData.isolation.value}</span>
            {/* <span className="pl-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info size={14} color="oklch(38.1% 0.176 304.987)" />
                  </TooltipTrigger>
                  <TooltipContent className="w-fit">
                    <p className="max-w-120 text-wrap">{sidebarData.isolation.tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </span> */}
          </p>
          <p className="text-purple-900 text-xs font-light tracking-tight">
            <span className="underline text-nowrap">{sidebarData.allergies.label}:</span>
            <span className='font-normal decoration-none no-underline px-2  rounded-md'>
              {sidebarData.allergies.value.length ? sidebarData.allergies.value.join(", ") : "N/A"}
            </span>
          </p>
          <p className="text-purple-900 text-xs font-light tracking-tight">
            <span className="underline pr-2 text-nowrap">{sidebarData.pmh.label}:</span>
            <span className='font-normal decoration-none no-underline rounded-md'>
              {sidebarData.pmh.value.length ? sidebarData.pmh.value.join(", ") : "N/A"}
            </span>
          </p>

        </div>

        {/* MAR */}
        <div className="relative flex flex-col bg-white border border-purple-900 w-full h-fit px-2 py-3 gap-1 rounded-lg shadow-md">
          <p className="font-medium text-purple-900 tracking-tight -top-3 absolute left-2 bg-white rounded-2xl px-1">MAR</p>
          <p className="text-purple-900 text-xs tracking-tight">
            <span className="underline">Scheduled:</span>
            <span className="pl-2 font-medium">{marData?.scheduled} {displayOrderCount(marData?.scheduled)}</span>
          </p>
          <p className="text-purple-900 text-xs tracking-tight">
            <span className="underline">PRN:</span>
            <span className="pl-2 font-medium">{marData?.prn} {displayOrderCount(marData?.prn)}</span>
          </p>
          <p className="text-purple-900 text-xs tracking-tight">
            <span className="underline">Continuous:</span>
            <span className="pl-2 font-medium">{marData?.continuous} {displayOrderCount(marData?.continuous)}</span>
          </p>
        </div>
      </div>
    </div>
  )
}