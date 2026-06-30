'use client'
import { Image as ImageIcon, Upload, X } from "lucide-react"; // Renamed Image to ImageIcon to avoid confusion
import { FormShell } from "../../components/formShell";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ImagePreview {
  id: string;
  file: File;
  previewUrl: string;
}

const MediaForm = () => {
    const router = useRouter();
    const [images, setImages] = useState<ImagePreview[]>([]);

    // Handle form submission to your backend
    const handleSubmit = async () => {
        if (images.length === 0) {
            router.push('/admin/case-builder/form/review');
            return;
        }

        
        const formData = new FormData();
        images.forEach((img) => {
            formData.append("files", img.file);
        });

        try {
            // Replace with your actual API endpoint
            
            console.log(`${images.length} images successfully prepared for upload.`);
            router.push('/admin/case-builder/form/review');
        } catch (error) {
            console.error("Upload error:", error);
        }
    }

    const goBack = () => {
        router.push("/admin/case-builder/form/medication-administrations");
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;

        const selectedFiles = Array.from(e.target.files);

        const newImages: ImagePreview[] = selectedFiles.map((file) => ({
            id: crypto.randomUUID(),
            file,
            previewUrl: URL.createObjectURL(file)
        }));

        setImages((prev) => [...prev, ...newImages]);

        e.target.value = '';
    }

    const removeImage = (id: string, previewUrl: string) => {
        URL.revokeObjectURL(previewUrl);
        setImages((prev) => prev.filter((img) => img.id !== id));
    };

    useEffect(() => {
        return () => {
            images.forEach(img => URL.revokeObjectURL(img.previewUrl));
        };
    }, []);

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
            <div className="bg-slate-50/50 flex-1 overflow-y-auto p-6 md:px-8 lg:px-12 ">
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

                                {/* --- IMAGE PREVIEW GRID --- */}
                                {images.length > 0 && (
                                    <div className="grid grid-cols-2 gap-4 pt-2">
                                        {images.map((img, idx) => (
                                            <div key={idx} className="relative group aspect-square border rounded-lg overflow-hidden bg-slate-100">
                                                <img 
                                                    src={img.previewUrl} 
                                                    alt="preview" 
                                                    className="w-full h-full object-contain"
                                                />
                                                <Button
                                                    type="button"
                                                    onClick={() => removeImage(img.id, img.previewUrl)}
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
    )
}

export default MediaForm;