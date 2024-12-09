"use client";

import { Category, CategoryThumbnail, SubCategory } from "@prisma/client";
import { ChevronDown, Edit, ImageIcon, Plus, Trash } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface CategoryWithRelations extends Category {
  subCategory: (SubCategory & {
    categoryThumbnail: CategoryThumbnail[];
  })[];
  categoryThumbnail: CategoryThumbnail[];
}

interface CategoryListProps {
  categories: CategoryWithRelations[];
  onAddCategory: () => void;
  onEditCategory: (category: Category) => void;
  onDeleteCategory: (categoryId: number) => void;
  onAddSubCategory: (categoryId: number) => void;
  onEditSubCategory: (subCategory: SubCategory) => void;
  onDeleteSubCategory: (subCategoryId: number) => void;
}

export function CategoryList({
  categories,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  onAddSubCategory,
  onEditSubCategory,
  onDeleteSubCategory,
}: CategoryListProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">카테고리 목록</h2>
        <Button onClick={onAddCategory} size="sm">
          <Plus className="mr-2 size-4" />
          카테고리 추가
        </Button>
      </div>

      <div className="space-y-2">
        {categories.map((category) => (
          <Card key={category.id} className="overflow-hidden">
            <Collapsible>
              <CardHeader className="border-b p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <CollapsibleTrigger className="flex items-center gap-3 hover:opacity-70">
                      <ChevronDown className="size-4 transition-transform" />
                      {category.categoryThumbnail[0] && (
                        <img
                          src={category.categoryThumbnail[0].url}
                          alt={category.name}
                          className="size-6 rounded-sm object-fill"
                        />
                      )}
                      {!category.categoryThumbnail[0] && (
                        <div className="grid size-6 place-items-center rounded-sm border bg-muted">
                          <ImageIcon className="size-4 text-muted-foreground" />
                        </div>
                      )}
                      <CardTitle className="text-base">{category.name}</CardTitle>
                    </CollapsibleTrigger>
                    <CardDescription className="flex items-center gap-2">
                      <span>({category.subCategory.length})</span>
                    </CardDescription>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditCategory(category)}
                    >
                      <Edit className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteCategory(category.id)}
                    >
                      <Trash className="size-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CollapsibleContent>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-muted-foreground">
                      하위 카테고리
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onAddSubCategory(category.id)}
                    >
                      <Plus className="mr-2 size-4" />
                      하위 카테고리 추가
                    </Button>
                  </div>

                  <div className="mt-4 space-y-2">
                    {category.subCategory.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        하위 카테고리가 없습니다
                      </p>
                    ) : (
                      category.subCategory.map((sub) => (
                        <div
                          key={sub.id}
                          className="flex items-center justify-between rounded-lg border bg-muted/40 p-3"
                        >
                          <div className="flex items-center gap-3">
                            {sub.categoryThumbnail[0] && (
                              <img
                                src={sub.categoryThumbnail[0].url}
                                alt={sub.name}
                                className="size-6 rounded-sm object-fill"
                              />
                            )}
                            {!sub.categoryThumbnail[0] && (
                              <div className="grid size-6 place-items-center rounded-sm border bg-muted">
                                <ImageIcon className="size-4 text-muted-foreground" />
                              </div>
                            )}
                            <span className="text-sm font-medium">{sub.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onEditSubCategory(sub)}
                            >
                              <Edit className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDeleteSubCategory(sub.id)}
                            >
                              <Trash className="size-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        ))}

        {categories.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              등록된 카테고리가 없습니다
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 