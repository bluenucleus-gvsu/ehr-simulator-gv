'use client'

import { useState } from "react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"
import {
  ChevronDown,
  User,
  Clock,
  Stethoscope,
  ClipboardList
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { addMinutes, format } from "date-fns"
import DOMPurify from "dompurify"
import { ClinicalDocumentView } from "@/actions/simulation"

const displayDate = (startTime: number | null, offset: number) => {
  if (!startTime) {
    return 'Unknown'
  }
  return format(addMinutes(startTime, offset), "Pp")

};

/** Title uses document category (e.g. Admission → "Admission Note"), not specialty (e.g. Internal Medicine). */
function noteDisplayTitle(note: ClinicalDocumentView): string {
  const cat = note.category?.trim();
  if (cat) return `${cat} Note`;
  const spec = note.specialty?.trim();
  if (spec) return `${spec} Note`;
  return "Note";
}

interface NoteDisplayProps {
  note: ClinicalDocumentView;
  startTime: number | null;
}

export default function NoteDisplay({ note, startTime }: NoteDisplayProps) {
  const [isOpen, setIsOpen] = useState(false);
  // const sanitizedContent = DOMPurify.sanitize(note.doc_text)

  // Determine icon based on note type
  const NoteIcon = (note.specialty === "Nursing" || note.specialty === "Student") ? Stethoscope : ClipboardList;
  const iconColor = (note.specialty === "Nursing" || note.specialty === "Student") ? "text-blue-600 bg-blue-50" : "text-orange-600 bg-orange-50";

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="w-full bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden transition-all hover:shadow-md group shrink-0"
    >
      <div
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 cursor-pointer hover:bg-slate-50/50 transition-colors gap-3"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex gap-3 items-center overflow-hidden">
          <div className={`p-2.5 rounded-lg shrink-0 ${iconColor}`}>
            <NoteIcon size={20} className={`${iconColor}`} />
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 truncate">{noteDisplayTitle(note)}</h3>
              {note.specialty === "Student Note" && <Badge variant="outline" className="text-[10px] h-5 px-1.5 text-blue-600 border-blue-200 bg-blue-50">Student</Badge>}
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-0.5">
              <span className="flex items-center gap-1">
                <User size={12} className="text-slate-400" />
                {note.author}
              </span>
              <span className="hidden sm:inline font-bold text-slate-500">•</span>
              <span className="font-medium text-slate-600">{note.specialty}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between w-full sm:w-auto gap-4 pl-[3.25rem] sm:pl-0">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
            <Clock size={12} className="text-slate-400" />
            {displayDate(startTime, note.time_offset)}
          </div>

          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 shrink-0">
              <ChevronDown
                size={16}
                className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
              />
            </Button>
          </CollapsibleTrigger>
        </div>
      </div>

      <CollapsibleContent>
        <div className="px-8 py-4 text-sm text-black space-y-4 animate-in slide-in-from-top-2 duration-200 border-t  border-slate-100">
          <div
            className="w-full max-w-none [&_p]:min-h-[1rem]"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(note.doc_text) }}
          />
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
