import Image from "next/image";
import Link from "next/link";

import { Pagination } from "@/app/products/_components/Pagination";
import { Button } from "@/components/ui/button";
import prisma from "@/lib/prisma";

import { BusCategoryDrawer } from "./_components/BusCategoryDrawer";

const POSTS_PER_PAGE = 100;

interface Props {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function ExplorePage({ searchParams }: Props) {
  const awaitedSearchParams = await searchParams;
  const sortBy = awaitedSearchParams.sort === "popular" ? "popular" : "latest";
  const selectedCategories =
    (awaitedSearchParams.categories as string)?.split(",").filter(Boolean) ||
    [];
  const page = Number(awaitedSearchParams.page) || 1;

  // Get all bus categories
  const busCategories = await prisma.busCategory.findMany({
    orderBy: {
      id: "asc",
    },
  });

  // Create where clause for filtering
  const where = {
    ...(selectedCategories.length > 0
      ? {
          busCategory: {
            some: {
              id: {
                in: selectedCategories.map((id) => parseInt(id)),
              },
            },
          },
        }
      : {}),
  };

  // Get total count for pagination
  const totalPosts = await prisma.post.count({ where });
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);

  // Get posts with filters and pagination
  const posts = await prisma.post.findMany({
    where,
    orderBy: [
      ...(sortBy === "popular"
        ? [{ readCount: "desc" as const }]
        : [{ createdAt: "desc" as const }]),
    ],
    include: {
      thumbnail: true,
      busCategory: true,
    },
    skip: (page - 1) * POSTS_PER_PAGE,
    take: POSTS_PER_PAGE,
  });

  return (
    <main className="mx-auto max-w-screen-xl px-4 py-8">
      <h1 className="text-2xl font-bold">둘러보기</h1>

      <div className="mt-6 flex gap-2">
        <Button
          variant={sortBy === "popular" ? "default" : "outline"}
          className="rounded-full"
          asChild
        >
          <a href={`/explore${sortBy === "popular" ? "" : "?sort=popular"}`}>
            인기순
          </a>
        </Button>

        <BusCategoryDrawer busCategories={busCategories} />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/explore/${post.id}`}
            className="rounded-lg bg-card p-4 transition-colors hover:bg-accent"
          >
            {post.thumbnail?.[0] && (
              <div className="relative aspect-video w-full overflow-hidden rounded-md">
                <Image
                  src={post.thumbnail[0].url}
                  alt={post.title}
                  fill
                  className="object-fill"
                />
              </div>
            )}
            <h3 className="mt-4 font-medium">{post.title}</h3>
          </Link>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <Pagination totalPages={totalPages} />
        </div>
      )}
    </main>
  );
}
