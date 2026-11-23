'use client'

import { ChevronDown, Image as ImageIcon, Upload, X } from "lucide-react";
import { FormShell } from "../../components/formShell";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFormContext } from "@/context/FormContext";
import { addCaseMedia, saveCaseData } from "@/actions/case_builder/caseBuilder";
import { CaseSection } from "@/lib/caseSections";
import type { MediaImageData } from "@/utils/form";
import { toast } from "sonner";
import { caseBuilderPath } from "@/lib/caseBuilder/routes";
import { TimeOffsetInput } from "@/app/admin/case-builder/components/timeOffsetInput";
import { timeOffsetPartsFromMinutes } from "@/utils/form";

function mediaTimeOffsetLabel(media: MediaImageData): string {
  if (media.phase > 1) return "Released live";
  if (media.timeOffset === null) return "Time not set";
  if (media.timeOffset === 0) return "at sim start";

  const { days, hours, minutes } = timeOffsetPartsFromMinutes(media.timeOffset);
  const parts = [
    days ? `${days}d` : null,
    hours ? `${hours}h` : null,
    minutes ? `${minutes}m` : null,
  ].filter(Boolean);
  const sign = media.timeOffset < 0 ? "-" : "+";
  return `${sign}${parts.join(" ")} ${media.timeOffset < 0 ? "before" : "after"} sim`;
}

