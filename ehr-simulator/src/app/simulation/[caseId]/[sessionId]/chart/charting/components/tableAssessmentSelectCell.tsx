import { CellProps } from "./tableInputCell";
import { useState } from "react";
import AssessmentSelect from "@/app/simulation/[caseId]/[sessionId]/chart/charting/components/assessmentSelector";
import { ChartingOptions } from "@/lib/flexSheet/flexSheetTypes";


const TableAssessmentSelectCell = ({ getValue, row, column, table, readOnly = false }: CellProps) => {
  const initialValue = (getValue() as string) || "";
  const [selectedValue, setSelectedValue] = useState(initialValue);
  const chartingOptions = (row.original.chartingOptions || []) as ChartingOptions[];

  const handleComponentChange = (newValue: string) => {
    if (readOnly) return;
    setSelectedValue(newValue);
    table.options.meta?.updateData(row.index, column.id, newValue);
  };

  if (readOnly) {
    const label =
      chartingOptions.find((opt) => opt.subsetId === selectedValue)?.label ?? selectedValue;
    return (
      <p className="h-6 w-full truncate pr-2 text-right text-xs text-neutral-700">{label}</p>
    );
  }

  return (
    <AssessmentSelect
      options={chartingOptions}
      value={selectedValue}
      rowId={row.original.id}
      columnId={column.id}
      onValueChange={handleComponentChange}
      className="p-0 h-6 hover:bg-muted/30"
    />
  );
};

export default TableAssessmentSelectCell