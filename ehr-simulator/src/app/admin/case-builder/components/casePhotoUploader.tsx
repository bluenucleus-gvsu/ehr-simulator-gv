"use client"

import { useEffect, useRef, useState } from "react"
import { CircleUserRound, ImagePlus, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

interface CasePhotoUploaderProps {
  readonly imageUrl?: string
  readonly disabled?: boolean
  readonly onFileChange: (file: File | null) => void
  readonly onRemove: () => void
}

export function CasePhotoUploader({
  imageUrl,
  disabled = false,
  onFileChange,
  onRemove,
}: Readonly<CasePhotoUploaderProps>) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState(imageUrl ?? "")
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(imageUrl ?? "")
      return
    }

    const objectUrl = URL.createObjectURL(selectedFile)
    setPreviewUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [imageUrl, selectedFile])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.")
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error("The image must be 5 MB or smaller.")
      return
    }

    setSelectedFile(file)
    onFileChange(file)
  }

  const handleRemove = () => {
    setSelectedFile(null)
    setPreviewUrl("")
    onFileChange(null)
    onRemove()
  }

  return (
    <div className="space-y-3">
      <div className="flex aspect-square items-center justify-center rounded-md border border-dashed border-slate-300 bg-slate-100">
        {previewUrl ? (
          <img className="h-full w-full object-contain" alt="Patient profile preview" src={previewUrl} />
        ) : (
          <CircleUserRound className="h-20 w-20 text-slate-400" aria-hidden="true" />
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
        className="hidden"
      />
      <div className="flex min-w-0 gap-2">
        <Button
          type="button"
          variant="outline"
          className="min-w-0 flex-1 gap-1"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
        >
          <ImagePlus />
          {previewUrl ? "Replace profile image" : "Upload profile image"}
        </Button>
        {previewUrl && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="shrink-0"
            aria-label="Remove image"
            title="Remove image"
            onClick={handleRemove}
            disabled={disabled}
          >
            <Trash2 />
          </Button>
        )}
      </div>
    </div>
  )
}
