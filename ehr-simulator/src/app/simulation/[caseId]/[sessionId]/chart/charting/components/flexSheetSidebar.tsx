import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarRail,
} from "@/components/ui/sidebar"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { buildAssessmentToolGuide } from "@/lib/flexSheet/assessmentToolGuides"
import { AssessmentToolGuide } from "@/lib/flexSheet/flexSheetTypes"

interface FlexSheetSidebarProps {
  sections: string[]
}

const FlexSheetSidebar = ({ sections }: FlexSheetSidebarProps) => {
  const assessmentTools: AssessmentToolGuide[] = buildAssessmentToolGuide(sections);
  return (
    <div
      // override Shadcn's default width to display assessment tool guides more cleanly
      style={
        {
          "--sidebar-width": "22rem",
        } as React.CSSProperties
      }
    >
      <Sidebar side="right">
        <SidebarContent className="bg-gray-100">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <Accordion
                  type="single"
                  collapsible
                  className="border-red-900"
                >
                  {assessmentTools.map((tool, index) => (
                    <AccordionItem
                      key={index}
                      value={tool.name}
                      className="border-gray-200 border-b-2"

                    >
                      <AccordionTrigger className="font-semibold cursor-pointer">{tool.name}</AccordionTrigger>
                      <AccordionContent>
                        {tool.categories.map((category, index) => (
                          <div key={index} className="space-y-10">
                            <div className="py-1 border-b-3">
                              <p className="pl-2 pb-1 font-medium text-gray-800 text-wrap">{category.name}</p>
                              {category.scoringOptions.map((option, index) => (
                                <div key={index} className="flex last:pb-1">
                                  <p className="pl-5 text-xs text-gray-800 font-medium">{`${option.rating}`}</p>
                                  <p className="pl-3 text-xs text-gray-600 italic text-wrap">{option.description}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                        {tool.interpretations && tool.interpretations.length > 0 && (
                          <div>
                            <h1 className="pl-2 pb-2 text-sm font-semibold text-gray-800 text-wrap">Scoring</h1>
                            {tool.interpretations?.map((interpretation, index) =>
                              <div key={index} className="flex">
                                <p className="pl-5 text-xs text-gray-800 text-nowrap  font-medium">{interpretation.result}</p>
                                <p className="pl-3 text-xs text-gray-600  text-nowrap italic">{interpretation.range}</p>
                                <p className="pl-3 text-xs text-gray-600 italic text-wrap">{interpretation.description}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarRail />
      </Sidebar>
    </div>
  )
}

export default FlexSheetSidebar