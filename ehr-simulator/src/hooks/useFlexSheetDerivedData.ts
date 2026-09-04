import { useMemo } from "react";
import { calculateColTotal } from "@/lib/flexSheet/flexSheetHelpers";
import { FlexSheetData } from "@/lib/flexSheet/flexSheetTypes";

export function useFlexSheetDerivedData(
  data: FlexSheetData[],
  fieldSelections: Record<string, string[]>,
  timeOffsets: number[]
) {
  const visibleSubsetIds = useMemo(() => {
    const combinedSet = new Set<string>();
    Object.values(fieldSelections).forEach((selectedIdsArray) => {
      selectedIdsArray.forEach((id) => {
        if (id !== "WDL") combinedSet.add(id);
      });
    });
    return combinedSet;
  }, [fieldSelections]);

  const filteredData = useMemo(() => {
    const groupedByTool: Record<string, FlexSheetData[]> = {};

    data.forEach((row) => {
      if (row.toolId && row.componentType !== "static") {
        groupedByTool[row.toolId] = groupedByTool[row.toolId] || [];
        groupedByTool[row.toolId].push(row);
      }
    });

    const newFilteredData: FlexSheetData[] = [];

    data.forEach((row) => {
      const isVisible = !row.hideable || visibleSubsetIds.has(row.id);

      if (isVisible) {
        newFilteredData.push(row);
      }

      if (row.rowType === "titleRow" && row.toolId) {
        const toolName = row.toolId;
        if (isVisible && groupedByTool[toolName]) {
          const totalRow = calculateColTotal(row.field, row.toolId, groupedByTool[toolName], timeOffsets);
          newFilteredData.push(totalRow);
        }
      }
    });

    return newFilteredData;
  }, [data, visibleSubsetIds, timeOffsets]);

  return filteredData;
}