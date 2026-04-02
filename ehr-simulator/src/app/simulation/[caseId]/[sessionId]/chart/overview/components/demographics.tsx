'use client'

import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import StyledTitle from "./styledTitle"
// import CardSkeleton from "./cardSkeleton"
import { jamesAllen, type ChartData } from "@/app/simulation/[caseId]/[sessionId]/chart/components/chartData"

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

  const chartData: ChartData | undefined = jamesAllen

  if (!chartData || Object.keys(chartData).length === 0) {
    return (
      <Card className="relative col-span-1 pt-2 overflow-hidden h-fit gap-3">
        <StyledTitle color="bg-lime-200" firstLetter="D" secondLetter="emograhics" />
        <p>No data exists</p>
      </Card>
    )
  }

  return (
    <Card className="relative col-span-1 pt-2 overflow-hidden h-fit gap-3">
      <StyledTitle color="bg-lime-200" firstLetter="D" secondLetter="emograhics" />
      <CardContent className="px-4 space-y-1">
        {/* <div className="flex">
          <p className="text-sm pr-2 font-light">{chartData.gender.label}: </p>
          <p className="text-sm">{chartData.gender.value}</p>
        </div>
        <Separator className="bg-lime-200" />
        <div className="flex">
          <p className="text-sm pr-2 font-light">{chartData.genderIdentity.label}: </p>
          <p className="text-sm">{chartData.genderIdentity.value}</p>
        </div>
        <Separator className="bg-lime-200" />
        <div className="flex">
          <p className="text-sm pr-2 font-light">{chartData.pronouns.label}: </p>
          <p className="text-sm">{chartData.pronouns.value}</p>
        </div>
        <Separator className="bg-lime-200" /> */}
        <div className="flex">
          <p className="text-sm pr-2 font-light">{chartData.relationshipStatus.label}: </p>
          <p className="text-sm">{chartData.relationshipStatus.value}</p>
        </div>
        <Separator className="bg-lime-200" />
        <div className="flex">
          <p className="text-sm pr-2 font-light">{chartData.employmentStatus.label}: </p>
          <p className="text-sm">{chartData.employmentStatus.value}</p>
        </div>
        <Separator className="bg-lime-200" />
        <div className="flex">
          <p className="text-sm pr-2 font-light">{chartData.insurance.label}: </p>
          <p className="text-sm">{chartData.insurance.value}</p>
        </div>
        <Separator className="bg-lime-200" />
        <div className="flex">
          <p className="text-sm pr-2 font-light">{chartData.religion.label}: </p>
          <p className="text-sm">{chartData.religion.value}</p>
        </div>
        <Separator className="bg-lime-200" />
        <div className="flex">
          <p className="text-sm pr-2 font-light">{chartData.language.label}: </p>
          <p className="text-sm">{chartData.language.value}</p>
        </div>
      </CardContent>
      <div className="absolute bottom-0 bg-lime-200 w-full h-3"></div>
    </Card>
  )
}

export default Demographics