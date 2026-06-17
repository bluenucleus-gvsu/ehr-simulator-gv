import { addMinutes, format, isWithinInterval } from "date-fns";
import type { MedCardColumn } from "./marHelpers";
import type { AllMedicationTypes, MedicationOrder } from "./marData.jsx"
// import { Checkbox } from "@/components/ui/checkbox";
import { findLastAdminTime, renderMedCardDetails, renderMedTitleRow, caseAdministrationTime } from "./marHelpers";
import { DatabaseMedAdministration } from "@/actions/simulation";

interface MedCardProps {
  medication: AllMedicationTypes;
  administrations: DatabaseMedAdministration[];
  order: MedicationOrder;
  columns: MedCardColumn[];
  sessionStart: Date;
  isHighlightableColumn: boolean;
  /** Minutes since `sessionStart` for the live simulation clock (wall-clock “now” in sim). */
  elapsedSimMinutes: number;
  isPresim: boolean;
}

const MedCard = ({
  medication,
  administrations,
  order,
  columns,
  sessionStart,
  isHighlightableColumn,
  elapsedSimMinutes,
  isPresim,
}: MedCardProps) => {

  const simNow = addMinutes(sessionStart, elapsedSimMinutes);


  const visibleAdministrations = administrations.filter(currentAdmin => {
    if (isPresim && currentAdmin.is_in_presim === false) {
      return false;
    }
    if (currentAdmin.status !== "Due") return true;

    const successfullAdministration = administrations.some(otherAdmin => {
      const isStudentAdmin = otherAdmin.source_type === 'student_administration';
      const isGiven = otherAdmin.status === 'Given' || otherAdmin.status === 'Patient Administered';

      if (!isStudentAdmin || !isGiven) return false;

      const timeDiff = Math.abs((otherAdmin.time_offset ?? 0) - (currentAdmin.time_offset ?? 0));
      return timeDiff <= 60;
    });
    return !successfullAdministration;
  });

  // using columns passed from main mar component, add relevant administration data (given, held, refused...)
  const processedColumns = columns.map(col => {
    const administrationsInColumn = visibleAdministrations.filter(admin => {
      const adminTime = caseAdministrationTime(admin, sessionStart || new Date());

      // Check if that time falls inside this column
      return isWithinInterval(adminTime, {
        start: col.startTime,
        end: col.endTime
      });
    })

    return {
      ...col,
      associatedAdministrations: administrationsInColumn
    }
  })

  return (
    <div className="relative bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex shrink-0 flex-col md:flex-row">
      <div className="px-4 py-3 md:w-80 lg:w-110 2xl:w-140 border-b md:border-b-0 md:border-r border-slate-100 bg-slate-50/30 flex flex-col justify-between">
        <div >
          <div className="pl-2">
            <h4 className="font-bold text-slate-900 text-md xl:text-md pb-1">
              {renderMedTitleRow(medication, order)}
            </h4>
          </div>
          <div className="text-[12px] text-slate-500 space-y-1 pl-4 mb-3 ml-2">
            {renderMedCardDetails(medication, order)}
          </div>
          {order.instructions && (
            <div className="text-sm font-light bg-white text-slate-800 p-2 rounded border border-slate-200 mb-3">
              <span className="font-medium">Administration Instructions:</span> {order.instructions}
            </div>
          )}

        </div>
        {findLastAdminTime(administrations, sessionStart)}
      </div>

      <div className="flex-1 grid grid-cols-6 divide-x divide-slate-100 overflow-x-auto">
        {processedColumns.map((col, colIndex) => {
          const isCurrentHourColumn =
            isHighlightableColumn &&
            isWithinInterval(simNow, { start: col.startTime, end: col.endTime });

          return (
            <div key={colIndex} className={`flex flex-col min-w-[60px] ${isCurrentHourColumn ? 'bg-blue-50/30' : ''}`}>
              <div
                key={col.colHeader}
                className="medCard-pulse"
              >
                <div className={`text-xs text-center py-0.5 font-mono uppercase tracking-wider border-b border-slate-100 ${isCurrentHourColumn ? 'text-blue-600 font-bold' : 'text-slate-500'}`}>
                  {col.colHeader}
                </div>
              </div>

              <div className="flex-1 p-2 space-y-2 flex flex-col items-center justify-center min-h-[80px]">
                {col.associatedAdministrations?.map((admin, index) => {
                  const adminTime = caseAdministrationTime(admin, sessionStart);

                  // Status Colors
                  let statusStyle = "bg-slate-100 text-slate-600 border-slate-200";
                  if (admin.status === "Given") statusStyle = "bg-green-100 text-green-700 border-green-200";
                  else if (admin.status === "Held") statusStyle = "bg-amber-100 text-amber-700 border-amber-200";
                  else if (admin.status === "Due") statusStyle = 'bg-blue-100 text-blue-700 border-blue-200';
                  else if (admin.status === "Missed") statusStyle = "bg-red-100 text-red-700 border-red-200";
                  else if (admin.status === "Refused") statusStyle = "bg-orange-100 text-orange-800 border-orange-200";

                  return (
                    <div key={`${admin.medication_order_id}-${index}`} className={`w-fit text-center p-1 rounded border text-xs ${statusStyle}`}>
                      <div className="font-bold font-mono">{format(adminTime, 'HHmm')}</div>
                      <div className="text-xs">{admin.status}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default MedCard