import { addMinutes, format } from "date-fns";
import { medActionSelections, type AllMedicationTypes, type MedicationOrder } from "./marData"
import MedAdminCardSelector from "./medAdminCardSelector";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { renderMedTitleRow, renderMedCardDetails, isSlidingScaleInsulin } from "./marHelpers";
import { Button } from "@/components/ui/button";
import { AlertCircle, X } from "lucide-react";
import { DecimalInput } from "./decimalInput";
import { DatabaseMedAdministration, StudentMedicationAdministration } from "@/actions/simulation";
import MedAdminCardTable, { insulinTable } from "./medAdminCardTable";
import { HeparinBolusCalculator, HeparinInfusionCalculator } from "./heparinModule";

interface MedAdminCardProps {
  medication: AllMedicationTypes;
  administrations: DatabaseMedAdministration[];
  order: MedicationOrder;
  sessionStart: Date;
  elapsedMinutes: number;
  onStatusChange: (status: string) => void;
  currentStatus: string
  onDoseChange: (administered_dose: number) => void;
  currentDose: number;
  onCommentChange: (comment: string) => void;
  currentComment: string;
  onOrderRemove: (id: string) => void;
  administrationInfusionRate: number | undefined;
  onInfusionRateChange: (rate: number) => void;
}

// helper function to get the last few times the med was given
const getPreviousAdministrations = (administrations: DatabaseMedAdministration[], prevAdmins: number) => {
  if (!administrations || administrations.length === 0) {
    // intentionally return empty med administration object to indicate no previous administrations
    return [{ medication_order_id: "", administrator: "", time_offset: 0, status: "Held" } as StudentMedicationAdministration];
  }
  const filteredAdmins = administrations.filter(admin => admin.status === "Given" && admin.time_offset !== null)

  if (filteredAdmins.length === 0) {
    return [{ medication_order_id: "", administrator: "", time_offset: 0, status: "Held" } as StudentMedicationAdministration]
  }
  filteredAdmins.sort((a, b) => (a.time_offset ?? 0) - (b.time_offset ?? 0));
  return filteredAdmins.slice(-prevAdmins)
}