const MediaForm = () => {
  const router = useRouter();
  const { caseId, mediaData, demographicData, onDataChange } = useFormContext();
  const [images, setImages] = useState<MediaImageData[]>(mediaData);
  const [isSavingMedia, setIsSavingMedia] = useState(false);
  const isSavingMediaRef = useRef(false);
  const MAX_SIZE_MB = 10
  const phases = Array.from({ length: Math.max(1, demographicData.phaseCount) }, (_, index) => index + 1);

  const updateImages = (nextImages: MediaImageData[]) => {
    setImages(nextImages);
    onDataChange(CaseSection.MEDIA, nextImages);
  };

  const saveMedia = async (nextImages: MediaImageData[]): Promise<boolean> => {
    if (!caseId) {
      toast.error("Please complete earlier steps.");
      return false;
    }
    if (isSavingMediaRef.current) return false;

    isSavingMediaRef.current = true;
    setIsSavingMedia(true);
    try {
      const result = await saveCaseData({
        payload: nextImages,
        section: CaseSection.MEDIA,
        caseId,
      });
      if (!result?.data) throw new Error("Media save returned no data.");
      updateImages(result.data);
      return true;
    } catch (err) {
      console.error(err);
      toast.error("Failed to save Media.");
      return false;
    } finally {
      isSavingMediaRef.current = false;
      setIsSavingMedia(false);
    }
  };

  const addMediaItems = async (newImages: MediaImageData[]): Promise<boolean> => {
    if (!caseId) {
      toast.error("Please complete earlier steps.");
      return false;
    }
    if (isSavingMediaRef.current) return false;

    isSavingMediaRef.current = true;
    setIsSavingMedia(true);
    try {
      const result = await addCaseMedia(newImages, caseId);
      if (!result?.data) throw new Error("Media save returned no data.");
      updateImages([...result.data, ...images]);
      return true;
    } catch (err) {
      console.error(err);
      toast.error("Failed to save Media.");
      return false;
    } finally {
      isSavingMediaRef.current = false;
      setIsSavingMedia(false);
    }
  };

  const handleSubmit = async () => {
    if (isSavingMediaRef.current) {
      toast.error("Please wait for media to finish saving.");
      return;
    }
    if (await saveMedia(images)) {
      router.push(caseBuilderPath("/admin/case-builder/form/review", caseId));
    }
  };

  const goBack = () => {
    onDataChange(CaseSection.MEDIA, images);
    router.push(caseBuilderPath("/admin/case-builder/form/medication-administrations", caseId));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || isSavingMediaRef.current) return;

    const selectedFiles = Array.from(e.target.files).filter((file) => {
      if (!file.type.startsWith('image/')) return false;
      if (file.size >= MAX_SIZE_MB * 1024 * 1024) {
        toast.error(`${file.name} exceeds ${MAX_SIZE_MB}MB and was skipped.`);
        return false;
      }
      return true;
    });

    e.target.value = "";
    if (selectedFiles.length === 0) return;

    const newImages = selectedFiles.map((file) => ({
      id: crypto.randomUUID(),
      previewUrl: URL.createObjectURL(file),
      title: file.name.replace(/\.[^.]+$/, ""),
      description: "",
      timeOffset: 0,
      department: "",
      file,
      phase: 1,
      isInPresim: true,
    }));

    if (await addMediaItems(newImages)) {
      newImages.forEach((media) => URL.revokeObjectURL(media.previewUrl));
    } else {
      updateImages([...newImages, ...images]);
    }
  };

  const removeImage = (id: string) => {
    if (isSavingMediaRef.current) return;
    const target = images.find((media) => media.id === id);
    if (target?.previewUrl.startsWith("blob:")) URL.revokeObjectURL(target.previewUrl);

    updateImages(images.filter((media) => media.id !== id));
    toast.success("Removed image.");
  };

  const updateImage = (id: string, values: Partial<MediaImageData>) => {
    updateImages(images.map((image) => image.id === id ? { ...image, ...values } : image));
  };

  return (
    <FormShell
      title="Add Media"
      stepDescription="Review case before submitting"
      icon={<ImageIcon className="text-slate-400" />}
      onSubmit={handleSubmit}
      goBack={goBack}
      continueButtonText="Continue"
      backButtonText="Back"
      continueButtonTooltip="Proceed to Next Page"
      backButtonTooltip="Return to Previous Page"
    >
      <div className="bg-slate-50/50 flex-1 overflow-y-auto p-6 md:px-8 lg:px-12">
        <div className="mx-auto max-w-6xl pb-20">
          <Card className="border-slate-200 shadow-sm pt-0">
              <CardHeader className="bg-slate-50 border-b border-slate-200 pt-4 !pb-2 rounded-t-xl">
                <CardTitle className="text-lg flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Upload className="w-4 h-4 text-blue-600" /> New Image
                  </span>
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4 pt-4">
                <Input
                  id="image-upload"
                  type="file"
                  multiple
                  accept="image/*"
                  disabled={isSavingMedia}
                  onChange={handleImageChange}
                />
                {isSavingMedia && (
                  <p role="status" className="text-sm text-slate-500">Saving media…</p>
                )}

                {images.length > 0 && (
                  <div className="grid grid-cols-1 items-start gap-4 pt-2">
                    {images.map((media) => (
                      <Collapsible
                        key={media.id}
                        className="overflow-hidden rounded-lg border bg-white"
                      >
                        <div className="flex items-start gap-2 bg-slate-50/50 p-3">
                          <CollapsibleTrigger asChild>
                            <button
                              type="button"
                              disabled={isSavingMedia}
                              className="group grid min-w-0 flex-1 cursor-pointer grid-cols-[minmax(0,1fr)_auto] grid-rows-[20px_auto] items-center gap-x-3 text-left disabled:cursor-not-allowed"
                            >
                              <span className="col-start-1 row-start-1 block truncate text-sm font-semibold leading-5 text-slate-800">
                                {media.title || "Untitled media"}
                              </span>
                              <ChevronDown className="col-start-2 row-start-1 size-4 text-slate-500 transition-transform group-data-[state=open]:rotate-180" />
                              <span className="col-start-1 row-start-2 block truncate text-xs text-slate-500">
                                {[mediaTimeOffsetLabel(media), media.department.trim()]
                                  .filter(Boolean)
                                  .join(" · ")}
                              </span>
                            </button>
                          </CollapsibleTrigger>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label={`Remove ${media.title || "media"}`}
                            disabled={isSavingMedia}
                            onClick={() => removeImage(media.id)}
                            className="h-5 w-5 shrink-0 p-0 text-slate-400 hover:text-red-600"
                          >
                            <X className="size-4" />
                          </Button>
                        </div>
                        <CollapsibleContent className="border-t p-3">
                          <div className="grid items-start gap-4 md:grid-cols-2">
                            <div className="flex h-full w-full items-center justify-center">
                              <img
                                src={media.previewUrl}
                                alt={media.title || "Case media"}
                                className="max-h-96 max-w-full rounded-lg object-contain"
                              />
                            </div>
                            <div className="space-y-3">
                              <div className="space-y-1.5">
                                <Label htmlFor={`media-title-${media.id}`}>Title</Label>
                                <Input
                                  id={`media-title-${media.id}`}
                                  value={media.title}
                                  disabled={isSavingMedia}
                                  placeholder="e.g. CT head and neck angiogram"
                                  onChange={(event) =>
                                    updateImage(media.id, { title: event.target.value })
                                  }
                                />
                              </div>
                              <div className="space-y-1.5">
                                <Label htmlFor={`media-description-${media.id}`}>Description</Label>
                                <Textarea
                                  id={`media-description-${media.id}`}
                                  value={media.description}
                                  disabled={isSavingMedia}
                                  placeholder="Describe the findings or relevant details."
                                  rows={3}
                                  onChange={(event) =>
                                    updateImage(media.id, { description: event.target.value })
                                  }
                                />
                              </div>
                              <div className="space-y-1.5">
                                <Label htmlFor={`media-department-${media.id}`}>Department</Label>
                                <Input
                                  id={`media-department-${media.id}`}
                                  value={media.department}
                                  disabled={isSavingMedia}
                                  placeholder="e.g. Imaging"
                                  onChange={(event) =>
                                    updateImage(media.id, { department: event.target.value })
                                  }
                                />
                              </div>
                              <div className="flex flex-wrap items-end gap-4">
                                <div className="min-w-32 flex-1 space-y-1.5">
                                  <Label htmlFor={`media-phase-${media.id}`}>Release phase</Label>
                                  <Select
                                    value={String(media.phase ?? 1)}
                                    disabled={isSavingMedia}
                                    onValueChange={(value) => {
                                      const phase = Number(value);
                                      updateImage(media.id, {
                                        phase,
                                        isInPresim: phase > 1 ? false : media.isInPresim,
                                        timeOffset: phase > 1 ? null : media.timeOffset ?? 0,
                                      });
                                    }}
                                  >
                                    <SelectTrigger id={`media-phase-${media.id}`}>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {phases.map((phase) => (
                                        <SelectItem key={phase} value={String(phase)}>
                                          Phase {phase}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="flex items-center gap-2 pb-2">
                                  <Checkbox
                                    id={`media-presim-${media.id}`}
                                    checked={!media.isInPresim}
                                    disabled={(media.phase ?? 1) > 1 || isSavingMedia}
                                    onCheckedChange={(checked) =>
                                      updateImage(media.id, { isInPresim: !checked })
                                    }
                                  />
                                  <Label htmlFor={`media-presim-${media.id}`} className="text-sm font-normal">
                                    Exclude from Pre-Sim
                                  </Label>
                                </div>
                              </div>
                              <div className="space-y-1.5">
                                <Label>Time offset before simulation</Label>
                                {media.phase > 1 ? (
                                  <p className="rounded-md border bg-slate-50 px-3 py-2 text-sm text-slate-500">
                                    Released live
                                  </p>
                                ) : (
                                  <TimeOffsetInput
                                    idPrefix={`media-offset-${media.id}`}
                                    value={media.timeOffset}
                                    onChange={(timeOffset) =>
                                      updateImage(media.id, { timeOffset })
                                    }
                                    direction="before"
                                    disabled={isSavingMedia}
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
        </div>
      </div>
    </FormShell>
  );
};

export default MediaForm;
