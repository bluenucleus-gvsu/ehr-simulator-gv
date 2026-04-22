"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import StyledTitle from "./styledTitle"
import { useSimulationCase } from "@/context/SimulationCaseContext"

function toStringList(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.map((item) => String(item ?? "").trim()).filter(Boolean)
  }
  const single = String(raw ?? "").trim()
  return single ? [single] : []
}

const SocialHabits = () => {
  const { caseBundle } = useSimulationCase()
  const habits = toStringList(caseBundle?.caseRow?.social_habits)
  const rows = habits.length ? habits : ["No social habits recorded"]

  return (
    <Card className="relative col-span-1 pt-2 overflow-hidden h-fit gap-3">
      <StyledTitle color="bg-orange-200" firstLetter="S" secondLetter="ocial Habits" />
      <CardContent className="px-4 space-y-1">
        {rows.map((item, idx) => (
          <div key={`${idx}-${item}`} className="group">
            <p className="text-sm">{item}</p>
            <Separator className="bg-orange-200" />
          </div>
        ))}
      </CardContent>
      <div className="absolute bottom-0 bg-orange-200 w-full h-3"></div>
    </Card>
  )
}

export default SocialHabits
