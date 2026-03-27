"use client"

import { useEffect, useState } from "react"
import {
  Stethoscope,
  User,
  FileText,
  ListPlus,
  ChevronDown,
  FolderPen,
  ArrowLeft,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { useRouter, useParams } from "next/navigation"
import InfoTooltip from "@/app/admin/case-builder/components/helpTooltip"
import TextEditor from "@/components/textEditor"
import NoteFormDisplay from "@/app/admin/case-builder/form/notes/noteFormDisplay"
import { categories, specialties, soapTemplateNote } from "@/utils/form"
import { getClinicalDocuments, replaceClinicalDocuments } from "@/actions/notes"
import { Tables, TablesInsert } from "../../../../../../database.types"

export default function EditNotesPage() {
  const router = useRouter()
  const params = useParams()
  const caseId = params.id as string

  const [notes, setNotes] = useState<Tables<"clinical_documents">[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Form state
  const [category, setCategory] = useState<string>("")
  const [specialty, setSpecialty] = useState<string>("")
  const [author, setAuthor] = useState<string>("")
  const [isSoap, setIsSoap] = useState(true)
  const [excludeFromPresim, setExcludeFromPresim] = useState(false)
  const [noteContent, setNoteContent] = useState<string>(soapTemplateNote)

  // Time offset
  const [days, setDays] = useState<number | "">(0)
  const [hours, setHours] = useState<number | "">(0)
  const [minutes, setMinutes] = useState<number | "">(0)

  const canAddNote = [specialty, author, category].every(s => s.trim() !== "") && noteContent.length > 0

  useEffect(() => {
    getClinicalDocuments(caseId).then(result => {
      if (result.success && result.data) {
        setNotes(result.data)
      } else {
        setLoadError("Failed to load clinical notes. Please try again.")
      }
    })
  }, [caseId])

  const handleSoapToggle = (checked: boolean) => {
    setIsSoap(checked)
    setNoteContent(checked ? soapTemplateNote : "<p></p>")
  }

  const clearForm = () => {
    setCategory("")
    setSpecialty("")
    setAuthor("")
    setExcludeFromPresim(false)
    setNoteContent(isSoap ? soapTemplateNote : "<p></p>")
    setDays(0)
    setHours(0)
    setMinutes(0)
  }

  const createNote = () => {
    const timeOffset =
      ((Number(days) || 0) * 1440) +
      ((Number(hours) || 0) * 60) +
      (Number(minutes) || 0)

    const newNote: TablesInsert<"clinical_documents"> = {
      case_id: caseId,
      category: category as Tables<"clinical_documents">["category"],
      specialty,
      author,
      time_offset: timeOffset,
      doc_text: noteContent,
      is_in_presim: !excludeFromPresim,
    }

    setNotes([
      {
        ...newNote,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
      } as Tables<"clinical_documents">,
      ...notes,
    ])

    clearForm()
  }

  const removeNote = (index: number) => {
    setNotes(notes.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    setIsSaving(true)

    const result = await replaceClinicalDocuments(
      caseId,
      notes.map((n): TablesInsert<"clinical_documents"> => ({
        case_id: caseId,
        category: n.category,
        specialty: n.specialty,
        author: n.author,
        time_offset: n.time_offset,
        doc_text: n.doc_text,
        is_in_presim: n.is_in_presim,
      }))
    )

    setIsSaving(false)

    if (result.success) {
      router.push(`/admin/cases/${caseId}`)
    } else {
      console.error("Failed to save notes:", result.error)
    }
  }

  return (
    <div className="flex flex-col w-full min-h-screen bg-slate-50/50">

      {/* Header */}
      <header className="sticky top-0 flex items-center justify-between px-4 sm:px-8 py-3 bg-white border-b z-10 shadow gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <FolderPen className="text-slate-400 w-5 h-5" /> Edit Clinical Notes
          </h1>
          <p className="text-xs text-slate-500 mt-1">Add and remove clinical documentation</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button
            className="cursor-pointer"
            variant="outline"
            onClick={() => router.push(`/admin/cases/${caseId}`)}
          >
            <ArrowLeft className="w-4 h-4 mr-1" />Leave Without Saving
          </Button>
          <Button
            className="cursor-pointer"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save & Return"}
          </Button>
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 p-6 md:px-8 lg:px-12">
        {loadError && (
          <p className="text-red-500 text-sm mb-4">{loadError}</p>
        )}
        <div className="grid grid-cols-1 2xl:grid-cols-12 gap-6 max-w-7xl mx-auto pb-20">

          {/* New Entry */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="border-slate-200 shadow-sm pt-0">
              <CardHeader className="bg-slate-50/50 border-b border-slate-200/70 rounded-t-xl pt-3 !pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" /> New Entry
                </CardTitle>
                <CardDescription>Enter note details below</CardDescription>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Specialty <span className="text-red-500">*</span></Label>
                    <Select value={specialty} onValueChange={setSpecialty}>
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Select specialty..." />
                        <ChevronDown />
                      </SelectTrigger>
                      <SelectContent>
                        {specialties.map((s, i) => (
                          <SelectItem key={i} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Category <span className="text-red-500">*</span></Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Select note type..." />
                        <ChevronDown />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((c, i) => (
                          <SelectItem key={i} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pb-2">
                  <div className="space-y-2">
                    <Label>Author <span className="text-red-500">*</span></Label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <Input
                        value={author}
                        onChange={e => setAuthor(e.target.value)}
                        className="pl-9 bg-white"
                        placeholder="e.g. Dr. Smith"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label>Time Before Sim</Label>
                      <InfoTooltip content="How long before the simulation start time was this note written?" />
                    </div>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          type="number"
                          min={0}
                          value={days}
                          onChange={e => { if (Number(e.target.value) <= 99999999) setDays(Number(e.target.value)) }}
                          className="pr-8 bg-white"
                        />
                        <span className="absolute right-3 top-2.5 text-xs text-slate-400">d</span>
                      </div>
                      <div className="relative flex-1">
                        <Input
                          type="number"
                          min={0}
                          value={hours}
                          onChange={e => { if (Number(e.target.value) <= 99999999) setHours(Number(e.target.value)) }}
                          className="pr-8 bg-white"
                        />
                        <span className="absolute right-3 top-2.5 text-xs text-slate-400">h</span>
                      </div>
                      <div className="relative flex-1">
                        <Input
                          type="number"
                          min={0}
                          value={minutes}
                          onChange={e => { if (Number(e.target.value) <= 99999999) setMinutes(Number(e.target.value)) }}
                          className="pr-8 bg-white"
                        />
                        <span className="absolute right-3 top-2.5 text-xs text-slate-400">m</span>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg">
                    <div className="flex items-center gap-2 p-2 w-fit">
                      <Checkbox
                        id="presim"
                        checked={excludeFromPresim}
                        onCheckedChange={(v) => setExcludeFromPresim(!!v)}
                      />
                      <Label htmlFor="presim" className="text-sm font-normal cursor-pointer">Exclude from Pre-Sim</Label>
                    </div>
                    <div className="flex items-center gap-2 p-2 w-fit">
                      <Switch
                        id="soap-mode"
                        checked={isSoap}
                        onCheckedChange={handleSoapToggle}
                        className="border border-slate-300"
                      />
                      <Label htmlFor="soap-mode" className="text-sm font-normal cursor-pointer">SOAP Format</Label>
                    </div>
                  </div>
                </div>

                <Separator />
                <TextEditor content={noteContent} onChange={setNoteContent} />

                <div className="pt-2">
                  <Button
                    type="button"
                    className="w-full bg-blue-600 hover:bg-blue-700 mt-2"
                    disabled={!canAddNote}
                    onClick={createNote}
                  >
                    <ListPlus className="mr-2 h-4 w-4" />
                    Add Note to Chart
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chart Preview */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between text-slate-600 px-1">
              <h3 className="font-semibold flex items-center gap-2">
                <Stethoscope className="w-4 h-4" />
                Chart Preview
              </h3>
              <span className="text-xs bg-slate-200 px-2 py-1 rounded-full">
                {notes.length} Notes
              </span>
            </div>

            <div className="space-y-3 overflow-y-auto pr-2 scrollbar-thin">
              {notes.length === 0 && (
                <div className="h-48 border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center text-slate-400">
                  <FileText className="w-8 h-8 mb-2 opacity-50" />
                  <p className="text-sm">No notes added yet.</p>
                </div>
              )}

              {notes.map((note, index) => (
                <div key={note.id} className="group relative">
                  <NoteFormDisplay
                    note={{
                      title: `${note.category} Note`,
                      author: note.author,
                      specialty: note.specialty,
                      timeOffset: note.time_offset,
                      content: note.doc_text,
                      excludedFromPresim: !note.is_in_presim,
                    }}
                    onDelete={() => removeNote(index)}
                  />
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}