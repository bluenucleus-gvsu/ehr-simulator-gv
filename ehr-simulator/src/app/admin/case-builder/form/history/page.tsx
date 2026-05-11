"use client"
import { useRef, useState } from "react";
import {
  Home,
  AlertTriangle,
  FileClock,
  BriefcaseMedical,
  LucideIcon,
  Slice
} from "lucide-react";
import MultiTextInput, { MultiTextInputHandle } from "../../components/multiTextInput";
import { MultiSelect } from "../../components/multiSelect";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";
import { FamilyHistory, FamilyHistoryData, FamilyHistoryInputHandle } from "./familyHistory";
import { useFormContext } from "@/context/FormContext";
import { nursingAlerts } from "@/utils/form";
import { HistoryFormData } from "@/utils/form";
import { FormShell } from "../../components/formShell";
import { saveCaseData } from "@/actions/case_builder/caseBuilder";
import { CaseSection } from "@/lib/saveCase";

const FormSection = ({
  icon: Icon,
  title,
  children,
  className = ""
}: {
  icon: LucideIcon,
  title: string,
  children: React.ReactNode,
  className?: string
}) => (
  <div className={`space-y-4 ${className}`}>
    <div className="flex items-center gap-2 text-slate-800 border-b pb-2 border-slate-100">
      <div className="p-1.5 bg-blue-50 rounded-md text-blue-600">
        <Icon size={18} />
      </div>
      <h3 className="font-semibold text-sm">{title}</h3>
    </div>
    <div className="pl-1">
      {children}
    </div>
  </div>
);

