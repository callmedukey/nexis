import { redirect } from "next/navigation";

import { OrderSummary } from "@/app/cart/_components/OrderSummary";
import { auth } from "@/auth";
import { CartItem } from "@/components/cart/CartItem";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import prisma from "@/lib/prisma";

async function getCart(userId: string) {
  return prisma.cart.findUnique({
    where: { providerId: userId },
    include: {
      items: {
        include: {
          product: {
            include: {
              productMainImages: true,
            },
          },
        },
      },
    },
  });
}

export default async function CartPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/");
  }

  const cart = await getCart(session.user.id);
  const items = cart?.items || [];

  const originalTotal = items.reduce(
    (acc, item) => acc + item.quantity * item.product.price,
    0
  );

  const discountedTotal = items.reduce(
    (acc, item) =>
      acc +
      item.quantity *
        Math.round(item.product.price * (1 - item.product.discount / 100)),
    0
  );

  const totalDiscount = originalTotal - discountedTotal;

  return (
    <div className="container mx-auto p-4">
      {items.length === 0 ? (
        <Card>
          <CardContent className="flex min-h-[300px] items-center justify-center">
            <p className="text-muted-foreground">장바구니가 비어있습니다</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <Card>
              <CardHeader>
                <CardTitle>장바구니 상품 ({items.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item) => (
                  <CartItem
                    key={item.id}
                    id={item.id.toString()}
                    quantity={item.quantity}
                    product={item.product}
                    selectedOption={item.selectedOption}
                  />
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-4">
            <OrderSummary
              originalTotal={originalTotal}
              discountedTotal={discountedTotal}
              totalDiscount={totalDiscount}
            />
          </div>
        </div>
      )}
    </div>
  );
}
