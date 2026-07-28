"use client"
import {
  FolderPlus,
  ArrowLeft,
  ArrowRight,
  Layers,
  Plus,
  Minus,
  Loader2,
  Shuffle,
  RefreshCcw,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useState, useRef, useEffect } from "react"
import { Student, FacultyMember, SectionData } from "./types"
import { SectionCard, SectionGroups, generateGroupNames } from "./components/SectionCard"

import { getAllFacultyUsers, getAllAdminUsers, provisionStudents, getUsersByEmails } from "@/actions/users"
import { createCourse, createSection, createGroup, createGroupMembers } from "@/actions/courses"
import StudentBlock from "./components/StudentBlock"
import AddStudent from "./components/AddStudent"
import UnassignDialog from "./components/UnassignDialog"
import CourseDetails from "./components/CourseDetails"
interface SectionState {
  groups: SectionGroups
  unassigned: Student[]
  groupSize: number
  groupFacultyLeads: Record<string, string>
}

const DEFAULT_GROUP_SIZE = 4

/** "Section 01", "Section 02", etc. — single source of truth for section names */
function makeSectionName(index: number): string {
  return `Section ${String(index + 1).padStart(2, "0")}`
}

function makeSectionState(students: Student[] = []): SectionState {
  return { groups: {}, unassigned: students, groupSize: DEFAULT_GROUP_SIZE, groupFacultyLeads: {} }
}

function makeSection(index: number): SectionData {
  return {
    name: makeSectionName(index),
    start_date: null,
    end_date: null,
    meeting_time: null,
  }
}

