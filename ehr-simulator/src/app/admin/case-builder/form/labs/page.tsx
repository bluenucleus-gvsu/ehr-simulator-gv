'use client'

import { type LabTableData } from "@/app/simulation/[caseId]/[sessionId]/chart/labs/components/labsData"
import { useReactTable, getCoreRowModel, createColumnHelper } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { Tooltip, TooltipTrigger } from "@/components/ui/tooltip";
import { TooltipContent } from "@radix-ui/react-tooltip";
import { TooltipPortal } from "@radix-ui/react-tooltip";

import { TestTube2 } from "lucide-react";
import { AddTableColumn } from "./components/addTimeCol";
import { Label } from "@/components/ui/label";
import Combobox from "@/components/ui/combobox";
import { useRouter } from "next/navigation";
import { LabTableImagingReport, LabTableInputCell, LabTableMicrobioReport } from "./components/labTableInputCell";
import { useFormContext } from "@/context/FormContext";
import { useTimePoints } from "../../components/useFormTableOffsets";
import { FormShell } from "../../components/formShell";
import { TableFormHeader } from "../../components/tableFormHeader";
import { FormTable } from "../../components/FormTable";
import { saveCaseData } from "@/actions/case_builder/caseBuilder";
import { CaseSection } from "@/lib/saveCase";

const columnHelper = createColumnHelper<LabTableData>();

