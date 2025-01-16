import { redirect } from "next/navigation";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";

import { EventsPageClient } from "./_components/EventsPageClient";

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function EventsPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user.isAdmin) {
    redirect("/");
  }
  const awaitedSearchParams = await searchParams;
  // Extract and normalize search parameters
  const queryParam = awaitedSearchParams.query;
  const pageParam = awaitedSearchParams.page;

  const query = Array.isArray(queryParam) ? queryParam[0] : queryParam;
  const currentPage = pageParam
    ? parseInt(Array.isArray(pageParam) ? pageParam[0] : pageParam)
    : 1;

  try {
    const [events, total] = await Promise.all([
      prisma.events.findMany({
        where: query
          ? {
              OR: [
                { title: { contains: query, mode: "insensitive" } },
                { content: { contains: query, mode: "insensitive" } },
              ],
            }
          : undefined,
        include: {
          thumbnail: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        skip: (currentPage - 1) * 10,
        take: 10,
      }),
      prisma.events.count({
        where: query
          ? {
              OR: [
                { title: { contains: query, mode: "insensitive" } },
                { content: { contains: query, mode: "insensitive" } },
              ],
            }
          : undefined,
      }),
    ]);

    const pages = Math.ceil(total / 10);

    return (
      <EventsPageClient
        events={events}
        currentPage={currentPage}
        totalPages={pages}
        query={query}
      />
    );
  } catch (error) {
    console.error("Database error:", error);
    return <div>이벤트 목록을 불러오는데 실패했습니다.</div>;
  }
}
