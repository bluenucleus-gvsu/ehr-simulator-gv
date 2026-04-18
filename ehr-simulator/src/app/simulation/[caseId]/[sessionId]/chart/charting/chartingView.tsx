'use client'

import { useReactTable, getCoreRowModel, flexRender, createColumnHelper, type Column, type RowData } from "@tanstack/react-table";
import { useState, useMemo, useCallback, useEffect } from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import CheckBoxList from "./components/checkBoxList";
import { AddTimeColumnButton } from "./components/addTimeColButton";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { PanelLeftCloseIcon, PanelLeftOpenIcon } from "lucide-react";
import { toast } from "sonner";
import { addMinutes, format } from "date-fns";
import FlexSheetSidebar from "./components/flexSheetSidebar";

import {
  type FlexSheetData,
  assessmentTools,
  generateChartingDataFromDB,
  getAllTimeOffsets,
} from "./components/flexSheetData";
import { ImagingData, LabCellValue, LabTableData } from "../labs/components/labsData";
import { TableAssessmentSelectCell, TableInputCell } from "./components/tableInputCell";
import { ChartingToolTip } from "./components/ChartingToolTip";
import { DatabaseDocumentation, StudentDatabaseDocumentation, upsertDocumentationRows } from "@/actions/simulation";
import { useSimSessionContext } from "@/context/SimSessionContext";
import FlexSheetColumnShifter from "./components/flexSheetColumnShifter";

interface FlexSheetViewProps {
  dbDocumentation: DatabaseDocumentation[];
  params: {
    caseId: string;
    sessionId: string;
  };
}

const columnHelper = createColumnHelper<FlexSheetData>();

export function getPinnedStyles(column: Column<FlexSheetData> | Column<LabTableData>, width: number = 200, isHeader: boolean = false): React.CSSProperties {
  const isPinned = column.getIsPinned();
  if (!isPinned) {
    return isHeader ? { position: 'sticky', top: 0, zIndex: 10 } : {};
  }

  const side = isPinned as 'left' | 'right';

  return {
    position: 'sticky',
    [side]: `${column.getStart(side)}px`,
    top: isHeader ? 0 : undefined,
    zIndex: isHeader ? 30 : (side === 'left' ? 2 : 1),
    width: width
  };
}

declare module '@tanstack/react-table' {
  interface TableMeta<TData extends RowData> {
    updateData: (
      rowIndex: number,
      columnId: string,
      value: string | string[] | ImagingData | LabCellValue | Partial<TData>) => void
  }
}

export const formatTimeFromOffset = (offsetMinutes: number, nowTimestamp: number | null) => {
  if (!nowTimestamp || offsetMinutes == null || isNaN(offsetMinutes)) {
    return null;
  }

  const targetTime = addMinutes(new Date(nowTimestamp), offsetMinutes);
  const time = format(targetTime, 'HHmm');
  const date = format(targetTime, 'MM/dd');
  return { time, date };
};

export function calculateColTotal(toolName: string, grouped: FlexSheetData[], timeOffsets: number[]) {
  const totalRow: FlexSheetData = {
    id: `${toolName}TotalScore`,
    field: `${toolName} Total Score`,
    componentType: "totalScoreRow",
    rowType: "totalScoreRow",
  };

  timeOffsets.forEach(timeCol => {
    let totalScore = 0;
    let hasEnteredValue = false;

    grouped.forEach(toolRow => {
      // Safe check for existing value
      const val = toolRow[timeCol];
      if (val) {
        const score = parseInt(val.toString());
        if (!isNaN(score)) {
          totalScore += score;
          hasEnteredValue = true;
        }
      }
    });
    totalRow[timeCol] = hasEnteredValue ? totalScore.toString() : "";
  });
  return totalRow;
}

const tableWidth = 6

