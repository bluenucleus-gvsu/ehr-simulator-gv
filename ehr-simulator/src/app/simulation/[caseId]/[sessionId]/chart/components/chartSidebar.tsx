"use client";

import { CircleUserRound } from "lucide-react";
import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useSimulationCase } from "@/context/SimulationCaseContext";

interface MarCounts {
  prn: number;
  scheduled: number;
  continuous: number;
}

function formatHeight(heightFt: unknown, heightIn: unknown): string {
  const feet = String(heightFt ?? "0").trim();
  const inches = String(heightIn ?? "0").trim();
  return `${feet}' ${inches}"`;
}

function formatWeight(weightKg: unknown): string {
  const value = String(weightKg ?? "").trim();
  return value ? `${value} kg` : "---";
}

export function valueFromJoinedName(raw: unknown): string {
  if (Array.isArray(raw)) {
    const first = raw[0] as { name?: string } | undefined;
    return first?.name?.trim() || "";
  }
  if (raw && typeof raw === "object") {
    return String((raw as { name?: string }).name ?? "").trim() || "None";
  }
  return "None";
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
  const patientDetails = caseBundle?.caseRow

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

  if (!caseBundle) {
    return (
      <div className="w-64 h-full min-h-0 flex flex-col justify-start items-center bg-gray-200 border-r border-gray-300 p-2 flex-shrink-0">
        <ChartSidebarSkeleton />
      </div>
    )
  }

  if (!patientDetails) {
    return (
      <div className="w-64 h-full min-h-0 flex flex-col justify-start items-center bg-gray-200 border-r border-gray-300 p-2 flex-shrink-0">
        <p className="mt-10">No patient data.</p>
      </div>
    )
  }
  const fullName = [patientDetails.first_name, patientDetails.last_name].filter(Boolean).join(' ')

  const allergies = !patientDetails.allergies || patientDetails.allergies.length === 0
    ? "None" : patientDetails.allergies.join(', ');

  const pmh = !patientDetails.medical_history || patientDetails.medical_history.length === 0
    ? "None" : patientDetails.medical_history.join(', ');

  const displayOrderCount = (count: number | undefined) => {
    if (count === undefined) return '';
    if (count === 1) {
      return 'order'
    }
    return 'orders'
  }

  return (
    <div className="w-64 h-full min-h-0 flex flex-col justify-start items-center bg-gray-200 border-r border-gray-300 p-2 flex-shrink-0">
      <span className="rounded-full p-1 bg-gray-100 shadow-md">
        <CircleUserRound size={100} strokeWidth={0.8} color="oklch(38% 0.189 293.745)" className="rounded-full bg-white" />
      </span>
      <div className="flex flex-col items-center">
        <h1 className="text-purple-900 text-lg font-medium tracking-tight">{fullName}</h1>
        <p className="text-purple-900 text-sm font-light tracking-tight">
          Age:
          <span className="pl-2 font-normal">{"TEMP AGE"}</span>
        </p>

        <p className="text-purple-900 text-sm font-light tracking-tight">
          MRN:
          <span className="pl-2 font-normal">{patientDetails.mrn}</span>
        </p>

        <p className="text-purple-900 text-sm font-light tracking-tight">
          Code Status:
          <span className="pl-2 font-normal">{patientDetails.code_status}</span>
        </p>
      </div>

      <div className="flex flex-col h-fit max-h-full w-full py-4 px-2 rounded-lg shadow-md mt-4 border gap-6 bg-white overflow-y-auto">
        {/* Current Admission Data */}
        <div className="relative flex flex-col border bg-white border-purple-900 w-full h-fit px-2 py-3 gap-1 rounded-lg shadow-md">
          <p className="font-medium text-purple-900 tracking-tight -top-3 absolute left-2 bg-white rounded-2xl  px-1">This Admission</p>

          <p className="text-purple-900 text-xs font-light tracking-tight">
            <span className="underline">Attending Provider:</span>
            <span className="pl-2 font-normal">{patientDetails.attending_provider}</span>
          </p>
          <p className="text-purple-900 text-xs font-light tracking-tight">
            <span className="underline">Location:</span>
            <span className="pl-2 font-normal">Simulation Suite</span>
          </p>
        </div>

        {/* Clinical Info */}
        <div className="relative flex flex-col bg-white border border-purple-900 w-full h-fit px-2 py-3 gap-1 rounded-lg shadow-md">
          <p className="font-medium text-purple-900 tracking-tight -top-3 absolute left-2 bg-white rounded-2xl px-1">Clinical Info</p>
          <p className="text-purple-900 text-xs font-light tracking-tight">
            <span className="underline">Height:</span>
            <span className="pl-2 font-normal">{formatHeight(patientDetails.height_ft, patientDetails.height_in)}</span>
          </p>
          <p className="text-purple-900 text-xs font-light tracking-tight">
            <span className="underline">Weight:</span>
            <span className="pl-2 font-normal">{formatWeight(patientDetails.weight_kg)}</span>
          </p>
          <p className="text-purple-900 text-xs font-light tracking-tight">
            <span className="underline text-nowrap">Isolation Status:</span>
            <span className="pl-2 font-normal">{valueFromJoinedName(patientDetails.isolation_precautions)}</span>
          </p>
          <p className="text-purple-900 text-xs font-light tracking-tight">
            <span className="underline text-nowrap">Allergies:</span>
            <span className='font-normal decoration-none no-underline px-2 rounded-md'>{allergies}</span>
          </p>
          <p className="text-purple-900 text-xs font-light tracking-tight">
            <span className="underline pr-2 text-nowrap">Past Medical History:</span>
            <span className='font-normal decoration-none no-underline rounded-md'>{pmh}</span>
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