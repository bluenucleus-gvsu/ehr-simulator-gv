import { addHours, addMinutes, differenceInHours, differenceInMinutes, format, isSameDay, isWithinInterval, startOfHour, endOfHour, min, max } from "date-fns";
import type { AllMedicationTypes, InjectableMedication, InsulinMedication, IvMedication, MedAdministrationInstance, MedicationOrder, OralMedication } from "./marData";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { UserCheck, UserX } from "lucide-react";
import { DatabaseMedication } from "@/actions/simulation";

type AdminTimeLike = {
  status?: string | null;
  time_offset?: number | null;
  adminTimeMinuteOffset?: number | null;
};

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
  return (medication.route === "SC" && medication.isVariableDose);
};


export function getMedDose(medication: AllMedicationTypes, order: MedicationOrder) {
  if (isSlidingScaleInsulin(medication) || medication.genericName === 'heparin sodium') {
    return "Variable"
  } else {

    const doseText = order.dose ?
      `${(order.dose / medication.strength) * medication.strength}${medication.strengthUnit}`
      : 'Dose Unknown'
    return doseText;
  }
}

export const renderMedTitleRow = (medication: AllMedicationTypes, order: MedicationOrder) => {
  // 1. Format the base medication name
  const nameParts = [
    medication.genericName,
    medication.brandName ? `(${medication.brandName})` : null,
  ];

  // 2. Format the dose/strength string
  const unitStr = medication.strengthUnit === 'units' ? ' units' : medication.strengthUnit;
  let doseStr: string | null = `${order.dose}${unitStr}`;

  if (medication.genericName === 'heparin sodium') {
    // Heparin continuous infusions use strength rather than a fixed order dose
    doseStr = `${medication.strength}${unitStr}`;
  } else if (isSlidingScaleInsulin(medication)) {
    // Sliding scale insulin omits the dose in the title row
    doseStr = null;
  }

  // 3. Format IV diluent
  const diluentStr = (medication.route === 'IV' && medication.diluent)
    ? `in ${medication.diluent} ${medication.totalVolume}mL`
    : null;

  // 4. Assemble and render
  const fullTitle = [...nameParts, doseStr, diluentStr]
    .filter(Boolean)
    .join(' ');

  return <p className="font-semibold">{fullTitle}</p>;
};

function renderMedCardHelper(order: MedicationOrder) {
  return (
    <>
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
    </>
  )
}

function renderIvMedDetails(order: MedicationOrder, medication: IvMedication) {
  const doseDetails = !medication.isVariableDose && order.dose ?
    `${order.dose / medication.strength} ${pluralize(order.dose / medication.strength, medication.dispenseUnit)}`
    : 'Variable Dose'

  return (
    <div className="flex gap-1.5 h-fit flex-wrap">
      <span className="text-nowrap">{medication.route}</span>
      <div className="h-5">
        <Separator className="bg-gray-300" orientation="vertical" />
      </div>
      <span className="text-nowrap">{doseDetails}</span>
      {/* Include infusion rate and units if both present */}
      {order.infusionRate && medication.infusionRateUnit &&
        <>
          <div className="h-5">
            <Separator className="bg-gray-300" orientation="vertical" />
          </div>
          <span className="text-nowrap">{order.infusionRate} {medication.infusionRateUnit}</span>
        </>
      }
      {renderMedCardHelper(order)}
    </div>
  )
}

export const renderMedCardDetails = (medication: AllMedicationTypes, order: MedicationOrder) => {
  switch (medication.route) {

    case "SC":
      if (isSlidingScaleInsulin(medication)) {
        const doseRange = `0 - 18`;
        return (
          <div className="flex gap-1.5 h-fit flex-wrap ">
            <span className="text-nowrap">{medication.route}</span>
            <div className="h-5">
              <Separator className="bg-gray-300" orientation="vertical" />
            </div>
            <span className="text-nowrap">{doseRange} Units</span>
            {renderMedCardHelper(order)}
          </div>
        )
      }
    // Non-sliding scale insulin falls through to next case
    case "PO":
    case "SL":
    case "IM":
    case "Inhalation":
      const doseText = order.dose ?
        `${order.dose / medication.strength} ${pluralize(order.dose / medication.strength, medication.dispenseUnit)}`
        : 'Variable Dose'
      return (
        <div className="flex gap-1.5 h-fit flex-wrap">
          <span className="text-nowrap">{medication.route}</span>
          <div className="h-5">
            <Separator className="bg-gray-300" orientation="vertical" />
          </div>

          <span className="text-nowrap">{doseText}</span>
          {renderMedCardHelper(order)}
        </div>
      )
    case "IV":
      return (
        renderIvMedDetails(order, medication)
      )
    default:
  }
}


