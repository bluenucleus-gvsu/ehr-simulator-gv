import { AllMedicationTypes, MedicationOrder } from "./marData";
import { isSlidingScaleInsulin, pluralize } from "@/lib/medications";

export const MedCardTitle = (medication: AllMedicationTypes, order: MedicationOrder) => {
  const unitsWithoutSpace = new Set(['mg', 'mcg', 'g', 'mEq', 'mL']);

  const nameParts = [
    medication.genericName,
    medication.brandName ? `(${medication.brandName})` : null,
  ];

  const unitStr = unitsWithoutSpace.has(medication.strengthUnit) ? medication.strengthUnit : ` ${pluralize(order.dose, medication.strengthUnit)}`;
  let doseStr: string | null = `${order.dose}${unitStr}`;

  if (medication.genericName === 'heparin sodium') {
    doseStr = `${medication.strength}${unitStr}`;
  } else if (isSlidingScaleInsulin(medication)) {
    doseStr = null;
  }

  const diluentStr = (medication.route === 'IV' && medication.diluent)
    ? `in ${medication.diluent} ${medication.totalVolume}mL`
    : null;

  const fullTitle = [...nameParts, doseStr, diluentStr]
    .filter(Boolean)
    .join(' ');

  return <p className="font-semibold">{fullTitle}</p>;
};