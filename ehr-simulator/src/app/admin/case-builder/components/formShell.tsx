"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

import ContinueButton from "./continueButton";
import BackButton from "./goBackButton";
import { CASE_BUILDER_STEPS } from "../caseBuilderSteps";
import { saveAllCaseBuilderProgress } from "@/lib/caseBuilder/saveCaseBuilderProgress";
import { extractErrorMessage } from "@/lib/caseBuilder/serializeFormBlob";
import { useFormContext } from "@/context/FormContext";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface FormShellProps {
  children: React.ReactNode;
  title: string;
  stepDescription: string;
  icon: React.ReactNode;
  onSubmit: () => void;
  goBack: () => void;
  continueButtonText: string;
  backButtonText: string;
  continueButtonTooltip?: string;
  backButtonTooltip?: string;
}

function FormShellHeaderFallback({
  title,
  stepDescription,
  icon,
  onSubmit,
  goBack,
  backButtonText,
  continueButtonText,
  continueButtonTooltip,
  backButtonTooltip,
  showSaveButton,
  isSaving,
  handleSaveProgress,
}: Pick<
  FormShellProps,
  | "title"
  | "stepDescription"
  | "icon"
  | "onSubmit"
  | "goBack"
  | "backButtonText"
  | "continueButtonText"
  | "continueButtonTooltip"
  | "backButtonTooltip"
> & {
  showSaveButton: boolean;
  isSaving: boolean;
  handleSaveProgress: () => void;
}) {
  return (
    <header className="flex-none bg-white border-b border-slate-200 z-10 shadow-sm">
      <div className="flex flex-col gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-xl font-bold text-slate-800 flex items-center gap-2 flex-wrap">
              {icon}
              <span className="truncate">{title}</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">{stepDescription}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {showSaveButton ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="cursor-pointer gap-1.5 border-slate-300"
                disabled
                onClick={handleSaveProgress}
                title="Save all sections to the database without leaving this page"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save
              </Button>
            ) : null}
            <BackButton tooltip={backButtonTooltip} onClick={goBack} buttonText={backButtonText} />
            <ContinueButton
              tooltip={continueButtonTooltip}
              onClick={onSubmit}
              buttonText={continueButtonText}
            />
          </div>
        </div>
        <div className="h-9 w-full max-w-full rounded-md bg-slate-100 animate-pulse" aria-hidden />
      </div>
    </header>
  );
}

function FormShellHeaderResolved({
  title,
  stepDescription,
  icon,
  onSubmit,
  goBack,
  backButtonText,
  continueButtonText,
  continueButtonTooltip,
  backButtonTooltip,
  showSaveButton,
  isSaving,
  handleSaveProgress,
}: Omit<FormShellProps, "children"> & {
  showSaveButton: boolean;
  isSaving: boolean;
  handleSaveProgress: () => void;
}) {
  const pathname = usePathname();
  const activeStepRef = useRef<HTMLAnchorElement | null>(null);

  const currentIndex = CASE_BUILDER_STEPS.findIndex((s) => s.path === pathname);
  const stepNumber = currentIndex >= 0 ? currentIndex + 1 : null;

  useEffect(() => {
    activeStepRef.current?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [pathname]);

  return (
    <header className="flex-none bg-white border-b border-slate-200 z-10 shadow-sm">
      <div className="flex flex-col gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-xl font-bold text-slate-800 flex items-center gap-2 flex-wrap">
              {icon}
              <span className="truncate">{title}</span>
              {stepNumber !== null ? (
                <span className="text-xs font-medium text-slate-500 bg-slate-100 border border-slate-200 rounded-full px-2.5 py-0.5 shrink-0">
                  Step {stepNumber} of {CASE_BUILDER_STEPS.length}
                </span>
              ) : null}
            </h1>
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">{stepDescription}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {showSaveButton ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="cursor-pointer gap-1.5 border-slate-300"
                disabled
                onClick={handleSaveProgress}
                title="Save all sections to the database without leaving this page"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save
              </Button>
            ) : null}
            <BackButton tooltip={backButtonTooltip} onClick={goBack} buttonText={backButtonText} />
            <ContinueButton
              tooltip={continueButtonTooltip}
              onClick={onSubmit}
              buttonText={continueButtonText}
            />
          </div>
        </div>

        <ScrollArea className="w-full max-w-full pb-1">
          <nav
            className="flex w-max min-w-full items-center gap-1 pr-4"
            aria-label="Case builder steps"
          >
            {CASE_BUILDER_STEPS.map((step, i) => {
              const active = pathname === step.path;
              const done = currentIndex > i;
              return (
                <Link
                  key={step.path}
                  ref={active ? activeStepRef : undefined}
                  href={step.path}
                  prefetch
                  className={cn(
                    "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors border",
                    active &&
                      "bg-slate-900 text-white border-slate-900 shadow-sm",
                    !active &&
                      done &&
                      "bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100",
                    !active &&
                      !done &&
                      "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300",
                  )}
                >
                  <span className="tabular-nums text-[10px] opacity-70 mr-1">{i + 1}.</span>
                  {step.label}
                </Link>
              );
            })}
          </nav>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </header>
  );
}

export function FormShell({
  children,
  title,
  stepDescription,
  icon,
  onSubmit,
  goBack,
  backButtonText,
  continueButtonText,
  continueButtonTooltip,
  backButtonTooltip,
}: FormShellProps) {
  const { caseId, setCaseId, getCaseBuilderSaveBlob, applyCaseBuilderOverlayToContext } = useFormContext();
  const [isSaving, setIsSaving] = useState(false);
  const showSaveButton = true;

  const handleSaveProgress = async () => {
    setIsSaving(true);
    try {
      const blob = getCaseBuilderSaveBlob();
      await saveAllCaseBuilderProgress(blob, caseId, setCaseId);
      applyCaseBuilderOverlayToContext();
      toast.success("Case saved.");
    } catch (err) {
      console.error("Case builder save failed:", err);
      toast.error(extractErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col w-full h-[calc(100vh)] bg-slate-50/50 overflow-hidden shadow-sm border border-slate-200">
      <Suspense
        fallback={
          <FormShellHeaderFallback
            title={title}
            stepDescription={stepDescription}
            icon={icon}
            onSubmit={onSubmit}
            goBack={goBack}
            backButtonText={backButtonText}
            continueButtonText={continueButtonText}
            continueButtonTooltip={continueButtonTooltip}
            backButtonTooltip={backButtonTooltip}
            showSaveButton={showSaveButton}
            isSaving={isSaving}
            handleSaveProgress={handleSaveProgress}
          />
        }
      >
        <FormShellHeaderResolved
          title={title}
          stepDescription={stepDescription}
          icon={icon}
          onSubmit={onSubmit}
          goBack={goBack}
          backButtonText={backButtonText}
          continueButtonText={continueButtonText}
          continueButtonTooltip={continueButtonTooltip}
          backButtonTooltip={backButtonTooltip}
          showSaveButton={showSaveButton}
          isSaving={isSaving}
          handleSaveProgress={handleSaveProgress}
        />
      </Suspense>
      {children}
    </div>
  );
}
