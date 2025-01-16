"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import {
  createEvent,
  deleteEventThumbnail,
  updateEvent,
  uploadEventImages,
} from "@/actions/admin";
import { Editor } from "@/components/editor";
import { FileInput, FileUploader } from "@/components/extension/file-uploader";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Events, EventsThumbnail } from "@prisma/client";

const formSchema = z.object({
  title: z.string().min(1, "제목을 입력해주세요"),
  content: z.string().optional(),
  thumbnail: z.any().optional(),
  active: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

interface EventFormProps {
  initialData?: Events & {
    thumbnail: EventsThumbnail[];
  };
  onSuccess?: () => void;
}

function FileSvgDraw() {
  return (
    <>
      <svg
        className="mb-3 size-8 text-gray-500 dark:text-gray-400"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 20 16"
      >
        <path
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
        />
      </svg>
      <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
        <span className="font-semibold">드래그 드 또는 클릭</span>
        &nbsp;으로 파일 업로드
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        JPG, PNG, WebP (최대 5MB)
      </p>
    </>
  );
}

function FileInputWrapper() {
  return (
    <FileInput className="outline-dashed outline-1 outline-white">
      <div className="flex w-full flex-col items-center justify-center py-4">
        <FileSvgDraw />
      </div>
    </FileInput>
  );
}

interface ImageItemProps {
  url: string;
  onDelete: () => void;
  isNew?: boolean;
  index?: number;
}

function ImageItem({ url, onDelete, isNew, index }: ImageItemProps) {
  const imageUrl = url
    ? isNew
      ? url
      : url.startsWith("/")
      ? url
      : `/${url}`
    : "";

  if (!url) return null;

  return (
    <div className="group relative aspect-square w-full overflow-hidden rounded-lg border bg-gray-50">
      {typeof index === "number" && (
        <div className="absolute left-2 top-2 z-10 flex size-6 items-center justify-center rounded-full bg-black/50 text-sm font-medium text-white">
          {index + 1}
        </div>
      )}
      <button
        onClick={onDelete}
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
      {isNew && (
        <div className="absolute right-2 top-12 z-10 rounded-full bg-black/50 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
          저장 전
        </div>
      )}
      <Image
        src={imageUrl}
        alt={`이미지 ${index ? index + 1 : ""}`}
        width={400}
        height={400}
        className="size-full object-cover"
        priority={index !== undefined && index < 4}
        loading={index !== undefined && index < 4 ? "eager" : "lazy"}
        unoptimized={isNew}
      />
    </div>
  );
}

export function EventForm({ initialData, onSuccess }: EventFormProps) {
  const router = useRouter();
  const [files, setFiles] = useState<File[] | null>(null);
  const [existingImages, setExistingImages] = useState<
    Array<{ id: number; url: string }>
  >(initialData?.thumbnail || []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title ?? "",
      content: initialData?.content ?? "",
      active: initialData?.active ?? true,
    },
  });

  const dropzoneConfig = {
    accept: {
      "image/*": [".jpg", ".jpeg", ".png", ".webp"],
    },
    maxSize: 1024 * 1024 * 5,
    multiple: true,
    maxFiles: 10,
  };

  // Create stable object URLs that persist across renders
  const imageUrls = useMemo(() => {
    if (!files) return [];
    return files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
  }, [files]);

  // Cleanup object URLs when component unmounts or images change
  useEffect(() => {
    return () => {
      imageUrls.forEach(({ url }) => URL.revokeObjectURL(url));
    };
  }, [imageUrls]);

  const handleDeleteImage = async (imageToDelete: {
    id: number;
    url: string;
  }) => {
    if (!initialData?.id) return;

    const confirmed = confirm("이미지를 삭제하시겠습니까?");
    if (!confirmed) return;

    try {
      const result = await deleteEventThumbnail({
        id: imageToDelete.id,
        eventsId: initialData.id,
      });

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      setExistingImages((prev) =>
        prev.filter((img) => img.id !== imageToDelete.id)
      );
      toast.success(result.message);
    } catch {
      toast.error("이미지 삭제에 실패했습니다");
    }
  };

  const handleRemoveFile = (index: number) => {
    const confirmed = confirm("이미지를 삭제하시겠습니까?");
    if (!confirmed) return;

    if (!files) return;
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles.length ? newFiles : null);
  };

  const onSubmit = async (data: FormValues) => {
    try {
      let thumbnailId;
      if (files?.length) {
        const uploadResult = await uploadEventImages(files);
        if (!uploadResult.success) {
          throw new Error(uploadResult.message || "Failed to upload images");
        }
        thumbnailId = uploadResult.data
          ?.map((result) => result.filename)
          .join(",");
      }

      // If we have existing images, add their filenames to thumbnailId
      if (existingImages.length > 0) {
        const existingFilenames = existingImages
          .map((img) => img.url.split("/").pop())
          .filter(Boolean)
          .join(",");
        thumbnailId = thumbnailId
          ? `${existingFilenames},${thumbnailId}`
          : existingFilenames;
      }

      const result = initialData
        ? await updateEvent(initialData.id, {
            title: data.title,
            content: data.content || "",
            thumbnailId,
            active: data.active,
          })
        : await createEvent({
            title: data.title,
            content: data.content || "",
            thumbnailId,
            active: data.active,
          });

      if (!result.success) {
        throw new Error(result.message || "Something went wrong");
      }

      toast.success(result.message);
      router.push("/admin/manage-events");
      router.refresh();
      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Something went wrong"
      );
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>제목</FormLabel>
              <FormControl>
                <Input placeholder="이벤트 제목" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="thumbnail"
          render={() => (
            <FormItem>
              <FormLabel>썸네일</FormLabel>
              <FormControl>
                <div className="space-y-4">
                  <FileUploader
                    value={files}
                    onValueChange={setFiles}
                    dropzoneOptions={dropzoneConfig}
                    className="relative rounded-lg border-2 border-black bg-background p-2"
                  >
                    <FileInputWrapper />
                  </FileUploader>

                  {existingImages.length > 0 || imageUrls.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                      {existingImages.map((image) => (
                        <ImageItem
                          key={image.id}
                          url={image.url}
                          onDelete={() => handleDeleteImage(image)}
                        />
                      ))}

                      {imageUrls.map(({ url }, index) => (
                        <ImageItem
                          key={index}
                          url={url}
                          onDelete={() => handleRemoveFile(index)}
                          isNew
                          index={index}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="flex h-48 items-center justify-center rounded-lg border-2 border-dashed border-gray-300">
                      <p className="text-muted-foreground">
                        업로드된 이미지가 없습니다
                      </p>
                    </div>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>내용</FormLabel>
              <FormControl>
                <Editor value={field.value || ""} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">활성화 상태</FormLabel>
                <FormDescription>
                  이벤트를 활성화하거나 비활성화합니다
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/manage-events")}
          >
            취소
          </Button>
          <Button type="submit">저장</Button>
        </div>
      </form>
    </Form>
  );
}
