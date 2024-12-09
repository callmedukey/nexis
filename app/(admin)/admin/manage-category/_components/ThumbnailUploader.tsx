"use client";

import { ImageIcon, X } from "lucide-react";
import Image from "next/image";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

import { cn } from "@/lib/utils";

interface ThumbnailUploaderProps {
  value?: string;
  onChange: (file: File | null) => void;
  className?: string;
  isExisting?: boolean;
}

const ACCEPTED_IMAGE_TYPES = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/gif": [".gif"],
  "image/webp": [".webp"],
  "image/avif": [".avif"],
  "image/svg+xml": [".svg"],
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function ThumbnailUploader({
  value,
  onChange,
  className,
  isExisting = false,
}: ThumbnailUploaderProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      if (rejectedFiles.length > 0) {
        const error = rejectedFiles[0].errors[0];
        if (error.code === "file-too-large") {
          toast.error("파일 크기는 5MB 이하여야 합니다");
        } else if (error.code === "file-invalid-type") {
          toast.error(
            "지원하지 않는 파일 형식입니다. (지원: PNG, JPEG, GIF, WebP, AVIF, SVG)"
          );
        } else {
          toast.error("파일 업로드에 실패했습니다");
        }
        return;
      }

      if (acceptedFiles.length > 0) {
        onChange(acceptedFiles[0]);
      }
    },
    [onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_IMAGE_TYPES,
    maxFiles: 1,
    multiple: false,
    maxSize: MAX_FILE_SIZE,
  });

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onChange(null);
  };

  return (
    <div className={cn("relative", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "group relative flex h-96 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed transition-colors",
          isDragActive
            ? "border-primary bg-primary/10"
            : "border-muted-foreground/25 hover:bg-muted/50"
        )}
      >
        <input {...getInputProps()} />

        {value ? (
          <div className="relative size-full p-4">
            <Image
              src={value}
              alt="Thumbnail"
              className="size-full rounded object-fill"
              width={384}
              height={384}
            />
            <div className="absolute inset-0 hidden rounded bg-black/50 group-hover:block" />
            <ImageIcon className="absolute left-1/2 top-1/2 hidden size-8 -translate-x-1/2 -translate-y-1/2 text-white group-hover:block" />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 p-4 text-muted-foreground">
            <ImageIcon className="size-12" />
            <div className="text-center text-sm">
              {isDragActive ? (
                <p>이미지를 여기에 놓아주세요</p>
              ) : (
                <>
                  <p>
                    클릭하여 이미지를 선택하거나
                    <br />
                    이미지를 여기로 드래그하세요
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    PNG, JPEG, GIF, WebP, AVIF, SVG (최대 5MB)
                  </p>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {value && !isExisting && (
        <button
          type="button"
          onClick={handleRemove}
          className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-destructive-foreground shadow-sm hover:bg-destructive/90"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
} 