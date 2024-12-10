"use client";

import Image from "next/image";
import { useContext, useEffect, useMemo } from "react";
import { toast } from "sonner";

import { FileUploader } from "@/components/extension/file-uploader";

import { FileInputWrapper } from "./FileInputWrapper";
import { Context } from "../_providers/ContextProvider";

const ImagesUploader = () => {
  const [context, setContext] = useContext(Context);

  // Create stable object URLs that persist across renders
  const imageUrls = useMemo(() => {
    return context.productMainImages.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
  }, [context.productMainImages]);

  // Cleanup object URLs when component unmounts or images change
  useEffect(() => {
    return () => {
      imageUrls.forEach(({ url }) => URL.revokeObjectURL(url));
    };
  }, [imageUrls]);

  const dropZoneConfig = {
    accept: {
      "image/*": [".jpg", ".jpeg", ".png", ".gif"],
    },
    maxSize: 1024 * 1024 * 5, // 5MB
    multiple: true,
    maxFiles: 10,
    onDrop: (acceptedFiles: File[]) => {
      if (acceptedFiles.length + context.productMainImages.length > 10) {
        toast.error("최대 10개의 이미지만 ���로드할 수 있습니다");
        return;
      }

      const validFiles = acceptedFiles.filter((file) => {
        const isValidType = ["image/jpeg", "image/png", "image/gif"].includes(
          file.type
        );
        if (!isValidType) {
          toast.error(`${file.name}은(는) 지원하지 않는 파일 형식입니다`);
          return false;
        }
        return true;
      });

      setContext((prev) => ({
        ...prev,
        productMainImages: [...prev.productMainImages, ...validFiles],
      }));
    },
  };

  const handleRemoveImage = (index: number) => {
    setContext((prev) => {
      const newFiles = [...prev.productMainImages];
      newFiles.splice(index, 1);
      return {
        ...prev,
        productMainImages: newFiles,
      };
    });
  };

  return (
    <div className="space-y-4">
      <FileUploader
        value={context.productMainImages}
        onValueChange={(files: File[] | null) =>
          setContext((prev) => ({
            ...prev,
            productMainImages: files ?? [],
          }))
        }
        dropzoneOptions={dropZoneConfig}
        className="relative rounded-lg border-2 border-black bg-background p-2"
      >
        <FileInputWrapper />
      </FileUploader>

      {imageUrls.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {imageUrls.map(({ url }, index) => (
            <div
              key={`${url}-${index}`}
              className="group relative aspect-square w-full overflow-hidden rounded-lg border bg-gray-50"
            >
              <div className="absolute left-2 top-2 z-10 flex size-6 items-center justify-center rounded-full bg-black/50 text-sm font-medium text-white">
                {index + 1}
              </div>
              <button
                onClick={() => handleRemoveImage(index)}
                className="absolute right-2 top-2 z-10 rounded-full bg-black/50 p-2 text-white opacity-0 transition-all hover:bg-black group-hover:opacity-100"
                type="button"
                aria-label="이미지 삭제"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
              <Image
                src={url}
                alt={`상품 이미지 ${index + 1}`}
                width={400}
                height={400}
                className="size-full object-cover"
                priority={index < 4} // Prioritize loading for first 4 images
                loading={index < 4 ? "eager" : "lazy"}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex h-48 items-center justify-center rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-muted-foreground">업로드된 이미지가 없습니다</p>
        </div>
      )}
    </div>
  );
};

export default ImagesUploader;
