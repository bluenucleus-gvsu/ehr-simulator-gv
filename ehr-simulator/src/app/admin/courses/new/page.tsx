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
  RefreshCcw
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Student, FacultyMember, SectionData } from "./types"
import { SectionCard, SectionGroups, generateGroupNames } from "./components/SectionCard"

import { getAllFacultyUsers, getAllAdminUsers, provisionStudents, getUsersByEmails } from "@/actions/users"
import { createCourse, createSection, createGroup, createGroupMembers } from "@/actions/courses"
import AddStudent from "./components/AddStudent"
import UnassignDialog from "./components/UnassignDialog"
import CourseDetails from "./components/CourseDetails"
import { toast } from "sonner"
import UnassignListDialog from "./components/UnassignedListDialog"

interface SectionState {
  groups: SectionGroups
  groupFacultyLeads: Record<string, string>
}

/** "Section 01", "Section 02", etc. — single source of truth for section names */
function makeSectionName(index: number): string {
  return `Section ${String(index + 1).padStart(2, "0")}`
}

function makeSectionState(groupCount = 1): SectionState {
  const groups = Object.fromEntries(
    generateGroupNames(groupCount).map(name => [name, [] as Student[]])
  )
  return { groups, groupFacultyLeads: {} }
}

function makeSection(index: number): SectionData {
  return {
    name: makeSectionName(index),
    start_date: null,
    end_date: null,
    meeting_time: null,
  }
}

function isSameStudent(first: Student, second: Student): boolean {
  return first.id === second.id;
}

