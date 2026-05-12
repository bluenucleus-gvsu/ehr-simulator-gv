import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, Users, UserRoundX } from "lucide-react";
import { format } from "date-fns";
import type { SimAssignment } from "./simAssignmentTypes";


interface SimulationsTableProps {
  assignments: SimAssignment[];
  emptyMessage: string;
  actionLabel?: string;
  dateFormat?: string;
  showDiagnosis: boolean;

  renderAction: (assignment: SimAssignment) => React.ReactNode;
}

export function SimAssignmentTable({
  assignments,
  emptyMessage,
  actionLabel = "Actions",
  dateFormat = "Pp",
  showDiagnosis,
  renderAction,
}: SimulationsTableProps) {

  return (
    <Card className="p-0 overflow-hidden">
      <CardContent className="p-0">
        {assignments.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-50">
                <TableHead className="w-[180px]">Date</TableHead>
                <TableHead>Simulation Name</TableHead>
                <TableHead>Section</TableHead>
                <TableHead>{actionLabel}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.map((assignment) => (
                <TableRow key={assignment.id} className="hover:bg-transparent">
                  <TableCell>
                    <div className="font-medium flex items-center gap-2 text-gray-600">
                      <Calendar size={14} />
                      <p>{format(new Date(assignment.simTime), dateFormat)}</p>
                    </div>
                  </TableCell>

                  {/* Name Column */}
                  <TableCell className="font-semibold text-gray-900">
                    {assignment.caseName}
                    {showDiagnosis && assignment.caseDiagnosis && (
                      <span className="font-normal text-gray-500"> ({assignment.caseDiagnosis})</span>
                    )}
                  </TableCell>

                  {/* Section Column */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users size={14} className="text-gray-400" />
                      {assignment.sectionName}
                    </div>
                  </TableCell>

                  {/* Dynamic Action Column */}
                  <TableCell>
                    {renderAction(assignment)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <EmptyState message={emptyMessage} />
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