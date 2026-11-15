"use client"
import { useMemo, useState } from "react"
import { Pencil, Check, User, UserCog, X, ArrowUpDown, Trash2, UserMinus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Student, FacultyMember } from "../types"
import StudentBlock from "./StudentBlock"
import UnassignDialog from "./UnassignDialog"

export type { Student, FacultyMember }

interface GroupCardProps {
  groupName: string
  students: Student[]
  sectionId: string
  facultyMembers: FacultyMember[]
  facultyLead: string
  onFacultyLeadChange: (sectionId: string, groupName: string, facultyId: string) => void
  availableStudents: Student[]
  onAssignStudent: (sectionId: string, groupName: string, student: Student) => void
  onUnassignStudent: (sectionId: string, groupName: string, student: Student) => void
  onRenameGroup: (sectionId: string, oldName: string, newName: string) => void
  onDeleteGroup: (sectionId: string, groupName: string) => void
  /** Other sections this group can be moved to */
  availableSections?: { id: string; label: string }[]
  /** Called when the user selects a target section */
  onMoveGroup?: (fromSectionId: string, groupName: string, toSectionId: string) => void
}

export const GroupCard = ({
  groupName,
  students,
  sectionId,
  facultyMembers,
  facultyLead,
  onFacultyLeadChange,
  availableStudents,
  onAssignStudent,
  onUnassignStudent,
  onRenameGroup,
  onDeleteGroup,
  availableSections = [],
  onMoveGroup,
}: GroupCardProps) => {
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState("")
  const [movePopoverOpen, setMovePopoverOpen] = useState(false)
  const [studentSearch, setStudentSearch] = useState("")
  const matchingStudents = useMemo(() => {
    const query = studentSearch.trim().toLocaleLowerCase()
    if (!query) return []
    return availableStudents
      .filter(student =>
        `${student.full_name ?? ""} ${student.email ?? ""}`.toLocaleLowerCase().includes(query)
      )
      .slice(0, 8)
  }, [availableStudents, studentSearch])

  const handleStartEdit = () => {
    setEditing(true)
    setEditValue(groupName)
  }

  const handleSaveEdit = () => {
    if (editValue.trim() && editValue.trim() !== groupName) {
      onRenameGroup(sectionId, groupName, editValue.trim())
    }
    setEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSaveEdit()
    if (e.key === "Escape") setEditing(false)
  }

  const handleMoveToSection = (toSectionId: string) => {
    onMoveGroup?.(sectionId, groupName, toSectionId)
    setMovePopoverOpen(false)
  }

  const handleAssignStudent = (student: Student) => {
    onAssignStudent(sectionId, groupName, student)
    setStudentSearch("")
  }

  const handleStudentSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && matchingStudents[0]) {
      event.preventDefault()
      handleAssignStudent(matchingStudents[0])
      return
    }

    if (event.key === "Tab") {
      const searchFields = Array.from(
        document.querySelectorAll<HTMLInputElement>("[data-group-student-search]")
      )
      const currentIndex = searchFields.indexOf(event.currentTarget)
      const nextIndex = currentIndex + (event.shiftKey ? -1 : 1)
      if (searchFields[nextIndex]) {
        event.preventDefault()
        searchFields[nextIndex].focus()
      }
    }
  }

  return (
    <div
      className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm transition-all flex flex-col hover:shadow-md"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-100 min-w-0">
        {editing ? (
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <Input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleSaveEdit}
              autoFocus
              className="h-7 text-sm font-semibold min-w-0"
            />
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 flex-shrink-0" onClick={handleSaveEdit}>
              <Check className="w-3.5 h-3.5 text-green-600" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-1 flex-1 min-w-0 overflow-hidden">
            <span className="font-semibold text-slate-800 text-sm truncate">{groupName}</span>

            {/* Rename */}
            <Button
              onClick={handleStartEdit}
              size="sm"
              variant="ghost"
              className="cursor-pointer h-6 w-6 p-0 flex-shrink-0"
            >
              <Pencil className="w-3 h-3 text-slate-400" />
            </Button>

            {/* Move to section */}
            {availableSections.length > 0 && onMoveGroup && (
              <Popover open={movePopoverOpen} onOpenChange={setMovePopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="cursor-pointer h-6 w-6 p-0 flex-shrink-0"
                    title="Move to another section"
                  >
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" sideOffset={4} className="w-44 p-1.5">
                  <p className="text-xs font-semibold text-slate-500 px-2 py-1">Move to…</p>
                  <div className="flex flex-col gap-0.5">
                    {availableSections.map((section) => (
                      <button
                        key={section.id}
                        type="button"
                        onClick={() => handleMoveToSection(section.id)}
                        className="w-full text-left text-xs px-2 py-1.5 rounded hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
                      >
                        {section.label}
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            )}

            {/* Delete */}
            <UnassignDialog
              title={`Delete Group ${groupName}?`}
              confirmText="Delete"
              onConfirm={() => onDeleteGroup(sectionId, groupName)}
              trigger={
                <Button size="sm" variant="ghost" className="cursor-pointer h-6 w-6 p-0 flex-shrink-0">
                    <Trash2 className="w-3 h-3 text-red-400" />
                </Button>
              }
            />
          </div>
        )}
        <Badge variant="secondary" className="text-xs whitespace-nowrap flex-shrink-0">
          {students.length} <User />
        </Badge>
      </div>

      {/* Faculty Lead */}
      <div className="mb-2 pb-2 border-b border-slate-100">
        <p className="text-xs font-semibold text-slate-500 mb-1.5">Faculty Lead</p>
        <div className="flex items-left gap-1">
          <Select
            value={facultyLead}
            onValueChange={(value) => onFacultyLeadChange(sectionId, groupName, value)}
          >
            <SelectTrigger className="h-7 text-xs flex-1 cursor-pointer text-slate-500 gap-1.5 justify-start [&>span]:flex-1 [&>span]:text-left">
              <UserCog className="w-3 h-3 flex-shrink-0" />
              <SelectValue placeholder="Assign faculty..." />
            </SelectTrigger>
            <SelectContent>
              {facultyMembers.map((member) => (
                <SelectItem key={member.id} value={member.id} className="text-xs cursor-pointer">
                  <div className="flex flex-col">
                    <span className="font-medium">{member.full_name ?? ""}</span>
                    <span className="text-slate-400">{member.email ?? ""}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {facultyLead && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0 flex-shrink-0 cursor-pointer"
              onClick={() => onFacultyLeadChange(sectionId, groupName, "")}
            >
              <X className="w-3 h-3 text-slate-400" />
            </Button>
          )}
        </div>
      </div>

      {/* Students */}
      <div className="space-y-1.5 flex-1">
        <Input
          value={studentSearch}
          onChange={event => setStudentSearch(event.target.value)}
          onKeyDown={handleStudentSearchKeyDown}
          data-group-student-search
          placeholder="Search unassigned students..."
          aria-label={`Search students to add to ${groupName}`}
          className="h-8 text-xs"
        />
        {studentSearch.trim() && (
          <div className="max-h-40 overflow-y-auto rounded border border-slate-200">
            {matchingStudents.length === 0 ? (
              <p className="px-3 py-2 text-xs text-slate-400">No matching unassigned students.</p>
            ) : (
              matchingStudents.map((student, index) => (
                <button
                  key={student.email ?? `${student.full_name ?? "student"}-${index}`}
                  type="button"
                  onClick={() => handleAssignStudent(student)}
                  className="block w-full border-b border-slate-100 px-3 py-2 text-left last:border-0 hover:bg-slate-50"
                >
                  <span className="block truncate text-xs font-medium text-slate-800">
                    {student.full_name ?? "Unknown"}
                  </span>
                  <span className="block truncate text-[11px] text-slate-500">
                    {student.email ?? ""}
                  </span>
                </button>
              ))
            )}
          </div>
        )}
        {students.length === 0 && !studentSearch.trim() && (
          <p className="text-xs text-slate-400 italic text-center py-3">No students assigned.</p>
        )}
        {[...students]
          .sort((a, b) => (a.full_name ?? "").localeCompare(b.full_name ?? ""))
          .map((student) => (
            <div key={student.email ?? student.full_name} className="flex items-center gap-1">
              <StudentBlock student={student} className="min-w-0 flex-1" />
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-8 w-8 flex-shrink-0 p-0 text-slate-500 hover:text-red-600"
                aria-label={`Unassign ${student.full_name ?? student.email ?? "student"} from ${groupName}`}
                title="Unassign student"
                onClick={() => onUnassignStudent(sectionId, groupName, student)}
              >
                <UserMinus className="h-4 w-4" />
              </Button>
            </div>
          ))}
      </div>
    </div>
  )
}