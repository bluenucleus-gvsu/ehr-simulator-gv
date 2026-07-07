"use client"

import { useState, useMemo } from "react";
import NursingNoteEntry from "./nursingNoteEntry";
import NoteDisplay from "./noteDisplay";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import FilterBadges from "./filterBadges";
import { differenceInMinutes } from "date-fns";
import { ClinicalDocumentView, EditableStudentNoteUpsert, submitStudentNote } from "@/actions/simulation";
import { useSimSessionContext } from "@/context/SimSessionContext";
import { useStudentSimulationEditAccess } from "@/utils/studentSimulationEditAccess";
import { Skeleton } from "@/components/ui/skeleton";
import { useSimulationCase } from "@/context/SimulationCaseContext";

export interface NoteViewProps {
  isError: boolean;
  isLoading: boolean;
  clinicalDocuments: ClinicalDocumentView[];
  caseId: string;
  sessionId: string;
}

const NoteView = ({
  isError = false,
  isLoading,
  clinicalDocuments,
  caseId,
  sessionId
}: NoteViewProps) => {
  const { caseBundle } = useSimulationCase();
  const { simStartTime, userName, userId, groupId, isPresim } = useSimSessionContext();
  const { canEdit } = useStudentSimulationEditAccess();
  const [filteredSpecialties, setFilteredSpecialties] = useState<string[]>([]);
  const fallbackCaseNotes = (caseBundle?.clinicalDocuments ?? []) as ClinicalDocumentView[];
  const sourceNotes = clinicalDocuments.length > 0 ? clinicalDocuments : fallbackCaseNotes;

  const specialties = useMemo(() => {
    const visibleNotes = isPresim
    ? sourceNotes.filter((note) => note.is_in_presim)
    : sourceNotes;

  return [...new Set(visibleNotes.map((note) => note.specialty))];
}, [sourceNotes, isPresim]);

const filteredNotesData = useMemo(() => {
  const visibleNotes = isPresim
    ? sourceNotes.filter((note) => note.is_in_presim)
    : sourceNotes;

  const sortedNotes = [...visibleNotes].sort((a, b) => b.time_offset - a.time_offset);

  return filteredSpecialties.length > 0
    ? sortedNotes.filter((note) => filteredSpecialties.includes(note.specialty))
    : sortedNotes;
}, [sourceNotes, filteredSpecialties, isPresim]);
}

  const handleFilterChange = (specialty: string, checked: boolean | "indeterminate") => {
    setFilteredSpecialties(prev => {
      if (checked === true) {
        return [...prev, specialty];
      } else {
        return prev.filter(s => s !== specialty);
      }
    });
  };

  const clearAllFilters = () => {
    setFilteredSpecialties([]);
  };

  const onSubmitNote = async (noteContent: string): Promise<boolean> => {
    if (!canEdit) {
      toast.error("Notes are view-only in pre-simulation. Enter the active simulation to document.");
      return false;
    }
    const now = differenceInMinutes(new Date(), simStartTime ?? 0)
    if (!userId || !caseId || !sessionId) {
      toast.error("Still loading session data. Please try again in a moment.");
      return false;
    }
    if (!groupId) {
      toast.error("Still loading session data. Please try again in a moment.");
      return false;
    }

    const newNote: EditableStudentNoteUpsert = {
      group_id: groupId ?? "",
      user_id: userId,
      case_id: caseId,
      case_session_id: sessionId,
      author: userName || 'Unknown Student',
      category: 'Nursing',
      specialty: 'Nursing',
      time_offset: now,
      doc_text: noteContent,
      is_in_presim: false
    }

    const result = await submitStudentNote(newNote);
    if (result.success) {
      toast.success("Nursing note submitted.");
      return true;
    }
    else if (!result.success) {
      toast.error(result.message)
      return false;
    }
    return false;
  };

  if (isLoading) {
    return (
      <div className="flex h-full min-h-0 w-full flex-col items-center justify-start gap-6 bg-gray-100 pt-16">
        <Skeleton className="w-5/6 h-16 rounded-xl bg-gray-200" />
        <Skeleton className="w-5/6 h-8 rounded-xl bg-gray-200" />
        <Skeleton className="w-5/6 h-8 rounded-xl bg-gray-200" />
        <Skeleton className="w-5/6 h-8 rounded-xl bg-gray-200" />
        <Skeleton className="w-5/6 h-8 rounded-xl bg-gray-200" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-full min-h-0 w-full flex-col items-center justify-center gap-3 bg-gray-100 px-4">
        <p className="text-red-600">Error loading notes.</p>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 w-full flex-col gap-3 overflow-hidden bg-gray-100 px-4">
      <div className="flex w-full shrink-0 justify-between py-2">
        <div className="flex h-full flex-col gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="text-xs w-fit h-6 bg-white shadow-sm">
                Specialty
                <Filter className={`${filteredSpecialties.length > 0 ? 'fill-blue-300 stroke-blue-500' : ''}`} />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-fit p-4 border rounded-lg shadow">
              <div className="grid gap-4">
                <div className="flex flex-col gap-2">
                  {specialties.map(title => (
                    <div key={title} className="flex items-center space-x-2">
                      <Checkbox
                        id={`filter-${title}`}
                        checked={filteredSpecialties.includes(title)}
                        onCheckedChange={(checked) => handleFilterChange(title, checked)}
                      />
                      <Label htmlFor={`filter-${title}`} className="font-normal">
                        {title}
                      </Label>
                    </div>
                  ))}
                </div>
                {filteredSpecialties.length > 0 && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={clearAllFilters}
                    className="h-6 border shadow"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </PopoverContent>
          </Popover>

          <FilterBadges
            activeFilters={filteredSpecialties}
            handleFilterChange={handleFilterChange}
            handleClearFilters={clearAllFilters}
          />
        </div>
        <NursingNoteEntry disabled={!canEdit} submitNote={onSubmitNote} />
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto rounded-t-lg border bg-gray-100 p-2 inset-shadow-sm">
        {filteredNotesData.length === 0 ? (
          <p className="text-center text-gray-500 mt-10">No notes found.</p>
        ) : (
          filteredNotesData.map((note, index) => {
            return (
              <NoteDisplay key={index} startTime={simStartTime} note={note} />
            )
          })
        )}
      </div>
    </div>
  )
}

export default NoteView
