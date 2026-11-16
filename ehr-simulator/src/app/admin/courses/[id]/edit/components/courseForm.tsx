"use client"
import {
  FolderPlus,
  PencilLine,
  ArrowRight,
  Layers,
  Plus,
  Loader2,
  Shuffle,
  RefreshCcw,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useState, useRef } from "react"
import { SectionCard, generateGroupNames } from "./sectionCard"

import { provisionStudents, getUsersByEmails } from "@/actions/users"
import { saveCourseEdits, CourseFull } from "@/actions/courses"
import type { CourseDraft } from "@/lib/courses/courseDiff"
import StudentBlock from "./studentBlock"
import AddStudent from "./addStudent"
import UnassignDialog from "./unassignDialog"
import CourseDetails from "./courseDetails"
import DeleteCourseButton from "./deleteCourseButton"
import ArchiveCourseButton from "./archiveCourseButton"
import { toast } from "sonner"
import type { Tables } from "@/../database.types";


export type Student = Pick<Tables<"users">, "id" | "email" | "full_name">;

export type GroupDraft = {
  key: string;
  id?: string;
  name: string;
  members: Student[];
};

export type SectionDraft = {
  key: string;
  id?: string;
  name: string;
  groups: GroupDraft[];
};

export type CourseFormMode = "create" | "edit";


const DEFAULT_GROUP_SIZE = 4

function makeSectionName(index: number): string {
  return `Section ${String(index + 1).padStart(2, "0")}`
}

function dedupeByEmail(students: Student[]): Student[] {
  const seen = new Set<string>()
  return students.filter((s) => {
    if (!s.email || seen.has(s.email)) return false
    seen.add(s.email)
    return true
  })
}

interface CourseFormProps {
  mode: CourseFormMode
  courseId?: string
  initialCourse?: CourseFull
  isAdmin?: boolean
  isArchived?: boolean
}

