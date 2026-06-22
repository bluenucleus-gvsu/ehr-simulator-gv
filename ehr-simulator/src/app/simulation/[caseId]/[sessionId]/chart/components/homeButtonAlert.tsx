import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface HomeButtonAlertProps {
  homeClickWarning: boolean;
  setHomeClickWarning: (status: boolean) => void;
  pendingPath: string | null;
  setPendingPath: (path: string | null) => void;
  handleConfirmNavigation: (path: string) => void;
}

export default function HomeButtonAlert({
  homeClickWarning,
  setHomeClickWarning,
  pendingPath,
  setPendingPath,
  handleConfirmNavigation
}: HomeButtonAlertProps) {

  return (
    <AlertDialog open={homeClickWarning} onOpenChange={setHomeClickWarning}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Leaving Simulation</AlertDialogTitle>
          <AlertDialogDescription>
            You are about to leave the simulation.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setPendingPath(null)}>
            Cancel
          </AlertDialogCancel>
          {pendingPath ? (
            <AlertDialogAction
              onClick={() => handleConfirmNavigation(pendingPath)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Leave Simulation
            </AlertDialogAction>
          ) : (
            <AlertDialogAction
              className="bg-green-600 hover:bg-green-700 text-white"
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