"use client"

import { type LabTableData } from "@/app/simulation/[caseId]/[sessionId]/chart/labs/components/labsData"
import { labTemplate } from "@/app/simulation/[caseId]/[sessionId]/chart/labs/components/labsData"
import { useReactTable, getCoreRowModel, createColumnHelper } from "@tanstack/react-table"
import { useMemo, useState, useEffect } from "react"
import { Tooltip, TooltipTrigger } from "@/components/ui/tooltip"
import { TooltipContent, TooltipPortal } from "@radix-ui/react-tooltip"
import { FolderPen, ArrowLeft } from "lucide-react"
import { AddTableColumn } from "@/app/admin/case-builder/form/labs/components/addTimeCol"
import { Label } from "@/components/ui/label"
import Combobox from "@/components/ui/combobox"
import { useRouter, useParams } from "next/navigation"
import { LabTableImagingReport, LabTableInputCell, LabTableMicrobioReport } from "@/app/admin/case-builder/form/labs/components/labTableInputCell"
import { TableFormHeader } from "@/app/admin/case-builder/components/tableFormHeader"
import { FormTable } from "@/app/admin/case-builder/components/FormTable"
import { Button } from "@/components/ui/button"
import { getLabResultsForCase, replaceLabResults, type LabResultRow, type LabResultInsert } from "@/actions/labs"

const columnHelper = createColumnHelper<LabTableData>()

// Map from labTemplate field name → DB column name
const FIELD_TO_DB_COL: Record<string, string> = {
  "Sodium": "sodium",
  "Potassium": "potassium",
  "Chloride": "chloride",
  "BUN": "bun",
  "Creatinine": "creatinine",
  "Glucose": "glucose",
  "CO2": "co2",
  "Calcium": "calcium",
  "Lactate": "lactate",
  "RBC": "rbc",
  "Hemoglobin": "hemoglobin",
  "Hematocrit": "hematocrit",
  "MCV": "mcv",
  "MCH": "mch",
  "MCHC": "mchc",
  "WBC": "wbc",
  "Platelets": "platelets",
  "pCO2": "pco2",
  "pO2": "po2",
  "HCO3": "hco3",
  "AST": "ast",
  "ALT": "alt",
  "ALP": "alp",
  "Troponin": "troponin",
  "CKMB": "ckmb",
  "Myoglobin": "myoglobin",
  "Total Cholesterol": "total_cholesterol",
  "HDL Cholesterol": "hdl_cholesterol",
  "LDL Cholesterol": "ldl_cholesterol",
  "Triglycerides": "triglycerides",
  "Total Bilirubin": "total_bilirubin",
  "Albumin": "albumin",
  "Ammonia": "ammonia",
  "Lipase": "lipase",
  "Amylase": "amylase",
  "ESR": "esr",
  "CRP": "crp",
  "Magnesium": "magnesium",
  "Phosphate": "phosphate",
  "Free T3": "free_t3",
  "Free T4": "free_t4",
  "TSH": "tsh",
  "PT": "pt",
  "PTT": "ptt",
  "Urine pH": "urine_ph",
  "Urine Glucose": "urine_glucose",
  "Protein": "protein",
  "Ketones": "ketones",
  "Blood": "blood",
  "Nitrites": "nitrites",
  "Leukocyte Esterase": "leukocyte_esterase",
  "Specific Gravity": "specific_gravity",
}

