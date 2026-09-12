'use client'

import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import StyledTitle from "./styledTitle"
import { useSimulationCase } from "@/context/SimulationCaseContext"
import { valueFromJoinedName } from "../../components/chartSidebar"

const CardRow = ({ label, value }: { label: string; value: string }) => {
  return (
    <>
      <div className="flex">
        <p className="text-sm pr-2 font-light">{label}: </p>
        <p className="text-sm">{value}</p>
      </div>
      <Separator className="bg-lime-200" />
    </>
  )
}

const DemographicsCard = () => {
  const { caseBundle } = useSimulationCase()
  const patientData = caseBundle?.caseRow

  if (!patientData) {
    return null
  }

  return (
    <Card className="relative col-span-1 pt-2 overflow-hidden h-fit gap-3">
      <StyledTitle color="bg-lime-200" firstLetter="D" secondLetter="emograhics" />
      <CardContent className="px-4 space-y-1">
        <CardRow
          label="Relationship Status"
          value={valueFromJoinedName(patientData.relationship_status)}
        />
        <CardRow
          label="Employment"
          value={patientData.employment ?? ''}
        />
        <CardRow
          label="Insurance"
          value={patientData.insurance ?? ''}
        />
        <CardRow
          label="Religion"
          value={patientData.religion ?? ''}
        />
        <CardRow
          label="Language"
          value={patientData.language ?? ''}
        />
      </CardContent>
      <div className="absolute bottom-0 bg-lime-200 w-full h-3"></div>
    </Card>
  )
}

export default DemographicsCard