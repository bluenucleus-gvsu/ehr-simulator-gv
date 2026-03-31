import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarRail,
} from "@/components/ui/sidebar"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { type AssessmentTool, assessmentTools as tempData } from "./flexSheetData"

const FlexSheetSidebar = () => {
  const assessmentTools: AssessmentTool[] = tempData
  return (
    <Sidebar
      side="right"
      className=""
    >
      <SidebarContent className="bg-gray-100">
        <SidebarGroup>
          <SidebarGroupLabel>Assessment Descriptions</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <Accordion
                type="single"
                collapsible
                className=""
              >
                {assessmentTools.map((tool, index) => (
                  <AccordionItem
                    key={index}
                    value={tool.name}
                    className="">
                    <AccordionTrigger className="">{tool.name}</AccordionTrigger>
                    <AccordionContent className="">
                      {tool.categories.map((category, index) => (
                        <div key={index} className="space-y-10">
                          <div className="py-1 border-b-3">
                            <p className="pl-2 pb-1 font-semibold text-gray-800 text-wrap">{category.name}</p>
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
                        <div className="">
                          <h1 className="pl-2 pb-2 font-semibold text-gray-800 text-wrap">Scoring</h1>
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
  )
}

export default FlexSheetSidebar