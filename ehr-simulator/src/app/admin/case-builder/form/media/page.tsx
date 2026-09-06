'use client'

import { Image as ImageIcon, Upload, X } from "lucide-react";
import { FormShell } from "../../components/formShell";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useFormContext } from "@/context/FormContext";
import { saveCaseData } from "@/actions/case_builder/caseBuilder";
import { CaseSection } from "@/lib/saveCase";
import type { MediaImageData } from "@/utils/form";
import { toast } from "sonner";
import { caseBuilderPath } from "@/lib/caseBuilder/routes";

const MediaForm = () => {
  const router = useRouter();
  const { caseId, mediaData, onDataChange } = useFormContext();
  const [images, setImages] = useState<MediaImageData[]>(mediaData);
  const MAX_SIZE_MB = 10

  const updateImages = (nextImages: MediaImageData[]) => {
    setImages(nextImages);
    onDataChange("media", nextImages);
  };

  const handleSubmit = async () => {
    if (!caseId) {
      toast.error("Please complete earlier steps.");
      return;
    }
    try{
      const result = await saveCaseData({
        payload: images,
        section: CaseSection.MEDIA,
        caseId,
      });
      if (result?.data) updateImages(result.data);
      router.push(caseBuilderPath("/admin/case-builder/form/review", caseId));
    } catch(err){
      console.error(err);
      toast.error("Failed to save Media.");
    }
};

  const goBack = () => {
    onDataChange("media", images);
    router.push(caseBuilderPath("/admin/case-builder/form/medication-administrations", caseId));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const selectedFiles = Array.from(e.target.files).filter((file) => {
      if (!file.type.startsWith('image/')) return false;
      if (file.size >= MAX_SIZE_MB * 1024 * 1024){
        toast.error(`${file.name} exceeds ${MAX_SIZE_MB}MB and was skipped.`);
        return false;
      }
      return true;
    });

    const newImages = selectedFiles.map((file) => ({
      id: crypto.randomUUID(),
      previewUrl: URL.createObjectURL(file),
      file,
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

  return (
    <FormShell
      title="Add Media"
      stepDescription="Step 10 of 11: Review case before submitting"
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
                    {images.map((img, idx) => (
                      <div key={idx} className="relative group aspect-square border rounded-lg overflow-hidden bg-slate-100">
                        <img
                          src={img.previewUrl}
                          alt="Case media"
                          className="w-full h-full object-contain"
                        />
                        <Button
                          type="button"
                          onClick={() => removeImage(img.id)}
                          className="absolute top-1 right-1 bg-rose-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </Button>
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
