"use client";

import { Suspense, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

import ContinueButton from "./continueButton";
import BackButton from "./goBackButton";
import { CASE_BUILDER_STEPS } from "../caseBuilderSteps";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface FormShellProps {
  children: React.ReactNode;
  title: string;
  stepDescription: string;
  icon: React.ReactNode;
  onSubmit: () => void | Promise<void>;
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
>) {
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
}: Omit<FormShellProps, "children">) {
  const pathname = usePathname();
  const activeStepRef = useRef<HTMLSpanElement | null>(null);

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
                <span
                  key={step.path}
                  ref={active ? activeStepRef : undefined}
                  className={cn(
                    "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors border",
                    active &&
                      "bg-slate-900 text-white border-slate-900 shadow-sm",
                    !active &&
                      done &&
                      "bg-emerald-50 text-emerald-900 border-emerald-200",
                    !active &&
                      !done &&
                      "bg-white text-slate-600 border-slate-200",
                  )}
                >
                  <span className="tabular-nums text-[10px] opacity-70 mr-1">{i + 1}.</span>
                  {step.label}
                </span>
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
        />
      </Suspense>
      {children}
    </div>
  );
}
