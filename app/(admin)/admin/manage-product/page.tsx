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
import { PRODUCT_CATEGORIES } from "@/lib/constants/zod";
import prisma from "@/lib/prisma";

import { ProductList } from "./_components/ProductList";

const MAIN_PAGE_LISTINGS = [
  { value: "recommended", label: "추천 제품" },
  { value: "new", label: "신제품" },
] as const;

const searchParamsSchema = z
  .object({
    category: z.enum([...PRODUCT_CATEGORIES]).optional(),
  })
  .strict();

export default async function Page({
  searchParams,
}: {
  searchParams: z.infer<typeof searchParamsSchema>;
}) {
  const session = await auth();
  if (!session?.user.isAdmin) {
    redirect("/");
  }

  const result = await searchParamsSchema.safeParseAsync(await searchParams);
  const category = result.success ? result.data.category : undefined;
  const products = await prisma.product.findMany({
    where: category
      ? {
          category: {
            has: category,
          },
        }
      : undefined,
    include: {
      productMainImages: {
        orderBy: {
          order: "asc",
        },
      },
      productImages: {
        orderBy: {
          order: "asc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="flex items-start gap-8 bg-lightgray px-4 py-8">
      <aside className="basis-80">
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
                    <li key={listing.value}>{listing.label}</li>
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
                      href="/admin/manage-product"
                      className="hover:underline"
                    >
                      전체
                    </Link>
                  </li>
                  {PRODUCT_CATEGORIES.map((category) => (
                    <li key={category}>
                      <Link
                        href={`/admin/manage-product?category=${encodeURIComponent(
                          category
                        )}`}
                        className="hover:underline"
                      >
                        {category}
                      </Link>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </aside>

      <div className="flex-1">
        <div className="rounded-lg bg-white p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">상품 관리</h1>
          </div>

          <Suspense fallback={<div>Loading products...</div>}>
            <ProductList
              products={products.map((product) => ({
                id: product.id,
                name: product.name,
                description: product.description,
                price: product.price,
                options: product.options,
                status: product.status,
                category: product.category,
                stock: product.stock,
                delivery: product.delivery,
                discount: product.discount,
                createdAt: product.createdAt,
                updatedAt: product.updatedAt,
                productMainImages: product.productMainImages.map(
                  (img) => img.url
                ),
                productImages: product.productImages.map((img) => img.url),
              }))}
            />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
