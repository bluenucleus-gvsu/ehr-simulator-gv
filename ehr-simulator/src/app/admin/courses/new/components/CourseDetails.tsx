import { Dispatch, SetStateAction, useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { cn } from "@/lib/utils"
import { Textarea } from "@/components/ui/textarea"
import { Check, ChevronsUpDown, FileText, UserCog, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FacultyMember } from "../types"

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

interface CourseDetailsProps {
    adminUsers:  FacultyMember[]
    courseName: string
    setCourseName: Dispatch<SetStateAction<string>>
    courseCode: string
    setCourseCode: Dispatch<SetStateAction<string>>
    semester: string
    setSemester: Dispatch<SetStateAction<string>>
}

export default function CourseDetails ({
    adminUsers, 
    courseName,
    setCourseName,
    courseCode,
    setCourseCode,
    semester, 
    setSemester
}: CourseDetailsProps) {

    const [facultyOpen, setFacultyOpen] = useState(false)
    const [courseFacultyIds, setCourseFacultyIds] = useState<string[]>([])

    const toggleCourseFaculty = (member: FacultyMember) => {
        setCourseFacultyIds(prev =>
        prev.includes(member.id) ? prev.filter(id => id !== member.id) : [...prev, member.id]
        )
    }

    const assignedCourseFaculty = adminUsers.filter(f => courseFacultyIds.includes(f.id))

    return(
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
    )
}