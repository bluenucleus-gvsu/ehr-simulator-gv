import { AllMedicationTypes, MedicationOrder } from "@/app/simulation/[sessionId]/chart/mar/components/marData"
import { isSlidingScaleInsulin, pluralize } from "@/app/simulation/[sessionId]/chart/mar/components/marHelpers"
import { Separator } from "@/components/ui/separator"

export const renderMedFormTitle = (medication: AllMedicationTypes) => {

  if (medication.route == "IV" && medication.isContinuous) {
    return (
      <div className="flex flex-wrap gap-2 h-fit font-semibold">
        <span className="text-nowrap">{medication.genericName}</span>
        {medication.brandName && (
          <span className="text-nowrap">({medication.brandName})</span>
        )}
        <span className="text-nowrap">{medication.strength}{medication.strengthUnit}</span>
      </div>
    )
  }
  if (medication.route == "IV" && !medication.isContinuous) {
    return (
      <div className="flex flex-wrap gap-1.5 h-fit font-semibold">
        <span className="text-nowrap">{medication.genericName}</span>
        {medication.brandName && (
          <span className="text-nowrap">({medication.brandName})</span>
        )}
        <span className="text-nowrap">{medication.strength}{medication.strengthUnit}</span>
        {medication.diluent &&
          <span className="text-nowrap">in {medication.diluent} {medication.totalVolume}mL</span>
        }
      </div>
    )
  }
  if (isSlidingScaleInsulin(medication)) {
    return (
      <div className="flex flex-wrap gap-2 h-fit font-semibold">
        <span className="text-nowrap">{medication.genericName}</span>
        {medication.brandName && (
          <span className="text-nowrap">({medication.brandName})</span>
        )}
      </div>
    )
  }
  else {
    return (
      <div className="flex flex-wrap gap-2 h-fit font-semibold">
        <span className="text-nowrap">{medication.genericName}</span>
        {medication.brandName && (
          <span className="text-nowrap">({medication.brandName})</span>
        )}
        <span className="text-nowrap">{medication.strength}{medication.strengthUnit}</span>
      </div>
    )
  }
}


export const renderMedFormDetails = (
  medication: AllMedicationTypes,
  order: Partial<MedicationOrder>
) => {
  // Helper to safely get values or return an empty string/default
  const orderedUnits = order.dose ? order.dose / medication.strength : 0;
  const freq = order.frequency || "___"; // Placeholder if not set
  const indic = order.indication || "___";
  const priority = order.priority || "___"

  switch (medication.route) {
    case "PO":
      return (
        <div className="flex gap-2 h-5">
          <span className="text-nowrap">{medication.route}</span>
          <Separator className="bg-gray-300" orientation="vertical" />
          <span className="text-nowrap">
            {orderedUnits} {pluralize(orderedUnits, medication.dispenseUnit)}
          </span>
          <Separator className="bg-gray-300" orientation="vertical" />
          <span className="text-nowrap">{freq}</span>
          <Separator className="bg-gray-300" orientation="vertical" />
          <span className="text-nowrap">{priority}</span>
          <Separator className="bg-gray-300" orientation="vertical" />
          <span className="text-nowrap">{indic}</span>
        </div>
      );

    case "IV":
      const rate = order.infusionRate || 0;
      return (
        <div className="flex gap-2 h-5">
          <span className="text-nowrap">{medication.route}</span>
          <Separator className="bg-gray-300" orientation="vertical" />
          <span className="text-nowrap">
            {orderedUnits} {pluralize(orderedUnits, medication.dispenseUnit)}
          </span>
          {/* Only show rate if it's relevant (unit exists and rate is set) */}
          {medication.infusionRateUnit && rate > 0 && (
            <>
              <Separator className="bg-gray-300" orientation="vertical" />
              <span className="text-nowrap">
                {rate} {medication.infusionRateUnit}
              </span>
            </>
          )}
          <Separator className="bg-gray-300" orientation="vertical" />
          <span className="text-nowrap">{freq}</span>
          <Separator className="bg-gray-300" orientation="vertical" />
          <span className="text-nowrap">{priority}</span>
          <Separator className="bg-gray-300" orientation="vertical" />
          <span className="text-nowrap">{indic}</span>
        </div>
      );

    case "SC":
      if (isSlidingScaleInsulin(medication)) {
        const doseRange = `${medication.bgDosing[0]?.units ?? "0"} - ${medication.bgDosing[medication.bgDosing.length - 1]?.units ?? "N/A"
          }`;
        return (
          <div className="flex gap-2 h-5">
            <span className="text-nowrap">{medication.route}</span>
            <Separator className="bg-gray-300" orientation="vertical" />
            <span className="text-nowrap">{doseRange} units</span>
            <Separator className="bg-gray-300" orientation="vertical" />
            <span className="text-nowrap">{freq}</span>
            <Separator className="bg-gray-300" orientation="vertical" />
            <span className="text-nowrap">{priority}</span>
            <Separator className="bg-gray-300" orientation="vertical" />
            <span className="text-nowrap">{indic}</span>
          </div>
        );
      } else {
        // Fallback for non-insulin SC meds (like Lovenox)
        return (
          <div className="flex gap-2 h-5">
            <span className="text-nowrap">{medication.route}</span>
            <Separator className="bg-gray-300" orientation="vertical" />
            <span className="text-nowrap">
              {orderedUnits} {pluralize(orderedUnits, medication.dispenseUnit)}
            </span>
            <Separator className="bg-gray-300" orientation="vertical" />
            <span className="text-nowrap">{freq}</span>
            <Separator className="bg-gray-300" orientation="vertical" />
            <span className="text-nowrap">{priority}</span>
            <Separator className="bg-gray-300" orientation="vertical" />
            <span className="text-nowrap">{indic}</span>
          </div>
        );
      }

    // Default case for Inhalation, Topical, IM, etc.
    default:
      return (
        <div className="flex gap-2 h-5">
          <span className="text-nowrap">{medication.route}</span>
          <Separator className="bg-gray-300" orientation="vertical" />
          <span className="text-nowrap">
            {orderedUnits} {pluralize(orderedUnits, medication.dispenseUnit)}
          </span>
          <Separator className="bg-gray-300" orientation="vertical" />
          <span className="text-nowrap">{freq}</span>
          <Separator className="bg-gray-300" orientation="vertical" />
          <span className="text-nowrap">{priority}</span>
          <Separator className="bg-gray-300" orientation="vertical" />
          <span className="text-nowrap">{indic}</span>
        </div>
      );
  }
};