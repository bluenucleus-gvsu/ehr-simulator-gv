import { Card, CardContent } from "@/components/ui/card"
import StyledTitle from "./styledTitle"

const MarSnapshot = () => {
  // const {data, isLoading, isError, isFetching, error} = useGetChartQuery()

  // if (isLoading || isFetching ) {
  //   return (
  //     <Card className="relative col-span-1 pt-2 overflow-hidden h-fit gap-3">
  //       <StyledTitle color="bg-red-200" firstLetter="A" secondLetter="ctive Problems" />
  //       <CardSkeleton />
  //     </Card>
  //   )
  // }

  // // from RTK query docs
  // if (isError) {
  //   let errorMessage = "An unknown error occurred.";
  //   if (error) {
  //     if ('status' in error && error.status) {
  //       errorMessage = `Error ${error.status}`;
  //       if ('data' in error && typeof error.data === 'object' && error.data !== null && 'message' in error.data) {
  //         errorMessage += `: ${(error.data as any).message}`;
  //       }
  //     } else if ('message' in error) {
  //       errorMessage = `Error: ${error.message}`;
  //     } else {
  //       errorMessage = `Error: ${JSON.stringify(error)}`;
  //     }
  //   }
  //   console.log(errorMessage)
  //   return (
  //     <Card className="relative col-span-1 pt-2 overflow-hidden h-fit gap-3">
  //       <StyledTitle color="bg-red-200" firstLetter="A" secondLetter="ctive Problems" />
  //       <p>Failed to load data</p>
  //     </Card>

  //   )
  // }


  // if (!chartData || Object.keys(chartData).length === 0) {
  //   return (
  //     <Card className="relative col-span-1 pt-2 overflow-hidden h-fit gap-3">
  //       <StyledTitle color="bg-red-200" firstLetter="A" secondLetter="ctive Problems" />
  //       <p>No data exists</p>
  //     </Card>
  //   )
  // }

  // const isPmhArray = (item: any): item is StringArrayValueItem => {
  //   return item?.id === "pmh" && Array.isArray(item?.value);
  // }

  // const pmh = chartData.clinicalInfo.find(item => item.id === "pmh");
  // const problems = isPmhArray(pmh) ? pmh.value : [];

  return (
    <Card className="relative col-span-1 pt-2 overflow-hidden h-fit gap-3">
      <StyledTitle color="bg-red-200" firstLetter="M" secondLetter="AR Snapshot" />
      <CardContent className="px-4 space-y-1">
        <div className="h-40 w-full border border-red-200 rounded-xl"></div>
      </CardContent>
      <div className="absolute bottom-0 bg-red-200 w-full h-3"></div>
    </Card>
  )
}

export default MarSnapshot