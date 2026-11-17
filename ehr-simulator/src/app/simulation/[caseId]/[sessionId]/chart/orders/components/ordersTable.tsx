
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
import { OrderTitleColumn, OrderTitleRow, statusColor } from "@/lib/orders"

interface OrdersTableProps {
  columnNames: OrderTitleColumn[],
  headerNames: Record<"title" | OrderTitleColumn, string>,
  color: string,
  data: OrderTitleRow[]
}
const OrdersTable = ({
  columnNames,
  headerNames,
  color,
  data
}: OrdersTableProps) => {

  const columnHelper = createColumnHelper<OrderTitleRow>()

  const columns = useMemo(
    () => [
      // unique first column
      columnHelper.accessor("title", {
        id: "title",
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
                    {headerNames.title ? headerNames.title.substring(0, 1) : ''}
                  </span>
                </span>
                <span className="-ml-3 relative z-1">{headerNames.title ? headerNames.title.substring(1) : ''}</span>
              </h1>
            </div>
          )
        },
        cell: ({ getValue }) => {
          return (
            <div className="flex flex-col items-end gap-1 text-right">
              <h1 className="text-xs font-medium text-wrap tracking-tight">{getValue()}</h1>
            </div>
          )
        }
      }),

      // map out remaining columns
      ...columnNames.map(id =>
        columnHelper.accessor(row => row[id], {
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
                <span className={`w-2 h-2 rounded-full ring-2 ring-white shadow-sm ${statusColor(getValue())}`} />
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
                No orders.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}


export default OrdersTable
