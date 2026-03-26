import { addHours, addMinutes, format, isSameDay, startOfHour } from "date-fns";
import type { AllMedicationTypes, InsulinMedication, MedAdministrationInstance, MedicationOrder } from "./marData";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { UserCheck, UserX } from "lucide-react";

export interface MedCardColumn {
  startTime: Date;
  endTime: Date;
  colHeader: string;
  associatedAdministrations?: MedAdministrationInstance[];
}

export const pluralize = (unitsOrdered: number, unitName: string) => {
  return unitsOrdered > 1 ? unitName + 's' : unitName
};

export const isSlidingScaleInsulin = (medication: AllMedicationTypes): medication is InsulinMedication => {
  return (
    medication.route === "SC" &&
    'bgDosing' in medication &&
    Array.isArray(medication.bgDosing) &&
    medication.bgDosing.length > 0
  );
};

export function getMedDose(medication: AllMedicationTypes, order: MedicationOrder) {
  if (isSlidingScaleInsulin(medication)) {
    return "Variable"
  } else {
    return `${medication.strength * order.unitsOrdered}${medication.strengthUnit}`
  }
}


export const renderMedTitleRow = (medication: AllMedicationTypes, order: MedicationOrder) => {
  const brandNameDisplay = `(${medication.brandName})`
  switch (medication.route) {
    case 'IV':
      if (medication.isContinuous) {
        const medTitle = `${medication.genericName} ${medication.brandName ? brandNameDisplay : ''} ${order.dose}${medication.strengthUnit} `
        return (
          <p className="font-semibold">{medTitle}</p>
        )
      }
      else {
        const diluent = `in ${medication.diluent} ${medication.totalVolume}mL`
        const medTitle = `${medication.genericName} ${medication.brandName ? brandNameDisplay : ""} ${order.dose}${medication.strengthUnit} ${medication.diluent ? diluent : ''}`
        return (
          <p className="font-semibold">{medTitle}</p>
        )
      }
    case "SC":
      if (isSlidingScaleInsulin(medication)) {
        const medTitle = `${medication.genericName} ${medication.brandName ? brandNameDisplay : ''}`
        return (
          <p className="font-semibold">{medTitle}</p>
        )
      }
      else {
        const strengthUnit = `${medication.strengthUnit === 'units' ? " units" : medication.strengthUnit}`
        const medTitle = `${medication.genericName} ${medication.brandName ? brandNameDisplay : ''} ${order.dose}${strengthUnit}`
        return (
          <p className="font font-semibold">{medTitle}</p>
        )
      }
    default:
      const medTitle = `${medication.genericName} ${medication.brandName ? brandNameDisplay : ''} ${order.dose}${medication.strengthUnit}`
      return (
        <p className="font font-semibold">{medTitle}</p>

      )
  }
}

export const renderMedCardDetails = (medication: AllMedicationTypes, order: MedicationOrder) => {
  switch (medication.route) {
    case "PO":
    case "SL":
    case "IM":
      return (
        <div className="flex gap-1.5 h-fit flex-wrap">
          <span className="text-nowrap">{medication.route}</span>
          <div className="h-5">
            <Separator className="bg-gray-300" orientation="vertical" />
          </div>
          <span className="text-nowrap">{order.dose / medication.strength} {pluralize(order.dose / medication.strength, medication.dispenseUnit)}</span>
          <div className="h-5">
            <Separator className="bg-gray-300" orientation="vertical" />
          </div>
          <span className="text-nowrap">{order.frequency}</span>
          <div className="h-5">
            <Separator className="bg-gray-300" orientation="vertical" />
          </div>
          <span className="text-nowrap">{order.priority}</span>
          <div className="h-5">
            <Separator className="bg-gray-300" orientation="vertical" />
          </div>
          <span className="text-nowrap">{order.indication}</span>
        </div>
      )
    case "IV":
      return (
        <div className="flex gap-1.5 h-fit flex-wrap">
          <span className="text-nowrap">{medication.route}</span>
          <div className="h-5">
            <Separator className="bg-gray-300" orientation="vertical" />
          </div>
          <span className="text-nowrap">{order.dose / medication.strength} {pluralize(order.dose / medication.strength, medication.dispenseUnit)}</span>
          {order.infusionRate && medication.infusionRateUnit &&
            <>
              <div className="h-5">
                <Separator className="bg-gray-300" orientation="vertical" />
              </div>
              <span className="text-nowrap">{order.infusionRate} {medication.infusionRateUnit}</span>
            </>
          }

          <div className="h-5">
            <Separator className="bg-gray-300" orientation="vertical" />
          </div>
          <span className="text-nowrap">{order.frequency}</span>
          <div className="h-5">
            <Separator className="bg-gray-300" orientation="vertical" />
          </div>
          <span className="text-nowrap">{order.priority}</span>
          <div className="h-5">
            <Separator className="bg-gray-300" orientation="vertical" />
          </div>
          <span className="text-nowrap">{order.indication}</span>
        </div>
      )
    case "SC":
      if (isSlidingScaleInsulin(medication)) {
        const doseRange = `${medication.bgDosing[0]?.units ?? '0'} - ${medication.bgDosing[medication.bgDosing.length - 1]?.units ?? 'N/A'}`;
        return (
          <div className="flex gap-1.5 h-fit flex-wrap ">
            <span className="text-nowrap">{medication.route}</span>
            <div className="h-5">
              <Separator className="bg-gray-300" orientation="vertical" />
            </div>
            <span className="text-nowrap">{doseRange} units</span>
            <div className="h-5">
              <Separator className="bg-gray-300" orientation="vertical" />
            </div>
            <span className="text-nowrap">{order.frequency}</span>
            <div className="h-5">
              <Separator className="bg-gray-300" orientation="vertical" />
            </div>
            <span className="text-nowrap">{order.priority}</span>
            <div className="h-5">
              <Separator className="bg-gray-300" orientation="vertical" />
            </div>
            <span className="text-nowrap">{order.indication}</span>
          </div>
        )
      }
    case "Inhalation": {
      return (
        <div className="flex gap-1.5 h-fit flex-wrap">
          <span className="text-nowrap">{medication.route}</span>
          <div className="h-5">
            <Separator className="bg-gray-300" orientation="vertical" />
          </div>
          <span className="text-nowrap">{order.dose / medication.strength} {pluralize(order.dose / medication.strength, medication.dispenseUnit)}</span>
          <div className="h-5">
            <Separator className="bg-gray-300" orientation="vertical" />
          </div>
          <span className="text-nowrap">{order.frequency}</span>
          <div className="h-5">
            <Separator className="bg-gray-300" orientation="vertical" />
          </div>
          <span className="text-nowrap">{order.priority}</span>
          <div className="h-5">
            <Separator className="bg-gray-300" orientation="vertical" />
          </div>
          <span className="text-nowrap">{order.indication}</span>
        </div>
      )
    }
    default:
  }
}