export function LabForm() {
  const { onDataChange, labData, caseId } = useFormContext()
  const [labTableData, setLabTableData] = useState<LabTableData[]>(labData.data);
  const [visibleItems, setVisibleItems] = useState<Set<string>>(labData.visibleItems ?? new Set());
  const [comboboxValue, setComboboxValue] = useState<string>('');
  const {
    timePoints,
    timePointsInPresim,
    togglePresimInclusion,
    addTimePoint,
    removeTimePoint
  } = useTimePoints(labData.timePoints, labData.timePointsInPreSim)

  const router = useRouter()

  // Get all hideable options for Combobox selector
  const hideableOptions = useMemo(() => {
    return labTableData
      .filter(row => row.hideable === true)
      .filter(row => !visibleItems.has(row.field))
      .map(row => ({
        value: row.field,
        label: row.field
      }));
  }, [labTableData, visibleItems]);

  // Filter data to only show visible rows
  const filteredLabTableData = useMemo(() => {
    return labTableData.filter(row => {
      // Always show non-hideable rows
      if (!row.hideable) return true;
      return visibleItems.has(row.field);
    });
  }, [labTableData, visibleItems]);

  // Handler to add an item to visible list
  const handleAddVisibleItem = (fieldName: string) => {
    if (fieldName) {
      setVisibleItems(prev => new Set([...prev, fieldName]));
      setComboboxValue("");
    }
  };

  const goBack = () => {
    onDataChange('labs', {
      data: labTableData,
      timePoints: timePoints,
      timePointsInPreSim: timePointsInPresim,
      visibleItems: visibleItems
    });
    router.push("/admin/case-builder/form/orders");
  }

  const handleSubmit = () => {
    onDataChange('labs', {
      data: labTableData,
      timePoints: timePoints,
      timePointsInPreSim: timePointsInPresim,
      visibleItems: visibleItems
    });

    saveCaseData({
      payload: {
        data: labTableData,
        timePoints,
        timePointsInPreSim: Array.from(timePointsInPresim),
        visibleItems: Array.from(visibleItems),
      },
      section: CaseSection.LABS,
      caseId: caseId
    })

    router.push('/admin/case-builder/form/charting')
  }
  const columns = useMemo(
    () => [
      // first column has unique formatting
      columnHelper.accessor("field", {
        id: 'pinned',
        minSize: 200,
        maxSize: 400,
        header: () => <p></p>,
        cell: info => {
          const rowType = info.row.original.rowType;
          const field = info.row.original.field
          if (rowType === "divider") {
            return (
              <p className="w-full text-left text-xs py-0 px-2 font-medium text-blue-900">
                {field}
              </p>
            );
          }
          else {
            const labRange = info.row.original?.normalRange;
            if (labRange) {
              const unit = info.row.original?.unit || ''
              return (
                <Tooltip>
                  <TooltipTrigger className="w-full font-normal text-xs text-gray-700 shadow-none rounded-none">
                    <div className="flex justify-end w-full ">
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
                            <span className="font-normal">Low: </span>
                            &#60;{labRange.low}
                          </p>
                          <p className="pl-2 text-gray-800 text-xs font-medium">
                            <span className="font-normal">High: </span>
                            &#62;{labRange.high}</p>
                        </div>
                      </div>
                    </TooltipContent>
                  </TooltipPortal>
                </Tooltip>
              );
            }
            return (
              <p className="w-full text-right font-normal !py-0 px-2 text-xs text-gray-700 text-wrap">
                {field}
              </p>
            );
          }
        }
      },
      ),

      // map out remaining columns
      ...timePoints.map(timePoint => {
        return (
          columnHelper.accessor(row => row[timePoint], {
            id: String(timePoint),
            header: () => {
              return (
                <TableFormHeader
                  timePoint={timePoint}
                  isInPresim={timePointsInPresim.has(timePoint)}
                  onRemove={removeTimePoint}
                  onTogglePresim={togglePresimInclusion}
                />
              )
            },
            cell: ({ row, column, getValue, table }) => {
              const rowType = row.original.rowType
              switch (rowType) {
                case 'results':
                  return (
                    <LabTableInputCell
                      row={row}
                      getValue={getValue}
                      column={column}
                      table={table}
                      visibleInPresim={timePointsInPresim.has(timePoint)}
                    />
                  );
                case 'imaging':
                  return (
                    <LabTableImagingReport
                      column={column}
                      row={row}
                      table={table}
                      getValue={getValue}
                      visibleInPresim={timePointsInPresim.has(timePoint)}
                    />
                  )
                case 'microbiology':
                  return (
                    <LabTableMicrobioReport
                      column={column}
                      row={row}
                      table={table}
                      getValue={getValue}
                      visibleInPresim={timePointsInPresim.has(timePoint)}
                    />
                  )
              }
            }
          }))
      }
      )
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [timePoints, timePointsInPresim]
  );

  const ptTable = useReactTable({
    data: filteredLabTableData,
    columns,
    enablePinning: true,
    initialState: {
      columnPinning: {
        left: ['pinned']
      },
    },
    meta: {
      updateData: (rowIndex, columnId, value) => {
        const filteredRow = filteredLabTableData[rowIndex];
        const actualIndex = labTableData.findIndex(row => row.field === filteredRow?.field);
        setLabTableData(old =>
          old.map((row, index) => {
            if (index === actualIndex) {
              return {
                ...old[actualIndex]!,
                [columnId]: value,
              }
            }
            return row
          })
        )
      },
    },
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <FormShell
      title="Lab Results"
      stepDescription="Step 5 of 9: Enter laboratory and imaging results"
      icon={<TestTube2 className="text-slate-400" />}
      onSubmit={handleSubmit}
      goBack={goBack}
      continueButtonText="Continue"
      backButtonText="Back"
      continueButtonTooltip="Proceed to Next Page"
      backButtonTooltip="Return to Previous Page"
    >
      <div className="bg-slate-50/50 flex-1 flex flex-col min-h-0 px-6 pt-4">
        <div className="h-12 px-4 w-full flex justify-start gap-12 mb-3 items-end">
          <AddTableColumn handleColumnAdd={addTimePoint} />
          <div>
            <Label>Imaging Options</Label>
            <Combobox onValueChange={handleAddVisibleItem} value={comboboxValue} displayText="Select scans..." data={hideableOptions} />
          </div>
          <div className="flex items-end gap-2">
            <div className="space-y-1.5">
              <p className="w-fit items-center  px-1.5 py-0.5 rounded text-[10px] font-bold bg-yellow-50 text-yellow-600 border border-yellow-300 uppercase tracking-wide">
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
              const baseClass = "min-w-40";
              const colorClass = row.rowType === "divider"
                ? "bg-blue-50"
                : "bg-white border-r last:border-r-0";
              return `${baseClass} ${colorClass}`;
            }}
          />
        </div>
      </div>
    </FormShell>
  );
}

export default LabForm

