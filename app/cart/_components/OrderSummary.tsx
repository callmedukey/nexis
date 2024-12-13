"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>주문 요약</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between">
          <span className="text-muted-foreground">상품 금액</span>
          <span>₩ {originalTotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between font-medium">
          <span>상품 할인</span>
          <span>- ₩ {totalDiscount.toLocaleString()}</span>
        </div>
        <CouponForm
          discountedTotal={discountedTotal}
          onValidCoupon={(discount) => {
            setCouponDiscount(discount);
            setFinalPrice(discountedTotal - discount);
          }}
        />
        <Separator />
        <div className="flex justify-between">
          <span>총 결제 금액</span>
          <div className="text-right">
            <div className="text-sm text-muted-foreground line-through">
              ₩ {originalTotal.toLocaleString()}
            </div>
            <div className="text-xl font-bold">
              ₩ {finalPrice.toLocaleString()}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full">주문하기</Button>
      </CardFooter>
    </Card>
  );
} 