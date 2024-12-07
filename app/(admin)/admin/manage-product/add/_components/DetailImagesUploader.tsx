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
import type { Active, Over } from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X } from "lucide-react";
import { useContext, useState, useMemo, useEffect } from "react";
import { toast } from "sonner";

import { deleteProductImage, reorderProductImages } from "@/actions/admin";
import { FileUploader, FileInput } from "@/components/extension/file-uploader";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { FileSvgDraw } from "./FileSvgDraw";
import { ImageWithFallback } from "./ImageWithFallback";
import { Context } from "../_providers/ContextProvider";

interface SortableImageProps {
  id: string;
  url: string;
  index: number;
  onDelete: () => void;
  isDeleting: boolean;
}

// Create a stable ID generator for accessibility
const getDescribedById = (prefix: string) => `DndDescribedBy-${prefix}`;

function SortableImage({
  id,
  url,
  index,
  onDelete,
  isDeleting,
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
    data: {
      describedById: getDescribedById("detail"),
    },
  });

  const style = transform
    ? {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 1 : 0,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative w-full overflow-hidden rounded-lg"
    >
      <div
        {...attributes}
        {...listeners}
        role="button"
        tabIndex={0}
        aria-describedby={getDescribedById("detail")}
        className="absolute right-2 top-2 z-10 cursor-grab rounded-full bg-black/50 p-1 text-white opacity-0 transition-opacity hover:bg-black group-hover:opacity-100"
      >
        <GripVertical className="size-4" />
      </div>
      <button
        onClick={onDelete}
        disabled={isDeleting}
        className="absolute bottom-2 right-2 z-10 rounded-full bg-black/50 p-2 text-white opacity-0 transition-opacity hover:bg-black disabled:cursor-not-allowed disabled:opacity-50 group-hover:opacity-100"
      >
        <X className="size-4" />
      </button>
      <div className="absolute bottom-2 left-2 z-10 flex size-6 items-center justify-center rounded-full bg-black/50 text-sm text-white">
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
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface DraggableImagesProps {
  images: Array<{ id: string; url: string; isNew?: boolean }>;
  onReorder: (
    newImages: Array<{ id: string; url: string; isNew?: boolean }>
  ) => void;
  onDelete: (
    image: { id: string; url: string; isNew?: boolean },
    index: number
  ) => Promise<void>;
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
      const oldIndex = images.findIndex(
        (img) => img.id === active.id.toString()
      );
      const newIndex = images.findIndex((img) => img.id === over.id.toString());

      if (oldIndex !== -1 && newIndex !== -1) {
        const newImages = arrayMove([...images], oldIndex, newIndex);
        onReorder(newImages);
      }
    }

    setActiveId(null);
  };

  // Create a stable context ID
  const contextId = useMemo(() => "detail-images-dnd", []);

  // Create accessibility config with proper DnD-kit types
  const accessibilityConfig = useMemo(
    () => ({
      announcements: {
        onDragStart({ active }: { active: Active }) {
          return `Picked up image ${active.id}`;
        },
        onDragOver({ active, over }: { active: Active; over: Over | null }) {
          if (!over) return undefined;
          return `Image ${active.id} was moved over position ${over.id}`;
        },
        onDragEnd({ active, over }: { active: Active; over: Over | null }) {
          if (!over) return `Image ${active.id} was dropped`;
          return `Image ${active.id} was dropped at position ${over.id}`;
        },
        onDragCancel({ active }: { active: Active }) {
          return `Dragging was cancelled. Image ${active.id} was returned to its starting position`;
        },
      },
      restoreFocus: true,
      screenReaderInstructions: {
        draggable:
          "Press space bar to start dragging the image. While dragging, use arrow keys to move the image up or down. Press space bar again to drop the image in its new position.",
      },
    }),
    []
  );

  return (
    <DndContext
      id={contextId}
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      accessibility={accessibilityConfig}
    >
      <SortableContext
        items={images.map((img) => img.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-4">
          {images.map((image, index) => (
            <SortableImage
              key={image.id}
              id={image.id}
              url={image.url}
              index={index}
              onDelete={() => onDelete(image, index)}
              isDeleting={isDeleting}
            />
          ))}
        </div>
      </SortableContext>
      <DragOverlay>
        {activeId && (
          <div className="w-full rounded-lg border-2 border-dashed border-gray-400 bg-gray-50">
            <ImageWithFallback
              src={images.find((img) => img.id === activeId)?.url ?? ""}
              alt="Dragging"
              width={768}
              height={0}
              className="h-auto w-full opacity-50"
              unoptimized
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}

const DetailImagesUploader = () => {
  const [context, setContext] = useContext(Context);
  const [isDeleting, setIsDeleting] = useState(false);

  const dropZoneConfig = {
    accept: {
      "image/*": [".jpg", ".jpeg", ".png", ".gif", ".svg"],
    },
    multiple: true,
    maxFiles: 10,
  };

  const handleDelete = async (
    image: { id: string; url: string; isNew?: boolean },
    index: number
  ) => {
    if (image.isNew) {
      const newIndex = parseInt(image.id.split("-")[1]);
      setContext((prev) => ({
        ...prev,
        productImages:
          prev.productImages?.filter((_, i) => i !== newIndex) ?? [],
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
        id: parseInt(image.id),
        type: "detail",
        productId: context.id,
      });

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      setContext((prev) => ({
        ...prev,
        existingDetailImages:
          prev.existingDetailImages?.filter((_, i) => i !== index) ?? [],
      }));
      toast.success(result.message);
    } catch (error) {
      console.error("Image deletion failed:", error);
      toast.error("이미지 삭제 중 오류가 발생했습니다");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReorder = async (
    newImages: Array<{ id: string; url: string; isNew?: boolean }>
  ) => {
    // Split images back into new and existing
    const existingImages = newImages
      .filter((img) => !img.isNew)
      .map(({ id, url }) => ({ id: parseInt(id), url }));
    const newImageIndices = newImages
      .filter((img) => img.isNew)
      .map((img) => parseInt(img.id.split("-")[1]));

    // Reorder new images based on their new positions
    const reorderedNewImages = newImageIndices.map(
      (index) => context.productImages![index]
    );

    // Update context with both sets of reordered images
    setContext((prev) => ({
      ...prev,
      existingDetailImages: existingImages,
      productImages: reorderedNewImages,
    }));

    // Only update server for existing images
    if (existingImages.length > 0) {
      try {
        const result = await reorderProductImages({
          type: "detail",
          productId: context.id,
          imageIds: existingImages.map((img) => img.id),
        });

        if (!result.success) {
          setContext((prev) => ({
            ...prev,
            existingDetailImages: context.existingDetailImages,
          }));
          toast.error(result.message);
        }
      } catch (error) {
        console.error("Image reordering failed:", error);
        setContext((prev) => ({
          ...prev,
          existingDetailImages: context.existingDetailImages,
        }));
        toast.error("이미지 순서 변경에 실패했습니다");
      }
    }
  };

  // Create stable object URLs for new images
  const newImageUrls = useMemo(() => {
    return (context.productImages ?? []).map((file, index) => ({
      url: URL.createObjectURL(file),
      id: `new-${index}`,
      isNew: true,
    }));
  }, [context.productImages]);

  useEffect(() => {
    return () => {
      newImageUrls.forEach(({ url }) => URL.revokeObjectURL(url));
    };
  }, [newImageUrls]);

  // Combine existing and new images with stable IDs
  const allImages = useMemo(
    () => [
      ...(context.existingDetailImages ?? []).map((img) => ({
        ...img,
        id: img.id.toString(),
      })),
      ...newImageUrls,
    ],
    [context.existingDetailImages, newImageUrls]
  );

  return (
    <div className="space-y-4">
      <FileUploader
        value={context.productImages}
        onValueChange={(value) =>
          setContext((prev) => ({
            ...prev,
            productImages: value ?? [],
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

      {allImages.length > 0 && (
        <DraggableImages
          images={allImages}
          onReorder={handleReorder}
          onDelete={handleDelete}
          isDeleting={isDeleting}
        />
      )}

      {allImages.length === 0 && (
        <div className="flex h-48 items-center justify-center rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-500">업로드된 이미지가 없습니다</p>
        </div>
      )}
    </div>
  );
};

export default DetailImagesUploader;
