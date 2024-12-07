"use client";

import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useContext, useState, useEffect, useRef } from "react";
import { toast } from "sonner";

import {
  deleteProductImage,
  reorderProductImages,
  uploadProductImages,
} from "@/actions/admin";
import { FileUploader, FileInput } from "@/components/extension/file-uploader";
import { cn } from "@/lib/utils";

import { FileSvgDraw } from "./FileSvgDraw";
import { ImageWithFallback } from "./ImageWithFallback";
import { Context } from "../_providers/ContextProvider";

interface UnifiedImage {
  id: string;
  url: string;
  isNew: boolean;
  file?: File;
  originalId?: number;
}

interface SortableImageProps {
  id: string;
  url: string;
  index: number;
  onDelete: () => void;
  isDeleting: boolean;
  isNew: boolean;
}

function SortableImage({
  id,
  url,
  index,
  onDelete,
  isDeleting,
  isNew,
}: SortableImageProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    disabled: isNew,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative aspect-square w-full overflow-hidden rounded-lg border bg-gray-50",
        isNew && "opacity-70"
      )}
    >
      <div className="absolute left-2 top-2 z-10 flex size-6 items-center justify-center rounded-full bg-black/50 text-sm text-white">
        {index + 1}
      </div>
      <button
        onClick={onDelete}
        disabled={isDeleting}
        className="absolute right-2 top-2 z-10 rounded-full bg-black/50 p-2 text-white opacity-0 transition-opacity hover:bg-black disabled:cursor-not-allowed disabled:opacity-50 group-hover:opacity-100"
      >
        <X className="size-4" />
      </button>
      {!isNew && (
        <button
          {...attributes}
          {...listeners}
          className="absolute right-2 top-12 z-10 cursor-grab rounded-full bg-black/50 p-2 text-white opacity-0 transition-opacity hover:bg-black group-hover:opacity-100"
        >
          <GripVertical className="size-4" />
        </button>
      )}
      <ImageWithFallback
        src={url}
        alt={`Image ${index + 1}`}
        width={400}
        height={400}
        className="size-full object-cover"
        unoptimized
      />
    </div>
  );
}

interface DraggableImagesProps {
  images: UnifiedImage[];
  onReorder: (images: UnifiedImage[]) => void;
  onDelete: (image: UnifiedImage, index: number) => void;
  isDeleting: boolean;
}

