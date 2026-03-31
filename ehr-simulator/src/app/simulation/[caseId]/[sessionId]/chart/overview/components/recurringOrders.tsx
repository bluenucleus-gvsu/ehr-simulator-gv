
'use client'

import { Tooltip } from "@/components/ui/tooltip"
import { Card, CardContent } from "@/components/ui/card"
import { Info } from "lucide-react"
import { TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import StyledTitle from "./styledTitle"
// import CardSkeleton from "./cardSkeleton"
import { nursingOrders, laboratoryOrders } from "@/app/simulation/[caseId]/[sessionId]/chart/orders/components/orderData"
const RecurringOrders = () => {

  // if (isLoading || (isFetching && !data)) {
  //   return (
  //     <Card className="relative col-span-1 pt-2 overflow-hidden h-fit gap-3">
  //       <StyledTitle color="bg-sky-200" firstLetter="R" secondLetter="ecurring Orders" />
  //       <CardSkeleton />
  //     </Card>
  //   )
  // }

  // return (
  //   <Card className="relative col-span-1 pt-2 overflow-hidden h-fit gap-3">
  //     <StyledTitle color="bg-red-200" firstLetter="A" secondLetter="ctive Problems" />
  //     <p>Failed to load data</p>
  //   </Card>
  // )


  // if (!data || Object.keys(data).length === 0) {
  //   return (
  //     <Card className="relative col-span-1 pt-2 overflow-hidden h-fit gap-3">
  //       <StyledTitle color="bg-red-200" firstLetter="A" secondLetter="ctive Problems" />
  //       <p>No data exists</p>
  //     </Card>
  //   )
  // }




  return (
    <Card className="relative col-span-1 pt-2 overflow-hidden h-fit gap-3">
      <StyledTitle color="bg-sky-200" firstLetter="R" secondLetter="ecurring Orders" />
      <CardContent className="grid gap-4 px-8">
        <div className="flex flex-col w-full items-start gap-1">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium leading-none">Nursing</p>
            {/* Mark nursing orders as routine to display here */}
            {nursingOrders.map(order => {
              const isImportant = order.important
              if (isImportant && isImportant === true) {
                return (
                  <div key={order.title} className="flex pl-2 gap-3 items-center">
                    <p className="text-xs text-neutral-500 tracking-tight">{order.title}</p>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info size={14} color="#d1d5db" />
                        </TooltipTrigger>
                        <TooltipContent className="w-fit">
                          <p className="max-w-120  text-wrap">{order.details}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                )
              }
            })}

            <p className="text-sm font-medium leading-none">Labs</p>
            {/* Mark nursing orders as routine to display here */}
            {laboratoryOrders.map(order => {
              const isImportant = order.important
              if (isImportant && isImportant === true) {
                return (
                  <div key={order.title} className="flex pl-2 gap-3 items-center">
                    <p className="text-xs text-neutral-500 tracking-tight">{order.title}</p>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info size={14} color="#d1d5db" />
                        </TooltipTrigger>
                        <TooltipContent className="w-fit">
                          <p className="max-w-120  text-wrap">{order.details}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                )
              }
            })}
          </div>
        </div>
      </CardContent>
      <div className="absolute bottom-0 bg-sky-200 w-full h-3"></div>
    </Card>
  )
}

export default RecurringOrders
