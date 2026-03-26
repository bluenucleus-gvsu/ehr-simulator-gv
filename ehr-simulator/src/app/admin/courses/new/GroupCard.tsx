"use client"
import { useState } from "react"
import { Pencil, Check, Trash2, User, UserCog, X, ArrowUpDown } from "lucide-react"
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
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Student, FacultyMember } from "./types"
import StudentBlock from "./StudentBlock"

export type { Student, FacultyMember }

interface GroupCardProps {
  groupName: string
  students: Student[]
  sectionId: string
  facultyMembers: FacultyMember[]
  facultyLead: string
  onFacultyLeadChange: (sectionId: string, groupName: string, facultyId: string) => void
  draggedStudent: { student: Student; fromGroup: string; fromSection: string } | null
  dragOverGroup: string | null
  onDragStart: (e: React.DragEvent, student: Student, fromGroup: string, fromSection: string) => void
  onDragEnd: () => void
  onDragOver: (e: React.DragEvent, sectionId: string, groupName: string) => void
  onDragLeave: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent, toGroup: string, toSection: string) => void
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
  draggedStudent,
  dragOverGroup,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
  onRenameGroup,
  onDeleteGroup,
  availableSections = [],
  onMoveGroup,
}: GroupCardProps) => {
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState("")
  const [movePopoverOpen, setMovePopoverOpen] = useState(false)

  const dropKey = `${sectionId}::${groupName}`
  const isOver =
    dragOverGroup === dropKey &&
    draggedStudent?.fromSection === sectionId &&
    draggedStudent?.fromGroup !== groupName

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

  return (
    <div
      onDragOver={(e) => onDragOver(e, sectionId, groupName)}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, groupName, sectionId)}
      className={`bg-white border rounded-lg p-3 shadow-sm transition-all flex flex-col ${isOver
        ? "ring-2 ring-blue-400 bg-blue-50 shadow-md"
        : "border-slate-200 hover:shadow-md"
        }`}
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
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="ghost" className="cursor-pointer h-6 w-6 p-0 flex-shrink-0">
                  <Trash2 className="w-3 h-3 text-red-400" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Group {groupName}?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Students in this group will be moved to the unassigned pool.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDeleteGroup(sectionId, groupName)} className="bg-red-600">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
        <Badge variant="secondary" className="text-xs whitespace-nowrap flex-shrink-0">
          {students.length} <User />
        </Badge>
      </div>

      {/* Faculty Lead */}
      <div className="mb-2 pb-2 border-b border-slate-100">
        <p className="text-xs font-semibold text-slate-500 mb-1.5">Faculty Lead</p>
        <div className="flex items-center gap-1">
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
        {students.length === 0 && (
          <p className="text-xs text-slate-400 italic text-center py-3">Drop students here</p>
        )}
        {[...students]
          .sort((a, b) => (a.full_name ?? "").localeCompare(b.full_name ?? ""))
          .map((student) => (
            <StudentBlock
              key={student.email}
              student={student}
              draggable
              onDragStart={(e) => onDragStart(e, student, groupName, sectionId)}
              onDragEnd={onDragEnd}
              className={draggedStudent?.student.email === student.email ? "opacity-40" : ""}
              fromGroup={groupName}
              fromSection={sectionId}
            />
          ))}
      </div>
    </div>
  )
}