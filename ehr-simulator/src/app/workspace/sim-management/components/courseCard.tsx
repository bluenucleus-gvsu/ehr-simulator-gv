import { Card } from "@/components/ui/card";
import { Course } from "@/lib/sim-management";
import CourseCardDetails from "./courseCardDetails";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";

interface CourseCardProps {
  course: Course
}

const CourseCard = ({ course }: CourseCardProps) => {
  return (
    <Card key={course.id} className="gap-4 p-3">
      <div className="space-y-">
        <h1 className="font-semibold text-lg">
          {course.name ? `${course.code} – ${course.name}` : course.code}
        </h1>
        <h2 className="text-base">{course.semester}</h2>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {course.sections.map((section) => (
          <Collapsible key={section.id} className="group bg-gray-100 p-3 rounded-lg h-fit">
            <CollapsibleTrigger className="cursor-pointer text-sm">
              <div className="flex gap-2  items-center">
                <ChevronDown className="size-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                {section.name}
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 space-y-2">
              {section.simulations.length === 0 ? (
                <div className="text-sm text-muted-foreground">No simulations scheduled.</div>
              ) : (
                section.simulations.map((sim) =>
                  <CourseCardDetails key={sim.id} simSession={sim} />
                )
              )}
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>
    </Card>
  )
}

export default CourseCard;