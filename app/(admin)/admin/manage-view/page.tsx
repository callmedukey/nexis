import { redirect } from "next/navigation";
import { z } from "zod";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";

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
    redirect("/");
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

  const posts = await prisma.post.findMany({
    where,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      thumbnail: true,
    },
  });

  return (
    <main className="min-h-screen bg-lightgray pb-24">
      <div className="p-8">
        <div className="rounded-lg bg-white p-4 md:p-8">
          <h1 className="mb-8 text-2xl font-bold">게시물 관리</h1>
          <PostListContainer posts={posts} query={parsedQuery} />
        </div>
      </div>
    </main>
  );
}
