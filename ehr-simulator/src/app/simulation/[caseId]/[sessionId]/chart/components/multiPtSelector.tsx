"use client";

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Users } from "lucide-react"
import { useSimulationCase } from "@/context/SimulationCaseContext"
import { format, parseISO } from "date-fns"

function formatDob(iso: string | null | undefined): string {
  if (!iso) return "N/A"
  try {
    return format(parseISO(String(iso).slice(0, 10)), "MM/dd/yyyy")
  } catch {
    return "N/A"
  }
}

const MultiPtSelector = () => {
  const { caseBundle } = useSimulationCase()
  const row = caseBundle?.caseRow
  const last = (row?.last_name ?? "").trim()
  const first = (row?.first_name ?? "").trim()
  const displayName =
    last && first ? `${last}, ${first}` : last || first || "Patient"
  const isolationLabel = row?.isolation_precautions?.name?.trim() || "N/A"
  const codeStatus = row?.code_status?.trim() || "N/A"
  const attending = (row?.attending_provider ?? "").trim() || "N/A"

  return (
    <Dialog>
      <DialogTrigger className="py-4 px-6" asChild>
        <Button
          type="button"
          variant="ghost"
          className="rounded-none bg-gray-200 ring-none outline-none border border-gray-300 -mb-[2px] rounded-t-lg flex items-center h-full"
        >
          <Users />
        </Button>
      </DialogTrigger>
      <DialogContent className="lg:max-w-4xl h-[85vh]">
        <DialogHeader>
          <DialogTitle>Your Patients</DialogTitle>
          <DialogDescription>
            Click a patient to enter their chart.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col overflow-y-auto gap-3 bg-gray-100 border p-2 rounded-lg inset-shadow-sm">
          <div className="flex flex-col justify-start items-center">
            <DialogClose asChild>
              <button
                type="button"
                className="group flex flex-col w-full justify-start bg-white hover:bg-lime-50 gap-2 p-3 rounded-2xl border shadow text-left cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-600 focus-visible:ring-offset-2"
                aria-label={`Open chart for ${displayName}`}
              >
                <div className="w-full flex justify-between items-start gap-2">
                  <p className="text-lg font-semibold underline-offset-2 group-hover:underline">{displayName}</p>
                </div>
                <div className="flex pl-2">
                  <div className="flex flex-col gap-2 pr-20">
                    <p className="text-sm">
                      <span className="font-light">MRN: </span>N/A
                    </p>
                    <p className="text-sm">
                      <span className="font-light">DOB: </span>
                      {formatDob(row?.date_of_birth)}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <Label className="text-xs">Attending Physician</Label>
                      <p className="text-sm pt-0.5 pl-2">{attending}</p>
                    </div>
                    <div className="flex flex-col">
                      <Label className="text-xs">Code Status</Label>
                      <p className="w-full text-sm pt-0.5 pl-2">
                        <span className="bg-yellow-200 px-3 py-0.5 rounded-xl">{codeStatus}</span>
                      </p>
                    </div>
                    <div className="flex flex-col">
                      <Label className="text-xs">Assigned RN</Label>
                      <p className="text-sm pt-0.5 pl-2">N/A</p>
                    </div>
                    <div className="flex flex-col">
                      <Label className="text-xs">Isolation</Label>
                      <p className="text-sm pt-0.5 pl-2">
                        <span className="bg-yellow-200 px-3 py-0.5 rounded-xl">{isolationLabel}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </button>
            </DialogClose>
          </div>
        </div>

        <DialogFooter className="">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default MultiPtSelector
