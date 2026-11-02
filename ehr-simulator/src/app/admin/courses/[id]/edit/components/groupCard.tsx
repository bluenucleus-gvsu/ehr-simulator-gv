"use client"
import { useState } from "react"
import { Pencil, Check, User, ArrowUpDown, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Student, GroupDraft } from "./courseForm"
import StudentBlock from "./studentBlock"
import UnassignDialog from "./unassignDialog"

interface GroupCardProps {
  group: GroupDraft
  sectionKey: string
  draggedStudent: { student: Student; fromGroupKey: string; fromSectionKey: string } | null
  dragOverGroup: string | null
  onDragStart: (e: React.DragEvent, student: Student, fromGroupKey: string, fromSectionKey: string) => void
  onDragEnd: () => void
  onDragOver: (e: React.DragEvent, sectionKey: string, groupKey: string) => void
  onDragLeave: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent, toGroupKey: string, toSectionKey: string) => void
  onRenameGroup: (sectionKey: string, groupKey: string, newName: string) => void
  onDeleteGroup: (sectionKey: string, groupKey: string) => void
  /** Other sections this group can be moved to */
  availableSections?: { id: string; label: string }[]
  /** Called when the user selects a target section */
  onMoveGroup?: (fromSectionKey: string, groupKey: string, toSectionKey: string) => void
}

export const GroupCard = ({
  group,
  sectionKey,
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

  const groupKey = group.key
  const students = group.members

  const dropKey = `${sectionKey}::${groupKey}`
  const isOver =
    dragOverGroup === dropKey &&
    !(draggedStudent?.fromSectionKey === sectionKey &&
      draggedStudent?.fromGroupKey === groupKey)

  const handleStartEdit = () => {
    setEditing(true)
    setEditValue(group.name)
  }

  const handleSaveEdit = () => {
    if (editValue.trim() && editValue.trim() !== group.name) {
      onRenameGroup(sectionKey, groupKey, editValue.trim())
    }
    setEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSaveEdit()
    if (e.key === "Escape") setEditing(false)
  }

  const handleMoveToSection = (toSectionKey: string) => {
    onMoveGroup?.(sectionKey, groupKey, toSectionKey)
    setMovePopoverOpen(false)
  }

  return (
    <div
      onDragOver={(e) => onDragOver(e, sectionKey, groupKey)}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, groupKey, sectionKey)}
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
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 shrink-0" onClick={handleSaveEdit}>
              <Check className="w-3.5 h-3.5 text-green-600" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-1 flex-1 min-w-0 overflow-hidden">
            <span className="font-semibold text-slate-800 text-sm truncate">{group.name}</span>

            {/* Rename */}
            <Button
              onClick={handleStartEdit}
              size="sm"
              variant="ghost"
              className="cursor-pointer h-6 w-6 p-0 shrink-0"
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
                    className="cursor-pointer h-6 w-6 p-0 shrink-0"
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
              title={`Delete Group ${group.name}?`}
              description="Its students will be moved to the unassigned pool. Any simulation history is preserved."
              confirmText="Delete"
              onConfirm={() => onDeleteGroup(sectionKey, groupKey)}
              trigger={
                <Button size="sm" variant="ghost" className="cursor-pointer h-6 w-6 p-0 shrink-0">
                  <Trash2 className="w-3 h-3 text-red-400" />
                </Button>
              }
            />
          </div>
        )}
        <Badge variant="secondary" className="text-xs whitespace-nowrap shrink-0">
          {students.length} <User />
        </Badge>
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
              key={student.id}
              student={student}
              draggable
              onDragStart={(e) => onDragStart(e, student, groupKey, sectionKey)}
              onDragEnd={onDragEnd}
              className={draggedStudent?.student.id === student.id ? "opacity-40" : ""}
              fromGroup={groupKey}
              fromSection={sectionKey}
            />
          ))}
      </div>
    </div>
  )
}