const MedAdminCard = ({
  medication,
  administrations,
  order,
  sessionStart,
  elapsedMinutes,
  onStatusChange,
  currentStatus,
  onDoseChange,
  currentDose,
  onCommentChange,
  currentComment,
  onOrderRemove,
  administrationInfusionRate: infusionRate,
  onInfusionRateChange
}: MedAdminCardProps) => {

  const handleStatusChange = (newStatus: string) => {
    onStatusChange(newStatus)
  }

  const handleCommentChange = (comment: string) => {
    onCommentChange(comment)
  }

  const handleOrderRemove = (id: string) => {
    onOrderRemove(id)
  }

  const threePrevAdministrations = getPreviousAdministrations(administrations, 3);
  const isSlidingScaleInsulinMed = isSlidingScaleInsulin(medication)
  const isHeparinContinuous = medication.route === 'IV' && medication.genericName === 'heparin sodium' && medication.diluent;
  const isHeparinBolus = medication.route === 'IV' && medication.genericName === 'heparin sodium' && !medication.diluent;
  const isOverdose = order.dose ? currentDose > order.dose : false;
  const useAdministrationInfusionRate = !order.infusionRate;
  return (
    <div className="relative grid grid-cols-2 gap-6 border bg-white rounded-2xl w-full p-0 overflow-hidden flex-shrink-0 shadow">
      <div className=" flex flex-col justify-between py-3 pl-6 space-y-4">
        <div className="space-y-1">
          {renderMedTitleRow(medication, order)}
          <div className="text-xs ml-2 tracking-tight pb-2 text-gray-500">
            {renderMedCardDetails(medication, order)}
          </div>
        </div>

        {order.instructions && (
          <div className="text-sm font-light bg-white text-slate-800 p-2 rounded border border-slate-200 mb-3">
            <span className="font-medium">Administration Instructions:</span> {order.instructions}
          </div>
        )}

        {isSlidingScaleInsulinMed && (
          <MedAdminCardTable table={insulinTable} />
        )}

        {isHeparinContinuous && (
          <HeparinInfusionCalculator />
        )}

        {isHeparinBolus && (
          <HeparinBolusCalculator />
        )}


        <div>
          <h2 className="font-light pb-1">Previous Administrations:</h2>
          <div className="flex gap-4 pl-2">
            {threePrevAdministrations.map((admin, index) => {
              // if no administrations recorded for this medication
              if (!admin.medication_order_id) {
                return (
                  <p key={index} className="px-2 py-1 bg-gray-100 rounded-lg border border-gray-300 text-gray-700 text-xs">Never</p>
                )
              }
              const adminTime = addMinutes(sessionStart, admin.time_offset ?? 0);
              const statusStyle = "bg-green-100 text-green-700 border-green-200";

              return (
                <div key={`${admin.medication_order_id}-${index}`} className={`w-fit text-center p-1 rounded border text-xs ${statusStyle}`}>
                  <div className="font-bold">{format(adminTime, 'HH:mm')}</div>
                  <div className="text-xs">{admin.status}</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <Button
        variant="ghost" size="icon" className="absolute top-1 right-2 h-6 w-6 text-gray-400 hover:text-red-600"
        onClick={() => handleOrderRemove(order.id)}
      >
        <X size={14} />
      </Button>

      <div className="grid grid-cols-3 py-4 px-2 gap-y-4 content-start">
        <MedAdminCardSelector
          options={medActionSelections}
          value={currentStatus}
          onValueChange={handleStatusChange}
          label="Action"
        />
        <div className="w-full space-y-1">
          <Label>Route</Label>
          <p className="text-sm w-fit border px-3 py-2 rounded-lg shadow-xs">
            {medication.route}
          </p>
        </div>
        <div className={`w-full space-y-1 `}>
          <Label>Dose</Label>
          <div className="flex group items-end h-9">
            <DecimalInput isOverdose={isOverdose} onValueChange={onDoseChange} value={currentDose} />
            <div className={`h-9 bg-gray-50  border-l-0 rounded-r-lg p-2 shadow-xs ${isOverdose ? "outline-2 outline-red-700 group-focus-within:outline-2 bg-red-50" : "border border-gray-200 group-focus-within:outline-2"}`}>
              <p className="text-sm">{medication.strengthUnit}</p>
            </div>
          </div>
          {isOverdose &&
            <div className="flex gap-2 pt-1">
              <AlertCircle className="text-red-700 size-4"></AlertCircle>
              <p className="text-red-700 text-xs ">Dose greater than ordered</p>
            </div>
          }

        </div>
        {((medication.route === "IV" && order.infusionRate) || isHeparinContinuous) && (
          <div className="w-full space-y-1">
            <Label>Rate</Label>
            <div className="flex group items-end h-9">
              <DecimalInput
                value={useAdministrationInfusionRate ? infusionRate : order.infusionRate}
                onValueChange={onInfusionRateChange}
                isOverdose={false}
              />
              <div className="h-9 bg-gray-50  border-l-0 rounded-r-lg p-2 shadow-xs border border-gray-200 group-focus-within:outline-2">
                <p className="text-sm">{medication.infusionRateUnit}</p>
              </div>
            </div>
          </div>
        )
        }
        <div className="w-full space-y-1">
          <Label>Date</Label>
          <p className="text-sm w-fit border px-3 py-2 rounded-lg shadow-xs">
            {format(sessionStart, 'P')}
          </p>
        </div>
        <div className="w-full space-y-1">
          <Label>Time</Label>
          <p className="text-sm w-fit border px-3 py-2 rounded-lg shadow-xs">
            {format(addMinutes(sessionStart, elapsedMinutes), 'HHmm')}
          </p>
        </div>
        <div className="w-full space-y-1">
          <Label>Comments</Label>
          <Input className="text-sm w-full" onChange={(e) => handleCommentChange(e.target.value)} value={currentComment} />
        </div>
      </div>
    </div>
  )
}

export default MedAdminCard