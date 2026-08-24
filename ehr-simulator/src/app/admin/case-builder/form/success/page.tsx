"use client"
import { CircleCheck, FileCheck } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

import { useFormContext } from "@/context/FormContext"

export default function SuccessPage() {
  const router = useRouter();


  const { demographicData, caseId } = useFormContext();
  const firstName = demographicData.firstName;
  const lastName = demographicData.lastName;

  return (
    <div className="flex flex-col min-h-screen w-full bg-slate-50/50">

      <header className="sticky top-0 flex items-center justify-between px-8 py-4 bg-white border-b border-slate-200 shadow-sm z-10">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <FileCheck className="text-slate-400" />
            Case Builder Complete
          </h1>
        </div>
      </header>

      <div className="flex-1 p-6 md:px-12 lg:px-24">
        <div className="h-full gap-10 flex flex-col justify-center items-center">
          <Card className="bg-green-50">
            <CardContent className="flex text-xl items-center">
              <CircleCheck color="green" size={80} />
              {firstName && lastName ?
                <p className="px-4">Case of <span className="font-bold">{firstName} {lastName}</span> saved successfully!</p> :
                <p className="px-4">Case saved successfully!</p>}
            </CardContent>
          </Card>

          <div className="flex flex-col gap-6">
            <Button
              className="cursor-pointer text-xl p-6"
              disabled={!caseId}
              onClick={() => { if (caseId) router.push(`/simulation/${caseId}/preview/chart/overview`) }}
              variant={"outline"}>
              Open Case in EHR
            </Button>
            <Button
              className="cursor-pointer text-xl p-6"
              onClick={() => { router.push("/admin/") }}
              variant={"default"}>
              Return to Dashboard
            </Button>
          </div>

        </div>


      </div>
    </div>
  )
}
