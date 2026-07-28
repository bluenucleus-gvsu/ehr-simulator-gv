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
  readOnly?: boolean;
}
export const TableInputCell = ({ getValue, row, column, table, readOnly = false }: CellProps) => {
  const initialValue = (getValue() as string) || "";
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const alertFlag = getAlertFlag(row.original, value, row.original.componentType);

  const onBlur = () => {
    if (readOnly) return;
    if (value != initialValue) {
      table.options.meta?.updateData(row.index, column.id, value);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      (e.target as HTMLInputElement).blur();
    }
  };

  if (readOnly) {
    return (
      <div className="flex items-center h-6">
        <p className={`w-full text-right pr-2 text-xs ${alertFlag ? "text-red-600 font-medium" : "text-neutral-700"}`}>
          {value}
        </p>
      </div>
    );
  }

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

export const TableAssessmentSelectCell = ({ getValue, row, column, table, readOnly = false }: CellProps) => {
  const initialValue = (getValue() as string) || "";
  const [selectedValue, setSelectedValue] = useState(initialValue);
  const chartingOptions = (row.original.chartingOptions || []) as chartingOptions[];

  useEffect(() => {
    setSelectedValue(initialValue);
  }, [initialValue]);

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