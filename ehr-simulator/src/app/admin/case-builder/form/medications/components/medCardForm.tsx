import { type AllMedicationTypes, type MedicationOrder } from "@/app/simulation/[caseId]/[sessionId]/chart/mar/components/marData"
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isSlidingScaleInsulin } from "@/app/simulation/[caseId]/[sessionId]/chart/mar/components/marHelpers";
import { Textarea } from "@/components/ui/textarea";
import { renderMedFormDetails, renderMedFormTitle } from "./medFormHelpers";
import { X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

const medicationFrequencies = [
  { value: 'QD', label: 'QD (Once Daily)' },
  { value: 'BID', label: 'BID (Twice Daily)' },
  { value: 'TID', label: 'TID (Three Times Daily)' },
  { value: 'QID', label: 'QID (Four Times Daily)' },
  { value: 'Q1H', label: 'Q1H (Every 1 Hours)' },
  { value: 'Q2H', label: 'Q2H (Every 2 Hours)' },
  { value: 'Q3H', label: 'Q3H (Every 3 Hours)' },
  { value: 'Q4H', label: 'Q4H (Every 4 Hours)' },
  { value: 'Q6H', label: 'Q6H (Every 6 Hours)' },
  { value: 'Q8H', label: 'Q8H (Every 8 Hours)' },
  { value: 'Q12H', label: 'Q12H (Every 12 Hours)' },
  { value: 'Q24H', label: 'Q24H (Every 24 Hours)' },
  { value: 'ACHS', label: 'ACHS' },
  { value: 'DAILY', label: 'Daily (Every Day)' },
  { value: 'ONCE', label: 'Once (Single Dose)' },
  { value: 'CONTINUOUS', label: 'Continuous Infusion (For IV drips)' }
];

interface MedAdminCardProps {
  medication: AllMedicationTypes;
  handleMedicationRemoval: (index: number) => void;
  index: number;
  order: MedicationOrder; // Data comes from parent
  onOrderChange: (index: number, field: keyof MedicationOrder, value: string | boolean) => void;
}

const MedCardForm = ({
  medication,
  handleMedicationRemoval,
  index,
  order: orderData,
  onOrderChange
}: MedAdminCardProps) => {

  const isSlidingScaleInsulinMed = isSlidingScaleInsulin(medication)

  return (
    <div className="border bg-white rounded-2xl w-full p-0 overflow-hidden flex-shrink-0 relative shadow">
      <button onClick={() => handleMedicationRemoval(index)} className="group rounded-full hover:bg-red-200 absolute top-2 right-2">
        <X size={18} className="group-hover:text-red-800" />
      </button>
      <div className="grid grid-cols-2 gap-4">
        <div className=" flex flex-col justify-between py-3 pl-6 space-y-4">
          <div className="space-y-1">
            {renderMedFormTitle(medication)}
            <div className="text-xs tracking-tight pb-2 text-gray-500">
              {renderMedFormDetails(medication, orderData)}
            </div>

          </div>
          <div className="flex items-center space-x-2 border rounded-md w-fit p-2 bg-blue-50/50">
            <Checkbox
              id={`${index}-presim-check`}
              checked={!orderData.visibleInPresim}
              onCheckedChange={(checked) => onOrderChange(index, 'visibleInPresim', !checked)}
              className="bg-white"
            />
            <Label htmlFor={`${index}-presim-check`}>Excluded from Pre-Sim</Label>
          </div>

          <div>
            <div className="">
              <h2 className="font-light">Administration Instructions:</h2>
              <Textarea
                value={orderData.instructions || ''}
                onChange={(e) => onOrderChange(index, 'instructions', e.target.value)}
                className="min-h-20 bg-white"
              />
            </div>
          </div>

          {(isSlidingScaleInsulinMed) && (
            <div className="overflow-hidden rounded-lg border w-fit">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-2 py-1 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      BG Range (mg/dL)
                    </th>
                    <th scope="col" className="px-2 py-1 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Correction Units
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {medication.bgDosing.map((dose, index) => (
                    <tr key={`${index}-${medication.id}`} className={index % 2 === 0 ? '' : 'bg-gray-50'}>
                      <td className="whitespace-nowrap px-2 py-1 text-xs text-gray-800 font-mono">{dose.bgRange}</td>
                      <td className="whitespace-nowrap px-2 py-1 text-xs text-gray-800 font-mono">{dose.units}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
        <div className="grid grid-cols-2 py-4 px-2 gap-x-2 gap-y-6 place-items-start-start">
          {!isSlidingScaleInsulinMed &&
            <div className="w-full space-y-1">
              <Label>Dose</Label>
              <div className="flex items-end">
                <Input
                  onChange={(e) => onOrderChange(index, 'dose', e.target.value)}
                  value={orderData.dose || ''}
                  className="text-sm bg-white w-16 border px-3 py-2 rounded-r-none shadow-xs focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-gray-200"
                />
                <div className="h-9 bg-white border border-l-0 rounded-r-lg border-gray-200 p-2 shadow-xs">
                  <p className="text-sm">{medication.strengthUnit}</p>
                </div>
              </div>
            </div>
          }

          {medication.route === "IV" && medication.infusionRateUnit &&
            <div className="w-full space-y-1">
              <Label>Rate</Label>
              <div className="flex items-end">
                <Input
                  onChange={(e) => onOrderChange(index, 'infusionRate', e.target.value)}
                  value={orderData.infusionRate || ''}
                  className="text-sm w-16 border bg-white px-3 py-2 rounded-r-none shadow-xs focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-gray-200"
                />
                <div className="h-9 bg-white border border-l-0 rounded-r-lg border-gray-200 p-2 shadow-xs">
                  <p className="text-sm ">{medication.infusionRateUnit}</p>
                </div>
              </div>
            </div>
          }

          <div className="w-full space-y-1">
            <Label htmlFor={`Priority-${index}`}>Priority</Label>
            <select
              id={`Priority-${index}`}
              className="border border-gray-200 bg-white h-9 rounded-md px-2 shadow-xs w-full text-xs"
              value={orderData.priority || ''}
              onChange={(e) => onOrderChange(index, 'priority', e.target.value as MedicationOrder['priority'])}
            >
              <option hidden disabled value=''>Select priority</option>
              <option value="STAT">STAT</option>
              <option value="NOW">NOW</option>
              <option value="Routine">Routine</option>
              <option value="PRN">PRN</option>
            </select>
          </div>

          <div className="w-full space-y-1">
            <Label htmlFor={`Frequency-${index}`}>Frequency</Label>
            <select
              id={`Frequency-${index}`}
              className="border border-gray-200 h-9 bg-white rounded-md px-2 shadow-xs w-full text-xs"
              value={orderData.frequency || ''}
              onChange={(e) => onOrderChange(index, 'frequency', e.target.value)}
            >
              <option hidden disabled value=''>Select frequency</option>
              {
                medicationFrequencies.map(item =>
                  <option className="text-md" key={`${item.value}-${medication.id}`} value={item.value}>{item.label}</option>
                )
              }
            </select>
          </div>

          <div className="w-full space-y-1">
            <Label>Indication</Label>
            <Input
              value={orderData.indication || ''}
              onChange={(e) => onOrderChange(index, 'indication', e.target.value)}
              className="bg-white sm:text-xs md:text-xs"
            />
          </div>

          <div className="w-full space-y-1">
            <Label>Ordering Provider</Label>
            <Input
              value={orderData.orderingProvider || ''}
              onChange={(e) => onOrderChange(index, 'orderingProvider', e.target.value)}
              className="bg-white sm:text-xs md:text-xs"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default MedCardForm