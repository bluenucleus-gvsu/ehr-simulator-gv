import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface AdvanceAlertProps {
    phaseDialog: boolean;
    pendingPhaseGroup: { id: string; name: string; selectedPhase: number } | null;
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
                    Advance {pendingPhaseGroup ? pendingPhaseGroup.name : ""} to Phase {pendingPhaseGroup?.selectedPhase ?? ""}
                </AlertDialogTitle>
                <AlertDialogDescription>
                    Are you sure you want to advance {pendingPhaseGroup ? pendingPhaseGroup.name : ""} to
                    phase {pendingPhaseGroup?.selectedPhase ?? ""}?
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



