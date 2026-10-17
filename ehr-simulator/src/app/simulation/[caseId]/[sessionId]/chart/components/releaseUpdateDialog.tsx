"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { BellRing, ClipboardList, FileText, Pill, TestTube2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSimSessionContext } from "@/context/SimSessionContext";
import { useSimulationCase } from "@/context/SimulationCaseContext";
import {
  buildReleaseUpdateSummary,
  type ReleaseUpdateSectionKey,
} from "@/lib/faculty/itemReleaseNotification";
import {
  createEmptyReleasedItemsMap,
  type ReleasedItemsMap,
} from "@/lib/faculty/itemRelease";

const tabHrefByKey: Record<ReleaseUpdateSectionKey, string> = {
  labs: "labs",
  orders: "orders",
  notes: "notes",
  mar: "mar",
};

const sectionIconByKey: Record<ReleaseUpdateSectionKey, typeof ClipboardList> = {
  labs: TestTube2,
  orders: ClipboardList,
  notes: FileText,
  mar: Pill,
};

const NOTIFY_DEBOUNCE_MS = 2000;

export default function ReleaseUpdateDialog() {
  const router = useRouter();
  const params = useParams();
  const { caseBundle } = useSimulationCase();
  const { releasedItems, releasedItemsAtLoad, isPresim, loading } = useSimSessionContext();
  const [seen, setSeen] = useState<ReleasedItemsMap | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const baseline = seen ?? releasedItemsAtLoad ?? createEmptyReleasedItemsMap();

  const summary = useMemo(
    () => buildReleaseUpdateSummary(baseline, releasedItems, caseBundle),
    [baseline, releasedItems, caseBundle],
  );
  const hasNewData = summary.hasAnyNewData;

  const routeBase = `/simulation/${params.caseId}/${params.sessionId}/chart`;

  useEffect(() => {
    if (loading || (isPresim ?? true) || !hasNewData) return;
    const timer = setTimeout(() => setIsOpen(true), NOTIFY_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [loading, isPresim, hasNewData]);

  const handleNavigate = (section: ReleaseUpdateSectionKey) => {
    if (!routeBase) return;
    dismiss();
    router.push(`${routeBase}/${tabHrefByKey[section]}`);
  };

  const dismiss = () => {
    setSeen(releasedItems);
    setIsOpen(false);
  };

  if (!isOpen || !hasNewData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) dismiss(); }}>
      <DialogContent className="max-w-xl bg-white" data-testid="release-update-dialog">
        <DialogHeader className="gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-100 text-amber-700">
              <BellRing className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl text-slate-900">
                New content released
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-600">
                Newly released items are now available in the chart.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="space-y-3">
          {summary.sections.map((section) => {
            const Icon = sectionIconByKey[section.key];
            return (
              <div
                key={section.key}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <Icon className="h-4 w-4 text-slate-600" />
                    <span>{section.label}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{section.summary}</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="ml-4 shrink-0 bg-white"
                  onClick={() => handleNavigate(section.key)}
                >
                  Open {section.label}
                </Button>
              </div>
            );
          })}
        </div>

        <DialogFooter>
          <Button type="button" onClick={dismiss}>
            Continue Simulation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