export default function CreateCoursePage() {
  const router = useRouter()

  const [adminUsers, setAdminUsers] = useState<FacultyMember[]>([])
  const [facultyUsers, setFacultyUsers] = useState<FacultyMember[]>([])

  useEffect(() => {
    getAllAdminUsers().then(setAdminUsers)
    getAllFacultyUsers().then(setFacultyUsers)
  }, [])

  const [allStudents, setAllStudents] = useState<Student[]>([])
  const [unassignedStudents, setUnassignedStudents] = useState<Student[]>([])

  const [courseName, setCourseName] = useState("")
  const [courseCode, setCourseCode] = useState("")
  const [semester, setSemester] = useState("")

  const [sections, setSections] = useState<SectionData[]>([makeSection(0)])
  const [sectionStates, setSectionStates] = useState<Record<string, SectionState>>({
    [makeSectionName(0)]: makeSectionState(),
  })
  const [isPending, setIsPending] = useState(false)

  const handleSubmit = async () => {
    if(isPending) return;

    if (unassignedStudents.length > 0){
      toast.error(`${unassignedStudents.length} student${unassignedStudents.length === 1 ? "" : "s"} remain unassigned.`);
      return;
    }

    setIsPending(true);
      
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
    } 
    finally {
        setIsPending(false)

    }
  }

  const handleImportStudents = (students: Student[]) => {
    setAllStudents(students)
    setUnassignedStudents(students)
  }

  const handleAddStudent = (newStudent: Student) => {
    setAllStudents((prev) => [...prev, newStudent]);
    setUnassignedStudents((prev) => [...prev, newStudent]);
  };

  const handleClear = () => {
    setAllStudents([])
    setUnassignedStudents([])
    setSectionStates(prev => {
      const next = { ...prev }
      Object.keys(next).forEach(name => {
        next[name] = {
          ...next[name],
          groups: Object.fromEntries(
            Object.keys(next[name].groups).map(groupName => [groupName, []])
          ),
          groupFacultyLeads: {},
        }
      })
      return next
    })
  }

  const handleSectionCountChange = (count: number) => {
    if (count < sections.length) {
      const removedSections = sections.slice(count)
      const orphanedStudents = removedSections.flatMap(section =>
        Object.values(sectionStates[section.name]?.groups ?? {}).flat()
      )
      if (orphanedStudents.length > 0) {
        setUnassignedStudents(prev => [...prev, ...orphanedStudents])
      }
      setSections(prev => prev.slice(0, count))
      return
    }

    const newSections = Array.from(
      { length: count - sections.length },
      (_, index) => makeSection(sections.length + index)
    )
    setSections(prev => [...prev, ...newSections])
    setSectionStates(prev => ({
      ...prev,
      ...Object.fromEntries(
        newSections.map(section => [section.name, makeSectionState()])
      ),
    }))
  }

  const handleGroupCountChange = (sectionName: string, count: number) => {
    const orphanedStudents: Student[] = []
    const state = sectionStates[sectionName]
    if (!state) return

    const existingGroups = Object.entries(state.groups)
      .sort(([a], [b]) => a.localeCompare(b))
    const retainedGroups = existingGroups.slice(0, count)
    existingGroups.slice(count).forEach(([, students]) => orphanedStudents.push(...students))

    const groups = Object.fromEntries(retainedGroups)
    generateGroupNames(count).forEach(name => {
      if (Object.keys(groups).length < count && groups[name] === undefined) {
        groups[name] = []
      }
    })

    const retainedGroupNames = new Set(Object.keys(groups))
    const groupFacultyLeads = Object.fromEntries(
      Object.entries(state.groupFacultyLeads)
        .filter(([groupName]) => retainedGroupNames.has(groupName))
    )

    setSectionStates(prev => ({
      ...prev,
      [sectionName]: { ...prev[sectionName], groups, groupFacultyLeads },
    }))

    if (orphanedStudents.length > 0) {
      setUnassignedStudents(prev => [...prev, ...orphanedStudents])
    }
  }

  const handleAddSection = () => {
    if (sections.length >= 8) return
    handleSectionCountChange(sections.length + 1)
  }

  const handleRemoveSection = () => {
    if (sections.length <= 1) return
    handleSectionCountChange(sections.length - 1)
  }

  const handleSectionDataChange = (name: string, field: keyof SectionData, value: string | null) => {
    setSections(prev => prev.map(s => s.name === name ? { ...s, [field]: value } : s))
  }

  const handleRandomAssign = () => {
    if (allStudents.length === 0) return

    const eligibleSectionNames = sections
      .filter(section => Object.keys(sectionStates[section.name]?.groups ?? {}).length > 0)
      .map(section => section.name)
    if (eligibleSectionNames.length === 0) {
      toast.error("Add at least one group before randomly assigning students.")
      return
    }

    const shuffled = [...allStudents].sort(() => Math.random() - 0.5)

    const sectionAssignments: Record<string, Student[]> = Object.fromEntries(
      eligibleSectionNames.map((sectionName) => [sectionName, [] as Student[]])
    )

    // Distribute them evenly to sections
    shuffled.forEach((student, index) => {
      const targetSection = eligibleSectionNames[index % eligibleSectionNames.length]
      sectionAssignments[targetSection].push(student)
    })

    setSectionStates(prev => {
      const nextStates = Object.fromEntries(
        sections.map(({ name: sectionName }) => {
          const state = prev[sectionName]
          const assignedStudents = sectionAssignments[sectionName] ?? []

          const names = Object.keys(state.groups)
          const newGroups: SectionGroups = {}

          names.forEach((name) => {
            newGroups[name] = []
          })

          assignedStudents.forEach((student, i) => {
            newGroups[names[i % names.length]].push(student)
          })

          return [sectionName, { ...state, groups: newGroups, groupFacultyLeads: {} }]
        })
      ) as Record<string, SectionState>

      return { ...prev, ...nextStates }
    })
    setUnassignedStudents([]) 
  }

  const handleUnassignAll = (sectionName: string) => {
    const state = sectionStates[sectionName]
    const studentsToUnassign = Object.values(state.groups).flat()
    
    setUnassignedStudents(current => [...current, ...studentsToUnassign])
    
    setSectionStates(prev => ({ 
      ...prev, 
      [sectionName]: {
        ...prev[sectionName],
        groups: Object.fromEntries(Object.keys(prev[sectionName].groups).map(name => [name, []])),
        groupFacultyLeads: {},
      }
    }))
  }

  const handleReset = () => {
    setUnassignedStudents([...allStudents])
    setSectionStates(prev => {
      const next = { ...prev }
      Object.keys(next).forEach(name => {
        next[name] = {
          ...next[name],
          groups: Object.fromEntries(Object.keys(next[name].groups).map(groupName => [groupName, []])),
          groupFacultyLeads: {},
        }
      })
      return next
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
    const state = sectionStates[sectionName]
    const students = state.groups[groupName] ?? []
    
    setUnassignedStudents(current => [...current, ...students])
    
    setSectionStates(prev => {
      const prevState = prev[sectionName]
      const newGroups = { ...prevState.groups }
      delete newGroups[groupName]
      const newLeads = { ...prevState.groupFacultyLeads }
      delete newLeads[groupName]
      return {
        ...prev,
        [sectionName]: {
          ...prevState,
          groups: newGroups,
          groupFacultyLeads: newLeads,
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

  const handleAssignStudent = (sectionName: string, groupName: string, student: Student) => {
    setSectionStates(prev => {
      const sectionState = prev[sectionName]
      if (!sectionState || !sectionState.groups[groupName]) return prev
      if (sectionState.groups[groupName].some(existing => isSameStudent(existing, student))) return prev

      return {
        ...prev,
        [sectionName]: {
          ...sectionState,
          groups: {
            ...sectionState.groups,
            [groupName]: [...sectionState.groups[groupName], student],
          },
        },
      }
    })
    setUnassignedStudents(prev => prev.filter(unassigned => !isSameStudent(unassigned, student)))
  }

  const handleUnassignStudent = (sectionName: string, groupName: string, student: Student) => {
    setSectionStates(prev => {
      const sectionState = prev[sectionName]
      if (!sectionState) return prev

      return {
        ...prev,
        [sectionName]: {
          ...sectionState,
          groups: {
            ...sectionState.groups,
            [groupName]: (sectionState.groups[groupName] ?? [])
              .filter(assignedStudent => !isSameStudent(assignedStudent, student)),
          },
        },
      }
    })
    setUnassignedStudents(prev =>
      prev.some(unassigned => isSameStudent(unassigned, student))
        ? prev
        : [...prev, student]
    )
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
        <div className="flex items-center gap-2 flex-shrink-0">
          <UnassignListDialog
            unassignedStudents={unassignedStudents}
          />
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
            sectionCount={sections.length}
            setSectionCount={handleSectionCountChange}
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
                  description="All students across every section will be returned to the unassigned pool. Use Randomly Assign to place them into groups again."
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
            
          <div
            className="flex flex-col gap-4 overflow-y-auto pb-4 sticky top-28 z-0"
          >
              {sections.map((section, i) => (
                <SectionCard
                  key={section.name}
                  section={section}
                  index={i + 1}
                  groups={sectionStates[section.name]?.groups ?? {}}
                  onGroupCountChange={count => handleGroupCountChange(section.name, count)}
                  unassigned={unassignedStudents}
                  onAssignStudent={handleAssignStudent}
                  onUnassignStudent={handleUnassignStudent}
                  facultyMembers={facultyUsers}
                  groupFacultyLeads={sectionStates[section.name]?.groupFacultyLeads ?? {}}
                  onGroupFacultyLeadChange={handleGroupFacultyLeadChange}
                  onSectionChange={(field, value) => handleSectionDataChange(section.name, field, value)}
                  onUnassignAll={() => handleUnassignAll(section.name)}
                  onAddGroup={() => handleAddGroup(section.name)}
                  onRenameGroup={handleRenameGroup}
                  onDeleteGroup={handleDeleteGroup}
                  availableSections={sections
                    .filter(s => s.name !== section.name)
                    .map(s => ({ id: s.name, label: s.name }))}
                  onMoveGroup={handleMoveGroup}
                />
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}