function DraggableImages({
  images,
  onReorder,
  onDelete,
  isDeleting,
}: DraggableImagesProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id.toString());
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = images.findIndex((img) => img.id === active.id);
      const newIndex = images.findIndex((img) => img.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newImages = arrayMove(images, oldIndex, newIndex);
        onReorder(newImages);
      }
    }

    setActiveId(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={images.map((img) => img.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((image, index) => (
            <SortableImage
              key={image.id}
              id={image.id}
              url={image.url}
              index={index}
              onDelete={() => onDelete(image, index)}
              isDeleting={isDeleting}
              isNew={image.isNew}
            />
          ))}
        </div>
      </SortableContext>
      <DragOverlay>
        {activeId && (
          <div className="aspect-square w-full overflow-hidden rounded-lg border bg-gray-50">
            <ImageWithFallback
              src={images.find((img) => img.id === activeId)?.url ?? ""}
              alt="Dragging"
              width={400}
              height={400}
              className="size-full object-cover opacity-50"
              unoptimized
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}

const ImagesUploader = () => {
  const router = useRouter();
  const [context, setContext] = useContext(Context);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [unifiedImages, setUnifiedImages] = useState<UnifiedImage[]>([]);
  const urlsToCleanup = useRef<string[]>([]);

  const dropZoneConfig = {
    accept: {
      "image/*": [".jpg", ".jpeg", ".png", ".gif"],
    },
    maxSize: 1024 * 1024 * 5,
    multiple: true,
    maxFiles: 10,
  };

  // Cleanup effect for component unmount
  useEffect(() => {
    return () => {
      urlsToCleanup.current.forEach(url => URL.revokeObjectURL(url));
      urlsToCleanup.current = [];
    };
  }, []);

  // Effect for handling image state
  useEffect(() => {
    setIsLoading(true);
    try {
      const existingImages: UnifiedImage[] = (
        context.existingMainImages ?? []
      ).map((img) => ({
        id: img.id.toString(),
        url: img.url,
        isNew: false,
        originalId: img.id,
      }));

      const newImages: UnifiedImage[] = (context.productMainImages ?? []).map(
        (file, index) => {
          const url = URL.createObjectURL(file);
          urlsToCleanup.current.push(url);
          return {
            id: `new-${index}`,
            url,
            isNew: true,
            file,
          };
        }
      );

      setUnifiedImages([...existingImages, ...newImages]);
    } catch (error) {
      console.error("Error loading images:", error);
      toast.error("이미지 로딩에 실패했습니다");
    } finally {
      setIsLoading(false);
    }
  }, [context.existingMainImages, context.productMainImages, router]);

  const handleSaveNewImages = async () => {
    if (!context.id || !context.productMainImages?.length) return;

    try {
      setIsSaving(true);
      const result = await uploadProductImages({
        productId: context.id,
        type: "main",
        images: context.productMainImages,
      });

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      // Create temporary URLs and store them for cleanup
      const tempUrls = context.productMainImages.map(file => URL.createObjectURL(file));
      urlsToCleanup.current.push(...tempUrls);

      // Update the context with the new images
      setContext((prev) => {
        const lastExistingId = prev.existingMainImages?.length 
          ? Math.max(...prev.existingMainImages.map(img => img.id))
          : 0;

        return {
          ...prev,
          productMainImages: [], // Clear the new images
          existingMainImages: [
            ...(prev.existingMainImages ?? []),
            ...tempUrls.map((url, index) => ({
              id: lastExistingId + index + 1,
              url,
            })),
          ],
        };
      });

      toast.success("이미지가 저장되었습니다");
      router.refresh();
    } catch (error) {
      console.error("Failed to save images:", error);
      toast.error("이미지 저장에 실패했습니다");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (image: UnifiedImage, index: number) => {
    if (image.isNew) {
      setContext((prev) => ({
        ...prev,
        productMainImages:
          prev.productMainImages?.filter(
            (_, i) => i !== parseInt(image.id.split("-")[1])
          ) ?? [],
      }));
      return;
    }

    if (isDeleting) return;

    const confirmed = confirm(
      "이미지를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
    );
    if (!confirmed) return;

    try {
      setIsDeleting(true);
      const result = await deleteProductImage({
        id: image.originalId!,
        type: "main",
        productId: context.id,
      });

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      setContext((prev) => ({
        ...prev,
        existingMainImages:
          prev.existingMainImages?.filter((_, i) => i !== index) ?? [],
      }));
      toast.success(result.message);
    } catch (error) {
      console.error("Image deletion failed:", error);
      toast.error("이미지 삭제 중 오류가 발생했습니다");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReorder = async (newImages: UnifiedImage[]) => {
    // Separate new and existing images while maintaining their new order
    const reorderedFiles: File[] = [];
    const reorderedExisting: { id: number; url: string }[] = [];

    newImages.forEach((image) => {
      if (image.isNew && image.file) {
        reorderedFiles.push(image.file);
      } else if (!image.isNew && image.originalId) {
        reorderedExisting.push({
          id: image.originalId,
          url: image.url,
        });
      }
    });

    // Update context with reordered images
    setContext((prev) => ({
      ...prev,
      productMainImages: reorderedFiles,
      existingMainImages: reorderedExisting,
    }));

    // Only update server for existing images
    if (reorderedExisting.length > 0) {
      try {
        const result = await reorderProductImages({
          type: "main",
          productId: context.id,
          imageIds: reorderedExisting.map((img) => img.id),
        });

        if (!result.success) {
          setContext((prev) => ({
            ...prev,
            existingMainImages: context.existingMainImages,
          }));
          toast.error(result.message);
        }
      } catch (error) {
        console.error("Image reordering failed:", error);
        setContext((prev) => ({
          ...prev,
          existingMainImages: context.existingMainImages,
        }));
        toast.error("이미지 순서 변경에 실패했습니다");
      }
    }
  };

  return (
    <div className="space-y-4">
      <FileUploader
        value={context.productMainImages}
        onValueChange={(value) =>
          setContext((prev) => ({
            ...prev,
            productMainImages: value ?? [],
          }))
        }
        dropzoneOptions={dropZoneConfig}
        className="relative rounded-lg border-2 border-black bg-background p-2"
      >
        <FileInput className="outline-dashed outline-1 outline-white">
          <div className="flex w-full flex-col items-center justify-center py-4">
            <FileSvgDraw />
          </div>
        </FileInput>
      </FileUploader>

      {isLoading ? (
        <div className="flex h-48 items-center justify-center rounded-lg border-2 border-dashed border-gray-300">
          <div className="flex items-center gap-2">
            <Loader2 className="size-4 animate-spin" />
            <p className="text-gray-500">이미지를 불러오는 중...</p>
          </div>
        </div>
      ) : unifiedImages.length > 0 ? (
        <DraggableImages
          images={unifiedImages}
          onReorder={handleReorder}
          onDelete={handleDelete}
          isDeleting={isDeleting}
        />
      ) : (
        <div className="flex h-48 items-center justify-center rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-500">업로드된 이미지가 없습니다</p>
        </div>
      )}

      {context.productMainImages && context.productMainImages.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={handleSaveNewImages}
            disabled={isSaving}
            className="flex items-center justify-center rounded-lg bg-black px-4 py-2 text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                저장 중...
              </>
            ) : (
              "저장"
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default ImagesUploader;
