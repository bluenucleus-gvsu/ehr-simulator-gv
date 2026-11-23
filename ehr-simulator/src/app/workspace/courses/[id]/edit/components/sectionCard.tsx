"use client"
import { useState } from "react"
import { ChevronDown, Pencil, Check, Plus, Trash2, UserX } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Student, SectionDraft } from "./courseForm"
import { GroupCard } from "./groupCard"
import UnassignDialog from "./unassignDialog"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

export function generateGroupNames(count: number): string[] {
  const names: string[] = []
  for (let i = 0; i < count; i++) {
    if (i < 26) names.push("Group " + String.fromCharCode(65 + i))
    else names.push("Group " + String.fromCharCode(65 + Math.floor(i / 26) - 1) + String.fromCharCode(65 + (i % 26)))
  }
  return names
}

interface SectionCardProps {
  section: SectionDraft
  unassigned: Student[]
  draggedStudent: { student: Student; fromGroupKey: string; fromSectionKey: string } | null
  dragOverGroup: string | null
  onUnassignAll: (sectionKey: string) => void
  onAddGroup: (sectionKey: string) => void
  onRenameSection: (sectionKey: string, newName: string) => void
  onRenameGroup: (sectionKey: string, groupKey: string, newName: string) => void
  onDeleteGroup: (sectionKey: string, groupKey: string) => void
  onDeleteSection?: (sectionKey: string) => void
  deleteSectionDescription?: string
  onDragStart: (e: React.DragEvent, student: Student, fromGroupKey?: string, fromSectionKey?: string) => void
  onDragEnd: () => void
  onDragOver: (e: React.DragEvent, sectionKey: string, groupKey: string) => void
  onDragLeave: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent, toGroupKey: string, toSectionKey: string) => void
  availableSections?: { id: string; label: string }[]
  onMoveGroup?: (fromSectionKey: string, groupKey: string, toSectionKey: string) => void
}

export const SectionCard = ({
  section,
  unassigned,
  draggedStudent,
  dragOverGroup,
  onUnassignAll,
  onAddGroup,
  onRenameSection,
  onRenameGroup,
  onDeleteGroup,
  onDeleteSection,
  deleteSectionDescription,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
  availableSections = [],
  onMoveGroup,
}: SectionCardProps) => {
  const totalAssigned = section.groups.reduce((s, g) => s + g.members.length, 0)
  const [editingName, setEditingName] = useState(false)
  const [nameValue, setNameValue] = useState("")

  const handleStartEditName = () => {
    setNameValue(section.name)
    setEditingName(true)
  }

  const handleSaveName = () => {
    if (nameValue.trim() && nameValue.trim() !== section.name) {
      onRenameSection(section.key, nameValue)
    }
    setEditingName(false)
  }

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSaveName()
    if (e.key === "Escape") setEditingName(false)
  }

  return (
    <Collapsible className="rounded-lg border bg-white border-slate-200 pt-0 pb-4">
      <div className="flex justify-between bg-slate-50 rounded-t-md transition-all">
        {editingName ? (
          <div className="cursor-pointer flex items-center gap-4 px-4 py-3 flex-1 min-w-0">
            <Input
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
              onKeyDown={handleNameKeyDown}
              onBlur={handleSaveName}
              autoFocus
              className="h-7 w-44 text-base font-bold min-w-0"
            />
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0 shrink-0"
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleSaveName}
            >
              <Check className="w-3.5 h-3.5 text-green-600" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center">
            <CollapsibleTrigger
              className="cursor-pointer flex items-center gap-4 px-4 py-3.5 flex-1 min-w-0"
            >
              <span className="text-base font-bold text-slate-800 shrink-0">
                {section.name}
              </span>
              <Badge className="bg-slate-200 text-xs text-slate-800 border shrink-0">
                {totalAssigned} assigned
              </Badge>
            </CollapsibleTrigger>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="cursor-pointer h-6 w-6 p-0 shrink-0"
              onClick={handleStartEditName}
              title="Rename section"
            >
              <Pencil className="w-3 h-3 text-slate-400" />
            </Button>
          </div>
        )}

        <div className="flex items-center gap-2">
          <UnassignDialog
            title={`Unassign all students in ${section.name}?`}
            confirmText="Unassign All"
            onConfirm={() => onUnassignAll(section.key)}
            trigger={
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="cursor-pointer gap-1.5 h-8 text-xs"
              >
                <UserX className="w-3.5 h-3.5" /> Remove Students
              </Button>
            }
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => onAddGroup(section.key)}
            className="cursor-pointer gap-1.5 h-8 text-xs bg-white"
          >
            <Plus className="w-3.5 h-3.5" /> Add Group
          </Button>
          {onDeleteSection && (
            <UnassignDialog
              title={`Delete ${section.name}?`}
              description={deleteSectionDescription ?? "Students will be moved to the unassigned pool."}
              confirmText="Delete Section"
              onConfirm={() => onDeleteSection(section.key)}
              trigger={
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="cursor-pointer gap-1.5 h-8 text-xs"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                </Button>
              }
            />
          )}
          <CollapsibleTrigger asChild>
            <button
              aria-label="Toggle section"
              className="group cursor-pointer p-2 focus:outline-none focus-visible:ring-2 rounded-sm"
            >
              <ChevronDown className="size-4 transition-transform text-slate-500 shrink-0 duration-200 group-data-[state=open]:rotate-180" />
            </button>
          </CollapsibleTrigger>
        </div>
      </div>

      <CollapsibleContent className="p-4 sm:p-5 pt-3 sm:pt-3 space-y-5">
        {(section.groups.length > 0 || unassigned.length > 0) && (
          <div className="flex flex-col gap-4">
            <div className="flex-1 min-w-0">
              {section.groups.length === 0 ? (
                <div className="flex items-center justify-center h-24 w-full border-2 border-dashed border-slate-200 rounded-lg">
                  <p className="text-sm text-slate-400 text-center px-4">Click &quot;Add Group&quot; to begin assigning students.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-3">
                  {[...section.groups]
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((group) => (
                      <GroupCard
                        key={group.key}
                        group={group}
                        sectionKey={section.key}
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
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  )
}
