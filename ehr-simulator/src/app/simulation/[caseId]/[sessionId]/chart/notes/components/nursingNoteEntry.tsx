'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
  DialogDescription,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog"

import { Button } from "@/components/ui/button"
import { ClipboardPen } from "lucide-react"
import { useState } from "react"
import TextEditor from "@/components/textEditor"

const templateStudentNote = `
  <h2><u>Situation</u></h2>
  <p></p><h2><u>Background</u></h2><p></p>
  <h2><u>Assessment</u></h2><p></p>
  <h2><u>Recommendation</u></h2>
`

interface NursingNoteEntryProps {
  submitNote: (userNote: string) => void,
}

const NursingNoteEntry = ({ submitNote }: NursingNoteEntryProps) => {
  const [newNote, setNewNote] = useState<string>(templateStudentNote);
  const [isOpen, setIsOpen] = useState(false);

  const handleNoteChange = (noteContent: string) => {
    setNewNote(noteContent);
  }

  const handleSubmitNote = () => {
    submitNote(newNote);
    setNewNote(templateStudentNote);
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          onClick={() => setIsOpen(true)}
          className="bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-sm gap-2"
        >
          <ClipboardPen className="h-4 w-4" />
          <span>Add SBAR Note</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="md:max-w-2xl xl:max-w-3xl bg-white p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 bg-slate-50 border-b border-slate-200">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <span className="bg-blue-100 text-blue-600 p-1.5 rounded-md">
              <ClipboardPen size={18} />
            </span>
            Nursing Note (SBAR)
          </DialogTitle>
          <DialogDescription>
            Document clinical findings using the SBAR communication format.
          </DialogDescription>
        </DialogHeader>

        <div className="px-4 py-2 overflow-y-auto max-h-[70vh]">
          <TextEditor content={newNote} onChange={handleNoteChange} />
        </div>

        <DialogFooter className="px-6 py-4 bg-slate-50 border-t border-slate-200">
          <DialogClose asChild>
            <Button
              variant="ghost"
              className="hover:bg-slate-100"
            >
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" onClick={handleSubmitNote} className="bg-blue-600 hover:bg-blue-700">
            Submit Note
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default NursingNoteEntry