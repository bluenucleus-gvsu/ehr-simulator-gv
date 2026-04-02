import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface NavigationAlertProps {
  showWarning: boolean;
  setShowWarning: (status: boolean) => void;
  pendingPath: string | null;
  setPendingPath: (path: string | null) => void;
  handleConfirmNavigation: (path: string) => void;
}

export default function NavigationAlert({
  showWarning,
  setShowWarning,
  pendingPath,
  setPendingPath,
  handleConfirmNavigation
}: NavigationAlertProps) {

  return (
    <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
          <AlertDialogDescription>
            You have unsaved data in your charting. If you leave this tab, your changes will be lost. Are you sure you want to leave?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setPendingPath(null)}>
            Cancel
          </AlertDialogCancel>
          {pendingPath ? (
            <AlertDialogAction
              onClick={() => handleConfirmNavigation(pendingPath)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Leave FlexSheets Tab
            </AlertDialogAction>
          ) : (
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={true}
            >
              No link available
            </AlertDialogAction>
          )}

        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}