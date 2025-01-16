"use client";

import { SubCategory } from "@prisma/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThumbnailUploader } from "./ThumbnailUploader";

const schema = z
  .object({
    name: z.string().min(1, "하위 카테고리 이름을 입력해주세요"),
    thumbnail: z
      .instanceof(File, { message: "썸네일 이미지를 선택해주세요" })
      .optional(),
  })
  .strict();

interface SubCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { name: string; thumbnail?: File | null }) => Promise<void>;
  subCategory?: SubCategory & {
    categoryThumbnail: { url: string }[];
  };
  title: string;
}

export function SubCategoryDialog({
  open,
  onOpenChange,
  onSubmit,
  subCategory,
  title,
}: SubCategoryDialogProps) {
  const [name, setName] = useState("");
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open && subCategory) {
      setName(subCategory.name);
      setThumbnailPreview(subCategory.categoryThumbnail[0]?.url || "");
    } else {
      setName("");
      setThumbnail(null);
      setThumbnailPreview("");
    }
  }, [open, subCategory]);

  useEffect(() => {
    if (thumbnail) {
      const url = URL.createObjectURL(thumbnail);
      setThumbnailPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [thumbnail]);

  const handleThumbnailChange = (file: File | null) => {
    setThumbnail(file);
    if (!file) {
      setThumbnailPreview("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await schema.safeParseAsync({ name, thumbnail });
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }

    // If editing and no new thumbnail is selected, but there's an existing preview
    if (subCategory && !thumbnail && !thumbnailPreview) {
      toast.error("썸네일 이미지를 선택해주세요");
      return;
    }

    // If creating and no thumbnail is selected
    if (!subCategory && !thumbnail) {
      toast.error("썸네일 이미지를 선택해주세요");
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({ name, thumbnail });
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "하위 카테고리 저장에 실패했습니다"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">하위 카테고리 이름</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="하위 카테고리 이름을 입력해주세요"
              />
            </div>

            <div className="space-y-2">
              <Label>썸네일</Label>
              <div className="relative">
                <ThumbnailUploader
                  value={thumbnailPreview}
                  onChange={handleThumbnailChange}
                  className="w-full"
                  isExisting={
                    !!subCategory?.categoryThumbnail[0]?.url && !thumbnail
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              취소
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "저장 중..." : "저장"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
