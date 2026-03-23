import AssessmentSelect from "@/app/simulation/[caseId]/[sessionId]/chart/charting/components/assessmentSelector";
import { chartingOptions, FlexSheetData } from "@/app/simulation/[caseId]/[sessionId]/chart/charting/components/flexSheetData";
import { getAlertFlag } from "@/app/simulation/[caseId]/[sessionId]/chart/charting/components/flexSheetHelpers";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import {
  Row,
  Column,
  Table
} from "@tanstack/react-table";


interface CellProps {
  getValue: () => string | number | boolean | string[] | { subsetId: string; label: string; }[] | { low: number; high: number; } | { assessment: string; description: string; }[] | undefined;
  row: Row<FlexSheetData>;
  column: Column<FlexSheetData, unknown>;
  table: Table<FlexSheetData>;
}
export const TableInputCell = ({ getValue, row, column, table }: CellProps) => {
  const initialValue = (getValue() as string) || "";
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const alertFlag = getAlertFlag(row.original, value, row.original.componentType);

  const onBlur = () => {
    if (value != initialValue) {
      table.options.meta?.updateData(row.index, column.id, value);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <div className="flex h-6 items-center w-full hover:bg-gray-50">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={onBlur}
        className={`w-full h-6 text-right md:text-xs border-0 rounded-none shadow-none focus-visible:ring-0 ${alertFlag ? "text-red-600 font-medium" : ""}`}
        onKeyDown={onKeyDown}
      />
    </div>
  );
};

export const TableAssessmentSelectCell = ({ getValue, row, column, table }: CellProps) => {
  const initialValue = (getValue() as string) || "";
  const [selectedValue, setSelectedValue] = useState(initialValue);
  const chartingOptions = (row.original.chartingOptions || []) as chartingOptions[];

  useEffect(() => {
    setSelectedValue(initialValue);
  }, [initialValue]);

  const handleComponentChange = (newValue: string) => {
    setSelectedValue(newValue);
    table.options.meta?.updateData(row.index, column.id, newValue);
  };

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