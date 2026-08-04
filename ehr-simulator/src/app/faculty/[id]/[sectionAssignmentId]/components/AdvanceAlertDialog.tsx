import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface AdvanceAlertProps {
    phaseDialog: boolean;
    pendingPhaseGroup: { id: string; name: string; selectedPhase: number } | null;
    cancelPhaseAdvancement: () => void;
    confirmPhaseAdvancement: () => void;
    isAdvancing: boolean;
    errorMessage: string | null;
}

export default function AdvanceAlertDialog({
    phaseDialog,
    pendingPhaseGroup,
    cancelPhaseAdvancement,
    confirmPhaseAdvancement,
    isAdvancing,
    errorMessage,
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
                {errorMessage && (
                    <p role="alert" className="text-sm text-red-600">
                        {errorMessage}
                    </p>
                )}
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel onClick={cancelPhaseAdvancement} disabled={isAdvancing}>
                    Cancel
                </AlertDialogCancel>
                <AlertDialogAction onClick={confirmPhaseAdvancement} disabled={isAdvancing}>
                    {isAdvancing ? "Advancing…" : "Advance"}
                </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}



