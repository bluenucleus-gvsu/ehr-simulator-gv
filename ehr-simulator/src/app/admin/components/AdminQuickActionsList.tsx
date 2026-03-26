"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation";
import CreateCaseButton from "./CreateCaseButton";

export function AdminQuickActionsList() {
  const router = useRouter();
  return (
    <div className="grid grid-cols-2 w-160 gap-2">
      <CreateCaseButton />
      <Button
        onClick={() => { router.push("/admin/cases") }}
        className="cursor-pointer"
        variant="default">
        View All Cases
      </Button>
      <Button
        onClick={() => { router.push("/admin/courses") }}
        className="cursor-pointer"
        variant="default">
        Create Course
      </Button>
      <Button
        onClick={() => { router.push("/admin/courses") }}
        className="cursor-pointer"
        variant="default">
        View All Courses
      </Button>
    </div>
  );
}
