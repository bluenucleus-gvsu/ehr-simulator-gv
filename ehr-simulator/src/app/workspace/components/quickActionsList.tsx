"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation";
import { routes } from "@/lib/routes";
import CreateCaseButton from "../cases/components/CreateCaseButton";
import { useUser } from "@/context/UserContext";

export function AdminQuickActionsList() {
  const router = useRouter();
  const { role } = useUser();

  return (
    <div className="grid grid-cols-2 w-160 gap-2">
      {role === "admin" &&
        <>
          <CreateCaseButton />
          <Button
            onClick={() => { router.push(routes.workspace.courses.new.getHref()) }}
            className="cursor-pointer"
            variant="default">
            Create Course
          </Button>
          <Button
            onClick={() => { router.push(routes.workspace.courses.getHref()) }}
            className="cursor-pointer"
            variant="default">
            View All Courses
          </Button>
        </>
      }
      <Button
        onClick={() => { router.push(routes.workspace.cases.getHref()) }}
        className="cursor-pointer"
        variant="default">
        View All Cases
      </Button>
    </div>
  );
}
