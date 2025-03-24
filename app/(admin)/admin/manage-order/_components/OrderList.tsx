import { PurchaseStatus } from "@prisma/client";
import { format } from "date-fns";
import { ChevronDown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

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

import { TrackingInputs } from "./TrackingInputs";
import { UpdateOrderStatus } from "./UpdateOrderStatus";

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
              email: true,
              phone: true,
            },
          },
          deliveryAddress: {
            select: {
              name: true,
              phone: true,
              address: true,
              detailedAddress: true,
              zipcode: true,
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
              <TableHead className="whitespace-nowrap">주문번호</TableHead>
              <TableHead className="whitespace-nowrap">품목</TableHead>
              <TableHead className="whitespace-nowrap">주문상태</TableHead>
              <TableHead className="whitespace-nowrap">결제상태</TableHead>
              <TableHead className="whitespace-nowrap">배송정보</TableHead>
              <TableHead className="whitespace-nowrap text-right">
                실결제금액
              </TableHead>
              <TableHead className="whitespace-nowrap">구매자</TableHead>
              <TableHead className="whitespace-nowrap">주소지</TableHead>
              <TableHead className="whitespace-nowrap">주문일</TableHead>
              <TableHead className="whitespace-nowrap">결제일</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => {
              const orderContent = order.orderContent as any;
              const products = orderContent.products;

              return (
                <TableRow key={order.id}>
                  <TableCell className="whitespace-nowrap">
                    {order.id}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
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
                                <Link
                                  href={`/admin/manage-product/${product.productId}`}
                                  className="group flex items-start gap-3 transition-opacity hover:opacity-75"
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
                                    <p className="text-sm font-medium group-hover:underline">
                                      {product.productName}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      {product.quantity}개
                                      {product.selectedOption &&
                                        ` - ${product.selectedOption}`}
                                    </p>
                                    <p className="w-full text-left text-sm font-medium">
                                      {product.subTotalPrice.toLocaleString()}원
                                    </p>
                                  </div>
                                </Link>
                              </div>
                            );
                          })}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <UpdateOrderStatus
                      orderId={order.id}
                      currentStatus={order.status}
                    />
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {order.isCanceled
                      ? "취소됨"
                      : order.isRefunded
                      ? "환불됨"
                      : "결제완료"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <TrackingInputs
                      orderId={order.id}
                      initialTrackingCompany={order.trackingCompany}
                      initialTrackingNumber={order.trackingNumber}
                    />
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-right">
                    {orderContent.totalAmount.toLocaleString()}원
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <Popover>
                      <PopoverTrigger className="flex items-center gap-2">
                        <span className="cursor-pointer text-primary underline">
                          {order.user.name}
                        </span>
                        <ChevronDown className="size-4" />
                      </PopoverTrigger>
                      <PopoverContent className="min-w-60">
                        <div className="space-y-2">
                          <div className="grid grid-cols-3 gap-2 text-sm">
                            <span className="text-muted-foreground">이름</span>
                            <span className="col-span-2 font-medium">
                              {order.user.name || "-"}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-sm">
                            <span className="text-muted-foreground">
                              이메일
                            </span>
                            <span className="col-span-2 font-medium">
                              {order.user.email || "-"}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-sm">
                            <span className="text-muted-foreground">
                              전화번호
                            </span>
                            <span className="col-span-2 font-medium">
                              {order.user.phone || "-"}
                            </span>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm text-muted-foreground">
                        {order.deliveryAddress?.name}
                      </span>
                      <span className="text-sm">
                        {order.deliveryAddress?.phone}
                      </span>
                      <span className="text-sm">
                        {`[${order.deliveryAddress?.zipcode}] ${order.deliveryAddress?.address} ${order.deliveryAddress?.detailedAddress}` ||
                          "-"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {format(new Date(order.createdAt), "yyyy-MM-dd")}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
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
