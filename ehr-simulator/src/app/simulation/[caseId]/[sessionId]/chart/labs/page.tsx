'use client'

import { useState, useEffect, useMemo } from "react";
import { useReactTable, getCoreRowModel, flexRender, createColumnHelper, type Column } from "@tanstack/react-table";
import { Tooltip, TooltipTrigger, TooltipContent, } from "@/components/ui/tooltip";
import { TriangleAlert } from "lucide-react";
import { formatTimeFromOffset } from "../charting/chartingView";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  TableFooter
} from "@/components/ui/table";

import ImagingReport from "./components/imagingReport";
import PathologyReport from "./components/microbiologyReport";
import {
  type ImagingData,
  type LabTableData,
  type MicrobiologyReportData,
  generateAllInitialLabTimes,
  generateInitialLabData,
  labTemplate
} from "./components/labsData"

export const getResultStatus = (initialValue: string, normalRange: { low: number, high: number } | undefined, criticalRange: { low: number, high: number } | undefined) => {
  const numericValue = parseFloat(initialValue)

  if (isNaN(numericValue)) {
    return 'invalid';
  }
  if (criticalRange && (numericValue < criticalRange.low || numericValue > criticalRange.high)) {
    return "critical";
  }
  if (normalRange && (numericValue < normalRange.low || numericValue > normalRange.high)) {
    return "abnormal";
  }
  return "normal";
}

const columnHelper = createColumnHelper<LabTableData>();
function getPinnedStyles(column: Column<LabTableData>): React.CSSProperties {
  const isPinned = column.getIsPinned();
  if (!isPinned) {
    return {};
  }
  const side = isPinned as 'left' | 'right';
  return {
    position: 'sticky',
    [side]: `${column.getStart(side)}px`,
    zIndex: side === 'left' ? 2 : 1,
    width: '240px'
  };
}

