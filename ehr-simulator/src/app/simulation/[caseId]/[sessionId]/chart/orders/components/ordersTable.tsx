
"use client"
import { useMemo } from "react"
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Dot } from "lucide-react"

interface OrdersTableProps<T> {
  columnNames: string[],
  headerNames: T,
  color: string,
  data: T[]
}
const OrdersTable = <T extends Record<string, string | boolean | undefined>>({
  columnNames,
  headerNames,
  color,
  data
}: OrdersTableProps<T>) => {

  const columnHelper = createColumnHelper<T>()

  const columns = useMemo(
    () => [
      // unique first column
      columnHelper.accessor((row: T) => row.displayName, {
        id: "displayName",
        header: () => {
          return (
            <div className="pl-2 w-full h-12 flex items-center justify-start ">
              <h1 className="text-xl">
                <span className="relative inline-block px-3 py-1">
                  <span
                    className={`absolute inset-0 ${color} rounded-full scale-110`}
                    style={{
                      top: '6%',
                      left: '0%',
                      minWidth: '2.5rem',
                      minHeight: '2.2rem',
                    }}
                  ></span>
                  <span className="relative z-1">
                    {typeof headerNames.title === 'string' ? headerNames.title.substring(0, 1) : ''}
                  </span>
                </span>
                <span className="-ml-3 relative z-1">{typeof headerNames.title === 'string' ? headerNames.title.substring(1) : ''}</span>
              </h1>
            </div>
          )
        },
        cell: info => {
          return (
            <h1 className="text-xs text-right font-medium text-wrap tracking-tight">{info.row.original.title}</h1>
          )
        }
      }),

      // map out remaining columns  
      ...columnNames.map(id =>
        columnHelper.accessor((row: T) => row[id], {
          id: id,
          header: () => (
            <div className="h-full flex justify-left items-end ">
              <p className="text-sm font-light text-gray-400 tracking-tight">{headerNames[id]}</p>
            </div>
          ),
          cell: ({ getValue }) => {
            return (
              <div className="flex justify-start items-center gap-2">
                <p className="text-xs text-wrap text-gray-700 tracking-tight">{getValue()}</p>
                {id === "status" && <Dot color="#7bc421" size={12} strokeWidth={16} />}
              </div>
            )
          }
        })
      )
    ], [color, columnHelper, headerNames, columnNames]
  );
  const table = useReactTable({
    data,
    columns,
    enablePinning: true,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="w-full rounded-lg border shadow shadow-black/25">
      <Table className="bg-white rounded-lg">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead className="border-b-2 pb-1" key={header.id}>
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
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className="h-12 border-r last:border-0 border-gray-200 py-2"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}


export default OrdersTable