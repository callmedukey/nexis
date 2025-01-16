import { format } from "date-fns";
import { ko } from "date-fns/locale";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { OrderStatusKoreanMapping } from "@/constants/general";
import prisma from "@/lib/prisma";

import { CancelOrderButton } from "./_components/CancelOrderButton";
import { DateRangePicker } from "./_components/DateRangePicker";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function HistoryPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/");
  }
  const awaitedSearchParams = await searchParams;
  const page = Number(awaitedSearchParams.page) || 1;
  const limit = 100;
  const skip = (page - 1) * limit;

  const where = {
    user: {
      providerId: session.user.id,
    },
    ...(awaitedSearchParams.from && {
      createdAt: {
        gte: new Date(
          Array.isArray(awaitedSearchParams.from)
            ? awaitedSearchParams.from[0]
            : awaitedSearchParams.from
        ),
      },
    }),
    ...(awaitedSearchParams.to && {
      createdAt: {
        lte: new Date(
          Array.isArray(awaitedSearchParams.to)
            ? awaitedSearchParams.to[0]
            : awaitedSearchParams.to
        ),
      },
    }),
  };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        products: {
          include: {
            productMainImages: {
              orderBy: {
                order: "asc",
              },
              take: 1,
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    }),
    prisma.order.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <main className="mx-auto flex max-w-screen-sm flex-col items-center justify-center px-4 ~py-6/12">
      <div className="w-full border-b border-black py-4 font-bold ~text-lg/2xl ~pl-8/16">
        구매 내역
      </div>

      <div className="w-full py-4">
        <DateRangePicker />
      </div>

      {orders.length === 0 ? (
        <div className="w-full text-left text-gray-500">
          구매 내역이 없습니다
        </div>
      ) : (
        <>
          <div className="w-full space-y-4">
            {orders.map((order, i) => {
              const orderContent = (order.orderContent as any).products;
              return (
                <div
                  key={order.id + i}
                  className="space-y-4 rounded-lg border p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      {format(new Date(order.createdAt), "yyyy년 MM월 dd일", {
                        locale: ko,
                      })}
                    </div>
                    <div className="text-sm font-medium">
                      주문번호: {order.id}
                    </div>
                  </div>

                  {orderContent.map((item: any, index: number) => {
                    const product = order.products[index];
                    const mainImage = product?.productMainImages[0]?.url;

                    return (
                      <div
                        key={index + "i" + item?.productName}
                        className="flex gap-4"
                      >
                        <Link
                          href={`/products/${item.productId}`}
                          className="relative size-24 shrink-0"
                        >
                          <Image
                            src={mainImage || "/placeholder.png"}
                            alt={item.productName}
                            fill
                            className="rounded-md object-cover transition-opacity hover:opacity-80"
                          />
                        </Link>

                        <div className="flex flex-1 flex-col justify-between">
                          <div>
                            <Link
                              href={`/products/${item.productId}`}
                              className="hover:underline"
                            >
                              <h3 className="font-medium">
                                {item.productName}
                              </h3>
                            </Link>
                            <p className="text-sm text-gray-500">
                              {item.selectedOption &&
                                `옵션: ${item.selectedOption}`}
                            </p>
                            <p className="text-sm text-gray-500">
                              수량: {item.quantity}개
                            </p>
                          </div>
                          <div className="text-right font-medium">
                            {item.subTotalPrice.toLocaleString()}원
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  <div className="flex items-center justify-between border-t pt-4">
                    <div className="text-sm font-medium">
                      상태: {OrderStatusKoreanMapping[order.status]}
                    </div>
                    <CancelOrderButton
                      orderId={order.id}
                      status={order.status}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="py-4">
              <Pagination>
                <PaginationContent>
                  {page > 1 && (
                    <PaginationItem>
                      <PaginationPrevious
                        href={`?${new URLSearchParams({
                          ...awaitedSearchParams,
                          page: (page - 1).toString(),
                        })}`}
                      />
                    </PaginationItem>
                  )}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (pageNumber) => (
                      <PaginationItem key={pageNumber}>
                        <PaginationLink
                          href={`?${new URLSearchParams({
                            ...awaitedSearchParams,
                            page: pageNumber.toString(),
                          })}`}
                          isActive={pageNumber === page}
                        >
                          {pageNumber}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  )}
                  {page < totalPages && (
                    <PaginationItem>
                      <PaginationNext
                        href={`?${new URLSearchParams({
                          ...awaitedSearchParams,
                          page: (page + 1).toString(),
                        })}`}
                      />
                    </PaginationItem>
                  )}
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}
    </main>
  );
}
