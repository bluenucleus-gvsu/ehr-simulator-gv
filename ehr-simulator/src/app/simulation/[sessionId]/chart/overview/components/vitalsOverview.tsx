"use client"

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  type CellContext,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card } from "@/components/ui/card"
import type { FlexSheetData } from "@/app/simulation/[sessionId]/chart/charting/components/flexSheetData"
import { useMemo, useState } from "react"
import StyledTitle from "./styledTitle"
import { generateInitialChartingData, getAllTimeOffsets } from "@/app/simulation/[sessionId]/chart/charting/components/flexSheetData"
import { formatTimeFromOffset } from "../../charting/page"

export type vitalsOverviewTable = {
  field: string
  [key: string]: string
}

const vitalSignIds = [
  "hrInput",
  "bpInput",
  "rrInput",
  "tempInput",
  "spo2Input",
  "painInput",
  "weightKgInput",
];

function mostRecentVitals(
  data: FlexSheetData[],
  timeOffsets: number[],
  limit: number = 3
) {

  const activeOffsets = timeOffsets.filter(offset => {
    return data.some(row => {
      const value = row[offset];
      return value !== undefined && value !== null && value !== "";
    });
  });

  activeOffsets.sort((a, b) => a - b);

  return activeOffsets.slice(0, limit);
}



export function VitalsOverview() {
  const [sessionStartTime] = useState(new Date().getTime());

  const { allTimeOffsets, fullChartingData } = useMemo(() => {
    if (!sessionStartTime) return { allTimeOffsets: [], fullChartingData: [] };
    const offsets = getAllTimeOffsets(sessionStartTime);
    const data = generateInitialChartingData(offsets);
    return { allTimeOffsets: offsets, fullChartingData: data };
  }, [sessionStartTime]);

  const filteredData = useMemo(() => {
    return fullChartingData.filter(row => vitalSignIds.includes(row.id));
  }, [fullChartingData]);

  const displayTimeOffsets = useMemo(() => {
    return mostRecentVitals(filteredData, allTimeOffsets)
  }, [allTimeOffsets, filteredData]);

  const columns: ColumnDef<FlexSheetData>[] = useMemo(() => [
    {
      accessorKey: "field",
      header: "",
      cell: info => (
        <p className="text-left pl-2 text-xs">{info.row.original.field}</p>
      )
    },
    ...displayTimeOffsets.map(timeKey => {
      return {
        id: String(timeKey),
        accessorKey: String(timeKey) as keyof FlexSheetData,
        header: () => {
          const result = formatTimeFromOffset(timeKey, sessionStartTime)
          if (result.error) {
            return <span>Error</span>;
          }

          return (
            <div className="flex flex-col justify-center items-center">
              <h2 className="my-1 text-neutral-500 text-xs font-light">
                {result.date}
              </h2>
              <h1 className="mb-1 text-xs">
                {result.time}
              </h1>
            </div>
          );
        },
        cell: (info: CellContext<FlexSheetData, unknown>) => {
          const value = info.getValue() as string;
          return (
            <div className="h-full">
              <p className="text-xs w-full min-w-12 text-right pr-2">
                {/* Render value if exists, otherwise placeholder */}
                {value ? value : ""}
              </p>
            </div>
          )
        }
      }
    })
  ], [displayTimeOffsets, sessionStartTime])

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const renderTableContent = () => {
    if (!table.getRowModel().rows?.length) {
      return (
        <TableRow>
          <TableCell colSpan={columns.length} className="h-24 p-0 w-full justify-center items-center">
            <div className="flex flex-col justify-center items-center gap-2 h-full w-full py-2">
              <p className="text-sm text-neutral-500">No vitals data available</p>
            </div>
          </TableCell>
        </TableRow>
      )
    }

    return table.getRowModel().rows.map((row) => (
      <TableRow
        key={row.id}
        className="h-6 border-sky-200"
      >
        {row.getVisibleCells().map((cell) => (
          <TableCell key={cell.id} className="border-sky-200 first:border-0 border-l p-0">
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        ))}
      </TableRow>
    ))
  }

  return (
    <Card className="relative col-span-1 p-0 gap-3 pt-2 h-fit overflow-hidden">
      <StyledTitle color="bg-sky-200" firstLetter="R" secondLetter="ecent Vitals" />
      <div className="h-fit px-2 pb-6">
        <div className="rounded-md border h-full border-sky-200">
          <Table className="rounded-md h-full">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="border-sky-200">
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} className="h-10 p-0" >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {renderTableContent()}
            </TableBody>
          </Table>
        </div>
      </div>
      <div className="absolute bottom-0 bg-sky-200 w-full h-3"></div>
    </Card>
  )
}