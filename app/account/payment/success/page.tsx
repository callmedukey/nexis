import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import prisma from "@/lib/prisma";

import { HistoryButton } from "./_components/HistoryButton";

interface PaymentSuccessPageProps {
  searchParams: Promise<{
    orderId?: string;
  }>;
}

export default async function PaymentSuccessPage({
  searchParams,
}: PaymentSuccessPageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/");
  }

  const { orderId } = await searchParams;
  if (!orderId) {
    redirect("/");
  }

  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      user: {
        providerId: session.user.id,
      },
    },
    include: {
      deliveryAddress: true,
    },
  });

  if (!order) {
    redirect("/");
  }

  const orderContent = order.orderContent as any;

  return (
    <div className="container mx-auto space-y-4 p-4 min-h-screen">
      <Card>
        <CardHeader>
          <CardTitle>결제가 완료되었습니다</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border p-4">
            <h3 className="mb-2 text-lg font-semibold">주문 정보</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">주문 번호</span>
                <span>{order.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">결제 금액</span>
                <span>{formatPrice(order.price)}</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border p-4">
            <h3 className="mb-2 text-lg font-semibold">배송 정보</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">받는 분</span>
                <span>{order.deliveryAddress?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">연락처</span>
                <span>{order.deliveryAddress?.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">주소</span>
                <span>
                  {order.deliveryAddress?.address}{" "}
                  {order.deliveryAddress?.detailedAddress}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">우편번호</span>
                <span>{order.deliveryAddress?.zipcode}</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border p-4">
            <h3 className="mb-2 text-lg font-semibold">주문 상품</h3>
            <div className="space-y-2">
              {orderContent.products.map((product: any) => (
                <div key={product.productId} className="flex justify-between">
                  <span>
                    {product.productName}{" "}
                    {product.selectedOption && `(${product.selectedOption})`} x{" "}
                    {product.quantity}
                  </span>
                  <span>{formatPrice(product.subTotalPrice)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center">
            <HistoryButton />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
