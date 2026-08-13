"use client";

import { useRef } from "react";
import { Image as ImageIcon } from "lucide-react";

interface PhotoUploadProps {
  /** Current photo URL to preview, or null/undefined if none selected. */
  value: string | null | undefined;
  /** Called with the chosen file once it's passed the image-type check. */
  onFileSelected: (file: File) => void;
  /** Called instead of onFileSelected when the chosen file isn't an image. */
  onInvalidFile?: (message: string) => void;
  /** Shown when set; omit to hide the remove control entirely. */
  onRemove?: () => void;
  /** Disables the upload trigger (and the remove control, unless removeDisabled is set). */
  disabled?: boolean;
  /** Disables just the remove control. Defaults to `disabled`. */
  removeDisabled?: boolean;
  /** Shows an "Uploading..." state on the upload trigger. */
  uploading?: boolean;
  /** Visual style: a large square dropzone, or a small avatar + text button. */
  variant?: "square" | "avatar";
  /** Alt text for the preview image / aria-label for the file input. */
  alt: string;
  /** aria-label for the remove control (avatar variant only). */
  removeLabel?: string;
  /** Inline error message, rendered below the dropzone (square variant only). */
  error?: string | null;
}

export default function PhotoUpload({
  value,
  onFileSelected,
  onInvalidFile,
  onRemove,
  disabled,
  removeDisabled,
  uploading,
  variant = "square",
  alt,
  removeLabel,
  error,
}: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      onInvalidFile?.("Please select an image file.");
      return;
    }

    onFileSelected(file);
  };

  const fileInput = (
    <input
      ref={inputRef}
      type="file"
      accept="image/*"
      className="hidden"
      aria-label={alt}
      onChange={handleChange}
    />
  );

  if (variant === "avatar") {
    return (
      <div className="flex items-center gap-3">
        {fileInput}
        {value && (
          <div className="flex items-center gap-1">
            <img
              src={value}
              alt={alt}
              className="h-10 w-10 rounded object-cover border"
            />
            {onRemove && (
              <button
                type="button"
                onClick={onRemove}
                disabled={removeDisabled ?? disabled}
                aria-label={removeLabel ?? "Remove photo"}
                className="text-black text-sm leading-none disabled:opacity-50"
              >
                ×
              </button>
            )}
          </div>
        )}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
          className="px-3 py-1 text-xs rounded-md font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50"
        >
          {uploading ? "Uploading..." : value ? "Replace Case Photo" : "Override Case Photo"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {fileInput}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
        className="relative h-[100px] w-[100px] rounded-lg border border-dashed border-slate-300 bg-white overflow-hidden hover:border-slate-400 transition-colors flex items-center justify-center disabled:opacity-70"
      >
        {value ? (
          <img
            src={value}
            alt={alt}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <span className="flex flex-col items-center gap-1 text-slate-400">
            <ImageIcon className="w-6 h-6" />
            <span className="text-xs">{uploading ? "Uploading..." : "Click to upload"}</span>
          </span>
        )}
      </button>
      {value && onRemove && (
        <button
          type="button"
          onClick={onRemove}
          disabled={removeDisabled ?? disabled}
          className="text-xs text-slate-400 hover:text-slate-600 disabled:opacity-50"
        >
          Remove
        </button>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
