import { Card, CardContent } from "@/components/ui/card"
import StyledTitle from "./styledTitle"

const Alerts = () => {
  return (
    <Card className="relative col-span-2 pt-2 overflow-hidden h-fit gap-3">
      <StyledTitle color="bg-yellow-200" firstLetter="A" secondLetter="lerts" />
      <CardContent className="">
        <div className="flex flex-col gap-4">
          <div className="bg-yellow-200 p-2 rounded-r-lg rounded-bl-lg">
            <p className="font-medium">
              High Risk for Falls - 
              <span className="pl-1 font-normal text-neutral-700">
                Morse score {`>`} 45
              </span>
            </p>
          </div>
          <div className="bg-yellow-200 p-2 rounded-r-lg rounded-bl-lg">
            <p className="font-medium">Skin Integrity Risk</p>
          </div>
        </div>
      </CardContent>
      <div className="absolute bottom-0 bg-yellow-200 w-full h-3"></div>
    </Card>
  )
}

export default Alerts