export function FlexSheetView({ dbDocumentation, params }: FlexSheetViewProps) {
  const { groupId, userId, simStartTime, handleUnsavedCharting } = useSimSessionContext();

  const [timeOffsets, setTimeOffsets] = useState(getAllTimeOffsets(simStartTime, dbDocumentation));
  const [data, setData] = useState<FlexSheetData[]>(generateChartingDataFromDB(dbDocumentation, timeOffsets));
  const [fieldSelections, setFieldSelections] = useState<Record<string, string[]>>({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [dirtyColumns, setDirtyColumns] = useState<Set<string>>(new Set());
  const [columnOffset, setColumnOffset] = useState(Math.floor(timeOffsets.length / tableWidth) * tableWidth)
  const slicedTimeOffsets = timeOffsets.slice(columnOffset, (columnOffset + tableWidth))
  const { caseId, sessionId } = params;
  const canSubmit = dirtyColumns.size > 0


  // Calculate visible IDs based on checkboxes
  const visibleSubsetIds = useMemo(() => {
    const combinedSet = new Set<string>();
    Object.values(fieldSelections).forEach(selectedIdsArray => {
      // Exclude "WDL" from the set of IDs that trigger row visibility
      selectedIdsArray.forEach(id => id !== "WDL" && combinedSet.add(id));
    });
    return combinedSet;
  }, [fieldSelections]);

  const filteredData = useMemo(() => {
    // 1. Group rows by toolName first (needed to calculate totals correctly)
    const groupedByTool: Record<string, FlexSheetData[]> = {};

    data.forEach(row => {
      if (row.toolName) {
        groupedByTool[row.toolName] = groupedByTool[row.toolName] || [];
        groupedByTool[row.toolName].push(row);
      }
    });

    const newFilteredData: FlexSheetData[] = [];

    // 2. Iterate and Build Result
    data.forEach(row => {
      const isVisible = !row.hideable || (row.hideableId && visibleSubsetIds.has(row.hideableId));

      if (isVisible) {
        newFilteredData.push(row);
      }

      // 3. Inject Total Score Row
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
    setData(prevData =>
      prevData.map((row, index) => {
        if (index === rowIndex) {
          return { ...row, [columnId]: value };
        }
        return row;
      })
    );

    setDirtyColumns(prev => {
      const newSet = new Set(prev);
      newSet.add(columnId);
      return newSet;
    });
  }, []);

  const handleSubsetSelection = useCallback((rowId: string, columnId: string, selectedIdsForField: string[]) => {
    const selectionKey = `${rowId}-${columnId}`;

    // Update selections state
    setFieldSelections(prev => ({
      ...prev,
      [selectionKey]: selectedIdsForField
    }));

    // Also update the actual cell value in data to reflect the selection
    setData(prevData => {
      return prevData.map(row => {
        if (row.id === rowId) {
          return { ...row, [columnId]: selectedIdsForField };
        }
        return row;
      });
    });
  }, []);

  const handleColumnAdd = (newTime: number) => {
    if (timeOffsets.includes(newTime)) {
      toast.error(`A column for time ${newTime} already exists.`);
      return;
    }
    setTimeOffsets(prev => [...prev, newTime].sort((a, b) => a - b));
    setData(prevData =>
      prevData.map(row => ({ ...row, [newTime]: '' }))
    );
  };

  const handleColOffsetChange = (offset: number | string) => {
    if (typeof offset === "number") {
      setColumnOffset(prev => prev + offset);
    } else if (offset === 'reset') {
      setColumnOffset((Math.floor(timeOffsets.length / tableWidth)) * tableWidth)
    }
  }

  const handleSave = async () => {
    if (dirtyColumns.size === 0) {
      toast.info("No changes to save.");
      return;
    }

    setIsSaving(true);
    try {
      if (!userId || !groupId || !sessionId || !caseId) {
        toast.error('Case data still loading. Please try again.')
        return
      }
      // 1. Unpivot the data: Build one DB row for every dirty time column
      const payload = Array.from(dirtyColumns).map(timeOffset => {
        const dbRecord: StudentDatabaseDocumentation = {
          case_id: caseId,
          case_session_id: sessionId,
          user_id: userId,
          group_id: groupId,
          time_offset: Number(timeOffset),
          is_in_presim: false,
        };

        // 2. Loop through all frontend rows to grab the values for this specific time column
        data.forEach(row => {
          const isDataRow = row.componentType !== 'static' &&
            row.componentType !== 'checkboxlist' &&
            row.componentType !== 'totalScoreRow';

          if (isDataRow && row.id) {
            const cellValue = row[timeOffset];
            // explicit any with large, pivoted data set
            (dbRecord as Record<string, any>)[row.id] = cellValue !== '' ? cellValue : null;
          }
        });

        return dbRecord;
      });

      const { error } = await upsertDocumentationRows(payload);

      if (error) throw error;

      toast.success("FlexSheet data saved successfully!");

      // 4. Clear the dirty columns
      setDirtyColumns(new Set());

    } catch (err) {
      toast.error("Failed to save data");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  // handle refreshing and Back navigation when user has unsaved data
  useEffect(() => {
    handleUnsavedCharting(dirtyColumns.size > 0);
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (dirtyColumns.size > 0) {
        event.preventDefault();
        return 'You have unsaved charting data.';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [dirtyColumns, handleUnsavedCharting]);

  // Auto-open sidebar logic
  useEffect(() => {
    let shouldOpen = false;
    for (const tool of assessmentTools) {
      if (visibleSubsetIds.has(tool.name)) {
        shouldOpen = true;
        break;
      }
    }
    if (shouldOpen !== isSidebarOpen) setIsSidebarOpen(shouldOpen);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleSubsetIds]);


  const columns = useMemo(() => [
    columnHelper.accessor("field", {
      id: 'pinned',
      header: () => <h1 className="w-full h-full bg-gray-50"></h1>,
      cell: info => {
        const rowType = info.row.original.rowType;
        if (rowType === "titleRow") {
          const wdlDescription = info.row.original?.wdlDescription;
          if (wdlDescription && wdlDescription.length > 0) {
            return (
              <ChartingToolTip field={info.row.original.field} descriptions={wdlDescription} />
            );
          }
          return <p className="min-w-24 h-full text-xs text-left py-0 pl-2 px-2 font-medium text-lime-900">{info.row.original.field}</p>;
        } else if (rowType === "totalScoreRow") {
          const toolName = info.row.original.field.replace(' Total Score', '');
          const toolInterpretation = assessmentTools.find(tool => tool.name === toolName)?.interpretations;
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
                          <p className="text-xs font-semibold text-gray-800">{interp.result} ({interp.range}):</p>
                          <p className="pl-2 text-xs text-gray-600 italic">{interp.description}</p>
                        </div>
                      ))}
                    </div>
                  </TooltipContent>
                </Tooltip>
              ) : `${info.getValue()} Total`}
            </div>
          )
        }
        return <p className="min-w-24 h-full text-left text-xs py-0 pl-4 text-neutral-600 shadow-none rounded-none focus-visible:ring-0 focus-visible:ring-offset-0">{info.getValue()}</p>;
      },
    }),
    ...slicedTimeOffsets.map(offsetKey => {
      const displayData = formatTimeFromOffset(offsetKey, simStartTime);
      const displayDate = displayData?.date || "";
      const displayTime = displayData?.time || "";

      return columnHelper.accessor(row => row[offsetKey], {
        id: String(offsetKey),
        header: () => (
          <div className="flex flex-col justify-center items-center">
            <h2 className="my-1 text-neutral-500 text-xs font-light">{displayDate}</h2>
            <p className="mb-1">{displayTime}</p>
          </div>
        ),
        cell: ({ row, column, getValue, table }) => {
          const initialValue = (getValue() as string) || '';
          const componentType = row.original.componentType;

          switch (componentType) {
            case 'static':
              return <p></p>
            case 'input':
              return (
                <TableInputCell
                  row={row}
                  column={column}
                  getValue={getValue}
                  table={table}
                />
              )
            case 'totalScoreRow':
              return (
                <p className="text-right pr-2 py-0 text-xs font-semibold">{initialValue}</p>
              )
            case 'assessmentselect':
              return (
                <TableAssessmentSelectCell
                  row={row}
                  column={column}
                  getValue={getValue}
                  table={table}
                />
              )
            case 'checkboxlist':
              const selectionKey = `${row.original.id}-${column.id}`;
              const currentSelectedSubsets = fieldSelections[selectionKey] || [];
              return (
                <CheckBoxList
                  options={row.original.assessmentSubsets || []}
                  selectedOptions={currentSelectedSubsets}
                  rowId={row.original.id}
                  columnId={column.id}
                  onSelectionChange={handleSubsetSelection}
                />
              );
          }
        }
      })
    })
  ], [simStartTime, fieldSelections, handleSubsetSelection, slicedTimeOffsets]);

  const ptTable = useReactTable({
    data: filteredData,
    columns,
    enablePinning: true,
    initialState: { columnPinning: { left: ['pinned'] } },
    meta: {
      updateData: (rowIndex, columnId, value) => {
        // Map filtered row back to main data using ID
        const rowId = filteredData[rowIndex]?.id;
        if (!rowId) return;

        const realIndex = data.findIndex(r => r.id === rowId);
        if (realIndex !== -1) {
          handleCellUpdate(realIndex, columnId, value as string | string[]);
        }
      },
    },
    getCoreRowModel: getCoreRowModel(),
  });
  console.log(data)
  return (
    <SidebarProvider open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
      <SidebarInset>
        <div className="flex flex-col bg-gray-100 w-[calc(100vw-16rem)] h-[calc(100vh-4rem)] px-4">
          <div className="flex flex-col w-full h-full justify-center items-center gap-2 pt-2 ">
            <div className="w-full flex justify-start gap-3 ">
              <AddTimeColumnButton
                onColumnAdd={handleColumnAdd}
                existingTimeColumns={timeOffsets}
                sessionStartTime={simStartTime}
              />
              <Button onClick={handleSave} disabled={isSaving || !canSubmit} className="h-6 bg-lime-500 text-white hover:bg-lime-600 shadow">
                {isSaving ? "Saving..." : "File"}
              </Button>
              <Button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="bg-white h-6 w-4 text-black hover:bg-gray-200 shadow shadow-black/20">
                {isSidebarOpen ? <PanelLeftOpenIcon /> : <PanelLeftCloseIcon />}
              </Button>
              <FlexSheetColumnShifter
                columnOffset={columnOffset}
                onColumnShift={handleColOffsetChange}
                columns={timeOffsets}
                tableWidth={tableWidth}
                simStartTime={simStartTime}
              />
            </div>
            <div className="flex-grow w-full overflow-hidden border border-gray-200 rounded-md flex flex-col ">
              <Table className="w-full rounded-md">
                <TableHeader className=" bg-gray-50">
                  {ptTable.getHeaderGroups().map(headerGroup => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map(header => (
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
                  {ptTable.getRowModel().rows.map(row => (
                    <TableRow key={row.id} className="h-6">
                      {row.getVisibleCells().map(cell => (
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
      </SidebarInset>
      <FlexSheetSidebar />
    </SidebarProvider>
  );
}

export default FlexSheetView;