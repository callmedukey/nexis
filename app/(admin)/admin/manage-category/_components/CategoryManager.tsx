"use client";

import { Category, SubCategory } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  createCategory,
  createSubCategory,
  deleteCategory,
  deleteSubCategory,
  updateCategory,
  updateSubCategory,
} from "@/actions/admin";
import { CategoryDialog } from "./CategoryDialog";
import { CategoryList } from "./CategoryList";
import { SubCategoryDialog } from "./SubCategoryDialog";

interface CategoryWithSubCategories extends Category {
  subCategory: SubCategory[];
}

interface CategoryManagerProps {
  initialCategories: CategoryWithSubCategories[];
}

export function CategoryManager({ initialCategories }: CategoryManagerProps) {
  const router = useRouter();

  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isSubCategoryDialogOpen, setIsSubCategoryDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>();
  const [selectedSubCategory, setSelectedSubCategory] = useState<
    SubCategory | undefined
  >();
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteSubConfirmOpen, setDeleteSubConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number>();

  const handleAddCategory = () => {
    setSelectedCategory(undefined);
    setIsCategoryDialogOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setIsCategoryDialogOpen(true);
  };

  const handleAddSubCategory = (categoryId: number) => {
    setSelectedCategoryId(categoryId);
    setSelectedSubCategory(undefined);
    setIsSubCategoryDialogOpen(true);
  };

  const handleEditSubCategory = (subCategory: SubCategory) => {
    setSelectedCategoryId(subCategory.categoryId);
    setSelectedSubCategory(subCategory);
    setIsSubCategoryDialogOpen(true);
  };

  const handleCategorySubmit = async (data: { name: string; thumbnail?: File | null }) => {
    try {
      if (selectedCategory) {
        // Edit category
        const result = await updateCategory(selectedCategory.id, data);
        if (!result.success) {
          throw new Error(result.message || "카테고리 수정에 실패했습니다");
        }
        toast.success("카테고리가 수정되었습니다");
      } else {
        // Add category
        const result = await createCategory(data);
        if (!result.success) {
          throw new Error(result.message || "카테고리 추가에 실패했습니다");
        }
        toast.success("카테고리가 추가되었습니다");
      }
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "오류가 발생했습니다");
    }
  };

  const handleSubCategorySubmit = async (data: { name: string; thumbnail?: File | null }) => {
    if (!selectedCategoryId) return;

    try {
      if (selectedSubCategory) {
        // Edit subcategory
        const result = await updateSubCategory(selectedSubCategory.id, data);
        if (!result.success) {
          throw new Error(result.message || "하위 카테고리 수정에 실패했습니다");
        }
        toast.success("하위 카테고리가 수정되었습니다");
      } else {
        // Add subcategory
        const result = await createSubCategory({
          ...data,
          categoryId: selectedCategoryId,
        });
        if (!result.success) {
          throw new Error(result.message || "하위 카테고리 추가에 실패했습니다");
        }
        toast.success("하위 카테고리가 추가되었습니다");
      }
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "오류가 발생했습니다");
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    setItemToDelete(categoryId);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDeleteCategory = async () => {
    if (!itemToDelete) return;

    try {
      const result = await deleteCategory(itemToDelete);
      if (!result.success) {
        throw new Error(result.message || "카테고리 삭제에 실패했습니다");
      }
      toast.success("카테고리가 삭제되었습니다");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "오류가 발생했습니다");
    } finally {
      setDeleteConfirmOpen(false);
      setItemToDelete(undefined);
    }
  };

  const handleDeleteSubCategory = async (subCategoryId: number) => {
    setItemToDelete(subCategoryId);
    setDeleteSubConfirmOpen(true);
  };

  const handleConfirmDeleteSubCategory = async () => {
    if (!itemToDelete) return;

    try {
      const result = await deleteSubCategory(itemToDelete);
      if (!result.success) {
        throw new Error(result.message || "하위 카테고리 삭제에 실패했습니다");
      }
      toast.success("하위 카테고리가 삭제되었습니다");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "오류가 발생했습니다");
    } finally {
      setDeleteSubConfirmOpen(false);
      setItemToDelete(undefined);
    }
  };

  return (
    <>
      <CategoryList
        categories={initialCategories}
        onAddCategory={handleAddCategory}
        onEditCategory={handleEditCategory}
        onDeleteCategory={handleDeleteCategory}
        onAddSubCategory={handleAddSubCategory}
        onEditSubCategory={handleEditSubCategory}
        onDeleteSubCategory={handleDeleteSubCategory}
      />

      <CategoryDialog
        open={isCategoryDialogOpen}
        onOpenChange={setIsCategoryDialogOpen}
        onSubmit={handleCategorySubmit}
        category={selectedCategory}
        title={
          selectedCategory ? "카테고리 수정" : "카테고리 추가"
        }
      />

      <SubCategoryDialog
        open={isSubCategoryDialogOpen}
        onOpenChange={setIsSubCategoryDialogOpen}
        onSubmit={handleSubCategorySubmit}
        subCategory={selectedSubCategory}
        title={
          selectedSubCategory ? "하위 카테고리 수정" : "하위 카테고리 추가"
        }
      />

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>카테고리 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              정말로 이 카테고리를 삭제하시겠습니까?
              <br />
              모든 하위 카테고리도 함께 삭제됩니다.
              <br />
              이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDeleteCategory}>
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteSubConfirmOpen} onOpenChange={setDeleteSubConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>하위 카테고리 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              정말로 이 하위 카테고리를 ���제하시겠습니까?
              <br />
              이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDeleteSubCategory}>
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 