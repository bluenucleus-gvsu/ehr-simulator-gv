"use client";

import { cn } from "@/lib/utils";
import { getPhaseStyle } from "@/lib/caseBuilder/phaseStyles";

type PhaseBadgeProps = {
  phase: number;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeClasses = {
  sm: "text-xs px-2.5 py-0.5 border",
  md: "text-sm px-3.5 py-1 border-2 shadow-md",
  lg: "text-base px-5 py-1.5 border-2 shadow-lg",
};

export function PhaseBadge({ phase, size = "md", className }: PhaseBadgeProps) {
  const style = getPhaseStyle(phase);
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-bold tracking-tight",
        style.badge,
        sizeClasses[size],
        className,
      )}
    >
      Phase {phase}
    </span>
  );
}
