'use client'

import { Card, CardContent } from "@/components/ui/card"
import StyledTitle from "./styledTitle"
// import CardSkeleton from "./cardSkeleton"
import { formatTimeFromOffset } from "@/app/simulation/[sessionId]/chart/charting/page"
import { getResultStatus } from "@/app/simulation/[sessionId]/chart/labs/page"
import { AlertTriangle } from "lucide-react"
import { useState } from "react"
import { generateAllInitialLabTimes, generateInitialLabData, labTemplate } from "../../labs/components/labsData"


const selectedLabs = [
  "Sodium",
  "Potassium",
  "Creatinine",
  "Glucose",
  "RBC",
  "WBC",
  "Platelets"
];

export function SelectedLabs() {
  const [startTime] = useState(new Date().getTime())
  const [labTimes] = useState(generateAllInitialLabTimes(startTime))
  const [initialLabTableData] = useState(generateInitialLabData(labTimes, labTemplate));



  // if (isLoading || isFetching || skip) {
  //   return (
  //     <Card className="relative pt-2 overflow-hidden h-fit gap-3">
  //       <StyledTitle color="bg-lime-200" firstLetter="S" secondLetter="elected Labs" />
  //       <CardSkeleton />
  //     </Card>
  //   )
  // }


  // if (!data || Object.keys(data).length === 0) {
  //   return (
  //     <Card className="relative col-span-1 pt-2 overflow-hidden h-fit gap-3">
  //       <StyledTitle color="bg-red-200" firstLetter="A" secondLetter="ctive Problems" />
  //       <p>No data exists</p>
  //     </Card>
  //   )
  // }

  const filteredData = initialLabTableData.filter(row => {
    return selectedLabs.includes(row.field)
  })

  const selectedLabData = filteredData.map(row => {
    const selectedLab = {
      field: row.field,
      dateKey: 0,
      value: '',
      normalRange: row.normalRange,
      criticalRange: row.criticalRange
    }

    // Iterate backwards through time
    for (let i = 0; i < labTimes.length; i++) {
      const timePoint = labTimes[i];
      const timestampKey = timePoint.dateKey;

      const valueAtTime = row[timestampKey];

      if (valueAtTime) {
        selectedLab.value = valueAtTime as string;
        selectedLab.dateKey = timestampKey;
        break
      }
    }
    if (selectedLab.value) {
      return selectedLab
    }
    return undefined
  }).filter(Boolean)

  return (
    <Card className="relative col-span-1 p-0 gap-3 pt-2 h-fit overflow-hidden">
      <StyledTitle color="bg-sky-200" firstLetter="S" secondLetter="elected Labs" />
      <CardContent className="grid grid-cols-2 gap-2 px-6 pb-6">
        {selectedLabData.map(labData => {
          if (!labData) return null

          const { date: displayDate, time: displayTime } = formatTimeFromOffset(labData.dateKey, startTime)

          const normalRange = labData.normalRange
          const criticalRange = labData.criticalRange

          const resultStatus = getResultStatus(labData.value, normalRange, criticalRange)
          const isCritical = resultStatus === "critical"
          const isAbnormal = resultStatus === "abnormal"


          return (
            <div key={labData.field} className="grid grid-cols-2 rounded-md">
              <div className="p-1 rounded-t-lg col-span-2 border bg-sky-200 border-sky-200 flex justify-center items-center gap-4">
                <h2 className="text-xs text-neutral-800 overflow-hidden">{displayDate}</h2>
                <h1 className="text-xs text-neutral-800 font-medium overflow-hidden">{displayTime}</h1>
              </div>
              <p className="p-1 text-xs rounded-bl-lg border-l border-r border-b border-sky-200 overflow-hidden">{labData.field}</p>
              <div className="flex justify-center p-1 text-center text-xs rounded-br-lg border-r border-b border-sky-200">
                {isCritical && <AlertTriangle color="#e7000b" size={18} />}
                <p className={`w-full ${(isAbnormal || isCritical) && "text-red-600 font-medium"}`}>{labData.value}</p>
              </div>
            </div>
          )
        })}
      </CardContent>
      <div className="absolute bottom-0 bg-sky-200 w-full h-3"></div>
    </Card>
  )
}
