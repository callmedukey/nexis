"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerTitle,
} from "@/components/ui/drawer";
import { ROUTES } from "@/constants/general";

interface CategoryThumbnail {
  id: number;
  url: string;
  filename: string;
  filetype: string;
  categoryId: number | null;
  subCategoryId: number | null;
}

interface Category {
  id: number;
  name: string;
  categoryId?: number;
  categoryThumbnail: CategoryThumbnail[];
  subCategory?: Category[];
}

interface CategoryDrawerProps {
  category: Category;
  children: React.ReactNode;
}

export function CategoryDrawer({ category, children }: CategoryDrawerProps) {
  const [open, setOpen] = useState(false);
  const hasSubCategories =
    category.subCategory && category.subCategory.length > 0;

  if (!hasSubCategories) {
    return (
      <Link href={`${ROUTES.PRODUCTS}?category=${category.id}`}>
        {children}
      </Link>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <button className="w-fit text-left">{children}</button>
      </DrawerTrigger>
      <DrawerContent className="rounded-t-3xl">
        <DrawerTitle className="sr-only">
          {category.name} 카테고리 선택
        </DrawerTitle>
        <div className="mx-auto w-full max-w-3xl p-6">
          <div className="space-y-6">
            <h4 className="text-xl font-medium">{category.name}</h4>

            <Link
              href={`${ROUTES.PRODUCTS}?category=${category.id}`}
              onClick={() => setOpen(false)}
              className="block w-full rounded-lg border-2 border-primary bg-background px-4 py-3 text-left text-lg font-medium text-primary transition-colors hover:bg-primary/10"
            >
              전체보기
            </Link>

            <div className="grid gap-3">
              {category.subCategory?.map((subCategory) => (
                <Link
                  key={subCategory.id}
                  href={`${ROUTES.PRODUCTS}?category=${category.id}&subcategory=${subCategory.id}`}
                  onClick={() => setOpen(false)}
                  className="group flex items-center overflow-hidden rounded-lg bg-card hover:bg-accent"
                >
                  {subCategory.categoryThumbnail?.[0] && (
                    <div className="relative size-16 shrink-0 overflow-hidden">
                      <Image
                        src={subCategory.categoryThumbnail[0].url}
                        alt={subCategory.name}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="px-4">
                    <h5 className="font-medium text-card-foreground">
                      {subCategory.name}
                    </h5>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
