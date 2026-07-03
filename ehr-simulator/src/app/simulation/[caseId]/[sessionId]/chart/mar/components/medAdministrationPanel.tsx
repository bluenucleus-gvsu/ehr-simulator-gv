'use client'

import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogFooter,
  DialogClose,
  DialogTitle,
  DialogHeader
} from "@/components/ui/dialog"

import { Button } from "@/components/ui/button"
import {
  PencilLine,
  ExternalLink,
  Pill,
  PillBottle,
} from "lucide-react"
import { useState } from "react"
import { type AllMedicationTypes, type MedicationOrder } from "./marData";
import MedAdminCard from "./medAdminCard";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge"
import { PatientStatusBadge } from "./marHelpers"
import { DatabaseMedAdministration, StudentMedicationAdministration } from "@/actions/simulation"

type NewAdministrationData = Record<string, StudentMedicationAdministration>;

interface MedAdministrationProps {
  readOnly?: boolean;
  selectedOrders: MedicationOrder[];
  administrationsLookup: { [key: string]: DatabaseMedAdministration[] };
  medicationLookup: { [key: string]: AllMedicationTypes };
  sessionStart: Date;
  isScanned: boolean;
  onPtScan: (scan: boolean) => void;
  newAdministrations: NewAdministrationData;
  onUpdateAdministration: (orderId: string, field: keyof StudentMedicationAdministration, value: string | number) => void;
  onAdministerMeds: (meds: NewAdministrationData) => void | Promise<void>;
  onClearAll: () => void;
  handlePopoverClose: (x: boolean) => void;
  isOpen: boolean;
  onOrderRemove: (id: string) => void;
  isPresim: boolean;
  elapsedMinutes: number;
}



const MedAdministrationPanel = ({
  readOnly = false,
  selectedOrders,
  medicationLookup,
  administrationsLookup,
  sessionStart,
  elapsedMinutes,
  newAdministrations,
  onUpdateAdministration,
  isScanned,
  onAdministerMeds: handleAdministerMeds,
  isOpen,
  handlePopoverClose,
  isPresim,
  onOrderRemove
}: MedAdministrationProps) => {
  const [isLoading] = useState(false)
  const hasSelections = selectedOrders.length > 0;
  const hasOverdose = selectedOrders.some(order => {

    const administeredDose = newAdministrations[order.id]?.administered_dose
    if (!administeredDose || !order.dose) {
      return false
    }
    return order.dose < administeredDose
  })
  const medReferenceTool = 'https://online-lexi-com.ezproxy.gvsu.edu/lco/action/home';


  const mustConfirmPatient = isPresim === false;
  const canSign =
    !readOnly && !isLoading && !hasOverdose && (isScanned || !mustConfirmPatient);

  const handleSubmit = async () => {
    if (readOnly) return;
    try {
      await handleAdministerMeds(newAdministrations);
    } catch (err) {
      console.error("Failed to save administrations", err);
      toast.error("Failed to save administrations");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handlePopoverClose}>

      <DialogTrigger asChild>
        <Button
          onClick={() => handlePopoverClose(true)}
          className="h-9 bg-blue-600 hover:bg-blue-700 text-white shadow-sm gap-2 px-4"
          disabled={readOnly || !hasSelections}
          title={readOnly ? "Documentation is view-only in simulation" : undefined}
        >
          <PencilLine className="w-4 h-4" />
          <span className="">Document</span>
          {selectedOrders.length > 0 && (
            <Badge variant="secondary" className="ml-1 bg-blue-400/85 text-white font-medium border-none px-1.5 h-5 min-w-5">
              {selectedOrders.length}
            </Badge>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="flex flex-col md:max-w-3xl xl:max-w-4xl max-w-5xl h-[90vh] p-0 gap-0 overflow-hidden bg-white border-slate-200"
      >

        <DialogHeader className="px-6 py-4 bg-gray-100 border-b border-gray-300 flex-shrink-0 shadow-[0_2px_4px_-1px_rgba(0,0,0,0.1)]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pr-6">
            <DialogTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <div className="p-2 bg-blue-200 rounded-lg text-blue-700">
                <Pill size={20} fill="white" />
              </div>
              Medication Administration
            </DialogTitle>

            <PatientStatusBadge isScanned={isScanned} />


          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6">
          {selectedOrders.length === 0 && (
            <div className="h-48 mt-4 border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center text-slate-400">
              <PillBottle className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-sm">No medications scanned yet.</p>
            </div>
          )}
          <div className="grid gap-6 pb-10">
            {selectedOrders.map(order => {
              const currentAdminData = newAdministrations[order.id] || { status: "Given", administered_dose: 0 };

              return (
                <MedAdminCard
                  key={order.id}
                  order={order}
                  medication={medicationLookup[order.medicationId]}
                  administrations={administrationsLookup[order.id]}
                  sessionStart={sessionStart}
                  elapsedMinutes={elapsedMinutes}
                  onOrderRemove={onOrderRemove}

                  onStatusChange={(value) => {
                    onUpdateAdministration(order.id, "status", value);
                  }}
                  currentStatus={currentAdminData.status ?? "Given"}

                  onDoseChange={(value) => {
                    onUpdateAdministration(order.id, "administered_dose", value);
                  }}
                  currentDose={currentAdminData.administered_dose ?? 0}
                  onCommentChange={(value) => {
                    onUpdateAdministration(order.id, 'notes', value)
                  }}
                  currentComment={currentAdminData.notes || ''}
                  administrationInfusionRate={currentAdminData.infusion_rate || 0}
                  onInfusionRateChange={(value) => {
                    onUpdateAdministration(order.id, 'infusion_rate', value)
                  }}
                />
              )
            })}
          </div>
        </div>

        <DialogFooter className=" w-full px-6 py-4 bg-gray-100 border-t border-gray-200  flex-shrink-0 sm:justify-between gap-4 shadow-[0_-2px_15px_-6px_rgba(0,0,0,0.1)]">
          {medReferenceTool ? (
            <a
              href={medReferenceTool}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-sm bg-white text-gray-700 transition-colors hover:bg-gray-100 px-3 py-2 rounded-md border border-gray-200 shadow-xs"
            >
              <ExternalLink size={14} />
              Lexidrug™
            </a>
          ) : (
            <p></p>
          )

          }

          <div className="flex gap-3 justify-between">
            <DialogClose asChild>
              <Button variant="outline" className="flex-1 sm:flex-none text-gray-700">
                Cancel
              </Button>
            </DialogClose>
            <Button
              disabled={!canSign}
              onClick={handleSubmit}
              className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm min-w-[120px]"
              title={
                readOnly
                  ? "Documentation is view-only in simulation"
                  : mustConfirmPatient && !isScanned
                    ? "Confirm patient identity first"
                    : undefined
              }
            >
              {isLoading ? "Signing..." : "Sign & Accept"}
            </Button>
          </div>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
}

export default MedAdministrationPanel