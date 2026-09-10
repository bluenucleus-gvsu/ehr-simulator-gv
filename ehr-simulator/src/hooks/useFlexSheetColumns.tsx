import { useMemo } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { ChartingToolTip } from "@/app/simulation/[caseId]/[sessionId]/chart/charting/components/flexSheetToolTip";
import { formatTimeFromOffset } from "@/lib/flexSheet/flexSheetHelpers";
import TableInputCell from "@/app/simulation/[caseId]/[sessionId]/chart/charting/components/tableInputCell";
import TableAssessmentSelectCell from "@/app/simulation/[caseId]/[sessionId]/chart/charting/components/tableAssessmentSelectCell";
import CheckBoxList from "@/app/simulation/[caseId]/[sessionId]/chart/charting/components/checkBoxList";
import { AssessmentToolGuide, FlexSheetData } from "@/lib/flexSheet/flexSheetTypes";

const columnHelper = createColumnHelper<FlexSheetData>();

interface UseFlexSheetColumnsProps {
  slicedTimeOffsets: number[];
  simStartTime: number | null;
  fieldSelections: Record<string, string[]>;
  canEdit: boolean;
  assessmentToolGuides: AssessmentToolGuide[];
  handleSubsetSelection: (rowId: string, columnId: string, selectedIdsForField: string[]) => void;
}

export function useFlexSheetColumns({
  slicedTimeOffsets,
  simStartTime,
  fieldSelections,
  canEdit,
  assessmentToolGuides,
  handleSubsetSelection,
}: UseFlexSheetColumnsProps) {

  return useMemo(
    () => [
      // First column is distinct, containing all charting field names
      columnHelper.accessor("field", {
        id: "pinned",
        header: () => <h1 className="w-full h-full bg-gray-50"></h1>,
        cell: (info) => {
          const rowType = info.row.original.rowType;

          if (rowType === "titleRow") {
            const wdlDescription = info.row.original?.wdlDescription;
            if (wdlDescription && wdlDescription.length > 0) {
              return (
                <ChartingToolTip field={info.row.original.field} descriptions={wdlDescription} />
              );
            }
            return (
              <p className="min-w-24 h-full text-xs text-left py-0 pl-2 px-2 font-medium text-lime-900">
                {info.row.original.field}
              </p>
            );
          }

          if (rowType === "totalScoreRow") {
            const toolId = info.row.original.toolId;

            const toolInterpretation = assessmentToolGuides.find(
              (tool) => tool.id === toolId
            )?.interpretations;

            return (
              <div className="min-w-24 h-full text-xs text-left py-0 pl-4 font-semibold text-neutral-800">
                {info.getValue() && toolInterpretation ? (
                  <Tooltip>
                    <TooltipTrigger className="cursor-help">
                      {info.getValue()} Total Score
                    </TooltipTrigger>
                    <TooltipContent className="bg-white shadow ml-4 py-2 px-3 max-w-sm space-y-2">
                      <h1 className="text-sm font-bold text-black">{info.getValue()} Interpretation</h1>
                      <div className="space-y-2">
                        {toolInterpretation.map((interp, i) => (
                          <div key={i}>
                            <p className="text-xs font-semibold text-gray-800">
                              {interp.result} ({interp.range}):
                            </p>
                            <p className="pl-2 text-xs text-gray-600 italic">
                              {interp.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  `${info.getValue()} Total`
                )}
              </div>
            );
          }

          return (
            <p className="min-w-24 h-full text-left text-xs py-0 pl-4 text-neutral-600 shadow-none rounded-none focus-visible:ring-0 focus-visible:ring-offset-0">
              {info.getValue()}
            </p>
          );
        },
      }),

      // Remaining columns are mapped out by time offset and are modifiable by students
      ...slicedTimeOffsets.map((offsetKey) => {
        const displayData = formatTimeFromOffset(offsetKey, simStartTime);
        const displayDate = displayData?.date ?? "";
        const displayTime = displayData?.time ?? "";

        return columnHelper.accessor((row) => row[offsetKey], {
          id: String(offsetKey),
          header: () => (
            <div className="flex flex-col justify-center items-center">
              <h2 className="my-1 text-neutral-500 text-xs font-light">{displayDate}</h2>
              <p className="mb-1">{displayTime}</p>
            </div>
          ),
          cell: ({ row, column, getValue, table }) => {
            const initialValue = (getValue() as string) || "";
            const componentType = row.original.componentType;

            switch (componentType) {
              case "static":
                return <p></p>;
              case "input":
                return (
                  <TableInputCell
                    row={row}
                    column={column}
                    getValue={getValue}
                    table={table}
                    readOnly={!canEdit}
                  />
                );
              case "totalScoreRow":
                return (
                  <p className="text-right pr-2 py-0 text-xs font-semibold">
                    {initialValue}
                  </p>
                );
              case "assessmentselect":
                return (
                  <TableAssessmentSelectCell
                    row={row}
                    column={column}
                    getValue={getValue}
                    table={table}
                    readOnly={!canEdit}
                  />
                );
              case "checkboxlist": {
                const selectionKey = `${row.original.id}-${column.id}`;
                const currentSelectedSubsets = fieldSelections[selectionKey] || [];
                return (
                  <CheckBoxList
                    options={row.original.assessmentSubsets || []}
                    selectedOptions={currentSelectedSubsets}
                    rowId={row.original.id}
                    columnId={column.id}
                    onSelectionChange={handleSubsetSelection}
                    disabled={!canEdit}
                  />
                );
              }
              default:
                return null;
            }
          },
        });
      }),
    ],
    [
      slicedTimeOffsets,
      simStartTime,
      fieldSelections,
      handleSubsetSelection,
      canEdit,
      assessmentToolGuides,
    ]
  );
}