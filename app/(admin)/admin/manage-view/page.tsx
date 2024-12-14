import { redirect } from "next/navigation";
import { z } from "zod";

import { auth } from "@/auth";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ROUTES } from "@/constants/general";
import prisma from "@/lib/prisma";

import { BusCategoryManager } from "./_components/BusCategoryManager";
import { PostListContainer } from "./_components/PostListContainer";

const searchParamsSchema = z.object({
  query: z.string().optional(),
});

interface Props {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function Page({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user.isAdmin) {
    redirect(ROUTES.HOME);
  }

  const params = await searchParams;
  const result = await searchParamsSchema.safeParseAsync({
    query: params.query,
  });

  const { query: parsedQuery } = result.success
    ? result.data
    : { query: undefined };

  const where = parsedQuery
    ? {
        title: {
          contains: parsedQuery,
          mode: "insensitive" as const,
        },
      }
    : {};

  const [posts, busCategories] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        thumbnail: true,
        busCategory: true,
      },
    }),
    prisma.busCategory.findMany({
      orderBy: {
        id: "asc",
      },
    }),
  ]);

  return (
    <main className="min-h-screen bg-lightgray pb-24">
      <div className="space-y-8 p-8">
        <div className="rounded-lg bg-white p-4 md:p-8">
          <Accordion type="single" collapsible>
            <AccordionItem value="categories">
              <AccordionTrigger className="items-center text-2xl font-bold hover:no-underline">
                <div className="flex w-full items-center justify-between">
                  <span>게시물 카테고리 관리</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-8">
                <BusCategoryManager initialCategories={busCategories} />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <div className="rounded-lg bg-white p-4 md:p-8">
          <h1 className="mb-8 text-2xl font-bold">게시물 관리</h1>
          <PostListContainer posts={posts} query={parsedQuery} />
        </div>
      </div>
    </main>
  );
}
