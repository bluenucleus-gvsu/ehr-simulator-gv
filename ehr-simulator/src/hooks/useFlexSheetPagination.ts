import { useState, useMemo, useCallback } from "react";

export function useFlexSheetPagination(timeOffsets: number[], tableWidth: number) {
  const maxOffset = Math.max(0, timeOffsets.length - tableWidth);
  const remainder = timeOffsets.length % tableWidth;

  // Initialize offset to the right-most (latest) columns
  const [columnOffset, setColumnOffset] = useState(maxOffset);

  // Calculate the subset of time columns currently visible
  const slicedTimeOffsets = useMemo(() => {
    return timeOffsets.slice(
      columnOffset,
      columnOffset === 0 && remainder !== 0
        ? remainder
        : columnOffset + tableWidth
    );
  }, [timeOffsets, columnOffset, remainder, tableWidth]);

  // Handle pagination shifts (left, right, or reset to end)
  const handleColOffsetChange = useCallback(
    (shift: number | "reset") => {
      if (typeof shift === "number") {
        setColumnOffset((prev) => {
          // Special case for shifting from 0 when there's a remainder
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
    },
    [maxOffset, remainder]
  );

  return {
    columnOffset,
    slicedTimeOffsets,
    handleColOffsetChange,
    setColumnOffset, // Exposed so we can manually adjust it when a new column is added
  };
}