"use client"
import {
  FolderPlus,
  FileText,
  X,
  ArrowLeft,
  ArrowRight,
  Upload,
  AlertCircleIcon,
  CheckCircle2Icon,
  Layers,
  Plus,
  Minus,
  UserCog,
  Check,
  ChevronsUpDown,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { ChangeEvent, useState, useRef, useEffect } from "react"
import { Student, FacultyMember, SectionData } from "./types"
import { SectionCard, SectionGroups, randomlyAssignGroups, generateGroupNames } from "./SectionCard"

import { getAllFacultyUsers, getAllAdminUsers, provisionStudents, getUsersByEmails } from "@/actions/users"
import { createCourse, createSection, createGroup, createGroupMembers } from "@/actions/courses"
interface SectionState {
  groups: SectionGroups
  unassigned: Student[]
  groupSize: number
  groupFacultyLeads: Record<string, string>
}

const generateSemesters = (): string[] => {
  const now = new Date()
  const currentYear = now.getFullYear()
  const semesters: string[] = []
  for (let i = 0; i < 3; i++) {
    const year = currentYear + i
    semesters.push(`Winter ${year}`, `Summer ${year}`, `Fall ${year}`)
  }
  return semesters
}
const SEMESTERS = generateSemesters()

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
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [adminUsers, setAdminUsers] = useState<FacultyMember[]>([])
  const [facultyUsers, setFacultyUsers] = useState<FacultyMember[]>([])

  useEffect(() => {
    getAllAdminUsers().then(setAdminUsers)
    getAllFacultyUsers().then(setFacultyUsers)
  }, [])

  const [selectedFile, setSelectedFile] = useState<File>()
  const [fileUploadError, setFileUploadError] = useState("")
  const [allStudents, setAllStudents] = useState<Student[]>([])

  const [courseName, setCourseName] = useState("")
  const [courseCode, setCourseCode] = useState("")
  const [semester, setSemester] = useState("")
  const [courseFacultyIds, setCourseFacultyIds] = useState<string[]>([])
  const [facultyOpen, setFacultyOpen] = useState(false)

  const [sections, setSections] = useState<SectionData[]>([makeSection(0)])
  const [sectionStates, setSectionStates] = useState<Record<string, SectionState>>({
    [makeSectionName(0)]: makeSectionState(),
  })

  const [draggedStudent, setDraggedStudent] = useState<{
    student: Student
    fromGroup: string
    fromSection: string
  } | null>(null)
  const [dragOverGroup, setDragOverGroup] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (allStudents.length > 0) {
      await provisionStudents(allStudents)
    }

    // Look up real user IDs by email from the users table
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
                const studentId = emailToUserId[student.email]  // real UUID from DB
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

  const parseCSV = (text: string): Student[] => {
    const lines = text.trim().split("\n")
    if (lines.length < 2) throw new Error("CSV file is empty or contains only headers")

    const header = lines[0].split(",").map(h => h.replace(/"/g, "").trim())
    const cols = ["User Name", "First Name", "Last Name"]
    const indices = cols.map(col => header.indexOf(col))

    if (indices.includes(-1)) {
      throw new Error(`Missing columns: ${cols.filter((_, i) => indices[i] === -1).join(", ")}`)
    }

    const [uIdx, fIdx, lIdx] = indices

    return lines.slice(1).filter(line => line.trim()).map(line => {
      const values: string[] = []
      let current = ""
      let inQuotes = false
      for (const char of line) {
        if (char === '"') inQuotes = !inQuotes
        else if (char === "," && !inQuotes) { values.push(current.trim()); current = "" }
        else current += char
      }
      values.push(current.trim())

      const clean = (idx: number) => values[idx]?.replace(/"/g, "") || ""
      const userName = clean(uIdx)
      const firstName = clean(fIdx)
      const lastName = clean(lIdx)

      return {
        id: crypto.randomUUID(),
        email: `${userName}@mail.gvsu.edu`,
        full_name: `${firstName} ${lastName}`.trim(),
        role: "student",
        status: null,
        created_at: null,
        updated_at: null,
      } satisfies Student
    })
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.name.split(".").pop()?.toLowerCase() !== "csv") {
      setFileUploadError(`Expected .csv, received .${file.name.split(".").pop()}`)
      setSelectedFile(undefined)
      setAllStudents([])
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const students = parseCSV(event.target?.result as string)
        setAllStudents(students)
        setSectionStates(prev => {
          const next = { ...prev }
          Object.keys(next).forEach((name, i) => {
            next[name] = { ...next[name], unassigned: i === 0 ? students : [], groups: {} }
          })
          return next
        })
        setSelectedFile(file)
        setFileUploadError("")
      } catch (err: any) {
        setFileUploadError(err.message)
        setSelectedFile(undefined)
        setAllStudents([])
      }
    }
    reader.readAsText(file)
  }

  const handleClear = () => {
    setAllStudents([])
    setSectionStates(prev => {
      const next = { ...prev }
      Object.keys(next).forEach(name => { next[name] = makeSectionState() })
      return next
    })
    setSelectedFile(undefined)
    setFileUploadError("")
    if (fileInputRef.current) fileInputRef.current.value = ""
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

  const handleGroupSizeChange = (sectionName: string, size: number) => {
    setSectionStates(prev => ({
      ...prev,
      [sectionName]: { ...prev[sectionName], groupSize: size },
    }))
  }

  const handleRandomAssign = (sectionName: string) => {
    setSectionStates(prev => {
      const state = prev[sectionName]
      const all: Student[] = [
        ...state.unassigned,
        ...Object.values(state.groups).flat(),
      ]
      if (all.length === 0) return prev
      const newGroups = randomlyAssignGroups(all, state.groupSize)
      return { ...prev, [sectionName]: { ...state, groups: newGroups, unassigned: [] } }
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

    if (fromSection !== toSection) return
    if (fromGroup === toGroup) return

    setSectionStates(prev => {
      const state = prev[toSection]
      const newGroups = { ...state.groups }
      let newUnassigned = [...state.unassigned]

      if (fromGroup === "__unassigned__") {
        newUnassigned = newUnassigned.filter(s => s.email !== student.email)
      } else {
        newGroups[fromGroup] = (newGroups[fromGroup] ?? []).filter(s => s.email !== student.email)
      }

      if (toGroup === "__unassigned__") {
        newUnassigned = [...newUnassigned, student]
      } else {
        newGroups[toGroup] = [...(newGroups[toGroup] ?? []), student]
      }

      return { ...prev, [toSection]: { ...state, groups: newGroups, unassigned: newUnassigned } }
    })

    setDraggedStudent(null)
    setDragOverGroup(null)
  }

  const toggleCourseFaculty = (member: FacultyMember) => {
    setCourseFacultyIds(prev =>
      prev.includes(member.id) ? prev.filter(id => id !== member.id) : [...prev, member.id]
    )
  }

  const assignedCourseFaculty = adminUsers.filter(f => courseFacultyIds.includes(f.id))
  const totalStudents = allStudents.length

  return (
    <div className="flex flex-col w-full min-h-screen bg-slate-50/50">
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
          <Button className="cursor-pointer" onClick={handleSubmit}>
            Submit Course <ArrowRight />
          </Button>
        </div>
      </header>

      <div className="flex-1 p-4 sm:p-6 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto space-y-6 pb-20">

          <Card className="pt-4">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Upload className="size-5 text-blue-600" /> Upload .CSV File
              </CardTitle>
              <CardDescription>Upload course students information file</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col w-full gap-2">
                <div className="flex gap-2">
                  <Input
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    type="file"
                    accept=".csv"
                    className="pt-2 cursor-pointer"
                  />
                  <Button className="cursor-pointer flex-shrink-0" variant="secondary" onClick={handleClear}>
                    <X /> Clear
                  </Button>
                </div>
                {fileUploadError && (
                  <Alert className="bg-red-50" variant="destructive">
                    <AlertCircleIcon />
                    <AlertTitle>Upload failed!</AlertTitle>
                    <AlertDescription>{fileUploadError}</AlertDescription>
                  </Alert>
                )}
                {selectedFile && !fileUploadError && (
                  <Alert className="text-green-600 bg-green-50">
                    <CheckCircle2Icon />
                    <AlertTitle>
                      Success! {totalStudents} students loaded from <span className="font-mono">{selectedFile.name}</span>
                    </AlertTitle>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="pt-4">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="size-5 text-blue-600" /> Course Details
              </CardTitle>
              <CardDescription>Enter course name and description</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <div className="space-y-2">
                  <Label htmlFor="course-code" className="text-sm font-medium text-slate-600">Course Code</Label>
                  <Input
                    value={courseCode} onChange={(e) => setCourseCode(e.target.value)}
                    id="course-code" placeholder="e.g., NUR 305" className="w-full sm:w-1/2" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="course-name" className="text-sm font-medium text-slate-600">Course Name</Label>
                  <Input
                    value={courseName} onChange={(e) => setCourseName(e.target.value)}
                    id="course-name" placeholder="e.g., Adult Nursing Simulation" className="w-full sm:w-1/2" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="course-description" className="text-sm font-medium text-slate-600">Course Description</Label>
                  <Textarea id="course-description" placeholder="Enter a brief description of the course..." className="resize-none" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-600">Semester</Label>
                  <Select value={semester} onValueChange={setSemester}>
                    <SelectTrigger className="w-full sm:w-1/2 cursor-pointer">
                      <SelectValue placeholder="Select a semester..." />
                    </SelectTrigger>
                    <SelectContent>
                      {SEMESTERS.map(s => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-600">Course Administrators</Label>
                  <div className="space-y-2">
                    <Popover open={facultyOpen} onOpenChange={setFacultyOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          className="w-full sm:w-64 justify-between cursor-pointer h-9 text-sm font-normal"
                        >
                          <span className="flex items-center gap-1.5 text-slate-500">
                            <UserCog className="w-4 h-4" />
                            {courseFacultyIds.length === 0
                              ? "Assign faculty..."
                              : `${courseFacultyIds.length} selected`}
                          </span>
                          <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="p-0 w-80" align="start">
                        <Command>
                          <CommandInput placeholder="Search by name..." />
                          <CommandList>
                            <CommandEmpty>No faculty found.</CommandEmpty>
                            <CommandGroup>
                              {adminUsers.map(member => {
                                const isSelected = courseFacultyIds.includes(member.id)
                                return (
                                  <CommandItem
                                    key={member.id}
                                    value={member.full_name ?? ""}
                                    onSelect={() => toggleCourseFaculty(member)}
                                    className="cursor-pointer"
                                  >
                                    <Check className={cn("mr-2 h-4 w-4 flex-shrink-0", isSelected ? "opacity-100 text-slate-700" : "opacity-0")} />
                                    <div className="flex flex-col min-w-0">
                                      <span className="text-sm font-medium">{member.full_name ?? ""}</span>
                                      <span className="text-xs text-slate-500 truncate">{member.email ?? ""}</span>
                                    </div>
                                  </CommandItem>
                                )
                              })}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    {assignedCourseFaculty.length > 0 && (
                      <div className="flex flex-wrap gap-2 flex-1">
                        {assignedCourseFaculty.map(member => (
                          <div
                            key={member.id}
                            className="flex items-center justify-between px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                          >
                            <div className="flex flex-col min-w-0">
                              <span className="text-sm font-medium text-slate-800">{member.full_name ?? ""}</span>
                              <span className="text-xs text-slate-500 truncate">{member.email ?? ""}</span>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 cursor-pointer flex-shrink-0 ml-2"
                              onClick={() => setCourseFacultyIds(prev => prev.filter(id => id !== member.id))}
                            >
                              <X className="w-3 h-3 text-slate-400" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="pt-4">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="space-y-1.5">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Layers className="size-5 text-blue-600" /> Sections
                  <Badge variant="secondary" className="text-xs">
                    {sections.length} {sections.length === 1 ? "section" : "sections"}
                  </Badge>
                </CardTitle>
                <CardDescription>Add or remove sections for this course</CardDescription>
              </div>
              <div className="flex items-center gap-2">
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

          {sections.map((section, i) => (
            <SectionCard
              key={section.name}
              section={section}
              index={i + 1}
              groups={sectionStates[section.name]?.groups ?? {}}
              unassigned={sectionStates[section.name]?.unassigned ?? []}
              groupSize={sectionStates[section.name]?.groupSize ?? DEFAULT_GROUP_SIZE}
              facultyMembers={facultyUsers}
              groupFacultyLeads={sectionStates[section.name]?.groupFacultyLeads ?? {}}
              onGroupFacultyLeadChange={handleGroupFacultyLeadChange}
              draggedStudent={draggedStudent}
              dragOverGroup={dragOverGroup}
              onSectionChange={(field, value) => handleSectionDataChange(section.name, field, value)}
              onGroupSizeChange={(size) => handleGroupSizeChange(section.name, size)}
              onRandomAssign={() => handleRandomAssign(section.name)}
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
      </div>
    </div>
  )
}