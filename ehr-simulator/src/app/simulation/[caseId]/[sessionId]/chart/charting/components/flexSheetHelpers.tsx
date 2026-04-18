import { Column } from "@tanstack/react-table";
import { FlexSheetData } from "./flexSheetData";
import { LabTableData } from "../../labs/components/labsData";
import { addMinutes, format } from "date-fns";

const bpThresholds = {
  diastolic: { low: 60, high: 120 },
  systolic: { low: 90, high: 180 }
}

export function getAlertFlag(
  rowOriginal: FlexSheetData,
  value: string,
  componentType: string
): boolean {
  if (!value || componentType != 'input') {
    return false
  }

  if (rowOriginal.id === 'bpInput') {
    const [systolicStr, diastolicStr] = value.split('/');
    const systolic = parseFloat(systolicStr)
    const diastolic = parseFloat(diastolicStr)

    let diaAlert = false;
    let sysAlert = false;

    if (!isNaN(systolic)) {
      sysAlert = systolic < bpThresholds.systolic.low || systolic > bpThresholds.systolic.high;
      diaAlert = diastolic < bpThresholds.diastolic.low || diastolic > bpThresholds.diastolic.high;

      return sysAlert || diaAlert
    }
  }
  const normalRange = rowOriginal?.normalRange;
  if (normalRange) {
    const numericValue = parseFloat(value);
    if (!isNaN(numericValue)) {
      return numericValue < normalRange.low || numericValue > normalRange.high;
    }
  }

  return false;
}


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
    zIndex: isHeader ? 10 : (side === 'left' ? 2 : 1),
    width: width
  };
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

export const getLastPageOffset = (totalItems: number, width: number) => {
  return Math.max(0, Math.ceil(totalItems / width) - 1) * width;
};