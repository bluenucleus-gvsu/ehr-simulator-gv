import * as React from "react";
import Link from "next/link";
import { SimCase } from "@/actions/cases";
import { format } from "date-fns";


interface CaseListItemProps {
  courseCaseAssignment: SimCase;
}

export default function CaseListItem({ courseCaseAssignment }: CaseListItemProps) {
  const { id, name, description, admitting_diagnosis, created_at } = courseCaseAssignment;

  return (
    <Link href={`/admin/case-builder/${id}/demographics`}>
      <div className="border rounded-md p-4 hover:bg-secondary dark:hover:bg-gray-800 transition py-5 border-l-10 border-l-blue-700 cursor-pointer">
        <div className="flex gap-2 items-end">
          <h2 className="text-xl font-semibold">{name}</h2>
        </div>
        <p className="text-md text-gray-600">{admitting_diagnosis}</p>
        {created_at && (
          <p className="text-mds text-gray-600">Created at: {format(created_at, 'Pp')}</p>
        )}
        <p className="text-sm text-gray-400 mt-2 line-clamp-2">{description}</p>
      </div>
    </Link>
  );
}
