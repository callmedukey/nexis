import { Suspense } from "react";

import prisma from "@/lib/prisma";

import { UserListClient } from "./UserListClient";
import { UserListSkeleton } from "./UserListSkeleton";

interface UserListProps {
  searchParams: {
    page?: string;
    email?: string;
    phone?: string;
    name?: string;
  };
}

export async function UserList({ searchParams }: UserListProps) {
  const page = searchParams.page ? parseInt(searchParams.page) : 1;
  const limit = 20;
  const skip = (page - 1) * limit;

  try {
    const where = {
      AND: [
        searchParams.email
          ? {
              email: {
                contains: searchParams.email,
                mode: "insensitive" as const,
              },
            }
          : {},
        searchParams.phone
          ? {
              phone: {
                contains: searchParams.phone,
                mode: "insensitive" as const,
              },
            }
          : {},
        searchParams.name
          ? {
              name: {
                contains: searchParams.name,
                mode: "insensitive" as const,
              },
            }
          : {},
      ],
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          provider: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    if (users.length === 0) {
      return <div>회원이 없습니다.</div>;
    }

    return (
      <Suspense fallback={<UserListSkeleton />}>
        <UserListClient
          users={users}
          total={total}
          page={page}
          limit={limit}
          skip={skip}
          searchParams={searchParams}
        />
      </Suspense>
    );
  } catch (error) {
    console.error("[USER_LIST]", error);
    return <div>회원 목록을 불러오는데 실패했습니다.</div>;
  }
}
