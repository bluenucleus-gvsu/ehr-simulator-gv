"use client"
import { useState } from "react"
import {
  FilePlus,
  Stethoscope,
  User,
  FileText,
  ListPlus,
  ChevronDown,
  Info
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import InfoTooltip from "../../../../../components/helpTooltip";
import { useRouter } from "next/navigation";
import { categories, specialties } from "@/utils/form";

import { ClinicalNote } from "@/app/simulation/[caseId]/[sessionId]/chart/notes/components/notesData";
import NoteFormDisplay from "./noteFormDisplay";
import { useFormContext } from "@/context/FormContext";
import { Checkbox } from "@/components/ui/checkbox";
import TextEditor from "@/components/textEditor";
import { soapTemplateNote } from "@/utils/form";
import { FormShell } from "../../components/formShell";
import { saveCaseData } from "@/actions/case_builder/caseBuilder";
import { CaseSection } from "@/lib/saveCase";
import { caseBuilderPath } from "@/lib/caseBuilder/routes";

export default function NotesForm() {
  const { onDataChange, noteData, demographicData, caseId } = useFormContext()
  const [notes, setNotes] = useState<ClinicalNote[]>(noteData);

  // individual note data
  const [category, setCategory] = useState<string>("");
  const [specialty, setSpecialty] = useState<string>("");
  const [author, setAuthor] = useState<string>("");
  const [isSoap, setIsSoap] = useState<boolean>(true);
  const [excludeFromPresim, setExcludeFromPresim] = useState<boolean>(false)
  const [noteContent, setNoteContent] = useState<string>(soapTemplateNote);
  const [phase, setPhase] = useState(1);

  // Time Offset
  const [days, setDays] = useState<number | ''>('');
  const [hours, setHours] = useState<number | ''>('');
  const [minutes, setMinutes] = useState<number | ''>('');

  const canAddNote = Boolean(specialty && author && category && noteContent);

  const handleCheckedChange = (value: boolean) => {
    setExcludeFromPresim(value)
  }

  const handleNoteChange = (content: string) => {
    setNoteContent(content)
  }

  const handleSoapToggle = (checked: boolean) => {
    const template = checked ? soapTemplateNote : '<p></p>';
    setIsSoap(checked);
    setNoteContent(template);
  };

  const clearForm = () => {
    setCategory("");
    setNoteContent(isSoap ? soapTemplateNote : '<p></p>');
    setDays('');
    setHours('');
    setMinutes('');
    setPhase(1);
  };

  const createNote = () => {
    const timeOffset = -1 * (((Number(days) || 0) * 1440) + ((Number(hours) || 0) * 60) + (Number(minutes) || 0));

    const newNote = {
      title: category ? `${category} Note` : "Progress Note",
      author,
      specialty,
      timeOffset,
      content: noteContent,
      excludedFromPresim: excludeFromPresim,
      phase,
    };
    setNotes(prev => [newNote, ...prev]);
    clearForm();
  };

  const router = useRouter();

  const goBack = () => {
    onDataChange("notes", notes);
    router.push(caseBuilderPath("/admin/case-builder/form/history", caseId));
  }

  const handleSubmit = async () => {
    onDataChange("notes", notes);

    await saveCaseData({
      payload: notes,
      section: CaseSection.CLINICAL_DOCUMENTS,
      caseId: caseId
    })

    router.push(caseBuilderPath("/admin/case-builder/form/orders", caseId));
  }

  const sortedNotes = [...notes].sort((a, b) => b.timeOffset - a.timeOffset)

  return (
    <FormShell
      title="Clinical Documentation"
      stepDescription="Step 3 of 10: Add all relevant notes"
      icon={<FilePlus className="text-slate-400" />}
      onSubmit={handleSubmit}
      goBack={goBack}
      continueButtonText="Continue"
      backButtonText="Back"
      continueButtonTooltip="Proceed to Next Page"
      backButtonTooltip="Return to Previous Page"
    >
      <div className="bg-slate-50/50 flex-1 overflow-y-auto p-6 md:px-8 lg:px-12 ">
        <div className="grid grid-cols-1 2xl:grid-cols-12 gap-6 h-full max-w-7xl mx-auto pb-20">
          <div className="lg:col-span-7 space-y-6">
            <Card className="border-slate-200 shadow-sm pt-0">
              <CardHeader className="bg-slate-50 border-b border-slate-200 pt-4 !pb-2 rounded-t-xl">
                <CardTitle className="text-lg flex items-center justify-between">
                  <span className="flex items-center gap-2"><FileText className="w-4 h-4 text-blue-600" /> New Entry</span>
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Specialty</Label>
                    <Select value={specialty} onValueChange={setSpecialty}>
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Select specialty..." />
                        <ChevronDown />
                      </SelectTrigger>
                      <SelectContent>
                        {specialties.map((s, i) => <SelectItem key={i} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select
                      value={category}
                      onValueChange={setCategory}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Select note type..." />
                        <ChevronDown />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((c, i) => <SelectItem key={i} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                </div>

                {/* Author & Time Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pb-2">
                  <div className="space-y-2">
                    <Label>Author</Label>
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
                      <InfoTooltip content="How long before the simulation start time was this note written?">
                        <Info size={16} color="var(--muted-foreground)" />
                      </InfoTooltip>
                    </div>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input value={days} onChange={e => { if (Number(e.target.value) <= 99999999) setDays(Number(e.target.value)) }} className="pr-8 bg-white" />
                        <span className="absolute right-3 top-2.5 text-xs text-slate-400">d</span>
                      </div>
                      <div className="relative flex-1">
                        <Input value={hours} onChange={e => { if (Number(e.target.value) <= 99999999) setHours(Number(e.target.value)) }} className="pr-8 bg-white" />
                        <span className="absolute right-3 top-2.5 text-xs text-slate-400">h</span>
                      </div>
                      <div className="relative flex-1">
                        <Input value={minutes} onChange={e => { if (Number(e.target.value) <= 99999999) setMinutes(Number(e.target.value)) }} className="pr-8 bg-white" />
                        <span className="absolute right-3 top-2.5 text-xs text-slate-400">m</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex w-full gap-2">
                    <Checkbox checked={excludeFromPresim} onCheckedChange={handleCheckedChange} />
                    <Label>Exclude from Pre-Sim</Label>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-normal">
                    <Switch id="soap-mode" checked={isSoap} onCheckedChange={handleSoapToggle} className="border border-slate-300" />
                    <Label htmlFor="soap-mode">SOAP Format</Label>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="note-phase">Release phase</Label>
                    <Input
                      id="note-phase"
                      type="number"
                      min={1}
                      max={demographicData.phaseCount}
                      value={phase}
                      onChange={(event) => setPhase(Math.min(
                        demographicData.phaseCount,
                        Math.max(1, Number(event.target.value) || 1),
                      ))}
                      className="bg-white"
                    />
                  </div>
                </div>

                <Separator />
                <TextEditor content={noteContent} onChange={handleNoteChange} />

                <div className="pt-2">
                  <Button
                    type="button"
                    className="w-full bg-blue-600 hover:bg-blue-700"
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

          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between text-slate-600 px-1">
              <h3 className="font-semibold flex items-center gap-2">
                <Stethoscope className="w-4 h-4" />
                Chart Preview
              </h3>
              <span className="text-xs bg-slate-200 px-2 py-1 rounded-full">{notes.length} Notes</span>
            </div>

            <div className="space-y-3 h-full overflow-y-auto pr-2 scrollbar-thin">
              {notes.length === 0 && (
                <div className="h-48 border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center text-slate-400">
                  <FileText className="w-8 h-8 mb-2 opacity-50" />
                  <p className="text-sm">No notes added yet.</p>
                </div>
              )}

              {sortedNotes.map((note, index) => (
                <div key={index} className="group relative">
                  <NoteFormDisplay
                    note={note}
                    onDelete={() => setNotes(notes.filter((_, i) => i !== index))}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </FormShell>
  );
}
