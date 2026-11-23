import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, Users, UserRoundX } from "lucide-react";
import { format } from "date-fns";
import type { SimAssignment } from "./simAssignmentTypes";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckedState } from "@radix-ui/react-checkbox";
import { cn } from "@/lib/utils";


interface PastSessionTableProps {
  assignments: SimAssignment[];
  selectedAssignments: string[];
  onCheck: (id: string, isChecked: CheckedState) => void;
}

const STATUS_BADGE: Record<
  string,
  { label: string; className: string }
> = {
  completed: { label: "Completed", className: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300" },
  archived: { label: "Archived", className: "bg-muted text-muted-foreground" },
  assigned: { label: "Assigned", className: "bg-muted text-muted-foreground" },
  "in progress": { label: "In-Progress", className: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300" },
}

export function PastSessionTable({
  assignments,
  selectedAssignments,
  onCheck,
}: PastSessionTableProps) {

  return (
    <Card className="p-0 overflow-hidden">
      <CardContent className="p-0">
        {assignments.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-50">
                <TableHead className="w-10"></TableHead>
                <TableHead className="w-50">Date</TableHead>
                <TableHead>Simulation Name</TableHead>
                <TableHead>Section</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.map((assignment) => (
                <TableRow key={assignment.id} className="hover:bg-transparent">
                  <TableCell>
                    <Checkbox
                      onCheckedChange={(checked) => onCheck(assignment.id, checked)}
                      checked={selectedAssignments.includes(assignment.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="font-medium flex items-center gap-2 text-gray-600">
                      <Calendar size={14} />
                      <p>{format(new Date(assignment.simTime), "P")}</p>
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold text-gray-900">
                    {assignment.caseName}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users size={14} className="text-gray-400" />
                      {assignment.sectionName}
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={assignment.sessionStatus ?? ''} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <EmptyState message="No past scheduled simulations found." />
        )}
      </CardContent>
    </Card>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center text-gray-500">
      <div className="rounded-full bg-gray-100 p-3 mb-4 border">
        <UserRoundX className="h-6 w-6 text-gray-400" />
      </div>
      <p className="text-sm text-gray-400 font-medium">{message}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const badge = STATUS_BADGE[status] ?? { label: status || "—", className: "bg-muted text-muted-foreground" }
  return (
    <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", badge.className)}>
      {badge.label}
    </span>
  )
}