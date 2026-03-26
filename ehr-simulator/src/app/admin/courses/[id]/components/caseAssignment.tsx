'use client'
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SelectGroup } from "@radix-ui/react-select";
import { ChevronDown, Loader2, Plus } from "lucide-react";
import { format } from "date-fns";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { CasesData, createSectionCaseAssignment, deleteSectionCaseAssignment, SectionAssignmentInsert, SectionSimulationsData } from "@/actions/cases";
import { toast } from "sonner";

interface CaseAssignmentProps {
  sections: SectionSimulationsData
  cases: CasesData
  isEditMode: boolean
  existing_id?: string;
  initialData?: {
    sectionId: string,
    caseId: string,
    simTime: string,
    presimTime: string
  }
}

const CaseAssignment = ({ sections, cases, isEditMode, existing_id, initialData }: CaseAssignmentProps) => {
  const [selectedCaseId, setSelectedCaseId] = useState<string>(initialData?.caseId || '');
  const [selectedSectionId, setSelectedSectionId] = useState<string>(initialData?.sectionId || '');
  const [presimDate, setPresimDate] = useState(
    initialData?.presimTime ? new Date(initialData?.presimTime) : new Date()
  );
  const [simDate, setSimDate] = useState<Date>(
    initialData?.simTime ? new Date(initialData.simTime) : new Date()
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open && !isEditMode) {
      setSelectedCaseId("");
      setSelectedSectionId("");
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true);

    const payload: SectionAssignmentInsert = {
      section_id: selectedSectionId,
      case_id: selectedCaseId,
      sim_time: simDate.toISOString(),
      presim_time: presimDate.toISOString(),
      ...(isEditMode && existing_id ? { id: existing_id } : {})
    };

    const result = await createSectionCaseAssignment(payload);

    if (!result.success) {
      toast.error(result.message)
      setIsSubmitting(false);
      return;
    }

    toast.success(result.message);
    setIsOpen(false);
    setIsSubmitting(false);
    handleOpenChange(false);
  }

  const handleDeleteAssignment = async (id: string) => {
    setIsSubmitting(true);
    const result = await deleteSectionCaseAssignment(id);

    if (!result.success) {
      toast.error(result.message);
      setIsSubmitting(false);
      return;
    }

    setIsOpen(false);
    setIsSubmitting(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {isEditMode ?
          (
            <Button variant="ghost" size="sm" className=" text-blue-600 hover:text-blue-700 hover:underline hover:bg-transparent">
              Manage
            </Button>
          ) : (
            <Button className="bg-blue-700 hover:bg-blue-800 gap-2 shadow">
              <Plus />
              Assign Case
            </Button>
          )
        }

      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Case Assignment' : 'Assign Cases'}</DialogTitle>
          <DialogDescription>
            Link simulation cases to specific sections
          </DialogDescription>
        </DialogHeader>
        <div className="gap-6 grid grid-cols-2 pb-6">
          <div>
            <Label htmlFor="section-select">Section</Label>
            <Select
              key='sections-select'
              value={selectedSectionId}
              onValueChange={setSelectedSectionId}

            >
              <SelectTrigger className="w-full max-w-48 mt-1">
                <SelectValue placeholder="Select a section" />
                <ChevronDown />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Sections</SelectLabel>
                  {
                    sections.length > 0 ? (
                      sections.map((section, index) => {
                        if (!section.meeting_time) {
                          return null
                        }
                        const displayTime = format(section.meeting_time, 'p')
                        return (
                          <SelectItem key={`${index}`} value={section.id}>{section.name} - {displayTime}</SelectItem>
                        )
                      }
                      )) : (
                      <></>
                    )
                  }
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="case-select">Case</Label>
            <Select
              key="case-select"
              value={selectedCaseId}
              onValueChange={setSelectedCaseId}
            >
              <SelectTrigger className="w-full max-w-48 mt-1">
                <SelectValue placeholder="Select a case" />
                <ChevronDown />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Cases</SelectLabel>
                  {
                    cases.length > 0 ? (
                      cases.map((c, index) => {
                        return (
                          <SelectItem key={`${index}`} value={c.case_id}>{c.cases.name || "Unknown Sim"}</SelectItem>
                        )
                      }
                      )) : (
                      <></>
                    )
                  }
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="presim-date">Pre-Sim Opening Date</Label>
            <DateTimePicker
              date={presimDate}
              onDateChange={setPresimDate}
              key="presim-date"
            />
          </div>
          <div>
            <Label htmlFor="presim-date">Sim Date</Label>
            <DateTimePicker
              date={simDate}
              onDateChange={setSimDate}
              key="presim-date"
            />
          </div>
        </div>


        <div className="flex gap-4 justify-between">

          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedCaseId || !selectedSectionId}
            className="flex-2"
          >
            {isEditMode ? "Edit Case Assignment" : "Assign Sim"}
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          </Button>

          {
            (isEditMode && existing_id) && (
              <Button
                variant='destructive'
                className="flex-1"
                onClick={() => handleDeleteAssignment(existing_id)}
              >
                Delete Case Assignment
              </Button>

            )
          }
        </div>
      </DialogContent>
    </Dialog>
  )
};

export default CaseAssignment;