const HistoryForm = () => {
  const router = useRouter();

  const { onDataChange, historyData, caseId } = useFormContext();
  const [medicalHistory, setMedicalHistory] = useState<string[]>(historyData.medicalHistory);
  const [surgicalHistory, setSurgicalHistory] = useState<string[]>(historyData.surgicalHistory);
  const [familyHistory, setFamilyHistory] = useState<FamilyHistoryData[]>(historyData.familyHistory);
  const [socialHistory, setSocialHistory] = useState<string[]>(historyData.socialHistory);
  const [livingSituation, setLivingSituation] = useState<string[]>(historyData.livingSituation);
  const [allergies, setAllergies] = useState<string[]>(historyData.allergies);
  const [alerts, setAlerts] = useState<string[]>(historyData.alerts);

  // For checking if leftover text in MultiTextInput fields 
  const diagnosesInputRef = useRef<MultiTextInputHandle>(null);
  const proceduresInputRef = useRef<MultiTextInputHandle>(null);
  const allergensInputRef = useRef<MultiTextInputHandle>(null);
  const socialHabitsInputRef = useRef<MultiTextInputHandle>(null);
  const livingSituationInputRef = useRef<MultiTextInputHandle>(null);
  const familyHistoryInputRef = useRef<FamilyHistoryInputHandle>(null);

  const inputRefs = [diagnosesInputRef, proceduresInputRef, allergensInputRef, socialHabitsInputRef, livingSituationInputRef, familyHistoryInputRef];

  const focusOnUnsaved = () => {
    for (const ref of inputRefs) {
      if (ref.current?.hasText()) {
        ref.current?.focus();
        break;
      }
    }
  }

  const checkUnsaved = () => inputRefs.some(ref => ref.current?.hasText())

  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<'back' | 'continue' | null>(null);

  const newHistoryData: HistoryFormData = {
    medicalHistory: medicalHistory,
    surgicalHistory: surgicalHistory,
    familyHistory: familyHistory,
    socialHistory: socialHistory,
    livingSituation: livingSituation,
    allergies: allergies,
    alerts: alerts,
  }

  const goBack = () => {
    if (checkUnsaved()) {
      setPendingNavigation('back');
      setShowUnsavedWarning(true);
    } else {
      onDataChange("history", newHistoryData);
      router.push("/admin/case-builder/form/demographics");
    }
  }

  const saveAndContinue = () => {
    onDataChange("history", newHistoryData);
    saveCaseData({ payload: newHistoryData, section: CaseSection.HISTORY, caseId });
    router.push("/admin/case-builder/form/notes");
  }

  const saveAndGoBack = () => {
    onDataChange("history", newHistoryData);
    router.push("/admin/case-builder/form/demographics");
  }

  const handleSubmit = () => {
    // Guardrail against unsaved text in MultiTextInput fields
    if (checkUnsaved()) {
      setPendingNavigation('continue');
      setShowUnsavedWarning(true);
    }
    else {
      saveAndContinue();
    }
  }

  const handleNavigateAnyway = () => {
    if (pendingNavigation === 'back') {
      saveAndGoBack();
    } else {
      saveAndContinue();
    }
  }

  const UnsavedTextAlert = () => (
    <AlertDialog
      open={showUnsavedWarning}
      onOpenChange={setShowUnsavedWarning}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Unsaved Text Detected</AlertDialogTitle>
          <AlertDialogDescription>
            You have unsaved text in one or more fields. If you leave this page, this text will be lost.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="cursor-pointer" onClick={() => { setTimeout(() => focusOnUnsaved(), 100) }}>
            Keep Editing
          </AlertDialogCancel>
          <AlertDialogAction className="cursor-pointer" onClick={handleNavigateAnyway}>
            {pendingNavigation == "continue" ? "Continue Anyway" : "Go Back Anyway"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )

  return (
    <FormShell
      title="Patient History"
      stepDescription="Step 2 of 9: Document medical history and social context"
      icon={<FileClock className="text-slate-400" />}
      onSubmit={handleSubmit}
      goBack={goBack}
      continueButtonText="Continue"
      backButtonText="Back"
      continueButtonTooltip="Proceed to Next Page"
      backButtonTooltip="Return to Previous Page"
    >
      <UnsavedTextAlert />
      <div className="bg-slate-50/50 flex-1 overflow-y-auto p-6 md:px-12 lg:px-24">
        <div className="max-w-6xl mx-auto space-y-6 pb-20">
          <div className="grid grid-cols-1 gap-6">
            <Card className="border-slate-200 shadow-sm h-fit pt-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Clinical Profile</CardTitle>
                <CardDescription>Past medical and surgical events</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <FormSection icon={BriefcaseMedical} title="Medical History">
                  <MultiTextInput
                    labelText="Diagnoses"
                    value={medicalHistory}
                    onChange={setMedicalHistory}
                    placeholder="e.g. HTN, GERD..."
                    emptyMessage="No diagnoses recorded."
                    ref={diagnosesInputRef}
                  />
                </FormSection>

                <FormSection icon={Slice} title="Surgical History">
                  <MultiTextInput
                    labelText="Procedures"
                    value={surgicalHistory}
                    onChange={setSurgicalHistory}
                    placeholder="e.g. TAVR (2010)..."
                    emptyMessage="No procedures recorded."
                    ref={proceduresInputRef}
                  />
                </FormSection>

                <FormSection icon={AlertTriangle} title="Allergies">
                  <MultiTextInput
                    labelText="Allergens"
                    value={allergies}
                    onChange={setAllergies}
                    placeholder="e.g. Penicillin..."
                    emptyMessage="No allergens recorded."
                    ref={allergensInputRef}
                  />
                </FormSection>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="border-slate-200 shadow-sm pt-4">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Social & Environmental</CardTitle>
                  <CardDescription>Living situation and habits</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  <FormSection icon={Home} title="Social Context">
                    <div className="space-y-4">
                      <MultiTextInput
                        labelText="Social Habits"
                        value={socialHistory}
                        onChange={setSocialHistory}
                        placeholder="e.g. Tobacco Use, High Risk Occupation..."
                        emptyMessage="No social habits recorded."
                        ref={socialHabitsInputRef}
                      />
                      <MultiTextInput
                        labelText="Living Situation"
                        value={livingSituation}
                        onChange={setLivingSituation}
                        placeholder="e.g. Lives alone, Group Home..."
                        emptyMessage="No living situations recorded."
                        ref={livingSituationInputRef}
                      />
                    </div>
                  </FormSection>
                </CardContent>
              </Card>

              <Card className="border-amber-100 bg-amber-50/30 shadow-sm">
                <CardHeader className="pb-">
                  <CardTitle className="text-lg flex items-center gap-2 text-amber-900">
                    <AlertTriangle className="text-amber-600" />
                    Safety Alerts
                  </CardTitle>
                  <CardDescription className="text-amber-800">Warnings displayed on EHR Overview page</CardDescription>

                </CardHeader>
                <CardContent>
                  <MultiSelect
                    labelText=""
                    placeholder="Select safety alerts..."
                    options={nursingAlerts.map((alert) => ({ value: alert, label: alert }))}
                    selectedValues={alerts}
                    setSelectedValues={setAlerts}
                  />
                </CardContent>
              </Card>
            </div>
          </div>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Family History</CardTitle>
            </CardHeader>
            <CardContent>
              <FamilyHistory
                value={familyHistory}
                onChange={setFamilyHistory}
                ref={familyHistoryInputRef}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </FormShell >
  )
}
export default HistoryForm
