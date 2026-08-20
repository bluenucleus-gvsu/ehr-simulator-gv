'use client'
import { useMemo, useState } from "react"
import {
  Pill,
  Search,
  Tablets
} from "lucide-react"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { AllMedicationTypes, MedicationOrder } from "@/app/simulation/[caseId]/[sessionId]/chart/mar/components/marData"
import Combobox from "@/components/ui/combobox"
import MedCardForm from "./components/medCardForm"
import { useRouter } from "next/navigation"
import { useFormContext } from "@/context/FormContext"
import { FormShell } from "../../components/formShell"
import { CaseSection } from "@/lib/saveCase"
import { saveCaseData } from "@/actions/case_builder/caseBuilder"
import { caseBuilderPath } from "@/lib/caseBuilder/routes"

function getComboboxData(medications: AllMedicationTypes[]) {
  return medications.map(med => {
    const brandName = med.brandName ? `(${med.brandName})` : '';
    const strengthAndUnit = med.isVariableDose ? `variable dose ${med.dispenseUnit}` : `${med.strength}${med.strengthUnit} ${med.dispenseUnit}`
    const route = `[${med.route}]`;

    const medLabel = `${med.genericName}  ${brandName}  ${strengthAndUnit}  ${route}`;
    return {
      value: med.id,
      label: medLabel
    }
  })
}

interface MedicationOrderFormProps {
  medications: AllMedicationTypes[];
}

export default function MedicationOrderForm({ medications }: MedicationOrderFormProps) {
  const router = useRouter()
  const { onDataChange, medOrderData, demographicData, caseId, medAdministrationData } = useFormContext()
  const [selectedMed, setSelectedMed] = useState('')
  const [selectedMeds, setSelectedMeds] = useState<AllMedicationTypes[]>(medOrderData.selectedMeds)
  const [medOrders, setMedOrders] = useState<MedicationOrder[]>(medOrderData.createdOrders)

  const handleAddMedication = (newMedId: string) => {
    setSelectedMed(newMedId)
    if (newMedId) {
      const medication = medications.find(med => med.id === newMedId)
      if (medication) {
        setSelectedMeds(prev => [medication, ...prev])
        setMedOrders(prev => {
          const newOrder = {
            id: crypto.randomUUID(),
            medicationId: medication.id,
            unitsOrdered: 0,
            frequency: '',
            priority: '',
            indication: '',
            orderingProvider: '',
            dose: medication.isVariableDose ? null : 0,
            visibleInPresim: true,
            phase: 1,
            status: "active"

          } as MedicationOrder
          return [newOrder, ...prev,]
        })

        setSelectedMed('')
      }
    }
  }

  const handleRemoveMedication = (index: number) => {
    setSelectedMeds(prev => prev.filter((_, i) => i !== index))
    setMedOrders(prev => prev.filter((_, i) => i !== index))
  }

  const handleOrderChange = (index: number, field: keyof MedicationOrder, value: string | boolean | number) => {
    setMedOrders(currentOrders =>
      currentOrders.map((order, i) => {
        if (i === index) {
          if (typeof value === 'string' && (field === 'dose' || field === 'infusionRate')) {
            const regex = /^[0-9]*\.?[0-9]*$/;
            if (value === '' || regex.test(value)) {
              return { ...order, [field]: value };
            }
            return order;
          }
          return { ...order, [field]: value };
        }
        return order;
      })
    );
  };

  const comboboxData = useMemo(() => {
    return getComboboxData(medications);
  }, [medications]);

  const goBack = () => {
    onDataChange('medOrders', {
      createdOrders: medOrders,
      selectedMeds: selectedMeds
    });
    router.push(caseBuilderPath("/admin/case-builder/form/intake-output", caseId));
  }

  const handleSubmit = async () => {
    onDataChange('medOrders', {
      createdOrders: medOrders,
      selectedMeds: selectedMeds
    });
    if (caseId) {
      await saveCaseData({
        payload: { orders: medOrders, administrations: medAdministrationData },
        section: CaseSection.MEDICATION_ORDERS,
        caseId,
      })
    }
    router.push(caseBuilderPath('/admin/case-builder/form/medication-administrations', caseId));
  }
  return (
    <FormShell
      title="Medication Orders"
      stepDescription="Step 8 of 9: Create Medication Orders"
      icon={<Pill className="text-slate-400" />}
      onSubmit={handleSubmit}
      goBack={goBack}
      continueButtonText="Continue"
      backButtonText="Back"
      continueButtonTooltip="Proceed to Next Page"
      backButtonTooltip="Return to Previous Page"
    >
      <div className="flex overflow-y-auto flex-col w-full bg-slate-50/50">
        <div className="flex-1 p-6 md:px-12 lg:px-24">
          <div className="max-w-4xl mx-auto space-y-6 pb-20">
            <Card className="p-4">
              <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Search className="w-4 h-4 text-blue-600" />
                Search Formulary
              </Label>
              <div className="w-fit">
                <Combobox
                  value={selectedMed}
                  onValueChange={handleAddMedication}
                  data={comboboxData}
                  displayText="Type to search medications..."
                />
              </div>
              <p className="text-xs text-slate-400 mt-2 pl-1">
                Selecting a medication will automatically add it to the order list below.
              </p>
            </Card>

            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  Active Orders
                </h2>
                <span className="text-xs font-medium bg-slate-200 text-slate-800 px-2.5 py-0.5 rounded-full">
                  {selectedMeds.length} Added
                </span>
              </div>

              {selectedMeds.length > 0 ? (
                <div className="grid gap-4">
                  {selectedMeds.map((med, index) => (
                    <div key={`${med.id}-${index}`} className="animate-in slide-in-from-top-2 duration-300">
                      <MedCardForm
                        medication={med}
                        handleMedicationRemoval={handleRemoveMedication}
                        index={index}
                        order={medOrders[index]}
                        onOrderChange={handleOrderChange}
                        phaseCount={demographicData.phaseCount}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-64 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400 bg-slate-50/30">
                  <div className="p-4 bg-white rounded-full shadow-sm mb-4">
                    <Tablets className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="font-medium text-slate-600">No medications added.</p>
                  <p className="text-sm max-w-sm text-center mt-1">
                    Search for a medication above to begin configuring doses, routes, and frequencies.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </FormShell>
  )
}
