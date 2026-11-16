"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Dialog as PreviewDialog,
  DialogContent as PreviewDialogContent,
  DialogHeader as PreviewDialogHeader,
  DialogTitle as PreviewDialogTitle,
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

type ReleasedSortField = "name" | "time";
type SortDirection = "asc" | "desc";

const TYPE_LABELS: Record<ReleasableItemType, string> = {
  lab_result: "Lab panel",
  clinical_document: "Note",
  order: "Clinical order",
  medication_order: "Med order",
  media: "Media item",
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

function fallbackIndices<T extends { id: string; type: ReleasableItemType }>(
  items: T[],
): Map<string, number> {
  const counts = new Map<ReleasableItemType, number>();
  const sortedItems = [...items].sort(
    (a, b) => a.type.localeCompare(b.type) || a.id.localeCompare(b.id),
  );
  return new Map(sortedItems.map((item) => {
    const index = (counts.get(item.type) ?? 0) + 1;
    counts.set(item.type, index);
    return [item.id, index];
  }));
}

export default function ReleasePanelDialog({
  open,
  onOpenChange,
  groupName,
  sessionId,
  phaseCount,
}: Readonly<ReleasePanelProps>) {
  const [loading, setLoading] = useState(false);
  const [working, setWorking] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [panelData, setPanelData] = useState<ReleasePanelData | null>(null);
  const [releasedSortField, setReleasedSortField] = useState<ReleasedSortField>("time");
  const [releasedSortDirection, setReleasedSortDirection] = useState<SortDirection>("desc");
  const [previewItem, setPreviewItem] = useState<
    Pick<ReleasePendingItem, "label" | "previewUrl"> | null
  >(null);

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
      void Promise.resolve().then(loadPanelData);
    }
  }, [open, loadPanelData]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setPanelData(null);
      setError("");
      setWorking(null);
      setPreviewItem(null);
    }
    onOpenChange(nextOpen);
  };

  const pendingByPhase = useMemo(
    () => groupByPhase(panelData?.pending ?? []),
    [panelData],
  );
  const itemFallbackIndices = useMemo(
    () => fallbackIndices([...(panelData?.pending ?? []), ...(panelData?.released ?? [])]),
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

  const releasedEntries = useMemo(
    () => [...(panelData?.released ?? [])].sort((a, b) => {
      const comparison = releasedSortField === "name"
        ? itemDisplayName(a.label, a.type, itemFallbackIndices.get(a.id) ?? 1)
          .localeCompare(itemDisplayName(b.label, b.type, itemFallbackIndices.get(b.id) ?? 1))
        : Date.parse(a.releasedAt) - Date.parse(b.releasedAt);
      return releasedSortDirection === "asc" ? comparison : -comparison;
    }),
    [itemFallbackIndices, panelData, releasedSortDirection, releasedSortField],
  );

  return (
    <>
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
          <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2 xl:grid-cols-3">
            {phases.map((phase) => {
              const phaseItems = pendingByPhase.get(phase) ?? [];

              const byType = new Map<ReleasableItemType, number>();
              phaseItems.forEach((item) => {
                byType.set(item.type, (byType.get(item.type) ?? 0) + 1);
              });

              const summary = [...byType.entries()]
                .map(([type, count]) => {
                  const label = TYPE_LABELS[type] ?? type;
                  if (type === "media") return `${count} Media ${count === 1 ? "item" : "items"}`;
                  return `${count} ${label}${count === 1 ? "" : "s"}`;
                })
                .join(", ");

              return (
                <Card key={phase} data-testid={`release-phase-card-${phase}`} className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] content-start gap-x-3 gap-y-2 self-start p-3">
                  <div className="min-w-0 pb-2">
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
                    phaseItems.map((item) => {
                      const displayName = itemDisplayName(
                        item.label,
                        item.type,
                        itemFallbackIndices.get(item.id) ?? 1,
                      );
                      return (
                        <div
                          key={`${item.type}-${item.id}`}
                          className="col-span-2 grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 border-t border-slate-100 pt-2"
                        >
                          <span className="min-w-0 text-sm text-slate-600 line-clamp-2">
                            {displayName}
                          </span>
                          <div className="flex items-center justify-end gap-1">
                            {item.type === "media" && item.previewUrl && (
                              <Button
                                type="button"
                                size="sm"
                                variant="link"
                                className="h-6 px-1 text-sm"
                                onClick={() => setPreviewItem(item)}
                              >
                                Preview
                              </Button>
                            )}
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
                          </div>
                        </div>
                      );
                    }))}
                </Card>
              );
            })}
          </div>
        )}

        {!loading && !error && releasedEntries.length > 0 && (
          <div role="separator" aria-orientation="horizontal" className="border-t border-slate-200" />
        )}

        {releasedEntries.length > 0 && (
          <Card className="w-full rounded-lg p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="font-semibold text-slate-800" data-testid="released-items-heading">
                Items released to {groupName}
                <span className="ml-2 text-slate-600 font-normal">({releasedEntries.length})</span>
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-slate-500">Sort:</span>
                <div className="flex items-center gap-1" aria-label="Sort released items by">
                  <Button
                    type="button"
                    size="sm"
                    variant={releasedSortField === "name" ? "secondary" : "outline"}
                    className="h-7 px-2 text-xs"
                    aria-pressed={releasedSortField === "name"}
                    onClick={() => setReleasedSortField("name")}
                  >
                    Name
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={releasedSortField === "time" ? "secondary" : "outline"}
                    className="h-7 px-2 text-xs"
                    aria-pressed={releasedSortField === "time"}
                    onClick={() => setReleasedSortField("time")}
                  >
                    Release time
                  </Button>
                </div>
                <div className="flex items-center gap-1" aria-label="Released item sort direction">
                  <Button
                    type="button"
                    size="sm"
                    variant={releasedSortDirection === "asc" ? "secondary" : "outline"}
                    className="h-7 px-2 text-xs"
                    aria-label="Sort ascending"
                    aria-pressed={releasedSortDirection === "asc"}
                    onClick={() => setReleasedSortDirection("asc")}
                  >
                    Asc
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={releasedSortDirection === "desc" ? "secondary" : "outline"}
                    className="h-7 px-2 text-xs"
                    aria-label="Sort descending"
                    aria-pressed={releasedSortDirection === "desc"}
                    onClick={() => setReleasedSortDirection("desc")}
                  >
                    Desc
                  </Button>
                </div>
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
            </div>
            <ul className="grid max-h-60 grid-cols-1 gap-x-6 overflow-y-auto md:grid-cols-2 xl:grid-cols-3">
              {releasedEntries.map((entry) => {
                const fallbackIndex = itemFallbackIndices.get(entry.id) ?? 1;
                return (
                  <li key={`${entry.type}-${entry.id}`} className="flex min-w-0 items-center justify-between gap-2 border-t border-slate-100 px-2 py-3">
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
                    <div className="ml-2 flex shrink-0 items-center gap-1">
                      {entry.type === "media" && entry.previewUrl && (
                        <Button
                          type="button"
                          size="sm"
                          variant="link"
                          className="h-6 px-1 text-sm"
                          onClick={() => setPreviewItem(entry)}
                        >
                          Preview
                        </Button>
                      )}
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="text-xs h-6"
                        data-testid={`unrelease-item-${itemDisplayName(entry.label, entry.type, fallbackIndex)}`}
                        disabled={working !== null}
                        onClick={() => unreleaseItems([entry], `un-${entry.id}`)}
                      >
                        {working === `un-${entry.id}` ? "Removing…" : "Un-release"}
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>
        )}
      </DialogContent>
      </Dialog>
      <PreviewDialog
        open={previewItem !== null}
        onOpenChange={(isOpen) => {
          if (!isOpen) setPreviewItem(null);
        }}
      >
        <PreviewDialogContent className="max-h-[90vh] w-[calc(100%-2rem)] max-w-5xl overflow-y-auto">
          <PreviewDialogHeader>
            <PreviewDialogTitle>Media preview</PreviewDialogTitle>
          </PreviewDialogHeader>
          {previewItem?.previewUrl && (
            <Image
              src={previewItem.previewUrl}
              alt={previewItem.label || "Preview of media item"}
              width={1200}
              height={900}
              unoptimized
              className="mx-auto max-h-[75vh] max-w-full object-contain"
            />
          )}
        </PreviewDialogContent>
      </PreviewDialog>
    </>
  );
}
