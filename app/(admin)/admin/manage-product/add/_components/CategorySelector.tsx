"use client";

import { Category, SubCategory } from "@prisma/client";
import { Check, ChevronRight, X } from "lucide-react";
import { useContext } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import { Context, ProductFormState } from "../_providers/ContextProvider";

interface CategoryWithSub extends Category {
  subCategory: SubCategory[];
}

interface CategorySelectorProps {
  categories: CategoryWithSub[];
}

const CategorySelector = ({ categories }: CategorySelectorProps) => {
  const [context, setContext] = useContext(Context);

  const handleCategorySelect = (categoryId: number) => {
    setContext((prev) => {
      const newCategories = [...prev.categories];
      const categoryIndex = newCategories.findIndex(
        (c) => c.categoryId === categoryId
      );

      if (categoryIndex === -1) {
        // Add new category (with or without subcategories)
        newCategories.push({
          categoryId,
          subCategoryIds: [],
        });
      } else {
        // Remove category and all its subcategories
        newCategories.splice(categoryIndex, 1);
      }

      return {
        ...prev,
        categories: newCategories,
      };
    });
  };

  const handleSubCategorySelect = (
    categoryId: number,
    subCategoryId: number
  ) => {
    setContext((prev) => {
      // Create a deep copy of the categories array
      const newCategories = prev.categories.map((cat) => ({
        ...cat,
        subCategoryIds: [...cat.subCategoryIds],
      }));

      const existingCategory = newCategories.find(
        (c) => c.categoryId === categoryId
      );

      if (existingCategory) {
        // If category exists but has no subcategories selected yet
        if (existingCategory.subCategoryIds.length === 0) {
          existingCategory.subCategoryIds = [subCategoryId];
        } else {
          // Category exists and already has subcategories
          const hasSubCategory =
            existingCategory.subCategoryIds.includes(subCategoryId);

          if (!hasSubCategory) {
            // Add new subcategory
            existingCategory.subCategoryIds = [
              ...existingCategory.subCategoryIds,
              subCategoryId,
            ];
          } else {
            // Remove subcategory
            existingCategory.subCategoryIds =
              existingCategory.subCategoryIds.filter(
                (id) => id !== subCategoryId
              );
          }

          // If no subcategories left, keep the parent category selected
          if (existingCategory.subCategoryIds.length === 0) {
            existingCategory.subCategoryIds = [];
          }
        }
      } else {
        // Category doesn't exist, create new with the subcategory
        newCategories.push({
          categoryId,
          subCategoryIds: [subCategoryId],
        });
      }

      return {
        ...prev,
        categories: newCategories,
      };
    });
  };

  const handleRemoveCategory = (categoryId: number) => {
    setContext((prev) => ({
      ...prev,
      categories: prev.categories.filter((c) => c.categoryId !== categoryId),
    }));
  };

  const isCategoryInContext = (categoryId: number): boolean => {
    return context.categories.some((c) => c.categoryId === categoryId);
  };

  const isSubCategorySelected = (
    categoryId: number,
    subCategoryId: number
  ): boolean => {
    const category = context.categories.find(
      (c) => c.categoryId === categoryId
    );
    return category?.subCategoryIds.includes(subCategoryId) ?? false;
  };

  const getSelectedSubCategories = (categoryId: number): number[] => {
    const category = context.categories.find(
      (c) => c.categoryId === categoryId
    );
    return category?.subCategoryIds ?? [];
  };

  const getSelectedCategories = () => {
    if (!categories) return [];

    return context.categories
      .map((selected) => {
        const category = categories.find(
          (c) => c.id === selected.categoryId
        );
        if (!category) return null;

        const selectedSubs = category.subCategory
          .filter((sub) => selected.subCategoryIds.includes(sub.id))
          .map((sub) => ({ id: sub.id, name: sub.name }));

        return {
          id: category.id,
          category: category.name,
          subcategories: selectedSubs,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {getSelectedCategories().map((item) => (
          <Badge
            key={item.id}
            variant="secondary"
            className="flex items-center gap-2 px-3 py-1.5 text-base"
          >
            <span className="font-medium">{item.category}</span>
            {item.subcategories.length > 0 && (
              <>
                <ChevronRight className="size-4" />
                <span className="text-muted-foreground">
                  {item.subcategories.map((sub) => sub.name).join(", ")}
                </span>
              </>
            )}
            <button
              onClick={() => handleRemoveCategory(item.id)}
              className="ml-1 rounded-full p-0.5 hover:bg-accent"
              type="button"
              aria-label={`${item.category} 카테고리 삭제`}
            >
              <X className="size-4" />
            </button>
          </Badge>
        ))}
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start text-base font-normal"
          >
            카테고리 선택
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0 max-h-[85vh] overflow-hidden" align="start">
          <Command shouldFilter={false} className="max-h-full">
            <CommandInput
              placeholder="카테고리 검색..."
              className="h-12 text-base"
            />
            <CommandList className="max-h-[calc(85vh-4rem)] overflow-y-auto">
              <CommandEmpty>검색 결과가 없습니다</CommandEmpty>
              {categories?.map((category) => {
                const isInContext = isCategoryInContext(category.id);
                const selectedSubCategories = getSelectedSubCategories(
                  category.id
                );
                const hasSelectedSubs = selectedSubCategories.length > 0;
                const hasSubCategories = category.subCategory.length > 0;

                return (
                  <div key={category.id} className="px-2 py-1">
                    <CommandItem
                      onSelect={() => handleCategorySelect(category.id)}
                      className={cn(
                        "rounded-md px-3 py-3 text-base font-medium hover:bg-accent",
                        (isInContext || hasSelectedSubs) && "bg-accent/40"
                      )}
                    >
                      <div className="flex w-full items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span>{category.name}</span>
                          {isInContext &&
                            !hasSelectedSubs &&
                            !hasSubCategories && (
                              <Badge
                                variant="secondary"
                                className="font-normal"
                              >
                                선택됨
                              </Badge>
                            )}
                          {hasSelectedSubs && (
                            <Badge variant="secondary" className="font-normal">
                              하위 카테고리 선택됨
                            </Badge>
                          )}
                        </div>
                        {(isInContext || hasSelectedSubs) && (
                          <Check className="size-4 shrink-0 text-primary" />
                        )}
                      </div>
                    </CommandItem>

                    {hasSubCategories && (
                      <div className="mt-1 space-y-1 pl-4">
                        {category.subCategory.map((sub) => (
                          <div
                            key={sub.id}
                            onClick={() =>
                              handleSubCategorySelect(category.id, sub.id)
                            }
                            className={cn(
                              "flex w-full cursor-pointer items-center justify-between gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent",
                              isSubCategorySelected(category.id, sub.id) &&
                                "bg-accent/40"
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className={cn(
                                  "text-muted-foreground",
                                  isSubCategorySelected(category.id, sub.id) &&
                                    "text-foreground"
                                )}
                              >
                                {sub.name}
                              </span>
                              {isSubCategorySelected(category.id, sub.id) && (
                                <Badge
                                  variant="secondary"
                                  className="text-xs font-normal"
                                >
                                  선택됨
                                </Badge>
                              )}
                            </div>
                            {isSubCategorySelected(category.id, sub.id) && (
                              <Check className="size-4 shrink-0 text-primary" />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default CategorySelector;