export function findLastAdminTime(administrations: AdminTimeLike[], sessionStartTime: Date) {
  if (!administrations || administrations.length === 0) {
    return (
      <div className="flex w-full justify-end gap-2 pr-4">
        <p className="text-sm">Last Administered:</p>
        <p className="text-sm font-light">Never</p>
      </div>
    )
  }
  const filteredAdmins = administrations.filter((admin) => admin.status === "Given")

  if (filteredAdmins.length !== 0) {
    const lastAdmin = filteredAdmins.reduce((latest, current) => {
      const currentOffset = current.adminTimeMinuteOffset ?? current.time_offset ?? Number.NEGATIVE_INFINITY;
      const latestOffset = latest.adminTimeMinuteOffset ?? latest.time_offset ?? Number.NEGATIVE_INFINITY;
      return currentOffset > latestOffset ? current : latest;
    })
    const lastAdminOffset = lastAdmin.adminTimeMinuteOffset ?? lastAdmin.time_offset ?? 0;
    const lastAdminDate = addMinutes(sessionStartTime, lastAdminOffset);
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
    const colEnd = endOfHour(colStart);

    displayColumns.push({
      startTime: colStart,
      endTime: colEnd,
      colHeader: format(colStart, 'HHmm')
    });
  }

  return displayColumns;
};

/** Shared MAR grid: session T+0 + minute offsets, same rules in case builder and simulation. */
export function buildMarDisplayColumns(
  sessionStart: Date,
  elapsedSimMinutes: number,
  columnOffsetHours: number,
  adminMinuteOffsets: number[],
  futureColCount = 2,
): MedCardColumn[] {
  const currentSimTime = addMinutes(sessionStart, elapsedSimMinutes);
  const adminTimes = adminMinuteOffsets
    .filter((o) => Number.isFinite(o))
    .map((o) => addMinutes(sessionStart, o));
  return createColumnsIncludingAdminTimes(
    currentSimTime,
    columnOffsetHours,
    adminTimes,
    futureColCount,
  );
}

/** Shift the MAR window when case-authored admin times fall outside the default columns. */
export function createColumnsIncludingAdminTimes(
  currentTime: Date,
  offsetHours: number,
  adminTimes: Date[],
  futureColCount = 2,
): MedCardColumn[] {
  const base = createColumns(currentTime, offsetHours, futureColCount);
  if (adminTimes.length === 0) return base;

  const windowStart = base[0].startTime;
  const windowEnd = base[base.length - 1].endTime;
  const allInside = adminTimes.every((t) =>
    isWithinInterval(t, { start: windowStart, end: windowEnd }),
  );
  if (allInside) return base;

  const earliest = min(adminTimes);
  const latest = max(adminTimes);
  const midAdmin = addMinutes(earliest, Math.round(differenceInMinutes(latest, earliest) / 2));
  const columnCount = 6;
  const startOffset =
    differenceInHours(startOfHour(midAdmin), startOfHour(currentTime)) -
    (columnCount - 1 - futureColCount);

  return createColumns(currentTime, startOffset, futureColCount);
};

export function caseAdministrationTime(
  admin: {
    time_offset?: number | null;
    adminTimeMinuteOffset?: number | null;
    source_type?: string | null;
    case_session_id?: string | null;
  },
  sessionStart: Date,
): Date {
  const offset = admin.time_offset ?? admin.adminTimeMinuteOffset ?? 0;
  return addMinutes(sessionStart, offset);
}

export function mapDatabaseMedToFrontend(dbMed: DatabaseMedication): AllMedicationTypes {
  const dispenseUnit =
    dbMed.dispense_units?.name?.trim() ||
    inferDispenseUnitFromRoute(dbMed.route) ||
    "Unknown";

  // 1. Extract the base properties common to ALL medications
  const baseMed = {
    id: dbMed.id,
    genericName: dbMed.generic_name,
    brandName: dbMed.brand_name || undefined,
    route: dbMed.route,
    strength: dbMed.strength,
    strengthUnit: dbMed.strength_unit,
    dispenseUnit,
    isVariableDose: Boolean(dbMed.is_variable_dose),
  };

  // 2. Narrow based on the route
  switch (dbMed.route) {
    case "IV":
      return {
        ...baseMed,
        route: "IV",
        infusionRateUnit: (dbMed.infusion_rate_unit as "mL/hr" | "mg/hr" | "units/hr") || undefined,
        diluent: dbMed.diluent || undefined,
        totalVolume: dbMed.total_volume || undefined,
      } as IvMedication;

    case "PO":
      return {
        ...baseMed,
        route: "PO",
      } as OralMedication;

    case "SC":
      if (dbMed.is_variable_dose) {
        return {
          ...baseMed,
        } as InsulinMedication;
      }
      return {
        ...baseMed,
        route: "SC",
      } as InjectableMedication;

    default:
      return baseMed as AllMedicationTypes;
  }
}

function inferDispenseUnitFromRoute(route: string | null | undefined): string | undefined {
  switch (route) {
    case "PO":
      return "Tablet";
    case "IV":
      return "Bag";
    case "SC":
    case "IM":
      return "Syringe";
    case "Inhalation":
      return "Puff";
    default:
      return undefined;
  }
}
