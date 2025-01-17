"use client";

import { useContext, useState } from "react";
import { toast } from "sonner";

import { deleteProductImage } from "@/actions/admin";
import { FileUploader } from "@/components/extension/file-uploader";

import { FileInputWrapper } from "../../add/_components/FileInputWrapper";
import { ImageWithFallback } from "../../add/_components/ImageWithFallback";
import { Context } from "../../add/_providers/ContextProvider";

interface ImageProps {
  url: string;
  index: number;
  onDelete: () => void;
  isDeleting: boolean;
  isNew?: boolean;
}

function ImageItem({ url, index, onDelete, isDeleting, isNew }: ImageProps) {
  const imageUrl = isNew ? url : url.startsWith("/") ? url : `/${url}`;

  return (
    <div className="group relative aspect-square w-full overflow-hidden rounded-lg border bg-gray-50">
      <div className="absolute left-2 top-2 z-10 flex size-6 items-center justify-center rounded-full bg-black/50 text-sm text-white">
        {index + 1}
      </div>
      <button
        onClick={onDelete}
        disabled={isDeleting}
        className="absolute right-2 top-2 z-10 rounded-full bg-black/50 p-2 text-white opacity-0 transition-opacity hover:bg-black disabled:cursor-not-allowed disabled:opacity-50 group-hover:opacity-100"
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
      {isNew && (
        <div className="absolute right-2 top-12 z-10 rounded-full bg-black/50 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
          저장 전
        </div>
      )}
      <div className="absolute inset-0 bg-black/5 opacity-0 transition-opacity group-hover:opacity-100" />
      <ImageWithFallback
        src={imageUrl}
        alt={`Image ${index + 1}`}
        width={400}
        height={400}
        className="size-full object-cover"
        unoptimized={isNew}
      />
    </div>
  );
}

const EditImagesUploader = () => {
  const [context, setContext] = useContext(Context);
  const [isDeleting, setIsDeleting] = useState(false);

  const dropZoneConfig = {
    accept: {
      "image/*": [".jpg", ".jpeg", ".png", ".gif"],
    },
    maxSize: 1024 * 1024 * 10,
    multiple: true,
    maxFiles: 10,
  };

  const handleDelete = async (id: number) => {
    if (isDeleting) return;

    const confirmed = confirm(
      "이미지를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
    );
    if (!confirmed) return;

    try {
      setIsDeleting(true);
      const result = await deleteProductImage({
        id,
        type: "main",
        productId: context.id!,
      });

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      setContext((prev) => ({
        ...prev,
        existingMainImages:
          prev.existingMainImages?.filter((img) => img.id !== id) ?? [],
      }));
      toast.success(result.message);
    } catch {
      toast.error("이미지 삭제에 실패했습니다");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <FileUploader
        value={context.productMainImages}
        onValueChange={(files) =>
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

      <div className="grid auto-rows-fr grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {/* Existing Images */}
        {context.existingMainImages?.map((image, index) => (
          <ImageItem
            key={image.url}
            url={image.url}
            index={index}
            onDelete={() => handleDelete(image.id)}
            isDeleting={isDeleting}
            isNew={false}
          />
        ))}

        {/* New Images */}
        {context.productMainImages.map((file, index) => {
          const url = URL.createObjectURL(file);
          return (
            <ImageItem
              key={url}
              url={url}
              index={(context.existingMainImages?.length || 0) + index}
              onDelete={() => {
                const newFiles = [...context.productMainImages];
                newFiles.splice(index, 1);
                setContext((prev) => ({
                  ...prev,
                  productMainImages: newFiles,
                }));
              }}
              isDeleting={false}
              isNew={true}
            />
          );
        })}
      </div>
    </div>
  );
};

export default EditImagesUploader;
