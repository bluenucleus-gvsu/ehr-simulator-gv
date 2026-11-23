import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { routes } from "@/lib/routes";

export default function CreateCaseButton() {
  const router = useRouter();
  const createCase = () => {
    // new case in db?
    router.push(routes.workspace.caseBuilder.form.getHref("demographics"))
  }

  return (
    <Button onClick={createCase} className="cursor-pointer">
      Create New Case
    </Button>
  )

}