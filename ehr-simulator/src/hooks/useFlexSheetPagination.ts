import { useState, useMemo, useCallback, useEffect } from "react";

export function focusColumnOffset(
  timeOffsets: number[],
  target: number,
  tableWidth: number
): number {
  const index = timeOffsets.indexOf(target);
  if (index === -1) return 0;

  const maxOffset = Math.max(0, timeOffsets.length - tableWidth);

  let page = maxOffset;
  while (page > index) {
    page -= tableWidth;
  }
  return Math.max(0, page);
}

export function useFlexSheetPagination(timeOffsets: number[], tableWidth: number) {
  const maxOffset = Math.max(0, timeOffsets.length - tableWidth);
  const remainder = timeOffsets.length % tableWidth;

  const [columnOffset, setColumnOffset] = useState(0);
  const [aligned, setAligned] = useState(false);

  useEffect(() => {
    if (timeOffsets.length === 0) return;
    const newMax = Math.max(0, timeOffsets.length - tableWidth);
    if (!aligned || columnOffset > newMax) {
      setColumnOffset(newMax);
      setAligned(true);
    }
  }, [timeOffsets, columnOffset, aligned, tableWidth]);

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
    setColumnOffset,
  };
}