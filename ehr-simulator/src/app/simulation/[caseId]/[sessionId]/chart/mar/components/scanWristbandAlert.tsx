import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { AlertTriangle } from "lucide-react";

interface ScanWristbandAlertProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const ScanWristbandAlert = ({ isOpen, setIsOpen }: ScanWristbandAlertProps) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>

        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-xl">
            <AlertTriangle className="h-6 w-6 text-red-500" strokeWidth={2} />
            Patient Verification Required
          </AlertDialogTitle>

          <AlertDialogDescription className="text-sm text-slate-800 mt-2">
            You must scan the patient&apos;s wristband <strong>before</strong> scanning and administering any medications.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogAction
            onClick={() => setIsOpen(false)}
            className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white"
          >
            Acknowledge
          </AlertDialogAction>
        </AlertDialogFooter>

      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ScanWristbandAlert;