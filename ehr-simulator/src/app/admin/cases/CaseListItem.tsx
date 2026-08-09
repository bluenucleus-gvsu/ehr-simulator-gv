import { SimCase } from "@/actions/cases";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";


interface CaseListItemProps {
  courseCaseAssignment: SimCase;
}

export default function CaseListItem({ courseCaseAssignment }: CaseListItemProps) {
  const router = useRouter()
  const { id, name, description, admitting_diagnosis, created_at } = courseCaseAssignment;
  const editUrl = `/admin/case-builder/form/demographics?caseId=${id}`
  const previewUrl = `/simulation/${id}/preview/chart/overview`

  return (
    <div className="border rounded-md p-4 py-5 border-l-10 border-l-blue-700">
      <div className="flex justify-between">
        <div className="">
          <h2 className="text-xl font-semibold">{name}</h2>
          <p className="text-md text-gray-600">{admitting_diagnosis}</p>
          {created_at && (
            <p className="text-mds text-gray-600">Created at: {format(created_at, 'Pp')}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button onClick={() => router.push(previewUrl)}>Preview Case</Button>
          <Button onClick={() => router.push(editUrl)}>Edit Case</Button>
        </div>
      </div>
      <p className="text-sm text-gray-400 mt-2 line-clamp-2">{description}</p>

    </div>
  );
}
