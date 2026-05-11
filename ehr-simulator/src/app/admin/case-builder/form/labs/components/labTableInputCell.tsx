import { ImagingData, LabCellValue, LabTableData, MicrobiologyReportData } from "@/app/simulation/[caseId]/[sessionId]/chart/labs/components/labsData";
import { getResultStatus } from "@/app/simulation/[caseId]/[sessionId]/chart/labs/page";
import { Dialog, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Column, Row, Table } from "@tanstack/react-table";
import { AlertTriangle, FileText, TriangleAlert } from "lucide-react";
import { useEffect, useState } from "react";
import AddMicrobiologyReport from "./addMicrobiologyReport";
import AddImagingReport from "./addImagingReport";

interface CellProps {
  getValue: () => string | number | boolean | object | ImagingData | MicrobiologyReportData | LabCellValue | undefined;
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
  const isCritical = resultStatus === "critical"
  const isAbnormal = resultStatus === "abnormal"

  const onBlur = () => {
    table.options.meta?.updateData(row.index, column.id, value)
  }
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      (e.target as HTMLInputElement).blur();
    }
  };

  useEffect(() => {
    setValue(initialSafeValue)
  }, [initialSafeValue])

  if (typeof value !== 'string') {
    return (<p>Complex Data</p>)
  }
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



export function LabTableMicrobioReport({ column, row, table, getValue, visibleInPresim }: CellProps) {
  const initialData = getValue() as LabCellValue || { value: '', visibleInPresim: false }
  const reportValue = initialData

  const isMicrobioData = (val: unknown): val is MicrobiologyReportData => {
    return typeof val === 'object' && val !== null && 'cultureResults' in val;
  };
  const hasExistingReport = isMicrobioData(reportValue);

  const [isOpen, setIsOpen] = useState<boolean>(false)

  const handleAddorEditReport = (newReportData: LabCellValue) => {
    table.options.meta?.updateData(row.index, column.id, newReportData);
    setIsOpen(false);
  };
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTitle />
      <DialogTrigger asChild className="hover:bg-gray-50">
        {hasExistingReport ? (
          <button type='button' className={`w-full h-6 text-center text-xs hover:underline hover:text-blue-600 font-medium truncate transition-colors flex items-center gap-2 justify-center ${visibleInPresim ? 'bg-lime-100' : 'bg-yellow-100'}`}>
            <FileText size={14} />
            {reportValue.sampleType}
            {reportValue.isCritical && <AlertTriangle size={14} className="text-red-600" />}
          </button>
        ) : (
          <button type='button' className="w-full h-6"></button>
        )}
      </DialogTrigger>
      <AddMicrobiologyReport
        handleAddMicrobiologyReport={handleAddorEditReport}
        initialData={hasExistingReport ? reportValue : undefined}
        field={row.original.field}
      />
    </Dialog>
  )
}


export function LabTableImagingReport({ getValue, row, table, column, visibleInPresim }: CellProps) {
  const initialData = (getValue() as LabCellValue) || { value: '', visibleInPresim: false }
  const reportValue = initialData

  const isImagingData = (val: unknown): val is ImagingData => {
    return typeof val === 'object' && val !== null && 'technique' in val;
  };
  const hasExistingReport = isImagingData(reportValue);


  const [isImageReportOpen, setIsImageReportOpen] = useState(false)

  const handleAddorEditImageReport = (newReportData: LabCellValue) => {
    table.options.meta?.updateData(row.index, column.id, newReportData);
    setIsImageReportOpen(false); // Close the popover on submit
  };

  return (
    <Dialog open={isImageReportOpen} onOpenChange={setIsImageReportOpen}>
      <DialogTitle className="p-0 m-0" />
      <DialogTrigger asChild className="hover:bg-gray-50">
        {hasExistingReport ? (
          <button type='button' className={`w-full h-6 text-center text-xs hover:underline hover:text-blue-600 font-medium truncate transition-colors flex items-center gap-2 justify-center ${visibleInPresim ? 'bg-lime-100' : 'bg-yellow-100'}`}>
            <FileText size={14} />
            {reportValue.displayName}
            {reportValue.isCritical && <AlertTriangle size={14} className="text-red-600" />}
          </button>
        ) : (
          <button type='button' className="w-full h-6"></button>
        )}
      </DialogTrigger>
      <AddImagingReport
        imagingType={row.original.field}
        initialData={hasExistingReport ? reportValue : undefined}
        handleAddImagingReport={handleAddorEditImageReport}
      />
    </Dialog>
  )
}