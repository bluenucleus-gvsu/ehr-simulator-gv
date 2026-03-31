import {
  AlertCircle,
  CheckCircle2,
  FileText
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { AllMedicationTypes, MedicationOrder } from "@/app/simulation/[caseId]/[sessionId]/chart/mar/components/marData";
import { renderMedCardDetails, renderMedTitleRow } from "./marHelpers";

interface MultiMedPopoverProps {
  isOpen: boolean;
  associatedOrders: MedicationOrder[];
  handleSelection: (order: MedicationOrder) => void;
  handleClose: (open: boolean) => void;
  medication: AllMedicationTypes;
}

export function MultiMedPopover({
  isOpen,
  associatedOrders,
  handleSelection,
  handleClose,
  medication
}: MultiMedPopoverProps) {

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="flex flex-col max-h-[80vh] h-200 sm:max-w-lg md:max-w-2xl p-0 gap-0  bg-gray-50 ">
        <DialogHeader className="px-4 py-3 gap-0 bg-gray-100 border-b rounded-t-lg border-gray-200 shadow-[0_4px_6px_0px_rgba(0,0,0,0.1)]">
          <div className="flex items-center gap-3 text-amber-600">
            <div className="p-1.5 bg-amber-100 rounded-full">
              <AlertCircle size={18} />
            </div>
            <span className="text-sm font-bold uppercase tracking-wider">Verification Required</span>
          </div>
          <DialogTitle className="text-lg  text-gray-800">Which order are you administering?</DialogTitle>
          <DialogDescription className="text-gray-400">
            The scanned medication matches multiple active orders. Please select the specific order to document.
          </DialogDescription>
        </DialogHeader>

        {/* Order Selection List */}
        <div className="flex-1 p-6 flex flex-col justify-start bg-white gap-6 overflow-y-auto shadow-inner">
          {associatedOrders.map((order) => (
            <button
              key={order.id}
              onClick={() => handleSelection(order)}
              className="group relative flex flex-col items-start w-full h-fit px-4 pt-2 pb-3 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-blue-500 hover:ring-1 hover:ring-blue-500 hover:shadow-md transition-all text-left"
            >
              <div className="flex justify-between w-full items-start mb-2">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    {renderMedTitleRow(medication, order)}
                  </div>
                  <div className="flex items-center gap-1 text-xs ml-2 text-slate-600">
                    {renderMedCardDetails(medication, order)}
                  </div>
                </div>
                <div className="text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  <CheckCircle2 size={24} />
                </div>
              </div>

              <div className="w-full space-y-1.5 pt-2 mt-1">
                {order.instructions && (
                  <div className="flex items-start gap-2 text-xs text-gray-600 bg-slate-50 p-2 rounded w-full border">
                    <FileText size={14} className="text-gray-400 mt-0.5 shrink-0" />
                    <span className="line-clamp-2">{order.instructions}</span>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <DialogFooter className="p-4 bg-gray-100 border-t border-gray-200 sm:justify-between items-center rounded-b-lg">
          <p className="text-xs text-gray-500 pl-2 hidden sm:block">
            Esc to cancel
          </p>
          <DialogClose asChild>
            {/* <Button variant="" className="">
              Cancel Administration
            </Button> */}
          </DialogClose>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  )
}