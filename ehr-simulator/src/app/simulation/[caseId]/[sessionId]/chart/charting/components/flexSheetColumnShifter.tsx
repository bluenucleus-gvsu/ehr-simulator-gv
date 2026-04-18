import { Button } from "@/components/ui/button";
import { ChevronsLeft, ChevronsRight, Undo2 } from "lucide-react";
import { formatTimeFromOffset } from "../components/flexSheetHelpers";

interface ColumnShiftControlProps {
  columns: number[];
  columnOffset: number;
  tableWidth: number;
  onColumnShift: (offset: number | string) => void;
  simStartTime: number | null;
}

const FlexSheetColumnShifter = ({ columns, onColumnShift, columnOffset, tableWidth, simStartTime }: ColumnShiftControlProps) => {
  const remainder = columns.length % tableWidth;
  const isFirstPartialPage = columnOffset === 0 && remainder !== 0;

  const visibleFirstOffset = columns[columnOffset];

  const visibleLastIndex = isFirstPartialPage
    ? remainder - 1
    : Math.min(columnOffset + tableWidth - 1, columns.length - 1);
  const visibleLastOffset = columns[visibleLastIndex];

  const firstColumnData = formatTimeFromOffset(visibleFirstOffset, simStartTime);
  const lastColumnData = formatTimeFromOffset(visibleLastOffset, simStartTime);

  const firstDate = firstColumnData?.date || "Unknown Date";
  const lastDate = lastColumnData?.date || "Unknown Date";

  const dateDisplay = firstDate === lastDate ? firstDate : `${firstDate} - ${lastDate}`;

  return (
    <div className="flex items-center h-8 border border-gray-200 rounded-lg shadow-xs overflow-hidden w-fit">
      <div className="flex items-center h-9 px-1 bg-white">
        <Button
          disabled={columnOffset <= 0}
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md"
          onClick={() => onColumnShift(-tableWidth)}
        >
          <ChevronsLeft size={16} />
        </Button>
        <p className="text-xs font-medium font-mono tracking-tight text-gray-600 min-w-[100px] text-center whitespace-nowrap">
          {dateDisplay}
        </p>
        <Button
          disabled={columnOffset + tableWidth >= columns.length}
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md"
          onClick={() => onColumnShift(tableWidth)}
        >
          <ChevronsRight size={16} />
        </Button>
      </div>
      <Button
        variant='secondary'
        size="icon"
        className="bg-gray-100 group"
        disabled={false}
        onClick={() => onColumnShift('reset')}
      >
        <div className="rounded-md p-1 transition-all ease-out group-hover:bg-blue-100 group-hover:text-blue-600 text-gray-500">
          <Undo2 />
        </div>
      </Button>
    </div>
  )
}

export default FlexSheetColumnShifter;