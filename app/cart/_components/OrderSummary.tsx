"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { submitOrder } from "@/actions/order";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/utils";

import { CouponForm } from "./CouponForm";

interface OrderSummaryProps {
  originalTotal: number;
  discountedTotal: number;
  totalDiscount: number;
}

export function OrderSummary({
  originalTotal,
  discountedTotal,
  totalDiscount,
}: OrderSummaryProps) {
  const [finalPrice, setFinalPrice] = useState(discountedTotal);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    startTransition(async () => {
      const result = await submitOrder({ couponDiscount });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      router.push("/account/payment/success");
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>주문 요약</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between">
          <span className="text-muted-foreground">상품 금액</span>
          <span>{formatPrice(originalTotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">할인 금액</span>
          <span>-{formatPrice(totalDiscount)}</span>
        </div>
        <CouponForm
          discountedTotal={discountedTotal}
          onValidCoupon={(discount) => {
            setCouponDiscount(discount);
            setFinalPrice(discountedTotal - discount);
          }}
        />
        <Separator />
        <div className="flex justify-between font-bold">
          <span>총 결제 금액</span>
          <span>{formatPrice(finalPrice)}</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          size="lg"
          onClick={handleSubmit}
          disabled={isPending}
        >
          {isPending ? "처리중..." : "주문하기"}
        </Button>
      </CardFooter>
    </Card>
  );
}
