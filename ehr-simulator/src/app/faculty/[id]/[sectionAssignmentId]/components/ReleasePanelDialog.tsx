"use client";

import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { RotateCcw, Send } from "lucide-react";
import {
  getReleasePanelData,
  releaseSessionItems,
  unreleaseSessionItems,
  type ReleasedItem,
  type ReleasePanelData,
  type ReleasePendingItem,
} from "@/actions/faculty";
import { type ReleasableItemType } from "@/lib/faculty/itemRelease";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

interface ReleasePanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupName: string;
  sessionId: string;
  phaseCount: number;
}

const TYPE_LABELS: Record<ReleasableItemType, string> = {
  lab_result: "Lab panel",
  clinical_document: "Note",
  order: "Clinical order",
  medication_order: "Med order",
};

function itemDisplayName(
  label: string | null,
  type: ReleasableItemType,
  fallbackIndex: number,
): string {
  if (label) return label;
  return `${TYPE_LABELS[type] ?? type} ${fallbackIndex}`;
}

function groupByPhase<T extends { phase: number }>(items: T[]): Map<number, T[]> {
  const grouped = new Map<number, T[]>();
  items.forEach((item) => {
    const phaseItems = grouped.get(item.phase) ?? [];
    phaseItems.push(item);
    grouped.set(item.phase, phaseItems);
  });
  return grouped;
}

