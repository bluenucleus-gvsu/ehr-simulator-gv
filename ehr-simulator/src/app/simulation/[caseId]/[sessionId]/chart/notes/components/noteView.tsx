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
import { differenceInMinutes, format } from "date-fns";
import { ClinicalDocumentView, EditableStudentNoteUpsert, submitStudentNote } from "@/actions/simulation";
import { useSimSessionContext } from "@/context/SimSessionContext";
import { Skeleton } from "@/components/ui/skeleton";

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
  const { simStartTime, userName, userId, groupId, isPresim } = useSimSessionContext();
  const [filteredSpecialties, setFilteredSpecialties] = useState<string[]>([]);

  const specialties = useMemo(() => {
    return [...new Set(clinicalDocuments.map((note) => note.specialty))];
  }, [clinicalDocuments]);

  const filteredNotesData = useMemo(() => {
    const sorted_notes = clinicalDocuments.sort((a, b) => b.time_offset - a.time_offset);
    if (filteredSpecialties.length === 0) {
      return sorted_notes;
    }
    return sorted_notes.filter(note => filteredSpecialties.includes(note.specialty))
  }, [clinicalDocuments, filteredSpecialties]);

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

  const onSubmitNote = async (noteContent: string) => {
    const now = differenceInMinutes(new Date(), simStartTime ?? 0)
    if (!groupId || !userId || !caseId || !sessionId) {
      toast.error("Still loading session data. Please try again in a moment.");
      return;
    }

    const newNote: EditableStudentNoteUpsert = {
      group_id: groupId,
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
      toast.success(`Nursing note submitted at ${format(now, 'HH:mm')}`);
    }
    else if (!result.success) {
      toast.error(result.message)
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full w-full pt-16 bg-gray-100 justify-start items-center gap-6">
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
      <div className="w-full h-full flex flex-col px-4 gap-3 bg-gray-100 justify-center items-center">
        <p className="text-red-600">Error loading notes.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[calc(100vh-4rem)] flex flex-col px-4  gap-3 bg-gray-100">
      <div className="w-full flex flex-shrink-0 justify-between py-2">
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
        <NursingNoteEntry isPresim={isPresim} submitNote={onSubmitNote} />
      </div>

      <div className="flex flex-col flex-grow gap-4 p-2 rounded-t-lg overflow-y-auto border inset-shadow-sm bg-gray-100">
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
