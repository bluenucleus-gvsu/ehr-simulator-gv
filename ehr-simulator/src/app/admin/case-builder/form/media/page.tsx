'use client'

import { Image as ImageIcon, Upload, X } from "lucide-react";
import { FormShell } from "../../components/formShell";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFormContext } from "@/context/FormContext";
import { saveCaseData } from "@/actions/case_builder/caseBuilder";
import { CaseSection } from "@/lib/caseSections";
import type { MediaImageData } from "@/utils/form";
import { toast } from "sonner";
import { caseBuilderPath } from "@/lib/caseBuilder/routes";

const MediaForm = () => {
  const router = useRouter();
  const { caseId, mediaData, demographicData, onDataChange } = useFormContext();
  const [images, setImages] = useState<MediaImageData[]>(mediaData);
  const MAX_SIZE_MB = 10
  const phases = Array.from({ length: Math.max(1, demographicData.phaseCount) }, (_, index) => index + 1);

  const updateImages = (nextImages: MediaImageData[]) => {
    setImages(nextImages);
    onDataChange(CaseSection.MEDIA, nextImages);
  };

  const handleSubmit = async () => {
    if (!caseId) {
      toast.error("Please complete earlier steps.");
      return;
    }
    try {
      const result = await saveCaseData({
        payload: images,
        section: CaseSection.MEDIA,
        caseId,
      });
      if (result?.data) updateImages(result.data);
      router.push(caseBuilderPath("/admin/case-builder/form/review", caseId));
    } catch (err) {
      console.error(err);
      toast.error("Failed to save Media.");
    }
  };

  const goBack = () => {
    onDataChange(CaseSection.MEDIA, images);
    router.push(caseBuilderPath("/admin/case-builder/form/medication-administrations", caseId));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const selectedFiles = Array.from(e.target.files).filter((file) => {
      if (!file.type.startsWith('image/')) return false;
      if (file.size >= MAX_SIZE_MB * 1024 * 1024) {
        toast.error(`${file.name} exceeds ${MAX_SIZE_MB}MB and was skipped.`);
        return false;
      }
      return true;
    });

    const newImages = selectedFiles.map((file) => ({
      id: crypto.randomUUID(),
      previewUrl: URL.createObjectURL(file),
      file,
      phase: 1,
      isInPresim: true,
    }));

    updateImages([...images, ...newImages]);
    e.target.value = "";
  };

  const removeImage = (id: string) => {
    const target = images.find((img) => img.id === id);
    if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);

    updateImages(images.filter((img) => img.id !== id));
    toast.success("Removed image.")
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
        <div className="grid grid-cols-1 2xl:grid-cols-12 gap-6 h-full max-w-7xl mx-auto pb-20">
          <div className="lg:col-span-7 space-y-6">
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
                  onChange={handleImageChange}
                />

                {images.length > 0 && (
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    {images.map((img) => (
                      <div key={img.id} className="space-y-3 rounded-lg border bg-white p-3">
                        <div className="relative aspect-square overflow-hidden rounded-lg bg-slate-100">
                          <img
                            src={img.previewUrl}
                            alt="Case media"
                            className="h-full w-full object-contain"
                          />
                          <Button
                            type="button"
                            aria-label="Remove image"
                            onClick={() => removeImage(img.id)}
                            className="absolute right-1 top-1 rounded-full bg-rose-500 p-1 text-white"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`media-phase-${img.id}`}>Release phase</Label>
                          <Select
                            value={String(img.phase ?? 1)}
                            onValueChange={(value) => {
                              const phase = Number(value);
                              updateImage(img.id, {
                                phase,
                                isInPresim: phase > 1 ? false : img.isInPresim,
                              });
                            }}
                          >
                            <SelectTrigger id={`media-phase-${img.id}`}>
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
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id={`media-presim-${img.id}`}
                              checked={!img.isInPresim}
                              disabled={(img.phase ?? 1) > 1}
                              onCheckedChange={(checked) =>
                                updateImage(img.id, { isInPresim: !checked })
                              }
                            />
                            <Label htmlFor={`media-presim-${img.id}`} className="text-sm font-normal">
                              Exclude from Pre-Sim
                            </Label>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </FormShell>
  );
};

export default MediaForm;