export default function CourseForm({ mode, courseId, initialCourse, isAdmin = false, isArchived = false }: CourseFormProps) {
  const router = useRouter()
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const [allStudents, setAllStudents] = useState<Student[]>(() =>
    initialCourse
      ? dedupeByEmail(
        initialCourse.sections.flatMap((sec) =>
          sec.groups.flatMap((grp) =>
            grp.group_members
              .map((gm) => gm.student)
              .filter((s): s is Student => s !== null)
          )
        )
      )
      : []
  )
  const [unassignedStudents, setUnassignedStudents] = useState<Student[]>([])

  const [courseName, setCourseName] = useState(initialCourse?.name ?? "")
  const [courseCode, setCourseCode] = useState(initialCourse?.code ?? "")
  const [semester, setSemester] = useState(initialCourse?.semester ?? "")
  const [courseStartDate, setCourseStartDate] = useState<string | null>(initialCourse?.start_date ?? null)
  const [courseEndDate, setCourseEndDate] = useState<string | null>(initialCourse?.end_date ?? null)

  const [sections, setSections] = useState<SectionDraft[]>(() =>
    initialCourse
      ? initialCourse.sections.map((sec, i) => ({
        key: sec.id ?? `section-${i}`,
        id: sec.id,
        name: sec.name,
        groups: sec.groups.map((grp) => ({
          key: grp.id ?? `group-${i}-${grp.name}`,
          id: grp.id,
          name: grp.name,
          members: grp.group_members
            .map((gm) => gm.student)
            .filter((s): s is Student => s !== null),
        })),
      }))
      : [{ key: "section-0", name: makeSectionName(0), groups: [] }]
  )
  const [groupSize, setGroupSize] = useState(DEFAULT_GROUP_SIZE)
  const [isPending, setIsPending] = useState(false)
  const [draggedStudent, setDraggedStudent] = useState<{ student: Student, fromGroupKey: string, fromSectionKey: string } | null>(null)
  const [dragOverGroup, setDragOverGroup] = useState<string | null>(null)

  const buildPayload = (emailToUserId: Record<string, string>): CourseDraft => ({
    name: courseName.trim(),
    code: courseCode.trim(),
    semester,
    start_date: courseStartDate,
    end_date: courseEndDate,
    sections: sections.map((sec) => ({
      id: sec.id ?? null,
      name: sec.name.trim(),
      groups: sec.groups.map((grp) => ({
        id: grp.id ?? null,
        name: grp.name.trim(),
        member_ids: grp.members
          .map((m) => (m.email ? emailToUserId[m.email] : undefined))
          .filter((id): id is string => id != null),
      })),
    })),
  })

  const handleSubmit = async () => {
    if (isPending) return

    if (!courseName.trim() || !courseCode.trim()) {
      toast.error("Course name and code are required.")
      return
    }
    if (!semester) {
      toast.error("A semester is required.")
      return
    }
    if (unassignedStudents.length > 0) {
      toast.error("All students must be assigned to a group.")
      return
    }

    setIsPending(true)
    try {
      // Provision new students first, then resolve user ids by email.
      if (allStudents.length > 0) {
        await provisionStudents(allStudents)
      }
      const provisionedUsers = await getUsersByEmails(
        allStudents.map((s) => s.email).filter((email): email is string => email != null && email !== "")
      )
      const emailToUserId = Object.fromEntries(
        provisionedUsers.map((u) => [u.email, u.id])
      )
      const missing = allStudents.filter((s) => !s.email || !emailToUserId[s.email])
      if (missing.length > 0) {
        throw new Error(`No user record could be provisioned for: ${missing.map((m) => m.email).join(", ")}`)
      }

      const payload = buildPayload(emailToUserId)
      if (mode === "create") {
        const save = await saveCourseEdits(null, payload)
        if (!save.success) throw new Error(save.message)
        toast.success("Course created successfully.")
        router.push(`/admin/courses/${save.data}/assign-cases`)
      } else {
        if (!courseId) throw new Error("Missing course id.")
        const save = await saveCourseEdits(courseId, payload)
        if (!save.success) throw new Error(save.message)
        toast.success("Course saved successfully.")
        router.push(`/admin/courses/${courseId}/assign-cases`)
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save the course.")
      setIsPending(false)
    }
  }

  const handleImportStudents = (students: Student[]) => {
    const assignedEmails = new Set(
      sections.flatMap((sec) => sec.groups.flatMap((grp) => grp.members.map((m) => m.email)))
    )
    setAllStudents((prev) => dedupeByEmail([...prev, ...students]))
    setUnassignedStudents((prev) => {
      const seen = new Set(prev.map((s) => s.email))
      return [...prev, ...students.filter((s) => s.email && !seen.has(s.email) && !assignedEmails.has(s.email))]
    })
  }

  const handleAddStudent = (newStudent: Student) => {
    if (allStudents.some((s) => s.email === newStudent.email)) {
      toast.error("That student is already in the roster.")
      return
    }
    setAllStudents((prev) => [...prev, newStudent])
    setUnassignedStudents((prev) => [...prev, newStudent])
    toast.success("Added student to unassigned pool.")
  }

  const handleClear = () => {
    setAllStudents([])
    setUnassignedStudents([])
    setSections((prev) => prev.map((sec) => ({ ...sec, groups: [] })))
  }

  const normalizeName = (name: string) => name.trim().toLowerCase()

  const handleRenameSection = (sectionKey: string, newName: string) => {
    const clean = newName.trim()
    if (!clean) return
    if (sections.some((s) => s.key !== sectionKey && normalizeName(s.name) === normalizeName(clean))) {
      toast.error(`A section named "${clean}" already exists.`)
      return
    }
    setSections((prev) =>
      prev.map((sec) => (sec.key === sectionKey ? { ...sec, name: clean } : sec))
    )
  }

  const handleAddSection = () => {
    setSections((prev) => {
      const existing = new Set(prev.map((s) => normalizeName(s.name)))
      let index = prev.length
      let name = makeSectionName(index)
      while (existing.has(normalizeName(name))) {
        index += 1
        name = makeSectionName(index)
      }
      return [...prev, { key: crypto.randomUUID(), name, groups: [] }]
    })
  }

  const handleDeleteSection = (sectionKey: string) => {
    const removed = sections.find((s) => s.key === sectionKey)
    if (!removed) return
    const orphaned = removed.groups.flatMap((g) => g.members)
    if (orphaned.length > 0) {
      setUnassignedStudents((prev) => [...prev, ...orphaned])
    }
    setSections((prev) => prev.filter((s) => s.key !== sectionKey))
  }

  const handleRandomAssign = () => {
    if (allStudents.length === 0) return

    const shuffled = [...allStudents].sort(() => Math.random() - 0.5)
    const sectionCount = Math.max(1, sections.length)

    setSections((prev) =>
      prev.map((sec, secIdx) => {
        const assigned = shuffled.filter((_, i) => i % sectionCount === secIdx)
        if (assigned.length === 0) return { ...sec, groups: [] }

        const currentGroupSize = Math.max(1, groupSize)
        const numGroups = Math.max(1, Math.ceil(assigned.length / currentGroupSize))
        const names = generateGroupNames(numGroups)
        const groups: GroupDraft[] = names.map((name, gi) => ({
          key: crypto.randomUUID(),
          name,
          members: assigned.filter((_, si) => si % numGroups === gi),
        }))
        return { ...sec, groups }
      })
    )
    setUnassignedStudents([])
  }

  const handleUnassignAll = (sectionKey: string) => {
    const sec = sections.find((s) => s.key === sectionKey)
    if (!sec) return
    setUnassignedStudents((current) => [...current, ...sec.groups.flatMap((g) => g.members)])
    setSections((prev) => prev.map((s) => (s.key === sectionKey ? { ...s, groups: [] } : s)))
  }

  const handleReset = () => {
    setUnassignedStudents([...allStudents])
    setSections((prev) => prev.map((sec) => ({ ...sec, groups: [] })))
  }

  const handleAddGroup = (sectionKey: string) => {
    setSections((prev) =>
      prev.map((sec) => {
        if (sec.key !== sectionKey) return sec
        const existingNames = new Set(sec.groups.map((g) => g.name))
        let name = ""
        for (let i = 0; i < 702; i++) {
          const candidate = generateGroupNames(i + 1)[i]
          if (!existingNames.has(candidate)) {
            name = candidate
            break
          }
        }
        return { ...sec, groups: [...sec.groups, { key: crypto.randomUUID(), name, members: [] }] }
      })
    )
  }

  const handleRenameGroup = (sectionKey: string, groupKey: string, newName: string) => {
    const clean = newName.trim()
    if (!clean) return
    const sec = sections.find((s) => s.key === sectionKey)
    if (sec?.groups.some((g) => g.key !== groupKey && normalizeName(g.name) === normalizeName(clean))) {
      toast.error(`A group named "${clean}" already exists in this section.`)
      return
    }
    setSections((prev) =>
      prev.map((sec) => {
        if (sec.key !== sectionKey) return sec
        return {
          ...sec,
          groups: sec.groups.map((g) => (g.key === groupKey ? { ...g, name: newName } : g)),
        }
      })
    )
  }

  const handleDeleteGroup = (sectionKey: string, groupKey: string) => {
    const grp = sections.find((s) => s.key === sectionKey)?.groups.find((g) => g.key === groupKey)
    if (!grp) return
    setUnassignedStudents((current) => [...current, ...grp.members])
    setSections((prev) =>
      prev.map((sec) =>
        sec.key === sectionKey
          ? { ...sec, groups: sec.groups.filter((g) => g.key !== groupKey) }
          : sec
      )
    )
  }

  const handleMoveGroup = (fromSectionKey: string, groupKey: string, toSectionKey: string) => {
    if (fromSectionKey === toSectionKey) return
    const to = sections.find((s) => s.key === toSectionKey)
    const moving = sections.find((s) => s.key === fromSectionKey)?.groups.find((g) => g.key === groupKey)
    if (!to || !moving) return

    if (to.groups.some((g) => g.name === moving.name)) {
      toast.error(`${to.name} already has a group named "${moving.name}". Rename one of them, then move.`)
      return
    }

    setSections((prev) =>
      prev.map((sec) => {
        if (sec.key === fromSectionKey) return { ...sec, groups: sec.groups.filter((g) => g.key !== groupKey) }
        if (sec.key === toSectionKey) return { ...sec, groups: [...sec.groups, moving] }
        return sec
      })
    )
  }

  const handleDragStart = (e: React.DragEvent, student: Student, fromGroupKey?: string, fromSectionKey?: string) => {
    if (fromGroupKey && fromSectionKey) {
      setDraggedStudent({ student, fromGroupKey, fromSectionKey })
      e.dataTransfer.effectAllowed = "move"
    }
  }

  const handleDragEnd = () => {
    setDraggedStudent(null)
    setDragOverGroup(null)
  }

  const handleDragOver = (e: React.DragEvent, sectionKey: string, groupKey: string) => {
    e.preventDefault()
    setDragOverGroup(`${sectionKey}::${groupKey}`)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverGroup(null)
    }
  }

  const handleDrop = (e: React.DragEvent, toGroupKey: string, toSectionKey: string) => {
    e.preventDefault()
    if (!draggedStudent) return

    const { student, fromGroupKey, fromSectionKey } = draggedStudent

    if (fromGroupKey === toGroupKey && fromSectionKey === toSectionKey) {
      setDraggedStudent(null)
      setDragOverGroup(null)
      return
    }

    const isComingFromUnassigned = fromGroupKey === "__unassigned__"
    const isGoingToUnassigned = toGroupKey === "__unassigned__"

    if (!isComingFromUnassigned || !isGoingToUnassigned) {
      setSections((prev) =>
        prev.map((sec) => {
          if (sec.key !== fromSectionKey && sec.key !== toSectionKey) return sec
          return {
            ...sec,
            groups: sec.groups.map((g) => {
              if (g.key === fromGroupKey)
                return { ...g, members: g.members.filter((m) => m.id !== student.id) }
              if (g.key === toGroupKey)
                return { ...g, members: [...g.members, student] }
              return g
            }),
          }
        })
      )
    }
    if (isComingFromUnassigned) {
      setUnassignedStudents((prev) => prev.filter((s) => s.id !== student.id))
    }
    if (isGoingToUnassigned) {
      setUnassignedStudents((prev) =>
        prev.some((s) => s.id === student.id) ? prev : [...prev, student]
      )
    }

    setDraggedStudent(null)
    setDragOverGroup(null)
  }

  const handleContainerDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    const container = scrollContainerRef.current
    if (!container) return

    const scrollThreshold = 50 // pixels from the edge to trigger scroll
    const scrollSpeed = 10 // pixels to scroll per frame

    const rect = container.getBoundingClientRect()
    const mouseY = e.clientY

    if (rect.bottom - mouseY < scrollThreshold) {
      container.scrollTop += scrollSpeed
    } else if (mouseY - rect.top < scrollThreshold) {
      container.scrollTop -= scrollSpeed
    }
  }

  const isEdit = mode === "edit"

  return (
    <div className="flex flex-col w-full min-h-screen bg-slate-50/50">
      {isPending && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/70 backdrop-blur-sm">
          <Loader2 className="size-10 animate-spin text-slate-700 mb-3" />
          <p className="text-slate-700 font-medium">{isEdit ? "Saving changes..." : "Creating course..."}</p>
          <p className="text-slate-700 font-medium">This may take a few moments</p>
        </div>
      )}
      <header className="sticky top-0 flex items-center justify-between px-4 sm:px-8 py-3 bg-white border-b z-10 shadow gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            {isEdit ? <PencilLine className="text-slate-400" /> : <FolderPlus className="text-slate-400" />}
            {isEdit ? `Edit Course${courseCode ? ` — ${courseCode}` : ""}` : "Create a Course"}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isEdit ? "Update course, section, and group details" : "Define course and section details"}
          </p>
        </div>
        <div className="flex gap-8 shrink-0">
          <div className="flex gap-2">
            {isAdmin && isEdit && courseId && !isArchived && (
              <ArchiveCourseButton courseId={courseId} courseCode={courseCode} />
            )}
            {isAdmin && isEdit && courseId && (
              <DeleteCourseButton courseId={courseId} courseCode={courseCode} />
            )}
          </div>
          <div className="flex gap-2">

            <Button
              className="cursor-pointer"
              variant="secondary"
              onClick={() => router.push(isEdit && courseId ? `/admin/courses/${courseId}/assign-cases` : "/admin/courses")}
            >
              Cancel
            </Button>

            <Button className="cursor-pointer" onClick={handleSubmit} disabled={isPending}>
              {isPending ? (
                <><Loader2 className="animate-spin" /> Saving...</>
              ) : (
                <>{isEdit ? "Save Changes" : "Submit Course"} <ArrowRight /></>
              )}
            </Button>
          </div>
        </div>
      </header >

      <div className="flex-1 p-4 sm:p-6 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto space-y-6">

          <AddStudent
            onAddStudent={handleAddStudent}
            onImportStudents={handleImportStudents}
            onClearStudents={handleClear}
            clearConfirm={isEdit
              ? {
                title: "Clear all students?",
                description: "This removes every student from every group in this course. Previous simulation sessions are preserved, but the course roster will be empty until students are re-added.",
                confirmText: "Clear All",
              }
              : undefined}
          />

          <CourseDetails
            courseName={courseName}
            setCourseName={setCourseName}
            courseCode={courseCode}
            setCourseCode={setCourseCode}
            semester={semester}
            setSemester={setSemester}
            courseStartDate={courseStartDate}
            setCourseStartDate={setCourseStartDate}
            courseEndDate={courseEndDate}
            setCourseEndDate={setCourseEndDate}
          />

          <Card className="py-4">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 pb-2">
                <Layers className="size-5 text-blue-600" /> Sections
                <Badge variant="secondary" className="text-xs">
                  {sections.length} {sections.length === 1 ? "section" : "sections"}
                </Badge>
              </CardTitle>
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleAddSection}
                  className="cursor-pointer gap-1.5 h-8 text-xs"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Section
                </Button>
                <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-2 py-1 bg-white">
                  <span className="text-xs font-medium text-slate-500">Group size</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setGroupSize(Math.max(1, groupSize - 1))}
                      className="h-7 w-7 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer font-medium text-sm rounded"
                    >-
                    </button>
                    <span className="w-8 text-center text-sm font-semibold text-slate-800">{groupSize}</span>
                    <button
                      type="button"
                      onClick={() => setGroupSize(Math.min(20, groupSize + 1))}
                      className="h-7 w-7 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer font-medium text-sm rounded"
                    >+
                    </button>
                  </div>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleRandomAssign}
                  className="cursor-pointer gap-1.5 h-8 text-xs"
                >
                  <Shuffle className="w-3.5 h-3.5" /> Randomly Assign
                </Button>
                <UnassignDialog
                  title="Reset all sections?"
                  description="All students across every section will be returned to the unassigned pool."
                  confirmText="Reset All"
                  onConfirm={handleReset}
                  trigger={
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="cursor-pointer gap-1.5 h-8 text-xs"
                    >
                      <RefreshCcw className="w-3.5 h-3.5" /> Reset
                    </Button>
                  }
                />
              </div>
            </CardHeader>
          </Card>

          <div
            ref={scrollContainerRef}
            onDragOver={handleContainerDragOver}
            className="w-full lg:flex-1 pb-4 space-y-4"
          >
            {/* Unassigned Students */}
            <div className="w-full"
              onDragOver={(e) => { e.preventDefault() }}
              onDrop={(e) => handleDrop(e, "__unassigned__", "__global__")}>
              <div className="border-2 border-dashed rounded-lg p-3 bg-slate-50/80 shadow-sm border-slate-200">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">Unassigned Students</p>
                    <p className="text-xs text-slate-500">Drag into any section group</p>
                  </div>
                  <span className="text-xs font-semibold text-slate-700 bg-slate-200 px-2 py-1 rounded">
                    {unassignedStudents.length}
                  </span>
                </div>


                {unassignedStudents.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-4">All assigned!</p>
                ) : (
                  <div className="grid grid-cols-3 gap-2 max-h-[calc(100vh-24rem)] overflow-y-auto pb-4">
                    {[...unassignedStudents]
                      .sort((a, b) => (a.full_name ?? "").localeCompare(b.full_name ?? ""))
                      .map((student) => (
                        <StudentBlock
                          key={student.id}
                          student={student}
                          onDragStart={handleDragStart}
                          onDragEnd={handleDragEnd}
                          isDimmed={draggedStudent?.student.id === student.id}
                          fromGroup="__unassigned__"
                          fromSection="__global__"
                        />
                      ))}
                  </div>
                )}
              </div>
            </div>
            {sections.map((section) => (
              <SectionCard
                key={section.key}
                section={section}
                unassigned={unassignedStudents}
                draggedStudent={draggedStudent}
                dragOverGroup={dragOverGroup}
                onUnassignAll={handleUnassignAll}
                onAddGroup={handleAddGroup}
                onRenameSection={handleRenameSection}
                onRenameGroup={handleRenameGroup}
                onDeleteGroup={handleDeleteGroup}
                onDeleteSection={handleDeleteSection}
                deleteSectionDescription={isEdit
                  ? "Students will return to the unassigned pool. On save, the section and its groups are archived; all session data of students is preserved."
                  : undefined}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                availableSections={sections
                  .filter((s) => s.key !== section.key)
                  .map((s) => ({ id: s.key, label: s.name }))}
                onMoveGroup={handleMoveGroup}
              />
            ))}
          </div>
        </div>
      </div>
    </div >
  )
}
