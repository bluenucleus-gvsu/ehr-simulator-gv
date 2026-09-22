import { formatTimeFromOffset } from "@/lib/flexSheet/flexSheetHelpers";
import { FlexSheetData } from "@/lib/flexSheet/flexSheetTypes";
import { differenceInMinutes } from "date-fns";
import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";

interface UseFlexSheetStateProps {
  initialCharting: {
    rows: FlexSheetData[];
    timeOffsets: number[];
    timeOffsetsInPreSim: Set<number>;
  };
  simStartTime: number | null,
  isPresim: boolean | null;
  canEdit: boolean;
  handleUnsavedCharting: (hasUnsaved: boolean) => void;
}

function columnAddSuccess(timeOffset: number, sessionStartTime: number | null) {
  const timeData = formatTimeFromOffset(timeOffset, sessionStartTime)
  const date = timeData?.date || 'Unknown Date'
  const time = timeData?.time || 'Unknown Time'
  toast.success(`Column added at ${time + ' on ' + date}.`);
}

function handleConflictingTimes(timeOffset: number, sessionStartTime: number) {
  const timeData = formatTimeFromOffset(timeOffset, sessionStartTime)
  const date = timeData?.date || 'Unknown Date'
  const time = timeData?.time || 'Unknown Time'
  toast.error(`Column for ${date + ' at ' + time} already exists`, {
    description: "Please choose a different time or use an existing column.",
  });
}


export function useFlexSheetState({
  initialCharting,
  isPresim,
  canEdit,
  simStartTime,
  handleUnsavedCharting,
}: UseFlexSheetStateProps) {

  const [timeOffsets, setTimeOffsets] = useState<number[]>([]);
  const [fieldSelections, setFieldSelections] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (isPresim == null) return;

    const resolvedOffsets = isPresim
      ? Array.from(initialCharting.timeOffsetsInPreSim).sort((a, b) => a - b)
      : initialCharting.timeOffsets;

    setTimeOffsets(resolvedOffsets);

    const selections: Record<string, string[]> = {};
    initialCharting.rows.forEach((row) => {
      if (row.componentType !== "checkboxlist") return;
      resolvedOffsets.forEach((time) => {
        const val = row[time];
        if (typeof val === "string" && val.length > 0) {
          selections[`${row.id}-${time}`] = val.split(",");
        }
      });
    });
    setFieldSelections(selections);
  }, [isPresim, initialCharting]);

  const [data, setData] = useState(initialCharting.rows);

  const [dirtyColumns, setDirtyColumns] = useState<Set<string>>(new Set());

  const handleCellUpdate = useCallback(
    (rowIndex: number, columnId: string, value: string | string[]) => {
      if (!canEdit) return;
      setData((prevData) =>
        prevData.map((row, index) => {
          if (index === rowIndex) {
            return { ...row, [columnId]: value };
          }
          return row;
        })
      );

      setDirtyColumns((prev) => {
        const newSet = new Set(prev);
        newSet.add(columnId);
        return newSet;
      });
    },
    [canEdit]
  );

  const handleSubsetSelection = useCallback(
    (rowId: string, columnId: string, selectedIdsForField: string[]) => {
      if (!canEdit) {
        return;
      }

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
        })
      );

      setDirtyColumns((prev) => {
        const newSet = new Set(prev);
        newSet.add(columnId);
        return newSet;
      });
    },
    [canEdit]
  );

  const handleColumnAdd = useCallback(
    (newDate: Date | null) => {
      if (!newDate || !simStartTime) {
        return
      }

      const newTime = differenceInMinutes(newDate.getTime(), simStartTime)

      if (!canEdit) {
        toast.error("FlexSheets are view-only in pre-simulation.");
        return;
      }
      if (timeOffsets.includes(newTime)) {
        handleConflictingTimes(newTime, simStartTime);
        return;
      }
      setTimeOffsets((prev) => [...prev, newTime].sort((a, b) => a - b));
      setData((prevData) => prevData.map((row) => ({ ...row, [newTime]: "" })));
      columnAddSuccess(newTime, simStartTime)
    },
    [canEdit, timeOffsets, simStartTime]
  );

  const resetDirtyColumns = useCallback(() => {
    setDirtyColumns(new Set());
  }, []);

  useEffect(() => {
    const hasUnsavedChanges = dirtyColumns.size > 0;
    handleUnsavedCharting(hasUnsavedChanges);

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        event.preventDefault();
        return "You have unsaved charting data.";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [dirtyColumns.size, handleUnsavedCharting]);

  return {
    data,
    timeOffsets,
    fieldSelections,
    dirtyColumns,
    handleCellUpdate,
    handleSubsetSelection,
    handleColumnAdd,
    resetDirtyColumns,
  };
}