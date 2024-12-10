"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import {
  createPost,
  deletePostThumbnail,
  updatePost,
  uploadPostImages,
} from "@/actions/admin";
import { Editor } from "@/app/components/editor";
import { FileUploader, FileInput } from "@/components/extension/file-uploader";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  title: z.string().min(1, "제목을 입력해주세요"),
  content: z.string().min(1, "내용을 입력해주세요"),
  thumbnailId: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface PostFormProps {
  onSuccess?: () => void;
  initialData?: {
    id: number;
    title: string;
    content: string;
    thumbnail: Array<{
      id: number;
      url: string;
    }>;
  };
}

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
      <Image
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
        <span className="font-semibold">드래그 드랍 또는 클릭</span>
        &nbsp;으로 파일 업로드
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        SVG, PNG, JPG 또는 GIF
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

export default function PostForm({ onSuccess, initialData }: PostFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState<File[] | null>(null);
  const [existingImages, setExistingImages] = useState<
    Array<{ id: number; url: string }>
  >(initialData?.thumbnail || []);
  const [isDeleting, setIsDeleting] = useState(false);

  const dropzoneConfig = {
    accept: {
      "image/*": [".jpg", ".jpeg", ".png", ".gif"],
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

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || "",
      content: initialData?.content || "",
      thumbnailId: initialData?.thumbnail?.map((t) => t.url).join(",") || "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      setIsLoading(true);

      // Upload thumbnails if exists
      if (files && files.length > 0) {
        const uploadResult = await uploadPostImages(files);
        if (!uploadResult.success) {
          throw new Error(uploadResult.message || "Failed to upload images");
        }
        values.thumbnailId = uploadResult.data
          ?.map((result) => result.filename)
          .join(",");
      }

      const result = initialData
        ? await updatePost(initialData.id, values)
        : await createPost(values);

      if (!result.success) {
        throw new Error(result.message || "Something went wrong");
      }

      toast.success(result.message);
      router.refresh();
      if (onSuccess) {
        onSuccess();
      }
      router.push(`/admin/manage-view/`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteImage = async (imageToDelete: {
    id: number;
    url: string;
  }) => {
    if (isDeleting || !initialData?.id) return;

    const confirmed = confirm(
      "이미지를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
    );
    if (!confirmed) return;

    try {
      setIsDeleting(true);
      const result = await deletePostThumbnail({
        id: imageToDelete.id,
        postId: initialData.id,
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
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRemoveFile = (index: number) => {
    if (!files) return;
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles.length ? newFiles : null);
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
                <Input placeholder="제목을 입력하세요" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="thumbnailId"
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

                  <div className="grid auto-rows-fr grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    {/* Existing Images */}
                    {existingImages?.map((image, index) => (
                      <ImageItem
                        key={image.id}
                        url={image.url}
                        index={index}
                        onDelete={() => handleDeleteImage(image)}
                        isDeleting={isDeleting}
                        isNew={false}
                      />
                    ))}

                    {/* New Images */}
                    {files?.map((file, index) => {
                      const url = URL.createObjectURL(file);
                      return (
                        <ImageItem
                          key={url}
                          url={url}
                          index={(existingImages?.length || 0) + index}
                          onDelete={() => handleRemoveFile(index)}
                          isDeleting={false}
                          isNew={true}
                        />
                      );
                    })}
                  </div>
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
                <Editor value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={onSuccess}
            disabled={isLoading}
          >
            취소
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "저장 중..." : "저장"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
