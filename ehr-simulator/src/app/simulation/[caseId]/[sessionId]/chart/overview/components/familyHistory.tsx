import { Card, CardContent } from "@/components/ui/card"
import StyledTitle from "./styledTitle"
import { Separator } from "@/components/ui/separator"

const FamilyHistory = () => {

  const familyMembers = ['Mother', 'Father']
  const conditions = ['Type 2 Diabetes Mellitus', 'CHF']
  return (
    <Card className="relative col-span-1 pt-2 overflow-hidden h-fit gap-3">
      <StyledTitle color="bg-lime-200" firstLetter="F" secondLetter="amily History" />
      <CardContent className="px-4 space-y-1">
        <div className="flex flex-col gap-1 w-full">
          {familyMembers.map((member, index) => (
            <div key={`${member}=${index}`} className="group">
              <div className="flex w-full pb-1">
                <p className="text-sm flex-1 pr-2 font-light text-nowrap">{member}:</p>
                <p className="text-sm w-full">{conditions[index]}</p>
              </div>
              <Separator className="bg-lime-200 group-last:bg-transparent" />
            </div>
          ))}
        </div>
      </CardContent>
      <div className="absolute bottom-0 bg-lime-200 w-full h-3"></div>
    </Card>
  )
}

export default FamilyHistory