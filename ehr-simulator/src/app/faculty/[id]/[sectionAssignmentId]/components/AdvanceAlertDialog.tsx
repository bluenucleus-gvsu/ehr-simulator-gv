import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface AdvanceAlertProps {
    phaseDialog: boolean;
    pendingPhaseGroup: { id: string; name: string } | null;
    cancelPhaseAdvancement: () => void;
    confirmPhaseAdvancement: () => void | Promise<void>;
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
                    Advance {pendingPhaseGroup ? pendingPhaseGroup.name : ""} to the Next Phase
                </AlertDialogTitle>
                <AlertDialogDescription>
                    Are you sure you want to advance {pendingPhaseGroup ? pendingPhaseGroup.name : ""} to
                    the next phase? You cannot go back after advancing.
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


