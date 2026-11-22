import { LabCellValue, LabSeverityLevel, LabTableData } from "@/app/simulation/[caseId]/[sessionId]/chart/labs/components/labsData";
import { getResultStatus } from "@/app/simulation/[caseId]/[sessionId]/chart/labs/components/labsData";
import { Input } from "@/components/ui/input";
import { Column, Row, Table } from "@tanstack/react-table";
import { TriangleAlert } from "lucide-react";
import { useState } from "react";

interface CellProps {
  getValue: () => string | number | boolean | object | LabCellValue | undefined;
  row: Row<LabTableData>;
  column: Column<LabTableData, unknown>;
  table: Table<LabTableData>;
  visibleInPresim: boolean;
}

export function getCellColor(status: boolean, value: string) {
  if (value && status) {
    return 'bg-lime-100'
  } else if (value && !status) {
    return 'bg-yellow-100'
  }
  return ''
}

export const LabTableInputCell = ({ getValue, row, column, table, visibleInPresim }: CellProps) => {
  const initialValue = (getValue() as LabCellValue) || "";
  const initialSafeValue = typeof initialValue === 'string' ? initialValue : '';

  const [value, setValue] = useState(initialSafeValue)

  const abnormalRange = row.original?.normalRange
  const criticalRange = row.original?.criticalRange

  const resultStatus = getResultStatus(value, abnormalRange, criticalRange);
  const isCritical = resultStatus === LabSeverityLevel.CRITICAL
  const isAbnormal = resultStatus === LabSeverityLevel.ABNORMAL

  const onBlur = () => {
    table.options.meta?.updateData(row.index, column.id, value)
  }
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <div
      key={`${row.id}-${column.id}-${row.original.field}`}
      className={`flex h-6 items-center w-full hover:bg-gray-50 ${getCellColor(visibleInPresim, value)}`}
    >
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={onBlur}
        className={`w-full h-6 text-right !text-xs border-0 rounded-none shadow-none focus-visible:ring-0 ${(isAbnormal || isCritical) && "text-red-600 font-medium"}`}
        onKeyDown={onKeyDown}
        key={`${row.id}-${column.id}-${row.original.field}`}
      />
      {isCritical && <TriangleAlert color="#e7000b" size={18} />}
    </div>
  );
};