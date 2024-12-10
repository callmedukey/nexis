import { PurchaseStatus } from "@prisma/client";

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

interface OrderListProps {
  searchParams: {
    page?: string;
    startDate?: string;
    endDate?: string;
    buyerName?: string;
    productName?: string;
  };
}

interface OrderProduct {
  id: number;
  name: string;
}

interface OrderContentProduct {
  id: number;
  quantity: number;
  productName: string;
  unitPrice: number;
  subTotalPrice: number;
}

interface OrderData {
  id: string;
  createdAt: Date;
  status: PurchaseStatus;
  isCanceled: boolean;
  isRefunded: boolean;
  orderContent: OrderContentProduct[];
  user: {
    name: string | null;
  };
  products: OrderProduct[];
}

interface OrdersResponse {
  orders: OrderData[];
  total: number;
  pages: number;
}

export async function OrderList({ searchParams }: OrderListProps) {
  const page = searchParams.page ? parseInt(searchParams.page) : 1;
  const limit = 100;
  const skip = (page - 1) * limit;

  try {
    const where = {
      AND: [
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
        searchParams.buyerName
          ? {
              user: {
                name: {
                  contains: searchParams.buyerName,
                  mode: "insensitive" as const,
                },
              },
            }
          : {},
        searchParams.productName
          ? {
              products: {
                some: {
                  name: {
                    contains: searchParams.productName,
                    mode: "insensitive" as const,
                  },
                },
              },
            }
          : {},
      ],
    };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: {
            select: {
              name: true,
            },
          },
          products: {
            select: {
              id: true,
              name: true,
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

    const ordersWithContent = orders.map((order) => ({
      ...order,
      orderContent:
        (order.orderContent as unknown as OrderContentProduct[]) || [],
    }));

    const data: OrdersResponse = {
      orders: ordersWithContent,
      total,
      pages: Math.ceil(total / limit),
    };

    if (orders.length === 0) {
      return <div>주문 내역이 없습니다.</div>;
    }

    return (
      <div className="space-y-4">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>주문번호</TableHead>
                <TableHead>품목 (수량)</TableHead>
                <TableHead>주문상태</TableHead>
                <TableHead>결제상태</TableHead>
                <TableHead>실결제금액</TableHead>
                <TableHead>구매자</TableHead>
                <TableHead>주문일</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.id}</TableCell>
                  <TableCell>
                    {order.orderContent.map((product) => (
                      <div key={product.id}>
                        {product.productName} ({product.quantity}개)
                      </div>
                    ))}
                  </TableCell>
                  <TableCell>{order.status}</TableCell>
                  <TableCell>
                    {order.isCanceled
                      ? "취소됨"
                      : order.isRefunded
                      ? "환불됨"
                      : "결제완료"}
                  </TableCell>
                  <TableCell>
                    {order.orderContent
                      .reduce(
                        (total, product) => total + product.subTotalPrice,
                        0
                      )
                      .toLocaleString()}
                    원
                  </TableCell>
                  <TableCell>{order.user.name}</TableCell>
                  <TableCell>
                    {new Date(order.createdAt).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
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
    console.error("[ORDER_LIST]", error);
    return <div>주문 목록을 불러오는데 실패했습니다.</div>;
  }
}
