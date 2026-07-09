import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface AdvanceAlertProps {
    phaseDialog: boolean;
    pendingPhaseGroup: { id: string; name: string } | null;
    cancelPhaseAdvancement: () => void;
    confirmPhaseAdvancement: () => void;
}

export default function AdvanceAlertDialog({
    phaseDialog,
    pendingPhaseGroup,
    cancelPhaseAdvancement,
    confirmPhaseAdvancement
}:AdvanceAlertProps){
    return (
        <AlertDialog open={phaseDialog}>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>
                    Advance {pendingPhaseGroup ? pendingPhaseGroup.name : ""} to the Next Phase
                </AlertDialogTitle>
                <AlertDialogDescription>
                    Are you sure you want to advance {pendingPhaseGroup ? pendingPhaseGroup.name : ""} to
                    the next phase? You cannot go back after advancing.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel onClick={cancelPhaseAdvancement}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={confirmPhaseAdvancement}>Advance</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}



