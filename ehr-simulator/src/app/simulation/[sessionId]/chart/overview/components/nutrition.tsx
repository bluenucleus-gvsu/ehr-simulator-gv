import { Card, CardContent } from "@/components/ui/card"
import StyledTitle from "./styledTitle"

const Nutrition = () => {
  const dietOrders = [
    {
      category: "Diet",
      title: "Heart Healthy",
      details: '',
      status: 'Active',
      orderingProvider: 'Dr. Chen',
      important: true,
      visibleInPresim: true,
    },
    {
      category: "Diet",
      title: "Fluid Restriction, 2L",
      details: '',
      status: 'Active',
      orderingProvider: 'Dr. Chen',
      important: true,
      visibleInPresim: true,
    }
  ]
  return (
    <Card className="relative col-span-1 pt-2 overflow-hidden h-fit gap-3">
      <StyledTitle color="bg-sky-200" firstLetter="N" secondLetter="utrition" />
      <CardContent className="grid gap-2 px-4">
        {dietOrders.map((order, index) => (
          <div key={`${order.category}-${index}`} className="flex pl-2 gap-3">
            <p className="text-md  font-light tracking-tight">Diet:</p>
            <p className=" text-md tracking-tight">{order.title}</p>
          </div>
        ))}
      </CardContent>
      <div className="absolute bottom-0 bg-sky-200 w-full h-3"></div>
    </Card>
  )
}

export default Nutrition