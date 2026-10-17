'use client'

import { Card, CardContent } from "@/components/ui/card"
import StyledTitle from "./styledTitle"
import { formatTimeFromOffset } from "@/lib/flexSheet/flexSheetHelpers"
import { getResultStatus, LabSeverityLevel } from "@/app/simulation/[caseId]/[sessionId]/chart/labs/components/labsData"
import { AlertTriangle } from "lucide-react"
import { useMemo } from "react"
import { labTemplate } from "../../labs/components/labsData"
import { buildLabRowsFromBundle } from "../../labs/components/labsFromBundle"
import { toSimReleaseItem } from "@/lib/labTypes"
import { useSimulationCase } from "@/context/SimulationCaseContext"
import { useSimSessionContext } from "@/context/SimSessionContext"
import { isVisibleInSim, resolveDisplayOffset, displayOffsetFor } from "@/lib/faculty/itemRelease"

const HIGHLIGHTED_LABS = [
  "sodium",
  "potassium",
  "creatinine",
  "glucose",
  "rbc",
  "wbc",
  "platelets"
];

export function SelectedLabs() {
  const { caseBundle } = useSimulationCase()
  const { simStartTime, isPresim, releasedItems, isAdminPreview } = useSimSessionContext()
  const startTime = useMemo(() => simStartTime ?? Date.now(), [simStartTime])

  const { filteredData, visibleColumns } = useMemo(() => {
    const { rows, columns } = buildLabRowsFromBundle(caseBundle?.labResults || [], labTemplate)

    const releasedIds = releasedItems.lab_result_releases
    const releasedSet = new Set(releasedIds.keys())
    const visible = columns
      .filter(column => isVisibleInSim(toSimReleaseItem(column), Boolean(isPresim), releasedSet))
      .map(column => ({
        column,
        displayOffset: resolveDisplayOffset(
          displayOffsetFor(column.phase, column.time_offset),
          releasedIds.get(column.id),
          startTime,
        ) ?? 0,
        stagedPreviewPhase: isAdminPreview && column.phase > 1 ? column.phase : null,
      }))
      .sort((a, b) => b.displayOffset - a.displayOffset)

    return {
      filteredData: rows.filter(row => (row.rowType === "results" && row.id) && HIGHLIGHTED_LABS.includes(row.id)),
      visibleColumns: visible,
    }
  }, [caseBundle, isPresim, releasedItems, startTime, isAdminPreview])


  const selectedLabData = filteredData.map(row => {
    const selectedLab = {
      field: row.field,
      dateKey: 0,
      value: '',
      stagedPreviewPhase: null as number | null,
      normalRange: row.normalRange,
      criticalRange: row.criticalRange
    }

    for (const { column, displayOffset, stagedPreviewPhase } of visibleColumns) {
      const valueAtTime = row[column.id];
      if (valueAtTime) {
        selectedLab.value = valueAtTime as string;
        selectedLab.dateKey = displayOffset;
        selectedLab.stagedPreviewPhase = stagedPreviewPhase;
        break;
      }
    }
    if (selectedLab.value) {
      return selectedLab
    }
    return undefined
  }).filter(Boolean)

  // Hide card if no lab data to display
  if (selectedLabData.length === 0) return null

  return (
    <Card className="relative col-span-1 h-fit max-w-full min-w-0 gap-3 overflow-hidden p-0 pt-2">
      <StyledTitle color="bg-sky-200" firstLetter="S" secondLetter="elected Labs" />
      <CardContent className="grid min-w-0 max-w-full grid-cols-2 gap-2 px-4 pb-6 sm:px-6">
        {selectedLabData.map(labData => {
          if (!labData) return null

          const timeLabel = labData.stagedPreviewPhase
            ? null
            : formatTimeFromOffset(labData.dateKey, startTime)
          if (!timeLabel && !labData.stagedPreviewPhase) return null
          const { date: displayDate, time: displayTime } = timeLabel ?? { date: "", time: "" }

          const normalRange = labData.normalRange
          const criticalRange = labData.criticalRange

          const resultStatus = getResultStatus(labData.value, normalRange, criticalRange)
          const isCritical = resultStatus === LabSeverityLevel.CRITICAL;
          const isAbnormal = resultStatus === LabSeverityLevel.ABNORMAL;


          return (
            <div key={labData.field} className="grid grid-cols-2 rounded-md">
              <div className="p-1 rounded-t-lg col-span-2 border bg-sky-200 border-sky-200 flex justify-center items-center gap-4">
                {labData.stagedPreviewPhase ? (
                  <h1 className="text-xs text-neutral-800 font-medium overflow-hidden">
                    Phase {labData.stagedPreviewPhase}
                  </h1>
                ) : (
                  <>
                    <h2 className="text-xs text-neutral-800 overflow-hidden">{displayDate}</h2>
                    <h1 className="text-xs text-neutral-800 font-medium overflow-hidden">{displayTime}</h1>
                  </>
                )}
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
