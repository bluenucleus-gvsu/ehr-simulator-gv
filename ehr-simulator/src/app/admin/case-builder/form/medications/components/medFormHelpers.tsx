import { AllMedicationTypes, MedicationOrder } from "@/app/simulation/[caseId]/[sessionId]/chart/mar/components/marData"
import { isSlidingScaleInsulin, pluralize } from "@/app/simulation/[caseId]/[sessionId]/chart/mar/components/marHelpers"
import { Separator } from "@/components/ui/separator"

export const renderMedFormTitle = (medication: AllMedicationTypes) => {
  const brandNameDisplay = `(${medication.brandName})`
  switch (medication.route) {
    case 'IV':
      const diluent = `in ${medication.diluent} ${medication.totalVolume}mL`
      if (medication.genericName !== 'heparin sodium') {
        const ivTitle = `${medication.genericName} ${medication.brandName ? brandNameDisplay : ""} ${medication.strength}${medication.strengthUnit} ${medication.diluent ? diluent : ''}`
        return (
          <p className="font-semibold">{ivTitle}</p>
        )
        // handle continuous Heparin infusion, which has no fixed dose
      } else if (medication.genericName === 'heparin sodium') {
        const unitName = (medication.strengthUnit === 'units') ? ' units' : medication.strengthUnit;
        const ivTitle = `${medication.genericName} ${medication.brandName ? brandNameDisplay : ""} ${medication.strength}${unitName} ${medication.diluent ? diluent : ''}`
        return (
          <p className="font-semibold">{ivTitle}</p>
        )
      }

    case "SC":
      if (medication.isVariableDose) {
        const medTitle = `${medication.genericName} ${medication.brandName ? brandNameDisplay : ''}`
        return (
          <p className="font-semibold">{medTitle}</p>
        )
      }
      else {
        const strengthUnit = `${medication.strengthUnit === 'units' ? " units" : medication.strengthUnit}`
        const medTitle = `${medication.genericName} ${medication.brandName ? brandNameDisplay : ''} ${medication.strength}${strengthUnit}`
        return (
          <p className="font font-semibold">{medTitle}</p>
        )
      }

    default:
      const medTitle = `${medication.genericName} ${medication.brandName ? brandNameDisplay : ''} ${medication.strength}${medication.strengthUnit}`
      return (
        <p className="font font-semibold">{medTitle}</p>

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
      const doseText = medication.isVariableDose ? 'Variable Dose' : `${orderedUnits} ${pluralize(orderedUnits, medication.dispenseUnit)}`
      return (
        <div className="flex gap-2 h-5">
          <span className="text-nowrap">{medication.route}</span>
          <Separator className="bg-gray-300" orientation="vertical" />
          <span className="text-nowrap">
            {doseText}
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
        const doseRange = `0 - 18`;
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