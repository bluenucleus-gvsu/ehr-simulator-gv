import * as React from "react";
import Link from "next/link";
import { CaseCourseAssignment } from "@/actions/cases";


interface CaseListItemProps {
  courseCaseAssignment: CaseCourseAssignment;
}

export default function CaseListItem({ courseCaseAssignment }: CaseListItemProps) {
  const { caseId, caseName, description, admitting_diagnosis, courseCode } = courseCaseAssignment;

  return (
    <Link href={`/admin/cases/${caseId}`}>
      <div className="border rounded-md p-4 hover:bg-secondary dark:hover:bg-gray-800 transition py-5 border-l-10 border-l-blue-700 cursor-pointer">
        <div className="flex gap-2 items-end">
          <h2 className="text-xl font-semibold">{caseName}</h2>
          <div className="rounded-full bg-gray-100 px-2 py-1">
            <p className="text-xs font-semibold">{courseCode || 'Unassigned'}</p>
          </div>
        </div>
        <p className="text-md text-gray-700">{admitting_diagnosis}</p>
        <p className="text-sm text-gray-400 mt-2 line-clamp-2">{description}</p>
      </div>
    </Link>
  );
}
