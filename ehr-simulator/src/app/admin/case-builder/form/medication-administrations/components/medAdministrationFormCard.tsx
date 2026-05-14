import { AllMedicationTypes, MedAdministrationInstance, MedicationOrder } from "@/app/simulation/[caseId]/[sessionId]/chart/mar/components/marData";
import { renderMedCardDetails, renderMedTitleRow } from "@/app/simulation/[caseId]/[sessionId]/chart/mar/components/marHelpers";
import { MedCardColumn } from "@/app/simulation/[caseId]/[sessionId]/chart/mar/components/marHelpers";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { format } from "date-fns";
import { Check, Trash2, X } from "lucide-react";

interface MedCardProps {
  medication: AllMedicationTypes;
  administrations: MedAdministrationInstance[];
  order: MedicationOrder;
  columns: MedCardColumn[];
  sessionStartTime: number;
  isHighlightableColumn: boolean;
  onDeleteAdministration: (adminId: string) => void;
}

export default function MedAdministrationFormCard({
  medication,
  administrations,
  order,
  columns,
  sessionStartTime,
  isHighlightableColumn,
  onDeleteAdministration
}: MedCardProps) {
  const timelineAdministrations = (() => {
    if (!administrations || administrations.length <= 1) {
      return administrations;
    }

    const sorted = [...administrations]
      .filter((admin) => Number.isFinite(admin.adminTimeMinuteOffset))
      .sort((a, b) => a.adminTimeMinuteOffset - b.adminTimeMinuteOffset);

    if (sorted.length <= 1) {
      return administrations;
    }

    const clusters: MedAdministrationInstance[][] = [];
    for (const admin of sorted) {
      const lastCluster = clusters[clusters.length - 1];
      if (!lastCluster) {
        clusters.push([admin]);
        continue;
      }
      const prev = lastCluster[lastCluster.length - 1];
      if (Math.abs(admin.adminTimeMinuteOffset - prev.adminTimeMinuteOffset) <= 6 * 60) {
        lastCluster.push(admin);
      } else {
        clusters.push([admin]);
      }
    }

    if (clusters.length <= 1) {
      return administrations;
    }

    return clusters.reduce((best, current) => {
      if (current.length !== best.length) {
        return current.length > best.length ? current : best;
      }
      const bestMean = best.reduce((sum, x) => sum + x.adminTimeMinuteOffset, 0) / best.length;
      const currentMean = current.reduce((sum, x) => sum + x.adminTimeMinuteOffset, 0) / current.length;
      return Math.abs(currentMean) < Math.abs(bestMean) ? current : best;
    }, clusters[0]);
  })();

  // Calculate columns logic
  const processedColumns = columns.map(col => {
    const administrationsInColumn = timelineAdministrations.filter(admin => {
      const adminAbsoluteTime = new Date(sessionStartTime + admin.adminTimeMinuteOffset * 60 * 1000);
      return adminAbsoluteTime >= col.startTime && adminAbsoluteTime <= col.endTime;
    })
    return { ...col, associatedAdministrations: administrationsInColumn }
  })

  const findLastAdminTime = () => {
    if (!timelineAdministrations || timelineAdministrations.length === 0) {
      return "Never";
    }
    const filteredAdmins = timelineAdministrations.filter((admin: MedAdministrationInstance) => admin.status === "Given")
    if (filteredAdmins.length !== 0) {
      const lastAdmin = filteredAdmins.reduce((latest, current) => {
        return current.adminTimeMinuteOffset > latest.adminTimeMinuteOffset ? current : latest;
      })
      const lastAdminTime = new Date(sessionStartTime + lastAdmin.adminTimeMinuteOffset * 60 * 1000);

      return format(lastAdminTime, 'HHmm')
    }
    return "Never"
  }


  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col md:flex-row">
      {/* Left Info Panel */}
      <div className="px-4 py-3 md:w-80 lg:w-90 2xl:w-140  border-b md:border-b-0 md:border-r border-slate-100 bg-slate-50/30 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-bold text-slate-900 leading-tight">
              {renderMedTitleRow(medication, order)}
            </h4>
          </div>
          <div className="text-xs text-slate-500 space-y-1 mb-3">
            {renderMedCardDetails(medication, order)}
          </div>
          {order.instructions && (
            <div className="text-xs  text-slate-800 p-2 rounded border border-slate-200 mb-3">
              <span className="font-bold">Note:</span> {order.instructions}
            </div>
          )}

        </div>
        <div className="flex w-full justify-end gap-2 pr-4 text-sm">
          <p className="">Last Administered:</p>
          <p className="font-light">{findLastAdminTime()}</p>
        </div>
      </div>

      {/* Right Columns */}
      <div className="flex-1 grid grid-cols-6 divide-x divide-slate-100 overflow-x-auto">
        {processedColumns.map((col, colIndex) => {
          const isCurrentHour = colIndex === 3;

          return (
            <div key={colIndex} className={`flex flex-col min-w-[60px] ${isCurrentHour && isHighlightableColumn ? 'bg-blue-50/30' : ''}`}>
              <div
                key={col.colHeader}
                className="medCard-pulse"
              >
                <div className={`text-xs text-center py-1 font-mono uppercase tracking-wider border-b border-slate-100 ${isCurrentHour && isHighlightableColumn ? 'text-blue-600 font-bold' : 'text-slate-500'}`}>
                  {col.colHeader}
                </div>
              </div>

              <div className="flex-1 p-2 space-y-2 flex flex-col items-center justify-center min-h-[80px]">
                {col.associatedAdministrations?.map((admin, adminIdx) => {
                  const adminTime = new Date(sessionStartTime + admin.adminTimeMinuteOffset * 60 * 1000);
                  const adminKey = `${order.id}-col${colIndex}-i${adminIdx}-${
                    admin.id?.trim() ? admin.id : `t${admin.adminTimeMinuteOffset}`
                  }`;

                  let statusStyle = "bg-slate-100 text-slate-600 border-slate-200";
                  if (admin.status === "Given") statusStyle = "bg-green-100 text-green-700 border-green-200";
                  else if (admin.status === "Held") statusStyle = "bg-amber-100 text-amber-700 border-amber-200";
                  else if (admin.status === "Due") statusStyle = 'bg-blue-100 text-blue-700 border-blue-200'
                  else if (admin.status === "Missed") statusStyle = "bg-red-100 text-red-700 border-red-200";

                  return (
                    <div key={adminKey} className={`relative w-fit text-center p-1.5 rounded border text-xs ${statusStyle} group`}>
                      <div className="font-bold">{format(adminTime, 'HH:mm')}</div>
                      <div className="text-[10px] opacity-">{admin.status}</div>

                      <div className="absolute -top-1.5 -left-1.5 size-4 rounded-full bg-white border flex justify-center items-center">
                        <Tooltip>
                          <TooltipTrigger>
                            {admin.visibleInPresim ? (
                              <Check size={12} className="" />
                            ) : (
                              <X size={12} />
                            )
                            }
                          </TooltipTrigger>
                          <TooltipContent>
                            {admin.visibleInPresim ? (
                              <p>Visible in Pre-Sim</p>
                            ) : (
                              <p>Excluded from Pre-Sim</p>
                            )
                            }
                          </TooltipContent>
                        </Tooltip>

                      </div>
                      <button
                        onClick={() => onDeleteAdministration(admin.id!)}
                        className="absolute -top-1.5 -right-1.5 bg-white border border-slate-200 rounded-full p-0.5 text-slate-400 hover:text-red-600 hover:border-red-200 shadow-sm  transition-all"
                        title="Remove Record"
                      >
                        <Trash2 size={11} />
                      </button>
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