"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

import { getCaseBundle } from "@/actions/case_builder/getCase";
import { Button } from "@/components/ui/button";
import { useFormContext } from "@/context/FormContext";
import { caseBundleToFormBlob } from "@/lib/caseBuilder/caseBundleToFormBlob";

const DEMOGRAPHICS_PATH = "/admin/case-builder/form/demographics";

export function CaseBuilderBootstrap({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const requestedCaseId = searchParams.get("caseId");
  const { caseId, replaceFormData } = useFormContext();
  const [loadError, setLoadError] = useState<{ caseId: string; message: string } | null>(null);

  useEffect(() => {
    if (!requestedCaseId) {
      if (pathname !== DEMOGRAPHICS_PATH) router.replace(DEMOGRAPHICS_PATH);
      return;
    }

    if (requestedCaseId === caseId) return;

    let cancelled = false;

    getCaseBundle(requestedCaseId)
      .then((bundle) => {
        if (cancelled) return;
        replaceFormData(caseBundleToFormBlob(bundle), requestedCaseId);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setLoadError({
          caseId: requestedCaseId,
          message: error instanceof Error ? error.message : "Unable to load this case.",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [caseId, pathname, replaceFormData, requestedCaseId, router]);

  if (requestedCaseId && requestedCaseId !== caseId && loadError?.caseId !== requestedCaseId) {
    return (
      <main className="flex min-h-screen w-full items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 text-slate-600">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading case…
        </div>
      </main>
    );
  }

  if (requestedCaseId && requestedCaseId !== caseId && loadError?.caseId === requestedCaseId) {
    return (
      <main className="flex min-h-screen w-full items-center justify-center bg-slate-50 p-6">
        <div className="max-w-lg space-y-4 rounded-xl border bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold">Case could not be loaded</h1>
          <p className="text-sm text-slate-600">{loadError.message}</p>
          <Button asChild>
            <Link href="/admin/cases">Return to cases</Link>
          </Button>
        </div>
      </main>
    );
  }

  return children;
}
