'use client'

import { useReactTable, getCoreRowModel, flexRender, type RowData } from "@tanstack/react-table";
import { useState } from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { AddTimeColumnButton } from "./addTimeColButton";
import { useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { PanelLeftCloseIcon, PanelLeftOpenIcon } from "lucide-react";
import { toast } from "sonner";
import FlexSheetColumnShifter from "./flexSheetColumnShifter";
import { ImagingData, LabCellValue } from "../../labs/components/labsData";
import { DatabaseDocumentation } from "@/actions/simulation";
import { useSimSessionContext } from "@/context/SimSessionContext";
import { getPinnedStyles } from "@/lib/flexSheet/flexSheetHelpers";
import { useSimulationCase } from "@/context/SimulationCaseContext";
import { useStudentSimulationEditAccess } from "@/utils/studentSimulationEditAccess";
import { useFlexSheetInitialization } from "@/hooks/useFlexSheetInitialization";
import { useFlexSheetState } from "@/hooks/useFlexSheetState";
import { useFlexSheetPagination } from "@/hooks/useFlexSheetPagination";
import { useFlexSheetDerivedData } from "@/hooks/useFlexSheetDerivedData";
import { saveFlexSheetData } from "@/lib/flexSheet/flexSheetSave";
import { useFlexSheetColumns } from "@/hooks/useFlexSheetColumns";

declare module '@tanstack/react-table' {
  interface TableMeta<TData extends RowData> {
    updateData: (
      rowIndex: number,
      columnId: string,
      value: string | string[] | ImagingData | LabCellValue | Partial<TData>) => void
  }
}

interface FlexSheetViewProps {
  documentation: DatabaseDocumentation[];
  caseId: string;
  sessionId: string;
}

const TABLE_WIDTH = 6;

export function FlexSheetView({ documentation, caseId, sessionId }: FlexSheetViewProps) {
  const { caseBundle } = useSimulationCase();
  const { canEdit } = useStudentSimulationEditAccess();
  const { groupId, userId, simStartTime, handleUnsavedCharting, isPresim } = useSimSessionContext();
  const [isSaving, setIsSaving] = useState(false);
  const { open, toggleSidebar } = useSidebar()

  const { initialCharting, assessmentToolGuides } = useFlexSheetInitialization(caseBundle, documentation);

  const {
    data,
    timeOffsets,
    fieldSelections,
    dirtyColumns,
    handleCellUpdate,
    handleSubsetSelection,
    handleColumnAdd,
    resetDirtyColumns
  } = useFlexSheetState({ initialCharting, isPresim, canEdit, handleUnsavedCharting });

  const { slicedTimeOffsets, columnOffset, handleColOffsetChange } = useFlexSheetPagination(timeOffsets, TABLE_WIDTH);

  const filteredData = useFlexSheetDerivedData(data, fieldSelections, timeOffsets);

  const canSubmit = dirtyColumns.size > 0;

  const handleSave = async () => {
    if (!canEdit) {
      toast.error("FlexSheets are view-only in pre-simulation.");
      return;
    }
    if (!canSubmit) return;
    if (!userId || !groupId || !sessionId || !caseId) {
      toast.error("Case data still loading.");
      return;
    }

    setIsSaving(true);
    try {
      await saveFlexSheetData({ caseId, sessionId, userId, groupId, data, dirtyColumns });
      toast.success("FlexSheet data saved successfully!");
      resetDirtyColumns();
    } catch (err) {
      toast.error(`Failed to save data (${err instanceof Error ? err.message : "Unknown error"})`);
    } finally {
      setIsSaving(false);
    }
  };
  const columns = useFlexSheetColumns({
    slicedTimeOffsets, simStartTime, fieldSelections, handleSubsetSelection, canEdit, assessmentToolGuides
  });

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
            className={`bg-white h-6 w-4 text-black hover:bg-gray-200 shadow shadow-black/20`}
          >
            {open ? <PanelLeftOpenIcon /> : <PanelLeftCloseIcon />}
          </Button>
          <FlexSheetColumnShifter
            columnOffset={columnOffset}
            onColumnShift={handleColOffsetChange}
            columns={timeOffsets}
            tableWidth={TABLE_WIDTH}
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