export function findLastAdminTime(administrations: MedAdministrationInstance[], sessionStartTime: Date) {
  if (!administrations || administrations.length === 0) {
    return (
      <div className="flex w-full justify-end gap-2 pr-4">
        <p className="text-sm">Last Administered:</p>
        <p className="text-sm font-light">Never</p>
      </div>
    )
  }
  const filteredAdmins = administrations.filter((admin: MedAdministrationInstance) => admin.status === "Given")

  if (filteredAdmins.length !== 0) {
    const lastAdmin = filteredAdmins.reduce((latest, current) => {
      return current.adminTimeMinuteOffset > latest.adminTimeMinuteOffset ? current : latest;
    })
    const lastAdminDate = addMinutes(sessionStartTime, lastAdmin.adminTimeMinuteOffset);
    const lastAdminTime = format(lastAdminDate, 'HHmm')
    const lastAdminDay = format(lastAdminDate, 'LL/dd')
    return (
      <div className="flex w-full justify-end items-end gap-2 pr-4">
        <p className="text-sm">Last Administered:</p>
        <div className="grid place-items-center">
          <p className="text-xs font-medium underline">{lastAdminDay}</p>
          <p className="text-sm font-mono tracking-tight">{lastAdminTime}</p>
        </div>
      </div>

    )
  }
  return (
    <div className="flex w-full justify-end gap-2 pr-4">
      <p className="text-sm">Last Administered:</p>
      <p className="text-sm font-light">Never</p>
    </div>
  )
}

// Helper for wristband scan badge
export const PatientStatusBadge = ({ isScanned }: { isScanned: boolean }) => {
  if (isScanned) {
    return (
      <Badge className="text-emerald-700 h-6  border-emerald-700 bg-emerald-50 rounded-xl gap-2 text-sm font-normal">
        <UserCheck className="!size-4" />
        Scanned
      </Badge>
    )
  }
  return (
    <Badge className="text-red-700 h-6 border-red-700 bg-red-50 rounded-xl gap-2 text-sm font-normal">
      <UserX className="!size-4" />
      Not Scanned
    </Badge>
  )
}

export function displayColumnShifterDate(firstCol: Date, lastCol: Date) {
  if (isSameDay(firstCol, lastCol)) {
    return format(firstCol, 'MM/dd');
  }
  return `${format(firstCol, 'MM/dd')}  –  ${format(lastCol, 'MM/dd')}`;
}

export const createColumns = (currentTime: Date, offsetHours: number, futureColCount = 2) => {
  const columnAnchor = startOfHour(currentTime);
  const columnCount = 6;
  const displayColumns: MedCardColumn[] = [];

  const startOffset = offsetHours - (columnCount - 1 - futureColCount);

  for (let i = 0; i < columnCount; i++) {
    const currentOffset = startOffset + i;

    const colStart = addHours(columnAnchor, currentOffset);
    const colEnd = addMinutes(addHours(colStart, 1), -1);

    displayColumns.push({
      startTime: colStart,
      endTime: colEnd,
      colHeader: format(colStart, 'HHmm')
    });
  }

  return displayColumns;
};