// Overlay DB rows onto the static labTemplate structure
function buildTableData(rows: LabResultRow[]): LabTableData[] {
  return labTemplate.map(templateRow => {
    const row: LabTableData = {
      field: templateRow.field,
      rowType: templateRow.rowType,
      ...(templateRow.unit !== undefined && { unit: templateRow.unit }),
      ...(templateRow.normalRange && { normalRange: templateRow.normalRange }),
      ...(templateRow.criticalRange && { criticalRange: templateRow.criticalRange }),
      ...(templateRow.hideable && { hideable: templateRow.hideable }),
    }

    if (templateRow.rowType === "results") {
      const dbCol = FIELD_TO_DB_COL[templateRow.field]
      for (const dbRow of rows) {
        const val = dbCol ? (dbRow as Record<string, unknown>)[dbCol] : null
        row[dbRow.time_offset] = (val !== null && val !== undefined) ? String(val) : ''
      }
    }

    if (templateRow.rowType === "imaging" || templateRow.rowType === "microbiology") {
      for (const dbRow of rows) {
        const complexData = dbRow.data && typeof dbRow.data === 'object'
          ? (dbRow.data as Record<string, unknown>)[templateRow.field]
          : undefined
        row[dbRow.time_offset] = complexData ?? {}
      }
    }

    return row
  })
}

// Convert current table state back to insert rows (one per time column)
function tableDataToInsertRows(
  labTableData: LabTableData[],
  timePoints: number[],
  timePointsInPresim: Set<number>
): Omit<LabResultInsert, 'case_id'>[] {
  return timePoints.map(timePoint => {
    const scalarFields: Record<string, unknown> = {}
    const complexFields: Record<string, unknown> = {}

    for (const row of labTableData) {
      if (row.rowType === 'divider') continue
      const val = row[timePoint as unknown as keyof LabTableData]
      if (val === undefined || val === null || val === '') continue

      if (row.rowType === 'results') {
        const dbCol = FIELD_TO_DB_COL[row.field]
        if (dbCol) scalarFields[dbCol] = val
      } else {
        // imaging / microbiology → data Json column
        if (typeof val === 'object' && Object.keys(val as object).length > 0) {
          complexFields[row.field] = val
        }
      }
    }

    return {
      time_offset: timePoint,
      is_in_presim: timePointsInPresim.has(timePoint),
      ...(Object.keys(complexFields).length > 0 && { data: complexFields }),
      ...scalarFields,
    } as Omit<LabResultInsert, 'case_id'>
  })
}