export default function ReleasePanelDialog({
  open,
  onOpenChange,
  groupName,
  sessionId,
  phaseCount,
}: ReleasePanelProps) {
  const [loading, setLoading] = useState(false);
  const [working, setWorking] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [panelData, setPanelData] = useState<ReleasePanelData | null>(null);

  const loadPanelData = useCallback(async () => {
    setLoading(true);
    setError("");
    const response = await getReleasePanelData(sessionId);
    if (!response.success || !response.data) {
      setError(response.message || "Failed to load release data.");
      setPanelData(null);
    } else {
      setPanelData(response.data);
    }
    setLoading(false);
  }, [sessionId]);

  useEffect(() => {
    if (open) {
      void loadPanelData();
    }
  }, [open, loadPanelData]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setPanelData(null);
      setError("");
      setWorking(null);
    }
    onOpenChange(nextOpen);
  };

  const pendingByPhase = useMemo(
    () => groupByPhase(panelData?.pending ?? []),
    [panelData],
  );
  const phases = useMemo(
    () => Array.from({ length: Math.max(0, phaseCount - 1) }, (_, i) => i + 2),
    [phaseCount],
  );

  const releaseItems = async (
    items: ReleasePendingItem[],
    workKey: string,
    successMessage: string,
  ) => {
    if (items.length === 0 || working) return;
    setWorking(workKey);
    const response = await releaseSessionItems(
      sessionId,
      items.map((item) => ({ type: item.type, id: item.id })),
    );
    setWorking(null);
    if (!response.success) {
      toast.error(response.message || "Failed to release items.");
      return;
    }
    toast.success(successMessage);
    await loadPanelData();
  };

  const unreleaseItems = async (entries: ReleasedItem[], workKey: string) => {
    if (entries.length === 0 || working) return;
    setWorking(workKey);
    const response = await unreleaseSessionItems(
      sessionId,
      entries.map((entry) => ({ type: entry.type, id: entry.id })),
    );
    setWorking(null);
    if (!response.success) {
      toast.error(response.message || "Failed to un-release items.");
      return;
    }
    toast.success("Content removed from this group's chart.");
    await loadPanelData();
  };

  const releasedEntries = panelData?.released ?? [];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-6xl max-h-[90vh] overflow-y-auto gap-6">
        <DialogHeader>
          <DialogTitle>Release Content – {groupName}</DialogTitle>
          <DialogDescription>
            Release live content to this group&apos;s chart, or remove previously
            released content.
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="flex gap-4">
            {Array.from({ length: phaseCount - 1 }, (_, i) => i).map(i => (
              <Skeleton key={i} className="animate-pulse w-76 h-40"></Skeleton>
            ))}
          </div>
        )}

        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

        {!loading && !error && (
          <div className="flex gap-4">
            {phases.map((phase) => {
              const phaseItems = pendingByPhase.get(phase) ?? [];

              const byType = new Map<ReleasableItemType, number>();
              phaseItems.forEach((item) => {
                byType.set(item.type, (byType.get(item.type) ?? 0) + 1);
              });

              const summary = [...byType.entries()]
                .map(([type, count]) => `${count} ${TYPE_LABELS[type] ?? type}${count === 1 ? "" : "s"}`)
                .join(", ");

              return (
                <Card key={phase} data-testid={`release-phase-card-${phase}`} className="flex-1 grid grid-cols-[2fr_1fr] gap-x-4 gap-y-2 p-3 space-y-2">
                  <div className="pb-2">
                    <p className="font-semibold text-slate-800">Phase {phase}</p>
                    <p className="text-sm text-slate-500">{summary}</p>
                  </div>

                  {phaseItems.length === 0 ? (
                    <div></div>
                  ) : (
                    <Button
                      type="button"
                      size="sm"
                      className="text-sm"
                      disabled={working !== null}
                      onClick={() =>
                        releaseItems(
                          phaseItems,
                          `phase-${phase}`,
                          `Phase ${phase} released to ${groupName}.`,
                        )
                      }
                    >
                      <Send className="size-3.5 mr-1" />
                      {working === `phase-${phase}` ? "Releasing…" : "Release all"}
                    </Button>)}
                  {phaseItems.length === 0 ? (
                    <p className="col-span-2 text-center text-sm text-slate-400">No items to release</p>
                  ) : (
                    phaseItems.map((item, itemIndex) => {
                      const fallbackIndex = phaseItems
                        .slice(0, itemIndex + 1)
                        .filter((other) => other.type === item.type).length;
                      const displayName = itemDisplayName(
                        item.label,
                        item.type,
                        fallbackIndex,
                      );
                      return (
                        <Fragment key={item.id}>
                          <span className="text-sm text-slate-600 line-clamp-2">
                            {displayName}
                          </span>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="text-sm h-6 ml-2 shrink-0"
                        data-testid={`release-item-${displayName}`}
                        disabled={working !== null}
                        onClick={() =>
                          releaseItems(
                            [item],
                            `item-${item.id}`,
                            `${displayName} released to ${groupName}.`,
                          )
                        }
                      >
                            {working === `item-${item.id}` ? "Releasing…" : "Release"}
                          </Button>
                        </Fragment>
                      );
                    }))}
                </Card>
              );
            })}
          </div>
        )}

        {releasedEntries.length > 0 && (
          <Card className="rounded-lg w-fit p-3">
            <div className="flex items-center justify-between gap-10">
              <p className="font-semibold text-slate-800" data-testid="released-items-heading">
                Items released to {groupName}
                <span className="ml-2 text-slate-600 font-normal">({releasedEntries.length})</span>
              </p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="text-xs"
                disabled={working !== null}
                onClick={() => unreleaseItems(releasedEntries, "unrelease-all")}
              >
                <RotateCcw className="size-3.5 mr-1" />
                {working === "unrelease-all" ? "Removing…" : "Un-release all"}
              </Button>
            </div>
            <ul className="divide-y divide-slate-200 max-h-60 overflow-y-auto">
              {releasedEntries.map((entry, entryIndex) => {
                const fallbackIndex = releasedEntries
                  .slice(0, entryIndex + 1)
                  .filter((other) => other.type === entry.type).length;
                return (
                  <li key={`${entry.type}-${entry.id}`} className="flex items-center justify-between py-2">
                    <div className="min-w-0">
                      <span className="text-sm text-slate-600 truncate">
                        {itemDisplayName(entry.label, entry.type, fallbackIndex)}
                      </span>
                      <span className="text-[10px] text-slate-400 ml-2">
                        {new Date(entry.releasedAt).toLocaleTimeString(undefined, {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="text-xs h-6 ml-2 shrink-0"
                      data-testid={`unrelease-item-${itemDisplayName(entry.label, entry.type, fallbackIndex)}`}
                      disabled={working !== null}
                      onClick={() => unreleaseItems([entry], `un-${entry.id}`)}
                    >
                      {working === `un-${entry.id}` ? "Removing…" : "Un-release"}
                    </Button>
                  </li>
                );
              })}
            </ul>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  );
}
