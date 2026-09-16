"use client"
import { useState } from "react";
import {
  Table2,
  TableConfig
} from "lucide-react";

import { useRouter } from "next/navigation";
import { useFormContext } from "@/context/FormContext";
import { saveCaseData } from "@/actions/case_builder/caseBuilder";
import { CaseSection } from "@/lib/saveCase";
import { caseBuilderPath } from "@/lib/caseBuilder/routes";
import { FormShell } from "../../components/formShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FlexSheetSection } from "@/lib/flexSheet/flexSheetSections";
import { flexSheetSectionNameMap, specialtyDefaultSections } from "@/lib/caseBuilder/defaultTableTemplates";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckedState } from "@radix-ui/react-checkbox";


const TableTemplateForm = () => {
  const router = useRouter();

  const { onDataChange, tableTemplateData, demographicData, caseId } = useFormContext();
  const defaultSpecialtySections = specialtyDefaultSections[demographicData.caseSpecialty];
  const tableTemplate = tableTemplateData.length === 0 ? defaultSpecialtySections : tableTemplateData
  const [updatedTemplate, setUpdatedTemplate] = useState<Set<FlexSheetSection>>(new Set(tableTemplate));

  const handleCheckBoxChange = (checked: CheckedState, value: FlexSheetSection) => {
    setUpdatedTemplate(prev => {
      const newSet = new Set(prev);
      if (checked) {
        return newSet.add(value)
      } else {
        newSet.delete(value)
      }
      return newSet
    })
  }

  const goBack = () => {
    onDataChange(CaseSection.TABLE_TEMPLATE, [...updatedTemplate]);
    router.push(caseBuilderPath("/admin/case-builder/form/orders", caseId));
  }

  const saveAndContinue = async () => {
    onDataChange(CaseSection.TABLE_TEMPLATE, [...updatedTemplate]);
    await saveCaseData({ payload: [...updatedTemplate], section: CaseSection.TABLE_TEMPLATE, caseId });
    router.push(caseBuilderPath("/admin/case-builder/form/labs", caseId));
  }

  return (
    <FormShell
      title="Table Templates"
      stepDescription="Customize the FlexSheet charting table."
      icon={<TableConfig className="text-slate-400" />}
      onSubmit={saveAndContinue}
      goBack={goBack}
      continueButtonText="Continue"
      backButtonText="Back"
      continueButtonTooltip="Proceed to Next Page"
      backButtonTooltip="Return to Previous Page"
    >
      <div className="bg-slate-50/50 flex-1 overflow-y-auto p-6 md:px-12 lg:px-24">
        <div className="max-w-6xl mx-auto space-y-6 pb-20">
          <div className="grid grid-cols-1 gap-6">
            <Card className="border-slate-200 shadow-sm h-fit pt-0">
              <CardHeader className="bg-slate-50 border-b border-slate-200 pt-4 !pb-2 rounded-t-xl">
                <CardTitle className="text-lg flex items-center justify-between">
                  <span className="flex items-center gap-2"><Table2 className="w-4 h-4 text-blue-600" />FlexSheet Template</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {(Object.entries(flexSheetSectionNameMap) as [FlexSheetSection, string][]).map(([value, label]) => {
                  return (
                    <div key={value} className="flex items-center gap-2">
                      <Checkbox checked={updatedTemplate.has(value)} onCheckedChange={(checked) => handleCheckBoxChange(checked, value)} />
                      <p>{label}</p>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </FormShell >
  )
}

export default TableTemplateForm