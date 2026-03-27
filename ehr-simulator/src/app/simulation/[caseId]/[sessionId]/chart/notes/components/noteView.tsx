"use client"

import { useState, useMemo } from "react";
import { ClinicalNote } from "./components/notesData";
import NursingNoteEntry from "./components/nursingNoteEntry";
import NoteDisplay from "./components/noteDisplay";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import FilterBadges from "./components/filterBadges";
import { useSimulationCase } from "@/context/SimulationCaseContext";

type DbClinicalDocument = {
  category?: string | null;
  author?: string | null;
  specialty?: string | null;
  time_offset?: number | null;
  doc_text?: string | null;
  is_in_presim?: boolean | null;
};

const NotePage = () => {
  const { caseBundle } = useSimulationCase();
  const [sessionStartTime] = useState(new Date().getTime())

const NoteView = ({
  isError = false,
  isLoading,
  clinicalDocuments,
  caseId,
  sessionId
}: NoteViewProps) => {
  const { simStartTime, userName, userId, groupId, isPresim } = useSimSessionContext();
  const [filteredSpecialties, setFilteredSpecialties] = useState<string[]>([]);

  const notesData = useMemo(() => {
    const docs = (caseBundle?.clinicalDocuments ?? []) as DbClinicalDocument[];
    return docs
      .map((doc): ClinicalNote => ({
        title: doc.category ?? "Clinical Document",
        author: doc.author ?? "N/A",
        specialty: doc.specialty ?? "N/A",
        timeOffset: doc.time_offset ?? 0,
        content: doc.doc_text ?? "<p>N/A</p>",
        excludedFromPresim: !(doc.is_in_presim ?? false),
      }))
      .sort((a, b) => a.timeOffset - b.timeOffset);
  }, [caseBundle]);

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
    if (!noteContent) return;
    toast.info("Add note is disabled in rendering-only mode.");
  };

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
        <NursingNoteEntry submitNote={onSubmitNote} disabled />
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
