"use client"

import { useState, useMemo } from "react";
import { ClinicalNote, sampleNotes } from "./components/notesData"; // Assuming sampleNotes is exported from here
import NursingNoteEntry from "./components/nursingNoteEntry";
import NoteDisplay from "./components/noteDisplay";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import FilterBadges from "./components/filterBadges";
import { Skeleton } from "@/components/ui/skeleton";
import { differenceInMinutes, format } from "date-fns";
import { EditableStudentNoteUpsert, submitStudentNote } from "@/actions/studentSim";

const NotePage = () => {
  // query both clinical_documents table and editable_clinical_documents
  // 
  const [notesData, setNotesData] = useState<ClinicalNote[]>([]);
  const [sessionStartTime] = useState(new Date().getTime())

  const [filteredSpecialties, setFilteredSpecialties] = useState<string[]>([]);

  setNotesData(sampleNotes)

  const specialties = useMemo(() => {
    return [...new Set(notesData.map((note) => note.specialty))];
  }, [notesData]);

  const filteredNotesData = useMemo(() => {
    if (filteredSpecialties.length === 0) {
      return notesData;
    }
    return notesData.filter(note => filteredSpecialties.includes(note.specialty));
  }, [notesData, filteredSpecialties]);

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
    const now = differenceInMinutes(new Date(), sessionStartTime)

    const newNote: EditableStudentNoteUpsert = {
      // groupId: 
      // userId: 
      // caseSessionId
      author: "User's name",
      category: 'Nursing',
      specialty: "Nursing",
      timeOffset: now,
      content: noteContent,
      excludedFromPresim: true
    }

    setNotesData(prev => [newNote, ...prev]);
    const result = await submitStudentNote(newNote);
    if (result.success) {
      toast.success(`Nursing note submitted at ${format(now, 'HH:mm')}`);
    }
    else if (!result.success) {
      toast.error(result.message)
    }
  };

  /* if (isLoading) {
    return (
      <div className="flex flex-col h-full w-full pt-16 bg-gray-100 justify-start items-center gap-6">
        <Skeleton className="w-5/6 h-16 rounded-xl bg-gray-200" />
        <Skeleton className="w-5/6 h-8 rounded-xl bg-gray-200" />
        <Skeleton className="w-5/6 h-8 rounded-xl bg-gray-200" />
        <Skeleton className="w-5/6 h-8 rounded-xl bg-gray-200" />
        <Skeleton className="w-5/6 h-8 rounded-xl bg-gray-200" />
      </div>
    );
  } */

  /* if (isError) {
    return (
      <div className="w-full h-full flex flex-col px-4 gap-3 bg-gray-100 justify-center items-center">
        <p className="text-red-600">Error loading notes.</p>
      </div>
    );
  } */

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
        <NursingNoteEntry submitNote={onSubmitNote} />
      </div>

      <div className="flex flex-col flex-grow gap-4 p-2 rounded-t-lg overflow-y-auto border inset-shadow-sm bg-gray-100">
        {filteredNotesData.length === 0 ? (
          <p className="text-center text-gray-500 mt-10">No notes found.</p>
        ) : (
          filteredNotesData.map((note, index) => {
            return (
              <NoteDisplay key={index} startTime={sessionStartTime} note={note} />
            )
          })
        )}
      </div>
    </div>
  )
}

export default NotePage
