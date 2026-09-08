'use client'

import { useReactTable, getCoreRowModel, createColumnHelper } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { AddTableColumn } from "../labs/components/addTimeCol";
import { useRouter } from "next/navigation";
import { FlexSheetData } from "@/app/simulation/[caseId]/[sessionId]/chart/charting/components/flexSheetData";
import { Clipboard } from "lucide-react";
import { TableAssessmentSelectFormCell, TableInputFormCell } from "./components/tableInputFormCell";
import { useFormContext } from "@/context/FormContext";
import { useTimePoints } from "../../components/useFormTableOffsets";
import { TableFormHeader } from "../../components/tableFormHeader";
import { FormShell } from "../../components/formShell";
import { ChartingToolTip } from "@/app/simulation/[caseId]/[sessionId]/chart/charting/components/ChartingToolTip";
import { FormTable } from "../../components/FormTable";
import { saveCaseData } from "@/actions/case_builder/caseBuilder";
import { CaseSection } from "@/lib/saveCase";
import CheckBoxList from "@/app/simulation/[caseId]/[sessionId]/chart/charting/components/checkBoxList";
import { caseBuilderPath } from "@/lib/caseBuilder/routes";


const columnHelper = createColumnHelper<FlexSheetData>();

function ensureNumberSet(input: unknown): Set<number> {
  if (input instanceof Set) return input;
  if (Array.isArray(input)) {
    return new Set(
      input
        .map((v) => Number(v))
        .filter((v) => Number.isFinite(v)),
    );
  }
  return new Set<number>();
}

function ChartingForm() {
  const { onDataChange, chartingData: initialChartingData, caseId } = useFormContext()
  const [chartingData, setChartingData] = useState<FlexSheetData[]>(initialChartingData.data)
  const {
    timePoints,
    timePointsInPresim,
    addTimePoint,
    removeTimePoint,
    togglePresimInclusion
  } = useTimePoints(initialChartingData.timePoints, ensureNumberSet(initialChartingData.timePointsInPreSim))

  const router = useRouter()

  const goBack = () => {
    onDataChange('charting', {
      data: chartingData,
      timePoints: timePoints,
      timePointsInPreSim: timePointsInPresim
    })
    router.push(caseBuilderPath("/admin/case-builder/form/labs", caseId));
  }

  const handleSubmit = async () => {
    onDataChange('charting', {
      data: chartingData,
      timePoints: timePoints,
      timePointsInPreSim: timePointsInPresim
    })

    await saveCaseData({
      payload: {
        data: chartingData,
        timePoints,
        timePointsInPreSim: Array.from(timePointsInPresim),
      },
      section: CaseSection.DOCUMENTATION,
      caseId: caseId
    })

    router.push(caseBuilderPath('/admin/case-builder/form/intake-output', caseId))
  }
  const handleSubsetSelection = (rowId: string, columnId: string, selectedIdsForField: string[]) => {
    setChartingData(prevData => prevData.map(row => {
      if (row.id === rowId) {
        return { ...row, [columnId]: selectedIdsForField };
      }
      return row;
    }));
  };

  const columns = useMemo(
    () => [
      // first column has unique formatting
      columnHelper.accessor("field", {
        minSize: 220,
        maxSize: 400,
        id: 'pinned',
        header: () => <p></p>,
        cell: info => {
          const rowType = info.row.original.rowType;
          if (rowType === "titleRow") {
            const wdlDescription = info.row.original?.wdlDescription;
            if (wdlDescription && wdlDescription.length > 0) {
              return (
                <ChartingToolTip field={info.row.original.field} descriptions={wdlDescription} />
              );
            } else {
              // divider row
              return (
                <div className="flex items-center">
                  <p className="w-full h-full text-xs text-left py-0 pl-2 px-2 font-medium text-lime-900">
                    {info.row.original.field}
                  </p>
                </div>
              );
            }
          } else {
            // regular field row
            return (
              <div className="flex items-center">
                <p className="w-full h-full text-left text-xs py-0 pl-4 text-gray-600 shadow-none rounded-none text-wrap">
                  {info.getValue()}
                </p>
              </div>

            );
          };
        },
      }),

      // map out remaining columns
      ...timePoints.map(timePoint => {
        return (
          columnHelper.accessor(row => row[timePoint], {
            id: String(timePoint),
            header: () => {
              return (
                <TableFormHeader
                  onRemove={removeTimePoint}
                  onTogglePresim={togglePresimInclusion}
                  isInPresim={timePointsInPresim.has(timePoint)}
                  timePoint={timePoint}
                />
              )
            },
            cell: ({ row, column, getValue, table }) => {
              const componentType = row.original.componentType
              switch (componentType) {
                case 'input':
                  return (
                    <TableInputFormCell
                      getValue={getValue}
                      row={row}
                      column={column}
                      table={table}
                      visibleInPresim={timePointsInPresim.has(timePoint)}
                    />
                  )
                case 'static':
                  return (
                    <p></p>
                  );
                case 'assessmentselect':
                  return (
                    <TableAssessmentSelectFormCell
                      getValue={getValue}
                      row={row}
                      column={column}
                      table={table}
                      visibleInPresim={timePointsInPresim.has(timePoint)}
                    />);
                case 'checkboxlist':
                  const selectedOptions = (getValue() as string[]) || [];
                  return (
                    <CheckBoxList
                      options={row.original.assessmentSubsets || []}
                      selectedOptions={selectedOptions}
                      rowId={row.original.id}
                      columnId={column.id}
                      onSelectionChange={handleSubsetSelection}
                    />
                  )
              }
            }
          }))
      })
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [timePoints, timePointsInPresim]
  );

  const ptTable = useReactTable({
    data: chartingData,
    columns,
    enablePinning: true,
    initialState: {
      columnPinning: {
        left: ['pinned']
      },
    },
    meta: {
      updateData: (rowIndex, columnId, value) => {
        setChartingData(old =>
          old.map((row, index) => {
            if (index === rowIndex) {
              const updatedRow = {
                ...old[rowIndex]!,
                [columnId]: value,
              };

              return updatedRow as FlexSheetData;
            }
            return row;
          })
        )
      },
    },
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <FormShell
      title="Documentation"
      stepDescription="Step 6 of 10: Nursing charting and assessments"
      icon={<Clipboard className="text-slate-400" />}
      onSubmit={handleSubmit}
      goBack={goBack}
      continueButtonText="Continue"
      backButtonText="Back"
    >
      <div className="bg-slate-50/50 flex-1 flex flex-col min-h-0 px-6 pt-4">
        <div className="h-12 px-4 w-full flex justify-start gap-12 mb-3 items-end">
          <AddTableColumn handleColumnAdd={addTimePoint} />
          <div className="space-y-1.5">
            <p className="w-fit items-center justify-center flex gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-yellow-50 text-yellow-600 border border-yellow-300 uppercase tracking-wide">
              <span className="size-1.5 rounded full bg-yellow-600"></span>
              Not included in Pre-Sim
            </p>
            <p className="w-fit items-center flex gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-lime-50 text-lime-600 border border-lime-300 uppercase tracking-wide">
              <span className="size-1.5 rounded full bg-lime-600"></span>
              Included in Pre-Sim
            </p>
          </div>
        </div>

        <div className="flex-1 w-full border border-gray-300 rounded-t-lg bg-white shadow-sm relative flex flex-col overflow-hidden">
          <FormTable
            table={ptTable}
            getCellClassName={(row) => {
              return row.componentType === "static"
                ? "bg-lime-50"
                : "bg-white border-r last:border-r-0";
            }} />
        </div>
      </div>
    </FormShell>
  );
}

export default ChartingForm
