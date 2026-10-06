import type { ReactNode } from "react";

export default function CaseCardField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="text-sm">
      <span className="font-medium text-slate-800">{label}: </span>
      <span className="text-muted-foreground">{children}</span>
    </div>
  );
}