export default function EditLabsPage() {
  const router = useRouter()
  const params = useParams()
  const caseId = params.id as string

  const [labTableData, setLabTableData] = useState<LabTableData[]>(() =>
    labTemplate.map(row => ({ ...row }))
  )
  const [visibleItems, setVisibleItems] = useState<Set<string>>(new Set())
  const [comboboxValue, setComboboxValue] = useState('')
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const [timePoints, setTimePoints] = useState<number[]>([])
  const [timePointsInPresim, setTimePointsInPresim] = useState<Set<number>>(new Set())
  const [loaded, setLoaded] = useState(false)

  const addTimePoint = (offset: number) => {
    setTimePoints(prev => {
      if (prev.includes(offset)) return prev
      return [...prev, offset].sort((a, b) => b - a)
    })
  }
  const removeTimePoint = (offset: number) => {
    setTimePoints(prev => prev.filter(t => t !== offset))
    setTimePointsInPresim(prev => { const s = new Set(prev); s.delete(offset); return s })
  }
  const togglePresimInclusion = (timePoint: number, checked: boolean | 'indeterminate') => {
    setTimePointsInPresim(prev => {
      if (!checked) { const s = new Set(prev); s.delete(timePoint); return s }
      return new Set([...prev, timePoint])
    })
  }

  useEffect(() => {
    getLabResultsForCase(caseId).then(result => {
      if (result.success && result.data) {
        const rows = result.data
        const tps = [...rows.map(r => r.time_offset)].sort((a, b) => b - a)
        const presim = new Set(rows.filter(r => r.is_in_presim).map(r => r.time_offset))
        const withData = new Set<string>()
        for (const row of labTemplate) {
          if (!row.hideable) continue
          for (const dbRow of rows) {
            const hasComplex = dbRow.data && typeof dbRow.data === 'object'
              && (dbRow.data as Record<string, unknown>)[row.field] !== undefined
            if (hasComplex) { withData.add(row.field); break }
          }
        }
        setTimePoints(tps)
        setTimePointsInPresim(presim)
        setLabTableData(buildTableData(rows))
        setVisibleItems(withData)
      } else if (!result.success) {
        setLoadError('Failed to load lab results. Please try again.')
      }
      setLoaded(true)
    })
  }, [caseId])

  const hideableOptions = useMemo(() =>
    labTableData
      .filter(row => row.hideable === true)
      .filter(row => !visibleItems.has(row.field))
      .map(row => ({ value: row.field, label: row.field }))
    , [labTableData, visibleItems])

  const filteredLabTableData = useMemo(() =>
    labTableData.filter(row => !row.hideable || visibleItems.has(row.field))
    , [labTableData, visibleItems])

  const handleAddVisibleItem = (fieldName: string) => {
    if (fieldName) {
      setVisibleItems(prev => new Set([...prev, fieldName]))
      setComboboxValue('')
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    const insertRows = tableDataToInsertRows(labTableData, timePoints, timePointsInPresim)
    const result = await replaceLabResults(caseId, insertRows.map(row => ({ ...row, case_id: caseId })))
    setIsSaving(false)
    if (result.success) {
      router.push(`/admin/cases/${caseId}`)
    } else {
      console.error('Failed to save lab results:', result.error)
    }
  }

  const columns = useMemo(
    () => [
      columnHelper.accessor('field', {
        id: 'pinned',
        minSize: 200,
        maxSize: 400,
        header: () => <p></p>,
        cell: info => {
          const rowType = info.row.original.rowType
          const field = info.row.original.field
          if (rowType === 'divider') {
            return (
              <p className="w-full text-left text-xs py-0 px-2 font-medium text-blue-900">
                {field}
              </p>
            )
          }
          const labRange = info.row.original?.normalRange
          if (labRange) {
            const unit = info.row.original?.unit || ''
            return (
              <Tooltip>
                <TooltipTrigger className="w-full font-normal text-xs text-gray-700 shadow-none rounded-none">
                  <div className="flex justify-end w-full">
                    <p className="text-right font-normal px-2 text-xs text-gray-700 text-wrap">{field}</p>
                    {unit && <p className="text-right font-normal pr-2 text-xs tracking-tight text-gray-400">{unit}</p>}
                  </div>
                </TooltipTrigger>
                <TooltipPortal>
                  <TooltipContent className="bg-white shadow border border-gray-300 rounded-xl ml-4 p-2 z-10">
                    <h1 className="text-md font-semibold">{field}</h1>
                    <div className="space-y-2">
                      <div className="text-xs">
                        <p className="pl-2 text-gray-800 text-xs font-medium">
                          <span className="font-normal">Low: </span>&#60;{labRange.low}
                        </p>
                        <p className="pl-2 text-gray-800 text-xs font-medium">
                          <span className="font-normal">High: </span>&#62;{labRange.high}
                        </p>
                      </div>
                    </div>
                  </TooltipContent>
                </TooltipPortal>
              </Tooltip>
            )
          }
          return (
            <p className="w-full text-right font-normal !py-0 px-2 text-xs text-gray-700 text-wrap">
              {field}
            </p>
          )
        },
      }),

      ...timePoints.map(timePoint =>
        columnHelper.accessor(row => row[timePoint as unknown as keyof LabTableData], {
          id: String(timePoint),
          header: () => (
            <TableFormHeader
              timePoint={timePoint}
              isInPresim={timePointsInPresim.has(timePoint)}
              onRemove={removeTimePoint}
              onTogglePresim={togglePresimInclusion}
            />
          ),
          cell: ({ row, column, getValue, table }) => {
            switch (row.original.rowType) {
              case 'results':
                return (
                  <LabTableInputCell
                    row={row} getValue={getValue} column={column} table={table}
                    visibleInPresim={timePointsInPresim.has(timePoint)}
                  />
                )
              case 'imaging':
                return (
                  <LabTableImagingReport
                    row={row} getValue={getValue} column={column} table={table}
                    visibleInPresim={timePointsInPresim.has(timePoint)}
                  />
                )
              case 'microbiology':
                return (
                  <LabTableMicrobioReport
                    row={row} getValue={getValue} column={column} table={table}
                    visibleInPresim={timePointsInPresim.has(timePoint)}
                  />
                )
            }
          },
        })
      ),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [timePoints, timePointsInPresim]
  )

  const ptTable = useReactTable({
    data: filteredLabTableData,
    columns,
    enablePinning: true,
    initialState: {
      columnPinning: { left: ['pinned'] },
    },
    meta: {
      updateData: (rowIndex, columnId, value) => {
        const filteredRow = filteredLabTableData[rowIndex]
        const actualIndex = labTableData.findIndex(row => row.field === filteredRow?.field)
        setLabTableData(old =>
          old.map((row, index) => {
            if (index === actualIndex) {
              return { ...old[actualIndex]!, [columnId]: value }
            }
            return row
          })
        )
      },
    },
    getCoreRowModel: getCoreRowModel(),
  })

  // Don't render the table until time points are resolved from DB
  if (!loaded) {
    return (
      <div className="flex flex-col w-full min-h-screen bg-slate-50/50">
        <header className="sticky top-0 flex items-center justify-between px-4 sm:px-8 py-3 bg-white border-b z-10 shadow gap-3 flex-wrap">
          <div>
            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <FolderPen className="text-slate-400 w-5 h-5" /> Edit Lab Results
            </h1>
            <p className="text-xs text-slate-500 mt-1">Add and remove lab result time columns</p>
          </div>
        </header>
        <div className="flex items-center justify-center flex-1 text-sm text-slate-400">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col w-full min-h-screen bg-slate-50/50">

      {/* Header */}
      <header className="sticky top-0 flex items-center justify-between px-4 sm:px-8 py-3 bg-white border-b z-10 shadow gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <FolderPen className="text-slate-400 w-5 h-5" /> Edit Lab Results
          </h1>
          <p className="text-xs text-slate-500 mt-1">Add and remove lab result time columns</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button
            className="cursor-pointer"
            variant="outline"
            onClick={() => router.push(`/admin/cases/${caseId}`)}
          >
            <ArrowLeft className="w-4 h-4 mr-1" />Leave Without Saving
          </Button>
          <Button
            className="cursor-pointer"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save & Return"}
          </Button>
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 p-3 sm:p-4 md:px-6 lg:px-12 bg-slate-50/50">
        {loadError && (
          <p className="text-sm text-red-600 mb-4">{loadError}</p>
        )}

        <div className="h-12 px-4 w-full flex justify-start gap-12 mb-3 items-end">
          <AddTableColumn handleColumnAdd={addTimePoint} />
          <div>
            <Label>Imaging Options</Label>
            <Combobox onValueChange={handleAddVisibleItem} value={comboboxValue} displayText="Select scans..." data={hideableOptions} />
          </div>
          <div className="flex items-end gap-2">
            <div className="space-y-1.5">
              <p className="w-fit items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-yellow-50 text-yellow-600 border border-yellow-300 uppercase tracking-wide">
                Not included in Pre-Sim
              </p>
              <p className="w-fit items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-lime-50 text-lime-600 border border-lime-300 uppercase tracking-wide">
                Included in Pre-Sim
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 w-full border border-gray-300 rounded-t-lg overflow-auto bg-white shadow-sm relative">
          <FormTable
            table={ptTable}
            getCellClassName={(row) => {
              const baseClass = 'min-w-40'
              const colorClass = row.rowType === 'divider'
                ? 'bg-blue-50'
                : 'bg-white border-r last:border-r-0'
              return `${baseClass} ${colorClass}`
            }}
          />
        </div>
      </div>
    </div>
  )
}