"use client";

import { X } from "lucide-react";
import { useContext, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { deleteProductImage } from "@/actions/admin";
import { FileUploader } from "@/components/extension/file-uploader";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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
    <div className="group relative w-full overflow-hidden rounded-lg">
      <button
        onClick={onDelete}
        disabled={isDeleting}
        className="absolute right-2 top-2 z-10 rounded-full bg-black/50 p-2 text-white opacity-0 transition-opacity hover:bg-black disabled:cursor-not-allowed disabled:opacity-50 group-hover:opacity-100"
      >
        <X className="size-4" />
      </button>
      <div className="absolute left-2 top-2 z-10 flex size-6 items-center justify-center rounded-full bg-black/50 text-sm text-white">
        {index + 1}
      </div>
      {isNew && (
        <div className="absolute right-2 top-12 z-10 rounded-full bg-black/50 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
          저장 전
        </div>
      )}
      <Dialog>
        <DialogTrigger asChild>
          <button className="w-full">
            <ImageWithFallback
              src={imageUrl}
              alt={`Image ${index + 1}`}
              width={768}
              height={0}
              className="h-auto w-full"
              unoptimized={isNew}
            />
          </button>
        </DialogTrigger>
        <DialogContent className="-ml-2 w-[min(704px,calc(100vw-4rem))] max-w-none border-none p-0">
          <DialogTitle className="sr-only">이미지 미리보기</DialogTitle>
          <div className="relative h-[clamp(16rem,50vw+5rem,32rem)] w-full">
            <ImageWithFallback
              src={imageUrl}
              alt={`Image ${index + 1}`}
              fill
              className="object-fill"
              priority
              unoptimized={isNew}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function EditDetailImagesUploader() {
  const [context, setContext] = useContext(Context);
  const [isDeleting, setIsDeleting] = useState<{ [key: string]: boolean }>({});

  // Create stable object URLs that persist across renders
  const newImageUrls = useMemo(() => {
    return context.productImages.map((file) => {
      if (typeof file === "string") return file;
      return URL.createObjectURL(file);
    });
  }, [context.productImages]);

  // Cleanup object URLs when component unmounts or images change
  useEffect(() => {
    return () => {
      newImageUrls.forEach((url) => {
        if (url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [newImageUrls]);

  const dropZoneConfig = {
    accept: {
      "image/*": [".jpg", ".jpeg", ".png", ".gif", ".svg"],
    },
    multiple: true,
    maxFiles: 10,
  };

  const handleDelete = async (url: string, index: number, isNew: boolean) => {
    try {
      setIsDeleting((prev) => ({ ...prev, [url]: true }));

      if (!isNew && context.existingDetailImages) {
        const urlWithoutLeadingSlash = url.replace(/^\//, "");
        const existingImage = context.existingDetailImages.find(
          (img) => img.url === urlWithoutLeadingSlash || img.url === url
        );
        if (existingImage) {
          const confirmed = confirm(
            "이미지를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습���다."
          );
          if (!confirmed) {
            return;
          }

          await deleteProductImage({
            id: existingImage.id,
            type: "detail",
            productId: context.id!,
          });
          setContext((prev) => ({
            ...prev,
            existingDetailImages:
              prev.existingDetailImages?.filter(
                (img) => img.url !== urlWithoutLeadingSlash && img.url !== url
              ) || [],
          }));
          toast.success("이미지가 삭제되었습니다.");
          return;
        }
      }

      // If not an existing image, it must be a new one
      setContext((prev) => ({
        ...prev,
        productImages: prev.productImages.filter((_, i) => i !== index),
      }));
      toast.success("이미지가 삭제되었습니다.");
    } catch {
      toast.error("이미지 삭제에 실패했습니다.");
    } finally {
      setIsDeleting((prev) => ({ ...prev, [url]: false }));
    }
  };

  return (
    <div className="space-y-4">
      <FileUploader
        value={context.productImages}
        onValueChange={(files) =>
          setContext((prev) => ({
            ...prev,
            productImages: files ?? [],
          }))
        }
        dropzoneOptions={dropZoneConfig}
        className="relative rounded-lg border-2 border-black bg-background p-2"
      >
        <FileInputWrapper />
      </FileUploader>

      <div className="space-y-4">
        {/* Existing Images */}
        {context.existingDetailImages?.map((image, index) => (
          <ImageItem
            key={image.url}
            url={image.url}
            index={index}
            onDelete={() => handleDelete(image.url, index, false)}
            isDeleting={isDeleting[image.url] || false}
            isNew={false}
          />
        ))}

        {/* New Images */}
        {context.productImages.map((file, index) => {
          const url = URL.createObjectURL(file);
          return (
            <ImageItem
              key={url}
              url={url}
              index={(context.existingDetailImages?.length || 0) + index}
              onDelete={() => handleDelete(url, index, true)}
              isDeleting={isDeleting[url] || false}
              isNew={true}
            />
          );
        })}
      </div>
    </div>
  );
}
