"use client"
import { useState } from "react"
import { format, parseISO } from "date-fns"
import {
  CalendarIcon, ChevronDown, ChevronUp, Plus, Shuffle, Users2, UserX
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Student, FacultyMember, SectionData } from "./types"
import { GroupCard } from "./GroupCard"
import { StudentBlock } from "./StudentBlock"

export type { FacultyMember, SectionData }

export type SectionGroups = Record<string, Student[]>

export function generateGroupNames(count: number): string[] {
  const names: string[] = []
  for (let i = 0; i < count; i++) {
    if (i < 26) names.push("Group " + String.fromCharCode(65 + i))
    else names.push("Group " + String.fromCharCode(65 + Math.floor(i / 26) - 1) + String.fromCharCode(65 + (i % 26)))
  }
  return names
}

export function randomlyAssignGroups(students: Student[], groupSize: number): SectionGroups {
  const shuffled = [...students].sort(() => Math.random() - 0.5)
  const count = Math.round(shuffled.length / groupSize)
  const numGroups = Math.max(1, count)
  const names = generateGroupNames(numGroups)
  const groups: SectionGroups = {}
  names.forEach(n => { groups[n] = [] })
  shuffled.forEach((student, i) => {
    groups[names[i % numGroups]].push(student)
  })
  return groups
}

// ─── Date+time picker helpers ────────────────────────────────────────────────

/** Extract the HH:mm part from an ISO timestamptz string, or return "". */
function isoToTimeInput(iso: string | null | undefined): string {
  if (!iso) return ""
  try {
    return format(parseISO(iso), "HH:mm")
  } catch {
    return ""
  }
}

/** Extract just the date from an ISO string for the Calendar, or undefined. */
function isoToDate(iso: string | null | undefined): Date | undefined {
  if (!iso) return undefined
  try {
    return parseISO(iso)
  } catch {
    return undefined
  }
}

/**
 * Combine a Date (from the calendar) and an HH:mm string (from the time input)
 * into a full ISO 8601 string. Falls back gracefully if either is missing.
 */
function toISO(date: Date | undefined, time: string): string | null {
  if (!date) return null
  const [hours, minutes] = time ? time.split(":").map(Number) : [0, 0]
  const combined = new Date(date)
  combined.setHours(hours ?? 0, minutes ?? 0, 0, 0)
  return combined.toISOString()
}

// ─── DateTimePicker sub-component ────────────────────────────────────────────

interface DateTimePickerProps {
  label: string
  value: string | null | undefined   // timestamptz ISO string
  onChange: (iso: string | null) => void
}

function DateTimePicker({ label, value, onChange }: DateTimePickerProps) {
  const date = isoToDate(value)
  const time = isoToTimeInput(value)

  const handleDateSelect = (selected: Date | undefined) => {
    onChange(toISO(selected, time))
  }

  const handleTimeChange = (newTime: string) => {
    onChange(toISO(date, newTime))
  }

  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-slate-500 normal-case">{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(
              "h-8 w-full justify-start text-left font-normal text-xs px-2.5 gap-1.5",
              !date && "text-slate-400"
            )}
          >
            <CalendarIcon className="w-3.5 h-3.5 flex-shrink-0" />
            {date ? format(date, "MMM d, yyyy") : "Pick a date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      <Input
        type="time"
        value={time}
        onChange={e => handleTimeChange(e.target.value)}
        className="h-8 text-xs"
        placeholder="HH:MM"
      />
    </div>
  )
}

// ─── SectionCard ──────────────────────────────────────────────────────────────

