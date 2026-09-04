import { FlexSheetData } from "@/lib/flexSheet/flexSheetTypes";
import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";

interface UseFlexSheetStateProps {
  initialCharting: {
    rows: FlexSheetData[];
    timeOffsets: number[];
    timePointsInPreSim: Set<number>;
  };
  isPresim: boolean | null;
  canEdit: boolean;
  handleUnsavedCharting: (hasUnsaved: boolean) => void;
}

export function useFlexSheetState({
  initialCharting,
  isPresim,
  canEdit,
  handleUnsavedCharting,
}: UseFlexSheetStateProps) {

  const [timeOffsets, setTimeOffsets] = useState<number[]>(
    isPresim
      ? Array.from(initialCharting.timePointsInPreSim).sort((a, b) => a - b)
      : initialCharting.timeOffsets
  );

  const [data, setData] = useState(initialCharting.rows);

  const [fieldSelections, setFieldSelections] = useState<Record<string, string[]>>(() => {
    const initialSelections: Record<string, string[]> = {};

    initialCharting.rows.forEach((row) => {
      if (row.componentType === "checkboxlist") {
        timeOffsets.forEach((time) => {
          const val = row[time];
          if (typeof val === "string" && val.length > 0) {
            initialSelections[`${row.id}-${time}`] = val.split(",");
          }
        });
      }
    });
    return initialSelections;
  });

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
    (newTime: number) => {
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
    },
    [canEdit, timeOffsets]
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