import { Dispatch, SetStateAction } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { CalendarIcon, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"

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

interface DatePickerProps {
  label: string
  value: string | null
  onChange: (date: string | null) => void
}

function DatePicker({ label, value, onChange }: DatePickerProps) {
  const date = value ? new Date(value + "T00:00:00") : undefined

  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-slate-500 normal-case">{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(
              "h-9 w-full justify-start text-left font-normal text-sm px-2.5 gap-1.5",
              !date && "text-slate-400"
            )}
          >
            <CalendarIcon className="w-3.5 h-3.5 shrink-0" />
            {date ? format(date, "MMM d, yyyy") : "Pick a date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={selected => onChange(selected ? format(selected, "yyyy-MM-dd") : null)}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

interface CourseDetailsProps {
  courseName: string
  setCourseName: Dispatch<SetStateAction<string>>
  courseCode: string
  setCourseCode: Dispatch<SetStateAction<string>>
  semester: string
  setSemester: Dispatch<SetStateAction<string>>
  courseStartDate: string | null
  setCourseStartDate: Dispatch<SetStateAction<string | null>>
  courseEndDate: string | null
  setCourseEndDate: Dispatch<SetStateAction<string | null>>
}

export default function CourseDetails({
  courseName,
  setCourseName,
  courseCode,
  setCourseCode,
  semester,
  setSemester,
  courseStartDate,
  setCourseStartDate,
  courseEndDate,
  setCourseEndDate
}: CourseDetailsProps) {

  return (
    <Card className="pt-4">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="size-5 text-blue-600" /> Course Details
        </CardTitle>
        <CardDescription>Enter course name and description</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="course-code" className="text-sm font-medium text-slate-600">Course Code</Label>
            <Input
              value={courseCode} onChange={(e) => setCourseCode(e.target.value)}
              id="course-code" placeholder="e.g., NUR 305" className="w-full " />
          </div>
          <div className="space-y-2">
            <Label htmlFor="course-name" className="text-sm font-medium text-slate-600">Course Name</Label>
            <Input
              value={courseName} onChange={(e) => setCourseName(e.target.value)}
              id="course-name" placeholder="e.g., Adult Nursing Simulation" className="w-full " />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-600">Semester</Label>
            <Select value={semester} onValueChange={setSemester}>
              <SelectTrigger className="w-full  cursor-pointer">
                <SelectValue placeholder="Select a semester..." />
              </SelectTrigger>
              <SelectContent>
                {SEMESTERS.map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DatePicker
            label="Start Date"
            value={courseStartDate}
            onChange={setCourseStartDate}
          />
          <DatePicker
            label="End Date"
            value={courseEndDate}
            onChange={setCourseEndDate}
          />
        </div>
      </CardContent>
    </Card>
  )
}