export default function CreateCoursePage() {
  const router = useRouter()
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const [adminUsers, setAdminUsers] = useState<FacultyMember[]>([])
  const [facultyUsers, setFacultyUsers] = useState<FacultyMember[]>([])

  useEffect(() => {
    getAllAdminUsers().then(setAdminUsers)
    getAllFacultyUsers().then(setFacultyUsers)
  }, [])

  const [allStudents, setAllStudents] = useState<Student[]>([])

  const [courseName, setCourseName] = useState("")
  const [courseCode, setCourseCode] = useState("")
  const [semester, setSemester] = useState("")

  const [sections, setSections] = useState<SectionData[]>([makeSection(0)])
  const [sectionStates, setSectionStates] = useState<Record<string, SectionState>>({
    [makeSectionName(0)]: makeSectionState(),
  })
  const [globalGroupSize, setGlobalGroupSize] = useState(DEFAULT_GROUP_SIZE)

  const [isPending, setIsPending] = useState(false)
  const [triggerSubmit, setTriggerSubmit] = useState(false)

  const [draggedStudent, setDraggedStudent] = useState<{
    student: Student
    fromGroup: string
    fromSection: string
  } | null>(null)
  const [dragOverGroup, setDragOverGroup] = useState<string | null>(null)

  // Runs after React commits the loading UI to the DOM
  useEffect(() => {
    if (!triggerSubmit) return
    setTriggerSubmit(false)

    const run = async () => {
      try {
        if (allStudents.length > 0) {
          await provisionStudents(allStudents)
        }

        const provisionedUsers = await getUsersByEmails(allStudents.map(s => s.email).filter((email): email is string => email != null))
        const emailToUserId = Object.fromEntries(
          provisionedUsers.map(u => [u.email, u.id])
        )

        const courseResponse = await createCourse({ active: true, code: courseCode, name: courseName })
        if (!courseResponse.success || !courseResponse.data) return
        const courseId = courseResponse.data.id

        const sectionResults = await Promise.all(
          sections.map((section) =>
            createSection({
              course_id: courseId,
              name: section.name,
              start_date: section.start_date,
              end_date: section.end_date,
              meeting_time: section.meeting_time,
              semester: semester,
            })
          )
        )

        for (let i = 0; i < sections.length; i++) {
          const sectionResult = sectionResults[i]
          if (!sectionResult.success || !sectionResult.data) continue

          const sectionId = sectionResult.data.id
          const sectionName = sections[i].name
          const groups = sectionStates[sectionName]?.groups ?? {}

          await Promise.all(
            Object.entries(groups).map(async ([groupName, students]) => {
              const groupResponse = await createGroup({ name: groupName, section_id: sectionId })
              if (!groupResponse.success || !groupResponse.data) return

              const groupId = groupResponse.data.id

              await Promise.all(
                students
                  .filter((student): student is Student & { email: string } => student.email != null)
                  .map((student) => {
                    const studentId = emailToUserId[student.email]
                    if (!studentId) {
                      console.error("No user ID found for student:", student.email)
                      return
                    }
                    return createGroupMembers({ group_id: groupId, student_id: studentId, active: true })
                  })
              )
            })
          )
        }

        router.push("/admin/courses")
      } finally {
        setIsPending(false)
      }
    }

    run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerSubmit])

  const handleSubmit = () => {
    setIsPending(true)
    setTriggerSubmit(true)
  }

  const handleImportStudents = (students: Student[]) => {
    setAllStudents(students)
    setSectionStates(prev => {
      const next = { ...prev }
      Object.keys(next).forEach((name, i) => {
        next[name] = { ...next[name], unassigned: i === 0 ? students : [], groups: {} }
      })
      return next
    })
  }

  const handleAddStudent = (newStudent: Student) => {
    setAllStudents((prev) => [...prev, newStudent]);

    setSectionStates((prev) => {
      const firstSectionName = sections[0]?.name || makeSectionName(0);
      const firstSectionState = prev[firstSectionName] || makeSectionState();

      return {
        ...prev,
        [firstSectionName]: {
          ...firstSectionState,
          unassigned: [...firstSectionState.unassigned, newStudent],
        },
      };
    });
  };

  const handleClear = () => {
    setAllStudents([])
    setSectionStates(prev => {
      const next = { ...prev }
      Object.keys(next).forEach(name => { next[name] = makeSectionState() })
      return next
    })
  }

  const handleAddSection = () => {
    const newIndex = sections.length
    const newName = makeSectionName(newIndex)
    setSections(prev => [...prev, makeSection(newIndex)])
    setSectionStates(prev => ({ ...prev, [newName]: makeSectionState() }))
  }

  const handleRemoveSection = () => {
    if (sections.length <= 1) return
    const removedName = sections[sections.length - 1].name
    setSections(prev => prev.slice(0, -1))
    setSectionStates(prev => {
      const removed = prev[removedName]
      const orphans: Student[] = [
        ...removed.unassigned,
        ...Object.values(removed.groups).flat(),
      ]
      const next = { ...prev }
      delete next[removedName]
      if (orphans.length > 0) {
        const firstName = sections[0].name
        next[firstName] = {
          ...next[firstName],
          unassigned: [...next[firstName].unassigned, ...orphans],
        }
      }
      return next
    })
  }

  const handleSectionDataChange = (name: string, field: keyof SectionData, value: string | null) => {
    setSections(prev => prev.map(s => s.name === name ? { ...s, [field]: value } : s))
  }

  const handleRandomAssign = () => {
    setSectionStates(prev => {
      const sectionNames = sections.map((section) => section.name)
      const allStudents: Student[] = sectionNames.flatMap((sectionName) => {
        const state = prev[sectionName]
        return [...state.unassigned, ...Object.values(state.groups).flat()]
      })

      if (allStudents.length === 0) return prev

      const shuffled = [...allStudents].sort(() => Math.random() - 0.5)
      const sectionAssignments: Record<string, Student[]> = Object.fromEntries(
        sectionNames.map((sectionName) => [sectionName, [] as Student[]])
      )

      shuffled.forEach((student, index) => {
        const targetSection = sectionNames[index % sectionNames.length]
        sectionAssignments[targetSection].push(student)
      })

      const nextStates = Object.fromEntries(
        sectionNames.map((sectionName) => {
          const state = prev[sectionName]
          const assignedStudents = sectionAssignments[sectionName] ?? []

          if (assignedStudents.length === 0) {
            return [sectionName, { ...state, groups: {}, unassigned: [], groupFacultyLeads: {} }]
          }

          const groupSize = Math.max(1, globalGroupSize)
          const numGroups = Math.max(1, Math.ceil(assignedStudents.length / groupSize))
          const names = generateGroupNames(numGroups)
          const newGroups: SectionGroups = {}

          names.forEach((name) => {
            newGroups[name] = []
          })

          assignedStudents.forEach((student, i) => {
            newGroups[names[i % numGroups]].push(student)
          })

          return [sectionName, { ...state, groups: newGroups, unassigned: [], groupFacultyLeads: {} }]
        })
      ) as Record<string, SectionState>

      return { ...prev, ...nextStates }
    })
  }

  const handleUnassignAll = (sectionName: string) => {
    setSectionStates(prev => {
      const state = prev[sectionName]
      const all: Student[] = [
        ...state.unassigned,
        ...Object.values(state.groups).flat(),
      ]
      return { ...prev, [sectionName]: { ...state, groups: {}, unassigned: all } }
    })
  }

  const handleReset = () => {
    sections.map((section) => {
      handleUnassignAll(section.name)
    })
  }

  const handleAddGroup = (sectionName: string) => {
    setSectionStates(prev => {
      const state = prev[sectionName]
      const existingNames = Object.keys(state.groups)
      let name = ""
      for (let i = 0; i < 702; i++) {
        const candidate = generateGroupNames(i + 1)[i]
        if (!existingNames.includes(candidate)) { name = candidate; break }
      }
      return { ...prev, [sectionName]: { ...state, groups: { ...state.groups, [name]: [] } } }
    })
  }

  const handleRenameGroup = (sectionName: string, oldName: string, newName: string) => {
    setSectionStates(prev => {
      const state = prev[sectionName]
      if (state.groups[newName] !== undefined) return prev
      const newGroups = { ...state.groups }
      newGroups[newName] = newGroups[oldName]
      delete newGroups[oldName]
      const newLeads = { ...state.groupFacultyLeads }
      if (newLeads[oldName]) {
        newLeads[newName] = newLeads[oldName]
        delete newLeads[oldName]
      }
      return { ...prev, [sectionName]: { ...state, groups: newGroups, groupFacultyLeads: newLeads } }
    })
  }

  const handleDeleteGroup = (sectionName: string, groupName: string) => {
    setSectionStates(prev => {
      const state = prev[sectionName]
      const students = state.groups[groupName] ?? []
      const newGroups = { ...state.groups }
      delete newGroups[groupName]
      const newLeads = { ...state.groupFacultyLeads }
      delete newLeads[groupName]
      return {
        ...prev,
        [sectionName]: {
          ...state,
          groups: newGroups,
          groupFacultyLeads: newLeads,
          unassigned: [...state.unassigned, ...students],
        },
      }
    })
  }

  const handleGroupFacultyLeadChange = (sectionName: string, groupName: string, facultyId: string) => {
    setSectionStates(prev => ({
      ...prev,
      [sectionName]: {
        ...prev[sectionName],
        groupFacultyLeads: { ...prev[sectionName].groupFacultyLeads, [groupName]: facultyId },
      },
    }))
  }

  const handleMoveGroup = (fromSectionId: string, groupName: string, toSectionId: string) => {
    setSectionStates(prev => {
      const from = prev[fromSectionId]
      const to = prev[toSectionId]
      if (!from || !to) return prev

      const movingStudents = from.groups[groupName] ?? []
      const movingFacultyLead = from.groupFacultyLeads[groupName] ?? ""

      // Pick a non-colliding name in the destination
      const existingNames = new Set(Object.keys(to.groups))
      let newName = groupName
      if (existingNames.has(newName)) {
        const allNames = generateGroupNames(existingNames.size + 1)
        newName = allNames.find(n => !existingNames.has(n)) ?? groupName
      }

      const updatedFrom: SectionState = {
        ...from,
        groups: Object.fromEntries(Object.entries(from.groups).filter(([k]) => k !== groupName)),
        groupFacultyLeads: Object.fromEntries(Object.entries(from.groupFacultyLeads).filter(([k]) => k !== groupName)),
      }

      const updatedTo: SectionState = {
        ...to,
        groups: { ...to.groups, [newName]: movingStudents },
        groupFacultyLeads: movingFacultyLead
          ? { ...to.groupFacultyLeads, [newName]: movingFacultyLead }
          : to.groupFacultyLeads,
      }

      return { ...prev, [fromSectionId]: updatedFrom, [toSectionId]: updatedTo }
    })
  }

  const handleDragStart = (e: React.DragEvent, student: Student, fromGroup?: string, fromSection?: string) => {
    if (fromGroup && fromSection) {
      setDraggedStudent({ student, fromGroup, fromSection })
      e.dataTransfer.effectAllowed = "move"
    }
  }

  const handleDragEnd = () => {
    setDraggedStudent(null)
    setDragOverGroup(null)
  }

  const handleDragOver = (e: React.DragEvent, sectionName: string, groupName: string) => {
    e.preventDefault()
    setDragOverGroup(`${sectionName}::${groupName}`)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverGroup(null)
    }
  }

  const handleDrop = (e: React.DragEvent, toGroup: string, toSection: string) => {
    e.preventDefault()
    if (!draggedStudent) return

    const { student, fromGroup, fromSection } = draggedStudent

    if (fromGroup === toGroup && fromSection === toSection) {
      setDraggedStudent(null)
      setDragOverGroup(null)
      return
    }

    setSectionStates(prev => {
      const originState = prev[fromSection]
      const destState = prev[toSection]
      if (!originState || !destState) return prev

      const isComingFromUnassigned = fromGroup === "__unassigned__"
      const isSameSection = fromSection === toSection

      let updatedOriginUnassigned = [...originState.unassigned]
      const updatedOriginGroups = { ...originState.groups }

      let updatedDestUnassigned = isSameSection ? updatedOriginUnassigned : [...destState.unassigned]
      const updatedDestGroups = isSameSection ? updatedOriginGroups : { ...destState.groups }

      if (isComingFromUnassigned) {
        updatedOriginUnassigned = updatedOriginUnassigned.filter(s => s.email !== student.email)
        if (isSameSection) updatedDestUnassigned = updatedOriginUnassigned
      } else {
        updatedOriginGroups[fromGroup] = (updatedOriginGroups[fromGroup] ?? []).filter(s => s.email !== student.email)
      }

      if (toGroup === "__unassigned__") {
        updatedDestUnassigned = [...updatedDestUnassigned, student]
      } else {
        updatedDestGroups[toGroup] = [...(updatedDestGroups[toGroup] ?? []), student]
      }

      return {
        ...prev,
        [fromSection]: {
          ...originState,
          unassigned: updatedOriginUnassigned,
          groups: updatedOriginGroups,
        },
        [toSection]: {
          ...destState,
          unassigned: updatedDestUnassigned,
          groups: updatedDestGroups,
        }
      }
    })

    setDraggedStudent(null)
    setDragOverGroup(null)
  }

  const handleContainerDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    const container = scrollContainerRef.current
    if (!container) return

    const scrollThreshold = 50 // pixels from the edge to trigger scroll
    const scrollSpeed = 10     // pixels to scroll per frame

    const rect = container.getBoundingClientRect()
    const mouseY = e.clientY

    if (rect.bottom - mouseY < scrollThreshold) {
      container.scrollTop += scrollSpeed
    }
    else if (mouseY - rect.top < scrollThreshold) {
      container.scrollTop -= scrollSpeed
    }
  }

  const allUnassignedStudents = sections.flatMap((section) =>
    (sectionStates[section.name]?.unassigned ?? []).map((student) => ({
      sectionId: section.name,
      student,
    }))
  )

  return (
    <div className="flex flex-col w-full min-h-screen bg-slate-50/50">
      {isPending && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/70 backdrop-blur-sm">
          <Loader2 className="size-10 animate-spin text-slate-700 mb-3" />
          <p className="text-slate-700 font-medium">Creating course...</p>
          <p className="text-slate-700 font-medium">This may take a few moments</p>
        </div>
      )}
      <header className="sticky top-0 flex items-center justify-between px-4 sm:px-8 py-3 bg-white border-b z-10 shadow gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <FolderPlus className="text-slate-400" /> Create a Course
          </h1>
          <p className="text-xs text-slate-500 mt-1">Define course and section details</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button className="cursor-pointer" variant="secondary" onClick={() => router.push("/admin/courses")}>
            <ArrowLeft /> Cancel
          </Button>
          <Button className="cursor-pointer" onClick={handleSubmit} disabled={isPending}>
            {isPending ? <><Loader2 className="animate-spin" /> Submitting...</> : <>Submit Course <ArrowRight /></>}
          </Button>
        </div>
      </header>

      <div className="flex-1 p-4 sm:p-6 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto space-y-6">

          <AddStudent
            onAddStudent={handleAddStudent}
            onImportStudents={handleImportStudents}
            onClearStudents={handleClear}
          />

          <CourseDetails
            adminUsers={adminUsers}
            courseName={courseName}
            setCourseName={setCourseName}
            courseCode={courseCode}
            setCourseCode={setCourseCode}
            semester={semester}
            setSemester={setSemester}
          />

          <Card className="pt-4">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="space-y-1.5">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Layers className="size-5 text-blue-600" /> Sections
                  <Badge variant="secondary" className="text-xs">
                    {sections.length} {sections.length === 1 ? "section" : "sections"}
                  </Badge>
                </CardTitle>
                <CardDescription>Section editing for this course</CardDescription>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
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
                <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-2 py-1 bg-white">
                  <span className="text-xs font-medium text-slate-500">Global group size</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setGlobalGroupSize(Math.max(1, globalGroupSize - 1))}
                      className="h-7 w-7 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer font-medium text-sm rounded"
                    >-
                    </button>
                    <span className="w-8 text-center text-sm font-semibold text-slate-800">{globalGroupSize}</span>
                    <button
                      type="button"
                      onClick={() => setGlobalGroupSize(Math.min(20, globalGroupSize + 1))}
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
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleRemoveSection}
                  disabled={sections.length <= 1}
                  className="cursor-pointer gap-1.5 h-8 text-xs"
                >
                  <Minus className="w-3.5 h-3.5" /> Remove Section
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleAddSection}
                  className="cursor-pointer gap-1.5 h-8 text-xs"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Section
                </Button>
              </div>
            </CardHeader>
          </Card>
            
          <div className="flex flex-col lg:flex-row gap-4 sticky top-28 z-0">
            <div 
              ref={scrollContainerRef}
              onDragOver={handleContainerDragOver}
              className="w-full lg:flex-1 max-h-[calc(100vh-8rem)] overflow-y-auto pb-4"
            >
              {sections.map((section, i) => (
                <SectionCard
                  key={section.name}
                  section={section}
                  index={i + 1}
                  groups={sectionStates[section.name]?.groups ?? {}}
                  unassigned={sectionStates[section.name]?.unassigned ?? []}
                  facultyMembers={facultyUsers}
                  groupFacultyLeads={sectionStates[section.name]?.groupFacultyLeads ?? {}}
                  onGroupFacultyLeadChange={handleGroupFacultyLeadChange}
                  draggedStudent={draggedStudent}
                  dragOverGroup={dragOverGroup}
                  onSectionChange={(field, value) => handleSectionDataChange(section.name, field, value)}
                  onUnassignAll={() => handleUnassignAll(section.name)}
                  onAddGroup={() => handleAddGroup(section.name)}
                  onRenameGroup={handleRenameGroup}
                  onDeleteGroup={handleDeleteGroup}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  availableSections={sections
                    .filter(s => s.name !== section.name)
                    .map(s => ({ id: s.name, label: s.name }))}
                  onMoveGroup={handleMoveGroup}
                />
              ))}
            </div>

            <div className="w-full lg:w-96">
              <div className="border-2 rounded-lg p-3 bg-slate-50/80 shadow-sm">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">Unassigned Students</p>
                    <p className="text-xs text-slate-500">Drag into any section group</p>
                  </div>
                  <span className="text-xs font-semibold text-slate-700">{allUnassignedStudents.length}</span>
                </div>

                <div className="space-y-2 max-h-[calc(100vh-12rem)] overflow-y-auto pb-4">
                  {allUnassignedStudents.length === 0 ? (
                    <p className="text-xs text-slate-400 italic text-center py-4">All assigned!</p>
                  ) : (
                    [...allUnassignedStudents]
                      .sort((a, b) => (a.student.full_name ?? "").localeCompare(b.student.full_name ?? ""))
                      .map(({ sectionId, student }) => (
                        <StudentBlock
                          key={student.email}
                          student={student}
                          onDragStart={handleDragStart}
                          onDragEnd={handleDragEnd}
                          isDimmed={draggedStudent?.student.email === student.email}
                          fromGroup="__unassigned__"
                          fromSection={sectionId}
                        />
                      ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
