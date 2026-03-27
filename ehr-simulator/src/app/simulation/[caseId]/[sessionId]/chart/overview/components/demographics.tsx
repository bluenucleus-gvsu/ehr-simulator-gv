'use client'

import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import StyledTitle from "./styledTitle"
import { useSimulationCase } from "@/context/SimulationCaseContext"

const Demographics = () => {
  // const { data, isLoading, isError, isFetching, error } = useGetChartQuery()

  // if (isLoading || isFetching) {
  //   return (
  //     <Card className="relative col-span-1 pt-2 overflow-hidden h-fit gap-3">
  //       <StyledTitle color="bg-lime-200" firstLetter="D" secondLetter="emograhics" />
  //       <CardSkeleton />
  //     </Card>
  //   )
  // }

  // if (isError) {
  //   let errorMessage = "An unknown error occurred.";
  //   const err = error as unknown;

  //   function isStatusError(e: unknown): e is { status: number | string; data?: unknown } {
  //     return typeof e === "object" && e !== null && "status" in e;
  //   }

  //   function hasMessageData(e: { data?: unknown }): e is { data: { message?: string } } {
  //     return typeof e.data === "object" && e.data !== null && "message" in e.data;
  //   }

  //   if (isStatusError(err)) {
  //     errorMessage = `Error ${err.status}`;
  //     if (hasMessageData(err)) {
  //       errorMessage += `: ${err.data.message ?? JSON.stringify(err.data)}`;
  //     } else if ("data" in err) {
  //       errorMessage += `: ${JSON.stringify(err.data)}`;
  //     }
  //   } else if (typeof err === "object" && err !== null && "message" in err) {
  //     errorMessage = `Error: ${(err as { message: string }).message}`;
  //   } else {
  //     errorMessage = `Error: ${JSON.stringify(err)}`;
  //   }

  //   return (
  //     <Card className="relative col-span-1 pt-2 overflow-hidden h-fit gap-3">
  //       <StyledTitle color="bg-lime-200" firstLetter="D" secondLetter="emograhics" />
  //       <p>Failed to load data</p>
  //     </Card>

  //   )
  // }

  const { caseBundle } = useSimulationCase();
  const caseRow = caseBundle?.caseRow;
  const valueOrFallback = (value?: string | null) => value || "N/A";
  const relationshipStatus = caseRow?.relationship_status?.name ?? "N/A";

  return (
    <Card className="relative col-span-1 pt-2 overflow-hidden h-fit gap-3">
      <StyledTitle color="bg-lime-200" firstLetter="D" secondLetter="emograhics" />
      <CardContent className="px-4 space-y-1">
        <div className="flex">
          <p className="text-sm pr-2 font-light">Gender: </p>
          <p className="text-sm">N/A</p>
        </div>
        <Separator className="bg-lime-200" />
        <div className="flex">
          <p className="text-sm pr-2 font-light">Gender Identity: </p>
          <p className="text-sm">N/A</p>
        </div>
        <Separator className="bg-lime-200" />
        <div className="flex">
          <p className="text-sm pr-2 font-light">Pronouns: </p>
          <p className="text-sm">N/A</p>
        </div>
        <Separator className="bg-lime-200" /> */}
        <div className="flex">
          <p className="text-sm pr-2 font-light">Relationship Status: </p>
          <p className="text-sm">{relationshipStatus}</p>
        </div>
        <Separator className="bg-lime-200" />
        <div className="flex">
          <p className="text-sm pr-2 font-light">Employment: </p>
          <p className="text-sm">{valueOrFallback(caseRow?.employment)}</p>
        </div>
        <Separator className="bg-lime-200" />
        <div className="flex">
          <p className="text-sm pr-2 font-light">Insurance: </p>
          <p className="text-sm">{caseRow?.insurance ?? "N/A"}</p>
        </div>
        <Separator className="bg-lime-200" />
        <div className="flex">
          <p className="text-sm pr-2 font-light">Religion: </p>
          <p className="text-sm">{valueOrFallback(caseRow?.religion)}</p>
        </div>
        <Separator className="bg-lime-200" />
        <div className="flex">
          <p className="text-sm pr-2 font-light">Language: </p>
          <p className="text-sm">{valueOrFallback(caseRow?.language)}</p>
        </div>
      </CardContent>
      <div className="absolute bottom-0 bg-lime-200 w-full h-3"></div>
    </Card>
  )
}

export default Demographics