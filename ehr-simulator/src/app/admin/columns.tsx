"use client"

import { ColumnDef } from "@tanstack/react-table"

export type StudentInfo = {
  id: string
  full_name: string
  email: string
  cohort: string
  classes: string[]
  role?: string
}

import Link from "next/link"

export const columns: ColumnDef<StudentInfo>[] = [
  {
    accessorKey: "full_name",
    header: "Full Name",
    cell: ({ row }) => {
      const original = row.original as StudentInfo
      const id = original.id
      const name = row.getValue("full_name") as string
      const role = original.role

      // Only students have profile pages. Render a link for students only.
      if (role === "student") {
        return (
          <Link href={`/user/profile/${id}`} className="text-blue-600 underline">
            {name}
          </Link>
        )
      }

      return <span>{name}</span>
    },
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "cohort",
    header: "Cohort",
  },
  {
    accessorKey: "classes",
    header: "Classes",
  },
  {
    accessorKey: "role",
    header: "Role",
  },
]
