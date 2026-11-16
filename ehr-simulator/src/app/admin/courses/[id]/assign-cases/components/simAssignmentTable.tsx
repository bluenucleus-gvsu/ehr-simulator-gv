import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, Users, UserRoundX } from "lucide-react";
import { format } from "date-fns";
import type { SimAssignment } from "./simAssignmentTypes";
import { CasesData, SectionSimulationsData } from "@/actions/cases";
import CaseAssignmentDialog from "./caseAssignment";


interface SimulationsTableProps {
  assignments: SimAssignment[];
  sections: SectionSimulationsData;
  cases: CasesData;
  showDiagnosis: boolean;
}
const EMPTY_MESSAGE = "No upcoming simulations scheduled.";

export function SimAssignmentTable({
  assignments,
  sections,
  cases,
  showDiagnosis,
}: SimulationsTableProps) {

  return (
    <Card className="p-0 overflow-hidden">
      <CardContent className="p-0">
        {assignments.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-50">
                <TableHead className="w-50">Date</TableHead>
                <TableHead>Simulation Name</TableHead>
                <TableHead>Section</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.map((assignment) => (
                <TableRow key={assignment.id} className="hover:bg-transparent">
                  <TableCell>
                    <div className="font-medium flex items-center gap-2 text-gray-600">
                      <Calendar size={14} />
                      <p>{format(new Date(assignment.simTime), "Pp")}</p>
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold text-gray-900">
                    {assignment.caseName}
                    {showDiagnosis && assignment.caseDiagnosis && (
                      <span className="font-normal text-gray-500"> ({assignment.caseDiagnosis})</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users size={14} className="text-gray-400" />
                      {assignment.sectionName}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <CaseAssignmentDialog
                        isEditMode={true}
                        sections={sections}
                        cases={cases}
                        existing_id={assignment.id}
                        initialData={{
                          sectionId: assignment.sectionId,
                          caseId: assignment.caseId,
                          simTime: assignment.simTime,
                          presimTime: assignment.presimTime,
                        }}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <EmptyState message={EMPTY_MESSAGE} />
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