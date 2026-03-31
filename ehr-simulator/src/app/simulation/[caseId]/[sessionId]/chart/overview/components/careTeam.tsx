import { Phone } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import StyledTitle from "./styledTitle"

const CareTeam = () => {



  return (
    <Card className="relative pt-2 overflow-hidden h-fit gap-3">
      <StyledTitle color="bg-lime-200" firstLetter="C" secondLetter="are Team" />

      <CardContent className="grid gap-4 px-8">
        <div className="flex flex-col w-full items-start gap-1">
          <p className="text-md font-medium leading-none">Internal Medicine</p>
          {/* <div className="flex pl-2 gap-3">
                <p className="text-sm text-neutral-500 tracking-tight">Relationship:</p>
                <p className="text-neutral-500 text-sm">Spouse</p>
              </div> */}
          <div className="flex items-center pl-2 gap-2">
            <Phone size={14} color="#737373" />
            <p className="text-sm text-neutral-500 tracking-tight">(616) 555-5555</p>
          </div>
        </div>
        <div className="flex flex-col w-full items-start gap-1">
          <p className="text-md font-medium leading-none">Physical Therapy</p>
          {/* <div className="flex pl-2 gap-3">
                <p className="text-sm text-neutral-500 tracking-tight">Relationship:</p>
                <p className="text-neutral-500 text-sm">Spouse</p>
              </div> */}
          <div className="flex items-center pl-2 gap-2">
            <Phone size={14} color="#737373" />
            <p className="text-sm text-neutral-500 tracking-tight">(616) 555-5556</p>
          </div>
        </div>

        <div className="flex flex-col w-full items-start gap-1">
          <p className="text-md font-medium leading-none">Occupational Therapy</p>
          {/* <div className="flex pl-2 gap-3">
                <p className="text-sm text-neutral-500 tracking-tight">Relationship:</p>
                <p className="text-neutral-500 text-sm">Son</p>
              </div> */}
          <div className="flex items-center pl-2 gap-2">
            <Phone size={14} color="#737373" />
            <p className="text-sm text-neutral-500 tracking-tight">(616) 555-5557</p>
          </div>
        </div>
      </CardContent>
      <div className="absolute bottom-0 bg-lime-200 w-full h-3"></div>

    </Card>
  )
}

export default CareTeam
