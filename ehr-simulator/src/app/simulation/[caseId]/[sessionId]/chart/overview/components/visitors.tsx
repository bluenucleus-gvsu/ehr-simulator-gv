'use client'

import { Phone } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import StyledTitle from "./styledTitle"
import { useSimulationCase } from "@/context/SimulationCaseContext"

const Visitors = () => {
  const { caseBundle } = useSimulationCase()
  const caseRow = caseBundle?.caseRow

  if (!caseRow || !caseRow.emergency_contact_name || !caseRow.emergency_contact_relationship) return null;

  return (
    <Card className="relative pt-2 overflow-hidden h-fit gap-3">
      <StyledTitle color="bg-lime-200" firstLetter="C" secondLetter="ontacts" />
      <CardContent className="grid gap-4 px-8">
        <div className="flex flex-col w-full items-start gap-1">
          <p className="text-md font-medium leading-none">{caseRow.emergency_contact_name}</p>
          <div className="flex pl-2 gap-3">
            <p className="text-sm text-neutral-500 tracking-tight">Relationship:</p>
            <p className="text-neutral-500 text-sm">{caseRow.emergency_contact_relationship}</p>
          </div>
          {caseRow.emergency_contact_phone && (
            <div className="flex items-center pl-2 gap-2">
              <Phone size={14} color="#737373" />
              <p className="text-sm text-neutral-500 tracking-tight">{caseRow.emergency_contact_phone}</p>
            </div>)}
        </div>
      </CardContent>
      <div className="absolute bottom-0 bg-lime-200 w-full h-3"></div>

    </Card>
  )
}

export default Visitors
