"use client";

import { redirect } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { getCartItems } from "@/actions/cart";
import { OrderSummary } from "@/app/cart/_components/OrderSummary";
import { CartItem } from "@/components/cart/CartItem";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type CartData = NonNullable<Awaited<ReturnType<typeof getCartItems>>["data"]>;

export default function CartPage() {
  const [cart, setCart] = useState<CartData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCart = useCallback(async () => {
    try {
      const result = await getCartItems();

      if (!result.success) {
        toast.error(result.message);
        if (result.message === "로그인이 필요합니다") {
          redirect("/");
        }
        return;
      }

      setCart(result.data || null);
    } catch {
      toast.error("장바구니를 불러오는데 실패했습니다");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  if (isLoading) {
    return (
      <div className="container mx-auto min-h-screen p-4">
        <Card>
          <CardContent className="flex min-h-[300px] items-center justify-center">
            <p className="text-muted-foreground">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

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

  const userData = cart?.user
    ? {
        name: cart.user.name,
        phone: cart.user.phone,
        address: cart.user.address,
        detailedAddress: cart.user.detailedAddress,
        zipcode: cart.user.zipcode,
      }
    : undefined;

  return (
    <div className="container mx-auto min-h-screen p-4">
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
                    onQuantityChange={fetchCart}
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
              userData={userData}
            />
          </div>
        </div>
      )}
    </div>
  );
}
