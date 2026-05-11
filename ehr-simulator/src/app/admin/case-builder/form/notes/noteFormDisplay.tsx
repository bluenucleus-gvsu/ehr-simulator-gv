"use client"
import { useState } from "react"
import {
  FileText,
  Stethoscope,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible";
import { ClinicalNote } from "@/app/simulation/[caseId]/[sessionId]/chart/notes/components/notesData";
import { Badge } from "@/components/ui/badge";
import DOMPurify from "dompurify";

function displayTimeOffset(minutes: number): string {
  const abs_min = Math.abs(minutes)
  const d = Math.floor(abs_min / 1440);
  const h = Math.floor((abs_min % 1440) / 60);
  const m = abs_min % 60;
  const parts = [];
  if (d > 0) parts.push(`-${d}d`);
  if (h > 0) parts.push(`-${h}h`);
  if (m > 0) parts.push(`-${m}m`);
  return parts.join(', ') || '0m';
}

const NoteFormDisplay = ({ note, onDelete }: { note: ClinicalNote, onDelete: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const sanitizedContent = DOMPurify.sanitize(note.content)

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="w-full bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden transition-all hover:shadow-md shrink-0"
    >
      <div className="flex justify-between items-start p-3 bg-slate-50/50 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex gap-3 items-center">
          <div className={`p-2 rounded-md ${note.title === 'Nursing Note' ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-600'}`}>
            {note.title === 'Nursing Note' ? <Stethoscope size={16} /> : <FileText size={16} />}
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-800">{note.title} {note.timeOffset}</h4>
            <p className="text-xs text-slate-500">{note.specialty} • {note.author}</p>
          </div>
          {note.excludedFromPresim ? (
            <Badge className="bg-amber-600/10 text-amber-600 border-amber-600/60 shadow-none rounded-full ml-8">
              Excluded from Pre-Sim

            </Badge>
          ) : (
            <Badge className="bg-lime-600/10 text-lime-600 border-lime-600/60 shadow-none rounded-full ml-8">
              Included in Pre-Sim
            </Badge>
          )
          }
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400 bg-white border px-1.5 py-0.5 rounded">
            {displayTimeOffset(note.timeOffset)}
          </span>
          <Button
            variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-red-600"
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
          >
            <X size={14} />
          </Button>
        </div>
      </div>

      <CollapsibleContent>
        <div className="p-4 text-sm text-black border-t border-slate-100 bg-white space-y-2">
          <div
            className="w-full max-w-none [&_p]:min-h-[1rem]"
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
          />
        </div>
      </CollapsibleContent>
      <div className="w-full h-4 ">

        <CollapsibleTrigger asChild className="p-0 m-0">
          <button className="focus-visible:ring-none focus:ring-none  h-full bg-slate-100 w-full cursor-pointer" />
        </CollapsibleTrigger>
      </div>

    </Collapsible>
  )
}

export default NoteFormDisplay