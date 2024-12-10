import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import prisma from "@/lib/prisma";

import { Pagination } from "../../manage-product/_components/Pagination";

interface UserListProps {
  searchParams: {
    page?: string;
    email?: string;
    phone?: string;
    name?: string;
  };
}

interface UserData {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  provider: string;
  createdAt: Date;
}

interface UsersResponse {
  users: UserData[];
  total: number;
  pages: number;
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

    const data: UsersResponse = {
      users,
      total,
      pages: Math.ceil(total / limit),
    };

    if (users.length === 0) {
      return <div>회원이 없습니다.</div>;
    }

    return (
      <div className="space-y-4">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>번호</TableHead>
                <TableHead>이름</TableHead>
                <TableHead>이메일</TableHead>
                <TableHead>전화번호</TableHead>
                <TableHead>계정 유형</TableHead>
                <TableHead>가입일</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.users.map((user, index) => (
                <TableRow key={user.id}>
                  <TableCell>{skip + index + 1}</TableCell>
                  <TableCell>{user.name || "-"}</TableCell>
                  <TableCell>{user.email || "-"}</TableCell>
                  <TableCell>{user.phone || "-"}</TableCell>
                  <TableCell>
                    {user.provider === "kakao" ? "Kakao" : "Naver"}
                  </TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString("ko-KR", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                    })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <Pagination
          totalPages={data.pages}
          currentPage={page}
          createQueryString={(page: number) => {
            const params = new URLSearchParams(
              searchParams as Record<string, string>
            );
            params.set("page", page.toString());
            return params.toString();
          }}
        />
      </div>
    );
  } catch (error) {
    console.error("[USER_LIST]", error);
    return <div>회원 목록을 불러오는데 실패했습니다.</div>;
  }
}
