import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle
} from "@/components/ui/alert-dialog"
import { AlertOctagon } from "lucide-react";

interface WrongPatientAlertProps {
  scanStatus: boolean;
  onWrongScanChange: (x: boolean) => void;
}

const WrongPatientAlert = ({ scanStatus, onWrongScanChange }: WrongPatientAlertProps) => {
  const handleWrongScanChange = () => {
    onWrongScanChange(false)
  }

  return (
    <AlertDialog open={scanStatus} onOpenChange={handleWrongScanChange}>
      <AlertDialogContent className="p-0 gap-0 overflow-hidden border-none shadow-2xl outline-none">

        <div className="bg-red-600 pl-6 py-3 text-white flex items-center text-center gap-3">
          <div className="bg-white/20 p-3 rounded-full">
            <AlertOctagon size={48} className="text-white" strokeWidth={1.5} />
          </div>
          <div className="space-y-1">
            <AlertDialogTitle className="text-2xl font-bold tracking-tight text-white">
              PATIENT MISMATCH
            </AlertDialogTitle>
            <p className="text-red-100 text-sm font-medium opacity-90">
              Scanning Error Detected
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 bg-white">
          <AlertDialogDescription className="text-center text-slate-600 text-base leading-relaxed">
            The barcode you scanned does <strong>not</strong> match the active patient chart.
            This action has been halted.
          </AlertDialogDescription>

          {/* Simulation/Instructor Feedback Section */}
          <div className="bg-orange-50 border border-orange-100 rounded-lg p-4 flex gap-3 items-start">
            <p className="text-sm text-orange-900 leading-snug">
              Please verify the patient&apos;s identity using <strong>Name</strong> and <strong>Date of Birth</strong> on their wristband before re-scanning.
            </p>
          </div>
        </div>

        {/* Footer Action */}
        <AlertDialogFooter className="bg-slate-50 p-4 sm:justify-center border-t border-slate-100">
          <AlertDialogAction
            onClick={handleWrongScanChange}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold h-11 shadow-sm transition-all"
          >
            I Acknowledge & Will Re-verify
          </AlertDialogAction>
        </AlertDialogFooter>

      </AlertDialogContent>
    </AlertDialog>
  )
}

export default WrongPatientAlert