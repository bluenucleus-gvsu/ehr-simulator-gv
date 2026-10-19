"use client"

import { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"
import { type ManagedUser } from "@/lib/userManagement"
import { UserRoleEditor } from "./components/UserRoleEditor"

export const columns: ColumnDef<ManagedUser>[] = [
  {
    accessorKey: "full_name",
    header: "Full Name",
    cell: ({ row }) => row.original.role === "student" ? (
      <Link href={`/user/profile/${row.original.id}`} className="text-blue-600 underline">
        {row.original.full_name || row.original.email || "Unnamed user"}
      </Link>
    ) : <span>{row.original.full_name || "Unnamed user"}</span>,
  },
  { accessorKey: "email", header: "Email" },
  {
    accessorKey: "sections", header: "Section",
    cell: ({ row }) => row.original.sections.join(", ") || "—",
  },
  {
    accessorKey: "classes", header: "Classes",
    cell: ({ row }) => row.original.classes.join(", ") || "—",
  },
  {
    accessorKey: "role", header: "Role", filterFn: "equals",
    cell: ({ row }) => <UserRoleEditor key={`${row.original.id}-${row.original.role}`} user={row.original} />,
  },
]
