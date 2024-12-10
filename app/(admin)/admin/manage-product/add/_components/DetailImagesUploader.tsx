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

import { FileInputWrapper } from "./FileInputWrapper";
import { ImageWithFallback } from "./ImageWithFallback";
import { Context } from "../_providers/ContextProvider";

interface ImageProps {
  id: number | string;
  url: string;
  index: number;
  onDelete: () => void;
  isDeleting: boolean;
}

function ImageItem({ url, index, onDelete, isDeleting }: ImageProps) {
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
      <Dialog>
        <DialogTrigger asChild>
          <button className="w-full">
            <ImageWithFallback
              src={url}
              alt={`Image ${index + 1}`}
              width={768}
              height={0}
              className="h-auto w-full"
              unoptimized
            />
          </button>
        </DialogTrigger>
        <DialogContent className="-ml-2 w-[min(704px,calc(100vw-4rem))] max-w-none border-none p-0">
          <DialogTitle className="sr-only">이미지 미리보기</DialogTitle>
          <div className="relative h-[clamp(16rem,50vw+5rem,32rem)] w-full">
            <ImageWithFallback
              src={url}
              alt={`Image ${index + 1}`}
              fill
              className="object-fill"
              priority
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const DetailImagesUploader = () => {
  const [context, setContext] = useContext(Context);
  const [isDeleting, setIsDeleting] = useState(false);

  // Create stable object URLs that persist across renders
  const newImageUrls = useMemo(() => {
    return (
      context.productImages?.map((file: File) => ({
        id: `new-${URL.createObjectURL(file)}`,
        url: URL.createObjectURL(file),
        isNew: true,
        file,
      })) || []
    );
  }, [context.productImages]);

  // Cleanup object URLs when component unmounts or images change
  useEffect(() => {
    return () => {
      newImageUrls.forEach(({ url }) => URL.revokeObjectURL(url));
    };
  }, [newImageUrls]);

  const dropZoneConfig = {
    accept: {
      "image/*": [".jpg", ".jpeg", ".png", ".gif", ".svg"],
    },
    multiple: true,
    maxFiles: 10,
  };

  const handleDelete = async (
    image: { id: number | string; url: string; isNew?: boolean },
    index: number
  ) => {
    if (isDeleting) return;

    const confirmed = confirm(
      "이미지를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
    );
    if (!confirmed) return;

    try {
      setIsDeleting(true);

      if (image.isNew) {
        // Remove from new images
        setContext((prev) => ({
          ...prev,
          productImages:
            prev.productImages?.filter(
              (file: File, i: number) => i !== index
            ) || [],
        }));
        toast.success("이미지가 삭제되었습니다.");
        return;
      }

      // Delete existing image
      const result = await deleteProductImage({
        id: typeof image.id === "string" ? parseInt(image.id) : image.id,
        type: "detail",
        productId: context.id as number,
      });

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      setContext((prev) => ({
        ...prev,
        existingDetailImages:
          prev.existingDetailImages?.filter(
            (img: { id: string | number }) => img.id !== image.id
          ) || [],
      }));
      toast.success(result.message);
    } catch (error) {
      console.error("Image deletion failed:", error);
      toast.error("이미지 삭제 중 오류가 발생했습니다");
    } finally {
      setIsDeleting(false);
    }
  };

  const allImages = [
    ...(context.existingDetailImages?.map(
      (img: { id: string | number; url: string }) => ({
        id: img.id,
        url: img.url,
      })
    ) || []),
    ...newImageUrls,
  ];

  return (
    <div className="space-y-4">
      <FileUploader
        value={context.productImages}
        onValueChange={(files: File[] | null) =>
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
        {allImages.map((image, index) => (
          <ImageItem
            key={image.id}
            id={image.id}
            url={image.url}
            index={index}
            onDelete={() => handleDelete(image, index)}
            isDeleting={isDeleting}
          />
        ))}
      </div>
    </div>
  );
};

export default DetailImagesUploader;