export function LabPage() {
  const [simStartTime] = useState(new Date().getTime());
  const [labTableData, setLabTableData] = useState<LabTableData[]>([]);
  const [timePoints, setTimePoints] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const generateData = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));

      const allTimePoints = generateAllInitialLabTimes(simStartTime);

      const timeColumnDateKeys = allTimePoints.map(timePoint => timePoint.dateKey);

      const initialLabTableData = generateInitialLabData(allTimePoints, labTemplate);

      const filteredLabTableData = initialLabTableData.filter(row => {
        if (!row.hideable) {
          return true;
        }
        // Check if every column for this row is empty
        const allValuesEmpty = timeColumnDateKeys.every(dateKey => {
          const labValue = row[dateKey];
          return !labValue; // Returns true if value is empty/undefined
        });
        return !allValuesEmpty; // Keep row if NOT all values are empty
      });

      setLabTableData(filteredLabTableData);
      setTimePoints(timeColumnDateKeys);
      setIsLoading(false);
    };

    generateData();
  }, [simStartTime]);


  const columns = useMemo(() => [
    columnHelper.accessor("field", {
      id: 'pinned',
      header: () => <h1 className="w-full h-full bg-gray-50"></h1>,
      cell: info => {
        const rowType = info.row.original.rowType;
        const field = info.row.original.field
        if (rowType === "divider") {
          return (
            <p className="text-left text-xs py-0 px-2 font-medium text-blue-900">
              {field}
            </p>
          );
        }
        else {
          const labRange = info.row.original?.normalRange;
          if (labRange) {
            const unit = info.row.original?.unit || ''
            return (
              <Tooltip>
                <TooltipTrigger className="w-full font-normal text-xs text-neutral-700 shadow-none rounded-none">
                  <div className="flex justify-end w-full">
                    <p className="text-right font-normal px-2 text-xs text-neutral-700">{field}</p>
                    {unit && <p className="text-right font-normal pr-2 text-xs tracking-tight text-neutral-400">{unit}</p>}
                  </div>
                </TooltipTrigger>
                <TooltipContent className="bg-white shadow border border-gray-200 rounded-xl ml-4 z-10">
                  <h1 className="text-md font-semibold text-black">{field}</h1>
                  <div className="">
                    <div className="text-xs">
                      <p className="pl-2 text-gray-800 text-xs font-medium">
                        <span className="font-normal">Low: </span>
                        &#60;{labRange.low}
                      </p>
                      <p className="pl-2 text-gray-800 text-xs font-medium">
                        <span className="font-normal">High: </span>
                        &#62;{labRange.high}</p>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          }
          return (
            <p className="text-right font-normal px-2 text-xs text-neutral-700">
              {field}
            </p>
          );
        }
      }
    }),

    // Dynamic Time Columns
    ...timePoints.map(timePoint => {
      const { time: displayTime, date: displayDate } = formatTimeFromOffset(timePoint, simStartTime);

      return columnHelper.accessor(row => row[timePoint], {
        id: String(timePoint),
        header: () => (
          <div className="flex flex-col justify-center items-center">
            <h2 className="my-1 text-neutral-500 text-xs font-light">{displayDate}</h2>
            <p className="mb-1 text-sm">{displayTime}</p>
          </div>
        ),
        cell: ({ row, column, getValue }) => {
          const rowType = row.original.rowType;

          if (rowType === "results") {
            const initialValue = (getValue() as string) || '';
            const abnormalRange = row.original?.normalRange
            const criticalRange = row.original?.criticalRange

            const resultStatus = getResultStatus(initialValue, abnormalRange, criticalRange);
            const isCritical = resultStatus === "critical"
            const isAbnormal = resultStatus === "abnormal"

            return (
              <div key={`${row.id}-${column.id}-${row.original.field}`} className="flex items-center w-full px-2">
                {isCritical && <TriangleAlert color="#e7000b" size={18} />}
                <p className={`w-full text-right text-xs ${(isAbnormal || isCritical) && "text-red-600 font-medium"}`}>{initialValue}</p>
              </div>
            );
          }

          // --- IMAGING CELLS ---
          else if (rowType === "imaging") {
            const imagingReport = (getValue() as ImagingData) || { displayName: "", technique: "", findings: [], impressions: [''] }
            if (!imagingReport.displayName) {
              return <></>
            }
            return (
              <ImagingReport
                key={`${row.id}-${column.id}-${row.original.field}`}
                cellName={row.original.field}
                imagingReportContents={imagingReport}
                displayTime={displayTime || ''}
                displayDate={displayDate || ''}
              />
            )
          }

          // --- MICROBIOLOGY CELLS ---
          else if (rowType === "microbiology") {
            const pathologyReport = (getValue() as MicrobiologyReportData) || {}
            if (Object.keys(pathologyReport).length === 0) {
              return <></>
            }
            return (
              <PathologyReport
                key={`${row.id}-${column.id}-${row.original.field}`}
                report={pathologyReport}
                cellLabel={row.original.field}
                displayTime={displayTime || ''}
                displayDate={displayDate || ''}

              />
            )
          }
        }
      })
    })
  ],
    [timePoints, simStartTime]
  );

  const ptTable = useReactTable({
    data: labTableData,
    columns,
    enablePinning: true,
    initialState: {
      columnPinning: {
        left: ['pinned']
      },
    },
    getCoreRowModel: getCoreRowModel(),
  });


  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] w-[calc(100vw-16rem)] bg-gray-100 justify-center items-center">
        <p className="text-gray-500 animate-pulse">Loading Labs...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] w-[calc(100vw-16rem)] bg-gray-100 justify-center items-center px-4 pt-4 ">
      <div className="w-full h-full border border-gray-200 rounded-t-lg overflow-auto">
        <Table className="w-full overflow-x-auto">
          <TableHeader className=" bg-gray-50 sticky top-0">
            {ptTable.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead
                    style={getPinnedStyles(header.column)}
                    key={header.id}
                    className="border-b-2 border-gray-200 p-0"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {ptTable.getRowModel().rows.map(row => (
              <TableRow key={row.id} className="h-6">
                {row.getVisibleCells().map(cell => {
                  const rowType = row.original.rowType

                  return (
                    <TableCell
                      style={getPinnedStyles(cell.column)}
                      key={`${cell.id}-${row.original.field}`}
                      className={`p-0 min-w-24 border-separate border-gray-200 border-b ${rowType === "divider" ? "bg-blue-50" : "bg-white border-r border-separate"}`}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  )
                })}
              </TableRow>
            ))}
          </TableBody>

          <TableFooter className="bg-gray-100">
            {ptTable.getFooterGroups().map(footerGroup => (
              <TableRow key={footerGroup.id}>
                {footerGroup.headers.map(header => (
                  <TableHead
                    key={header.id}
                    className="h-6 p-0 text-left text-gray-700 border-gray-300">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                        header.column.columnDef.footer,
                        header.getContext()
                      )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableFooter>
        </Table>
      </div>
    </div>
  );
}

export default LabPage;