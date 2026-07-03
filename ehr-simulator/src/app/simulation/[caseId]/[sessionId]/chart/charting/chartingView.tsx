'use client'

import { useReactTable, getCoreRowModel, flexRender, createColumnHelper, type RowData } from "@tanstack/react-table";
import { useState, useMemo, useCallback, useEffect } from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import CheckBoxList from "./components/checkBoxList";
import { AddTimeColumnButton } from "./components/addTimeColButton";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { PanelLeftCloseIcon, PanelLeftOpenIcon } from "lucide-react";
import { toast } from "sonner";
import FlexSheetColumnShifter from "./components/flexSheetColumnShifter";

import {
  type FlexSheetData,
  assessmentTools,
  flexSheetTemplate,
} from "./components/flexSheetData";
import { ImagingData, LabCellValue } from "../labs/components/labsData";
import { TableAssessmentSelectCell, TableInputCell } from "./components/tableInputCell";
import { ChartingToolTip } from "./components/ChartingToolTip";
import { DatabaseDocumentation, StudentDatabaseDocumentation, upsertDocumentationRows } from "@/actions/simulation";
import { useSimSessionContext } from "@/context/SimSessionContext";
import {
  buildChartingRowsFromBundle,
  coerceDocumentationValueForPersist,
  resolveDocumentationDbColumn,
} from "./components/chartingFromBundle";
import { calculateColTotal, formatTimeFromOffset, getPinnedStyles } from "./components/flexSheetHelpers";
import { appendTesterDocumentationRows, getTesterDocumentationRows } from "@/utils/testerLocalStore";
import { isTesterModeClient } from "@/utils/testerMode";
import { useSimulationCase } from "@/context/SimulationCaseContext";
import { useStudentSimulationEditAccess } from "@/utils/studentSimulationEditAccess";

interface FlexSheetViewProps {
  dbDocumentation: DatabaseDocumentation[];
  params: {
    caseId: string;
    sessionId: string;
  };
}
const columnHelper = createColumnHelper<FlexSheetData>();

const tableWidth = 6;

declare module '@tanstack/react-table' {
  interface TableMeta<TData extends RowData> {
    updateData: (
      rowIndex: number,
      columnId: string,
      value: string | string[] | ImagingData | LabCellValue | Partial<TData>) => void
  }
}

