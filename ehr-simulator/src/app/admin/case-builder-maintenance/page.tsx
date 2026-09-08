import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function CaseBuilderMaintenancePage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16">
      <div className="mx-auto flex max-w-2xl flex-col items-start gap-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="space-y-3">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-amber-700">
            Case Editing Locked
          </p>
          <h1 className="text-3xl font-semibold text-slate-900">
            Case Editing is under maintenance.
          </h1>
          <p className="text-base leading-7 text-slate-600">
            Editing has been temporarily disabled to avoid any issues while maintenance is in
            progress. Please check back later or email Max Mulder at <b className="text-amber-700 italic">maxmulder03@gmail.com</b>
            {" "}for any urgent updates to a case.
          </p>
        </div>

        <Link href="/admin/cases">
          <Button>Back to Cases</Button>
        </Link>
      </div>
    </main>
  );
}
