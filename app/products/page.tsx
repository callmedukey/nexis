import { ProductStatus } from "@prisma/client";
import { Metadata } from "next";
import Link from "next/link";

import { CategoryDrawer } from "@/components/CategoryDrawer";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import prisma from "@/lib/prisma";
import { cn } from "@/lib/utils";

import { Pagination } from "./_components/Pagination";
import { ProductGrid } from "./_components/ProductGrid";

export const metadata: Metadata = {
  title: "제품 목록",
  description: "모든 제품을 확인해보세요",
};

interface SearchParams {
  category?: string;
  subcategory?: string;
  sort?: string;
  page?: string;
}

async function getCategories() {
  return prisma.category.findMany({
    include: {
      subCategory: {
        include: {
          categoryThumbnail: true,
        },
      },
      categoryThumbnail: true,
    },
  });
}

async function getProducts(searchParams: SearchParams) {
  const page = Number(searchParams.page) || 1;
  const limit = 12;
  const skip = (page - 1) * limit;

  const where = {
    status: ProductStatus.ACTIVE,
    ...(searchParams.category && {
      category: {
        some: {
          id: parseInt(searchParams.category),
        },
      },
    }),
    ...(searchParams.subcategory && {
      subCategory: {
        some: {
          id: parseInt(searchParams.subcategory),
        },
      },
    }),
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        discount: true,
        options: true,
        productMainImages: {
          select: { url: true },
          orderBy: { order: "asc" },
          take: 1,
        },
      },
      orderBy: {
        ...(searchParams.sort === "price_asc" && { price: "asc" }),
        ...(searchParams.sort === "price_desc" && { price: "desc" }),
        ...((!searchParams.sort || searchParams.sort === "latest") && {
          createdAt: "desc",
        }),
      },
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products,
    total,
    pages: Math.ceil(total / limit),
  };
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const awaitedSearchParams = await searchParams;
  const [categories, { products, total, pages }] = await Promise.all([
    getCategories(),
    getProducts(awaitedSearchParams),
  ]);

  const currentCategory = awaitedSearchParams.category
    ? categories.find(
        (cat) => cat.id === parseInt(awaitedSearchParams.category!)
      )
    : null;

  const currentSubcategory =
    currentCategory && awaitedSearchParams.subcategory
      ? currentCategory.subCategory.find(
          (sub) => sub.id === parseInt(awaitedSearchParams.subcategory!)
        )
      : null;

  return (
    <main className="mx-auto max-w-screen-xl px-4 py-8">
      {/* Categories ScrollArea */}
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex space-x-4 py-4">
          <Link
            href="/products"
            className={cn(
              "inline-flex items-center rounded-full px-4 py-2 text-sm font-medium transition-colors",
              !awaitedSearchParams.category
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-muted hover:bg-muted/90"
            )}
          >
            전체
          </Link>
          {categories.map((category) => (
            <CategoryDrawer key={category.id} category={category}>
              <div
                className={cn(
                  "inline-flex items-center rounded-full px-6 py-2 text-sm font-medium transition-colors",
                  parseInt(awaitedSearchParams.category!) === category.id
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-muted hover:bg-muted/90"
                )}
              >
                {category.name}
              </div>
            </CategoryDrawer>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {/* Title and Category Path */}
      <div className="mt-8 flex items-baseline justify-between border-b pb-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">
            {currentCategory ? currentCategory.name : "전체 제품"}
            {currentSubcategory && (
              <span className="text-muted-foreground">
                {" > "}
                {currentSubcategory.name}
              </span>
            )}
          </h1>
          <p className="text-sm text-muted-foreground">총 {total}개의 제품</p>
        </div>
      </div>

      {/* Product Grid */}
      <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <ProductGrid products={products} />
      </div>

      {/* Pagination */}
      <div className="mt-8">
        <Pagination totalPages={pages} />
      </div>
    </main>
  );
}
