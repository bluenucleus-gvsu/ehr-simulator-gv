import type { AllMedicationTypes, IvMedication, MedicationOrder } from "./marData";
import { Separator } from "@/components/ui/separator";
import { isSlidingScaleInsulin } from "@/lib/medications";

function renderBaseMedCardDetails(order: MedicationOrder) {
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
      {order.indication &&
        (<>
          <div className="h-5">
            <Separator className="bg-gray-300" orientation="vertical" />
          </div>
          <span className="text-nowrap">{order.indication}</span>
        </>
        )}
    </>
  )
}

function renderIvMedDetails(order: MedicationOrder, medication: IvMedication) {
  return (
    <div className="flex gap-1.5 h-fit flex-wrap">
      <span className="text-nowrap">{medication.route}</span>
      {/* Include infusion rate and units if both present */}
      {order.infusionRate && medication.infusionRateUnit &&
        <>
          <div className="h-5">
            <Separator className="bg-gray-300" orientation="vertical" />
          </div>
          <span className="text-nowrap">{order.infusionRate} {medication.infusionRateUnit}</span>
        </>
      }
      {renderBaseMedCardDetails(order)}
    </div>
  )
}

export const MedCardDetailRow = (medication: AllMedicationTypes, order: MedicationOrder) => {
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
            {renderBaseMedCardDetails(order)}
          </div>
        )
      }
    // Non-sliding scale insulin falls through to next case
    case "PO":
    case "SL":
    case "IM":
    case "Inhalation":
      return (
        <div className="flex gap-1.5 h-fit flex-wrap">
          <span className="text-nowrap">{medication.route}</span>
          {renderBaseMedCardDetails(order)}
        </div>
      )
    case "IV":
      return (
        renderIvMedDetails(order, medication)
      )
    default:
  }
};