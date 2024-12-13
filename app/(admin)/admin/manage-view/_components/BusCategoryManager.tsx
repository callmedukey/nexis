"use client";

import { BusCategory } from "@prisma/client";
import { PlusCircle, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import {
  createBusCategory,
  updateBusCategory,
  deleteBusCategory,
} from "@/actions/admin";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BusCategoryManagerProps {
  initialCategories: BusCategory[];
}

export function BusCategoryManager({
  initialCategories,
}: BusCategoryManagerProps) {
  const [categories, setCategories] =
    useState<BusCategory[]>(initialCategories);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<BusCategory | null>(
    null
  );
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      const result = selectedCategory
        ? await updateBusCategory({
            id: selectedCategory.id,
            name: newCategoryName,
          })
        : await createBusCategory({
            name: newCategoryName,
          });

      if (!result.success || !result.data) {
        throw new Error(result.message);
      }

      const newCategory = result.data as BusCategory;
      setCategories((prevCategories) => {
        if (selectedCategory) {
          return prevCategories.map((cat) =>
            cat.id === selectedCategory.id ? newCategory : cat
          );
        }
        return [...prevCategories, newCategory];
      });

      toast.success(result.message);
      setIsDialogOpen(false);
      setNewCategoryName("");
      setSelectedCategory(null);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "카테고리 저장에 실패했습니다"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setIsLoading(true);
      const result = await deleteBusCategory(id);

      if (!result.success) {
        throw new Error(result.message);
      }

      setCategories((prevCategories) =>
        prevCategories.filter((cat) => cat.id !== id)
      );

      toast.success(result.message);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "카테고리 삭제에 실패했습니다"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          onClick={() => {
            setSelectedCategory(null);
            setNewCategoryName("");
            setIsDialogOpen(true);
          }}
          className="flex items-center gap-2"
        >
          <PlusCircle className="size-4" />
          카테고리 추가
        </Button>
      </div>

      <div className="divide-y rounded-lg border">
        {categories.map((category) => (
          <div
            key={category.id}
            className="flex items-center justify-between p-4 hover:bg-muted/50"
          >
            <div className="flex items-center gap-4">
              <span>{category.name}</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setSelectedCategory(category);
                  setNewCategoryName(category.name);
                  setIsDialogOpen(true);
                }}
              >
                <Pencil className="size-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Trash2 className="size-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>카테고리 삭제</AlertDialogTitle>
                    <AlertDialogDescription>
                      정말로 이 카테고리를 삭제하시겠습니까?
                      <br />이 작업은 되돌릴 수 없습니다.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>취소</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDelete(category.id)}
                      disabled={isLoading}
                    >
                      삭제
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        ))}
        {categories.length === 0 && (
          <div className="p-4 text-center text-muted-foreground">
            등록된 카테고리가 없습니다
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedCategory ? "카테고리 수정" : "카테고리 추가"}
            </DialogTitle>
            <DialogDescription>카테고리 이름을 입력해주세요.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">카테고리 이름</Label>
              <Input
                id="name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="카테고리 이름을 입력해주세요"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              onClick={handleSubmit}
              disabled={isLoading || !newCategoryName.trim()}
            >
              {isLoading ? "저장 중..." : "저장"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
