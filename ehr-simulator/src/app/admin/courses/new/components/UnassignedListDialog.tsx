import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { toast } from "sonner"
import { 
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTrigger,
    DialogDescription, 
    DialogTitle 
    
} from "@/components/ui/dialog";
import StudentBlock from "./StudentBlock";
import { Student } from "../types";

interface UnassignListDialogProps{
    unassignedStudents : Student []
}


export default function UnassignListDialog ({
    unassignedStudents
}:UnassignListDialogProps) {

    const handleCopyStudentName = async (name: string | undefined | null) => {
        if (!name) {
          toast.error("This student does not have a name to copy.")
          return
        }
    
        try {
          await navigator.clipboard.writeText(name)
          toast.success(`Copied ${name}.`)
        } catch (error) {
          console.error("Failed to copy student name:", error)
          toast.error("Could not copy the student name.")
        }
      }

    return(
        <Dialog>
            <DialogTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className={`cursor-pointer h-9 ${
                  unassignedStudents.length > 0
                    ? "border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200"
                    : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                }`}
                aria-label={`${unassignedStudents.length} unassigned students. Click to view the list.`}
              >
                Unassigned
                <Badge
                  variant="secondary"
                  className={`ml-1 ${
                    unassignedStudents.length > 0
                      ? "bg-slate-200 text-slate-700"
                      : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {unassignedStudents.length}
                </Badge>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Unassigned Students ({unassignedStudents.length})</DialogTitle>
                <DialogDescription>
                  Students in this list have not been assigned to a group.
                </DialogDescription>
              </DialogHeader>
              <div className="max-h-[60vh] space-y-2 overflow-y-auto">
                {unassignedStudents.length === 0 ? (
                  <p className="py-6 text-center text-sm text-slate-500">
                    All students are assigned.
                  </p>
                ) : (
                  [...unassignedStudents]
                    .sort((a, b) => (a.full_name ?? "").localeCompare(b.full_name ?? ""))
                    .map((student, index) => (
                      <div
                        key={student.email ?? `${student.full_name ?? "student"}-${index}`}
                        className="flex items-center gap-2"
                      >
                        <StudentBlock student={student} className="min-w-0 flex-1" />
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 flex-shrink-0 p-0"
                          aria-label={`Copy ${student.full_name ?? "student"} name`}
                          title="Copy name"
                          disabled={!student.full_name}
                          onClick={() => handleCopyStudentName(student.full_name)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                )}
              </div>
            </DialogContent>
          </Dialog>
    )
}