export function FlexSheetView({ dbDocumentation, params }: FlexSheetViewProps) {
  const { caseBundle } = useSimulationCase();
  const sourceDocumentation = dbDocumentation.length > 0
    ? dbDocumentation
    : ((caseBundle?.documentationResults ?? []) as DatabaseDocumentation[]);
  const { groupId, userId, simStartTime, handleUnsavedCharting } = useSimSessionContext();
  const { canEdit } = useStudentSimulationEditAccess();
  const initialCharting = useMemo(
    () => buildChartingRowsFromBundle(sourceDocumentation, flexSheetTemplate),
    [sourceDocumentation],
  );
  const [timeOffsets, setTimeOffsets] = useState(initialCharting.timeOffsets);
  const [data, setData] = useState<FlexSheetData[]>(initialCharting.rows);
  const [fieldSelections, setFieldSelections] = useState<Record<string, string[]>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [dirtyColumns, setDirtyColumns] = useState<Set<string>>(new Set());
  const { caseId, sessionId } = params;
  const sessionKey = `${caseId}:${sessionId}`;
  const canSubmit = dirtyColumns.size > 0;
  const { open, toggleSidebar } = useSidebar()

  const maxOffset = Math.max(0, timeOffsets.length - tableWidth);
  const remainder = timeOffsets.length % tableWidth;
  const [columnOffset, setColumnOffset] = useState(maxOffset);
  const slicedTimeOffsets = timeOffsets.slice(columnOffset, (columnOffset === 0 && remainder !== 0) ? remainder : columnOffset + tableWidth);

  useEffect(() => {
    let rowsInput: DatabaseDocumentation[] = sourceDocumentation;
    if (isTesterModeClient()) {
      const testerRows = getTesterDocumentationRows(sessionKey) as DatabaseDocumentation[];
      rowsInput = [...sourceDocumentation, ...testerRows];
    }
    const hydrated = buildChartingRowsFromBundle(rowsInput, flexSheetTemplate);
    setTimeOffsets(hydrated.timeOffsets);
    setData(hydrated.rows);
    setDirtyColumns(new Set());
    setColumnOffset(Math.max(0, hydrated.timeOffsets.length - tableWidth));
  }, [sourceDocumentation, sessionKey]);

  useEffect(() => {
    setColumnOffset((prev) => Math.min(prev, maxOffset));
  }, [maxOffset]);

  const visibleSubsetIds = useMemo(() => {
    const combinedSet = new Set<string>();
    Object.values(fieldSelections).forEach((selectedIdsArray) => {
      selectedIdsArray.forEach((id) => id !== "WDL" && combinedSet.add(id));
    });
    return combinedSet;
  }, [fieldSelections]);

  const filteredData = useMemo(() => {
    const groupedByTool: Record<string, FlexSheetData[]> = {};

    data.forEach((row) => {
      if (row.toolName) {
        groupedByTool[row.toolName] = groupedByTool[row.toolName] || [];
        groupedByTool[row.toolName].push(row);
      }
    });

    const newFilteredData: FlexSheetData[] = [];

    data.forEach((row) => {
      const isVisible = !row.hideable || (row.hideableId && visibleSubsetIds.has(row.hideableId));

      if (isVisible) {
        newFilteredData.push(row);
      }

      if (row.rowType === "titleRow" && row.hideableId && visibleSubsetIds.has(row.hideableId)) {
        const toolName = row.hideableId;
        if (groupedByTool[toolName]) {
          const totalRow = calculateColTotal(toolName, groupedByTool[toolName], timeOffsets);
          newFilteredData.push(totalRow);
        }
      }
    });

    return newFilteredData;
  }, [data, visibleSubsetIds, timeOffsets]);

  const handleCellUpdate = useCallback((rowIndex: number, columnId: string, value: string | string[]) => {
    if (!canEdit) return;
    setData((prevData) =>
      prevData.map((row, index) => {
        if (index === rowIndex) {
          return { ...row, [columnId]: value };
        }
        return row;
      }),
    );

    setDirtyColumns((prev) => {
      const newSet = new Set(prev);
      newSet.add(columnId);
      return newSet;
    });
  }, [canEdit]);

  const handleSubsetSelection = useCallback((rowId: string, columnId: string, selectedIdsForField: string[]) => {
    if (!canEdit) return;
    const selectionKey = `${rowId}-${columnId}`;

    setFieldSelections((prev) => ({
      ...prev,
      [selectionKey]: selectedIdsForField,
    }));

    setData((prevData) =>
      prevData.map((row) => {
        if (row.id === rowId) {
          return { ...row, [columnId]: selectedIdsForField };
        }
        return row;
      }),
    );
  }, [canEdit]);

  const handleColumnAdd = (newTime: number) => {
    if (!canEdit) {
      toast.error("FlexSheets are view-only in pre-simulation.");
      return;
    }
    if (timeOffsets.includes(newTime)) {
      toast.error(`A column for time ${newTime} already exists.`);
      return;
    }
    setTimeOffsets((prev) => [...prev, newTime].sort((a, b) => a - b));
    setData((prevData) => prevData.map((row) => ({ ...row, [newTime]: "" })));
    setColumnOffset(Math.max(0, timeOffsets.length + 1 - tableWidth));
  };

  const handleColOffsetChange = (shift: number | string) => {
    if (typeof shift === "number") {
      setColumnOffset((prev) => {
        if (prev === 0 && shift > 0 && remainder !== 0) {
          return remainder;
        }

        const next = prev + shift;
        if (next <= 0) return 0;
        if (next >= maxOffset) return maxOffset;
        return next;
      });
    } else if (shift === "reset") {
      setColumnOffset(maxOffset);
    }
  };

  const handleSave = async () => {
    if (!canEdit) {
      toast.error("FlexSheets are view-only in pre-simulation.");
      return;
    }
    if (dirtyColumns.size === 0) {
      toast.info("No changes to save.");
      return;
    }

    setIsSaving(true);
    try {
      if (!userId || !groupId || !sessionId || !caseId) {
        toast.error("Case data still loading. Please try again.");
        return;
      }
      const dirtyTimeOffsets = Array.from(dirtyColumns).filter((col) =>
        Number.isFinite(Number(col)),
      );
      if (dirtyTimeOffsets.length === 0) {
        toast.info("No valid time columns to save.");
        return;
      }
      const payload = dirtyTimeOffsets.map((timeOffset) => {
        const dbRecord: StudentDatabaseDocumentation = {
          case_id: caseId,
          case_session_id: sessionId,
          user_id: userId,
          group_id: groupId,
          time_offset: Number(timeOffset),
          is_in_presim: false,
        };

        data.forEach((row) => {
          const isDataRow =
            row.componentType !== "static" &&
            row.componentType !== "checkboxlist" &&
            row.componentType !== "totalScoreRow";

          if (isDataRow && row.id) {
            const cellValue = row[timeOffset];
            const dbColumn = resolveDocumentationDbColumn(row.id);
            (dbRecord as Record<string, unknown>)[dbColumn] = coerceDocumentationValueForPersist(
              dbColumn,
              cellValue,
            );
          }
        });

        return dbRecord;
      });

      if (isTesterModeClient()) {
        appendTesterDocumentationRows(sessionKey, payload);
        toast.success("FlexSheet data saved locally (tester mode)!");
        setDirtyColumns(new Set());
        return;
      }

      const { error } = await upsertDocumentationRows(payload);

      if (error) throw error;

      toast.success("FlexSheet data saved successfully!");

      setDirtyColumns(new Set());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      toast.error(`Failed to save data (${errorMessage})`);
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    handleUnsavedCharting(dirtyColumns.size > 0);
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (dirtyColumns.size > 0) {
        event.preventDefault();
        return "You have unsaved charting data.";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [dirtyColumns, handleUnsavedCharting]);

  const hasActiveTools = useMemo(() => {
    return assessmentTools.some((tool) => visibleSubsetIds.has(tool.name));
  }, [visibleSubsetIds]);

  const columns = useMemo(
    () => [
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
            const toolName = info.row.original.field.replace(" Total Score", "");
            const toolInterpretation = assessmentTools.find((tool) => tool.name === toolName)?.interpretations;
            return (
              <div className="min-w-24 h-full text-xs text-left py-0 pl-4 font-semibold text-neutral-800">
                {info.getValue() && toolInterpretation ? (
                  <Tooltip>
                    <TooltipTrigger className="cursor-help">{info.getValue()} Total</TooltipTrigger>
                    <TooltipContent className="bg-white shadow shadow-black/30 rounded-xl ml-4 p-4 z-51 max-w-sm">
                      <h1 className="text-sm font-bold">{toolName} Interpretation</h1>
                      <div className="pl-2 space-y-2">
                        {toolInterpretation.map((interp, i) => (
                          <div key={i}>
                            <p className="text-xs font-semibold text-gray-800">
                              {interp.result} ({interp.range}):
                            </p>
                            <p className="pl-2 text-xs text-gray-600 italic">{interp.description}</p>
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
                return <p className="text-right pr-2 py-0 text-xs font-semibold">{initialValue}</p>;
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
    [slicedTimeOffsets, simStartTime, fieldSelections, handleSubsetSelection, canEdit],
  );

  const ptTable = useReactTable({
    data: filteredData,
    columns,
    enablePinning: true,
    initialState: { columnPinning: { left: ["pinned"] } },
    meta: {
      updateData: (rowIndex, columnId, value) => {
        if (!canEdit) return;
        const rowId = filteredData[rowIndex]?.id;
        if (!rowId) return;

        const realIndex = data.findIndex((r) => r.id === rowId);
        if (realIndex !== -1) {
          handleCellUpdate(realIndex, columnId, value as string | string[]);
        }
      },
    },
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="flex h-full min-h-0 w-full max-w-full flex-col bg-gray-100 px-4">
      <div className="flex h-full min-h-0 w-full flex-col items-stretch justify-start gap-2 pt-2">
        <div className="flex w-full shrink-0 justify-start gap-3">
          <AddTimeColumnButton
            onColumnAdd={handleColumnAdd}
            existingTimeColumns={timeOffsets}
            sessionStartTime={simStartTime}
            disabled={!canEdit}
          />
          <Button
            onClick={handleSave}
            disabled={!canEdit || isSaving || !canSubmit}
            title={!canEdit ? "View-only in pre-simulation" : undefined}
            className="h-6 bg-lime-500 text-white hover:bg-lime-600 shadow"
          >
            {isSaving ? "Saving..." : "File"}
          </Button>
          <Button
            onClick={toggleSidebar}
            className={`bg-white h-6 w-4 text-black hover:bg-gray-200 shadow shadow-black/20  ${hasActiveTools && !open ? 'text-blue-500' : ''}`}
          >
            {open ? <PanelLeftOpenIcon /> : <PanelLeftCloseIcon />}
          </Button>
          <FlexSheetColumnShifter
            columnOffset={columnOffset}
            onColumnShift={handleColOffsetChange}
            columns={timeOffsets}
            tableWidth={tableWidth}
            simStartTime={simStartTime}
          />
        </div>
        <div className="flex min-h-0 w-full flex-1 flex-col overflow-auto rounded-md border border-gray-200">
          <Table className="w-full rounded-md">
            <TableHeader className=" bg-gray-50">
              {ptTable.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      style={getPinnedStyles(header.column, 200, true)}
                      key={header.id}
                      className="p-0 bg-gray-50 shadow-[inset_0_-1px_0_0_#e5e7eb]"
                    >
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {ptTable.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="h-6">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      style={getPinnedStyles(cell.column)}
                      className={`p-0 min-w-24 text-gray-800 border-separate border-gray-200 border-b ${row.original.rowType === "titleRow" ? "bg-lime-50" : "bg-white border-r border-separate"}`}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

export default FlexSheetView;
