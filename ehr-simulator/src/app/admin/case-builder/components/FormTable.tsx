import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getPinnedStyles } from "@/app/simulation/[caseId]/[sessionId]/chart/charting/components/flexSheetHelpers";
import { flexRender } from "@tanstack/react-table"
import { Table as TableInstance } from "@tanstack/react-table"

interface FormTableProps<TData> {
  table: TableInstance<TData>;
  getCellClassName?: (row: TData) => string;
}

export function FormTable<TData>({ table, getCellClassName }: FormTableProps<TData>) {

  return (
    <Table className="w-full">
      <TableHeader className="">
        {table.getHeaderGroups().map(headerGroup => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map(header => (
              <TableHead
                style={getPinnedStyles(header.column, 200, true)}
                key={header.id}
                className="border-gray-300 p-0 border-r bg-gray-50 first:border-r-0 last:border-r-0 first:rounded-tl-md last: rounded-tr-md shadow-[inset_0_-1px_0_0_#e5e7eb]"
              >
                {/* Render the header content using flexRender */}
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
        {table.getRowModel().rows.map(row => (
          <TableRow key={row.id} className="h-6 !p-0">
            {row.getVisibleCells().map(cell => {
              return (
                <TableCell
                  style={getPinnedStyles(cell.column, 200, false)}
                  key={`${cell.id}`}
                  className={`p-0 border-gray-200 border-b ${getCellClassName ? getCellClassName(row.original) : "bg-white border-r last:border-r-0"}`}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              )
            })}
          </TableRow>
        ))}
      </TableBody>
      <TableFooter className="bg-gray-100">
        {table.getFooterGroups().map(footerGroup => (
          <TableRow key={footerGroup.id}>
            {footerGroup.headers.map(header => (
              <TableHead
                style={getPinnedStyles(header.column, 200, true)}
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


  )
}
