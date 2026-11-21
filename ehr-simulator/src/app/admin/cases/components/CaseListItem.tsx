import { SimCase } from "@/actions/cases";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { caseMeetsMinimumRequirements } from "@/lib/caseMinimumRequirements";
import { routes } from "@/lib/routes";
import { UserRole } from "@/lib/userManagement";


interface CaseListItemProps {
  courseCaseAssignment: SimCase;
  role: UserRole | null;
}

export default function CaseListItem({ courseCaseAssignment, role }: CaseListItemProps) {
  const router = useRouter()
  const { id, name, description, admitting_diagnosis, created_at } = courseCaseAssignment;
  const editUrl = routes.admin.caseBuilder.form.getHref("demographics", id)
  const previewUrl = routes.simulation.getHref(id, "preview")
  const canUseCase = caseMeetsMinimumRequirements(courseCaseAssignment);

  return (
    <div data-testid='' className="border rounded-md p-4 py-5 border-l-10 border-l-blue-700">
      <div className="flex justify-between">
        <div className="">
          <h2 className="text-xl font-semibold">{name}</h2>
          <p className="text-md text-gray-600">{admitting_diagnosis}</p>
          {created_at && (
            <p className="text-mds text-gray-600">Created at: {format(created_at, 'Pp')}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            disabled={!canUseCase}
            title={canUseCase ? "Preview case" : "Complete the required case information before previewing"}
            onClick={() => router.push(previewUrl)}
            data-testid={`button-${id}`}
            variant="outline"
          >
            Preview Case
          </Button>
          {role === "admin" &&
            <Button
              data-testid={`edit-${id}`}
              onClick={() => router.push(editUrl)}
              variant="outline"
            >
              Edit Case
            </Button>}
        </div>
      </div>
      <p className="text-sm text-gray-400 mt-2 line-clamp-2">{description}</p>

    </div>
  );
}
