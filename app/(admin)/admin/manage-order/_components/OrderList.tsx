import { PurchaseStatus } from "@prisma/client";
import { format } from "date-fns";
import { ChevronDown } from "lucide-react";
import Image from "next/image";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import prisma from "@/lib/prisma";

interface OrderListProps {
  searchParams: {
    page?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  };
}

export async function OrderList({ searchParams }: OrderListProps) {
  const page = searchParams.page ? parseInt(searchParams.page) : 1;
  const limit = 100;
  const skip = (page - 1) * limit;

  const where = {
    AND: [
      searchParams.status && searchParams.status !== "ALL"
        ? { status: searchParams.status as PurchaseStatus }
        : {},
      searchParams.startDate
        ? {
            createdAt: {
              gte: new Date(searchParams.startDate),
            },
          }
        : {},
      searchParams.endDate
        ? {
            createdAt: {
              lte: new Date(searchParams.endDate),
            },
          }
        : {},
    ],
  };

  try {
    const [orders] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: {
            select: {
              name: true,
            },
          },
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

    if (orders.length === 0) {
      return <div>주문 내역이 없습니다.</div>;
    }

    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>주문번호</TableHead>
              <TableHead>품목</TableHead>
              <TableHead>주문상태</TableHead>
              <TableHead>결제상태</TableHead>
              <TableHead className="text-right">실결제금액</TableHead>
              <TableHead>구매자</TableHead>
              <TableHead>주문일</TableHead>
              <TableHead>결제일</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => {
              const orderContent = order.orderContent as any;
              const products = orderContent.products;

              return (
                <TableRow key={order.id}>
                  <TableCell>{order.id}</TableCell>
                  <TableCell>
                    <Popover>
                      <PopoverTrigger className="flex items-center gap-2">
                        <span>{products.length}개 상품</span>
                        <ChevronDown className="size-4" />
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        <div className="space-y-3">
                          {products.map((product: any, index: number) => {
                            const mainImage =
                              order.products[index]?.productMainImages[0]?.url;
                            const imageUrl = mainImage
                              ? mainImage.startsWith("http")
                                ? mainImage
                                : mainImage.startsWith("/")
                                ? mainImage
                                : `/${mainImage}`
                              : "/placeholder.png";
                            return (
                              <div
                                key={product.productId}
                                className="flex items-start gap-3"
                              >
                                <div className="relative size-16 overflow-hidden rounded-md">
                                  <Image
                                    src={imageUrl}
                                    alt={product.productName}
                                    fill
                                    className="object-cover"
                                    sizes="64px"
                                  />
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-medium">
                                    {product.productName}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {product.quantity}개
                                    {product.selectedOption &&
                                      ` - ${product.selectedOption}`}
                                  </p>
                                  <p className="text-right text-sm font-medium">
                                    {product.subTotalPrice.toLocaleString()}원
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </TableCell>
                  <TableCell>
                    {order.status === "PENDING"
                      ? "결제대기"
                      : order.status === "PENDING_DELIVERY"
                      ? "상품 준비중"
                      : order.status === "DELIVERING"
                      ? "배송중"
                      : order.status === "COMPLETED"
                      ? "배송완료"
                      : order.status === "CANCELLED"
                      ? "취소됨"
                      : ""}
                  </TableCell>
                  <TableCell>
                    {order.isCanceled
                      ? "취소됨"
                      : order.isRefunded
                      ? "환불됨"
                      : "결제완료"}
                  </TableCell>
                  <TableCell className="text-right">
                    {orderContent.totalAmount.toLocaleString()}원
                  </TableCell>
                  <TableCell>{order.user.name}</TableCell>
                  <TableCell>
                    {format(new Date(order.createdAt), "yyyy-MM-dd")}
                  </TableCell>
                  <TableCell>
                    {format(new Date(order.createdAt), "yyyy-MM-dd")}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    );
  } catch (error) {
    console.error("[ORDER_LIST]", error);
    return <div>주문 목록을 불러오는데 실패했습니다.</div>;
  }
}
