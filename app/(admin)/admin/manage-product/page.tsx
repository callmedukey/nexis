import { ProductStatus } from "@prisma/client";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { z } from "zod";

import { auth } from "@/auth";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import prisma from "@/lib/prisma";
import { cn } from "@/lib/utils";

import { Pagination } from "./_components/Pagination";
import { PaginationSkeleton } from "./_components/PaginationSkeleton";
import { ProductList } from "./_components/ProductList";
import { ProductListSkeleton } from "./_components/ProductListSkeleton";
import { SearchInput } from "./_components/SearchInput";
import { StatusFilter } from "./_components/StatusFilter";

const ITEMS_PER_PAGE = 100;
const MAIN_PAGE_LISTINGS = [
  { value: "recommended", label: "추천 제품" },
  { value: "new", label: "신제품" },
] as const;

const searchParamsSchema = z.object({
  categoryId: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : undefined)),
  subCategoryId: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : undefined)),
  status: z
    .enum([ProductStatus.ACTIVE, ProductStatus.INACTIVE, ProductStatus.SOLDOUT])
    .optional(),
  page: z.coerce.number().min(1).optional().default(1),
  query: z.string().optional(),
  filter: z.enum(["recommended", "new"]).optional(),
});

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth();
  if (!session?.user.isAdmin) {
    redirect("/");
  }

  // Parse search params safely
  const params = await searchParams;
  const result = await searchParamsSchema.safeParseAsync({
    categoryId: params.categoryId,
    subCategoryId: params.subCategoryId,
    status: params.status,
    page: params.page,
    query: params.query,
    filter: params.filter,
  });

  const {
    categoryId: parsedCategoryId,
    subCategoryId: parsedSubCategoryId,
    status: parsedStatus,
    page: parsedPage,
    query: parsedQuery,
    filter: parsedFilter,
  } = result.success
    ? result.data
    : {
        categoryId: undefined,
        subCategoryId: undefined,
        status: undefined,
        page: 1,
        query: undefined,
        filter: undefined,
      };

  const where = {
    ...(parsedCategoryId
      ? { category: { some: { id: parsedCategoryId } } }
      : {}),
    ...(parsedSubCategoryId
      ? { subCategory: { some: { id: parsedSubCategoryId } } }
      : {}),
    ...(parsedStatus ? { status: parsedStatus } : {}),
    ...(parsedQuery && parsedQuery.length > 0
      ? {
          name: {
            contains: parsedQuery,
            mode: "insensitive" as const,
          },
        }
      : {}),
    ...(parsedFilter === "recommended" ? { isRecommended: true } : {}),
    ...(parsedFilter === "new" ? { isNew: true } : {}),
  };

  // Get total count for pagination
  const totalItems = await prisma.product.count({ where });
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));

  // Ensure page is within valid range
  const currentPage = Math.min(Math.max(1, parsedPage), totalPages);

  const products = await prisma.product.findMany({
    where,
    include: {
      category: true,
      subCategory: true,
      productMainImages: {
        orderBy: {
          order: "asc",
        },
        select: {
          url: true,
        },
      },
      productImages: {
        orderBy: {
          order: "asc",
        },
        select: {
          url: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    skip: (currentPage - 1) * ITEMS_PER_PAGE,
    take: ITEMS_PER_PAGE,
  });

  // Get all products for counts
  const allProducts = await prisma.product.findMany({
    select: { status: true },
  });

  const statusCounts = {
    total: allProducts.length,
    active: allProducts.filter((p) => p.status === ProductStatus.ACTIVE).length,
    soldout: allProducts.filter((p) => p.status === ProductStatus.SOLDOUT)
      .length,
    inactive: allProducts.filter((p) => p.status === ProductStatus.INACTIVE)
      .length,
  };

  // Get all categories for the sidebar
  const categories = await prisma.category.findMany({
    include: {
      subCategory: true,
    },
  });

  const createQueryString = (newPage: number) => {
    const params = new URLSearchParams();
    if (parsedCategoryId) params.set("categoryId", parsedCategoryId.toString());
    if (parsedSubCategoryId)
      params.set("subCategoryId", parsedSubCategoryId.toString());
    if (parsedStatus) params.set("status", parsedStatus);
    if (parsedQuery) params.set("query", parsedQuery);
    if (newPage > 1) params.set("page", newPage.toString());
    return params.toString();
  };

  const createCategoryLink = (catId?: number, subCatId?: number) => {
    const params = new URLSearchParams();
    if (catId) params.set("categoryId", catId.toString());
    if (subCatId) params.set("subCategoryId", subCatId.toString());
    if (parsedStatus) params.set("status", parsedStatus);
    if (parsedQuery) params.set("query", parsedQuery);
    return `/admin/manage-product${
      params.toString() ? `?${params.toString()}` : ""
    }`;
  };

  const createMainPageLink = (filter: "recommended" | "new") => {
    const params = new URLSearchParams();
    params.set("filter", filter);
    if (parsedStatus) params.set("status", parsedStatus);
    if (parsedQuery) params.set("query", parsedQuery);
    return `/admin/manage-product?${params.toString()}`;
  };

  return (
    <main className="min-h-screen bg-lightgray">
      <div className="flex min-w-0 flex-col gap-4 px-4 py-8 md:flex-row">
        <aside className="w-full shrink-0 md:w-60">
          <div className="bg-primaryblue px-6 py-4 text-lg text-white">
            전체 카테고리
          </div>
          <div className="bg-white px-6 py-4">
            <Accordion type="multiple" defaultValue={["item-1", "item-2"]}>
              <AccordionItem value="item-1">
                <AccordionTrigger className="gap-4">
                  <div className="w-full text-left">메인 페이지</div>
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-4 pl-12 [&>li]:text-base">
                    {MAIN_PAGE_LISTINGS.map((listing) => (
                      <li key={listing.value}>
                        <Link
                          href={createMainPageLink(listing.value)}
                          className={cn(
                            "hover:bg-gray-100 rounded-md px-2 py-1 transition-colors",
                            parsedFilter === listing.value &&
                              "bg-primary text-primary-foreground hover:bg-primary/90"
                          )}
                        >
                          {listing.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger className="gap-4">
                  <div className="w-full text-left">카테고리별</div>
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-4 pl-12 [&>li]:text-base">
                    <li>
                      <Link
                        href={createCategoryLink()}
                        className={cn(
                          "hover:bg-gray-100 rounded-md px-2 py-1 transition-colors",
                          !parsedCategoryId &&
                            !parsedSubCategoryId &&
                            "bg-primary text-primary-foreground hover:bg-primary/90"
                        )}
                      >
                        전체
                      </Link>
                    </li>
                    {categories.map((category) => {
                      const isActiveCategory = parsedCategoryId === category.id;
                      return (
                        <li key={category.id}>
                          <Link
                            href={createCategoryLink(category.id)}
                            className={cn(
                              "hover:bg-gray-100 rounded-md px-2 py-1 transition-colors",
                              isActiveCategory &&
                                !parsedSubCategoryId &&
                                "bg-primary text-primary-foreground hover:bg-primary/90"
                            )}
                          >
                            {category.name}
                          </Link>
                          {category.subCategory.length > 0 && (
                            <ul className="mt-2 space-y-2 pl-4">
                              {category.subCategory.map((sub) => {
                                const isActiveSubCategory =
                                  isActiveCategory &&
                                  parsedSubCategoryId === sub.id;
                                return (
                                  <li key={sub.id}>
                                    <Link
                                      href={createCategoryLink(
                                        category.id,
                                        sub.id
                                      )}
                                      className={cn(
                                        "text-sm hover:bg-gray-100 rounded-md px-2 py-1 transition-colors",
                                        isActiveSubCategory &&
                                          "bg-primary text-primary-foreground hover:bg-primary/90"
                                      )}
                                    >
                                      {sub.name}
                                    </Link>
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <StatusFilter counts={statusCounts} />

          <div className="mt-4 rounded-lg bg-white p-4 md:p-8">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <h1 className="text-2xl font-bold">상품 관리</h1>
                <p className="text-sm text-muted-foreground">
                  상품을 관리하고 수정할 수 있습니다
                </p>
              </div>
              <div className="flex items-center gap-4">
                <SearchInput />
                <Button asChild>
                  <Link href="/admin/manage-product/add">상품 등록</Link>
                </Button>
              </div>
            </div>

            <Suspense fallback={<ProductListSkeleton />}>
              <ProductList
                products={products.map((product) => {
                  // Create a map of categories and their subcategories
                  const categoryMap = new Map();

                  // First, collect all categories
                  product.category.forEach((cat) => {
                    categoryMap.set(cat.id, {
                      id: cat.id,
                      name: cat.name,
                      subCategories: [],
                    });
                  });

                  // Then, add subcategories to their respective parents
                  product.subCategory.forEach((sub) => {
                    const parentCategory = categoryMap.get(sub.categoryId);
                    if (parentCategory) {
                      parentCategory.subCategories.push({
                        id: sub.id,
                        name: sub.name,
                      });
                    }
                  });

                  return {
                    id: product.id,
                    name: product.name,
                    description: product.description,
                    price: product.price,
                    options: product.options,
                    status: product.status,
                    categories: Array.from(categoryMap.values()),
                    stock: product.stock,
                    delivery: product.delivery,
                    discount: product.discount,
                    createdAt: product.createdAt,
                    updatedAt: product.updatedAt,
                    productMainImages: product.productMainImages.map(
                      (img) => img.url
                    ),
                    productImages: product.productImages.map((img) => img.url),
                  };
                })}
              />
            </Suspense>
            <Suspense fallback={<PaginationSkeleton />}>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                createQueryString={createQueryString}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </main>
  );
}
