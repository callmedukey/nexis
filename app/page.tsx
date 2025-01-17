import { ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { CategoryDrawer } from "@/components/CategoryDrawer";
import { EventCarousel } from "@/components/EventCarousel";
import { ExploreCarousel } from "@/components/ExploreCarousel";
import { ProductCarousel } from "@/components/ProductCarousel";
import { ROUTES } from "@/constants/general";
import prisma from "@/lib/prisma";

// Define ServerResponse type since module is missing
type ServerResponse<T> = {
  data?: T;
  error?: string;
  success: boolean;
};

export const revalidate = 600;

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

interface HomePageData {
  events: Array<{
    id: number;
    active: boolean;
    title: string;
    content: string | null;
    thumbnail: Array<{
      id: number;
      url: string;
      filename: string;
      filetype: string;
      eventsId: number;
    }>;
  }>;
  recommendedProducts: Array<{
    id: number;
    name: string;
    description?: string | null;
    price: number;
    discount: number;
    options: string[];
    productMainImages: Array<{ url: string }>;
  }>;
  newProducts: Array<{
    id: number;
    name: string;
    description?: string | null;
    price: number;
    discount: number;
    options: string[];
    productMainImages: Array<{ url: string }>;
  }>;
  categories: Category[];
  posts: Array<{
    id: number;
    title: string;
    thumbnail: Array<{
      url: string;
    }>;
  }>;
}

async function getHomePageData(): Promise<ServerResponse<HomePageData>> {
  try {
    const [events, recommendedProducts, newProducts, categories, posts] =
      await Promise.all([
        prisma.events.findMany({
          where: { active: true },
          include: { thumbnail: true },
          orderBy: { createdAt: "desc" },
        }),
        prisma.product.findMany({
          where: { isRecommended: true, status: "ACTIVE" },
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            discount: true,
            options: true,
            productMainImages: {
              select: {
                url: true,
              },
              orderBy: { order: "asc" },
              take: 1,
            },
          },
          take: 10,
        }),
        prisma.product.findMany({
          where: { isNew: true, status: "ACTIVE" },
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            discount: true,
            options: true,
            productMainImages: {
              select: {
                url: true,
              },
              orderBy: { order: "asc" },
              take: 1,
            },
          },
          take: 10,
        }),
        prisma.category.findMany({
          include: {
            categoryThumbnail: true,
            subCategory: {
              include: { categoryThumbnail: true },
            },
          },
          orderBy: { id: "asc" },
        }),
        prisma.post.findMany({
          select: {
            id: true,
            title: true,
            thumbnail: {
              select: {
                url: true,
              },
              take: 1,
            },
          },
          orderBy: { createdAt: "desc" },
          take: 6,
        }),
      ]);

    return {
      success: true,
      data: { events, recommendedProducts, newProducts, categories, posts },
    };
  } catch {
    return {
      success: false,
      error: "Failed to fetch home page data",
    };
  }
}

export default async function Home() {
  const response = await getHomePageData();

  if (!response.success) {
    return <div>Failed to load content</div>;
  }

  const { events, recommendedProducts, newProducts, categories, posts } =
    response.data as HomePageData;

  return (
    <main className="~pb-6/12">
      <section className="py-4">
        <EventCarousel events={events} />
      </section>
      <section className="mx-auto max-w-screen-lg px-4 py-8">
        <h2 className="pl-2 text-lg font-bold">추천 제품</h2>
        <ProductCarousel products={recommendedProducts} />
      </section>
      <section className="mx-auto max-w-screen-lg px-4 py-8">
        <h2 className="pl-2 text-lg font-bold">신제품</h2>
        <ProductCarousel products={newProducts} />
      </section>
      <section className="mx-auto max-w-screen-lg px-4 py-8">
        <h2 className="text-lg font-bold">카테고리별 검색</h2>
        <div className="mt-4 gap-4 sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {categories.map((category) => (
            <CategoryDrawer key={category.id} category={category}>
              <div className="group flex items-center overflow-hidden rounded-lg bg-white">
                {category.categoryThumbnail?.[0] && (
                  <div className="relative aspect-square ~w-12/20">
                    <Image
                      src={category.categoryThumbnail[0].url}
                      alt={category.name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                      className="object-fill transition-transform group-hover:scale-105"
                    />
                  </div>
                )}
                <div className="w-full p-4">
                  <h3 className="flex justify-between text-base font-medium">
                    {category.name}
                    <ChevronRight className="size-4 lg:hidden" />
                  </h3>
                </div>
              </div>
            </CategoryDrawer>
          ))}
        </div>
      </section>
      <section className="mx-auto max-w-screen-lg px-4 py-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">
            <Link href={ROUTES.EXPLORE} className="underline">
              둘러보기에서
            </Link>{" "}
            아이디어 얻어보세요
          </h2>
        </div>
        <ExploreCarousel
          items={posts.map((post) => ({
            id: post.id,
            title: post.title,
            thumbnail: post.thumbnail[0]?.url || "/placeholder-image.jpg",
          }))}
        />
      </section>
      <section className="mx-auto mt-6 max-w-screen-lg px-4 py-8">
        <div className="flex justify-center">
          <Link
            href="/customer-service"
            className="inline-flex items-center justify-center rounded-full bg-primary px-20 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            문의 하기
          </Link>
        </div>
      </section>
    </main>
  );
}