interface SectionCardProps {
  section: SectionData
  /** 1-based display index, used to derive the section name ("Section 01", etc.) */
  index: number
  groups: SectionGroups
  unassigned: Student[]
  groupSize: number
  facultyMembers: FacultyMember[]
  groupFacultyLeads: Record<string, string>
  onGroupFacultyLeadChange: (sectionClientId: string, groupName: string, facultyId: string) => void
  draggedStudent: { student: Student; fromGroup: string; fromSection: string } | null
  dragOverGroup: string | null
  onSectionChange: (field: keyof SectionData, value: string | null) => void
  onGroupSizeChange: (size: number) => void
  onRandomAssign: () => void
  onUnassignAll: () => void
  onAddGroup: () => void
  onRenameGroup: (sectionClientId: string, oldName: string, newName: string) => void
  onDeleteGroup: (sectionClientId: string, groupName: string) => void
  onDragStart: (e: React.DragEvent, student: Student, fromGroup?: string, fromSection?: string) => void
  onDragEnd: () => void
  onDragOver: (e: React.DragEvent, sectionClientId: string, groupName: string) => void
  onDragLeave: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent, toGroup: string, toSection: string) => void
  /** Other sections a group can be moved to (passed down to GroupCard) */
  availableSections?: { id: string; label: string }[]
  /** Called when user moves a group to another section */
  onMoveGroup?: (fromSectionId: string, groupName: string, toSectionId: string) => void
}

/** Zero-pad a 1-based index: 1 → "01", 12 → "12" */
function sectionLabel(index: number): string {
  return `Section ${String(index).padStart(2, "0")}`
}

