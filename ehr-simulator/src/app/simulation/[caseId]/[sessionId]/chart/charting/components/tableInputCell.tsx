import { getAlertFlag } from "@/lib/flexSheet/flexSheetHelpers";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import {
  Row,
  Column,
  Table
} from "@tanstack/react-table";
import { FlexSheetData } from "@/lib/flexSheet/flexSheetTypes";


export interface CellProps {
  getValue: () => string | number | boolean | string[] | { subsetId: string; label: string; }[] | { low: number; high: number; } | { assessment: string; description: string; }[] | undefined;
  row: Row<FlexSheetData>;
  column: Column<FlexSheetData, unknown>;
  table: Table<FlexSheetData>;
  readOnly?: boolean;
}

const TableInputCell = ({ getValue, row, column, table, readOnly = false }: CellProps) => {
  const initialValue = (getValue() as string) || "";
  const [value, setValue] = useState(initialValue);

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

export default TableInputCell;