export const SectionCard = ({
  section,
  index,
  groups,
  unassigned,
  groupSize,
  facultyMembers,
  groupFacultyLeads,
  onGroupFacultyLeadChange,
  draggedStudent,
  dragOverGroup,
  onSectionChange,
  onGroupSizeChange,
  onRandomAssign,
  onUnassignAll,
  onAddGroup,
  onRenameGroup,
  onDeleteGroup,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
  availableSections = [],
  onMoveGroup,
}: SectionCardProps) => {
  const [expanded, setExpanded] = useState(true)

  const label = sectionLabel(index)
  const totalAssigned = Object.values(groups).reduce((s, g) => s + g.length, 0)
  const unassignedDropKey = `${section.name}::__unassigned__`
  const isOverUnassigned =
    dragOverGroup === unassignedDropKey &&
    draggedStudent?.fromSection === section.name &&
    draggedStudent?.fromGroup !== "__unassigned__"

  return (
    <Card className="border-2 border-slate-200 overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        className="cursor-pointer w-full flex items-center justify-between gap-2 px-4 sm:px-5 py-3.5 bg-slate-50/60 hover:brightness-95 transition-all text-left"
      >
        <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
          <span className="text-base font-bold text-slate-800 flex-shrink-0">{label}</span>
          {section.start_date && (
            <Badge variant="outline" className="text-xs">
              Starts {format(parseISO(section.start_date as string), "MMM d, yyyy")}
            </Badge>
          )}
          {section.end_date && (
            <Badge variant="outline" className="text-xs">
              Ends {format(parseISO(section.end_date as string), "MMM d, yyyy")}
            </Badge>
          )}
          {section.meeting_time && (
            <Badge variant="outline" className="text-xs">
              Meets {format(parseISO(section.meeting_time as string), "MMM d, yyyy 'at' h:mm a")}
            </Badge>
          )}
          <Badge variant="secondary" className="text-xs">
            {totalAssigned} assigned
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {unassigned.length} unassigned
          </Badge>
        </div>
        {expanded
          ? <ChevronUp className="w-4 h-4 text-slate-500 flex-shrink-0" />
          : <ChevronDown className="w-4 h-4 text-slate-500 flex-shrink-0" />}
      </button>

      {expanded && (
        <CardContent className="p-4 sm:p-5 pt-3 sm:pt-3 space-y-5">
          {/* Schedule */}
          <div className="pb-3 border-b border-slate-100">
            <p className="text-xs font-semibold text-slate-500 mb-3">Schedule</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <DateTimePicker
                label="Start Date"
                value={section.start_date as string | null | undefined}
                onChange={iso => onSectionChange("start_date", iso)}
              />
              <DateTimePicker
                label="End Date"
                value={section.end_date as string | null | undefined}
                onChange={iso => onSectionChange("end_date", iso)}
              />
              <DateTimePicker
                label="Meeting Time"
                value={section.meeting_time as string | null | undefined}
                onChange={iso => onSectionChange("meeting_time", iso)}
              />
            </div>
          </div>

          {/* Group controls */}
          <div className="flex items-center flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Label className="text-xs font-medium text-slate-500 whitespace-nowrap">Group size</Label>
              <div className="flex items-center gap-1 border border-slate-200 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => onGroupSizeChange(Math.max(1, groupSize - 1))}
                  className="h-8 w-8 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer font-medium text-sm"
                >-</button>
                <span className="w-8 text-center text-sm font-semibold text-slate-800">{groupSize}</span>
                <button
                  type="button"
                  onClick={() => onGroupSizeChange(Math.min(20, groupSize + 1))}
                  className="h-8 w-8 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer font-medium text-sm"
                >+</button>
              </div>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={onRandomAssign}
              className="cursor-pointer gap-1.5 h-8 text-xs"
            >
              <Shuffle className="w-3.5 h-3.5" /> Randomly Assign
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={onUnassignAll}
              className="cursor-pointer gap-1.5 h-8 text-xs"
            >
              <UserX className="w-3.5 h-3.5" /> Unassign All
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={onAddGroup}
              className="cursor-pointer gap-1.5 h-8 text-xs"
            >
              <Plus className="w-3.5 h-3.5" /> Add Group
            </Button>
          </div>

          {(Object.keys(groups).length > 0 || unassigned.length > 0) && (
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 min-w-0">
                {Object.keys(groups).length === 0 ? (
                  <div className="flex items-center justify-center h-24 border-2 border-dashed border-slate-200 rounded-lg">
                    <p className="text-sm text-slate-400 text-center px-4">No groups yet — click "Randomly Assign" or "Add Group"</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
                    {Object.entries(groups)
                      .sort(([a], [b]) => a.localeCompare(b))
                      .map(([groupName, students]) => (
                        <GroupCard
                          key={groupName}
                          groupName={groupName}
                          students={students}
                          sectionId={section.name}
                          facultyMembers={facultyMembers}
                          facultyLead={groupFacultyLeads[groupName] ?? ""}
                          onFacultyLeadChange={onGroupFacultyLeadChange}
                          draggedStudent={draggedStudent}
                          dragOverGroup={dragOverGroup}
                          onDragStart={onDragStart}
                          onDragEnd={onDragEnd}
                          onDragOver={onDragOver}
                          onDragLeave={onDragLeave}
                          onDrop={onDrop}
                          onRenameGroup={onRenameGroup}
                          onDeleteGroup={onDeleteGroup}
                          availableSections={availableSections}
                          onMoveGroup={onMoveGroup}
                        />
                      ))}
                  </div>
                )}
              </div>

              <div
                onDragOver={(e) => onDragOver(e, section.name, "__unassigned__")}
                onDragLeave={onDragLeave}
                onDrop={(e) => onDrop(e, "__unassigned__", section.name)}
                className={`w-full lg:w-52 xl:w-56 flex-shrink-0 border-2 border-dashed rounded-lg p-3 transition-all ${isOverUnassigned
                  ? "border-blue-400 bg-blue-50"
                  : "border-slate-200 bg-slate-50/50"
                  }`}
              >
                <div className="flex items-center gap-1.5 mb-2">
                  <Users2 className="w-3.5 h-3.5 text-slate-400" />
                  <p className="text-xs font-semibold text-slate-500">Unassigned</p>
                  <Badge variant="secondary" className="text-xs ml-auto">{unassigned.length}</Badge>
                </div>
                <div className="space-y-1.5">
                  {unassigned.length === 0 && (
                    <p className="text-xs text-slate-400 italic text-center py-4">All assigned!</p>
                  )}
                  {[...unassigned]
                    .sort((a, b) => (a.full_name ?? "").localeCompare(b.full_name ?? ""))
                    .map(student => (
                      <StudentBlock
                        key={student.email}
                        student={student}
                        onDragStart={onDragStart}
                        onDragEnd={onDragEnd}
                        isDimmed={draggedStudent?.student.email === student.email}
                        fromGroup="__unassigned__"
                        fromSection={section.name}
                      />
                    ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}